// backend/routes/posterRouter.js
// ─────────────────────────────────────────────────────────────────────────────
// Poster Generator Routes
// POST /api/posters/generate — Upload image + prompt, get AI-generated poster
// ─────────────────────────────────────────────────────────────────────────────

const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth"); // Your existing auth middleware
const { upload, handleUploadError } = require("../middleware/upload");
const {
  createPoster,
  getPosterHistory,
} = require("../controllers/posterController");


router.post(
  "/generate",
  protect, // 1. Authenticate user
  upload.single("image"), // 2. Handle image upload via Multer
  handleUploadError, // 3. Handle Multer errors
  createPoster, // 4. Process and generate poster
);


router.get("/history", protect, getPosterHistory);

module.exports = router;
