// backend/routes/admin.js
const express   = require('express')
const router    = express.Router()
const adminOnly = require('../middleware/adminAuth')
const { User, Post, Brand,Trend } = require('../models')
const { sendPolicyWarningEmail } = require('../services/emailService'); // اتأكدي من المسار الصح للملف عندكِ
const { PlatformSettings } = require('../models')
// ── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', adminOnly, async (req, res) => {
  try {
    const now       = new Date()
    const last24h   = new Date(now - 24 * 60 * 60 * 1000)
    const lastWeek  = new Date(now - 7  * 24 * 60 * 60 * 1000)
    const prevWeek  = new Date(now - 14 * 24 * 60 * 60 * 1000)

    // 1. الفلتر الصافي للمستخدم النشط (مش ممسوح كدا وكدا، مش محظور، ومعندهوش warning)
    const activeUserFilter = { 
  // isDeleted: { $ne: true },     // مش ممسوح كدا وكدا
  // isBlocked: { $ne: true },     // مش محظور نهائي
  isVerified: true,             // مأكد الإيميل
  // blockStatus: { $ne: 'warning' }, // مش واخد تحذير (عشان بنعده لوحده)
  
  // 🌟 التعديل السحري: استبعاد أي حد طالب الحذف من قائمة النشطين
  // isAskToDelete: { $ne: true }  
}

    // 2. حساب الأرقام بأسماء صريحة لمنع لخبطة الـ v-for والترتيب
    const totalUsers           = await User.countDocuments(); // 14
    const blockedCount         = await User.countDocuments({ isBlocked: true }); // 0
    
    // 🌟 خانة الـ Deleted هتقرأ الحسابات اللي اتمسحت فعلياً كدا وكدا
    const deletedCount         = await User.countDocuments({ isDeleted: true }); 
    
    // خانة الـ Warned الصافية
    const warnedCount          = await User.countDocuments({ isDeleted: { $ne: true }, isBlocked: { $ne: true }, blockStatus: 'warning' }); 
    const isAskToDeleteCount    = await User.countDocuments({ isAskToDelete: true });
    const activeCount          = await User.countDocuments(activeUserFilter); 
    const adminCount           = await User.countDocuments({ isAdmin: true }); 
    
    const activeTrialUsers     = await User.countDocuments({ ...activeUserFilter, isTrial: true, trialEndsAt: { $gt: now } });
    const pendingVerifications = await User.countDocuments({ isDeleted: { $ne: true }, isBlocked: { $ne: true }, isVerified: false });

    const newUsersThisWeek     = await User.countDocuments({ ...activeUserFilter, createdAt: { $gte: lastWeek } });
    const newUsersPrevWeek     = await User.countDocuments({ ...activeUserFilter, createdAt: { $gte: prevWeek, $lt: lastWeek } });

    const registrationGrowth = newUsersPrevWeek > 0
      ? Math.round(((newUsersThisWeek - newUsersPrevWeek) / newUsersPrevWeek) * 100)
      : newUsersThisWeek > 0 ? 100 : 0

    // 3. الـ Response النهائي المبعوث بالأسماء الصريحة لتطابق الـ Vue
    res.json({
      totalUsers,
      newUsers24h: await User.countDocuments({ ...activeUserFilter, createdAt: { $gte: last24h } }),
      pendingVerifications,
      activeTrialUsers,
      newPostsLast24h: await Post?.countDocuments({ createdAt: { $gte: last24h } }).catch(() => 0),
      newUsersThisWeek,
      registrationGrowth,
      warnedCount,   // مبعوتة صريحة
      isAskToDeleteCount,
      activeCount,   // مبعوتة صريحة
      blockedCount,  // مبعوتة صريحة
      deletedCount,  // مبعوتة صريحة
      adminCount,
      serverUptime: Math.floor(process.uptime()),
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// ── GET routes/admin.js ──────────────────────────────────────────────────────
// جيب الـ settings الحالية
router.get('/settings', adminOnly, async (req, res) => {
  try {
    // لو مفيش settings اعمل واحدة بالـ defaults
    let settings = await PlatformSettings.findOne()
    if (!settings) settings = await PlatformSettings.create({})
    res.json({ settings })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// احفظ الـ settings
router.put('/settings', adminOnly, async (req, res) => {
  try {
    const { trialDays, blockByPhone, demoEnabled, otpExpiryMinutes, sendExpiryWarning } = req.body

    let settings = await PlatformSettings.findOne()
    if (!settings) settings = await PlatformSettings.create({})

    // حفظ كل الـ settings
    settings.trialDays         = trialDays
    settings.blockByPhone      = blockByPhone
    settings.demoEnabled       = demoEnabled
    settings.otpExpiryMinutes  = otpExpiryMinutes
    settings.sendExpiryWarning = sendExpiryWarning
    await settings.save()

    // لو trialDays اتغير — حدث كل الـ trial users
    const trialUsers = await User.find({ isTrial: true })
    const updates = trialUsers.map(async (user) => {
      const start  = new Date(user.trialStartDate)
      const newEnd = new Date(start)
      newEnd.setDate(newEnd.getDate() + trialDays)
      user.trialEndsAt      = newEnd
      user.trialDurationDays = trialDays
      await user.save()
      sendTrialUpdateEmail(user.email, user.name, trialDays, newEnd)
        .catch(err => console.error(`Email error:`, err.message))
    })
    await Promise.all(updates)

    res.json({ message: 'Settings saved', updatedUsers: trialUsers.length })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
// ── GET /api/admin/users ──────────────────────────────────────────────────────
router.get('/users', adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', plan } = req.query

    // 🌟 التعديل السحري: بنجيب فقط الناس اللي الـ isDeleted بتاعهم مش بـ true
    const query = {
      isDeleted: { $ne: true }
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

router.put('/users/:id/block', adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isAdmin) return res.status(403).json({ message: 'Cannot block an admin' });

    // === فك الحظر أو فك التحذير ===
    if (user.isBlocked || user.blockStatus === 'warning') {
      user.isBlocked = false;
      user.blockStatus = 'none';
      user.restrictionReason = null;
      user.gracePeriodExpiresAt = null;
      user.actionTriggeredBy = null;
      await user.save();
      return res.json({ message: 'User is now active', isBlocked: false, blockStatus: 'none' });
    }

    // === عمل تحذير ===
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: 'Please provide a reason' });

    const gracePeriod = new Date();
    gracePeriod.setHours(gracePeriod.getHours() + 24);

    user.blockStatus = 'warning';
    user.restrictionReason = reason;
    user.gracePeriodExpiresAt = gracePeriod;
    user.actionTriggeredBy = req.user?._id || null;
    await user.save();

    // ✅ ارد فوراً — الإيميل في الـ background
    res.json({ message: 'Warning issued.', isBlocked: false, blockStatus: 'warning', gracePeriodExpiresAt: gracePeriod });

    // ✅ بعد الـ response — من غير await
    sendPolicyWarningEmail(user.email, user.name, reason, gracePeriod)
      .then(() => console.log(`[Email] تم الإرسال إلى: ${user.email}`))
      .catch(err => console.error('خطأ في الإيميل:', err.message));

  } catch (err) {
    console.error("خطأ في حظر المستخدم:", err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── PUT /api/admin/users/:id ──────────────────────────────────────────────────
router.put('/users/:id', adminOnly, async (req, res) => {
  try {
    // 1. أضفنا isAdmin هنا عشان السيرفر يتعرف عليها وميجيبش Not Defined
    const { plan, isTrial, trialEndsAt, isVerified, isAdmin } = req.body
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { plan, isTrial, trialEndsAt, isVerified, isAdmin }, // كدا بقت متباصية صح وموجودة فوق
      { new: true, select: '-password' }
    )
    
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err) {
    console.error("=== خطأ في تعديل المستخدم ===", err.message)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

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
    const [free, trial, pro, enterprise, expiredTrials] = await Promise.all([
      User.countDocuments({ plan: 'free',       isTrial: { $ne: true } }),
      User.countDocuments({ isTrial: true,       trialEndsAt: { $gt: now } }),
      User.countDocuments({ plan: 'pro' }),
      User.countDocuments({ plan: 'enterprise' }),
      // User.countDocuments({ isTrial: true,       trialEndsAt: { $lt: now } }),
    ])

    const trialUsers = await User.find({ isTrial: true })
      .select('name email trialEndsAt plan isBlocked createdAt isDeleted')
      .sort({ trialEndsAt: 1 })
      .limit(50)

    res.json({ counts: { free, trial, pro, enterprise, expiredTrials }, trialUsers })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// ── GET /api/admin/trends ─────────────────────────────────────────────────────
router.get('/trends', adminOnly, async (req, res) => {
  try {
    // Pull from your existing trends collection
    
    // The Trend model uses `tag`, `change`, `velocity`, `region`, `source`.
    // Sort by `velocity` (most relevant) and return latest 20.
    const trends = await Trend.find().sort({ velocity: -1 }).limit(20)
    console.log('✅ التريندز اللي جت من الداتا بيز:', trends)
    return res.json({ trends })
  } catch (err) {
    // Fallback mock if Trend model doesn't exist yet
    console.log("❌ الإيرور الحقيقي هو:", err);
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
// 🌟 ضيفي السطر ده فوق خالص في أول الملف مع الـ Requires
const { sendTrialUpdateEmail } = require('../services/emailService')

// الـ Route المعدل بالملي عشان يقلب true بجد في الـ DB
router.put('/users/:id/approve-deletion', adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        isAskToDelete: false,  // خلاص شيلناه من قائمة الطلبات
        isDeleted: true        // 🌟 التعديل السحري: كدا اتمسح كدا وكدا بجد في الـ DB ولما تعملي ريفريش مش هيرجع!
      },
      { new: true }
    )
    
    if (!user) return res.status(404).json({ message: 'User not found' })
    
    res.json({ message: 'Approved & Soft Deleted Successfully', user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
// PUT /api/admin/settings/trial-days
router.put('/settings/trial-days', adminOnly, async (req, res) => {
  try {
    const { trialDays } = req.body

    // تأكد إن الرقم صح
    if (!trialDays || trialDays < 1 || trialDays > 90)
      return res.status(400).json({ message: 'trialDays must be between 1 and 90' })

    // جيب كل الـ users اللي لسه في التجربة
    const trialUsers = await User.find({ isTrial: true })

    // لكل user احسب trialEndsAt جديد بناءً على trialStartDate + العدد الجديد
    const updates = trialUsers.map(async (user) => {
      const start = new Date(user.trialStartDate)
      const newEnd = new Date(start)
      newEnd.setDate(newEnd.getDate() + trialDays)

      user.trialEndsAt = newEnd
      user.trialDurationDays = trialDays
      await user.save()

      // بعت إيميل في الـ background من غير await
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

module.exports = router
