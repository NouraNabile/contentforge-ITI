// backend/routes/auth.js
const express = require('express')
const router  = express.Router()
const jwt     = require('jsonwebtoken')
const { User } = require('../models')
const protect = require('../middleware/auth')

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email and password are required' })

  if (await User.findOne({ email }))
    return res.status(400).json({ message: 'Email already registered' })

  const user  = await User.create({ name, email, password })
  const token = signToken(user._id)
  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, plan: user.plan } })
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' })

  const user = await User.findOne({ email })
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Invalid email or password' })

  const token = signToken(user._id)
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, plan: user.plan } })
})

// GET /api/auth/me — get current user profile
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user })
})

module.exports = router
