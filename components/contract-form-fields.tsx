"use client";

import { useTransition, useState, useEffect, useRef, useMemo } from "react";
import { Field, inputClass } from "./form-fields";
import { createContractAction } from "@/lib/actions";
import { contentCreatorsDefaultClauses, contentCreatorsNdaDefaultClauses } from "@/lib/contracts";

export function ContractFormFields({ defaultRep, defaultPaymentTerms, defaultCancellationPolicy, services }: { defaultRep: string; defaultPaymentTerms: string; defaultCancellationPolicy: string; services: readonly string[] }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(null);
  const [contractType, setContractType] = useState("VIDEO_PRODUCTION");
  const msgRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const emptyInput = useMemo(() => ({
    representativeName: defaultRep,
    clientName: "",
    clientTaxId: "",
    projectStartDate: "",
    creatorPercentage: 25,
    penaltyAmount: 50000,
    platforms: "",
  }), [defaultRep]);

  const ccDefaults = useMemo(() => contentCreatorsDefaultClauses(emptyInput), [emptyInput]);
  const ndaDefaults = useMemo(() => contentCreatorsNdaDefaultClauses(emptyInput), [emptyInput]);

  useEffect(() => {
    if (result && msgRef.current) {
      msgRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [result]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (contractType === "CONTENT_CREATORS" || contractType === "CONTENT_CREATORS_NDA") {
      const clauses: string[] = [];
      let i = 0;
      while (formData.has(`clause_${i}`)) {
        clauses.push(formData.get(`clause_${i}`) as string || "");
        i++;
      }
      formData.set("clauses", JSON.stringify(clauses));
      for (let j = 0; j < i; j++) formData.delete(`clause_${j}`);
    }

    setResult(null);
    startTransition(async () => {
      const res = await createContractAction(formData);
      setResult(res);
      if (res?.success) {
        formRef.current?.reset();
      }
    });
  };

  const clauseLabels: Record<string, string[]> = {
    CONTENT_CREATORS: [
      "البند الأول: أطراف العقد",
      "البند الثاني: موضوع العقد",
      "البند الثالث: مدة العقد",
      "البند الرابع: التزامات الطرف الأول",
      "البند الخامس: التزامات الطرف الثاني",
      "البند السادس: ملكية القناة",
      "البند السابع: ملكية المحتوى",
      "البند الثامن: المقابل المالي",
      "البند التاسع: الرعايات والإعلانات",
      "البند العاشر: سرية المعلومات",
      "البند الحادي عشر: عدم المنافسة",
      "البند الثاني عشر: استخدام الاسم والصورة",
      "البند الثالث عشر: إنهاء العقد",
      "البند الرابع عشر: الشرط الجزائي",
      "البند الخامس عشر: القوة القاهرة",
      "البند السادس عشر: القانون المختص",
      "البند السابع عشر: النسخ",
    ],
    CONTENT_CREATORS_NDA: [
      "التمهيد وبيانات الأطراف",
      "البند الأول: التمهيد",
      "البند الثاني: تعريف المعلومات السرية",
      "البند الثالث: الالتزام بالسرية",
      "البند الرابع: سرية الحسابات والبيانات",
      "البند الخامس: ملكية القنوات والحسابات",
      "البند السادس: نقل الملكية الفكرية",
      "البند السابع: نطاق الملكية الفكرية",
      "البند الثامن: حق الاستغلال",
      "البند التاسع: استخدام الاسم والصورة",
      "البند العاشر: عدم المطالبة بالحذف",
      "البند الحادي عشر: عدم المنافسة",
      "البند الثاني عشر: إعادة استخدام المحتوى",
      "البند الثالث عشر: مدة الالتزامات",
      "البند الرابع عشر: الإخلال بالاتفاقية",
      "البند الخامس عشر: القانون الواجب التطبيق",
      "البند السادس عشر: النسخ",
    ],
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

      {(contractType === "CONTENT_CREATORS" || contractType === "CONTENT_CREATORS_NDA") && <>
        <div className="md:col-span-2">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
            {contractType === "CONTENT_CREATORS" ? "بنود عقد صناع المحتوى" : "بنود اتفاقية السرية (NDA)"}
          </p>
          <p className="mt-1 text-xs text-gray-500">قم بتعديل نصوص البنود مباشرة. سيتم توليد العقد تلقائيا بناء على ما تكتبه.</p>
        </div>
      </>}

      {contractType === "CONTENT_CREATORS" && ccDefaults.map((_, i) => (
        <div key={i} className="md:col-span-2">
          <Field label={clauseLabels.CONTENT_CREATORS[i]}>
            <textarea className={inputClass} name={`clause_${i}`} rows={i >= 7 && i <= 8 ? 16 : i === 12 ? 14 : 6} defaultValue={ccDefaults[i]} />
          </Field>
        </div>
      ))}

      {contractType === "CONTENT_CREATORS_NDA" && ndaDefaults.map((_, i) => (
        <div key={i} className="md:col-span-2">
          <Field label={clauseLabels.CONTENT_CREATORS_NDA[i]}>
            <textarea className={inputClass} name={`clause_${i}`} rows={i === 2 ? 16 : i === 7 || i === 8 ? 12 : 6} defaultValue={ndaDefaults[i]} />
          </Field>
        </div>
      ))}

      <div className="md:col-span-2">
        <button type="submit" disabled={isPending} className="rounded-full bg-[#0B7CFF] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50">
          {isPending ? "جاري الحفظ…" : "حفظ مسودة"}
        </button>
      </div>
    </form>
  );
}
