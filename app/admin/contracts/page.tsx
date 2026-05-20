import { AdminShell, SetupNotice } from "@/components/admin-shell";
import { Field, inputClass } from "@/components/form-fields";
import { createContractAction } from "@/lib/actions";
import { contractStatusArabic, contractStatuses, contractTypes, services } from "@/lib/constants";
import { getBookings, getClients, getCompanySettings, getContracts, hasDatabase } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export default async function ContractsPage({ searchParams }: { searchParams: Promise<{ status?: string; clientId?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const [contracts, clients, bookings, settings] = await Promise.all([getContracts(), getClients(), getBookings(), getCompanySettings()]);
  const filtered = contracts.filter((contract) => (!params.status || contract.status === params.status) && (!params.clientId || contract.clientId === params.clientId));
  return (
    <AdminShell title="العقود">
      {!hasDatabase() ? <SetupNotice /> : null}
      <p className="mb-6 rounded-2xl bg-white p-4 text-sm font-bold leading-7 text-[#06111F]/55" dir="rtl">هذه المسودة نموذج مبدئي قابل للتعديل ولا تعتبر بديلا عن مراجعة محام متخصص. يجب مراجعة العقد قانونيا قبل التوقيع أو الاستخدام الرسمي.</p>

      <form action={createContractAction} className="grid gap-4 rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm md:grid-cols-2" dir="rtl">
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
        <div className="md:col-span-2"><button className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">حفظ مسودة</button></div>
      </form>

      <form className="mt-6 grid gap-3 rounded-[2rem] border border-[#06111F]/10 bg-white p-4 shadow-sm md:grid-cols-3" dir="rtl">
        <select className={inputClass} defaultValue={params.status || ""} name="status"><option value="">كل الحالات</option>{contractStatuses.map((status) => <option key={status} value={status}>{contractStatusArabic[status]}</option>)}</select>
        <select className={inputClass} defaultValue={params.clientId || ""} name="clientId"><option value="">كل العملاء</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select>
        <button className="rounded-full bg-[#06111F] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">تصفية</button>
      </form>

      <div className="mt-6 grid gap-4">
        {filtered.length === 0 ? <p className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 text-sm font-bold text-[#06111F]/55 shadow-sm" dir="rtl">لا توجد عقود حتى الآن.</p> : null}
        {filtered.map((contract) => <article className="rounded-[2rem] border border-[#06111F]/10 bg-white p-6 shadow-sm" key={contract.id} dir="rtl">
          <p className="text-sm font-bold text-[#0B7CFF]">{contractStatusArabic[contract.status]}</p>
          <h2 className="mt-2 text-2xl font-black">{contract.title}</h2>
          <p className="mt-1 text-sm text-[#06111F]/55">{contract.client?.fullName || "بدون عميل"}</p>
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-[#F7F8FB] p-4 text-sm leading-7 text-[#06111F]/70">{contract.body}</pre>
          <div className="mt-4 flex flex-wrap gap-3">
            <a className="rounded-full bg-[#0B7CFF] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white" href={`/admin/export/contract/${contract.id}`}>تصدير Word</a>
            <span className="rounded-full border border-[#06111F]/10 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#06111F]/45">تصدير PDF من Print في المتصفح</span>
          </div>
        </article>)}
      </div>
    </AdminShell>
  );
}
