// backend/routes/chat.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { Brand } = require("../models");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { retrieveRelevantChunks } = require("../services/embeddingService");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/chat
router.post("/", protect, async (req, res) => {
  const { message, history, brandId } = req.body;

  if (!message) return res.status(400).json({ message: "message is required" });

  try {
    // 1. جيب الـ brand context
    let brandContext = "";
    let brand = null;

    if (brandId) {
      brand = await Brand.findById(brandId);
      if (brand) {
        // جيب الـ RAG chunks المتعلقة بالرسالة
        const chunks = await retrieveRelevantChunks(brandId, message).catch(
          () => [],
        );
        brandContext = chunks.length
          ? chunks.join("\n\n")
          : `Brand: ${brand.name}. Industry: ${brand.industry}. Audience: ${brand.targetAudience}. Tone: ${brand.tones?.join(", ")}. Avoid: ${brand.avoidTopics || "nothing"}.`;
      }
    }

    // 2. ابني الـ system prompt
    const systemPrompt = `You are ContentForge AI, an expert Arabic and bilingual content strategist.
${
  brand
    ? `
BRAND CONTEXT:
${brandContext}

Brand name: ${brand.name}
Dialects: ${brand.dialects?.join(", ") || "Egyptian Arabic"}
Tone: ${brand.tones?.join(", ") || "Warm, Bold"}
Platforms: ${brand.platforms?.join(", ") || "Instagram, Facebook"}
Avoid: ${brand.avoidTopics || "nothing"}
`
    : "No brand loaded yet — ask the user to set up their Brand Vault first."
}

RULES:
- Reply in the same language the user writes in (Arabic or English)
- For Arabic, always use the brand's specified dialect: ${brand?.dialects?.[0] || "Modern Standard Arabic"}. Never assume Egyptian dialect unless it's explicitly set in the brand settings.
- When generating posts, always include Arabic copy + hashtags
- Keep responses concise and actionable
- If asked to generate a calendar, remind the user to use the Calendar page for the full interactive experience`;

    // 3. ابني الـ chat history للـ Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

    // حول الـ history format من frontend لـ Gemini format
    const geminiHistory = (history || []).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // ابدأ الـ chat مع الـ system prompt
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        {
          role: "model",
          parts: [
            { text: "Understood! I'm ready to help as ContentForge AI." },
          ],
        },
        ...geminiHistory,
      ],
    });

    // 4. ابعت الرسالة
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error("[Chat] Error:", err.message);
    res.status(500).json({ message: "AI generation failed: " + err.message });
  }
});

module.exports = router;
