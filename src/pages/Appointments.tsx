import { useEffect, useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD, Modal, Field, Input } from "../components/Layout";
import { api } from "../data/api";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
  onUserUpdate: (user: any) => void;
}

const STATUS_COLOR: Record<string, "green" | "blue" | "yellow" | "red" | "gray" | "purple" | "orange"> = {
  Confirmed: "blue",
  "Checked-in": "green",
  Completed: "gray",
  Cancelled: "red",
  "No Show": "red",
  Pending: "yellow",
};

const WEEK_DAYS = [
  { short: "Sun", date: 31 },
  { short: "Mon", date: 1 },
  { short: "Tue", date: 2 },
  { short: "Wed", date: 3 },
  { short: "Thu", date: 4 },
  { short: "Fri", date: 5 },
  { short: "Sat", date: 6 },
];

export default function Appointments({ pageProps, user, onLogout, onUserUpdate }: PageProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedDay, setSelectedDay] = useState(1);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ patient_id: "", doctor_id: "", appointment_date: "", appointment_time: "" });
  const [payTarget, setPayTarget] = useState<any | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("Cash");
  const [payError, setPayError] = useState<string | null>(null);
  const [savingPay, setSavingPay] = useState(false);

  const loadData = () => {
    api.get<any>("/appointments?limit=100").then((res) => setAppointments(res.data)).catch(() => {});
    api.get<any>("/patients?limit=100").then((res) => setPatients(res.data)).catch(() => {});
    api.get<any>("/doctors?limit=100").then((res) => setDoctors(res.data)).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const statuses = ["All", "Pending", "Confirmed", "Checked-in", "Completed", "Cancelled", "No Show"];

  const filtered = appointments.filter((a) => {
    const matchSearch =
      (a.patient_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.doctor_name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === "All" || a.status === filter;
    return matchSearch && matchStatus;
  });

  const counts = statuses.slice(1).reduce((acc, s) => {
    acc[s] = appointments.filter((a) => a.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const updateStatus = (id: number, status: string) => {
    api.put(`/appointments/${id}`, { status }).then(() => loadData());
  };

  const handleAdd = async () => {
    try {
      await api.post("/appointments", {
        branch_id: 1, patient_id: Number(form.patient_id), doctor_id: Number(form.doctor_id),
        appointment_date: form.appointment_date, appointment_time: form.appointment_time,
      });
      setShowAdd(false);
      setForm({ patient_id: "", doctor_id: "", appointment_date: "", appointment_time: "" });
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const openPay = (a: any) => {
    setPayTarget(a);
    setPayAmount(String(a.due_amount || ""));
    setPayMethod("Cash");
    setPayError(null);
  };

  const submitPay = async () => {
    const amt = Number(payAmount);
    if (!amt || amt <= 0) { setPayError("Enter a valid amount"); return; }
    if (amt > (payTarget.due_amount || 0)) { setPayError("Amount exceeds due"); return; }
    setSavingPay(true);
    setPayError(null);
    try {
      await api.post(`/appointments/${payTarget.appointment_id}/payment`, { amount: amt, payment_method: payMethod });
      setPayTarget(null);
      loadData();
    } catch (e: any) {
      setPayError(e.message);
    } finally {
      setSavingPay(false);
    }
  };

  const STATUS_DOT: Record<string, string> = {
    Confirmed: "#3B82F6",
    "Checked-in": "#10B981",
    Completed: "#94A3B8",
    Cancelled: "#EF4444",
    "No Show": "#EF4444",
    Pending: "#F59E0B",
  };

  return (
    <Layout
      title={pageProps.title}
      subtitle="Doctor appointment scheduling and tracking"
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      onUserUpdate={onUserUpdate}
      actions={
        <>
          <SearchBar placeholder="Search patient or doctor..." value={search} onChange={setSearch} />
          <Btn onClick={() => setShowAdd(true)}>+ Book Appointment</Btn>
        </>
      }
    >
      <div className="space-y-4">
        {/* Status filter pills with count badges */}
        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => {
            const count = s === "All" ? appointments.length : (counts[s] || 0);
            const isActive = filter === s;
            const dotColor = s !== "All" ? STATUS_DOT[s] : undefined;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {dotColor && (
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColor }} />
                )}
                {s}
                <span className={`inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full text-[10px] font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <Card>
          <Table headers={["Appt. ID", "Patient", "Doctor", "Date", "Time", "Fee", "Status", "Actions"]}>
            {filtered.map((a) => (
              <TR key={a.appointment_id}>
                <TD mono>APT-{a.appointment_id}</TD>
                <TD>
                  <div>
                    <div className="font-medium text-slate-800">{a.patient_name}</div>
                  </div>
                </TD>
                <TD>{a.doctor_name}</TD>
                <TD mono>{a.appointment_date}</TD>
                <TD mono>{a.appointment_time}</TD>
                <TD>
                  <div className="font-mono text-xs">
                    <div className="text-slate-700">৳ {a.fee || 0}</div>
                    {Number(a.due_amount) > 0 ? (
                      <div className="text-red-500 text-[10px]">Due ৳ {a.due_amount}</div>
                    ) : a.paid_amount > 0 ? (
                      <div className="text-emerald-600 text-[10px]">Paid</div>
                    ) : (
                      <div className="text-slate-400 text-[10px]">Unpaid</div>
                    )}
                  </div>
                </TD>
                <TD>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: STATUS_DOT[a.status] || "#94A3B8" }}
                    />
                    <Badge label={a.status} color={STATUS_COLOR[a.status] || "gray"} />
                  </div>
                </TD>
                <TD>
                  <div className="flex gap-1">
                    {Number(a.due_amount) > 0 && (
                      <Btn size="xs" variant="primary" onClick={() => openPay(a)}>Collect Fee</Btn>
                    )}
                    {a.status === "Pending" && <Btn size="xs" variant="secondary" onClick={() => updateStatus(a.appointment_id, "Confirmed")}>Confirm</Btn>}
                    {a.status === "Confirmed" && <Btn size="xs" variant="secondary" onClick={() => updateStatus(a.appointment_id, "Checked-in")}>Check-in</Btn>}
                    {a.status === "Checked-in" && <Btn size="xs" variant="secondary" onClick={() => updateStatus(a.appointment_id, "Completed")}>Complete</Btn>}
                    {["Pending", "Confirmed"].includes(a.status) && (
                      <Btn size="xs" variant="danger" onClick={() => updateStatus(a.appointment_id, "Cancelled")}>Cancel</Btn>
                    )}
                  </div>
                </TD>
              </TR>
            ))}
            {filtered.length === 0 && (
              <TR><TD className="text-center py-8 text-slate-400">No appointments found</TD></TR>
            )}
          </Table>
        </Card>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Book Appointment">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Patient" required>
            <select
              value={form.patient_id}
              onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
            >
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p.patient_id} value={p.patient_id}>{p.name} ({p.patient_unique_id})</option>)}
            </select>
          </Field>
          <Field label="Doctor" required>
            <select
              value={form.doctor_id}
              onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
            >
              <option value="">Select doctor</option>
              {doctors.map((d) => <option key={d.doctor_id} value={d.doctor_id}>{d.name}</option>)}
            </select>
          </Field>
          <Field label="Date" required>
            <Input type="date" value={form.appointment_date} onChange={(v) => setForm({ ...form, appointment_date: v })} />
          </Field>
          <Field label="Time" required>
            <Input type="time" value={form.appointment_time} onChange={(v) => setForm({ ...form, appointment_time: v })} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
          <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
          <Btn onClick={handleAdd}>Book Appointment</Btn>
        </div>
      </Modal>

      {/* Collect consultation fee */}
      <Modal open={!!payTarget} onClose={() => setPayTarget(null)} title="Collect Consultation Fee">
        {payTarget && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Patient</span><span className="font-medium text-slate-800">{payTarget.patient_name}</span></div>
              <div className="flex justify-between mt-1"><span className="text-slate-500">Doctor</span><span className="font-medium text-slate-800">{payTarget.doctor_name}</span></div>
              <div className="flex justify-between mt-1"><span className="text-slate-500">Fee</span><span className="font-semibold text-slate-800">৳ {payTarget.fee}</span></div>
              <div className="flex justify-between mt-1"><span className="text-slate-500">Already Paid</span><span className="text-emerald-600">৳ {payTarget.paid_amount || 0}</span></div>
              <div className="flex justify-between mt-1"><span className="text-slate-500">Due</span><span className="text-red-500 font-semibold">৳ {payTarget.due_amount}</span></div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Field label="Amount" required>
                <Input type="number" value={payAmount} onChange={setPayAmount} />
              </Field>
              <Field label="Payment Method" required>
                <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white">
                  {["Cash", "Card", "Mobile Banking", "Bank Transfer", "Online Payment"].map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
            </div>
            {payError && <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{payError}</div>}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Btn variant="secondary" onClick={() => setPayTarget(null)}>Cancel</Btn>
              <Btn onClick={submitPay} disabled={savingPay}>{savingPay ? "Saving..." : "Confirm Payment"}</Btn>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
