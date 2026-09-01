import { useEffect, useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD, Modal, Field, Input } from "../components/Layout";
import { api } from "../data/api";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
}

const AVAIL_COLORS = ["#10B981", "#F59E0B", "#EF4444", "#10B981", "#10B981"];

export default function Doctors({ pageProps, user, onLogout }: PageProps) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "cards">("table");
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", specialization: "", degree: "", bmdc_no: "", phone: "", email: "", consultation_fee: "0" });

  const loadData = () => {
    api.get<any>("/doctors?limit=100").then((res) => setDoctors(res.data)).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = doctors.filter(
    (d) =>
      (d.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.specialization || "").toLowerCase().includes(search.toLowerCase())
  );

  const todaySchedule = doctors.slice(0, 3);

  const handleAdd = async () => {
    setLoading(true);
    try {
      await api.post("/doctors", { ...form, consultation_fee: Number(form.consultation_fee) });
      setShowAdd(false);
      setForm({ name: "", specialization: "", degree: "", bmdc_no: "", phone: "", email: "", consultation_fee: "0" });
      loadData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      title={pageProps.title}
      subtitle={`${doctors.length} registered doctors`}
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      actions={
        <>
          <SearchBar placeholder="Search doctors..." value={search} onChange={setSearch} />
          <div className="flex rounded-md overflow-hidden border border-slate-200">
            <button
              onClick={() => setView("table")}
              className={`px-2.5 py-1.5 text-xs transition-colors ${view === "table" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              Table
            </button>
            <button
              onClick={() => setView("cards")}
              className={`px-2.5 py-1.5 text-xs transition-colors ${view === "cards" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              Cards
            </button>
          </div>
          <Btn onClick={() => setShowAdd(true)}>+ Add Doctor</Btn>
        </>
      }
    >
      <div className="space-y-4">
        {view === "table" ? (
          <Card>
            <Table headers={["Doctor ID", "Name", "Specialization", "Degree", "BMDC No.", "Phone", "Fee (BDT)", "Status", "Actions"]}>
              {filtered.map((d, idx) => (
                <TR key={d.doctor_id}>
                  <TD mono>DR-{d.doctor_id}</TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold flex-shrink-0">
                          {(d.name || "").replace("Dr. ", "").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                        </div>
                      </div>
                      <span className="font-medium text-slate-800">{d.name}</span>
                    </div>
                  </TD>
                  <TD><Badge label={d.specialization || "General"} color="blue" /></TD>
                  <TD>{d.degree || "—"}</TD>
                  <TD mono>{d.bmdc_no || "—"}</TD>
                  <TD mono>{d.phone || "—"}</TD>
                  <TD mono>৳ {d.consultation_fee}</TD>
                  <TD><Badge label={d.status} color={d.status === "active" ? "green" : "gray"} /></TD>
                  <TD>
                    <div className="flex gap-1">
                      <Btn size="xs" variant="secondary">Profile</Btn>
                    </div>
                  </TD>
                </TR>
              ))}
            </Table>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((d, idx) => (
              <Card key={d.doctor_id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 text-base font-bold flex-shrink-0">
                    {(d.name || "").replace("Dr. ", "").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900">{d.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{d.specialization}</div>
                    <div className="text-[11px] text-slate-400">{d.degree}</div>
                  </div>
                  <Badge label={d.status} color={d.status === "active" ? "green" : "gray"} />
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                  <div><span className="text-slate-400">BMDC</span><div className="font-mono text-slate-600">{d.bmdc_no || "—"}</div></div>
                  <div><span className="text-slate-400">Fee</span><div className="text-slate-700 font-semibold">৳ {d.consultation_fee}</div></div>
                  <div><span className="text-slate-400">Phone</span><div className="text-slate-600">{d.phone || "—"}</div></div>
                  <div><span className="text-slate-400">Email</span><div className="font-mono text-slate-600 truncate">{d.email || "—"}</div></div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Btn size="xs" variant="secondary">View Schedule</Btn>
                  <Btn size="xs" variant="secondary">Appointments</Btn>
                </div>
              </Card>
            ))}
            {filtered.length === 0 && (
              <Card className="p-8 text-center text-xs text-slate-400">No doctors found</Card>
            )}
          </div>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Doctor">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name" required>
            <Input placeholder="Dr. Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          </Field>
          <Field label="Specialization">
            <Input placeholder="e.g. Cardiologist" value={form.specialization} onChange={(v) => setForm({ ...form, specialization: v })} />
          </Field>
          <Field label="Degree">
            <Input placeholder="MBBS, MD, FCPS" value={form.degree} onChange={(v) => setForm({ ...form, degree: v })} />
          </Field>
          <Field label="BMDC No.">
            <Input placeholder="A-00000" value={form.bmdc_no} onChange={(v) => setForm({ ...form, bmdc_no: v })} />
          </Field>
          <Field label="Phone">
            <Input placeholder="01X-XXXXXXX" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          </Field>
          <Field label="Email">
            <Input placeholder="doctor@email.com" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          </Field>
          <Field label="Consultation Fee (BDT)">
            <Input type="number" value={form.consultation_fee} onChange={(v) => setForm({ ...form, consultation_fee: v })} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
          <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
          <Btn onClick={handleAdd} disabled={loading}>{loading ? "Saving..." : "Add Doctor"}</Btn>
        </div>
      </Modal>
    </Layout>
  );
}
