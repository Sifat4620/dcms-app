import { useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD } from "../components/Layout";
import { employees } from "../data/mockData";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
}

function AttendanceBar({ pct }: { pct: number }) {
  const color = pct >= 95 ? "#10B981" : pct >= 85 ? "#F59E0B" : "#EF4444";
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span
        className="text-[11px] font-mono font-semibold"
        style={{ color }}
      >
        {pct}%
      </span>
    </div>
  );
}

export default function Employees({ pageProps, user, onLogout }: PageProps) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"employees" | "attendance">("employees");

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.dept.toLowerCase().includes(search.toLowerCase()) ||
      e.designation.toLowerCase().includes(search.toLowerCase())
  );

  const avgAttendance = Math.round(employees.reduce((s, e) => s + e.attendance, 0) / employees.length);

  return (
    <Layout
      title={pageProps.title}
      subtitle={`${employees.length} active staff members`}
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      actions={
        <>
          <SearchBar placeholder="Name, dept, designation..." value={search} onChange={setSearch} />
          <Btn>+ Add Employee</Btn>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total Staff", value: employees.length, color: "text-slate-900", bg: "bg-white", border: "border-slate-200" },
            { label: "Laboratory", value: employees.filter((e) => e.dept === "Laboratory").length, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200" },
            { label: "Admin & Accounts", value: employees.filter((e) => ["Admin", "Accounts"].includes(e.dept)).length, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
            {
              label: "Avg Attendance",
              value: `${avgAttendance}%`,
              color: avgAttendance >= 95 ? "text-emerald-600" : "text-amber-600",
              bg: avgAttendance >= 95 ? "bg-emerald-50" : "bg-amber-50",
              border: avgAttendance >= 95 ? "border-emerald-200" : "border-amber-200",
            },
          ].map((s) => (
            <div key={s.label} className={`rounded-lg border ${s.border} ${s.bg} p-4`}>
              <div className="text-[11px] text-slate-500">{s.label}</div>
              <div className={`text-2xl font-semibold mt-0.5 ${s.color}`}>{s.value}</div>
            </div>
          ))}
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
            <Table headers={["Emp ID", "Name", "Department", "Designation", "Phone", "Join Date", "Salary (BDT)", "Attendance", "Status", "Actions"]}>
              {filtered.map((e) => (
                <TR key={e.id}>
                  <TD mono>{e.id}</TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold flex-shrink-0">
                        {e.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-medium text-slate-800">{e.name}</span>
                    </div>
                  </TD>
                  <TD>{e.dept}</TD>
                  <TD>{e.designation}</TD>
                  <TD mono>{e.phone}</TD>
                  <TD mono>{e.join}</TD>
                  <TD mono>৳ {e.salary.toLocaleString()}</TD>
                  <TD>
                    <AttendanceBar pct={e.attendance} />
                  </TD>
                  <TD><Badge label={e.status} color="green" /></TD>
                  <TD>
                    <div className="flex gap-1">
                      <Btn size="xs" variant="secondary">Profile</Btn>
                      <Btn size="xs" variant="ghost">Edit</Btn>
                    </div>
                  </TD>
                </TR>
              ))}
            </Table>
          </Card>
        ) : (
          <Card>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-800">Attendance — August 2026</h3>
              <Btn size="xs" variant="secondary">Export</Btn>
            </div>
            <Table headers={["Employee", "Department", "Present", "Absent", "Leave", "Attendance %", "Actions"]}>
              {employees.map((e) => {
                const present = Math.round((e.attendance / 100) * 22);
                const absent = 22 - present;
                return (
                  <TR key={e.id}>
                    <TD>
                      <div className="font-medium text-slate-800">{e.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{e.id}</div>
                    </TD>
                    <TD>{e.dept}</TD>
                    <TD><span className="text-emerald-600 font-semibold">{present}</span></TD>
                    <TD><span className={absent > 1 ? "text-red-500" : "text-slate-400"}>{absent > 1 ? absent - 1 : 0}</span></TD>
                    <TD><span className="text-amber-500">1</span></TD>
                    <TD>
                      <AttendanceBar pct={e.attendance} />
                    </TD>
                    <TD><Btn size="xs" variant="secondary">Details</Btn></TD>
                  </TR>
                );
              })}
            </Table>
          </Card>
        )}
      </div>
    </Layout>
  );
}
