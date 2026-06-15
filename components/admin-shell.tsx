import { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { logoutAction } from "@/lib/actions";
import { getUnreadNotificationCount, getUnreadWorkflowNotificationCount, getPendingTasksCount, getUpcomingMeetingsCount, getOverdueItemsCount } from "@/lib/admin-data";
import { AdminBlurToggle } from "./admin-blur-toggle";
import { CommandPalette } from "./command-palette";
import { SidebarNav } from "./admin-nav-sidebar";
import { getAdminBreadcrumbs } from "@/lib/admin-breadcrumbs";

export async function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const [notifCount, wfNotifCount, pendingTasks, upcomingMeetings, overdueItems] = await Promise.all([
    getUnreadNotificationCount(),
    getUnreadWorkflowNotificationCount(),
    getPendingTasksCount(),
    getUpcomingMeetingsCount(),
    getOverdueItemsCount(),
  ]);
  const totalNotifs = notifCount + wfNotifCount;
  let currentPath = "";
  try {
    const h = await headers();
    currentPath = h.get("x-invoke-path") || h.get("next-url") || "";
  } catch {
    // headers() throws if called during static generation or SSR without request context.
    // Safe fallback — SidebarNav and breadcrumbs work with empty path.
  }
  const breadcrumbs = getAdminBreadcrumbs(currentPath);

  const indicators = [
    { count: pendingTasks, label: "Pending Tasks", href: "/admin/workflow", color: "text-amber-600" },
    { count: upcomingMeetings, label: "Upcoming Meetings", href: "/admin/meetings", color: "text-blue-600" },
    { count: totalNotifs, label: "Notifications", href: "/admin/notifications", color: "text-red-600" },
    { count: overdueItems, label: "Overdue Items", href: "/admin/workflow", color: "text-rose-600" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F7F8FB] text-[#06111F]">
      <SidebarNav currentPath={currentPath} totalNotifs={totalNotifs} />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-0">
        <header className="sticky top-0 z-30 border-b border-[#06111F]/10 bg-white/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-2.5 lg:px-6">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="hidden lg:flex lg:items-center lg:gap-1.5 text-xs font-bold text-[#06111F]/50">
                {breadcrumbs.map((crumb, i) => (
                  <span key={crumb.href} className="flex items-center gap-1.5">
                    {i > 0 ? <svg className="h-3 w-3 text-[#06111F]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg> : null}
                    {i === breadcrumbs.length - 1 ? (
                      <span className="truncate text-[#06111F]">{crumb.label}</span>
                    ) : (
                      <Link href={crumb.href} className="truncate transition hover:text-[#0B7CFF]">{crumb.label}</Link>
                    )}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {indicators.map(ind => ind.count > 0 ? (
                <Link
                  key={ind.label}
                  href={ind.href}
                  className="hidden items-center gap-1.5 rounded-full border border-[#06111F]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] transition hover:border-[#0B7CFF]/40 sm:flex"
                >
                  <span className={ind.color}>{ind.count}</span>
                  <span className="text-[#06111F]/40">{ind.label}</span>
                </Link>
              ) : null)}

              <div className="hidden sm:block">
                <CommandPalette />
              </div>

              <AdminBlurToggle />
              <form action={logoutAction}>
                <button className="rounded-full bg-[#06111F] px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white/60 transition hover:text-white">Logout</button>
              </form>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-6">
          <div className="mx-auto w-full max-w-[1440px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function SetupNotice() {
  return (
    <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-amber-950">
      <h2 className="text-2xl font-black uppercase tracking-[-0.04em]">Database tables required</h2>
      <p className="mt-3 leading-7">The management features are ready, but Supabase tables are not created yet. Confirm `DATABASE_URL` and `DIRECT_URL` in Vercel, then run `npm.cmd run db:push` to activate bookings, clients, accounting, contracts, and notifications.</p>
    </div>
  );
}

export function Card({ title, value, text, children }: { title: string; value: string; text?: string; children?: React.ReactNode }) {
  return <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#06111F]/40">{title}</p><div className="mt-4 flex items-baseline gap-2"><p className="blur-sensitive text-4xl font-black tracking-[-0.06em] text-[#0B7CFF]">{value}</p>{children}</div>{text ? <p className="blur-sensitive mt-2 text-sm leading-6 text-[#06111F]/55">{text}</p> : null}</div>;
}
