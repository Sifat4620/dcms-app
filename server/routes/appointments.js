import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    const { doctor_id, patient_id, status, date, page = 1, limit = 25 } = req.query;
    let query = `SELECT a.*, p.name as patient_name, p.mobile as patient_mobile, d.name as doctor_name, d.specialization
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN doctors d ON a.doctor_id = d.doctor_id WHERE 1=1`;
    const params = [];

    if (doctor_id) { query += ' AND a.doctor_id = ?'; params.push(doctor_id); }
    if (patient_id) { query += ' AND a.patient_id = ?'; params.push(patient_id); }
    if (status) { query += ' AND a.status = ?'; params.push(status); }
    if (date) { query += ' AND a.appointment_date = ?'; params.push(date); }

    const countQuery = query.replace(/SELECT a\.\*[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const { total } = db.prepare(countQuery).get(...params);

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const appointments = db.prepare(query).all(...params);
    res.json({ data: appointments, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const apt = db.prepare(`
      SELECT a.*, p.name as patient_name, p.mobile as patient_mobile, d.name as doctor_name, d.specialization
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN doctors d ON a.doctor_id = d.doctor_id
      WHERE a.appointment_id = ?
    `).get(req.params.id);
    if (!apt) return res.status(404).json({ error: 'Appointment not found' });
    res.json(apt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { branch_id, patient_id, doctor_id, appointment_date, appointment_time, status } = req.body;

    const doctor = db.prepare('SELECT consultation_fee FROM doctors WHERE doctor_id = ?').get(doctor_id);
    const fee = Number(req.body.fee != null ? req.body.fee : (doctor?.consultation_fee || 0));
    const paid = Number(req.body.paid_amount || 0);
    const due = fee - paid;

    const lastToken = db.prepare('SELECT MAX(token_no) as max_token FROM appointments WHERE appointment_date = ? AND doctor_id = ?').get(appointment_date, doctor_id);
    const token_no = (lastToken?.max_token || 0) + 1;

    const result = db.prepare('INSERT INTO appointments (branch_id, patient_id, doctor_id, appointment_date, appointment_time, token_no, fee, paid_amount, due_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(branch_id, patient_id, doctor_id, appointment_date, appointment_time, token_no, fee, paid, due, status || 'Pending');

    const apt = db.prepare('SELECT * FROM appointments WHERE appointment_id = ?').get(result.lastInsertRowid);
    res.json(apt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { status, appointment_date, appointment_time } = req.body;
    const BILLABLE = ['Confirmed', 'Checked-in', 'Completed'];
    let generatedInvoice = null;
    if (status) {
      db.prepare('UPDATE appointments SET status=?, updated_at=CURRENT_TIMESTAMP WHERE appointment_id=?').run(status, req.params.id);
      if (BILLABLE.includes(status) && status !== 'Pending') {
        const apt = db.prepare('SELECT * FROM appointments WHERE appointment_id = ?').get(req.params.id);
        if (apt && (Number(apt.fee) || 0) > 0) {
          const inv = getOrCreateAppointmentInvoice(apt, req.user.user_id);
          generatedInvoice = getAppointmentInvoiceData(inv.invoice_id);
        }
      }
    }
    if (appointment_date) {
      db.prepare('UPDATE appointments SET appointment_date=?, appointment_time=?, updated_at=CURRENT_TIMESTAMP WHERE appointment_id=?').run(appointment_date, appointment_time, req.params.id);
    }
    const apt = db.prepare('SELECT * FROM appointments WHERE appointment_id = ?').get(req.params.id);
    res.json({ ...apt, invoice: generatedInvoice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/payment', (req, res) => {
  try {
    const { amount, payment_method, notes } = req.body;
    const apt = db.prepare('SELECT * FROM appointments WHERE appointment_id = ?').get(req.params.id);
    if (!apt) return res.status(404).json({ error: 'Appointment not found' });

    const payAmount = Number(amount) || 0;
    if (payAmount <= 0) return res.status(400).json({ error: 'Enter a valid amount' });
    const aptDue = Number(apt.due_amount) || 0;
    if (payAmount > aptDue) return res.status(400).json({ error: 'Amount exceeds due' });

    // Sync appointment paid/due
    const newPaid = (Number(apt.paid_amount) || 0) + payAmount;
    const newDue = Math.max(0, (Number(apt.fee) || 0) - newPaid);
    db.prepare('UPDATE appointments SET paid_amount=?, due_amount=? WHERE appointment_id=?')
      .run(newPaid, newDue, req.params.id);

    // Record on the appointment_payments table (history)
    const apResult = db.prepare('INSERT INTO appointment_payments (appointment_id, amount, payment_method, received_by, notes) VALUES (?, ?, ?, ?, ?)')
      .run(req.params.id, payAmount, payment_method || 'Cash', req.user.user_id, notes);

    // Get-or-create the unified appointment invoice and record an invoice payment
    const inv = getOrCreateAppointmentInvoice(apt, req.user.user_id);
    db.prepare('INSERT INTO payments (invoice_id, amount, payment_method, received_by, notes) VALUES (?, ?, ?, ?, ?)')
      .run(inv.invoice_id, payAmount, payment_method || 'Cash', req.user.user_id, notes);
    const ipaid = (Number(inv.paid_amount) || 0) + payAmount;
    const idue = Math.max(0, (Number(inv.total_amount) || 0) - ipaid);
    const istatus = idue <= 0 ? 'Paid' : ipaid > 0 ? 'Partial' : 'Unpaid';
    db.prepare('UPDATE invoices SET paid_amount=?, due_amount=?, status=? WHERE invoice_id=?')
      .run(ipaid, idue, istatus, inv.invoice_id);

    const payment = db.prepare('SELECT * FROM appointment_payments WHERE payment_id = ?').get(apResult.lastInsertRowid);
    const invoice = getAppointmentInvoiceData(inv.invoice_id);
    res.json({ payment, appointment: db.prepare('SELECT * FROM appointments WHERE appointment_id = ?').get(req.params.id), invoice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get-or-create the unified appointment invoice (consultation fee + linked lab tests)
export function getOrCreateAppointmentInvoice(apt, receivedBy) {
  // Find or create a visit for the appointment
  let visit = db.prepare('SELECT * FROM patient_visits WHERE appointment_id = ? ORDER BY visit_id LIMIT 1').get(apt.appointment_id);
  if (!visit) {
    const vr = db.prepare('INSERT INTO patient_visits (patient_id, branch_id, appointment_id, visit_type) VALUES (?, ?, ?, ?)')
      .run(apt.patient_id, apt.branch_id || 1, apt.appointment_id, 'OPD');
    visit = db.prepare('SELECT * FROM patient_visits WHERE visit_id = ?').get(vr.lastInsertRowid);
  }

  // Find existing invoice linked to appointment
  let invoice = db.prepare('SELECT * FROM invoices WHERE appointment_id = ? ORDER BY invoice_id LIMIT 1').get(apt.appointment_id);
  if (!invoice) {
    const lastInvoice = db.prepare("SELECT invoice_no FROM invoices ORDER BY invoice_id DESC LIMIT 1").get();
    let nextNum = 1;
    if (lastInvoice) {
      const match = lastInvoice.invoice_no && lastInvoice.invoice_no.match(/INV-(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    const invoice_no = `INV-${String(nextNum).padStart(6, '0')}`;
    const ir = db.prepare('INSERT INTO invoices (visit_id, appointment_id, invoice_no, discount, status) VALUES (?, ?, ?, 0, ?)')
      .run(visit.visit_id, apt.appointment_id, invoice_no, apt.due_amount > 0 ? 'Unpaid' : 'Unpaid');
    invoice = db.prepare('SELECT * FROM invoices WHERE invoice_id = ?').get(ir.lastInsertRowid);
  }

  rebuildAppointmentInvoice(invoice.invoice_id, apt);
  return db.prepare('SELECT * FROM invoices WHERE invoice_id = ?').get(invoice.invoice_id);
}

// Rebuild the unified invoice items from consultation fee + linked lab tests
export function rebuildAppointmentInvoice(invoiceId, apt) {
  db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(invoiceId);

  // Consultation (doctor visit) charge
  const consultFee = Number(apt.fee) || 0;
  if (consultFee > 0) {
    const doctor = db.prepare('SELECT name FROM doctors WHERE doctor_id = ?').get(apt.doctor_id);
    db.prepare("INSERT INTO invoice_items (invoice_id, item_type, item_name, quantity, unit_price, discount, amount) VALUES (?, 'Consultation', ?, 1, ?, 0, ?)")
      .run(invoiceId, `Consultation - ${doctor?.name || 'Doctor'}`, consultFee, consultFee);
  }

  // Linked lab test charges
  const orders = db.prepare('SELECT * FROM test_orders WHERE appointment_id = ?').all(apt.appointment_id);
  for (const order of orders) {
    const items = db.prepare(`SELECT toi.*, t.test_name FROM test_order_items toi JOIN tests t ON toi.test_id = t.test_id WHERE toi.order_id = ?`).all(order.order_id);
    for (const it of items) {
      if ((Number(it.price) || 0) > 0) {
        db.prepare("INSERT INTO invoice_items (invoice_id, item_type, item_id, item_name, quantity, unit_price, discount, amount) VALUES (?, 'Test', ?, ?, 1, ?, 0, ?)")
          .run(invoiceId, it.test_id, it.test_name || 'Lab Test', it.price, it.price - (it.discount || 0));
      }
    }
  }

  // Recompute totals (preserve existing paid amount; paid never changes on rebuild)
  const inv = db.prepare('SELECT * FROM invoices WHERE invoice_id = ?').get(invoiceId);
  const subtotal = db.prepare('SELECT COALESCE(SUM(amount),0) as s FROM invoice_items WHERE invoice_id = ?').get(invoiceId).s;
  const total = Math.round(subtotal * 100) / 100;
  const paid = Number(inv.paid_amount) || 0;
  const due = Math.max(0, Math.round((total - paid) * 100) / 100);
  const status = due <= 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid';
  db.prepare('UPDATE invoices SET subtotal=?, total_amount=?, due_amount=?, status=? WHERE invoice_id=?')
    .run(subtotal, total, due, status, invoiceId);
}

// Fetch a full invoice with items/payments/branch
export function getAppointmentInvoiceData(invoiceId) {
  const invoice = db.prepare("SELECT i.*, p.name as patient_name, p.patient_unique_id, p.mobile as patient_mobile FROM invoices i JOIN patient_visits pv ON i.visit_id = pv.visit_id JOIN patients p ON pv.patient_id = p.patient_id WHERE i.invoice_id = ?").get(invoiceId);
  const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(invoiceId);
  const payments = db.prepare('SELECT * FROM payments WHERE invoice_id = ? ORDER BY payment_date DESC').all(invoiceId);
  const visit = db.prepare('SELECT branch_id FROM patient_visits WHERE visit_id = ?').get(invoice.visit_id);
  let branch = db.prepare('SELECT * FROM branches WHERE branch_id = ?').get(visit.branch_id);
  if (!branch) branch = db.prepare('SELECT * FROM branches ORDER BY branch_id LIMIT 1').get() || {};
  const apt = db.prepare('SELECT * FROM appointments WHERE appointment_id = ?').get(invoice.appointment_id || 0);
  return { ...invoice, items, payments, branch, appointment: apt || null };
}

export function getAppointmentInvoice(apt, receivedBy) {
  const inv = getOrCreateAppointmentInvoice(apt, receivedBy);
  return { invoice: inv, data: getAppointmentInvoiceData(inv.invoice_id) };
}

router.get('/:id/payments', (req, res) => {
  try {
    const payments = db.prepare('SELECT ap.*, u.name as received_by_name FROM appointment_payments ap LEFT JOIN users u ON ap.received_by = u.user_id WHERE ap.appointment_id = ? ORDER BY ap.payment_date DESC').all(req.params.id);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/invoice', (req, res) => {
  try {
    const apt = db.prepare('SELECT * FROM appointments WHERE appointment_id = ?').get(req.params.id);
    if (!apt) return res.status(404).json({ error: 'Appointment not found' });
    const inv = getOrCreateAppointmentInvoice(apt, req.user.user_id);
    res.json(getAppointmentInvoiceData(inv.invoice_id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM appointments WHERE appointment_id = ?').run(req.params.id);
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/today/stats', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const total = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ?').get(today);
    const pending = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ? AND status = 'Pending'").get(today);
    const completed = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ? AND status = 'Completed'").get(today);
    res.json({ total: total.count, pending: pending.count, completed: completed.count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
