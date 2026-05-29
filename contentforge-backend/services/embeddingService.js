// backend/services/embeddingService.js
const { GoogleGenerativeAI } = require('@google/generative-ai')
const { Brand } = require('../models')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// ── Split text into ~300-word chunks ─────────────────────────────────────────
function chunkText(text, maxWords = 300) {
  const words = text.split(/\s+/).filter(Boolean)
  const chunks = []
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '))
  }
  return chunks
}

// ── Embed a single string with Google text-embedding-004 ──────────────────────
async function embedText(text) {
  const model  = genAI.getGenerativeModel({ model: 'text-embedding-004' })
  const result = await model.embedContent(text)
  return result.embedding.values
}

// ── Embed brand vault and save to MongoDB ─────────────────────────────────────
async function embedBrandVault(brandId, guidelinesText, pastPostsText) {
  const chunks = []

  for (const chunk of chunkText(guidelinesText)) {
    const embedding = await embedText(chunk)
    chunks.push({ content: chunk, embedding, source: 'guidelines' })
  }

  for (const chunk of chunkText(pastPostsText)) {
    const embedding = await embedText(chunk)
    chunks.push({ content: chunk, embedding, source: 'past_posts' })
  }

  await Brand.findByIdAndUpdate(brandId, { ragChunks: chunks })
  return chunks.length
}

// ── Cosine similarity ──────────────────────────────────────────────────────────
function cosineSimilarity(a, b) {
  const dot  = a.reduce((sum, ai, i) => sum + ai * b[i], 0)
  const magA = Math.sqrt(a.reduce((s, ai) => s + ai * ai, 0))
  const magB = Math.sqrt(b.reduce((s, bi) => s + bi * bi, 0))
  return dot / (magA * magB)
}

// ── Retrieve top-K most relevant chunks for a query ───────────────────────────
async function retrieveRelevantChunks(brandId, query, topK = 4) {
  const brand = await Brand.findById(brandId)
  if (!brand?.ragChunks?.length) return []

  const queryVec = await embedText(query)

  return brand.ragChunks
    .map(chunk => ({ content: chunk.content, score: cosineSimilarity(queryVec, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(c => c.content)
}

module.exports = { embedBrandVault, retrieveRelevantChunks }
