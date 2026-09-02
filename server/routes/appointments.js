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
    if (status) {
      db.prepare('UPDATE appointments SET status=?, updated_at=CURRENT_TIMESTAMP WHERE appointment_id=?').run(status, req.params.id);
    }
    if (appointment_date) {
      db.prepare('UPDATE appointments SET appointment_date=?, appointment_time=?, updated_at=CURRENT_TIMESTAMP WHERE appointment_id=?').run(appointment_date, appointment_time, req.params.id);
    }
    const apt = db.prepare('SELECT * FROM appointments WHERE appointment_id = ?').get(req.params.id);
    res.json(apt);
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
    const newPaid = (Number(apt.paid_amount) || 0) + payAmount;
    const newDue = Math.max(0, (Number(apt.fee) || 0) - newPaid);

    const result = db.prepare('INSERT INTO appointment_payments (appointment_id, amount, payment_method, received_by, notes) VALUES (?, ?, ?, ?, ?)')
      .run(req.params.id, payAmount, payment_method || 'Cash', req.user.user_id, notes);

    db.prepare('UPDATE appointments SET paid_amount=?, due_amount=? WHERE appointment_id=?')
      .run(newPaid, newDue, req.params.id);

    const updated = db.prepare('SELECT * FROM appointments WHERE appointment_id = ?').get(req.params.id);
    const payment = db.prepare('SELECT * FROM appointment_payments WHERE payment_id = ?').get(result.lastInsertRowid);
    res.json({ payment, appointment: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/payments', (req, res) => {
  try {
    const payments = db.prepare('SELECT ap.*, u.name as received_by_name FROM appointment_payments ap LEFT JOIN users u ON ap.received_by = u.user_id WHERE ap.appointment_id = ? ORDER BY ap.payment_date DESC').all(req.params.id);
    res.json(payments);
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
