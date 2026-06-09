const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const HF_TOKEN = process.env.HF_API_TOKEN;
const HF_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";

// ── Platform dimensions ─────────────────────────────────────────────────────
function getDimensions(platform) {
  return (
    {
      Instagram: { width: 1024, height: 1024 },
      Facebook: { width: 1024, height: 576 },
      LinkedIn: { width: 1024, height: 576 },
      "Twitter/X": { width: 1024, height: 512 },
      TikTok: { width: 576, height: 1024 },
    }[platform] || { width: 1024, height: 1024 }
  );
}

// ── Build image prompt via Gemini ───────────────────────────────────────────
async function buildImagePrompt({ post, brand, regenerate = false }) {
  const dialectStyle =
    {
      "Egyptian Arabic":
        "warm Egyptian café aesthetic, golden Cairo vibes, warm amber tones",
      "Gulf Arabic":
        "luxurious Gulf aesthetic, modern Dubai style, cool blues and gold",
      "Levantine Arabic":
        "Mediterranean Beirut aesthetic, earthy warm tones, natural light",
      "Modern Standard Arabic":
        "professional pan-Arab aesthetic, clean corporate modern",
      "Bilingual AR+EN":
        "cosmopolitan Middle East lifestyle, modern urban aesthetic",
    }[post.dialect] || "modern Middle Eastern lifestyle";

  try {
    // 🔧 FIX: Use a real model name
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const result = await model.generateContent(`
You are a creative director and designer for Arabic social media brands.
POST: ${post.copyAR}
PLATFORM: ${post.platform}
HASHTAGS: ${post.hashtags?.join(", ") || ""}
BRAND: ${brand.name} — ${brand.industry}
TONE: ${brand.tones?.join(", ") || "Warm, Bold"}
AUDIENCE: ${brand.targetAudience}
DIALECT AESTHETIC: ${dialectStyle}

Write ONE English Social Media Poster prompt for Stable Diffusion XL.
Requirements:
- Photorealistic commercial photography style
- Unique to THIS post's specific message and hashtags
- Reflects ${brand.industry} industry visually
- Optimized for ${post.platform} format
- Specific lighting, mood, color palette, subject, composition
- NO Arabic text, NO calligraphy, NO people's faces
- Max 80 words

Output ONLY the prompt, nothing else.`);

    console.log("Gemini response:", result.response.text());
    return result.response.text().trim();
  } catch (err) {
    // 🔧 FIX: Log the actual error instead of silently swallowing
    console.error("[buildImagePrompt] Gemini failed:", err.message);
    
    // Fallback local prompt
    return `Professional designer for social media, ${brand.industry} product, ${dialectStyle}, soft studio lighting, high quality 4k, brand aesthetic for ${post.platform}, cinematic composition`;
  }
}

// ── Generate image via Hugging Face Inference API ───────────────────────────
async function callHuggingFace(prompt, width, height) {
  if (!HF_TOKEN) throw new Error("HF_API_TOKEN not set in .env");

  // 🔧 FIX: Use correct HF Inference API format
  const response = await fetch(HF_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,  // 🔧 HF uses 'inputs', not 'prompt'
      parameters: {
        width,
        height,
        num_inference_steps: 30,
        guidance_scale: 7.5,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HF API error ${response.status}: ${err}`);
  }

  // 🔧 FIX: HF returns binary image buffer or base64 depending on header
  const contentType = response.headers.get("content-type");
  
  if (contentType && contentType.includes("image")) {
    // Binary image response
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return base64;
  } else {
    // JSON response with base64
    const result = await response.json();
    
    // HF can return different formats
    if (Array.isArray(result) && result[0]?.image) {
      return result[0].image;
    }
    if (result.image) {
      return result.image;
    }
    
    throw new Error(
      "Unexpected HF response format: " + JSON.stringify(result).slice(0, 200)
    );
  }
}

// ── Main function ───────────────────────────────────────────────────────────
async function generatePostImage({ post, brand, regenerate = false }) {
  if (!HF_TOKEN) {
    console.log(
      "[ImageService] HF_API_TOKEN not set — image generation disabled",
    );
    return { imagePrompt: null, imageUrl: null };
  }

  console.log(
    `[ImageService] Generating image for post ${post._id} (${post.platform})`,
  );

  // 1. Build prompt
  const imagePrompt = await buildImagePrompt({ post, brand, regenerate });
  console.log(`[ImageService] Prompt: ${imagePrompt.slice(0, 80)}...`);

  // 2. Get dimensions
  const { width, height } = getDimensions(post.platform);

  // 3. Generate
  const base64 = await callHuggingFace(imagePrompt, width, height);
  const imageUrl = `data:image/png;base64,${base64}`;

  console.log("[ImageService] Image generated successfully!");
  return { imagePrompt, imageUrl };
}

module.exports = { generatePostImage };