import { useEffect, useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD } from "../components/Layout";
import LabReportModal from "../components/LabReportModal";
import { api } from "../data/api";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { user_id?: number; name: string; role: string; email: string };
  onLogout: () => void;
  onUserUpdate: (user: any) => void;
}

const STATUS_COLOR: Record<string, "gray" | "blue" | "purple" | "green"> = {
  Draft: "gray",
  Verified: "blue",
  Approved: "purple",
  Released: "green",
};

export default function Reports({ pageProps, user, onLogout, onUserUpdate }: PageProps) {
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

  return (
    <Layout
      title={pageProps.title}
      subtitle="Digital report creation, approval, and delivery"
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      onUserUpdate={onUserUpdate}
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
                    <Btn size="xs" variant="primary" onClick={() => viewDetail(r.report_id)}>View & Print</Btn>
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

      <LabReportModal report={detail} user={user} onClose={() => setDetail(null)} onAdvanced={loadReports} />
    </Layout>
  );
}
