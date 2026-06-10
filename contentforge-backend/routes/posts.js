// backend/routes/posts.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { Post, Brand } = require("../models");
const { generateVariantB } = require("../services/geminiService");

const { Connection } = require("../models");
const axios = require("axios");

const API_VERSION = process.env.META_API_VERSION || "v25.0";
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

// Helper: Get user's Meta connection
async function getConnection(userId, platform) {
  return Connection.findOne({
    user: userId,
    platform: new RegExp("^" + platform + "$", "i"),
    connected: true,
  });
}
router.get("/stats/facebook", protect, async (req, res) => {
  try {
    const conn = await getConnection(req.user._id, "Facebook");
    if (!conn)
      return res.status(400).json({ message: "Facebook not connected" });

    const { data } = await axios.get(`${BASE_URL}/${conn.pageId}`, {
      params: {
        fields: "name,fan_count,published_posts.limit(1).summary(true)",
        access_token: conn.accessToken,
      },
    });

    console.log("[Facebook Stats] raw:", JSON.stringify(data));

    res.json({
      pageName: data.name,
      followers: data.fan_count,
      totalPosts: data.published_posts?.summary?.total_count ?? 0,
    });
  } catch (err) {
    console.error("[Facebook Stats] error:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch Facebook stats" });
  }
});

// GET /api/posts/stats/instagram — Get live Instagram stats
router.get("/stats/instagram", protect, async (req, res) => {
  try {
    const conn = await getConnection(req.user._id, "Instagram");
    if (!conn)
      return res.status(400).json({ message: "Instagram not connected" });

    const { data } = await axios.get(`${BASE_URL}/${conn.igId}`, {
      params: {
        fields:
          "username,followers_count,follows_count,media_count,media.limit(5){caption,like_count,comments_count,timestamp}",
        access_token: conn.accessToken,
      },
    });

    res.json({
      username: data.username,
      followers: data.followers_count,
      following: data.follows_count,
      totalPosts: data.media_count,
      recentPosts:
        data.media?.data?.map((p) => ({
          id: p.id,
          caption: p.caption,
          likes: p.like_count,
          comments: p.comments_count,
        })) || [],
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch Instagram stats" });
  }
});
const { generatePostImage } = require("../services/imageService");

// PATCH /api/posts/:id/status
router.patch("/:id/status", protect, async (req, res) => {
  const { status } = req.body;
  const valid = [
    "draft",
    "pending_review",
    "approved",
    "scheduled",
    "published",
  ];
  if (!valid.includes(status))
    return res.status(400).json({ message: "Invalid status value" });

  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  );
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
});

// PATCH /api/posts/:id/approve
router.patch("/:id/approve", protect, async (req, res) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { status: "approved" },
    { new: true },
  );
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
});

// PATCH /api/posts/:id — update copy, hashtags, etc.
router.patch("/:id", protect, async (req, res) => {
  const allowed = [
    "copyAR",
    "copyEN",
    "hashtags",
    "imagePrompt",
    "status",
    "scheduledAt",
    "platform",
  ];
  const updates = {};
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });

  const post = await Post.findByIdAndUpdate(req.params.id, updates, {
    new: true,
  });
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
});

// POST /api/posts/:id/variant-b — generate A/B variant using Gemini
router.post("/:id/variant-b", protect, async (req, res) => {
  const post = await Post.findById(req.params.id).populate("brand");
  if (!post) return res.status(404).json({ message: "Post not found" });

  // جلب top posts للـ brand لو موجودة (not required)
  const { TopPost } = require("../models");
  const topPosts = await TopPost.find({ brand: post.brand._id })
    .sort("-stats.engagementRate")
    .limit(3);

  const variantB = await generateVariantB({
    post,
    brand: post.brand,
    topPosts,
  });
  post.variantB = variantB;
  await post.save();
  res.json(variantB);
});

// POST /api/posts/:id/apply-variant-b — swap A with B
router.post("/:id/apply-variant-b", protect, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || !post.variantB)
    return res.status(404).json({ message: "Post or variant not found" });

  post.copyAR = post.variantB.copyAR;
  post.copyEN = post.variantB.copyEN;
  post.hashtags = post.variantB.hashtags;
  post.variantB = undefined;
  await post.save();
  res.json(post);
});

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
router.patch("/:id/schedule", protect, async (req, res) => {
  try {
    const { scheduledAt } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({ message: "scheduledAt date is required" });
    }

    // Update both scheduledAt and any tracking date fields your schema uses
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        scheduledAt: new Date(scheduledAt),
        // If your schema uses a simple string date like '2026-06-05', match it here:
        date: scheduledAt.substring(0, 10),
      },
      { new: true },
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    console.error("Error updating post date:", error);
    res
      .status(500)
      .json({ message: "Server error updating scheduling window" });
  }
});

// GET /api/posts/all/:brandId — all posts (all statuses) for Posts Manager page
router.get("/all/:brandId", protect, async (req, res) => {
  const posts = await Post.find({ brand: req.params.brandId }).sort(
    "-createdAt",
  );
  res.json(posts);
});

// GET /api/posts/drafts/:brandId
router.get("/drafts/:brandId", protect, async (req, res) => {
  const drafts = await Post.find({
    brand: req.params.brandId,
    status: { $in: ["draft", "pending_review"] },
  }).sort("-createdAt");
  res.json(drafts);
});

// DELETE /api/posts/:id
router.delete("/:id", protect, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post deleted" });
});

// PATCH /api/posts/:id/date  ← drag-and-drop swap
router.patch("/:id/date", protect, async (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).json({ message: "date is required" });

  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { date: new Date(date) },
    { new: true },
  );
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
});

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

// ________________________Platform Connection___________________________
// Instagram publish
router.post("/:id/publish/instagram", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const conn = await getConnection(req.user._id, "Instagram");
    if (!conn)
      return res.status(400).json({ message: "Instagram not connected" });

    if (!post.imageUrl) {
      return res
        .status(400)
        .json({ message: "Instagram posts require an image" });
    }

    const caption =
      (post.copyEN || post.copyAR || "") +
      (post.hashtags?.length ? "\n\n" + post.hashtags.join(" ") : "");

    // Step 1: Create container
    const { data: container } = await axios.post(
      `${BASE_URL}/${conn.igId}/media`,
      null,
      {
        params: {
          image_url: post.imageUrl,
          caption,
          access_token: conn.accessToken,
        },
      },
    );

    // Step 2: Publish
    const { data: published } = await axios.post(
      `${BASE_URL}/${conn.igId}/media_publish`,
      null,
      { params: { creation_id: container.id, access_token: conn.accessToken } },
    );

    post.status = "published";
    post.publishedAt = new Date();
    post.metaPostId = published.id;
    await post.save();

    res.json({ success: true, postId: published.id, platform: "Instagram" });
  } catch (err) {
    console.error(
      "[Instagram Publish] Error:",
      err.response?.data || err.message,
    );
    res.status(500).json({
      message:
        err.response?.data?.error?.message || "Failed to publish to Instagram",
    });
  }
});
// Facebook publish
router.post("/:id/publish/facebook", protect, async (req, res) => {
  try {
    // 1. Get your internal post
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // 2. Get user's Facebook connection from DB
    const conn = await getConnection(req.user._id, "Facebook");
    if (!conn)
      return res.status(400).json({ message: "Facebook not connected" });

    // 3. Build the post content (use English or Arabic based on your needs)
    const message = post.copyEN || post.copyAR || "";
    const hashtags = post.hashtags ? post.hashtags.join(" ") : "";
    const fullMessage = message + (hashtags ? "\n\n" + hashtags : "");

    // 4. Call Meta Graph API
    const params = {
      access_token: conn.accessToken, // ← never-expiring page token from DB
      message: fullMessage,
    };

    const { data } = await axios.post(`${BASE_URL}/${conn.pageId}/feed`, null, {
      params,
    });

    // 5. Update your post status to published
    post.status = "published";
    post.publishedAt = new Date();
    post.metaPostId = data.id; // save Meta's post ID
    await post.save();

    res.json({ success: true, postId: data.id, platform: "Facebook" });
  } catch (err) {
    console.error(
      "[Facebook Publish] Error:",
      err.response?.data || err.message,
    );
    res.status(500).json({
      message:
        err.response?.data?.error?.message || "Failed to publish to Facebook",
    });
  }
});
// GET /api/posts/stats/facebook — Get live Facebook stats

// DEBUG — print all routes
console.log("=== POSTS ROUTES ===");
router.stack.forEach((layer) => {
  if (layer.route) {
    const methods = Object.keys(layer.route.methods).join(",").toUpperCase();
    console.log(`  ${methods} ${layer.route.path}`);
  }
});

// POST /api/posts/quick-publish — publish directly without a calendar post
router.post("/quick-publish", protect, async (req, res) => {
  console.log("[Quick Publish] req.body:", req.body); // ← add this

  const { platform, message, imageUrl, brandId } = req.body;
  if (!platform || !message)
    return res
      .status(400)
      .json({ message: "platform and message are required" });

  if (!brandId)
    return res
      .status(400)
      .json({ message: "No brand found. Please set up your brand first." });

  try {
    const today = new Date().toISOString().split("T")[0];
    const post = await Post.create({
      brand: brandId, // now guaranteed to exist
      platform,
      copyAR: message,
      copyEN: message,
      hashtags: [],
      date: today,
      status: "draft",
      imageUrl: imageUrl || null,
    });

    // 2. Publish to Facebook
    if (platform.toLowerCase() === "facebook") {
      const conn = await getConnection(req.user._id, "Facebook");
      if (!conn)
        return res.status(400).json({ message: "Facebook not connected" });

      const { data } = await axios.post(
        `${BASE_URL}/${conn.pageId}/feed`,
        null,
        {
          params: { message, access_token: conn.accessToken },
        },
      );

      // 3. Update post status to published
      post.status = "published";
      post.publishedAt = new Date();
      post.metaPostId = data.id;
      await post.save();

      return res.json({
        success: true,
        postId: data.id,
        platform: "Facebook",
        savedPost: post,
      });
    }

    // 2. Publish to Instagram
    if (platform.toLowerCase() === "instagram") {
      const conn = await getConnection(req.user._id, "Instagram");
      if (!conn)
        return res.status(400).json({ message: "Instagram not connected" });
      if (!imageUrl)
        return res
          .status(400)
          .json({ message: "Instagram requires an image URL" });

      const { data: container } = await axios.post(
        `${BASE_URL}/${conn.igId}/media`,
        null,
        {
          params: {
            image_url: imageUrl,
            caption: message,
            access_token: conn.accessToken,
          },
        },
      );
      const { data: published } = await axios.post(
        `${BASE_URL}/${conn.igId}/media_publish`,
        null,
        {
          params: { creation_id: container.id, access_token: conn.accessToken },
        },
      );

      // 3. Update post status to published
      post.status = "published";
      post.publishedAt = new Date();
      post.metaPostId = published.id;
      await post.save();

      return res.json({
        success: true,
        postId: published.id,
        platform: "Instagram",
        savedPost: post,
      });
    }

    res.status(400).json({ message: "Unsupported platform" });
  } catch (err) {
    console.error("[Quick Publish]", err.response?.data || err.message);
    res.status(500).json({
      message: err.response?.data?.error?.message || "Failed to publish",
    });
  }
});

module.exports = router;
