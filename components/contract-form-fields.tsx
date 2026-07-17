"use client";

import { useTransition, useState, useEffect, useRef } from "react";
import { Field, inputClass } from "./form-fields";
import { createContractAction } from "@/lib/actions";

export function ContractFormFields({ defaultRep, defaultPaymentTerms, defaultCancellationPolicy, services }: { defaultRep: string; defaultPaymentTerms: string; defaultCancellationPolicy: string; services: readonly string[] }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(null);
  const [contractType, setContractType] = useState("VIDEO_PRODUCTION");
  const msgRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (result && msgRef.current) {
      msgRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [result]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setResult(null);
    startTransition(async () => {
      const res = await createContractAction(formData);
      setResult(res);
      if (res?.success) {
        formRef.current?.reset();
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="contract-form-fields grid gap-4 md:grid-cols-2" dir="rtl">
      <div ref={msgRef} className="md:col-span-2">
        {result?.error ? <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700" role="alert">{result.error}</p> : null}
        {result?.success ? <p className="rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700" role="status">{result.success}</p> : null}
      </div>

      <div className="md:col-span-2">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">إنشاء مسودات العقود</p>
        <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em]">إنشاء العقد</h2>
      </div>

      <div>
        <Field label="نوع العقد">
          <select className={inputClass} name="type" value={contractType} onChange={(e) => setContractType(e.target.value)}>
            <option value="VIDEO_PRODUCTION">عقد إنتاج فيديو</option>
            <option value="UGC_CREATOR_CAMPAIGN">عقد حملة UGC</option>
            <option value="EVENT_COVERAGE">عقد تغطية فعالية</option>
            <option value="MONTHLY_CONTENT_MANAGEMENT">عقد إدارة محتوى شهري</option>
            <option value="STUDIO_RENTAL">عقد تأجير استوديو</option>
            <option value="CONTENT_CREATORS_NDA">اتفاقية سرية وملكية فكرية (NDA)</option>
            <option value="CONTENT_CREATORS">عقد صناع المحتوى</option>
            <option value="GENERAL_SERVICE">عقد خدمات عام</option>
          </select>
        </Field>
      </div>
      <div>
        <Field label="الحالة">
          <select className={inputClass} name="status">
            <option value="DRAFT">مسودة</option>
            <option value="SENT">مرسل</option>
            <option value="SIGNED">موقع</option>
            <option value="CANCELLED">ملغي</option>
          </select>
        </Field>
      </div>
      <div><Field label="اسم العميل"><input className={inputClass} name="clientName" required /></Field></div>
      <div><Field label="اسم الشركة"><input className={inputClass} name="clientCompanyName" /></Field></div>
      <div><Field label="الرقم القومي أو البطاقة الضريبية"><input className={inputClass} name="clientTaxId" /></Field></div>
      <div><Field label="عنوان العميل"><input className={inputClass} name="clientAddress" /></Field></div>
      <div><Field label="رقم الهاتف"><input className={inputClass} name="clientPhone" required /></Field></div>
      <div><Field label="البريد الإلكتروني"><input className={inputClass} name="clientEmail" required type="email" /></Field></div>
      <div><Field label="ممثل True Level"><input className={inputClass} defaultValue={defaultRep} name="representativeName" required /></Field></div>

      <div><Field label="نوع الخدمة"><select className={inputClass} name="serviceType">{services.map((s) => <option key={s}>{s}</option>)}</select></Field></div>
      <div><Field label="وصف المشروع"><textarea className={inputClass} name="projectDescription" required /></Field></div>
      <div><Field label="البنود والتسليمات"><textarea className={inputClass} name="deliverables" required /></Field></div>
      <div><Field label="تاريخ بداية المشروع"><input className={inputClass} name="projectStartDate" required type="date" /></Field></div>
      <div><Field label="تاريخ نهاية المشروع"><input className={inputClass} name="projectEndDate" required type="date" /></Field></div>
      <div><Field label="تاريخ التصوير/التنفيذ"><input className={inputClass} name="shootingDate" required type="date" /></Field></div>
      <div><Field label="مكان التنفيذ"><input className={inputClass} name="location" required /></Field></div>
      <div><Field label="إجمالي السعر"><input className={inputClass} name="totalPrice" required type="number" step="0.01" /></Field></div>
      <div><Field label="الدفعة المقدمة"><input className={inputClass} name="depositAmount" required type="number" step="0.01" /></Field></div>
      <div><Field label="المبلغ المتبقي"><input className={inputClass} name="remainingAmount" required type="number" step="0.01" /></Field></div>
      <div><Field label="مدة التسليم"><textarea className={inputClass} name="deliveryTimeline" required /></Field></div>
      <div><Field label="شروط الدفع"><textarea className={inputClass} defaultValue={defaultPaymentTerms} name="paymentTerms" required /></Field></div>
      <div><Field label="عدد التعديلات"><input className={inputClass} defaultValue="2" name="revisionRounds" required type="number" /></Field></div>
      <div><Field label="سياسة الإلغاء"><textarea className={inputClass} defaultValue={defaultCancellationPolicy} name="cancellationPolicy" required /></Field></div>
      <div><Field label="حقوق الاستخدام"><textarea className={inputClass} name="usageRights" required /></Field></div>
      <div><Field label="السرية"><textarea className={inputClass} name="confidentialityClause" required /></Field></div>
      <div><Field label="التأخير في الدفع"><textarea className={inputClass} name="latePaymentClause" required /></Field></div>
      <div><Field label="ملاحظات إضافية"><textarea className={inputClass} name="additionalNotes" /></Field></div>
      <div><Field label="تعديل نص العقد قبل الحفظ"><textarea className={inputClass} name="bodyOverride" rows={8} placeholder="اختياري: اتركه فارغا ليتم توليد المسودة تلقائيا من القالب." /></Field></div>

      {contractType === "VIDEO_PRODUCTION" && <>
        <div className="md:col-span-2"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">خيارات إنتاج الفيديو</p></div>
        <div><Field label="عدد الفيديوهات"><input className={inputClass} defaultValue="1" min="1" name="numberOfVideos" type="number" /></Field></div>
        <div><Field label="مدة الفيديو"><input className={inputClass} name="videoDuration" placeholder="مثال: 30-60 ثانية لكل فيديو" /></Field></div>
        <div><Field label="المنصات المستهدفة"><input className={inputClass} name="platforms" placeholder="مثال: Instagram, TikTok, YouTube" /></Field></div>
        <div><Field label="تسليم ملفات RAW"><select className={inputClass} name="rawFilesIncluded"><option value="">لا</option><option value="نعم">نعم</option></select></Field></div>
      </>}

      {contractType === "UGC_CREATOR_CAMPAIGN" && <>
        <div className="md:col-span-2"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">خيارات حملة UGC</p></div>
        <div><Field label="عدد صناع المحتوى"><input className={inputClass} defaultValue="1" min="1" name="numberOfCreators" type="number" /></Field></div>
        <div><Field label="المنصات"><input className={inputClass} name="platforms" placeholder="مثال: TikTok, Instagram" /></Field></div>
        <div><Field label="مدة استخدام المحتوى"><input className={inputClass} name="usagePeriod" placeholder="مثال: 6 أشهر" /></Field></div>
        <div><Field label="حقوق إعادة النشر"><input className={inputClass} name="repostingRights" placeholder="مثال: يحق للعميل إعادة النشر فقط" /></Field></div>
        <div><Field label="تسليم المنتج للصناع"><textarea className={inputClass} name="productDelivery" placeholder="تفاصيل شحن المنتجات للصناع" /></Field></div>
      </>}

      {contractType === "EVENT_COVERAGE" && <>
        <div className="md:col-span-2"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">خيارات تغطية الفعالية</p></div>
        <div><Field label="اسم الفعالية"><input className={inputClass} name="eventName" required /></Field></div>
        <div><Field label="المكان"><input className={inputClass} name="venue" placeholder="اسم المكان أو القاعة" /></Field></div>
        <div><Field label="عدد ساعات التغطية"><input className={inputClass} defaultValue="4" min="1" name="coverageHours" type="number" /></Field></div>
        <div><Field label="عدد أفراد الفريق"><input className={inputClass} defaultValue="2" min="1" name="teamSize" type="number" /></Field></div>
      </>}

      {contractType === "MONTHLY_CONTENT_MANAGEMENT" && <>
        <div className="md:col-span-2"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">خيارات إدارة المحتوى الشهري</p></div>
        <div><Field label="عدد الريلاتس شهريا"><input className={inputClass} defaultValue="4" min="0" name="numberOfReels" type="number" /></Field></div>
        <div><Field label="عدد المنشورات شهريا"><input className={inputClass} defaultValue="8" min="0" name="numberOfPosts" type="number" /></Field></div>
        <div><Field label="التسليمات الشهرية التفصيلية"><textarea className={inputClass} name="monthlyDeliverables" placeholder="مثال: 4 ريلاتس + 8 بوستات + تقويم محتوى" /></Field></div>
        <div><Field label="يشمل النشر"><select className={inputClass} name="postingIncluded"><option value="">لا</option><option value="نعم">نعم</option></select></Field></div>
        <div><Field label="يشمل الميزانية الإعلانية"><select className={inputClass} name="mediaBuyingIncluded"><option value="">لا</option><option value="نعم">نعم</option></select></Field></div>
        <div><Field label="الرسوم الشهرية"><input className={inputClass} name="monthlyFee" type="number" placeholder="إذا كانت مختلفة عن السعر الإجمالي" /></Field></div>
      </>}

      {contractType === "STUDIO_RENTAL" && <>
        <div className="md:col-span-2"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">خيارات تأجير الاستوديو</p></div>
        <div><Field label="المنصات"><input className={inputClass} name="platforms" placeholder="اختياري" /></Field></div>
      </>}

      {contractType === "CONTENT_CREATORS" && <>
        <div className="md:col-span-2"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">خيارات عقد صناع المحتوى</p></div>
        <div><Field label="نسبة صانع المحتوى (%)"><input className={inputClass} defaultValue="25" name="creatorPercentage" type="number" min="1" max="100" /></Field></div>
        <div><Field label="الشرط الجزائي (جنيه)"><input className={inputClass} defaultValue="50000" name="penaltyAmount" type="number" min="0" /></Field></div>
        <div><Field label="المنصات المستهدفة"><input className={inputClass} name="platforms" placeholder="YouTube, Facebook, Instagram, TikTok, Snapchat" /></Field></div>
      </>}

      {contractType === "CONTENT_CREATORS_NDA" && <>
        <div className="md:col-span-2"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">خيارات اتفاقية السرية (NDA)</p></div>
        <div><Field label="المنصات"><input className={inputClass} name="platforms" placeholder="YouTube, Facebook, Instagram, TikTok" /></Field></div>
      </>}
      {contractType === "CONTENT_CREATORS" && <>
        <div className="md:col-span-2"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">خيارات عقد صناع المحتوى</p></div>
        <div><Field label="نسبة صانع المحتوى (%)"><input className={inputClass} defaultValue="25" name="creatorPercentage" type="number" min="1" max="100" /></Field></div>
        <div><Field label="الشرط الجزائي (جنيه)"><input className={inputClass} defaultValue="50000" name="penaltyAmount" type="number" min="0" /></Field></div>
        <div><Field label="المنصات المستهدفة"><input className={inputClass} name="platforms" placeholder="YouTube, Facebook, Instagram, TikTok, Snapchat" /></Field></div>
      </>}

      <div className="md:col-span-2">
        <button type="submit" disabled={isPending} className="rounded-full bg-[#0B7CFF] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50">
          {isPending ? "جاري الحفظ…" : "حفظ مسودة"}
        </button>
      </div>
    </form>
  );
}
