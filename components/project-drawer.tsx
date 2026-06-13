"use client";

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { WorkflowProject, TeamMember, WorkflowTask, WorkflowApproval, WorkflowDelivery } from "@prisma/client";

type ProjectFull = WorkflowProject & { owner: TeamMember | null; tasks: WorkflowTask[]; approvals: WorkflowApproval[]; deliveries: WorkflowDelivery[] };

const tabs = ["Overview", "Tasks", "Files", "Comments", "Timeline", "Financials", "Deliverables"] as const;
type Tab = (typeof tabs)[number];

const stageLabels: Record<string, string> = {
  NEW_LEAD: "New Lead", DISCOVERY_CALL: "Discovery Call", MEETING_SCHEDULED: "Meeting Scheduled",
  QUOTATION_SENT: "Quotation Sent", NEGOTIATION: "Negotiation", APPROVED: "Approved",
  PRE_PRODUCTION: "Pre Production", PRODUCTION: "Production", EDITING: "Editing",
  REVIEW: "Review", DELIVERED: "Delivered", ARCHIVED: "Archived",
};

export function ProjectDrawer({ project, onClose }: { project: ProjectFull | null; onClose?: () => void }) {
  const [tab, setTab] = useState<Tab>("Overview");
  const router = useRouter();
  const close = onClose || (() => router.push("/admin/workflow"));

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-[90] flex justify-end" onClick={close}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative z-10 flex w-full max-w-2xl flex-col bg-white shadow-2xl animate-slide-in-right"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#06111F]/10 px-6 py-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-black uppercase tracking-[-0.03em]">{project.title}</p>
            {project.clientName && <p className="blur-sensitive text-xs text-[#06111F]/50">{project.clientName}</p>}
          </div>
          <button onClick={close} className="ml-4 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#06111F]/10 text-[#06111F]/40 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500">✕</button>
        </div>

        <div className="flex gap-1 border-b border-[#06111F]/10 px-6 py-3 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] transition ${
                tab === t ? "bg-[#0B7CFF] text-white" : "text-[#06111F]/40 hover:text-[#0B7CFF]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "Overview" && <OverviewTab project={project} />}
          {tab === "Tasks" && <TasksTab project={project} />}
          {tab === "Files" && <FilesTab />}
          {tab === "Comments" && <CommentsTab />}
          {tab === "Timeline" && <TimelineTab project={project} />}
          {tab === "Financials" && <FinancialsTab project={project} />}
          {tab === "Deliverables" && <DeliverablesTab project={project} />}
        </div>
      </div>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in-right { animation: slideInRight 0.2s ease-out; }
      `}</style>
    </div>
  );
}

function OverviewTab({ project }: { project: ProjectFull }) {
  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#06111F]/40">Stage</p>
          <p className="mt-1 text-sm font-bold">{stageLabels[project.stage] || project.stage}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#06111F]/40">Priority</p>
          <p className="mt-1 text-sm font-bold">{project.priority}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#06111F]/40">Service Type</p>
          <p className="mt-1 text-sm font-bold">{project.serviceType || "—"}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#06111F]/40">Owner</p>
          <p className="mt-1 text-sm font-bold">{project.owner?.name || "Unassigned"}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#06111F]/40">Due Date</p>
          <p className="mt-1 text-sm font-bold">{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : "—"}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#06111F]/40">Created</p>
          <p className="mt-1 text-sm font-bold">{new Date(project.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      {project.notes ? (
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#06111F]/40">Notes</p>
          <p className="mt-1 text-sm leading-6 text-[#06111F]/70">{project.notes}</p>
        </div>
      ) : null}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[#06111F]/10 bg-[#F7F8FB] p-3 text-center">
          <p className="text-2xl font-black text-[#0B7CFF]">{project.tasks.length}</p>
          <p className="text-[10px] font-bold text-[#06111F]/40">Tasks</p>
        </div>
        <div className="rounded-xl border border-[#06111F]/10 bg-[#F7F8FB] p-3 text-center">
          <p className="text-2xl font-black text-[#06D6A0]">{project.deliveries.filter(d => d.status === "DELIVERED").length}/{project.deliveries.length}</p>
          <p className="text-[10px] font-bold text-[#06111F]/40">Deliveries</p>
        </div>
        <div className="rounded-xl border border-[#06111F]/10 bg-[#F7F8FB] p-3 text-center">
          <p className="text-2xl font-black text-[#FFD166]">{project.approvals.filter(a => a.status === "APPROVED").length}/{project.approvals.length}</p>
          <p className="text-[10px] font-bold text-[#06111F]/40">Approvals</p>
        </div>
      </div>
      {project.bookingId || project.quotationId || project.contractId || project.invoiceId ? (
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#06111F]/40">Linked Records</p>
          <div className="flex flex-wrap gap-2">
            {project.bookingId ? <LinkChip label="Booking" href={`/admin/bookings`} /> : null}
            {project.quotationId ? <LinkChip label="Quotation" href={`/admin/quotations`} /> : null}
            {project.contractId ? <LinkChip label="Contract" href={`/admin/contracts`} /> : null}
            {project.invoiceId ? <LinkChip label="Invoice" href={`/admin/accounting`} /> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LinkChip({ label, href }: { label: string; href: string }) {
  return (
    <a href={href} className="rounded-full border border-[#0B7CFF]/20 bg-[#0B7CFF]/5 px-3 py-1 text-[11px] font-bold text-[#0B7CFF] transition hover:bg-[#0B7CFF]/10">
      {label} →
    </a>
  );
}

function TasksTab({ project }: { project: ProjectFull }) {
  const tasks = project.tasks;
  const byStatus = { TODO: [] as WorkflowTask[], IN_PROGRESS: [] as WorkflowTask[], DONE: [] as WorkflowTask[], REVIEW: [] as WorkflowTask[], CANCELLED: [] as WorkflowTask[] };
  tasks.forEach(t => { const arr = byStatus[t.status as keyof typeof byStatus] || []; arr.push(t); });
  return (
    <div className="grid gap-4">
      {Object.entries(byStatus).filter(([, ts]) => ts.length > 0).map(([status, ts]) => (
        <div key={status}>
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#06111F]/40">{status.replace("_", " ")} ({ts.length})</p>
          <div className="grid gap-2">
            {ts.map(t => (
              <div key={t.id} className="rounded-xl border border-[#06111F]/10 bg-[#F7F8FB] p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-[-0.01em]">{t.title}</p>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-black uppercase ${t.priority === "URGENT" ? "border-red-200 text-red-600" : t.priority === "HIGH" ? "border-amber-200 text-amber-600" : "border-gray-200 text-gray-500"}`}>{t.priority}</span>
                </div>
                {t.description && <p className="mt-1 text-[11px] text-[#06111F]/50">{t.description}</p>}
                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-[#06111F]/40">
                  {t.assigneeId ? <span>Assignee: {t.assigneeId}</span> : null}
                  {t.dueDate ? <span>Due: {new Date(t.dueDate).toLocaleDateString()}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {tasks.length === 0 ? <p className="py-6 text-center text-sm text-[#06111F]/30">No tasks created yet</p> : null}
    </div>
  );
}

function FilesTab() {
  return <div className="flex items-center justify-center py-16 text-center"><p className="text-sm text-[#06111F]/30">File uploads coming soon</p></div>;
}

function CommentsTab() {
  return <div className="flex items-center justify-center py-16 text-center"><p className="text-sm text-[#06111F]/30">Comments coming soon</p></div>;
}

function TimelineTab({ project }: { project: ProjectFull }) {
  const events: { date: Date; label: string }[] = [
    { date: project.createdAt, label: "Project created" },
  ];
  if (project.updatedAt.getTime() !== project.createdAt.getTime()) {
    events.push({ date: project.updatedAt, label: `Stage: ${stageLabels[project.stage] || project.stage}` });
  }
  project.approvals.forEach(a => {
    if (a.sentDate) events.push({ date: a.sentDate, label: `Approval sent: ${a.title}` });
    if (a.dueDate) events.push({ date: a.dueDate, label: `Approval due: ${a.title}` });
  });
  project.deliveries.forEach(d => {
    if (d.deliveryDate) events.push({ date: d.deliveryDate, label: `Delivery: ${d.title}` });
  });
  events.sort((a, b) => b.date.getTime() - a.date.getTime());
  return (
    <div className="grid gap-4">
      {events.length > 0 ? events.map((e, i) => (
        <div key={i} className="flex items-start gap-3">
          <span className="mt-1 grid h-2 w-2 shrink-0 rounded-full bg-[#0B7CFF]" />
          <div>
            <p className="text-xs font-bold text-[#06111F]/70">{e.label}</p>
            <p className="text-[11px] text-[#06111F]/40">{e.date.toLocaleDateString()} {e.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </div>
      )) : <p className="py-6 text-center text-sm text-[#06111F]/30">No timeline events</p>}
    </div>
  );
}

function FinancialsTab({ project }: { project: ProjectFull }) {
  const values = [
    project.quotationId || null,
    project.contractId || null,
    project.invoiceId || null,
  ].filter(Boolean);
  return (
    <div className="grid gap-5">
      <div className="rounded-xl border border-[#06111F]/10 bg-[#F7F8FB] p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#06111F]/40">Financial Summary</p>
        <p className="mt-2 text-sm text-[#06111F]/60">Linked financial records will appear here once quotations, contracts, and invoices are linked to this project.</p>
      </div>
      {values.length > 0 ? (
        <div className="grid gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#06111F]/40">Linked Records</p>
          {project.quotationId ? <p className="text-xs font-bold text-[#0B7CFF]">Quotation: {project.quotationId}</p> : null}
          {project.contractId ? <p className="text-xs font-bold text-[#0B7CFF]">Contract: {project.contractId}</p> : null}
          {project.invoiceId ? <p className="text-xs font-bold text-[#0B7CFF]">Invoice: {project.invoiceId}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function DeliverablesTab({ project }: { project: ProjectFull }) {
  const deliveries = project.deliveries;
  return (
    <div className="grid gap-3">
      {deliveries.length > 0 ? deliveries.map(d => (
        <div key={d.id} className="rounded-xl border border-[#06111F]/10 bg-[#F7F8FB] p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-bold uppercase tracking-[-0.01em]">{d.title}</p>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] ${d.status === "DELIVERED" ? "bg-emerald-100 text-emerald-700" : d.status === "SENT" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{d.status}</span>
          </div>
          {d.deliverableType && <p className="mt-1 text-xs text-[#06111F]/50">{d.deliverableType}</p>}
          {d.deliveryLink && <a href={d.deliveryLink} target="_blank" className="mt-1 block text-xs font-bold text-[#0B7CFF]">View Delivery →</a>}
          {d.deliveryDate && <p className="mt-1 text-[11px] text-[#06111F]/40">Delivery: {new Date(d.deliveryDate).toLocaleDateString()}</p>}
          {d.notes && <p className="mt-1 text-[11px] text-[#06111F]/50">{d.notes}</p>}
        </div>
      )) : <p className="py-6 text-center text-sm text-[#06111F]/30">No deliverables yet</p>}
    </div>
  );
}
