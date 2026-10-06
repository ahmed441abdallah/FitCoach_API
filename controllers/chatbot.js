import asyncHandler from "../utils/asyncHandler.js";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT =
    "You are a professional fitness coach and nutrition expert. Only answer questions related to bodybuilding, fitness, and sports nutrition. Your answers must be concise (maximum 3 lines), scientifically accurate, and motivating. If the user asks about politics, religion, programming, or any topic outside of fitness and nutrition, politely apologize and explain that you are exclusively dedicated to sports and nutrition.";

// @desc    Ask the fitness & nutrition AI chatbot
// @route   POST /api/v1/chatbot
// @access  Public
export const askFitnessBot = asyncHandler(async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ success: false, message: "Please provide a question." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ success: false, message: "API key not configured." });
    }

    try {
        const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
                contents: [{ parts: [{ text: question }] }],
                generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            console.error("Gemini API error:", response.status, err);
            return res.status(502).json({ success: false, message: "AI service unavailable. Try again shortly." });
        }

        const data = await response.json();
        const botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!botReply) {
            return res.status(502).json({ success: false, message: "No reply from AI. Try again." });
        }

        res.status(200).json({ success: true, reply: botReply });
    } catch (error) {
        console.error("Chatbot fetch error:", error?.message || error);
        res.status(500).json({ success: false, message: "Sorry, the bot is currently resting. Please try again later." });
    }
});