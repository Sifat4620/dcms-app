export const PERMISSION_GROUPS = [
  {
    group: "Dashboard",
    permissions: [
      { key: "dashboard.view", label: "View Dashboard" },
    ],
  },
  {
    group: "Patient Care",
    permissions: [
      { key: "patients.view", label: "View Patients" },
      { key: "patients.create", label: "Add Patient" },
      { key: "patients.edit", label: "Edit Patient" },
      { key: "patients.delete", label: "Delete Patient" },
      { key: "doctors.view", label: "View Doctors" },
      { key: "doctors.manage", label: "Manage Doctors" },
      { key: "doctorworkload.view", label: "View Doctor Workload" },
      { key: "appointments.view", label: "View Appointments" },
      { key: "appointments.manage", label: "Manage Appointments" },
      { key: "tokens.view", label: "View Tokens & Queue" },
      { key: "tokens.manage", label: "Manage Tokens" },
    ],
  },
  {
    group: "Laboratory",
    permissions: [
      { key: "labtests.view", label: "View Lab Tests" },
      { key: "labtests.manage", label: "Manage Lab Tests" },
      { key: "laboratorian.view", label: "View Laboratorian" },
      { key: "samples.view", label: "View Barcode & Samples" },
      { key: "samples.manage", label: "Manage Samples" },
      { key: "samples.collect", label: "Collect Samples" },
      { key: "results.enter", label: "Enter Results" },
      { key: "reports.view", label: "View Lab Reports" },
      { key: "reports.manage", label: "Manage Reports" },
      { key: "reports.approve", label: "Approve Reports" },
    ],
  },
  {
    group: "Finance",
    permissions: [
      { key: "billing.view", label: "View Billing" },
      { key: "billing.create", label: "Create Invoices" },
      { key: "billing.pay", label: "Receive Payments" },
      { key: "billing.discount", label: "Apply Discounts" },
      { key: "paymentreport.view", label: "View Payment Report" },
    ],
  },
  {
    group: "Operations",
    permissions: [
      { key: "inventory.view", label: "View Inventory" },
      { key: "inventory.manage", label: "Manage Inventory" },
      { key: "employees.view", label: "View Employees" },
      { key: "employees.manage", label: "Manage Employees" },
      { key: "corporate.view", label: "View Corporate Clients" },
      { key: "corporate.manage", label: "Manage Corporate Clients" },
    ],
  },
  {
    group: "System",
    permissions: [
      { key: "notifications.view", label: "View Notifications" },
      { key: "notifications.send", label: "Send Notifications" },
      { key: "analytics.view", label: "View Analytics" },
      { key: "settings.users", label: "Manage Users" },
      { key: "settings.roles", label: "Manage Roles" },
      { key: "settings.branch", label: "Manage Branch Settings" },
      { key: "settings.system", label: "Manage System Settings" },
    ],
  },
];

export const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap((g) =>
  g.permissions.map((p) => p.key)
);

export default function defaultPermissionsFor(roleName) {
  const full = [...ALL_PERMISSION_KEYS];
  switch (roleName) {
    case "Super Admin":
      return full;
    case "Branch Admin":
      return full.filter((k) => !["settings.roles", "settings.system"].includes(k));
    case "Receptionist":
      return [
        "dashboard.view", "patients.view", "patients.create", "patients.edit",
        "doctors.view", "appointments.view", "appointments.manage",
        "tokens.view", "tokens.manage", "billing.view", "billing.create",
        "corporate.view",
      ];
    case "Doctor":
      return [
        "dashboard.view", "patients.view", "doctors.view",
        "doctorworkload.view", "appointments.view", "appointments.manage",
        "reports.view",
      ];
    case "Lab Technician":
      return [
        "dashboard.view", "labtests.view", "samples.view", "samples.manage",
        "samples.collect", "results.enter", "reports.view",
      ];
    case "Pathologist":
      return [
        "dashboard.view", "labtests.view", "reports.view", "reports.manage",
        "reports.approve", "results.enter",
      ];
    case "Cashier":
      return [
        "dashboard.view", "billing.view", "billing.create", "billing.pay",
        "paymentreport.view", "inventory.view",
      ];
    case "Sample Collector":
      return [
        "dashboard.view", "samples.view", "samples.manage", "samples.collect",
      ];
    case "Patient":
      return ["dashboard.view", "reports.view"];
    default:
      return Array.from(new Set(full.slice(0, Math.floor(full.length / 2))));
  }
}

export function parsePermissions(raw) {
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
