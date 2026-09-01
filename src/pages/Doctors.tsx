import { useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD } from "../components/Layout";
import { doctors } from "../data/mockData";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
}

const AVAIL_COLORS = ["#10B981", "#F59E0B", "#EF4444", "#10B981", "#10B981"];

export default function Doctors({ pageProps, user, onLogout }: PageProps) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "cards">("table");

  const filtered = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase())
  );

  const todaySchedule = doctors.filter((d) => d.days.includes("Mon") || d.days.includes("Sat")).slice(0, 3);

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
          <Btn>+ Add Doctor</Btn>
        </>
      }
    >
      <div className="space-y-4">
        {view === "table" ? (
          <Card>
            <Table headers={["Doctor ID", "Name", "Specialization", "Degree", "BMDC No.", "Phone", "Fee (BDT)", "Availability", "Schedule", "Status", "Actions"]}>
              {filtered.map((d, idx) => (
                <TR key={d.id}>
                  <TD mono>{d.id}</TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold flex-shrink-0">
                          {d.name.replace("Dr. ", "").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span
                          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                          style={{ background: AVAIL_COLORS[idx % AVAIL_COLORS.length] }}
                        />
                      </div>
                      <span className="font-medium text-slate-800">{d.name}</span>
                    </div>
                  </TD>
                  <TD><Badge label={d.specialization} color="blue" /></TD>
                  <TD>{d.degree}</TD>
                  <TD mono>{d.bmdc}</TD>
                  <TD mono>{d.phone}</TD>
                  <TD mono>৳ {d.fee}</TD>
                  <TD>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: AVAIL_COLORS[idx % AVAIL_COLORS.length] }}
                      />
                      <span className="text-[11px] text-slate-600">{idx % 3 === 2 ? "Off Today" : idx % 3 === 1 ? "Busy" : "Available"}</span>
                    </div>
                  </TD>
                  <TD>
                    <div className="text-[11px]">
                      <div className="text-slate-600">{d.days}</div>
                      <div className="text-slate-400">{d.time}</div>
                    </div>
                  </TD>
                  <TD><Badge label={d.status} color="green" /></TD>
                  <TD>
                    <div className="flex gap-1">
                      <Btn size="xs" variant="secondary">Profile</Btn>
                      <Btn size="xs" variant="ghost">Schedule</Btn>
                    </div>
                  </TD>
                </TR>
              ))}
            </Table>
          </Card>
        ) : (
          <>
            {/* Today schedule inline */}
            <div className="bg-sky-50 border border-sky-200 rounded-lg px-4 py-3 flex items-center gap-4 flex-wrap">
              <span className="text-[11px] font-semibold text-sky-700 flex-shrink-0">On Duty Today:</span>
              {todaySchedule.map((d) => (
                <div key={d.id} className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-sky-200 flex items-center justify-center text-sky-800 text-[10px] font-bold">
                    {d.name.replace("Dr. ", "")[0]}
                  </div>
                  <span className="text-[11px] text-sky-800 font-medium">{d.name}</span>
                  <span className="text-[10px] text-sky-500">{d.time}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((d, idx) => (
                <Card key={d.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 text-base font-bold flex-shrink-0">
                        {d.name.replace("Dr. ", "").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
                        style={{ background: AVAIL_COLORS[idx % AVAIL_COLORS.length] }}
                        title={idx % 3 === 2 ? "Off Today" : idx % 3 === 1 ? "Busy" : "Available"}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{d.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{d.specialization}</div>
                      <div className="text-[11px] text-slate-400">{d.degree}</div>
                    </div>
                    <Badge label={d.status} color="green" />
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                    <div><span className="text-slate-400">BMDC</span><div className="font-mono text-slate-600">{d.bmdc}</div></div>
                    <div><span className="text-slate-400">Fee</span><div className="text-slate-700 font-semibold">৳ {d.fee}</div></div>
                    <div><span className="text-slate-400">Days</span><div className="text-slate-600">{d.days}</div></div>
                    <div><span className="text-slate-400">Time</span><div className="font-mono text-slate-600">{d.time}</div></div>
                  </div>
                  {/* Today schedule inline */}
                  <div className="mt-2 px-2 py-1.5 bg-slate-50 rounded-md flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: AVAIL_COLORS[idx % AVAIL_COLORS.length] }}
                    />
                    <span className="text-[10px] text-slate-500">
                      {idx % 3 === 2 ? "Off Today" : idx % 3 === 1 ? "Busy — in consultation" : `Available · Next: ${d.time}`}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Btn size="xs" variant="secondary" onClick={() => {}}>View Schedule</Btn>
                    <Btn size="xs" variant="secondary" onClick={() => {}}>Appointments</Btn>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
