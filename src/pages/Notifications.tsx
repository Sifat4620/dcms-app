import { useEffect, useState } from "react";
import Layout, { Card, Badge, Btn, Field, Input, Modal } from "../components/Layout";
import { api } from "../data/api";

interface PageProps {
  pageProps: { title: string; breadcrumb: string[] };
  user: { name: string; role: string; email: string };
  onLogout: () => void;
  onUserUpdate: (user: any) => void;
}

export default function Notifications({ pageProps, user, onLogout, onUserUpdate }: PageProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState({ sentToday: 0, delivered: 0, failed: 0, thisMonth: 0 });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});

  const load = () => {
    api.get<any>("/notifications/templates").then(setTemplates).catch(() => {});
    api.get<any>("/notifications?limit=50").then(setNotifications).catch(() => {});
    api.get<any>("/notifications/stats").then(setStats).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const toggleTemplate = (t: any) => {
    api.put(`/notifications/templates/${t.template_id}`, { ...t, is_active: t.is_active ? 0 : 1 })
      .then(() => load()).catch(() => {});
  };

  const handleAdd = async () => {
    try {
      await api.post("/notifications/templates", {
        event_name: form.event_name,
        channel: form.channel || "SMS",
        body: form.body,
      });
      setShowAdd(false);
      setForm({});
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <Layout
      title={pageProps.title}
      subtitle="Automated patient notifications and communication"
      breadcrumb={pageProps.breadcrumb}
      user={user}
      onLogout={onLogout}
      onUserUpdate={onUserUpdate}
      actions={<Btn onClick={() => setShowAdd(true)}>+ Add Template</Btn>}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">Sent Today</div>
            <div className="text-2xl font-semibold text-slate-900">{stats.sentToday}</div>
          </div>
          <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
            <div className="text-[11px] text-emerald-600">Delivered</div>
            <div className="text-2xl font-semibold text-emerald-600">{stats.delivered}</div>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <div className="text-[11px] text-red-500">Failed</div>
            <div className="text-2xl font-semibold text-red-500">{stats.failed}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-[11px] text-slate-500">This Month</div>
            <div className="text-2xl font-semibold text-slate-900">{stats.thisMonth}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-800">Notification Templates</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {templates.map((t) => (
                <div key={t.template_id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-800">{t.event_name}</span>
                      <Badge label={t.channel} color="blue" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge label={t.is_active ? "Active" : "Inactive"} color={t.is_active ? "green" : "gray"} />
                      <Btn size="xs" variant="ghost" onClick={() => toggleTemplate(t)}>
                        {t.is_active ? "Disable" : "Enable"}
                      </Btn>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-mono bg-slate-50 rounded px-2 py-1.5">
                    {t.body}
                  </p>
                </div>
              ))}
              {templates.length === 0 && (
                <div className="px-4 py-8 text-center text-xs text-slate-400">No templates yet</div>
              )}
            </div>
          </Card>

          <Card>
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-800">Recent Notifications</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {notifications.map((n) => (
                <div key={n.notification_id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-700">{n.recipient_name || "—"}</span>
                      <Badge label={n.channel} color="blue" />
                    </div>
                    <Badge label={n.status} color={n.status === "Delivered" || n.status === "Sent" ? "green" : "red"} />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-1">{n.message}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="font-mono">{n.recipient_phone || "—"}</span>
                    <span>·</span>
                    <span className="font-mono">{n.created_at}</span>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="px-4 py-8 text-center text-xs text-slate-400">No notifications sent yet</div>
              )}
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-800">Automatic Trigger Settings</h3>
            <span className="text-[11px] text-slate-400">{templates.filter((t) => t.is_active).length}/{templates.length} active</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {templates.map((item) => (
              <button
                key={item.template_id}
                onClick={() => toggleTemplate(item)}
                className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                  item.is_active ? "bg-sky-50 border-sky-200 hover:bg-sky-100" : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                }`}
              >
                <div className="flex-1 min-w-0 mr-2">
                  <span className={`text-[11px] font-medium leading-tight block ${item.is_active ? "text-sky-800" : "text-slate-500"}`}>
                    {item.event_name}
                  </span>
                  <span className={`text-[10px] mt-0.5 block ${item.is_active ? "text-sky-500" : "text-slate-400"}`}>
                    {item.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className={`w-9 h-5 rounded-full relative flex-shrink-0 transition-colors ${item.is_active ? "bg-sky-500" : "bg-slate-200"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${item.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Notification Template">
        <div className="space-y-3">
          <Field label="Event Name" required>
            <Input placeholder="e.g. Appointment Confirmation" value={form.event_name || ""} onChange={(v) => setForm({ ...form, event_name: v })} />
          </Field>
          <Field label="Channel">
            <select
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400 bg-white"
              value={form.channel || "SMS"}
              onChange={(e) => setForm({ ...form, channel: e.target.value })}
            >
              {["SMS", "Email"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Template Body" required>
            <textarea
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400 font-mono"
              rows={3}
              placeholder="Dear {patient_name}, ..."
              value={form.body || ""}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </Field>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
          <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
          <Btn onClick={handleAdd}>Add Template</Btn>
        </div>
      </Modal>
    </Layout>
  );
}