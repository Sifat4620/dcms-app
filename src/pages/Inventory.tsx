import { useEffect, useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD, Modal, Field, Input } from "../components/Layout";
import { api } from "../data/api";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
}

export default function Inventory({ pageProps, user, onLogout }: PageProps) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"stock" | "suppliers" | "purchases">("stock");
  const [items, setItems] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [adjust, setAdjust] = useState<any | null>(null);
  const [qty, setQty] = useState("");
  const [form, setForm] = useState<Record<string, any>>({});

  const load = () => {
    api.get<any>("/inventory?limit=200").then((res) => setItems(res.data)).catch(() => {});
    api.get<any>("/inventory/suppliers").then(setSuppliers).catch(() => {});
    api.get<any>("/inventory/purchases").then(setPurchases).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((i) =>
    (i.item_name || "").toLowerCase().includes(search.toLowerCase())
  );
  const lowStock = items.filter((i) => i.current_stock <= i.reorder_level);
  const inStock = items.filter((i) => i.current_stock > i.reorder_level);

  const handleAdj = async () => {
    try {
      await api.post("/inventory/stock-log", { item_id: adjust.item_id, log_type: "Adjustment", quantity: Number(qty) });
      setAdjust(null);
      setQty("");
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAdd = async () => {
    try {
      await api.post("/inventory", { item_name: form.item_name, unit: form.unit, current_stock: Number(form.current_stock || 0), reorder_level: Number(form.reorder_level || 10) });
      setShowAdd(false);
      setForm({});
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <Layout
      title={pageProps.title}
      subtitle="Track lab supplies, reagents, and consumables"
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      actions={
        <>
          <SearchBar placeholder="Search items..." value={search} onChange={setSearch} />
          <Btn onClick={() => setShowAdd(true)}>+ Add Item</Btn>
        </>
      }
    >
      <div className="space-y-4">
        {lowStock.length > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.072 16.5C2.302 18.333 3.264 20 4.804 20z" />
            </svg>
            <span className="text-xs text-red-700 font-medium">
              {lowStock.length} items at or below reorder level: {lowStock.map((i) => i.item_name).join(", ")}
            </span>
          </div>
        )}

        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Total Items</div>
            <div className="text-2xl font-semibold text-slate-900">{items.length}</div>
          </div>
          <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
            <div className="text-[11px] text-emerald-600">In Stock</div>
            <div className="text-2xl font-semibold text-emerald-600">{inStock.length}</div>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <div className="text-[11px] text-red-500">Low Stock</div>
            <div className="text-2xl font-semibold text-red-500">{lowStock.length}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Suppliers</div>
            <div className="text-2xl font-semibold text-slate-900">{suppliers.length}</div>
          </div>
        </div>

        <div className="flex gap-1 p-1 bg-white rounded-lg border border-slate-200 w-fit">
          {(["stock", "suppliers", "purchases"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${tab === t ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {t === "stock" ? "Stock Items" : t === "suppliers" ? "Suppliers" : "Purchase Orders"}
            </button>
          ))}
        </div>

        {tab === "stock" && (
          <Card>
            <Table headers={["Item ID", "Name", "Unit", "Stock Level", "Reorder", "Expiry Tracking", "Actions"]}>
              {filtered.map((item) => (
                <TR key={item.item_id}>
                  <TD mono>ITM-{item.item_id}</TD>
                  <TD><span className="font-medium text-slate-800">{item.item_name}</span></TD>
                  <TD>{item.unit}</TD>
                  <TD>
                    <span className={`font-mono text-xs font-semibold ${item.current_stock <= item.reorder_level ? "text-red-500" : "text-slate-700"}`}>
                      {item.current_stock}
                    </span>
                    {item.current_stock <= item.reorder_level && <Badge label="Low" color="red" />}
                  </TD>
                  <TD mono>{item.reorder_level}</TD>
                  <TD>{item.expiry_tracking ? "Yes" : "No"}</TD>
                  <TD>
                    <Btn size="xs" variant="secondary" onClick={() => setAdjust(item)}>Adjust Stock</Btn>
                  </TD>
                </TR>
              ))}
              {filtered.length === 0 && <TR><TD className="text-center py-8 text-slate-400">No items found</TD></TR>}
            </Table>
          </Card>
        )}

        {tab === "suppliers" && (
          <Card>
            <Table headers={["ID", "Name", "Contact Person", "Phone", "Email", "Address", "Status"]}>
              {suppliers.map((s) => (
                <TR key={s.supplier_id}>
                  <TD mono>SUP-{s.supplier_id}</TD>
                  <TD><span className="font-medium text-slate-800">{s.supplier_name}</span></TD>
                  <TD>{s.contact_person || "—"}</TD>
                  <TD mono>{s.phone || "—"}</TD>
                  <TD>{s.email || "—"}</TD>
                  <TD>{s.address || "—"}</TD>
                  <TD><Badge label={s.status || "active"} color="green" /></TD>
                </TR>
              ))}
              {suppliers.length === 0 && <TR><TD className="text-center py-8 text-slate-400">No suppliers</TD></TR>}
            </Table>
          </Card>
        )}

        {tab === "purchases" && (
          <Card>
            <Table headers={["Purchase ID", "Supplier", "Date", "Total (BDT)", "Invoice No."]}>
              {purchases.map((p) => (
                <TR key={p.purchase_id}>
                  <TD mono>PO-{p.purchase_id}</TD>
                  <TD>{p.supplier_name || "—"}</TD>
                  <TD mono>{p.purchase_date}</TD>
                  <TD mono>৳ {(p.total_amount || 0).toLocaleString()}</TD>
                  <TD mono>{p.invoice_no || "—"}</TD>
                </TR>
              ))}
              {purchases.length === 0 && <TR><TD className="text-center py-8 text-slate-400">No purchases</TD></TR>}
            </Table>
          </Card>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Inventory Item">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Item Name" required>
            <Input placeholder="Item name" value={form.item_name || ""} onChange={(v) => setForm({ ...form, item_name: v })} />
          </Field>
          <Field label="Unit">
            <Input placeholder="pcs / box" value={form.unit || ""} onChange={(v) => setForm({ ...form, unit: v })} />
          </Field>
          <Field label="Current Stock">
            <Input type="number" value={form.current_stock || "0"} onChange={(v) => setForm({ ...form, current_stock: v })} />
          </Field>
          <Field label="Reorder Level">
            <Input type="number" value={form.reorder_level || "10"} onChange={(v) => setForm({ ...form, reorder_level: v })} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
          <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
          <Btn onClick={handleAdd}>Add Item</Btn>
        </div>
      </Modal>

      <Modal open={!!adjust} onClose={() => setAdjust(null)} title={`Adjust Stock — ${adjust?.item_name || ""}`}>
        <Field label="New Stock Quantity" required>
          <Input type="number" placeholder="Quantity" value={qty} onChange={setQty} />
        </Field>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
          <Btn variant="secondary" onClick={() => setAdjust(null)}>Cancel</Btn>
          <Btn onClick={handleAdj}>Update Stock</Btn>
        </div>
      </Modal>
    </Layout>
  );
}
