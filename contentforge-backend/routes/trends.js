// backend/routes/trends.js
const express = require('express')
const router  = express.Router()
const protect = require('../middleware/auth')

// GET /api/trends — return cached trends
// In production: trendService.js scrapes these from X/Google Trends every hour
router.get('/', protect, async (req, res) => {
  res.json({
    trends: [
      { tag: '#رمضان_كريم',   change: '+340%', velocity: 340, region: 'EG' },
      { tag: '#قهوة_الصباح',  change: '+89%',  velocity: 89,  region: 'EG' },
      { tag: 'Cold brew Egypt',change: '+210%', velocity: 210, region: 'EG' },
      { tag: '#سحور',          change: '+167%', velocity: 167, region: 'EG' },
      { tag: '#إفطار',         change: '+290%', velocity: 290, region: 'EG' },
    ],
    lastUpdated: new Date().toISOString(),
  })
})

module.exports = router
