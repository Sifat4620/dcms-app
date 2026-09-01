import { useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD } from "../components/Layout";
import { labTests, testPackages } from "../data/mockData";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
}

const CATEGORIES = ["All", "Hematology", "Biochemistry", "Microbiology", "Immunology", "Cardiology", "Radiology"];

const CAT_COUNTS = CATEGORIES.slice(1).reduce((acc, c) => {
  acc[c] = labTests.filter((t) => t.category === c).length;
  return acc;
}, {} as Record<string, number>);

export default function LabTests({ pageProps, user, onLogout }: PageProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [tab, setTab] = useState<"tests" | "packages">("tests");

  const filtered = labTests.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.code.includes(search.toUpperCase());
    const matchCat = category === "All" || t.category === category;
    return matchSearch && matchCat;
  });

  return (
    <Layout
      title={pageProps.title}
      subtitle={`${labTests.length} tests across ${CATEGORIES.length - 1} categories`}
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      actions={
        <>
          <SearchBar placeholder="Test name or code..." value={search} onChange={setSearch} />
          <Btn>+ Add Test</Btn>
        </>
      }
    >
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white rounded-lg border border-slate-200 w-fit">
          {(["tests", "packages"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${tab === t ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {t === "tests" ? `Tests (${labTests.length})` : `Packages (${testPackages.length})`}
            </button>
          ))}
        </div>

        {tab === "tests" ? (
          <>
            {/* Category filter pills with count badges */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((c) => {
                const count = c === "All" ? labTests.length : (CAT_COUNTS[c] || 0);
                const isActive = category === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? "bg-sky-500 text-white shadow-sm shadow-sky-500/30"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {c}
                    <span className={`inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <Card>
              <Table headers={["Test ID", "Test Name", "Code", "Category", "Department", "Sample", "Price (BDT)", "TAT", "Unit", "Status"]}>
                {filtered.map((t) => (
                  <TR key={t.id}>
                    <TD mono>{t.id}</TD>
                    <TD><span className="font-medium text-slate-800">{t.name}</span></TD>
                    <TD><span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{t.code}</span></TD>
                    <TD><Badge label={t.category} color="blue" /></TD>
                    <TD>{t.dept}</TD>
                    <TD>
                      <span className="text-[11px] text-slate-600">{t.sample}</span>
                    </TD>
                    <TD mono>৳ {t.price}</TD>
                    <TD><span className="text-[11px] text-slate-600">{t.tat}</span></TD>
                    <TD mono>{t.unit}</TD>
                    <TD><Badge label={t.status} color="green" /></TD>
                  </TR>
                ))}
              </Table>
            </Card>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testPackages.map((pkg) => (
              <Card key={pkg.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">{pkg.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Comprehensive diagnostic package</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 ml-2 flex-shrink-0">
                    <Badge label={pkg.status} color="green" />
                    {/* Test count badge */}
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[10px] font-bold text-sky-700">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {pkg.tests} tests
                    </span>
                  </div>
                </div>
                {/* Progress bar showing test count */}
                <div className="mb-3">
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-400 rounded-full"
                      style={{ width: `${Math.min((pkg.tests / 25) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{pkg.tests} of 25+ available tests</div>
                </div>
                <div className="flex items-end gap-2 mt-4">
                  <span className="text-2xl font-bold text-slate-900">৳ {pkg.price.toLocaleString()}</span>
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 line-through">৳ {pkg.originalPrice.toLocaleString()}</span>
                    <Badge label={`${pkg.discount} off`} color="green" />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Btn size="xs" variant="secondary">View Tests</Btn>
                  <Btn size="xs" variant="secondary">Edit</Btn>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
