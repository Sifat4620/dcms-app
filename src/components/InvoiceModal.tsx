import { Btn } from "./Layout";
import { api } from "../data/api";

interface InvoiceData {
  invoice_id: number;
  invoice_no?: string;
  invoice_date?: string;
  subtotal?: number;
  discount?: number;
  vat_amount?: number;
  total_amount?: number;
  paid_amount?: number;
  due_amount?: number;
  status?: string;
  patient_name?: string;
  patient_unique_id?: string;
  patient_mobile?: string;
  gender?: string;
  date_of_birth?: string;
  items?: any[];
  payments?: any[];
  branch?: { branch_name?: string; address?: string; phone?: string; email?: string; logo?: string | null };
}

const money = (n: any) => "৳ " + (Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function fmtDate(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function InvoiceModal({
  invoice, open, onClose,
}: { invoice: InvoiceData | null; open: boolean; onClose: () => void }) {
  if (!open || !invoice) return null;

  const branch = invoice.branch || {};
  const items = invoice.items || [];
  const payments = invoice.payments || [];
  const due = Number(invoice.due_amount) || 0;
  const statusColor = invoice.status === "Paid" ? "#10B981" : invoice.status === "Partial" ? "#F59E0B" : "#EF4444";

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-auto" style={{ background: "rgba(15,23,42,0.55)" }} onClick={onClose}>
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl my-4" onClick={(e) => e.stopPropagation()}>
          {/* Toolbar (screen only) */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Invoice {invoice.invoice_no}</h2>
              <p className="text-[11px] text-slate-400">Print a copy for the patient</p>
            </div>
            <div className="flex gap-2 print:hidden">
              <Btn variant="secondary" onClick={onClose}>Close</Btn>
              <Btn onClick={() => window.print()}>🖨 Print Invoice</Btn>
            </div>
          </div>

          {/* Printable invoice */}
          <div className="p-6 sm:p-8 print:p-0">
            <div
              className="invoice-sheet rounded-xl border border-slate-200 bg-white overflow-hidden"
              style={{ maxWidth: "100%", fontFamily: "inherit" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-4 px-6 py-5 border-b-2" style={{ borderColor: "#0EA5E9", background: "#F8FBFF" }}>
                <div className="flex items-center gap-3 min-w-0">
                  {branch.logo ? (
                    <img src={branch.logo} alt="logo" className="w-14 h-14 object-contain flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0" style={{ background: "#0EA5E9" }}>
                      {(branch.branch_name || "D").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-base font-extrabold text-slate-900 leading-tight">{branch.branch_name || "Diagnostic Center"}</div>
                    {branch.address && <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{branch.address}</div>}
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {[branch.phone, branch.email].filter(Boolean).join(" · ") || ""}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-sky-600">Invoice</div>
                  <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">{invoice.invoice_no}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Date: {fmtDate(invoice.invoice_date)}</div>
                  <span
                    className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                    style={{ background: statusColor }}
                  >
                    {invoice.status}
                  </span>
                </div>
              </div>

              {/* Patient info */}
              <div className="px-6 py-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                <div className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Billed To</div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-sm font-semibold text-slate-900">{invoice.patient_name || "—"}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">ID: {invoice.patient_unique_id || "—"}</div>
                </div>
                <div className="col-span-2 sm:col-span-1 text-left sm:text-right">
                  <div className="text-[11px] text-slate-500">Mobile: <span className="text-slate-800">{invoice.patient_mobile || "—"}</span></div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {invoice.gender && <span>{invoice.gender}{invoice.date_of_birth ? " · " : ""}</span>}
                    {invoice.date_of_birth ? `DOB: ${fmtDate(invoice.date_of_birth)}` : ""}
                  </div>
                </div>
              </div>

              {/* Items table */}
              <div className="px-6">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500">
                      <th className="py-2 pr-2 border-b border-slate-200 font-semibold">#</th>
                      <th className="py-2 pr-2 border-b border-slate-200 font-semibold">Description</th>
                      <th className="py-2 pr-2 border-b border-slate-200 font-semibold text-center">Qty</th>
                      <th className="py-2 pr-2 border-b border-slate-200 font-semibold text-right">Unit Price</th>
                      <th className="py-2 border-b border-slate-200 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, i) => (
                      <tr key={it.invoice_item_id ?? i} className="align-top">
                        <td className="py-2 pr-2 border-b border-slate-100 text-slate-400">{i + 1}</td>
                        <td className="py-2 pr-2 border-b border-slate-100">
                          <span className="font-medium text-slate-800">{it.item_name || "—"}</span>
                          {it.item_type && <span className="ml-1.5 text-[10px] text-slate-400">({it.item_type})</span>}
                        </td>
                        <td className="py-2 pr-2 border-b border-slate-100 text-center">{it.quantity}</td>
                        <td className="py-2 pr-2 border-b border-slate-100 text-right">{money(it.unit_price)}</td>
                        <td className="py-2 border-b border-slate-100 text-right font-medium text-slate-800">{money(it.amount)}</td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr><td colSpan={5} className="py-4 text-center text-slate-400">No items</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals + payments */}
              <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  {payments.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Payment History</div>
                      {payments.map((p, i) => (
                        <div key={p.payment_id ?? i} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-50">
                          <span className="text-slate-500">{fmtDate(p.payment_date)} · {p.payment_method || "Cash"}</span>
                          <span className="font-medium text-slate-800">{money(p.amount)}</span>
                        </div>
                      ))}
                      {payments.some((p) => p.transaction_no) && (
                        <div className="text-[10px] font-mono text-sky-600 mt-1">
                          {payments.filter((p) => p.transaction_no).map((p) => `Trx: ${p.transaction_no}`).join(" · ")}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="text-[11px] text-slate-400 mt-3">Thank you for choosing {branch.branch_name || "our clinic"}.</div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{money(invoice.subtotal)}</span></div>
                  {Number(invoice.discount) > 0 && (
                    <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="text-emerald-600">-{money(invoice.discount)}</span></div>
                  )}
                  {Number(invoice.vat_amount) > 0 && (
                    <div className="flex justify-between"><span className="text-slate-500">VAT</span><span>{money(invoice.vat_amount)}</span></div>
                  )}
                  <div className="flex justify-between pt-1.5 border-t border-slate-200 text-sm font-bold text-slate-900">
                    <span>Total</span><span>{money(invoice.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700"><span>Paid</span><span>{money(invoice.paid_amount)}</span></div>
                  <div className="flex justify-between items-center" style={{ color: due > 0 ? "#EF4444" : "#10B981" }}>
                    <span className="font-semibold">Due</span><span className="font-bold text-base">-{money(due)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-center text-[10px] text-slate-400">
                This is a computer-generated invoice and does not require a signature.
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .invoice-sheet, .invoice-sheet * { visibility: visible !important; }
          .invoice-sheet {
            position: absolute !important;
            left: 0 !important; right: 0 !important; top: 0 !important;
            width: 100% !important;
            border: none !important; border-radius: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </>
  );
}

/* Small helper so the modal can be opened imperatively by passing invoice data + a fetch */
export async function openInvoiceFor(id: number): Promise<InvoiceData | null> {
  return api.get<InvoiceData>(`/billing/invoices/${id}`).catch(() => null);
}
