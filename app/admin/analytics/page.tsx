import { AdminShell, Card, SetupNotice } from "@/components/admin-shell";
import { inputClass } from "@/components/form-fields";
import { requireAdmin } from "@/lib/auth";
import { getExecutiveOverview, getClientAnalytics, getPipelineAnalytics, getMeetingsAnalytics, getStudioAnalytics, getAccountingAnalytics, getContractsAnalytics, getSmartInsights } from "@/lib/analytics";
import { hasDatabase } from "@/lib/admin-data";
import { expenseCategoryArabic, paymentMethodArabic, paymentStatusArabic } from "@/lib/constants";
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

function TabLink({ current, href, label }: { current: string; href: string; label: string }) {
  const active = current === href;
  return <a className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.12em] ${active ? "bg-[#0B7CFF] text-white" : "border border-[#06111F]/10 hover:border-[#0B7CFF] hover:text-[#0B7CFF]"}`} href={`/admin/analytics?tab=${href}`}>{label}</a>;
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ tab?: string; range?: string; from?: string; to?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const tab = params.tab || "executive";
  const overview = await getExecutiveOverview(params.range, params.from, params.to);
  const clientAnalytics = tab === "clients" ? await getClientAnalytics(params.range, params.from, params.to) : null;
  const pipeline = tab === "pipeline" ? await getPipelineAnalytics() : null;
  const meetings = tab === "meetings" ? await getMeetingsAnalytics(params.range, params.from, params.to) : null;
  const studioData = tab === "studio" ? await getStudioAnalytics(params.range, params.from, params.to) : null;
  const accountingData = tab === "accounting" ? await getAccountingAnalytics(params.range, params.from, params.to) : null;
  const contractsData = tab === "contracts" ? await getContractsAnalytics() : null;
  const insights = tab === "insights" ? await getSmartInsights() : null;

  return (
    <AdminShell title="Company Insights">
      {!hasDatabase() ? <SetupNotice /> : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map(([key, label]) => <TabLink current={tab} href={key} key={key} label={label} />)}
      </div>

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
        {tab !== "executive" && tab !== "pipeline" && tab !== "contracts" && tab !== "insights" ? <a className="rounded-full border border-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]" href={`/admin/analytics/export/${tab}?range=${params.range || ""}&from=${params.from || ""}&to=${params.to || ""}`} target="_blank">Export CSV</a> : null}
      </form>

      {tab === "executive" && overview ? <ExecutiveTab data={overview} /> : null}
      {tab === "clients" && clientAnalytics ? <ClientsTab data={clientAnalytics} /> : null}
      {tab === "pipeline" && pipeline ? <PipelineTab data={pipeline} /> : null}
      {tab === "meetings" && meetings ? <MeetingsTab data={meetings} /> : null}
      {tab === "studio" && studioData ? <StudioTab data={studioData} /> : null}
      {tab === "accounting" && accountingData ? <AccountingTab data={accountingData} /> : null}
      {tab === "contracts" && contractsData ? <ContractsTab data={contractsData} /> : null}
      {tab === "insights" && insights ? <InsightsTab data={insights} /> : null}
      {!overview && tab === "executive" ? <p className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 text-sm font-bold text-[#06111F]/55 shadow-sm">Unable to load analytics data.</p> : null}
    </AdminShell>
  );
}

function ExecutiveTab({ data }: { data: NonNullable<Awaited<ReturnType<typeof getExecutiveOverview>>> }) {
  return (<>
    <div className="mb-6 grid gap-4 md:grid-cols-4">
      <Card title="Total clients" value={String(data.totalClients)} />
      <Card title="New clients" value={String(data.newClients)} text="this period" />
      <Card title="Active leads" value={String(data.activeLeads)} />
      <Card title="Won clients" value={String(data.wonClients)} />
      <Card title="Lost clients" value={String(data.lostClients)} />
      <Card title="Signed contracts" value={String(data.signedContracts)} />
      <Card title="Active projects" value={String(data.activeProjects)} />
      <Card title="Completed projects" value={String(data.completedProjects)} />
      <Card title="Total meetings" value={String(data.meetings)} text={`${data.approvedMeetings} approved / ${data.completedMeetings} completed / ${data.cancelledMeetings} cancelled`} />
      <Card title="Studio bookings" value={String(data.studioBookings)} text={`${data.studioHours} hours booked`} />
      <Card title="Total revenue" value={`${data.revenue.toLocaleString()} EGP`} />
      <Card title="Total expenses" value={`${data.expenses.toLocaleString()} EGP`} />
      <Card title="Net profit" value={`${data.profit.toLocaleString()} EGP`} text={data.revenue > 0 ? `${Math.round((data.profit / data.revenue) * 100)}% margin` : ""} />
      <Card title="Pending payments" value={`${data.pendingPayments.toLocaleString()} EGP`} />
      <Card title="Overdue payments" value={`${data.overduePayments.toLocaleString()} EGP`} />
    </div>
    <Section title="Period Summary">
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Revenue" value={`${data.revenue.toLocaleString()} EGP`} />
        <Card title="Expenses" value={`${data.expenses.toLocaleString()} EGP`} />
        <Card title="Net profit" value={`${data.profit.toLocaleString()} EGP`} text={`${data.revenue > 0 ? Math.round((data.profit / data.revenue) * 100) : 0}% margin`} />
      </div>
    </Section>
  </>);
}

function ClientsTab({ data }: { data: NonNullable<Awaited<ReturnType<typeof getClientAnalytics>>> }) {
  return (<>
    <div className="mb-6 grid gap-4 md:grid-cols-4">
      <Card title="Total clients" value={String(data.totalClients)} />
      <Card title="Won" value={String(data.won)} />
      <Card title="Lost" value={String(data.lost)} />
      <Card title="Conversion rate" value={`${data.conversionRate}%`} />
      <Card title="Avg client value" value={`${Math.round(data.avgValue).toLocaleString()} EGP`} />
    </div>

    <Section title="New leads by month">
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {data.monthlyLeads.map((m) => <Card key={m.month} title={m.month} value={String(m.count)} />)}
      </div>
    </Section>

    <div className="mb-6 grid gap-6 lg:grid-cols-2">
      <Section title="Clients by type">{Object.entries(data.byType).map(([k, v]) => <Row key={k} label={k} value={String(v)} />)}</Section>
      <Section title="Clients by source">{Object.entries(data.bySource).map(([k, v]) => <Row key={k} label={k} value={String(v)} />)}</Section>
    </div>

    <div className="mb-6 grid gap-6 lg:grid-cols-2">
      <Section title="Pipeline distribution">{Object.entries(data.pipeline).map(([k, v]) => <Row key={k} label={k} value={String(v)} />)}</Section>
    </div>

    <Section title="Top 10 clients by revenue">
      <table className="w-full text-left text-sm"><thead><tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]"><th className="p-2">Client</th><th className="p-2">Revenue</th></tr></thead><tbody>
        {data.topRevenue.map((c) => <tr className="border-b border-[#06111F]/5 text-sm font-bold text-[#06111F]/65" key={c.name}><td className="p-2">{c.name}</td><td className="p-2">{c.revenue.toLocaleString()} EGP</td></tr>)}
      </tbody></table>
    </Section>

    <Section title="Top 10 clients by bookings">
      <table className="w-full text-left text-sm"><thead><tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]"><th className="p-2">Client</th><th className="p-2">Bookings</th></tr></thead><tbody>
        {data.topBookings.map((c) => <tr className="border-b border-[#06111F]/5 text-sm font-bold text-[#06111F]/65" key={c.name}><td className="p-2">{c.name}</td><td className="p-2">{c.count}</td></tr>)}
      </tbody></table>
    </Section>

    <Section title="Clients needing follow-up">
      {data.needsFollowUp.length === 0 ? <p className="text-sm font-bold text-[#06111F]/45">No clients need follow-up.</p> : data.needsFollowUp.map((c) => <Row key={c.id} label={c.name} value={`${c.email} / ${c.phone}${c.lastContact ? ` / Last contact: ${displayDate(c.lastContact)}` : " / Never contacted"}`} />)}
    </Section>
  </>);
}

function PipelineTab({ data }: { data: NonNullable<Awaited<ReturnType<typeof getPipelineAnalytics>>> }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (<>
    <div className="mb-6 grid gap-4 md:grid-cols-4">
      <Card title="Total leads" value={String(total)} />
      <Card title="Won revenue" value={`${data.find(d => d.stage === "Won")?.revenue.toLocaleString() || 0} EGP`} />
    </div>
    <Section title="Pipeline stages">
      <table className="w-full text-left text-sm"><thead><tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]"><th className="p-2">Stage</th><th className="p-2">Count</th><th className="p-2">% of total</th><th className="p-2">Revenue</th></tr></thead><tbody>
        {data.map((d) => <tr className="border-b border-[#06111F]/5 text-sm font-bold text-[#06111F]/65" key={d.stage}><td className="p-2">{d.stage}</td><td className="p-2">{d.count}</td><td className="p-2">{total > 0 ? Math.round((d.count / total) * 100) : 0}%</td><td className="p-2">{d.revenue > 0 ? `${d.revenue.toLocaleString()} EGP` : "-"}</td></tr>)}
      </tbody></table>
    </Section>
  </>);
}

function MeetingsTab({ data }: { data: NonNullable<Awaited<ReturnType<typeof getMeetingsAnalytics>>> }) {
  return (<>
    <div className="mb-6 grid gap-4 md:grid-cols-4">
      <Card title="Total meetings" value={String(data.total)} />
      <Card title="Google Meet" value={String(data.googleMeetings)} />
      <Card title="In-company" value={String(data.inCompany)} />
      <Card title="Approved" value={String(data.approved)} />
      <Card title="Completed" value={String(data.completed)} />
      <Card title="Cancelled" value={String(data.cancelled)} />
      <Card title="Approval rate" value={`${data.approvalRate}%`} />
      <Card title="No notes" value={String(data.noNotes)} />
    </div>

    <div className="mb-6 grid gap-6 lg:grid-cols-2">
      <Section title="Upcoming meetings">
        {data.upcoming.length === 0 ? <p className="text-sm font-bold text-[#06111F]/45">No upcoming meetings.</p> : data.upcoming.map((m) => <Row key={m.id} label={`${m.client.fullName}${m.meetingType ? ` / ${m.meetingType}` : ""}`} value={displayDate(m.startTime)} />)}
      </Section>
      <Section title="Cancelled meetings">
        {data.noShow.length === 0 ? <p className="text-sm font-bold text-[#06111F]/45">No cancelled meetings in this period.</p> : data.noShow.map((m) => <Row key={m.id} label={m.client.fullName} value={displayDate(m.startTime)} />)}
      </Section>
    </div>
  </>);
}

function StudioTab({ data }: { data: NonNullable<Awaited<ReturnType<typeof getStudioAnalytics>>> }) {
  const best = data.bestSetup[0];
  return (<>
    <div className="mb-6 grid gap-4 md:grid-cols-4">
      <Card title="Total bookings" value={String(data.total)} />
      <Card title="Approved" value={String(data.approved)} />
      <Card title="Completed" value={String(data.completed)} />
      <Card title="Cancelled" value={String(data.cancelled)} />
      <Card title="Total hours" value={String(data.totalHours)} />
      <Card title="Revenue" value={`${data.revenue.toLocaleString()} EGP`} />
      <Card title="Avg booking value" value={`${data.avgValue.toLocaleString()} EGP`} />
      <Card title="Avg duration" value={`${data.avgDuration}h`} />
      {best ? <Card title="Most booked" value={best[0]} text={`${best[1]} bookings`} /> : null}
    </div>

    <div className="mb-6 grid gap-6 lg:grid-cols-2">
      <Section title="Bookings by setup">{Object.entries(data.setupCount).map(([k, v]) => <Row key={k} label={k} value={String(v)} />)}</Section>
      <Section title="Revenue by setup">{Object.entries(data.setupRevenue).map(([k, v]) => <Row key={k} label={k} value={`${Math.round(v).toLocaleString()} EGP`} />)}</Section>
    </div>

    <Section title="Top studio clients">
      {data.topClients.length === 0 ? <p className="text-sm font-bold text-[#06111F]/45">No studio data.</p> : <table className="w-full text-left text-sm"><thead><tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]"><th className="p-2">Client</th><th className="p-2">Bookings</th><th className="p-2">Revenue</th></tr></thead><tbody>
        {data.topClients.map((c: Record<string, unknown>) => <tr className="border-b border-[#06111F]/5 text-sm font-bold text-[#06111F]/65" key={String(c.name)}><td className="p-2">{String(c.name)}</td><td className="p-2">{String(c.bookings)}</td><td className="p-2">{Number(c.revenue).toLocaleString()} EGP</td></tr>)}
      </tbody></table>}
    </Section>
  </>);
}

function AccountingTab({ data }: { data: NonNullable<Awaited<ReturnType<typeof getAccountingAnalytics>>> }) {
  return (<div dir="rtl">
    <p className="mb-6 rounded-2xl bg-white p-4 text-sm font-bold leading-7 text-[#06111F]/55">هذه التحليلات مخصصة للمتابعة الداخلية فقط ولا تعتبر بديلا عن المحاسب القانوني أو الإقرارات الضريبية الرسمية.</p>
    <div className="mb-6 grid gap-4 md:grid-cols-4">
      <Card title="إجمالي الإيرادات" value={`${data.revenue.toLocaleString()} EGP`} />
      <Card title="إجمالي المصروفات" value={`${data.expenses.toLocaleString()} EGP`} />
      <Card title="صافي الربح" value={`${data.profit.toLocaleString()} EGP`} />
      <Card title="هامش الربح" value={`${data.margin}%`} />
    </div>

    <div className="mb-6 grid gap-6 lg:grid-cols-2">
      <Section title="المصروفات حسب التصنيف">
        {Object.entries(data.byCategory).map(([k, v]) => <Row key={k} label={expenseCategoryArabic[k] || k} value={`${Math.round(v).toLocaleString()} EGP`} />)}
      </Section>
      <Section title="الإيرادات حسب طريقة الدفع">
        {data.byMethod.map(([k, v]) => <Row key={k} label={paymentMethodArabic[k] || k} value={`${Math.round(v).toLocaleString()} EGP`} />)}
      </Section>
    </div>

    <Section title="الإيرادات حسب العميل">
      <table className="w-full text-left text-sm" dir="rtl"><thead><tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]"><th className="p-2">العميل</th><th className="p-2">الإيرادات</th></tr></thead><tbody>
        {data.byClient.map(([name, amount]) => <tr className="border-b border-[#06111F]/5 text-sm font-bold text-[#06111F]/65" key={name}><td className="p-2">{name}</td><td className="p-2">{amount.toLocaleString()} EGP</td></tr>)}
      </tbody></table>
    </Section>

    <Section title="المدفوعات المتبقية حسب العميل">
      {data.pending.length === 0 ? <p className="text-sm font-bold text-[#06111F]/45">لا توجد مدفوعات متبقية.</p> : data.pending.map((p) => <Row key={p.client} label={p.client} value={`${p.amount.toLocaleString()} EGP`} />)}
    </Section>

    <Section title="الشهري (آخر 12 شهر)">
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]"><th className="p-2">الشهر</th><th className="p-2">الإيرادات</th><th className="p-2">المصروفات</th><th className="p-2">صافي الربح</th></tr></thead><tbody>
        {data.monthlyData.map((m) => <tr className="border-b border-[#06111F]/5 text-sm font-bold text-[#06111F]/65" key={m.month}><td className="p-2">{m.month}</td><td className="p-2">{m.revenue.toLocaleString()} EGP</td><td className="p-2">{m.expenses.toLocaleString()} EGP</td><td className="p-2">{m.profit.toLocaleString()} EGP</td></tr>)}
      </tbody></table></div>
    </Section>
  </div>);
}

function ContractsTab({ data }: { data: NonNullable<Awaited<ReturnType<typeof getContractsAnalytics>>> }) {
  return (<div dir="rtl">
    <div className="mb-6 grid gap-4 md:grid-cols-4">
      <Card title="إجمالي العقود" value={String(data.total)} />
      <Card title="عقود مسودة" value={String(data.draft)} />
      <Card title="عقود مرسلة" value={String(data.sent)} />
      <Card title="عقود موقعة" value={String(data.signed)} />
      <Card title="عقود ملغية" value={String(data.cancelled)} />
      <Card title="قيمة العقود الموقعة" value={`${data.signedValue.toLocaleString()} EGP`} />
    </div>

    <div className="mb-6 grid gap-6 lg:grid-cols-2">
      <Section title="العقود حسب النوع">{Object.entries(data.byType).map(([k, v]) => <Row key={k} label={k} value={String(v)} />)}</Section>
      <Section title="العقود حسب العميل">
        {data.byClient.map(([name, val]) => <Row key={name} label={name} value={`${val.toLocaleString()} EGP`} />)}
      </Section>
    </div>

    <Section title="العقود التي تحتاج متابعة">
      {data.waiting.length === 0 ? <p className="text-sm font-bold text-[#06111F]/45">لا توجد عقود تحتاج متابعة.</p> : data.waiting.map((c) => <Row key={c.id} label={c.client?.fullName || "Unknown"} value={`${c.type} / ${displayDate(c.createdAt)}`} />)}
    </Section>
  </div>);
}

function InsightsTab({ data }: { data: string[] }) {
  return (
    <Section title="Smart Insights">
      {data.length === 0 ? <p className="text-sm font-bold text-[#06111F]/45">No insights available yet.</p> : data.map((insight, i) => (
        <div className="mb-3 rounded-2xl bg-[#F7F8FB] p-4 text-sm leading-7 text-[#06111F]/80" key={i} dangerouslySetInnerHTML={{ __html: insight }} />
      ))}
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mb-6 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm"><h2 className="mb-4 text-2xl font-black uppercase tracking-[-0.05em]">{title}</h2>{children}</section>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between border-b border-[#06111F]/5 py-2 text-sm font-bold"><span className="text-[#06111F]/65">{label}</span><span className="text-[#06111F]">{value}</span></div>;
}
