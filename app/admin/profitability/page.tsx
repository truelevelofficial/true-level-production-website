import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getProjectProfitability } from "@/lib/admin-data";
import Link from "next/link";

export default async function ProfitabilityPage() {
  await requireAdmin();
  const data = await getProjectProfitability();

  return (
    <AdminShell title="Project Profitability">
      {!data || data.projectCount === 0 ? (
        <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-12 text-center shadow-sm">
          <p className="text-lg font-black uppercase tracking-[-0.02em] text-[#06111F]/30">No project data yet</p>
          <p className="mt-2 text-sm text-[#06111F]/40">Create projects and link invoices to see profitability analytics.</p>
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AnalyticCard label="Total Revenue" value={`${data.totalRevenue.toLocaleString()} EGP`} sub={`Across ${data.projectCount} projects`} financial />
            <AnalyticCard label="Total Expenses" value={`${data.totalExpenses.toLocaleString()} EGP`} sub="All recorded expenses" financial />
            <AnalyticCard label="Net Profit" value={`${data.totalProfit.toLocaleString()} EGP`} sub={data.totalProfit >= 0 ? "Profitable" : "Operating at loss"} financial />
            <AnalyticCard label="Average Margin" value={`${data.avgMargin}%`} sub={data.avgMargin >= 20 ? "Healthy margin" : "Margins need attention"} />
          </div>

          <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white shadow-sm">
            <div className="border-b border-[#06111F]/10 px-6 py-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">Project Rankings</p>
            </div>
            <div className="divide-y divide-[#06111F]/5">
              {data.profitability.map((p, i) => (
                <div key={p.id} className="flex items-center gap-4 px-6 py-4 transition hover:bg-[#F7F8FB]/50">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7F8FB] text-xs font-black text-[#06111F]/40">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/workflow?project=${p.id}`} className="text-sm font-bold text-[#06111F] transition hover:text-[#0B7CFF]">{p.title}</Link>
                    <div className="mt-1 flex flex-wrap gap-3">
                      <span className="text-[11px] text-[#06111F]/45">{p.stage?.replace(/_/g, " ")}</span>
                      <span className="text-[11px] text-[#06111F]/45">{p.taskCount} tasks ({p.completedTasks} done)</span>
                      <span className="text-[11px] text-[#06111F]/45">{p.fileCount} files</span>
                    </div>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-black text-emerald-600">{p.estimatedProfit.toLocaleString()} EGP</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-[#06111F]/10">
                        <div className={`h-1.5 rounded-full ${p.margin >= 30 ? "bg-emerald-500" : p.margin >= 15 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${Math.min(p.margin, 100)}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-[#06111F]/50">{p.margin}% margin</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}

function AnalyticCard({ label, value, sub, financial }: { label: string; value: string; sub?: string; financial?: boolean }) {
  return (
    <div className="rounded-[1.6rem] border border-[#06111F]/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#06111F]/40">{label}</p>
      <p className={`mt-2 text-3xl font-black tracking-[-0.05em] ${financial ? "blur-financial" : ""}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-[#06111F]/45">{sub}</p>}
    </div>
  );
}
