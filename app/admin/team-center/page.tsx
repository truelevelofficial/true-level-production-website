import { AdminShell } from "@/components/admin-shell";
import { inputClass } from "@/components/form-fields";
import { getTeamCenter } from "@/lib/admin-data";
import { updateTeamMemberCapacityAction, toggleTeamMemberActiveAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";

export default async function TeamCenterPage() {
  await requireAdmin();
  const data = await getTeamCenter();
  const members = data?.members || [];
  const overloaded = data?.overloaded || [];
  const available = data?.available || [];

  return (
    <AdminShell title="Team Center">
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Total Members</p>
          <p className="mt-2 text-3xl font-black tracking-[-0.05em]">{data?.totalMembers || 0}</p>
        </div>
        <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Overloaded</p>
          <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-red-600">{overloaded.length}</p>
        </div>
        <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Available</p>
          <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-emerald-600">{available.length}</p>
        </div>
        <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Avg Performance</p>
          <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#0B7CFF]">{data?.avgPerformance ? Math.round(data.avgPerformance * 100) : 0}%</p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {data && Object.entries(data.deptStats || {}).length > 0 ? Object.entries(data.deptStats).map(([dept, stats]: [string, any]) => (
          <div key={dept} className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">{dept}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-bold">{stats.count} members</span>
              <span className="text-[#06111F]/50">|</span>
              <span className="text-[#06111F]/60">{stats.tasks} active tasks</span>
              <span className="text-[#06111F]/50">|</span>
              <span className={`font-black ${stats.score / stats.count > 0.7 ? "text-emerald-600" : stats.score / stats.count > 0.4 ? "text-amber-600" : "text-red-600"}`}>
                {Math.round((stats.score / stats.count) * 100)}% perf
              </span>
            </div>
          </div>
        )) : null}
      </div>

      <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Team Members</p>
          <details className="group">
            <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.12em] text-[#0B7CFF] transition hover:text-[#06111F]">+ Add Member</summary>
            <form action={updateTeamMemberCapacityAction as any} className="mt-3 grid gap-2">
              <input className={inputClass} name="name" placeholder="Name" required />
              <input className={inputClass} name="role" placeholder="Role" />
              <input className={inputClass} name="department" placeholder="Department" />
              <button className="rounded-full bg-[#0B7CFF] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">Save</button>
            </form>
          </details>
        </div>
        <div className="grid gap-3">
          {members.length > 0 ? members.map((m: any) => {
            const capPct = m.tasks.length > 0 ? Math.min(100, Math.round((m.tasks.length / Math.max((m.capacity ?? 100) / 20, 1)) * 100)) : 0;
            const capColor = capPct > 75 ? "bg-red-500" : capPct > 40 ? "bg-amber-500" : "bg-emerald-500";
            return (
              <div key={m.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-[#06111F]/10 bg-[#F7F8FB] p-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black uppercase tracking-[-0.02em]">{m.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${m.availability === "AVAILABLE" ? "bg-emerald-100 text-emerald-700" : m.availability === "BUSY" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>{m.availability || "N/A"}</span>
                  </div>
                  <p className="text-[11px] text-[#06111F]/40">{m.role || m.department || "Team Member"}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-[#06111F]/40">Tasks</p>
                    <p className="text-sm font-black">{m.tasks.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#06111F]/40">Capacity</p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-[#06111F]/10">
                        <div className={`h-2 rounded-full ${capColor} transition-all`} style={{ width: `${capPct}%` }} />
                      </div>
                      <span className="text-xs font-black">{capPct}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#06111F]/40">Perf</p>
                    <p className={`text-sm font-black ${(m.performanceScore ?? 0) > 0.7 ? "text-emerald-600" : (m.performanceScore ?? 0) > 0.4 ? "text-amber-600" : "text-gray-500"}`}>
                      {m.performanceScore ? `${Math.round(m.performanceScore * 100)}%` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#06111F]/40">Projects</p>
                    <p className="text-sm font-black">{m.projects?.length || 0}</p>
                  </div>
                  <form action={toggleTeamMemberActiveAction as any}>
                    <input hidden name="id" value={m.id} />
                    <button className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${m.active ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}>
                      {m.active ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                </div>
              </div>
            );
          }) : <p className="py-6 text-center text-sm text-[#06111F]/30">No team members yet. Create some in the Workflow page first.</p>}
        </div>
      </div>
    </AdminShell>
  );
}
