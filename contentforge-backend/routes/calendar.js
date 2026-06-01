// backend/routes/calendar.js
const express  = require('express')
const router   = express.Router()
const protect  = require('../middleware/auth')
const { Trend } = require("../models");
const { Brand, Calendar, Post } = require('../models')
const { generateCalendar, generateVariantB } = require('../services/geminiService')
const { retrieveRelevantChunks }             = require('../services/embeddingService')

// POST /api/calendar/generate
router.post('/generate', protect, async (req, res) => {
  const { brandId, brief, dialect, platforms, startDate } = req.body

  if (!brandId || !brief)
    return res.status(400).json({ message: 'brandId and brief are required' })

  const brand = await Brand.findById(brandId)
  if (!brand) return res.status(404).json({ message: 'Brand not found' })

  // 1. Retrieve relevant RAG chunks
  const chunks = await retrieveRelevantChunks(brandId, brief)

  // 2. Live trends (hardcoded for demo — replace with trendService scraper)
  // const trends = ['#رمضان_كريم', '#قهوة_الصباح', 'Cold brew Egypt 2026', '#سحور']
  const trendDocs = await Trend.find({
    region: brand.region || "EG",
  })
    .sort({ velocity: -1 })
    .limit(10);

  const trends = trendDocs.map((t) => t.tag);

  if (!trends.length) {
    return res.status(400).json({
      message: "No trends available. Seed trends first.",
    });
  }

  // 3. Call Gemini to generate posts JSON
  let postsData;
  try {
    postsData = await generateCalendar({
      brief, brand, trends,
      dialect: dialect || brand.dialects[0] || 'Egyptian Arabic',
      platforms: platforms || brand.platforms,
      brandContext: chunks.join('\n\n'),
    });
  } catch (err) {
    return res.status(503).json({
      message:
        'AI service is temporarily busy. Please try again in a few moments.',
    });
  }

  // 4. Create calendar document
  const calendar = await Calendar.create({
    brand: brandId, user: req.user._id,
    title: brief.slice(0, 60),
    brief, dialect,
    platforms: platforms || brand.platforms,
    startDate:  startDate ? new Date(startDate) : new Date(),
    endDate:    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    trendsUsed: trends,
    status:     'ready',
  })

  // 5. Save each post
  const posts = await Post.insertMany(
    postsData.map(p => ({ ...p, brand: brandId, calendar: calendar._id }))
  )

  // 6. Link posts to calendar
  calendar.posts = posts.map(p => p._id)
  await calendar.save()

  res.json({ calendar, posts })
})

// GET /api/calendar/brand/:brandId — all calendars for a brand
router.get('/brand/:brandId', protect, async (req, res) => {
  const calendars = await Calendar.find({ brand: req.params.brandId }).sort('-createdAt')
  res.json(calendars)
})

// GET /api/calendar/:id — single calendar with posts
router.get('/:id', protect, async (req, res) => {
  const calendar = await Calendar.findById(req.params.id).populate('posts')
  if (!calendar) return res.status(404).json({ message: 'Calendar not found' })
  res.json(calendar)
})

// POST /api/calendar/:id/approve — approve all posts
router.post('/:id/approve', protect, async (req, res) => {
  const calendar = await Calendar.findById(req.params.id)
  if (!calendar) return res.status(404).json({ message: 'Calendar not found' })

  await Post.updateMany(
    { calendar: calendar._id, status: { $in: ['draft','pending_review'] } },
    { status: 'approved' }
  )
  calendar.status = 'approved'
  await calendar.save()
  res.json({ message: 'All posts approved' })
})

// DELETE /api/calendar/:id
router.delete('/:id', protect, async (req, res) => {
  await Calendar.findByIdAndDelete(req.params.id)
  res.json({ message: 'Calendar deleted' })
})

module.exports = router
