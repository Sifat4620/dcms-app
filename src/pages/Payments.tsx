import { useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD } from "../components/Layout";
import { invoices } from "../data/mockData";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
}

const METHOD_COLOR: Record<string, "green" | "blue" | "purple" | "gray" | "orange"> = {
  Cash: "green",
  Card: "blue",
  bKash: "purple",
  Nagad: "orange",
  "Bank Transfer": "gray",
  "—": "gray",
};

const METHOD_COLORS_HEX: Record<string, string> = {
  Cash: "#10B981",
  bKash: "#8B5CF6",
  Card: "#3B82F6",
  Nagad: "#F59E0B",
  "Bank Transfer": "#94A3B8",
};

const PAYMENT_METHODS = [
  { method: "Cash", amount: 98000, pct: 42 },
  { method: "bKash", amount: 62000, pct: 27 },
  { method: "Card", amount: 48000, pct: 21 },
  { method: "Nagad", amount: 18000, pct: 8 },
  { method: "Bank Transfer", amount: 6000, pct: 2 },
];

export default function Payments({ pageProps, user, onLogout }: PageProps) {
  const [search, setSearch] = useState("");
  const duePatients = invoices.filter((i) => i.due > 0);
  const paidInvoices = invoices.filter((i) => i.status !== "Unpaid");

  const filteredDue = duePatients.filter(
    (i) =>
      i.patient.toLowerCase().includes(search.toLowerCase()) ||
      i.id.includes(search)
  );

  return (
    <Layout
      title={pageProps.title}
      subtitle="Payment collection, partial payments, and outstanding dues"
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      actions={
        <>
          <SearchBar placeholder="Patient or invoice..." value={search} onChange={setSearch} />
          <Btn>+ Record Payment</Btn>
        </>
      }
    >
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
            <div className="text-[11px] text-emerald-600">Today Collected</div>
            <div className="text-2xl font-semibold text-emerald-700">৳ 38,450</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Monthly Collected</div>
            <div className="text-2xl font-semibold text-slate-900">৳ 2,32,000</div>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <div className="text-[11px] text-red-500">Total Outstanding</div>
            <div className="text-2xl font-semibold text-red-600">৳ {duePatients.reduce((s, i) => s + i.due, 0).toLocaleString()}</div>
          </div>
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
            <div className="text-[11px] text-amber-600">Patients with Due</div>
            <div className="text-2xl font-semibold text-amber-600">{duePatients.length}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Due payments with Collect Due button */}
          <Card>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-800">Outstanding Dues</h3>
              <Badge label={`${duePatients.length} patients`} color="red" />
            </div>
            <div className="divide-y divide-slate-50">
              {filteredDue.map((inv) => (
                <div key={inv.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xs font-bold flex-shrink-0">
                    {inv.patient[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-800">{inv.patient}</div>
                    <div className="text-[10px] font-mono text-slate-400">{inv.id}</div>
                    {/* Due progress mini bar */}
                    <div className="mt-1 h-1 bg-slate-100 rounded-full overflow-hidden w-24">
                      <div
                        className="h-full bg-red-400 rounded-full"
                        style={{ width: `${Math.round((inv.due / inv.total) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right mr-1">
                    <div className="text-sm font-semibold text-red-500">৳ {inv.due.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">of ৳ {inv.total.toLocaleString()}</div>
                  </div>
                  <Btn size="xs" variant="primary">Collect Due</Btn>
                </div>
              ))}
            </div>
          </Card>

          {/* Payment method breakdown — improved bars */}
          <Card className="p-4">
            <h3 className="text-xs font-semibold text-slate-800 mb-4">Payment Methods (This Month)</h3>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((m) => {
                const color = METHOD_COLORS_HEX[m.method] || "#94A3B8";
                return (
                  <div key={m.method}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-sm flex-shrink-0"
                          style={{ background: color }}
                        />
                        <span className="text-xs font-medium text-slate-700">{m.method}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-semibold text-slate-800">৳ {m.amount.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 ml-1">({m.pct}%)</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${m.pct}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Total This Month</span>
                <span className="font-semibold font-mono text-slate-900">৳ 2,32,000</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Payment history */}
        <Card>
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-800">Payment History</h3>
          </div>
          <Table headers={["Invoice No.", "Patient", "Date", "Total", "Paid", "Due", "Method", "Status"]}>
            {paidInvoices.map((inv) => (
              <TR key={inv.id}>
                <TD mono>{inv.id}</TD>
                <TD><span className="font-medium text-slate-800">{inv.patient}</span></TD>
                <TD mono>{inv.date}</TD>
                <TD mono>৳ {inv.total.toLocaleString()}</TD>
                <TD mono><span className="text-emerald-600">৳ {inv.paid.toLocaleString()}</span></TD>
                <TD mono>{inv.due > 0 ? <span className="text-red-500">৳ {inv.due}</span> : "—"}</TD>
                <TD><Badge label={inv.method} color={METHOD_COLOR[inv.method] || "gray"} /></TD>
                <TD>
                  <Badge
                    label={inv.status}
                    color={inv.status === "Paid" ? "green" : inv.status === "Partial" ? "yellow" : "red"}
                  />
                </TD>
              </TR>
            ))}
          </Table>
        </Card>
      </div>
    </Layout>
  );
}
