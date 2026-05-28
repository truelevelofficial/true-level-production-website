import { AdminShell } from "@/components/admin-shell";
import { inputClass } from "@/components/form-fields";
import { invoiceStatusArabic, invoicePaymentStatusArabic, paymentMethodArabic } from "@/lib/constants";
import { getClients, getCompanySettings, getInvoiceById } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { InvoiceForm } from "../invoice-form";
import { InvoicePayments } from "../invoice-payments";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [invoice, clients, settings] = await Promise.all([getInvoiceById(id), getClients(), getCompanySettings()]);
  if (!invoice) return <AdminShell title="الفاتورة"><p className="text-center text-lg font-bold text-red-600">الفاتورة غير موجودة</p></AdminShell>;

  const isEditable = invoice.status === "DRAFT";

  return (
    <AdminShell title={`فاتورة ${invoice.invoiceNo}`}>
      <div className="mb-6">
        <a className="mb-4 inline-block text-sm font-bold text-[#0B7CFF]" href="/admin/accounting/invoices">← العودة إلى الفواتير</a>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black uppercase tracking-[-0.05em]">{invoice.invoiceNo}</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${invoice.status === "SENT" ? "bg-blue-100 text-blue-700" : invoice.status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{invoiceStatusArabic[invoice.status]}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${invoice.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : invoice.paymentStatus === "OVERDUE" ? "bg-red-100 text-red-700" : invoice.paymentStatus === "PARTIALLY_PAID" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{invoicePaymentStatusArabic[invoice.paymentStatus]}</span>
          </div>
        </div>
      </div>

      {isEditable ? (
        <div className="mb-8 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm">
          <InvoiceForm clients={clients} settings={settings} invoice={invoice} />
        </div>
      ) : (
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm lg:col-span-2" dir="rtl">
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.14em] text-[#06111F]/40">العميل</h3>
            <p className="text-lg font-black">{invoice.client.fullName}</p>
            {invoice.client.companyName ? <p className="text-sm text-[#06111F]/55">{invoice.client.companyName}</p> : null}
            <p className="text-sm text-[#06111F]/55">{invoice.client.phone}</p>
            {invoice.client.address ? <p className="text-sm text-[#06111F]/55">{invoice.client.address}</p> : null}

            <h3 className="mb-4 mt-6 text-sm font-black uppercase tracking-[0.14em] text-[#06111F]/40">بنود الفاتورة</h3>
            <div className="overflow-x-auto rounded-2xl border border-[#06111F]/10">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-[#06111F]/10 text-xs font-black uppercase tracking-[0.1em] text-[#06111F]/40">
                    <th className="p-3">الوصف</th><th className="p-3">الكمية</th><th className="p-3">سعر الوحدة</th><th className="p-3">الخصم</th><th className="p-3">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
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
                    <td className="p-3">{Number(invoice.subtotal).toLocaleString()} EGP</td>
                  </tr>
                  <tr>
                    <td className="p-3" colSpan={4}>الخصم</td>
                    <td className="p-3">{Number(invoice.discount).toLocaleString()} EGP</td>
                  </tr>
                  <tr>
                    <td className="p-3" colSpan={4}>الضريبة ({Number(invoice.taxRate)}%)</td>
                    <td className="p-3">{Number(invoice.taxAmount).toLocaleString()} EGP</td>
                  </tr>
                  <tr className="border-t-2 border-[#06111F] text-lg font-black text-[#0B7CFF]">
                    <td className="p-3" colSpan={4}>الإجمالي النهائي</td>
                    <td className="p-3">{Number(invoice.total).toLocaleString()} EGP</td>
                  </tr>
                  <tr>
                    <td className="p-3" colSpan={4}>المبلغ المدفوع</td>
                    <td className="p-3 text-green-600">{Number(invoice.paidAmount).toLocaleString()} EGP</td>
                  </tr>
                  <tr className="font-bold">
                    <td className="p-3" colSpan={4}>المبلغ المتبقي</td>
                    <td className={`p-3 ${Number(invoice.remainingAmount) > 0 ? "text-red-600" : "text-green-600"}`}>{Number(invoice.remainingAmount).toLocaleString()} EGP</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {invoice.notes ? <div className="mt-4"><h4 className="text-xs font-black uppercase text-[#06111F]/40">ملاحظات</h4><p className="text-sm">{invoice.notes}</p></div> : null}
            {invoice.terms ? <div className="mt-2"><h4 className="text-xs font-black uppercase text-[#06111F]/40">الشروط</h4><p className="text-sm">{invoice.terms}</p></div> : null}
          </div>
          <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm" dir="rtl">
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.14em] text-[#06111F]/40">المدفوعات</h3>
            <InvoicePayments invoiceId={invoice.id} payments={invoice.payments} />
          </div>
        </div>
      )}
    </AdminShell>
  );
}
