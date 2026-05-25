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
  return <a className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.12em] ${active ? "bg-[#0B7CFF] text-white" : "border border-[#06111F]/10 hover:border-[#0B7CFF] hover:text-[#0B7CFF]"}`} href={`/admin/analytics?${params.toString()}`}>{label}</a>;
}

function ChangeBadge({ change }: { change: { pct: number; dir: string } }) {
  if (change.dir === "same") return <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-black text-gray-500">same</span>;
  return <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-black ${change.dir === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{change.dir === "up" ? "▲" : "▼"} {change.pct}%</span>;
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

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map(([key, label]) => <TabLink current={tab} href={key} key={key} label={label} month={month} />)}
        </div>
        <MonthFilter months={months} current={month} baseUrl="/admin/analytics" />
      </div>

      <p className="mb-4 text-sm font-bold text-[#06111F]/40">{label}</p>

      {tab === "executive" && overview ? <ExecutiveTab data={overview} label={label} /> : null}
      {tab === "clients" && clientData ? <ClientsTab data={clientData} label={label} /> : null}
      {tab === "pipeline" && pipeline ? <PipelineTab data={pipeline} label={label} /> : null}
      {tab === "meetings" && meetings ? <MeetingsTab data={meetings} label={label} /> : null}
      {tab === "studio" && studioData ? <StudioTab data={studioData} label={label} /> : null}
      {tab === "accounting" && accountingData ? <AccountingTab data={accountingData} label={label} /> : null}
      {tab === "contracts" && contractsData ? <ContractsTab data={contractsData} label={label} /> : null}
      {tab === "insights" && insights ? <InsightsTab data={insights} label={label} /> : null}
      {!overview && tab === "executive" ? <p className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 text-sm font-bold text-[#06111F]/55 shadow-sm">No data for {label}.</p> : null}
    </AdminShell>
  );
}

function ExecutiveTab({ data, label }: { data: NonNullable<Awaited<ReturnType<typeof getExecutiveOverview>>>; label: string }) {
  const { current, change } = data;
  return (<>
    <div className="mb-6 grid gap-4 md:grid-cols-4">
      <Card title="New clients" value={String(current.newClients)}><ChangeBadge change={change.newClients} /></Card>
      <Card title="Won clients" value={String(current.wonClients)} />
      <Card title="Lost clients" value={String(current.lostClients)} />
      <Card title="Meetings" value={String(current.meetings)}><ChangeBadge change={change.meetings} /></Card>
      <Card title="Completed meetings" value={String(current.completedMeetings)} />
      <Card title="Cancelled meetings" value={String(current.cancelledMeetings)} />
      <Card title="Studio bookings" value={String(current.studioBookings)}><ChangeBadge change={change.studioBookings} /></Card>
      <Card title="Studio hours" value={String(current.studioHours)}><ChangeBadge change={change.studioHours} /></Card>
      <Card title="Revenue" value={`${current.revenue.toLocaleString()} EGP`}><ChangeBadge change={change.revenue} /></Card>
      <Card title="Expenses" value={`${current.expenses.toLocaleString()} EGP`}><ChangeBadge change={change.expenses} /></Card>
      <Card title="Net profit" value={`${current.profit.toLocaleString()} EGP`}><ChangeBadge change={change.profit} /></Card>
      <Card title="Active projects" value={String(current.activeProjects)} />
      <Card title="Completed projects" value={String(current.completedProjects)}><ChangeBadge change={change.completedProjects} /></Card>
      <Card title="Signed contracts" value={String(current.signedContracts)}><ChangeBadge change={change.signedContracts} /></Card>
    </div>

    {data.previous.revenue > 0 || data.previous.expenses > 0 ? <Section title={`Comparison with previous month`}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Revenue" value={`${current.revenue.toLocaleString()} EGP`}><ChangeBadge change={change.revenue} /></Card>
        <Card title="Expenses" value={`${current.expenses.toLocaleString()} EGP`}><ChangeBadge change={change.expenses} /></Card>
        <Card title="Net profit" value={`${current.profit.toLocaleString()} EGP`}><ChangeBadge change={change.profit} /></Card>
        <Card title="New clients" value={String(current.newClients)}><ChangeBadge change={change.newClients} /></Card>
        <Card title="Meetings" value={String(current.meetings)}><ChangeBadge change={change.meetings} /></Card>
        <Card title="Studio bookings" value={String(current.studioBookings)}><ChangeBadge change={change.studioBookings} /></Card>
        <Card title="Studio hours" value={String(current.studioHours)}><ChangeBadge change={change.studioHours} /></Card>
        <Card title="Signed contracts" value={String(current.signedContracts)}><ChangeBadge change={change.signedContracts} /></Card>
        <Card title="Completed projects" value={String(current.completedProjects)}><ChangeBadge change={change.completedProjects} /></Card>
      </div>
    </Section> : null}
  </>);
}

function ClientsTab({ data, label }: { data: NonNullable<Awaited<ReturnType<typeof getClientAnalytics>>>; label: string }) {
  return (<>
    <div className="mb-6 grid gap-4 md:grid-cols-4">
      <Card title="Total clients" value={String(data.totalClients)} />
      <Card title="Won" value={String(data.won)} />
      <Card title="Lost" value={String(data.lost)} />
      <Card title="Conversion rate" value={`${data.conversionRate}%`} />
      <Card title="Avg client value" value={`${Math.round(data.avgValue).toLocaleString()} EGP`} />
    </div>

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

function PipelineTab({ data, label }: { data: NonNullable<Awaited<ReturnType<typeof getPipelineAnalytics>>>; label: string }) {
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

function MeetingsTab({ data, label }: { data: NonNullable<Awaited<ReturnType<typeof getMeetingsAnalytics>>>; label: string }) {
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
        {data.noShow.length === 0 ? <p className="text-sm font-bold text-[#06111F]/45">No cancelled meetings.</p> : data.noShow.map((m) => <Row key={m.id} label={m.client.fullName} value={displayDate(m.startTime)} />)}
      </Section>
    </div>
  </>);
}

function StudioTab({ data, label }: { data: NonNullable<Awaited<ReturnType<typeof getStudioAnalytics>>>; label: string }) {
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
      {data.bestDay ? <Card title="Best day" value={data.bestDay} /> : null}
    </div>
    <div className="mb-6 grid gap-6 lg:grid-cols-2">
      <Section title="Bookings by setup">{Object.entries(data.setupCount).map(([k, v]) => <Row key={k} label={k} value={String(v)} />)}</Section>
      <Section title="Revenue by setup">{Object.entries(data.setupRevenue).map(([k, v]) => <Row key={k} label={k} value={`${Math.round(v).toLocaleString()} EGP`} />)}</Section>
    </div>
  </>);
}

function AccountingTab({ data, label }: { data: NonNullable<Awaited<ReturnType<typeof getAccountingAnalytics>>>; label: string }) {
  const prevExists = data.prevRevenue > 0 || data.prevCost > 0;
  return (<div dir="rtl">
    <p className="mb-6 rounded-2xl bg-white p-4 text-sm font-bold leading-7 text-[#06111F]/55">هذه التحليلات مخصصة للمتابعة الداخلية فقط ولا تعتبر بديلا عن المحاسب القانوني أو الإقرارات الضريبية الرسمية.</p>
    <div className="mb-6 grid gap-4 md:grid-cols-4">
      <Card title="إيرادات الشهر" value={`${data.revenue.toLocaleString()} EGP`} />
      <Card title="مصروفات الشهر" value={`${data.expenses.toLocaleString()} EGP`} />
      <Card title="صافي ربح الشهر" value={`${data.profit.toLocaleString()} EGP`} />
      <Card title="هامش الربح" value={`${data.margin}%`} />
    </div>

    {prevExists ? <Section title="مقارنة بالشهر السابق">
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="الإيرادات" value={`${data.revenue.toLocaleString()} EGP`} text={data.prevRevenue > 0 ? `${data.revenue > data.prevRevenue ? "▲ أعلى" : data.revenue < data.prevRevenue ? "▼ أقل" : "● بدون تغيير"} من الشهر السابق (${data.prevRevenue.toLocaleString()} EGP)` : ""} />
        <Card title="المصروفات" value={`${data.expenses.toLocaleString()} EGP`} text={data.prevCost > 0 ? `${data.expenses > data.prevCost ? "▲ أعلى" : data.expenses < data.prevCost ? "▼ أقل" : "● بدون تغيير"} من الشهر السابق (${data.prevCost.toLocaleString()} EGP)` : ""} />
        <Card title="صافي الربح" value={`${data.profit.toLocaleString()} EGP`} text={data.prevProfit !== 0 ? `${data.profit > data.prevProfit ? "▲ أعلى" : data.profit < data.prevProfit ? "▼ أقل" : "● بدون تغيير"} من الشهر السابق (${data.prevProfit.toLocaleString()} EGP)` : ""} />
      </div>
    </Section> : null}

    <div className="mb-6 grid gap-6 lg:grid-cols-2">
      <Section title="المصروفات حسب التصنيف">
        {Object.entries(data.byCategory).map(([k, v]) => <Row key={k} label={expenseCategoryArabic[k] || k} value={`${Math.round(v).toLocaleString()} EGP`} />)}
      </Section>
      <Section title="الإيرادات حسب طريقة الدفع">
        {data.byMethod.map(([k, v]) => <Row key={k} label={paymentMethodArabic[k] || k} value={`${Math.round(v).toLocaleString()} EGP`} />)}
      </Section>
    </div>

    <Section title="الإيرادات حسب العميل">
      <table className="w-full text-right text-sm" dir="rtl"><thead><tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]"><th className="p-2">العميل</th><th className="p-2">الإيرادات</th></tr></thead><tbody>
        {data.byClient.map(([name, amount]) => <tr className="border-b border-[#06111F]/5 text-sm font-bold text-[#06111F]/65" key={name}><td className="p-2">{name}</td><td className="p-2">{amount.toLocaleString()} EGP</td></tr>)}
      </tbody></table>
    </Section>

    <Section title="المدفوعات المتبقية حسب العميل">
      {data.pending.length === 0 ? <p className="text-sm font-bold text-[#06111F]/45">لا توجد مدفوعات متبقية.</p> : data.pending.map((p) => <Row key={p.client} label={p.client} value={`${p.amount.toLocaleString()} EGP`} />)}
    </Section>
  </div>);
}

function ContractsTab({ data, label }: { data: NonNullable<Awaited<ReturnType<typeof getContractsAnalytics>>>; label: string }) {
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

function InsightsTab({ data, label }: { data: string[]; label: string }) {
  return (
    <Section title={`Insights for ${label}`}>
      {data.length === 0 ? <p className="text-sm font-bold text-[#06111F]/45">No insights for {label}.</p> : data.map((insight, i) => (
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
