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
const cron = require("node-cron");
const { User, PlatformSettings } = require("./models");
const posterRoutes = require("./routes/posterRouter");

const app = express();
const {
  sendTrialExpiryWarningEmail,
  sendScheduledPostReminderEmail,
  sendScheduledPostTomorrowEmail,
} = require("./services/emailService");
const contactRouter = require("./routes/contact");
// ---------------------------------
const passport = require('passport');
require('./config/passport'); // استدعاء ملف الإعدادات
// السكريبت ده هيشتغل تلقائياً لوحده كل يوم الساعة 12 بالليل بتوقيت السيرفر
cron.schedule('0 0 * * *', () => {
  console.log('⏰ جاري تشغيل فحص انتهاء فترات التجربة للمستخدمين...');
  checkAndSendExpiryWarnings();
});
// بيشتغل كل يوم الساعة 9 الصبح
cron.schedule("0 9 * * *", async () => {
  try {
    const settings = await PlatformSettings.findOne();
    if (!settings?.sendExpiryWarning) return; // لو الـ feature متوقف

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const startOfDay = new Date(threeDaysFromNow.setHours(0, 0, 0, 0));
    const endOfDay = new Date(threeDaysFromNow.setHours(23, 59, 59, 999));

    // جيب الـ users اللي trial بتاعهم هينتهي بعد 3 أيام بالظبط
    const users = await User.find({
      isTrial: true,
      trialEndsAt: { $gte: startOfDay, $lte: endOfDay },
    });

    users.forEach((user) => {
      sendTrialExpiryWarningEmail(
        user.email,
        user.name,
        user.trialEndsAt,
      ).catch((err) =>
        console.error(`Expiry email error for ${user.email}:`, err.message),
      );
    });

    console.log(`[Cron] Sent expiry warning to ${users.length} users`);
  } catch (err) {
    console.error("[Cron] Error:", err.message);
  }
});

/// ── Scheduled Post Reminders — runs every day at 8:00 AM ─────────────────────
cron.schedule("0 8 * * *", async () => {
  try {
    const { Post, User, Notification } = require("./models");

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const tomorrowStart = new Date();
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date();
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const todaysPosts = await Post.find({
      status: "scheduled",
      scheduledAt: { $gte: todayStart, $lte: todayEnd },
    }).populate({
      path: "calendar",
      populate: { path: "user", model: "User" },
    });

    const tomorrowsPosts = await Post.find({
      status: "scheduled",
      scheduledAt: { $gte: tomorrowStart, $lte: tomorrowEnd },
    }).populate({
      path: "calendar",
      populate: { path: "user", model: "User" },
    });

    function groupByUser(posts) {
      const byUser = {};
      for (const post of posts) {
        const user = post.calendar?.user;
        if (!user) continue;
        const uid = user._id.toString();
        if (!byUser[uid]) byUser[uid] = { user, posts: [] };
        byUser[uid].posts.push(post);
      }
      return byUser;
    }

    for (const { user, posts } of Object.values(groupByUser(todaysPosts))) {
      sendScheduledPostReminderEmail(user.email, user.name, posts).catch(
        (err) =>
          console.error(
            `[Cron] Today email failed for ${user.email}:`,
            err.message,
          ),
      );
      await Notification.create({
        user: user._id,
        title: "📅 منشورات مجدولة اليوم",
        message: `لديك ${posts.length} منشور مجدول اليوم. لا تنسَ نشرها!`,
        type: "scheduled_today",
        read: false,
        postId: posts[0]._id
      });
      console.log(
        `[Cron] Today reminder → ${user.email} (${posts.length} posts)`,
      );
    }

    for (const { user, posts } of Object.values(groupByUser(tomorrowsPosts))) {
      sendScheduledPostTomorrowEmail(user.email, user.name, posts).catch(
        (err) =>
          console.error(
            `[Cron] Tomorrow email failed for ${user.email}:`,
            err.message,
          ),
      );
      await Notification.create({
        user: user._id,
        title: "⏰ منشورات مجدولة غداً",
        message: `لديك ${posts.length} منشور مجدول غداً. استعد لنشرها!`,
        type: "scheduled_tomorrow",
      });
      console.log(
        `[Cron] Tomorrow reminder → ${user.email} (${posts.length} posts)`,
      );
    }
  } catch (err) {
    console.error("[Cron] Scheduled post reminder error:", err.message);
  }
});
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
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

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
// app.use("/", require("./routes/admin"));
app.use("/api/stats", require("./routes/stats"));
app.use("/api/connections", require("./routes/connections"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/top-posts", require("./routes/topPosts"));
// Mount poster routes at /api/posters
app.use("/api/posters", posterRoutes);
// Serve generated images statically
app.use(
  "/uploads/generated",
  express.static(path.join(__dirname, "uploads", "generated")),
);
app.use(passport.initialize());
app.use('/api/auth', require('./routes/auth'));
// ── Health check — frontend pings this to check if server is up ───────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "ContentForge API",
    timestamp: new Date().toISOString(),
    mongo: "connected",
  }); // Serve generated images statically
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
  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log(
        "=== [Cron Job] جاري فحص الحسابات المستحقة للحظر التلقائي... ===",
      );
      const now = new Date();

      // 1. بندور على المستخدمين اللي حالتهم warning وفترة السماح بتاعتهم خلصت
      const usersToBlock = await User.find({
        blockStatus: "warning",
        gracePeriodExpiresAt: { $lte: now }, // $lte تعني أصغر من أو يساوي الوقت الحالي
        // الداتا بيز بترجع لنا "قائمة" (Array) فيها كل المستخدمين اللي انطبقت عليهم الشروط دي
      });

      if (usersToBlock.length > 0) {
        const userIds = usersToBlock.map((user) => user._id);

        // 2. بنحولهم كلهم لـ blocked وبنخلي الـ isBlocked بـ true في خطوة واحدة
        await User.updateMany(
          { _id: { $in: userIds } },
          {
            $set: {
              blockStatus: "blocked",
              isBlocked: true,
              gracePeriodExpiresAt: null, // بنصفر الوقت لأنه خلاص اتقفل
            },
          },
        );

        console.log(
          `[Cron Job] تم حظر ${usersToBlock.length} مستخدمين تلقائياً.`,
        );
      }
    } catch (error) {
      console.error("خطأ في الـ Cron Job:", error.message);
    }
  });
  // ============================================================================
});
cron.schedule("0 * * * *", async () => {
  await User.deleteMany({
    isVerified: false,
    verificationCodeExpires: { $lt: new Date() },
  });
  console.log("[Cron] Cleaned unverified expired users");
});
