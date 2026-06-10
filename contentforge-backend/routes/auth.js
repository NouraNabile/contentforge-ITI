// backend/routes/auth.js
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { User, DeletionRequest } = require('../models')
const protect = require('../middleware/auth')
const { sendVerificationEmail } = require("../services/emailService");
const { sendDeletionRequestEmail } = require('../services/emailService')
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

const { PlatformSettings } = require('../models')

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body
    if (!name || !email || !password || !phone)
      return res.status(400).json({ message: 'All fields required' })

    // جيب الـ settings من DB
    const settings = await PlatformSettings.findOne() || {}
    const blockByPhone = settings.blockByPhone ?? true
    const otpExpiryMinutes = settings.otpExpiryMinutes ?? 10

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' })

    // بيشوف blockByPhone من الـ settings مش hardcoded
    if (blockByPhone && await User.findOne({ phone }))
      return res.status(400).json({ message: 'This phone has already been used for a trial.' })

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const trialDays = settings.trialDays ?? 14
    const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000)

    const user = await User.create({
      name, email, password, phone,
      verificationCode,
      // بياخد الـ otpExpiryMinutes من الـ settings
      verificationCodeExpires: Date.now() + otpExpiryMinutes * 60 * 1000,
      isVerified: false,
      isTrial: true,
      trialEndsAt,
      hasUsedTrial: true,
    })

    await sendVerificationEmail(email, verificationCode)
    res.status(201).json({ message: 'User created. Please verify your email.' })
  } catch (err) {
    console.error('REGISTER ERROR:', err)
    res.status(500).json({ message: err.message })
  }
})

router.post("/verify-email", async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.status(404).json({ message: "User not found" });

  if (
    user.verificationCode !== code ||
    user.verificationCodeExpires < Date.now()
  ) {
    return res.status(400).json({ message: "Invalid or expired code" });
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;

  await user.save();

  res.json({ message: "Email verified successfully" });
  // router.push('/dashboard')
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Invalid email or password' });

  // ❗ مهم جدًا
  if (!user.isVerified)
    return res.status(403).json({ message: 'Please verify your email first' });

  if (user.isBlocked)
    return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });

  user.lastLoginAt = new Date()   // ← add this
  await user.save()
  const token = signToken(user._id);

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      isAdmin: user.isAdmin
    }
  });
});
// GET /api/auth/me — get current user profile
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user })
})

// طريق الديمو الجديد
// طريق الديمو الجديد
// طريق الديمو الجديد والمؤمن بالكامل
router.post('/demo', async (req, res) => {
  try {
    const settings = await PlatformSettings.findOne()
    if (settings && !settings.demoEnabled)
      return res.status(403).json({ message: 'Demo account is currently disabled.' })

    const demoEmail = 'demo@arabycoffee.com'
    let user = await User.findOne({ email: demoEmail })

    if (!user) {
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 14)
      user = await User.create({
        name: 'Demo User',
        email: demoEmail,
        password: 'secure_demo_password_123',
        phone: '00000000000',
        plan: 'free',
        isVerified: true,
        isTrial: true,
        trialEndsAt,
        hasUsedTrial: true
      })
    }

    if (Date.now() > new Date(user.trialEndsAt))
      return res.status(403).json({ message: 'Your 14-day free trial has expired.' })

    const token = signToken(user._id)
    return res.status(200).json({
      success: true, token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
// backend/routes/auth.js
router.get('/notifications', protect, async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('blockStatus restrictionReason gracePeriodExpiresAt')

  const notifs = []

  if (user.blockStatus === 'warning') {
    notifs.push({
      id: 'warning-1',
      type: 'warning',
      icon: '⚠️',
      title: 'تحذير: مخالفة سياسة الاستخدام',
      message: `سبب التحذير: ${user.restrictionReason}. لديك حتى ${new Date(user.gracePeriodExpiresAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })} قبل الحظر النهائي.`,
      time: 'Just now',
      read: false,
    })
  }

  res.json({ notifications: notifs })
})
// مثال سريع لـ Route الموافقة على الحذف (خاص بالأدمن فقط)
router.post('/deletion-request', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (user.isAskToDelete)
      return res.status(400).json({ message: 'Request already submitted' })

    user.isAskToDelete = true
    user.deletionReason = req.body.reason || null
    await user.save()

    sendDeletionRequestEmail(user.name, user.email, req.body.reason)
      .catch(err => console.error('Email error:', err.message))

    res.json({ message: 'Request submitted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })

    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.isVerified) return res.status(400).json({ message: 'Already verified' })

    // جيب الـ settings عشان تاخد otpExpiryMinutes
    const settings = await PlatformSettings.findOne()
    const otpExpiryMinutes = settings?.otpExpiryMinutes ?? 10

    // جدد الـ OTP
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    user.verificationCode = verificationCode
    user.verificationCodeExpires = Date.now() + otpExpiryMinutes * 60 * 1000
    await user.save()

    await sendVerificationEmail(email, verificationCode)

    res.json({ message: 'New OTP sent successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields required' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({ message: 'Password changed successfully' })
  } catch (err) {
    console.error('CHANGE PASSWORD ERROR:', err)
    res.status(500).json({ message: err.message })
  }
})
module.exports = router
