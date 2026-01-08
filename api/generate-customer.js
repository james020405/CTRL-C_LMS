
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { difficulty } = req.body;
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key missing' });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

        // Logic copied from frontend generateServiceCustomer
        const firstNames = ['Mang', 'Aling', 'Kuya', 'Ate', 'Tito', 'Tita', 'Sir', 'Ma\'am'];
        const lastNames = ['Jose', 'Maria', 'Pedro', 'Juan', 'Santos', 'Cruz', 'Reyes', 'Garcia', 'Mendoza'];
        const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

        const vehicles = [
            '2018 Toyota Vios', '2015 Honda City', '2020 Mitsubishi Xpander',
            '2017 Nissan Navara', '2019 Suzuki Ertiga', '2016 Hyundai Accent'
        ];
        const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];

        const problems = {
            easy: ['oil leak', 'battery issues', 'AC not cold enough', 'brake squeal'],
            medium: ['check engine light on', 'rough idle', 'power steering noise'],
            hard: ['intermittent stalling', 'electrical drain', 'transmission shudder']
        };
        const randomProblem = problems[difficulty || 'easy'][Math.floor(Math.random() * (problems[difficulty || 'easy'].length))];

        const moodsByDifficulty = {
            easy: ['Friendly', 'Clueless'],
            medium: ['Impatient', 'Clueless'],
            hard: ['Angry', 'Suspicious']
        };
        const randomMood = moodsByDifficulty[difficulty || 'easy'][Math.floor(Math.random() * moodsByDifficulty[difficulty || 'easy'].length)];

        const budgetRanges = {
            easy: { min: 20000, max: 40000 },
            medium: { min: 10000, max: 25000 },
            hard: { min: 5000, max: 15000 }
        };
        const range = budgetRanges[difficulty || 'easy'];
        const randomBudget = Math.floor(Math.random() * (range.max - range.min)) + range.min;

        const prompt = `
            Create a Filipino customer for an auto repair shop simulation with MULTIPLE CHOICE REPAIR OPTIONS.
            
            REQUIRED:
            - Customer name: ${randomName}
            - Vehicle: ${randomVehicle}
            - Problem type: ${randomProblem}
            - Mood: ${randomMood}
            - Budget: ${randomBudget} pesos

            Generate 4 repair estimate options (A, B, C, D) where:
            - ONE is CORRECT
            - ONE is OVERPRICED
            - ONE is UNDERPRICED
            - ONE has WRONG DIAGNOSIS

            Return ONLY raw JSON:
            {
                "name": "${randomName}",
                "vehicle": "${randomVehicle}",
                "complaint": "Customer's vague description",
                "mood": "${randomMood}",
                "budget": ${randomBudget},
                "dialogue_start": "Opening line",
                "technicianReport": "Initial findings",
                "actualProblem": "The real issue",
                "correctAnswer": "A",
                "estimateOptions": [ ... ],
                "correctParts": ["part1"],
                "idealEstimateRange": { "min": 0, "max": 0 },
                "recommendedLaborHours": 2
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, '').trim();

        const json = JSON.parse(text);

        // Security: We could strip 'correctAnswer' here if we stored it in session, 
        // but for now we just return it to keep the game working as-is, 
        // prioritizing API key security first.

        res.status(200).json(json);

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: 'AI Generation failed' });
    }
}
