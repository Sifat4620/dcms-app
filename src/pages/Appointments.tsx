import { useEffect, useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD, Modal, Field, Input } from "../components/Layout";
import InvoiceModal from "../components/InvoiceModal";
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

export default function Appointments({ pageProps, user, onLogout, onUserUpdate }: PageProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ patient_id: "", doctor_id: "", appointment_date: "", appointment_time: "" });
  const [invoiceData, setInvoiceData] = useState<any | null>(null);

  const openInvoice = async (id: number) => {
    try {
      const data = await api.get<any>(`/appointments/${id}/invoice`);
      setInvoiceData(data);
    } catch (e: any) {
      alert(e.message);
    }
  };

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
    api.put(`/appointments/${id}`, { status }).then((res: any) => {
      if (res?.invoice) setInvoiceData(res.invoice);
      loadData();
    });
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
      subtitle="Doctor appointment scheduling and status management"
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
                  <div className="font-medium text-slate-800">{a.patient_name}</div>
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
                  <div className="flex gap-1 flex-wrap">
                    {a.status === "Pending" && <Btn size="xs" variant="secondary" onClick={() => updateStatus(a.appointment_id, "Confirmed")}>Confirm</Btn>}
                    {a.status === "Confirmed" && <Btn size="xs" variant="secondary" onClick={() => updateStatus(a.appointment_id, "Checked-in")}>Check-in</Btn>}
                    {a.status === "Checked-in" && <Btn size="xs" variant="secondary" onClick={() => updateStatus(a.appointment_id, "Completed")}>Complete</Btn>}
                    {["Pending", "Confirmed"].includes(a.status) && (
                      <Btn size="xs" variant="danger" onClick={() => updateStatus(a.appointment_id, "Cancelled")}>Cancel</Btn>
                    )}
                    {Number(a.fee) > 0 && (
                      <Btn size="xs" variant="secondary" onClick={() => openInvoice(a.appointment_id)}>Bill</Btn>
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

      <InvoiceModal invoice={invoiceData} open={!!invoiceData} onClose={() => setInvoiceData(null)} />
    </Layout>
  );
}
