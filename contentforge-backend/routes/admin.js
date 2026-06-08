// backend/routes/admin.js
const express   = require('express')
const router    = express.Router()
const adminOnly = require('../middleware/adminAuth')
const { User, Post, Brand,Trend } = require('../models')

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', adminOnly, async (req, res) => {
  try {
    const now       = new Date()
    const last24h   = new Date(now - 24 * 60 * 60 * 1000)
    const lastWeek  = new Date(now - 7  * 24 * 60 * 60 * 1000)
    const prevWeek  = new Date(now - 14 * 24 * 60 * 60 * 1000)

    const newUsers24h = await User.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }});
    const [
      totalUsers,
      activeTrialUsers,
      pendingVerifications,
      newPostsLast24h,
      newUsersThisWeek,
      newUsersPrevWeek,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isTrial: true, trialEndsAt: { $gt: now } }),
      User.countDocuments({ isVerified: false }),
      Post?.countDocuments({ createdAt: { $gte: last24h } }).catch(() => 0),
      User.countDocuments({ createdAt: { $gte: lastWeek } }),
      User.countDocuments({ createdAt: { $gte: prevWeek, $lt: lastWeek } }),
      // User.countDocuments({ lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }})
    ])

    const registrationGrowth = newUsersPrevWeek > 0
      ? Math.round(((newUsersThisWeek - newUsersPrevWeek) / newUsersPrevWeek) * 100)
      : newUsersThisWeek > 0 ? 100 : 0

    res.json({
      totalUsers,
      newUsers24h,
      pendingVerifications,
      newPostsLast24h,
      newUsersThisWeek,
      registrationGrowth,
      serverUptime: Math.floor(process.uptime()),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// ── GET /api/admin/users ──────────────────────────────────────────────────────
router.get('/users', adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', plan } = req.query

    const query = {}
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
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.isAdmin) return res.status(403).json({ message: 'Cannot block an admin' })

    user.isBlocked = !user.isBlocked
    await user.save()

    res.json({ message: user.isBlocked ? 'User blocked' : 'User unblocked', isBlocked: user.isBlocked })
  } catch (err) {
    console.error("=== خطأ في حظر المستخدم ===", err.message)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

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
      .select('name email trialEndsAt plan isBlocked createdAt')
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

module.exports = router
