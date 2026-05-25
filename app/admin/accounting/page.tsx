import { AdminShell, Card, SetupNotice } from "@/components/admin-shell";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { Field, inputClass } from "@/components/form-fields";
import { createExpenseAction, createPaymentAction, deleteExpenseAction, deletePaymentAction, updateExpenseAction, updatePaymentAction } from "@/lib/actions";
import { expenseCategories, expenseCategoryArabic, paymentMethodArabic, paymentMethods, paymentStatusArabic, paymentStatuses } from "@/lib/constants";
import { getAccounting, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

function dateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

export default async function AccountingPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string; type?: string; clientId?: string; method?: string; status?: string; category?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const hasFilters = Object.values(params).some(Boolean);
  const data = await getAccounting();
  const payments = data?.payments.filter((item) =>
    (!params.from || item.date >= new Date(`${params.from}T00:00:00`)) &&
    (!params.to || item.date <= new Date(`${params.to}T23:59:59`)) &&
    (!params.clientId || item.clientId === params.clientId) &&
    (!params.method || item.method === params.method) &&
    (!params.status || item.status === params.status) &&
    (!params.type || params.type === "income")
  ) ?? [];
  const expenses = data?.expenses.filter((item) =>
    (!params.from || item.date >= new Date(`${params.from}T00:00:00`)) &&
    (!params.to || item.date <= new Date(`${params.to}T23:59:59`)) &&
    (!params.clientId || item.clientId === params.clientId) &&
    (!params.method || item.method === params.method) &&
    (!params.category || item.category === params.category) &&
    (!params.type || params.type === "expense")
  ) ?? [];
  const month = new Date();
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthRevenue = data?.payments.filter((item) => item.date >= monthStart).reduce((sum, item) => sum + Number(item.amount), 0) ?? 0;
  const monthExpensesVal = data?.expenses.filter((item) => item.date >= monthStart).reduce((sum, item) => sum + Number(item.amount), 0) ?? 0;

  return (
    <AdminShell title="الحسابات">
      {!hasDatabase() ? <SetupNotice /> : null}
      <div className="mb-6 rounded-2xl bg-white p-5 text-base font-bold leading-8 text-[#06111F]/55" dir="rtl">هذا النظام لمتابعة الحسابات داخليا فقط ولا يعتبر بديلا عن محاسب قانوني أو نظام ضرائب رسمي.</div>
      {data ? <div className="mb-8" dir="rtl">
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
      </div> : null}
      <a className="mb-6 inline-flex rounded-full border border-[#06111F]/10 bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#06111F] transition hover:border-[#0B7CFF] hover:text-[#0B7CFF]" href="/admin/export/accounting">تصدير الحسابات CSV</a>

      <form className="mb-8 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm" dir="rtl">
        <h2 className="mb-4 text-base font-black uppercase tracking-[0.14em] text-[#06111F]/40">تصفية</h2>
        <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-7">
          <input className={inputClass} defaultValue={params.from || ""} name="from" type="date" placeholder="من تاريخ" />
          <input className={inputClass} defaultValue={params.to || ""} name="to" type="date" placeholder="إلى تاريخ" />
          <select className={inputClass} defaultValue={params.type || ""} name="type"><option value="">الكل</option><option value="income">إيراد</option><option value="expense">مصروف</option></select>
          <select className={inputClass} defaultValue={params.clientId || ""} name="clientId"><option value="">كل العملاء</option>{data?.clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select>
          <select className={inputClass} defaultValue={params.method || ""} name="method"><option value="">طريقة الدفع</option>{paymentMethods.map((item) => <option key={item} value={item}>{paymentMethodArabic[item]}</option>)}</select>
          <select className={inputClass} defaultValue={params.status || ""} name="status"><option value="">حالة الدفع</option>{paymentStatuses.map((item) => <option key={item} value={item}>{paymentStatusArabic[item]}</option>)}</select>
          <select className={inputClass} defaultValue={params.category || ""} name="category"><option value="">التصنيف</option>{expenseCategories.map((item) => <option key={item} value={item}>{expenseCategoryArabic[item]}</option>)}</select>
          <div className="flex gap-2 md:col-span-4 lg:col-span-7">
            <button className="flex-1 rounded-full bg-[#0B7CFF] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white">تصفية</button>
            <a className="rounded-full border border-[#06111F]/10 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#06111F]" href="/admin/accounting">إعادة تعيين</a>
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
            <Field label="العميل"><select className={inputClass} name="clientId"><option value="">بدون</option>{data?.clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select></Field>
            <Field label="الحجز"><select className={inputClass} name="bookingId"><option value="">بدون</option>{data?.bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.client.fullName} - {booking.type}</option>)}</select></Field>
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
            <Field label="العميل إن وجد"><select className={inputClass} name="clientId"><option value="">بدون</option>{data?.clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select></Field>
            <Field label="التاريخ"><input className={inputClass} name="date" required type="date" /></Field>
            <Field label="الوصف"><textarea className={inputClass} name="description" required rows={3} /></Field>
            <button className="rounded-full bg-[#06111F] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg">حفظ المصروف</button>
          </div>
        </form>
      </div>

      {data && (payments.length > 0 || expenses.length > 0) ? <section className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm" dir="rtl">
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
                  <td className="p-3 text-sm font-bold text-[#06111F]/65">{row.item.client?.fullName || "بدون عميل"}</td>
                  <td className="p-3 text-sm font-bold text-[#06111F]/65">{row.item.description || "-"}</td>
                  <td className="p-3 text-sm font-bold text-[#06111F]/65">{"category" in row.item ? expenseCategoryArabic[row.item.category] : "إيراد"}</td>
                  <td className="p-3 text-sm font-bold text-[#06111F]/65">{paymentMethodArabic[row.item.method]}</td>
                  <td className="p-3">{"status" in row.item ? <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${row.item.status === "PAID" ? "bg-green-100 text-green-700" : row.item.status === "UNPAID" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{paymentStatusArabic[row.item.status]}</span> : <span className="text-sm text-[#06111F]/45">-</span>}</td>
                  <td className="p-3 text-sm font-black text-[#06111F]">{Number(row.item.amount).toLocaleString()} EGP</td>
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
                            <Field label="العميل"><select className={inputClass} defaultValue={row.item.clientId || ""} name="clientId"><option value="">بدون</option>{data?.clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select></Field>
                            <Field label="الحجز"><select className={inputClass} defaultValue={row.item.bookingId || ""} name="bookingId"><option value="">بدون</option>{data?.bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.client.fullName} - {booking.type}</option>)}</select></Field>
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
                            <Field label="العميل"><select className={inputClass} defaultValue={row.item.clientId || ""} name="clientId"><option value="">بدون</option>{data?.clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select></Field>
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
      </section> : null}

      {data && payments.length === 0 && expenses.length === 0 ? <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-10 text-center shadow-sm" dir="rtl">
        <h2 className="text-2xl font-black uppercase tracking-[-0.05em]">لا توجد قيود</h2>
        <p className="mt-2 text-sm text-[#06111F]/55">{hasFilters ? "لا توجد نتائج تطابق التصفية. حاول تغيير معايير البحث." : "لم يتم تسجيل أي إيرادات أو مصروفات بعد. أضف أول قيد من النماذج أعلاه."}</p>
        {hasFilters ? <a className="mt-4 inline-block rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white" href="/admin/accounting">إعادة تعيين</a> : null}
      </div> : null}
    </AdminShell>
  );
}
