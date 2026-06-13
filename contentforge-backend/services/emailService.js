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
  maxConnections: 1,
});

transporter.verify((err) => {
  if (err) console.error('Email transporter error:', err);
  else console.log('✅ Email server ready');
});

// ─────────────────────────────────────────────────────────────
async function sendVerificationEmail(email, code) {
  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
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
    from: process.env.ADMIN_EMAIL,
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
    from: email,
    to:   process.env.ADMIN_EMAIL,
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
    from: process.env.ADMIN_EMAIL,
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
// async function sendTrialExpiryWarningEmail(email, name, expiryDate) {
//   const formattedDate = new Date(expiryDate).toLocaleString('ar-EG', {
//     dateStyle: 'full', timeStyle: 'short'
//   })
//   await transporter.sendMail({
//     from: process.env.ADMIN_EMAIL,
//     to: email,
//     subject: 'تذكير: فترة تجربتك المجانية على وشك الانتهاء',
//     html: `
//       <div style="direction:rtl; text-align:right; font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e1e8ed; border-radius:10px;">
//         <h2 style="color:#f59e0b;">تذكير بانتهاء فترة التجربة</h2>
//         <p>مرحباً ${name}،</p>
//         <p>فترة تجربتك المجانية في ContentForge ستنتهي بعد <strong>3 أيام</strong>.</p>
//         <div style="background:#fffbeb; padding:15px; border-radius:8px; margin:16px 0;">
//           <p style="margin:0;"><strong>تاريخ الانتهاء:</strong> ${formattedDate}</p>
//         </div>
//         <p>قم بترقية حسابك الآن للاستمرار في استخدام جميع المميزات.</p>
//         <p style="font-size:12px; color:#718096;">شكراً لاستخدامك ContentForge.</p>
//       </div>
//     `,
//   })
// }
async function sendTrialExpiryWarningEmail(email, name, expiryDate) {
  // تنسيق التاريخ بشكل عربي شيك وقابل للقراءة
  const formattedDate = new Date(expiryDate).toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: "⚠️ تنبيه: قُرب انتهاء الفترة التجريبية - منصة ContentForge",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e8ed; border-radius: 10px; direction: rtl; text-align: right;">
        <h2 style="color: #eab308;">تنبيه هام من ContentForge</h2>
        <p>مرحباً ${name}،</p>
        <p>نود تذكيرك بأن فترتك التجريبية المجانية على منصتنا أوشكت على الانتهاء.</p>
        
        <div style="background: #fef9c3; padding: 15px; border-radius: 8px; margin: 16px 0; border-right: 5px solid #eab308;">
          <strong>تاريخ انتهاء التجربة:</strong> ${formattedDate} (متبقي 3 أيام فقط).
        </div>

        <p>لضمان استمرار أعمالك وعدم توقف صناعة المحتوى، يمكنك ترقية حسابك إلى إحدى باقاتنا المميزة في أي وقت من لوحة التحكم.</p>
        
        <a href="${process.env.FRONTEND_URL || '#'}/dashboard/billing" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; font-weight: bold;">ترقية الحساب الآن</a>
        
        <hr style="border: 0; border-top: 1px solid #e1e8ed; margin-top: 20px;">
        <p style="font-size: 12px; color: #718096;">إذا كان لديك أي استفسار، رد على هذا الإيميل مباشرة — فريق ContentForge</p>
      </div>
    `,
  });
}

// ⚠️ ما تنسيش تضيفيها تحت في الـ module.exports مع باقي الدوال:
module.exports = {
  // الدوال القديمة بتاعتك...
  sendVerificationEmail,
  sendTrialUpdateEmail,
  sendTrialExpiryWarningEmail // ← ضيفيها هنا
};
async function sendContactNotificationEmail(name, email, company, subject, message) {
  await transporter.sendMail({
    from: email,
    to: process.env.ADMIN_EMAIL,
    subject: `[Contact] ${subject} — ${name}`,
    html: `
      <div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e1e8ed; border-radius:10px;">
        <h2 style="color:#3b82f6;">رسالة تواصل جديدة</h2>
        <p><strong>الاسم:</strong> ${name}</p>
        <p><strong>الإيميل:</strong> ${email}</p>
        ${company ? `<p><strong>الشركة:</strong> ${company}</p>` : ''}
        <p><strong>الموضوع:</strong> ${subject}</p>
        <hr style="border:0; border-top:1px solid #e2e8f0; margin:16px 0;"/>
        <p style="white-space:pre-line;">${message}</p>
      </div>
    `,
  })
}

async function sendContactAutoReply(email, name) {
  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to:   email,
    subject: 'تم استلام رسالتك ✉️ — ContentForge',
    html: `
      <div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e1e8ed; border-radius:10px;">
        <h2 style="color:#3b82f6;">شكراً للتواصل معنا!</h2>
        <p>مرحباً ${name}،</p>
        <p>تم استلام رسالتك بنجاح وسيقوم فريقنا بالرد عليك خلال 24 ساعة.</p>
        <p style="font-size:12px; color:#718096;">— فريق ContentForge</p>
      </div>
    `,
  })
}

async function sendContactReplyEmail(email, name, originalMessage, replyText) {
  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to:   email,
    subject: 'رد من فريق ContentForge',
    html: `
      <div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e1e8ed; border-radius:10px;">
        <h2 style="color:#3b82f6;">رد من فريق الدعم</h2>
        <p>مرحباً ${name}،</p>
        <div style="background:#f0f9ff; padding:15px; border-radius:8px; margin:16px 0; white-space:pre-line;">
          ${replyText}
        </div>
        <hr style="border:0; border-top:1px solid #e2e8f0; margin:16px 0;"/>
        <p style="font-size:12px; color:#718096;"><strong>رسالتك الأصلية:</strong></p>
        <p style="font-size:12px; color:#718096; white-space:pre-line;">${originalMessage}</p>
      </div>
    `,
  })
}

// Send email to remind user of scheduled posts for the day
async function sendScheduledPostReminderEmail(email, name, posts) {
  const postList = posts.map(p => `
    <tr>
      <td style="padding:8px 12px; border-bottom:1px solid #e2e8f0;">${p.platform}</td>
      <td style="padding:8px 12px; border-bottom:1px solid #e2e8f0;">${p.copyAR || p.copyEN || 'No content'}</td>
    </tr>
  `).join('')

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: '📅 تذكير: لديك منشورات مجدولة اليوم — ContentForge',
    html: `
      <div style="direction:rtl; text-align:right; font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e1e8ed; border-radius:10px;">
        <h2 style="color:#3b82f6;">📅 تذكير بمنشورات اليوم</h2>
        <p>مرحباً ${name}،</p>
        <p>لديك <strong>${posts.length}</strong> منشور مجدول اليوم على ContentForge. لا تنسَ نشرها!</p>
        <table style="width:100%; border-collapse:collapse; margin:16px 0; text-align:right;">
          <thead>
            <tr style="background:#f7fafc;">
              <th style="padding:8px 12px; border-bottom:2px solid #e2e8f0;">المنصة</th>
              <th style="padding:8px 12px; border-bottom:2px solid #e2e8f0;">المحتوى</th>
            </tr>
          </thead>
          <tbody>${postList}</tbody>
        </table>
        <a href="${process.env.CLIENT_URL}/dashboard" 
          style="display:inline-block; margin-top:8px; padding:10px 20px; background:#3b82f6; color:white; border-radius:8px; text-decoration:none; font-weight:bold;">
          افتح التقويم
        </a>
        <p style="font-size:12px; color:#718096; margin-top:20px;">ContentForge — منصة إدارة المحتوى الذكية</p>
      </div>
    `,
  })
}

async function sendScheduledPostTomorrowEmail(email, name, posts) {
  const postList = posts.map(p => `
    <tr>
      <td style="padding:8px 12px; border-bottom:1px solid #e2e8f0;">${p.platform}</td>
      <td style="padding:8px 12px; border-bottom:1px solid #e2e8f0;">${p.copyAR || p.copyEN || 'No content'}</td>
    </tr>
  `).join('')

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: '⏰ تذكير: لديك منشورات مجدولة غداً — ContentForge',
    html: `
      <div style="direction:rtl; text-align:right; font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e1e8ed; border-radius:10px;">
        <h2 style="color:#f59e0b;">⏰ تذكير بمنشورات الغد</h2>
        <p>مرحباً ${name}،</p>
        <p>لديك <strong>${posts.length}</strong> منشور مجدول <strong>غداً</strong> على ContentForge. استعد لنشرها!</p>
        <table style="width:100%; border-collapse:collapse; margin:16px 0; text-align:right;">
          <thead>
            <tr style="background:#f7fafc;">
              <th style="padding:8px 12px; border-bottom:2px solid #e2e8f0;">المنصة</th>
              <th style="padding:8px 12px; border-bottom:2px solid #e2e8f0;">المحتوى</th>
            </tr>
          </thead>
          <tbody>${postList}</tbody>
        </table>
        <a href="${process.env.CLIENT_URL}/dashboard"
          style="display:inline-block; margin-top:8px; padding:10px 20px; background:#f59e0b; color:white; border-radius:8px; text-decoration:none; font-weight:bold;">
          افتح التقويم
        </a>
        <p style="font-size:12px; color:#718096; margin-top:20px;">ContentForge — منصة إدارة المحتوى الذكية</p>
      </div>
    `,
  })
}

// ─────────────────────────────────────────────────────────────
// ... (كود الـ transporter في الأعلى)

async function sendAdminPromotionEmail(email, name) {
  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: '🎉 تهانينا! تمت ترقيتك لمسؤول — ContentForge',
    html: `
      <div style="direction:rtl; text-align:right; font-family:sans-serif; max-width:600px; margin:0 auto; padding:24px; border:1px solid #e1e8ed; border-radius:12px;">
        <h2 style="color:#7c3aed;">🎉 تهانينا ${name}!</h2>
        <p>تم منحك صلاحيات <strong>مسؤول (Admin)</strong> على منصة ContentForge.</p>
        <div style="background:#f5f3ff; padding:16px; border-radius:8px; margin:16px 0; border-right:4px solid #7c3aed;">
          <p style="margin:0; color:#4c1d95;">أصبح بإمكانك الآن الوصول إلى لوحة التحكم الكاملة وإدارة المستخدمين والإعدادات.</p>
        </div>
        <p style="font-size:12px; color:#718096;">إذا كان لديك أي استفسار، تواصل مع فريق الدعم — ContentForge</p>
      </div>
    `,
  });
}

const planPrices = { free: 'مجانية', pro: '99 جنيه / شهر', enterprise: '299 جنيه / شهر' }

async function sendPlanUpdateByEmail(email, name, plan, isTrial, planEndsAt) {
  const formattedDate = planEndsAt
    ? new Date(planEndsAt).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  const planLabel = isTrial ? `تجربة مجانية (${plan})` : plan
  const price     = planPrices[plan] || '—'
  const color     = plan === 'pro' ? '#3b82f6' : plan === 'enterprise' ? '#7c3aed' : '#f59e0b'

  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: `تحديث باقتك على ContentForge — ${planLabel}`,
    html: `
      <div style="direction:rtl; text-align:right; font-family:sans-serif; max-width:600px; margin:0 auto; padding:24px; border:1px solid #e1e8ed; border-radius:12px;">
        <h2 style="color:${color};">تحديث على حسابك في ContentForge</h2>
        <p>مرحباً ${name}،</p>
        <p>تم تحديث باقتك من قِبل الإدارة، وفيما يلي تفاصيل حسابك الجديدة:</p>

        <div style="background:#f8fafc; padding:16px; border-radius:8px; margin:16px 0; border-right:4px solid ${color};">
          <p style="margin:0 0 8px;"><strong>الباقة:</strong> ${planLabel}</p>
          <p style="margin:0 0 8px;"><strong>السعر:</strong> ${price}</p>
          <p style="margin:0;"><strong>تاريخ الانتهاء:</strong> ${formattedDate}</p>
        </div>

        ${isTrial ? `<p style="color:#d97706;">⚠️ هذه فترة تجريبية مجانية — قم بالترقية قبل انتهائها للاستمرار في استخدام المنصة.</p>` : ''}

        <a href="${process.env.CLIENT_URL || '#'}/dashboard" 
          style="display:inline-block; margin-top:8px; padding:10px 24px; background:${color}; color:white; border-radius:8px; text-decoration:none; font-weight:bold;">
          الذهاب للوحة التحكم
        </a>

        <p style="font-size:12px; color:#718096; margin-top:20px;">إذا كان لديك أي استفسار، تواصل مع فريق الدعم — ContentForge</p>
      </div>
    `,
  });
}



module.exports = {
  sendVerificationEmail,
  sendPolicyWarningEmail,
  sendDeletionRequestEmail,
  sendTrialUpdateEmail,
  sendTrialExpiryWarningEmail,
  sendContactNotificationEmail,
  sendContactAutoReply,
  sendContactReplyEmail,
  sendScheduledPostTomorrowEmail,
  sendScheduledPostReminderEmail,
  sendAdminPromotionEmail,
  sendPlanUpdateByEmail,
  transporter,
};
