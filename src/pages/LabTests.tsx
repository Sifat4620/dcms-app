import { useEffect, useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD, Modal, Field, Input } from "../components/Layout";
import { api } from "../data/api";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
  onUserUpdate: (user: any) => void;
}

const CATEGORIES = ["All", "Hematology", "Biochemistry", "Microbiology", "Immunology", "Cardiology", "Radiology"];

export default function LabTests({ pageProps, user, onLogout, onUserUpdate }: PageProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [tab, setTab] = useState<"tests" | "packages">("tests");
  const [tests, setTests] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ test_name: "", category_id: "", test_code: "", price: "0", sample_type: "", unit: "" });

  const loadData = () => {
    api.get<any>("/tests?limit=200").then((res) => setTests(res.data)).catch(() => {});
    api.get<any>("/tests/packages/all").then(setPackages).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const CAT_COUNTS = CATEGORIES.slice(1).reduce((acc, c) => {
    acc[c] = tests.filter((t) => (t.category_name || "") === c).length;
    return acc;
  }, {} as Record<string, number>);

  const filtered = tests.filter((t) => {
    const matchSearch = (t.test_name || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || (t.category_name || "") === category;
    return matchSearch && matchCat;
  });

  const handleAdd = async () => {
    try {
      await api.post("/tests", { ...form, price: Number(form.price), category_id: form.category_id ? Number(form.category_id) : null });
      setShowAdd(false);
      setForm({ test_name: "", category_id: "", test_code: "", price: "0", sample_type: "", unit: "" });
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <Layout
      title={pageProps.title}
      subtitle={`${tests.length} tests across ${CATEGORIES.length - 1} categories`}
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      onUserUpdate={onUserUpdate}
      actions={
        <>
          <SearchBar placeholder="Test name..." value={search} onChange={setSearch} />
          <Btn onClick={() => setShowAdd(true)}>+ Add Test</Btn>
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
              {t === "tests" ? `Tests (${tests.length})` : `Packages (${packages.length})`}
            </button>
          ))}
        </div>

        {tab === "tests" ? (
          <>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((c) => {
                const count = c === "All" ? tests.length : (CAT_COUNTS[c] || 0);
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
              <Table headers={["Test ID", "Test Name", "Category", "Department", "Sample", "Price (BDT)", "TAT", "Unit", "Status"]}>
                {filtered.map((t) => (
                  <TR key={t.test_id}>
                    <TD mono>TST-{t.test_id}</TD>
                    <TD><span className="font-medium text-slate-800">{t.test_name}</span></TD>
                    <TD><Badge label={t.category_name || "General"} color="blue" /></TD>
                    <TD>{t.department_name || "—"}</TD>
                    <TD><span className="text-[11px] text-slate-600">{t.sample_type || "—"}</span></TD>
                    <TD mono>৳ {t.price}</TD>
                    <TD><span className="text-[11px] text-slate-600">{t.turnaround_time || "—"}</span></TD>
                    <TD mono>{t.unit || "—"}</TD>
                    <TD><Badge label={t.status} color={t.status === "active" ? "green" : "gray"} /></TD>
                  </TR>
                ))}
                {filtered.length === 0 && (
                  <TR><TD className="text-center py-8 text-slate-400">No tests found</TD></TR>
                )}
              </Table>
            </Card>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <Card key={pkg.package_id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">{pkg.package_name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{pkg.description || "Diagnostic package"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 ml-2 flex-shrink-0">
                    <Badge label={pkg.status} color={pkg.status === "active" ? "green" : "gray"} />
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[10px] font-bold text-sky-700">
                      {pkg.tests?.length || 0} tests
                    </span>
                  </div>
                </div>
                <div className="flex items-end gap-2 mt-4">
                  <span className="text-2xl font-bold text-slate-900">৳ {(pkg.package_price || pkg.price || 0).toLocaleString()}</span>
                  {pkg.discount > 0 && (
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 line-through">৳ {pkg.price.toLocaleString()}</span>
                      <Badge label={`${pkg.discount} off`} color="green" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Btn size="xs" variant="secondary">View Tests</Btn>
                  <Btn size="xs" variant="secondary">Edit</Btn>
                </div>
              </Card>
            ))}
            {packages.length === 0 && (
              <Card className="p-8 text-center text-xs text-slate-400">No packages found</Card>
            )}
          </div>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Test">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Test Name" required>
            <Input placeholder="Test name" value={form.test_name} onChange={(v) => setForm({ ...form, test_name: v })} />
          </Field>
          <Field label="Price (BDT)">
            <Input type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
          </Field>
          <Field label="Sample Type">
            <Input placeholder="Blood / Urine" value={form.sample_type} onChange={(v) => setForm({ ...form, sample_type: v })} />
          </Field>
          <Field label="Unit">
            <Input placeholder="mmol/L" value={form.unit} onChange={(v) => setForm({ ...form, unit: v })} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
          <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
          <Btn onClick={handleAdd}>Add Test</Btn>
        </div>
      </Modal>
    </Layout>
  );
}
