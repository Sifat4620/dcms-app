import { useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD } from "../components/Layout";
import { appointments } from "../data/mockData";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
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

export default function Appointments({ pageProps, user, onLogout }: PageProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedDay, setSelectedDay] = useState(1); // Mon = today (Sept 1)

  const statuses = ["All", "Pending", "Confirmed", "Checked-in", "Completed", "Cancelled", "No Show"];

  const filtered = appointments.filter((a) => {
    const matchSearch =
      a.patient.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor.toLowerCase().includes(search.toLowerCase()) ||
      a.id.includes(search);
    const matchStatus = filter === "All" || a.status === filter;
    return matchSearch && matchStatus;
  });

  const counts = statuses.slice(1).reduce((acc, s) => {
    acc[s] = appointments.filter((a) => a.status === s).length;
    return acc;
  }, {} as Record<string, number>);

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
      actions={
        <>
          <SearchBar placeholder="Search patient or doctor..." value={search} onChange={setSearch} />
          <Btn>+ Book Appointment</Btn>
        </>
      }
    >
      <div className="space-y-4">
        {/* Date selector bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Week of Sep 1, 2026</span>
            <div className="flex gap-1">
              <button className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:bg-slate-100">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:bg-slate-100">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            {WEEK_DAYS.map((d) => {
              const isToday = d.date === 1;
              const isSelected = selectedDay === d.date;
              return (
                <button
                  key={d.short}
                  onClick={() => setSelectedDay(d.date)}
                  className={`flex-1 flex flex-col items-center py-2 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                      : isToday
                      ? "bg-sky-50 text-sky-700 border border-sky-200"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-[10px] mb-0.5">{d.short}</span>
                  <span className="text-sm font-bold">{d.date}</span>
                  {isToday && !isSelected && (
                    <div className="w-1 h-1 rounded-full bg-sky-500 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

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
          <Table headers={["Appt. ID", "Patient", "Doctor", "Date", "Time", "Token", "Fee (BDT)", "Status", "Actions"]}>
            {filtered.map((a) => (
              <TR key={a.id}>
                <TD mono>{a.id}</TD>
                <TD>
                  <div>
                    <div className="font-medium text-slate-800">{a.patient}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{a.patientId}</div>
                  </div>
                </TD>
                <TD>{a.doctor}</TD>
                <TD mono>{a.date}</TD>
                <TD mono>{a.time}</TD>
                <TD>
                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    #{a.token}
                  </span>
                </TD>
                <TD mono>৳ {a.fee}</TD>
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
                    <Btn size="xs" variant="secondary">View</Btn>
                    {a.status === "Pending" && <Btn size="xs" variant="primary">Confirm</Btn>}
                    {a.status === "Confirmed" && <Btn size="xs" variant="primary">Check-in</Btn>}
                    {(a.status === "Pending" || a.status === "Confirmed") && (
                      <Btn size="xs" variant="danger">Cancel</Btn>
                    )}
                  </div>
                </TD>
              </TR>
            ))}
          </Table>
        </Card>
      </div>
    </Layout>
  );
}
