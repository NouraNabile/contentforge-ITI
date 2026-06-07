// backend/routes/posts.js
const express = require('express')
const router  = express.Router()
const protect = require('../middleware/auth')
const { Post,Brand } = require('../models')
const { generateVariantB } = require('../services/geminiService')
const { generatePostImage } = require("../services/imageService");
// PATCH /api/posts/:id/status
router.patch('/:id/status', protect, async (req, res) => {
  const { status } = req.body
  const valid = ['draft','pending_review','approved','scheduled','published']
  if (!valid.includes(status))
    return res.status(400).json({ message: 'Invalid status value' })

  const post = await Post.findByIdAndUpdate(req.params.id, { status }, { new: true })
  if (!post) return res.status(404).json({ message: 'Post not found' })
  res.json(post)
})

// PATCH /api/posts/:id/approve
router.patch('/:id/approve', protect, async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true })
  if (!post) return res.status(404).json({ message: 'Post not found' })
  res.json(post)
})

// PATCH /api/posts/:id — update copy, hashtags, etc.
router.patch('/:id', protect, async (req, res) => {
  const allowed = ['copyAR','copyEN','hashtags','imagePrompt','status','scheduledAt','platform']
  const updates = {}
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k] })

  const post = await Post.findByIdAndUpdate(req.params.id, updates, { new: true })
  if (!post) return res.status(404).json({ message: 'Post not found' })
  res.json(post)
})

// POST /api/posts/:id/variant-b — generate A/B variant using Gemini
router.post('/:id/variant-b', protect, async (req, res) => {
  const post  = await Post.findById(req.params.id).populate('brand')
  if (!post)  return res.status(404).json({ message: 'Post not found' })

  const variantB = await generateVariantB({ post, brand: post.brand })
  post.variantB  = variantB
  await post.save()
  res.json(variantB)
})

// POST /api/posts/:id/apply-variant-b — swap A with B
router.post('/:id/apply-variant-b', protect, async (req, res) => {
  const post = await Post.findById(req.params.id)
  if (!post || !post.variantB) return res.status(404).json({ message: 'Post or variant not found' })

  post.copyAR   = post.variantB.copyAR
  post.copyEN   = post.variantB.copyEN
  post.hashtags = post.variantB.hashtags
  post.variantB = undefined
  await post.save()
  res.json(post)
})

// PATCH /api/posts/:id/schedule
// router.patch('/:id/schedule', protect, async (req, res) => {
//   const { scheduledAt } = req.body
//   const post = await Post.findByIdAndUpdate(
//     req.params.id,
//     { scheduledAt: new Date(scheduledAt), status: 'scheduled' },
//     { new: true }
//   )
//   res.json(post)
// })

// PATCH /api/posts/:id/schedule
router.patch('/:id/schedule', protect, async (req, res) => {
  try {
    const { scheduledAt } = req.body
    
    if (!scheduledAt) {
      return res.status(400).json({ message: 'scheduledAt date is required' })
    }

    // Update both scheduledAt and any tracking date fields your schema uses
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { 
        scheduledAt: new Date(scheduledAt),
        // If your schema uses a simple string date like '2026-06-05', match it here:
        date: scheduledAt.substring(0, 10) 
      },
      { new: true }
    )

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    res.json(post)
  } catch (error) {
    console.error('Error updating post date:', error)
    res.status(500).json({ message: 'Server error updating scheduling window' })
  }
})

// GET /api/posts/drafts/:brandId
router.get('/drafts/:brandId', protect, async (req, res) => {
  const drafts = await Post.find({
    brand: req.params.brandId,
    status: { $in: ['draft','pending_review'] }
  }).sort('-createdAt')
  res.json(drafts)
})

// DELETE /api/posts/:id
router.delete('/:id', protect, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id)
  res.json({ message: 'Post deleted' })
})


// PATCH /api/posts/:id/date  ← drag-and-drop swap
router.patch('/:id/date', protect, async (req, res) => {
  const { date } = req.body
  if (!date) return res.status(400).json({ message: 'date is required' })

  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { date: new Date(date) },
    { new: true }
  )
  if (!post) return res.status(404).json({ message: 'Post not found' })
  res.json(post)
})

// POST /api/posts/:id/generate-image ─────────────────────────────────────────
// 1. Gemini يبني image prompt مخصص للبوست
// 2. Hugging Face FLUX يولد الصورة
// 3. بتتحفظ في MongoDB وبترجع للـ frontend
router.post("/:id/generate-image", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const brand = await Brand.findById(post.brand);
    if (!brand) return res.status(404).json({ message: "Brand not found" });

    const isRegenerate = !!post.imageUrl; // لو عنده صورة قديمة = regenerate

    console.log(
      `[Posts] ${isRegenerate ? "Regenerating" : "Generating"} image for post ${post._id} (${post.platform})`,
    );

    // لو regenerate — امسح الـ prompt القديم عشان Gemini يعمل واحد جديد مختلف
    if (isRegenerate) {
      post.imagePrompt = null;
    }

    const { imagePrompt, imageUrl } = await generatePostImage({
      post,
      brand,
      regenerate: isRegenerate, // بنبعته للـ service عشان يغير الـ seed
    });

    if (!imageUrl) {
      return res.status(503).json({
        message: "Image generation not available — set HF_API_TOKEN in .env",
      });
    }

    post.imagePrompt = imagePrompt;
    post.imageUrl = imageUrl;
    await post.save();

    res.json({
      message: isRegenerate
        ? "Image regenerated successfully"
        : "Image generated successfully",
      imageUrl,
      imagePrompt,
      regenerated: isRegenerate,
    });
  } catch (err) {
    console.error("[Posts] Image generation error:", err.message);
    res
      .status(500)
      .json({ message: "Image generation failed: " + err.message });
  }
});

module.exports = router
