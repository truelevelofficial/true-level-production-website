import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { inputClass } from "@/components/form-fields";
import { invoiceStatusArabic, invoicePaymentStatusArabic, invoiceStatuses, invoicePaymentStatuses } from "@/lib/constants";
import { getClients, getInvoices, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { InvoiceActions } from "./invoice-actions";

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ clientId?: string; status?: string; paymentStatus?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const [invoices, clients] = await Promise.all([getInvoices(), getClients()]);
  const hasFilters = params.clientId || params.status || params.paymentStatus;
  const filtered = invoices.filter((inv) =>
    (!params.clientId || inv.clientId === params.clientId) &&
    (!params.status || inv.status === params.status) &&
    (!params.paymentStatus || inv.paymentStatus === params.paymentStatus)
  );
  return (
    <AdminShell title="الفواتير">
      {!hasDatabase() ? <SetupNotice /> : null}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase tracking-[-0.05em]">الفواتير</h2>
        <a className="rounded-full bg-[#0B7CFF] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-blue-500/20" href="/admin/accounting/invoices/new">إنشاء فاتورة</a>
      </div>
      <form className="mb-6 rounded-[2rem] border border-[#06111F]/10 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <select className={`${inputClass} flex-1`} defaultValue={params.clientId || ""} name="clientId"><option value="">كل العملاء</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}</select>
          <select className={`${inputClass} flex-1`} defaultValue={params.status || ""} name="status"><option value="">كل الحالات</option>{invoiceStatuses.map((s) => <option key={s} value={s}>{invoiceStatusArabic[s]}</option>)}</select>
          <select className={`${inputClass} flex-1`} defaultValue={params.paymentStatus || ""} name="paymentStatus"><option value="">حالة الدفع</option>{invoicePaymentStatuses.map((s) => <option key={s} value={s}>{invoicePaymentStatusArabic[s]}</option>)}</select>
          <button className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">تصفية</button>
          <a className="rounded-full border border-[#06111F]/10 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]" href="/admin/accounting/invoices">إعادة تعيين</a>
        </div>
      </form>
      {filtered.length === 0 ? (
        <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-10 text-center shadow-sm" dir="rtl">
          <h2 className="text-2xl font-black uppercase tracking-[-0.05em]">لا توجد فواتير</h2>
          <p className="mt-2 text-sm text-[#06111F]/55">{hasFilters ? "لا توجد نتائج تطابق التصفية." : "لا توجد فواتير حتى الآن. أنشئ أول فاتورة لعميل."}</p>
          {hasFilters ? <a className="mt-4 inline-block rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white" href="/admin/accounting/invoices">إعادة تعيين</a> : null}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[2rem] border border-[#06111F]/10 bg-white shadow-sm" dir="rtl">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
                <th className="p-3">رقم الفاتورة</th><th className="p-3">التاريخ</th><th className="p-3">العميل</th><th className="p-3">الإجمالي</th><th className="p-3">المدفوع</th><th className="p-3">المتبقي</th><th className="p-3">الحالة</th><th className="p-3">حالة الدفع</th><th className="p-3">تاريخ الاستحقاق</th><th className="p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr className="border-b border-[#06111F]/5 transition hover:bg-[#F7F8FB]" key={inv.id}>
                  <td className="p-3 font-black text-[#06111F]">{inv.invoiceNo}</td>
                  <td className="p-3 text-[#06111F]/65">{new Date(inv.invoiceDate).toLocaleDateString("ar-EG")}</td>
                  <td className="blur-sensitive p-3 text-[#06111F]/65">{inv.client?.fullName || "بدون"}</td>
                  <td className="blur-sensitive p-3 font-black text-[#06111F]">{Number(inv.total).toLocaleString()} EGP</td>
                  <td className="blur-sensitive p-3 text-[#06111F]/65">{Number(inv.paidAmount).toLocaleString()} EGP</td>
                  <td className="blur-sensitive p-3 font-bold">{Number(inv.remainingAmount) > 0 ? <span className="text-red-600">{Number(inv.remainingAmount).toLocaleString()} EGP</span> : <span className="text-green-600">0</span>}</td>
                  <td className="p-3"><span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${inv.status === "SENT" ? "bg-blue-100 text-blue-700" : inv.status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{invoiceStatusArabic[inv.status]}</span></td>
                  <td className="p-3"><span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${inv.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : inv.paymentStatus === "OVERDUE" ? "bg-red-100 text-red-700" : inv.paymentStatus === "PARTIALLY_PAID" ? "bg-blue-100 text-blue-700" : inv.paymentStatus === "REFUNDED" ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"}`}>{invoicePaymentStatusArabic[inv.paymentStatus]}</span></td>
                  <td className="p-3 text-[#06111F]/65">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("ar-EG") : "-"}</td>
                  <td className="p-3"><InvoiceActions invoiceId={inv.id} status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
