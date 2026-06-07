// backend/server.js
require("dotenv").config();
require("express-async-errors");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/db");
const { startTrendScheduler } = require("./services/trendService");
const chatRoutes = require("./routes/chat");

const app = express();

// ── Connect to MongoDB Atlas ──────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then((conn) => {
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    startTrendScheduler();
  })
  .catch((error) => {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.error("👉 Check your MONGO_URI in the .env file");
    process.exit(1);
  });

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files publicly (brand guidelines PDFs, images)
app.use("/uploads", express.static("uploads"));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/brand", require("./routes/brand"));
app.use("/api/calendar", require("./routes/calendar"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/trends", require("./routes/trends"));
app.use("/api/chat", chatRoutes);
app.use("/api/admin", require("./routes/admin"));

// ── Health check — frontend pings this to check if server is up ───────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "ContentForge API",
    timestamp: new Date().toISOString(),
    mongo: "connected",
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 ContentForge API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
});

