import { AdminShell } from "@/components/admin-shell";
import { inputClass } from "@/components/form-fields";
import { getApprovalRequests } from "@/lib/admin-data";
import { createApprovalRequestAction, approveApprovalRequestAction, rejectApprovalRequestAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";

const typeColors: Record<string, string> = {
  QUOTATION: "bg-purple-100 text-purple-800",
  CONTRACT: "bg-blue-100 text-blue-800",
  BUDGET: "bg-amber-100 text-amber-800",
  CONTENT: "bg-pink-100 text-pink-800",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default async function ApprovalsPage() {
  await requireAdmin();
  const approvals = await getApprovalRequests();

  return (
    <AdminShell title="Approvals">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">{approvals.filter(a => a.status === "PENDING").length} pending</p>
        <details className="group relative">
          <summary className="cursor-pointer rounded-full bg-[#0B7CFF] px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#06111F]">+ New Request</summary>
          <form action={createApprovalRequestAction} className="absolute right-0 top-full z-20 mt-2 w-80 rounded-2xl border border-[#06111F]/10 bg-white p-4 shadow-xl">
            <input className={inputClass} name="title" placeholder="Title" required />
            <select className={`${inputClass} mt-2`} name="type">
              <option value="QUOTATION">Quotation</option>
              <option value="CONTRACT">Contract</option>
              <option value="BUDGET">Budget</option>
              <option value="CONTENT">Content</option>
            </select>
            <input className={`${inputClass} mt-2`} name="requestedBy" placeholder="Requested by" />
            <input className={`${inputClass} mt-2`} name="projectId" placeholder="Project ID (optional)" />
            <textarea className={`${inputClass} mt-2`} name="notes" placeholder="Notes" rows={2} />
            <button className="mt-3 rounded-full bg-[#0B7CFF] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">Submit</button>
          </form>
        </details>
      </div>

      <div className="grid gap-3">
        {approvals.length > 0 ? approvals.map(a => (
          <div key={a.id} className="rounded-[1.2rem] border border-[#06111F]/10 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black uppercase tracking-[-0.02em]">{a.title}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] ${typeColors[a.type] || "bg-gray-100 text-gray-600"}`}>{a.type}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] ${statusColors[a.status] || ""}`}>{a.status}</span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] text-[#06111F]/50">
                  {a.requestedBy && <span>Requested by: {a.requestedBy}</span>}
                  {a.approvedBy && <span>Approved by: {a.approvedBy}</span>}
                  {a.rejectedBy && <span>Rejected by: {a.rejectedBy}</span>}
                  {a.project && <span>Project: {a.project.title}</span>}
                  <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
                {a.notes && <p className="mt-2 text-xs text-[#06111F]/55 bg-[#F7F8FB] rounded-xl p-3">{a.notes}</p>}
              </div>
              {a.status === "PENDING" ? (
                <div className="flex gap-2">
                  <form action={approveApprovalRequestAction}>
                    <input hidden name="id" value={a.id} />
                    <button className="rounded-full bg-emerald-500 px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-emerald-600">Approve</button>
                  </form>
                  <form action={rejectApprovalRequestAction}>
                    <input hidden name="id" value={a.id} />
                    <button className="rounded-full bg-red-500 px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-red-600">Reject</button>
                  </form>
                </div>
              ) : a.approvedAt ? (
                <p className="text-xs text-emerald-600 font-bold">Approved {new Date(a.approvedAt).toLocaleDateString()}</p>
              ) : a.rejectedAt ? (
                <p className="text-xs text-red-600 font-bold">Rejected {new Date(a.rejectedAt).toLocaleDateString()}</p>
              ) : null}
            </div>
          </div>
        )) : <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-12 text-center shadow-sm"><p className="text-lg font-black uppercase tracking-[-0.02em] text-[#06111F]/30">No approval requests</p><p className="mt-2 text-sm text-[#06111F]/40">Create an approval request for quotations, contracts, budgets, or content.</p></div>}
      </div>
    </AdminShell>
  );
}
