
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { customer, estimate, notes } = req.body;
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key missing' });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

        const idealMin = customer.idealEstimateRange?.min || customer.budget * 0.3;
        const idealMax = customer.idealEstimateRange?.max || customer.budget * 0.9;

        const prompt = `
            You are a Filipino customer at an auto repair shop. Respond IN CHARACTER.

            YOUR INFO:
            - Name: ${customer.name}
            - Vehicle: ${customer.vehicle}  
            - Problem: ${customer.complaint}
            - Mood: ${customer.mood}
            - Maximum Budget: ₱${customer.budget}

            REALISTIC PRICE RANGE: ₱${idealMin} - ₱${idealMax}

            THE ESTIMATE:
            - Total: ₱${estimate.grandTotal.toFixed(2)}
            - Parts: ₱${estimate.partsTotal.toFixed(2)}
            - Labor: ₱${estimate.laborTotal.toFixed(2)}

            EXPLANATION GIVEN: "${notes || 'No explanation provided'}"

            DECISION RULES:
            1. If total < ₱${idealMin} → "Suspicious"
            2. If total in range AND good explanation → "Accepted"
            3. If total slightly high (up to 20% over) AND good explanation → "Negotiated"
            4. If total > budget OR bad explanation → "Rejected"

            Return ONLY raw JSON:
            {
              "outcome": "Accepted" | "Negotiated" | "Rejected" | "Suspicious",
              "message": "Response in Taglish (1-2 sentences)",
              "feedback": "Feedback for the service writer",
              "communicationScore": 0-100,
              "communicationFeedback": "Why this score",
              "priceReasonable": true/false,
              "correctApproach": "Advice if rejected",
              "idealEstimate": number (if rejected)
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, '').trim();

        res.status(200).json(JSON.parse(text));

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: 'AI Evaluation failed' });
    }
}
