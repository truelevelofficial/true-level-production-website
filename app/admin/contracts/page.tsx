import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { Field, inputClass } from "@/components/form-fields";
import { createContractAction, deleteContractAction, updateContractAction } from "@/lib/actions";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { contractStatusArabic, contractStatuses, contractTypes, services } from "@/lib/constants";
import { getBookings, getClients, getCompanySettings, getContracts, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { ContractPreview } from "@/components/contract-preview";
import { PrintButton } from "@/components/print-button";

export default async function ContractsPage({ searchParams }: { searchParams: Promise<{ status?: string; clientId?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const [contracts, clients, bookings, settings] = await Promise.all([getContracts(), getClients(), getBookings(), getCompanySettings()]);
  const hasFilters = params.status || params.clientId;
  const filtered = contracts.filter((contract) => (!params.status || contract.status === params.status) && (!params.clientId || contract.clientId === params.clientId));
  return (
    <AdminShell title="العقود">
      {!hasDatabase() ? <SetupNotice /> : null}

      <style>{`
@media print {
  .no-print { display: none !important; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`}</style>

      <details className="no-print mb-6 rounded-[2rem] border border-[#06111F]/10 bg-white shadow-sm">
        <summary className="cursor-pointer p-6 text-sm font-black uppercase tracking-[0.14em] text-[#0B7CFF]">إنشاء عقد جديد</summary>
        <div className="px-6 pb-6">
          <form action={createContractAction} className="grid gap-4 md:grid-cols-2" dir="rtl">
            <div className="md:col-span-2">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">إنشاء مسودات العقود</p>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em]">إنشاء العقد</h2>
            </div>
            <Field label="نوع العقد"><select className={inputClass} name="type">{contractTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
            <Field label="الحالة"><select className={inputClass} name="status">{contractStatuses.map((status) => <option key={status} value={status}>{contractStatusArabic[status]}</option>)}</select></Field>
            <Field label="إنشاء من عميل"><select className={inputClass} name="clientPicker"><option value="">اختياري</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.fullName} - {client.email}</option>)}</select></Field>
            <Field label="إنشاء من حجز"><select className={inputClass} name="bookingPicker"><option value="">اختياري</option>{bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.client.fullName} - {booking.type}</option>)}</select></Field>
            <Field label="اسم العميل"><input className={inputClass} name="clientName" required /></Field>
            <Field label="اسم الشركة"><input className={inputClass} name="clientCompanyName" /></Field>
            <Field label="الرقم القومي أو البطاقة الضريبية"><input className={inputClass} name="clientTaxId" /></Field>
            <Field label="عنوان العميل"><input className={inputClass} name="clientAddress" /></Field>
            <Field label="رقم الهاتف"><input className={inputClass} name="clientPhone" required /></Field>
            <Field label="البريد الإلكتروني"><input className={inputClass} name="clientEmail" required type="email" /></Field>
            <Field label="ممثل True Level"><input className={inputClass} defaultValue={settings.defaultContractRepresentative || ""} name="representativeName" required /></Field>
            <Field label="نوع الخدمة"><select className={inputClass} name="serviceType">{services.map((service) => <option key={service}>{service}</option>)}</select></Field>
            <Field label="تاريخ بداية المشروع"><input className={inputClass} name="projectStartDate" required type="date" /></Field>
            <Field label="تاريخ نهاية المشروع"><input className={inputClass} name="projectEndDate" required type="date" /></Field>
            <Field label="تاريخ التصوير"><input className={inputClass} name="shootingDate" required type="date" /></Field>
            <Field label="مكان التنفيذ"><input className={inputClass} name="location" required /></Field>
            <Field label="إجمالي السعر"><input className={inputClass} name="totalPrice" required type="number" /></Field>
            <Field label="الدفعة المقدمة"><input className={inputClass} name="depositAmount" required type="number" /></Field>
            <Field label="المبلغ المتبقي"><input className={inputClass} name="remainingAmount" required type="number" /></Field>
            <Field label="عدد التعديلات"><input className={inputClass} defaultValue="2" name="revisionRounds" required type="number" /></Field>
            <Field label="وصف المشروع"><textarea className={inputClass} name="projectDescription" required /></Field>
            <Field label="البنود والتسليمات"><textarea className={inputClass} name="deliverables" required /></Field>
            <Field label="شروط الدفع"><textarea className={inputClass} defaultValue={settings.defaultPaymentTerms || ""} name="paymentTerms" required /></Field>
            <Field label="سياسة الإلغاء"><textarea className={inputClass} defaultValue={settings.defaultCancellationPolicy || ""} name="cancellationPolicy" required /></Field>
            <Field label="مدة التسليم"><textarea className={inputClass} name="deliveryTimeline" required /></Field>
            <Field label="حقوق الاستخدام"><textarea className={inputClass} name="usageRights" required /></Field>
            <Field label="السرية"><textarea className={inputClass} name="confidentialityClause" required /></Field>
            <Field label="التأخير في الدفع"><textarea className={inputClass} name="latePaymentClause" required /></Field>
            <Field label="ملاحظات إضافية"><textarea className={inputClass} name="additionalNotes" /></Field>
            <Field label="تعديل نص العقد قبل الحفظ"><textarea className={inputClass} name="bodyOverride" rows={8} placeholder="اختياري: اتركه فارغا ليتم توليد المسودة تلقائيا من القالب." /></Field>
            <div className="md:col-span-2"><button className="rounded-full bg-[#0B7CFF] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-blue-500/20">حفظ مسودة</button></div>
          </form>
        </div>
      </details>

      <form className="no-print mb-6 rounded-[2rem] border border-[#06111F]/10 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <select className={`${inputClass} flex-1`} defaultValue={params.status || ""} name="status"><option value="">كل الحالات</option>{contractStatuses.map((status) => <option key={status} value={status}>{contractStatusArabic[status]}</option>)}</select>
          <select className={`${inputClass} flex-1`} defaultValue={params.clientId || ""} name="clientId"><option value="">كل العملاء</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select>
          <button className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">تصفية</button>
          <a className="rounded-full border border-[#06111F]/10 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]" href="/admin/contracts">إعادة تعيين</a>
        </div>
      </form>

      {filtered.length === 0 ? (
        <div className="rounded-[2rem] border border-[#06111F]/10 bg-white p-10 text-center shadow-sm" dir="rtl">
          <h2 className="text-2xl font-black uppercase tracking-[-0.05em]">لا توجد عقود</h2>
          <p className="mt-2 text-sm text-[#06111F]/55">{hasFilters ? "لا توجد عقود تطابق التصفية." : "لم يتم إنشاء أي عقود بعد. اضغط على 'إنشاء عقد جديد' أعلاه."}</p>
          {hasFilters ? <a className="mt-4 inline-block rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white" href="/admin/contracts">إعادة تعيين</a> : null}
        </div>
      ) : (
        <div className="grid gap-6">
          {filtered.map((contract) => (
            <details className="rounded-[2rem] border border-[#06111F]/10 bg-white shadow-sm" key={contract.id}>
              <summary className="no-print flex cursor-pointer flex-wrap items-center gap-4 p-6 transition hover:bg-[#F7F8FB]">
                <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${contract.status === "SIGNED" ? "bg-green-100 text-green-700" : contract.status === "SENT" ? "bg-blue-100 text-blue-700" : contract.status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{contractStatusArabic[contract.status]}</span>
                <h2 className="text-xl font-black">{contract.title}</h2>
                <p className="text-sm text-[#06111F]/55">{contract.client?.fullName || "بدون عميل"}</p>
                <p className="mr-auto text-xs text-[#06111F]/40">{new Date(contract.createdAt).toLocaleDateString("ar-EG")}</p>
              </summary>
              <div className="px-6 pb-6">
                <div className="no-print mb-6 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-[#06111F]/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]/45">
                    {contract.totalPrice ? `قيمة العقد: ${Number(contract.totalPrice).toLocaleString("ar-EG")} EGP` : ""}
                  </span>
                  <form action={updateContractAction} className="flex flex-wrap gap-2">
                    <input name="contractId" type="hidden" value={contract.id} />
                    <input name="body" type="hidden" value={contract.body} />
                    <button className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white" name="status" value="SENT">تحديد كمرسل</button>
                    <button className="rounded-full bg-green-600 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white" name="status" value="SIGNED">تحديد كموقع</button>
                    <button className="rounded-full bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white" name="status" value="CANCELLED">إلغاء</button>
                  </form>
                  <details className="relative inline-block">
                    <summary className="cursor-pointer rounded-full border border-[#06111F]/10 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]/60">تعديل النص</summary>
                    <div className="absolute left-0 top-full z-10 mt-2 w-[600px] max-w-[90vw] rounded-2xl border border-[#06111F]/10 bg-white p-4 shadow-xl">
                      <form action={updateContractAction} className="grid gap-3">
                        <input name="contractId" type="hidden" value={contract.id} />
                        <textarea className={inputClass} defaultValue={contract.body} name="body" rows={12} style={{ direction: "rtl", fontSize: 13, lineHeight: 1.7 }} />
                        <button className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white" type="submit">حفظ التعديلات</button>
                      </form>
                    </div>
                  </details>
                  <a className="rounded-full bg-[#06111F] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white" href={`/admin/export/contract/${contract.id}`}>تصدير Word</a>
                  <PrintButton />
                  <form action={deleteContractAction}>
                    <input name="contractId" type="hidden" value={contract.id} />
                    <ConfirmSubmit message="Are you sure you want to delete this contract? This action cannot be undone.">حذف</ConfirmSubmit>
                  </form>
                </div>

                <ContractPreview
                  body={contract.body}
                  clientName={contract.client?.fullName || ""}
                  clientCompanyName={contract.client?.companyName}
                  status={contract.status}
                  title={contract.title}
                  totalPrice={contract.totalPrice ? Number(contract.totalPrice).toLocaleString("ar-EG") : null}
                  contractNumber={contract.id.slice(0, 8).toUpperCase()}
                  createdAt={contract.createdAt.toISOString()}
                />
              </div>
            </details>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
