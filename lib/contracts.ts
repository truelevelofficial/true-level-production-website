import { contractTypes } from "./constants";
import { contractSchema } from "./validation";

export function contractTypeLabel(type: string) {
  return contractTypes.find(([value]) => value === type)?.[1] ?? "General Service Agreement";
}

export function generateArabicContract(input: unknown) {
  const data = contractSchema.parse(input);
  const title = contractTypeLabel(data.type);

  return {
    title: `${title} - ${data.clientName}`,
    body: `
مسودة عقد ${title}

تنبيه قانوني مهم: هذا المستند مسودة/نموذج أولي لأغراض تنظيم العمل الداخلي فقط، ولا يعتبر عقدا نهائيا أو استشارة قانونية. يجب مراجعة هذه المسودة واعتمادها من محام مرخص في جمهورية مصر العربية قبل التوقيع أو الاستخدام الرسمي.

إنه في يوم ${data.projectStartDate}، تم الاتفاق بين كل من:

الطرف الأول: شركة True Level Production، ويمثلها في هذا العقد السيد/ ${data.representativeName}، ويشار إليها لاحقا باسم "الشركة".

الطرف الثاني: ${data.clientName}${data.clientCompanyName ? `، بصفته ممثلا عن ${data.clientCompanyName}` : ""}، رقم قومي/بطاقة ضريبية: ${data.clientTaxId || "غير مذكور"}، العنوان: ${data.clientAddress || "غير مذكور"}، الهاتف: ${data.clientPhone}، البريد الإلكتروني: ${data.clientEmail}، ويشار إليه لاحقا باسم "العميل".

أولا: نطاق الخدمة
تلتزم الشركة بتقديم خدمة ${data.serviceType} وفقا للوصف التالي:
${data.projectDescription}

ثانيا: المخرجات المتفق عليها
${data.deliverables}

ثالثا: مدة التنفيذ ومواعيد التصوير
تبدأ الأعمال بتاريخ ${data.projectStartDate} وتنتهي بتاريخ ${data.projectEndDate}. ويكون تاريخ التصوير المحدد هو ${data.shootingDate} في موقع: ${data.location}، ما لم يتفق الطرفان كتابيا على تعديل ذلك.

رابعا: المقابل المالي وطريقة السداد
إجمالي قيمة التعاقد: ${data.totalPrice} جنيه مصري.
الدفعة المقدمة: ${data.depositAmount} جنيه مصري.
المبلغ المتبقي: ${data.remainingAmount} جنيه مصري.
شروط السداد: ${data.paymentTerms}

خامسا: سياسة الإلغاء والتأجيل
${data.cancellationPolicy}

سادسا: التسليم والمراجعات
جدول التسليم: ${data.deliveryTimeline}
عدد جولات المراجعة المتفق عليها: ${data.revisionRounds}

سابعا: حقوق الاستخدام
${data.usageRights}

ثامنا: السرية
${data.confidentialityClause}

تاسعا: التأخير في السداد
${data.latePaymentClause}

عاشرا: ملاحظات إضافية
${data.additionalNotes || "لا توجد ملاحظات إضافية."}

حرر هذا العقد كمسودة قابلة للمراجعة، ولا يصبح ملزما إلا بعد المراجعة القانونية والتوقيع الرسمي من الطرفين.
`.trim(),
  };
}
