"use client";

import { Field, inputClass } from "./form-fields";

export function ContractFormFields({ defaultRep, defaultPaymentTerms, defaultCancellationPolicy, services }: { defaultRep: string; defaultPaymentTerms: string; defaultCancellationPolicy: string; services: readonly string[] }) {
  return (
    <div className="contract-form-fields grid gap-4 md:grid-cols-2" dir="rtl">
      <script dangerouslySetInnerHTML={{
        __html: `
        document.addEventListener("DOMContentLoaded", function() {
          var typeSelect = document.getElementById("contract-type-select");
          function toggleFields() {
            var val = typeSelect ? typeSelect.value : "";
            var groups = document.querySelectorAll("[data-contract-type]");
            groups.forEach(function(g) { g.style.display = "none"; });
            var show = document.querySelectorAll('[data-contract-type="' + val + '"], [data-contract-type="ALL"]');
            show.forEach(function(g) { g.style.display = "block"; });
          }
          if (typeSelect) { typeSelect.addEventListener("change", toggleFields); toggleFields(); }
        });
        `}} />
      <div data-contract-type="ALL">
        <Field label="نوع العقد">
          <select className={inputClass} id="contract-type-select" name="type">
            <option value="VIDEO_PRODUCTION">عقد إنتاج فيديو</option>
            <option value="UGC_CREATOR_CAMPAIGN">عقد حملة UGC</option>
            <option value="EVENT_COVERAGE">عقد تغطية فعالية</option>
            <option value="MONTHLY_CONTENT_MANAGEMENT">عقد إدارة محتوى شهري</option>
            <option value="STUDIO_RENTAL">عقد تأجير استوديو</option>
            <option value="GENERAL_SERVICE">عقد خدمات عام</option>
          </select>
        </Field>
      </div>
      <div data-contract-type="ALL">
        <Field label="الحالة">
          <select className={inputClass} name="status">
            <option value="DRAFT">مسودة</option>
            <option value="SENT">مرسل</option>
            <option value="SIGNED">موقع</option>
            <option value="CANCELLED">ملغي</option>
          </select>
        </Field>
      </div>
      <div data-contract-type="ALL"><Field label="اسم العميل"><input className={inputClass} name="clientName" required /></Field></div>
      <div data-contract-type="ALL"><Field label="اسم الشركة"><input className={inputClass} name="clientCompanyName" /></Field></div>
      <div data-contract-type="ALL"><Field label="الرقم القومي أو البطاقة الضريبية"><input className={inputClass} name="clientTaxId" /></Field></div>
      <div data-contract-type="ALL"><Field label="عنوان العميل"><input className={inputClass} name="clientAddress" /></Field></div>
      <div data-contract-type="ALL"><Field label="رقم الهاتف"><input className={inputClass} name="clientPhone" required /></Field></div>
      <div data-contract-type="ALL"><Field label="البريد الإلكتروني"><input className={inputClass} name="clientEmail" required type="email" /></Field></div>
      <div data-contract-type="ALL"><Field label="ممثل True Level"><input className={inputClass} defaultValue={defaultRep} name="representativeName" required /></Field></div>

      {/* All types get these base service fields */}
      <div data-contract-type="ALL"><Field label="نوع الخدمة"><select className={inputClass} name="serviceType">{services.map((s) => <option key={s}>{s}</option>)}</select></Field></div>
      <div data-contract-type="ALL"><Field label="وصف المشروع"><textarea className={inputClass} name="projectDescription" required /></Field></div>
      <div data-contract-type="ALL"><Field label="البنود والتسليمات"><textarea className={inputClass} name="deliverables" required /></Field></div>
      <div data-contract-type="ALL"><Field label="تاريخ بداية المشروع"><input className={inputClass} name="projectStartDate" required type="date" /></Field></div>
      <div data-contract-type="ALL"><Field label="تاريخ نهاية المشروع"><input className={inputClass} name="projectEndDate" required type="date" /></Field></div>
      <div data-contract-type="ALL"><Field label="تاريخ التصوير/التنفيذ"><input className={inputClass} name="shootingDate" required type="date" /></Field></div>
      <div data-contract-type="ALL"><Field label="مكان التنفيذ"><input className={inputClass} name="location" required /></Field></div>
      <div data-contract-type="ALL"><Field label="إجمالي السعر"><input className={inputClass} name="totalPrice" required type="number" /></Field></div>
      <div data-contract-type="ALL"><Field label="الدفعة المقدمة"><input className={inputClass} name="depositAmount" required type="number" /></Field></div>
      <div data-contract-type="ALL"><Field label="المبلغ المتبقي"><input className={inputClass} name="remainingAmount" required type="number" /></Field></div>
      <div data-contract-type="ALL"><Field label="مدة التسليم"><textarea className={inputClass} name="deliveryTimeline" required /></Field></div>
      <div data-contract-type="ALL"><Field label="شروط الدفع"><textarea className={inputClass} defaultValue={defaultPaymentTerms} name="paymentTerms" required /></Field></div>
      <div data-contract-type="ALL"><Field label="عدد التعديلات"><input className={inputClass} defaultValue="2" name="revisionRounds" required type="number" /></Field></div>
      <div data-contract-type="ALL"><Field label="سياسة الإلغاء"><textarea className={inputClass} defaultValue={defaultCancellationPolicy} name="cancellationPolicy" required /></Field></div>
      <div data-contract-type="ALL"><Field label="حقوق الاستخدام"><textarea className={inputClass} name="usageRights" required /></Field></div>
      <div data-contract-type="ALL"><Field label="السرية"><textarea className={inputClass} name="confidentialityClause" required /></Field></div>
      <div data-contract-type="ALL"><Field label="التأخير في الدفع"><textarea className={inputClass} name="latePaymentClause" required /></Field></div>
      <div data-contract-type="ALL"><Field label="ملاحظات إضافية"><textarea className={inputClass} name="additionalNotes" /></Field></div>
      <div data-contract-type="ALL"><Field label="تعديل نص العقد قبل الحفظ"><textarea className={inputClass} name="bodyOverride" rows={8} placeholder="اختياري: اتركه فارغا ليتم توليد المسودة تلقائيا من القالب." /></Field></div>

      {/* VIDEO_PRODUCTION specific */}
      <div data-contract-type="VIDEO_PRODUCTION">
        <div className="md:col-span-2"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">خيارات إنتاج الفيديو</p></div>
      </div>
      <div data-contract-type="VIDEO_PRODUCTION"><Field label="عدد الفيديوهات"><input className={inputClass} defaultValue="1" min="1" name="numberOfVideos" type="number" /></Field></div>
      <div data-contract-type="VIDEO_PRODUCTION"><Field label="مدة الفيديو"><input className={inputClass} name="videoDuration" placeholder="مثال: 30-60 ثانية لكل فيديو" /></Field></div>
      <div data-contract-type="VIDEO_PRODUCTION"><Field label="المنصات المستهدفة"><input className={inputClass} name="platforms" placeholder="مثال: Instagram, TikTok, YouTube" /></Field></div>
      <div data-contract-type="VIDEO_PRODUCTION"><Field label="تسليم ملفات RAW"><select className={inputClass} name="rawFilesIncluded"><option value="">لا</option><option value="نعم">نعم</option></select></Field></div>

      {/* UGC_CREATOR_CAMPAIGN specific */}
      <div data-contract-type="UGC_CREATOR_CAMPAIGN">
        <div className="md:col-span-2"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">خيارات حملة UGC</p></div>
      </div>
      <div data-contract-type="UGC_CREATOR_CAMPAIGN"><Field label="عدد صناع المحتوى"><input className={inputClass} defaultValue="1" min="1" name="numberOfCreators" type="number" /></Field></div>
      <div data-contract-type="UGC_CREATOR_CAMPAIGN"><Field label="المنصات"><input className={inputClass} name="platforms" placeholder="مثال: TikTok, Instagram" /></Field></div>
      <div data-contract-type="UGC_CREATOR_CAMPAIGN"><Field label="مدة استخدام المحتوى"><input className={inputClass} name="usagePeriod" placeholder="مثال: 6 أشهر" /></Field></div>
      <div data-contract-type="UGC_CREATOR_CAMPAIGN"><Field label="حقوق إعادة النشر"><input className={inputClass} name="repostingRights" placeholder="مثال: يحق للعميل إعادة النشر فقط" /></Field></div>
      <div data-contract-type="UGC_CREATOR_CAMPAIGN"><Field label="تسليم المنتج للصناع"><textarea className={inputClass} name="productDelivery" placeholder="تفاصيل شحن المنتجات للصناع" /></Field></div>

      {/* EVENT_COVERAGE specific */}
      <div data-contract-type="EVENT_COVERAGE">
        <div className="md:col-span-2"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">خيارات تغطية الفعالية</p></div>
      </div>
      <div data-contract-type="EVENT_COVERAGE"><Field label="اسم الفعالية"><input className={inputClass} name="eventName" required /></Field></div>
      <div data-contract-type="EVENT_COVERAGE"><Field label="المكان"><input className={inputClass} name="venue" placeholder="اسم المكان أو القاعة" /></Field></div>
      <div data-contract-type="EVENT_COVERAGE"><Field label="عدد ساعات التغطية"><input className={inputClass} defaultValue="4" min="1" name="coverageHours" type="number" /></Field></div>
      <div data-contract-type="EVENT_COVERAGE"><Field label="عدد أفراد الفريق"><input className={inputClass} defaultValue="2" min="1" name="teamSize" type="number" /></Field></div>

      {/* MONTHLY_CONTENT_MANAGEMENT specific */}
      <div data-contract-type="MONTHLY_CONTENT_MANAGEMENT">
        <div className="md:col-span-2"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">خيارات إدارة المحتوى الشهري</p></div>
      </div>
      <div data-contract-type="MONTHLY_CONTENT_MANAGEMENT"><Field label="عدد الريلاتس شهريا"><input className={inputClass} defaultValue="4" min="0" name="numberOfReels" type="number" /></Field></div>
      <div data-contract-type="MONTHLY_CONTENT_MANAGEMENT"><Field label="عدد المنشورات شهريا"><input className={inputClass} defaultValue="8" min="0" name="numberOfPosts" type="number" /></Field></div>
      <div data-contract-type="MONTHLY_CONTENT_MANAGEMENT"><Field label="التسليمات الشهرية التفصيلية"><textarea className={inputClass} name="monthlyDeliverables" placeholder="مثال: 4 ريلاتس + 8 بوستات + تقويم محتوى" /></Field></div>
      <div data-contract-type="MONTHLY_CONTENT_MANAGEMENT"><Field label="يشمل النشر"><select className={inputClass} name="postingIncluded"><option value="">لا</option><option value="نعم">نعم</option></select></Field></div>
      <div data-contract-type="MONTHLY_CONTENT_MANAGEMENT"><Field label="يشمل الميزانية الإعلانية"><select className={inputClass} name="mediaBuyingIncluded"><option value="">لا</option><option value="نعم">نعم</option></select></Field></div>
      <div data-contract-type="MONTHLY_CONTENT_MANAGEMENT"><Field label="الرسوم الشهرية"><input className={inputClass} name="monthlyFee" type="number" placeholder="إذا كانت مختلفة عن السعر الإجمالي" /></Field></div>

      {/* STUDIO_RENTAL specific */}
      <div data-contract-type="STUDIO_RENTAL">
        <div className="md:col-span-2"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">خيارات تأجير الاستوديو</p></div>
      </div>
      <div data-contract-type="STUDIO_RENTAL"><Field label="المنصات"><input className={inputClass} name="platforms" placeholder="اختياري" /></Field></div>

      {/* GENERAL_SERVICE specific */}
      <div data-contract-type="GENERAL_SERVICE">
        <div className="md:col-span-2"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">خدمات عامة</p></div>
      </div>

      <div className="md:col-span-2" data-contract-type="ALL">
        <button className="rounded-full bg-[#0B7CFF] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-blue-500/20">حفظ مسودة</button>
      </div>
    </div>
  );
}
