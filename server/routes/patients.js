import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    const { search, status, page = 1, limit = 25 } = req.query;
    let query = 'SELECT * FROM patients WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR mobile LIKE ? OR patient_unique_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) { query += ' AND status = ?'; params.push(status); }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const { total } = db.prepare(countQuery).get(...params);

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const patients = db.prepare(query).all(...params);
    res.json({ data: patients, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const patient = db.prepare('SELECT * FROM patients WHERE patient_id = ?').get(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const visits = db.prepare('SELECT * FROM patient_visits WHERE patient_id = ? ORDER BY visit_date DESC').all(req.params.id);
    const history = db.prepare('SELECT * FROM patient_history WHERE patient_id = ? ORDER BY created_at DESC').all(req.params.id);

    res.json({ ...patient, visits, medical_history: history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, father_name, mother_name, date_of_birth, gender, blood_group, mobile, email, address, emergency_contact, occupation, nid_no, notes } = req.body;
    const lastPatient = db.prepare('SELECT patient_unique_id FROM patients ORDER BY patient_id DESC LIMIT 1').get();
    let nextNum = 1;
    if (lastPatient) {
      const match = lastPatient.patient_unique_id.match(/PAT-(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    const patient_unique_id = `PAT-${String(nextNum).padStart(5, '0')}`;

    const result = db.prepare(`INSERT INTO patients (patient_unique_id, name, father_name, mother_name, date_of_birth, gender, blood_group, mobile, email, address, emergency_contact, occupation, nid_no, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(patient_unique_id, name, father_name, mother_name, date_of_birth, gender, blood_group, mobile, email, address, emergency_contact, occupation, nid_no, notes);

    const patient = db.prepare('SELECT * FROM patients WHERE patient_id = ?').get(result.lastInsertRowid);
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { name, father_name, mother_name, date_of_birth, gender, blood_group, mobile, email, address, emergency_contact, occupation, nid_no, notes } = req.body;
    db.prepare(`UPDATE patients SET name=?, father_name=?, mother_name=?, date_of_birth=?, gender=?, blood_group=?, mobile=?, email=?, address=?, emergency_contact=?, occupation=?, nid_no=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE patient_id=?`)
      .run(name, father_name, mother_name, date_of_birth, gender, blood_group, mobile, email, address, emergency_contact, occupation, nid_no, notes, req.params.id);

    const patient = db.prepare('SELECT * FROM patients WHERE patient_id = ?').get(req.params.id);
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM patients WHERE patient_id = ?').run(req.params.id);
    res.json({ message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/visits', (req, res) => {
  try {
    const visits = db.prepare(`
      SELECT pv.*, b.branch_name FROM patient_visits pv
      LEFT JOIN branches b ON pv.branch_id = b.branch_id
      WHERE pv.patient_id = ? ORDER BY pv.visit_date DESC
    `).all(req.params.id);
    res.json(visits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/history', (req, res) => {
  try {
    const history = db.prepare('SELECT * FROM patient_history WHERE patient_id = ? ORDER BY created_at DESC').all(req.params.id);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/history', (req, res) => {
  try {
    const { history_type, description } = req.body;
    const result = db.prepare('INSERT INTO patient_history (patient_id, history_type, description) VALUES (?, ?, ?)')
      .run(req.params.id, history_type, description);
    res.json({ history_id: result.lastInsertRowid, message: 'History added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
