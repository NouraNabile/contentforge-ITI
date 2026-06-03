// backend/routes/connections.js
const express = require('express')
const router  = express.Router()
const protect = require('../middleware/auth')
const { Connection } = require('../models')
// const Connection = require('../models/Connection')
const axios = require('axios')

// GET /api/connections — get all connections for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const connections = await Connection.find({ user: req.user._id })
    res.json({ connections })
  } catch (err) {
    console.error('[Connections] GET error:', err.message)
    res.status(500).json({ message: 'Failed to fetch connections' })
  }
})

// POST /api/connections — create or update a connection
router.post('/', protect, async (req, res) => {
  try {
    const { platform, handle, email, connected, stats, permissions, rawData } = req.body

    if (!platform || !handle) {
      return res.status(400).json({ message: 'Platform and handle are required' })
    }

    // Delete existing connection for this platform (upsert)
    await Connection.deleteOne({ user: req.user._id, platform })

    const connection = await Connection.create({
      user: req.user._id,
      platform,
      handle,
      email: email || null,
      connected: connected !== undefined ? connected : true,
      stats: stats || [],
      permissions: permissions || [],
      rawData: rawData || {}
    })

    res.status(201).json(connection)
  } catch (err) {
    console.error('[Connections] POST error:', err.message)
    res.status(500).json({ message: 'Failed to save connection' })  
  }
})

// GET /api/connections/:platform/status
router.get('/:platform/status', protect, async (req, res) => {
  try {
    const connection = await Connection.findOne({
      user: req.user._id,
      platform: new RegExp('^' + req.params.platform + '$', 'i') // case-insensitive
    })

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' })
    }

    res.json({
      connected: connection.connected,
      handle: connection.handle,
      stats: connection.stats,
      permissions: connection.permissions
    })
  } catch (err) {
    console.error('[Connections] Status error:', err.message)
    res.status(500).json({ message: 'Failed to get status' })
  }
})

// DELETE /api/connections/:platform — disconnect
router.delete('/:platform', protect, async (req, res) => {
  try {
    await Connection.deleteOne({
      user: req.user._id,
      platform: new RegExp('^' + req.params.platform + '$', 'i')
    })
    res.json({ message: 'Disconnected successfully' })
  } catch (err) {
    console.error('[Connections] DELETE error:', err.message)
    res.status(500).json({ message: 'Failed to disconnect' })
  }
})

// ── META OAUTH: Step 1 - Generate OAuth URL ───────────────────────────────────
router.get('/meta/auth', protect, (req, res) => {
  const scopes = [
 'instagram_business_basic',
  'instagram_business_manage_insights',
  'instagram_business_manage_messages',
  'instagram_business_manage_comments',
  'instagram_business_content_publish',
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'pages_manage_metadata',
  'read_insights',
  'public_profile',
  'email'
  ].join(',')

  const authUrl = `https://www.facebook.com/v25.0/dialog/oauth?` +
    `client_id=${process.env.META_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}` +
    `&scope=${scopes}` +
    `&state=${req.user._id}` +
    `&response_type=code`

  res.json({ authUrl })
})

// ── META OAUTH: Step 2 - Handle Callback from Meta ───────────────────────────
router.get('/meta/callback', async (req, res) => {
  const { code, state } = req.query

  try {
    const tokenRes = await axios.post('https://graph.facebook.com/v25.0/oauth/access_token', null, {
      params: {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        code
      }
    })
    
    const { access_token } = tokenRes.data
    if (!access_token) throw new Error('Failed to get access token')

    const pagesRes = await axios.get('https://graph.facebook.com/v25.0/me/accounts', {
      params: { access_token }
    })
    const pagesData = pagesRes.data

    const connections = []

    for (const page of pagesData.data || []) {
      const pageToken = page.access_token

      const igRes = await axios.get(`https://graph.facebook.com/v25.0/${page.id}`, {
        params: {
          fields: 'name,fan_count,instagram_account{id,username,followers_count,media_count}',
          access_token: pageToken
        }
      })
      const igData = igRes.data

      connections.push({
        platform: 'Facebook',
        handle: page.name,
        pageId: page.id,
        accessToken: pageToken,
        connected: true,
        stats: [{ label: 'Followers', value: (page.fan_count || 0).toLocaleString() }],
        rawData: { pageId: page.id }
      })

      if (igData.instagram_account) {
        const ig = igData.instagram_account
        connections.push({
          platform: 'Instagram',
          handle: ig.username,
          igId: ig.id,
          pageId: page.id,
          accessToken: pageToken,
          connected: true,
          stats: [
            { label: 'Followers', value: (ig.followers_count || 0).toLocaleString() },
            { label: 'Posts', value: (ig.media_count || 0).toLocaleString() }
          ],
          rawData: { igId: ig.id, pageId: page.id }
        })
      }
    }

    for (const conn of connections) {
      await Connection.deleteOne({ user: state, platform: conn.platform })
      await Connection.create({ user: state, ...conn })
    }

    res.redirect(`${process.env.CLIENT_URL}/connections?success=true`)

  } catch (err) {
    console.error('[Meta OAuth] Callback error:', err.response?.data || err.message)
    res.redirect(`${process.env.CLIENT_URL}/connections?error=true`)
  }
})

module.exports = router

// Table
// Permission	Status	Purpose
// instagram_basic	✅ -->	Read Instagram Business profile & media
// instagram_manage_insights	✅ -->	Read Instagram reach, impressions, likes, comments
// instagram_content_publish	✅ -->	Publish posts to Instagram
// instagram_manage_comments	✅ -->	Read/reply to Instagram comments
// instagram_manage_messages	✅ -->	Read Instagram DMs
// instagram_manage_comments	✅ -->	Manage Instagram comments
// instagram_content_publish	✅ -->	Publish to Instagram (legacy)
// pages_show_list	✅ -->	List user's Facebook Pages
// pages_read_engagement	✅ -->	Read Page posts, followers, engagement
// pages_manage_posts	✅ -->	Publish posts to Facebook Page
// pages_manage_metadata	✅ -->	Manage Page info/settings
// read_insights	✅ -->	Read Page analytics
// email	✅ -->	Get user's email
// public_profile	✅ -->	Basic Facebook profile info


// test manually
// # 1. Get auth URL (replace TOKEN with your JWT)
// curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
//   http://localhost:3000/api/connections/meta/auth

// # 2. Test callback manually (after getting code from browser)
// curl "http://localhost:3000/api/connections/meta/callback?code=XXX&state=USER_ID"