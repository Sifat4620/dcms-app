Software Requirements Specification (SRS)
Diagnostic Center Management System (DCMS)
Project Type
Web-Based Integrated Diagnostic Center Management Solution
1. Introduction
1.1 Purpose
The purpose of this system is to develop an integrated Diagnostic Center Management System (DCMS) that enables a diagnostic center to manage its daily operations through one centralized platform.
The system will digitize and automate:
Patient registration
CRM and patient relationship management
Doctor management
Doctor appointment scheduling
Token and queue management
Laboratory test management
Sample collection
Barcode generation and tracking
Lab report preparation
Digital report delivery
Billing and invoicing
Payment management
Inventory management
Employee management
Branch management
Financial reporting
SMS/email notifications
Administrative control
The solution should reduce manual paperwork, minimize human errors, improve patient experience, and provide real-time operational insights.

2. Project Objectives
The main objectives are:
Create a centralized management solution.
Reduce manual work and paperwork.
Improve patient service and waiting-time management.
Track samples accurately using barcode technology.
Automate billing and payment records.
Allow doctors and laboratory personnel to work efficiently.
Generate accurate laboratory reports.
Provide management with real-time business reports.
Support multiple branches in the future.
Maintain secure patient and medical data.

3. User Roles
The system should support role-based access control.
3.1 Super Admin
Full system access.
Responsibilities:
Manage branches
Manage users
Configure system settings
Manage permissions
View overall reports
Manage packages and pricing
Monitor activities

3.2 Branch Admin
Responsible for managing a specific diagnostic center branch.
Responsibilities:
Manage branch operations
Monitor employees
Manage doctors
View branch reports
Approve certain actions

3.3 Receptionist
Responsibilities:
Register patients
Search existing patients
Create appointments
Generate tokens
Create invoices
Receive payments
Print receipts

3.4 Doctor
Responsibilities:
View appointments
View patient history
Add consultation notes
Prescribe tests
View reports
Manage appointment availability

3.5 Lab Technician
Responsibilities:
View assigned tests
Scan sample barcodes
Enter test results
Upload reports
Update test status

3.6 Pathologist / Lab Supervisor
Responsibilities:
Review laboratory results
Approve reports
Digitally sign reports
Return reports for correction

3.7 Cashier / Accounts Officer
Responsibilities:
Manage payments
Process invoices
Manage due payments
Process refunds
Generate financial reports

3.8 Sample Collector
Responsibilities:
View sample collection requests
Collect samples
Scan barcode
Update collection status

3.9 Patient
Optional patient portal.
Patients can:
View appointments
Download reports
View invoices
Check payment history
Receive notifications

4. Core Modules
4.1 CRM & Patient Management
The CRM module will maintain complete patient information.
Features
New patient registration
Unique Patient ID generation
Patient profile
Name
Age
Date of birth
Gender
Blood group
Mobile number
Email
Address
Emergency contact
Medical history
Previous tests
Previous reports
Appointment history
Payment history
Additional Features
Search patient by:
Patient ID
Mobile number
Name
Barcode
Duplicate patient detection
Patient visit history
Follow-up reminders

4.2 Doctor Management
The system should maintain doctor information.
Doctor Profile
Doctor ID
Name
Specialization
Degree
BMDC registration number
Mobile number
Email
Consultation fee
Available days
Available time
Appointment limit
Profile image
Status
Features
Add/Edit/Delete doctors
Doctor schedules
Doctor availability
Doctor-wise appointments
Doctor-wise earnings
Consultation reports

4.3 Doctor Appointment Management
Patients can book appointments with doctors.
Features
Walk-in appointment
Advance appointment
Online appointment
Appointment date
Appointment time
Doctor selection
Patient selection
Consultation fee
Appointment status
Appointment Status
Pending
Confirmed
Checked-in
Completed
Cancelled
No Show
Additional Features
Prevent double booking
Appointment reminders
Rescheduling
Cancellation management
Daily doctor schedule

4.4 Token & Queue Management System
The token system should manage patient queues.
Features
Automatic token generation
Department-wise token
Doctor-wise token
Test collection token
Priority token
Emergency token
Queue Display
A digital display can show:
Now Serving
Token Number
Patient Name (optional/privacy mode)
Doctor/Department
Counter Number
Features
Call next token
Skip token
Recall token
Transfer token
Queue status

4.5 Laboratory Test Management
This is one of the most important modules.
Test Categories
Examples:
Hematology
Biochemistry
Immunology
Microbiology
Pathology
Radiology
Imaging
Cardiology
Test Information
Test Name
Test Code
Department
Price
Sample Type
Preparation Instructions
Expected Delivery Time
Reference Range
Unit
Example:
Test
Sample
Unit
CBC
Blood
Various
Blood Sugar
Blood
mmol/L
Urine R/E
Urine
Various


4.6 Test Packages
The system should support diagnostic packages.
Examples:
Full Body Checkup
Diabetes Package
Cardiac Package
Executive Health Checkup
Pregnancy Package
Features
Package name
Included tests
Original price
Discount
Package price

4.7 Barcode & Sample Management
Every test/sample should be trackable.
Barcode Generation
When a test order is created, the system will generate:
Order ID
Sample ID
Barcode
Patient ID
Test information
Barcode Usage
The barcode will be printed as a label and attached to the sample container.
Workflow:
Patient Registration → Test Order → Payment → Barcode Generation → Sample Collection → Laboratory Processing → Result Entry → Verification → Report Delivery
Sample Status
Sample Pending
Sample Collected
Sample Received
Processing
Completed
Rejected
Barcode Scanning
Lab staff should scan the barcode to:
Identify patient
Identify test
Update sample status
Enter results

4.8 Laboratory Report Management
The system should allow complete digital report creation.
Features
Test result entry
Automatic reference ranges
Units
Abnormal result highlighting
Technician verification
Pathologist approval
Digital signature
Report PDF generation
Report Information
Reports should contain:
Diagnostic Center Logo
Patient Name
Patient ID
Age
Gender
Mobile number
Doctor Name
Test Name
Result
Unit
Reference Range
Barcode
Report ID
Collection Date
Report Date
Authorized Signature

4.9 Report Delivery
Patients should be able to receive reports digitally.
Delivery Methods
Printed copy
PDF download
Patient portal
SMS notification
Email
Secure report link
Example SMS:
Dear Patient, your diagnostic report is ready. Please visit the diagnostic center or access your report through the secure link.

4.10 Billing & Invoice Management
The billing system should manage all transactions.
Features
Consultation billing
Test billing
Package billing
Discount
Corporate discount
Doctor referral discount
VAT configuration
Due payment
Partial payment
Payment Methods
Cash
Card
Mobile Banking
Bank Transfer
Online Payment
Relevant Bangladesh payment integrations can later include services such as bKash, Nagad, or card/payment gateways.

4.11 Invoice System
Invoices should include:
Invoice Number
Patient Information
Tests
Quantity
Price
Discount
VAT
Total Amount
Paid Amount
Due Amount
Payment Method
Cashier Name
Features
Print invoice
Download PDF
Reprint invoice
Refund invoice
Cancel invoice with authorization

4.12 Due & Payment Management
The system should manage outstanding payments.
Features
Patient due
Partial payment
Due collection
Payment history
Due reminder

4.13 Doctor Referral Management
Diagnostic centers often receive patients through referring doctors.
The system should manage:
Referring doctor
Referral source
Referred patients
Referral tests
Referral statistics
Commission configuration
Important: Commission-related features should be configurable according to the center's internal policies and applicable laws/regulations.

4.14 Inventory Management
The diagnostic center needs inventory tracking.
Inventory Items
Test tubes
Reagents
Chemicals
Gloves
Syringes
Printing materials
Laboratory equipment
Features
Stock entry
Stock usage
Low stock alerts
Supplier management
Purchase records
Expiry date tracking
Batch number tracking

4.15 Supplier Management
Maintain:
Supplier name
Contact information
Products supplied
Purchase history
Payment due

4.16 Employee Management
Manage diagnostic center employees.
Features
Employee profile
Department
Designation
Joining date
Salary
Attendance
Leave
Performance notes
Optional future modules:
Payroll
Biometric attendance integration

4.17 Branch Management
The system should be designed to support multiple branches.
Features
Branch-wise users
Branch-wise patients
Branch-wise billing
Branch-wise inventory
Branch-wise reports
Central administration

4.18 Corporate & Institutional Clients
The system should support:
Companies
NGOs
Schools
Universities
Insurance companies
Features:
Corporate accounts
Corporate pricing
Employee health packages
Monthly billing
Credit limits

4.19 SMS & Notification System
Automatic notifications should be sent for:
Appointment confirmation
Appointment reminder
Token updates
Report ready
Payment due
Birthday greetings
Promotional campaigns

4.20 Dashboard
The dashboard should provide real-time statistics.
Dashboard Widgets
Today's patients
Today's appointments
Current queue
Tests pending
Reports pending approval
Today's revenue
Monthly revenue
Due payments
Low stock alerts

4.21 Reports & Analytics
Management should be able to generate:
Financial Reports
Daily sales
Monthly sales
Test-wise revenue
Doctor-wise revenue
Branch-wise revenue
Payment method report
Patient Reports
New patients
Returning patients
Patient demographics
Laboratory Reports
Pending tests
Completed tests
Delayed reports
Technician performance
Inventory Reports
Current stock
Low stock
Expiring products
Purchase history

5. Suggested System Workflow
Patient & Lab Test Workflow
Patient Registration
        ↓
Select Doctor / Tests
        ↓
Create Appointment or Test Order
        ↓
Generate Invoice
        ↓
Receive Payment
        ↓
Generate Barcode
        ↓
Sample Collection
        ↓
Laboratory Processing
        ↓
Result Entry
        ↓
Verification
        ↓
Pathologist Approval
        ↓
Report Generated
        ↓
SMS Notification
        ↓
Patient Downloads / Collects Report

6. Non-Functional Requirements
Security
Role-based permissions
Secure login
Password encryption
Session management
Audit logs
Backup system
Performance
The system should support:
Multiple simultaneous users
Fast patient search
Fast barcode scanning
Quick invoice generation
Backup
Daily database backup
Cloud backup
Manual backup option
Scalability
The system should support:
Multiple branches
Increased patient volume
Future mobile application
Third-party integrations

7. Recommended Technology Architecture
Frontend
React.js / Next.js
Backend
Node.js
Laravel
Database
MySQL
PostgreSQL
API
REST API or GraphQL API
Mobile Application
Future:
Android
iOS
Patient App

8. Future Advanced Features
For a premium version, you could include:
AI-Based Features
Abnormal report detection
Automated patient follow-up
Revenue forecasting
Patient behavior analytics
WhatsApp Integration
Appointment confirmation
Report notifications
Customer support
Online Patient Portal
Patients can:
Register
Book appointments
Pay online
View reports
Download invoices
Home Sample Collection
Patients can request:
Blood collection
Urine collection
Home diagnostic service
The system can assign a collector and track the request.

Final System Modules
I would structure the final software into these 16 main modules:
Dashboard
CRM & Patient Management
Doctor Management
Appointment Management
Token & Queue System
Laboratory Test Management
Barcode & Sample Management
Lab Report Management
Billing & Invoice
Payment & Due Management
Inventory & Supplier Management
Employee Management
Corporate Client Management
SMS & Notification
Reports & Analytics
Administration & Settings

ERD Diagram:


Below is the ERD in text format, organized by entity/table with its primary keys, foreign keys, and main relationships.
Diagnostic Center Management System (DCMS)
ERD 

1. BRANCH
Table: branches
branch_id — PK
branch_name
code
address
phone
email
logo
status
created_at
updated_at
Relationships:
One Branch → Many Users
One Branch → Many Doctors
One Branch → Many Patient Visits
One Branch → Many Appointments
One Branch → Many Tokens
One Branch → Many Employees

2. ROLES
Table: roles
role_id — PK
role_name
description
status
Relationships:
One Role → Many Users

3. USERS
Table: users
user_id — PK
branch_id — FK → branches.branch_id
role_id — FK → roles.role_id
name
email
phone
password
status
created_at
updated_at
Relationships:
Many Users → One Branch
Many Users → One Role

PATIENT MANAGEMENT
4. PATIENTS
Table: patients
patient_id — PK
patient_unique_id
name
father_name
mother_name
date_of_birth
gender
blood_group
mobile
email
address
emergency_contact
occupation
nid_no
notes
created_at
updated_at
Relationships:
One Patient → Many Patient Visits
One Patient → Many Patient History Records
One Patient → Many Appointments

5. PATIENT_VISITS
Table: patient_visits
visit_id — PK
patient_id — FK → patients.patient_id
branch_id — FK → branches.branch_id
visit_date
visit_type
referred_by
notes
created_at
Visit Types:
OPD
Lab Test
Other
Relationships:
Many Visits → One Patient
Many Visits → One Branch
One Visit → Many Consultations
One Visit → Many Test Orders
One Visit → Many Invoices

6. PATIENT_HISTORY
Table: patient_history
history_id — PK
patient_id — FK → patients.patient_id
history_type
description
created_at
History Types:
Medical
Allergy
Surgery
Other
Relationship:
Many History Records → One Patient

DOCTOR & APPOINTMENT MANAGEMENT
7. DOCTORS
Table: doctors
doctor_id — PK
branch_id — FK → branches.branch_id
name
specialization
degree
bmdc_no
phone
email
consultation_fee
status
created_at
Relationships:
Many Doctors → One Branch
One Doctor → Many Doctor Schedules
One Doctor → Many Appointments
One Doctor → Many Consultations

8. DOCTOR_SCHEDULE
Table: doctor_schedule
schedule_id — PK
doctor_id — FK → doctors.doctor_id
day_of_week
start_time
end_time
is_break
status
Relationship:
Many Schedules → One Doctor

9. APPOINTMENTS
Table: appointments
appointment_id — PK
branch_id — FK → branches.branch_id
patient_id — FK → patients.patient_id
doctor_id — FK → doctors.doctor_id
appointment_date
appointment_time
token_no
status
created_at
updated_at
Status:
Pending
Confirmed
Checked-in
Completed
Cancelled
No Show
Relationships:
Many Appointments → One Patient
Many Appointments → One Doctor
Many Appointments → One Branch

10. TOKENS
Table: tokens
token_id — PK
branch_id — FK → branches.branch_id
department_id — FK → departments.department_id
doctor_id — FK → doctors.doctor_id (Nullable)
appointment_id — FK → appointments.appointment_id (Nullable)
token_no
token_type
status
created_at
Token Types:
General
Priority
Emergency
Status:
Waiting
Serving
Completed
Skipped
Cancelled

DOCTOR CONSULTATION
11. DOCTOR_CONSULTATION
Table: doctor_consultations
consultation_id — PK
visit_id — FK → patient_visits.visit_id
doctor_id — FK → doctors.doctor_id
chief_complaint
notes
advice
follow_up_date
created_at
Relationships:
Many Consultations → One Patient Visit
Many Consultations → One Doctor
One Consultation → Many Prescribed Tests

12. PRESCRIBED_TESTS
Table: prescribed_tests
prescription_id — PK
consultation_id — FK → doctor_consultations.consultation_id
test_id — FK → tests.test_id
instructions
is_package_item
Relationship:
Many Prescribed Tests → One Consultation
Many Prescribed Tests → One Test

DEPARTMENT & TEST MANAGEMENT
13. DEPARTMENTS
Table: departments
department_id — PK
department_name
description
status
Examples:
Pathology
Hematology
Biochemistry
Radiology
Cardiology

14. TEST_CATEGORIES
Table: test_categories
category_id — PK
category_name
description
status
Relationship:
One Test Category → Many Tests

15. TESTS
Table: tests
test_id — PK
category_id — FK → test_categories.category_id
department_id — FK → departments.department_id
test_name
sample_type
unit
price
reference_range
turnaround_time
status
Relationships:
Many Tests → One Category
Many Tests → One Department
One Test → Many Test Order Items
One Test → Many Prescribed Tests

TEST PACKAGE MANAGEMENT
16. TEST_PACKAGES
Table: test_packages
package_id — PK
package_name
description
price
status
Examples:
Full Body Checkup
Diabetes Package
Cardiac Package
Executive Health Package

17. PACKAGE_TESTS
Table: package_tests
package_test_id — PK
package_id — FK → test_packages.package_id
test_id — FK → tests.test_id
Relationships:
Many Package Tests → One Package
Many Package Tests → One Test
This creates a Many-to-Many relationship between Packages and Tests.

TEST ORDER & SAMPLE MANAGEMENT
18. TEST_ORDERS
Table: test_orders
order_id — PK
visit_id — FK → patient_visits.visit_id
order_date
discount
total_amount
status
created_at
Status:
Ordered
Partially Collected
Completed
Cancelled
Relationship:
One Patient Visit → Many Test Orders
One Test Order → Many Test Order Items

19. TEST_ORDER_ITEMS
Table: test_order_items
order_item_id — PK
order_id — FK → test_orders.order_id
test_id — FK → tests.test_id
price
discount
status
Relationships:
Many Order Items → One Test Order
Many Order Items → One Test

20. SAMPLES
Table: samples
sample_id — PK
order_item_id — FK → test_order_items.order_item_id
sample_barcode
sample_type
collection_date
collected_by — FK → users.user_id
collection_status
received_by — FK → users.user_id
status
Collection Status:
Pending
Collected
Received
Rejected
Relationships:
One Test Order Item → One or More Samples
Each Sample has a unique Barcode
One Sample → One or Many Lab Results

LABORATORY RESULT MANAGEMENT
21. LAB_RESULTS
Table: lab_results
result_id — PK
sample_id — FK → samples.sample_id
result_value
unit
reference_range
is_abnormal
remarks
entered_by — FK → users.user_id
entered_at
Relationships:
Many Results → One Sample
Result entered by One User

22. REPORTS
Table: reports
report_id — PK
order_id — FK → test_orders.order_id
report_date
approved_by — FK → users.user_id
approved_at
status
barcode
Status:
Draft
Verified
Approved
Released
Relationships:
One Test Order → One or Multiple Reports
One User → Can Approve Many Reports
One Report → Many Report Files

23. REPORT_FILES
Table: report_files
file_id — PK
report_id — FK → reports.report_id
file_name
file_path
file_type
uploaded_at
Relationship:
Many Report Files → One Report

BILLING & PAYMENT MANAGEMENT
24. INVOICES
Table: invoices
invoice_id — PK
visit_id — FK → patient_visits.visit_id
invoice_no
invoice_date
subtotal
discount
vat_amount
total_amount
paid_amount
due_amount
status
Relationships:
Many Invoices → One Patient Visit
One Invoice → Many Invoice Items
One Invoice → Many Payments

25. INVOICE_ITEMS
Table: invoice_items
invoice_item_id — PK
invoice_id — FK → invoices.invoice_id
item_type
item_id
item_name
quantity
unit_price
discount
amount
Item Types:
Consultation
Test
Package
Other

26. PAYMENTS
Table: payments
payment_id — PK
invoice_id — FK → invoices.invoice_id
payment_date
amount
payment_method
transaction_no
received_by — FK → users.user_id
notes
Payment Methods:
Cash
Card
Mobile Banking
Bank Transfer
Online Payment
Relationship:
Many Payments → One Invoice

INVENTORY & PURCHASE MANAGEMENT
27. INVENTORY_ITEMS
Table: inventory_items
item_id — PK
category_id
item_name
unit
current_stock
reorder_level
expiry_tracking
status
Examples:
Test Tube
Reagent
Gloves
Syringe
Chemicals

28. INVENTORY_STOCK_LOGS
Table: inventory_stock_logs
stock_log_id — PK
item_id — FK → inventory_items.item_id
log_type
quantity
reference_no
notes
created_by — FK → users.user_id
created_at
Log Types:
IN
OUT
Adjustment

29. SUPPLIERS
Table: suppliers
supplier_id — PK
supplier_name
contact_person
phone
email
address
status
Relationship:
One Supplier → Many Purchases

30. PURCHASES
Table: purchases
purchase_id — PK
supplier_id — FK → suppliers.supplier_id
purchase_date
invoice_no
total_amount
status
Relationship:
One Purchase → Many Purchase Items

31. PURCHASE_ITEMS
Table: purchase_items
purchase_item_id — PK
purchase_id — FK → purchases.purchase_id
item_id — FK → inventory_items.item_id
quantity
unit_price
total_price

EMPLOYEE MANAGEMENT
32. EMPLOYEES
Table: employees
employee_id — PK
user_id — FK → users.user_id (Optional)
branch_id — FK → branches.branch_id
name
designation
department_id — FK → departments.department_id
phone
email
join_date
salary
status

33. ATTENDANCE
Table: attendance
attendance_id — PK
employee_id — FK → employees.employee_id
attendance_date
check_in
check_out
status
Status:
Present
Absent
Leave

COMPLETE TEXT RELATIONSHIP OVERVIEW
BRANCH
 ├── USERS
 ├── DOCTORS
 ├── PATIENT_VISITS
 ├── APPOINTMENTS
 ├── TOKENS
 └── EMPLOYEES

ROLES
 └── USERS

PATIENTS
 ├── PATIENT_VISITS
 ├── PATIENT_HISTORY
 └── APPOINTMENTS

PATIENT_VISITS
 ├── DOCTOR_CONSULTATIONS
 ├── TEST_ORDERS
 └── INVOICES

DOCTORS
 ├── DOCTOR_SCHEDULE
 ├── APPOINTMENTS
 └── DOCTOR_CONSULTATIONS

DOCTOR_CONSULTATIONS
 └── PRESCRIBED_TESTS

TEST_CATEGORIES
 └── TESTS

DEPARTMENTS
 ├── TESTS
 ├── TOKENS
 └── EMPLOYEES

TESTS
 ├── PRESCRIBED_TESTS
 ├── TEST_ORDER_ITEMS
 └── PACKAGE_TESTS

TEST_PACKAGES
 └── PACKAGE_TESTS

TEST_ORDERS
 ├── TEST_ORDER_ITEMS
 └── REPORTS

TEST_ORDER_ITEMS
 └── SAMPLES

SAMPLES
 └── LAB_RESULTS

REPORTS
 └── REPORT_FILES

INVOICES
 ├── INVOICE_ITEMS
 └── PAYMENTS

SUPPLIERS
 └── PURCHASES
      └── PURCHASE_ITEMS
           └── INVENTORY_ITEMS

INVENTORY_ITEMS
 └── INVENTORY_STOCK_LOGS

EMPLOYEES
 └── ATTENDANCE
