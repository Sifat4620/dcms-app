import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/invoices', (req, res) => {
  try {
    const { status, patient_id, page = 1, limit = 25 } = req.query;
    let query = `SELECT i.*, p.name as patient_name, p.patient_unique_id, p.mobile as patient_mobile,
      COALESCE(it.consultation_amt, 0) as doctor_fee, COALESCE(it.test_amt, 0) as lab_fee
      FROM invoices i
      JOIN patient_visits pv ON i.visit_id = pv.visit_id
      JOIN patients p ON pv.patient_id = p.patient_id
      LEFT JOIN (
        SELECT invoice_id,
          SUM(CASE WHEN item_type='Consultation' THEN amount ELSE 0 END) as consultation_amt,
          SUM(CASE WHEN item_type='Test' THEN amount ELSE 0 END) as test_amt
        FROM invoice_items GROUP BY invoice_id
      ) it ON it.invoice_id = i.invoice_id
      WHERE 1=1`;
    const params = [];
    if (status) { query += ' AND i.status = ?'; params.push(status); }
    if (patient_id) { query += ' AND pv.patient_id = ?'; params.push(patient_id); }

    const countQ = query.replace(/SELECT i\.\*[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const { total } = db.prepare(countQ).get(...params);

    query += ' ORDER BY i.invoice_date DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const invoices = db.prepare(query).all(...params);
    res.json({ data: invoices, total, page: Number(page), limit: Number(limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/invoices/:id', (req, res) => {
  try {
    const invoice = db.prepare(`SELECT i.*, p.name as patient_name, p.patient_unique_id, p.mobile as patient_mobile, p.gender, p.date_of_birth
      FROM invoices i
      JOIN patient_visits pv ON i.visit_id = pv.visit_id
      JOIN patients p ON pv.patient_id = p.patient_id
      WHERE i.invoice_id = ?`).get(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(req.params.id);
    const payments = db.prepare('SELECT * FROM payments WHERE invoice_id = ? ORDER BY payment_date DESC').all(req.params.id);

    const visit = db.prepare('SELECT branch_id FROM patient_visits WHERE visit_id = ?').get(invoice.visit_id);
    let branch = db.prepare('SELECT * FROM branches WHERE branch_id = ?').get(visit.branch_id);
    if (!branch) branch = db.prepare('SELECT * FROM branches ORDER BY branch_id LIMIT 1').get() || {};

    res.json({ ...invoice, items, payments, branch });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/invoices', (req, res) => {
  try {
    const { visit_id, items, discount = 0, vat_rate = 0, paid_amount = 0 } = req.body;

    const lastInvoice = db.prepare("SELECT invoice_no FROM invoices ORDER BY invoice_id DESC LIMIT 1").get();
    let nextNum = 1;
    if (lastInvoice) {
      const match = lastInvoice.invoice_no.match(/INV-(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    const invoice_no = `INV-${String(nextNum).padStart(6, '0')}`;

    const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity) - (item.discount || 0), 0);
    const vat_amount = subtotal * (vat_rate / 100);
    const total_amount = subtotal + vat_amount - discount;
    const due_amount = total_amount - paid_amount;
    const status = due_amount <= 0 ? 'Paid' : paid_amount > 0 ? 'Partial' : 'Unpaid';

    const result = db.prepare('INSERT INTO invoices (visit_id, invoice_no, subtotal, discount, vat_amount, total_amount, paid_amount, due_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(visit_id, invoice_no, subtotal, discount, vat_amount, total_amount, paid_amount, due_amount, status);
    const invoiceId = result.lastInsertRowid;

    const stmt = db.prepare('INSERT INTO invoice_items (invoice_id, item_type, item_id, item_name, quantity, unit_price, discount, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    items.forEach(item => {
      const amount = (item.unit_price * item.quantity) - (item.discount || 0);
      stmt.run(invoiceId, item.item_type, item.item_id, item.item_name, item.quantity || 1, item.unit_price, item.discount || 0, amount);
    });

    if (paid_amount > 0) {
      db.prepare('INSERT INTO payments (invoice_id, amount, payment_method, received_by) VALUES (?, ?, ?, ?)')
        .run(invoiceId, paid_amount, req.body.payment_method || 'Cash', req.user.user_id);
    }

    const invoice = db.prepare('SELECT * FROM invoices WHERE invoice_id = ?').get(invoiceId);
    const invoiceItems = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(invoiceId);
    res.json({ ...invoice, items: invoiceItems });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/invoices/:id/discount', (req, res) => {
  try {
    const { discount } = req.body;
    const invoice = db.prepare('SELECT * FROM invoices WHERE invoice_id = ?').get(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    if (discount == null || Number(discount) < 0) return res.status(400).json({ error: 'Enter a valid discount amount' });

    const disc = Number(discount);
    const newTotal = Math.max(0, invoice.subtotal - disc);
    const newDue = Math.max(0, newTotal - invoice.paid_amount);
    const newStatus = newDue <= 0 ? 'Paid' : invoice.paid_amount > 0 ? 'Partial' : 'Unpaid';

    db.prepare('UPDATE invoices SET discount=?, total_amount=?, due_amount=?, status=? WHERE invoice_id=?')
      .run(disc, newTotal, newDue, newStatus, req.params.id);

    const updated = db.prepare('SELECT * FROM invoices WHERE invoice_id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/invoices/:id/payments', (req, res) => {
  try {
    const { amount, payment_method, transaction_no, notes } = req.body;
    const invoice = db.prepare('SELECT * FROM invoices WHERE invoice_id = ?').get(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const method = payment_method || 'Cash';
    if (amount == null || Number(amount) <= 0) return res.status(400).json({ error: 'Enter a valid amount' });
    if (Number(amount) > Number(invoice.due_amount) + 0.001) return res.status(400).json({ error: 'Amount exceeds due' });
    if (method !== 'Cash' && !transaction_no) return res.status(400).json({ error: 'Transaction number is required for non-cash payments' });

    db.prepare('INSERT INTO payments (invoice_id, amount, payment_method, transaction_no, received_by, notes) VALUES (?, ?, ?, ?, ?, ?)')
      .run(req.params.id, amount, method, transaction_no, req.user.user_id, notes);

    const newPaid = invoice.paid_amount + amount;
    const newDue = invoice.total_amount - newPaid;
    const newStatus = newDue <= 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';

    db.prepare('UPDATE invoices SET paid_amount=?, due_amount=?, status=? WHERE invoice_id=?')
      .run(newPaid, Math.max(0, newDue), newStatus, req.params.id);

    if (invoice.appointment_id) {
      const apt = db.prepare('SELECT * FROM appointments WHERE appointment_id = ?').get(invoice.appointment_id);
      if (apt) {
        const aptPaid = apt.paid_amount + amount;
        const aptDue = apt.fee - aptPaid;
        db.prepare('UPDATE appointments SET paid_amount=?, due_amount=? WHERE appointment_id=?')
          .run(aptPaid, Math.max(0, aptDue), invoice.appointment_id);
      }
    }

    const updated = db.prepare('SELECT * FROM invoices WHERE invoice_id = ?').get(req.params.id);
    const payments = db.prepare('SELECT * FROM payments WHERE invoice_id = ?').all(req.params.id);
    res.json({ ...updated, payments });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/payments/report', (req, res) => {
  try {
    const { method, from, to } = req.query;
    let query = `SELECT p.*, i.invoice_no, i.discount as discount, p2.name as patient_name, u.name as received_by_name,
      COALESCE(it.consultation_amt, 0) as doctor_fee, COALESCE(it.test_amt, 0) as lab_fee
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.invoice_id
      LEFT JOIN patient_visits pv ON i.visit_id = pv.visit_id
      LEFT JOIN patients p2 ON pv.patient_id = p2.patient_id
      LEFT JOIN users u ON p.received_by = u.user_id
      LEFT JOIN (
        SELECT invoice_id,
          SUM(CASE WHEN item_type='Consultation' THEN amount ELSE 0 END) as consultation_amt,
          SUM(CASE WHEN item_type='Test' THEN amount ELSE 0 END) as test_amt
        FROM invoice_items GROUP BY invoice_id
      ) it ON it.invoice_id = i.invoice_id
      WHERE 1=1`;
    const params = [];
    if (method && method !== 'All') { query += ' AND p.payment_method = ?'; params.push(method); }
    if (from) { query += ' AND date(p.payment_date) >= date(?)'; params.push(from); }
    if (to) { query += ' AND date(p.payment_date) <= date(?)'; params.push(to); }
    query += ' ORDER BY p.payment_date DESC';
    const payments = db.prepare(query).all(...params);
    res.json(payments);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/payments', (req, res) => {
  try {
    const { invoice_id, page = 1, limit = 50 } = req.query;
    let query = 'SELECT p.*, u.name as received_by_name FROM payments p LEFT JOIN users u ON p.received_by = u.user_id WHERE 1=1';
    const params = [];
    if (invoice_id) { query += ' AND p.invoice_id = ?'; params.push(invoice_id); }
    query += ' ORDER BY p.payment_date DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));
    const payments = db.prepare(query).all(...params);
    res.json(payments);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/due', (req, res) => {
  try {
    const dueInvoices = db.prepare(`SELECT i.*, p.name as patient_name, p.mobile as patient_mobile
      FROM invoices i
      JOIN patient_visits pv ON i.visit_id = pv.visit_id
      JOIN patients p ON pv.patient_id = p.patient_id
      WHERE i.due_amount > 0 AND i.status != 'Cancelled'
      ORDER BY i.invoice_date DESC`).all();
    res.json(dueInvoices);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
