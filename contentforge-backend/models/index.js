// backend/models/index.js
const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

// ── User ──────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  plan:     { type: String, enum: ['free','starter','growth','agency'], default: 'free' },
}, { timestamps: true })

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})
userSchema.methods.matchPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password)
}
const User = mongoose.model('User', userSchema)

// ── Brand ─────────────────────────────────────────────────────────────────────
const brandSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:           { type: String, required: true },
  industry:       String,
  website:        String,
  targetAudience: String,
  marketSize:     String,
  dialects:       [String],
  tones:          [String],
  avoidTopics:    String,
  platforms:      [String],
  guidelinesFile: String,
  pastPostsFiles: [String],
  ragChunks: [{
    content:   String,
    embedding: [Number],
    source:    { type: String, enum: ['guidelines','past_posts'] },
  }],
}, { timestamps: true })
const Brand = mongoose.model('Brand', brandSchema)

// ── Post ──────────────────────────────────────────────────────────────────────
const postSchema = new mongoose.Schema({
  brand:      { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  calendar:   { type: mongoose.Schema.Types.ObjectId, ref: 'Calendar' },
  platform:   { type: String, enum: ['Instagram','Facebook','LinkedIn','Twitter/X','TikTok'] },
  dialect:    String,
  date:       String,
  copyAR:     String,
  copyEN:     String,
  hashtags:   [String],
  imagePrompt:String,
  imageUrl:   String,
  goal:       String,
  variantB: {
    copyAR:   String,
    copyEN:   String,
    hashtags: [String],
  },
  status: {
    type:    String,
    enum:    ['draft','pending_review','approved','scheduled','published'],
    default: 'draft',
  },
  scheduledAt:  Date,
  publishedAt:  Date,
}, { timestamps: true })
const Post = mongoose.model('Post', postSchema)

// ── Calendar ──────────────────────────────────────────────────────────────────
const calendarSchema = new mongoose.Schema({
  brand:      { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  title:      String,
  brief:      String,
  dialect:    String,
  platforms:  [String],
  startDate:  Date,
  endDate:    Date,
  trendsUsed: [String],
  posts:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  status:     { type: String, enum: ['generating','ready','approved'], default: 'generating' },
}, { timestamps: true })
const Calendar = mongoose.model('Calendar', calendarSchema)

module.exports = { User, Brand, Post, Calendar }
