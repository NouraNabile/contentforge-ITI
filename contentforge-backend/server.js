// backend/server.js
require('dotenv').config()
// require('dotenv').config({ path: require('path').resolve(__dirname, '.env') })
// const uri = 'mongodb+srv://Noura:db_iti_123@cluster0.vs4ijdg.mongodb.net/?appName=Cluster0'
require('express-async-errors')

const express   = require('express')
const cors      = require('cors')
const connectDB = require('./config/db')

const app = express()


// ── Connect to MongoDB Atlas ──────────────────────────────────────────────────
connectDB()

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files publicly (brand guidelines PDFs, images)
app.use('/uploads', express.static('uploads'))

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'))
app.use('/api/brand',    require('./routes/brand'))
app.use('/api/calendar', require('./routes/calendar'))
app.use('/api/posts',    require('./routes/posts'))
app.use('/api/trends',   require('./routes/trends'))

// ── Health check — frontend pings this to check if server is up ───────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:    'OK',
    service:   'ContentForge API',
    timestamp: new Date().toISOString(),
    mongo:     'connected',
  })
})

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  })
})

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`\n🚀 ContentForge API running on http://localhost:${PORT}`)
  console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`)
})
