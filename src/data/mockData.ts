export const patients = [
  { id: "PT-00001", name: "Rahim Uddin", age: 42, gender: "Male", blood: "B+", mobile: "01711-234567", email: "rahim@gmail.com", lastVisit: "2026-08-30", status: "Active" },
  { id: "PT-00002", name: "Fatema Begum", age: 35, gender: "Female", blood: "O+", mobile: "01812-345678", email: "fatema@gmail.com", lastVisit: "2026-08-29", status: "Active" },
  { id: "PT-00003", name: "Karim Hossain", age: 58, gender: "Male", blood: "A+", mobile: "01913-456789", email: "karim@gmail.com", lastVisit: "2026-08-28", status: "Active" },
  { id: "PT-00004", name: "Nasrin Akter", age: 29, gender: "Female", blood: "AB+", mobile: "01614-567890", email: "nasrin@gmail.com", lastVisit: "2026-08-27", status: "Active" },
  { id: "PT-00005", name: "Jamal Uddin", age: 67, gender: "Male", blood: "B-", mobile: "01515-678901", email: "jamal@gmail.com", lastVisit: "2026-08-26", status: "Inactive" },
  { id: "PT-00006", name: "Roksana Parvin", age: 44, gender: "Female", blood: "O-", mobile: "01716-789012", email: "roksana@gmail.com", lastVisit: "2026-08-25", status: "Active" },
  { id: "PT-00007", name: "Shahidul Islam", age: 33, gender: "Male", blood: "A-", mobile: "01817-890123", email: "shahidul@gmail.com", lastVisit: "2026-08-24", status: "Active" },
  { id: "PT-00008", name: "Moriam Khatun", age: 52, gender: "Female", blood: "B+", mobile: "01918-901234", email: "moriam@gmail.com", lastVisit: "2026-08-23", status: "Active" },
];

export const doctors = [
  { id: "DR-001", name: "Dr. Rafiqul Islam", specialization: "Cardiologist", degree: "MBBS, MD", bmdc: "A-45678", phone: "01711-111111", fee: 800, status: "Active", days: "Sat-Thu", time: "10:00-14:00" },
  { id: "DR-002", name: "Dr. Sultana Razia", specialization: "Pathologist", degree: "MBBS, FCPS", bmdc: "A-56789", phone: "01812-222222", fee: 600, status: "Active", days: "Sat-Wed", time: "09:00-13:00" },
  { id: "DR-003", name: "Dr. Mizanur Rahman", specialization: "Gastroenterologist", degree: "MBBS, MD", bmdc: "A-67890", phone: "01913-333333", fee: 700, status: "Active", days: "Sun-Thu", time: "16:00-20:00" },
  { id: "DR-004", name: "Dr. Laila Anjum", specialization: "Gynecologist", degree: "MBBS, FCPS", bmdc: "A-78901", phone: "01614-444444", fee: 750, status: "Active", days: "Sat-Thu", time: "11:00-15:00" },
  { id: "DR-005", name: "Dr. Anisur Rahman", specialization: "Neurologist", degree: "MBBS, MD", bmdc: "A-89012", phone: "01515-555555", fee: 900, status: "Active", days: "Mon-Fri", time: "10:00-14:00" },
];

export const appointments = [
  { id: "APT-0001", patient: "Rahim Uddin", patientId: "PT-00001", doctor: "Dr. Rafiqul Islam", date: "2026-08-31", time: "10:30", token: 5, status: "Confirmed", fee: 800 },
  { id: "APT-0002", patient: "Fatema Begum", patientId: "PT-00002", doctor: "Dr. Sultana Razia", date: "2026-08-31", time: "09:15", token: 3, status: "Checked-in", fee: 600 },
  { id: "APT-0003", patient: "Karim Hossain", patientId: "PT-00003", doctor: "Dr. Mizanur Rahman", date: "2026-08-31", time: "16:30", token: 1, status: "Pending", fee: 700 },
  { id: "APT-0004", patient: "Nasrin Akter", patientId: "PT-00004", doctor: "Dr. Rafiqul Islam", date: "2026-08-31", time: "11:00", token: 7, status: "Completed", fee: 800 },
  { id: "APT-0005", patient: "Jamal Uddin", patientId: "PT-00005", doctor: "Dr. Anisur Rahman", date: "2026-08-31", time: "10:00", token: 2, status: "No Show", fee: 900 },
  { id: "APT-0006", patient: "Roksana Parvin", patientId: "PT-00006", doctor: "Dr. Laila Anjum", date: "2026-08-31", time: "11:30", token: 9, status: "Confirmed", fee: 750 },
  { id: "APT-0007", patient: "Shahidul Islam", patientId: "PT-00007", doctor: "Dr. Rafiqul Islam", date: "2026-09-01", time: "10:00", token: 1, status: "Pending", fee: 800 },
];

export const tokens = [
  { id: "TK-0001", token: "T-001", patient: "Fatema Begum", dept: "Cardiology", doctor: "Dr. Rafiqul Islam", counter: "C-1", type: "General", status: "Serving", createdAt: "09:00" },
  { id: "TK-0002", token: "T-002", patient: "Karim Hossain", dept: "Pathology", doctor: "Dr. Sultana Razia", counter: "C-2", type: "General", status: "Waiting", createdAt: "09:05" },
  { id: "TK-0003", token: "T-003", patient: "Nasrin Akter", dept: "Cardiology", doctor: "Dr. Rafiqul Islam", counter: "C-1", type: "Priority", status: "Waiting", createdAt: "09:10" },
  { id: "TK-0004", token: "T-004", patient: "Rahim Uddin", dept: "Neurology", doctor: "Dr. Anisur Rahman", counter: "C-3", type: "Emergency", status: "Waiting", createdAt: "09:12" },
  { id: "TK-0005", token: "T-005", patient: "Roksana Parvin", dept: "Gynecology", doctor: "Dr. Laila Anjum", counter: "C-4", type: "General", status: "Waiting", createdAt: "09:15" },
  { id: "TK-0006", token: "T-006", patient: "Moriam Khatun", dept: "Pathology", doctor: "Dr. Sultana Razia", counter: "C-2", type: "General", status: "Completed", createdAt: "08:45" },
];

export const labTests = [
  { id: "TST-001", name: "Complete Blood Count (CBC)", code: "CBC", category: "Hematology", dept: "Pathology", sample: "Blood", price: 450, tat: "Same Day", unit: "Various", status: "Active" },
  { id: "TST-002", name: "Blood Sugar Fasting", code: "BSF", category: "Biochemistry", dept: "Biochemistry", sample: "Blood", price: 150, tat: "Same Day", unit: "mmol/L", status: "Active" },
  { id: "TST-003", name: "Blood Sugar 2hrs PP", code: "BS2PP", category: "Biochemistry", dept: "Biochemistry", sample: "Blood", price: 150, tat: "Same Day", unit: "mmol/L", status: "Active" },
  { id: "TST-004", name: "HbA1c", code: "HBA1C", category: "Biochemistry", dept: "Biochemistry", sample: "Blood", price: 800, tat: "Same Day", unit: "%", status: "Active" },
  { id: "TST-005", name: "Urine R/E", code: "URE", category: "Microbiology", dept: "Pathology", sample: "Urine", price: 200, tat: "Same Day", unit: "Various", status: "Active" },
  { id: "TST-006", name: "Lipid Profile", code: "LIPID", category: "Biochemistry", dept: "Biochemistry", sample: "Blood", price: 600, tat: "Same Day", unit: "mg/dL", status: "Active" },
  { id: "TST-007", name: "ECG", code: "ECG", category: "Cardiology", dept: "Cardiology", sample: "N/A", price: 350, tat: "Instant", unit: "N/A", status: "Active" },
  { id: "TST-008", name: "Thyroid Profile (T3,T4,TSH)", code: "TFT", category: "Immunology", dept: "Biochemistry", sample: "Blood", price: 1200, tat: "Next Day", unit: "Various", status: "Active" },
  { id: "TST-009", name: "Chest X-Ray", code: "CXR", category: "Radiology", dept: "Radiology", sample: "N/A", price: 500, tat: "Instant", unit: "N/A", status: "Active" },
  { id: "TST-010", name: "Serum Creatinine", code: "CREAT", category: "Biochemistry", dept: "Biochemistry", sample: "Blood", price: 300, tat: "Same Day", unit: "mg/dL", status: "Active" },
];

export const testPackages = [
  { id: "PKG-001", name: "Full Body Checkup", tests: 12, originalPrice: 5500, price: 3500, discount: "36%", status: "Active" },
  { id: "PKG-002", name: "Diabetes Package", tests: 5, originalPrice: 1800, price: 1200, discount: "33%", status: "Active" },
  { id: "PKG-003", name: "Cardiac Package", tests: 8, originalPrice: 4200, price: 2800, discount: "33%", status: "Active" },
  { id: "PKG-004", name: "Executive Health Checkup", tests: 20, originalPrice: 9000, price: 6000, discount: "33%", status: "Active" },
  { id: "PKG-005", name: "Pregnancy Package", tests: 7, originalPrice: 3200, price: 2200, discount: "31%", status: "Active" },
];

export const samples = [
  { id: "SMP-001", barcode: "BC-2608310001", patient: "Rahim Uddin", test: "CBC", type: "Blood", orderId: "ORD-001", collectedBy: "Nasim Ahmed", collectedAt: "08:30", status: "Processing" },
  { id: "SMP-002", barcode: "BC-2608310002", patient: "Fatema Begum", test: "Blood Sugar Fasting", type: "Blood", orderId: "ORD-002", collectedBy: "Nasim Ahmed", collectedAt: "08:45", status: "Completed" },
  { id: "SMP-003", barcode: "BC-2608310003", patient: "Karim Hossain", test: "Urine R/E", type: "Urine", orderId: "ORD-003", collectedBy: "Sumaiya Akter", collectedAt: "09:00", status: "Received" },
  { id: "SMP-004", barcode: "BC-2608310004", patient: "Nasrin Akter", test: "Lipid Profile", type: "Blood", orderId: "ORD-004", collectedBy: "Nasim Ahmed", collectedAt: "09:15", status: "Collected" },
  { id: "SMP-005", barcode: "BC-2608310005", patient: "Jamal Uddin", test: "HbA1c", type: "Blood", orderId: "ORD-005", collectedBy: "Sumaiya Akter", collectedAt: "09:20", status: "Pending" },
  { id: "SMP-006", barcode: "BC-2608310006", patient: "Roksana Parvin", test: "Thyroid Profile", type: "Blood", orderId: "ORD-006", collectedBy: "Nasim Ahmed", collectedAt: "09:30", status: "Rejected" },
];

export const reports = [
  { id: "RPT-001", patient: "Fatema Begum", patientId: "PT-00002", tests: "Blood Sugar Fasting", orderId: "ORD-002", date: "2026-08-31", reportDate: "2026-08-31", approvedBy: "Dr. Sultana Razia", status: "Released" },
  { id: "RPT-002", patient: "Rahim Uddin", patientId: "PT-00001", tests: "CBC", orderId: "ORD-001", date: "2026-08-31", reportDate: "2026-08-31", approvedBy: "—", status: "Verified" },
  { id: "RPT-003", patient: "Karim Hossain", patientId: "PT-00003", tests: "Urine R/E", orderId: "ORD-003", date: "2026-08-31", reportDate: "2026-08-31", approvedBy: "—", status: "Draft" },
  { id: "RPT-004", patient: "Nasrin Akter", patientId: "PT-00004", tests: "Lipid Profile", orderId: "ORD-004", date: "2026-08-30", reportDate: "2026-08-30", approvedBy: "Dr. Sultana Razia", status: "Approved" },
  { id: "RPT-005", patient: "Moriam Khatun", patientId: "PT-00008", tests: "Thyroid Profile", orderId: "ORD-005", date: "2026-08-29", reportDate: "2026-08-30", approvedBy: "Dr. Sultana Razia", status: "Released" },
];

export const invoices = [
  { id: "INV-2608-001", patient: "Rahim Uddin", patientId: "PT-00001", date: "2026-08-31", subtotal: 1250, discount: 100, vat: 0, total: 1150, paid: 1150, due: 0, method: "Cash", status: "Paid" },
  { id: "INV-2608-002", patient: "Fatema Begum", patientId: "PT-00002", date: "2026-08-31", subtotal: 750, discount: 0, vat: 0, total: 750, paid: 500, due: 250, method: "Card", status: "Partial" },
  { id: "INV-2608-003", patient: "Karim Hossain", patientId: "PT-00003", date: "2026-08-31", subtotal: 2800, discount: 200, vat: 0, total: 2600, paid: 0, due: 2600, method: "—", status: "Unpaid" },
  { id: "INV-2608-004", patient: "Nasrin Akter", patientId: "PT-00004", date: "2026-08-30", subtotal: 3500, discount: 500, vat: 0, total: 3000, paid: 3000, due: 0, method: "bKash", status: "Paid" },
  { id: "INV-2608-005", patient: "Roksana Parvin", patientId: "PT-00006", date: "2026-08-30", subtotal: 1450, discount: 0, vat: 0, total: 1450, paid: 1000, due: 450, method: "Cash", status: "Partial" },
  { id: "INV-2608-006", patient: "Jamal Uddin", patientId: "PT-00005", date: "2026-08-29", subtotal: 900, discount: 0, vat: 0, total: 900, paid: 900, due: 0, method: "Nagad", status: "Paid" },
];

export const inventoryItems = [
  { id: "INV-I-001", name: "Test Tube (EDTA)", category: "Lab Supplies", unit: "Pcs", stock: 450, reorderLevel: 200, expiry: "2027-06-30", status: "In Stock" },
  { id: "INV-I-002", name: "Syringe 5ml", category: "Lab Supplies", unit: "Box", stock: 12, reorderLevel: 20, expiry: "2028-01-01", status: "Low Stock" },
  { id: "INV-I-003", name: "Latex Gloves (M)", category: "PPE", unit: "Box", stock: 8, reorderLevel: 15, expiry: "2028-03-01", status: "Low Stock" },
  { id: "INV-I-004", name: "Reagent CBC Kit", category: "Reagents", unit: "Kit", stock: 25, reorderLevel: 10, expiry: "2026-12-31", status: "In Stock" },
  { id: "INV-I-005", name: "Urine Collection Cup", category: "Lab Supplies", unit: "Pcs", stock: 320, reorderLevel: 100, expiry: "2029-01-01", status: "In Stock" },
  { id: "INV-I-006", name: "Alcohol Swab", category: "Lab Supplies", unit: "Box", stock: 3, reorderLevel: 10, expiry: "2027-09-01", status: "Low Stock" },
  { id: "INV-I-007", name: "A4 Photo Paper", category: "Printing", unit: "Ream", stock: 45, reorderLevel: 20, expiry: "—", status: "In Stock" },
  { id: "INV-I-008", name: "Barcode Label Roll", category: "Printing", unit: "Roll", stock: 7, reorderLevel: 10, expiry: "—", status: "Low Stock" },
];

export const employees = [
  { id: "EMP-001", name: "Nasim Ahmed", dept: "Laboratory", designation: "Lab Technician", join: "2023-01-15", phone: "01711-001001", salary: 22000, attendance: 97, status: "Active" },
  { id: "EMP-002", name: "Sumaiya Akter", dept: "Laboratory", designation: "Sample Collector", join: "2023-03-20", phone: "01812-002002", salary: 18000, attendance: 95, status: "Active" },
  { id: "EMP-003", name: "Jahangir Alam", dept: "Reception", designation: "Receptionist", join: "2022-07-10", phone: "01913-003003", salary: 20000, attendance: 98, status: "Active" },
  { id: "EMP-004", name: "Nusrat Jahan", dept: "Accounts", designation: "Cashier", join: "2023-06-01", phone: "01614-004004", salary: 21000, attendance: 96, status: "Active" },
  { id: "EMP-005", name: "Rakibul Hasan", dept: "IT", designation: "IT Support", join: "2024-01-10", phone: "01515-005005", salary: 28000, attendance: 99, status: "Active" },
  { id: "EMP-006", name: "Tania Sultana", dept: "Admin", designation: "Admin Officer", join: "2021-11-05", phone: "01716-006006", salary: 30000, attendance: 94, status: "Active" },
];

export const corporateClients = [
  { id: "CORP-001", name: "Grameen Bank", type: "Bank", contact: "HR Manager", phone: "02-9891234", employees: 250, creditLimit: 500000, due: 45000, status: "Active" },
  { id: "CORP-002", name: "BRAC NGO", type: "NGO", contact: "Admin Head", phone: "02-9912345", employees: 180, creditLimit: 300000, due: 12000, status: "Active" },
  { id: "CORP-003", name: "Dhaka University", type: "University", contact: "Medical Officer", phone: "02-9563456", employees: 800, creditLimit: 1000000, due: 0, status: "Active" },
  { id: "CORP-004", name: "Square Group", type: "Corporate", contact: "HR Director", phone: "02-9874567", employees: 400, creditLimit: 800000, due: 78000, status: "Active" },
];

export const revenueData = [
  { month: "Mar", revenue: 185000, patients: 312 },
  { month: "Apr", revenue: 210000, patients: 356 },
  { month: "May", revenue: 198000, patients: 338 },
  { month: "Jun", revenue: 245000, patients: 412 },
  { month: "Jul", revenue: 268000, patients: 445 },
  { month: "Aug", revenue: 232000, patients: 389 },
];

export const notifications = [
  { id: "NOT-001", type: "Report Ready", recipient: "Fatema Begum", phone: "01812-345678", message: "Your diagnostic report is ready. Visit us or download from portal.", sentAt: "2026-08-31 09:45", channel: "SMS", status: "Delivered" },
  { id: "NOT-002", type: "Appointment Reminder", recipient: "Rahim Uddin", phone: "01711-234567", message: "Reminder: Your appointment with Dr. Rafiqul Islam is tomorrow at 10:30 AM.", sentAt: "2026-08-30 18:00", channel: "SMS", status: "Delivered" },
  { id: "NOT-003", type: "Payment Due", recipient: "Karim Hossain", phone: "01913-456789", message: "You have an outstanding balance of BDT 2,600. Please clear at your earliest.", sentAt: "2026-08-31 10:00", channel: "SMS", status: "Failed" },
  { id: "NOT-004", type: "Report Ready", recipient: "Nasrin Akter", phone: "01614-567890", message: "Your Lipid Profile report is approved and ready for download.", sentAt: "2026-08-30 14:30", channel: "Email", status: "Delivered" },
];
