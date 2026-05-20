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
  const monthExpenses = data?.expenses.filter((item) => item.date >= monthStart).reduce((sum, item) => sum + Number(item.amount), 0) ?? 0;

  return (
    <AdminShell title="الحسابات">
      {!hasDatabase() ? <SetupNotice /> : null}
      <p className="mb-6 rounded-2xl bg-white p-4 text-sm font-bold leading-7 text-[#06111F]/55" dir="rtl">هذا النظام لمتابعة الحسابات داخليا فقط ولا يعتبر بديلا عن محاسب قانوني أو نظام ضرائب رسمي.</p>
      {data ? <div className="mb-6 grid gap-4 md:grid-cols-4"><Card title="إجمالي الإيرادات" value={`${data.revenue} EGP`} /><Card title="إجمالي المصروفات" value={`${data.totalExpenses} EGP`} /><Card title="صافي الربح" value={`${data.profit} EGP`} /><Card title="المدفوعات المتبقية" value={`${data.pending} EGP`} /><Card title="إيرادات الشهر" value={`${monthRevenue} EGP`} /><Card title="مصروفات الشهر" value={`${monthExpenses} EGP`} /><Card title="أرباح الشهر" value={`${monthRevenue - monthExpenses} EGP`} /></div> : null}
      <a className="mb-4 inline-flex rounded-full border border-[#06111F]/10 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]" href="/admin/export/accounting">تصدير الحسابات CSV</a>

      <form className="mb-6 grid gap-3 rounded-[2rem] border border-[#06111F]/10 bg-white p-4 shadow-sm md:grid-cols-7" dir="rtl">
        <input className={inputClass} defaultValue={params.from || ""} name="from" type="date" />
        <input className={inputClass} defaultValue={params.to || ""} name="to" type="date" />
        <select className={inputClass} defaultValue={params.type || ""} name="type"><option value="">الكل</option><option value="income">إيراد</option><option value="expense">مصروف</option></select>
        <select className={inputClass} defaultValue={params.clientId || ""} name="clientId"><option value="">كل العملاء</option>{data?.clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select>
        <select className={inputClass} defaultValue={params.method || ""} name="method"><option value="">طريقة الدفع</option>{paymentMethods.map((item) => <option key={item} value={item}>{paymentMethodArabic[item]}</option>)}</select>
        <select className={inputClass} defaultValue={params.status || ""} name="status"><option value="">حالة الدفع</option>{paymentStatuses.map((item) => <option key={item} value={item}>{paymentStatusArabic[item]}</option>)}</select>
        <select className={inputClass} defaultValue={params.category || ""} name="category"><option value="">التصنيف</option>{expenseCategories.map((item) => <option key={item} value={item}>{expenseCategoryArabic[item]}</option>)}</select>
        <button className="rounded-full bg-[#06111F] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white md:col-span-7">تصفية</button>
      </form>

      <div className="grid gap-6 lg:grid-cols-2" dir="rtl">
        <form action={createPaymentAction} className="grid gap-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
          <h2 className="text-3xl font-black uppercase tracking-[-0.05em]">إضافة إيراد</h2>
          <Field label="المبلغ"><input className={inputClass} name="amount" required type="number" /></Field>
          <Field label="طريقة الدفع"><select className={inputClass} name="method">{paymentMethods.map((item) => <option key={item} value={item}>{paymentMethodArabic[item]}</option>)}</select></Field>
          <Field label="حالة الدفع"><select className={inputClass} name="status">{paymentStatuses.map((item) => <option key={item} value={item}>{paymentStatusArabic[item]}</option>)}</select></Field>
          <Field label="العميل"><select className={inputClass} name="clientId"><option value="">بدون</option>{data?.clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select></Field>
          <Field label="الحجز"><select className={inputClass} name="bookingId"><option value="">بدون</option>{data?.bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.client.fullName} - {booking.type}</option>)}</select></Field>
          <Field label="التاريخ"><input className={inputClass} name="date" required type="date" /></Field>
          <Field label="الوصف"><textarea className={inputClass} name="description" /></Field>
          <button className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">حفظ الإيراد</button>
        </form>
        <form action={createExpenseAction} className="grid gap-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
          <h2 className="text-3xl font-black uppercase tracking-[-0.05em]">إضافة مصروف</h2>
          <Field label="المبلغ"><input className={inputClass} name="amount" required type="number" /></Field>
          <Field label="التصنيف"><select className={inputClass} name="category">{expenseCategories.map((item) => <option key={item} value={item}>{expenseCategoryArabic[item]}</option>)}</select></Field>
          <Field label="طريقة الدفع"><select className={inputClass} name="method">{paymentMethods.map((item) => <option key={item} value={item}>{paymentMethodArabic[item]}</option>)}</select></Field>
          <Field label="العميل"><select className={inputClass} name="clientId"><option value="">بدون</option>{data?.clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select></Field>
          <Field label="التاريخ"><input className={inputClass} name="date" required type="date" /></Field>
          <Field label="الوصف"><textarea className={inputClass} name="description" required /></Field>
          <button className="rounded-full bg-[#06111F] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">حفظ المصروف</button>
        </form>
      </div>

      <section className="mt-6 rounded-[2rem] border border-[#06111F]/10 bg-white p-6" dir="rtl">
        <h2 className="text-2xl font-black uppercase">جدول الحسابات</h2>
        <div className="mt-4 grid gap-3">
          {[...payments.map((item) => ({ kind: "إيراد", item })), ...expenses.map((item) => ({ kind: "مصروف", item }))].map((row) => (
            <div className="rounded-2xl bg-[#F7F8FB] p-4" key={`${row.kind}-${row.item.id}`}>
              <div className="grid gap-2 text-sm font-bold text-[#06111F]/65 md:grid-cols-8"><span>{dateInput(row.item.date)}</span><span>{row.kind}</span><span>{row.item.client?.fullName || "بدون عميل"}</span><span>{row.item.description || "-"}</span><span>{"category" in row.item ? expenseCategoryArabic[row.item.category] : "إيراد"}</span><span>{paymentMethodArabic[row.item.method]}</span><span>{"status" in row.item ? paymentStatusArabic[row.item.status] : "-"}</span><span>{String(row.item.amount)} EGP</span></div>
              <details className="mt-3"><summary className="cursor-pointer text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">إجراءات</summary>
                {row.kind === "إيراد" && "status" in row.item ? <div className="mt-3 flex flex-wrap gap-2"><form action={updatePaymentAction} className="grid flex-1 gap-2 md:grid-cols-4"><input name="paymentId" type="hidden" value={row.item.id} /><input className={inputClass} defaultValue={String(row.item.amount)} name="amount" type="number" /><select className={inputClass} defaultValue={row.item.method} name="method">{paymentMethods.map((item) => <option key={item} value={item}>{paymentMethodArabic[item]}</option>)}</select><select className={inputClass} defaultValue={row.item.status} name="status">{paymentStatuses.map((item) => <option key={item} value={item}>{paymentStatusArabic[item]}</option>)}</select><select className={inputClass} defaultValue={row.item.clientId || ""} name="clientId"><option value="">بدون</option>{data?.clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select><select className={inputClass} defaultValue={row.item.bookingId || ""} name="bookingId"><option value="">بدون</option>{data?.bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.client.fullName} - {booking.type}</option>)}</select><input className={inputClass} defaultValue={dateInput(row.item.date)} name="date" type="date" /><textarea className={inputClass} defaultValue={row.item.description || ""} name="description" /><button className="rounded-full bg-[#0B7CFF] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white">تعديل</button></form><form action={deletePaymentAction}><input name="paymentId" type="hidden" value={row.item.id} /><ConfirmSubmit message="حذف الإيراد؟">حذف</ConfirmSubmit></form></div> : null}
                {row.kind === "مصروف" && "category" in row.item ? <div className="mt-3 flex flex-wrap gap-2"><form action={updateExpenseAction} className="grid flex-1 gap-2 md:grid-cols-4"><input name="expenseId" type="hidden" value={row.item.id} /><input className={inputClass} defaultValue={String(row.item.amount)} name="amount" type="number" /><select className={inputClass} defaultValue={row.item.category} name="category">{expenseCategories.map((item) => <option key={item} value={item}>{expenseCategoryArabic[item]}</option>)}</select><select className={inputClass} defaultValue={row.item.method} name="method">{paymentMethods.map((item) => <option key={item} value={item}>{paymentMethodArabic[item]}</option>)}</select><select className={inputClass} defaultValue={row.item.clientId || ""} name="clientId"><option value="">بدون</option>{data?.clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select><input className={inputClass} defaultValue={dateInput(row.item.date)} name="date" type="date" /><textarea className={inputClass} defaultValue={row.item.description} name="description" /><button className="rounded-full bg-[#0B7CFF] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white">تعديل</button></form><form action={deleteExpenseAction}><input name="expenseId" type="hidden" value={row.item.id} /><ConfirmSubmit message="حذف المصروف؟">حذف</ConfirmSubmit></form></div> : null}
              </details>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
