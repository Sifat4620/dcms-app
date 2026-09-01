import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    const { search, status, page = 1, limit = 25 } = req.query;
    let query = 'SELECT * FROM inventory_items WHERE 1=1';
    const params = [];
    if (search) { query += ' AND item_name LIKE ?'; params.push(`%${search}%`); }
    if (status) { query += ' AND status = ?'; params.push(status); }

    const countQ = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const { total } = db.prepare(countQ).get(...params);

    query += ' ORDER BY item_name LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const items = db.prepare(query).all(...params);
    res.json({ data: items, total, page: Number(page), limit: Number(limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/low-stock', (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM inventory_items WHERE current_stock <= reorder_level AND status = ?').all('active');
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', (req, res) => {
  try {
    const { category_id, item_name, unit, current_stock, reorder_level, expiry_tracking } = req.body;
    const result = db.prepare('INSERT INTO inventory_items (category_id, item_name, unit, current_stock, reorder_level, expiry_tracking) VALUES (?, ?, ?, ?, ?, ?)')
      .run(category_id, item_name, unit || 'pcs', current_stock || 0, reorder_level || 10, expiry_tracking ? 1 : 0);
    const item = db.prepare('SELECT * FROM inventory_items WHERE item_id = ?').get(result.lastInsertRowid);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', (req, res) => {
  try {
    const { category_id, item_name, unit, current_stock, reorder_level, expiry_tracking, status } = req.body;
    db.prepare('UPDATE inventory_items SET category_id=?, item_name=?, unit=?, current_stock=?, reorder_level=?, expiry_tracking=?, status=? WHERE item_id=?')
      .run(category_id, item_name, unit, current_stock, reorder_level, expiry_tracking ? 1 : 0, status, req.params.id);
    const item = db.prepare('SELECT * FROM inventory_items WHERE item_id = ?').get(req.params.id);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM inventory_items WHERE item_id = ?').run(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/stock-log', (req, res) => {
  try {
    const { item_id, log_type, quantity, reference_no, notes } = req.body;
    db.prepare('INSERT INTO inventory_stock_logs (item_id, log_type, quantity, reference_no, notes, created_by) VALUES (?, ?, ?, ?, ?, ?)')
      .run(item_id, log_type, quantity, reference_no, notes, req.user.user_id);

    const item = db.prepare('SELECT * FROM inventory_items WHERE item_id = ?').get(item_id);
    let newStock = item.current_stock;
    if (log_type === 'IN') newStock += quantity;
    else if (log_type === 'OUT') newStock -= quantity;
    else if (log_type === 'Adjustment') newStock = quantity;

    db.prepare('UPDATE inventory_items SET current_stock = ? WHERE item_id = ?').run(Math.max(0, newStock), item_id);
    res.json({ message: 'Stock updated', current_stock: Math.max(0, newStock) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/stock-logs/:itemId', (req, res) => {
  try {
    const logs = db.prepare(`SELECT isl.*, u.name as created_by_name FROM inventory_stock_logs isl
      LEFT JOIN users u ON isl.created_by = u.user_id
      WHERE isl.item_id = ? ORDER BY isl.created_at DESC`).all(req.params.itemId);
    res.json(logs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/suppliers', (req, res) => {
  try {
    const suppliers = db.prepare('SELECT * FROM suppliers ORDER BY supplier_name').all();
    res.json(suppliers);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/suppliers', (req, res) => {
  try {
    const { supplier_name, contact_person, phone, email, address } = req.body;
    const result = db.prepare('INSERT INTO suppliers (supplier_name, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?)')
      .run(supplier_name, contact_person, phone, email, address);
    const supplier = db.prepare('SELECT * FROM suppliers WHERE supplier_id = ?').get(result.lastInsertRowid);
    res.json(supplier);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/suppliers/:id', (req, res) => {
  try {
    const { supplier_name, contact_person, phone, email, address, status } = req.body;
    db.prepare('UPDATE suppliers SET supplier_name=?, contact_person=?, phone=?, email=?, address=?, status=? WHERE supplier_id=?')
      .run(supplier_name, contact_person, phone, email, address, status, req.params.id);
    const supplier = db.prepare('SELECT * FROM suppliers WHERE supplier_id = ?').get(req.params.id);
    res.json(supplier);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/purchases', (req, res) => {
  try {
    const purchases = db.prepare(`SELECT p.*, s.supplier_name FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id ORDER BY p.purchase_date DESC`).all();
    res.json(purchases);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/purchases', (req, res) => {
  try {
    const { supplier_id, invoice_no, items } = req.body;
    const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const result = db.prepare('INSERT INTO purchases (supplier_id, invoice_no, total_amount) VALUES (?, ?, ?)')
      .run(supplier_id, invoice_no, total);
    const purchaseId = result.lastInsertRowid;

    const stmt = db.prepare('INSERT INTO purchase_items (purchase_id, item_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)');
    items.forEach(item => {
      stmt.run(purchaseId, item.item_id, item.quantity, item.unit_price, item.quantity * item.unit_price);
      db.prepare('INSERT INTO inventory_stock_logs (item_id, log_type, quantity, reference_no, created_by) VALUES (?, "IN", ?, ?, ?)')
        .run(item.item_id, item.quantity, invoice_no, req.user.user_id);
      db.prepare('UPDATE inventory_items SET current_stock = current_stock + ? WHERE item_id = ?')
        .run(item.quantity, item.item_id);
    });
    res.json({ purchase_id: purchaseId, total_amount: total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
