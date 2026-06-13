import { AdminShell } from "@/components/admin-shell";
import { inputClass } from "@/components/form-fields";
import { getReports, getAdminSummary, getMonthlyRevenue, getRevenueByService, getTopClients, getTeamWorkload, getWorkflowProjects } from "@/lib/admin-data";
import { saveReportAction, deleteReportAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";

export default async function ReportingPage() {
  await requireAdmin();
  const [reports, summary, monthlyRevenue, revenueByService, topClients, teamWorkload, projects] = await Promise.all([
    getReports(), getAdminSummary(), getMonthlyRevenue(), getRevenueByService(), getTopClients(10), getTeamWorkload(), getWorkflowProjects(),
  ]);

  const maxMonthlyRev = monthlyRevenue.length > 0 ? Math.max(...monthlyRevenue.map(r => r.revenue)) : 0;
  const maxServiceRev = revenueByService.length > 0 ? Math.max(...revenueByService.map(([, v]) => v)) : 0;
  const services = ["#0B7CFF", "#06D6A0", "#FFD166", "#EF476F", "#118AB2", "#073B4C", "#F78C6B", "#7B2CBF"];
  const activeProjects = projects.filter(p => !p.archived);

  return (
    <AdminShell title="Reporting">
      {summary ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Revenue</p>
            <p className="blur-financial mt-2 text-3xl font-black tracking-[-0.05em]">{summary.revenue.toLocaleString()} EGP</p>
          </div>
          <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Expenses</p>
            <p className="blur-financial mt-2 text-3xl font-black tracking-[-0.05em]">{summary.expenses.toLocaleString()} EGP</p>
          </div>
          <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Profit</p>
            <p className="blur-financial mt-2 text-3xl font-black tracking-[-0.05em]">{summary.profit.toLocaleString()} EGP</p>
          </div>
          <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Clients</p>
            <p className="mt-2 text-3xl font-black tracking-[-0.05em]">{summary.clients}</p>
          </div>
          <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Active Projects</p>
            <p className="mt-2 text-3xl font-black tracking-[-0.05em]">{activeProjects.length}</p>
          </div>
        </div>
      ) : null}

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Monthly Revenue</p>
          <div className="blur-chart grid auto-rows-min gap-3" style={{ gridTemplateColumns: `repeat(${Math.max(monthlyRevenue.length, 1)}, 1fr)` }}>
            {monthlyRevenue.length > 0 ? monthlyRevenue.map(m => (
              <div key={m.month} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#06111F]/40">{m.month.slice(5)}</span>
                <div className="flex h-24 w-full items-end justify-center">
                  <div className="w-full rounded-t-md bg-[#0B7CFF] transition-all" style={{ height: `${(m.revenue / maxMonthlyRev) * 100}%` }} />
                </div>
                <span className="text-[9px] font-bold text-[#06111F]/50">{(m.revenue / 1000).toFixed(1)}k</span>
              </div>
            )) : <p className="col-span-full py-8 text-center text-sm text-[#06111F]/30">No data</p>}
          </div>
        </div>
        <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Revenue by Service</p>
          <div className="blur-chart grid gap-2">
            {revenueByService.length > 0 ? revenueByService.map(([name, amount], i) => (
              <div key={name} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: services[i % services.length] }} />
                <div className="flex-1 h-5 rounded-full bg-[#06111F]/5">
                  <div className="h-5 rounded-full" style={{ width: `${(amount / maxServiceRev) * 100}%`, backgroundColor: services[i % services.length] }} />
                </div>
                <span className="text-xs font-black text-[#06111F]/50">{amount.toLocaleString()} EGP</span>
              </div>
            )) : <p className="py-6 text-center text-sm text-[#06111F]/30">No data</p>}
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Top Clients by Revenue</p>
          <div className="grid gap-2">
            {topClients.length > 0 ? topClients.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between gap-3 border-b border-[#06111F]/5 pb-2 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#F7F8FB] text-xs font-black text-[#06111F]/40">{i + 1}</span>
                  <div>
                    <p className="blur-sensitive text-xs font-bold uppercase tracking-[-0.01em]">{c.name}</p>
                    {c.company && <p className="blur-sensitive text-[10px] text-[#06111F]/40">{c.company}</p>}
                  </div>
                </div>
                <span className="blur-financial text-xs font-black text-[#0B7CFF]">{c.total.toLocaleString()} EGP</span>
              </div>
            )) : <p className="py-6 text-center text-sm text-[#06111F]/30">No data</p>}
          </div>
        </div>
        <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Team Performance</p>
          <div className="grid gap-2">
            {teamWorkload.length > 0 ? teamWorkload.map(m => {
              const pct = Math.min(100, Math.round((m.taskCount / Math.max(...teamWorkload.map(t => t.taskCount), 1)) * 100));
              return (
                <div key={m.id} className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-[-0.01em]">{m.name}</p>
                      <span className="text-[10px] font-bold text-[#06111F]/40">{m.taskCount} tasks</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-[#06111F]/5">
                      <div className={`h-1.5 rounded-full ${pct > 75 ? "bg-red-500" : pct > 40 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            }) : <p className="py-6 text-center text-sm text-[#06111F]/30">No data</p>}
          </div>
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Saved Reports</p>
          <details className="group relative">
            <summary className="cursor-pointer rounded-full bg-[#0B7CFF] px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-[#06111F]">+ Save Current View</summary>
            <form action={saveReportAction} className="absolute right-0 top-full z-20 mt-2 w-72 rounded-2xl border border-[#06111F]/10 bg-white p-4 shadow-xl">
              <input className={inputClass} name="name" placeholder="Report name" required />
              <select className={`${inputClass} mt-2`} name="type">
                <option value="REVENUE">Revenue</option>
                <option value="CLIENTS">Clients</option>
                <option value="PROJECTS">Projects</option>
                <option value="TEAM">Team</option>
                <option value="STUDIO">Studio</option>
              </select>
              <button className="mt-3 rounded-full bg-[#0B7CFF] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">Save</button>
            </form>
          </details>
        </div>
        <div className="grid gap-2">
          {reports.length > 0 ? reports.map(r => (
            <div key={r.id} className="flex items-center justify-between rounded-xl border border-[#06111F]/10 bg-[#F7F8FB] p-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[-0.01em]">{r.name}</p>
                <p className="text-[10px] text-[#06111F]/40">{r.type} &middot; {new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
              <form action={deleteReportAction}>
                <input hidden name="id" value={r.id} />
                <button className="rounded-full border border-red-200 px-3 py-1 text-[9px] font-black text-red-400 hover:bg-red-50">Delete</button>
              </form>
            </div>
          )) : <p className="py-6 text-center text-sm text-[#06111F]/30">No saved reports yet</p>}
        </div>
      </div>
    </AdminShell>
  );
}
