import Layout, { Card } from "../components/Layout";
import { revenueData } from "../data/mockData";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
}

const DAILY_DATA = [
  { day: "Mon", revenue: 42000, patients: 68 },
  { day: "Tue", revenue: 38500, patients: 61 },
  { day: "Wed", revenue: 51200, patients: 82 },
  { day: "Thu", revenue: 47800, patients: 76 },
  { day: "Fri", revenue: 39100, patients: 63 },
  { day: "Sat", revenue: 58900, patients: 94 },
  { day: "Sun", revenue: 35600, patients: 57 },
];

const TEST_STATS = [
  { name: "CBC", count: 187, revenue: 84150 },
  { name: "Blood Sugar", count: 154, revenue: 23100 },
  { name: "Lipid Profile", count: 98, revenue: 58800 },
  { name: "Thyroid Profile", count: 76, revenue: 91200 },
  { name: "Urine R/E", count: 143, revenue: 28600 },
  { name: "ECG", count: 89, revenue: 31150 },
];

// Current month is September (index 5 in our data if we have March-Sep,
// but revenueData uses "Aug" as the last/current. We treat "Aug" as highlighted.
const CURRENT_MONTH = "Aug";

export default function Analytics({ pageProps, user, onLogout }: PageProps) {
  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));
  const maxDaily = Math.max(...DAILY_DATA.map((d) => d.revenue));
  const maxTest = Math.max(...TEST_STATS.map((t) => t.count));

  return (
    <Layout
      title={pageProps.title}
      subtitle="Business intelligence and operational insights"
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
    >
      <div className="space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Aug Revenue", value: "৳ 2,32,000", change: "+12%", up: true },
            { label: "Total Patients", value: "389", change: "+8%", up: true },
            { label: "Avg Revenue/Patient", value: "৳ 596", change: "+3%", up: true },
            { label: "Test Completion Rate", value: "96.4%", change: "+0.5%", up: true },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="text-[11px] text-slate-500">{k.label}</div>
              <div className="text-2xl font-semibold text-slate-900 mt-1">{k.value}</div>
              <div className={`text-[11px] mt-1 flex items-center gap-1 ${k.up ? "text-emerald-600" : "text-red-500"}`}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={k.up ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
                {k.change} vs last month
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Monthly revenue — highlighted current month */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-slate-800">Monthly Revenue (BDT)</h3>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-slate-400">Last 6 months</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm" style={{ background: "#0EA5E9" }} />
                  <span className="text-slate-500">Current</span>
                </div>
              </div>
            </div>
            <div className="flex items-end gap-2 h-36">
              {revenueData.map((d) => {
                const isCurrent = d.month === CURRENT_MONTH;
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className={`text-[10px] ${isCurrent ? "text-sky-600 font-semibold" : "text-slate-400"}`}>
                      {(d.revenue / 1000).toFixed(0)}k
                    </span>
                    <div
                      className="w-full rounded-t-sm transition-all hover:opacity-90 relative"
                      style={{
                        height: `${(d.revenue / maxRevenue) * 108}px`,
                        background: isCurrent ? "#0EA5E9" : "#E2E8F0",
                        boxShadow: isCurrent ? "0 0 12px rgba(14,165,233,0.4)" : "none",
                      }}
                    >
                      {isCurrent && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          <span className="text-[9px] font-bold text-sky-600 bg-sky-50 rounded px-1 py-0.5 border border-sky-200">Current</span>
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] ${isCurrent ? "text-sky-600 font-semibold" : "text-slate-500"}`}>{d.month}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Daily revenue this week */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-slate-800">This Week — Daily Revenue</h3>
              <span className="text-[11px] text-slate-400">Aug 25–31</span>
            </div>
            <div className="flex items-end gap-2 h-36">
              {DAILY_DATA.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-400">{(d.revenue / 1000).toFixed(0)}k</span>
                  <div
                    className="w-full rounded-t-sm transition-all hover:opacity-80"
                    style={{ height: `${(d.revenue / maxDaily) * 108}px`, background: d.day === "Sat" ? "#10B981" : "#C7D2FE" }}
                  />
                  <span className="text-[10px] text-slate-500">{d.day}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Test-wise stats */}
          <Card className="p-4">
            <h3 className="text-xs font-semibold text-slate-800 mb-4">Top Tests by Volume (Aug)</h3>
            <div className="space-y-3">
              {TEST_STATS.map((t) => (
                <div key={t.name}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-600 font-medium">{t.name}</span>
                    <span className="font-mono text-slate-700">{t.count} tests · ৳ {t.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400 rounded-full" style={{ width: `${(t.count / maxTest) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Patient demographics */}
          <Card className="p-4">
            <h3 className="text-xs font-semibold text-slate-800 mb-4">Patient Demographics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] text-slate-500 mb-2">By Gender</div>
                {[{ label: "Male", pct: 54, color: "#0EA5E9" }, { label: "Female", pct: 44, color: "#EC4899" }, { label: "Other", pct: 2, color: "#94A3B8" }].map((g) => (
                  <div key={g.label} className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: g.color }} />
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${g.pct}%`, background: g.color }} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{g.pct}%</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-2">By Age Group</div>
                {[
                  { label: "0–17", pct: 8 },
                  { label: "18–35", pct: 28 },
                  { label: "36–55", pct: 42 },
                  { label: "56+", pct: 22 },
                ].map((a) => (
                  <div key={a.label} className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] text-slate-400 w-8">{a.label}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-400" style={{ width: `${a.pct * 2}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{a.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="text-[11px] text-slate-500 mb-2">Patient Types</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[{ label: "New", value: 124, color: "text-sky-600" }, { label: "Returning", value: 265, color: "text-emerald-600" }, { label: "Corporate", value: 48, color: "text-purple-600" }].map((p) => (
                  <div key={p.label} className="bg-slate-50 rounded-lg p-2">
                    <div className={`text-lg font-bold ${p.color}`}>{p.value}</div>
                    <div className="text-[10px] text-slate-400">{p.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Financial summary table */}
        <Card>
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-800">Monthly Financial Summary</h3>
            <button className="text-xs text-sky-500 hover:text-sky-700">Export Report</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Month", "Patients", "Revenue (BDT)", "Collections", "Outstanding", "Growth"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {revenueData.map((d, i) => {
                  const prev = revenueData[i - 1];
                  const growth = prev ? ((d.revenue - prev.revenue) / prev.revenue * 100).toFixed(1) : "—";
                  const isCurrent = d.month === CURRENT_MONTH;
                  return (
                    <tr
                      key={d.month}
                      className={`border-b border-slate-50 transition-colors ${isCurrent ? "bg-sky-50" : "hover:bg-slate-50"}`}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${isCurrent ? "text-sky-700" : "text-slate-700"}`}>{d.month} 2026</span>
                          {isCurrent && (
                            <span className="text-[9px] font-bold text-sky-600 bg-sky-100 rounded px-1.5 py-0.5">Current</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-600">{d.patients}</td>
                      <td className={`px-4 py-2.5 font-mono font-semibold ${isCurrent ? "text-sky-700" : "text-slate-900"}`}>৳ {d.revenue.toLocaleString()}</td>
                      <td className="px-4 py-2.5 font-mono text-emerald-600">৳ {(d.revenue * 0.94).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                      <td className="px-4 py-2.5 font-mono text-red-400">৳ {(d.revenue * 0.06).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                      <td className={`px-4 py-2.5 font-mono font-medium ${growth !== "—" && parseFloat(growth.toString()) >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {growth !== "—" ? `${parseFloat(growth.toString()) >= 0 ? "+" : ""}${growth}%` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
