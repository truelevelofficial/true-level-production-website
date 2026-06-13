import { AdminShell, Card, SetupNotice } from "@/components/admin-shell";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { Field, inputClass } from "@/components/form-fields";
import { createExpenseAction, createPaymentAction, deleteExpenseAction, deletePaymentAction, updateExpenseAction, updatePaymentAction } from "@/lib/actions";
import { expenseCategories, expenseCategoryArabic, invoicePaymentStatusArabic, invoiceStatusArabic, invoiceStatuses, invoicePaymentStatuses, paymentMethodArabic, paymentMethods, paymentStatusArabic, paymentStatuses } from "@/lib/constants";
import { getAccounting, getFinanceCenter, getInvoices, getClients, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { InvoiceActions } from "./invoices/invoice-actions";

function dateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function InvoiceSummary({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-[#06111F]/10 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#06111F]/40">{label}</p>
      <p className={`blur-sensitive mt-2 text-2xl font-black tracking-[-0.04em] ${color}`}>{value}</p>
    </div>
  );
}

export default async function AccountingPage({ searchParams }: { searchParams: Promise<{ tab?: string; from?: string; to?: string; type?: string; clientId?: string; method?: string; status?: string; category?: string; invStatus?: string; invPaymentStatus?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const tab = params.tab || "overview";
  const tabs = [
    { key: "overview", label: "نظرة عامة" },
    { key: "income", label: "الإيرادات والمصروفات" },
    { key: "invoices", label: "الفواتير" },
    { key: "reports", label: "التقارير" },
  ];

  return (
    <AdminShell title="الحسابات">
      {!hasDatabase() ? <SetupNotice /> : null}

      <div className="mb-6 flex flex-wrap gap-2 border-b border-[#06111F]/10 pb-2" dir="rtl">
        {tabs.map((t) => (
          <a key={t.key} href={`/admin/accounting${t.key === "overview" ? "" : `?tab=${t.key}`}`} className={`rounded-full px-5 py-2 text-sm font-black uppercase tracking-[0.12em] transition ${tab === t.key ? "bg-[#0B7CFF] text-white shadow-lg shadow-blue-500/20" : "text-[#06111F]/50 hover:text-[#0B7CFF]"}`}>{t.label}</a>
        ))}
      </div>

      {tab === "overview" ? <OverviewTab /> : null}
      {tab === "income" ? <IncomeTab params={params} /> : null}
      {tab === "invoices" ? <InvoicesTab params={params} /> : null}
      {tab === "reports" ? <ReportsTab /> : null}
    </AdminShell>
  );
}

async function OverviewTab() {
  const [data, finance] = await Promise.all([getAccounting(), getFinanceCenter()]);
  if (!data) return <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-10 text-center shadow-sm" dir="rtl"><h2 className="text-2xl font-black">لا توجد بيانات</h2></div>;

  const month = new Date();
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthRevenue = data.payments.filter((item) => item.date >= monthStart).reduce((sum, item) => sum + Number(item.amount), 0);
  const monthExpensesVal = data.expenses.filter((item) => item.date >= monthStart).reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <>
      <div className="mb-6 rounded-2xl bg-white p-5 text-base font-bold leading-8 text-[#06111F]/55" dir="rtl">هذا النظام لمتابعة الحسابات داخليا فقط ولا يعتبر بديلا عن محاسب قانوني أو نظام ضرائب رسمي.</div>
      <div className="mb-8" dir="rtl">
        <h2 className="mb-4 text-base font-black uppercase tracking-[0.18em] text-[#06111F]/40">نظرة عامة</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card title="إجمالي الإيرادات" value={`${data.revenue.toLocaleString()} EGP`} />
          <Card title="إجمالي المصروفات" value={`${data.totalExpenses.toLocaleString()} EGP`} />
          <Card title="صافي الربح" value={`${data.profit.toLocaleString()} EGP`} text={data.profit >= 0 ? "مربح" : "خسارة"} />
          <Card title="المدفوعات المتبقية" value={`${data.pending.toLocaleString()} EGP`} />
          <Card title="إيرادات الشهر" value={`${monthRevenue.toLocaleString()} EGP`} />
          <Card title="مصروفات الشهر" value={`${monthExpensesVal.toLocaleString()} EGP`} />
          <Card title="أرباح الشهر" value={`${(monthRevenue - monthExpensesVal).toLocaleString()} EGP`} />
        </div>
      </div>

      {finance ? (
        <>
          <div className="mb-8" dir="rtl">
            <h2 className="mb-4 text-base font-black uppercase tracking-[0.18em] text-[#06111F]/40">Finance Center</h2>
            <div className="grid gap-4 md:grid-cols-4">
              <Card title="MRR" value={`${finance.mrr.toLocaleString()} EGP`} text="Monthly Recurring Revenue" />
              <Card title="ARR" value={`${finance.arr.toLocaleString()} EGP`} text="Annual Run Rate" />
              <Card title="Cash Flow" value={`${finance.cashFlow.toLocaleString()} EGP`} text={finance.cashFlow >= 0 ? "Positive" : "Negative"} />
              <Card title="Outstanding" value={`${finance.outstandingInvoices.toLocaleString()} EGP`} text="Unpaid invoices" />
            </div>
          </div>

          {finance.monthlyTrend.length > 0 ? (
            <div className="mb-8">
              <h2 className="mb-4 text-base font-black uppercase tracking-[0.18em] text-[#06111F]/40">Monthly Trend</h2>
              <div className="blur-chart rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
                <div className="grid auto-rows-min gap-4" style={{ gridTemplateColumns: `repeat(${finance.monthlyTrend.length}, 1fr)` }}>
                  {finance.monthlyTrend.map(m => {
                    const maxVal = Math.max(...finance.monthlyTrend.map(x => Math.max(x.revenue, x.expenses, 1)));
                    return (
                      <div key={m.month} className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-bold text-[#06111F]/40">{m.month.slice(5)}</span>
                        <div className="flex h-20 w-full items-end gap-0.5 justify-center">
                          <div className="w-3 rounded-t-sm bg-[#0B7CFF]" style={{ height: `${(m.revenue / maxVal) * 100}%` }} />
                          <div className="w-3 rounded-t-sm bg-[#EF476F]" style={{ height: `${(m.expenses / maxVal) * 100}%` }} />
                        </div>
                        <div className="flex gap-1 text-[7px] font-bold">
                          <span className="text-[#0B7CFF]">{(m.revenue / 1000).toFixed(0)}k</span>
                          <span className="text-[#EF476F]">{(m.expenses / 1000).toFixed(0)}k</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex justify-center gap-4 text-[10px] font-bold">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#0B7CFF]" /> Revenue</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#EF476F]" /> Expenses</span>
                </div>
              </div>
            </div>
          ) : null}

          {finance.revenueByClient.length > 0 ? (
            <div className="mb-8">
              <h2 className="mb-4 text-base font-black uppercase tracking-[0.18em] text-[#06111F]/40">Revenue by Client</h2>
              <div className="blur-chart rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
                <div className="grid gap-3">
                  {finance.revenueByClient.map(([name, amount], i) => (
                    <div key={name} className="flex items-center gap-3">
                      <span className="w-6 text-xs font-black text-[#06111F]/40">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="blur-sensitive text-xs font-bold">{name}</span>
                          <span className="blur-financial text-xs font-black text-[#0B7CFF]">{amount.toLocaleString()} EGP</span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded-full bg-[#06111F]/5">
                          <div className="h-2 rounded-full bg-[#0B7CFF]" style={{ width: `${(amount / finance.revenueByClient[0][1]) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <a className="inline-flex rounded-full border border-[#06111F]/10 bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#06111F] transition hover:border-[#0B7CFF] hover:text-[#0B7CFF]" href="/admin/export/accounting">تصدير الحسابات CSV</a>
    </>
  );
}

async function IncomeTab({ params }: { params: { from?: string; to?: string; clientId?: string; method?: string; status?: string; category?: string; type?: string } }) {
  const data = await getAccounting();
  if (!data) return <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-10 text-center shadow-sm" dir="rtl"><h2 className="text-2xl font-black">لا توجد بيانات</h2></div>;

  const hasFilters = Object.values(params).some(Boolean);
  const payments = data.payments.filter((item) =>
    (!params.from || item.date >= new Date(`${params.from}T00:00:00`)) &&
    (!params.to || item.date <= new Date(`${params.to}T23:59:59`)) &&
    (!params.clientId || item.clientId === params.clientId) &&
    (!params.method || item.method === params.method) &&
    (!params.status || item.status === params.status) &&
    (!params.type || params.type === "income")
  );
  const expenses = data.expenses.filter((item) =>
    (!params.from || item.date >= new Date(`${params.from}T00:00:00`)) &&
    (!params.to || item.date <= new Date(`${params.to}T23:59:59`)) &&
    (!params.clientId || item.clientId === params.clientId) &&
    (!params.method || item.method === params.method) &&
    (!params.category || item.category === params.category) &&
    (!params.type || params.type === "expense")
  );

  return (
    <>
      <form className="mb-8 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm" dir="rtl">
        <h2 className="mb-4 text-base font-black uppercase tracking-[0.14em] text-[#06111F]/40">تصفية</h2>
        <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-7">
          <input className={inputClass} defaultValue={params.from || ""} name="from" type="date" placeholder="من تاريخ" />
          <input className={inputClass} defaultValue={params.to || ""} name="to" type="date" placeholder="إلى تاريخ" />
          <select className={inputClass} defaultValue={params.type || ""} name="type"><option value="">الكل</option><option value="income">إيراد</option><option value="expense">مصروف</option></select>
          <select className={inputClass} defaultValue={params.clientId || ""} name="clientId"><option value="">كل العملاء</option>{data.clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select>
          <select className={inputClass} defaultValue={params.method || ""} name="method"><option value="">طريقة الدفع</option>{paymentMethods.map((item) => <option key={item} value={item}>{paymentMethodArabic[item]}</option>)}</select>
          <select className={inputClass} defaultValue={params.status || ""} name="status"><option value="">حالة الدفع</option>{paymentStatuses.map((item) => <option key={item} value={item}>{paymentStatusArabic[item]}</option>)}</select>
          <select className={inputClass} defaultValue={params.category || ""} name="category"><option value="">التصنيف</option>{expenseCategories.map((item) => <option key={item} value={item}>{expenseCategoryArabic[item]}</option>)}</select>
          <div className="flex gap-2 md:col-span-4 lg:col-span-7">
            <button className="flex-1 rounded-full bg-[#0B7CFF] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white" type="submit">تصفية</button>
            <a className="rounded-full border border-[#06111F]/10 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#06111F]" href="/admin/accounting?tab=income">إعادة تعيين</a>
          </div>
        </div>
      </form>

      <div className="mb-8 grid gap-6 lg:grid-cols-2" dir="rtl">
        <form action={createPaymentAction} className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-black uppercase tracking-[-0.05em]">إضافة إيراد</h2>
          <div className="grid gap-4">
            <Field label="المبلغ"><input className={inputClass} name="amount" required type="number" min="0.01" step="0.01" placeholder="0.00" /></Field>
            <Field label="طريقة الدفع"><select className={inputClass} name="method" required>{paymentMethods.map((item) => <option key={item} value={item}>{paymentMethodArabic[item]}</option>)}</select></Field>
            <Field label="حالة الدفع"><select className={inputClass} name="status" required>{paymentStatuses.map((item) => <option key={item} value={item}>{paymentStatusArabic[item]}</option>)}</select></Field>
            <Field label="العميل"><select className={inputClass} name="clientId"><option value="">بدون</option>{data.clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select></Field>
            <Field label="الحجز"><select className={inputClass} name="bookingId"><option value="">بدون</option>{data.bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.client.fullName} - {booking.type}</option>)}</select></Field>
            <Field label="التاريخ"><input className={inputClass} name="date" required type="date" /></Field>
            <Field label="الوصف"><textarea className={inputClass} name="description" rows={3} /></Field>
            <button className="rounded-full bg-[#0B7CFF] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-blue-500/20">حفظ الإيراد</button>
          </div>
        </form>
        <form action={createExpenseAction} className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-black uppercase tracking-[-0.05em]">إضافة مصروف</h2>
          <div className="grid gap-4">
            <Field label="المبلغ"><input className={inputClass} name="amount" required type="number" min="0.01" step="0.01" placeholder="0.00" /></Field>
            <Field label="التصنيف"><select className={inputClass} name="category" required>{expenseCategories.map((item) => <option key={item} value={item}>{expenseCategoryArabic[item]}</option>)}</select></Field>
            <Field label="طريقة الدفع"><select className={inputClass} name="method" required>{paymentMethods.map((item) => <option key={item} value={item}>{paymentMethodArabic[item]}</option>)}</select></Field>
            <Field label="العميل إن وجد"><select className={inputClass} name="clientId"><option value="">بدون</option>{data.clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select></Field>
            <Field label="التاريخ"><input className={inputClass} name="date" required type="date" /></Field>
            <Field label="الوصف"><textarea className={inputClass} name="description" required rows={3} /></Field>
            <button className="rounded-full bg-[#06111F] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg">حفظ المصروف</button>
          </div>
        </form>
      </div>

      {payments.length > 0 || expenses.length > 0 ? (
        <section className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm" dir="rtl">
          <h2 className="mb-6 text-xl font-black uppercase">جدول الحسابات</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
                  <th className="p-3">التاريخ</th><th className="p-3">النوع</th><th className="p-3">العميل</th><th className="p-3">الوصف</th><th className="p-3">التصنيف</th><th className="p-3">طريقة الدفع</th><th className="p-3">حالة الدفع</th><th className="p-3">المبلغ</th><th className="p-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {[...payments.map((item) => ({ kind: "إيراد" as const, item })), ...expenses.map((item) => ({ kind: "مصروف" as const, item }))]
                  .sort((a, b) => b.item.date.getTime() - a.item.date.getTime())
                  .map((row) => (
                  <tr className="border-b border-[#06111F]/5 transition hover:bg-[#F7F8FB]" key={`${row.kind}-${row.item.id}`}>
                    <td className="p-3 text-sm font-bold text-[#06111F]/65">{dateInput(row.item.date)}</td>
                    <td className="p-3"><span className={`inline-block rounded-full px-3 py-1 text-xs font-black uppercase ${row.kind === "إيراد" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{row.kind}</span></td>
                    <td className="blur-sensitive p-3 text-sm font-bold text-[#06111F]/65">{row.item.client?.fullName || "بدون عميل"}</td>
                    <td className="blur-sensitive p-3 text-sm font-bold text-[#06111F]/65">{row.item.description || "-"}</td>
                    <td className="p-3 text-sm font-bold text-[#06111F]/65">{"category" in row.item ? expenseCategoryArabic[row.item.category] : "إيراد"}</td>
                    <td className="p-3 text-sm font-bold text-[#06111F]/65">{paymentMethodArabic[row.item.method]}</td>
                    <td className="p-3">{"status" in row.item ? <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${row.item.status === "PAID" ? "bg-green-100 text-green-700" : row.item.status === "UNPAID" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{paymentStatusArabic[row.item.status]}</span> : <span className="text-sm text-[#06111F]/45">-</span>}</td>
                    <td className="blur-sensitive p-3 text-sm font-black text-[#06111F]">{Number(row.item.amount).toLocaleString()} EGP</td>
                    <td className="p-3">
                      <details className="relative">
                        <summary className="cursor-pointer rounded-full bg-[#0B7CFF]/10 px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-[#0B7CFF]">إجراءات</summary>
                        <div className="absolute left-0 top-full z-10 mt-2 w-80 rounded-2xl border border-[#06111F]/10 bg-white p-4 shadow-xl">
                          {row.kind === "إيراد" && "status" in row.item ? <form action={updatePaymentAction} className="grid gap-3">
                            <input name="paymentId" type="hidden" value={row.item.id} />
                            <div className="grid grid-cols-2 gap-3">
                              <Field label="المبلغ"><input className={inputClass} defaultValue={String(row.item.amount)} name="amount" type="number" min="0.01" step="0.01" /></Field>
                              <Field label="طريقة الدفع"><select className={inputClass} defaultValue={row.item.method} name="method">{paymentMethods.map((item) => <option key={item} value={item}>{paymentMethodArabic[item]}</option>)}</select></Field>
                              <Field label="حالة الدفع"><select className={inputClass} defaultValue={row.item.status} name="status">{paymentStatuses.map((item) => <option key={item} value={item}>{paymentStatusArabic[item]}</option>)}</select></Field>
                              <Field label="العميل"><select className={inputClass} defaultValue={row.item.clientId || ""} name="clientId"><option value="">بدون</option>{data.clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select></Field>
                              <Field label="الحجز"><select className={inputClass} defaultValue={row.item.bookingId || ""} name="bookingId"><option value="">بدون</option>{data.bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.client.fullName} - {booking.type}</option>)}</select></Field>
                              <Field label="التاريخ"><input className={inputClass} defaultValue={dateInput(row.item.date)} name="date" type="date" /></Field>
                            </div>
                            <Field label="الوصف"><textarea className={inputClass} defaultValue={row.item.description || ""} name="description" rows={2} /></Field>
                            <div className="flex gap-2">
                              <button className="flex-1 rounded-full bg-[#0B7CFF] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white">تعديل</button>
                              <form action={deletePaymentAction}><input name="paymentId" type="hidden" value={row.item.id} /><ConfirmSubmit message="حذف الإيراد؟">حذف</ConfirmSubmit></form>
                            </div>
                          </form> : null}
                          {row.kind === "مصروف" && "category" in row.item ? <form action={updateExpenseAction} className="grid gap-3">
                            <input name="expenseId" type="hidden" value={row.item.id} />
                            <div className="grid grid-cols-2 gap-3">
                              <Field label="المبلغ"><input className={inputClass} defaultValue={String(row.item.amount)} name="amount" type="number" min="0.01" step="0.01" /></Field>
                              <Field label="التصنيف"><select className={inputClass} defaultValue={row.item.category} name="category">{expenseCategories.map((item) => <option key={item} value={item}>{expenseCategoryArabic[item]}</option>)}</select></Field>
                              <Field label="طريقة الدفع"><select className={inputClass} defaultValue={row.item.method} name="method">{paymentMethods.map((item) => <option key={item} value={item}>{paymentMethodArabic[item]}</option>)}</select></Field>
                              <Field label="العميل"><select className={inputClass} defaultValue={row.item.clientId || ""} name="clientId"><option value="">بدون</option>{data.clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select></Field>
                              <Field label="التاريخ"><input className={inputClass} defaultValue={dateInput(row.item.date)} name="date" type="date" /></Field>
                            </div>
                            <Field label="الوصف"><textarea className={inputClass} defaultValue={row.item.description} name="description" rows={2} /></Field>
                            <div className="flex gap-2">
                              <button className="flex-1 rounded-full bg-[#0B7CFF] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white">تعديل</button>
                              <form action={deleteExpenseAction}><input name="expenseId" type="hidden" value={row.item.id} /><ConfirmSubmit message="حذف المصروف؟">حذف</ConfirmSubmit></form>
                            </div>
                          </form> : null}
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-10 text-center shadow-sm" dir="rtl">
          <h2 className="text-2xl font-black uppercase tracking-[-0.05em]">لا توجد قيود</h2>
          <p className="mt-2 text-sm text-[#06111F]/55">{hasFilters ? "لا توجد نتائج تطابق التصفية. حاول تغيير معايير البحث." : "لم يتم تسجيل أي إيرادات أو مصروفات بعد. أضف أول قيد من النماذج أعلاه."}</p>
          {hasFilters ? <a className="mt-4 inline-block rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white" href="/admin/accounting?tab=income">إعادة تعيين</a> : null}
        </div>
      )}
    </>
  );
}

async function InvoicesTab({ params }: { params: { invStatus?: string; invPaymentStatus?: string; clientId?: string } }) {
  const [invoices, clients] = await Promise.all([getInvoices(), getClients()]);
  const hasFilters = params.invStatus || params.invPaymentStatus || params.clientId;
  const filtered = invoices.filter((inv) =>
    (!params.clientId || inv.clientId === params.clientId) &&
    (!params.invStatus || inv.status === params.invStatus) &&
    (!params.invPaymentStatus || inv.paymentStatus === params.invPaymentStatus)
  );

  const totalInvoices = invoices.length;
  const draftCount = invoices.filter((i) => i.status === "DRAFT").length;
  const sentCount = invoices.filter((i) => i.status === "SENT").length;
  const paidCount = invoices.filter((i) => i.paymentStatus === "PAID").length;
  const overdueCount = invoices.filter((i) => i.paymentStatus === "OVERDUE").length;
  const totalValue = invoices.reduce((s, i) => s + Number(i.total), 0);
  const totalPaid = invoices.reduce((s, i) => s + Number(i.paidAmount), 0);
  const totalRemaining = invoices.reduce((s, i) => s + Number(i.remainingAmount), 0);

  return (
    <div dir="rtl">
      <div className="mb-6">
        <a className="inline-flex rounded-full bg-[#0B7CFF] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-blue-500/20" href="/admin/accounting/invoices/new">إنشاء فاتورة</a>
      </div>

      <div className="mb-6 overflow-x-auto">
        <div className="grid min-w-[800px] gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InvoiceSummary label="إجمالي الفواتير" value={String(totalInvoices)} color="text-[#06111F]" />
          <InvoiceSummary label="فواتير مسودة" value={String(draftCount)} color="text-amber-600" />
          <InvoiceSummary label="فواتير مرسلة" value={String(sentCount)} color="text-blue-600" />
          <InvoiceSummary label="فواتير مدفوعة" value={String(paidCount)} color="text-green-600" />
          <InvoiceSummary label="فواتير متأخرة" value={String(overdueCount)} color="text-red-600" />
          <InvoiceSummary label="إجمالي قيمة الفواتير" value={`${totalValue.toLocaleString()} EGP`} color="text-[#0B7CFF]" />
          <InvoiceSummary label="إجمالي المدفوع" value={`${totalPaid.toLocaleString()} EGP`} color="text-green-600" />
          <InvoiceSummary label="إجمالي المتبقي" value={`${totalRemaining.toLocaleString()} EGP`} color="text-red-600" />
        </div>
      </div>

      <form className="mb-6 rounded-[2rem] border border-[#06111F]/10 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <select className={`${inputClass} flex-1`} defaultValue={params.clientId || ""} name="clientId"><option value="">كل العملاء</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}</select>
          <select className={`${inputClass} flex-1`} defaultValue={params.invStatus || ""} name="invStatus"><option value="">كل الحالات</option>{invoiceStatuses.map((s) => <option key={s} value={s}>{invoiceStatusArabic[s]}</option>)}</select>
          <select className={`${inputClass} flex-1`} defaultValue={params.invPaymentStatus || ""} name="invPaymentStatus"><option value="">حالة الدفع</option>{invoicePaymentStatuses.map((s) => <option key={s} value={s}>{invoicePaymentStatusArabic[s]}</option>)}</select>
          <button className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white" type="submit">تصفية</button>
          {hasFilters ? <a className="rounded-full border border-[#06111F]/10 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]" href="/admin/accounting?tab=invoices">إعادة تعيين</a> : null}
        </div>
      </form>

      {filtered.length === 0 ? (
        <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-10 text-center shadow-sm">
          <h2 className="text-2xl font-black uppercase tracking-[-0.05em]">لا توجد فواتير</h2>
          <p className="mt-2 text-sm text-[#06111F]/55">{hasFilters ? "لا توجد نتائج تطابق التصفية." : "لا توجد فواتير حتى الآن. أنشئ أول فاتورة لعميل."}</p>
          {hasFilters ? <a className="mt-4 inline-block rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white" href="/admin/accounting?tab=invoices">إعادة تعيين</a> : <a className="mt-4 inline-block rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white" href="/admin/accounting/invoices/new">إنشاء الفاتورة الأولى</a>}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[2rem] border border-[#06111F]/10 bg-white shadow-sm">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
                <th className="p-3">رقم الفاتورة</th><th className="p-3">التاريخ</th><th className="p-3">العميل</th><th className="p-3">الإجمالي</th><th className="p-3">المدفوع</th><th className="p-3">المتبقي</th><th className="p-3">حالة الفاتورة</th><th className="p-3">حالة الدفع</th><th className="p-3">تاريخ الاستحقاق</th><th className="p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr className="border-b border-[#06111F]/5 transition hover:bg-[#F7F8FB]" key={inv.id}>
                  <td className="p-3 font-black text-[#06111F]">{inv.invoiceNo}</td>
                  <td className="p-3 text-[#06111F]/65">{new Date(inv.invoiceDate).toLocaleDateString("ar-EG")}</td>
                  <td className="p-3 text-[#06111F]/65">{inv.client?.fullName || "بدون"}</td>
                  <td className="p-3 font-black text-[#06111F]">{Number(inv.total).toLocaleString()} EGP</td>
                  <td className="p-3 text-[#06111F]/65">{Number(inv.paidAmount).toLocaleString()} EGP</td>
                  <td className="p-3 font-bold">{Number(inv.remainingAmount) > 0 ? <span className="text-red-600">{Number(inv.remainingAmount).toLocaleString()} EGP</span> : <span className="text-green-600">0</span>}</td>
                  <td className="p-3"><span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${inv.status === "SENT" ? "bg-blue-100 text-blue-700" : inv.status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{invoiceStatusArabic[inv.status]}</span></td>
                  <td className="p-3"><span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${inv.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : inv.paymentStatus === "OVERDUE" ? "bg-red-100 text-red-700" : inv.paymentStatus === "PARTIALLY_PAID" ? "bg-blue-100 text-blue-700" : inv.paymentStatus === "REFUNDED" ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"}`}>{invoicePaymentStatusArabic[inv.paymentStatus]}</span></td>
                  <td className="p-3 text-[#06111F]/65">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("ar-EG") : "-"}</td>
                  <td className="p-3"><InvoiceActions invoiceId={inv.id} status={inv.status} total={Number(inv.total)} paidAmount={Number(inv.paidAmount)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

async function ReportsTab() {
  const [invoices, clients, data] = await Promise.all([getInvoices(), getClients(), getAccounting()]);
  if (!data) return <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-10 text-center shadow-sm" dir="rtl"><h2 className="text-2xl font-black">لا توجد بيانات</h2></div>;

  const totalRevenue = data.payments.reduce((s, p) => s + Number(p.amount), 0);
  const totalExpenses = data.expenses.reduce((s, e) => s + Number(e.amount), 0);
  const netProfit = totalRevenue - totalExpenses;
  const totalInvoiceValue = invoices.reduce((s, i) => s + Number(i.total), 0);
  const totalInvoicePaid = invoices.reduce((s, i) => s + Number(i.paidAmount), 0);
  const totalInvoiceRemaining = invoices.reduce((s, i) => s + Number(i.remainingAmount), 0);
  const overdueInvoices = invoices.filter((i) => i.paymentStatus === "OVERDUE" || (i.dueDate && new Date(i.dueDate) < new Date() && Number(i.remainingAmount) > 0));
  const overdueTotal = overdueInvoices.reduce((s, i) => s + Number(i.remainingAmount), 0);

  const revenueByMonth: Record<string, number> = {};
  const expenseByMonth: Record<string, number> = {};
  data.payments.forEach((p) => {
    const key = `${p.date.getFullYear()}-${String(p.date.getMonth() + 1).padStart(2, "0")}`;
    revenueByMonth[key] = (revenueByMonth[key] || 0) + Number(p.amount);
  });
  data.expenses.forEach((e) => {
    const key = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, "0")}`;
    expenseByMonth[key] = (expenseByMonth[key] || 0) + Number(e.amount);
  });
  const allMonths = [...new Set([...Object.keys(revenueByMonth), ...Object.keys(expenseByMonth)])].sort();

  const revenueByClient: Record<string, number> = {};
  data.payments.forEach((p) => {
    const name = p.client?.fullName || "بدون عميل";
    revenueByClient[name] = (revenueByClient[name] || 0) + Number(p.amount);
  });

  const revenueByMethod: Record<string, number> = {};
  data.payments.forEach((p) => {
    revenueByMethod[p.method] = (revenueByMethod[p.method] || 0) + Number(p.amount);
  });

  const expenseByCategory: Record<string, number> = {};
  data.expenses.forEach((e) => {
    expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + Number(e.amount);
  });

  const csvRows: string[] = [];
  csvRows.push("\uFEFF" + [
    "التقرير", "القيمة", "التفاصيل"
  ].join(","));
  csvRows.push(["إجمالي الإيرادات", totalRevenue.toLocaleString() + " EGP", `من ${data.payments.length} عملية دفع`].join(","));
  csvRows.push(["إجمالي المصروفات", totalExpenses.toLocaleString() + " EGP", `من ${data.expenses.length} عملية`].join(","));
  csvRows.push(["صافي الربح", netProfit.toLocaleString() + " EGP", netProfit >= 0 ? "مربح" : "خسارة"].join(","));
  csvRows.push(["إجمالي الفواتير", totalInvoiceValue.toLocaleString() + " EGP", `من ${invoices.length} فاتورة`].join(","));
  csvRows.push(["إجمالي المدفوع من الفواتير", totalInvoicePaid.toLocaleString() + " EGP", ""].join(","));
  csvRows.push(["إجمالي المتبقي من الفواتير", totalInvoiceRemaining.toLocaleString() + " EGP", ""].join(","));
  csvRows.push(["الفواتير المتأخرة", overdueTotal.toLocaleString() + " EGP", `من ${overdueInvoices.length} فاتورة`].join(","));
  const csvBlob = new TextEncoder().encode(csvRows.join("\n"));

  return (
    <div dir="rtl">
      <div className="mb-6 flex flex-wrap gap-3">
        <a className="inline-flex rounded-full bg-[#0B7CFF] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-blue-500/20" href={`data:text/csv;base64,${Buffer.from(csvBlob).toString("base64")}`} download="financial-report.csv">تصدير CSV</a>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card title="إجمالي الإيرادات" value={`${totalRevenue.toLocaleString()} EGP`} />
        <Card title="إجمالي المصروفات" value={`${totalExpenses.toLocaleString()} EGP`} />
        <Card title="صافي الربح" value={`${netProfit.toLocaleString()} EGP`} text={netProfit >= 0 ? "مربح" : "خسارة"} />
        <Card title="إجمالي الفواتير" value={`${totalInvoiceValue.toLocaleString()} EGP`} />
        <Card title="إجمالي المدفوع" value={`${totalInvoicePaid.toLocaleString()} EGP`} />
        <Card title="إجمالي المتبقي" value={`${totalInvoiceRemaining.toLocaleString()} EGP`} />
        <Card title="الفواتير المتأخرة" value={`${overdueTotal.toLocaleString()} EGP`} text={`عدد: ${overdueInvoices.length}`} />
      </div>

      <div className="mb-8 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-black uppercase tracking-[0.14em] text-[#06111F]/40">تقرير الإيرادات والمصروفات الشهرية</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
                <th className="p-3">الشهر</th><th className="p-3">الإيرادات</th><th className="p-3">المصروفات</th><th className="p-3">صافي الربح</th>
              </tr>
            </thead>
            <tbody>
              {allMonths.length === 0 ? <tr><td className="p-3 text-center text-[#06111F]/55" colSpan={4}>لا توجد بيانات</td></tr> : allMonths.map((month) => {
                const rev = revenueByMonth[month] || 0;
                const exp = expenseByMonth[month] || 0;
                return (
                  <tr className="border-b border-[#06111F]/5" key={month}>
                    <td className="p-3 font-bold">{month}</td>
                    <td className="blur-sensitive p-3 text-green-600">{rev.toLocaleString()} EGP</td>
                    <td className="blur-sensitive p-3 text-red-600">{exp.toLocaleString()} EGP</td>
                    <td className={`blur-sensitive p-3 font-bold ${rev - exp >= 0 ? "text-green-700" : "text-red-700"}`}>{(rev - exp).toLocaleString()} EGP</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-black uppercase tracking-[0.14em] text-[#06111F]/40">تقرير الإيرادات حسب العميل</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
                  <th className="p-3">العميل</th><th className="p-3">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(revenueByClient).length === 0 ? <tr><td className="p-3 text-center text-[#06111F]/55" colSpan={2}>لا توجد بيانات</td></tr> : Object.entries(revenueByClient).sort((a, b) => b[1] - a[1]).map(([name, amount]) => (
                  <tr className="border-b border-[#06111F]/5" key={name}>
                    <td className="blur-sensitive p-3 font-bold">{name}</td>
                    <td className="blur-sensitive p-3">{amount.toLocaleString()} EGP</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-black uppercase tracking-[0.14em] text-[#06111F]/40">تقرير الإيرادات حسب طريقة الدفع</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
                  <th className="p-3">طريقة الدفع</th><th className="p-3">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(revenueByMethod).length === 0 ? <tr><td className="p-3 text-center text-[#06111F]/55" colSpan={2}>لا توجد بيانات</td></tr> : Object.entries(revenueByMethod).sort((a, b) => b[1] - a[1]).map(([method, amount]) => (
                  <tr className="border-b border-[#06111F]/5" key={method}>
                    <td className="blur-sensitive p-3 font-bold">{paymentMethodArabic[method] || method}</td>
                    <td className="blur-sensitive p-3">{amount.toLocaleString()} EGP</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-black uppercase tracking-[0.14em] text-[#06111F]/40">تقرير المصروفات حسب التصنيف</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
                  <th className="p-3">التصنيف</th><th className="p-3">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(expenseByCategory).length === 0 ? <tr><td className="p-3 text-center text-[#06111F]/55" colSpan={2}>لا توجد بيانات</td></tr> : Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
                  <tr className="border-b border-[#06111F]/5" key={cat}>
                    <td className="blur-sensitive p-3 font-bold">{expenseCategoryArabic[cat] || cat}</td>
                    <td className="blur-sensitive p-3">{amount.toLocaleString()} EGP</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-black uppercase tracking-[0.14em] text-[#06111F]/40">تقرير الفواتير حسب الحالة</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
                  <th className="p-3">الحالة</th><th className="p-3">العدد</th><th className="p-3">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {(["DRAFT", "SENT", "PAID", "CANCELLED"] as const).map((st) => {
                  const filtered = invoices.filter((i) => i.status === st);
                  if (filtered.length === 0) return null;
                  return (
                    <tr className="border-b border-[#06111F]/5" key={st}>
                      <td className="blur-sensitive p-3 font-bold">{invoiceStatusArabic[st]}</td>
                      <td className="p-3">{filtered.length}</td>
                      <td className="blur-sensitive p-3">{filtered.reduce((s, i) => s + Number(i.total), 0).toLocaleString()} EGP</td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-[#06111F] font-bold">
                  <td className="p-3">الإجمالي</td>
                  <td className="blur-sensitive p-3">{invoices.length}</td>
                  <td className="blur-sensitive p-3">{totalInvoiceValue.toLocaleString()} EGP</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {overdueInvoices.length > 0 ? (
        <div className="mb-8 rounded-[2rem] border border-red-200 bg-red-50 p-6 shadow-sm">
          <h3 className="mb-4 text-base font-black uppercase tracking-[0.14em] text-red-700">تقرير المدفوعات المتأخرة</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-red-200 text-xs font-black uppercase tracking-[0.14em] text-red-700">
                  <th className="p-3">رقم الفاتورة</th><th className="p-3">العميل</th><th className="p-3">الإجمالي</th><th className="p-3">المتبقي</th><th className="p-3">تاريخ الاستحقاق</th>
                </tr>
              </thead>
              <tbody>
                {overdueInvoices.slice(0, 10).map((inv) => (
                  <tr className="border-b border-red-100" key={inv.id}>
                    <td className="blur-sensitive p-3 font-bold">{inv.invoiceNo}</td>
                    <td className="blur-sensitive p-3">{inv.client?.fullName || "بدون"}</td>
                    <td className="blur-sensitive p-3">{Number(inv.total).toLocaleString()} EGP</td>
                    <td className="blur-sensitive p-3 font-bold text-red-700">{Number(inv.remainingAmount).toLocaleString()} EGP</td>
                    <td className="p-3">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("ar-EG") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
