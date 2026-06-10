const express = require('express')
const router  = express.Router()
const { body, validationResult } = require('express-validator')
const { sendContactNotificationEmail, sendContactAutoReply } = require('../services/emailService')
const { ContactMessage } = require('../models')

router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('subject').notEmpty(),
    body('message').trim().isLength({ min: 10 }),
  ],
  async (req, res) => {
    const errs = validationResult(req)
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() })

    const { name, email, company, subject, message } = req.body

    try {
      await ContactMessage.create({ name, email, company, subject, message })
      await sendContactNotificationEmail(name, email, company, subject, message)
      await sendContactAutoReply(email, name)
      res.status(200).json({ message: 'Message sent successfully' })
    } catch (err) {
      console.error('Contact route error:', err.message)
      res.status(500).json({ error: err.message })
    }
  }
)

module.exports = router