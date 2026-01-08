
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { system, fault, partName } = req.body;
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Server configuration error: API Key missing' });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

        const prompt = `
            You are a customer at an auto repair shop. 
            You have a car with a problem in the ${system} system.
            The specific faulty part is the "${partName}".
            The actual technical fault is "${fault}".

            Write a short, realistic, and slightly emotional or confused customer complaint (max 2-3 sentences).
            Do NOT mention the specific part name or the technical fault directly. 
            Describe the symptoms (noise, smell, feeling, warning lights) that this fault would cause.
            Include a random vehicle year, make, and model (e.g., 2012 Honda Civic).
            
            Format:
            Vehicle: [Year Make Model]
            Customer: "[The complaint]"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse the response
        const vehicleMatch = text.match(/Vehicle:\s*(.*)/);
        const customerMatch = text.match(/Customer:\s*"(.*)"/);

        res.status(200).json({
            vehicle: vehicleMatch ? vehicleMatch[1] : "Unknown Vehicle",
            complaint: customerMatch ? customerMatch[1] : text,
            isAI: true
        });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: 'AI Generation failed', details: error.message });
    }
}
