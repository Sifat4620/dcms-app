import { useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD } from "../components/Layout";
import { inventoryItems } from "../data/mockData";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
}

export default function Inventory({ pageProps, user, onLogout }: PageProps) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"stock" | "suppliers" | "purchases">("stock");

  const filtered = inventoryItems.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = inventoryItems.filter((i) => i.status === "Low Stock");

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
          <Btn>+ Add Item</Btn>
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
              {lowStock.length} items below reorder level: {lowStock.map((i) => i.name).join(", ")}
            </span>
            <Btn size="xs" variant="danger">Create Purchase Order</Btn>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Total Items</div>
            <div className="text-2xl font-semibold text-slate-900">{inventoryItems.length}</div>
          </div>
          <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
            <div className="text-[11px] text-emerald-600">In Stock</div>
            <div className="text-2xl font-semibold text-emerald-600">{inventoryItems.filter((i) => i.status === "In Stock").length}</div>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <div className="text-[11px] text-red-500">Low Stock</div>
            <div className="text-2xl font-semibold text-red-500">{lowStock.length}</div>
          </div>
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
            <div className="text-[11px] text-amber-600">Expiring Soon</div>
            <div className="text-2xl font-semibold text-amber-600">2</div>
          </div>
        </div>

        {/* Tabs */}
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
            <Table headers={["Item ID", "Name", "Category", "Unit", "Stock Level", "Reorder", "Expiry", "Status", "Actions"]}>
              {filtered.map((item) => {
                const pct = Math.min(Math.round((item.stock / (item.reorderLevel * 3)) * 100), 100);
                const isLow = item.stock <= item.reorderLevel;
                return (
                  <TR key={item.id}>
                    <TD mono>{item.id}</TD>
                    <TD><span className="font-medium text-slate-800">{item.name}</span></TD>
                    <TD>{item.category}</TD>
                    <TD>{item.unit}</TD>
                    <TD>
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: isLow ? "#EF4444" : pct < 50 ? "#F59E0B" : "#10B981",
                            }}
                          />
                        </div>
                        <span className={`font-mono text-xs font-semibold flex-shrink-0 ${isLow ? "text-red-500" : "text-slate-700"}`}>
                          {item.stock}
                        </span>
                      </div>
                    </TD>
                    <TD mono>{item.reorderLevel}</TD>
                    <TD mono>{item.expiry}</TD>
                    <TD><Badge label={item.status} color={item.status === "In Stock" ? "green" : "red"} /></TD>
                    <TD>
                      <div className="flex gap-1">
                        <Btn size="xs" variant="secondary">Stock In</Btn>
                        <Btn size="xs" variant="ghost">Stock Out</Btn>
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </Table>
          </Card>
        )}

        {tab === "suppliers" && (
          <Card>
            <Table headers={["Supplier ID", "Name", "Contact Person", "Phone", "Email", "Address", "Status", "Actions"]}>
              {[
                { id: "SUP-001", name: "MedLab Supplies Ltd.", contact: "Rafiqul Hasan", phone: "01711-100001", email: "info@medlab.com", address: "Dhaka, BD", status: "Active" },
                { id: "SUP-002", name: "BioReagent BD", contact: "Sumon Ahmed", phone: "01812-200002", email: "sales@bioreagent.com", address: "Chittagong, BD", status: "Active" },
                { id: "SUP-003", name: "HealthCare Depot", contact: "Tania Begum", phone: "01913-300003", email: "contact@hcdepot.com", address: "Dhaka, BD", status: "Active" },
              ].map((s) => (
                <TR key={s.id}>
                  <TD mono>{s.id}</TD>
                  <TD><span className="font-medium text-slate-800">{s.name}</span></TD>
                  <TD>{s.contact}</TD>
                  <TD mono>{s.phone}</TD>
                  <TD>{s.email}</TD>
                  <TD>{s.address}</TD>
                  <TD><Badge label={s.status} color="green" /></TD>
                  <TD>
                    <div className="flex gap-1">
                      <Btn size="xs" variant="secondary">Edit</Btn>
                      <Btn size="xs" variant="ghost">History</Btn>
                    </div>
                  </TD>
                </TR>
              ))}
            </Table>
          </Card>
        )}

        {tab === "purchases" && (
          <Card>
            <Table headers={["Purchase ID", "Supplier", "Date", "Items", "Total (BDT)", "Status", "Actions"]}>
              {[
                { id: "PO-001", supplier: "MedLab Supplies Ltd.", date: "2026-08-25", items: 5, total: 18500, status: "Received" },
                { id: "PO-002", supplier: "BioReagent BD", date: "2026-08-20", items: 3, total: 42000, status: "Received" },
                { id: "PO-003", supplier: "HealthCare Depot", date: "2026-09-01", items: 4, total: 12800, status: "Pending" },
              ].map((p) => (
                <TR key={p.id}>
                  <TD mono>{p.id}</TD>
                  <TD>{p.supplier}</TD>
                  <TD mono>{p.date}</TD>
                  <TD>{p.items} items</TD>
                  <TD mono>৳ {p.total.toLocaleString()}</TD>
                  <TD><Badge label={p.status} color={p.status === "Received" ? "green" : "yellow"} /></TD>
                  <TD>
                    <div className="flex gap-1">
                      <Btn size="xs" variant="secondary">View</Btn>
                    </div>
                  </TD>
                </TR>
              ))}
            </Table>
          </Card>
        )}
      </div>
    </Layout>
  );
}
