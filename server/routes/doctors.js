import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    const { search, branch_id, status, page = 1, limit = 25 } = req.query;
    let query = 'SELECT * FROM doctors WHERE 1=1';
    const params = [];

    if (search) { query += ' AND (name LIKE ? OR specialization LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (branch_id) { query += ' AND branch_id = ?'; params.push(branch_id); }
    if (status) { query += ' AND status = ?'; params.push(status); }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const { total } = db.prepare(countQuery).get(...params);

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const doctors = db.prepare(query).all(...params);
    res.json({ data: doctors, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const doctor = db.prepare('SELECT * FROM doctors WHERE doctor_id = ?').get(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    const schedule = db.prepare('SELECT * FROM doctor_schedule WHERE doctor_id = ?').all(req.params.id);
    res.json({ ...doctor, schedule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { branch_id, name, specialization, degree, bmdc_no, phone, email, consultation_fee, status } = req.body;
    const result = db.prepare('INSERT INTO doctors (branch_id, name, specialization, degree, bmdc_no, phone, email, consultation_fee, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(branch_id, name, specialization, degree, bmdc_no, phone, email, consultation_fee || 0, status || 'active');
    const doctor = db.prepare('SELECT * FROM doctors WHERE doctor_id = ?').get(result.lastInsertRowid);
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { branch_id, name, specialization, degree, bmdc_no, phone, email, consultation_fee, status } = req.body;
    db.prepare('UPDATE doctors SET branch_id=?, name=?, specialization=?, degree=?, bmdc_no=?, phone=?, email=?, consultation_fee=?, status=? WHERE doctor_id=?')
      .run(branch_id, name, specialization, degree, bmdc_no, phone, email, consultation_fee, status, req.params.id);
    const doctor = db.prepare('SELECT * FROM doctors WHERE doctor_id = ?').get(req.params.id);
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM doctors WHERE doctor_id = ?').run(req.params.id);
    res.json({ message: 'Doctor deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/schedule', (req, res) => {
  try {
    const schedule = db.prepare('SELECT * FROM doctor_schedule WHERE doctor_id = ?').all(req.params.id);
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/schedule', (req, res) => {
  try {
    const { day_of_week, start_time, end_time, is_break } = req.body;
    const result = db.prepare('INSERT INTO doctor_schedule (doctor_id, day_of_week, start_time, end_time, is_break) VALUES (?, ?, ?, ?, ?)')
      .run(req.params.id, day_of_week, start_time, end_time, is_break || 0);
    res.json({ schedule_id: result.lastInsertRowid, message: 'Schedule added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/schedule/:scheduleId', (req, res) => {
  try {
    db.prepare('DELETE FROM doctor_schedule WHERE schedule_id = ?').run(req.params.scheduleId);
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
