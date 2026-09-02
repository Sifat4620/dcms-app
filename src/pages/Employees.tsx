import { useEffect, useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD, Modal, Field, Input } from "../components/Layout";
import { api } from "../data/api";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
  onUserUpdate: (user: any) => void;
}

export default function Employees({ pageProps, user, onLogout, onUserUpdate }: PageProps) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"employees" | "attendance">("employees");
  const [employees, setEmployees] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});

  const load = () => {
    api.get<any>("/employees?limit=200").then((res) => setEmployees(res.data)).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = employees.filter(
    (e) =>
      (e.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.department_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.designation || "").toLowerCase().includes(search.toLowerCase())
  );

  const labCount = employees.filter((e) => e.department_name === "Laboratory").length;
  const adminCount = employees.filter((e) => ["Admin", "Accounts", "Finance"].includes(e.department_name)).length;

  const handleAdd = async () => {
    try {
      await api.post("/employees", {
        name: form.name,
        designation: form.designation,
        department_id: form.department_id || null,
        phone: form.phone,
        email: form.email,
        join_date: form.join_date,
        salary: Number(form.salary || 0),
      });
      setShowAdd(false);
      setForm({});
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <Layout
      title={pageProps.title}
      subtitle={`${employees.length} active staff members`}
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      onUserUpdate={onUserUpdate}
      actions={
        <>
          <SearchBar placeholder="Name, dept, designation..." value={search} onChange={setSearch} />
          <Btn onClick={() => setShowAdd(true)}>+ Add Employee</Btn>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Total Staff</div>
            <div className="text-2xl font-semibold text-slate-900">{employees.length}</div>
          </div>
          <div className="bg-sky-50 rounded-lg border border-sky-200 p-4">
            <div className="text-[11px] text-sky-600">Laboratory</div>
            <div className="text-2xl font-semibold text-sky-600">{labCount}</div>
          </div>
          <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
            <div className="text-[11px] text-purple-600">Admin & Accounts</div>
            <div className="text-2xl font-semibold text-purple-600">{adminCount}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Departments</div>
            <div className="text-2xl font-semibold text-slate-900">{new Set(employees.map((e) => e.department_name)).size}</div>
          </div>
        </div>

        <div className="flex gap-1 p-1 bg-white rounded-lg border border-slate-200 w-fit">
          {(["employees", "attendance"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${tab === t ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {t === "employees" ? "Employee List" : "Attendance"}
            </button>
          ))}
        </div>

        {tab === "employees" ? (
          <Card>
            <Table headers={["Emp ID", "Name", "Department", "Designation", "Phone", "Join Date", "Salary (BDT)", "Status", "Actions"]}>
              {filtered.map((e) => (
                <TR key={e.employee_id}>
                  <TD mono>EMP-{e.employee_id}</TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold flex-shrink-0">
                        {(e.name || "?").split(" ").map((n: any) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-medium text-slate-800">{e.name}</span>
                    </div>
                  </TD>
                  <TD>{e.department_name || "—"}</TD>
                  <TD>{e.designation || "—"}</TD>
                  <TD mono>{e.phone || "—"}</TD>
                  <TD mono>{e.join_date || "—"}</TD>
                  <TD mono>৳ {(e.salary || 0).toLocaleString()}</TD>
                  <TD><Badge label={e.status || "active"} color={e.status === "inactive" ? "gray" : "green"} /></TD>
                  <TD><Btn size="xs" variant="secondary">Profile</Btn></TD>
                </TR>
              ))}
              {filtered.length === 0 && <TR><TD className="text-center py-8 text-slate-400">No employees found</TD></TR>}
            </Table>
          </Card>
        ) : (
          <Card>
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-800">Attendance Overview</h3>
            </div>
            <Table headers={["Employee", "Department", "Designation", "Status"]}>
              {filtered.map((e) => (
                <TR key={e.employee_id}>
                  <TD>
                    <div className="font-medium text-slate-800">{e.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">EMP-{e.employee_id}</div>
                  </TD>
                  <TD>{e.department_name || "—"}</TD>
                  <TD>{e.designation || "—"}</TD>
                  <TD><Badge label="Present" color="green" /></TD>
                </TR>
              ))}
              {filtered.length === 0 && <TR><TD className="text-center py-8 text-slate-400">No data</TD></TR>}
            </Table>
          </Card>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Employee">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name" required>
            <Input placeholder="Full name" value={form.name || ""} onChange={(v) => setForm({ ...form, name: v })} />
          </Field>
          <Field label="Designation">
            <Input placeholder="Designation" value={form.designation || ""} onChange={(v) => setForm({ ...form, designation: v })} />
          </Field>
          <Field label="Phone">
            <Input placeholder="Phone" value={form.phone || ""} onChange={(v) => setForm({ ...form, phone: v })} />
          </Field>
          <Field label="Email">
            <Input placeholder="Email" value={form.email || ""} onChange={(v) => setForm({ ...form, email: v })} />
          </Field>
          <Field label="Join Date">
            <Input placeholder="YYYY-MM-DD" value={form.join_date || ""} onChange={(v) => setForm({ ...form, join_date: v })} />
          </Field>
          <Field label="Salary (BDT)">
            <Input type="number" placeholder="Salary" value={form.salary || "0"} onChange={(v) => setForm({ ...form, salary: v })} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
          <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
          <Btn onClick={handleAdd}>Add Employee</Btn>
        </div>
      </Modal>
    </Layout>
  );
}
