"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const navGroups = [
  {
    label: "OPERATIONS", key: "ops",
    links: [
      { href: "/admin/dashboard", label: "Dashboard", badge: null as string | null },
      { href: "/admin/workflow", label: "Workflow", badge: null },
      { href: "/admin/team-center", label: "Team Center", badge: null },
    ],
  },
  {
    label: "PRODUCTION", key: "prod",
    links: [
      { href: "/admin/studio", label: "Studio", badge: null },
      { href: "/admin/content", label: "Content", badge: null },
      { href: "/admin/approvals", label: "Approvals", badge: null },
    ],
  },
  {
    label: "SALES & CRM", key: "crm",
    links: [
      { href: "/admin/clients", label: "Clients", badge: null },
      { href: "/admin/meetings", label: "Meetings", badge: null },
      { href: "/admin/quotations", label: "Quotations", badge: null },
      { href: "/admin/contracts", label: "Contracts", badge: null },
    ],
  },
  {
    label: "FINANCE", key: "fin",
    links: [
      { href: "/admin/accounting", label: "Accounting", badge: null },
      { href: "/admin/reporting", label: "Reporting", badge: null },
    ],
  },
  {
    label: "SYSTEM", key: "sys",
    links: [
      { href: "/admin/automation", label: "Automation", badge: null },
      { href: "/admin/settings", label: "Settings", badge: null },
    ],
  },
];


export function SidebarNav({ currentPath, totalNotifs }: { currentPath: string; totalNotifs: number }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tl-nav-collapse");
      if (saved) setCollapsed(JSON.parse(saved));
    } catch {}
  }, []);

  function toggleGroup(key: string) {
    setCollapsed(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem("tl-nav-collapse", JSON.stringify(next)); } catch {}
      return next;
    });
  }

  const groups = navGroups.map(g => ({
    ...g,
    links: g.links.map(l => ({
      ...l,
      badge: l.href === "/admin/notifications" && totalNotifs > 0 ? String(totalNotifs) : null,
    })),
  }));

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") return currentPath === href;
    return currentPath.startsWith(href);
  };

  return (
    <>
      <button
        onClick={() => setMobileOpen(o => !o)}
        className="fixed left-4 top-4 z-50 grid h-10 w-10 place-items-center rounded-xl border border-[#06111F]/10 bg-white shadow-sm lg:hidden"
        aria-label="Toggle navigation"
      >
        <svg className="h-5 w-5 text-[#06111F]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-[#06111F]/10 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-[#06111F]/10 px-5 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0B7CFF]">True Level</p>
            <p className="mt-0.5 text-lg font-black uppercase tracking-[-0.04em]">Operations</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg border border-[#06111F]/10 lg:hidden">
            <svg className="h-4 w-4 text-[#06111F]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {groups.map(group => (
              <div key={group.key}>
                <button
                  onClick={() => toggleGroup(group.key)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#06111F]/40 transition hover:text-[#06111F]/80"
                >
                  {group.label}
                  <svg className={`h-3 w-3 transition-transform duration-200 ${collapsed[group.key] ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {!collapsed[group.key] && (
                  <div className="ml-1 space-y-0.5">
                    {group.links.map(link => {
                      const active = isActive(link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${active ? "bg-[#0B7CFF]/10 text-[#0B7CFF]" : "text-[#06111F]/70 hover:bg-[#06111F]/5 hover:text-[#06111F]"}`}
                        >
                          <span className="flex-1">{link.label}</span>
                          {link.badge ? (
                            <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-red-600 px-1.5 text-[9px] font-black text-white">{link.badge}</span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        <div className="border-t border-[#06111F]/10 px-3 py-3">
          <Link
            href="/admin/notifications"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${isActive("/admin/notifications") ? "bg-[#0B7CFF]/10 text-[#0B7CFF]" : "text-[#06111F]/70 hover:bg-[#06111F]/5 hover:text-[#06111F]"}`}
          >
            <span className="flex-1">Notifications</span>
            {totalNotifs > 0 ? (
              <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-red-600 px-1.5 text-[9px] font-black text-white">{totalNotifs > 99 ? "99+" : totalNotifs}</span>
            ) : null}
          </Link>
        </div>

        {mobileOpen && <div className="fixed inset-0 -z-10 bg-black/20 lg:hidden" onClick={() => setMobileOpen(false)} />}
      </aside>
    </>
  );
}
