
const { User, PlatformSettings } = require('../models');
// هنا بنستدعي الدالة اللي هتبعت الإيميل (هنعملها في الخطوة 2)
const { sendTrialExpiryWarningEmail } = require('./emailService'); 

async function checkAndSendExpiryWarnings() {
  try {
    // 1. نشيك الأول: هل الأدمن مفعّل الزرار من الشاشة؟
    const settings = await PlatformSettings.findOne();
    if (!settings || !settings.sendExpiryWarning) {
      console.log('⛔ ميزة إرسال تحذيرات انتهاء فترة التجربة معطلة من لوحة التحكم.');
      return; // لو مقفول (false)، السكريبت يقف هنا وما يعملش حاجة
    }

    // 2. لو مفتوح (true)، نحسب تاريخ "بعد 3 أيام من دلوقتي" بالظبط
    const now = new Date();
    const threeDaysFromNowStart = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    threeDaysFromNowStart.setHours(0, 0, 0, 0); // أول اليوم بعد 3 أيام

    const threeDaysFromNowEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    threeDaysFromNowEnd.setHours(23, 59, 59, 999); // آخر اليوم بعد 3 أيام

    // 3. ندور في الـ DB على المستخدمين اللي فترتهم التجريبية تخلص في اليوم ده بالظبط
    const usersToWarn = await User.find({
      isTrial: true,
      isBlocked: { $ne: true },
      isDeleted: { $ne: true },
      trialEndsAt: { $gte: threeDaysFromNowStart, $lte: threeDaysFromNowEnd }
    });

    console.log(`📢 جاري إرسال إيميلات تنبيهية لـ ${usersToWarn.length} مستخدم...`);

    // 4. نلف عليهم ونبعت لكل واحد الإيميل التنبيهي
    for (const user of usersToWarn) {
      await sendTrialExpiryWarningEmail(user.email, user.name, user.trialEndsAt)
        .catch(err => console.error(`خطأ أثناء الإرسال لـ ${user.email}:`, err.message));
    }

  } catch (error) {
    console.error('خطأ في سكريبت فحص فترات التجربة:', error.message);
  }
}

module.exports = { checkAndSendExpiryWarnings };

// cronJobs.js
// services/cronJobs.js
// const User = require('../models/User');
// const { sendTrialExpiryWarningEmail } = require('./emailService');

// async function checkAndSendExpiryWarnings() {
//   try {
//     const threeDaysFromNow = new Date();
//     threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
//     const start = new Date(threeDaysFromNow.setHours(0, 0, 0, 0));
//     const end   = new Date(threeDaysFromNow.setHours(23, 59, 59, 999));

//     const users = await User.find({
//       isTrial: true,
//       trialEndsAt: { $gte: start, $lte: end }
//     });

//     for (const user of users) {
//       await sendTrialExpiryWarningEmail(user.email, user.name, user.trialEndsAt)
//         .catch(err => console.error(`Expiry warning error for ${user.email}:`, err.message));
//     }

//     console.log(`[cronJobs] Sent expiry warnings to ${users.length} users`);
//   } catch (err) {
//     console.error('[cronJobs] checkAndSendExpiryWarnings error:', err.message);
//   }
// }

// module.exports = { checkAndSendExpiryWarnings };