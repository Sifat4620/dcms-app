import { useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD } from "../components/Layout";
import { corporateClients } from "../data/mockData";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
}

export default function Corporate({ pageProps, user, onLogout }: PageProps) {
  const [search, setSearch] = useState("");

  const filtered = corporateClients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase())
  );

  const TYPE_COLOR: Record<string, "blue" | "green" | "purple" | "orange"> = {
    Bank: "blue",
    NGO: "green",
    University: "purple",
    Corporate: "orange",
  };

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
          <Btn>+ Add Client</Btn>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Total Clients</div>
            <div className="text-2xl font-semibold text-slate-900">{corporateClients.length}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Total Employees Covered</div>
            <div className="text-2xl font-semibold text-slate-900">{corporateClients.reduce((s, c) => s + c.employees, 0).toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Total Credit Limit</div>
            <div className="text-2xl font-semibold text-slate-900">৳ {(corporateClients.reduce((s, c) => s + c.creditLimit, 0) / 100000).toFixed(1)}L</div>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <div className="text-[11px] text-red-500">Outstanding Dues</div>
            <div className="text-2xl font-semibold text-red-500">৳ {corporateClients.reduce((s, c) => s + c.due, 0).toLocaleString()}</div>
          </div>
        </div>

        <Card>
          <Table headers={["Client ID", "Organization", "Type", "Contact", "Phone", "Employees", "Credit Limit", "Credit Used", "Outstanding", "Status", "Actions"]}>
            {filtered.map((c) => {
              const usedPct = Math.round((c.due / c.creditLimit) * 100);
              return (
                <TR key={c.id}>
                  <TD mono>{c.id}</TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold flex-shrink-0">
                        {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-medium text-slate-800">{c.name}</span>
                    </div>
                  </TD>
                  <TD><Badge label={c.type} color={TYPE_COLOR[c.type] || "gray"} /></TD>
                  <TD>{c.contact}</TD>
                  <TD mono>{c.phone}</TD>
                  <TD mono>{c.employees.toLocaleString()}</TD>
                  <TD mono>৳ {c.creditLimit.toLocaleString()}</TD>
                  <TD>
                    {/* Credit utilization bar */}
                    <div className="min-w-[100px]">
                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                        <span className="text-slate-400">{usedPct}% used</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(usedPct, 100)}%`,
                            background: usedPct > 80 ? "#EF4444" : usedPct > 50 ? "#F59E0B" : "#10B981",
                          }}
                        />
                      </div>
                    </div>
                  </TD>
                  <TD mono>
                    {c.due > 0 ? <span className="text-red-500 font-medium">৳ {c.due.toLocaleString()}</span> : <span className="text-slate-400">—</span>}
                  </TD>
                  <TD><Badge label={c.status} color="green" /></TD>
                  <TD>
                    <div className="flex gap-1">
                      <Btn size="xs" variant="secondary">Manage</Btn>
                      <Btn size="xs" variant="ghost">Invoice</Btn>
                    </div>
                  </TD>
                </TR>
              );
            })}
          </Table>
        </Card>

        {/* Health packages for corporates */}
        <Card className="p-4">
          <h3 className="text-xs font-semibold text-slate-800 mb-3">Corporate Health Packages</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { name: "Basic Health Screen", tests: 8, pricePerPerson: 1200, desc: "CBC, Blood Sugar, Urine R/E, ECG" },
              { name: "Executive Package", tests: 15, pricePerPerson: 2800, desc: "Full blood panel, chest X-ray, cardiac workup" },
              { name: "Comprehensive Checkup", tests: 22, pricePerPerson: 4500, desc: "All executive tests + hormone panel, imaging" },
            ].map((pkg) => (
              <div key={pkg.name} className="border border-slate-200 rounded-lg p-3">
                <div className="text-xs font-semibold text-slate-800">{pkg.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{pkg.desc}</div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[11px] text-slate-500">{pkg.tests} tests</span>
                  <span className="text-sm font-bold text-slate-900">৳ {pkg.pricePerPerson.toLocaleString()}<span className="text-[11px] font-normal text-slate-400">/person</span></span>
                </div>
                <Btn size="xs" variant="secondary" onClick={() => {}}>Assign to Client</Btn>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
