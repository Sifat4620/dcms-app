import db from '../config/database.js';

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS branches (
      branch_id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      address TEXT,
      phone TEXT,
      email TEXT,
      logo TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS roles (
      role_id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_name TEXT UNIQUE NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive'))
    );

    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_id INTEGER REFERENCES branches(branch_id),
      role_id INTEGER NOT NULL REFERENCES roles(role_id),
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS patients (
      patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_unique_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      father_name TEXT,
      mother_name TEXT,
      date_of_birth TEXT,
      gender TEXT CHECK(gender IN ('Male','Female','Other')),
      blood_group TEXT,
      mobile TEXT,
      email TEXT,
      address TEXT,
      emergency_contact TEXT,
      occupation TEXT,
      nid_no TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS patient_visits (
      visit_id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
      branch_id INTEGER REFERENCES branches(branch_id),
      appointment_id INTEGER REFERENCES appointments(appointment_id),
      visit_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      visit_type TEXT DEFAULT 'OPD' CHECK(visit_type IN ('OPD','Lab Test','Other')),
      referred_by TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS patient_history (
      history_id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
      history_type TEXT DEFAULT 'Medical' CHECK(history_type IN ('Medical','Allergy','Surgery','Other')),
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS doctors (
      doctor_id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_id INTEGER REFERENCES branches(branch_id),
      name TEXT NOT NULL,
      specialization TEXT,
      degree TEXT,
      bmdc_no TEXT,
      phone TEXT,
      email TEXT,
      consultation_fee REAL DEFAULT 0,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS doctor_schedule (
      schedule_id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id),
      day_of_week TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_break INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive'))
    );

    CREATE TABLE IF NOT EXISTS appointments (
      appointment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_id INTEGER REFERENCES branches(branch_id),
      patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
      doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id),
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      token_no INTEGER,
      fee REAL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      due_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending','Confirmed','Checked-in','Completed','Cancelled','No Show')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS departments (
      department_id INTEGER PRIMARY KEY AUTOINCREMENT,
      department_name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive'))
    );

    CREATE TABLE IF NOT EXISTS tokens (
      token_id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_id INTEGER REFERENCES branches(branch_id),
      department_id INTEGER REFERENCES departments(department_id),
      doctor_id INTEGER REFERENCES doctors(doctor_id),
      appointment_id INTEGER REFERENCES appointments(appointment_id),
      token_no INTEGER NOT NULL,
      token_type TEXT DEFAULT 'General' CHECK(token_type IN ('General','Priority','Emergency')),
      status TEXT DEFAULT 'Waiting' CHECK(status IN ('Waiting','Serving','Completed','Skipped','Cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS doctor_consultations (
      consultation_id INTEGER PRIMARY KEY AUTOINCREMENT,
      visit_id INTEGER NOT NULL REFERENCES patient_visits(visit_id),
      doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id),
      chief_complaint TEXT,
      notes TEXT,
      advice TEXT,
      follow_up_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS test_categories (
      category_id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive'))
    );

    CREATE TABLE IF NOT EXISTS tests (
      test_id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER REFERENCES test_categories(category_id),
      department_id INTEGER REFERENCES departments(department_id),
      test_name TEXT NOT NULL,
      sample_type TEXT,
      unit TEXT,
      price REAL DEFAULT 0,
      reference_range TEXT,
      turnaround_time TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive'))
    );

    CREATE TABLE IF NOT EXISTS prescribed_tests (
      prescription_id INTEGER PRIMARY KEY AUTOINCREMENT,
      consultation_id INTEGER NOT NULL REFERENCES doctor_consultations(consultation_id),
      test_id INTEGER NOT NULL REFERENCES tests(test_id),
      instructions TEXT,
      is_package_item INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS test_packages (
      package_id INTEGER PRIMARY KEY AUTOINCREMENT,
      package_name TEXT NOT NULL,
      description TEXT,
      price REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      package_price REAL DEFAULT 0,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive'))
    );

    CREATE TABLE IF NOT EXISTS package_tests (
      package_test_id INTEGER PRIMARY KEY AUTOINCREMENT,
      package_id INTEGER NOT NULL REFERENCES test_packages(package_id),
      test_id INTEGER NOT NULL REFERENCES tests(test_id)
    );

    CREATE TABLE IF NOT EXISTS test_orders (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      visit_id INTEGER NOT NULL REFERENCES patient_visits(visit_id),
      doctor_id INTEGER REFERENCES doctors(doctor_id),
      appointment_id INTEGER REFERENCES appointments(appointment_id),
      order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      discount REAL DEFAULT 0,
      total_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'Ordered' CHECK(status IN ('Ordered','Partially Collected','Completed','Cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS test_order_items (
      order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES test_orders(order_id),
      test_id INTEGER NOT NULL REFERENCES tests(test_id),
      price REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending','Sample Collected','Completed','Cancelled'))
    );

    CREATE TABLE IF NOT EXISTS samples (
      sample_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_item_id INTEGER NOT NULL REFERENCES test_order_items(order_item_id),
      sample_barcode TEXT UNIQUE NOT NULL,
      sample_type TEXT,
      collection_date DATETIME,
      collected_by INTEGER REFERENCES users(user_id),
      collection_status TEXT DEFAULT 'Pending' CHECK(collection_status IN ('Pending','Collected','Received','Rejected')),
      received_by INTEGER REFERENCES users(user_id),
      status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending','Processing','Completed','Rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lab_results (
      result_id INTEGER PRIMARY KEY AUTOINCREMENT,
      sample_id INTEGER NOT NULL REFERENCES samples(sample_id),
      result_value TEXT,
      unit TEXT,
      reference_range TEXT,
      is_abnormal INTEGER DEFAULT 0,
      remarks TEXT,
      entered_by INTEGER REFERENCES users(user_id),
      entered_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reports (
      report_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES test_orders(order_id),
      report_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      approved_by INTEGER REFERENCES users(user_id),
      approved_at DATETIME,
      status TEXT DEFAULT 'Draft' CHECK(status IN ('Draft','Verified','Approved','Released')),
      barcode TEXT
    );

    CREATE TABLE IF NOT EXISTS report_files (
      file_id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER NOT NULL REFERENCES reports(report_id),
      file_name TEXT,
      file_path TEXT,
      file_type TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invoices (
      invoice_id INTEGER PRIMARY KEY AUTOINCREMENT,
      visit_id INTEGER NOT NULL REFERENCES patient_visits(visit_id),
      invoice_no TEXT UNIQUE NOT NULL,
      invoice_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      subtotal REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      vat_amount REAL DEFAULT 0,
      total_amount REAL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      due_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'Unpaid' CHECK(status IN ('Paid','Partial','Unpaid','Cancelled'))
    );

    CREATE TABLE IF NOT EXISTS invoice_items (
      invoice_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL REFERENCES invoices(invoice_id),
      item_type TEXT CHECK(item_type IN ('Consultation','Test','Package','Other')),
      item_id INTEGER,
      item_name TEXT,
      quantity INTEGER DEFAULT 1,
      unit_price REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      amount REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS payments (
      payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL REFERENCES invoices(invoice_id),
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'Cash' CHECK(payment_method IN ('Cash','Card','Mobile Banking','Bank Transfer','Online Payment')),
      transaction_no TEXT,
      received_by INTEGER REFERENCES users(user_id),
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS appointment_payments (
      payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      appointment_id INTEGER NOT NULL REFERENCES appointments(appointment_id),
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'Cash',
      received_by INTEGER REFERENCES users(user_id),
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      supplier_id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_name TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive'))
    );

    CREATE TABLE IF NOT EXISTS inventory_items (
      item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      item_name TEXT NOT NULL,
      unit TEXT DEFAULT 'pcs',
      current_stock INTEGER DEFAULT 0,
      reorder_level INTEGER DEFAULT 10,
      expiry_tracking INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive'))
    );

    CREATE TABLE IF NOT EXISTS inventory_stock_logs (
      stock_log_id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL REFERENCES inventory_items(item_id),
      log_type TEXT CHECK(log_type IN ('IN','OUT','Adjustment')),
      quantity INTEGER NOT NULL,
      reference_no TEXT,
      notes TEXT,
      created_by INTEGER REFERENCES users(user_id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS purchases (
      purchase_id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_id INTEGER REFERENCES suppliers(supplier_id),
      purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      invoice_no TEXT,
      total_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending','Received','Cancelled'))
    );

    CREATE TABLE IF NOT EXISTS purchase_items (
      purchase_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_id INTEGER NOT NULL REFERENCES purchases(purchase_id),
      item_id INTEGER NOT NULL REFERENCES inventory_items(item_id),
      quantity INTEGER NOT NULL,
      unit_price REAL DEFAULT 0,
      total_price REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS employees (
      employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(user_id),
      branch_id INTEGER REFERENCES branches(branch_id),
      name TEXT NOT NULL,
      designation TEXT,
      department_id INTEGER REFERENCES departments(department_id),
      phone TEXT,
      email TEXT,
      join_date TEXT,
      salary REAL DEFAULT 0,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive'))
    );

    CREATE TABLE IF NOT EXISTS attendance (
      attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL REFERENCES employees(employee_id),
      attendance_date TEXT NOT NULL,
      check_in TEXT,
      check_out TEXT,
      status TEXT DEFAULT 'Present' CHECK(status IN ('Present','Absent','Leave'))
    );

    CREATE TABLE IF NOT EXISTS corporate_clients (
      client_id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      credit_limit REAL DEFAULT 0,
      discount_rate REAL DEFAULT 0,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive'))
    );

    CREATE TABLE IF NOT EXISTS notification_templates (
      template_id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_name TEXT NOT NULL,
      channel TEXT DEFAULT 'SMS',
      subject TEXT,
      body TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS notifications (
      notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER,
      recipient_name TEXT,
      recipient_phone TEXT,
      channel TEXT DEFAULT 'SMS',
      message TEXT,
      status TEXT DEFAULT 'Sent' CHECK(status IN ('Sent','Delivered','Failed')),
      created_by INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ---- Migrations for existing databases ----
  const hasCol = (table, col) =>
    db.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === col);

  const addCol = (table, col, def) => {
    if (!hasCol(table, col)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
    }
  };

  addCol('appointments', 'fee', 'REAL DEFAULT 0');
  addCol('appointments', 'paid_amount', 'REAL DEFAULT 0');
  addCol('appointments', 'due_amount', 'REAL DEFAULT 0');
  addCol('test_orders', 'doctor_id', 'INTEGER REFERENCES doctors(doctor_id)');
  addCol('test_orders', 'appointment_id', 'INTEGER REFERENCES appointments(appointment_id)');
  addCol('patient_visits', 'appointment_id', 'INTEGER REFERENCES appointments(appointment_id)');
  addCol('invoices', 'appointment_id', 'INTEGER REFERENCES appointments(appointment_id)');
}
