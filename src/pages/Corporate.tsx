import { useEffect, useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD, Modal, Field, Input } from "../components/Layout";
import { api } from "../data/api";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
}

export default function Corporate({ pageProps, user, onLogout }: PageProps) {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});

  const load = () => {
    api.get<any>("/admin/corporate").then(setClients).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = clients.filter(
    (c) =>
      (c.company_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    try {
      await api.post("/admin/corporate", {
        company_name: form.company_name,
        contact_person: form.contact_person,
        phone: form.phone,
        email: form.email,
        address: form.address,
        credit_limit: Number(form.credit_limit || 0),
        discount_rate: Number(form.discount_rate || 0),
      });
      setShowAdd(false);
      setForm({});
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const totalCredit = clients.reduce((s, c) => s + (c.credit_limit || 0), 0);

  return (
    <Layout
      title={pageProps.title}
      subtitle="Manage corporate accounts, pricing, and monthly billing"
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      actions={
        <>
          <SearchBar placeholder="Search clients..." value={search} onChange={setSearch} />
          <Btn onClick={() => setShowAdd(true)}>+ Add Client</Btn>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Total Clients</div>
            <div className="text-2xl font-semibold text-slate-900">{clients.length}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Total Credit Limit</div>
            <div className="text-2xl font-semibold text-slate-900">৳ {totalCredit.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Avg Discount</div>
            <div className="text-2xl font-semibold text-slate-900">
              {clients.length ? Math.round(clients.reduce((s, c) => s + (c.discount_rate || 0), 0) / clients.length) : 0}%
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Active</div>
            <div className="text-2xl font-semibold text-emerald-600">{clients.filter((c) => c.status === "active").length}</div>
          </div>
        </div>

        <Card>
          <Table headers={["Client ID", "Organization", "Contact", "Phone", "Credit Limit", "Discount", "Status", "Actions"]}>
            {filtered.map((c) => (
              <TR key={c.client_id}>
                <TD mono>CL-{c.client_id}</TD>
                <TD>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold flex-shrink-0">
                      {(c.company_name || "?").split(" ").map((n: any) => n[0]).join("").slice(0, 2)}
                    </div>
                    <span className="font-medium text-slate-800">{c.company_name}</span>
                  </div>
                </TD>
                <TD>{c.contact_person || "—"}</TD>
                <TD mono>{c.phone || "—"}</TD>
                <TD mono>৳ {(c.credit_limit || 0).toLocaleString()}</TD>
                <TD><Badge label={`${c.discount_rate || 0}%`} color="blue" /></TD>
                <TD><Badge label={c.status || "active"} color={c.status === "inactive" ? "gray" : "green"} /></TD>
                <TD><Btn size="xs" variant="secondary">Manage</Btn></TD>
              </TR>
            ))}
            {filtered.length === 0 && <TR><TD className="text-center py-8 text-slate-400">No clients found</TD></TR>}
          </Table>
        </Card>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Corporate Client">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Company Name" required>
            <Input placeholder="Company name" value={form.company_name || ""} onChange={(v) => setForm({ ...form, company_name: v })} />
          </Field>
          <Field label="Contact Person">
            <Input placeholder="Contact person" value={form.contact_person || ""} onChange={(v) => setForm({ ...form, contact_person: v })} />
          </Field>
          <Field label="Phone">
            <Input placeholder="Phone" value={form.phone || ""} onChange={(v) => setForm({ ...form, phone: v })} />
          </Field>
          <Field label="Email">
            <Input placeholder="Email" value={form.email || ""} onChange={(v) => setForm({ ...form, email: v })} />
          </Field>
          <Field label="Credit Limit (BDT)">
            <Input type="number" placeholder="Credit limit" value={form.credit_limit || "0"} onChange={(v) => setForm({ ...form, credit_limit: v })} />
          </Field>
          <Field label="Discount Rate (%)">
            <Input type="number" placeholder="Discount %" value={form.discount_rate || "0"} onChange={(v) => setForm({ ...form, discount_rate: v })} />
          </Field>
          <div className="col-span-2">
            <Field label="Address">
              <Input placeholder="Address" value={form.address || ""} onChange={(v) => setForm({ ...form, address: v })} />
            </Field>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
          <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
          <Btn onClick={handleAdd}>Add Client</Btn>
        </div>
      </Modal>
    </Layout>
  );
}
