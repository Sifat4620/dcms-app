import { useEffect, useState } from "react";
import Layout, { Card, Badge, Btn, SearchBar, Table, TR, TD, Modal, Field, Input } from "../components/Layout";
import { api } from "../data/api";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
  onUserUpdate: (user: any) => void;
}

const METHOD_COLOR: Record<string, "green" | "blue" | "purple"> = {
  Cash: "green",
  Card: "blue",
  "Mobile Banking": "purple",
  "Bank Transfer": "purple",
  "Online Payment": "purple",
};

export default function Payments({ pageProps, user, onLogout, onUserUpdate }: PageProps) {
  const [search, setSearch] = useState("");
  const [dueList, setDueList] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [payTarget, setPayTarget] = useState<any | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");

  const load = () => {
    api.get<any>("/billing/due").then(setDueList).catch(() => {});
    api.get<any>("/billing/payments?limit=100").then(setPayments).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const filteredDue = dueList.filter(
    (i) => (i.patient_name || "").toLowerCase().includes(search.toLowerCase()) || (i.invoice_no || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalOutstanding = dueList.reduce((s, i) => s + (i.due_amount || 0), 0);

  const recordPayment = async () => {
    try {
      await api.post(`/billing/invoices/${payTarget.invoice_id}/payments`, {
        amount: Number(amount),
        payment_method: method,
      });
      setPayTarget(null);
      setAmount("");
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <Layout
      title={pageProps.title}
      subtitle="Payment collection, partial payments, and outstanding dues"
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      onUserUpdate={onUserUpdate}
      actions={
        <>
          <SearchBar placeholder="Patient or invoice..." value={search} onChange={setSearch} />
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Payments Received</div>
            <div className="text-2xl font-semibold text-slate-900">{payments.length}</div>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <div className="text-[11px] text-red-500">Total Outstanding</div>
            <div className="text-2xl font-semibold text-red-600">৳ {totalOutstanding.toLocaleString()}</div>
          </div>
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
            <div className="text-[11px] text-amber-600">Invoices with Due</div>
            <div className="text-2xl font-semibold text-amber-600">{dueList.length}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-800">Outstanding Dues</h3>
              <Badge label={`${dueList.length} invoices`} color="red" />
            </div>
            <div className="divide-y divide-slate-50">
              {filteredDue.map((inv) => (
                <div key={inv.invoice_id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xs font-bold flex-shrink-0">
                    {(inv.patient_name || "?").slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-800">{inv.patient_name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{inv.invoice_no}</div>
                  </div>
                  <div className="text-right mr-1">
                    <div className="text-sm font-semibold text-red-500">৳ {inv.due_amount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">of ৳ {inv.total_amount.toLocaleString()}</div>
                  </div>
                  <Btn size="xs" variant="primary" onClick={() => setPayTarget(inv)}>Collect Due</Btn>
                </div>
              ))}
              {filteredDue.length === 0 && (
                <div className="px-4 py-8 text-center text-xs text-slate-400">No outstanding dues</div>
              )}
            </div>
          </Card>

          <Card>
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-800">Recent Payments</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {payments.slice(0, 8).map((p) => (
                <div key={p.payment_id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold flex-shrink-0">
                    {(p.payment_method || "?").slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-800">Invoice #{p.invoice_id}</div>
                    <div className="text-[10px] text-slate-400">{p.payment_date}</div>
                  </div>
                  <Badge label={p.payment_method || "Cash"} color={METHOD_COLOR[p.payment_method] || "green"} />
                  <div className="text-sm font-semibold text-emerald-600">৳ {p.amount.toLocaleString()}</div>
                </div>
              ))}
              {payments.length === 0 && (
                <div className="px-4 py-8 text-center text-xs text-slate-400">No payments recorded</div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Modal open={!!payTarget} onClose={() => setPayTarget(null)} title={`Collect Payment — ${payTarget?.invoice_no || ""}`}>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
            <div className="text-slate-500">Patient: <span className="font-medium text-slate-800">{payTarget?.patient_name}</span></div>
            <div className="text-slate-500">Outstanding due: <span className="font-mono font-semibold text-red-500">৳ {payTarget?.due_amount?.toLocaleString()}</span></div>
          </div>
          <Field label="Amount" required>
            <Input type="number" placeholder="Amount (BDT)" value={amount} onChange={setAmount} />
          </Field>
          <Field label="Payment Method">
            <select
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400 bg-white"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              {["Cash", "Card", "Mobile Banking", "Bank Transfer", "Online Payment"].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
          <Btn variant="secondary" onClick={() => setPayTarget(null)}>Cancel</Btn>
          <Btn onClick={recordPayment}>Record Payment</Btn>
        </div>
      </Modal>
    </Layout>
  );
}
