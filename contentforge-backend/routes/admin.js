// backend/routes/admin.js
const express   = require('express')
const router    = express.Router()
const adminOnly = require('../middleware/adminAuth') // تأكدي من مسارك الصحيح
const { User, Post, Brand, Trend, PlatformSettings } = require('../models')
const { sendPolicyWarningEmail, sendAdminPromotionEmail, sendPlanUpdateByEmail } = require('../services/emailService');

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', adminOnly, async (req, res) => {
  try {
    const now      = new Date()
    const last24h  = new Date(now - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(now - 7  * 24 * 60 * 60 * 1000)
    const prevWeek = new Date(now - 14 * 24 * 60 * 60 * 1000)

    // base filter: مستخدمين حقيقيين (مش ادمن، مش soft deleted)
    const realUsers = { isAdmin: { $ne: true }, 'deletionRequest.isDeleted': { $ne: true } }

    const totalUsers         = await User.countDocuments({ 'deletionRequest.isDeleted': { $ne: true } }) // كل الناس ماعدا الـ soft deleted
    const blockedCount       = await User.countDocuments({ ...realUsers, isBlocked: true })
    const warnedCount        = await User.countDocuments({ ...realUsers, isBlocked: { $ne: true }, 'moderation.blockStatus': 'warning' })
    const isAskToDeleteCount = await User.countDocuments({ ...realUsers, 'deletionRequest.isAsked': true })
    const deletedCount       = await User.countDocuments({ isAdmin: { $ne: true }, 'deletionRequest.isDeleted': true })
    const adminCount         = await User.countDocuments({ isAdmin: true })

    const activeCount        = await User.countDocuments({
      ...realUsers,
      isVerified: true,
      isBlocked: false,
      planEndsAt: { $gt: now },          // لازم الاشتراك أو التجربة لسه شغالة
      'deletionRequest.isAsked': { $ne: true },
      'moderation.blockStatus': { $ne: 'warning' }
    })

    // الـ Expired: plan انتهى ومش admin
    const expiredCount         = await User.countDocuments({ ...realUsers, planEndsAt: { $lte: now } })

    // الـ Trial النشط: free plan + planEndsAt لسه جاي (بغض النظر عن isTrial flag)
    const activeTrialUsers     = await User.countDocuments({ ...realUsers, plan: 'free', planEndsAt: { $gt: now } })
    const pendingVerifications = await User.countDocuments({ ...realUsers, isVerified: false })
    const newUsersThisWeek     = await User.countDocuments({ ...realUsers, createdAt: { $gte: lastWeek } })
    const newUsersPrevWeek     = await User.countDocuments({ ...realUsers, createdAt: { $gte: prevWeek, $lt: lastWeek } })

    const registrationGrowth = newUsersPrevWeek > 0
      ? Math.round(((newUsersThisWeek - newUsersPrevWeek) / newUsersPrevWeek) * 100)
      : newUsersThisWeek > 0 ? 100 : 0

    res.json({
      totalUsers,
      newUsers24h: await User.countDocuments({ ...realUsers, createdAt: { $gte: last24h } }),
      pendingVerifications,
      activeTrialUsers,
      newPostsLast24h: await Post?.countDocuments({ createdAt: { $gte: last24h } }).catch(() => 0),
      newUsersThisWeek,
      registrationGrowth,
      warnedCount,
      isAskToDeleteCount,
      activeCount,
      blockedCount,
      deletedCount,
      adminCount,
      expiredCount,
      serverUptime: Math.floor(process.uptime()),
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// ── GET /api/admin/settings ───────────────────────────────────────────────────
router.get('/settings', adminOnly, async (req, res) => {
  try {
    let settings = await PlatformSettings.findOne()
    if (!settings) settings = await PlatformSettings.create({})
    res.json({ settings })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── PUT /api/admin/settings ───────────────────────────────────────────────────
router.put('/settings', adminOnly, async (req, res) => {
  try {
    const { trialDays, blockByPhone, otpExpiryMinutes, sendExpiryWarning } = req.body

    let settings = await PlatformSettings.findOne()
    if (!settings) settings = await PlatformSettings.create({})

    const trialDaysChanged = settings.trialDays !== trialDays

    settings.trialDays         = trialDays
    settings.blockByPhone      = blockByPhone
    settings.otpExpiryMinutes  = otpExpiryMinutes  
    settings.sendExpiryWarning = sendExpiryWarning
    await settings.save()

    let updatedUsers = 0

    // التعديل السحري: الاعتماد على createdAt والتحديث في planEndsAt الموحد
    if (trialDaysChanged) {
      const trialUsers = await User.find({ isTrial: true, plan: 'free' })
      const updates = trialUsers.map(async (user) => {
        const start  = new Date(user.createdAt) 
        const newEnd = new Date(start)
        newEnd.setDate(newEnd.getDate() + trialDays)
        
        user.planEndsAt = newEnd
        await user.save()
        
        sendTrialUpdateEmail(user.email, user.name, trialDays, newEnd)
          .catch(err => console.error(`Email error:`, err.message))
      })
      await Promise.all(updates)
      updatedUsers = trialUsers.length
    }
    
    res.json({ message: 'Settings saved', updatedUsers })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /api/admin/users ──────────────────────────────────────────────────────
router.get('/users', adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', plan } = req.query

    const query = {
      'deletionRequest.isDeleted': { $ne: true }
    }

    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }
    if (plan) query.plan = plan

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -verificationCode -verificationCodeExpires')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      User.countDocuments(query),
    ])

    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// ── PUT /api/admin/users/:id/block ───────────────────────────────────────────
router.put('/users/:id/block', adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isAdmin) return res.status(403).json({ message: 'Cannot block an admin' });

    // فك الحظر باستخدام كائن moderation الجديد
    if (user.isBlocked || user.moderation.blockStatus === 'warning') {
      user.isBlocked = false;
      user.moderation.blockStatus = 'none';
      user.moderation.restrictionReason = null;
      user.moderation.gracePeriodExpiresAt = null;
      user.moderation.actionTriggeredBy = null;
      await user.save();
      return res.json({ message: 'User is now active', isBlocked: false, blockStatus: 'none' });
    }

    // عمل تحذير
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: 'Please provide a reason' });

    const gracePeriod = new Date();
    gracePeriod.setHours(gracePeriod.getHours() + 24);

    user.moderation.blockStatus = 'warning';
    user.moderation.restrictionReason = reason;
    user.moderation.gracePeriodExpiresAt = gracePeriod;
    user.moderation.actionTriggeredBy = req.user?._id || null;
    await user.save();

    res.json({ message: 'Warning issued.', isBlocked: false, blockStatus: 'warning', gracePeriodExpiresAt: gracePeriod });

    sendPolicyWarningEmail(user.email, user.name, reason, gracePeriod)
      .then(() => console.log(`[Email] تم الإرسال إلى: ${user.email}`))
      .catch(err => console.error('خطأ في الإيميل:', err.message));

  } catch (err) {
    console.error("خطأ في حظر المستخدم:", err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// ── PUT /api/admin/users/:id ───────────────────────────────────────────────
// router.put('/users/:id', adminOnly, async (req, res) => {
//   try {
//     const { plan, isTrial, planEndsAt, isVerified, isAdmin, subscriptionType , startDate } = req.body

//     const targetUser = await User.findById(req.params.id)
//     if (!targetUser) return res.status(404).json({ message: 'User not found' })

//     const updateData = { isVerified, isAdmin, subscriptionType }

// // لو هو admin حالياً أو هيبقى admin بعد التعديل
// if (targetUser.isAdmin || isAdmin === true) {
//   updateData.plan           = 'enterprise' // الأدمن دايماً على باقة الـ enterprise
//   updateData.isTrial        = false
//   updateData.planEndsAt     = null
//   updateData.subscriptionType = 'none'
// } else {
//   updateData.plan       = plan
//   updateData.isTrial    = isTrial
//   updateData.planEndsAt = planEndsAt ?? null
// }

//     const user = await User.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true, select: '-password' }
//     )

//     res.json({ user })
//   } catch (err) {
//     console.error("=== خطأ في تعديل المستخدم ===", err.message)
//     res.status(500).json({ message: 'Server error', error: err.message })
//   }
// })

// ── DELETE /api/admin/users/:id ───────────────────────────────────────────────
router.delete('/users/:id', adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.isAdmin) return res.status(403).json({ message: 'Cannot delete an admin' })
    await user.deleteOne()
    res.json({ message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// ── GET /api/admin/plans ──────────────────────────────────────────────────────
router.get('/plans', adminOnly, async (req, res) => {
  try {
    const now = new Date()

    const [freeActive, proActive, enterpriseActive, expiredUsers] = await Promise.all([
      User.countDocuments({ isAdmin: { $ne: true }, plan: 'free', planEndsAt: { $gt: now }, 'deletionRequest.isDeleted': { $ne: true } }),
      User.countDocuments({ isAdmin: { $ne: true }, plan: 'pro', planEndsAt: { $gt: now }, 'deletionRequest.isDeleted': { $ne: true } }),
      User.countDocuments({ isAdmin: { $ne: true }, plan: 'enterprise', planEndsAt: { $gt: now }, 'deletionRequest.isDeleted': { $ne: true } }),
      User.countDocuments({ isAdmin: { $ne: true }, planEndsAt: { $lt: now }, 'deletionRequest.isDeleted': { $ne: true } })
    ])

    // كل الـ free users (active + expired) عشان الـ frontend يفلتر
    const trialUsersList = await User.find({ 
        isAdmin: { $ne: true },
        'deletionRequest.isDeleted': { $ne: true }
      })
      .select('name email plan planEndsAt isTrial isBlocked createdAt')
      .sort({ planEndsAt: -1 })
      .limit(100)

    res.json({ 
      counts: { 
        free: freeActive, 
        pro: proActive, 
        enterprise: enterpriseActive, 
        expired: expiredUsers 
      }, 
      trialUsersList
    })

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// ── GET /api/admin/trends ─────────────────────────────────────────────────────
router.get('/trends', adminOnly, async (req, res) => {
  try {
    const trends = await Trend.find().sort({ velocity: -1 }).limit(20)
    return res.json({ trends })
  } catch (err) {
    return res.json({
      trends: [
        { tag: '#رمضان_2026', velocity: 95, change: 'up', region: 'EG', source: 'fallback' },
        { tag: '#التسويق_الإلكتروني', velocity: 82, change: 'up', region: 'EG', source: 'fallback' },
        { tag: '#رياضة', velocity: 74, change: 'same', region: 'EG', source: 'fallback' },
      ],
      source: 'fallback',
    })
  }
})

// ── PUT /api/admin/users/:id/approve-deletion ───────────────────────────────
router.put('/users/:id/approve-deletion', adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        'deletionRequest.isAsked': false,  
        'deletionRequest.isDeleted': true        
      },
      { new: true }
    )
    
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ message: 'Approved & Soft Deleted Successfully', user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── PUT /api/admin/settings/trial-days ───────────────────────────────────────
router.put('/settings/trial-days', adminOnly, async (req, res) => {
  try {
    const { trialDays } = req.body

    if (!trialDays || trialDays < 1 || trialDays > 90)
      return res.status(400).json({ message: 'trialDays must be between 1 and 90' })

    const trialUsers = await User.find({ isTrial: true, plan: 'free' })

    const updates = trialUsers.map(async (user) => {
      const start = new Date(user.createdAt) // التعديل للاعتماد على createdAt
      const newEnd = new Date(start)
      newEnd.setDate(newEnd.getDate() + trialDays)

      user.planEndsAt = newEnd
      await user.save()

      sendTrialUpdateEmail(user.email, user.name, trialDays, newEnd)
        .catch(err => console.error(`Email error for ${user.email}:`, err.message))
    })

    await Promise.all(updates)

    res.json({ 
      message: `Updated ${trialUsers.length} users successfully`,
      updatedCount: trialUsers.length
    })

  } catch (err) {
    console.error('Trial update error:', err.message)
    res.status(500).json({ message: err.message })
  }
})
// ── PUT /api/admin/users/:id/approve-edit ───────────────────────────────
// router.put('/users/:id', adminOnly, async (req, res) => {
//   try {
//     const { plan, planEndsAt, isVerified, isAdmin, subscriptionType, startDate, isTrial } = req.body;

//     const settings = await PlatformSettings.findOne();
//     const defaultTrialDays = settings?.trialDays || 14; 

//     const targetUser = await User.findById(req.params.id);
//     if (!targetUser) return res.status(404).json({ message: 'User not found' });

//     const updateData = { isVerified, isAdmin, subscriptionType };

//     if (!isAdmin) {
//       updateData.plan = plan;
//       updateData.isTrial = (plan === 'free') ? true : (isTrial ?? false);
//       updateData.startDate = startDate;

//       if (plan !== 'free' && startDate && subscriptionType) {
//         // منطق الباقات المدفوعة
//         const start = new Date(startDate);
//         const newEnd = new Date(start);
        
//         if (subscriptionType === 'monthly') {
//           newEnd.setMonth(newEnd.getMonth() + 1);
//         } else if (subscriptionType === 'yearly') {
//           newEnd.setFullYear(newEnd.getFullYear() + 1);
//         }
//         updateData.planEndsAt = newEnd;
//       } else {
//         // منطق الباقة المجانية (Free) أو في حال غياب البيانات
//         const start = new Date(startDate || Date.now());
//         const newEnd = new Date(start);
//         newEnd.setDate(newEnd.getDate() + defaultTrialDays);
//         updateData.planEndsAt = newEnd; 
//       }
//     } else {
//       updateData.planEndsAt = null;
//       updateData.isTrial = false;
//     }

//     // بعد تحديث المستخدم:
// const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, select: '-password' });

// // إرسال الإيميل (بدون انتظار الإرسال لكي لا يتأخر رد السيرفر للمستخدم)
// if (user) {
//     sendPlanUpdateByEmail(
//         user.email,
//         user.name,
//         user.plan,
//         user.isTrial,
//         user.planEndsAt
//     ).catch(err => console.error('[Email] Error:', err.message));
// }

// res.json({ user });

//     res.json({ user });
//   } catch (err) {
//     console.error("=== خطأ في تعديل المستخدم ===", err.message);
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });
// 1. التأكد من الاستيراد في أعلى الملف

// 2. داخل مسار التحديث
router.put('/users/:id', adminOnly, async (req, res) => {
  try {
    const { plan, isVerified, isAdmin, subscriptionType, startDate, isTrial } = req.body;

    const settings = await PlatformSettings.findOne();
    const defaultTrialDays = settings?.trialDays || 14; 

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const updateData = { isVerified, isAdmin, subscriptionType };

    if (!isAdmin) {
      updateData.plan = plan;
      updateData.isTrial = (plan === 'free') ? true : (isTrial ?? false);
      updateData.startDate = startDate;

      if (plan !== 'free' && startDate && subscriptionType) {
        const start = new Date(startDate);
        const newEnd = new Date(start);
        if (subscriptionType === 'monthly') newEnd.setMonth(newEnd.getMonth() + 1);
        else if (subscriptionType === 'yearly') newEnd.setFullYear(newEnd.getFullYear() + 1);
        updateData.planEndsAt = newEnd;
      } else {
        const start = new Date(startDate || Date.now());
        const newEnd = new Date(start);
        newEnd.setDate(newEnd.getDate() + defaultTrialDays);
        updateData.planEndsAt = newEnd; 
      }
    } else {
      updateData.planEndsAt = null;
      updateData.isTrial = false;
    }

    // تحديث المستخدم في قاعدة البيانات
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, select: '-password' });

    // إرسال الرد للمتصفح (يتم إرساله مرة واحدة فقط)
    res.json({ user });

    // منطق الإيميل الذكي (يعمل في الخلفية ولا يؤخر رد السيرفر)
    if (user) {
        if (user.isAdmin && !targetUser.isAdmin) {
            // حالة الترقية لـ Admin
            sendAdminPromotionEmail(user.email, user.name).catch(err => 
                console.error('[Admin Promotion Email Error]:', err.message)
            );
        } else {
            // حالة تحديث الباقة (لا نرسل إيميل إذا كان مجرد تغيير بسيط غير مؤثر)
            sendPlanUpdateByEmail(
                user.email, 
                user.name, 
                user.plan, 
                user.isTrial, 
                user.planEndsAt
            ).catch(err => 
                console.error('[Plan Update Email Error]:', err.message)
            );
        }
    }

  } catch (err) {
    console.error("=== خطأ في تعديل المستخدم ===", err.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
});
module.exports = router;