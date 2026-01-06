import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCrossSystemCase } from '../data/crossSystemCases';
import { getChainReactionScenario } from '../data/chainReactionData';
import logger from './logger';
import { getPartsListForPrompt, getToolSizesForPrompt, getAllStandardParts, METRIC_TOOL_SIZES } from '../data/standardParts';

// AI Guardrails - Enhanced prompts with pre-defined parts
const AI_GUARDRAILS = {
    partsInstruction: `
IMPORTANT - USE ONLY THESE STANDARD PARTS:
When mentioning automotive parts, you MUST choose from the pre-defined list below.
Do NOT invent part names. Use the exact names provided.

${Object.entries(getAllStandardParts()).map(([system, parts]) =>
        `${system.toUpperCase()}: ${parts.slice(0, 15).join(', ')}...`
    ).join('\n')}
`,
    toolsInstruction: `
METRIC TOOLS ONLY (Philippine standard):
${getToolSizesForPrompt()}
`,
    explanationInstruction: `
DETAILED EXPLANATIONS REQUIRED:
For each answer (correct or incorrect), provide:
1. WHY the correct answer is right (technical reasoning)
2. WHY each wrong answer is incorrect (common misconceptions)
3. What symptoms would indicate this problem
`
};
// Initialize Gemini with multiple model fallbacks
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

let genAI = null;
let model = null;
let geminiAvailable = false;

// Initialize Gemini as PRIMARY
if (API_KEY) {
    console.log("🔑 Gemini API key found (PRIMARY)");
    try {
        genAI = new GoogleGenerativeAI(API_KEY);
        model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
        geminiAvailable = true;
        console.log("✅ Gemini ready as PRIMARY");
    } catch (error) {
        console.error("❌ Gemini init failed:", error.message);
        geminiAvailable = false;
    }
}

// OpenRouter FALLBACK AI (uses OpenAI-compatible API format with Kimi K2 free)
const openRouterAvailable = !!OPENROUTER_API_KEY;
if (openRouterAvailable) {
    console.log("🔑 OpenRouter API key found (Kimi K2 - FALLBACK)");
} else {
    console.warn("⚠️ OpenRouter API key NOT FOUND - Gemini only");
}

/**
 * Call OpenRouter API as fallback when Gemini fails
 * @param {string} prompt - The prompt to send
 * @returns {Promise<string>} - The generated text response
 */
async function callOpenRouter(prompt) {
    if (!OPENROUTER_API_KEY) {
        throw new Error("OpenRouter API key not configured");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "Ctrl C Academy"
        },
        body: JSON.stringify({
            model: "moonshotai/kimi-k2:free",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
}

// Helper to check if Gemini is available
export const isGeminiAvailable = () => geminiAvailable && model !== null;

// RATE LIMITING
// ============================================

/**
 * Simple rate limiter to prevent API abuse
 * Limits: 10 requests per minute
 */
const rateLimiter = {
    requests: [],
    maxRequests: 10,
    windowMs: 60000, // 1 minute

    /**
     * Check if request is allowed
     * @returns {boolean} - Whether the request is allowed
     */
    canMakeRequest() {
        const now = Date.now();
        // Remove expired timestamps
        this.requests = this.requests.filter(timestamp => now - timestamp < this.windowMs);
        return this.requests.length < this.maxRequests;
    },

    /**
     * Record a request
     */
    recordRequest() {
        this.requests.push(Date.now());
    },

    /**
     * Get time until next available request
     * @returns {number} - Milliseconds until next request is allowed
     */
    getWaitTime() {
        if (this.requests.length < this.maxRequests) return 0;
        const oldestRequest = this.requests[0];
        return Math.max(0, this.windowMs - (Date.now() - oldestRequest));
    }
};

/**
 * Check rate limit before making API call
 * @throws {Error} - If rate limit exceeded
 */
const checkRateLimit = () => {
    if (!rateLimiter.canMakeRequest()) {
        const waitTime = Math.ceil(rateLimiter.getWaitTime() / 1000);
        throw new Error(`Rate limit exceeded. Please wait ${waitTime} seconds before trying again.`);
    }
    rateLimiter.recordRequest();
};


export const generateCustomerScenario = async (system, fault, partName) => {
    // Fallback if no API key or model
    if (!model) {
        logger.warn("Gemini Model not initialized, using fallback.");
        return getFallbackScenario(system, partName);
    }

    try {
        checkRateLimit();
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

        return {
            vehicle: vehicleMatch ? vehicleMatch[1] : "Unknown Vehicle",
            complaint: customerMatch ? customerMatch[1] : text,
            isAI: true
        };

    } catch (error) {
        logger.error("Gemini Generation Error:", error);
        return getFallbackScenario(system, partName);
    }
};

const getFallbackScenario = (system, partName) => {
    const vehicles = ["2015 Toyota Camry", "2018 Ford F-150", "2012 Honda Civic", "2019 Chevy Malibu"];
    const complaints = [
        `It's making a weird noise when I use the ${system}.`,
        `Something feels wrong with the ${system}, can you check it?`,
        `I heard a clunking sound and now it's driving funny.`,
        `The check engine light came on and it's acting up.`
    ];

    return {
        vehicle: vehicles[Math.floor(Math.random() * vehicles.length)],
        complaint: complaints[Math.floor(Math.random() * complaints.length)],
        isAI: false
    };
};

export const generateServiceCustomer = async (difficulty = 'easy') => {
    // Random Filipino names to force variety
    const firstNames = ['Mang', 'Aling', 'Kuya', 'Ate', 'Tito', 'Tita', 'Sir', 'Ma\'am'];
    const lastNames = ['Jose', 'Maria', 'Pedro', 'Juan', 'Santos', 'Cruz', 'Reyes', 'Garcia', 'Mendoza', 'Torres', 'Ramos', 'Lim', 'Tan', 'Sy', 'Ong'];
    const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

    // Random vehicles
    const vehicles = [
        '2018 Toyota Vios', '2015 Honda City', '2020 Mitsubishi Xpander',
        '2017 Nissan Navara', '2019 Suzuki Ertiga', '2016 Hyundai Accent',
        '2021 Toyota Fortuner', '2014 Honda CR-V', '2012 Toyota Innova',
        '2019 Ford Ranger', '2017 Chevrolet Trailblazer', '2018 Kia Picanto'
    ];
    const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];

    // Random problem types per difficulty
    const problems = {
        easy: ['oil leak', 'battery issues', 'AC not cold enough', 'brake squeal', 'weak headlights'],
        medium: ['check engine light on', 'rough idle', 'power steering noise', 'transmission slipping', 'overheating'],
        hard: ['intermittent stalling', 'electrical drain', 'transmission shudder', 'engine knock', 'multiple warning lights']
    };
    const randomProblem = problems[difficulty][Math.floor(Math.random() * problems[difficulty].length)];
    const randomSeed = Math.floor(Math.random() * 10000);

    const moodsByDifficulty = {
        easy: ['Friendly', 'Clueless'],
        medium: ['Impatient', 'Clueless'],
        hard: ['Angry', 'Suspicious']
    };
    const randomMood = moodsByDifficulty[difficulty][Math.floor(Math.random() * moodsByDifficulty[difficulty].length)];

    const budgetRanges = {
        easy: { min: 20000, max: 40000 },
        medium: { min: 10000, max: 25000 },
        hard: { min: 5000, max: 15000 }
    };
    const range = budgetRanges[difficulty];
    const randomBudget = Math.floor(Math.random() * (range.max - range.min)) + range.min;

    const prompt = `
Create a Filipino customer for an auto repair shop simulation with MULTIPLE CHOICE REPAIR OPTIONS.

REQUIRED - Use these EXACT values:
- Customer name: ${randomName}
- Vehicle: ${randomVehicle}
- Problem type: ${randomProblem}
- Mood: ${randomMood}
- Budget: ${randomBudget} pesos

Random seed: ${randomSeed}

Generate 4 repair estimate options (A, B, C, D) where:
- ONE option is CORRECT (properly diagnoses and prices the repair)
- ONE option is OVERPRICED (correct parts but too expensive)
- ONE option is UNDERPRICED (missing important parts or suspiciously cheap)
- ONE option has WRONG DIAGNOSIS (incorrect parts for the problem)

Return ONLY this JSON (no markdown):
{
    "name": "${randomName}",
    "vehicle": "${randomVehicle}",
    "complaint": "Customer's vague description of ${randomProblem} in Taglish",
    "mood": "${randomMood}",
    "budget": ${randomBudget},
    "dialogue_start": "Opening line with Filipino expressions",
    "technicianReport": "Initial inspection findings from the mechanic",
    "actualProblem": "The real technical issue",
    "correctAnswer": "A" or "B" or "C" or "D",
    "estimateOptions": [
        {
            "id": "A",
            "parts": [
                {"name": "Part Name 1", "cost": 1500},
                {"name": "Part Name 2", "cost": 800}
            ],
            "laborHours": 2.0,
            "laborRate": 500,
            "explanation": "Why this option is right/wrong (hidden until answer revealed)"
        },
        {
            "id": "B",
            "parts": [...],
            "laborHours": number,
            "laborRate": 500,
            "explanation": "..."
        },
        {
            "id": "C",
            "parts": [...],
            "laborHours": number,
            "laborRate": 500,
            "explanation": "..."
        },
        {
            "id": "D",
            "parts": [...],
            "laborHours": number,
            "laborRate": 500,
            "explanation": "..."
        }
    ],
    "correctParts": ["part1", "part2"],
    "idealEstimateRange": { "min": realistic_min, "max": realistic_max },
    "recommendedLaborHours": number
}
    `;

    // Try Gemini first (PRIMARY)
    if (model) {
        try {
            checkRateLimit();
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log("✅ Service customer generated via Gemini");
            return JSON.parse(response.text().replace(/```json|```/g, '').trim());
        } catch (geminiError) {
            console.warn("⚠️ Gemini failed, trying OpenRouter:", geminiError.message);
        }
    }

    // Try OpenRouter as fallback
    if (openRouterAvailable) {
        try {
            const text = await callOpenRouter(prompt);
            console.log("✅ Service customer generated via OpenRouter (Kimi K2)");
            return JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch (openRouterError) {
            console.warn("⚠️ OpenRouter failed:", openRouterError.message);
        }
    }

    // Fall back to static data
    console.log("📋 Using fallback service customer");
    return getFallbackServiceCustomer(difficulty);
};


const FALLBACK_CUSTOMERS = {
    easy: [
        { name: "Tita Marie", vehicle: "2020 Toyota Fortuner", complaint: "Oil change reminder light on", mood: "Friendly", budget: 25000, dialogue_start: "Hi! I think it's time for my regular service. Magkano po?", technicianReport: "Vehicle due for 40,000km service. Oil is dark and at minimum level. Air filter visibly dirty. Recommend full service.", actualProblem: "Vehicle is due for scheduled maintenance - oil change and filter replacement needed", correctParts: ["Engine Oil (6L)", "Oil Filter", "Air Filter"], idealEstimateRange: { min: 8000, max: 15000 }, recommendedLaborHours: 1.5 },
        { name: "Kuya James", vehicle: "2019 Honda CR-V", complaint: "Aircon not cold enough", mood: "Clueless", budget: 30000, dialogue_start: "Hindi na malamig yung aircon, pero okay lang kahit magkano, basta maayos.", technicianReport: "AC system low on refrigerant. Found dye traces at compressor seal. Evaporator temp reading 18°C (should be 4-7°C). Needs recharge and seal replacement.", actualProblem: "Low refrigerant due to minor leak in AC system, needs recharge and leak repair", correctParts: ["R134a Refrigerant", "AC O-Rings", "AC Compressor Seal"], idealEstimateRange: { min: 12000, max: 22000 }, recommendedLaborHours: 2.5 },
        { name: "Ate Lina", vehicle: "2021 Mitsubishi Xpander", complaint: "Brake pedal feels soft", mood: "Friendly", budget: 28000, dialogue_start: "Kuya, parang malambot na yung brake ko, patingin naman.", technicianReport: "Brake fluid dark/contaminated. Air in brake lines. Master cylinder shows minor seepage. Brake pads at 60% life remaining.", actualProblem: "Brake fluid contaminated and needs bleeding, master cylinder seals starting to wear", correctParts: ["Brake Fluid (DOT4)", "Brake Bleeding Service", "Master Cylinder Seal Kit"], idealEstimateRange: { min: 8000, max: 18000 }, recommendedLaborHours: 2.0 },
        { name: "Sir Jun", vehicle: "2018 Toyota Hilux", complaint: "Car won't start sometimes", mood: "Clueless", budget: 35000, dialogue_start: "Minsan lang naman siya ayaw mag-start, pero pag umulit ulit okay na.", technicianReport: "Battery load test: 380 CCA (rated 600 CCA) - FAIL. Terminals corroded with white buildup. Charging system OK at 14.2V.", actualProblem: "Weak battery and corroded terminals causing intermittent starting issues", correctParts: ["Car Battery (75AH)", "Battery Terminals", "Battery Hold-Down"], idealEstimateRange: { min: 10000, max: 20000 }, recommendedLaborHours: 1.0 }
    ],
    medium: [
        { name: "Aling Rosa", vehicle: "2018 Toyota Innova", complaint: "May warning light na orange", mood: "Impatient", budget: 15000, dialogue_start: "Kailangan ko 'to today ha, at wag naman masyadong mahal!", technicianReport: "Check engine light on. Code P0101 - MAF sensor performance. Air intake system needs inspection.", actualProblem: "Faulty mass airflow sensor causing check engine light and poor fuel economy", correctParts: ["Mass Airflow Sensor", "Air Filter", "Throttle Body Cleaning"], idealEstimateRange: { min: 8000, max: 13000 }, recommendedLaborHours: 1.5 },
        { name: "College Student", vehicle: "2010 Honda City", complaint: "Check engine light on", mood: "Clueless", budget: 20000, dialogue_start: "May ilaw po na nag-on? Masama po ba yun?", technicianReport: "OBD scan shows P0135 - O2 sensor heater circuit. Fuel trim readings abnormal. Suggest fuel system inspection.", actualProblem: "Faulty oxygen sensor causing check engine light, affecting fuel economy", correctParts: ["Oxygen Sensor", "Spark Plugs"], idealEstimateRange: { min: 8000, max: 15000 }, recommendedLaborHours: 1.5 },
        { name: "Kuya Bert", vehicle: "2015 Hyundai Accent", complaint: "Mahina yung headlights", mood: "Impatient", budget: 12000, dialogue_start: "Grabe ang dilim ng ilaw, halos di na makita gabi.", technicianReport: "Charging system voltage low at 12.8V with engine running (should be 13.5-14.5V). Belt appears glazed. Electrical system under investigation.", actualProblem: "Dimming headlights due to failing alternator not charging properly", correctParts: ["Alternator", "Drive Belt", "Headlight Bulbs"], idealEstimateRange: { min: 6000, max: 10000 }, recommendedLaborHours: 2.0 },
        { name: "Tito Danny", vehicle: "2017 Nissan Navara", complaint: "Rough idle pag naka-aircon", mood: "Clueless", budget: 18000, dialogue_start: "Kapag naka-on yung aircon parang nagvivibrate yung sasakyan.", technicianReport: "Engine idle drops to 500 RPM with AC on (spec: 700-800 RPM). Throttle body carbon buildup visible. Ignition system due for service.", actualProblem: "Dirty throttle body and worn spark plugs causing rough idle under load", correctParts: ["Spark Plugs (Set)", "Throttle Body Cleaning", "Idle Air Control Valve"], idealEstimateRange: { min: 8000, max: 14000 }, recommendedLaborHours: 2.0 }
    ],
    hard: [
        { name: "Mang Tomas", vehicle: "1995 Mitsubishi L300", complaint: "Hindi maganda ang takbo", mood: "Suspicious", budget: 8000, dialogue_start: "Wag mo akong lolokohin, alam ko ang kotse. Tignan mo muna bago presyuhan.", technicianReport: "Engine running rough. Multiple possible causes - could be ignition, fuel delivery, or compression. Further diagnosis needed.", actualProblem: "Multiple worn ignition components causing misfires and power loss", correctParts: ["Ignition Coil", "Spark Plugs", "Ignition Wires"], idealEstimateRange: { min: 4000, max: 7000 }, recommendedLaborHours: 2.5 },
        { name: "Angry Kuya", vehicle: "2008 Toyota Vios", complaint: "Something wrong, I don't know", mood: "Angry", budget: 6000, dialogue_start: "Kanina pa 'to nagpoproblema! Dapat libre 'to kasi dito ko rin pinaayos last time!", technicianReport: "Vibration noted at idle. NVH concerns. Could be drivetrain, engine, or mounting related. Road test inconclusive.", actualProblem: "Worn engine mounts causing vibration and rough idle", correctParts: ["Engine Mount (Front)", "Engine Mount (Rear)"], idealEstimateRange: { min: 3000, max: 5500 }, recommendedLaborHours: 3.0 },
        { name: "Ate Nene", vehicle: "2012 Suzuki Ertiga", complaint: "Umiingay kapag lumiliko", mood: "Suspicious", budget: 10000, dialogue_start: "Kanina pa ako nagpunta sa ibang shop, ang mahal daw. Totoo ba yun?", technicianReport: "Noise when turning - could be CV joints, power steering, wheel bearings, or suspension. Steering system requires inspection.", actualProblem: "Worn CV joint boots and low power steering fluid causing noise when turning", correctParts: ["CV Joint Boot Kit", "Power Steering Fluid", "Tie Rod Ends"], idealEstimateRange: { min: 5000, max: 9000 }, recommendedLaborHours: 3.0 },
        { name: "Boss Eddie", vehicle: "2005 Toyota Hi-Ace", complaint: "Ang gastos ng gasolina", mood: "Angry", budget: 7000, dialogue_start: "Bakit ang dami kong gastos sa gas? May problema ba?", technicianReport: "Fuel consumption higher than normal. No codes stored. Possible causes: fuel system, air intake, ignition, or driving habits.", actualProblem: "Clogged fuel injectors and dirty air filter reducing fuel efficiency", correctParts: ["Fuel Injector Cleaning", "Air Filter", "Fuel Filter"], idealEstimateRange: { min: 3500, max: 6000 }, recommendedLaborHours: 1.5 }
    ]
};

const getFallbackServiceCustomer = (difficulty = 'easy') => {
    const customers = FALLBACK_CUSTOMERS[difficulty] || FALLBACK_CUSTOMERS.easy;
    const customer = customers[Math.floor(Math.random() * customers.length)];

    // Generate multiple choice estimate options from the fallback data
    const correctTotal = (customer.idealEstimateRange.min + customer.idealEstimateRange.max) / 2;
    const laborRate = 500;
    const correctLabor = customer.recommendedLaborHours || 2;
    const partsTotal = correctTotal - (correctLabor * laborRate);
    const partCount = customer.correctParts?.length || 2;
    const avgPartCost = Math.round(partsTotal / partCount);

    // Create correct option parts with realistic costs
    const correctParts = (customer.correctParts || ['Engine Oil', 'Filter']).map((name, idx) => ({
        name,
        cost: Math.round(avgPartCost * (0.8 + Math.random() * 0.4))
    }));

    // Generate 4 options: A=correct, B=overpriced, C=underpriced, D=wrong diagnosis
    const estimateOptions = [
        {
            id: 'A',
            parts: correctParts,
            laborHours: correctLabor,
            laborRate: laborRate,
            explanation: 'This is the correct diagnosis with appropriate parts and fair pricing.'
        },
        {
            id: 'B',
            parts: correctParts.map(p => ({ ...p, cost: Math.round(p.cost * 1.8) })),
            laborHours: correctLabor + 1.5,
            laborRate: laborRate,
            explanation: 'OVERPRICED - Same parts but marked up 80% and padded labor hours.'
        },
        {
            id: 'C',
            parts: correctParts.slice(0, 1).map(p => ({ ...p, cost: Math.round(p.cost * 0.5) })),
            laborHours: 0.5,
            laborRate: laborRate,
            explanation: 'UNDERPRICED - Missing critical parts and unrealistic labor time. This repair would fail.'
        },
        {
            id: 'D',
            parts: [
                { name: 'Brake Pads', cost: 2500 },
                { name: 'Brake Fluid', cost: 800 }
            ],
            laborHours: 2,
            laborRate: laborRate,
            explanation: 'WRONG DIAGNOSIS - These parts are for brakes but the actual problem is not brake-related.'
        }
    ];

    // Shuffle options so correct answer isn't always A
    const shuffledOptions = [...estimateOptions].sort(() => Math.random() - 0.5);
    shuffledOptions.forEach((opt, idx) => {
        opt.id = String.fromCharCode(65 + idx); // A, B, C, D
    });
    const correctAnswer = shuffledOptions.find(o => o.explanation.includes('correct diagnosis'))?.id || 'A';

    return {
        ...customer,
        estimateOptions: shuffledOptions,
        correctAnswer
    };
};

export const evaluateEstimate = async (customer, estimate, notes) => {
    // Calculate ideal estimate if not provided
    const idealMin = customer.idealEstimateRange?.min || customer.budget * 0.3;
    const idealMax = customer.idealEstimateRange?.max || customer.budget * 0.9;
    const idealMid = (idealMin + idealMax) / 2;

    const prompt = `
You are a Filipino customer at an auto repair shop. Respond IN CHARACTER.

YOUR INFO:
- Name: ${customer.name}
- Vehicle: ${customer.vehicle}  
- Problem: ${customer.complaint}
- Mood: ${customer.mood}
- Maximum Budget: ₱${customer.budget}

REALISTIC PRICE RANGE FOR THIS REPAIR: ₱${idealMin.toLocaleString()} - ₱${idealMax.toLocaleString()}

THE ESTIMATE:
- Total: ₱${estimate.grandTotal.toFixed(2)}
- Parts: ₱${estimate.partsTotal.toFixed(2)}
- Labor: ₱${estimate.laborTotal.toFixed(2)}

SERVICE WRITER'S EXPLANATION:
"${notes || 'No explanation provided'}"

DECISION RULES:
1. If total is UNREALISTICALLY LOW (below ₱${idealMin}) → "Suspicious" (customer wonders why so cheap)
2. If total is within realistic range AND explanation is professional → "Accepted"
3. If total is slightly high (up to 20% over budget) with good explanation → "Negotiated"
4. If total > budget OR explanation is bad/rude OR price suspiciously low → "Rejected"

COMMUNICATION QUALITY - Rate 0-100:
- 0: Gibberish, random letters, nonsense, unrelated text, or insults
- 10-30: No explanation OR completely unhelpful  
- 40-60: Basic explanation, somewhat relevant to the repair
- 70-85: Good explanation with technical details about the repair
- 90-100: Excellent - explains repair clearly, uses proper automotive terms, addresses customer concerns

IMPORTANT: If the explanation is gibberish (like 'asdfgh', 'bobobo', random letters, or nonsense words), score it 0 immediately.

Return ONLY this JSON (no extra text):
{
  "outcome": "Accepted" or "Negotiated" or "Rejected" or "Suspicious",
  "message": "Your response in Taglish (1-2 sentences, stay in character based on mood)",
  "feedback": "What the service writer did right or wrong",
  "communicationScore": 0-100,
  "communicationFeedback": "Why this score - what was good/missing in the explanation",
  "priceReasonable": true/false,
  "correctApproach": "If not accepted: what should they have done? If accepted: null",
  "idealEstimate": If not accepted: number between ${idealMin} and ${idealMax}. If accepted: null
}
    `;

    // Try Gemini first (PRIMARY)
    if (model) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log("✅ Estimate evaluated via Gemini");
            return JSON.parse(response.text().replace(/```json|```/g, '').trim());
        } catch (geminiError) {
            console.warn("⚠️ Gemini failed, trying OpenRouter:", geminiError.message);
        }
    }

    // Try OpenRouter as fallback
    if (openRouterAvailable) {
        try {
            const text = await callOpenRouter(prompt);
            console.log("✅ Estimate evaluated via OpenRouter (Kimi K2)");
            return JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch (openRouterError) {
            console.warn("⚠️ OpenRouter failed:", openRouterError.message);
        }
    }

    // Fall back to static evaluation
    console.log("📋 Using fallback evaluation");
    return getFallbackEvaluation(customer, estimate, notes);
};

const getFallbackEvaluation = (customer, estimate, notes = '') => {
    // Calculate ideal estimate range
    const idealMin = customer.idealEstimateRange?.min || customer.budget * 0.3;
    const idealMax = customer.idealEstimateRange?.max || customer.budget * 0.9;
    const idealMid = (idealMin + idealMax) / 2;

    // Reject empty estimates - must have parts or labor
    const hasParts = estimate.partsTotal > 0 || (estimate.parts && estimate.parts.length > 0);
    const hasLabor = estimate.laborTotal > 0;

    if (!hasParts && !hasLabor) {
        return {
            outcome: 'Rejected',
            message: "Ano 'to? Walang laman! Saan yung estimate mo?",
            feedback: "You submitted an empty estimate with no parts or labor. You must provide a proper repair estimate.",
            communicationScore: 0,
            communicationFeedback: "No estimate provided at all.",
            priceReasonable: false,
            correctApproach: `You need to add the required parts and labor for the repair. The customer has a budget of ₱${customer.budget.toLocaleString()}.`,
            idealEstimate: Math.round(idealMid)
        };
    }

    if (estimate.grandTotal <= 0) {
        return {
            outcome: 'Rejected',
            message: "Zero pesos? Libre ba 'to? Hindi ka seryoso!",
            feedback: "Your estimate total is zero. You must provide realistic pricing for parts and labor.",
            communicationScore: 0,
            communicationFeedback: "Zero price is not a valid estimate.",
            priceReasonable: false,
            correctApproach: `Create a proper estimate with realistic prices. Should be between ₱${idealMin.toLocaleString()} - ₱${idealMax.toLocaleString()}.`,
            idealEstimate: Math.round(idealMid)
        };
    }

    // Calculate communication score based on notes
    let communicationScore = 0; // Default to 0
    let communicationFeedback = "No explanation provided to the customer.";

    if (notes && notes.trim().length > 0) {
        const noteText = notes.trim();
        const noteLength = noteText.length;

        // Gibberish detection - check for repeated characters or no real words
        const hasRepeatedChars = /(.)(\1{3,})/i.test(noteText); // 4+ same char in a row
        const hasOnlyRandomChars = !/[aeiou]{1,3}[bcdfghjklmnpqrstvwxyz]/i.test(noteText); // No consonant-vowel patterns
        const wordCount = noteText.split(/\s+/).filter(w => w.length > 2).length;
        const avgWordLength = noteText.replace(/\s/g, '').length / Math.max(wordCount, 1);
        const hasRealWords = /\b(the|and|for|you|your|will|need|replace|repair|check|brake|oil|engine|vehicle|car|part|cost|price|thank|sir|maam|po|lang|na|ng|ang|sa|ay|naman)\b/i.test(noteText);

        // If looks like gibberish, score 0
        if (hasRepeatedChars || (wordCount < 3 && !hasRealWords) || avgWordLength > 15 || hasOnlyRandomChars) {
            communicationScore = 0;
            communicationFeedback = "Invalid explanation - appears to be gibberish or random text.";
        } else {
            // Now check for quality
            const hasKeywords = /repair|replace|fix|check|issue|problem|part|labor|hour|cost|price|thank|please|sir|ma'?am|po|maintain|safety/i.test(noteText);
            const hasTechnicalTerms = /brake|oil|filter|battery|engine|transmission|coolant|fluid|sensor|belt|gasket|rotor|pad|alternator|starter|compressor/i.test(noteText);

            if (noteLength > 80 && hasKeywords && hasTechnicalTerms) {
                communicationScore = 85;
                communicationFeedback = "Excellent explanation with technical details and professional tone.";
            } else if (noteLength > 40 && (hasKeywords || hasTechnicalTerms)) {
                communicationScore = 65;
                communicationFeedback = "Good explanation. Consider adding more technical details.";
            } else if (noteLength > 20 && hasRealWords) {
                communicationScore = 45;
                communicationFeedback = "Basic explanation provided. Could be more detailed and professional.";
            } else if (hasRealWords) {
                communicationScore = 25;
                communicationFeedback = "Very brief explanation. Customers appreciate more detail about the repair.";
            } else {
                communicationScore = 0;
                communicationFeedback = "Explanation doesn't contain relevant repair information.";
            }
        }
    }

    // Check if price is unrealistically low (SUSPICIOUS)
    if (estimate.grandTotal < idealMin * 0.5) {
        return {
            outcome: 'Suspicious',
            message: "Ang mura naman nito... totoo ba 'to? Baka mamaya may problema pa!",
            feedback: "Your estimate is suspiciously low. This makes customers distrust the quality of repair.",
            communicationScore,
            communicationFeedback,
            priceReasonable: false,
            correctApproach: `A realistic estimate for this repair should be between ₱${idealMin.toLocaleString()} - ₱${idealMax.toLocaleString()}. Too low prices make customers suspicious.`,
            idealEstimate: Math.round(idealMid)
        };
    }

    // Check if price is within reasonable range
    const priceReasonable = estimate.grandTotal >= idealMin && estimate.grandTotal <= customer.budget;

    // Evaluate based on price vs budget and ideal range
    if (estimate.grandTotal >= idealMin && estimate.grandTotal <= customer.budget) {
        return {
            outcome: 'Accepted',
            message: communicationScore >= 60
                ? "Sige, okay yan. Maayos naman ang explanation mo."
                : "Ay, okay naman ang presyo. Go na.",
            feedback: priceReasonable
                ? "Good job with realistic pricing within the customer's budget."
                : "Price is acceptable, though consider improving your explanation.",
            communicationScore,
            communicationFeedback,
            priceReasonable: true,
            correctApproach: null,
            idealEstimate: null
        };
    } else if (estimate.grandTotal <= customer.budget * 1.2) {
        return {
            outcome: 'Negotiated',
            message: "Medyo mahal ah... pwede bang bawasan?",
            feedback: "You were slightly over budget, but close enough to negotiate.",
            communicationScore,
            communicationFeedback,
            priceReasonable: false,
            correctApproach: `Try to stay within the customer's ₱${customer.budget.toLocaleString()} budget. A good estimate would be around ₱${Math.round(idealMid).toLocaleString()}.`,
            idealEstimate: Math.round(idealMid)
        };
    } else {
        return {
            outcome: 'Rejected',
            message: "Grabe ang mahal! Hindi ko kaya yan!",
            feedback: "You significantly exceeded the customer's budget.",
            communicationScore,
            communicationFeedback,
            priceReasonable: false,
            correctApproach: `This customer has a budget of ₱${customer.budget.toLocaleString()}. A realistic estimate would be ₱${idealMin.toLocaleString()} - ₱${idealMax.toLocaleString()}.`,
            idealEstimate: Math.round(idealMid)
        };
    }
};

/**
 * Ask the customer a clarifying question and get their response
 * @param {Object} customer - The customer object with their info
 * @param {string} question - The question to ask
 * @param {Array} conversationHistory - Array of previous Q&A: [{question: "", answer: ""}]
 * @returns {Promise<string>} - The customer's response
 */
export const askCustomerQuestion = async (customer, question, conversationHistory = []) => {
    // Build conversation history string
    const historyText = conversationHistory.length > 0
        ? `\nPREVIOUS CONVERSATION (you MUST be consistent with your previous answers):\n${conversationHistory.map(qa => `- Mechanic asked: "${qa.question}"\n  You answered: "${qa.answer}"`).join('\n')}\n`
        : '';

    const prompt = `
You are ROLEPLAYING as ${customer.name}, a ${customer.mood.toLowerCase()} Filipino customer at an auto repair shop.
The SERVICE WRITER (the person asking you questions) works at the shop and is helping you.

YOUR CAR PROBLEM: ${customer.complaint}
YOUR VEHICLE: ${customer.vehicle}
${historyText}
The SERVICE WRITER NOW asks you: "${question}"

CRITICAL RULES:
1. You are the CUSTOMER (${customer.name}). The Service Writer is NOT named ${customer.name} - that's YOUR name.
2. Be CONSISTENT with your previous answers - do NOT contradict what you already said
3. Answer ONLY the new question
4. Do NOT repeat your original complaint
5. Do NOT introduce yourself
6. Keep response to 1-2 sentences in Taglish
7. Stay in character as ${customer.mood}
8. NEVER call the Service Writer by your own name

Reply with ONLY your spoken response as the customer:
    `;

    // Try Gemini first (PRIMARY)
    if (model) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log("✅ Customer response via Gemini");
            return response.text().trim().replace(/^["']|["']$/g, '');
        } catch (geminiError) {
            console.warn("⚠️ Gemini failed, trying OpenRouter:", geminiError.message);
        }
    }

    // Try OpenRouter as fallback
    if (openRouterAvailable) {
        try {
            const text = await callOpenRouter(prompt);
            console.log("✅ Customer response via OpenRouter (Kimi K2)");
            return text.trim().replace(/^["']|["']$/g, '');
        } catch (openRouterError) {
            console.warn("⚠️ OpenRouter failed:", openRouterError.message);
        }
    }

    // Fall back to static response
    console.log("📋 Using fallback customer response");
    return getFallbackQuestionResponse(customer, question);
};

const getFallbackQuestionResponse = (customer, question) => {
    const questionLower = question.toLowerCase();

    // Generic responses based on question type
    if (questionLower.includes('when') || questionLower.includes('kailan')) {
        return "Mga ilang araw na po, pero lumalala na lately.";
    }
    if (questionLower.includes('sound') || questionLower.includes('noise') || questionLower.includes('tunog')) {
        return "May tunog po na parang kalampag, lalo na pag may lubak.";
    }
    if (questionLower.includes('warning') || questionLower.includes('light') || questionLower.includes('ilaw')) {
        return "Wala naman pong warning light na nag-on eh.";
    }
    if (questionLower.includes('service') || questionLower.includes('maintenance') || questionLower.includes('ayos')) {
        return "Last year pa po yung huling service nito.";
    }
    if (questionLower.includes('budget') || questionLower.includes('magkano') || questionLower.includes('afford')) {
        const responses = {
            'Friendly': "Okay lang po kahit magkano, basta maayos.",
            'Clueless': "Hindi ko po alam eh, ikaw na po bahala.",
            'Impatient': "Basta wag lang masyadong mahal!",
            'Suspicious': "Bakit? Mahal ba? Tignan muna natin.",
            'Angry': "Dapat libre 'to! May problema pa rin ba?"
        };
        return responses[customer.mood] || "Sige, tignan mo muna magkano.";
    }

    // Default response based on mood
    const defaults = {
        'Friendly': "Hmm, hindi ko masyadong napansin, pero basta may problema talaga.",
        'Clueless': "Hindi ko po sure eh, basta ganun yung nangyari.",
        'Impatient': "Hindi ko na maalala, basta ayusin mo na lang!",
        'Suspicious': "Bakit mo tinatanong yan? May problema ba?",
        'Angry': "Ewan ko, ikaw na mag-figure out diyan!"
    };

    return defaults[customer.mood] || "Sige, tignan mo na lang.";
};

/**
 * Ask the technician to perform additional diagnosis/testing
 * @param {Object} customer - The customer object with vehicle and problem info
 * @param {string} command - The command/request from the student
 * @returns {Promise<string>} - The technician's findings
 */
export const askTechnicianToCheck = async (customer, command) => {
    const prompt = `
You are an experienced automotive technician at a repair shop in the Philippines.

VEHICLE: ${customer.vehicle}
CUSTOMER COMPLAINT: ${customer.complaint}
ACTUAL PROBLEM (hidden from student): ${customer.actualProblem}

The service writer asks you to: "${command}"

Respond with your findings in 2-3 sentences. Be technical but clear.
- If the command is relevant to the actual problem, give useful diagnostic info
- If the command is unrelated, report "no issues found" for that test
- Use proper automotive terminology
- Include specific readings/measurements when applicable

Reply with ONLY your spoken response (no quotes, no labels):
    `;

    // Try Gemini first (PRIMARY)
    if (model) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log("✅ Technician response via Gemini");
            return response.text().trim().replace(/^["']|["']$/g, '');
        } catch (geminiError) {
            console.warn("⚠️ Gemini failed, trying OpenRouter:", geminiError.message);
        }
    }

    // Try OpenRouter as fallback
    if (openRouterAvailable) {
        try {
            const text = await callOpenRouter(prompt);
            console.log("✅ Technician response via OpenRouter (Kimi K2)");
            return text.trim().replace(/^["']|["']$/g, '');
        } catch (openRouterError) {
            console.warn("⚠️ OpenRouter failed:", openRouterError.message);
        }
    }

    // Fall back to static response
    console.log("📋 Using fallback technician response");
    return getFallbackTechnicianResponse(customer, command);
};

const getFallbackTechnicianResponse = (customer, command) => {
    const commandLower = command.toLowerCase();
    const problem = (customer.actualProblem || customer.complaint || '').toLowerCase();

    // Check if command is relevant to the problem
    const relevantKeywords = {
        battery: ['battery', 'starting', 'charging', 'alternator', 'electrical'],
        brake: ['brake', 'stopping', 'pedal', 'rotor', 'caliper'],
        engine: ['engine', 'misfire', 'idle', 'rough', 'check engine', 'spark'],
        cooling: ['coolant', 'overheat', 'temperature', 'radiator', 'thermostat'],
        ac: ['ac', 'aircon', 'cold', 'refrigerant', 'compressor'],
        transmission: ['transmission', 'shifting', 'gear', 'clutch'],
        suspension: ['suspension', 'shock', 'strut', 'noise', 'bumpy']
    };

    // Find which category the problem belongs to
    let problemCategory = null;
    for (const [category, keywords] of Object.entries(relevantKeywords)) {
        if (keywords.some(kw => problem.includes(kw))) {
            problemCategory = category;
            break;
        }
    }

    // Check if command matches the problem category
    const commandRelevant = problemCategory && relevantKeywords[problemCategory]?.some(kw => commandLower.includes(kw));

    if (commandRelevant) {
        // Give relevant findings
        const relevantResponses = {
            battery: "Battery showing 11.8V at rest, drops to 9.2V during cranking - below spec. Terminal voltage shows signs of sulfation. Alternator output at 13.2V, slightly low.",
            brake: "Brake pad thickness at 2mm on inner pads - below minimum spec. Rotor surface shows scoring. Caliper slides moving but slightly sticky.",
            engine: "Cylinder 2 and 3 showing intermittent misfires on scan tool. Spark plugs worn with 0.9mm gap - spec is 0.7mm. Ignition coil resistance within range.",
            cooling: "Coolant level low by 500ml. Pressure test holds at 15 PSI for 5 minutes - no external leaks. Thermostat not opening until 105°C - should be 82°C.",
            ac: "AC system pressure reads 25 PSI low side, 180 PSI high side. Slight dye traces near compressor. Cabin vent temp at 18°C - should be around 8°C.",
            transmission: "Transmission fluid dark with slight burnt smell. Fluid level normal. No unusual noises during shift test.",
            suspension: "Front left shock showing oil seepage. Bounce test shows weak damping. Upper strut mount shows play when loaded."
        };
        return relevantResponses[problemCategory] || "Findings show some abnormalities in that area. Further inspection recommended.";
    }

    // Generic responses for unrelated checks
    const genericResponses = [
        "Checked as requested - no issues found in that area. Everything within normal specs.",
        "Test completed. All readings normal for that system. No problems detected.",
        "Inspected that component - functioning properly. No abnormalities found.",
        "Ran the diagnostic on that system. All parameters within acceptable range."
    ];

    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
};

// ============================================
// CROSS-SYSTEM DETECTIVE FUNCTIONS
// ============================================

/**
 * Generate a cross-system mystery case using AI or fallback data
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {Promise<Object>} - The case object
 */
export const generateCrossSystemCase = async (difficulty = 'easy') => {
    const difficultyGuides = {
        easy: 'The connection between systems should be relatively obvious with clear clues.',
        medium: 'The connection requires some detective work. Symptoms could point to 2-3 possible systems.',
        hard: 'The connection is subtle. Multiple red herrings, intermittent symptoms, or chain reactions across 3+ systems.'
    };

    // Random system combinations to force variety
    const systemCombos = [
        { symptom: 'Brakes', root: 'Suspension', example: 'bad control arm causing pulling' },
        { symptom: 'Engine', root: 'Electrical', example: 'bad ground causing misfires' },
        { symptom: 'Transmission', root: 'Engine', example: 'low power causing hard shifts' },
        { symptom: 'Steering', root: 'Suspension', example: 'worn tie rods causing vibration' },
        { symptom: 'AC/Climate Control', root: 'Cooling System', example: 'low coolant affecting heater' },
        { symptom: 'Electrical', root: 'Charging System', example: 'bad alternator causing dim lights' },
        { symptom: 'Engine', root: 'Fuel System', example: 'clogged filter causing stalling' },
        { symptom: 'Brakes', root: 'Hydraulic System', example: 'master cylinder causing soft pedal' },
        { symptom: 'Suspension', root: 'Steering', example: 'worn rack causing tire wear' },
        { symptom: 'Transmission', root: 'Cooling System', example: 'overheating affecting fluid' }
    ];

    const randomCombo = systemCombos[Math.floor(Math.random() * systemCombos.length)];
    const randomSeed = Math.floor(Math.random() * 10000);

    // Random vehicle to add variety
    const vehicles = ['2018 Toyota Vios', '2015 Honda City', '2020 Mitsubishi Xpander', '2017 Nissan Navara', '2019 Suzuki Ertiga', '2016 Hyundai Accent', '2021 Toyota Fortuner', '2014 Honda CR-V'];
    const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];

    const prompt = `You are an automotive instructor. Create a Cross-System Detective scenario.

REQUIRED: The symptom MUST appear in the ${randomCombo.symptom} system.
REQUIRED: The root cause MUST be in the ${randomCombo.root} system.
REQUIRED: Use this vehicle: ${randomVehicle}
Hint example: ${randomCombo.example}

DIFFICULTY: ${difficulty.toUpperCase()}
${difficultyGuides[difficulty]}

Random seed for variety: ${randomSeed}

Return ONLY this JSON (no markdown):
{
    "title": "Short unique title",
    "symptomSystem": "${randomCombo.symptom}",
    "rootCauseSystem": "${randomCombo.root}",
    "customerComplaint": "Taglish complaint",
    "vehicleInfo": "${randomVehicle}, [mileage]km",
    "symptomDescription": "Technical symptom description",
    "clues": [
        {"id": 1, "text": "Clue 1", "system": "SystemName"},
        {"id": 2, "text": "Clue 2", "system": "SystemName"},
        {"id": 3, "text": "Clue 3", "system": "SystemName"},
        {"id": 4, "text": "Clue 4", "system": "SystemName"},
        {"id": 5, "text": "Clue 5", "system": "SystemName"}
    ],
    "options": [
        {"id": "option1", "label": "Wrong answer", "description": "Why seems right", "isCorrect": false},
        {"id": "option2", "label": "Wrong answer", "description": "Description", "isCorrect": false},
        {"id": "option3", "label": "Correct answer in ${randomCombo.root}", "description": "Real cause", "isCorrect": true},
        {"id": "option4", "label": "Distractor", "description": "Description", "isCorrect": false}
    ],
    "explanation": "How ${randomCombo.root} problem caused ${randomCombo.symptom} symptom",
    "systemConnection": "${randomCombo.root} → [connection] → ${randomCombo.symptom}",
    "correctParts": ["Part1", "Part2"]
}`;

    // Helper to process and shuffle case data
    const processCaseData = (text) => {
        const caseData = JSON.parse(text.replace(/```json|```/g, '').trim());
        caseData.id = `ai-${Date.now()}`;
        caseData.difficulty = difficulty;

        // Shuffle options so correct answer isn't always in same position
        if (caseData.options && caseData.options.length > 0) {
            for (let i = caseData.options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [caseData.options[i], caseData.options[j]] = [caseData.options[j], caseData.options[i]];
            }
            // Re-assign option IDs after shuffle
            caseData.options.forEach((opt, idx) => {
                opt.id = `option${idx + 1}`;
            });
        }
        return caseData;
    };

    // Try Gemini first (PRIMARY)
    if (model) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log("✅ Cross-system case generated via Gemini");
            return processCaseData(response.text());
        } catch (geminiError) {
            console.warn("⚠️ Gemini failed, trying OpenRouter:", geminiError.message);
        }
    }

    // Try OpenRouter as fallback
    if (openRouterAvailable) {
        try {
            const text = await callOpenRouter(prompt);
            console.log("✅ Cross-system case generated via OpenRouter (Kimi K2)");
            return processCaseData(text);
        } catch (openRouterError) {
            console.warn("⚠️ OpenRouter failed:", openRouterError.message);
        }
    }

    // Fall back to static data
    console.log("📋 Using fallback cross-system case");
    return getCrossSystemCase(difficulty);
};

/**
 * Evaluate the student's diagnosis and provide feedback
 * @param {Object} caseData - The case object
 * @param {string} selectedOptionId - The ID of the option the student selected
 * @returns {Object} - Evaluation result
 */
export const evaluateCrossSystemDiagnosis = (caseData, selectedOptionId) => {
    const selectedOption = caseData.options.find(opt => opt.id === selectedOptionId);
    const correctOption = caseData.options.find(opt => opt.isCorrect);
    const isCorrect = selectedOption?.isCorrect || false;

    return {
        isCorrect,
        selectedAnswer: selectedOption?.label || 'Unknown',
        correctAnswer: correctOption?.label || 'Unknown',
        explanation: caseData.explanation,
        systemConnection: caseData.systemConnection,
        correctParts: caseData.correctParts,
        feedback: isCorrect
            ? 'Excellent! You correctly identified that the root cause was in a different system than where the symptom appeared.'
            : `The symptom appeared in the ${caseData.symptomSystem}, but the root cause was actually in the ${caseData.rootCauseSystem}. Always look for connections between systems!`
    };
};

// ============================================
// SYSTEM CHAIN REACTION GAME FUNCTIONS
// ============================================

/**
 * Generate a chain reaction scenario using AI
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {Promise<Object>} - Scenario object with failure, effects, options
 */
export const generateChainReactionScenario = async (difficulty = 'easy') => {
    const difficultyGuides = {
        easy: 'Simple 2-system chain (A fails → B affected). Use common issues like thermostat, battery, serpentine belt.',
        medium: 'Medium 3-system chain (A fails → B affected → C affected). Use sensor failures, vacuum leaks, fuel pump issues.',
        hard: 'Complex 4+ system chain with multiple effects. Use timing chain, head gasket, transmission overheating scenarios.'
    };

    const automotiveSystems = ['Engine', 'Cooling', 'Electrical', 'Transmission', 'Brakes', 'Steering', 'Suspension', 'Fuel System', 'Exhaust', 'HVAC', 'Ignition'];
    const primarySystem = automotiveSystems[Math.floor(Math.random() * automotiveSystems.length)];
    const randomSeed = Math.floor(Math.random() * 10000);

    const prompt = `You are an automotive instructor creating a "System Chain Reaction" quiz.

DIFFICULTY: ${difficulty.toUpperCase()}
${difficultyGuides[difficulty]}

PRIMARY SYSTEM: ${primarySystem}
Seed: ${randomSeed}

Generate a failure scenario with ONE correct chain reaction and THREE WRONG alternatives.

CRITICAL RULES:
1. Each option MUST be COMPLETELY DIFFERENT - different systems, different effects
2. All 4 options should have 3-4 arrow steps (similar length)
3. Wrong options should be PLAUSIBLE but incorrect for THIS specific failure

Example format:
If failure is "Thermostat stuck OPEN":
- CORRECT: "Engine runs cold → Heater blows cold → ECU runs rich → Poor fuel economy"
- WRONG1: "Engine overheats → Coolant boils → Head gasket fails" (wrong - this is stuck CLOSED)
- WRONG2: "Battery drains → Starter fails → No crank" (wrong - unrelated system)
- WRONG3: "Transmission overheats → Harsh shifting → Limp mode" (wrong - unrelated)

Return ONLY this JSON:
{
    "primaryFailure": "What failed",
    "affectedSystem": "${primarySystem}",
    "scenario": "Customer complaint",
    "chainEffect": "Correct: A → B → C → D",
    "wrongEffects": [
        "Wrong chain involving different outcome",
        "Wrong chain involving unrelated system",
        "Wrong chain that sounds right but isn't"
    ],
    "explanation": "Why the correct answer is right",
    "systems": ["Affected", "Systems"]
}`;

    // Helper to normalize chain length - all options should have similar number of steps
    const normalizeChainLength = (options) => {
        // Count arrows in each option to determine "steps"
        const countSteps = (text) => (text.match(/→/g) || []).length;

        // Find the minimum number of steps among all options
        const steps = options.map(o => countSteps(o.text));
        const minSteps = Math.min(...steps);
        const targetSteps = Math.max(minSteps, 3); // At least 3 steps

        // Truncate options that are too long
        return options.map(opt => {
            const parts = opt.text.split('→').map(p => p.trim());
            if (parts.length > targetSteps + 1) {
                // Take first (targetSteps + 1) parts
                const truncated = parts.slice(0, targetSteps + 1).join(' → ');
                return { ...opt, text: truncated };
            }
            return opt;
        });
    };

    // Helper to parse AI response and format scenario
    const parseScenario = (text) => {
        const cleanText = text.replace(/```json|```/g, '').trim();
        const scenario = JSON.parse(cleanText);

        // Create options array
        let options = [
            { id: 'correct', text: scenario.chainEffect, isCorrect: true },
            ...scenario.wrongEffects.map((effect, i) => ({ id: `wrong${i}`, text: effect, isCorrect: false }))
        ];

        // Normalize chain lengths so correct isn't obviously longer
        options = normalizeChainLength(options);

        // Check for duplicate options (lazy AI) - if found, throw to use fallback
        const uniqueTexts = new Set(options.map(o => o.text.toLowerCase().trim()));
        if (uniqueTexts.size < options.length) {
            throw new Error('AI generated duplicate options');
        }

        // Shuffle options
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        options.forEach((opt, idx) => {
            opt.id = `option${idx + 1}`;
        });

        return {
            ...scenario,
            options,
            id: `ai-${Date.now()}`
        };
    };

    // Try Gemini first (PRIMARY)
    if (model) {
        try {
            checkRateLimit();
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            console.log("✅ Chain Reaction generated via Gemini");
            return parseScenario(text);
        } catch (geminiError) {
            console.warn("⚠️ Gemini failed, trying OpenRouter:", geminiError.message);
        }
    }

    // Try OpenRouter as fallback
    if (openRouterAvailable) {
        try {
            const text = await callOpenRouter(prompt);
            console.log("✅ Chain Reaction generated via OpenRouter (Kimi K2)");
            return parseScenario(text);
        } catch (openRouterError) {
            console.warn("⚠️ OpenRouter failed:", openRouterError.message);
        }
    }

    // Fall back to static scenarios
    console.log("📋 Using fallback scenario data");
    return getChainReactionScenario(difficulty);
};

// ============================================
// TECHNICIAN DETECTIVE GAME FUNCTIONS
// ============================================

/**
 * Generate a diagnostic case for Technician Detective game
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {Promise<Object>} - Case object WITHOUT revealing the diagnosis
 */
export const generateTechnicianCase = async (difficulty = 'easy') => {
    const vehicles = [
        '2018 Toyota Vios', '2015 Honda City', '2020 Mitsubishi Xpander',
        '2017 Nissan Navara', '2019 Suzuki Ertiga', '2016 Hyundai Accent',
        '2021 Toyota Fortuner', '2014 Honda CR-V', '2012 Toyota Innova'
    ];
    const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
    const randomSeed = Math.floor(Math.random() * 10000);

    const difficultyGuides = {
        easy: 'Simple single-system issue with clear symptoms. Diagnosis should be relatively straightforward.',
        medium: 'Issue could be one of 2-3 possible causes. Requires some investigation to narrow down.',
        hard: 'Complex issue with multiple possible causes or intermittent symptoms. Red herrings present.'
    };

    const problemTypes = {
        easy: ['dead battery', 'worn brake pads', 'low coolant', 'dirty air filter', 'worn wiper blades'],
        medium: ['rough idle', 'AC not cooling', 'check engine light', 'power steering noise', 'brake vibration'],
        hard: ['intermittent stalling', 'electrical drain', 'engine misfire', 'transmission slip', 'mystery noise']
    };
    const randomProblem = problemTypes[difficulty][Math.floor(Math.random() * problemTypes[difficulty].length)];

    const prompt = `
You are an automotive instructor creating a DIAGNOSTIC MYSTERY for students.

Vehicle: ${randomVehicle}
Problem type hint: ${randomProblem}
Difficulty: ${difficulty.toUpperCase()}
${difficultyGuides[difficulty]}
Random seed: ${randomSeed}

IMPORTANT: The problem MUST be related to one of these 7 automotive systems:
- Engine (engine components, fuel system, ignition)
- Brakes (brake pads, rotors, calipers, brake fluid)
- Electrical (battery, alternator, wiring, lights)
- Suspension (shocks, struts, springs, bushings)
- AC/Cooling (radiator, AC compressor, coolant, thermostat)
- Transmission (gearbox, clutch, transmission fluid)
- Steering (power steering, tie rods, rack and pinion)

Create a case where the student must DIAGNOSE the problem (they don't know what's wrong).

Return ONLY this JSON (no markdown):
{
    "id": "tech-${Date.now()}",
    "vehicle": "${randomVehicle}",
    "system": "The affected system from the 7 above (e.g., 'Brakes', 'Engine', 'Electrical')",
    "customerComplaint": "Taglish description of symptoms (what customer notices, NOT the diagnosis)",
    "initialObservations": "What the technician sees during initial visual inspection",
    "mileage": random_km_number,
    "actualDiagnosis": "The real problem (hidden from student until they guess)",
    "correctParts": ["Part1", "Part2"],
    "possibleDiagnoses": [
        {"id": "diag1", "label": "Correct diagnosis", "isCorrect": true},
        {"id": "diag2", "label": "Plausible wrong answer", "isCorrect": false},
        {"id": "diag3", "label": "Another wrong answer", "isCorrect": false},
        {"id": "diag4", "label": "Distractor", "isCorrect": false}
    ],
    "diagnosticHints": {
        "battery_test": "Result if student tests battery",
        "scan_tool": "Result if student runs diagnostic scan",
        "visual_inspection": "Result if student does detailed visual check",
        "fluid_check": "Result if student checks fluid levels",
        "test_drive": "Result if student does test drive",
        "compression_test": "Result if student tests compression",
        "pressure_test": "Result for pressure testing"
    },
    "difficulty": "${difficulty}"
}
    `;

    const processCaseData = (text) => {
        const caseData = JSON.parse(text.replace(/```json|```/g, '').trim());
        // Shuffle diagnoses so correct answer isn't always first
        if (caseData.possibleDiagnoses && caseData.possibleDiagnoses.length > 0) {
            for (let i = caseData.possibleDiagnoses.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [caseData.possibleDiagnoses[i], caseData.possibleDiagnoses[j]] =
                    [caseData.possibleDiagnoses[j], caseData.possibleDiagnoses[i]];
            }
        }
        return caseData;
    };

    // Try Gemini first (PRIMARY)
    if (model) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log("✅ Technician case generated via Gemini");
            return processCaseData(response.text());
        } catch (geminiError) {
            console.warn("⚠️ Gemini failed, trying OpenRouter:", geminiError.message);
        }
    }

    // Try OpenRouter as fallback
    if (openRouterAvailable) {
        try {
            const text = await callOpenRouter(prompt);
            console.log("✅ Technician case generated via OpenRouter");
            return processCaseData(text);
        } catch (openRouterError) {
            console.warn("⚠️ OpenRouter failed:", openRouterError.message);
        }
    }

    // Fall back to static data
    console.log("📋 Using fallback technician case");
    return getFallbackTechnicianCase(difficulty);
};

const FALLBACK_TECHNICIAN_CASES = {
    easy: [
        {
            id: "tech-fallback-1",
            vehicle: "2019 Toyota Vios",
            system: "Electrical",
            customerComplaint: "Hindi na nag-start yung sasakyan ko. Kahapon okay pa eh.",
            initialObservations: "No visible leaks. Battery terminals have white corrosion. Headlights dim when trying to start.",
            mileage: 45000,
            actualDiagnosis: "Dead battery due to corroded terminals preventing proper charging",
            correctParts: ["Car Battery", "Battery Terminals"],
            possibleDiagnoses: [
                { id: "diag1", label: "Dead battery / corroded terminals", isCorrect: true },
                { id: "diag2", label: "Faulty starter motor", isCorrect: false },
                { id: "diag3", label: "Fuel pump failure", isCorrect: false },
                { id: "diag4", label: "Ignition switch problem", isCorrect: false }
            ],
            diagnosticHints: {
                battery_test: "Battery voltage: 10.2V (should be 12.4V+). Load test FAILED - drops to 8V under load.",
                scan_tool: "No fault codes stored. Unable to communicate - low voltage.",
                visual_inspection: "Heavy white/green corrosion on both battery terminals. Cable ends corroded.",
                fluid_check: "All fluids at normal levels.",
                test_drive: "Cannot perform - vehicle won't start.",
                compression_test: "Cannot perform - engine won't crank.",
                pressure_test: "Cannot perform - engine won't run."
            },
            difficulty: "easy"
        },
        {
            id: "tech-fallback-2",
            vehicle: "2020 Honda City",
            system: "Brakes",
            customerComplaint: "Yung brake ko parang nagiingay, may kalampag kapag nag-brake.",
            initialObservations: "Wheels appear normal. No visible brake fluid leak. Slight brake dust buildup on front wheels.",
            mileage: 38000,
            actualDiagnosis: "Worn brake pads - metal backing contacting rotor",
            correctParts: ["Front Brake Pads", "Brake Rotor"],
            possibleDiagnoses: [
                { id: "diag1", label: "Worn brake pads", isCorrect: true },
                { id: "diag2", label: "Warped rotors", isCorrect: false },
                { id: "diag3", label: "Stuck caliper", isCorrect: false },
                { id: "diag4", label: "Loose wheel bearing", isCorrect: false }
            ],
            diagnosticHints: {
                battery_test: "Battery good - 12.6V, passes load test.",
                scan_tool: "No fault codes.",
                visual_inspection: "Front brake pads worn to 1mm - metal wear indicator visible. Rotor has light scoring from metal contact.",
                fluid_check: "Brake fluid slightly low (normal with worn pads). Fluid color dark - recommend flush.",
                test_drive: "Grinding noise when braking. Brake pedal feels normal.",
                compression_test: "Not applicable for this issue.",
                pressure_test: "Brake line pressure normal."
            },
            difficulty: "easy"
        }
    ],
    medium: [
        {
            id: "tech-fallback-3",
            vehicle: "2017 Mitsubishi Montero",
            system: "Engine",
            customerComplaint: "Parang nagvivibrate yung sasakyan pag naka-idle, lalo na pag naka-aircon.",
            initialObservations: "Engine running but rough. No warning lights. AC clutch engaging normally.",
            mileage: 72000,
            actualDiagnosis: "Dirty throttle body causing improper idle air flow",
            correctParts: ["Throttle Body Cleaning", "Air Filter", "Spark Plugs"],
            possibleDiagnoses: [
                { id: "diag1", label: "Dirty throttle body / IAC valve", isCorrect: true },
                { id: "diag2", label: "Failing AC compressor", isCorrect: false },
                { id: "diag3", label: "Engine mount failure", isCorrect: false },
                { id: "diag4", label: "Vacuum leak", isCorrect: false }
            ],
            diagnosticHints: {
                battery_test: "Battery and charging system normal.",
                scan_tool: "No stored codes. Live data shows IAC counts high at 85 (normal 25-45). MAF readings slightly low.",
                visual_inspection: "Throttle body inlet black with carbon buildup. Air filter dirty. Spark plugs due for replacement.",
                fluid_check: "All fluids normal levels.",
                test_drive: "Idle drops to 500 RPM with AC on. Normal spec is 700-800 RPM.",
                compression_test: "Compression even across all cylinders.",
                pressure_test: "Fuel pressure within spec."
            },
            difficulty: "medium"
        }
    ],
    hard: [
        {
            id: "tech-fallback-4",
            vehicle: "2015 Toyota Innova",
            system: "Engine",
            customerComplaint: "Minsan bigla na lang namamatay, tapos pag pinastart ulit okay naman. Hindi consistent.",
            initialObservations: "Engine starts and runs normally during inspection. No warning lights currently on.",
            mileage: 95000,
            actualDiagnosis: "Failing crankshaft position sensor causing intermittent signal loss",
            correctParts: ["Crankshaft Position Sensor", "Camshaft Position Sensor"],
            possibleDiagnoses: [
                { id: "diag1", label: "Crankshaft position sensor failure", isCorrect: true },
                { id: "diag2", label: "Fuel pump relay intermittent", isCorrect: false },
                { id: "diag3", label: "Ignition coil pack failure", isCorrect: false },
                { id: "diag4", label: "ECU malfunction", isCorrect: false }
            ],
            diagnosticHints: {
                battery_test: "Battery and charging system normal.",
                scan_tool: "History code P0335 - Crankshaft Position Sensor Circuit. Currently not active. Freeze frame shows stall at operating temperature.",
                visual_inspection: "CKP sensor wiring appears intact. Slight oil residue near sensor. Timing belt cover shows age.",
                fluid_check: "Oil slightly overfilled. Coolant at normal level.",
                test_drive: "Could not replicate stalling during 15-minute test. Vehicle runs smoothly when warm.",
                compression_test: "Compression even and within spec.",
                pressure_test: "Fuel pressure holds steady - no drop during extended monitoring."
            },
            difficulty: "hard"
        }
    ]
};

const getFallbackTechnicianCase = (difficulty = 'easy') => {
    const cases = FALLBACK_TECHNICIAN_CASES[difficulty] || FALLBACK_TECHNICIAN_CASES.easy;
    return cases[Math.floor(Math.random() * cases.length)];
};

/**
 * Run a diagnostic test and get results
 * @param {Object} caseData - The case object
 * @param {string} testType - Type of test to run
 * @returns {string} - Test result
 */
export const runDiagnosticTest = (caseData, testType) => {
    const testMap = {
        'battery': 'battery_test',
        'scan': 'scan_tool',
        'visual': 'visual_inspection',
        'fluids': 'fluid_check',
        'drive': 'test_drive',
        'compression': 'compression_test',
        'pressure': 'pressure_test'
    };

    const mappedTest = testMap[testType] || testType;

    if (caseData.diagnosticHints && caseData.diagnosticHints[mappedTest]) {
        return caseData.diagnosticHints[mappedTest];
    }

    // Default responses for unmapped tests
    return "Test completed - no significant findings. Consider trying a different diagnostic approach.";
};

/**
 * Evaluate the student's diagnosis
 * @param {Object} caseData - The case object
 * @param {string} selectedDiagnosisId - ID of selected diagnosis
 * @param {Array} selectedParts - Parts the student selected
 * @param {number} testsUsed - Number of diagnostic tests used
 * @param {number} testsAllowed - Maximum tests allowed
 * @returns {Object} - Evaluation result with scores
 */
export const evaluateTechnicianDiagnosis = (caseData, selectedDiagnosisId, selectedParts = [], testsUsed = 0, testsAllowed = 3) => {
    const selectedDiagnosis = caseData.possibleDiagnoses?.find(d => d.id === selectedDiagnosisId);
    const correctDiagnosis = caseData.possibleDiagnoses?.find(d => d.isCorrect);
    const isCorrect = selectedDiagnosis?.isCorrect || false;

    // Calculate parts accuracy
    const correctPartsLower = (caseData.correctParts || []).map(p => p.toLowerCase());
    const selectedPartsLower = (selectedParts || []).map(p => p.toLowerCase());

    let partsMatched = 0;
    correctPartsLower.forEach(cp => {
        if (selectedPartsLower.some(sp => sp.includes(cp) || cp.includes(sp))) {
            partsMatched++;
        }
    });
    const partsAccuracy = correctPartsLower.length > 0
        ? (partsMatched / correctPartsLower.length) * 100
        : 0;

    // Calculate efficiency score (using fewer tests = better)
    const efficiencyScore = testsAllowed > 0
        ? Math.max(0, 100 - ((testsUsed / testsAllowed) * 50))
        : 100;

    // Calculate scores
    const diagnosisScore = isCorrect ? 50 : 0;
    const partsScore = Math.round((partsAccuracy / 100) * 30);
    const efficiencyBonus = Math.round((efficiencyScore / 100) * 20);
    const totalScore = diagnosisScore + partsScore + efficiencyBonus;

    return {
        isCorrect,
        selectedAnswer: selectedDiagnosis?.label || 'Unknown',
        correctAnswer: correctDiagnosis?.label || caseData.actualDiagnosis,
        actualDiagnosis: caseData.actualDiagnosis,
        correctParts: caseData.correctParts,
        partsMatched,
        partsTotal: correctPartsLower.length,
        partsAccuracy,
        testsUsed,
        testsAllowed,
        efficiencyScore,
        scoreBreakdown: {
            diagnosis: diagnosisScore,
            parts: partsScore,
            efficiency: efficiencyBonus,
            total: totalScore
        },
        feedback: isCorrect
            ? `Excellent diagnosis! You correctly identified the ${caseData.actualDiagnosis}.`
            : `The correct diagnosis was: ${caseData.actualDiagnosis}. ${correctDiagnosis?.label || ''}`
    };
};
