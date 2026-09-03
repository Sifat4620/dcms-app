import { useEffect, useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD, Modal, Field, Input } from "../components/Layout";
import InvoiceModal, { openInvoiceFor } from "../components/InvoiceModal";
import { api } from "../data/api";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
  onUserUpdate: (user: any) => void;
}

const STATUS_COLOR: Record<string, "green" | "yellow" | "red"> = {
  Paid: "green",
  Partial: "yellow",
  Unpaid: "red",
};

const METHOD_COLOR: Record<string, "green" | "blue" | "purple"> = {
  Cash: "green",
  Card: "blue",
  "Mobile Banking": "purple",
  "Bank Transfer": "purple",
  "Online Payment": "purple",
};

export default function Billing({ pageProps, user, onLogout, onUserUpdate }: PageProps) {
  const [tab, setTab] = useState<"invoices" | "dues">("invoices");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [dueList, setDueList] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, any>>({});
  const [viewInvoice, setViewInvoice] = useState<any | null>(null);
  const [loadingView, setLoadingView] = useState(false);
  const [payTarget, setPayTarget] = useState<any | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [trxNo, setTrxNo] = useState("");
  const [invoiceData, setInvoiceData] = useState<any | null>(null);

  const load = () => {
    api.get<any>("/billing/invoices?limit=200").then((res) => setInvoices(res.data)).catch(() => {});
    api.get<any>("/billing/due").then(setDueList).catch(() => {});
    api.get<any>("/billing/payments?limit=100").then(setPayments).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const viewInvoiceDetail = async (id: number) => {
    setLoadingView(true);
    try {
      const data = await openInvoiceFor(id);
      setViewInvoice(data);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoadingView(false);
    }
  };

  const openInvoice = async (invoiceId: number) => {
    try {
      const data = await api.get<any>(`/billing/invoices/${invoiceId}`);
      setInvoiceData(data);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filtered = invoices.filter((inv) => {
    const matchSearch = (inv.patient_name || "").toLowerCase().includes(search.toLowerCase()) || (inv.invoice_no || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === "All" || inv.status === filter;
    return matchSearch && matchStatus;
  });

  const filteredDue = dueList.filter(
    (i) => (i.patient_name || "").toLowerCase().includes(search.toLowerCase()) || (i.invoice_no || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = invoices.reduce((s, i) => s + (i.paid_amount || 0), 0);
  const totalDue = invoices.reduce((s, i) => s + (i.due_amount || 0), 0);
  const totalBilled = invoices.reduce((s, i) => s + (i.total_amount || 0), 0);
  const totalDiscount = invoices.reduce((s, i) => s + (i.discount || 0), 0);

  const applyDiscount = async () => {
    if (!form.invoice_id) {
      alert("Select an invoice");
      return;
    }
    if (Number(form.discount || 0) < 0) {
      alert("Enter a valid discount amount");
      return;
    }
    try {
      await api.post(`/billing/invoices/${form.invoice_id}/discount`, {
        discount: Number(form.discount || 0),
      });
      setShowCreate(false);
      setForm({});
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const openPay = (inv: any) => {
    setPayTarget(inv);
    setAmount("");
    setMethod("Cash");
    setTrxNo("");
  };

  const recordPayment = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid amount");
      return;
    }
    if (method !== "Cash" && !trxNo.trim()) {
      alert("Transaction number (Trx ID) is required for non-cash payments");
      return;
    }
    try {
      await api.post(`/billing/invoices/${payTarget.invoice_id}/payments`, {
        amount: Number(amount),
        payment_method: method,
        transaction_no: method !== "Cash" ? trxNo.trim() : null,
      });
      const invId = payTarget.invoice_id;
      setPayTarget(null);
      setAmount("");
      setTrxNo("");
      load();
      openInvoice(invId);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <Layout
      title={pageProps.title}
      subtitle="Patient billing, invoices, dues, and payment tracking"
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      onUserUpdate={onUserUpdate}
      actions={
        <>
          <SearchBar placeholder="Patient or invoice ID..." value={search} onChange={setSearch} />
          <Btn onClick={() => setShowCreate(true)}>+ Create Discount</Btn>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
          <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
            <div className="text-[11px] text-emerald-600">Total Discount</div>
            <div className="text-2xl font-semibold text-emerald-600">৳ {totalDiscount.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex gap-2">
          {(["invoices", "dues"] as const).map((t) => {
            const label = t === "invoices" ? "Invoices" : "Dues & Payments";
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${tab === t ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {tab === "invoices" ? (
          <>
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
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s === "Paid" ? "#10B981" : s === "Partial" ? "#F59E0B" : "#EF4444" }} />
                    )}
                    {s}
                    <span className={`text-[10px] ${filter === s ? "opacity-70" : "text-slate-400"}`}>({count})</span>
                  </button>
                );
              })}
            </div>

            <Card>
              <Table headers={["Invoice No.", "Patient", "Date", "Doctor Fee", "Lab Fee", "Discount", "Total", "Paid", "Due", "Status", "Actions"]}>
                {filtered.map((inv) => (
                  <TR key={inv.invoice_id}>
                    <TD mono>{inv.invoice_no}</TD>
                    <TD>
                      <div className="font-medium text-slate-800">{inv.patient_name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{inv.patient_unique_id}</div>
                    </TD>
                    <TD mono>{inv.invoice_date}</TD>
                    <TD mono><span className="text-sky-600 font-medium">৳ {(inv.doctor_fee || 0).toLocaleString()}</span></TD>
                    <TD mono><span className="text-violet-600 font-medium">৳ {(inv.lab_fee || 0).toLocaleString()}</span></TD>
                    <TD mono>
                      {inv.discount > 0 ? <span className="text-emerald-600 font-medium">-৳ {inv.discount.toLocaleString()}</span> : <span className="text-slate-300">—</span>}
                    </TD>
                    <TD mono><span className="font-semibold">৳ {inv.total_amount.toLocaleString()}</span></TD>
                    <TD mono><span className="text-emerald-600 font-medium">৳ {inv.paid_amount.toLocaleString()}</span></TD>
                    <TD mono>
                      {inv.due_amount > 0 ? <span className="text-red-500 font-medium">৳ {inv.due_amount.toLocaleString()}</span> : <span className="text-slate-400">—</span>}
                    </TD>
                    <TD><Badge label={inv.status} color={STATUS_COLOR[inv.status] || "gray"} /></TD>
                    <TD><Btn size="xs" variant="secondary" onClick={() => viewInvoiceDetail(inv.invoice_id)}>{loadingView ? "..." : "View / Print"}</Btn></TD>
                  </TR>
                ))}
                {filtered.length === 0 && (
                  <TR><TD className="text-center py-8 text-slate-400">No invoices found</TD></TR>
                )}
              </Table>
            </Card>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-800">Outstanding Dues</h3>
                <Badge label={`${dueList.length} invoices`} color="red" />
              </div>
              <div className="divide-y divide-slate-50">
                {filteredDue.map((inv) => (
                  <div key={inv.invoice_id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xs font-bold flex-shrink-0">
                      {(inv.patient_name || "?").slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-800">{inv.patient_name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{inv.invoice_no}</div>
                    </div>
                    <div className="text-right mr-1">
                      <div className="text-sm font-semibold text-red-500">৳ {inv.due_amount.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">of ৳ {inv.total_amount.toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Btn size="xs" variant="secondary" onClick={() => openInvoice(inv.invoice_id)}>Invoice</Btn>
                      <Btn size="xs" variant="primary" onClick={() => openPay(inv)}>Collect Due</Btn>
                    </div>
                  </div>
                ))}
                {filteredDue.length === 0 && (
                  <div className="px-4 py-8 text-center text-xs text-slate-400">No outstanding dues</div>
                )}
              </div>
            </Card>

            <Card>
              <div className="px-4 py-3 border-b border-slate-100">
                <h3 className="text-xs font-semibold text-slate-800">Recent Payments</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {payments.slice(0, 8).map((p) => (
                  <div key={p.payment_id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold flex-shrink-0">
                      {(p.payment_method || "?").slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-800">Invoice #{p.invoice_id}</div>
                      <div className="text-[10px] text-slate-400">{p.payment_date}</div>
                      {p.transaction_no && <div className="text-[10px] font-mono text-sky-600">Trx: {p.transaction_no}</div>}
                    </div>
                    <Badge label={p.payment_method || "Cash"} color={METHOD_COLOR[p.payment_method] || "green"} />
                    <div className="text-sm font-semibold text-emerald-600">৳ {p.amount.toLocaleString()}</div>
                    <Btn size="xs" variant="secondary" onClick={() => openInvoice(p.invoice_id)}>Invoice</Btn>
                  </div>
                ))}
                {payments.length === 0 && (
                  <div className="px-4 py-8 text-center text-xs text-slate-400">No payments recorded</div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Discount" width="max-w-xl">
        <div className="space-y-4">
          <Field label="Select Invoice" required>
            <select
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400 bg-white"
              value={form.invoice_id || ""}
              onChange={(e) => setForm({ ...form, invoice_id: e.target.value })}
            >
              <option value="">Select an invoice to add discount</option>
              {invoices.map((inv) => (
                <option key={inv.invoice_id} value={inv.invoice_id}>
                  {inv.invoice_no} — {inv.patient_name} (৳ {(inv.total_amount || 0).toLocaleString()})
                </option>
              ))}
            </select>
          </Field>
          {(() => {
            const selected = invoices.find((inv) => String(inv.invoice_id) === String(form.invoice_id));
            const original = selected ? Number(selected.total_amount) || 0 : 0;
            const disc = Number(form.discount || 0);
            const final = original - disc;
            return (
              <>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-600 mb-2">Discount Amount</div>
                  {selected ? (
                    <>
                      <div className="flex justify-between text-xs"><span className="text-slate-500">Original Amount</span><span className="font-medium text-slate-800">৳ {original.toLocaleString()}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-emerald-600">Discount (BDT)</span><span className="font-medium text-emerald-600">-৳ {disc.toLocaleString()}</span></div>
                      <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-200"><span className="text-slate-800">Final Amount</span><span className="text-sky-700">৳ {Math.max(0, final).toLocaleString()}</span></div>
                    </>
                  ) : (
                    <div className="text-[11px] text-slate-400 py-1">Select an invoice to see the breakdown.</div>
                  )}
                </div>
                <Field label="Discount (BDT)">
                  <input
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.discount || ""}
                    onChange={(e) => setForm({ ...form, discount: e.target.value })}
                  />
                </Field>
              </>
            );
          })()}
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
          <Btn variant="secondary" onClick={() => { setShowCreate(false); setForm({}); }}>Cancel</Btn>
          <Btn onClick={applyDiscount}>Apply Discount</Btn>
        </div>
      </Modal>

      <Modal open={!!payTarget} onClose={() => setPayTarget(null)} title={`Collect Payment — ${payTarget?.invoice_no || ""}`}>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
            <div className="text-slate-500">Patient: <span className="font-medium text-slate-800">{payTarget?.patient_name}</span></div>
            <div className="text-slate-500">Outstanding due: <span className="font-mono font-semibold text-red-500">৳ {payTarget?.due_amount?.toLocaleString()}</span></div>
          </div>
          <Field label="Amount" required>
            <Input type="number" placeholder="Amount (BDT)" value={amount} onChange={setAmount} />
          </Field>
          <Field label="Payment Method">
            <select
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400 bg-white"
              value={method}
              onChange={(e) => { setMethod(e.target.value); setTrxNo(""); }}
            >
              {["Cash", "Card", "Mobile Banking", "Bank Transfer", "Online Payment"].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          {method !== "Cash" && (
            <Field label="Transaction Number (Trx ID)" required>
              <Input placeholder="bKash/Card/Online Trx ID" value={trxNo} onChange={setTrxNo} />
            </Field>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
          <Btn variant="secondary" onClick={() => { setPayTarget(null); setTrxNo(""); }}>Cancel</Btn>
          <Btn onClick={recordPayment}>Record Payment</Btn>
        </div>
      </Modal>

      <InvoiceModal invoice={viewInvoice} open={!!viewInvoice} onClose={() => setViewInvoice(null)} />
      <InvoiceModal invoice={invoiceData} open={!!invoiceData} onClose={() => setInvoiceData(null)} />
    </Layout>
  );
}
