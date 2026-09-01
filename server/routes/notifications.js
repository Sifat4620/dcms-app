import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/templates', (req, res) => {
  try {
    const templates = db.prepare('SELECT * FROM notification_templates ORDER BY template_id').all();
    res.json(templates);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/templates', (req, res) => {
  try {
    const { event_name, channel, subject, body, is_active } = req.body;
    const result = db.prepare('INSERT INTO notification_templates (event_name, channel, subject, body, is_active) VALUES (?, ?, ?, ?, ?)')
      .run(event_name, channel || 'SMS', subject || null, body, is_active === false ? 0 : 1);
    const template = db.prepare('SELECT * FROM notification_templates WHERE template_id = ?').get(result.lastInsertRowid);
    res.json(template);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/templates/:id', (req, res) => {
  try {
    const { event_name, channel, subject, body, is_active } = req.body;
    db.prepare('UPDATE notification_templates SET event_name=?, channel=?, subject=?, body=?, is_active=? WHERE template_id=?')
      .run(event_name, channel, subject, body, is_active === false ? 0 : 1, req.params.id);
    const template = db.prepare('SELECT * FROM notification_templates WHERE template_id = ?').get(req.params.id);
    res.json(template);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/templates/:id/toggle', (req, res) => {
  try {
    const { is_active } = req.body;
    db.prepare('UPDATE notification_templates SET is_active=? WHERE template_id=?')
      .run(is_active ? 1 : 0, req.params.id);
    const template = db.prepare('SELECT * FROM notification_templates WHERE template_id = ?').get(req.params.id);
    res.json(template);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/', (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    let query = 'SELECT n.*, u.name as sent_by_name FROM notifications n LEFT JOIN users u ON n.created_by = u.user_id WHERE 1=1';
    const params = [];
    if (status) { query += ' AND n.status = ?'; params.push(status); }
    query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));
    const notifications = db.prepare(query).all(...params);
    res.json(notifications);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/stats', (req, res) => {
  try {
    const today = "DATE(created_at) = DATE('now')";
    const sentToday = db.prepare(`SELECT COUNT(*) as count FROM notifications WHERE ${today}`).get().count;
    const delivered = db.prepare(`SELECT COUNT(*) as count FROM notifications WHERE ${today} AND status = 'Delivered'`).get().count;
    const failed = db.prepare(`SELECT COUNT(*) as count FROM notifications WHERE ${today} AND status = 'Failed'`).get().count;
    const thisMonth = db.prepare("SELECT COUNT(*) as count FROM notifications WHERE created_at >= date('now', 'start of month')").get().count;
    res.json({ sentToday, delivered, failed, thisMonth });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', (req, res) => {
  try {
    const { template_id, recipient_name, recipient_phone, channel, message, status } = req.body;
    const result = db.prepare('INSERT INTO notifications (template_id, recipient_name, recipient_phone, channel, message, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(template_id || null, recipient_name, recipient_phone, channel || 'SMS', message, status || 'Delivered', req.user.user_id);
    res.json({ notification_id: result.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;