import { useState } from "react";

const NAV_ITEMS = [
  {
    group: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    ],
  },
  {
    group: "Patient Care",
    items: [
      { id: "patients", label: "Patients (CRM)", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
      { id: "doctors", label: "Doctors", icon: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
      { id: "doctorpatients", label: "Doctor Workload", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7zM16 11h6M19 8v6" },
      { id: "appointments", label: "Appointments", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
      { id: "tokens", label: "Token & Queue", icon: "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" },
    ],
  },
  {
    group: "Laboratory",
    items: [
      { id: "labtests", label: "Lab Tests", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
      { id: "laboratorian", label: "Laboratorian", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
      { id: "barcode", label: "Barcode & Samples", icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" },
      { id: "reports", label: "Lab Reports", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    ],
  },
  {
    group: "Finance",
    items: [
      { id: "billing", label: "Billing", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
      { id: "paymentreport", label: "Payment Report", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    ],
  },
  {
    group: "Operations",
    items: [
      { id: "inventory", label: "Inventory", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
      { id: "employees", label: "Employees", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
      { id: "corporate", label: "Corporate Clients", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    ],
  },
  {
    group: "System",
    items: [
      { id: "notifications", label: "SMS & Notifications", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
      { id: "analytics", label: "Reports & Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
      { id: "settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
    ],
  },
];

interface SidebarProps {
  active: string;
  onNavigate: (id: string) => void;
  userRole?: string;
}

export default function Sidebar({ active, onNavigate, userRole = "Super Admin" }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const initials = userRole.split(" ").map((w) => w[0]).join("").slice(0, 2);

  return (
    <aside
      className="flex flex-col h-full transition-all duration-200 relative"
      style={{ width: collapsed ? 56 : 224, background: "#0F172A", minWidth: collapsed ? 56 : 224 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg" style={{ background: "#0EA5E9" }}>
          <svg className="w-4.5 h-4.5 w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
          </svg>
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="text-white text-xs font-bold truncate">MediCare DCMS</div>
            <div className="text-[10px] truncate" style={{ color: "#475569" }}>v2.0 · Dhaka Main</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-colors"
          style={{ color: "#475569" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#94A3B8")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {collapsed
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            }
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-hide">
        {NAV_ITEMS.map((group) => (
          <div key={group.group} className="mb-0.5">
            {!collapsed && (
              <div className="px-3 pt-4 pb-1 text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: "#334155" }}>
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  className="w-full flex items-center gap-2.5 py-2 text-left transition-all duration-100 group relative"
                  style={{
                    padding: collapsed ? "8px 0" : "7px 12px",
                    justifyContent: collapsed ? "center" : undefined,
                    color: isActive ? "#FFFFFF" : "#64748B",
                    background: isActive ? "rgba(14,165,233,0.12)" : "transparent",
                    borderLeft: isActive ? "2px solid #0EA5E9" : "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "#CBD5E1";
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "#64748B";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <svg
                    className="flex-shrink-0"
                    width={16} height={16}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    strokeWidth={isActive ? 2 : 1.7}
                    style={{ color: isActive ? "#38BDF8" : "currentColor" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {!collapsed && (
                    <span className="text-[11px] font-medium truncate">{item.label}</span>
                  )}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} className="px-3 py-3">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: "#0EA5E9" }}>
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-white text-[11px] font-semibold truncate">{userRole}</div>
              <div className="text-[10px] truncate" style={{ color: "#475569" }}>Dhaka Main Branch</div>
            </div>
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold" style={{ background: "#0EA5E9" }}>
              {initials}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
