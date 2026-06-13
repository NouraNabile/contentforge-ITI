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
        const planKey = data.metadata?.planKey;
        const planName = PLANS[planKey]?.plan;

        if (userId && planName && data.status === "active") {
          await User.findByIdAndUpdate(userId, {
            plan: planName,
            isTrial: false,
          });
          console.log(`✅ User ${userId} upgraded to ${planName}`);

          // Notify admins and user about subscription upgrade (INSIDE the case block, BEFORE break)
          try {
            const changedUser = await User.findById(userId);
            if (changedUser) {
              const admins = await User.find({ isAdmin: true });
              for (const admin of admins) {
                await createNotification({
                  recipientId: admin._id,
                  recipientRole: "admin",
                  type: "subscription_changed",
                  title: "Subscription Upgraded",
                  message: `${changedUser.name} (${changedUser.email}) upgraded to ${planName} plan.`,
                  meta: { userId, planName, subscriptionId: data.id },
                });
              }
              // Also notify the user
              await createNotification({
                recipientId: changedUser._id,
                recipientRole: "user",
                type: "plan_updated",
                title: "Welcome to Your New Plan!",
                message: `Your subscription has been upgraded to ${planName}. Enjoy the new features!`,
                meta: { plan: planName },
              });
            }
          } catch (err) {
            console.error("[Notify] Subscription notification failed:", err.message);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const userId = data.metadata?.userId;
        if (userId) {
          await User.findByIdAndUpdate(userId, { plan: "free" });
          console.log(`🔴 User ${userId} subscription canceled → free`);
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
