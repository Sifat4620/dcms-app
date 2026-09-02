import { useState } from "react";
import { Badge, Btn } from "./Layout";
import { api } from "../data/api";

export interface LabReport {
  report_id: number;
  order_id: number;
  report_date?: string;
  approved_by?: string | null;
  approved_at?: string | null;
  status?: string;
  barcode?: string;
  patient_name?: string;
  patient_unique_id?: string;
  gender?: string;
  date_of_birth?: string;
  patient_mobile?: string;
  doctor_name?: string | null;
  branch_name?: string;
  branch_address?: string;
  branch_phone?: string;
  branch_email?: string;
  branch_logo?: string | null;
  results?: any[];
}

interface Props {
  report: LabReport | null;
  user: { user_id?: number; name: string };
  onClose: () => void;
  onAdvanced?: () => void;
}

const STATUS_COLOR: Record<string, "gray" | "blue" | "purple" | "green"> = {
  Draft: "gray",
  Verified: "blue",
  Approved: "purple",
  Released: "green",
};

function fmtDate(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function fmtDateTime(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function computeAge(dob?: string) {
  if (!dob) return "";
  const dt = new Date(dob);
  if (isNaN(dt.getTime())) return "";
  const now = new Date();
  let years = now.getFullYear() - dt.getFullYear();
  const m = now.getMonth() - dt.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dt.getDate())) years--;
  if (years >= 1) return `${years} yr${years > 1 ? "s" : ""}`;
  let months = (now.getFullYear() - dt.getFullYear()) * 12 + (now.getMonth() - dt.getMonth());
  if (now.getDate() < dt.getDate()) months--;
  return `${Math.max(0, months)} mo`;
}

export default function LabReportModal({ report, user, onClose, onAdvanced }: Props) {
  const [busy, setBusy] = useState(false);
  const [local, setLocal] = useState<LabReport | null>(report);

  if (!report) return null;
  const r = local || report;
  const branch = {
    name: r.branch_name || "Diagnostic Center",
    address: r.branch_address || "",
    phone: r.branch_phone || "",
    email: r.branch_email || "",
    logo: r.branch_logo || null,
  };
  const results = r.results || [];
  const nextStatus = r.status === "Draft" ? "Verified" : r.status === "Verified" ? "Approved" : "Released";

  const advance = async () => {
    setBusy(true);
    try {
      await api.put(`/labs/reports/${r.report_id}/approve`, { approved_by: user.user_id, status: nextStatus });
      const fresh = await api.get<LabReport>(`/labs/reports/${r.report_id}`);
      setLocal(fresh);
      onAdvanced?.();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-auto" style={{ background: "rgba(15,23,42,0.55)" }} onClick={onClose}>
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl my-4" onClick={(e) => e.stopPropagation()}>
          {/* Toolbar (screen only) */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Laboratory Report — {r.barcode}</h2>
              <p className="text-[11px] text-slate-400">
                {r.patient_name || "—"} · {r.branch_name || "Main Branch"}
              </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <Btn variant="secondary" onClick={onClose}>Close</Btn>
              <Btn onClick={() => window.print()}>⬇ Download PDF</Btn>
              {(r.status === "Verified" || r.status === "Approved") && (
                <Btn onClick={advance} disabled={busy}>{busy ? "Saving..." : r.status === "Verified" ? "Approve" : "Release"}</Btn>
              )}
            </div>
          </div>

          {/* Printable report paper */}
          <div className="p-6 sm:p-8 print:p-0">
            <div className="lab-report-sheet rounded-xl border border-slate-200 bg-white overflow-hidden" style={{ fontFamily: "inherit" }}>
              {/* Header */}
              <div className="px-6 py-5 border-b-2" style={{ borderColor: "#0EA5E9", background: "#F8FBFF" }}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {branch.logo ? (
                      <img src={branch.logo} alt="logo" className="w-14 h-14 object-contain flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0" style={{ background: "#0EA5E9" }}>
                        {(branch.name || "D").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-base font-extrabold text-slate-900 leading-tight">{branch.name}</div>
                      {branch.address && <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{branch.address}</div>}
                      <div className="text-[11px] text-slate-500 mt-0.5">{[branch.phone, branch.email].filter(Boolean).join(" · ") || ""}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-sky-600">Laboratory Report</div>
                    <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">{r.barcode}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Issue Date: {fmtDate(r.report_date)}</div>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: r.status === "Draft" ? "#94A3B8" : r.status === "Verified" ? "#3B82F6" : r.status === "Approved" ? "#8B5CF6" : "#10B981" }}>
                      {r.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient info */}
              <div className="px-6 py-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs border-b border-slate-100">
                <div className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Patient Information</div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-sm font-semibold text-slate-900">{r.patient_name || "—"}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">ID: {r.patient_unique_id || "—"}</div>
                </div>
                <div className="col-span-2 sm:col-span-1 text-left sm:text-right">
                  <div className="text-[11px] text-slate-500">Mobile: <span className="text-slate-800">{r.patient_mobile || "—"}</span></div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {r.gender && <span>Gender: <span className="text-slate-800">{r.gender}</span></span>}
                    {computeAge(r.date_of_birth) ? <span> · Age: <span className="text-slate-800">{computeAge(r.date_of_birth)}</span></span> : ""}
                  </div>
                </div>
                <div className="col-span-2"><span className="text-slate-500">Referred By:</span> <span className="font-medium text-slate-800">{r.doctor_name || "—"}</span></div>
              </div>

              {/* Results table */}
              <div className="px-6 py-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Test Results</div>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500">
                      <th className="py-2 pr-2 border-b border-slate-200 font-semibold">#</th>
                      <th className="py-2 pr-2 border-b border-slate-200 font-semibold">Test</th>
                      <th className="py-2 pr-2 border-b border-slate-200 font-semibold">Sample</th>
                      <th className="py-2 pr-2 border-b border-slate-200 font-semibold text-right">Result</th>
                      <th className="py-2 pr-2 border-b border-slate-200 font-semibold">Unit</th>
                      <th className="py-2 pr-2 border-b border-slate-200 font-semibold">Reference Range</th>
                      <th className="py-2 pr-2 border-b border-slate-200 font-semibold text-center">Flag</th>
                      <th className="py-2 border-b border-slate-200 font-semibold">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row: any, i: number) => (
                      <tr key={row.sample_id ?? i} className="align-top">
                        <td className="py-2 pr-2 border-b border-slate-100 text-slate-400">{i + 1}</td>
                        <td className="py-2 pr-2 border-b border-slate-100 font-medium text-slate-800">{row.test_name || "—"}</td>
                        <td className="py-2 pr-2 border-b border-slate-100 text-slate-500">{row.sample_type || "—"}</td>
                        <td className="py-2 pr-2 border-b border-slate-100 text-right font-mono font-semibold text-slate-900">{row.result_value ?? "Pending"}</td>
                        <td className="py-2 pr-2 border-b border-slate-100 font-mono text-slate-500">{row.unit || "—"}</td>
                        <td className="py-2 pr-2 border-b border-slate-100 text-slate-500">{row.reference_range || "—"}</td>
                        <td className="py-2 pr-2 border-b border-slate-100 text-center">
                          <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white ${row.is_abnormal ? "bg-red-500" : "bg-emerald-500"}`}>
                            {row.is_abnormal ? "ABNORMAL" : "NORMAL"}
                          </span>
                        </td>
                        <td className="py-2 border-b border-slate-100 text-slate-600">{row.remarks || "—"}</td>
                      </tr>
                    ))}
                    {results.length === 0 && (
                      <tr><td colSpan={8} className="py-4 text-center text-slate-400">No results entered yet</td></tr>
                    )}
                  </tbody>
                </table>
                {results.some((row: any) => row.result_value != null) && (
                  <div className="mt-3 space-y-1 text-[10px] text-slate-400">
                    <div><span className="text-slate-500">Sample Collected:</span> {results[0]?.collection_date ? fmtDate(results[0].collection_date) : "—"} {results[0]?.collected_by_name ? ` · Collected by ${results[0].collected_by_name}` : ""}</div>
                    <div><span className="text-slate-500">Result Entered:</span> {results[0]?.entered_at ? fmtDateTime(results[0].entered_at) : "—"} {results[0]?.entered_by_name ? ` · by ${results[0].entered_by_name}` : ""}</div>
                    <div><span className="text-slate-500">Report Status:</span> {r.status} {r.approved_by ? ` · Approved by ${r.approved_by}` : ""} {r.approved_at ? ` on ${fmtDateTime(r.approved_at)}` : ""}</div>
                  </div>
                )}
              </div>

              {/* Signature footer */}
              <div className="px-6 py-5 mt-2 border-t border-slate-100 grid grid-cols-3 gap-4 text-center text-[11px]">
                <div>
                  <div className="h-10" />
                  <div className="border-t border-slate-300 pt-1 text-slate-500">Laboratorian</div>
                </div>
                <div>
                  <div className="h-10" />
                  <div className="border-t border-slate-300 pt-1 text-slate-500">Consultant / Pathologist</div>
                </div>
                <div>
                  <div className="h-10" />
                  <div className="border-t border-slate-300 pt-1 text-slate-500">Authorized Signatory</div>
                </div>
              </div>

              <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-center text-[10px] text-slate-400">
                This is a computer-generated report. Results should be interpreted by a qualified physician. · {branch.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .lab-report-sheet, .lab-report-sheet * { visibility: visible !important; }
          .lab-report-sheet {
            position: absolute !important;
            left: 0 !important; right: 0 !important; top: 0 !important;
            width: 100% !important;
            border: none !important; border-radius: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </>
  );
}