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

export default function Doctors({ pageProps, user, onLogout, onUserUpdate }: PageProps) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "cards">("table");
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", specialization: "", degree: "", bmdc_no: "", phone: "", email: "", consultation_fee: "0" });
  const [profile, setProfile] = useState<any | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [addingSchedule, setAddingSchedule] = useState(false);
  const [scheduleDay, setScheduleDay] = useState("Sun");
  const [scheduleStart, setScheduleStart] = useState("09:00");
  const [scheduleEnd, setScheduleEnd] = useState("17:00");

  const openProfile = async (id: number) => {
    try {
      const data = await api.get<any>(`/doctors/${id}`);
      setProfile(data);
      setEditMode(false);
      setEditForm(null);
      setAddingSchedule(false);
    } catch (e: any) {
      alert(e.message);
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

  const startEdit = () => {
    if (!profile) return;
    setEditForm({
      name: profile.name || "",
      specialization: profile.specialization || "",
      degree: profile.degree || "",
      bmdc_no: profile.bmdc_no || "",
      phone: profile.phone || "",
      email: profile.email || "",
      consultation_fee: String(profile.consultation_fee || 0),
      status: profile.status || "active",
    });
    setEditMode(true);
  };

  const saveEdit = async () => {
    try {
      await api.put(`/doctors/${profile.doctor_id}`, {
        name: editForm.name,
        specialization: editForm.specialization,
        degree: editForm.degree,
        bmdc_no: editForm.bmdc_no,
        phone: editForm.phone,
        email: editForm.email,
        consultation_fee: Number(editForm.consultation_fee || 0),
        status: editForm.status,
      });
      setEditMode(false);
      setEditForm(null);
      await openProfile(profile.doctor_id);
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const addSchedule = async () => {
    if (!profile || !scheduleStart || !scheduleEnd) return;
    try {
      await api.post(`/doctors/${profile.doctor_id}/schedule`, {
        day_of_week: scheduleDay,
        start_time: scheduleStart,
        end_time: scheduleEnd,
      });
      setAddingSchedule(false);
      await openProfile(profile.doctor_id);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const removeSchedule = async (scheduleId: number) => {
    try {
      await api.del(`/doctors/${profile.doctor_id}/schedule/${scheduleId}`);
      await openProfile(profile.doctor_id);
    } catch (e: any) {
      alert(e.message);
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
      <Modal open={!!profile} onClose={() => setProfile(null)} title={editMode ? "Edit Doctor" : "Doctor Profile"} width="max-w-3xl">
        {profile &&
          (editMode ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <Field label="Full Name" required>
                  <Input value={editForm?.name || ""} onChange={(v) => setEditForm({ ...editForm, name: v })} />
                </Field>
                <Field label="Specialization">
                  <Input value={editForm?.specialization || ""} onChange={(v) => setEditForm({ ...editForm, specialization: v })} />
                </Field>
                <Field label="Degree">
                  <Input value={editForm?.degree || ""} onChange={(v) => setEditForm({ ...editForm, degree: v })} />
                </Field>
                <Field label="BMDC No.">
                  <Input value={editForm?.bmdc_no || ""} onChange={(v) => setEditForm({ ...editForm, bmdc_no: v })} />
                </Field>
                <Field label="Phone">
                  <Input value={editForm?.phone || ""} onChange={(v) => setEditForm({ ...editForm, phone: v })} />
                </Field>
                <Field label="Email">
                  <Input value={editForm?.email || ""} onChange={(v) => setEditForm({ ...editForm, email: v })} />
                </Field>
                <Field label="Consultation Fee (BDT)">
                  <Input type="number" value={editForm?.consultation_fee || "0"} onChange={(v) => setEditForm({ ...editForm, consultation_fee: v })} />
                </Field>
                <Field label="Status">
                  <select
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400/40 bg-white"
                    value={editForm?.status || "active"}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </Field>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-700">Weekly Schedule</h4>
                  <Btn size="xs" variant="secondary" onClick={() => setAddingSchedule(!addingSchedule)}>
                    {addingSchedule ? "Close" : "+ Add Slot"}
                  </Btn>
                </div>

                {addingSchedule && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 p-3 rounded-lg border border-sky-200 bg-sky-50">
                    <Field label="Day">
                      <select
                        className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md bg-white"
                        value={scheduleDay}
                        onChange={(e) => setScheduleDay(e.target.value)}
                      >
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </Field>
                    <Field label="Start">
                      <Input type="time" value={scheduleStart} onChange={setScheduleStart} />
                    </Field>
                    <Field label="End">
                      <Input type="time" value={scheduleEnd} onChange={setScheduleEnd} />
                    </Field>
                    <div className="flex items-end">
                      <Btn size="xs" onClick={addSchedule}>Add Slot</Btn>
                    </div>
                  </div>
                )}

                {(profile.schedule || []).length === 0 ? (
                  <div className="text-[11px] text-slate-400 py-2">No schedule slots set yet.</div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                    {(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const).flatMap((day) =>
                      (profile.schedule || [])
                        .filter((s: any) => s.day_of_week === day)
                        .map((s: any) => (
                          <div key={s.schedule_id} className="flex items-center justify-between px-4 py-2">
                            <div className="text-xs font-medium text-slate-700">{day}</div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs text-emerald-700">{s.start_time} - {s.end_time}</span>
                              <button onClick={() => removeSchedule(s.schedule_id)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Btn variant="secondary" onClick={() => { setEditMode(false); setEditForm(null); }}>Cancel</Btn>
                <Btn onClick={saveEdit}>Save Changes</Btn>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold flex-shrink-0">
                  {(profile.name || "").replace("Dr. ", "").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-bold text-slate-900">{profile.name}</div>
                  <div className="text-sm text-slate-500">{profile.specialization}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{profile.degree} · BMDC {profile.bmdc_no || "—"}</div>
                  <div className="mt-2"><Badge label={profile.status} color={profile.status === "active" ? "green" : "gray"} /></div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Consultation Fee</div>
                  <div className="text-xl font-bold text-slate-900">৳ {profile.consultation_fee}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
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

              <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
                {[
                  ["Phone", profile.phone || "—"],
                  ["Email", profile.email || "—"],
                  ["BMDC No.", profile.bmdc_no || "—"],
                  ["Fee (BDT)", `৳ ${profile.consultation_fee}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-slate-500">{k}</span>
                    <span className="text-xs font-medium text-slate-800">{v}</span>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">Weekly Schedule</h4>
                <div className="grid grid-cols-7 gap-1.5">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => {
                    const entry = (profile.schedule || []).find((s: any) => s.day_of_week === day);
                    return (
                      <div key={day} className={`rounded-lg border p-2 text-center ${entry ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-slate-50"}`}>
                        <div className="text-[10px] font-semibold text-slate-500">{day}</div>
                        <div className="text-[10px] mt-1">
                          {entry ? (
                            <div>
                              <div className="font-medium text-emerald-700">{entry.start_time} - {entry.end_time}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400">Off</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Btn variant="secondary" onClick={() => setProfile(null)}>Close</Btn>
                <Btn onClick={startEdit}>Edit Profile</Btn>
              </div>
            </div>
          ))}
      </Modal>
    </Layout>
  );
}
