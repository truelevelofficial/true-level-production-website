import { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { logoutAction } from "@/lib/actions";
import { getUnreadNotificationCount } from "@/lib/admin-data";

const links = [
  ["/admin/bookings", "Management"],
  ["/admin/analytics", "Analytics"],
  ["/admin/meetings", "Meetings"],
  ["/admin/studio", "Studio"],
  ["/admin/clients", "Clients"],
  ["/admin/accounting", "Accounting"],
  ["/admin/contracts", "Contracts"],
  ["/admin/settings", "Settings"],
] as const;

export async function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const notificationCount = await getUnreadNotificationCount();
  const h = await headers();
  const currentPath = h.get("x-invoke-path") || h.get("next-url") || "";
  return (
    <main className="min-h-screen bg-[#F7F8FB] px-6 py-8 text-[#06111F]">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-10 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7CFF]">True Level Operations</p>
                <Link className="mt-1 block text-4xl font-black uppercase tracking-[-0.05em] transition hover:text-[#0B7CFF]" href="/">{title} / الإدارة</Link>
              </div>
              {notificationCount > 0 ? <div className="rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">{notificationCount}</div> : null}
            </div>
            <nav className="flex flex-wrap items-center gap-2">
              {links.map(([href, label]) => {
                const isActive = currentPath === href || currentPath.startsWith(href);
                return <a className={`rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.12em] transition-colors ${isActive ? "bg-[#0B7CFF] text-white shadow-lg shadow-blue-500/25" : "border border-[#06111F]/10 text-[#06111F] hover:border-[#0B7CFF] hover:text-[#0B7CFF]"}`} href={href} key={href}>{label}</a>;
              })}
              <form action={logoutAction}><button className="ml-2 rounded-full bg-[#06111F] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white/60 transition hover:text-white">Logout</button></form>
            </nav>
          </div>
        </header>
        {children}
      </div>
    </main>
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
  return <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#06111F]/40">{title}</p><div className="mt-4 flex items-baseline gap-2"><p className="text-4xl font-black tracking-[-0.06em] text-[#0B7CFF]">{value}</p>{children}</div>{text ? <p className="mt-2 text-sm leading-6 text-[#06111F]/55">{text}</p> : null}</div>;
}
