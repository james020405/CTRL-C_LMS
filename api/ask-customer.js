
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { customer, question, history = [] } = req.body;
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key missing' });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

        const historyText = history.length > 0
            ? `PREVIOUS CONVERSATION:\n${history.map(qa => `- Mechanic: "${qa.question}"\n  You: "${qa.answer}"`).join('\n')}`
            : '';

        const prompt = `
            You are ROLEPLAYING as ${customer.name}, a ${customer.mood} Filipino customer.
            PROBLEM: ${customer.complaint}
            VEHICLE: ${customer.vehicle}
            ${historyText}

            The MECHANIC asks: "${question}"

            Reply with ONLY your spoken response (1-2 sentences in Taglish).
            Be consistent with previous answers. Do NOT repeat your name.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim().replace(/^["']|["']$/g, '');

        res.status(200).json({ answer: text });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: 'AI Response failed' });
    }
}
