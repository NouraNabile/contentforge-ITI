// backend/services/geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// ── Generate 2-week calendar ──────────────────────────────────────────────────
async function generateCalendar({ brief, brand, trends, dialect, platforms, brandContext }) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

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

TASK: Generate a 14-day content calendar for: ${platforms.join(', ')}
Include 2-3 rest days per week (no post those days — just skip them).

RESPOND ONLY with a JSON array, no extra text, no markdown fences. Example format:
[
  {
    "date": "2026-05-26",
    "platform": "Instagram",
    "dialect": "Egyptian Arabic",
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
