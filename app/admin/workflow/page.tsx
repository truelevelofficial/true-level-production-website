import { AdminShell } from "@/components/admin-shell";
import { inputClass } from "@/components/form-fields";
import { getTeamMembers, getWorkflowProjects, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { createWorkflowProjectAction, updateWorkflowProjectAction, updateWorkflowStageAction, archiveWorkflowProjectAction, createWorkflowTaskAction, createApprovalAction } from "@/lib/actions";
import { ProjectDrawer } from "@/components/project-drawer";
import Link from "next/link";

const kanbanStages = [
  ["NEW_LEAD", "New Lead", "bg-blue-100 text-blue-800"],
  ["DISCOVERY_CALL", "Discovery Call", "bg-sky-100 text-sky-800"],
  ["MEETING_SCHEDULED", "Meeting Scheduled", "bg-indigo-100 text-indigo-800"],
  ["QUOTATION_SENT", "Quotation Sent", "bg-purple-100 text-purple-800"],
  ["NEGOTIATION", "Negotiation", "bg-orange-100 text-orange-800"],
  ["APPROVED", "Approved", "bg-emerald-100 text-emerald-800"],
  ["PRE_PRODUCTION", "Pre Production", "bg-amber-100 text-amber-800"],
  ["PRODUCTION", "Production", "bg-red-100 text-red-800"],
  ["EDITING", "Editing", "bg-pink-100 text-pink-800"],
  ["REVIEW", "Review", "bg-yellow-100 text-yellow-800"],
  ["DELIVERED", "Delivered", "bg-green-100 text-green-800"],
  ["ARCHIVED", "Archived", "bg-gray-100 text-gray-600"],
] as const;

const stageLabels: Record<string, string> = Object.fromEntries(kanbanStages.map(([v, en]) => [v, en]));

const priorityColors: Record<string, string> = {
  LOW: "border-gray-200 text-gray-500",
  NORMAL: "border-[#0B7CFF]/20 text-[#0B7CFF]",
  HIGH: "border-amber-200 text-amber-700",
  URGENT: "border-red-200 text-red-700",
};

export default async function WorkflowPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const [teamMembers, projects] = await Promise.all([getTeamMembers(), getWorkflowProjects()]);
  const selectedProject = projects.find(p => p.id === params.project) || null;

  return (
    <AdminShell title="Workflow">
      <ProjectDrawer project={selectedProject} />

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="#new-project" className="rounded-full border border-[#0B7CFF]/20 bg-[#0B7CFF]/5 px-5 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-[#0B7CFF] transition hover:bg-[#0B7CFF]/10 hover:shadow-sm">+ Create Project</Link>
        <Link href="/admin/workflow?task=1" className="rounded-full border border-[#0B7CFF]/20 bg-[#0B7CFF]/5 px-5 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-[#0B7CFF] transition hover:bg-[#0B7CFF]/10 hover:shadow-sm">+ Create Task</Link>
        <Link href="/admin/approvals" className="rounded-full border border-[#0B7CFF]/20 bg-[#0B7CFF]/5 px-5 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-[#0B7CFF] transition hover:bg-[#0B7CFF]/10 hover:shadow-sm">+ Create Approval</Link>
      </div>

      <div className="mb-6 rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
        <details className="group" id="new-project">
          <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.12em] text-[#0B7CFF] transition hover:text-[#06111F]">+ New Project</summary>
          <form action={createWorkflowProjectAction} className="mt-4 grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-[#06111F]/40">Project Title *</label>
              <input className={inputClass} name="title" required />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-[#06111F]/40">Client</label>
              <input className={inputClass} name="clientName" />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-[#06111F]/40">Service</label>
              <input className={inputClass} name="serviceType" />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-[#06111F]/40">Stage</label>
              <select className={inputClass} name="stage">
                {kanbanStages.filter(([v]) => v !== "ARCHIVED").map(([v, en]) => <option key={v} value={v}>{en}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-[#06111F]/40">Priority</label>
              <select className={inputClass} name="priority">
                <option value="NORMAL">Normal</option>
                <option value="LOW">Low</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-[#06111F]/40">Owner</label>
              <select className={inputClass} name="ownerId">
                <option value="">Unassigned</option>
                {teamMembers.filter(m => m.active).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-[#06111F]/40">Due Date</label>
              <input className={inputClass} name="dueDate" type="date" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-[0.1em] text-[#06111F]/40">Notes</label>
              <textarea className={inputClass} name="notes" rows={1} />
            </div>
            <div className="md:col-span-4">
              <button className="rounded-full bg-[#0B7CFF] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-xl shadow-blue-500/20 transition hover:bg-[#06111F]">Create Project</button>
            </div>
          </form>
        </details>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-12 text-center shadow-sm">
          <p className="text-lg font-black uppercase tracking-[-0.02em] text-[#06111F]/30">No projects yet</p>
          <p className="mt-2 text-sm text-[#06111F]/40">Create your first project to populate the Kanban board.</p>
        </div>
      ) : (
        <div className="grid auto-cols-[280px] grid-flow-col gap-4 overflow-x-auto pb-6" style={{ maxHeight: "calc(100vh - 260px)" }}>
          {kanbanStages.map(([stageId, stageLabel, stageColor]) => {
            const stageProjects = projects.filter(p => p.stage === stageId && !p.archived);
            return (
              <div key={stageId} className="flex min-w-[260px] flex-col rounded-[1.6rem] border border-[#06111F]/10 bg-white/60 p-4">
                <div className={`mb-3 rounded-full px-3 py-1.5 text-center text-xs font-black uppercase tracking-[0.1em] ${stageColor}`}>
                  {stageLabel} <span className="ml-1 opacity-50">{stageProjects.length}</span>
                </div>
                <div className="grid flex-1 auto-rows-max gap-3 overflow-y-auto">
                  {stageProjects.length === 0 ? (
                    <p className="py-6 text-center text-xs text-[#06111F]/20">No projects</p>
                  ) : stageProjects.map(p => (
                    <div key={p.id} className="group/card rounded-[1.2rem] border border-[#06111F]/10 bg-white p-4 shadow-sm transition hover:shadow-md">
                      <a href={`?project=${p.id}`} className="block cursor-pointer">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-black uppercase leading-tight tracking-[-0.02em]">{p.title}</p>
                          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] ${priorityColors[p.priority] || ""}`}>{p.priority}</span>
                        </div>
                        {p.clientName && <p className="blur-sensitive mt-1 text-xs text-[#06111F]/50">{p.clientName}</p>}
                        {p.serviceType && <p className="mt-0.5 text-[11px] text-[#06111F]/40">{p.serviceType}</p>}
                        {p.owner && <p className="mt-0.5 text-[11px] text-[#06111F]/40">→ {p.owner.name}</p>}
                        {p.dueDate && (
                          <p className={`mt-0.5 text-[11px] ${new Date(p.dueDate) < new Date() ? "text-red-500/70" : "text-[#06111F]/40"}`}>
                            Due: {new Date(p.dueDate).toLocaleDateString()}
                          </p>
                        )}
                        {p.tasks && p.tasks.length > 0 && (
                          <p className="mt-1 text-[10px] text-[#0B7CFF]/60">{p.tasks.filter(t => t.status === "DONE").length}/{p.tasks.length} tasks</p>
                        )}
                      </a>
                      <div className="mt-3 flex items-center gap-1.5">
                        <form action={updateWorkflowStageAction} className="flex-1">
                          <input hidden name="id" value={p.id} />
                          <select name="stage" onChange={e => e.target.form?.requestSubmit()} className="w-full cursor-pointer rounded-xl border border-[#06111F]/10 bg-[#F7F8FB] px-2 py-1.5 text-[10px] font-bold outline-none transition hover:border-[#0B7CFF]/40">
                            {kanbanStages.map(([v, en]) => <option key={v} value={v} selected={v === p.stage}>{en}</option>)}
                          </select>
                        </form>
                        {stageId !== "ARCHIVED" ? (
                          <form action={archiveWorkflowProjectAction}>
                            <input hidden name="id" value={p.id} />
                            <button className="rounded-xl border border-red-200 bg-red-50 px-2 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-red-400 transition hover:bg-red-100 hover:text-red-600" title="Archive">✕</button>
                          </form>
                        ) : null}
                      </div>
                      <details className="group mt-2">
                        <summary className="cursor-pointer text-[9px] font-black uppercase tracking-[0.1em] text-[#06111F]/25 hover:text-[#0B7CFF]">Edit</summary>
                        <form action={updateWorkflowProjectAction} className="mt-2 grid gap-2">
                          <input hidden name="id" value={p.id} />
                          <input defaultValue={p.title} className={`${inputClass} px-2 py-1 text-[11px]`} name="title" />
                          <input defaultValue={p.clientName || ""} className={`${inputClass} px-2 py-1 text-[11px]`} name="clientName" placeholder="Client" />
                          <input defaultValue={p.notes || ""} className={`${inputClass} px-2 py-1 text-[11px]`} name="notes" placeholder="Notes" />
                          <button className="rounded-full bg-[#0B7CFF] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-[#06111F]">Update</button>
                        </form>
                      </details>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
