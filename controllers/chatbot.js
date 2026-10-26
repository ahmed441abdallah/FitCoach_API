import asyncHandler from "../utils/asyncHandler.js";

// ── Free AI Providers (both permanently free, no credit card needed) ──────────
// Provider 1: Groq — free tier, very fast, uses Llama open-source model
// Provider 2: Google Gemini — free tier, 1500 req/day

const SYSTEM_PROMPT =
    "You are a professional fitness coach and nutrition expert. Only answer questions related to bodybuilding, fitness, and sports nutrition. Your answers must be concise (maximum 3 lines), scientifically accurate, and motivating. If the user asks about politics, religion, programming, or any topic outside of fitness and nutrition, politely apologize and explain that you are exclusively dedicated to sports and nutrition.";

// ── Groq (Primary) ───────────────────────────────────────────────────────────
async function askGroq(question) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "openai/gpt-oss-20b", // free on Groq, fast, good quality
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: question },
            ],
            max_tokens: 300,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error("Groq error:", response.status, err);
        return null;
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || null;
}

// ── Gemini (Fallback) ────────────────────────────────────────────────────────
async function askGemini(question) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
                contents: [{ parts: [{ text: question }] }],
                generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
            }),
        }
    );

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error("Gemini error:", response.status, err);
        return null;
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

// ── Controller ───────────────────────────────────────────────────────────────
// @desc    Ask the fitness & nutrition AI chatbot
// @route   POST /api/v1/chatbot
// @access  Public
export const askFitnessBot = asyncHandler(async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ success: false, message: "Please provide a question." });
    }

    // Try Groq first, then Gemini as fallback
    let reply = await askGroq(question);

    if (!reply) {
        console.log("Groq failed or unavailable, trying Gemini...");
        reply = await askGemini(question);
    }

    if (!reply) {
        return res.status(502).json({
            success: false,
            message: "AI service unavailable. Try again shortly.",
        });
    }

    res.status(200).json({ success: true, reply });
});