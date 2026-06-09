require("dotenv").config();
const nodemailer = require("nodemailer");

// ✅ transporter واحد بس للملف كله — بيفتح connection مرة واحدة
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 5,
});

transporter.verify((err) => {
  if (err) console.error('Email transporter error:', err);
  else console.log('✅ Email server ready');
});

// ─────────────────────────────────────────────────────────────
async function sendVerificationEmail(email, code) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1>${code}</h1>
    `,
  });
}

// ─────────────────────────────────────────────────────────────
async function sendPolicyWarningEmail(email, name, reason, expiryDate) {
  const formattedDate = new Date(expiryDate).toLocaleString('ar-EG', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "تنبيه هام: مخالفة سياسة الاستخدام لمنصة ContentForge",
    html: `
      <div style="direction: rtl; text-align: right; font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e8ed; padding: 20px; border-radius: 10px;">
        <h2 style="color: #e53e3e;">تنبيه بخصوص حسابك في ContentForge</h2>
        <p>مرحباً ${name}،</p>
        <p>تم رصد مخالفة لسياسة الاستخدام وشروط المنصة في حسابك.</p>
        
        <div style="background-color: #f7fafc; padding: 15px; border-left: 4px solid #e53e3e; margin: 20px 0; border-radius: 4px;">
          <strong>سبب المخالفة المذكور من قبل الإدارة:</strong>
          <p style="margin-top: 5px; color: #4a5568;">"${reason}"</p>
        </div>

        <p style="font-weight: bold; color: #dd6b20;">
          ⚠️ يرجى العلم أنه تم إعطاؤك فترة سماح مدتها 24 ساعة فقط لتصحيح الوضع، وإلا سيتم حظر حسابك تلقائياً وبشكل نهائي.
        </p>
        
        <p>تنتهي المهلة المسموحة لك في: <br><strong style="color: #2d3748;">${formattedDate}</strong></p>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="font-size: 12px; color: #718096;">إذا كنت تعتقد أن هذا الإجراء تم بالخطأ، يرجى مراسلة الدعم الفني فوراً.</p>
      </div>
    `,
  });
}
// ───────────────────────────────────────────────────────────── 
async function sendDeletionRequestEmail(name, email, reason) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to:   process.env.EMAIL_USER,
    subject: `طلب حذف حساب — ${name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e8ed; border-radius: 10px;">
        <h2 style="color: #e53e3e;">طلب حذف بيانات جديد</h2>
        <p><strong>الاسم:</strong> ${name}</p>
        <p><strong>الإيميل:</strong> ${email}</p>
        <p><strong>السبب:</strong> ${reason || 'لم يُذكر سبب'}</p>
        <hr/>
        <p style="font-size: 12px; color: #718096;">يرجى مراجعة لوحة الأدمن واتخاذ الإجراء المناسب.</p>
      </div>
    `,
  });
}
async function sendTrialUpdateEmail(email, name, newDays, newEndDate) {
  const formattedDate = new Date(newEndDate).toLocaleString('ar-EG', {
    dateStyle: 'full', timeStyle: 'short'
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'تحديث فترة التجربة المجانية — ContentForge',
    html: `
      <div style="direction:rtl; text-align:right; font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e1e8ed; border-radius:10px;">
        <h2 style="color:#3b82f6;">تحديث على حسابك في ContentForge</h2>
        <p>مرحباً ${name}،</p>
        <p>تم تحديث فترة التجربة المجانية الخاصة بك.</p>
        <div style="background:#f0f9ff; padding:15px; border-radius:8px; margin:16px 0;">
          <p style="margin:0;"><strong>المدة الجديدة:</strong> ${newDays} يوم</p>
          <p style="margin:8px 0 0;"><strong>تنتهي في:</strong> ${formattedDate}</p>
        </div>
        <p style="font-size:12px; color:#718096;">إذا كان لديك أي استفسار، تواصل مع الدعم الفني.</p>
      </div>
    `,
  });
}
async function sendTrialExpiryWarningEmail(email, name, expiryDate) {
  const formattedDate = new Date(expiryDate).toLocaleString('ar-EG', {
    dateStyle: 'full', timeStyle: 'short'
  })
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'تذكير: فترة تجربتك المجانية على وشك الانتهاء',
    html: `
      <div style="direction:rtl; text-align:right; font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e1e8ed; border-radius:10px;">
        <h2 style="color:#f59e0b;">تذكير بانتهاء فترة التجربة</h2>
        <p>مرحباً ${name}،</p>
        <p>فترة تجربتك المجانية في ContentForge ستنتهي بعد <strong>3 أيام</strong>.</p>
        <div style="background:#fffbeb; padding:15px; border-radius:8px; margin:16px 0;">
          <p style="margin:0;"><strong>تاريخ الانتهاء:</strong> ${formattedDate}</p>
        </div>
        <p>قم بترقية حسابك الآن للاستمرار في استخدام جميع المميزات.</p>
        <p style="font-size:12px; color:#718096;">شكراً لاستخدامك ContentForge.</p>
      </div>
    `,
  })
}
module.exports = {
  sendVerificationEmail,
  sendPolicyWarningEmail,
  sendDeletionRequestEmail,
  sendTrialUpdateEmail,
  sendTrialExpiryWarningEmail  // ✅ ناقصة
};
