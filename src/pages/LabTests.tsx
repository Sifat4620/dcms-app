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
  const [form, setForm] = useState({ test_name: "", category_id: "", department_id: "", sample_type: "", unit: "", price: "0", turnaround_time: "", status: "active" });
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [editTest, setEditTest] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [editPkg, setEditPkg] = useState<any | null>(null);
  const [pkgForm, setPkgForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const loadData = () => {
    api.get<any>("/tests?limit=200").then((res) => setTests(res.data)).catch(() => {});
    api.get<any>("/tests/packages/all").then(setPackages).catch(() => {});
    api.get<any>("/tests/categories").then(setCategories).catch(() => {});
    api.get<any>("/tests/departments").then(setDepartments).catch(() => {});
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
      await api.post("/tests", {
        test_name: form.test_name,
        category_id: form.category_id ? Number(form.category_id) : null,
        department_id: form.department_id ? Number(form.department_id) : null,
        sample_type: form.sample_type || null,
        unit: form.unit || null,
        price: Number(form.price) || 0,
        turnaround_time: form.turnaround_time || null,
        status: form.status,
      });
      setShowAdd(false);
      setForm({ test_name: "", category_id: "", department_id: "", sample_type: "", unit: "", price: "0", turnaround_time: "", status: "active" });
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const openEdit = (t: any) => {
    setEditTest(t);
    setEditForm({
      test_id: t.test_id,
      test_name: t.test_name || "",
      category_id: t.category_id != null ? String(t.category_id) : "",
      department_id: t.department_id != null ? String(t.department_id) : "",
      sample_type: t.sample_type || "",
      unit: t.unit || "",
      price: String(t.price || 0),
      turnaround_time: t.turnaround_time || "",
      status: t.status || "active",
    });
  };

  const saveTest = async () => {
    if (!editForm) return;
    try {
      await api.put(`/tests/${editForm.test_id}`, {
        test_name: editForm.test_name,
        category_id: editForm.category_id ? Number(editForm.category_id) : null,
        department_id: editForm.department_id ? Number(editForm.department_id) : null,
        sample_type: editForm.sample_type || null,
        unit: editForm.unit || null,
        price: Number(editForm.price) || 0,
        turnaround_time: editForm.turnaround_time || null,
        status: editForm.status,
      });
      setEditTest(null);
      setEditForm(null);
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const openEditPkg = (pkg: any) => {
    setEditPkg(pkg);
    setPkgForm({
      package_name: pkg.package_name || "",
      description: pkg.description || "",
      price: String(pkg.price || 0),
      discount: String(pkg.discount || 0),
      package_price: String(pkg.package_price || pkg.price || 0),
      test_ids: (pkg.tests || []).map((t: any) => t.test_id),
    });
  };

  const togglePkgTest = (testId: number) => {
    const ids = pkgForm?.test_ids || [];
    setPkgForm({
      ...pkgForm,
      test_ids: ids.includes(testId) ? ids.filter((t: number) => t !== testId) : [...ids, testId],
    });
  };

  const savePkg = async () => {
    setSaving(true);
    try {
      await api.put(`/tests/packages/${editPkg.package_id}`, {
        package_name: pkgForm.package_name,
        description: pkgForm.description,
        price: Number(pkgForm.price || 0),
        discount: Number(pkgForm.discount || 0),
        package_price: Number(pkgForm.package_price || 0),
        test_ids: pkgForm.test_ids || [],
      });
      setEditPkg(null);
      setPkgForm(null);
      loadData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
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
              <Table headers={["Test ID", "Test Name", "Category", "Department", "Sample", "Price (BDT)", "TAT", "Unit", "Status", "Actions"]}>
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
                    <TD><Btn size="xs" variant="secondary" onClick={() => openEdit(t)}>Edit</Btn></TD>
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
                  <Btn size="xs" variant="secondary" onClick={() => openEditPkg(pkg)}>Edit</Btn>
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
          <Field label="Category">
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
              ))}
            </select>
          </Field>
          <Field label="Department">
            <select
              value={form.department_id}
              onChange={(e) => setForm({ ...form, department_id: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400"
            >
              <option value="">No department</option>
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
              ))}
            </select>
          </Field>
          <Field label="Sample Type">
            <Input placeholder="Blood / Urine" value={form.sample_type} onChange={(v) => setForm({ ...form, sample_type: v })} />
          </Field>
          <Field label="Unit">
            <Input placeholder="mmol/L" value={form.unit} onChange={(v) => setForm({ ...form, unit: v })} />
          </Field>
          <Field label="TAT (Turnaround)">
            <Input placeholder="e.g. 4 hours" value={form.turnaround_time} onChange={(v) => setForm({ ...form, turnaround_time: v })} />
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
          <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
          <Btn onClick={handleAdd}>Add Test</Btn>
        </div>
      </Modal>

      {/* Edit test */}
      <Modal open={!!editTest} onClose={() => { setEditTest(null); setEditForm(null); }} title={`Edit Test — ${editTest?.test_name || ""}`}>
        {editForm && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Test Name" required>
              <Input value={editForm.test_name} onChange={(v) => setEditForm({ ...editForm, test_name: v })} />
            </Field>
            <Field label="Price (BDT)">
              <Input type="number" value={editForm.price} onChange={(v) => setEditForm({ ...editForm, price: v })} />
            </Field>
            <Field label="Category">
              <select
                value={editForm.category_id}
                onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                ))}
              </select>
            </Field>
            <Field label="Department">
              <select
                value={editForm.department_id}
                onChange={(e) => setEditForm({ ...editForm, department_id: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400"
              >
                <option value="">No department</option>
                {departments.map((d) => (
                  <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                ))}
              </select>
            </Field>
            <Field label="Sample Type">
              <Input value={editForm.sample_type} onChange={(v) => setEditForm({ ...editForm, sample_type: v })} />
            </Field>
            <Field label="Unit">
              <Input value={editForm.unit} onChange={(v) => setEditForm({ ...editForm, unit: v })} />
            </Field>
            <Field label="TAT (Turnaround)">
              <Input placeholder="e.g. 4 hours" value={editForm.turnaround_time} onChange={(v) => setEditForm({ ...editForm, turnaround_time: v })} />
            </Field>
            <Field label="Status">
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
          <Btn variant="secondary" onClick={() => { setEditTest(null); setEditForm(null); }}>Cancel</Btn>
          <Btn onClick={saveTest}>Save Test</Btn>
        </div>
      </Modal>

      {/* Edit package */}
      <Modal open={!!editPkg} onClose={() => { setEditPkg(null); setPkgForm(null); }} title={`Edit Package — ${editPkg?.package_name || ""}`} width="max-w-2xl">
        {pkgForm && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Package Name" required>
                <Input value={pkgForm.package_name} onChange={(v) => setPkgForm({ ...pkgForm, package_name: v })} />
              </Field>
              <Field label="Description">
                <Input value={pkgForm.description} onChange={(v) => setPkgForm({ ...pkgForm, description: v })} />
              </Field>
              <Field label="Price (BDT)">
                <Input type="number" value={pkgForm.price} onChange={(v) => setPkgForm({ ...pkgForm, price: v })} />
              </Field>
              <Field label="Discount (BDT)">
                <Input type="number" value={pkgForm.discount} onChange={(v) => setPkgForm({ ...pkgForm, discount: v })} />
              </Field>
              <Field label="Package Price (BDT)">
                <Input type="number" value={pkgForm.package_price} onChange={(v) => setPkgForm({ ...pkgForm, package_price: v })} />
              </Field>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wide">Include Tests</div>
              <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-50 pr-1">
                {tests.length === 0 && <div className="p-3 text-[11px] text-slate-400">Loading tests...</div>}
                {tests.map((t) => (
                  <label key={t.test_id} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-50 text-xs">
                    <input
                      type="checkbox"
                      checked={(pkgForm.test_ids || []).includes(t.test_id)}
                      onChange={() => togglePkgTest(t.test_id)}
                      className="accent-sky-500"
                    />
                    <span className="font-medium text-slate-700">{t.test_name}</span>
                    <span className="ml-auto text-slate-400 font-mono">৳ {t.price}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
              <Btn variant="secondary" onClick={() => { setEditPkg(null); setPkgForm(null); }}>Cancel</Btn>
              <Btn onClick={savePkg} disabled={saving}>{saving ? "Saving..." : "Save Package"}</Btn>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
