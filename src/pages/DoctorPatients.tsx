import { useEffect, useState } from "react";
import Layout, { Card, Badge, SearchBar } from "../components/Layout";
import { api } from "../data/api";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
  onUserUpdate: (user: any) => void;
}

export default function DoctorPatients({ pageProps, user, onLogout, onUserUpdate }: PageProps) {
  const [view, setView] = useState<"daily" | "monthly">("daily");
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [selDate, setSelDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selMonth, setSelMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const load = () => {
    const q = view === "daily"
      ? `/doctors/patient-stats?date=${selDate}`
      : `/doctors/patient-stats?month=${selMonth}`;
    api.get<any>(q).then(setStats).catch(() => {});
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, selDate, selMonth]);

  const doctors = stats?.doctors || [];
  const filtered = doctors.filter(
    (d: any) =>
      (d.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.specialization || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalToday = doctors.reduce((s: number, d: any) => s + (d.today || 0), 0);
  const totalMonth = doctors.reduce((s: number, d: any) => s + (d.month || 0), 0);

  return (
    <Layout
      title={pageProps.title}
      subtitle="Track how many patients each doctor sees — daily and monthly"
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      onUserUpdate={onUserUpdate}
      actions={
        <>
          <SearchBar placeholder="Search doctor..." value={search} onChange={setSearch} />
          <div className="flex items-center gap-2">
            {view === "daily" ? (
              <input
                type="date"
                value={selDate}
                onChange={(e) => setSelDate(e.target.value)}
                className="px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400"
              />
            ) : (
              <input
                type="month"
                value={selMonth}
                onChange={(e) => setSelMonth(e.target.value)}
                className="px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400"
              />
            )}
            <div className="flex rounded-md overflow-hidden border border-slate-200">
              <button
                onClick={() => setView("daily")}
                className={`px-3 py-1.5 text-xs transition-colors ${view === "daily" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                Daily
              </button>
              <button
                onClick={() => setView("monthly")}
                className={`px-3 py-1.5 text-xs transition-colors ${view === "monthly" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                Monthly
              </button>
            </div>
          </div>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="text-[11px] text-slate-500">{view === "daily" ? "Patients on Selected Day" : "Patients Today"}</div>
            <div className="text-2xl font-semibold text-slate-900">{totalToday}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{stats?.date || "—"}</div>
          </Card>
          <Card className="p-4">
            <div className="text-[11px] text-slate-500">{view === "monthly" ? "Patients in Selected Month" : "Patients This Month"}</div>
            <div className="text-2xl font-semibold text-slate-900">{totalMonth}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{stats?.month || "—"}</div>
          </Card>
          <Card className="p-4">
            <div className="text-[11px] text-slate-500">Active Doctors</div>
            <div className="text-2xl font-semibold text-slate-900">{doctors.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Registered</div>
          </Card>
        </div>

        <Card>
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-800">
              {view === "daily" ? "Patients Seen Today" : "Patients Seen This Month"}
            </h3>
            <Badge label={view === "daily" ? (stats?.date || "") : (stats?.month || "")} color="blue" />
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] text-slate-500">
                <th className="px-4 py-2.5 font-semibold">Doctor</th>
                <th className="px-4 py-2.5 font-semibold">Specialization</th>
                {view === "daily" ? (
                  <th className="px-4 py-2.5 font-semibold text-right">Today</th>
                ) : (
                  <>
                    <th className="px-4 py-2.5 font-semibold text-right">This Month</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Total</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d: any) => (
                <tr key={d.doctor_id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-[11px] font-bold flex-shrink-0">
                        {(d.name || "").replace("Dr. ", "").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{d.name}</div>
                        <div className="text-[10px] text-slate-400">Fee ৳ {d.consultation_fee}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge label={d.specialization || "General"} color="blue" /></td>
                  {view === "daily" ? (
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg font-bold text-white ${d.today > 0 ? "" : ""}`} style={{ background: d.today > 0 ? "#0EA5E9" : "#E2E8F0", color: d.today > 0 ? "#fff" : "#64748B" }}>
                        {d.today}
                      </span>
                    </td>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg font-bold text-white" style={{ background: d.month > 0 ? "#10B981" : "#E2E8F0", color: d.month > 0 ? "#fff" : "#64748B" }}>
                          {d.month}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700">{d.total}</td>
                    </>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td className="px-4 py-8 text-center text-slate-400" colSpan={4}>No doctors found</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </Layout>
  );
}
