import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    const { search, department_id, status, page = 1, limit = 25 } = req.query;
    let query = `SELECT e.*, d.department_name, b.branch_name FROM employees e
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN branches b ON e.branch_id = b.branch_id WHERE 1=1`;
    const params = [];
    if (search) { query += ' AND (e.name LIKE ? OR e.phone LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (department_id) { query += ' AND e.department_id = ?'; params.push(department_id); }
    if (status) { query += ' AND e.status = ?'; params.push(status); }

    const countQ = query.replace(/SELECT e\.\*.*FROM/, 'SELECT COUNT(*) as total FROM');
    const { total } = db.prepare(countQ).get(...params);

    query += ' ORDER BY e.name LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const employees = db.prepare(query).all(...params);
    res.json({ data: employees, total, page: Number(page), limit: Number(limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', (req, res) => {
  try {
    const emp = db.prepare(`SELECT e.*, d.department_name, b.branch_name FROM employees e
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN branches b ON e.branch_id = b.branch_id
      WHERE e.employee_id = ?`).get(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    res.json(emp);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', (req, res) => {
  try {
    const { branch_id, name, designation, department_id, phone, email, join_date, salary } = req.body;
    const result = db.prepare('INSERT INTO employees (branch_id, name, designation, department_id, phone, email, join_date, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(branch_id, name, designation, department_id, phone, email, join_date, salary || 0);
    const emp = db.prepare('SELECT * FROM employees WHERE employee_id = ?').get(result.lastInsertRowid);
    res.json(emp);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', (req, res) => {
  try {
    const { branch_id, name, designation, department_id, phone, email, join_date, salary, status } = req.body;
    db.prepare('UPDATE employees SET branch_id=?, name=?, designation=?, department_id=?, phone=?, email=?, join_date=?, salary=?, status=? WHERE employee_id=?')
      .run(branch_id, name, designation, department_id, phone, email, join_date, salary, status, req.params.id);
    const emp = db.prepare('SELECT * FROM employees WHERE employee_id = ?').get(req.params.id);
    res.json(emp);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM employees WHERE employee_id = ?').run(req.params.id);
    res.json({ message: 'Employee deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id/attendance', (req, res) => {
  try {
    const { date } = req.query;
    let query = 'SELECT * FROM attendance WHERE employee_id = ?';
    const params = [req.params.id];
    if (date) { query += ' AND attendance_date = ?'; params.push(date); }
    query += ' ORDER BY attendance_date DESC';
    const attendance = db.prepare(query).all(...params);
    res.json(attendance);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/attendance', (req, res) => {
  try {
    const { attendance_date, check_in, check_out, status } = req.body;
    const existing = db.prepare('SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = ?').get(req.params.id, attendance_date);
    if (existing) {
      db.prepare('UPDATE attendance SET check_in=?, check_out=?, status=? WHERE attendance_id=?')
        .run(check_in || existing.check_in, check_out, status, existing.attendance_id);
    } else {
      db.prepare('INSERT INTO attendance (employee_id, attendance_date, check_in, check_out, status) VALUES (?, ?, ?, ?, ?)')
        .run(req.params.id, attendance_date, check_in, check_out, status || 'Present');
    }
    res.json({ message: 'Attendance recorded' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
