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
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, any>>({});
  const [viewInvoice, setViewInvoice] = useState<any | null>(null);
  const [loadingView, setLoadingView] = useState(false);
  const [payTarget, setPayTarget] = useState<any | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
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

  const addItem = () => {
    setItems([...items, { item_name: "", item_type: "Test", unit_price: 0, quantity: 1, item_id: null }]);
  };

  const setItem = (i: number, patch: Record<string, any>) => {
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  };

  const createInvoice = async () => {
    try {
      await api.post("/billing/invoices", {
        visit_id: Number(form.visit_id),
        items: items.map((it) => ({ ...it, unit_price: Number(it.unit_price), quantity: Number(it.quantity) })),
        discount: Number(form.discount || 0),
      });
      setShowCreate(false);
      setItems([]);
      setForm({});
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const recordPayment = async () => {
    try {
      await api.post(`/billing/invoices/${payTarget.invoice_id}/payments`, {
        amount: Number(amount),
        payment_method: method,
      });
      const invId = payTarget.invoice_id;
      setPayTarget(null);
      setAmount("");
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
          <Btn onClick={() => setShowCreate(true)}>+ Create Invoice</Btn>
        </>
      }
    >
      <div className="space-y-4">
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
              <Table headers={["Invoice No.", "Patient", "Date", "Doctor Fee", "Lab Fee", "Total", "Paid", "Due", "Status", "Actions"]}>
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
                      <Btn size="xs" variant="primary" onClick={() => setPayTarget(inv)}>Collect Due</Btn>
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Invoice" width="max-w-2xl">
        <div className="space-y-4">
          <Field label="Visit ID" required>
            <input
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400"
              placeholder="Enter visit ID"
              value={form.visit_id || ""}
              onChange={(e) => setForm({ ...form, visit_id: e.target.value })}
            />
          </Field>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-semibold text-slate-600">Invoice Items</div>
              <Btn size="xs" variant="secondary" onClick={addItem}>+ Add Item</Btn>
            </div>
            {items.map((it, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400"
                  placeholder="Item name" value={it.item_name}
                  onChange={(e) => setItem(i, { item_name: e.target.value })}
                />
                <select
                  className="px-2 py-2 text-xs border border-slate-200 rounded-md bg-white"
                  value={it.item_type}
                  onChange={(e) => setItem(i, { item_type: e.target.value })}
                >
                  <option value="Test">Test</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Package">Package</option>
                </select>
                <input
                  className="w-24 px-2 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400"
                  type="number" placeholder="Price" value={it.unit_price}
                  onChange={(e) => setItem(i, { unit_price: e.target.value })}
                />
                <input
                  className="w-16 px-2 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400"
                  type="number" placeholder="Qty" value={it.quantity}
                  onChange={(e) => setItem(i, { quantity: e.target.value })}
                />
                <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
              </div>
            ))}
            {items.length === 0 && <div className="text-[11px] text-slate-400 py-2">No items added yet.</div>}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
          <Btn variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Btn>
          <Btn onClick={createInvoice}>Generate Invoice</Btn>
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
              onChange={(e) => setMethod(e.target.value)}
            >
              {["Cash", "Card", "Mobile Banking", "Bank Transfer", "Online Payment"].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
          <Btn variant="secondary" onClick={() => setPayTarget(null)}>Cancel</Btn>
          <Btn onClick={recordPayment}>Record Payment</Btn>
        </div>
      </Modal>

      <InvoiceModal invoice={viewInvoice} open={!!viewInvoice} onClose={() => setViewInvoice(null)} />
      <InvoiceModal invoice={invoiceData} open={!!invoiceData} onClose={() => setInvoiceData(null)} />
    </Layout>
  );
}
