import { useState } from "react";
import Layout, { Card, Badge, Btn } from "../components/Layout";
import { tokens as initialTokens } from "../data/mockData";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
}

const TYPE_COLOR: Record<string, "gray" | "orange" | "red"> = {
  General: "gray",
  Priority: "orange",
  Emergency: "red",
};

const STATUS_COLOR: Record<string, "blue" | "green" | "gray" | "yellow" | "red"> = {
  Serving: "green",
  Waiting: "blue",
  Completed: "gray",
  Skipped: "yellow",
  Cancelled: "red",
};

export default function Tokens({ pageProps, user, onLogout }: PageProps) {
  const [tokens, setTokens] = useState(initialTokens);
  const serving = tokens.find((t) => t.status === "Serving");
  const waiting = tokens.filter((t) => t.status === "Waiting");

  const callNext = () => {
    setTokens((prev) => {
      const updated = prev.map((t) =>
        t.status === "Serving" ? { ...t, status: "Completed" } : t
      );
      const nextIdx = updated.findIndex((t) => t.status === "Waiting");
      if (nextIdx !== -1) {
        updated[nextIdx] = { ...updated[nextIdx], status: "Serving" };
      }
      return [...updated];
    });
  };

  return (
    <Layout
      title={pageProps.title}
      subtitle="Real-time patient queue control"
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      actions={<Btn>+ Issue Token</Btn>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Display board */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl p-6 text-center relative overflow-hidden" style={{ background: "#0F172A" }}>
            <div className="text-[11px] uppercase tracking-widest text-slate-400">Now Serving</div>
            {serving ? (
              <>
                {/* Pulsing ring animation */}
                <div className="relative inline-flex items-center justify-center mt-4 mb-2">
                  <span className="absolute inline-flex w-24 h-24 rounded-full opacity-20 animate-ping" style={{ background: "#0EA5E9" }} />
                  <span className="absolute inline-flex w-20 h-20 rounded-full opacity-30" style={{ background: "#0EA5E9" }} />
                  <span className="relative flex items-center justify-center w-16 h-16 rounded-full" style={{ background: "#0EA5E9" }}>
                    <span className="text-2xl font-bold text-white font-mono">{serving.token.replace("T-", "")}</span>
                  </span>
                </div>
                <div className="text-3xl font-bold text-white font-mono mt-1">{serving.token}</div>
                <div className="text-sm text-sky-400 mt-2">{serving.patient}</div>
                <div className="text-xs text-slate-400 mt-1">{serving.dept}</div>
                <div className="text-xs text-slate-500 mt-0.5">{serving.doctor}</div>
                <div className="mt-3 inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                  <span className="text-[11px] text-slate-300">Counter</span>
                  <span className="text-[11px] font-mono font-semibold text-white">{serving.counter}</span>
                </div>
              </>
            ) : (
              <div className="text-slate-400 mt-6 text-sm">Queue Empty</div>
            )}

            {/* Estimated wait times */}
            {waiting.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="text-[10px] text-slate-400 mb-1.5">Estimated Wait Times</div>
                {waiting.slice(0, 3).map((t, i) => (
                  <div key={t.id} className="flex items-center justify-between px-1 py-0.5">
                    <span className="text-[11px] font-mono text-slate-400">{t.token}</span>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[11px] text-slate-400">~{(i + 1) * 12} min</span>
                    </div>
                  </div>
                ))}
                {waiting.length > 3 && (
                  <div className="text-[10px] text-slate-500 mt-1">+{waiting.length - 3} more in queue</div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs font-semibold text-slate-700 mb-3">Queue Controls</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={callNext}
                className="flex flex-col items-center gap-1 py-3 rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                <span className="text-[11px] font-medium">Call Next</span>
              </button>
              <button className="flex flex-col items-center gap-1 py-3 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-[11px] font-medium">Recall</span>
              </button>
              <button className="flex flex-col items-center gap-1 py-3 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-[11px] font-medium">Skip</span>
              </button>
              <button className="flex flex-col items-center gap-1 py-3 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="text-[11px] font-medium">Transfer</span>
              </button>
            </div>
          </div>

          {/* Queue stats */}
          <Card className="p-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-sky-600">{waiting.length}</div>
                <div className="text-[10px] text-slate-400">Waiting</div>
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-600">{tokens.filter((t) => t.status === "Completed").length}</div>
                <div className="text-[10px] text-slate-400">Done</div>
              </div>
              <div>
                <div className="text-lg font-bold text-amber-600">{tokens.filter((t) => t.status === "Skipped").length}</div>
                <div className="text-[10px] text-slate-400">Skipped</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Token list */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-800">All Tokens Today</h3>
            <span className="text-[11px] text-slate-400">{tokens.length} total</span>
          </div>
          <div className="divide-y divide-slate-50">
            {tokens.map((t, i) => {
              const waitIdx = waiting.findIndex((w) => w.id === t.id);
              const estWait = waitIdx >= 0 ? `~${(waitIdx + 1) * 12} min` : null;
              return (
                <div key={t.id} className={`flex items-center gap-3 px-4 py-3 transition-colors ${t.status === "Serving" ? "bg-sky-50" : "hover:bg-slate-50"}`}>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm flex-shrink-0"
                    style={t.status === "Serving" ? { background: "#0EA5E9", color: "white" } : { background: "#F1F5F9", color: "#475569" }}
                  >
                    {t.token.replace("T-", "")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-800">{t.patient}</span>
                      <Badge label={t.type} color={TYPE_COLOR[t.type] || "gray"} />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{t.dept} · {t.doctor}</div>
                    {estWait && (
                      <div className="text-[10px] text-amber-600 mt-0.5 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Est. wait: {estWait}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge label={t.status} color={STATUS_COLOR[t.status] || "gray"} />
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">{t.createdAt}</div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    {t.status === "Waiting" && (
                      <>
                        <Btn size="xs" variant="primary">Call</Btn>
                        <Btn size="xs" variant="ghost">Skip</Btn>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
