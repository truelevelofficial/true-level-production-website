import { AdminShell, Card, SetupNotice } from "@/components/admin-shell";
import { inputClass } from "@/components/form-fields";
import { MonthFilter } from "@/components/month-filter";
import { requireAdmin } from "@/lib/auth";
import { getExecutiveOverview, getClientAnalytics, getPipelineAnalytics, getMeetingsAnalytics, getStudioAnalytics, getAccountingAnalytics, getContractsAnalytics, getSmartInsights, getAvailableMonths, monthLabel } from "@/lib/analytics";
import { hasDatabase } from "@/lib/admin-data";
import { expenseCategoryArabic, paymentMethodArabic } from "@/lib/constants";
import { displayDate } from "@/lib/dates";

const tabs = [
  ["executive", "Overview"],
  ["clients", "Clients"],
  ["pipeline", "Pipeline"],
  ["meetings", "Meetings"],
  ["studio", "Studio"],
  ["accounting", "Accounting"],
  ["contracts", "Contracts"],
  ["insights", "Insights"],
] as const;

function TabLink({ current, href, label, month }: { current: string; href: string; label: string; month?: string }) {
  const active = current === href;
  const params = new URLSearchParams();
  params.set("tab", href);
  if (month) params.set("month", month);
  return <a className={`rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.12em] transition-colors ${active ? "bg-[#0B7CFF] text-white shadow-lg shadow-blue-500/25" : "border border-[#06111F]/10 hover:border-[#0B7CFF] hover:text-[#0B7CFF]"}`} href={`/admin/analytics?${params.toString()}`}>{label}</a>;
}

function ChangeBadge({ change }: { change: { pct: number; dir: string } }) {
  if (change.dir === "same") return <span className="mr-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-black text-gray-500">same</span>;
  return <span className={`mr-2 rounded-full px-2 py-0.5 text-xs font-black ${change.dir === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{change.dir === "up" ? "▲" : "▼"} {change.pct}%</span>;
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return <div className="h-2 w-full rounded-full bg-[#06111F]/5"><div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} /></div>;
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ tab?: string; month?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const tab = params.tab || "executive";
  const month = params.month || undefined;
  const months = await getAvailableMonths();
  const overview = await getExecutiveOverview(month);
  const clientData = tab === "clients" ? await getClientAnalytics(month) : null;
  const pipeline = tab === "pipeline" ? await getPipelineAnalytics(month) : null;
  const meetings = tab === "meetings" ? await getMeetingsAnalytics(month) : null;
  const studioData = tab === "studio" ? await getStudioAnalytics(month) : null;
  const accountingData = tab === "accounting" ? await getAccountingAnalytics(month) : null;
  const contractsData = tab === "contracts" ? await getContractsAnalytics(month) : null;
  const insights = tab === "insights" ? await getSmartInsights(month) : null;
  const label = month ? monthLabel(month) : "All Time";

  return (
    <AdminShell title="Company Insights">
      {!hasDatabase() ? <SetupNotice /> : null}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map(([key, label]) => <TabLink current={tab} href={key} key={key} label={label} month={month} />)}
        </div>
        <MonthFilter months={months} current={month} baseUrl="/admin/analytics" />
      </div>

      <div className="mb-6 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-[-0.04em]">{label}</h2>
          {tab !== "executive" ? null : overview ? <div className="flex gap-4 text-sm font-bold text-[#06111F]/40">{label !== "All Time" ? <span>Comparing to previous month</span> : null}</div> : null}
        </div>
      </div>

      {tab === "executive" && overview ? <ExecutiveTab data={overview} label={label} /> : null}
      {tab === "clients" && clientData ? <ClientsTab data={clientData} label={label} /> : null}
      {tab === "pipeline" && pipeline ? <PipelineTab data={pipeline} label={label} /> : null}
      {tab === "meetings" && meetings ? <MeetingsTab data={meetings} label={label} /> : null}
      {tab === "studio" && studioData ? <StudioTab data={studioData} label={label} /> : null}
      {tab === "accounting" && accountingData ? <AccountingTab data={accountingData} label={label} /> : null}
      {tab === "contracts" && contractsData ? <ContractsTab data={contractsData} label={label} /> : null}
      {tab === "insights" && insights ? <InsightsTab data={insights} label={label} /> : null}
      {!overview && tab === "executive" ? <EmptyState message={`No analytics data for ${label}. Select a different month or add some data first.`} /> : null}
      {tab === "clients" && !clientData ? <EmptyState message={`No client data for ${label}.`} /> : null}
      {tab === "pipeline" && !pipeline ? <EmptyState message={`No pipeline data for ${label}.`} /> : null}
      {tab === "meetings" && !meetings ? <EmptyState message={`No meeting data for ${label}.`} /> : null}
      {tab === "studio" && !studioData ? <EmptyState message={`No studio data for ${label}.`} /> : null}
      {tab === "accounting" && !accountingData ? <EmptyState message={`No accounting data for ${label}.`} /> : null}
      {tab === "contracts" && !contractsData ? <EmptyState message={`No contract data for ${label}.`} /> : null}
      {tab === "insights" && (!insights || insights.length === 0) ? <EmptyState message={`No insights available for ${label}.`} /> : null}
    </AdminShell>
  );
}

function ExecutiveTab({ data, label }: { data: NonNullable<Awaited<ReturnType<typeof getExecutiveOverview>>>; label: string }) {
  const { current, change } = data;
  const maxRevenue = Math.max(current.revenue, current.expenses, 1);
  return (<>
    <Section title="Executive Overview">
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Revenue" value={`${current.revenue.toLocaleString()} EGP`}><ChangeBadge change={change.revenue} /></Card>
        <Card title="Expenses" value={`${current.expenses.toLocaleString()} EGP`}><ChangeBadge change={change.expenses} /></Card>
        <Card title="Net Profit" value={`${current.profit.toLocaleString()} EGP`}><ChangeBadge change={change.profit} /></Card>
        <Card title="Profit margin" value={current.revenue > 0 ? `${Math.round((current.profit / current.revenue) * 100)}%` : "0%"} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-[#F7F8FB] p-4"><p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]/40">Revenue vs Expenses</p><MiniBar value={current.revenue} max={maxRevenue} color="bg-[#0B7CFF]" /><div className="mt-2 flex justify-between text-xs font-bold text-[#06111F]/45"><span className="blur-sensitive">Revenue: {current.revenue.toLocaleString()} EGP</span><span className="blur-sensitive">Expenses: {current.expenses.toLocaleString()} EGP</span></div></div>
        <div className="rounded-2xl bg-[#F7F8FB] p-4"><p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]/40">Net Profit</p><MiniBar value={Math.max(0, current.profit)} max={maxRevenue} color={current.profit >= 0 ? "bg-green-500" : "bg-red-500"} /><div className="mt-2 flex justify-between text-xs font-bold text-[#06111F]/45"><span className="blur-sensitive">Profit: {current.profit.toLocaleString()} EGP</span><span className="blur-sensitive">Margin: {current.revenue > 0 ? `${Math.round((current.profit / current.revenue) * 100)}%` : "0%"}</span></div></div>
      </div>
    </Section>

    <Section title="Client Activity">
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="New clients" value={String(current.newClients)}><ChangeBadge change={change.newClients} /></Card>
        <Card title="Won" value={String(current.wonClients)} />
        <Card title="Lost" value={String(current.lostClients)} />
        <Card title="Meetings" value={String(current.meetings)}><ChangeBadge change={change.meetings} /></Card>
        <Card title="Completed" value={String(current.completedMeetings)} />
        <Card title="Cancelled" value={String(current.cancelledMeetings)} />
      </div>
    </Section>

    <Section title="Studio">
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Bookings" value={String(current.studioBookings)}><ChangeBadge change={change.studioBookings} /></Card>
        <Card title="Hours" value={String(current.studioHours)}><ChangeBadge change={change.studioHours} /></Card>
      </div>
    </Section>

    <Section title="Contracts & Projects">
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Signed contracts" value={String(current.signedContracts)}><ChangeBadge change={change.signedContracts} /></Card>
        <Card title="Active projects" value={String(current.activeProjects)} />
        <Card title="Completed projects" value={String(current.completedProjects)}><ChangeBadge change={change.completedProjects} /></Card>
      </div>
    </Section>

    {data.previous.revenue > 0 || data.previous.expenses > 0 || data.previous.meetings > 0 ? <Section title="Previous Month Comparison">
      <div className="grid gap-4 md:grid-cols-3">
        <ComparisonCard label="Revenue" current={`${current.revenue.toLocaleString()} EGP`} previous={`${data.previous.revenue.toLocaleString()} EGP`} change={change.revenue} />
        <ComparisonCard label="Expenses" current={`${current.expenses.toLocaleString()} EGP`} previous={`${data.previous.expenses.toLocaleString()} EGP`} change={change.expenses} />
        <ComparisonCard label="Net profit" current={`${current.profit.toLocaleString()} EGP`} previous={`${data.previous.profit.toLocaleString()} EGP`} change={change.profit} />
        <ComparisonCard label="New clients" current={String(current.newClients)} previous={String(data.previous.newClients)} change={change.newClients} />
        <ComparisonCard label="Meetings" current={String(current.meetings)} previous={String(data.previous.meetings)} change={change.meetings} />
        <ComparisonCard label="Studio bookings" current={String(current.studioBookings)} previous={String(data.previous.studioBookings)} change={change.studioBookings} />
        <ComparisonCard label="Studio hours" current={String(current.studioHours)} previous={String(data.previous.studioHours)} change={change.studioHours} />
        <ComparisonCard label="Signed contracts" current={String(current.signedContracts)} previous={String(data.previous.signedContracts)} change={change.signedContracts} />
        <ComparisonCard label="Completed projects" current={String(current.completedProjects)} previous={String(data.previous.completedProjects)} change={change.completedProjects} />
      </div>
    </Section> : null}
  </>);
}

function ComparisonCard({ label, current, previous, change }: { label: string; current: string; previous: string; change: { pct: number; dir: string } }) {
  return <div className="rounded-2xl border border-[#06111F]/10 bg-white p-4 shadow-sm">
    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#06111F]/40">{label}</p>
    <div className="mt-3 flex items-baseline justify-between">
      <p className="blur-sensitive text-2xl font-black tracking-[-0.04em] text-[#0B7CFF]">{current}</p>
      <ChangeBadge change={change} />
    </div>
    <p className="blur-sensitive mt-1 text-xs text-[#06111F]/45">Previous: {previous}</p>
  </div>;
}

function ClientsTab({ data, label }: { data: NonNullable<Awaited<ReturnType<typeof getClientAnalytics>>>; label: string }) {
  return (<>
    <Section title="Client Summary">
      <div className="grid gap-4 md:grid-cols-5">
        <Card title="Total clients" value={String(data.totalClients)} />
        <Card title="Won" value={String(data.won)} />
        <Card title="Lost" value={String(data.lost)} />
        <Card title="Conversion" value={`${data.conversionRate}%`} />
        <Card title="Avg value" value={`${Math.round(data.avgValue).toLocaleString()} EGP`} />
      </div>
    </Section>

    <div className="mb-6 grid gap-6 lg:grid-cols-2">
      <Section title="By type">{Object.entries(data.byType).map(([k, v]) => <Row key={k} label={k} value={String(v)} />)}</Section>
      <Section title="By source">{Object.entries(data.bySource).map(([k, v]) => <Row key={k} label={k} value={String(v)} />)}</Section>
    </div>

    <div className="mb-6 grid gap-6 lg:grid-cols-2">
      <Section title="Pipeline distribution">{Object.entries(data.pipeline).map(([k, v]) => <Row key={k} label={k} value={String(v)} />)}</Section>
    </div>

    {data.needsFollowUp.length > 0 ? <Section title="Clients needing follow-up">
      {data.needsFollowUp.map((c) => <Row key={c.id} label={c.name} value={`${c.email} / ${c.phone}${c.lastContact ? ` / Last contact: ${displayDate(c.lastContact)}` : " / Never contacted"}`} />)}
    </Section> : null}

    <Section title="Top 10 clients by revenue">
      <table className="w-full text-left text-sm"><thead><tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]"><th className="p-3">Client</th><th className="p-3">Revenue</th></tr></thead><tbody>
        {data.topRevenue.length === 0 ? <tr><td className="p-3 text-sm text-[#06111F]/45" colSpan={2}>No data</td></tr> : data.topRevenue.map((c) => <tr className="border-b border-[#06111F]/5 text-sm font-bold text-[#06111F]/65" key={c.name}><td className="blur-sensitive p-3">{c.name}</td><td className="blur-sensitive p-3">{c.revenue.toLocaleString()} EGP</td></tr>)}
      </tbody></table>
    </Section>
  </>);
}

function PipelineTab({ data, label }: { data: NonNullable<Awaited<ReturnType<typeof getPipelineAnalytics>>>; label: string }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (<>
    <Section title="Pipeline Overview">
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Total leads" value={String(total)} />
        <Card title="Won revenue" value={`${data.find(d => d.stage === "Won")?.revenue.toLocaleString() || 0} EGP`} />
      </div>
    </Section>
    <Section title="Pipeline stages">
      <table className="w-full text-left text-sm"><thead><tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]"><th className="p-3">Stage</th><th className="p-3">Count</th><th className="p-3">%</th><th className="p-3">Revenue</th></tr></thead><tbody>
        {data.map((d) => <tr className="border-b border-[#06111F]/5 text-sm font-bold text-[#06111F]/65" key={d.stage}><td className="p-3">{d.stage}</td><td className="p-3">{d.count}</td><td className="p-3">{total > 0 ? `${Math.round((d.count / total) * 100)}%` : "0%"}</td><td className="blur-sensitive p-3">{d.revenue > 0 ? `${d.revenue.toLocaleString()} EGP` : "-"}</td></tr>)}
      </tbody></table>
    </Section>
  </>);
}

function MeetingsTab({ data, label }: { data: NonNullable<Awaited<ReturnType<typeof getMeetingsAnalytics>>>; label: string }) {
  return (<>
    <Section title="Meetings Overview">
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Total" value={String(data.total)} />
        <Card title="Google Meet" value={String(data.googleMeetings)} />
        <Card title="In-company" value={String(data.inCompany)} />
        <Card title="Approved" value={String(data.approved)} />
        <Card title="Completed" value={String(data.completed)} />
        <Card title="Cancelled" value={String(data.cancelled)} />
        <Card title="Approval rate" value={`${data.approvalRate}%`} />
        <Card title="No notes" value={String(data.noNotes)} />
      </div>
    </Section>
    <div className="mb-6 grid gap-6 lg:grid-cols-2">
      <Section title="Upcoming">
        {data.upcoming.length === 0 ? <p className="text-sm font-bold text-[#06111F]/45">No upcoming meetings.</p> : data.upcoming.map((m) => <Row key={m.id} label={`${m.client.fullName}${m.meetingType ? ` / ${m.meetingType}` : ""}`} value={displayDate(m.startTime)} />)}
      </Section>
      <Section title="Cancelled">
        {data.noShow.length === 0 ? <p className="text-sm font-bold text-[#06111F]/45">No cancelled meetings.</p> : data.noShow.map((m) => <Row key={m.id} label={m.client.fullName} value={displayDate(m.startTime)} />)}
      </Section>
    </div>
  </>);
}

function StudioTab({ data, label }: { data: NonNullable<Awaited<ReturnType<typeof getStudioAnalytics>>>; label: string }) {
  const best = data.bestSetup[0];
  const maxSetupVal = Math.max(...Object.values(data.setupCount), 1);
  return (<>
    <Section title="Studio Overview">
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Total bookings" value={String(data.total)} />
        <Card title="Approved" value={String(data.approved)} />
        <Card title="Completed" value={String(data.completed)} />
        <Card title="Cancelled" value={String(data.cancelled)} />
        <Card title="Total hours" value={String(data.totalHours)} />
        <Card title="Revenue" value={`${data.revenue.toLocaleString()} EGP`} />
        <Card title="Avg value" value={`${data.avgValue.toLocaleString()} EGP`} />
        <Card title="Avg duration" value={`${data.avgDuration}h`} />
        {best ? <Card title="Most booked" value={best[0]} text={`${best[1]} bookings`} /> : null}
        {data.bestDay ? <Card title="Best day" value={data.bestDay} /> : null}
      </div>
    </Section>
    <div className="mb-6 grid gap-6 lg:grid-cols-2">
      <Section title="By setup">
        {Object.entries(data.setupCount).map(([k, v]) => <div key={k}><Row label={k} value={String(v)} /><MiniBar value={v} max={maxSetupVal} color="bg-[#0B7CFF]" /></div>)}
      </Section>
      <Section title="Revenue by setup">
        {Object.entries(data.setupRevenue).map(([k, v]) => <Row key={k} label={k} value={`${Math.round(v).toLocaleString()} EGP`} />)}
      </Section>
    </div>
  </>);
}

function AccountingTab({ data, label }: { data: NonNullable<Awaited<ReturnType<typeof getAccountingAnalytics>>>; label: string }) {
  const prevExists = data.prevRevenue > 0 || data.prevCost > 0;
  return (<div dir="rtl">
    <div className="mb-6 rounded-2xl bg-white p-5 text-base font-bold leading-8 text-[#06111F]/55">هذه التحليلات مخصصة للمتابعة الداخلية فقط ولا تعتبر بديلا عن المحاسب القانوني أو الإقرارات الضريبية الرسمية.</div>
    <Section title="ملخص الحسابات">
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="إيرادات الشهر" value={`${data.revenue.toLocaleString()} EGP`} />
        <Card title="مصروفات الشهر" value={`${data.expenses.toLocaleString()} EGP`} />
        <Card title="صافي ربح الشهر" value={`${data.profit.toLocaleString()} EGP`} />
        <Card title="هامش الربح" value={`${data.margin}%`} />
      </div>
    </Section>

    {prevExists ? <Section title="مقارنة بالشهر السابق">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#06111F]/10 bg-white p-5 shadow-sm">
          <p className="blur-sensitive mb-2 text-sm font-black uppercase tracking-[0.18em] text-[#06111F]/40">الإيرادات</p>
          <p className="blur-sensitive text-3xl font-black tracking-[-0.05em] text-[#0B7CFF]">{data.revenue.toLocaleString()} EGP</p>
          <p className="blur-sensitive mt-2 text-sm leading-6 text-[#06111F]/55">الشهر السابق: {data.prevRevenue.toLocaleString()} EGP{data.prevRevenue > 0 ? <span className={`mr-2 ${data.revenue > data.prevRevenue ? "text-green-600" : data.revenue < data.prevRevenue ? "text-red-600" : "text-gray-500"}`}>{data.revenue > data.prevRevenue ? "▲ أعلى" : data.revenue < data.prevRevenue ? "▼ أقل" : "● بدون تغيير"}</span> : null}</p>
        </div>
        <div className="rounded-2xl border border-[#06111F]/10 bg-white p-5 shadow-sm">
          <p className="blur-sensitive mb-2 text-sm font-black uppercase tracking-[0.18em] text-[#06111F]/40">المصروفات</p>
          <p className="blur-sensitive text-3xl font-black tracking-[-0.05em] text-[#0B7CFF]">{data.expenses.toLocaleString()} EGP</p>
          <p className="blur-sensitive mt-2 text-sm leading-6 text-[#06111F]/55">الشهر السابق: {data.prevCost.toLocaleString()} EGP{data.prevCost > 0 ? <span className={`mr-2 ${data.expenses > data.prevCost ? "text-red-600" : data.expenses < data.prevCost ? "text-green-600" : "text-gray-500"}`}>{data.expenses > data.prevCost ? "▲ أعلى" : data.expenses < data.prevCost ? "▼ أقل" : "● بدون تغيير"}</span> : null}</p>
        </div>
        <div className="rounded-2xl border border-[#06111F]/10 bg-white p-5 shadow-sm">
          <p className="blur-sensitive mb-2 text-sm font-black uppercase tracking-[0.18em] text-[#06111F]/40">صافي الربح</p>
          <p className="blur-sensitive text-3xl font-black tracking-[-0.05em] text-[#0B7CFF]">{data.profit.toLocaleString()} EGP</p>
          <p className="blur-sensitive mt-2 text-sm leading-6 text-[#06111F]/55">الشهر السابق: {data.prevProfit.toLocaleString()} EGP{data.prevProfit !== 0 ? <span className={`mr-2 ${data.profit > data.prevProfit ? "text-green-600" : data.profit < data.prevProfit ? "text-red-600" : "text-gray-500"}`}>{data.profit > data.prevProfit ? "▲ أعلى" : data.profit < data.prevProfit ? "▼ أقل" : "● بدون تغيير"}</span> : null}</p>
        </div>
      </div>
    </Section> : null}

    <div className="mb-6 grid gap-6 lg:grid-cols-2">
      <Section title="المصروفات حسب التصنيف">
        {Object.entries(data.byCategory).map(([k, v]) => <Row key={k} label={expenseCategoryArabic[k] || k} value={`${Math.round(v).toLocaleString()} EGP`} />)}
        {Object.keys(data.byCategory).length === 0 ? <p className="text-sm font-bold text-[#06111F]/45">لا توجد مصروفات</p> : null}
      </Section>
      <Section title="الإيرادات حسب طريقة الدفع">
        {data.byMethod.map(([k, v]) => <Row key={k} label={paymentMethodArabic[k] || k} value={`${Math.round(v).toLocaleString()} EGP`} />)}
        {data.byMethod.length === 0 ? <p className="text-sm font-bold text-[#06111F]/45">لا توجد إيرادات</p> : null}
      </Section>
    </div>

    <Section title="أفضل العملاء">
      <table className="w-full text-right text-sm"><thead><tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]"><th className="p-3">العميل</th><th className="p-3">الإيرادات</th></tr></thead><tbody>
        {data.byClient.length === 0 ? <tr><td className="p-3 text-sm text-[#06111F]/45" colSpan={2}>لا توجد بيانات</td></tr> : data.byClient.map(([name, amount]) => <tr className="border-b border-[#06111F]/5 text-sm font-bold text-[#06111F]/65" key={name}><td className="blur-sensitive p-3">{name}</td><td className="blur-sensitive p-3">{amount.toLocaleString()} EGP</td></tr>)}
      </tbody></table>
    </Section>

    <Section title="المدفوعات المتبقية">
      {data.pending.length === 0 ? <p className="text-sm font-bold text-[#06111F]/45">لا توجد مدفوعات متبقية.</p> : data.pending.map((p) => <Row key={p.client} label={p.client} value={`${p.amount.toLocaleString()} EGP`} />)}
    </Section>
  </div>);
}

function ContractsTab({ data, label }: { data: NonNullable<Awaited<ReturnType<typeof getContractsAnalytics>>>; label: string }) {
  return (<div dir="rtl">
    <Section title="ملخص العقود">
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="إجمالي العقود" value={String(data.total)} />
        <Card title="مسودة" value={String(data.draft)} />
        <Card title="مرسلة" value={String(data.sent)} />
        <Card title="موقعة" value={String(data.signed)} />
        <Card title="ملغية" value={String(data.cancelled)} />
        <Card title="قيمة الموقعة" value={`${data.signedValue.toLocaleString()} EGP`} />
      </div>
    </Section>
    <div className="mb-6 grid gap-6 lg:grid-cols-2">
      <Section title="حسب النوع">{Object.entries(data.byType).map(([k, v]) => <Row key={k} label={k} value={String(v)} />)}</Section>
      <Section title="حسب العميل">
        {data.byClient.map(([name, val]) => <Row key={name} label={name} value={`${val.toLocaleString()} EGP`} />)}
        {data.byClient.length === 0 ? <p className="text-sm font-bold text-[#06111F]/45">لا توجد بيانات</p> : null}
      </Section>
    </div>
    <Section title="العقود التي تحتاج متابعة">
      {data.waiting.length === 0 ? <p className="text-sm font-bold text-[#06111F]/45">لا توجد عقود تحتاج متابعة.</p> : data.waiting.map((c) => <Row key={c.id} label={c.client?.fullName || "Unknown"} value={`${c.type} / ${displayDate(c.createdAt)}`} />)}
    </Section>
  </div>);
}

function InsightsTab({ data, label }: { data: string[]; label: string }) {
  return (
    <Section title={`Insights for ${label}`}>
      {data.length === 0 ? <p className="text-sm font-bold text-[#06111F]/45">No insights available.</p> : <div className="grid gap-3">{
        data.map((insight, i) => {
          const isWarning = insight.startsWith("⚠️");
          const isPositive = insight.startsWith("🎉") || insight.startsWith("📊");
          return <div className={`rounded-2xl p-4 text-sm leading-7 ${isWarning ? "bg-amber-50 text-amber-900" : isPositive ? "bg-green-50 text-green-900" : "bg-[#F7F8FB] text-[#06111F]/80"}`} key={i} dangerouslySetInnerHTML={{ __html: insight }} />;
        })
      }</div>}
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mb-6 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm"><h2 className="mb-4 text-lg font-black uppercase tracking-[-0.04em]">{title}</h2>{children}</section>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between border-b border-[#06111F]/5 py-3 text-sm font-bold"><span className="text-[#06111F]/65">{label}</span><span className="blur-sensitive text-[#06111F]">{value}</span></div>;
}

function EmptyState({ message }: { message: string }) {
  return <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-10 text-center shadow-sm"><h2 className="text-xl font-black uppercase tracking-[-0.04em] text-[#06111F]/30">No Data</h2><p className="mt-2 text-sm text-[#06111F]/45">{message}</p></div>;
}
