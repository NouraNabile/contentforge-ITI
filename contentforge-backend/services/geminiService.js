// backend/services/geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// ── Generate calendar ──────────────────────────────────────────────────
async function generateCalendar({ brief, brand, trends, dialect, platforms, brandContext, startDate, endDate, duration }) {
  
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' })

  const prompt = `
You are ContentForge, an AI content strategist for Arabic and bilingual brands.

BRAND CONTEXT (from RAG memory):
${brandContext || `Brand: ${brand.name}. Industry: ${brand.industry}. Audience: ${brand.targetAudience}.`}

BRAND SETTINGS:
- Name: ${brand.name}
- Dialect: ${dialect}
- Tone: ${brand.tones?.join(', ') || 'Warm, Community-first'}
- Avoid: ${brand.avoidTopics || 'nothing specified'}

CAMPAIGN BRIEF:
${brief}

TRENDING NOW (inject naturally into posts):
${trends.join(', ')}

STRICT TIMEFRAME CONSTRAINTS:
- Start Date: ${startDate}
- End Date: ${endDate}
- Plan Duration: Exactly ${duration} days. 

TASK: Generate a sequential content calendar spanning from ${startDate} to ${endDate} (${duration} days total) for: ${platforms.join(', ')}.
Each post MUST have an accurate "date" parameter corresponding to a day within this explicit range. 
Include roughly 2 rest days per week (for empty days, simply do not generate an object for that specific date in the array).

RESPOND ONLY with a JSON array, no extra text, no markdown fences. Example format:
[
  {
    "date": "${startDate}",
    "platform": "${platforms[0] || 'Instagram'}",
    "dialect": "${dialect}",
    "copyAR": "Arabic caption text here",
    "copyEN": "English translation here",
    "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
    "imagePrompt": "Professional product photo of coffee cup with warm lighting, Arabic calligraphy in background",
    "goal": "Engagement"
  }
]
`

  const result = await model.generateContent(prompt)
  let text = result.response.text()
  text = text.replace(/```json|```/g, '').trim()
  return JSON.parse(text)
}


// ── Generate A/B variant ──────────────────────────────────────────────────────
async function generateVariantB({ post, brand }) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `
You are an A/B Critic Agent for ContentForge.

Original ${post.platform} post (${post.dialect}):
Arabic: ${post.copyAR}
English: ${post.copyEN}

Brand tone: ${brand.tones?.join(', ') || 'Warm, Bold'}

Create Version B with a STRONGER hook — lead with the offer or a question.
Use a different CTA. Keep same brand voice and dialect.

RESPOND ONLY with JSON, no extra text:
{
  "copyAR": "...",
  "copyEN": "...",
  "hashtags": ["...", "..."]
}
`

  const result = await model.generateContent(prompt)
  let text = result.response.text()
  text = text.replace(/```json|```/g, '').trim()
  return JSON.parse(text)
}

module.exports = { generateCalendar, generateVariantB }
