import { AdminShell } from "@/components/admin-shell";
import { inputClass } from "@/components/form-fields";
import {
  getTeamMembers, getWorkflowProjects, getWorkflowTasks,
  getWorkflowApprovals, getWorkflowDeliveries, getWorkflowOverview, hasDatabase,
} from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import {
  createTeamMemberAction, updateTeamMemberAction, toggleTeamMemberActiveAction,
  createWorkflowProjectAction, updateWorkflowProjectAction, updateWorkflowStageAction, archiveWorkflowProjectAction,
  createWorkflowTaskAction, updateWorkflowTaskAction, deleteWorkflowTaskAction,
  createApprovalAction, updateApprovalStatusAction,
  createDeliveryAction, updateDeliveryStatusAction,
} from "@/lib/actions";

const stages = [
  ["NEW_LEAD", "New Lead", "عميل جديد"],
  ["BRIEF_RECEIVED", "Brief Received", "تم استلام البريف"],
  ["PROPOSAL_SENT", "Proposal Sent", "تم إرسال العرض"],
  ["CONTRACT_PENDING", "Contract Pending", "في انتظار العقد"],
  ["DEPOSIT_PAID", "Deposit Paid", "تم دفع العربون"],
  ["PRE_PRODUCTION", "Pre-Production", "ما قبل الإنتاج"],
  ["SHOOTING", "Shooting", "التصوير"],
  ["EDITING", "Editing", "المونتاج"],
  ["CLIENT_REVIEW", "Client Review", "مراجعة العميل"],
  ["FINAL_DELIVERY", "Final Delivery", "التسليم النهائي"],
  ["COMPLETED", "Completed", "مكتمل"],
  ["ARCHIVED", "Archived", "مؤرشف"],
] as const;

const taskStatuses = [
  ["TODO", "To Do", "لم تبدأ"],
  ["IN_PROGRESS", "In Progress", "قيد التنفيذ"],
  ["WAITING_CLIENT", "Waiting Client", "في انتظار العميل"],
  ["WAITING_INTERNAL", "Waiting Internal", "في انتظار داخلي"],
  ["DONE", "Done", "تمت"],
  ["CANCELLED", "Cancelled", "ملغية"],
] as const;

const priorities = [
  ["LOW", "Low", "منخفضة"],
  ["NORMAL", "Normal", "عادية"],
  ["HIGH", "High", "عالية"],
  ["URGENT", "Urgent", "عاجلة"],
] as const;

const departments = [
  "Management", "Sales", "Creative", "Production", "Editing", "Design", "Accounting", "Client Service",
] as const;

const approvalStatuses = [
  ["NOT_SENT", "Not Sent"],
  ["SENT_TO_CLIENT", "Sent to Client"],
  ["WAITING_FEEDBACK", "Waiting Feedback"],
  ["REVISION_REQUESTED", "Revision Requested"],
  ["APPROVED", "Approved"],
  ["REJECTED", "Rejected"],
] as const;

const deliveryStatuses = [
  ["PREPARING", "Preparing"],
  ["UPLOADED", "Uploaded"],
  ["SENT", "Sent"],
  ["CLIENT_RECEIVED", "Client Received"],
  ["COMPLETED", "Completed"],
] as const;

const deliverableTypes = [
  "Reel", "YouTube Video", "Photos", "Design", "Contract", "Invoice", "Campaign Files", "Raw Files", "Other",
] as const;

const stageColors: Record<string, string> = {
  NEW_LEAD: "bg-blue-100 text-blue-800 border-blue-200",
  BRIEF_RECEIVED: "bg-indigo-100 text-indigo-800 border-indigo-200",
  PROPOSAL_SENT: "bg-purple-100 text-purple-800 border-purple-200",
  CONTRACT_PENDING: "bg-violet-100 text-violet-800 border-violet-200",
  DEPOSIT_PAID: "bg-amber-100 text-amber-800 border-amber-200",
  PRE_PRODUCTION: "bg-orange-100 text-orange-800 border-orange-200",
  SHOOTING: "bg-red-100 text-red-800 border-red-200",
  EDITING: "bg-pink-100 text-pink-800 border-pink-200",
  CLIENT_REVIEW: "bg-yellow-100 text-yellow-800 border-yellow-200",
  FINAL_DELIVERY: "bg-emerald-100 text-emerald-800 border-emerald-200",
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  ARCHIVED: "bg-gray-100 text-gray-600 border-gray-200",
};

const priorityColors: Record<string, string> = {
  LOW: "border-gray-200 text-gray-500",
  NORMAL: "border-[#0B7CFF]/20 text-[#0B7CFF]",
  HIGH: "border-amber-200 text-amber-700",
  URGENT: "border-red-200 text-red-700",
};

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 inline-flex rounded-full border border-[#0B7CFF]/20 bg-[#0B7CFF]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">
      {children}
    </div>
  );
}

export default async function WorkflowPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const tab = params.tab || "overview";

  const [overview, teamMembers, projects, tasksList, approvals, deliveries] = await Promise.all([
    getWorkflowOverview(),
    getTeamMembers(),
    getWorkflowProjects(),
    getWorkflowTasks(),
    getWorkflowApprovals(),
    getWorkflowDeliveries(),
  ]);

  const tabs = [
    ["overview", "Overview", "نظرة عامة"],
    ["pipeline", "Pipeline", "خط سير العمل"],
    ["tasks", "Tasks", "المهام"],
    ["team", "Team", "الفريق"],
    ["calendar", "Calendar", "جدول الإنتاج"],
    ["approvals", "Approvals", "الموافقات"],
    ["deliveries", "Deliveries", "التسليمات"],
  ] as const;

  function renderTabButton(tabId: string, enLabel: string) {
    const isActive = tab === tabId;
    return (
      <a
        href={`/admin/workflow?tab=${tabId}`}
        className={`rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.12em] transition-colors whitespace-nowrap ${
          isActive ? "bg-[#0B7CFF] text-white shadow-lg shadow-blue-500/25" : "border border-[#06111F]/10 text-[#06111F] hover:border-[#0B7CFF] hover:text-[#0B7CFF]"
        }`}
      >
        {enLabel}
      </a>
    );
  }

  function SectionHeader({ title, children }: { title: string; children?: React.ReactNode }) {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge>Work Flow</Badge>
          <h3 className="text-2xl font-black uppercase tracking-[-0.04em]">{title}</h3>
        </div>
        {children}
      </div>
    );
  }

  function Card({ title, value }: { title: string; value: number }) {
    return (
      <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
        <p className="text-3xl font-black">{value}</p>
        <p className="mt-1 text-sm text-[#06111F]/55">{title}</p>
      </div>
    );
  }

  return (
    <AdminShell title="Work Flow">
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map(([id, en]) => renderTabButton(id, en))}
      </div>

      {/* ─── OVERVIEW ─── */}
      {tab === "overview" && (
        <div>
          <SectionHeader title="نظرة عامة" />
          {overview ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card title="Active Projects" value={overview.activeProjects} />
              <Card title="Pending Tasks" value={overview.pendingTasks} />
              <Card title="Today Shoots" value={overview.todayShoots} />
              <Card title="Waiting Approval" value={overview.waitingApproval} />
              <Card title="In Editing" value={overview.inEditing} />
              <Card title="Ready for Delivery" value={overview.readyDelivery} />
              <Card title="Overdue Tasks" value={overview.overdueTasks} />
              <Card title="Completed This Month" value={overview.completedThisMonth} />
            </div>
          ) : (
            <p className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-8 text-center text-sm text-[#06111F]/40">No data yet. Start by adding projects and tasks.</p>
          )}
        </div>
      )}

      {/* ─── PIPELINE ─── */}
      {tab === "pipeline" && (
        <div>
          <SectionHeader title="خط سير العمل">
            <details className="group">
              <summary className="cursor-pointer rounded-full border border-[#06111F]/10 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#06111F] transition hover:border-[#0B7CFF] hover:text-[#0B7CFF]">+ Add Project</summary>
              <div className="mt-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
                <form action={createWorkflowProjectAction} className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Project Title *</label>
                    <input className={inputClass} name="title" required />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Client Name</label>
                    <input className={inputClass} name="clientName" />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Service Type</label>
                    <input className={inputClass} name="serviceType" placeholder="e.g. Video Production" />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Stage</label>
                    <select className={inputClass} name="stage">
                      {stages.map(([v, en]) => <option key={v} value={v}>{en}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Priority</label>
                    <select className={inputClass} name="priority">
                      {priorities.map(([v, en]) => <option key={v} value={v}>{en}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Owner</label>
                    <select className={inputClass} name="ownerId">
                      <option value="">Unassigned</option>
                      {teamMembers.filter(m => m.active).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Due Date</label>
                    <input className={inputClass} name="dueDate" type="date" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Notes</label>
                    <textarea className={inputClass} name="notes" rows={2} />
                  </div>
                  <div className="md:col-span-2">
                    <button className="rounded-full bg-[#0B7CFF] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-xl shadow-blue-500/20 transition hover:bg-[#06111F]">Save Project</button>
                  </div>
                </form>
              </div>
            </details>
          </SectionHeader>

          {projects.length === 0 ? (
            <p className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-8 text-center text-sm text-[#06111F]/40">No workflow projects yet. Create your first project above.</p>
          ) : (
            <div className="grid auto-cols-[280px] grid-flow-col gap-4 overflow-x-auto pb-4">
              {stages.filter(([v]) => v !== "ARCHIVED").map(([stageId, enLabel]) => {
                const stageProjects = projects.filter(p => p.stage === stageId);
                return (
                  <div key={stageId} className="min-w-[260px] rounded-[2rem] border border-[#06111F]/10 bg-white/60 p-4">
                    <div className={`mb-3 rounded-full px-3 py-1.5 text-center text-xs font-black uppercase tracking-[0.12em] ${stageColors[stageId] || "bg-gray-100 text-gray-600"}`}>
                      {enLabel} <span className="ml-1 opacity-50">{stageProjects.length}</span>
                    </div>
                    <div className="grid gap-3">
                      {stageProjects.map(p => (
                        <div key={p.id} className="rounded-[1.4rem] border border-[#06111F]/10 bg-white p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-black uppercase leading-tight tracking-[-0.02em]">{p.title}</p>
                            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] ${priorityColors[p.priority] || ""}`}>{p.priority}</span>
                          </div>
                          {p.clientName && <p className="mt-1 text-xs text-[#06111F]/50 blur-sensitive">{p.clientName}</p>}
                          {p.serviceType && <p className="mt-1 text-[11px] text-[#06111F]/40">{p.serviceType}</p>}
                          {p.owner && <p className="mt-1 text-[11px] text-[#06111F]/40">→ {p.owner.name}</p>}
                          {p.dueDate && <p className="mt-1 text-[11px] text-red-500/60">Due: {new Date(p.dueDate).toLocaleDateString()}</p>}
                          {p.tasks.length > 0 && <p className="mt-1 text-[11px] text-[#0B7CFF]/60">{p.tasks.filter(t => t.status === "DONE").length}/{p.tasks.length} tasks</p>}
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            <form action={updateWorkflowStageAction} className="flex-1">
                              <input hidden name="id" value={p.id} />
                              <select name="stage" onChange={e => e.target.form?.requestSubmit()} className="w-full rounded-xl border border-[#06111F]/10 bg-white px-2 py-1.5 text-[11px] font-bold outline-none">
                                {stages.map(([v, en]) => <option key={v} value={v} selected={v === p.stage}>{en}</option>)}
                              </select>
                            </form>
                            <form action={archiveWorkflowProjectAction}>
                              <input hidden name="id" value={p.id} />
                              <button className="rounded-xl border border-red-200 bg-red-50 px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-red-500 transition hover:bg-red-100">Archive</button>
                            </form>
                          </div>
                          <details className="group mt-2">
                            <summary className="cursor-pointer text-[10px] font-black uppercase tracking-[0.1em] text-[#06111F]/30 hover:text-[#0B7CFF]">Edit</summary>
                            <form action={updateWorkflowProjectAction} className="mt-2 grid gap-2">
                              <input hidden name="id" value={p.id} />
                              <input defaultValue={p.title} className={`${inputClass} px-2 py-1.5 text-xs`} name="title" />
                              <input defaultValue={p.clientName || ""} className={`${inputClass} px-2 py-1.5 text-xs`} name="clientName" placeholder="Client" />
                              <input defaultValue={p.notes || ""} className={`${inputClass} px-2 py-1.5 text-xs`} name="notes" placeholder="Notes" />
                              <button className="rounded-full bg-[#0B7CFF] px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#06111F]">Update</button>
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
        </div>
      )}

      {/* ─── TASKS ─── */}
      {tab === "tasks" && (
        <div>
          <SectionHeader title="المهام">
            <details className="group">
              <summary className="cursor-pointer rounded-full border border-[#06111F]/10 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#06111F] transition hover:border-[#0B7CFF] hover:text-[#0B7CFF]">+ Add Task</summary>
              <div className="mt-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
                <form action={createWorkflowTaskAction} className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Task Title *</label>
                    <input className={inputClass} name="title" required />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Description</label>
                    <textarea className={inputClass} name="description" rows={2} />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Project</label>
                    <select className={inputClass} name="projectId">
                      <option value="">None</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Assignee</label>
                    <select className={inputClass} name="assigneeId">
                      <option value="">Unassigned</option>
                      {teamMembers.filter(m => m.active).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Department</label>
                    <select className={inputClass} name="department">
                      <option value="">None</option>
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Priority</label>
                    <select className={inputClass} name="priority">
                      {priorities.map(([v, en]) => <option key={v} value={v}>{en}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Due Date</label>
                    <input className={inputClass} name="dueDate" type="date" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Notes</label>
                    <textarea className={inputClass} name="notes" rows={2} />
                  </div>
                  <div className="md:col-span-2">
                    <button className="rounded-full bg-[#0B7CFF] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-xl shadow-blue-500/20 transition hover:bg-[#06111F]">Save Task</button>
                  </div>
                </form>
              </div>
            </details>
          </SectionHeader>

          {tasksList.length === 0 ? (
            <p className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-8 text-center text-sm text-[#06111F]/40">No tasks yet.</p>
          ) : (
            <div className="grid gap-3">
              {tasksList.map(t => (
                <div key={t.id} className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black uppercase tracking-[-0.02em]">{t.title}</p>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] ${priorityColors[t.priority] || ""}`}>{t.priority}</span>
                        <span className="rounded-full border border-[#06111F]/10 bg-[#F7F8FB] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#06111F]/50">{t.status}</span>
                      </div>
                      {t.description && <p className="mt-1 text-xs text-[#06111F]/50">{t.description}</p>}
                      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-[#06111F]/40">
                        {t.project && <span>Project: {t.project.title}</span>}
                        {t.assignee && <span className="blur-sensitive">Assignee: {t.assignee.name}</span>}
                        {t.department && <span>Dept: {t.department}</span>}
                        {t.dueDate && <span className={new Date(t.dueDate) < new Date() && t.status !== "DONE" ? "text-red-500" : ""}>Due: {new Date(t.dueDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <form action={updateWorkflowTaskAction} className="flex gap-1.5">
                        <input hidden name="id" value={t.id} />
                        <select name="status" onChange={e => e.target.form?.requestSubmit()} className="rounded-xl border border-[#06111F]/10 bg-white px-2 py-1.5 text-[11px] font-bold outline-none">
                          {taskStatuses.map(([v, en]) => <option key={v} value={v} selected={v === t.status}>{en}</option>)}
                        </select>
                      </form>
                      <form action={deleteWorkflowTaskAction}>
                        <input hidden name="id" value={t.id} />
                        <button className="rounded-xl border border-red-200 bg-red-50 px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-red-500 transition hover:bg-red-100">Delete</button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TEAM ─── */}
      {tab === "team" && (
        <div>
          <SectionHeader title="الفريق">
            <details className="group">
              <summary className="cursor-pointer rounded-full border border-[#06111F]/10 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#06111F] transition hover:border-[#0B7CFF] hover:text-[#0B7CFF]">+ Add Member</summary>
              <div className="mt-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
                <form action={createTeamMemberAction} className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Name *</label>
                    <input className={inputClass} name="name" required />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Role</label>
                    <input className={inputClass} name="role" />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Department</label>
                    <select className={inputClass} name="department">
                      <option value="">None</option>
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Email</label>
                    <input className={`${inputClass} blur-sensitive`} name="email" type="email" />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Phone</label>
                    <input className={`${inputClass} blur-sensitive`} name="phone" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Notes</label>
                    <textarea className={inputClass} name="notes" rows={2} />
                  </div>
                  <div className="md:col-span-2">
                    <button className="rounded-full bg-[#0B7CFF] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-xl shadow-blue-500/20 transition hover:bg-[#06111F]">Save Member</button>
                  </div>
                </form>
              </div>
            </details>
          </SectionHeader>

          {teamMembers.length === 0 ? (
            <p className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-8 text-center text-sm text-[#06111F]/40">No team members yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map(m => (
                <div key={m.id} className={`rounded-[1.6rem] border p-5 shadow-sm ${m.active ? "border-[#06111F]/10 bg-white" : "border-red-200/30 bg-red-50/30"}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black uppercase tracking-[-0.02em]">{m.name}</p>
                        {!m.active && <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-500">Inactive</span>}
                      </div>
                      {m.role && <p className="mt-0.5 text-xs text-[#06111F]/50">{m.role}</p>}
                      {m.department && <p className="text-xs text-[#06111F]/40">{m.department}</p>}
                      {(m.email || m.phone) && (
                        <div className="mt-2 space-y-0.5 blur-sensitive">
                          {m.email && <p className="text-[11px] text-[#06111F]/40">{m.email}</p>}
                          {m.phone && <p className="text-[11px] text-[#06111F]/40">{m.phone}</p>}
                        </div>
                      )}
                    </div>
                    <form action={toggleTeamMemberActiveAction}>
                      <input hidden name="id" value={m.id} />
                      <button className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] transition ${m.active ? "border-red-200 text-red-500 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"}`}>
                        {m.active ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                  </div>
                  <details className="group mt-3">
                    <summary className="cursor-pointer text-[10px] font-black uppercase tracking-[0.1em] text-[#06111F]/30 hover:text-[#0B7CFF]">Edit</summary>
                    <form action={updateTeamMemberAction} className="mt-2 grid gap-2">
                      <input hidden name="id" value={m.id} />
                      <input defaultValue={m.name} className={`${inputClass} px-2 py-1.5 text-xs`} name="name" />
                      <input defaultValue={m.role || ""} className={`${inputClass} px-2 py-1.5 text-xs`} name="role" />
                      <button className="rounded-full bg-[#0B7CFF] px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#06111F]">Update</button>
                    </form>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── CALENDAR ─── */}
      {tab === "calendar" && (
        <div>
          <SectionHeader title="جدول الإنتاج" />
          {projects.length === 0 && tasksList.length === 0 ? (
            <p className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-8 text-center text-sm text-[#06111F]/40">No calendar items yet.</p>
          ) : (
            <div className="grid gap-4">
              {[...projects.filter(p => p.dueDate), ...tasksList.filter(t => t.dueDate)]
                .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
                .slice(0, 50)
                .map((item, i) => {
                  const isProject = "stage" in item;
                  const date = isProject ? (item as typeof projects[0]).dueDate : (item as typeof tasksList[0]).dueDate;
                  return (
                    <div key={`${isProject ? "p" : "t"}-${item.id}-${i}`} className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-[#0B7CFF]/20 bg-[#0B7CFF]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#0B7CFF]">
                          {isProject ? "Project" : "Task"}
                        </span>
                        <p className="text-sm font-black uppercase tracking-[-0.02em]">{isProject ? (item as typeof projects[0]).title : (item as typeof tasksList[0]).title}</p>
                        {date && <p className="text-xs text-[#06111F]/50">{new Date(date).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ─── APPROVALS ─── */}
      {tab === "approvals" && (
        <div>
          <SectionHeader title="الموافقات">
            <details className="group">
              <summary className="cursor-pointer rounded-full border border-[#06111F]/10 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#06111F] transition hover:border-[#0B7CFF] hover:text-[#0B7CFF]">+ Add Approval</summary>
              <div className="mt-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
                <form action={createApprovalAction} className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Title *</label>
                    <input className={inputClass} name="title" required />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Client Name</label>
                    <input className={`${inputClass} blur-sensitive`} name="clientName" />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Project</label>
                    <select className={inputClass} name="projectId">
                      <option value="">None</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Status</label>
                    <select className={inputClass} name="status">
                      {approvalStatuses.map(([v, en]) => <option key={v} value={v}>{en}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Due Date</label>
                    <input className={inputClass} name="dueDate" type="date" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Notes</label>
                    <textarea className={inputClass} name="notes" rows={2} />
                  </div>
                  <div className="md:col-span-2">
                    <button className="rounded-full bg-[#0B7CFF] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-xl shadow-blue-500/20 transition hover:bg-[#06111F]">Save Approval</button>
                  </div>
                </form>
              </div>
            </details>
          </SectionHeader>

          {approvals.length === 0 ? (
            <p className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-8 text-center text-sm text-[#06111F]/40">No approval items yet.</p>
          ) : (
            <div className="grid gap-3">
              {approvals.map(a => (
                <div key={a.id} className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black uppercase tracking-[-0.02em]">{a.title}</p>
                        <span className="rounded-full border border-[#06111F]/10 bg-[#F7F8FB] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#06111F]/50">{a.status}</span>
                      </div>
                      {a.clientName && <p className="mt-1 text-xs text-[#06111F]/50 blur-sensitive">{a.clientName}</p>}
                      {a.project && <p className="text-xs text-[#06111F]/40">Project: {a.project.title}</p>}
                      {a.dueDate && <p className="text-xs text-[#06111F]/40">Due: {new Date(a.dueDate).toLocaleDateString()}</p>}
                      {a.notes && <p className="mt-1 text-xs text-[#06111F]/40">{a.notes}</p>}
                    </div>
                    <form action={updateApprovalStatusAction} className="flex gap-1.5">
                      <input hidden name="id" value={a.id} />
                      <select name="status" onChange={e => e.target.form?.requestSubmit()} className="rounded-xl border border-[#06111F]/10 bg-white px-2 py-1.5 text-[11px] font-bold outline-none">
                        {approvalStatuses.map(([v, en]) => <option key={v} value={v} selected={v === a.status}>{en}</option>)}
                      </select>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── DELIVERIES ─── */}
      {tab === "deliveries" && (
        <div>
          <SectionHeader title="التسليمات">
            <details className="group">
              <summary className="cursor-pointer rounded-full border border-[#06111F]/10 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#06111F] transition hover:border-[#0B7CFF] hover:text-[#0B7CFF]">+ Add Delivery</summary>
              <div className="mt-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
                <form action={createDeliveryAction} className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Title *</label>
                    <input className={inputClass} name="title" required />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Project</label>
                    <select className={inputClass} name="projectId">
                      <option value="">None</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Deliverable Type</label>
                    <select className={inputClass} name="deliverableType">
                      <option value="">Other</option>
                      {deliverableTypes.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Status</label>
                    <select className={inputClass} name="status">
                      {deliveryStatuses.map(([v, en]) => <option key={v} value={v}>{en}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Delivery Link</label>
                    <input className={`${inputClass} blur-sensitive`} name="deliveryLink" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/50">Notes</label>
                    <textarea className={inputClass} name="notes" rows={2} />
                  </div>
                  <div className="md:col-span-2">
                    <button className="rounded-full bg-[#0B7CFF] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-xl shadow-blue-500/20 transition hover:bg-[#06111F]">Save Delivery</button>
                  </div>
                </form>
              </div>
            </details>
          </SectionHeader>

          {deliveries.length === 0 ? (
            <p className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-8 text-center text-sm text-[#06111F]/40">No deliveries yet.</p>
          ) : (
            <div className="grid gap-3">
              {deliveries.map(d => (
                <div key={d.id} className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black uppercase tracking-[-0.02em]">{d.title}</p>
                        {d.deliverableType && <span className="rounded-full border border-[#0B7CFF]/20 bg-[#0B7CFF]/10 px-2 py-0.5 text-[10px] font-bold text-[#0B7CFF]">{d.deliverableType}</span>}
                        <span className="rounded-full border border-[#06111F]/10 bg-[#F7F8FB] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#06111F]/50">{d.status}</span>
                      </div>
                      {d.project && <p className="mt-1 text-xs text-[#06111F]/50">Project: {d.project.title}</p>}
                      {d.deliveryLink && <p className="mt-0.5 text-xs text-[#0B7CFF] blur-sensitive">{d.deliveryLink}</p>}
                      {d.notes && <p className="mt-1 text-xs text-[#06111F]/40">{d.notes}</p>}
                    </div>
                    <form action={updateDeliveryStatusAction} className="flex gap-1.5">
                      <input hidden name="id" value={d.id} />
                      <select name="status" onChange={e => e.target.form?.requestSubmit()} className="rounded-xl border border-[#06111F]/10 bg-white px-2 py-1.5 text-[11px] font-bold outline-none">
                        {deliveryStatuses.map(([v, en]) => <option key={v} value={v} selected={v === d.status}>{en}</option>)}
                      </select>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
