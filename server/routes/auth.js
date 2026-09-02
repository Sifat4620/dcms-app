import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dcms-secret-key';

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = db.prepare(`
      SELECT u.*, r.role_name FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.email = ? AND u.status = 'active'
    `).get(email);

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role_name: user.role_name, branch_id: user.branch_id, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { user_id: user.user_id, name: user.name, email: user.email, role_name: user.role_name, branch_id: user.branch_id }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/register', (req, res) => {
  try {
    const { name, email, password, phone, branch_id, role_id } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (branch_id, role_id, name, email, phone, password) VALUES (?, ?, ?, ?, ?, ?)')
      .run(branch_id || 1, role_id || 3, name, email, phone, hash);
    res.json({ user_id: result.lastInsertRowid, message: 'User registered' });
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

const currentUser = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;
  const decoded = jwt.verify(token, JWT_SECRET);
  return db.prepare('SELECT u.user_id, u.name, u.email, u.phone, r.role_name, u.branch_id FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?').get(decoded.user_id);
};

router.put('/me', (req, res) => {
  try {
    const user = currentUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { name, phone, email } = req.body;
    if (email && email !== user.email) {
      const exists = db.prepare('SELECT user_id FROM users WHERE email = ? AND user_id != ?').get(email, user.user_id);
      if (exists) return res.status(400).json({ error: 'Email already in use' });
    }
    db.prepare('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), email = COALESCE(?, email) WHERE user_id = ?')
      .run(name ?? null, phone ?? null, email ?? null, user.user_id);
    const updated = currentUser(req);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/change-password', (req, res) => {
  try {
    const user = currentUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) return res.status(400).json({ error: 'Current and new password required' });
    if (new_password.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
    const row = db.prepare('SELECT password FROM users WHERE user_id = ?').get(user.user_id);
    if (!bcrypt.compareSync(current_password, row.password)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    const hash = bcrypt.hashSync(new_password, 10);
    db.prepare('UPDATE users SET password = ? WHERE user_id = ?').run(hash, user.user_id);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', (req, res) => {
  try {
    const user = currentUser(req);
    if (!user) return res.status(401).json({ error: 'No token' });
    res.json(user);
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
});

export default router;
