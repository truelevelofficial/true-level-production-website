import { AdminShell, Card, SetupNotice } from "@/components/admin-shell";
import { inputClass } from "@/components/form-fields";
import { requireAdmin } from "@/lib/auth";
import { getExecutiveOverview } from "@/lib/analytics";
import { hasDatabase } from "@/lib/admin-data";

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string; from?: string; to?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const overview = await getExecutiveOverview(params.range, params.from, params.to);

  return (
    <AdminShell title="Company Insights">
      {!hasDatabase() ? <SetupNotice /> : null}

      <form className="mb-6 flex flex-wrap gap-3 rounded-[2rem] border border-[#06111F]/10 bg-white p-4 shadow-sm">
        <select className={inputClass} defaultValue={params.range || ""} name="range">
          <option value="">All time</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
          <option value="lastMonth">Last month</option>
          <option value="year">This year</option>
          <option value="custom">Custom range</option>
        </select>
        <input className={inputClass} defaultValue={params.from || ""} name="from" placeholder="From" type="date" />
        <input className={inputClass} defaultValue={params.to || ""} name="to" placeholder="To" type="date" />
        <button className="rounded-full bg-[#06111F] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">Filter</button>
      </form>

      {overview ? (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card title="Total clients" value={String(overview.totalClients)} />
            <Card title="New clients" value={String(overview.newClients)} />
            <Card title="Active leads" value={String(overview.activeLeads)} />
            <Card title="Total revenue" value={`${overview.revenue.toLocaleString()} EGP`} />
            <Card title="Total expenses" value={`${overview.expenses.toLocaleString()} EGP`} />
            <Card title="Net profit" value={`${overview.profit.toLocaleString()} EGP`} text={overview.revenue > 0 ? `${Math.round((overview.profit / overview.revenue) * 100)}% margin` : ""} />
            <Card title="Pending payments" value={`${overview.pendingPayments.toLocaleString()} EGP`} />
            <Card title="Overdue payments" value={`${overview.overduePayments.toLocaleString()} EGP`} />
            <Card title="Won clients" value={String(overview.wonClients)} />
            <Card title="Lost clients" value={String(overview.lostClients)} />
            <Card title="Signed contracts" value={String(overview.signedContracts)} />
            <Card title="Active projects" value={String(overview.activeProjects)} />
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Card title="Total meetings" value={String(overview.meetings)} text={`${overview.approvedMeetings} approved / ${overview.completedMeetings} completed / ${overview.cancelledMeetings} cancelled`} />
            <Card title="Studio bookings" value={String(overview.studioBookings)} text={`${overview.studioHours} hours booked`} />
            <Card title="Completed projects" value={String(overview.completedProjects)} />
          </div>
        </>
      ) : (
        <p className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 text-sm font-bold text-[#06111F]/55 shadow-sm">Unable to load analytics data.</p>
      )}
    </AdminShell>
  );
}
