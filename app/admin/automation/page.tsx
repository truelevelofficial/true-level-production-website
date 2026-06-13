import { AdminShell } from "@/components/admin-shell";
import { inputClass } from "@/components/form-fields";
import { getAutomationRules } from "@/lib/admin-data";
import { createAutomationRuleAction, toggleAutomationRuleAction, deleteAutomationRuleAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";

const triggerLabels: Record<string, string> = {
  QUOTATION_APPROVED: "Quotation Approved → Create Project",
  CONTRACT_SIGNED: "Contract Signed → Move Workflow Stage",
  PROJECT_DELIVERED: "Project Delivered → Generate Invoice",
  PAYMENT_COMPLETED: "Payment Completed → Mark Invoice Paid",
};

export default async function AutomationPage() {
  await requireAdmin();
  const rules = await getAutomationRules();

  return (
    <AdminShell title="Automation">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">{rules.filter(r => r.active).length} active rules</p>
        <details className="group relative">
          <summary className="cursor-pointer rounded-full bg-[#0B7CFF] px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#06111F]">+ New Rule</summary>
          <form action={createAutomationRuleAction} className="absolute right-0 top-full z-20 mt-2 w-80 rounded-2xl border border-[#06111F]/10 bg-white p-4 shadow-xl">
            <input className={inputClass} name="name" placeholder="Rule name" required />
            <select className={`${inputClass} mt-2`} name="trigger">
              <option value="QUOTATION_APPROVED">Quotation Approved</option>
              <option value="CONTRACT_SIGNED">Contract Signed</option>
              <option value="PROJECT_DELIVERED">Project Delivered</option>
              <option value="PAYMENT_COMPLETED">Payment Completed</option>
            </select>
            <textarea className={`${inputClass} mt-2`} name="action" placeholder='Action JSON: {"type":"create_project","stage":"PRE_PRODUCTION"}' rows={3} />
            <button className="mt-3 rounded-full bg-[#0B7CFF] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">Create Rule</button>
          </form>
        </details>
      </div>

      <div className="grid gap-3">
        {rules.length > 0 ? rules.map(r => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-[#06111F]/10 bg-white p-4 shadow-sm">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2">
                <p className="text-sm font-black uppercase tracking-[-0.02em]">{r.name}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] ${r.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{r.active ? "Active" : "Inactive"}</span>
              </div>
              <p className="mt-1 text-xs text-[#06111F]/50">{triggerLabels[r.trigger] || r.trigger}</p>
            </div>
            <div className="flex gap-2">
              <form action={toggleAutomationRuleAction}>
                <input hidden name="id" value={r.id} />
                <button className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] ${r.active ? "border border-amber-200 text-amber-600 hover:bg-amber-50" : "bg-emerald-500 text-white hover:bg-emerald-600"}`}>
                  {r.active ? "Disable" : "Enable"}
                </button>
              </form>
              <form action={deleteAutomationRuleAction}>
                <input hidden name="id" value={r.id} />
                <button className="rounded-full border border-red-200 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-red-400 hover:bg-red-50">Delete</button>
              </form>
            </div>
          </div>
        )) : <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-12 text-center shadow-sm"><p className="text-lg font-black uppercase tracking-[-0.02em] text-[#06111F]/30">No automation rules</p><p className="mt-2 text-sm text-[#06111F]/40">Automate your workflow: when a quotation is approved, create a project automatically.</p></div>}
      </div>
    </AdminShell>
  );
}
