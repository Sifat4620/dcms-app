import { useEffect, useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD, Modal, Field } from "../components/Layout";
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

export default function Billing({ pageProps, user, onLogout, onUserUpdate }: PageProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, any>>({});
  const [viewInvoice, setViewInvoice] = useState<any | null>(null);
  const [loadingView, setLoadingView] = useState(false);

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

  const load = () => {
    api.get<any>("/billing/invoices?limit=200").then((res) => setInvoices(res.data)).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = invoices.filter((inv) => {
    const matchSearch = (inv.patient_name || "").toLowerCase().includes(search.toLowerCase()) || (inv.invoice_no || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === "All" || inv.status === filter;
    return matchSearch && matchStatus;
  });

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

  return (
    <Layout
      title={pageProps.title}
      subtitle="Patient billing, invoices, and payment tracking"
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
          <Table headers={["Invoice No.", "Patient", "Date", "Total", "Paid", "Due", "Status", "Actions"]}>
            {filtered.map((inv) => (
              <TR key={inv.invoice_id}>
                <TD mono>{inv.invoice_no}</TD>
                <TD>
                  <div className="font-medium text-slate-800">{inv.patient_name}</div>
                  <div className="text-[10px] font-mono text-slate-400">{inv.patient_unique_id}</div>
                </TD>
                <TD mono>{inv.invoice_date}</TD>
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

      <InvoiceModal invoice={viewInvoice} open={!!viewInvoice} onClose={() => setViewInvoice(null)} />
    </Layout>
  );
}
