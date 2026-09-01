import { useEffect, useState } from "react";
import Layout, { Card } from "../components/Layout";
import { api } from "../data/api";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
}

export default function Analytics({ pageProps, user, onLogout }: PageProps) {
  const [financial, setFinancial] = useState<any>({ revenue: [], totalRevenue: 0, testRevenue: [], doctorRevenue: [] });
  const [dash, setDash] = useState<any>(null);
  const [patientStats, setPatientStats] = useState<any>({ newPatients: 0, totalPatients: 0, genderDistribution: [] });

  useEffect(() => {
    api.get<any>("/dashboard").then(setDash).catch(() => {});
    api.get<any>("/dashboard/reports/financial").then(setFinancial).catch(() => {});
    api.get<any>("/dashboard/reports/patients").then(setPatientStats).catch(() => {});
  }, []);

  const revenue = (financial.revenue || []).slice().reverse();
  const maxRevenue = Math.max(1, ...revenue.map((r: any) => r.total || 0));
  const maxTest = Math.max(1, ...(financial.testRevenue || []).map((t: any) => t.count || 0));

  const monthRevenue = dash?.financial?.monthRevenue || 0;
  const totalPatients = patientStats.totalPatients || 0;
  const avgPerPatient = totalPatients ? Math.round(monthRevenue / totalPatients) : 0;
  const malePct = (patientStats.genderDistribution || []).reduce((s: number, g: any) => (g.gender === "Male" ? s + g.count : s), 0);
  const femalePct = (patientStats.genderDistribution || []).reduce((s: number, g: any) => (g.gender === "Female" ? s + g.count : s), 0);
  const totalGender = Math.max(1, malePct + femalePct);
  const genderPct = (v: number) => Math.round((v / totalGender) * 100);

  return (
    <Layout
      title={pageProps.title}
      subtitle="Business intelligence and operational insights"
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Monthly Revenue</div>
            <div className="text-2xl font-semibold text-slate-900 mt-1">৳ {monthRevenue.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Total Patients</div>
            <div className="text-2xl font-semibold text-slate-900 mt-1">{totalPatients}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Avg Revenue / Patient</div>
            <div className="text-2xl font-semibold text-slate-900 mt-1">৳ {avgPerPatient.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">New Patients (30d)</div>
            <div className="text-2xl font-semibold text-slate-900 mt-1">{patientStats.newPatients}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-slate-800">Revenue Trend (Recent)</h3>
            </div>
            {revenue.length > 0 ? (
              <div className="flex items-end gap-2 h-36">
                {revenue.slice(-14).map((r: any) => (
                  <div key={r.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-400">{(r.total / 1000).toFixed(0)}k</span>
                    <div className="w-full rounded-t-sm transition-all hover:opacity-80 bg-sky-400" style={{ height: `${(r.total / maxRevenue) * 108}px` }} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-36 flex items-center justify-center text-xs text-slate-400">No payment data yet</div>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="text-xs font-semibold text-slate-800 mb-4">Top Tests by Revenue</h3>
            {financial.testRevenue.length > 0 ? (
              <div className="space-y-3">
                {(financial.testRevenue || []).slice(0, 6).map((t: any) => (
                  <div key={t.test_name}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600 font-medium">{t.test_name}</span>
                      <span className="font-mono text-slate-700">{t.count} tests · ৳ {t.revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-400 rounded-full" style={{ width: `${(t.count / maxTest) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-36 flex items-center justify-center text-xs text-slate-400">No test data yet</div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="text-xs font-semibold text-slate-800 mb-4">Patient Demographics</h3>
            {patientStats.totalPatients > 0 ? (
              <div>
                <div className="text-[11px] text-slate-500 mb-2">By Gender</div>
                {[{ label: "Male", pct: genderPct(malePct), color: "#0EA5E9" }, { label: "Female", pct: genderPct(femalePct), color: "#EC4899" }].map((g) => (
                  <div key={g.label} className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: g.color }} />
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${g.pct}%`, background: g.color }} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{g.pct}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-xs text-slate-400">No patient data yet</div>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="text-xs font-semibold text-slate-800 mb-4">Doctor Performance</h3>
            {financial.doctorRevenue.length > 0 ? (
              <div className="space-y-3">
                {(financial.doctorRevenue || []).slice(0, 6).map((d: any) => (
                  <div key={d.doctor_name}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600 font-medium">{d.doctor_name}</span>
                      <span className="font-mono text-slate-700">{d.appointments} appointments</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(d.appointments / Math.max(1, ...financial.doctorRevenue.map((x: any) => x.appointments))) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-xs text-slate-400">No appointment data yet</div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}