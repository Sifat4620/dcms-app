import { useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD } from "../components/Layout";
import { samples } from "../data/mockData";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
}

const STATUS_COLOR: Record<string, "yellow" | "blue" | "green" | "purple" | "gray" | "red"> = {
  Pending: "yellow",
  Collected: "blue",
  Received: "purple",
  Processing: "blue",
  Completed: "green",
  Rejected: "red",
};

const STATUS_STEPS = ["Pending", "Collected", "Received", "Processing", "Completed"];

const STEP_DOT_COLORS: Record<string, string> = {
  Pending: "#F59E0B",
  Collected: "#3B82F6",
  Received: "#8B5CF6",
  Processing: "#0EA5E9",
  Completed: "#10B981",
};

export default function Barcode({ pageProps, user, onLogout }: PageProps) {
  const [search, setSearch] = useState("");
  const [scanned, setScanned] = useState("");
  const [scanResult, setScanResult] = useState<typeof samples[0] | null>(null);

  const handleScan = () => {
    const found = samples.find((s) => s.barcode === scanned.trim());
    setScanResult(found || null);
  };

  const filtered = samples.filter(
    (s) =>
      s.patient.toLowerCase().includes(search.toLowerCase()) ||
      s.barcode.includes(search) ||
      s.orderId.includes(search)
  );

  const stepCounts = STATUS_STEPS.reduce((acc, s) => {
    acc[s] = samples.filter((smp) => smp.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Layout
      title={pageProps.title}
      subtitle="Track sample lifecycle from collection to result"
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      actions={
        <>
          <SearchBar placeholder="Patient, barcode, order..." value={search} onChange={setSearch} />
          <Btn>+ New Sample</Btn>
        </>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Barcode scanner panel */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-xs font-semibold text-slate-700 mb-3">Barcode Scanner</h3>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center mb-3">
              <svg className="w-10 h-10 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <div className="text-xs text-slate-400">Point barcode scanner here or type below</div>
            </div>
            <input
              className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400 mb-2"
              placeholder="BC-XXXXXXXXXX"
              value={scanned}
              onChange={(e) => setScanned(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
            />
            <Btn onClick={handleScan}>Scan Barcode</Btn>

            {scanResult !== null && (
              <div className="mt-3 p-3 rounded-lg border border-sky-200 bg-sky-50">
                <div className="text-xs font-semibold text-sky-800 mb-2">Sample Found</div>
                <div className="space-y-1 text-[11px]">
                  <div><span className="text-slate-500">Patient:</span> <span className="font-medium text-slate-800">{scanResult.patient}</span></div>
                  <div><span className="text-slate-500">Test:</span> <span className="font-medium">{scanResult.test}</span></div>
                  <div><span className="text-slate-500">Type:</span> {scanResult.type}</div>
                  <div><span className="text-slate-500">Status:</span> <Badge label={scanResult.status} color={STATUS_COLOR[scanResult.status] || "gray"} /></div>
                </div>
                <div className="flex gap-1 mt-2">
                  <Btn size="xs" variant="primary">Update Status</Btn>
                  <Btn size="xs" variant="secondary">Enter Result</Btn>
                </div>
              </div>
            )}
            {scanned && scanResult === null && (
              <div className="mt-3 p-3 rounded-lg border border-red-200 bg-red-50 text-xs text-red-700">
                Barcode not found. Check the ID and try again.
              </div>
            )}
          </Card>

          {/* Horizontal stepper workflow */}
          <Card className="p-4">
            <h3 className="text-xs font-semibold text-slate-700 mb-4">Sample Workflow</h3>
            <div className="space-y-3">
              {STATUS_STEPS.map((s, i) => {
                const count = stepCounts[s] || 0;
                const dotColor = STEP_DOT_COLORS[s];
                return (
                  <div key={s} className="flex items-center gap-3">
                    {/* Step connector line */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-sm"
                        style={{ background: dotColor }}
                      >
                        {count > 0 ? count : i + 1}
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className="w-0.5 h-4 mt-1" style={{ background: `${dotColor}40` }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-slate-700">{s}</div>
                      <div className="text-[10px] text-slate-400">{count} sample{count !== 1 ? "s" : ""}</div>
                    </div>
                    {count > 0 && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: dotColor }}
                      >
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Sample table */}
        <Card className="lg:col-span-2">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-800">Sample Tracking</h3>
          </div>
          <Table headers={["Sample ID", "Barcode", "Patient", "Test", "Type", "Collected By", "Time", "Status", "Actions"]}>
            {filtered.map((s) => (
              <TR key={s.id}>
                <TD mono>{s.id}</TD>
                <TD>
                  <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">{s.barcode}</span>
                </TD>
                <TD>
                  <div className="font-medium text-slate-800">{s.patient}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{s.orderId}</div>
                </TD>
                <TD>{s.test}</TD>
                <TD>{s.type}</TD>
                <TD>{s.collectedBy}</TD>
                <TD mono>{s.collectedAt}</TD>
                <TD>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: STEP_DOT_COLORS[s.status] || "#94A3B8" }}
                    />
                    <Badge label={s.status} color={STATUS_COLOR[s.status] || "gray"} />
                  </div>
                </TD>
                <TD>
                  <div className="flex gap-1">
                    <Btn size="xs" variant="secondary">Update</Btn>
                    {s.status === "Processing" && <Btn size="xs" variant="primary">Enter Result</Btn>}
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
