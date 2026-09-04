# جِسر JISR — V0.91 FIXED

هذه النسخة تصلح خطأ:
`Cannot read properties of undefined (reading 'name')`

## سبب المشكلة
بعض إعدادات n8n قد تعيد استجابة Code/Respond داخل Array، بينما الواجهة السابقة افترضت أن الاستجابة Object مباشرة.
كما تمت إضافة حماية إذا كانت Workflow Static Data قديمة أو ناقصة.

## التحديث
1. استورد `n8n/JISR_Demo_n8n.json`.
2. عطّل Workflow جِسر القديم الذي يستخدم `jisr-demo-v1`.
3. فعّل **V0.91 فقط**.
4. ارفع ملفات الموقع الجديدة إلى Vercel.
5. نفذ Redeploy ثم Hard Refresh.

## الحسابات
- ولي الأمر: `P1001`
- الطالب: `S1001`
- المدرسة: `ADMIN1448`

## المسار
`https://n8n.yasergrid.online/webhook/jisr-demo-v1`

## الإصلاحات
- فك Array response تلقائيًا.
- دعم `{json:{...}}` إن ظهر.
- فحص بنية Dashboard قبل الرسم.
- إعادة Seed تلقائيًا إذا كانت Static Data ناقصة.
- رسائل خطأ أوضح بدل انهيار الصفحة.
- Cache busting إلى v0.91.
