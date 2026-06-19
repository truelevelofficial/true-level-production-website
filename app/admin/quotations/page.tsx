import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { inputClass } from "@/components/form-fields";
import { quotationStatusArabic, quotationStatuses } from "@/lib/constants";
import { getQuotations, getClients, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { QuotationActions } from "./quotation-actions";

export default async function QuotationsPage({ searchParams }: { searchParams: Promise<{ status?: string; clientId?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const [quotations, clients] = await Promise.all([getQuotations(), getClients()]);
  const filtered = quotations.filter((q) =>
    (!params.status || q.status === params.status) &&
    (!params.clientId || q.clientId === params.clientId)
  );
  const hasFilters = params.status || params.clientId;

  return (
    <AdminShell title="عروض الأسعار">
      {!hasDatabase() ? <SetupNotice /> : null}
      <div className="mb-6">
        <a className="mb-4 inline-flex rounded-full bg-[#0B7CFF] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-blue-500/20" href="/admin/quotations/new">إنشاء عرض سعر جديد</a>
      </div>
      <form className="no-print mb-8">
        <div className="flex flex-wrap gap-3">
          <select className={inputClass} defaultValue={params.status || ""} name="status">
            <option value="">كل الحالات</option>
            {quotationStatuses.map((s) => <option key={s} value={s}>{quotationStatusArabic[s]}</option>)}
          </select>
          <select className={inputClass} defaultValue={params.clientId || ""} name="clientId">
            <option value="">كل العملاء</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
          </select>
          <button className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.1em] text-white" type="submit">تصفية</button>
          {hasFilters ? <a className="rounded-full border border-[#06111F]/10 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.1em]" href="/admin/quotations">إعادة تعيين</a> : null}
        </div>
      </form>
      {filtered.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-[#06111F]/20 bg-white p-12 text-center">
          <p className="text-2xl font-black uppercase tracking-[-0.03em] text-[#06111F]/30">{hasFilters ? "لا توجد عروض أسعار تطابق الفلتر" : "لا توجد عروض أسعار بعد"}</p>
          <p className="mt-2 text-sm text-[#06111F]/40">{hasFilters ? "حاول تغيير الفلتر" : "أنشئ أول عرض سعر للبدء"}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[2rem] border border-[#06111F]/10 bg-white shadow-sm pb-32" dir="rtl">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/40">
                <th className="py-5 px-4">الرقم</th>
                <th className="py-5 px-4">العميل</th>
                <th className="py-5 px-4">المبلغ</th>
                <th className="py-5 px-4">الحالة</th>
                <th className="py-5 px-4">تاريخ الإنشاء</th>
                <th className="py-5 px-4">تاريخ الصلاحية</th>
                <th className="py-5 px-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr className="border-b border-[#06111F]/5" key={q.id}>
                  <td className="py-6 px-4 font-bold">{q.quotationNo || "---"}</td>
                  <td className="blur-sensitive py-6 px-4">{q.client?.fullName || "---"}</td>
                  <td className="blur-sensitive py-6 px-4 font-bold">{Number(q.grandTotal || q.totalAmount).toLocaleString()} EGP</td>
                  <td className="py-6 px-4"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${q.status === "ACCEPTED" ? "bg-green-100 text-green-700" : q.status === "REJECTED" || q.status === "EXPIRED" ? "bg-red-100 text-red-700" : q.status === "SENT" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{quotationStatusArabic[q.status]}</span></td>
                  <td className="py-6 px-4 text-[#06111F]/55">{new Date(q.createdAt).toLocaleDateString("ar-EG")}</td>
                  <td className="py-6 px-4 text-[#06111F]/55">{q.validUntil ? new Date(q.validUntil).toLocaleDateString("ar-EG") : "---"}</td>
                  <td className="py-6 px-4 overflow-visible"><QuotationActions quotation={q} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
