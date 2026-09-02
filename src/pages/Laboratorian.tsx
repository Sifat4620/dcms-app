import { useEffect, useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD, Modal, Field, Input } from "../components/Layout";
import { api } from "../data/api";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { user_id?: number; name: string; role: string; email: string };
  onLogout: () => void;
  onUserUpdate: (user: any) => void;
}

const STATUS_COLOR: Record<string, "blue" | "green" | "yellow" | "red" | "gray"> = {
  Processing: "yellow",
  Completed: "green",
  Rejected: "red",
};

export default function Laboratorian({ pageProps, user, onLogout, onUserUpdate }: PageProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Processing");
  const [samples, setSamples] = useState<any[]>([]);
  const [target, setTarget] = useState<any | null>(null);
  const [resultValue, setResultValue] = useState("");
  const [unit, setUnit] = useState("");
  const [referenceRange, setReferenceRange] = useState("");
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    const params = filter !== "All" ? `?status=${encodeURIComponent(filter)}` : "";
    api.get<any>(`/labs/samples${params}`).then(setSamples).catch(() => {});
  };

  useEffect(() => {
    load();
  }, [filter]);

  const openEntry = (s: any) => {
    setTarget(s);
    setResultValue("");
    setUnit(s.unit || "");
    setReferenceRange(s.reference_range || "");
    setIsAbnormal(false);
    setRemarks("");
  };

  const saveResult = async () => {
    if (!target) return;
    if (!resultValue.trim()) {
      alert("Please enter the result value");
      return;
    }
    setSaving(true);
    try {
      await api.post("/labs/results", {
        sample_id: target.sample_id,
        result_value: resultValue.trim(),
        unit: unit || null,
        reference_range: referenceRange || null,
        is_abnormal: isAbnormal,
        remarks: remarks || null,
        entered_by: user.user_id,
      });
      setTarget(null);
      load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = samples.filter(
    (s) =>
      (s.patient_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.sample_barcode || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.test_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const processingCount = samples.filter((s) => s.status === "Processing").length;

  return (
    <Layout
      title={pageProps.title}
      subtitle="Lab technician result entry for collected samples"
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      onUserUpdate={onUserUpdate}
      actions={
        <SearchBar placeholder="Patient, barcode, or test..." value={search} onChange={setSearch} />
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
            <div className="text-[11px] text-amber-600">Processing (Awaiting Result)</div>
            <div className="text-2xl font-semibold text-amber-600">{processingCount}</div>
          </div>
          <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
            <div className="text-[11px] text-emerald-600">Completed</div>
            <div className="text-2xl font-semibold text-emerald-600">{samples.filter((s) => s.status === "Completed").length}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Total in Scope</div>
            <div className="text-2xl font-semibold text-slate-900">{samples.length}</div>
          </div>
        </div>

        <div className="flex gap-2">
          {["Processing", "Completed", "All"].map((s) => {
            const count = s === "All" ? samples.length : samples.filter((x) => x.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === s ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
              >
                {s} ({count})
              </button>
            );
          })}
        </div>

        <Card>
          <Table headers={["Sample ID", "Barcode", "Patient", "Test", "Type", "Unit", "Ref. Range", "Collected By", "Status", "Actions"]}>
            {filtered.map((s) => (
              <TR key={s.sample_id}>
                <TD mono>S-{s.sample_id}</TD>
                <TD><span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">{s.sample_barcode}</span></TD>
                <TD>
                  <div className="font-medium text-slate-800">{s.patient_name}</div>
                  <div className="text-[10px] font-mono text-slate-400">{s.patient_unique_id}</div>
                </TD>
                <TD>{s.test_name}</TD>
                <TD><span className="text-[11px] text-slate-600">{s.sample_type}</span></TD>
                <TD mono>{s.unit || "—"}</TD>
                <TD><span className="text-[11px] text-slate-500">{s.reference_range || "—"}</span></TD>
                <TD>{s.collected_by_name || "—"}</TD>
                <TD><Badge label={s.status} color={STATUS_COLOR[s.status] || "gray"} /></TD>
                <TD>
                  <Btn size="xs" variant={s.status === "Processing" ? "primary" : "secondary"} onClick={() => openEntry(s)}>
                    {s.status === "Processing" ? "Enter Result" : "Edit Result"}
                  </Btn>
                </TD>
              </TR>
            ))}
            {filtered.length === 0 && (
              <TR><TD className="text-center py-8 text-slate-400">No samples in this view</TD></TR>
            )}
          </Table>
        </Card>
      </div>

      <Modal open={!!target} onClose={() => setTarget(null)} title={`Enter Result — ${target?.sample_barcode || ""}`} width="max-w-xl">
        {target && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                <div><span className="text-slate-500">Patient:</span> <span className="font-medium text-slate-800">{target.patient_name}</span></div>
                <div><span className="text-slate-500">ID:</span> <span className="font-mono">{target.patient_unique_id}</span></div>
                <div><span className="text-slate-500">Test:</span> <span className="font-medium text-slate-800">{target.test_name}</span></div>
                <div><span className="text-slate-500">Sample:</span> {target.sample_type}</div>
              </div>
            </div>
            <Field label="Result Value" required>
              <Input placeholder="e.g. 145" value={resultValue} onChange={setResultValue} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Unit">
                <Input placeholder="mmol/L" value={unit} onChange={setUnit} />
              </Field>
              <Field label="Reference Range">
                <Input placeholder="e.g. 80 - 120" value={referenceRange} onChange={setReferenceRange} />
              </Field>
            </div>
            <Field label="Remarks">
              <Input placeholder="Optional notes" value={remarks} onChange={setRemarks} />
            </Field>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={isAbnormal} onChange={(e) => setIsAbnormal(e.target.checked)} className="accent-red-500" />
              <span className="text-slate-700 font-medium">Flag as Abnormal</span>
            </label>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
              <Btn variant="secondary" onClick={() => setTarget(null)}>Cancel</Btn>
              <Btn onClick={saveResult} disabled={saving}>{saving ? "Saving..." : "Save Result"}</Btn>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}