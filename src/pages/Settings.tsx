import { useEffect, useMemo, useState } from "react";
import Layout, { Card, Btn, Badge, Field, Modal, Input, SearchBar } from "../components/Layout";
import { api } from "../data/api";
import { PERMISSION_GROUPS, ALL_PERMISSION_KEYS, TOTAL_PERMISSIONS } from "../data/permissions";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string; user_id?: number };
  onLogout: () => void;
  onUserUpdate: (user: any) => void;
}

const TABS = ["Branch", "Users", "Roles"];

const ROLE_COLORS: Record<string, string> = {
  "Super Admin": "#8B5CF6",
  "Branch Admin": "#0EA5E9",
  Receptionist: "#10B981",
  Doctor: "#F59E0B",
  "Lab Technician": "#06B6D4",
  Pathologist: "#3B82F6",
  Cashier: "#EC4899",
  "Sample Collector": "#F97316",
  Patient: "#94A3B8",
};

const roleColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ["#8B5CF6", "#0EA5E9", "#10B981", "#F59E0B", "#06B6D4", "#EC4899", "#F97316", "#3B82F6"];
  return ROLE_COLORS[name] || colors[Math.abs(hash) % colors.length];
};

const parsePerms = (raw: any): string[] => {
  if (Array.isArray(raw)) return raw;
  try {
    const p = JSON.parse(raw || "[]");
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
};

const fmtTime = (v: string | null | undefined) => {
  if (!v) return "—";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const EMPTY_USER = {
  user_id: null as number | null,
  name: "",
  email: "",
  phone: "",
  password: "",
  confirm: "",
  role_id: null as number | null,
  branch_id: null as number | null,
  isNew: true as boolean,
};

export default function Settings({ pageProps, user, onLogout, onUserUpdate }: PageProps) {
  const [tab, setTab] = useState("Users");
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  const [branch, setBranch] = useState<any>(null);
  const [branchForm, setBranchForm] = useState({ branch_name: "", code: "", address: "", phone: "", email: "" });
  const [logo, setLogo] = useState<string | null>(null);
  const [branchMsg, setBranchMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [branchSaving, setBranchSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [userModal, setUserModal] = useState(false);
  const [userForm, setUserForm] = useState(EMPTY_USER);
  const [userMsg, setUserMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [userSaving, setUserSaving] = useState(false);

  const [roleModal, setRoleModal] = useState(false);
  const [roleForm, setRoleForm] = useState({ role_id: null as number | null, role_name: "", description: "", isNew: true, perms: [] as string[] });
  const [roleMsg, setRoleMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [roleSaving, setRoleSaving] = useState(false);

  const [flash, setFlash] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadAll = () => {
    api.get<any>("/admin/users").then(setUsers).catch(() => {});
    api.get<any>("/admin/roles").then((rs) => setRoles(Array.isArray(rs) ? rs : [])).catch(() => {});
    api.get<any>("/admin/branches").then((bs) => {
      setBranches(Array.isArray(bs) ? bs : []);
      const b = Array.isArray(bs) ? bs[0] : null;
      if (b && !branch) {
        setBranch(b);
        setLogo(b.logo || null);
        setBranchForm({ branch_name: b.branch_name, code: b.code, address: b.address || "", phone: b.phone || "", email: b.email || "" });
      }
    }).catch(() => {});
    api.get<any>("/auth/me").then((me) => onUserUpdate(me)).catch(() => {});
  };

  useEffect(() => {
    loadAll();
  }, []);

  const onLogoFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const saveBranch = async () => {
    setBranchSaving(true);
    setBranchMsg(null);
    try {
      const saved = await api.put<any>(`/admin/branches/${branch.branch_id}`, { ...branchForm, logo });
      setBranch(saved);
      setBranchMsg({ type: "success", text: "Branch info saved. Logo will appear on invoices." });
    } catch (e: any) {
      setBranchMsg({ type: "error", text: e.message });
    } finally {
      setBranchSaving(false);
    }
  };

  /* ── Users ───────────────────────────────────── */
  const openAddUser = () => {
    setUserForm({ ...EMPTY_USER, isNew: true });
    setUserMsg(null);
    setUserModal(true);
  };

  const openEditUser = (u: any) => {
    setUserForm({
      user_id: u.user_id,
      name: u.name,
      email: u.email,
      phone: u.phone || "",
      password: "",
      confirm: "",
      role_id: u.role_id ?? null,
      branch_id: u.branch_id ?? null,
      isNew: false,
    });
    setUserMsg(null);
    setUserModal(true);
  };

  const saveUser = async () => {
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.role_id) {
      setUserMsg({ type: "error", text: "Name, email and role are required" });
      return;
    }
    if (userForm.isNew) {
      if (!userForm.password) {
        setUserMsg({ type: "error", text: "A default password is required for a new user" });
        return;
      }
      if (userForm.password.length < 6) {
        setUserMsg({ type: "error", text: "Password must be at least 6 characters" });
        return;
      }
      if (userForm.password !== userForm.confirm) {
        setUserMsg({ type: "error", text: "Passwords do not match" });
        return;
      }
    } else if (userForm.password && userForm.password !== userForm.confirm) {
      setUserMsg({ type: "error", text: "Passwords do not match" });
      return;
    } else if (userForm.password && userForm.password.length < 6) {
      setUserMsg({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    setUserSaving(true);
    setUserMsg(null);
    try {
      if (userForm.isNew) {
        await api.post("/admin/users", {
          name: userForm.name,
          email: userForm.email,
          phone: userForm.phone,
          role_id: userForm.role_id,
          branch_id: userForm.branch_id || undefined,
          password: userForm.password,
        });
      } else {
        const body: any = { name: userForm.name, email: userForm.email, phone: userForm.phone, role_id: userForm.role_id, branch_id: userForm.branch_id || undefined };
        if (userForm.password) body.password = userForm.password;
        await api.put(`/admin/users/${userForm.user_id}`, body);
      }
      setUserMsg({ type: "success", text: userForm.isNew ? "User created successfully" : "User updated successfully" });
      loadAll();
      setTimeout(() => setUserModal(false), 600);
    } catch (e: any) {
      setUserMsg({ type: "error", text: e.message });
    } finally {
      setUserSaving(false);
    }
  };

  const toggleUserStatus = async (u: any) => {
    const newStatus = u.status === "active" ? "inactive" : "active";
    try {
      await api.put(`/admin/users/${u.user_id}`, { status: newStatus });
      setFlash({ type: "success", text: `${u.name} is now ${newStatus}` });
      loadAll();
    } catch (e: any) {
      setFlash({ type: "error", text: e.message });
    }
  };

  const deleteUser = async (u: any) => {
    if (!window.confirm(`Delete user ${u.name}? This cannot be undone.`)) return;
    try {
      await api.del(`/admin/users/${u.user_id}`);
      setFlash({ type: "success", text: `${u.name} deleted` });
      loadAll();
    } catch (e: any) {
      setFlash({ type: "error", text: e.message });
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.trim().toLowerCase();
      const matchQ = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role_name?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || u.status === statusFilter;
      return matchQ && matchStatus;
    });
  }, [users, search, statusFilter]);

  /* ── Roles ───────────────────────────────────── */
  const openAddRole = () => {
    setRoleForm({ role_id: null, role_name: "", description: "", isNew: true, perms: [] });
    setRoleMsg(null);
    setRoleModal(true);
  };

  const openEditRole = (r: any) => {
    setRoleForm({
      role_id: r.role_id,
      role_name: r.role_name,
      description: r.description || "",
      isNew: false,
      perms: parsePerms(r.permissions),
    });
    setRoleMsg(null);
    setRoleModal(true);
  };

  const togglePerm = (key: string) => {
    setRoleForm((f) => ({
      ...f,
      perms: f.perms.includes(key) ? f.perms.filter((k) => k !== key) : [...f.perms, key],
    }));
  };

  const saveRole = async () => {
    if (!roleForm.role_name.trim()) {
      setRoleMsg({ type: "error", text: "Role name is required" });
      return;
    }
    setRoleSaving(true);
    setRoleMsg(null);
    try {
      if (roleForm.isNew) {
        await api.post("/admin/roles", { role_name: roleForm.role_name, description: roleForm.description, permissions: roleForm.perms });
      } else {
        await api.put(`/admin/roles/${roleForm.role_id}`, { role_name: roleForm.role_name, description: roleForm.description, permissions: roleForm.perms });
      }
      setRoleMsg({ type: "success", text: roleForm.isNew ? "Role created successfully" : "Role updated successfully" });
      loadAll();
      setTimeout(() => setRoleModal(false), 600);
    } catch (e: any) {
      setRoleMsg({ type: "error", text: e.message });
    } finally {
      setRoleSaving(false);
    }
  };

  const deleteRole = async (r: any) => {
    if (!window.confirm(`Delete role "${r.role_name}"?`)) return;
    try {
      await api.del(`/admin/roles/${r.role_id}`);
      setFlash({ type: "success", text: `Role "${r.role_name}" deleted` });
      loadAll();
    } catch (e: any) {
      setFlash({ type: "error", text: e.message });
    }
  };

  const inputCls = "w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400";

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
        {flash && (
          <div className={`text-xs px-3 py-2 rounded-lg ${flash.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {flash.text}
          </div>
        )}

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
                <Field label="Invoice Logo">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                      {logo ? (
                        <img src={logo} alt="logo" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-400">No logo</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file" accept="image/*"
                        className="block w-full text-[11px] text-slate-500 file:mr-2 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-sky-50 file:text-sky-700 file:text-xs file:font-semibold hover:file:bg-sky-100"
                        onChange={(e) => e.target.files?.[0] && onLogoFile(e.target.files[0])}
                      />
                      <div className="text-[10px] text-slate-400 mt-1">This logo appears on printed invoices.</div>
                    </div>
                  </div>
                </Field>
                <Field label="Branch Name">
                  <input className={inputCls} value={branchForm.branch_name} onChange={(e) => setBranchForm({ ...branchForm, branch_name: e.target.value })} />
                </Field>
                <Field label="Branch Code">
                  <input className={inputCls} value={branchForm.code} onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value })} />
                </Field>
                <Field label="Address">
                  <input className={inputCls} value={branchForm.address} onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })} />
                </Field>
                <Field label="Phone">
                  <input className={inputCls} value={branchForm.phone} onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })} />
                </Field>
                <Field label="Email">
                  <input className={inputCls} value={branchForm.email} onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })} />
                </Field>
                {branchMsg && (
                  <div className={`text-xs px-3 py-2 rounded-lg ${branchMsg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{branchMsg.text}</div>
                )}
                <Btn onClick={saveBranch} disabled={branchSaving}>{branchSaving ? "Saving..." : "Save Branch Info"}</Btn>
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
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">{f.label}</label>
                    <input className={inputCls} defaultValue={f.value} />
                  </div>
                ))}
                <Btn>Save Settings</Btn>
              </div>
            </Card>
          </div>
        )}

        {tab === "Users" && (
          <Card>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 gap-3 flex-wrap">
              <h3 className="text-xs font-semibold text-slate-800">System Users ({filteredUsers.length})</h3>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {["all", "active", "inactive"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-2.5 py-1 text-[11px] rounded-md capitalize transition-colors ${statusFilter === s ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <SearchBar placeholder="Search users..." value={search} onChange={setSearch} />
                <Btn onClick={openAddUser}>+ Add User</Btn>
              </div>
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
                  {filteredUsers.map((u) => (
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
                      <td className="px-4 py-2.5">
                        <Badge
                          label={u.role_name}
                          color={u.role_name === "Super Admin" ? "purple" : u.role_name === "Doctor" ? "orange" : "blue"}
                        />
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">{u.branch_name || "All"}</td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-slate-400">{fmtTime(u.last_login)}</td>
                      <td className="px-4 py-2.5">
                        <Badge label={u.status} color={u.status === "active" ? "green" : "gray"} />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1">
                          <Btn size="xs" variant="secondary" onClick={() => openEditUser(u)}>Edit</Btn>
                          <Btn size="xs" variant={u.status === "active" ? "danger" : "primary"} onClick={() => toggleUserStatus(u)}>
                            {u.status === "active" ? "Disable" : "Enable"}
                          </Btn>
                          {Number(u.user_id) !== Number(user.user_id) && (
                            <Btn size="xs" variant="ghost" onClick={() => deleteUser(u)}>Delete</Btn>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td className="px-4 py-8 text-center text-slate-400" colSpan={8}>No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === "Roles" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-800">{roles.length} roles · {TOTAL_PERMISSIONS} permissions available</h3>
              <Btn onClick={openAddRole}>+ Add Role</Btn>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {roles.map((role) => {
                const perms = parsePerms(role.permissions);
                const pct = Math.round((perms.length / TOTAL_PERMISSIONS) * 100);
                const color = roleColor(role.role_name);
                return (
                  <Card key={role.role_id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-semibold text-slate-900">{role.role_name}</h3>
                          {role.role_name === "Super Admin" && <Badge label="High" color="purple" />}
                        </div>
                        {role.description && <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{role.description}</p>}
                        <p className="text-[11px] text-slate-400 mt-0.5">{role.user_count ?? 0} user{role.user_count !== 1 ? "s" : ""} assigned</p>
                      </div>
                      <div className="flex gap-1">
                        <Btn size="xs" variant="secondary" onClick={() => openEditRole(role)}>Edit</Btn>
                        {role.role_name !== "Super Admin" && (role.user_count ?? 0) === 0 && (
                          <Btn size="xs" variant="ghost" onClick={() => deleteRole(role)}>Delete</Btn>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-[10px] text-slate-400">{perms.length}/{TOTAL_PERMISSIONS} permissions</div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: color }}>
                        {pct}%
                      </span>
                    </div>
                  </Card>
                );
              })}
              {roles.length === 0 && (
                <div className="text-xs text-slate-400 py-8 text-center col-span-full">No roles found</div>
              )}
            </div>
          </div>
        )}

        {/* User modal */}
        <Modal open={userModal} onClose={() => setUserModal(false)} title={userForm.isNew ? "Add New User" : `Edit User — ${userForm.name}`} width="max-w-lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name" required>
                <Input value={userForm.name} onChange={(v) => setUserForm({ ...userForm, name: v })} />
              </Field>
              <Field label="Email" required>
                <Input value={userForm.email} onChange={(v) => setUserForm({ ...userForm, email: v })} type="email" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone">
                <Input value={userForm.phone} onChange={(v) => setUserForm({ ...userForm, phone: v })} />
              </Field>
              <Field label="Role" required>
                <select
                  className={inputCls}
                  value={userForm.role_id ?? ""}
                  onChange={(e) => setUserForm({ ...userForm, role_id: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value="">Select role</option>
                  {roles.map((r) => (
                    <option key={r.role_id} value={r.role_id}>{r.role_name}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Branch">
              <select
                className={inputCls}
                value={userForm.branch_id ?? ""}
                onChange={(e) => setUserForm({ ...userForm, branch_id: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">All branches</option>
                {branches.map((b) => (
                  <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={userForm.isNew ? "Password" : "New Password (optional)"} required={userForm.isNew}>
                <Input type="password" value={userForm.password} onChange={(v) => setUserForm({ ...userForm, password: v })} placeholder={userForm.isNew ? "Min 6 characters" : "Leave blank to keep"} />
              </Field>
              <Field label="Confirm Password" required={userForm.isNew}>
                <Input type="password" value={userForm.confirm} onChange={(v) => setUserForm({ ...userForm, confirm: v })} />
              </Field>
            </div>
            {userMsg && (
              <div className={`text-xs font-medium px-3 py-2 rounded-lg ${userMsg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                {userMsg.text}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Btn variant="secondary" onClick={() => setUserModal(false)}>Cancel</Btn>
              <Btn onClick={saveUser} disabled={userSaving}>{userSaving ? "Saving..." : userForm.isNew ? "Create User" : "Save Changes"}</Btn>
            </div>
          </div>
        </Modal>

        {/* Role modal */}
        <Modal open={roleModal} onClose={() => setRoleModal(false)} title={roleForm.isNew ? "Add New Role" : `Edit Role — ${roleForm.role_name}`} width="max-w-2xl">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Role Name" required>
                <Input value={roleForm.role_name} onChange={(v) => setRoleForm({ ...roleForm, role_name: v })} />
              </Field>
              <Field label="Description">
                <Input value={roleForm.description} onChange={(v) => setRoleForm({ ...roleForm, description: v })} />
              </Field>
            </div>

            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-700">Permissions ({roleForm.perms.length}/{TOTAL_PERMISSIONS})</h4>
              <div className="flex gap-2">
                <Btn size="xs" variant="secondary" onClick={() => setRoleForm({ ...roleForm, perms: [...ALL_PERMISSION_KEYS] })}>Select All</Btn>
                <Btn size="xs" variant="ghost" onClick={() => setRoleForm({ ...roleForm, perms: [] })}>Clear All</Btn>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
              {PERMISSION_GROUPS.map((g) => (
                <div key={g.group} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{g.group}</span>
                    <button
                      className="text-[10px] text-sky-600 hover:text-sky-800 font-semibold"
                      onClick={() => {
                        const keys = g.permissions.map((p) => p.key);
                        const allOn = keys.every((k) => roleForm.perms.includes(k));
                        setRoleForm({
                          ...roleForm,
                          perms: allOn
                            ? roleForm.perms.filter((k) => !keys.includes(k))
                            : Array.from(new Set([...roleForm.perms, ...keys])),
                        });
                      }}
                    >
                      Toggle group
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {g.permissions.map((p) => {
                      const on = roleForm.perms.includes(p.key);
                      return (
                        <button
                          key={p.key}
                          onClick={() => togglePerm(p.key)}
                          className={`flex items-center gap-2 px-2 py-1 rounded-md text-left text-[11px] transition-colors ${on ? "bg-sky-50 text-sky-800" : "text-slate-500 hover:bg-slate-50"}`}
                        >
                          <span className={`flex-shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${on ? "bg-sky-500 border-sky-500" : "border-slate-300"}`}>
                            {on && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {roleMsg && (
              <div className={`text-xs font-medium px-3 py-2 rounded-lg ${roleMsg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                {roleMsg.text}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Btn variant="secondary" onClick={() => setRoleModal(false)}>Cancel</Btn>
              <Btn onClick={saveRole} disabled={roleSaving}>{roleSaving ? "Saving..." : roleForm.isNew ? "Create Role" : "Save Changes"}</Btn>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
