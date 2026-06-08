// backend/routes/auth.js
const express = require('express')
const router  = express.Router()
const jwt     = require('jsonwebtoken')
const { User } = require('../models')
const protect = require('../middleware/auth')
const sendVerificationEmail = require("../services/emailService");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone)
      return res
        .status(400)
        .json({ message: "Name, email, password and phone are required" });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already registered" });

    if (await User.findOne({ phone }))
      return res
        .status(400)
        .json({
          message:
            "This phone number has already been used for a trial periods.",
        });

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      phone,
      verificationCode,
      verificationCodeExpires: Date.now() + 10 * 60 * 1000,
      isVerified: false,
      isTrial: true,
      trialEndsAt,
      hasUsedTrial: true,
    });

    // ✅ تأكد إن الإيميل اتبعت قبل ما ترد
    await sendVerificationEmail(email, verificationCode);

    res
      .status(201)
      .json({ message: "User created. Please verify your email first." });
  } catch (err) {
    // ✅ هيطبع السبب الحقيقي في الـ terminal
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

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
    const demoEmail = "demo@arabycoffee.com";

    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);

      user = await User.create({
        name: "Demo User",
        email: demoEmail,
        password: "secure_demo_password_123",
        phone: "00000000000",
        plan: "free",
        isVerified: true,
        isTrial: true,
        trialEndsAt,        // ← same field the protect middleware checks
        hasUsedTrial: true
      });
    }

    // Check expiry using the same logic as protect middleware
    if (Date.now() > new Date(user.trialEndsAt)) {
      return res.status(403).json({ 
        message: "Your 14-day free trial has expired. Please upgrade your plan." 
      });
    }

    const token = signToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan
      }
    });

  } catch (error) {
    console.error("Error in demo login route:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router
