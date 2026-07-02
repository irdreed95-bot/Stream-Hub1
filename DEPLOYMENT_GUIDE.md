# StreamVault - دليل التحميل على Vercel

## طريقة 1: التحميل المباشر من GitHub (الأسهل) ✅

### الخطوات:
1. اذهب إلى https://vercel.com
2. سجل الدخول أو أنشئ حساب
3. اضغط "Add New" → "Project"
4. اختر هذا المستودع: `irdreed95-bot/Stream-Hub1`
5. اترك الإعدادات كما هي (Vercel سيكتشف تلقائياً):
   - **Framework**: Vite
   - **Build Command**: `pnpm install && pnpm -r --filter './artifacts/streamvault' run build`
   - **Output Directory**: `artifacts/streamvault/dist/public`
6. اضغط "Deploy"

✅ **تم!** سيتم نشر التطبيق تلقائياً

---

## طريقة 2: النشر المحلي (إذا أردت بناء الملفات أولاً)

### المتطلبات:
- Node.js 18+
- pnpm مثبت

### الخطوات:
```bash
# 1. تثبيت الإضافات
pnpm install

# 2. بناء التطبيق
pnpm -r --filter './artifacts/streamvault' run build

# 3. الملفات الجاهزة ستكون في:
# artifacts/streamvault/dist/public/
```

### ثم حمّل المجلد `dist/public/` إلى Vercel أو أي منصة استضافة أخرى

---

## المتغيرات البيئية المطلوبة (إذا كان هناك API):

أضف في إعدادات Vercel تحت "Settings" → "Environment Variables":

```
NODE_ENV=production
PORT=3000
BASE_PATH=/
```

---

## المتطلبات النهائية:

✅ **ملفات التكوين موجودة:**
- `vercel.json` - إعدادات Vercel
- `.vercelignore` - الملفات المستثناة من النشر
- `.env.production` - متغيرات الإنتاج

✅ **البناء سيعمل تلقائياً** مع `pnpm workspace`

---

## التحقق من النشر:

بعد النشر، سيعطيك Vercel URL مثل:
```
https://your-project.vercel.app
```

---

## نصائح:

- ✅ **Vercel مجاني** ولا يتطلب بطاقة ائتمان للبداية
- ✅ **النشر التلقائي**: كل push إلى GitHub يُنشر تلقائياً
- ✅ **SSL/HTTPS مدمج** افتراضياً
- ✅ **أداء عالي** مع CDN عالمي

---

## إذا واجهت مشاكل:

1. تأكد من أن `pnpm` مثبت على النظام
2. تحقق من أن `PORT` و `BASE_PATH` معرّفة بشكل صحيح
3. اطلع على سجلات البناء في لوحة تحكم Vercel

**استفسارات؟** 💬
