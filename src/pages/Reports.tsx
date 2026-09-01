import { useEffect, useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD, Modal } from "../components/Layout";
import { api } from "../data/api";

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

export default function Reports({ pageProps, user, onLogout }: PageProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [reports, setReports] = useState<any[]>([]);
  const [detail, setDetail] = useState<any | null>(null);
  const statuses = ["All", "Draft", "Verified", "Approved", "Released"];

  const loadReports = () => {
    api.get<any>("/labs/reports?limit=200").then((res) => setReports(res.data)).catch(() => {});
  };

  useEffect(() => {
    loadReports();
  }, []);

  const filtered = reports.filter((r) => {
    const matchSearch = (r.patient_name || "").toLowerCase().includes(search.toLowerCase()) || (r.barcode || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === "All" || r.status === filter;
    return matchSearch && matchStatus;
  });

  const viewDetail = async (id: number) => {
    try {
      const res = await api.get(`/labs/reports/${id}`);
      setDetail(res);
    } catch {
      alert("Could not load report");
    }
  };

  const nextAction = async (r: any) => {
    const status = r.status === "Draft" ? "Verified" : r.status === "Verified" ? "Approved" : "Released";
    try {
      await api.put(`/labs/reports/${r.report_id}/approve`, { approved_by: user.name, status });
      setDetail(null);
      loadReports();
    } catch (e: any) {
      alert(e.message);
    }
  };

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
        </>
      }
    >
      <div className="space-y-4">
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
          <Table headers={["Report ID", "Patient", "Order ID", "Report Date", "Approved By", "Status", "Actions"]}>
            {filtered.map((r) => (
              <TR key={r.report_id}>
                <TD mono>{r.barcode}</TD>
                <TD>
                  <div className="font-medium text-slate-800">{r.patient_name}</div>
                  <div className="text-[10px] font-mono text-slate-400">{r.patient_unique_id}</div>
                </TD>
                <TD mono>#{r.order_id}</TD>
                <TD mono>{r.report_date}</TD>
                <TD>{r.approved_by || "—"}</TD>
                <TD><Badge label={r.status} color={STATUS_COLOR[r.status] || "gray"} /></TD>
                <TD>
                  <div className="flex gap-1">
                    <Btn size="xs" variant="secondary" onClick={() => viewDetail(r.report_id)}>View</Btn>
                    {r.status === "Draft" && <Btn size="xs" variant="primary" onClick={() => nextAction(r)}>Verify</Btn>}
                    {r.status === "Verified" && <Btn size="xs" variant="primary" onClick={() => nextAction(r)}>Approve</Btn>}
                    {r.status === "Approved" && <Btn size="xs" variant="primary" onClick={() => nextAction(r)}>Release</Btn>}
                  </div>
                </TD>
              </TR>
            ))}
            {filtered.length === 0 && (
              <TR><TD className="text-center py-8 text-slate-400">No reports found</TD></TR>
            )}
          </Table>
        </Card>
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Report — ${detail?.barcode || ""}`} width="max-w-3xl">
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[11px]">
              <div><span className="text-slate-400">Patient:</span> <span className="font-medium text-slate-800">{detail.patient_name}</span></div>
              <div><span className="text-slate-400">ID:</span> <span className="font-mono">{detail.patient_unique_id}</span></div>
              <div><span className="text-slate-400">Gender:</span> <span>{detail.gender || "—"}</span></div>
              <div><span className="text-slate-400">Doctor:</span> <span>{detail.doctor_name || "—"}</span></div>
              <div><span className="text-slate-400">Status:</span> <Badge label={detail.status} color={STATUS_COLOR[detail.status] || "gray"} /></div>
              <div><span className="text-slate-400">Approved:</span> <span>{detail.approved_by || "—"}</span></div>
            </div>
            <table className="w-full text-[11px] border border-slate-200 rounded">
              <thead className="bg-slate-50">
                <tr>
                  {["Test", "Sample", "Result", "Unit", "Reference Range", "Flag"].map((h) => (
                    <th key={h} className="text-left px-2 py-1.5 font-semibold text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(detail.results || []).map((row: any) => (
                  <tr key={row.sample_id} className="border-t border-slate-100">
                    <td className="px-2 py-1.5 text-slate-700">{row.test_name}</td>
                    <td className="px-2 py-1.5 text-slate-500">{row.sample_type}</td>
                    <td className="px-2 py-1.5 font-mono font-semibold text-slate-800">{row.result_value ?? "—"}</td>
                    <td className="px-2 py-1.5 font-mono text-slate-500">{row.unit || "—"}</td>
                    <td className="px-2 py-1.5 text-slate-500">{row.reference_range || "—"}</td>
                    <td className="px-2 py-1.5">
                      {row.is_abnormal ? <Badge label="Abnormal" color="red" /> : <Badge label="Normal" color="green" />}
                    </td>
                  </tr>
                ))}
                {!detail.results?.length && (
                  <tr><td className="px-2 py-4 text-center text-slate-400" colSpan={6}>No results entered yet</td></tr>
                )}
              </tbody>
            </table>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Btn variant="secondary" onClick={() => setDetail(null)}>Close</Btn>
              {detail.status === "Verified" && <Btn onClick={() => nextAction(detail)}>Approve Report</Btn>}
              {detail.status === "Approved" && <Btn onClick={() => nextAction(detail)}>Release Report</Btn>}
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
