# MediCare DCMS — Diagnostic Center Management System

A full-stack web application for managing all operations of a diagnostic center — patients, appointments, lab tests, billing, inventory, and more.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [Database Schema](#5-database-schema)
6. [API Reference](#6-api-reference)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [User Roles & Permissions](#8-user-roles--permissions)
9. [Module Breakdown](#9-module-breakdown)
10. [Environment Variables](#10-environment-variables)
11. [Installation & Setup](#11-installation--setup)
12. [Deployment](#12-deployment)

---

## 1. Project Overview

MediCare DCMS digitizes and automates:

| Area | Features |
|------|----------|
| Patient Care | Registration, CRM, appointment booking, queue management |
| Laboratory | Test orders, sample collection, barcode tracking, result entry |
| Reports | Digital report generation, pathologist approval, PDF delivery |
| Finance | Invoicing, payments, due tracking, corporate billing |
| Operations | Inventory, employee management, supplier management |
| Analytics | Revenue reports, patient demographics, lab statistics |
| Notifications | SMS/email triggers for appointments, reports, payments |

---

## 2. Tech Stack

### Frontend (this repository)
| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| State | React `useState` / `useContext` |
| Routing | React state-based (client-side) |
| Fonts | Inter (UI), DM Mono (data) — Google Fonts |

### Recommended Backend
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 LTS |
| Framework | Express.js or NestJS |
| ORM | Prisma (recommended) or TypeORM |
| Database | PostgreSQL 15+ |
| Auth | JWT (access + refresh tokens) |
| File Storage | AWS S3 / MinIO (for report PDFs) |
| SMS Gateway | Twilio / SSL Commerz SMS (Bangladesh) |
| Email | Nodemailer + SMTP or SendGrid |
| Cache | Redis (queue, session, rate limiting) |
| Queue | Bull (background jobs: PDF generation, SMS) |
| Barcode | `jsbarcode` / `bwip-js` |

### Alternative Backend (Laravel/PHP)
| Layer | Technology |
|-------|-----------|
| Framework | Laravel 11 |
| ORM | Eloquent |
| Auth | Laravel Sanctum (API tokens) |
| Queue | Laravel Queues (Redis driver) |
| PDF | DomPDF / Snappy |

---

## 3. Frontend Architecture

```
src/
├── App.tsx                  # Root component — auth state, routing
├── main.tsx                 # React entry point
├── index.css                # Tailwind CSS v4 import + global tokens
│
├── components/
│   ├── Layout.tsx           # Page wrapper, Header (notifications, user menu)
│   └── Sidebar.tsx          # Collapsible sidebar navigation
│
├── pages/
│   ├── Login.tsx            # Sign In / Register Account
│   ├── Dashboard.tsx        # Overview with KPIs, charts, queue
│   ├── Patients.tsx         # CRM — patient list, registration modal
│   ├── Doctors.tsx          # Doctor profiles, schedules
│   ├── Appointments.tsx     # Booking calendar, status management
│   ├── Tokens.tsx           # Queue management with live display
│   ├── LabTests.tsx         # Test catalog + packages
│   ├── Barcode.tsx          # Sample tracking, scanner simulation
│   ├── Reports.tsx          # Report workflow (Draft→Released)
│   ├── Billing.tsx          # Invoice creation + management
│   ├── Payments.tsx         # Payment collection + due tracking
│   ├── Inventory.tsx        # Stock management + suppliers
│   ├── Employees.tsx        # Staff management + attendance
│   ├── Corporate.tsx        # Corporate client accounts
│   ├── Notifications.tsx    # SMS templates + trigger settings
│   ├── Analytics.tsx        # Revenue + patient + lab analytics
│   └── Settings.tsx         # System config, users, roles
│
└── data/
    └── mockData.ts          # Demo data (replace with API calls)
```

### Navigation Flow
```
Login Page
    │
    ▼ (auth success)
App Shell (Sidebar + Header)
    │
    ├── Dashboard
    ├── Patient Care Group ──► Patients / Doctors / Appointments / Tokens
    ├── Laboratory Group ─────► Lab Tests / Barcode / Reports
    ├── Finance Group ────────► Billing / Payments
    ├── Operations Group ─────► Inventory / Employees / Corporate
    └── System Group ─────────► Notifications / Analytics / Settings
```

### Replacing Mock Data with Real API Calls

Every page currently imports from `src/data/mockData.ts`. Replace these imports with API hooks:

```typescript
// Before (mock)
import { patients } from "../data/mockData";

// After (real API)
import { usePatients } from "../hooks/usePatients";
const { data: patients, loading, error } = usePatients();
```

Example API hook pattern:
```typescript
// src/hooks/usePatients.ts
import { useState, useEffect } from "react";
import { apiClient } from "../lib/apiClient";

export function usePatients(params?: { search?: string; page?: number }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/patients", { params }).then((res) => {
      setData(res.data.data);
      setLoading(false);
    });
  }, [params]);

  return { data, loading };
}
```

---

## 4. Backend Architecture

### Recommended Node.js + Express Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # PostgreSQL connection (Prisma)
│   │   ├── redis.ts             # Redis client
│   │   └── env.ts               # Environment validation (zod)
│   │
│   ├── middleware/
│   │   ├── auth.ts              # JWT verification
│   │   ├── rbac.ts              # Role-based access control
│   │   ├── rateLimiter.ts       # Redis-backed rate limiting
│   │   ├── upload.ts            # Multer + S3 upload
│   │   └── errorHandler.ts      # Global error handler
│   │
│   ├── modules/
│   │   ├── auth/                # login, logout, refresh, password reset
│   │   ├── patients/            # CRUD + visit history + search
│   │   ├── doctors/             # CRUD + schedule management
│   │   ├── appointments/        # Booking, rescheduling, status updates
│   │   ├── tokens/              # Queue generation, call next, transfer
│   │   ├── lab-tests/           # Test catalog + package management
│   │   ├── samples/             # Sample lifecycle + barcode generation
│   │   ├── reports/             # Result entry, approval workflow, PDF
│   │   ├── billing/             # Invoice creation + line items
│   │   ├── payments/            # Payment recording + due management
│   │   ├── inventory/           # Stock tracking + purchase orders
│   │   ├── employees/           # HR + attendance
│   │   ├── corporate/           # Corporate client accounts
│   │   ├── notifications/       # SMS + email sending + templates
│   │   ├── analytics/           # Reports + aggregation queries
│   │   └── settings/            # Branch config + user + roles
│   │
│   ├── jobs/
│   │   ├── generatePdf.job.ts   # Background PDF generation
│   │   ├── sendSms.job.ts       # Async SMS via Bull queue
│   │   └── dailyBackup.job.ts   # Scheduled DB backup
│   │
│   ├── prisma/
│   │   └── schema.prisma        # Database schema (see Section 5)
│   │
│   └── server.ts               # Express app bootstrap
│
├── .env
├── package.json
└── tsconfig.json
```

---

## 5. Database Schema

### Core Tables

#### `branches`
| Column | Type | Notes |
|--------|------|-------|
| branch_id | UUID PK | |
| branch_name | VARCHAR(100) | |
| code | VARCHAR(20) | Unique |
| address | TEXT | |
| phone | VARCHAR(20) | |
| email | VARCHAR(100) | |
| logo | TEXT | S3 URL |
| status | ENUM('active','inactive') | |
| created_at | TIMESTAMP | |

#### `roles`
| Column | Type | Notes |
|--------|------|-------|
| role_id | UUID PK | |
| role_name | VARCHAR(50) | Unique |
| description | TEXT | |
| permissions | JSONB | `{"patients.read": true, ...}` |
| status | BOOLEAN | |

#### `users`
| Column | Type | Notes |
|--------|------|-------|
| user_id | UUID PK | |
| branch_id | UUID FK → branches | |
| role_id | UUID FK → roles | |
| name | VARCHAR(100) | |
| email | VARCHAR(100) | Unique |
| phone | VARCHAR(20) | |
| password_hash | VARCHAR(255) | bcrypt |
| refresh_token | TEXT | Nullable |
| status | ENUM('active','inactive','pending') | |
| created_at | TIMESTAMP | |

#### `patients`
| Column | Type | Notes |
|--------|------|-------|
| patient_id | UUID PK | |
| patient_unique_id | VARCHAR(20) | e.g. PT-00001 |
| name | VARCHAR(100) | |
| father_name | VARCHAR(100) | |
| date_of_birth | DATE | |
| gender | ENUM('male','female','other') | |
| blood_group | VARCHAR(5) | |
| mobile | VARCHAR(20) | |
| email | VARCHAR(100) | Nullable |
| address | TEXT | |
| emergency_contact | VARCHAR(200) | |
| nid_no | VARCHAR(30) | Nullable |
| notes | TEXT | |
| created_at | TIMESTAMP | |

#### `doctors`
| Column | Type | Notes |
|--------|------|-------|
| doctor_id | UUID PK | |
| branch_id | UUID FK → branches | |
| name | VARCHAR(100) | |
| specialization | VARCHAR(100) | |
| degree | VARCHAR(200) | |
| bmdc_no | VARCHAR(30) | Unique |
| phone | VARCHAR(20) | |
| email | VARCHAR(100) | |
| consultation_fee | DECIMAL(10,2) | |
| status | ENUM('active','inactive') | |

#### `appointments`
| Column | Type | Notes |
|--------|------|-------|
| appointment_id | UUID PK | |
| branch_id | UUID FK | |
| patient_id | UUID FK → patients | |
| doctor_id | UUID FK → doctors | |
| appointment_date | DATE | |
| appointment_time | TIME | |
| token_no | INTEGER | |
| type | ENUM('walk-in','advance','online') | |
| status | ENUM('pending','confirmed','checked-in','completed','cancelled','no-show') | |
| notes | TEXT | |
| created_at | TIMESTAMP | |

#### `tokens`
| Column | Type | Notes |
|--------|------|-------|
| token_id | UUID PK | |
| branch_id | UUID FK | |
| department_id | UUID FK | |
| doctor_id | UUID FK | Nullable |
| appointment_id | UUID FK | Nullable |
| token_no | VARCHAR(10) | e.g. T-001 |
| token_type | ENUM('general','priority','emergency') | |
| status | ENUM('waiting','serving','completed','skipped','cancelled') | |
| created_at | TIMESTAMP | |

#### `tests`
| Column | Type | Notes |
|--------|------|-------|
| test_id | UUID PK | |
| category_id | UUID FK → test_categories | |
| department_id | UUID FK → departments | |
| test_name | VARCHAR(200) | |
| test_code | VARCHAR(20) | Unique |
| sample_type | VARCHAR(50) | |
| unit | VARCHAR(50) | |
| price | DECIMAL(10,2) | |
| reference_range | TEXT | |
| turnaround_time | VARCHAR(50) | |
| status | BOOLEAN | |

#### `samples`
| Column | Type | Notes |
|--------|------|-------|
| sample_id | UUID PK | |
| order_item_id | UUID FK | |
| sample_barcode | VARCHAR(50) | Unique |
| sample_type | VARCHAR(50) | |
| collection_date | TIMESTAMP | |
| collected_by | UUID FK → users | |
| received_by | UUID FK → users | Nullable |
| collection_status | ENUM('pending','collected','received','rejected') | |
| status | ENUM('pending','processing','completed') | |

#### `invoices`
| Column | Type | Notes |
|--------|------|-------|
| invoice_id | UUID PK | |
| visit_id | UUID FK | |
| invoice_no | VARCHAR(30) | Unique |
| invoice_date | TIMESTAMP | |
| subtotal | DECIMAL(12,2) | |
| discount | DECIMAL(12,2) | |
| vat_amount | DECIMAL(12,2) | |
| total_amount | DECIMAL(12,2) | |
| paid_amount | DECIMAL(12,2) | |
| due_amount | DECIMAL(12,2) | |
| status | ENUM('unpaid','partial','paid','refunded','cancelled') | |

---

## 6. API Reference

### Base URL
```
https://api.medicare-dcms.com/v1
```

### Authentication Headers
```
Authorization: Bearer <access_token>
X-Branch-ID: <branch_uuid>
```

---

### Auth Endpoints

#### `POST /auth/login`
```json
Request:
{
  "email": "admin@medicare.com",
  "password": "Admin@1234",
  "role": "Super Admin"
}

Response 200:
{
  "success": true,
  "data": {
    "user": {
      "user_id": "uuid",
      "name": "Admin User",
      "email": "admin@medicare.com",
      "role": "Super Admin",
      "branch_id": "uuid"
    },
    "access_token": "eyJhbGci...",
    "refresh_token": "eyJhbGci...",
    "expires_in": 900
  }
}
```

#### `POST /auth/refresh`
```json
Request:  { "refresh_token": "eyJhbGci..." }
Response: { "access_token": "...", "expires_in": 900 }
```

#### `POST /auth/logout`
```json
Request:  { "refresh_token": "eyJhbGci..." }
Response: { "success": true }
```

#### `POST /auth/register`
```json
Request:
{
  "name": "Jahangir Alam",
  "email": "jahangir@medicare.com",
  "phone": "01711-001001",
  "role": "Receptionist",
  "branch_id": "uuid",
  "password": "SecurePass@1"
}

Response 201:
{
  "success": true,
  "data": { "user_id": "uuid", "status": "pending" },
  "message": "Registration submitted. Awaiting admin approval."
}
```

#### `POST /auth/forgot-password`
```json
Request:  { "email": "user@example.com" }
Response: { "success": true, "message": "Password reset email sent." }
```

---

### Patient Endpoints

#### `GET /patients`
```
Query params:
  search    string   — name, mobile, patient_unique_id
  gender    string   — male | female | other
  blood     string   — A+, B-, O+, etc.
  page      number   — default 1
  limit     number   — default 20

Response 200:
{
  "success": true,
  "data": [ { ...patient } ],
  "meta": { "total": 847, "page": 1, "limit": 20, "pages": 43 }
}
```

#### `POST /patients`
```json
{
  "name": "Rahim Uddin",
  "date_of_birth": "1984-06-15",
  "gender": "male",
  "blood_group": "B+",
  "mobile": "01711-234567",
  "email": "rahim@gmail.com",
  "address": "Dhaka, Bangladesh",
  "emergency_contact": "Karim Uddin 01711-111111"
}
```

#### `GET /patients/:id` — Full patient profile
#### `PUT /patients/:id` — Update patient
#### `GET /patients/:id/visits` — Visit history
#### `GET /patients/:id/reports` — All reports
#### `GET /patients/:id/invoices` — Payment history

---

### Doctor Endpoints

#### `GET /doctors` — List all doctors (with schedule)
#### `POST /doctors` — Add doctor
#### `GET /doctors/:id` — Doctor profile
#### `PUT /doctors/:id` — Update doctor
#### `GET /doctors/:id/schedule` — Weekly schedule
#### `POST /doctors/:id/schedule` — Set availability
#### `GET /doctors/:id/appointments` — Doctor's appointments
#### `GET /doctors/:id/earnings` — Revenue breakdown

---

### Appointment Endpoints

#### `GET /appointments`
```
Query: date, doctor_id, patient_id, status, branch_id
```

#### `POST /appointments`
```json
{
  "patient_id": "uuid",
  "doctor_id": "uuid",
  "appointment_date": "2026-09-01",
  "appointment_time": "10:30",
  "type": "walk-in",
  "notes": ""
}
```

#### `PATCH /appointments/:id/status`
```json
{ "status": "confirmed" | "checked-in" | "completed" | "cancelled" | "no-show" }
```

#### `POST /appointments/:id/reschedule`
```json
{ "appointment_date": "2026-09-02", "appointment_time": "11:00" }
```

---

### Token / Queue Endpoints

#### `GET /tokens` — Active queue by branch/department
#### `POST /tokens` — Issue new token
#### `PATCH /tokens/:id/call` — Call next patient (sets status: serving)
#### `PATCH /tokens/:id/skip` — Skip token
#### `PATCH /tokens/:id/recall` — Re-call a skipped token
#### `PATCH /tokens/:id/transfer` — Transfer to another counter/department
#### `GET /tokens/queue-display` — Public display board data (no auth required)

---

### Lab Test Endpoints

#### `GET /tests` — All tests (filterable by category, department)
#### `POST /tests` — Create test
#### `PUT /tests/:id` — Update test pricing/reference range
#### `GET /test-packages` — All packages
#### `POST /test-packages` — Create package
#### `POST /test-orders` — Create test order for a patient visit
#### `GET /test-orders/:id` — Order details + items + samples

---

### Sample / Barcode Endpoints

#### `GET /samples` — All samples (by status, date, branch)
#### `POST /samples` — Register sample collection
#### `GET /samples/barcode/:code` — Lookup sample by barcode
#### `PATCH /samples/:id/status` — Update collection status
#### `POST /samples/:id/generate-barcode` — (Re)generate barcode label PDF

```json
Response (barcode lookup):
{
  "sample_id": "uuid",
  "barcode": "BC-2608310001",
  "patient": { "name": "Rahim Uddin", "id": "PT-00001" },
  "test": { "name": "CBC", "code": "CBC" },
  "status": "processing",
  "collected_at": "2026-08-31T08:30:00Z"
}
```

---

### Lab Report Endpoints

#### `GET /reports` — Report list (filterable by status, patient)
#### `POST /reports` — Create draft report
#### `PUT /reports/:id` — Update result values
#### `PATCH /reports/:id/verify` — Lab tech marks as verified
#### `PATCH /reports/:id/approve` — Pathologist approves + digital signature
#### `PATCH /reports/:id/release` — Release report to patient
#### `GET /reports/:id/pdf` — Download report as PDF (S3 signed URL)
#### `POST /reports/:id/send` — Send report link via SMS/email

---

### Billing & Invoice Endpoints

#### `GET /invoices` — List invoices (with filters)
#### `POST /invoices` — Create invoice

```json
Request:
{
  "visit_id": "uuid",
  "items": [
    { "type": "consultation", "item_id": "doctor_uuid", "quantity": 1, "discount": 0 },
    { "type": "test", "item_id": "test_uuid", "quantity": 1, "discount": 50 }
  ],
  "discount_percent": 5,
  "vat_percent": 0
}
```

#### `GET /invoices/:id` — Invoice detail + line items
#### `POST /invoices/:id/payment` — Record payment

```json
{
  "amount": 1150,
  "payment_method": "bkash",
  "transaction_no": "TXN123456"
}
```

#### `GET /invoices/:id/pdf` — Download invoice PDF
#### `PATCH /invoices/:id/cancel` — Cancel invoice (requires authorization)
#### `POST /invoices/:id/refund` — Refund invoice

---

### Payment & Due Endpoints

#### `GET /payments` — Payment history (with date range filters)
#### `GET /payments/dues` — All patients with outstanding balances
#### `GET /payments/summary` — Daily/monthly totals by method

---

### Inventory Endpoints

#### `GET /inventory` — Stock list
#### `POST /inventory` — Add item
#### `PUT /inventory/:id` — Update item
#### `POST /inventory/:id/stock-in` — Receive stock
#### `POST /inventory/:id/stock-out` — Log usage
#### `GET /inventory/low-stock` — Items below reorder level
#### `GET /inventory/expiring` — Items expiring in next 30 days
#### `GET /suppliers` — Supplier list
#### `POST /purchases` — Create purchase order

---

### Employee Endpoints

#### `GET /employees` — Staff list
#### `POST /employees` — Add employee
#### `GET /employees/:id` — Employee profile
#### `POST /attendance` — Mark attendance
#### `GET /attendance` — Attendance records (by month, employee)

---

### Analytics Endpoints

#### `GET /analytics/revenue`
```
Query: period=daily|monthly|yearly, from=YYYY-MM-DD, to=YYYY-MM-DD
Response: { dates[], revenues[], patients[] }
```

#### `GET /analytics/patients` — Demographics, new vs returning
#### `GET /analytics/tests` — Test-wise volume + revenue
#### `GET /analytics/doctors` — Doctor-wise earnings + patient count
#### `GET /analytics/inventory` — Stock consumption report

---

### Notification Endpoints

#### `GET /notifications/templates` — SMS/email template list
#### `POST /notifications/templates` — Create template
#### `PUT /notifications/templates/:id` — Update template
#### `POST /notifications/send` — Manually trigger notification
#### `GET /notifications/log` — Sent notification history

---

### Settings Endpoints

#### `GET /settings/branch` — Branch configuration
#### `PUT /settings/branch` — Update branch info
#### `GET /users` — All system users
#### `POST /users` — Create user (admin only)
#### `PATCH /users/:id` — Update user / disable
#### `GET /roles` — Role list with permissions
#### `PUT /roles/:id` — Update role permissions

---

## 7. Authentication & Authorization

### JWT Flow

```
1. POST /auth/login  →  access_token (15min) + refresh_token (7d)
2. All API calls     →  Authorization: Bearer <access_token>
3. access_token expires  →  POST /auth/refresh with refresh_token
4. POST /auth/logout     →  invalidates refresh_token in DB
```

### Password Security
- Hash algorithm: `bcrypt` with cost factor 12
- Minimum password: 8 chars, 1 uppercase, 1 number, 1 special char
- Failed attempts: lock after 5 attempts for 15 minutes

### Session Management
- Access token TTL: 15 minutes
- Refresh token TTL: 7 days (rolling)
- Store refresh tokens in DB + Redis for fast invalidation
- All tokens invalidated on password change

---

## 8. User Roles & Permissions

| Role | Key Permissions |
|------|----------------|
| **Super Admin** | Full system access, branch management, user management |
| **Branch Admin** | Branch-scoped full access, employee management |
| **Receptionist** | Patient registration, appointments, invoice creation |
| **Doctor** | View appointments, add consultation notes, view reports |
| **Lab Technician** | View test orders, enter results, update sample status |
| **Pathologist** | Review results, approve/reject reports, digital signature |
| **Cashier** | Payment collection, invoice management, financial reports |
| **Sample Collector** | View collection requests, scan barcodes, update status |
| **Patient** | View own appointments, download reports, view invoices |

### Permission Format (stored as JSONB)
```json
{
  "patients.read": true,
  "patients.create": true,
  "patients.update": true,
  "patients.delete": false,
  "invoices.read": true,
  "invoices.create": true,
  "invoices.cancel": false,
  "reports.approve": false,
  "settings.read": false,
  "analytics.read": true
}
```

---

## 9. Module Breakdown

### Workflow: Patient Lab Test (End-to-End)
```
1. Receptionist registers patient        POST /patients
2. Receptionist creates test order       POST /test-orders
3. Cashier creates invoice               POST /invoices
4. Cashier records payment               POST /invoices/:id/payment
5. System generates barcode              Auto-triggered on payment
6. Sample Collector scans barcode        GET /samples/barcode/:code
7. Sample Collector updates status       PATCH /samples/:id/status → collected
8. Lab receives sample                   PATCH /samples/:id/status → received
9. Lab Technician enters results         PUT /reports/:id
10. Lab Tech verifies results            PATCH /reports/:id/verify
11. Pathologist approves report          PATCH /reports/:id/approve
12. Report released                      PATCH /reports/:id/release
13. SMS sent to patient                  Auto-triggered on release
14. Patient downloads PDF                GET /reports/:id/pdf
```

### Barcode Generation
- Triggered automatically when invoice payment is recorded
- Format: `BC-{YYYYMMDD}{5-digit-seq}` (e.g. `BC-2608310001`)
- Barcode type: Code 128 (scannable by standard barcode scanners)
- Label includes: patient name, test name, collection date, barcode

### SMS Gateway Integration (Bangladesh)
```javascript
// Example using SSL Commerz SMS API
const sendSms = async (phone: string, message: string) => {
  await axios.post("https://sms.sslcommerz.com/smsapi", {
    user: process.env.SMS_USER,
    pass: process.env.SMS_PASS,
    sms: message,
    to: phone,
    port: "1",
    replayto: "MEDICARE"
  });
};
```

### PDF Report Generation
```javascript
// Using puppeteer for high-quality PDF
const generateReportPdf = async (reportId: string) => {
  const report = await getReportData(reportId);
  const html = renderReportHtml(report); // Handlebars template
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const pdf = await page.pdf({ format: "A4" });
  await uploadToS3(`reports/${reportId}.pdf`, pdf);
  return getS3SignedUrl(`reports/${reportId}.pdf`);
};
```

---

## 10. Environment Variables

### Backend `.env`
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/medicare_dcms"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# AWS S3 (for report PDFs, profile images)
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="ap-southeast-1"
AWS_S3_BUCKET="medicare-dcms-files"

# SMS (Bangladesh — SSL Commerz or similar)
SMS_USER="your_sms_user"
SMS_PASS="your_sms_pass"
SMS_SENDER_ID="MEDICARE"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="noreply@medicare.com"
SMTP_PASS="app-password"

# App
NODE_ENV="production"
PORT=3000
FRONTEND_URL="https://app.medicare-dcms.com"
API_URL="https://api.medicare-dcms.com"

# Bcrypt
BCRYPT_ROUNDS=12
```

### Frontend `.env`
```env
VITE_API_URL="https://api.medicare-dcms.com/v1"
VITE_APP_NAME="MediCare DCMS"
VITE_BRANCH_NAME="Dhaka Main"
```

---

## 11. Installation & Setup

### Prerequisites
- Node.js 20 LTS
- PostgreSQL 15+
- Redis 7+
- pnpm 9+

### Frontend Setup
```bash
# Install dependencies
pnpm install

# Start development server (already running on $PORT in Figma Make)
pnpm dev

# Type check
npx tsc --noEmit

# Build for production
pnpm build
```

### Backend Setup (Node.js)
```bash
# Clone and install
git clone https://github.com/your-org/medicare-dcms-backend
cd medicare-dcms-backend
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your values

# Database migrations
npx prisma migrate dev
npx prisma db seed    # Seeds demo data

# Start development
pnpm dev

# Start production
pnpm build && pnpm start
```

### Database Seed Data
```bash
# Creates:
# - 1 Super Admin user (admin@medicare.com / Admin@1234)
# - 1 Branch (Dhaka Main)
# - 5 Doctors
# - 8 Sample Patients
# - All test categories and common tests
# - Demo invoices and reports
npx prisma db seed
```

---

## 12. Deployment

### Docker Compose (Recommended)
```yaml
# docker-compose.yml
version: "3.9"
services:
  frontend:
    build: ./frontend
    ports: ["80:80"]
    environment:
      VITE_API_URL: http://backend:3000/v1

  backend:
    build: ./backend
    ports: ["3000:3000"]
    env_file: .env
    depends_on: [postgres, redis]

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: medicare_dcms
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (Let's Encrypt / AWS ACM)
- [ ] Configure CORS to allow only frontend domain
- [ ] Set up daily PostgreSQL backup (pg_dump to S3)
- [ ] Enable Redis persistence (AOF mode)
- [ ] Set rate limiting on `/auth/login` (5 req/min per IP)
- [ ] Configure CDN for static assets (CloudFront/Cloudflare)
- [ ] Set up monitoring (Datadog / Sentry / PM2)
- [ ] Enable audit logging for all write operations
- [ ] Test PDF generation in production environment

---

## API Error Format

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Mobile number is required",
    "field": "mobile",
    "status": 422
  }
}
```

### Common Error Codes
| Code | HTTP | Meaning |
|------|------|---------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient role permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Request body validation failed |
| `CONFLICT` | 409 | Duplicate record (e.g. duplicate patient mobile) |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Pagination Format

All list endpoints return paginated responses:
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 847,
    "page": 1,
    "limit": 20,
    "pages": 43,
    "has_next": true,
    "has_prev": false
  }
}
```

---

*MediCare DCMS — Built with React + Vite + Tailwind CSS v4 · Backend: Node.js + PostgreSQL*
# dcms-app
