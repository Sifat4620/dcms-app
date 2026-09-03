import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/users', (req, res) => {
  try {
    const users = db.prepare(`SELECT u.user_id, u.name, u.email, u.phone, u.status, u.branch_id, u.last_login, r.role_id, r.role_name, b.branch_name
      FROM users u JOIN roles r ON u.role_id = r.role_id LEFT JOIN branches b ON u.branch_id = b.branch_id ORDER BY u.name`).all();
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/roles', (req, res) => {
  try {
    const roles = db.prepare(`SELECT r.*, (SELECT COUNT(*) FROM users u WHERE u.role_id = r.role_id) AS user_count FROM roles r ORDER BY r.role_id`).all();
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
    const { branch_name, code, address, phone, email, status, logo } = req.body;
    const has = (v) => v !== undefined;
    const sets = [];
    const params = [];
    if (has(branch_name)) { sets.push('branch_name=?'); params.push(branch_name ?? null); }
    if (has(code)) { sets.push('code=?'); params.push(code ?? null); }
    if (has(address)) { sets.push('address=?'); params.push(address ?? null); }
    if (has(phone)) { sets.push('phone=?'); params.push(phone ?? null); }
    if (has(email)) { sets.push('email=?'); params.push(email ?? null); }
    if (has(status)) { sets.push('status=?'); params.push(status ?? null); }
    if (has(logo)) { sets.push('logo=?'); params.push(logo ?? null); }
    sets.push('updated_at=CURRENT_TIMESTAMP');
    params.push(req.params.id);
    db.prepare(`UPDATE branches SET ${sets.join(', ')} WHERE branch_id=?`).run(...params);
    const branch = db.prepare('SELECT * FROM branches WHERE branch_id = ?').get(req.params.id);
    res.json(branch);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/users', (req, res) => {
  try {
    const { branch_id, role_id, name, email, phone, password } = req.body;
    if (!name || !email || !role_id || !password) {
      return res.status(400).json({ error: 'Name, email, role and password are required' });
    }
    const existing = db.prepare('SELECT user_id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (branch_id, role_id, name, email, phone, password) VALUES (?, ?, ?, ?, ?, ?)')
      .run(branch_id || null, role_id, name, email, phone || null, hash);
    const user = db.prepare(`SELECT u.user_id, u.name, u.email, u.phone, u.status, u.branch_id, u.last_login, r.role_id, r.role_name, b.branch_name
      FROM users u JOIN roles r ON u.role_id = r.role_id LEFT JOIN branches b ON u.branch_id = b.branch_id WHERE u.user_id = ?`).get(result.lastInsertRowid);
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/users/:id', (req, res) => {
  try {
    const { name, email, phone, role_id, branch_id, status, password } = req.body;
    if (email) {
      const existing = db.prepare('SELECT user_id FROM users WHERE email = ? AND user_id != ?').get(email, req.params.id);
      if (existing) return res.status(400).json({ error: 'Email already in use' });
    }
    const has = (v) => v !== undefined;
    const sets = [];
    const params = [];
    if (has(name)) { sets.push('name=?'); params.push(name ?? null); }
    if (has(email)) { sets.push('email=?'); params.push(email ?? null); }
    if (has(phone)) { sets.push('phone=?'); params.push(phone ?? null); }
    if (has(role_id)) { sets.push('role_id=?'); params.push(role_id ?? null); }
    if (has(branch_id)) { sets.push('branch_id=?'); params.push(branch_id ?? null); }
    if (has(status)) { sets.push('status=?'); params.push(status ?? null); }
    if (has(password) && password) { sets.push('password=?'); params.push(bcrypt.hashSync(password, 10)); }
    if (sets.length === 0) return res.status(400).json({ error: 'Nothing to update' });
    sets.push('updated_at=CURRENT_TIMESTAMP');
    params.push(req.params.id);
    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE user_id=?`).run(...params);
    const user = db.prepare(`SELECT u.user_id, u.name, u.email, u.phone, u.status, u.branch_id, u.last_login, r.role_id, r.role_name, b.branch_name
      FROM users u JOIN roles r ON u.role_id = r.role_id LEFT JOIN branches b ON u.branch_id = b.branch_id WHERE u.user_id = ?`).get(req.params.id);
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/users/:id', (req, res) => {
  try {
    const target = db.prepare('SELECT user_id FROM users WHERE user_id = ?').get(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (Number(req.params.id) === Number(req.user.user_id)) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    db.prepare('DELETE FROM users WHERE user_id = ?').run(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/roles', (req, res) => {
  try {
    const { role_name, description, permissions, status } = req.body;
    if (!role_name) return res.status(400).json({ error: 'Role name is required' });
    const result = db.prepare('INSERT INTO roles (role_name, description, permissions, status) VALUES (?, ?, ?, ?)')
      .run(role_name, description || null, JSON.stringify(permissions || []), status || 'active');
    const role = db.prepare(`SELECT r.*, (SELECT COUNT(*) FROM users u WHERE u.role_id = r.role_id) AS user_count FROM roles r WHERE r.role_id = ?`).get(result.lastInsertRowid);
    res.json(role);
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Role name already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/roles/:id', (req, res) => {
  try {
    const { role_name, description, permissions, status } = req.body;
    const has = (v) => v !== undefined;
    const sets = [];
    const params = [];
    if (has(role_name)) { sets.push('role_name=?'); params.push(role_name ?? null); }
    if (has(description)) { sets.push('description=?'); params.push(description ?? null); }
    if (has(permissions)) { sets.push('permissions=?'); params.push(JSON.stringify(permissions)); }
    if (has(status)) { sets.push('status=?'); params.push(status ?? null); }
    if (sets.length === 0) return res.status(400).json({ error: 'Nothing to update' });
    params.push(req.params.id);
    db.prepare(`UPDATE roles SET ${sets.join(', ')} WHERE role_id=?`).run(...params);
    const role = db.prepare(`SELECT r.*, (SELECT COUNT(*) FROM users u WHERE u.role_id = r.role_id) AS user_count FROM roles r WHERE r.role_id = ?`).get(req.params.id);
    res.json(role);
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Role name already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/roles/:id', (req, res) => {
  try {
    const target = db.prepare('SELECT role_id FROM roles WHERE role_id = ?').get(req.params.id);
    if (!target) return res.status(404).json({ error: 'Role not found' });
    const count = db.prepare('SELECT COUNT(*) as c FROM users WHERE role_id = ?').get(req.params.id).c;
    if (count > 0) return res.status(400).json({ error: 'Cannot delete a role that has users assigned' });
    db.prepare('DELETE FROM roles WHERE role_id = ?').run(req.params.id);
    res.json({ message: 'Role deleted' });
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
