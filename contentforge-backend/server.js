// backend/server.js
require("dotenv").config();
require("express-async-errors");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); 
const connectDB = require("./config/db");
const { startTrendScheduler } = require("./services/trendService");
const chatRoutes = require("./routes/chat");
// يحسب 24h 
const cron = require('node-cron');
const { User,PlatformSettings } = require('./models');const posterRoutes = require("./routes/posterRouter");

const app = express()
const { sendTrialExpiryWarningEmail, sendScheduledPostReminderEmail } = require('./services/emailService')

// بيشتغل كل يوم الساعة 9 الصبح
cron.schedule('0 9 * * *', async () => {
  try {
    const settings = await PlatformSettings.findOne()
    if (!settings?.sendExpiryWarning) return  // لو الـ feature متوقف

    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    const startOfDay = new Date(threeDaysFromNow.setHours(0, 0, 0, 0))
    const endOfDay   = new Date(threeDaysFromNow.setHours(23, 59, 59, 999))

    // جيب الـ users اللي trial بتاعهم هينتهي بعد 3 أيام بالظبط
    const users = await User.find({
      isTrial: true,
      trialEndsAt: { $gte: startOfDay, $lte: endOfDay }
    })

    users.forEach(user => {
      sendTrialExpiryWarningEmail(user.email, user.name, user.trialEndsAt)
        .catch(err => console.error(`Expiry email error for ${user.email}:`, err.message))
    })

    console.log(`[Cron] Sent expiry warning to ${users.length} users`)
  } catch (err) {
    console.error('[Cron] Error:', err.message)
  }
})

// ── Scheduled Post Reminder — runs every day at 8:00 AM ──────────────────────
cron.schedule('0 8 * * *', async () => {
  try {
    const { Post, Calendar, User } = require('./models')
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay   = new Date(today.setHours(23, 59, 59, 999))

    // Find all posts scheduled for today that are not yet published
    const todaysPosts = await Post.find({
      status: 'scheduled',
      scheduledAt: { $gte: startOfDay, $lte: endOfDay }
    }).populate({
      path: 'calendar',
      populate: { path: 'user', model: 'User' }
    })

    if (!todaysPosts.length) {
      console.log('[Cron] No scheduled posts for today')
      return
    }

    // Group posts by user
    const byUser = {}
    for (const post of todaysPosts) {
      const user = post.calendar?.user
      if (!user) continue
      const uid = user._id.toString()
      if (!byUser[uid]) byUser[uid] = { user, posts: [] }
      byUser[uid].posts.push(post)
    }

    // Send one email per user with all their posts for today
    for (const { user, posts } of Object.values(byUser)) {
      sendScheduledPostReminderEmail(user.email, user.name, posts)
        .then(() => console.log(`[Cron] Reminder sent to ${user.email} — ${posts.length} posts`))
        .catch(err => console.error(`[Cron] Email failed for ${user.email}:`, err.message))
    }

  } catch (err) {
    console.error('[Cron] Scheduled post reminder error:', err.message)
  }
})
// ── Connect to MongoDB Atlas ──────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then((conn) => {
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    startTrendScheduler();
  })
  .catch((error) => {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.error("👉 Check your MONGO_URI in the .env file");
    process.exit(1);
  });

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// ── Stripe webhook needs raw body — MUST be before express.json ──────────────
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }))

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files publicly (brand guidelines PDFs, images)
app.use("/uploads", express.static("uploads"));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/brand", require("./routes/brand"));
app.use("/api/calendar", require("./routes/calendar"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/trends", require("./routes/trends"));
app.use("/api/chat", chatRoutes);
app.use("/api/admin", require("./routes/admin"));
app.use("/api/stats", require("./routes/stats"));
app.use("/api/connections", require("./routes/connections"));
app.use("/api/payment", require("./routes/payment"));
// Mount poster routes at /api/posters
app.use("/api/posters", posterRoutes);
// Serve generated images statically
app.use("/uploads/generated", express.static(path.join(__dirname, "uploads", "generated")));

// ── Health check — frontend pings this to check if server is up ───────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "ContentForge API",
    timestamp: new Date().toISOString(),
    mongo: "connected",
  });// Serve generated images statically
  
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 ContentForge API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
  // ==================== الـ Cron Job الخاص بالحظر التلقائي ====================
  // '*/5 * * * *' تعني أن الكود سيشتغل تلقائياً كل 5 دقائق ليفحص الداتا بيز
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('=== [Cron Job] جاري فحص الحسابات المستحقة للحظر التلقائي... ===');
      const now = new Date();

      // 1. بندور على المستخدمين اللي حالتهم warning وفترة السماح بتاعتهم خلصت
      const usersToBlock = await User.find({
        blockStatus: 'warning',
        gracePeriodExpiresAt: { $lte: now } // $lte تعني أصغر من أو يساوي الوقت الحالي
        // الداتا بيز بترجع لنا "قائمة" (Array) فيها كل المستخدمين اللي انطبقت عليهم الشروط دي
      });

      if (usersToBlock.length > 0) {
        const userIds = usersToBlock.map(user => user._id);
        
        // 2. بنحولهم كلهم لـ blocked وبنخلي الـ isBlocked بـ true في خطوة واحدة
        await User.updateMany(
          { _id: { $in: userIds } },
          {
            $set: {
              blockStatus: 'blocked',
              isBlocked: true,
              gracePeriodExpiresAt: null // بنصفر الوقت لأنه خلاص اتقفل
            }
          }
        );

        console.log(`[Cron Job] تم حظر ${usersToBlock.length} مستخدمين تلقائياً.`);
      }
    } catch (error) {
      console.error('خطأ في الـ Cron Job:', error.message);
    }
  });
  // ============================================================================
});


