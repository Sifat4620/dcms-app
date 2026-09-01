import db from './config/database.js';
import { initializeDatabase } from './config/schema.js';
import bcrypt from 'bcryptjs';

initializeDatabase();

const existingRoles = db.prepare('SELECT COUNT(*) as count FROM roles').get();
if (existingRoles.count === 0) {
  const insertRole = db.prepare('INSERT INTO roles (role_name, description) VALUES (?, ?)');
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
  roles.forEach(r => insertRole.run(...r));
  console.log('Roles seeded');
}

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

console.log('Database initialization complete!');
