import { useEffect, useState } from "react";
import Layout, { Card, Table, TR, TD, SearchBar } from "../components/Layout";
import { api } from "../data/api";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
  onUserUpdate: (user: any) => void;
}

const METHOD_COLOR: Record<string, string> = {
  Cash: "#10B981",
  Card: "#3B82F6",
  "Mobile Banking": "#8B5CF6",
  "Bank Transfer": "#8B5CF6",
  "Online Payment": "#8B5CF6",
};

const METHODS = ["All", "Cash", "Card", "Mobile Banking", "Bank Transfer", "Online Payment"];

export default function PaymentReport({ pageProps, user, onLogout, onUserUpdate }: PageProps) {
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = () => {
    const params = new URLSearchParams();
    if (method && method !== "All") params.set("method", method);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    api.get<any>(`/billing/payments/report?${params.toString()}`).then(setPayments).catch(() => {});
  };

  useEffect(() => {
    load();
  }, [method, from, to]);

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.patient_name || "").toLowerCase().includes(q) ||
      (p.invoice_no || "").toLowerCase().includes(q) ||
      (p.received_by_name || "").toLowerCase().includes(q)
    );
  });

  const totalCollected = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const byMethod = payments.reduce((acc, p) => {
    const m = p.payment_method || "Cash";
    acc[m] = (acc[m] || 0) + (p.amount || 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <Layout
      title={pageProps.title}
      subtitle="Payment collection report with method and date summary"
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      onUserUpdate={onUserUpdate}
      actions={
        <SearchBar placeholder="Patient, invoice, or receiver..." value={search} onChange={setSearch} />
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Total Payments</div>
            <div className="text-2xl font-semibold text-slate-900">{payments.length}</div>
          </div>
          <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
            <div className="text-[11px] text-emerald-600">Total Collected</div>
            <div className="text-2xl font-semibold text-emerald-600">৳ {totalCollected.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Payment Methods</div>
            <div className="text-xs text-slate-700 mt-1 space-y-0.5">
              {Object.entries(byMethod).map(([m, amt]) => (
                <div key={m} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: METHOD_COLOR[m] || "#94A3B8" }} />
                  <span className="font-medium">{m}:</span>
                  <span className="font-mono">৳ {(amt as number).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-sky-50 rounded-lg border border-sky-200 p-4">
            <div className="text-[11px] text-sky-600">Avg / Payment</div>
            <div className="text-2xl font-semibold text-sky-600">
              ৳ {payments.length ? Math.round(totalCollected / payments.length).toLocaleString() : 0}
            </div>
          </div>
        </div>

        <Card>
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-slate-100">
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Payment Method</div>
              <select
                className="px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">From Date</div>
              <input type="date" className="px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-sky-400" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">To Date</div>
              <input type="date" className="px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-sky-400" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
          <Table headers={["Date", "Invoice No.", "Patient", "Doctor Fee", "Lab Fee", "Method", "Trx No.", "Received By", "Amount"]}>
            {filtered.map((p) => (
              <TR key={p.payment_id}>
                <TD mono>{p.payment_date}</TD>
                <TD mono>{p.invoice_no}</TD>
                <TD><span className="font-medium text-slate-800">{p.patient_name || "—"}</span></TD>
                <TD mono><span className="text-sky-600 font-medium">৳ {(p.doctor_fee || 0).toLocaleString()}</span></TD>
                <TD mono><span className="text-violet-600 font-medium">৳ {(p.lab_fee || 0).toLocaleString()}</span></TD>
                <TD>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: METHOD_COLOR[p.payment_method] || "#94A3B8" }} />
                    {p.payment_method || "Cash"}
                  </span>
                </TD>
                <TD mono>{p.transaction_no ? <span className="text-sky-600">{p.transaction_no}</span> : <span className="text-slate-300">—</span>}</TD>
                <TD>{p.received_by_name || "—"}</TD>
                <TD mono><span className="font-semibold text-emerald-600">৳ {p.amount.toLocaleString()}</span></TD>
              </TR>
            ))}
            {filtered.length === 0 && (
              <TR><TD className="text-center py-8 text-slate-400">No payments found for the selected filters</TD></TR>
            )}
          </Table>
        </Card>
      </div>
    </Layout>
  );
}
