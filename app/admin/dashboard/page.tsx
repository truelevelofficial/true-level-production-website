import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getAdminSummary, getMonthlyRevenue, getRevenueByService, getTopClients, getTodaysSchedule, getTeamWorkload, getWorkflowProjects, getRecentActivity, getUpcomingMeetings, getPendingQuotationsCount, hasDatabase } from "@/lib/admin-data";
import Link from "next/link";

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return <div className="h-2 w-full rounded-full bg-[#06111F]/5"><div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} /></div>;
}

function StatCard({ label, value, sub, financial }: { label: string; value: string; sub?: string; financial?: boolean }) {
  return (
    <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">{label}</p>
      <p className={`mt-2 text-3xl font-black tracking-[-0.05em] ${financial ? "blur-financial" : ""}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-[#06111F]/45">{sub}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  try {
    await requireAdmin();
    let summary: Awaited<ReturnType<typeof getAdminSummary>>;
    let monthlyRevenue: Awaited<ReturnType<typeof getMonthlyRevenue>>;
    let revenueByService: Awaited<ReturnType<typeof getRevenueByService>>;
    let topClients: Awaited<ReturnType<typeof getTopClients>>;
    let todaySchedule: Awaited<ReturnType<typeof getTodaysSchedule>>;
    let teamWorkload: Awaited<ReturnType<typeof getTeamWorkload>>;
    let projects: Awaited<ReturnType<typeof getWorkflowProjects>>;
    let recentActivity: Awaited<ReturnType<typeof getRecentActivity>>;
    let upcomingMeetings: Awaited<ReturnType<typeof getUpcomingMeetings>>;
    let pendingQuotations: Awaited<ReturnType<typeof getPendingQuotationsCount>>;
    [summary, monthlyRevenue, revenueByService, topClients, todaySchedule, teamWorkload, projects, recentActivity, upcomingMeetings, pendingQuotations] = await Promise.all([
      getAdminSummary(), getMonthlyRevenue(), getRevenueByService(), getTopClients(5), getTodaysSchedule(), getTeamWorkload(), getWorkflowProjects(), getRecentActivity(15), getUpcomingMeetings(8), getPendingQuotationsCount(),
    ]);
    const noData = !hasDatabase() || !summary;
    const maxMonthlyRev = monthlyRevenue.length > 0 ? Math.max(...monthlyRevenue.map(r => r.revenue)) : 0;
    const maxServiceRev = revenueByService.length > 0 ? Math.max(...revenueByService.map(([, v]) => v)) : 0;
    const services = ["#0B7CFF", "#06D6A0", "#FFD166", "#EF476F", "#118AB2", "#073B4C", "#F78C6B", "#7B2CBF"];
    const activeProjects = projects.filter(p => !p.archived);
    const activeStageProjects = activeProjects.filter(p => !["DELIVERED", "ARCHIVED"].includes(p.stage));
    const overheadPct = summary && summary.revenue > 0 ? Math.round((summary.expenses / summary.revenue) * 100) : 0;
    const teamUtilPct = teamWorkload.length > 0 ? Math.round(teamWorkload.filter(m => m.taskCount > 0).length / teamWorkload.length * 100) : 0;

    return (
      <AdminShell title="Dashboard">
        {noData ? <SetupNotice /> : null}

        {summary ? (
          <>
            <div className="mb-6 flex flex-wrap gap-2">
              <Link href="/admin/clients" className="rounded-full border border-[#0B7CFF]/20 bg-[#0B7CFF]/5 px-5 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-[#0B7CFF] transition hover:bg-[#0B7CFF]/10 hover:shadow-sm">+ New Client</Link>
              <Link href="/admin/meetings" className="rounded-full border border-[#0B7CFF]/20 bg-[#0B7CFF]/5 px-5 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-[#0B7CFF] transition hover:bg-[#0B7CFF]/10 hover:shadow-sm">+ New Meeting</Link>
              <Link href="/admin/quotations" className="rounded-full border border-[#0B7CFF]/20 bg-[#0B7CFF]/5 px-5 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-[#0B7CFF] transition hover:bg-[#0B7CFF]/10 hover:shadow-sm">+ New Quotation</Link>
              <Link href="/admin/workflow" className="rounded-full border border-[#0B7CFF]/20 bg-[#0B7CFF]/5 px-5 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-[#0B7CFF] transition hover:bg-[#0B7CFF]/10 hover:shadow-sm">+ New Project</Link>
              <Link href="/admin/workflow" className="rounded-full border border-[#0B7CFF]/20 bg-[#0B7CFF]/5 px-5 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-[#0B7CFF] transition hover:bg-[#0B7CFF]/10 hover:shadow-sm">+ New Task</Link>
            </div>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Revenue" value={`${summary.revenue.toLocaleString()} EGP`} sub={`This month: ${summary.monthRevenue.toLocaleString()} EGP`} financial />
              <StatCard label="Expenses" value={`${summary.expenses.toLocaleString()} EGP`} sub={`Overhead: ${overheadPct}% of revenue`} financial />
              <StatCard label="Net Profit" value={`${summary.profit.toLocaleString()} EGP`} sub={summary.profit >= 0 ? "Profitable" : "Operating at loss"} financial />
              <StatCard label="Pending Payments" value={`${summary.pendingPayments.toLocaleString()} EGP`} sub="Unpaid / partial" financial />
            </div>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Active Projects" value={String(activeStageProjects.length)} sub={`${activeProjects.length} total non-archived`} />
              <StatCard label="Active Clients" value={String(summary.clients)} sub={`${summary.pending} pending bookings`} />
              <StatCard label="Pending Quotations" value={String(pendingQuotations)} sub="Draft or sent" />
              <StatCard label="Team Utilization" value={`${teamUtilPct}%`} sub={`${teamWorkload.filter(m => m.taskCount > 0).length}/${teamWorkload.length} members active`} />
            </div>

            <div className="mb-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Monthly Revenue</p>
                <div className="blur-chart grid auto-rows-min gap-3" style={{ gridTemplateColumns: `repeat(${Math.max(monthlyRevenue.length, 1)}, 1fr)` }}>
                  {monthlyRevenue.length > 0 ? monthlyRevenue.map((m) => (
                    <div key={m.month} className="flex flex-col items-center gap-1.5">
                      <span className="text-[10px] font-bold text-[#06111F]/40">{m.month.slice(5)}</span>
                      <div className="flex h-28 w-full items-end justify-center">
                        <div className="w-full rounded-t-md bg-[#0B7CFF] transition-all" style={{ height: `${(m.revenue / maxMonthlyRev) * 100}%` }} />
                      </div>
                      <span className="text-[9px] font-bold text-[#06111F]/50">{(m.revenue / 1000).toFixed(1)}k</span>
                    </div>
                  )) : <p className="col-span-full py-8 text-center text-sm text-[#06111F]/30">No revenue data yet</p>}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Revenue by Service</p>
                <div className="blur-chart grid gap-3">
                  {revenueByService.length > 0 ? revenueByService.map(([name, amount], i) => (
                    <div key={name} className="grid grid-cols-[1fr_auto] items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: services[i % services.length] }} />
                          <span className="text-xs font-bold uppercase tracking-[-0.01em] text-[#06111F]/70">{name}</span>
                        </div>
                        <MiniBar value={amount} max={maxServiceRev} color="" />
                      </div>
                      <span className="text-xs font-black text-[#06111F]/50">{amount.toLocaleString()} EGP</span>
                    </div>
                  )) : <p className="py-8 text-center text-sm text-[#06111F]/30">No service data yet</p>}
                </div>
              </div>
            </div>

            <div className="mb-6 grid gap-6 lg:grid-cols-3">
              <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Top Clients</p>
                <div className="grid gap-3">
                  {topClients.length > 0 ? topClients.map((c, i) => (
                    <div key={c.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#06111F]/10 bg-[#F7F8FB] text-xs font-black text-[#06111F]/40">{i + 1}</span>
                        <div>
                          <p className="blur-sensitive text-sm font-black uppercase tracking-[-0.02em]">{c.name}</p>
                          {c.company && <p className="blur-sensitive text-[11px] text-[#06111F]/40">{c.company}</p>}
                        </div>
                      </div>
                      <span className="blur-financial text-xs font-black text-[#0B7CFF]">{c.total.toLocaleString()} EGP</span>
                    </div>
                  )) : <p className="py-6 text-center text-sm text-[#06111F]/30">No clients yet</p>}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Team Workload</p>
                <div className="grid gap-3">
                  {teamWorkload.length > 0 ? teamWorkload.map((m) => {
                    const capPct = Math.min(100, Math.round((m.taskCount / Math.max(...teamWorkload.map(t => t.taskCount), 1)) * 100));
                    const capColor = capPct > 75 ? "bg-red-500" : capPct > 40 ? "bg-amber-500" : "bg-emerald-500";
                    return (
                      <div key={m.id} className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-black uppercase tracking-[-0.02em]">{m.name}</p>
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${capPct > 75 ? "bg-red-100 text-red-700" : capPct > 40 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{capPct}%</span>
                          </div>
                          <p className="text-[11px] text-[#06111F]/40">{m.role || m.department || "Team Member"}</p>
                          <div className="mt-1 h-1.5 w-full rounded-full bg-[#06111F]/5">
                            <div className={`h-1.5 rounded-full ${capColor} transition-all`} style={{ width: `${capPct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  }) : <p className="py-6 text-center text-sm text-[#06111F]/30">No team workload data</p>}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Today&apos;s Schedule</p>
                <div className="grid gap-3">
                  {todaySchedule.length > 0 ? todaySchedule.map((b) => (
                    <div key={b.id} className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-2 w-2 shrink-0 rounded-full bg-[#0B7CFF]" />
                      <div className="flex-1">
                        <p className="blur-sensitive text-sm font-bold uppercase tracking-[-0.01em]">{b.client.fullName}</p>
                        <p className="text-[11px] text-[#06111F]/45">{new Date(b.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} &middot; {b.type.replace("_", " ")} {b.serviceType ? `- ${b.serviceType}` : ""}</p>
                      </div>
                    </div>
                  )) : <p className="py-6 text-center text-sm text-[#06111F]/30">Nothing scheduled today</p>}
                </div>
              </div>
            </div>

            <div className="mb-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Recent Activity</p>
                  <Link className="text-[11px] font-black uppercase tracking-[0.1em] text-[#0B7CFF] transition hover:text-[#06111F]" href="/admin/workflow">View All</Link>
                </div>
                <div className="grid gap-2.5 max-h-[320px] overflow-y-auto">
                  {recentActivity.length > 0 ? recentActivity.map((a) => (
                    <div key={`${a.type}-${a.id}-${a.timestamp.getTime()}`} className="flex items-start gap-3 border-b border-[#06111F]/5 pb-2.5 last:border-0">
                      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9px] font-black text-white ${
                        a.type === "project" ? "bg-[#0B7CFF]" : a.type === "booking" ? "bg-[#06D6A0]" : a.type === "quotation" ? "bg-[#FFD166]" : "bg-[#7B2CBF]"
                      }`}>
                        {a.type === "project" ? "P" : a.type === "booking" ? "B" : a.type === "quotation" ? "Q" : "C"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-bold uppercase tracking-[-0.01em]">{a.label || a.subtitle || a.action}</p>
                        <p className="text-[10px] text-[#06111F]/40">{a.action} &middot; {timeAgo(a.timestamp)}</p>
                      </div>
                    </div>
                  )) : <p className="py-6 text-center text-sm text-[#06111F]/30">No recent activity</p>}
                </div>
              </div>
              <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Upcoming Meetings</p>
                  <Link className="text-[11px] font-black uppercase tracking-[0.1em] text-[#0B7CFF] transition hover:text-[#06111F]" href="/admin/meetings">Manage</Link>
                </div>
                <div className="grid gap-3 max-h-[320px] overflow-y-auto">
                  {upcomingMeetings.length > 0 ? upcomingMeetings.map((b) => (
                    <div key={b.id} className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-2 w-2 shrink-0 rounded-full bg-[#0B7CFF]" />
                      <div className="flex-1">
                        <p className="blur-sensitive text-sm font-bold uppercase tracking-[-0.01em]">{b.client?.fullName || "Unknown"}</p>
                        <p className="text-[11px] text-[#06111F]/45">
                          {new Date(b.startTime).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} &middot; {new Date(b.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {b.meetingType ? ` &middot; ${b.meetingType}` : ""}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] ${b.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{b.status}</span>
                    </div>
                  )) : <p className="py-6 text-center text-sm text-[#06111F]/30">No upcoming meetings</p>}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.12em] text-[#06111F]/40">Dashboard data will appear once the database is configured</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link className="rounded-full bg-[#0B7CFF] px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-xl shadow-blue-500/20 transition hover:bg-[#06111F]" href="/admin/clients">Add Client</Link>
              <Link className="rounded-full border border-[#06111F]/10 px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#06111F] transition hover:border-[#0B7CFF] hover:text-[#0B7CFF]" href="/admin/workflow">Open Workflow</Link>
            </div>
          </div>
        )}
      </AdminShell>
    );
  } catch (error) {
    console.error("DASHBOARD CRASHED", error);
    return <div className="flex min-h-screen items-center justify-center bg-[#F7F8FB] p-6"><pre className="max-w-4xl overflow-auto whitespace-pre-wrap break-all rounded-2xl border border-red-300 bg-red-50 p-6 text-sm text-red-900">{String(error)}</pre></div>;
  }
}

function timeAgo(date: Date) {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}
