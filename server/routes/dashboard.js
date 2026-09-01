import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const firstDayMonth = today.slice(0, 7) + '-01';

    const todayPatients = db.prepare('SELECT COUNT(DISTINCT patient_id) as count FROM patient_visits WHERE DATE(visit_date) = ?').get(today);
    const todayAppointments = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ?').get(today);
    const todayCompleted = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ? AND status = 'Completed'").get(today);
    const todayPending = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ? AND status IN ('Pending','Confirmed')").get(today);

    const currentQueue = db.prepare("SELECT COUNT(*) as count FROM tokens WHERE status IN ('Waiting','Serving')").get();
    const pendingTests = db.prepare("SELECT COUNT(*) as count FROM test_order_items WHERE status = 'Pending'").get();
    const pendingReports = db.prepare("SELECT COUNT(*) as count FROM reports WHERE status IN ('Draft','Verified')").get();

    const todayRevenue = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE DATE(payment_date) = ?").get(today);
    const monthRevenue = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_date >= ?").get(firstDayMonth);
    const totalDue = db.prepare("SELECT COALESCE(SUM(due_amount), 0) as total FROM invoices WHERE due_amount > 0").get();
    const lowStock = db.prepare('SELECT COUNT(*) as count FROM inventory_items WHERE current_stock <= reorder_level AND status = ?').get('active');

    const recentPatients = db.prepare('SELECT patient_id, patient_unique_id, name, mobile, created_at FROM patients ORDER BY created_at DESC LIMIT 5').all();
    const recentAppointments = db.prepare(`SELECT a.*, p.name as patient_name, d.name as doctor_name FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id JOIN doctors d ON a.doctor_id = d.doctor_id
      WHERE a.appointment_date = ? ORDER BY a.appointment_time LIMIT 10`).all(today);

    res.json({
      today: { patients: todayPatients.count, appointments: todayAppointments.count, completed: todayCompleted.count, pending: todayPending.count },
      queue: { current: currentQueue.count },
      lab: { pendingTests: pendingTests.count, pendingReports: pendingReports.count },
      financial: { todayRevenue: todayRevenue.total, monthRevenue: monthRevenue.total, totalDue: totalDue.total },
      alerts: { lowStock: lowStock.count },
      recentPatients,
      recentAppointments
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/reports/financial', (req, res) => {
  try {
    const { period = 'daily', start_date, end_date } = req.query;
    let dateFilter = '';
    const params = [];

    if (start_date && end_date) {
      dateFilter = 'AND payment_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    } else {
      dateFilter = "AND payment_date >= date('now', '-30 days')";
    }

    const revenue = db.prepare(`SELECT DATE(payment_date) as date, SUM(amount) as total, payment_method
      FROM payments WHERE 1=1 ${dateFilter} GROUP BY DATE(payment_date), payment_method ORDER BY date DESC`).all(...params);
    const totalRevenue = db.prepare(`SELECT SUM(amount) as total FROM payments WHERE 1=1 ${dateFilter}`).get(...params);

    const testRevenue = db.prepare(`SELECT t.test_name, COUNT(*) as count, SUM(toi.price) as revenue
      FROM test_order_items toi JOIN tests t ON toi.test_id = t.test_id
      JOIN test_orders too ON toi.order_id = too.order_id
      JOIN patient_visits pv ON too.visit_id = pv.visit_id
      WHERE 1=1 ${dateFilter.replace('payment_date', 'too.order_date')} GROUP BY t.test_id ORDER BY revenue DESC`).all(...params);

    const doctorRevenue = db.prepare(`SELECT d.name as doctor_name, COUNT(a.appointment_id) as appointments, SUM(a.appointment_id * 0) as revenue
      FROM appointments a JOIN doctors d ON a.doctor_id = d.doctor_id
      WHERE a.status = 'Completed' ${dateFilter.replace('payment_date', 'a.appointment_date')} GROUP BY d.doctor_id ORDER BY appointments DESC LIMIT 10`).all(...params);

    res.json({ revenue, totalRevenue: totalRevenue.total, testRevenue, doctorRevenue });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/reports/patients', (req, res) => {
  try {
    const newPatients = db.prepare("SELECT COUNT(*) as count FROM patients WHERE DATE(created_at) >= date('now', '-30 days')").get();
    const totalPatients = db.prepare('SELECT COUNT(*) as count FROM patients').get();
    const genderDist = db.prepare('SELECT gender, COUNT(*) as count FROM patients GROUP BY gender').all();
    const bloodDist = db.prepare('SELECT blood_group, COUNT(*) as count FROM patients WHERE blood_group IS NOT NULL GROUP BY blood_group ORDER BY count DESC').all();

    res.json({ newPatients: newPatients.count, totalPatients: totalPatients.count, genderDistribution: genderDist, bloodGroupDistribution: bloodDist });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/reports/lab', (req, res) => {
  try {
    const pendingTests = db.prepare("SELECT COUNT(*) as count FROM test_order_items WHERE status = 'Pending'").get();
    const completedToday = db.prepare("SELECT COUNT(*) as count FROM samples WHERE collection_status = 'Collected' AND DATE(collection_date) = DATE('now')").get();
    const totalSamples = db.prepare('SELECT COUNT(*) as count FROM samples').get();
    const rejectedSamples = db.prepare("SELECT COUNT(*) as count FROM samples WHERE collection_status = 'Rejected'").get();

    res.json({ pendingTests: pendingTests.count, completedToday: completedToday.count, totalSamples: totalSamples.count, rejectedSamples: rejectedSamples.count });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
