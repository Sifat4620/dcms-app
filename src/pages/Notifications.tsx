import { useState } from "react";
import Layout, { Card, Badge, Btn } from "../components/Layout";
import { notifications } from "../data/mockData";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
}

const TEMPLATES = [
  { id: "T1", event: "Appointment Confirmation", channel: "SMS", status: "Active", template: "Dear {patient_name}, your appointment with {doctor_name} is confirmed for {date} at {time}. Token #{token}." },
  { id: "T2", event: "Report Ready", channel: "SMS", status: "Active", template: "Dear {patient_name}, your diagnostic report is ready. Visit us or access via secure link: {link}" },
  { id: "T3", event: "Payment Due Reminder", channel: "SMS", status: "Active", template: "Dear {patient_name}, you have an outstanding balance of BDT {amount}. Please clear at your earliest convenience." },
  { id: "T4", event: "Appointment Reminder (1 day)", channel: "SMS", status: "Active", template: "Reminder: Your appointment with {doctor_name} is tomorrow at {time}. Please arrive 10 mins early." },
  { id: "T5", event: "Birthday Greeting", channel: "SMS", status: "Inactive", template: "Happy Birthday, {patient_name}! Wishing you great health. Enjoy 10% off your next visit." },
];

type TriggerItem = { label: string; enabled: boolean };

const INITIAL_TRIGGERS: TriggerItem[] = [
  { label: "Report Ready", enabled: true },
  { label: "Appointment Confirmation", enabled: true },
  { label: "Appointment Reminder (24h)", enabled: true },
  { label: "Payment Due", enabled: true },
  { label: "Birthday Greeting", enabled: false },
  { label: "Follow-up Reminder", enabled: false },
  { label: "Promotional Campaign", enabled: false },
  { label: "Token Update", enabled: true },
];

export default function Notifications({ pageProps, user, onLogout }: PageProps) {
  const [triggers, setTriggers] = useState<TriggerItem[]>(INITIAL_TRIGGERS);

  const toggleTrigger = (index: number) => {
    setTriggers((prev) =>
      prev.map((t, i) => (i === index ? { ...t, enabled: !t.enabled } : t))
    );
  };

  return (
    <Layout
      title={pageProps.title}
      subtitle="Automated patient notifications and communication"
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      actions={<Btn>+ Add Template</Btn>}
    >
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Sent Today", value: "47", color: "text-slate-900", bg: "bg-white", border: "border-slate-200" },
            { label: "Delivered", value: "45", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
            { label: "Failed", value: "2", color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
            { label: "This Month", value: "1,234", color: "text-slate-900", bg: "bg-white", border: "border-slate-200" },
          ].map((s) => (
            <div key={s.label} className={`rounded-lg border ${s.border} ${s.bg} p-4`}>
              <div className="text-[11px] text-slate-500">{s.label}</div>
              <div className={`text-2xl font-semibold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Templates */}
          <Card>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-800">Notification Templates</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {TEMPLATES.map((t) => (
                <div key={t.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-800">{t.event}</span>
                      <Badge label={t.channel} color="blue" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge label={t.status} color={t.status === "Active" ? "green" : "gray"} />
                      <Btn size="xs" variant="ghost">Edit</Btn>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-mono bg-slate-50 rounded px-2 py-1.5">
                    {t.template}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Notification log */}
          <Card>
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-800">Recent Notifications</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {notifications.map((n) => (
                <div key={n.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-700">{n.recipient}</span>
                      <Badge label={n.type} color="blue" />
                    </div>
                    <Badge label={n.status} color={n.status === "Delivered" ? "green" : "red"} />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-1">{n.message}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="font-mono">{n.phone}</span>
                    <span>·</span>
                    <span>{n.channel}</span>
                    <span>·</span>
                    <span className="font-mono">{n.sentAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Improved notification trigger toggles */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-800">Automatic Trigger Settings</h3>
            <span className="text-[11px] text-slate-400">{triggers.filter((t) => t.enabled).length}/{triggers.length} active</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {triggers.map((item, index) => (
              <button
                key={item.label}
                onClick={() => toggleTrigger(index)}
                className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                  item.enabled
                    ? "bg-sky-50 border-sky-200 hover:bg-sky-100"
                    : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                }`}
              >
                <div className="flex-1 min-w-0 mr-2">
                  <span className={`text-[11px] font-medium leading-tight block ${item.enabled ? "text-sky-800" : "text-slate-500"}`}>
                    {item.label}
                  </span>
                  <span className={`text-[10px] mt-0.5 block ${item.enabled ? "text-sky-500" : "text-slate-400"}`}>
                    {item.enabled ? "Active" : "Inactive"}
                  </span>
                </div>
                {/* Improved toggle */}
                <div
                  className={`w-9 h-5 rounded-full relative flex-shrink-0 transition-colors ${
                    item.enabled ? "bg-sky-500" : "bg-slate-200"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                      item.enabled ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
