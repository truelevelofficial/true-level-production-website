import { AdminShell } from "@/components/admin-shell";
import { inputClass } from "@/components/form-fields";
import { getWorkflowNotifications } from "@/lib/admin-data";
import { markNotificationReadAction, markAllNotificationsReadAction, createNotificationAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";

const notificationIcons: Record<string, string> = {
  MEETING_REMINDER: "📅", TASK_ASSIGNED: "📋", TASK_OVERDUE: "⏰",
  QUOTATION_APPROVED: "✅", CONTRACT_SIGNED: "📝", INVOICE_DUE: "💰", PROJECT_DELAYED: "⚠️",
};

export default async function NotificationsPage() {
  await requireAdmin();
  const notifications = await getWorkflowNotifications();

  return (
    <AdminShell title="Notifications">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">{notifications.filter(n => !n.read).length} unread</p>
        <div className="flex gap-2">
          <form action={markAllNotificationsReadAction}>
            <button className="rounded-full bg-[#0B7CFF] px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#06111F]">Mark All Read</button>
          </form>
          <details className="group">
            <summary className="cursor-pointer rounded-full border border-[#06111F]/10 px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-[#0B7CFF] transition hover:border-[#0B7CFF]">+ New</summary>
            <form action={createNotificationAction} className="absolute right-0 top-full z-20 mt-2 w-80 rounded-2xl border border-[#06111F]/10 bg-white p-4 shadow-xl">
              <input className={inputClass} name="title" placeholder="Title" required />
              <select className={`${inputClass} mt-2`} name="type">
                <option value="TASK_ASSIGNED">Task Assigned</option>
                <option value="TASK_OVERDUE">Task Overdue</option>
                <option value="MEETING_REMINDER">Meeting Reminder</option>
                <option value="QUOTATION_APPROVED">Quotation Approved</option>
                <option value="CONTRACT_SIGNED">Contract Signed</option>
                <option value="INVOICE_DUE">Invoice Due</option>
                <option value="PROJECT_DELAYED">Project Delayed</option>
              </select>
              <textarea className={`${inputClass} mt-2`} name="message" placeholder="Message" rows={2} />
              <input className={inputClass} name="projectId" placeholder="Project ID (optional)" />
              <button className="mt-3 rounded-full bg-[#0B7CFF] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">Create</button>
            </form>
          </details>
        </div>
      </div>

      <div className="grid gap-2">
        {notifications.length > 0 ? notifications.map(n => (
          <div key={n.id} className={`rounded-[1.2rem] border p-4 shadow-sm transition ${n.read ? "border-[#06111F]/10 bg-white" : "border-[#0B7CFF]/20 bg-[#0B7CFF]/5"}`}>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-lg">{notificationIcons[n.type] || "🔔"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-black uppercase tracking-[-0.02em] ${n.read ? "text-[#06111F]" : "text-[#0B7CFF]"}`}>{n.title}</p>
                  {!n.read ? (
                    <form action={markNotificationReadAction}>
                      <input hidden name="id" value={n.id} />
                      <button className="rounded-full border border-[#06111F]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-[#06111F]/40 hover:text-[#0B7CFF]">Dismiss</button>
                    </form>
                  ) : null}
                </div>
                {n.message && <p className="mt-1 text-xs text-[#06111F]/55">{n.message}</p>}
                <div className="mt-1.5 flex flex-wrap gap-2 text-[10px] text-[#06111F]/40">
                  <span className="rounded-full bg-[#06111F]/5 px-2 py-0.5">{n.type.replace(/_/g, " ")}</span>
                  {n.project && <span className="rounded-full bg-[#0B7CFF]/10 px-2 py-0.5 text-[#0B7CFF]">{n.project.title}</span>}
                  {n.task && <span className="rounded-full bg-[#06D6A0]/10 px-2 py-0.5 text-[#06D6A0]">{n.task.title}</span>}
                  <span>{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            </div>
          </div>
        )) : <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-12 text-center shadow-sm"><p className="text-lg font-black uppercase tracking-[-0.02em] text-[#06111F]/30">No notifications</p><p className="mt-2 text-sm text-[#06111F]/40">Notifications will appear here when tasks are assigned, approvals are needed, or deadlines approach.</p></div>}
      </div>
    </AdminShell>
  );
}
