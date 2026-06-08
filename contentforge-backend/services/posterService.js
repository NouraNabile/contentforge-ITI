// Sends image + prompt to Gemini AI, processes response, saves generated poster
// ─────────────────────────────────────────────────────────────────────────────
// AI Poster Generation Service
// Sends product image + prompt to AI image generation API (Gemini/DALL-E)
// Returns generated poster URL
// ─────────────────────────────────────────────────────────────────────────────

const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates a marketing poster using Gemini's image generation capabilities.
 * @param {string} imagePath — Local path to uploaded product image
 * @param {string} prompt — User's creative prompt describing the desired poster
 * @returns {Promise<{imageUrl: string, prompt: string}>}
 */
async function generatePoster(imagePath, prompt) {
  try {
    // Read the uploaded image as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    // Detect MIME type from file extension
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
          ? "image/webp"
          : "image/jpeg";

    // ── Build the enhanced prompt for the AI ────────────────────────────────
    const enhancedPrompt = `
You are an expert marketing designer specializing in Arabic and bilingual brand content.

PRODUCT IMAGE: The user has uploaded a product image. Use this as the central visual element.

USER REQUEST: "${prompt}"

TASK: Generate a professional marketing poster that:
1. Features the uploaded product prominently
2. Follows the user's creative direction
3. Uses appealing colors, typography, and layout
4. Includes space for Arabic text if relevant
5. Looks like a high-end social media ad (Instagram/Facebook ready)

STYLE GUIDELINES:
- Clean, modern design
- Professional lighting and shadows
- Brand-appropriate color palette
- Clear visual hierarchy
- Social media optimized (square 1:1 or portrait 4:5 ratio)

Generate ONLY the poster image. Do not include explanatory text.
`;

    // ── Call Gemini with image + text ─────────────────────────────────────
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image",
      // model: "gemini-2.5-flash-image", // Image generation model
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: enhancedPrompt },
            {
              inlineData: {
                mimeType,
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["Text", "Image"],
      },
    });

    const response = await result.response;

    // ── Extract generated image from response ─────────────────────────────
    let generatedImageBase64 = null;

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        generatedImageBase64 = part.inlineData.data;
        break;
      }
    }

    if (!generatedImageBase64) {
      throw new Error("AI did not return a generated image.");
    }

    // ── Save generated image to disk ────────────────────────────────────────
    const outputDir = path.join(__dirname, "..", "uploads", "generated");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFilename = `generated-${Date.now()}.png`;
    const outputPath = path.join(outputDir, outputFilename);

    fs.writeFileSync(outputPath, Buffer.from(generatedImageBase64, "base64"));

    // ── Construct public URL ──────────────────────────────────────────────
    const baseUrl = process.env.API_BASE_URL || "http://localhost:3000";
    const imageUrl = `${baseUrl}/uploads/generated/${outputFilename}`;

    return {
      imageUrl,
      prompt,
      originalImage: path.basename(imagePath),
    };
  } catch (error) {
    console.error("[PosterService] Generation failed:", error);
    throw new Error(`Poster generation failed: ${error.message}`);
  }
}

module.exports = { generatePoster };
