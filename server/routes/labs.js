import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import { getOrCreateAppointmentInvoice, getAppointmentInvoiceData } from './appointments.js';

const router = Router();
router.use(authenticateToken);

router.get('/orders', (req, res) => {
  try {
    const { visit_id, status, page = 1, limit = 25 } = req.query;
    let query = `SELECT to2.*, pv.patient_id, p.name as patient_name, p.patient_unique_id
      FROM test_orders to2
      JOIN patient_visits pv ON to2.visit_id = pv.visit_id
      JOIN patients p ON pv.patient_id = p.patient_id WHERE 1=1`;
    const params = [];
    if (visit_id) { query += ' AND to2.visit_id = ?'; params.push(visit_id); }
    if (status) { query += ' AND to2.status = ?'; params.push(status); }

    const countQ = query.replace(/SELECT to2\.\*[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const { total } = db.prepare(countQ).get(...params);

    query += ' ORDER BY to2.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const orders = db.prepare(query).all(...params);
    res.json({ data: orders, total, page: Number(page), limit: Number(limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/orders/:id', (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM test_orders WHERE order_id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const items = db.prepare(`SELECT toi.*, t.test_name, t.sample_type, t.unit, t.reference_range
      FROM test_order_items toi JOIN tests t ON toi.test_id = t.test_id WHERE toi.order_id = ?`).all(req.params.id);
    res.json({ ...order, items });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/orders', (req, res) => {
  try {
    let { visit_id, items, discount, doctor_id, appointment_id, patient_id } = req.body;

    // If no visit given but we have an appointment, resolve patient and create a visit
    if (!visit_id) {
      let pid = patient_id;
      if (!pid && appointment_id) {
        const apt = db.prepare('SELECT patient_id FROM appointments WHERE appointment_id = ?').get(appointment_id);
        pid = apt?.patient_id;
      }
      if (!pid) return res.status(400).json({ error: 'visit_id or patient_id/appointment_id required' });
      const branch = db.prepare('SELECT branch_id FROM appointments WHERE appointment_id = ?').get(appointment_id);
      const visitResult = db.prepare('INSERT INTO patient_visits (patient_id, branch_id, appointment_id, visit_type, referred_by) VALUES (?, ?, ?, ?, ?)')
        .run(pid, branch?.branch_id || 1, appointment_id || null, 'Lab Test', null);
      visit_id = visitResult.lastInsertRowid;
    }

    const total = items.reduce((sum, item) => sum + (item.price - (item.discount || 0)), 0);
    const result = db.prepare('INSERT INTO test_orders (visit_id, doctor_id, appointment_id, discount, total_amount) VALUES (?, ?, ?, ?, ?)')
      .run(visit_id, doctor_id || null, appointment_id || null, discount || 0, total);
    const orderId = result.lastInsertRowid;

    const stmt = db.prepare('INSERT INTO test_order_items (order_id, test_id, price, discount) VALUES (?, ?, ?, ?)');
    items.forEach(item => stmt.run(orderId, item.test_id, item.price, item.discount || 0));

    const order = db.prepare('SELECT * FROM test_orders WHERE order_id = ?').get(orderId);
    const orderItems = db.prepare('SELECT * FROM test_order_items WHERE order_id = ?').all(orderId);
    res.json({ ...order, items: orderItems });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/samples', (req, res) => {
  try {
    const { status, order_item_id } = req.query;
    let query = `SELECT s.*, toi.test_id, t.test_name, p.name as patient_name, p.patient_unique_id, u.name as collected_by_name
      FROM samples s
      JOIN test_order_items toi ON s.order_item_id = toi.order_item_id
      JOIN tests t ON toi.test_id = t.test_id
      JOIN test_orders too ON toi.order_id = too.order_id
      JOIN patient_visits pv ON too.visit_id = pv.visit_id
      JOIN patients p ON pv.patient_id = p.patient_id
      LEFT JOIN users u ON s.collected_by = u.user_id WHERE 1=1`;
    const params = [];
    if (status) { query += ' AND s.collection_status = ?'; params.push(status); }
    if (order_item_id) { query += ' AND s.order_item_id = ?'; params.push(order_item_id); }

    query += ' ORDER BY s.created_at DESC';
    const samples = db.prepare(query).all(...params);
    res.json(samples);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Collect a new sample and generate a full bill (patient + doctor + test + fee).
// If the patient has an appointment (given or detected), the test cost is merged
// onto the appointment's unified invoice (consultation fee + lab tests). Otherwise
// it creates a standalone visit invoice. Any amount paid is applied to the invoice.
router.post('/collect', (req, res) => {
  try {
    const { patient_id, doctor_id, test_id, sample_type, consultation_fee = 0, amount_paid = 0, payment_method = 'Cash', discount = 0, appointment_id = null } = req.body;

    if (!patient_id || !test_id) {
      return res.status(400).json({ error: 'patient_id and test_id are required' });
    }

    const patient = db.prepare('SELECT * FROM patients WHERE patient_id = ?').get(patient_id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    const test = db.prepare('SELECT * FROM tests WHERE test_id = ?').get(test_id);
    if (!test) return res.status(404).json({ error: 'Test not found' });
    let doctor = null;
    if (doctor_id) {
      doctor = db.prepare('SELECT * FROM doctors WHERE doctor_id = ?').get(doctor_id);
      if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    }

    // Resolve the appointment: explicit appointment_id, or the patient's open appointment
    let apt = null;
    if (appointment_id) {
      apt = db.prepare('SELECT * FROM appointments WHERE appointment_id = ?').get(appointment_id);
      if (!apt) return res.status(404).json({ error: 'Appointment not found' });
    } else if (doctor_id) {
      apt = db.prepare("SELECT * FROM appointments WHERE patient_id = ? AND doctor_id = ? AND status IN ('Pending','Confirmed','Checked-in') ORDER BY appointment_date DESC, appointment_id DESC LIMIT 1")
        .get(patient_id, doctor_id);
    } else {
      apt = db.prepare("SELECT * FROM appointments WHERE patient_id = ? AND status IN ('Pending','Confirmed','Checked-in') ORDER BY appointment_date DESC, appointment_id DESC LIMIT 1")
        .get(patient_id);
    }

    const fee = apt ? (Number(apt.fee) || 0) : (Number(consultation_fee) || 0);
    const testPrice = Number(test.price) || 0;
    const paid = Number(amount_paid) || 0;

    // 1. Create a visit (link to appointment if we have one)
    const visitRes = db.prepare('INSERT INTO patient_visits (patient_id, branch_id, appointment_id, visit_type, referred_by) VALUES (?, ?, ?, ?, ?)')
      .run(patient_id, apt?.branch_id || req.user.branch_id || 1, apt?.appointment_id || null, apt ? 'OPD' : 'Lab Test', doctor ? doctor.name : null);
    const visitId = visitRes.lastInsertRowid;

    // 2. Create test order + item (linked to appointment if present)
    const orderRes = db.prepare('INSERT INTO test_orders (visit_id, doctor_id, appointment_id, discount, total_amount) VALUES (?, ?, ?, ?, ?)')
      .run(visitId, doctor_id || null, apt?.appointment_id || null, discount || 0, testPrice);
    const orderId = orderRes.lastInsertRowid;

    const orderItemRes = db.prepare('INSERT INTO test_order_items (order_id, test_id, price, discount) VALUES (?, ?, ?, ?)')
      .run(orderId, test_id, testPrice, 0);
    const orderItemId = orderItemRes.lastInsertRowid;

    // 3. Create sample
    const barcode = `BC-${uuidv4().slice(0, 8).toUpperCase()}`;
    const sampleRes = db.prepare("INSERT INTO samples (order_item_id, sample_barcode, sample_type, collection_date, collected_by, collection_status, status) VALUES (?, ?, ?, datetime('now'), ?, 'Collected', 'Processing')")
      .run(orderItemId, barcode, sample_type || test.sample_type, req.user.user_id);
    db.prepare("UPDATE test_order_items SET status = 'Sample Collected' WHERE order_item_id = ?").run(orderItemId);

    // 4. Build the invoice
    let invoiceId, invoiceData;
    if (apt) {
      // Merge onto the appointment's unified invoice (consultation + all linked tests)
      const inv = getOrCreateAppointmentInvoice(apt, req.user.user_id);
      invoiceId = inv.invoice_id;
      invoiceData = getAppointmentInvoiceData(inv.invoice_id);
    } else {
      // Standalone visit invoice (consultation fee + test)
      const subtotal = fee + testPrice;
      const lastInvoice = db.prepare('SELECT invoice_no FROM invoices ORDER BY invoice_id DESC LIMIT 1').get();
      let nextNum = 1;
      if (lastInvoice) {
        const m = lastInvoice.invoice_no && lastInvoice.invoice_no.match(/INV-(\d+)/);
        if (m) nextNum = parseInt(m[1]) + 1;
      }
      const invoice_no = `INV-${String(nextNum).padStart(6, '0')}`;
      const totalAmount = Math.round((subtotal - (discount || 0)) * 100) / 100;
      const due = Math.max(0, Math.round((totalAmount - paid) * 100) / 100);
      const status = due <= 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid';

      const invRes = db.prepare('INSERT INTO invoices (visit_id, invoice_no, subtotal, discount, total_amount, paid_amount, due_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(visitId, invoice_no, subtotal, discount || 0, totalAmount, paid, due, status);
      invoiceId = invRes.lastInsertRowid;

      const itemStmt = db.prepare('INSERT INTO invoice_items (invoice_id, item_type, item_id, item_name, quantity, unit_price, discount, amount) VALUES (?, ?, ?, ?, 1, ?, 0, ?)');
      if (fee > 0) {
        itemStmt.run(invoiceId, 'Consultation', doctor_id || null, doctor ? `Consultation - ${doctor.name}` : 'Consultation', fee, fee);
      }
      itemStmt.run(invoiceId, 'Test', test_id, test.test_name, testPrice, testPrice);

      const invoice = db.prepare(`SELECT i.*, p.name as patient_name, p.patient_unique_id FROM invoices i JOIN patient_visits pv ON i.visit_id = pv.visit_id JOIN patients p ON pv.patient_id = p.patient_id WHERE i.invoice_id = ?`).get(invoiceId);
      const invoiceItems = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(invoiceId);
      invoiceData = { ...invoice, items: invoiceItems };
    }

    // 5. Record payment if any
    if (paid > 0) {
      const cur = db.prepare('SELECT * FROM invoices WHERE invoice_id = ?').get(invoiceId);
      const newPaid = (Number(cur.paid_amount) || 0) + paid;
      const newDue = Math.max(0, Math.round(((Number(cur.total_amount) || 0) - newPaid) * 100) / 100);
      const newStatus = newDue <= 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';
      db.prepare('UPDATE invoices SET paid_amount=?, due_amount=?, status=? WHERE invoice_id=?')
        .run(newPaid, newDue, newStatus, invoiceId);
      db.prepare('INSERT INTO payments (invoice_id, amount, payment_method, received_by, notes) VALUES (?, ?, ?, ?, ?)')
        .run(invoiceId, paid, payment_method, req.user.user_id, 'Sample collection');
      invoiceData = apt
        ? getAppointmentInvoiceData(invoiceId)
        : { ...invoiceData, paid_amount: newPaid, due_amount: newDue, status: newStatus };
    }

    const sample = db.prepare('SELECT * FROM samples WHERE sample_id = ?').get(sampleRes.lastInsertRowid);

    res.json({ sample, invoice: invoiceData, visit_id: visitId, order_id: orderId, appointment_id: apt?.appointment_id || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/samples', (req, res) => {
  try {
    const { order_item_id, sample_type, collected_by } = req.body;
    const barcode = `BC-${uuidv4().slice(0, 8).toUpperCase()}`;
    const result = db.prepare("INSERT INTO samples (order_item_id, sample_barcode, sample_type, collection_date, collected_by, collection_status, status) VALUES (?, ?, ?, datetime('now'), ?, 'Collected', 'Processing')")
      .run(order_item_id, barcode, sample_type, collected_by);

    db.prepare("UPDATE test_order_items SET status = 'Sample Collected' WHERE order_item_id = ?").run(order_item_id);

    const sample = db.prepare('SELECT * FROM samples WHERE sample_id = ?').get(result.lastInsertRowid);
    res.json(sample);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/samples/barcode/:barcode', (req, res) => {
  try {
    const sample = db.prepare(`SELECT s.*, t.test_name, p.name as patient_name, p.patient_unique_id, p.mobile as patient_mobile
      FROM samples s
      JOIN test_order_items toi ON s.order_item_id = toi.order_item_id
      JOIN tests t ON toi.test_id = t.test_id
      JOIN test_orders too ON toi.order_id = too.order_id
      JOIN patient_visits pv ON too.visit_id = pv.visit_id
      JOIN patients p ON pv.patient_id = p.patient_id
      WHERE s.sample_barcode = ?`).get(req.params.barcode);
    if (!sample) return res.status(404).json({ error: 'Sample not found' });
    res.json(sample);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/results', (req, res) => {
  try {
    const { sample_id, result_value, unit, reference_range, is_abnormal, remarks, entered_by } = req.body;
    const result = db.prepare('INSERT INTO lab_results (sample_id, result_value, unit, reference_range, is_abnormal, remarks, entered_by) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(sample_id, result_value, unit, reference_range, is_abnormal ? 1 : 0, remarks, entered_by);
    db.prepare("UPDATE samples SET status = 'Completed' WHERE sample_id = ?").run(sample_id);
    res.json({ result_id: result.lastInsertRowid, message: 'Result entered' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/results/sample/:sampleId', (req, res) => {
  try {
    const results = db.prepare('SELECT * FROM lab_results WHERE sample_id = ?').all(req.params.sampleId);
    res.json(results);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/reports', (req, res) => {
  try {
    const { status, page = 1, limit = 25 } = req.query;
    let query = `SELECT r.*, u.name as approved_by, too.visit_id, p.name as patient_name, p.patient_unique_id
      FROM reports r
      JOIN test_orders too ON r.order_id = too.order_id
      JOIN patient_visits pv ON too.visit_id = pv.visit_id
      JOIN patients p ON pv.patient_id = p.patient_id
      LEFT JOIN users u ON r.approved_by = u.user_id WHERE 1=1`;
    const params = [];
    if (status) { query += ' AND r.status = ?'; params.push(status); }

    const countQ = query.replace(/SELECT r\.\*[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const { total } = db.prepare(countQ).get(...params);

    query += ' ORDER BY r.report_date DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const reports = db.prepare(query).all(...params);
    res.json({ data: reports, total, page: Number(page), limit: Number(limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/reports', (req, res) => {
  try {
    const { order_id, approved_by } = req.body;
    const barcode = `RPT-${uuidv4().slice(0, 8).toUpperCase()}`;
    const result = db.prepare("INSERT INTO reports (order_id, barcode, status, approved_by, approved_at) VALUES (?, ?, 'Draft', ?, datetime('now'))")
      .run(order_id, barcode, approved_by);
    res.json({ report_id: result.lastInsertRowid, barcode });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/reports/:id/approve', (req, res) => {
  try {
    const { approved_by, status } = req.body;
    db.prepare('UPDATE reports SET status=?, approved_by=?, approved_at=datetime(\'now\') WHERE report_id=?')
      .run(status || 'Approved', approved_by, req.params.id);
    const report = db.prepare('SELECT * FROM reports WHERE report_id = ?').get(req.params.id);
    res.json(report);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/reports/:id', (req, res) => {
  try {
    const report = db.prepare(`SELECT r.*, u.name as approved_by, p.name as patient_name, p.patient_unique_id, p.gender, p.date_of_birth, p.mobile as patient_mobile,
      d.name as doctor_name, too.visit_id
      FROM reports r
      JOIN test_orders too ON r.order_id = too.order_id
      JOIN patient_visits pv ON too.visit_id = pv.visit_id
      JOIN patients p ON pv.patient_id = p.patient_id
      LEFT JOIN users u ON r.approved_by = u.user_id
      LEFT JOIN doctor_consultations dc ON pv.visit_id = dc.visit_id
      LEFT JOIN doctors d ON dc.doctor_id = d.doctor_id
      WHERE r.report_id = ?`).get(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const samples = db.prepare(`SELECT s.*, t.test_name, t.unit, t.reference_range, lr.result_value, lr.is_abnormal, lr.remarks
      FROM samples s
      JOIN test_order_items toi ON s.order_item_id = toi.order_item_id
      JOIN tests t ON toi.test_id = t.test_id
      LEFT JOIN lab_results lr ON s.sample_id = lr.sample_id
      WHERE toi.order_id = ?`).all(report.order_id);

    res.json({ ...report, results: samples });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
