// routes/payment.js
const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const protect = require("../middleware/auth");
const { User } = require("../models");
const { createNotification } = require("../services/notificationHelper");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ── Plan config (priceId من Stripe Dashboard) ─────────────────────────────────
const PLANS = {
  pro_monthly: { priceId: process.env.STRIPE_Pro_MONTHLY, plan: "pro" },
  pro_annual: { priceId: process.env.STRIPE_Pro_ANNUAL, plan: "pro" },
  enterprise_monthly: {
    priceId: process.env.STRIPE_Enterprise_MONTHLY,
    plan: "enterprise",
  },
  enterprise_annual: {
    priceId: process.env.STRIPE_Enterprise_ANNUAL,
    plan: "enterprise",
  },
};

// ── POST /api/payment/checkout — create Stripe Checkout session ───────────────
router.post("/checkout", protect, async (req, res) => {
  const { planKey } = req.body;
  const plan = PLANS[planKey];
  if (!plan) return res.status(400).json({ message: "Invalid plan" });

  const user = await User.findById(req.user._id);

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: String(user._id) },
    });
    customerId = customer.id;
    user.stripeCustomerId = customerId;
    await user.save();
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    metadata: { userId: String(user._id), planKey },
    subscription_data: {
      metadata: { userId: String(user._id), planKey },
    },
  });

  res.json({ url: session.url });
});

// ── POST /api/payment/portal ─────────────────────────────────────────────────
router.post("/portal", protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.stripeCustomerId)
    return res.status(400).json({ message: "No active subscription found" });

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.CLIENT_URL}/dashboard`,
  });
  res.json({ url: session.url });
});

// ── GET /api/payment/status ──────────────────────────────────────────────────
router.get("/status", protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.stripeCustomerId)
    return res.json({ plan: user.plan, status: "free", subscription: null });

  const subs = await stripe.subscriptions.list({
    customer: user.stripeCustomerId,
    status: "all",
    limit: 1,
    expand: ["data.default_payment_method"],
  });

  const sub = subs.data[0];
  if (!sub)
    return res.json({ plan: user.plan, status: "free", subscription: null });

  const pm = sub.default_payment_method;
  res.json({
    plan: user.plan,
    status: sub.status,
    subscription: {
      id: sub.id,
      currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      interval: sub.items.data[0]?.plan?.interval,
      card: pm?.card
        ? {
            brand: pm.card.brand,
            last4: pm.card.last4,
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
          }
        : null,
    },
  });
});

// ── POST /api/payment/webhook ─────────────────────────────────────────────────
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error("Webhook signature failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const data = event.data.object;

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const userId = data.metadata?.userId;

        // 1. استخراج الخطة بناءً على الـ priceId الفعلي (أدق وأمان من metadata)
        const currentPriceId = data.items?.data?.[0]?.price?.id;
        const planEntry = Object.entries(PLANS).find(
          ([key, val]) => val.priceId === currentPriceId,
        );
        const planKey = planEntry ? planEntry[0] : data.metadata?.planKey;
        const planName = PLANS[planKey]?.plan;

        if (!userId || !planName) break;

        // 2. حالة الاشتراك النشط أو التجريبي (شراء ناجح أو بداية تجربة)
        if (data.status === "active" || data.status === "trialing") {
          let planLimits = {};
          let subscriptionType =
            planKey.includes("annual") || planKey.includes("yearly")
              ? "yearly"
              : "monthly";

          if (planName === "pro") {
            planLimits = {
              maxAiImagesPerMonth: 30,
              maxPostsPerCalendar: 15,
              maxCalendarsPerMonth: 5,
              maxBrands: 3,
              advancedAnalytics: true,
              multiDialectSupport: true,
              automatedReels: false,
              prioritySupport: false,
            };
          } else if (planName === "enterprise") {
            planLimits = {
              maxAiImagesPerMonth: 999999,
              maxPostsPerCalendar: 30,
              maxCalendarsPerMonth: 999,
              maxBrands: 10,
              advancedAnalytics: true,
              multiDialectSupport: true,
              automatedReels: true,
              prioritySupport: true,
            };
          }

          await User.findByIdAndUpdate(userId, {
            plan: planName,
            subscriptionType: subscriptionType,
            planLimits: planLimits,
            planEndsAt: new Date(data.current_period_end * 1000),
            isTrial: data.status === "trialing", // تعيينها true إذا كانت فترة تجربة
            "usage.aiImagesGenerated": 0, // Mongoose سيتعامل معها كـ $set تلقائياً
          });

          console.log(`✅ User ${userId} set to ${planName} (${data.status})`);
        }
        // 3. حالة الإلغاء، انتهاء الصلاحية، أو فشل الدفع المتكرر (Downgrade to Free)
        else if (
          ["canceled", "unpaid", "incomplete_expired"].includes(data.status)
        ) {
          await User.findByIdAndUpdate(userId, {
            plan: "free",
            subscriptionType: null,
            planEndsAt: null,
            isTrial: false,
            // يمكنك هنا إعادة planLimits إلى قيم الخطة المجانية إذا كانت محفوظة لديك
          });
          console.log(
            `⚠️ User ${userId} subscription ${data.status}, downgraded to free`,
          );
        }
        break;
      }

      // 4. حالة الحذف النهائي للاشتراك (يحدث أحياناً بدلاً من canceled)
      case "customer.subscription.deleted": {
        const userId = data.metadata?.userId;
        if (userId) {
          await User.findByIdAndUpdate(userId, {
            plan: "free",
            subscriptionType: null,
            planEndsAt: null,
            isTrial: false,
          });
          console.log(
            `🗑️ User ${userId} subscription deleted, downgraded to free`,
          );
        }
        break;
      }

      case "invoice.paid": {
        const userId =
          data.metadata?.userId || data.subscription_details?.metadata?.userId;
        if (userId) {
          await User.findByIdAndUpdate(userId, {
            $set: {
              "usage.aiImagesGenerated": 0,
              "usage.postsGenerated": 0,
              "usage.calendarsCreated": 0,
            },
          });
          console.log(
            `♻️ Usage reset for user ${userId} after successful payment`,
          );
        }
        break;
      }
      
      case "invoice.payment_failed": {
        console.warn(`⚠️ Payment failed for customer: ${data.customer}`);
        break;
      }
    }

    res.json({ received: true });
  },
);

module.exports = router;
