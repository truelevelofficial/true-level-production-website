import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { inputClass } from "@/components/form-fields";
import { quotationStatusArabic } from "@/lib/constants";
import { getClients, getCompanySettings, getQuotationById, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { QuotationForm } from "../quotation-form";

export default async function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [quotation, clients, settings] = await Promise.all([getQuotationById(id), getClients(), getCompanySettings()]);
  if (!quotation) return <AdminShell title="عرض السعر"><p className="text-center text-lg font-bold text-red-600">عرض السعر غير موجود</p></AdminShell>;

  const isEditable = quotation.status === "DRAFT";

  return (
    <AdminShell title={`عرض سعر ${quotation.quotationNo || ""}`}>
      <div className="mb-6">
        <a className="mb-4 inline-block text-sm font-bold text-[#0B7CFF]" href="/admin/quotations">← العودة إلى عروض الأسعار</a>
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black uppercase tracking-[-0.05em]">{quotation.quotationNo || "عرض سعر"}</h2>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${quotation.status === "ACCEPTED" ? "bg-green-100 text-green-700" : quotation.status === "REJECTED" || quotation.status === "EXPIRED" ? "bg-red-100 text-red-700" : quotation.status === "SENT" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{quotationStatusArabic[quotation.status]}</span>
        </div>
      </div>

      {!hasDatabase() ? <SetupNotice /> : null}

      {isEditable ? (
        <div className="mb-8 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
          <QuotationForm clients={clients} settings={settings} quotation={quotation} />
        </div>
      ) : (
        <div className="mb-8 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm" dir="rtl">
          <h3 className="mb-4 text-sm font-black uppercase tracking-[0.14em] text-[#06111F]/40">العميل</h3>
          <p className="text-lg font-black">{quotation.client?.fullName || "---"}</p>
          {quotation.client?.companyName ? <p className="text-sm text-[#06111F]/55">{quotation.client.companyName}</p> : null}
          <p className="text-sm text-[#06111F]/55">{quotation.client?.phone || "---"}</p>

          <h3 className="mb-4 mt-6 text-sm font-black uppercase tracking-[0.14em] text-[#06111F]/40">الخدمة</h3>
          {quotation.serviceType ? <p className="text-sm">{quotation.serviceType}</p> : null}

          <h3 className="mb-4 mt-6 text-sm font-black uppercase tracking-[0.14em] text-[#06111F]/40">البنود</h3>
          <div className="overflow-x-auto rounded-2xl border border-[#06111F]/10">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/40">
                  <th className="p-3">الوصف</th><th className="p-3">الكمية</th><th className="p-3">سعر الوحدة</th><th className="p-3">الخصم</th><th className="p-3">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {quotation.items.map((item: any) => (
                  <tr className="border-b border-[#06111F]/5" key={item.id}>
                    <td className="p-3 font-bold">{item.description}</td>
                    <td className="p-3">{Number(item.quantity)}</td>
                    <td className="p-3">{Number(item.unitPrice).toLocaleString()} EGP</td>
                    <td className="p-3">{Number(item.discount).toLocaleString()} EGP</td>
                    <td className="p-3 font-bold">{Number(item.total).toLocaleString()} EGP</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-[#06111F]/10 font-bold">
                  <td className="p-3" colSpan={4}>الإجمالي قبل الخصم</td>
                  <td className="p-3">{Number(quotation.totalAmount).toLocaleString()} EGP</td>
                </tr>
                <tr>
                  <td className="p-3" colSpan={4}>الخصم</td>
                  <td className="p-3">{Number(quotation.discount).toLocaleString()} EGP</td>
                </tr>
                {Number(quotation.taxRate) > 0 ? <tr>
                  <td className="p-3" colSpan={4}>الضريبة ({Number(quotation.taxRate)}%)</td>
                  <td className="p-3">{Number(quotation.taxAmount).toLocaleString()} EGP</td>
                </tr> : null}
                <tr className="border-t-2 border-[#06111F] text-lg font-black text-[#0B7CFF]">
                  <td className="p-3" colSpan={4}>الإجمالي النهائي</td>
                  <td className="p-3">{Number(quotation.grandTotal).toLocaleString()} EGP</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {quotation.notes ? <div className="mt-4"><h4 className="text-xs font-black uppercase text-[#06111F]/40">ملاحظات</h4><p className="text-sm">{quotation.notes}</p></div> : null}
          {quotation.terms ? <div className="mt-2"><h4 className="text-xs font-black uppercase text-[#06111F]/40">الشروط</h4><p className="text-sm">{quotation.terms}</p></div> : null}
          {quotation.validUntil ? <div className="mt-2"><h4 className="text-xs font-black uppercase text-[#06111F]/40">صلاحية العرض</h4><p className="text-sm">{new Date(quotation.validUntil).toLocaleDateString("ar-EG")}</p></div> : null}
        </div>
      )}
    </AdminShell>
  );
}
