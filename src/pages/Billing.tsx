import { useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD } from "../components/Layout";
import { invoices } from "../data/mockData";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
}

const STATUS_COLOR: Record<string, "green" | "yellow" | "red"> = {
  Paid: "green",
  Partial: "yellow",
  Unpaid: "red",
};

export default function Billing({ pageProps, user, onLogout }: PageProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);

  const filtered = invoices.filter((inv) => {
    const matchSearch = inv.patient.toLowerCase().includes(search.toLowerCase()) || inv.id.includes(search);
    const matchStatus = filter === "All" || inv.status === filter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = invoices.reduce((s, i) => s + i.paid, 0);
  const totalDue = invoices.reduce((s, i) => s + i.due, 0);
  const totalBilled = invoices.reduce((s, i) => s + i.total, 0);

  const paidCount = invoices.filter((i) => i.status === "Paid").length;
  const partialCount = invoices.filter((i) => i.status === "Partial").length;
  const unpaidCount = invoices.filter((i) => i.status === "Unpaid").length;
  const paidPct = Math.round((totalRevenue / totalBilled) * 100);
  const duePct = Math.round((totalDue / totalBilled) * 100);

  return (
    <Layout
      title={pageProps.title}
      subtitle="Patient billing, invoices, and payment tracking"
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      actions={
        <>
          <SearchBar placeholder="Patient or invoice ID..." value={search} onChange={setSearch} />
          <Btn onClick={() => setShowCreate(true)}>+ Create Invoice</Btn>
        </>
      }
    >
      <div className="space-y-4">
        {/* Color-coded payment status indicator bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-700">Payment Status Overview</h3>
            <span className="text-[11px] text-slate-400">{invoices.length} total invoices</span>
          </div>
          {/* Status bar */}
          <div className="flex h-3 rounded-full overflow-hidden mb-3">
            <div className="bg-emerald-500 transition-all" style={{ width: `${paidPct}%` }} title={`Paid ${paidPct}%`} />
            <div className="bg-amber-400 transition-all" style={{ width: `${Math.round((partialCount / invoices.length) * 100)}%` }} title="Partial" />
            <div className="bg-red-400 transition-all" style={{ width: `${duePct}%` }} title={`Unpaid ${duePct}%`} />
          </div>
          <div className="flex gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span className="text-slate-600">Paid</span>
              <span className="font-semibold text-slate-900">{paidCount}</span>
              <span className="text-slate-400">({paidPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
              <span className="text-slate-600">Partial</span>
              <span className="font-semibold text-slate-900">{partialCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-red-400" />
              <span className="text-slate-600">Unpaid</span>
              <span className="font-semibold text-slate-900">{unpaidCount}</span>
              <span className="text-slate-400">({duePct}%)</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Total Invoices</div>
            <div className="text-2xl font-semibold text-slate-900">{invoices.length}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Total Billed</div>
            <div className="text-2xl font-semibold text-slate-900">৳ {totalBilled.toLocaleString()}</div>
          </div>
          <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
            <div className="text-[11px] text-emerald-600">Collected</div>
            <div className="text-2xl font-semibold text-emerald-600">৳ {totalRevenue.toLocaleString()}</div>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <div className="text-[11px] text-red-500">Outstanding</div>
            <div className="text-2xl font-semibold text-red-500">৳ {totalDue.toLocaleString()}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {["All", "Paid", "Partial", "Unpaid"].map((s) => {
            const count = s === "All" ? invoices.length : invoices.filter((i) => i.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === s ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
              >
                {s !== "All" && (
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: s === "Paid" ? "#10B981" : s === "Partial" ? "#F59E0B" : "#EF4444" }}
                  />
                )}
                {s}
                <span className={`text-[10px] ${filter === s ? "opacity-70" : "text-slate-400"}`}>({count})</span>
              </button>
            );
          })}
        </div>

        <Card>
          <Table headers={["Invoice No.", "Patient", "Date", "Subtotal", "Discount", "Total", "Paid", "Due", "Method", "Status", "Actions"]}>
            {filtered.map((inv) => (
              <TR key={inv.id}>
                <TD mono>{inv.id}</TD>
                <TD>
                  <div className="font-medium text-slate-800">{inv.patient}</div>
                  <div className="text-[10px] font-mono text-slate-400">{inv.patientId}</div>
                </TD>
                <TD mono>{inv.date}</TD>
                <TD mono>৳ {inv.subtotal.toLocaleString()}</TD>
                <TD mono>{inv.discount > 0 ? `৳ ${inv.discount}` : "—"}</TD>
                <TD mono><span className="font-semibold">৳ {inv.total.toLocaleString()}</span></TD>
                <TD mono><span className="text-emerald-600 font-medium">৳ {inv.paid.toLocaleString()}</span></TD>
                <TD mono>
                  {inv.due > 0 ? <span className="text-red-500 font-medium">৳ {inv.due.toLocaleString()}</span> : <span className="text-slate-400">—</span>}
                </TD>
                <TD>{inv.method}</TD>
                <TD><Badge label={inv.status} color={STATUS_COLOR[inv.status] || "gray"} /></TD>
                <TD>
                  <div className="flex gap-1">
                    <Btn size="xs" variant="secondary">Print</Btn>
                    {inv.due > 0 && <Btn size="xs" variant="primary">Pay Due</Btn>}
                  </div>
                </TD>
              </TR>
            ))}
          </Table>
        </Card>
      </div>

      {/* Create Invoice Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-slate-900">Create New Invoice</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Patient</label>
                <input className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400" placeholder="Search patient..." />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Discount (%)</label>
                <input type="number" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400" placeholder="0" />
              </div>
            </div>
            <div className="border border-slate-200 rounded-lg p-3 mb-4">
              <div className="text-[11px] font-semibold text-slate-600 mb-2">Invoice Items</div>
              {[
                { name: "Consultation - Dr. Rafiqul Islam", type: "Consultation", price: 800 },
                { name: "CBC (Blood Test)", type: "Test", price: 450 },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <span className="flex-1 text-xs text-slate-700">{item.name}</span>
                  <Badge label={item.type} color="blue" />
                  <span className="font-mono text-xs text-slate-700">৳ {item.price}</span>
                  <button className="text-red-400 hover:text-red-600">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button className="mt-2 text-xs text-sky-500 hover:text-sky-700">+ Add Item</button>
            </div>
            <div className="flex justify-between items-end">
              <div className="text-right ml-auto mr-6 space-y-1 text-xs">
                <div className="flex justify-between gap-8"><span className="text-slate-500">Subtotal</span><span className="font-mono">৳ 1,250</span></div>
                <div className="flex justify-between gap-8"><span className="text-slate-500">Discount</span><span className="font-mono text-red-500">— ৳ 0</span></div>
                <div className="flex justify-between gap-8 font-semibold text-slate-900 border-t border-slate-100 pt-1"><span>Total</span><span className="font-mono">৳ 1,250</span></div>
              </div>
              <div className="flex gap-2">
                <Btn variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Btn>
                <Btn onClick={() => setShowCreate(false)}>Generate Invoice</Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
