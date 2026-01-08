
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { customer, command } = req.body;
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key missing' });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

        const prompt = `
            You are an expert automotive technician.
            VEHICLE: ${customer.vehicle}
            COMPLAINT: ${customer.complaint}
            ACTUAL PROBLEM: ${customer.actualProblem}

            Service Writer command: "${command}"

            Respond with technical findings (2-3 sentences).
            If command is relevant to the ACTUAL PROBLEM, reveal diagnostic clues.
            If unrelated, report "no issues found".
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim().replace(/^["']|["']$/g, '');

        res.status(200).json({ findings: text });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: 'AI Response failed' });
    }
}
