import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/categories', (req, res) => {
  try {
    const cats = db.prepare('SELECT * FROM test_categories ORDER BY category_name').all();
    res.json(cats);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/categories', (req, res) => {
  try {
    const { category_name, description } = req.body;
    const result = db.prepare('INSERT INTO test_categories (category_name, description) VALUES (?, ?)').run(category_name, description);
    res.json({ category_id: result.lastInsertRowid, category_name, description });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/', (req, res) => {
  try {
    const { search, category_id, department_id, page = 1, limit = 50 } = req.query;
    let query = `SELECT t.*, tc.category_name, d.department_name FROM tests t
      LEFT JOIN test_categories tc ON t.category_id = tc.category_id
      LEFT JOIN departments d ON t.department_id = d.department_id WHERE 1=1`;
    const params = [];

    if (search) { query += ' AND (t.test_name LIKE ?)'; params.push(`%${search}%`); }
    if (category_id) { query += ' AND t.category_id = ?'; params.push(category_id); }
    if (department_id) { query += ' AND t.department_id = ?'; params.push(department_id); }

    const countQ = query.replace(/SELECT t\.\*[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const { total } = db.prepare(countQ).get(...params);

    query += ' ORDER BY t.test_name LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const tests = db.prepare(query).all(...params);
    res.json({ data: tests, total, page: Number(page), limit: Number(limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', (req, res) => {
  try {
    const test = db.prepare('SELECT t.*, tc.category_name, d.department_name FROM tests t LEFT JOIN test_categories tc ON t.category_id = tc.category_id LEFT JOIN departments d ON t.department_id = d.department_id WHERE t.test_id = ?').get(req.params.id);
    if (!test) return res.status(404).json({ error: 'Test not found' });
    res.json(test);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', (req, res) => {
  try {
    const { category_id, department_id, test_name, sample_type, unit, price, reference_range, turnaround_time } = req.body;
    const result = db.prepare('INSERT INTO tests (category_id, department_id, test_name, sample_type, unit, price, reference_range, turnaround_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(category_id, department_id, test_name, sample_type, unit, price || 0, reference_range, turnaround_time);
    const test = db.prepare('SELECT * FROM tests WHERE test_id = ?').get(result.lastInsertRowid);
    res.json(test);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', (req, res) => {
  try {
    const { category_id, department_id, test_name, sample_type, unit, price, reference_range, turnaround_time, status } = req.body;
    db.prepare('UPDATE tests SET category_id=?, department_id=?, test_name=?, sample_type=?, unit=?, price=?, reference_range=?, turnaround_time=?, status=? WHERE test_id=?')
      .run(category_id, department_id, test_name, sample_type, unit, price, reference_range, turnaround_time, status, req.params.id);
    const test = db.prepare('SELECT * FROM tests WHERE test_id = ?').get(req.params.id);
    res.json(test);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM tests WHERE test_id = ?').run(req.params.id);
    res.json({ message: 'Test deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/packages/all', (req, res) => {
  try {
    const packages = db.prepare('SELECT * FROM test_packages WHERE status = ?').all('active');
    packages.forEach(pkg => {
      pkg.tests = db.prepare('SELECT t.* FROM tests t JOIN package_tests pt ON t.test_id = pt.test_id WHERE pt.package_id = ?').all(pkg.package_id);
    });
    res.json(packages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/packages', (req, res) => {
  try {
    const { package_name, description, price, discount, package_price, test_ids } = req.body;
    const result = db.prepare('INSERT INTO test_packages (package_name, description, price, discount, package_price) VALUES (?, ?, ?, ?, ?)')
      .run(package_name, description, price || 0, discount || 0, package_price || 0);
    const pkgId = result.lastInsertRowid;
    if (test_ids && test_ids.length) {
      const stmt = db.prepare('INSERT INTO package_tests (package_id, test_id) VALUES (?, ?)');
      test_ids.forEach(tid => stmt.run(pkgId, tid));
    }
    res.json({ package_id: pkgId, package_name, description, price, discount, package_price });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/departments', (req, res) => {
  try {
    const depts = db.prepare('SELECT * FROM departments ORDER BY department_name').all();
    res.json(depts);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/departments', (req, res) => {
  try {
    const { department_name, description } = req.body;
    const result = db.prepare('INSERT INTO departments (department_name, description) VALUES (?, ?)').run(department_name, description);
    res.json({ department_id: result.lastInsertRowid, department_name, description });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
