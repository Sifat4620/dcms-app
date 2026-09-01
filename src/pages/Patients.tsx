import { useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD, Modal, Field, Input } from "../components/Layout";
import { patients } from "../data/mockData";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
}

const BLOOD_COLORS: Record<string, "red" | "blue" | "green" | "purple" | "orange" | "yellow" | "gray"> = {
  "A+": "blue", "A-": "purple", "B+": "green", "B-": "orange",
  "O+": "red", "O-": "yellow", "AB+": "gray", "AB-": "gray",
};

const AVATAR_COLORS = [
  { bg: "#EFF6FF", text: "#1D4ED8" },
  { bg: "#F0FDF4", text: "#15803D" },
  { bg: "#FDF4FF", text: "#7E22CE" },
  { bg: "#FFF7ED", text: "#C2410C" },
  { bg: "#FFF1F2", text: "#BE123C" },
  { bg: "#F0FDFA", text: "#0F766E" },
];

export default function Patients({ pageProps, user, onLogout }: PageProps) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", dob: "", gender: "", blood: "", mobile: "", email: "", address: "", emergency: "" });

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.mobile.includes(search)
  );

  const activeCount = patients.filter((p) => p.status === "Active").length;

  return (
    <Layout
      title={pageProps.title}
      subtitle={`${patients.length} total patients`}
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      actions={
        <>
          <SearchBar placeholder="Search by name, ID, mobile..." value={search} onChange={setSearch} />
          <Btn onClick={() => setShowAdd(true)}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Patient
          </Btn>
        </>
      }
    >
      <div className="space-y-4">
        {/* Mini stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total Patients", value: patients.length, color: "text-slate-900", bg: "bg-white", border: "border-slate-200" },
            { label: "Active", value: activeCount, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
            { label: "New This Month", value: 47, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200" },
            { label: "Pending Follow-up", value: 12, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
          ].map((s) => (
            <div key={s.label} className={`rounded-lg border ${s.border} ${s.bg} px-4 py-3`}>
              <div className="text-[11px] text-slate-500">{s.label}</div>
              <div className={`text-xl font-bold mt-0.5 ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <Card>
          <Table headers={["Patient ID", "Name", "Age / Gender", "Blood Group", "Mobile", "Email", "Last Visit", "Status", "Actions"]}>
            {filtered.map((p, idx) => {
              const av = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              return (
                <TR key={p.id}>
                  <TD mono>{p.id}</TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: av.bg, color: av.text }}
                      >
                        {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-medium text-slate-800">{p.name}</span>
                    </div>
                  </TD>
                  <TD>{p.age} / {p.gender}</TD>
                  <TD><Badge label={p.blood} color={BLOOD_COLORS[p.blood] || "gray"} /></TD>
                  <TD mono>{p.mobile}</TD>
                  <TD>{p.email}</TD>
                  <TD mono>{p.lastVisit}</TD>
                  <TD>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${p.status === "Active" ? "bg-emerald-500" : "bg-slate-300"}`} />
                      <Badge label={p.status} color={p.status === "Active" ? "green" : "gray"} />
                    </div>
                  </TD>
                  <TD>
                    <div className="flex gap-1">
                      <Btn size="xs" variant="secondary">View</Btn>
                      <Btn size="xs" variant="ghost">Edit</Btn>
                    </div>
                  </TD>
                </TR>
              );
            })}
          </Table>
        </Card>
      </div>

      {/* Add Patient Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Register New Patient">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name" required>
            <Input placeholder="Patient full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          </Field>
          <Field label="Date of Birth">
            <Input type="date" value={form.dob} onChange={(v) => setForm({ ...form, dob: v })} />
          </Field>
          <Field label="Gender">
            <Input placeholder="Male / Female / Other" value={form.gender} onChange={(v) => setForm({ ...form, gender: v })} />
          </Field>
          <Field label="Blood Group">
            <Input placeholder="A+, B-, O+, AB+" value={form.blood} onChange={(v) => setForm({ ...form, blood: v })} />
          </Field>
          <Field label="Mobile Number" required>
            <Input placeholder="01X-XXXXXXXX" value={form.mobile} onChange={(v) => setForm({ ...form, mobile: v })} />
          </Field>
          <Field label="Email Address">
            <Input placeholder="email@example.com" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          </Field>
          <Field label="Address">
            <Input placeholder="Full address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          </Field>
          <Field label="Emergency Contact">
            <Input placeholder="Name and phone" value={form.emergency} onChange={(v) => setForm({ ...form, emergency: v })} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
          <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
          <Btn onClick={() => setShowAdd(false)}>Register Patient</Btn>
        </div>
      </Modal>
    </Layout>
  );
}
