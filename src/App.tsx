import { useEffect, useState } from "react";
import { getStoredUser, setStoredUser, clearToken, api } from "./data/api";
import Sidebar, { hasPageAccess } from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import DoctorPatients from "./pages/DoctorPatients";
import Appointments from "./pages/Appointments";
import Tokens from "./pages/Tokens";
import LabTests from "./pages/LabTests";
import Barcode from "./pages/Barcode";
import Laboratorian from "./pages/Laboratorian";
import Reports from "./pages/Reports";
import Billing from "./pages/Billing";
import PaymentReport from "./pages/PaymentReport";
import Inventory from "./pages/Inventory";
import Employees from "./pages/Employees";
import Corporate from "./pages/Corporate";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

export interface AppUser {
  user_id?: number;
  name: string;
  role?: string;
  role_name?: string;
  email: string;
  branch_id?: number;
  phone?: string;
  permissions?: string[];
}

type PageId = "dashboard" | "patients" | "doctors" | "doctorpatients" | "appointments" | "tokens" | "labtests" | "laboratorian" | "barcode" | "reports" | "billing" | "paymentreport" | "inventory" | "employees" | "corporate" | "notifications" | "analytics" | "settings";

const PAGE_PROPS: Record<PageId, { title: string; breadcrumb: string[] }> = {
  dashboard:     { title: "Dashboard", breadcrumb: ["Home", "Dashboard"] },
  patients:      { title: "CRM & Patient Management", breadcrumb: ["Home", "Patient Care", "Patients"] },
  doctors:       { title: "Doctor Management", breadcrumb: ["Home", "Patient Care", "Doctors"] },
  doctorpatients:{ title: "Doctor Workload", breadcrumb: ["Home", "Patient Care", "Doctor Workload"] },
  appointments:  { title: "Appointment Management", breadcrumb: ["Home", "Patient Care", "Appointments"] },
  tokens:        { title: "Token & Queue Management", breadcrumb: ["Home", "Patient Care", "Queue"] },
  labtests:      { title: "Laboratory Test Management", breadcrumb: ["Home", "Laboratory", "Tests"] },
  laboratorian:  { title: "Laboratorian", breadcrumb: ["Home", "Laboratory", "Laboratorian"] },
  barcode:       { title: "Barcode & Sample Management", breadcrumb: ["Home", "Laboratory", "Samples"] },
  reports:       { title: "Lab Report Management", breadcrumb: ["Home", "Laboratory", "Reports"] },
  billing:       { title: "Billing Management", breadcrumb: ["Home", "Finance", "Billing"] },
  paymentreport: { title: "Payment Report", breadcrumb: ["Home", "Finance", "Payment Report"] },
  inventory:     { title: "Inventory & Supplier Management", breadcrumb: ["Home", "Operations", "Inventory"] },
  employees:     { title: "Employee Management", breadcrumb: ["Home", "Operations", "Employees"] },
  corporate:     { title: "Corporate & Institutional Clients", breadcrumb: ["Home", "Operations", "Corporate"] },
  notifications: { title: "SMS & Notification System", breadcrumb: ["Home", "System", "Notifications"] },
  analytics:     { title: "Reports & Analytics", breadcrumb: ["Home", "System", "Analytics"] },
  settings:      { title: "Administration & Settings", breadcrumb: ["Home", "System", "Settings"] },
};

type PageComponent = React.ComponentType<{
  pageProps: { title: string; breadcrumb: string[] };
  user: AppUser & { role: string };
  onLogout: () => void;
  onUserUpdate: (user: AppUser) => void;
}>;

const PAGES: Record<PageId, PageComponent> = {
  dashboard:     (p) => <Dashboard {...p} />,
  patients:      (p) => <Patients {...p} />,
  doctors:       (p) => <Doctors {...p} />,
  doctorpatients:(p) => <DoctorPatients {...p} />,
  appointments:  (p) => <Appointments {...p} />,
  tokens:        (p) => <Tokens {...p} />,
  labtests:      (p) => <LabTests {...p} />,
  laboratorian:  (p) => <Laboratorian {...p} />,
  barcode:       (p) => <Barcode {...p} />,
  reports:       (p) => <Reports {...p} />,
  billing:       (p) => <Billing {...p} />,
  paymentreport: (p) => <PaymentReport {...p} />,
  inventory:     (p) => <Inventory {...p} />,
  employees:     (p) => <Employees {...p} />,
  corporate:     (p) => <Corporate {...p} />,
  notifications: (p) => <Notifications {...p} />,
  analytics:     (p) => <Analytics {...p} />,
  settings:      (p) => <Settings {...p} />,
};

export default function App() {
  const [user, setUser] = useState<AppUser | null>(() => getStoredUser());
  const [activePage, setActivePage] = useState<PageId>("dashboard");

  useEffect(() => {
    let cancelled = false;
    api.get<any>("/auth/me")
      .then((me) => {
        if (cancelled) return;
        const fresh = { ...(me as AppUser) };
        setUser(fresh);
        setStoredUser(fresh);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const handleLogin = (u: AppUser) => {
    setUser(u);
    setStoredUser(u);
  };

  const handleLogout = () => {
    clearToken();
    setStoredUser(null);
    setUser(null);
  };

  const handleUserUpdate = (u: AppUser) => {
    setUser(u);
    setStoredUser(u);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const role = user.role_name || user.role || "Super Admin";
  const safePage = hasPageAccess(activePage, role, user.permissions) ? activePage : "dashboard";
  const SafeComponent = PAGES[safePage];

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "#F8FAFC" }}>
      <Sidebar active={safePage} onNavigate={(id) => setActivePage(id as PageId)} userRole={role} permissions={user.permissions} />
      <div className="flex-1 overflow-hidden min-w-0">
        <SafeComponent pageProps={PAGE_PROPS[safePage]} user={{ ...user, role }} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
      </div>
    </div>
  );
}
