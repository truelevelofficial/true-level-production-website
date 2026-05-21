# برومبت أمن API - True Level Production

## الهدف
مراجعة وتأمين جميع API Calls بحيث لا تظهر بيانات حساسة أو منطق داخلي في Network tab.

**ملاحظة مهمة:** Network tab لا يمكن إخفاؤه بالكامل، الهدف هو ضمان عدم ظهور أي بيانات سرية أو منطق إداري أو API keys فيه.

## المطلوب بالتفصيل

### 1. فحص جميع الـ API Calls في المشروع
افحص كل:
- `fetch()` calls
- form actions (useActionState)
- server actions
- API routes (/api/*)
- client components

صنّف كل طلب إلى: public / admin / internal
وسجّل أي طلب يعرض بيانات أكثر من اللازم.

### 2. نقل المنطق الحساس إلى السيرفر
تأكد أن الـ frontend لا يتعامل مباشرة مع:
- Prisma queries
- Supabase secrets
- Admin credentials
- Google OAuth secrets
- منطق إنشاء العقود
- حسابات المحاسبة
- منطق تحديث الإعدادات
- قواعد التسعير

استخدم: Server Actions / Route Handlers / Server Components

### 3. عدم تسريب المتغيرات السرية
ابحث في كل الملفات عن استخدام متغيرات بيئية سرية في client components:

**ممنوع تماماً ظهورها للـ browser:**
- DATABASE_URL, DIRECT_URL
- ADMIN_PASSWORD, ADMIN_SESSION_SECRET
- GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET
- RESEND_API_KEY, SUPABASE_SERVICE_ROLE_KEY
- أي private key

المسموح فقط: `NEXT_PUBLIC_` الآمنة.

### 4. حماية Admin APIs
كل endpoint إداري يجب أن يتطلب مصادقة admin في السيرفر (ليس فقط في الـ frontend):
- /admin/* جميع الصفحات
- /api/admin/* جميع المسارات
- أي server action يعدّل بيانات إدارية

### 5. تصغير استجابات الـ Public APIs
الـ APIs العامة يجب أن تعيد فقط ما يحتاجه المستخدم:
- ممنوع: internal notes, accounting data, كل العملاء, admin emails, IDs غير ضرورية, contract templates, internal settings

### 6. تأمين Booking APIs
المستخدم العادي:
- يستطيع إنشاء طلب حجز فقط (يبدأ بـ PENDING)
- لا يستطيع: الموافقة, تغيير الحالة, مشاهدة حجوزات الآخرين, تعديل السعر, الوصول للمحاسبة أو العملاء

### 7. تأمين Accounting APIs
Admin-only بشكل كامل:
- الإيرادات, المصروفات, حالة الدفع, التقارير, التصدير
- لا بيانات محاسبية للعامة أبداً

### 8. تأمين Contract APIs
Admin-only:
- قوالب العقود, المسودات, التصدير, السجل
- لا وصول للعامة بدون توكن آمن في المستقبل

### 9. تأمين Settings APIs
- تحديث الإعدادات: Admin-only
- العامة ترى فقط: الاسم, الهاتف العام, الإيميل العام, العنوان العام
- ممنوع: الرقم الضريبي, بنود العقود, أسعار داخلية, إيميل الإشعارات, إعدادات Admin

### 10. استخدام Route Handlers كـ Backend Proxy
لا تستدعي خدمات خارجية من الـ frontend بمفاتيح سرية.
استخدم `/api/*` كوسيط - السرّية تكون في السيرفر فقط.

### 11. استخدام Server Actions كلما أمكن
كل Server Action يجب أن:
- يتحقق من جلسة admin
- يتحقق من صحة الإدخال (Zod)
- ينفذ عملية قاعدة البيانات في السيرفر
- يعيد رسالة نجاح/فشل آمنة فقط

### 12. إضافة Validation لكل الإدخالات
Validate server-side: email, phone, dates, times, prices, deposits, duration, status, contract fields, accounting amounts

### 13. حماية الـ Public Endpoints من سوء الاستخدام
أضف rate limiting بسيط أو هيكل جاهز للتفعيل لاحقاً لـ:
- /book/meeting, /book/studio
- contact forms
- login endpoints

### 14. منع IDOR (تغيير IDs في الرابط)
أي صفحة سجل إداري تستخدم ID في الـ URL:
- تحقق من admin session أولاً
- أرجع 404 أو Unauthorized إذا لم يصرّح له

### 15. عدم تسريب Stack Traces
لا ترجع الـ error الحقيقي للمستخدم أبداً.
**ممنوع:** `return error.message` مع أخطاء قاعدة البيانات
**مسموح:** "Could not save booking." / "Unauthorized." / "Invalid request."
سجّل التفاصيل في السيرفر فقط (console.error).

### 16. جعل Network Tab آمناً
تأكد أن الطلبات لا تظهر:
- Secrets
- Raw SQL
- كامل Objects قاعدة البيانات
- Internal notes
- Admin-only fields
- بيانات قانونية للعملاء
- قوالب العقود
- بيانات محاسبية كاملة (إلا للمسؤول)

### 17. مراجعة كود الـ Frontend
ابحث في:
- `process.env` داخل client components
- `"use client"` ملفات تستورد server-only modules
- استخدام Prisma مباشرة من frontend
- استخدام Supabase مباشرة من frontend

أصلح أي شيء غير آمن.

### 18. إضافة Middleware إذا لزم الأمر
حمي مسارات admin في Middleware:
- أعد توجيه غير المسجلين إلى /login

### 19. اختبر الأمان يدوياً
- افتح الموقع وأنت مسجل خروج
- حاول فتح /admin
- حاول استدعاء API إداري
- حاول تغيير حالة الحجز من طلب عام
- حاول فتح تصدير عقد
- أرسل booking ببيانات غير صالحة

### 20. بناء ونشر
بعد التعديلات شغّل:
```
npm.cmd run build
git add .
git commit -m "Secure backend APIs and protect admin operations"
git push
```

## النتيجة المتوقعة
- Network tab يظهر طلبات لكن لا يوجد فيها أي بيانات سرية
- لا تظهر secrets في frontend code, Network tab, API responses, أو console
- كل العمليات الحساسة تجري في السيرسر وتتطلب admin authentication
- المستخدم العادي يستطيع فقط إرسال طلب حجز آمن
- البيانات الإدارية محمية بالكامل
