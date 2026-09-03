import db from './config/database.js';
import { initializeDatabase } from './config/schema.js';
import bcrypt from 'bcryptjs';
import defaultPermissionsFor from './permissions.js';

initializeDatabase();

const existingRoles = db.prepare('SELECT COUNT(*) as count FROM roles').get();
if (existingRoles.count === 0) {
  const insertRole = db.prepare('INSERT INTO roles (role_name, description, permissions) VALUES (?, ?, ?)');
  const roles = [
    ['Super Admin', 'Full system access'],
    ['Branch Admin', 'Branch level management'],
    ['Receptionist', 'Patient registration and appointments'],
    ['Doctor', 'Medical consultations'],
    ['Lab Technician', 'Lab test processing'],
    ['Pathologist', 'Report approval'],
    ['Cashier', 'Payment processing'],
    ['Sample Collector', 'Sample collection'],
    ['Patient', 'Patient portal access']
  ];
  roles.forEach(r => insertRole.run(r[0], r[1], JSON.stringify(defaultPermissionsFor(r[0]))));
  console.log('Roles seeded');
}

const roleRows = db.prepare('SELECT role_id, role_name, permissions FROM roles').all();
const updatePerm = db.prepare('UPDATE roles SET permissions = ? WHERE role_id = ?');
roleRows.forEach((r) => {
  const perms = JSON.parse(r.permissions || 'null') || null;
  if (!Array.isArray(perms)) {
    updatePerm.run(JSON.stringify(defaultPermissionsFor(r.role_name)), r.role_id);
    console.log(`Role permissions seeded for ${r.role_name}`);
  }
});

const existingBranch = db.prepare('SELECT COUNT(*) as count FROM branches').get();
if (existingBranch.count === 0) {
  db.prepare('INSERT INTO branches (branch_name, code, address, phone, email) VALUES (?, ?, ?, ?, ?)')
    .run('Main Branch', 'MB001', '123 Health Street, Dhaka', '+8801700000000', 'main@dcms.com');
  console.log('Branch seeded');
}

const existingAdmin = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (existingAdmin.count === 0) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (branch_id, role_id, name, email, phone, password) VALUES (?, ?, ?, ?, ?, ?)')
    .run(1, 1, 'Super Admin', 'admin@dcms.com', '+8801700000001', hash);
  console.log('Admin user seeded (admin@dcms.com / admin123)');
}

const existingDept = db.prepare('SELECT COUNT(*) as count FROM departments').get();
if (existingDept.count === 0) {
  const insertDept = db.prepare('INSERT INTO departments (department_name, description) VALUES (?, ?)');
  const depts = [
    ['Pathology', 'Pathology department'],
    ['Hematology', 'Hematology department'],
    ['Biochemistry', 'Biochemistry department'],
    ['Radiology', 'Radiology department'],
    ['Cardiology', 'Cardiology department'],
    ['Microbiology', 'Microbiology department'],
    ['Immunology', 'Immunology department'],
    ['Imaging', 'Imaging department']
  ];
  depts.forEach(d => insertDept.run(...d));
  console.log('Departments seeded');
}

const existingCat = db.prepare('SELECT COUNT(*) as count FROM test_categories').get();
if (existingCat.count === 0) {
  const insertCat = db.prepare('INSERT INTO test_categories (category_name, description) VALUES (?, ?)');
  const cats = [
    ['Hematology', 'Blood related tests'],
    ['Biochemistry', 'Chemical analysis tests'],
    ['Immunology', 'Immune system tests'],
    ['Microbiology', 'Microorganism tests'],
    ['Pathology', 'Tissue and cell tests'],
    ['Radiology', 'Imaging tests']
  ];
  cats.forEach(c => insertCat.run(...c));
  console.log('Test categories seeded');
}

const existingTests = db.prepare('SELECT COUNT(*) as count FROM tests').get();
if (existingTests.count === 0) {
  const insertTest = db.prepare('INSERT INTO tests (category_id, department_id, test_name, sample_type, unit, price, reference_range, turnaround_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const tests = [
    [1, 2, 'CBC (Complete Blood Count)', 'Blood', 'Various', 500, 'Varies by parameter', '4 hours'],
    [2, 3, 'Fasting Blood Sugar', 'Blood', 'mmol/L', 150, '3.9-5.6', '2 hours'],
    [2, 3, 'HbA1c', 'Blood', '%', 600, '4.0-5.6', '24 hours'],
    [2, 3, 'Lipid Profile', 'Blood', 'mmol/L', 400, 'Varies by parameter', '4 hours'],
    [1, 2, 'ESR', 'Blood', 'mm/hr', 100, '0-20', '1 hour'],
    [2, 3, 'Liver Function Test', 'Blood', 'Various', 800, 'Varies by parameter', '24 hours'],
    [2, 3, 'Kidney Function Test', 'Blood', 'Various', 700, 'Varies by parameter', '24 hours'],
    [1, 2, 'Blood Group & Crossmatch', 'Blood', '-', 200, '-', '1 hour'],
    [5, 1, 'Urine R/E', 'Urine', 'Various', 150, '-', '2 hours'],
    [2, 3, 'Thyroid Profile (TSH, T3, T4)', 'Blood', 'Various', 900, 'Varies by parameter', '24 hours']
  ];
  tests.forEach(t => insertTest.run(...t));
  console.log('Tests seeded');
}

const existingPackages = db.prepare('SELECT COUNT(*) as count FROM test_packages').get();
if (existingPackages.count === 0) {
  const insertPkg = db.prepare('INSERT INTO test_packages (package_name, description, price, discount, package_price, status) VALUES (?, ?, ?, ?, ?, ?)');
  const pkgs = [
    ['Full Body Checkup', 'Complete health screening package', 3500, 500, 3000, 'active'],
    ['Diabetes Package', 'Diabetes monitoring tests', 1500, 200, 1300, 'active'],
    ['Cardiac Package', 'Heart health screening', 2500, 300, 2200, 'active']
  ];
  pkgs.forEach(p => insertPkg.run(...p));

  const insertPkgTest = db.prepare('INSERT INTO package_tests (package_id, test_id) VALUES (?, ?)');
  insertPkgTest.run(1, 1); insertPkgTest.run(1, 2); insertPkgTest.run(1, 4); insertPkgTest.run(1, 6); insertPkgTest.run(1, 7);
  insertPkgTest.run(2, 2); insertPkgTest.run(2, 3);
  insertPkgTest.run(3, 4); insertPkgTest.run(3, 10);
  console.log('Packages seeded');
}

const existingTemplates = db.prepare('SELECT COUNT(*) as count FROM notification_templates').get();
if (existingTemplates.count === 0) {
  const insertTemplate = db.prepare('INSERT INTO notification_templates (event_name, channel, subject, body, is_active) VALUES (?, ?, ?, ?, ?)');
  const templates = [
    ['Appointment Confirmation', 'SMS', null, 'Dear {patient_name}, your appointment with {doctor_name} is confirmed for {date} at {time}. Token #{token}.', 1],
    ['Appointment Reminder', 'SMS', null, 'Reminder: Your appointment with {doctor_name} is tomorrow at {time}. Please arrive 10 mins early.', 1],
    ['Token Update', 'SMS', null, 'Dear {patient_name}, your token #{token} is now being served at {department}.', 1],
    ['Report Ready', 'SMS', null, 'Dear {patient_name}, your diagnostic report is ready. Access it via secure link: {link}', 1],
    ['Payment Due', 'SMS', null, 'Dear {patient_name}, you have an outstanding balance of BDT {amount}. Please clear at your earliest convenience.', 1],
    ['Birthday Greeting', 'SMS', null, 'Happy Birthday, {patient_name}! Wishing you great health. Enjoy 10% off your next visit.', 0],
    ['Promotional Campaign', 'SMS', null, 'Dear {patient_name}, enjoy our special health checkup packages this month.', 0],
  ];
  templates.forEach(t => insertTemplate.run(...t));
  console.log('Notification templates seeded');
}

const existingPatients = db.prepare('SELECT COUNT(*) as count FROM patients').get();
if (existingPatients.count === 0) {
  const insertPatient = db.prepare(`INSERT INTO patients
    (patient_unique_id, name, father_name, mother_name, date_of_birth, gender, blood_group, mobile, email, address, occupation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  const patients = [
    ['PT-00001', 'Rahim Uddin', 'Abdul Uddin', 'Rahima Khatun', '1985-03-14', 'Male', 'B+', '01711-100001', 'rahim@gmail.com', 'Dhanmondi, Dhaka', 'Service Holder'],
    ['PT-00002', 'Fatema Begum', 'Sirajul Islam', 'Saleha Begum', '1990-08-22', 'Female', 'A+', '01812-200002', 'fatema@gmail.com', 'Mirpur, Dhaka', 'Teacher'],
    ['PT-00003', 'Kamal Hossain', 'Aminul Hossain', 'Rokeya Hossain', '1975-12-01', 'Male', 'O+', '01913-300003', 'kamal@gmail.com', 'Uttara, Dhaka', 'Businessman'],
    ['PT-00004', 'Nusrat Jahan', 'Kazi Aziz', 'Shirin Aziz', '1995-06-30', 'Female', 'AB+', '01614-400004', 'nusrat@gmail.com', 'Banani, Dhaka', 'Software Engineer'],
    ['PT-00005', 'Abdul Karim', 'Mojammel Karim', 'Ayesha Karim', '1962-02-19', 'Male', 'A-', '01515-500005', 'akarim@gmail.com', 'Motijheel, Dhaka', 'Retired'],
    ['PT-00006', 'Sharmin Sultana', 'Faruk Ahmed', 'Jamilah Ahmed', '1988-10-05', 'Female', 'O-', '01716-600006', 'sharmin@gmail.com', 'Gulshan, Dhaka', 'Homemaker'],
  ];
  const patientIds = patients.map((p) => insertPatient.run(...p).lastInsertRowid);

  const insertVisit = db.prepare('INSERT INTO patient_visits (patient_id, branch_id, visit_date, visit_type, referred_by) VALUES (?, ?, ?, ?, ?)');
  const dateAt = (off) => new Date(Date.now() + off * 86400000).toISOString().replace('T', ' ').slice(0, 19);
  const visitData = [
    [patientIds[0], 1, dateAt(-5), 'Lab Test', 'Dr. Rafiqul Islam'],
    [patientIds[1], 1, dateAt(-4), 'OPD', 'Dr. Sultana Razia'],
    [patientIds[2], 1, dateAt(-3), 'Lab Test', null],
    [patientIds[3], 1, dateAt(-2), 'Lab Test', 'Dr. Farhana Rahman'],
    [patientIds[4], 1, dateAt(-6), 'OPD', 'Dr. Rafiqul Islam'],
    [patientIds[5], 1, dateAt(-1), 'Lab Test', null],
  ];
  const visitIds = visitData.map((v) => insertVisit.run(v[0], v[1], v[2], v[3], v[4]).lastInsertRowid);

  const insertOrder = db.prepare('INSERT INTO test_orders (visit_id, order_date, discount, total_amount, status) VALUES (?, ?, ?, ?, ?)');
  const insertOrderItem = db.prepare('INSERT INTO test_order_items (order_id, test_id, price, discount, status) VALUES (?, ?, ?, ?, ?)');
  const insertSample = db.prepare('INSERT INTO samples (order_item_id, sample_barcode, sample_type, collection_date, collected_by, collection_status, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const insertResult = db.prepare('INSERT INTO lab_results (sample_id, result_value, unit, reference_range, is_abnormal, remarks, entered_by) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const insertReport = db.prepare('INSERT INTO reports (order_id, barcode, status, approved_by, approved_at) VALUES (?, ?, ?, ?, ?)');

  const testPrice = (id) => db.prepare('SELECT price FROM tests WHERE test_id = ?').get(id).price;
  const today = new Date().toISOString().replace('T', ' ').slice(0, 19);

  const orders = [
    { visit: visitIds[0], tests: [1, 2], discount: 50, status: 'Completed' },
    { visit: visitIds[1], tests: [3, 4], discount: 0, status: 'Completed' },
    { visit: visitIds[2], tests: [5, 6], discount: 100, status: 'Completed' },
    { visit: visitIds[3], tests: [7, 8], discount: 0, status: 'Completed' },
    { visit: visitIds[4], tests: [2, 10], discount: 0, status: 'Partially Collected' },
    { visit: visitIds[5], tests: [1, 4, 9], discount: 0, status: 'Partially Collected' },
  ];

  const orderIds = [];
  orders.forEach((o) => {
    const total = o.tests.reduce((s, t) => s + testPrice(t), 0) - o.discount;
    orderIds.push(insertOrder.run(o.visit, today, o.discount, total, o.status).lastInsertRowid);
  });

  const samplesFor = (orderItemId) => {
    const sampleId = insertSample.run(orderItemId, `BC-${String(Math.floor(1000000000 + Math.random() * 9000000000))}`, 'Blood', today, 1, 'Collected', 'Processing').lastInsertRowid;
    return sampleId;
  };

  const orderItemIds = {};
  orders.forEach((o, idx) => {
    const orderId = orderIds[idx];
    orderItemIds[orderId] = [];
    o.tests.forEach((testId) => {
      orderItemIds[orderId].push(insertOrderItem.run(orderId, testId, testPrice(testId), 0, o.status === 'Completed' ? 'Completed' : 'Sample Collected').lastInsertRowid);
    });
  });

  const resultData = [
    { test: 1, value: '5.2', unit: 'million/mm3', range: '4.5-11' },
    { test: 2, value: '5.4', unit: 'mmol/L', range: '3.9-6.1' },
    { test: 3, value: '1.2', unit: 'mg/dL', range: '0.9-1.3' },
    { test: 4, value: '5.5', unit: 'mU/L', range: '0.4-4.0' },
    { test: 5, value: '12.4', unit: 'g/dL', range: '11.0-16.0' },
    { test: 6, value: '48', unit: '%', range: '36-52' },
    { test: 7, value: '7.8', unit: 'mmol/L', range: '3.9-6.1' },
    { test: 8, value: '0.9', unit: 'mg/dL', range: '0.5-1.5' },
    { test: 10, value: '74', unit: 'mmol/L', range: '70-110' },
  ];

  const allOrderItems = [];
  orders.forEach((o, idx) => {
    const orderId = orderIds[idx];
    o.tests.forEach((testId) => {
      allOrderItems.push({ orderId, testId, itemId: orderItemIds[orderId].shift() });
    });
  });

  allOrderItems.forEach(({ orderId, testId, itemId }) => {
    const sampleId = samplesFor(itemId);
    const rd = resultData.find((r) => r.test === testId);
    if (rd) {
      insertResult.run(sampleId, rd.value, rd.unit, rd.range, 0, null, 1);
    }
  });

  const reportStatuses = ['Released', 'Approved', 'Approved', 'Verified', 'Draft'];
  orders.slice(0, 5).forEach((o, idx) => {
    const orderId = orderIds[idx];
    const status = reportStatuses[idx];
    const approvedAt = status === 'Released' || status === 'Approved' ? dateAt(-1) : null;
    insertReport.run(orderId, `RPT-${String(idx + 1).padStart(3, '0')}`, status, status === 'Draft' || status === 'Verified' ? null : 1, approvedAt);
  });

  const insertInvoice = db.prepare('INSERT INTO invoices (visit_id, invoice_no, subtotal, discount, vat_amount, total_amount, paid_amount, due_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const insertInvoiceItem = db.prepare('INSERT INTO invoice_items (invoice_id, item_type, item_id, item_name, quantity, unit_price, discount, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const insertPayment = db.prepare('INSERT INTO payments (invoice_id, amount, payment_method, received_by) VALUES (?, ?, ?, ?)');

  const invoiceStates = [];
  orders.forEach((o, idx) => {
    const orderId = orderIds[idx];
    const visitId = o.visit;
    const total = o.tests.reduce((s, t) => s + testPrice(t), 0) - o.discount;
    const paid = idx % 3 === 0 ? Math.round(total / 2) : idx % 3 === 1 ? total : 0;
    const status = paid === 0 ? 'Unpaid' : paid === total ? 'Paid' : 'Partial';
    const inv = insertInvoice.run(visitId, `INV-${String(idx + 1).padStart(6, '0')}`, total + o.discount, o.discount, 0, total, paid, total - paid, status).lastInsertRowid;
    o.tests.forEach((t) => {
      insertInvoiceItem.run(inv, 'Test', t, db.prepare('SELECT test_name FROM tests WHERE test_id = ?').get(t).test_name, 1, testPrice(t), 0, testPrice(t));
    });
    if (paid > 0) {
      insertPayment.run(inv, paid, idx % 2 === 0 ? 'Cash' : 'Mobile Banking', 1);
    }
  });

  const existingSuppliers = db.prepare('SELECT COUNT(*) as count FROM suppliers').get();
  if (existingSuppliers.count === 0) {
    const insertSupplier = db.prepare('INSERT INTO suppliers (supplier_name, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?)');
    [
      ['MedLab Supplies Ltd.', 'Rafiqul Hasan', '01711-100001', 'info@medlab.com', 'Dhaka'],
      ['BioReagent BD', 'Sumon Ahmed', '01812-200002', 'sales@bioreagent.com', 'Chittagong'],
      ['HealthCare Depot', 'Tania Begum', '01913-300003', 'contact@hcdepot.com', 'Dhaka'],
    ].forEach((s) => insertSupplier.run(...s));
    console.log('Suppliers seeded');
  }

  const existingInventory = db.prepare('SELECT COUNT(*) as count FROM inventory_items').get();
  if (existingInventory.count === 0) {
    const insertItem = db.prepare('INSERT INTO inventory_items (category_id, item_name, unit, current_stock, reorder_level, expiry_tracking) VALUES (?, ?, ?, ?, ?, ?)');
    [
      ['Syringe 5ml', 'pcs', 250, 50, 0],
      ['Vacutainer Tube', 'pcs', 400, 100, 1],
      ['Glucometer Strip', 'box', 40, 20, 1],
      ['Safety Lancet', 'pcs', 180, 60, 0],
      ['Surgical Gloves', 'box', 25, 15, 1],
      ['Reagent CBC Kit', 'box', 8, 10, 1],
    ].forEach((it) => insertItem.run(null, it[0], it[1], it[2], it[3], it[4]));
    console.log('Inventory seeded');
  }

  const existingEmployees = db.prepare('SELECT COUNT(*) as count FROM employees').get();
  if (existingEmployees.count === 0) {
    const insertEmp = db.prepare('INSERT INTO employees (branch_id, name, designation, department_id, phone, email, join_date, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const deptOf = (name) => db.prepare('SELECT department_id FROM departments WHERE department_name = ?').get(name)?.department_id || null;
    const labId = deptOf('Pathology');
    [
      ['Nasim Ahmed', 'Lab Technician', labId, '01711-111111', 'nasim@dcms.com', '2024-01-15', 25000],
      ['Sumaiya Akter', 'Sample Collector', labId, '01711-222222', 'sumaiya@dcms.com', '2024-02-01', 18000],
      ['Jahangir Alam', 'Receptionist', deptOf('Pathology'), '01711-333333', 'jahangir@dcms.com', '2023-11-10', 20000],
      ['Nusrat Jahan', 'Cashier', deptOf('Pathology'), '01711-444444', 'nusrat@dcms.com', '2024-03-20', 21000],
    ].forEach((e) => insertEmp.run(1, e[0], e[1], e[2], e[3], e[4], e[5], e[6]));
    console.log('Employees seeded');
  }

  console.log('Demo transactional data seeded');
}

const existingDoctors = db.prepare('SELECT COUNT(*) as count FROM doctors').get();
if (existingDoctors.count === 0) {
  const insertDoctor = db.prepare('INSERT INTO doctors (branch_id, name, specialization, degree, bmdc_no, phone, email, consultation_fee, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const doctors = [
    ['Dr. Rafiqul Islam', 'Cardiology', 'MBBS, FCPS (Cardiology)', 'A12345', '01711-300001', 'rafiqul@dcms.com', 800, 'active'],
    ['Dr. Sultana Razia', 'Internal Medicine', 'MBBS, MD (Medicine)', 'A12346', '01711-300002', 'razia@dcms.com', 600, 'active'],
    ['Dr. Farhana Rahman', 'Gynae & Obs', 'MBBS, DGO', 'A12347', '01711-300003', 'farhana@dcms.com', 700, 'active'],
    ['Dr. Mahmud Hasan', 'Pediatrics', 'MBBS, FCPS (Pediatrics)', 'A12348', '01711-300004', 'mahmud@dcms.com', 500, 'active'],
    ['Dr. Asma Khanom', 'Dermatology', 'MBBS, DDV', 'A12349', '01711-300005', 'asma@dcms.com', 550, 'inactive'],
  ];
  doctors.forEach((d) => insertDoctor.run(1, ...d));
  console.log('Doctors seeded');
}

const existingAppts = db.prepare('SELECT COUNT(*) as count FROM appointments').get();
if (existingAppts.count === 0) {
  const insertApt = db.prepare('INSERT INTO appointments (branch_id, patient_id, doctor_id, appointment_date, appointment_time, token_no, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const patientRows = db.prepare('SELECT patient_id FROM patients ORDER BY patient_id').all();
  const doctorRows = db.prepare('SELECT doctor_id FROM doctors ORDER BY doctor_id').all();
  const dateAt = (off) => new Date(Date.now() + off * 86400000).toISOString().split('T')[0];
  const aptRows = [
    [patientRows[0].patient_id, doctorRows[0].doctor_id, dateAt(1), '09:30', 1, 'Pending'],
    [patientRows[1].patient_id, doctorRows[1].doctor_id, dateAt(1), '10:00', 2, 'Pending'],
    [patientRows[2].patient_id, doctorRows[2].doctor_id, dateAt(0), '11:30', 3, 'Checked-in'],
    [patientRows[3].patient_id, doctorRows[3].doctor_id, dateAt(-1), '10:30', 4, 'Completed'],
    [patientRows[4].patient_id, doctorRows[0].doctor_id, dateAt(2), '12:00', 5, 'Confirmed'],
    [patientRows[5].patient_id, doctorRows[2].doctor_id, dateAt(0), '04:30', 6, 'Pending'],
  ];
  aptRows.forEach((r) => insertApt.run(1, r[0], r[1], r[2], r[3], r[4], r[5]));
  console.log('Appointments seeded');
}

const existingTokens = db.prepare('SELECT COUNT(*) as count FROM tokens').get();
if (existingTokens.count === 0) {
  const insertToken = db.prepare('INSERT INTO tokens (branch_id, department_id, doctor_id, appointment_id, token_no, token_type, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const doctorRows = db.prepare('SELECT doctor_id FROM doctors ORDER BY doctor_id').all();
  const apptRows = db.prepare('SELECT appointment_id FROM appointments ORDER BY appointment_id').all();
  const tokenRows = [
    [1, 1, doctorRows[0].doctor_id, apptRows[0].appointment_id, 1, 'General', 'Waiting'],
    [1, 1, doctorRows[1].doctor_id, apptRows[1].appointment_id, 2, 'General', 'Serving'],
    [1, 1, doctorRows[2].doctor_id, apptRows[2].appointment_id, 3, 'Priority', 'Serving'],
    [1, 1, doctorRows[3].doctor_id, apptRows[3].appointment_id, 4, 'General', 'Completed'],
    [1, 1, doctorRows[0].doctor_id, apptRows[4].appointment_id, 5, 'Emergency', 'Waiting'],
  ];
  tokenRows.forEach((t) => insertToken.run(...t));
  console.log('Tokens seeded');
}

const existingCorp = db.prepare('SELECT COUNT(*) as count FROM corporate_clients').get();
if (existingCorp.count === 0) {
  const insertCorp = db.prepare('INSERT INTO corporate_clients (company_name, contact_person, phone, email, address, credit_limit, discount_rate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const clients = [
    ['Grameen Bank Ltd.', 'Md. Kamal Hossain', '01711-400001', 'hr@grameenbank.com', 'Mirpur, Dhaka', 500000, 10, 'active'],
    ['Beximco Pharma', 'Salma Chowdhury', '01711-400002', 'admin@beximcop.com', 'Gulshan, Dhaka', 800000, 15, 'active'],
    ['BRAC NGO', 'Moniruzzaman', '01711-400003', 'people@brac.net', 'Mohakhali, Dhaka', 300000, 12, 'active'],
    ['Darus Salam Hospital', 'Rakibul Islam', '01711-400004', 'ops@dsh.com', 'Motijheel, Dhaka', 200000, 8, 'inactive'],
  ];
  clients.forEach((c) => insertCorp.run(...c));
  console.log('Corporate clients seeded');
}

const existingPurchases = db.prepare('SELECT COUNT(*) as count FROM purchases').get();
if (existingPurchases.count === 0) {
  const supplierRows = db.prepare('SELECT supplier_id FROM suppliers ORDER BY supplier_id').all();
  const itemRows = db.prepare('SELECT item_id FROM inventory_items ORDER BY item_id').all();
  const insertPurchase = db.prepare('INSERT INTO purchases (supplier_id, invoice_no, total_amount, status) VALUES (?, ?, ?, ?)');
  const insertPurchaseItem = db.prepare('INSERT INTO purchase_items (purchase_id, item_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)');
  const insertStockLog = db.prepare("INSERT INTO inventory_stock_logs (item_id, log_type, quantity, reference_no, notes, created_by) VALUES (?, 'IN', ?, ?, ?, 1)");
  const purchaseRows = [
    { s: supplierRows[0].supplier_id, no: 'PO-0001', items: [[itemRows[0].item_id, 100, 15], [itemRows[1].item_id, 200, 8]], status: 'Received' },
    { s: supplierRows[1].supplier_id, no: 'PO-0002', items: [[itemRows[2].item_id, 50, 300], [itemRows[3].item_id, 100, 10]], status: 'Received' },
    { s: supplierRows[2].supplier_id, no: 'PO-0003', items: [[itemRows[4].item_id, 20, 450], [itemRows[5].item_id, 10, 2500]], status: 'Pending' },
  ];
  purchaseRows.forEach((p) => {
    const total = p.items.reduce((s, i) => s + i[1] * i[2], 0);
    const purchaseId = insertPurchase.run(p.s, p.no, total, p.status).lastInsertRowid;
    p.items.forEach((i) => {
      insertPurchaseItem.run(purchaseId, i[0], i[1], i[2], i[1] * i[2]);
      if (p.status === 'Received') {
        insertStockLog.run(i[0], i[1], p.no, 'Purchased from supplier');
        db.prepare('UPDATE inventory_items SET current_stock = current_stock + ? WHERE item_id = ?').run(i[1], i[0]);
      }
    });
  });
  console.log('Purchases seeded');
}

const existingNotifs = db.prepare('SELECT COUNT(*) as count FROM notifications').get();
if (existingNotifs.count === 0) {
  const insertNotif = db.prepare('INSERT INTO notifications (template_id, recipient_name, recipient_phone, channel, message, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const templateRows = db.prepare('SELECT template_id FROM notification_templates ORDER BY template_id').all();
  const notifRows = [
    [templateRows[0].template_id, 'Rahim Uddin', '01711-100001', 'SMS', 'Your appointment with Dr. Rafiqul Islam is confirmed.', 'Delivered', 1],
    [templateRows[2].template_id, 'Nusrat Jahan', '01614-400004', 'SMS', 'Token #3 is now being served at Pathology.', 'Delivered', 1],
    [templateRows[3].template_id, 'Kamal Hossain', '01913-300003', 'SMS', 'Your diagnostic report is ready.', 'Sent', 1],
    [templateRows[4].template_id, 'Abdul Karim', '01515-500005', 'SMS', 'You have an outstanding balance of BDT 950.', 'Failed', 1],
  ];
  notifRows.forEach((n) => insertNotif.run(...n));
  console.log('Notifications seeded');
}

console.log('Database initialization complete!');
