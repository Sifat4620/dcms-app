import { useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD } from "../components/Layout";
import { reports } from "../data/mockData";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
}

const STATUS_COLOR: Record<string, "gray" | "blue" | "purple" | "green"> = {
  Draft: "gray",
  Verified: "blue",
  Approved: "purple",
  Released: "green",
};

const WORKFLOW_STEPS = [
  { label: "Result Entry", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", color: "#0EA5E9", done: true },
  { label: "Tech Verify", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "#8B5CF6", done: true },
  { label: "Path Approve", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", color: "#F59E0B", done: false },
  { label: "Released", icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8", color: "#10B981", done: false },
];

export default function Reports({ pageProps, user, onLogout }: PageProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const statuses = ["All", "Draft", "Verified", "Approved", "Released"];

  const filtered = reports.filter((r) => {
    const matchSearch = r.patient.toLowerCase().includes(search.toLowerCase()) || r.id.includes(search);
    const matchStatus = filter === "All" || r.status === filter;
    return matchSearch && matchStatus;
  });

  return (
    <Layout
      title={pageProps.title}
      subtitle="Digital report creation, approval, and delivery"
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      actions={
        <>
          <SearchBar placeholder="Patient or report ID..." value={search} onChange={setSearch} />
          <Btn>+ New Report</Btn>
        </>
      }
    >
      <div className="space-y-4">
        {/* Improved workflow stepper */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-4">Report Workflow</div>
          <div className="flex items-center">
            {WORKFLOW_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all"
                    style={{
                      background: step.done ? step.color : "#F1F5F9",
                      color: step.done ? "white" : "#94A3B8",
                    }}
                  >
                    {step.done ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xs font-bold">{i + 1}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <span className={`text-[11px] font-medium ${step.done ? "text-slate-700" : "text-slate-400"}`}>{step.label}</span>
                    {step.done && (
                      <div className="text-[10px] text-emerald-500 mt-0.5">Complete</div>
                    )}
                  </div>
                </div>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div
                    className="w-8 h-0.5 flex-shrink-0 -mt-5 transition-colors"
                    style={{ background: step.done ? step.color : "#E2E8F0" }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 text-[11px]">
            {statuses.slice(1).map((s) => {
              const count = reports.filter((r) => r.status === s).length;
              return (
                <div key={s} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: s === "Draft" ? "#94A3B8" : s === "Verified" ? "#3B82F6" : s === "Approved" ? "#8B5CF6" : "#10B981",
                    }}
                  />
                  <span className="text-slate-500">{s}:</span>
                  <span className="font-semibold text-slate-700">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === s ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
            >
              {s} <span className="opacity-60">({s === "All" ? reports.length : reports.filter((r) => r.status === s).length})</span>
            </button>
          ))}
        </div>

        <Card>
          <Table headers={["Report ID", "Patient", "Tests", "Order ID", "Sample Date", "Report Date", "Approved By", "Status", "Actions"]}>
            {filtered.map((r) => (
              <TR key={r.id}>
                <TD mono>{r.id}</TD>
                <TD>
                  <div className="font-medium text-slate-800">{r.patient}</div>
                  <div className="text-[10px] font-mono text-slate-400">{r.patientId}</div>
                </TD>
                <TD>{r.tests}</TD>
                <TD mono>{r.orderId}</TD>
                <TD mono>{r.date}</TD>
                <TD mono>{r.reportDate}</TD>
                <TD>{r.approvedBy}</TD>
                <TD><Badge label={r.status} color={STATUS_COLOR[r.status] || "gray"} /></TD>
                <TD>
                  <div className="flex gap-1">
                    <Btn size="xs" variant="secondary">View</Btn>
                    {r.status === "Draft" && <Btn size="xs" variant="primary">Verify</Btn>}
                    {r.status === "Verified" && <Btn size="xs" variant="primary">Approve</Btn>}
                    {r.status === "Approved" && <Btn size="xs" variant="primary">Release</Btn>}
                    {r.status === "Released" && <Btn size="xs" variant="secondary">Download</Btn>}
                  </div>
                </TD>
              </TR>
            ))}
          </Table>
        </Card>

        {/* Report preview card */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-700">Report Preview — RPT-001</h3>
            <div className="flex gap-2">
              <Btn variant="secondary" size="xs">Print</Btn>
              <Btn variant="secondary" size="xs">Download PDF</Btn>
              <Btn size="xs">Send to Patient</Btn>
            </div>
          </div>
          <div className="border border-slate-200 rounded-lg p-5 bg-slate-50 max-w-xl">
            <div className="text-center mb-4 pb-4 border-b border-slate-200">
              <div className="text-sm font-bold text-slate-900">MediCare Diagnostic Center</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Dhaka, Bangladesh · Tel: +88-02-XXXXXXX</div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px] mb-4">
              <div><span className="text-slate-400">Patient:</span> <span className="font-medium">Fatema Begum</span></div>
              <div><span className="text-slate-400">ID:</span> <span className="font-mono">PT-00002</span></div>
              <div><span className="text-slate-400">Age/Gender:</span> <span>35 / Female</span></div>
              <div><span className="text-slate-400">Doctor:</span> <span>Dr. Sultana Razia</span></div>
              <div><span className="text-slate-400">Collected:</span> <span className="font-mono">2026-08-31</span></div>
              <div><span className="text-slate-400">Report ID:</span> <span className="font-mono">RPT-001</span></div>
            </div>
            <table className="w-full text-[11px] border border-slate-200 rounded">
              <thead className="bg-slate-100">
                <tr>
                  {["Test", "Result", "Unit", "Reference Range", "Flag"].map((h) => (
                    <th key={h} className="text-left px-2 py-1.5 font-semibold text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-100">
                  <td className="px-2 py-1.5 text-slate-700">Blood Sugar Fasting</td>
                  <td className="px-2 py-1.5 font-mono font-semibold text-emerald-700">5.4</td>
                  <td className="px-2 py-1.5 font-mono text-slate-500">mmol/L</td>
                  <td className="px-2 py-1.5 text-slate-500">3.9 – 6.1</td>
                  <td className="px-2 py-1.5"><Badge label="Normal" color="green" /></td>
                </tr>
              </tbody>
            </table>
            <div className="mt-4 flex justify-between text-[10px] text-slate-400">
              <span>Verified by: Nasim Ahmed (Lab Tech)</span>
              <span>Approved by: Dr. Sultana Razia</span>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
