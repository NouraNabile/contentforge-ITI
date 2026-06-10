// backend/models/index.js
const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')



// ── contact message ──────────────────────────────────────────────────────────────────────
const contactMessageSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true },
  company: { type: String, default: '' },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status:  { type: String, enum: ['new', 'read', 'replied'], default: 'new' },
  replies: [{
    text:      String,
    repliedAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true })


// ── User ──────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String, required: true, minlength: 6 },
 // الخانات الجديدة لفترة التجربة
  plan: { type: String, enum: ['free','starter','growth','agency','enterprise'], default: 'free' },
  isVerified: { type: Boolean, default: false },// الميل حقيقي
  verificationCode: String,
  verificationCodeExpires: Date,

  // التعديل والتحسين هنا:
  phone: {
    type: String,
    required: [true, 'Phone number is required'], // رسالة واضحة لو متبعتش
    unique: true // يمنع تكرار الرقم نهائياً في الداتا بيز
  },
  isTrial: { 
    type: Boolean, 
    default: true // بنخليها true تلقائيًا لأن أي مستخدم جديد هيبدأ كـ Trial
  }, 
  trialStartDate: { 
    type: Date, 
    default: Date.now // الداتا بيز هتحط تاريخ النهاردة تلقائياً أول ما الحساب يتكريت
  },            
  trialDurationDays: { 
    type: Number, 
    default: 14 
  }, 
  trialEndsAt: {
    type: Date,
    required: true // بنحسبه في الـ controller وبنبعته
  },
  hasUsedTrial: {
    type: Boolean,
    default: false
  },
  stripeCustomerId: { type: String },         // Stripe customer ID
  isAdmin:   { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  lastLoginAt: { type: Date },
  // ==================== الحقول الجديدة لفترة السماح ====================
  blockStatus: { 
    type: String, 
    enum: ['none', 'warning', 'blocked'], 
    default: 'none' 
  },
  restrictionReason: { 
    type: String, 
    default: null 
  }, // سبب التحذير عشان يتبعت في الميل ويظهر للأدمن
  gracePeriodExpiresAt: { 
    type: Date, 
    default: null 
  }, // ميعاد القفل النهائي (الوقت الحالي + 24 ساعة)
  actionTriggeredBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },// الـ ID بتاع الآدمن اللي خاد الأكشن (عشان الـ Logs)
  isAskToDelete:     { type: Boolean, default: false },
  deletionReason:    { type: String,  default: null },
  isDeleted:         { type: Boolean, default: false }
}, { timestamps: true })
//ttd index on createdAt to auto-delete unverified users after 10 minutes
userSchema.index(
  { createdAt: 1 }, 
  { 
    expireAfterSeconds: 600, 
    partialFilterExpression: { isVerified: false } 
  }
)

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.matchPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password)
}

const User = mongoose.model('User', userSchema)
module.exports = User

// models/Settings.js─────────────────────────────────────────────────────────────────────
const platformSettingsSchema = new mongoose.Schema({
  trialDays:         { type: Number,   default: 14 },
  blockByPhone:      { type: Boolean,  default: true },
  demoEnabled:       { type: Boolean,  default: true },
  otpExpiryMinutes:  { type: Number,   default: 10 },
  sendExpiryWarning: { type: Boolean,  default: false },
}, { timestamps: true })

const PlatformSettings = mongoose.model('PlatformSettings', platformSettingsSchema)
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
    isAdmin:   { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
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
    enum:    ['draft','approved','scheduled','published'],
    default: 'draft',
  },
  metaPostId: { type: String },  // ← Meta's post ID after publishing
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

// ── Original Calendar (snapshot for reset) ────────────────────────────────────
const originalCalendarSchema = new mongoose.Schema({
  calendarId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Calendar', required: true, unique: true },
  originalCalendarData: { type: Object, required: true },
  originalPostsData:    [{ type: Object, required: true }],
}, { timestamps: true })

const OriginalCalendar = mongoose.model('OriginalCalendar', originalCalendarSchema)


// ── Trend Model ───────────────────────────────────────────────────────────────
const trendSchema = new mongoose.Schema({
  tag:         { type: String, required: true },
  change:      { type: String },           // e.g. "+340%"
  velocity:    { type: Number, default: 0 },
  region:      { type: String, default: 'EG' },
  source:      { type: String, enum: ['google', 'twitter', 'manual'], default: 'google' },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true })

const Trend = mongoose.model('Trend', trendSchema)

// ── Chat Message Model ────────────────────────────────────────────────────────
const chatMessageSchema = new mongoose.Schema({
  brand:         { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  sender:        { type: String, enum: ['user','ai'], required: true },
  content:    { type: String, required: true },
  conversationId: { type: String, required: true }
}, { timestamps: true })

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema)

// ── TopPost ───────────────────────────────────────────────────────────────────
const TopPostSchema = new mongoose.Schema({
  brand:    { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  platform: { type: String, enum: ['Instagram','Facebook','LinkedIn','Twitter/X','TikTok'] },
  content:  { type: String },
  imageUrl: { type: String },
  postUrl:  { type: String },
  date:     { type: String },
  stats: {
    likes:       { type: Number, default: 0 },
    comments:    { type: Number, default: 0 },
    shares:      { type: Number, default: 0 },
    reach:       { type: Number, default: 0 },
    saves:       { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
  },
  source:   { type: String, enum: ['manual','link','doc'], default: 'manual' },
  embedded: { type: Boolean, default: false },
}, { timestamps: true })

const TopPost = mongoose.model('TopPost', TopPostSchema)
const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema)

// module.exports = { User, Brand, Post, Calendar, Trend, ChatMessage, OriginalCalendar, TopPost, PlatformSettings, ContactMessage }

// // وأضيفيها في الـ exports
// module.exports = { User, Brand, Post, Calendar, Trend, ChatMessage, OriginalCalendar}
// ── Connection ────────────────────────────────────────────────────────────────
const connectionSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform:    { type: String, required: true },
  handle:      String,
  pageId:      String,
  igId:        String,
  accessToken: String,
  tokenType:   String,
  connected:   { type: Boolean, default: false },
  stats:       [{ label: String, value: String }],
  rawData:     { type: Object },
}, { timestamps: true })

const Connection = mongoose.model('Connection', connectionSchema)

// ── Notification ──────────────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  type:    { type: String, enum: ['scheduled_today', 'scheduled_tomorrow', 'info'], default: 'info' },
  read:    { type: Boolean, default: false },
  postId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
}, { timestamps: true })

const Notification = mongoose.model('Notification', notificationSchema)

module.exports = { User, Brand, Post, Calendar, Trend, ChatMessage, OriginalCalendar, TopPost, PlatformSettings, ContactMessage , Connection, Notification }

