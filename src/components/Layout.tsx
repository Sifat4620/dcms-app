import { useState } from "react";

/* ─── Icon helper ─────────────────────────────── */
export function Icon({ d, className = "w-4 h-4" }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

/* ─── Badge ────────────────────────────────────── */
type BadgeColor = "green" | "blue" | "yellow" | "red" | "gray" | "purple" | "orange";
export function Badge({ label, color }: { label: string; color: BadgeColor }) {
  const cls: Record<BadgeColor, string> = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-sky-50 text-sky-700 border-sky-200",
    yellow: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    gray: "bg-slate-100 text-slate-600 border-slate-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border leading-none ${cls[color]}`}>
      {label}
    </span>
  );
}

/* ─── Button ───────────────────────────────────── */
type BtnVariant = "primary" | "secondary" | "danger" | "ghost";
type BtnSize = "xs" | "sm" | "md";

export function Btn({
  children, variant = "primary", onClick, size = "sm", type = "button", disabled = false,
}: {
  children: React.ReactNode;
  variant?: BtnVariant;
  onClick?: () => void;
  size?: BtnSize;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const base = "inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all cursor-pointer select-none disabled:opacity-60 disabled:cursor-not-allowed";
  const sizes: Record<BtnSize, string> = {
    xs: "px-2 py-1 text-[11px]",
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };
  const variants: Record<BtnVariant, string> = {
    primary: "bg-sky-500 text-white hover:bg-sky-600 shadow-sm shadow-sky-500/20",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/20",
    ghost: "text-slate-600 hover:bg-slate-100",
  };
  return (
    <button type={type} className={`${base} ${sizes[size]} ${variants[variant]}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

/* ─── Stat Card ────────────────────────────────── */
export function StatCard({
  label, value, sub, color = "blue", icon, trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: "blue" | "green" | "amber" | "red" | "purple" | "teal";
  icon: string;
  trend?: { value: string; up: boolean };
}) {
  const colors: Record<string, { bg: string; text: string; icon: string }> = {
    blue:   { bg: "#EFF6FF", text: "#1D4ED8", icon: "#3B82F6" },
    green:  { bg: "#F0FDF4", text: "#15803D", icon: "#22C55E" },
    amber:  { bg: "#FFFBEB", text: "#B45309", icon: "#F59E0B" },
    red:    { bg: "#FEF2F2", text: "#B91C1C", icon: "#EF4444" },
    purple: { bg: "#F5F3FF", text: "#6D28D9", icon: "#8B5CF6" },
    teal:   { bg: "#F0FDFA", text: "#0F766E", icon: "#14B8A6" },
  };
  const c = colors[color];
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3 hover:shadow-sm transition-shadow">
      <div className="rounded-lg p-2.5 flex-shrink-0" style={{ background: c.bg }}>
        <svg className="w-5 h-5" style={{ color: c.icon }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900 leading-tight mt-0.5">{value}</p>
        {trend && (
          <div className={`flex items-center gap-1 mt-1 text-[11px] font-medium ${trend.up ? "text-emerald-600" : "text-red-500"}`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={trend.up ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
            {trend.value}
          </div>
        )}
        {sub && !trend && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Search Bar ───────────────────────────────── */
export function SearchBar({
  placeholder, value, onChange,
}: { placeholder?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        className="pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 w-60 transition-all"
        placeholder={placeholder || "Search..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/* ─── Table ────────────────────────────────────── */
export function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr style={{ borderBottom: "1px solid #F1F5F9", background: "#F8FAFC" }}>
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function TR({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <tr
      className="border-b border-slate-50 hover:bg-sky-50/30 transition-colors group"
      style={onClick ? { cursor: "pointer" } : undefined}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TD({ children, mono = false, className = "" }: { children: React.ReactNode; mono?: boolean; className?: string }) {
  return (
    <td className={`px-4 py-3 text-slate-700 ${mono ? "font-mono text-[11px] text-slate-500" : "text-xs"} ${className}`}>
      {children}
    </td>
  );
}

/* ─── Card ─────────────────────────────────────── */
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm ${className}`}>
      {children}
    </div>
  );
}

/* ─── Card Header ──────────────────────────────── */
export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

/* ─── Section Header ───────────────────────────── */
export function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

/* ─── Empty State ──────────────────────────────── */
export function Empty({ message = "No records found" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      <svg className="w-10 h-10 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-xs">{message}</p>
    </div>
  );
}

/* ─── Modal ────────────────────────────────────── */
export function Modal({
  open, onClose, title, children, width = "max-w-lg",
}: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.5)" }} onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${width}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ─── Form Field ───────────────────────────────── */
export function Field({
  label, children, required,
}: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

export function Input({
  placeholder, value, onChange, type = "text",
}: { placeholder?: string; value?: string; onChange?: (v: string) => void; type?: string }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 placeholder-slate-300 transition-all"
    />
  );
}

/* ─── Top Header ───────────────────────────────── */
interface HeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string[];
  actions?: React.ReactNode;
  user?: { name: string; role: string };
  onLogout?: () => void;
}

export function Header({ title, subtitle, breadcrumb, actions, user, onLogout }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const notifications = [
    { id: 1, type: "report", text: "Report RPT-001 is ready for approval", time: "2 min ago", unread: true },
    { id: 2, type: "stock", text: "Syringe 5ml stock below reorder level", time: "18 min ago", unread: true },
    { id: 3, type: "payment", text: "Payment due: Karim Hossain · ৳2,600", time: "1 hr ago", unread: true },
    { id: 4, type: "appointment", text: "5 appointments confirmed for today", time: "2 hr ago", unread: false },
  ];

  const initials = user?.name.split(" ").map((n) => n[0]).join("").slice(0, 2) || "AD";

  return (
    <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 z-10">
      <div className="min-w-0">
        {breadcrumb && (
          <div className="flex items-center gap-1 mb-0.5">
            {breadcrumb.map((b, i) => (
              <span key={b} className="flex items-center gap-1">
                {i > 0 && <svg className="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>}
                <span className={`text-[11px] ${i === breadcrumb.length - 1 ? "text-sky-600 font-medium" : "text-slate-400"}`}>{b}</span>
              </span>
            ))}
          </div>
        )}
        <h1 className="text-sm font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {actions && <div className="flex items-center gap-2">{actions}</div>}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowDropdown(false); }}
            className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border border-white" />
          </button>

          {showNotif && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-800">Notifications</span>
                <button className="text-[11px] text-sky-500 hover:text-sky-700">Mark all read</button>
              </div>
              {notifications.map((n) => (
                <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${n.unread ? "bg-sky-50/40" : ""}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.unread ? "bg-sky-500" : "bg-transparent"}`} />
                  <div>
                    <p className="text-xs text-slate-700">{n.text}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
              <div className="px-4 py-2 text-center">
                <button className="text-xs text-sky-500 hover:text-sky-700">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200" />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => { setShowDropdown(!showDropdown); setShowNotif(false); }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: "#0EA5E9" }}>
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-800">{user?.name || "Admin"}</div>
              <div className="text-[10px] text-slate-400">{user?.role || "Super Admin"}</div>
            </div>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-10 w-52 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="text-xs font-semibold text-slate-800">{user?.name}</div>
                <div className="text-[11px] text-slate-400">{user?.role}</div>
              </div>
              {[
                { label: "My Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
                { label: "Change Password", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
                { label: "Preferences", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
              ].map((item) => (
                <button key={item.label} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.label}
                </button>
              ))}
              <div className="border-t border-slate-100 mt-1">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─── Page Layout ──────────────────────────────── */
interface LayoutProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string[];
  actions?: React.ReactNode;
  children: React.ReactNode;
  user?: { name: string; role: string };
  onLogout?: () => void;
}

export default function Layout({ title, subtitle, breadcrumb, actions, children, user, onLogout }: LayoutProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "#F8FAFC" }}>
      <Header title={title} subtitle={subtitle} breadcrumb={breadcrumb} actions={actions} user={user} onLogout={onLogout} />
      <main className="flex-1 overflow-auto p-5 space-y-5">
        {children}
      </main>
    </div>
  );
}
