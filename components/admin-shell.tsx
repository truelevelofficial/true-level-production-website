import { ReactNode } from "react";
import Link from "next/link";
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
  return (
    <main className="min-h-screen bg-[#F7F8FB] px-5 py-6 text-[#06111F]">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">True Level Operations</p>
              <Link className="mt-1 block text-3xl font-black uppercase tracking-[-0.05em] transition hover:text-[#0B7CFF]" href="/">{title}</Link>
            </div>
            {notificationCount > 0 ? <div className="rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">{notificationCount}</div> : null}
          </div>
          <nav className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.12em]">
            {links.map(([href, label]) => <a className="rounded-full border border-[#06111F]/10 px-4 py-2 hover:border-[#0B7CFF] hover:text-[#0B7CFF]" href={href} key={href}>{label}</a>)}
            <form action={logoutAction}><button className="rounded-full bg-[#06111F] px-4 py-2 text-white">Logout</button></form>
          </nav>
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

export function Card({ title, value, text }: { title: string; value: string; text?: string }) {
  return <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#06111F]/40">{title}</p><p className="mt-4 text-4xl font-black tracking-[-0.06em] text-[#0B7CFF]">{value}</p>{text ? <p className="mt-2 text-sm text-[#06111F]/55">{text}</p> : null}</div>;
}
