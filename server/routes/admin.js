import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/users', (req, res) => {
  try {
    const users = db.prepare(`SELECT u.user_id, u.name, u.email, u.phone, u.status, u.branch_id, r.role_name, b.branch_name
      FROM users u JOIN roles r ON u.role_id = r.role_id LEFT JOIN branches b ON u.branch_id = b.branch_id ORDER BY u.name`).all();
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/roles', (req, res) => {
  try {
    const roles = db.prepare('SELECT * FROM roles').all();
    res.json(roles);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/branches', (req, res) => {
  try {
    const branches = db.prepare('SELECT * FROM branches ORDER BY branch_name').all();
    res.json(branches);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/branches', (req, res) => {
  try {
    const { branch_name, code, address, phone, email } = req.body;
    const result = db.prepare('INSERT INTO branches (branch_name, code, address, phone, email) VALUES (?, ?, ?, ?, ?)')
      .run(branch_name, code, address, phone, email);
    const branch = db.prepare('SELECT * FROM branches WHERE branch_id = ?').get(result.lastInsertRowid);
    res.json(branch);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/branches/:id', (req, res) => {
  try {
    const { branch_name, code, address, phone, email, status } = req.body;
    db.prepare('UPDATE branches SET branch_name=?, code=?, address=?, phone=?, email=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE branch_id=?')
      .run(branch_name, code, address, phone, email, status, req.params.id);
    const branch = db.prepare('SELECT * FROM branches WHERE branch_id = ?').get(req.params.id);
    res.json(branch);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/users', (req, res) => {
  try {
    const { branch_id, role_id, name, email, phone, password } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (branch_id, role_id, name, email, phone, password) VALUES (?, ?, ?, ?, ?, ?)')
      .run(branch_id, role_id, name, email, phone, hash);
    res.json({ user_id: result.lastInsertRowid, name, email });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/corporate', (req, res) => {
  try {
    const clients = db.prepare('SELECT * FROM corporate_clients ORDER BY company_name').all();
    res.json(clients);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/corporate', (req, res) => {
  try {
    const { company_name, contact_person, phone, email, address, credit_limit, discount_rate } = req.body;
    const result = db.prepare('INSERT INTO corporate_clients (company_name, contact_person, phone, email, address, credit_limit, discount_rate) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(company_name, contact_person, phone, email, address, credit_limit || 0, discount_rate || 0);
    const client = db.prepare('SELECT * FROM corporate_clients WHERE client_id = ?').get(result.lastInsertRowid);
    res.json(client);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/tokens', (req, res) => {
  try {
    const { status, department_id } = req.query;
    let query = `SELECT t.*, d.name as doctor_name, dp.department_name FROM tokens t
      LEFT JOIN doctors d ON t.doctor_id = d.doctor_id
      LEFT JOIN departments dp ON t.department_id = dp.department_id WHERE 1=1`;
    const params = [];
    if (status) { query += ' AND t.status = ?'; params.push(status); }
    if (department_id) { query += ' AND t.department_id = ?'; params.push(department_id); }
    query += ' ORDER BY t.created_at DESC';
    const tokens = db.prepare(query).all(...params);
    res.json(tokens);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/tokens', (req, res) => {
  try {
    const { branch_id, department_id, doctor_id, appointment_id, token_type } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const lastToken = db.prepare("SELECT MAX(token_no) as max_no FROM tokens WHERE DATE(created_at) = ?").get(today);
    const token_no = (lastToken?.max_no || 0) + 1;

    const result = db.prepare('INSERT INTO tokens (branch_id, department_id, doctor_id, appointment_id, token_no, token_type) VALUES (?, ?, ?, ?, ?, ?)')
      .run(branch_id, department_id, doctor_id, appointment_id, token_no, token_type || 'General');
    const token = db.prepare('SELECT * FROM tokens WHERE token_id = ?').get(result.lastInsertRowid);
    res.json(token);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/tokens/:id', (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE tokens SET status = ? WHERE token_id = ?').run(status, req.params.id);
    const token = db.prepare('SELECT * FROM tokens WHERE token_id = ?').get(req.params.id);
    res.json(token);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
