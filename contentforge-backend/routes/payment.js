// routes/payment.js
const express  = require('express')
const router   = express.Router()
const Stripe   = require('stripe')
const protect  = require('../middleware/auth')
const { User } = require('../models')

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

// ── Plan config (priceId من Stripe Dashboard) ─────────────────────────────────
const PLANS = {
  starter_monthly: { priceId: process.env.STRIPE_STARTER_MONTHLY, plan: 'starter' },
  starter_annual:  { priceId: process.env.STRIPE_STARTER_ANNUAL,  plan: 'starter' },
  growth_monthly:  { priceId: process.env.STRIPE_GROWTH_MONTHLY,  plan: 'growth'  },
  growth_annual:   { priceId: process.env.STRIPE_GROWTH_ANNUAL,   plan: 'growth'  },
  agency_monthly:  { priceId: process.env.STRIPE_AGENCY_MONTHLY,  plan: 'agency'  },
  agency_annual:   { priceId: process.env.STRIPE_AGENCY_ANNUAL,   plan: 'agency'  },
}

// ── POST /api/payment/checkout — create Stripe Checkout session ───────────────
router.post('/checkout', protect, async (req, res) => {
  const { planKey } = req.body   // e.g. "growth_monthly"
  const plan = PLANS[planKey]
  if (!plan) return res.status(400).json({ message: 'Invalid plan' })

  const user = await User.findById(req.user._id)

  // Create or reuse Stripe customer
  let customerId = user.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name:  user.name,
      metadata: { userId: String(user._id) },
    })
    customerId = customer.id
    user.stripeCustomerId = customerId
    await user.save()
  }

  const session = await stripe.checkout.sessions.create({
    customer:             customerId,
    payment_method_types: ['card'],
    mode:                 'subscription',
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${process.env.CLIENT_URL}/payment/cancel`,
    metadata:    { userId: String(user._id), planKey },
    subscription_data: {
      metadata: { userId: String(user._id), planKey },
    },
  })

  res.json({ url: session.url })
})

// ── POST /api/payment/portal — customer portal (manage / cancel) ──────────────
router.post('/portal', protect, async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user.stripeCustomerId)
    return res.status(400).json({ message: 'No active subscription found' })

  const session = await stripe.billingPortal.sessions.create({
    customer:   user.stripeCustomerId,
    return_url: `${process.env.CLIENT_URL}/dashboard`,
  })
  res.json({ url: session.url })
})

// ── GET /api/payment/status — current subscription info ──────────────────────
router.get('/status', protect, async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user.stripeCustomerId)
    return res.json({ plan: user.plan, status: 'free', subscription: null })

  const subs = await stripe.subscriptions.list({
    customer: user.stripeCustomerId,
    status:   'all',
    limit:    1,
    expand:   ['data.default_payment_method'],
  })

  const sub = subs.data[0]
  if (!sub) return res.json({ plan: user.plan, status: 'free', subscription: null })

  const pm = sub.default_payment_method
  res.json({
    plan:   user.plan,
    status: sub.status,          // active | past_due | canceled | trialing
    subscription: {
      id:             sub.id,
      currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      interval:       sub.items.data[0]?.plan?.interval,  // month | year
      card: pm?.card ? {
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear:  pm.card.exp_year,
      } : null,
    },
  })
})

// ── POST /api/payment/webhook — Stripe webhook (raw body required) ────────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  const data = event.data.object

  switch (event.type) {
    // ── اشتراك جديد أو تجديد ──────────────────────────────────────────────────
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const userId  = data.metadata?.userId
      const planKey = data.metadata?.planKey
      const planName = PLANS[planKey]?.plan
      if (userId && planName && data.status === 'active') {
        await User.findByIdAndUpdate(userId, {
          plan:    planName,
          isTrial: false,
        })
        console.log(`✅ User ${userId} upgraded to ${planName}`)
      }
      break
    }
    // ── إلغاء الاشتراك ────────────────────────────────────────────────────────
    case 'customer.subscription.deleted': {
      const userId = data.metadata?.userId
      if (userId) {
        await User.findByIdAndUpdate(userId, { plan: 'free' })
        console.log(`🔴 User ${userId} subscription canceled → free`)
      }
      break
    }
    // ── فشل الدفع ─────────────────────────────────────────────────────────────
    case 'invoice.payment_failed': {
      console.warn(`⚠️ Payment failed for customer: ${data.customer}`)
      break
    }
  }

  res.json({ received: true })
})

module.exports = router
