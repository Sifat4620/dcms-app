import { useEffect, useState } from "react";
import Layout, { Card, Btn, Badge } from "../components/Layout";
import { api } from "../data/api";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
  onUserUpdate: (user: any) => void;
}

const TABS = ["Branch", "Users", "Roles", "Test Config", "System"];

const ROLES = [
  { name: "Super Admin", permissions: 42, users: 1, color: "#8B5CF6" },
  { name: "Branch Admin", permissions: 34, users: 0, color: "#0EA5E9" },
  { name: "Receptionist", permissions: 12, users: 1, color: "#10B981" },
  { name: "Doctor", permissions: 8, users: 5, color: "#F59E0B" },
  { name: "Lab Technician", permissions: 10, users: 2, color: "#06B6D4" },
  { name: "Pathologist", permissions: 11, users: 0, color: "#3B82F6" },
  { name: "Cashier", permissions: 9, users: 1, color: "#EC4899" },
  { name: "Sample Collector", permissions: 6, users: 1, color: "#F97316" },
  { name: "Patient", permissions: 4, users: 0, color: "#94A3B8" },
];

const MAX_PERMISSIONS = 42;

export default function Settings({ pageProps, user, onLogout, onUserUpdate }: PageProps) {
  const [tab, setTab] = useState("Branch");
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.get<any>("/admin/users").then(setUsers).catch(() => {});
  }, []);

  return (
    <Layout
      title={pageProps.title}
      subtitle="System configuration, users, and access control"
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      onUserUpdate={onUserUpdate}
    >
      <div className="space-y-4">
        {/* Tab bar */}
        <div className="flex gap-1 p-1 bg-white rounded-lg border border-slate-200 w-fit">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === t ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Branch" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="text-xs font-semibold text-slate-800 mb-4">Branch Information</h3>
              <div className="space-y-3">
                {[
                  { label: "Branch Name", value: "MediCare Diagnostic Center - Dhaka Main" },
                  { label: "Branch Code", value: "MCB-001" },
                  { label: "Address", value: "123 Hospital Road, Dhaka-1205, Bangladesh" },
                  { label: "Phone", value: "+88-02-9XXXXXX" },
                  { label: "Email", value: "dhaka@medicare.com" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">{f.label}</label>
                    <input
                      defaultValue={f.value}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400"
                    />
                  </div>
                ))}
                <Btn>Save Branch Info</Btn>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-xs font-semibold text-slate-800 mb-4">System Configuration</h3>
              <div className="space-y-3">
                {[
                  { label: "VAT Rate (%)", value: "0" },
                  { label: "Invoice Prefix", value: "INV-" },
                  { label: "Patient ID Prefix", value: "PT-" },
                  { label: "Report Footer Text", value: "Results are for diagnostic purposes only." },
                  { label: "SMS Gateway API Key", value: "***-***-***-hidden" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">{f.label}</label>
                    <input
                      defaultValue={f.value}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400"
                    />
                  </div>
                ))}
                <Btn>Save Settings</Btn>
              </div>
            </Card>
          </div>
        )}

        {tab === "Users" && (
          <Card>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-800">System Users</h3>
              <Btn>+ Add User</Btn>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["User ID", "Name", "Email", "Role", "Branch", "Last Login", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.user_id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500">USR-{u.user_id}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-[10px] font-bold">
                            {(u.name || "?").split(" ").map((n: any) => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="font-medium text-slate-800">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">{u.email}</td>
                      <td className="px-4 py-2.5"><Badge label={u.role_name} color={u.role_name === "Super Admin" ? "purple" : "blue"} /></td>
                      <td className="px-4 py-2.5 text-slate-600">{u.branch_name || "All"}</td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-slate-400">—</td>
                      <td className="px-4 py-2.5"><Badge label={u.status} color={u.status === "active" ? "green" : "gray"} /></td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1">
                          <Btn size="xs" variant="secondary">Edit</Btn>
                          <Btn size="xs" variant="danger">Disable</Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td className="px-4 py-8 text-center text-slate-400" colSpan={8}>No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === "Roles" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ROLES.map((role) => {
              const pct = Math.round((role.permissions / MAX_PERMISSIONS) * 100);
              return (
                <Card key={role.name} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-900">{role.name}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{role.users} user{role.users !== 1 ? "s" : ""} assigned</p>
                    </div>
                    <Btn size="xs" variant="secondary">Edit</Btn>
                  </div>
                  {/* Improved permission bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${pct}%`, background: role.color }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-[10px] text-slate-400">{role.permissions}/{MAX_PERMISSIONS} permissions</div>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: role.color }}
                    >
                      {pct}%
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {tab === "Test Config" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="text-xs font-semibold text-slate-800 mb-3">Departments</h3>
              <div className="space-y-2">
                {["Pathology", "Hematology", "Biochemistry", "Radiology", "Cardiology", "Microbiology"].map((d) => (
                  <div key={d} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-md">
                    <span className="text-xs text-slate-700">{d}</span>
                    <div className="flex gap-1">
                      <Btn size="xs" variant="ghost">Edit</Btn>
                    </div>
                  </div>
                ))}
                <Btn size="xs" variant="secondary">+ Add Department</Btn>
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="text-xs font-semibold text-slate-800 mb-3">Test Categories</h3>
              <div className="space-y-2">
                {["Hematology", "Biochemistry", "Immunology", "Microbiology", "Pathology", "Radiology", "Cardiology"].map((c) => (
                  <div key={c} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-md">
                    <span className="text-xs text-slate-700">{c}</span>
                    <Btn size="xs" variant="ghost">Edit</Btn>
                  </div>
                ))}
                <Btn size="xs" variant="secondary">+ Add Category</Btn>
              </div>
            </Card>
          </div>
        )}

        {tab === "System" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="text-xs font-semibold text-slate-800 mb-3">Backup & Security</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div>
                    <div className="text-xs font-medium text-emerald-800">Last Backup</div>
                    <div className="text-[11px] text-emerald-600 font-mono">2026-08-31 02:00 AM</div>
                  </div>
                  <Badge label="Success" color="green" />
                </div>
                <Btn variant="secondary">Manual Backup</Btn>
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-xs font-semibold text-slate-700 mb-2">Security Settings</div>
                  {["Two-Factor Authentication", "Session Timeout (30 min)", "Audit Logging", "IP Restriction"].map((s) => (
                    <div key={s} className="flex items-center justify-between py-2 text-[11px]">
                      <span className="text-slate-600">{s}</span>
                      <div className="w-8 h-4 rounded-full bg-sky-500 relative">
                        <div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-white shadow" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-xs font-semibold text-slate-800 mb-3">System Information</h3>
              <div className="space-y-2 text-[11px]">
                {[
                  { label: "System Version", value: "DCMS v2.0.1" },
                  { label: "Database", value: "PostgreSQL 15.2" },
                  { label: "Last Update", value: "2026-08-15" },
                  { label: "Active Branch", value: "Dhaka Main" },
                  { label: "Logged In Users", value: "3 active sessions" },
                  { label: "Server Status", value: "Online" },
                ].map((info) => (
                  <div key={info.label} className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-500">{info.label}</span>
                    <span className={`font-mono font-medium ${info.value === "Online" ? "text-emerald-600" : "text-slate-700"}`}>{info.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
