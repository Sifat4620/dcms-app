import { useEffect, useState } from "react";
import Layout, { StatCard, Card, CardHeader, Badge, Btn } from "../components/Layout";
import { api } from "../data/api";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
}

interface DashboardData {
  today: { patients: number; appointments: number; completed: number; pending: number };
  queue: { current: number };
  lab: { pendingTests: number; pendingReports: number };
  financial: { todayRevenue: number; monthRevenue: number; totalDue: number };
  alerts: { lowStock: number };
  recentPatients: any[];
  recentAppointments: any[];
}

const ICONS = {
  patients: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  queue: "M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z",
  lab: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
  revenue: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  report: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  due: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.072 16.5C2.302 18.333 3.264 20 4.804 20z",
};

const APT_STATUS_COLOR: Record<string, "blue" | "green" | "gray" | "red" | "yellow"> = {
  Confirmed: "blue", "Checked-in": "green", Completed: "gray", Cancelled: "red", "No Show": "red", Pending: "yellow",
};

export default function Dashboard({ pageProps, user, onLogout }: PageProps) {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get<DashboardData>("/dashboard").then(setData).catch(() => {});
  }, []);

  const todayApts = data?.recentAppointments || [];
  const pendingReports = data?.lab.pendingReports || 0;
  const totalDue = data?.financial.totalDue || 0;
  const manualRevenue = [
    { month: "Current Mt", revenue: Math.round((data?.financial.monthRevenue || 0) / 1000) * 1000, patients: 0 },
  ];
  const maxRevenue = Math.max(1000, ...manualRevenue.map((d) => d.revenue));

  return (
    <Layout
      title={pageProps.title}
      subtitle="Overview of today's operations"
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
    >
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="Today's Patients" value={data?.today.patients ?? 0} icon={ICONS.patients} color="blue" trend={{ value: "registrations today", up: true }} />
        <StatCard label="Appointments" value={data?.today.appointments ?? 0} icon={ICONS.calendar} color="green" trend={{ value: `${data?.today.completed ?? 0} completed`, up: true }} />
        <StatCard label="Queue Active" value={data?.queue.current ?? 0} icon={ICONS.queue} color="purple" sub="waiting now" />
        <StatCard label="Tests Pending" value={data?.lab.pendingTests ?? 0} icon={ICONS.lab} color="amber" sub="awaiting processing" />
        <StatCard label="Today's Revenue" value={`৳${(data?.financial.todayRevenue ?? 0).toLocaleString()}`} icon={ICONS.revenue} color="teal" trend={{ value: "generated today", up: true }} />
        <StatCard label="Reports Pending" value={pendingReports} icon={ICONS.report} color="red" sub={`৳${totalDue.toLocaleString()} due`} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Revenue chart */}
        <Card className="xl:col-span-2">
          <CardHeader
            title="Revenue Overview"
            subtitle="Current month · BDT"
            action={<span className="text-[11px] text-slate-500">Month to date</span>}
          />
          <div className="p-5">
            <div className="flex items-end gap-3 h-40">
              {manualRevenue.map((d) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono">{(d.revenue / 1000).toFixed(0)}k</span>
                  <div className="relative w-full group">
                    <div
                      className="w-full rounded-t-md transition-all cursor-pointer hover:opacity-90"
                      style={{ height: `${(d.revenue / maxRevenue) * 116}px`, background: "#0EA5E9" }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap">
                      ৳{d.revenue.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-600">{d.month}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span>Month revenue: <strong className="text-slate-900">৳ {(data?.financial.monthRevenue ?? 0).toLocaleString()}</strong></span>
              <span>Due: <strong className="text-slate-900">৳ {totalDue.toLocaleString()}</strong></span>
              <span>Low stock: <strong className="text-slate-900">{data?.alerts.lowStock ?? 0}</strong></span>
            </div>
          </div>
        </Card>

        {/* Live queue summary */}
        <Card>
          <CardHeader title="Operational Summary" subtitle="Real-time status" action={<Badge label="LIVE" color="green" />} />
          <div className="p-4 space-y-3">
            <div className="rounded-xl p-4 text-center" style={{ background: "#0F172A" }}>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Tests Waiting</p>
              <p className="text-4xl font-bold text-white font-mono">{data?.lab.pendingTests ?? 0}</p>
              <p className="text-sky-400 text-xs mt-1">Reports pending approval: {data?.lab.pendingReports ?? 0}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 rounded-lg py-2">
                <p className="text-base font-bold text-sky-600">{data?.today.patients ?? 0}</p>
                <p className="text-[10px] text-slate-400">Patients</p>
              </div>
              <div className="bg-slate-50 rounded-lg py-2">
                <p className="text-base font-bold text-emerald-600">{data?.today.completed ?? 0}</p>
                <p className="text-[10px] text-slate-400">Done</p>
              </div>
              <div className="bg-slate-50 rounded-lg py-2">
                <p className="text-base font-bold text-slate-600">{data?.today.pending ?? 0}</p>
                <p className="text-[10px] text-slate-400">Pending</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Today's appointments */}
        <Card className="xl:col-span-2">
          <CardHeader
            title="Recent Appointments"
            subtitle="Latest bookings"
          />
          <div className="divide-y divide-slate-50">
            {todayApts.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-slate-400">No appointments yet</div>
            ) : todayApts.map((a) => (
              <div key={a.appointment_id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "#0EA5E9" }}>
                  {(a.patient_name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800">{a.patient_name}</p>
                  <p className="text-[11px] text-slate-400">{a.doctor_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-semibold text-slate-700">{a.appointment_time}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Token #{a.token_no}</p>
                </div>
                <Badge label={a.status} color={APT_STATUS_COLOR[a.status] || "gray"} />
              </div>
            ))}
          </div>
        </Card>

        {/* Alerts panel */}
        <div className="space-y-4">
          {/* Low stock alerts */}
          <Card>
            <CardHeader title="Inventory Alerts" action={<Badge label={`${data?.alerts.lowStock ?? 0}`} color="red" />} />
            <div className="p-5 text-xs text-slate-500">
              <p className="text-[11px] font-medium text-slate-700">Low stock items: {data?.alerts.lowStock ?? 0}</p>
              <p className="mt-1">Items below reorder level need attention.</p>
            </div>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader title="Quick Actions" />
            <div className="p-3 grid grid-cols-2 gap-2">
              {[
                { label: "Register Patient", icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z", color: "bg-sky-50 text-sky-700" },
                { label: "New Appointment", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "bg-emerald-50 text-emerald-700" },
                { label: "Issue Token", icon: "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z", color: "bg-purple-50 text-purple-700" },
                { label: "Create Invoice", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "bg-amber-50 text-amber-700" },
              ].map((action) => (
                <button key={action.label} className={`flex flex-col items-center gap-1.5 p-3 rounded-lg text-center transition-all hover:shadow-sm border border-transparent hover:border-slate-200 ${action.color}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                  </svg>
                  <span className="text-[10px] font-semibold leading-tight">{action.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Recent patients */}
          <Card>
            <CardHeader title="Recent Registrations" />
            <div className="divide-y divide-slate-50">
              {(data?.recentPatients || []).length === 0 ? (
                <div className="px-5 py-6 text-center text-xs text-slate-400">No patients yet</div>
              ) : data!.recentPatients.slice(0, 3).map((p) => (
                <div key={p.patient_id} className="flex items-center gap-2.5 px-5 py-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-bold flex-shrink-0">
                    {p.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{p.patient_unique_id}</p>
                  </div>
                  <Badge label={p.gender || "—"} color={p.gender === "Male" ? "blue" : p.gender === "Female" ? "purple" : "gray"} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
    </Layout>
  );
}
