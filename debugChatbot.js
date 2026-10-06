import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

console.log("KEY:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 8) + "..." : "MISSING");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash",
    systemInstruction: "You are a fitness coach."
});

try {
    console.log("Sending request...");
    const result = await model.generateContent("best protein sources?");
    console.log("SUCCESS:", result.response.text());
} catch (error) {
    console.error("FULL ERROR:", JSON.stringify(error, null, 2));
    console.error("ERROR MESSAGE:", error?.message);
    console.error("ERROR STATUS:", error?.status);
    console.error("ERROR DETAILS:", error?.errorDetails);
}
