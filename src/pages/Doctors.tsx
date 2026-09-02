import { useEffect, useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD, Modal, Field, Input } from "../components/Layout";
import { api } from "../data/api";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
  onUserUpdate: (user: any) => void;
}

const AVAIL_COLORS = ["#10B981", "#F59E0B", "#EF4444", "#10B981", "#10B981"];

const STATUS_COLOR: Record<string, "green" | "blue" | "yellow" | "red" | "gray" | "purple" | "orange"> = {
  Confirmed: "blue",
  "Checked-in": "green",
  Completed: "gray",
  Cancelled: "red",
  "No Show": "red",
  Pending: "yellow",
};

export default function Doctors({ pageProps, user, onLogout, onUserUpdate }: PageProps) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "cards">("table");
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", specialization: "", degree: "", bmdc_no: "", phone: "", email: "", consultation_fee: "0" });
  const [profile, setProfile] = useState<any | null>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [prescribeTo, setPrescribeTo] = useState<any | null>(null);
  const [selectedTests, setSelectedTests] = useState<number[]>([]);
  const [prescribeSaving, setPrescribeSaving] = useState(false);
  const [prescribeMsg, setPrescribeMsg] = useState<string | null>(null);

  const openProfile = async (id: number) => {
    try {
      const data = await api.get<any>(`/doctors/${id}`);
      setProfile(data);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const openPrescribe = async (apt: any) => {
    setPrescribeTo(apt);
    setSelectedTests([]);
    setPrescribeMsg(null);
    if (tests.length === 0) {
      api.get<any>("/tests?limit=200").then((res) => setTests(res.data.data || [])).catch(() => {});
    }
  };

  const toggleTest = (id: number) => {
    setSelectedTests((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  };

  const submitPrescribe = async () => {
    if (selectedTests.length === 0) { setPrescribeMsg("Select at least one test"); return; }
    const items = tests.filter((t) => selectedTests.includes(t.test_id)).map((t) => ({ test_id: t.test_id, price: Number(t.price) || 0 }));
    setPrescribeSaving(true);
    setPrescribeMsg(null);
    try {
      await api.post("/labs/orders", {
        appointment_id: prescribeTo.appointment_id,
        patient_id: prescribeTo.patient_id,
        doctor_id: prescribeTo.doctor_id,
        items,
      });
      setPrescribeMsg("Lab tests assigned. Patient can collect in the Lab section.");
      setTimeout(() => { setPrescribeTo(null); openProfile(prescribeTo.doctor_id); }, 1200);
    } catch (e: any) {
      setPrescribeMsg(e.message);
    } finally {
      setPrescribeSaving(false);
    }
  };

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
      onUserUpdate={onUserUpdate}
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
                      <Btn size="xs" variant="secondary" onClick={() => openProfile(d.doctor_id)}>Profile</Btn>
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

      {/* Doctor profile */}
      <Modal open={!!profile} onClose={() => setProfile(null)} title="Doctor Profile" width="max-w-3xl">
        {profile && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 text-lg font-bold">
                {(profile.name || "").replace("Dr. ", "").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-900">{profile.name}</div>
                <div className="text-xs text-slate-500">{profile.specialization}</div>
                <div className="text-[11px] text-slate-400">{profile.degree} · BMDC {profile.bmdc_no || "—"}</div>
              </div>
              <div className="text-right text-[11px]">
                <div className="text-slate-400">Consultation Fee</div>
                <div className="text-base font-bold text-slate-900">৳ {profile.consultation_fee}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total Appointments", value: profile.stats?.totalAppointments || 0 },
                { label: "Patients Seen", value: profile.stats?.patientsSeen || 0 },
                { label: "Today's Appointments", value: profile.stats?.todayAppointments || 0 },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-slate-900">{s.value}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-slate-700">Patients Under This Doctor</h4>
              </div>
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-left text-[11px] text-slate-500">
                      {["Patient", "Date", "Fee", "Status", ""].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {(profile.patients || []).map((pt: any) => (
                      <tr key={pt.appointment_id} className="border-t border-slate-100">
                        <td className="px-3 py-2">
                          <div className="font-medium text-slate-800">{pt.patient_name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{pt.patient_unique_id}</div>
                        </td>
                        <td className="px-3 py-2 text-slate-600">{pt.appointment_date}</td>
                        <td className="px-3 py-2">
                          <div className={pt.due_amount > 0 ? "text-red-500" : "text-emerald-600"}>
                            ৳ {pt.paid_amount || 0}/{pt.fee || 0}
                            {pt.due_amount > 0 && <div className="text-[10px]">due ৳ {pt.due_amount}</div>}
                          </div>
                        </td>
                        <td className="px-3 py-2"><Badge label={pt.status} color={STATUS_COLOR[pt.status] || "gray"} /></td>
                        <td className="px-3 py-2">
                          <Btn size="xs" variant="primary" onClick={() => openPrescribe(pt)}>Assign Lab Tests</Btn>
                        </td>
                      </tr>
                    ))}
                    {(profile.patients || []).length === 0 && (
                      <tr><td className="px-3 py-6 text-center text-slate-400" colSpan={5}>No patients assigned yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign lab tests (prescription) */}
      <Modal open={!!prescribeTo} onClose={() => setPrescribeTo(null)} title="Assign Lab Tests" width="max-w-lg">
        {prescribeTo && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs">
              <div className="text-slate-500">Patient: <span className="font-medium text-slate-800">{prescribeTo.patient_name}</span></div>
              <div className="text-slate-500 mt-0.5">ID: <span className="font-mono text-slate-700">{prescribeTo.patient_unique_id}</span></div>
            </div>
            <Field label="Select Tests to Prescribe" required>
              <div className="border border-slate-200 rounded-lg max-h-56 overflow-auto divide-y divide-slate-50">
                {tests.map((t) => (
                  <label key={t.test_id} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-50">
                    <input type="checkbox" checked={selectedTests.includes(t.test_id)} onChange={() => toggleTest(t.test_id)} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-800 truncate">{t.test_name}</div>
                      <div className="text-[10px] text-slate-400">{t.category_name || "General"} · ৳ {t.price}</div>
                    </div>
                  </label>
                ))}
                {tests.length === 0 && <div className="py-4 text-center text-xs text-slate-400">Loading tests...</div>}
              </div>
            </Field>
            {prescribeMsg && (
              <div className={`text-xs px-3 py-2 rounded-lg ${prescribeMsg.includes("assigned") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{prescribeMsg}</div>
            )}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Btn variant="secondary" onClick={() => setPrescribeTo(null)}>Cancel</Btn>
              <Btn onClick={submitPrescribe} disabled={prescribeSaving}>{prescribeSaving ? "Assigning..." : "Assign & Send to Lab"}</Btn>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
