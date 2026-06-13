// backend/middleware/subscription.js
const { User } = require("../models");

// Middleware عام للتحقق من الخطة
const checkPlan = (requiredPlans) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);

      if (!requiredPlans.includes(user.plan)) {
        return res.status(403).json({
          success: false,
          message: `This feature requires ${requiredPlans.join(" or ")} plan`,
          reason: "feature_locked", // ← أضف ده
          currentPlan: user.plan,
          upgradeRequired: true,
          upgradeUrl: "/payment", // ← أضف ده
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
};

// ✅ Middleware محدث - يمنع الـ Free plan تماماً
const checkPosterLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    // 🔒 منع الـ Free plan تماماً
    if (user.plan === 'free' || !user.plan) {
      return res.status(403).json({
        success: false,
        message: 'Poster generation is not available on the Free plan. Please upgrade to Pro or Enterprise.',
        reason: 'feature_locked',  // ← مهم جداً! عشان الـ frontend يوجهه لـ /payment
        currentPlan: user.plan || 'free',
        upgradeRequired: true,
        upgradeUrl: '/payment',  // ← يوجهه لصفحة الـ Payment
      });
    }

    // ✅ التحقق من الـ limits للـ Pro و Enterprise
    const limit = user.planLimits?.maxAiImagesPerMonth || 30;
    const usage = user.usage?.aiImagesGenerated || 0;

    if (usage >= limit) {
      return res.status(403).json({
        success: false,
        message: `You have reached your poster generation limit (${usage}/${limit}). Please upgrade your plan for more.`,
        reason: 'feature_locked',  // ← مهم جداً!
        currentUsage: usage,
        limit: limit,
        currentPlan: user.plan,
        upgradeRequired: true,
        upgradeUrl: '/payment',  // ← يوجهه لصفحة الـ Payment
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Middleware للتحقق من Calendar Limit
const checkCalendarLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const limit = user.planLimits?.maxCalendarsPerMonth || 1;
    const usage = user.usage?.calendarsCreated || 0;

    if (usage >= limit) {
      return res.status(403).json({
        success: false,
        message: `You have reached your calendar creation limit (${usage}/${limit}). Upgrade Your Plan for more.`,
        reason: 'feature_locked',
        currentUsage: usage,
        limit: limit,
        upgradeRequired: true,
        upgradeUrl: '/payment',
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Middleware للتحقق من Posts Limit
const checkPostsLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    // الحصول على الحد المسموح من الـ planLimits
    const limit = user.planLimits?.maxPostsPerCalendar || 5;
    const usage = user.usage?.postsGenerated || 0;

    if (usage >= limit) {
      return res.status(403).json({
        success: false,
        message: `You have reached your posts generation limit (${usage}/${limit}). Upgrade Your Plan for more.`,
        reason: 'feature_locked',
        currentUsage: usage,
        limit: limit,
        currentPlan: user.plan,
        upgradeRequired: true,
        upgradeUrl: '/payment',
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Middleware جديد لزيادة الـ usage
const checkCalendarPostsLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const limit = user.planLimits?.maxPostsPerCalendar || 5;
    const currentUsage = user.usage?.postsGenerated || 0;
    const remainingPosts = limit - currentUsage;

    if (remainingPosts <= 0) {
      return res.status(403).json({
        success: false,
        message: `You have reached your posts limit (${currentUsage}/${limit}). Upgrade Your Plan for more.`,
        reason: "feature_locked",
        currentUsage: currentUsage,
        limit: limit,
        upgradeRequired: true,
        upgradeUrl: "/payment",
      });
    }

    // احفظ الـ remaining posts في الـ request عشان نستخدمه في الـ route
    req.remainingPostsLimit = remainingPosts;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Middleware جديد لزيادة الـ usage
const incrementUsage = (field = "aiImagesGenerated") => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);

      // زيادة العداد
      user.usage[field] = (user.usage[field] || 0) + 1;
      await user.save();
      console.log(`✅ Incremented ${field} for user ${user.email}. New value: ${user.usage[field]}`);
      next();
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
};

// ✅ Middleware لإعادة تعيين الـ usage كل شهر
const resetMonthlyUsage = async () => {
  try {
    const now = new Date();
    const users = await User.find({});

    for (const user of users) {
      const lastReset = user.usage.lastUsageReset || new Date(0);
      const daysSinceReset = (now - lastReset) / (1000 * 60 * 60 * 24);

      if (daysSinceReset >= 30) {
        user.usage.aiImagesGenerated = 0;
        user.usage.postsGenerated = 0;
        user.usage.calendarsCreated = 0;
        user.usage.lastUsageReset = now;
        await user.save();
        console.log(`🔄 Reset usage for user: ${user.email}`);
      }
    }
  } catch (error) {
    console.error("Error resetting monthly usage:", error);
  }
};

module.exports = {
  checkPlan,
  checkPosterLimit,
  checkCalendarLimit,
  checkPostsLimit,
  checkCalendarPostsLimit,
  incrementUsage,
  resetMonthlyUsage,
};
