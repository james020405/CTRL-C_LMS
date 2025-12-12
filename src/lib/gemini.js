import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCrossSystemCase } from '../data/crossSystemCases';
import { getChainReactionScenario } from '../data/chainReactionData';
import logger from './logger';

// Initialize Gemini with multiple model fallbacks
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

let genAI = null;
let model = null;
let geminiAvailable = false;

// Initialize Gemini as FALLBACK (OpenRouter is primary)
if (API_KEY) {
    console.log("🔑 Gemini API key found (FALLBACK)");
    try {
        genAI = new GoogleGenerativeAI(API_KEY);
        model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
        geminiAvailable = true;
        console.log("✅ Gemini ready as fallback");
    } catch (error) {
        console.error("❌ Gemini init failed:", error.message);
        geminiAvailable = false;
    }
}

// OpenRouter PRIMARY AI (uses OpenAI-compatible API format with Kimi K2 free)
// DEBUG: Log whether env variable exists
console.log("🔍 DEBUG: OPENROUTER_API_KEY exists?", !!OPENROUTER_API_KEY);
console.log("🔍 DEBUG: OPENROUTER_API_KEY starts with:", OPENROUTER_API_KEY ? OPENROUTER_API_KEY.substring(0, 15) + "..." : "undefined");
console.log("🔍 DEBUG: All VITE_ env vars:", Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));

const openRouterAvailable = !!OPENROUTER_API_KEY;
if (openRouterAvailable) {
    console.log("🔑 OpenRouter API key found (Kimi K2 - PRIMARY)");
} else {
    console.warn("⚠️ OpenRouter API key NOT FOUND - will use Gemini/fallback only");
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
Create a Filipino customer for an auto repair shop simulation.

REQUIRED - Use these EXACT values:
- Customer name: ${randomName}
- Vehicle: ${randomVehicle}
- Problem type: ${randomProblem}
- Mood: ${randomMood}
- Budget: ${randomBudget} pesos

Random seed: ${randomSeed}

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
    "correctParts": ["part1", "part2", "part3"]
}
    `;

    // Try OpenRouter first (PRIMARY)
    if (openRouterAvailable) {
        try {
            const text = await callOpenRouter(prompt);
            console.log("✅ Service customer generated via OpenRouter (Kimi K2)");
            return JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch (openRouterError) {
            console.warn("⚠️ OpenRouter failed, trying Gemini:", openRouterError.message);
        }
    }

    // Try Gemini as fallback
    if (model) {
        try {
            checkRateLimit();
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log("✅ Service customer generated via Gemini");
            return JSON.parse(response.text().replace(/```json|```/g, '').trim());
        } catch (geminiError) {
            console.warn("⚠️ Gemini failed:", geminiError.message);
        }
    }

    // Fall back to static data
    console.log("📋 Using fallback service customer");
    return getFallbackServiceCustomer(difficulty);
};


const FALLBACK_CUSTOMERS = {
    easy: [
        { name: "Tita Marie", vehicle: "2020 Toyota Fortuner", complaint: "Oil change reminder light on", mood: "Friendly", budget: 25000, dialogue_start: "Hi! I think it's time for my regular service. Magkano po?", technicianReport: "Vehicle due for 40,000km service. Oil is dark and at minimum level. Air filter visibly dirty. Recommend full service.", actualProblem: "Vehicle is due for scheduled maintenance - oil change and filter replacement needed", correctParts: ["Engine Oil (6L)", "Oil Filter", "Air Filter"] },
        { name: "Kuya James", vehicle: "2019 Honda CR-V", complaint: "Aircon not cold enough", mood: "Clueless", budget: 30000, dialogue_start: "Hindi na malamig yung aircon, pero okay lang kahit magkano, basta maayos.", technicianReport: "AC system low on refrigerant. Found dye traces at compressor seal. Evaporator temp reading 18°C (should be 4-7°C). Needs recharge and seal replacement.", actualProblem: "Low refrigerant due to minor leak in AC system, needs recharge and leak repair", correctParts: ["R134a Refrigerant", "AC O-Rings", "AC Compressor Seal"] },
        { name: "Ate Lina", vehicle: "2021 Mitsubishi Xpander", complaint: "Brake pedal feels soft", mood: "Friendly", budget: 28000, dialogue_start: "Kuya, parang malambot na yung brake ko, patingin naman.", technicianReport: "Brake fluid dark/contaminated. Air in brake lines. Master cylinder shows minor seepage. Brake pads at 60% life remaining.", actualProblem: "Brake fluid contaminated and needs bleeding, master cylinder seals starting to wear", correctParts: ["Brake Fluid (DOT4)", "Brake Bleeding Service", "Master Cylinder Seal Kit"] },
        { name: "Sir Jun", vehicle: "2018 Toyota Hilux", complaint: "Car won't start sometimes", mood: "Clueless", budget: 35000, dialogue_start: "Minsan lang naman siya ayaw mag-start, pero pag umulit ulit okay na.", technicianReport: "Battery load test: 380 CCA (rated 600 CCA) - FAIL. Terminals corroded with white buildup. Charging system OK at 14.2V.", actualProblem: "Weak battery and corroded terminals causing intermittent starting issues", correctParts: ["Car Battery (75AH)", "Battery Terminals", "Battery Hold-Down"] }
    ],
    medium: [
        { name: "Aling Rosa", vehicle: "2018 Toyota Innova", complaint: "May warning light na orange", mood: "Impatient", budget: 15000, dialogue_start: "Kailangan ko 'to today ha, at wag naman masyadong mahal!", technicianReport: "Check engine light on. Code P0101 - MAF sensor performance. Air intake system needs inspection.", actualProblem: "Faulty mass airflow sensor causing check engine light and poor fuel economy", correctParts: ["Mass Airflow Sensor", "Air Filter", "Throttle Body Cleaning"] },
        { name: "College Student", vehicle: "2010 Honda City", complaint: "Check engine light on", mood: "Clueless", budget: 20000, dialogue_start: "May ilaw po na nag-on? Masama po ba yun?", technicianReport: "OBD scan shows P0135 - O2 sensor heater circuit. Fuel trim readings abnormal. Suggest fuel system inspection.", actualProblem: "Faulty oxygen sensor causing check engine light, affecting fuel economy", correctParts: ["Oxygen Sensor", "Spark Plugs"] },
        { name: "Kuya Bert", vehicle: "2015 Hyundai Accent", complaint: "Mahina yung headlights", mood: "Impatient", budget: 12000, dialogue_start: "Grabe ang dilim ng ilaw, halos di na makita gabi.", technicianReport: "Charging system voltage low at 12.8V with engine running (should be 13.5-14.5V). Belt appears glazed. Electrical system under investigation.", actualProblem: "Dimming headlights due to failing alternator not charging properly", correctParts: ["Alternator", "Drive Belt", "Headlight Bulbs"] },
        { name: "Tito Danny", vehicle: "2017 Nissan Navara", complaint: "Rough idle pag naka-aircon", mood: "Clueless", budget: 18000, dialogue_start: "Kapag naka-on yung aircon parang nagvivibrate yung sasakyan.", technicianReport: "Engine idle drops to 500 RPM with AC on (spec: 700-800 RPM). Throttle body carbon buildup visible. Ignition system due for service.", actualProblem: "Dirty throttle body and worn spark plugs causing rough idle under load", correctParts: ["Spark Plugs (Set)", "Throttle Body Cleaning", "Idle Air Control Valve"] }
    ],
    hard: [
        { name: "Mang Tomas", vehicle: "1995 Mitsubishi L300", complaint: "Hindi maganda ang takbo", mood: "Suspicious", budget: 8000, dialogue_start: "Wag mo akong lolokohin, alam ko ang kotse. Tignan mo muna bago presyuhan.", technicianReport: "Engine running rough. Multiple possible causes - could be ignition, fuel delivery, or compression. Further diagnosis needed.", actualProblem: "Multiple worn ignition components causing misfires and power loss", correctParts: ["Ignition Coil", "Spark Plugs", "Ignition Wires"] },
        { name: "Angry Kuya", vehicle: "2008 Toyota Vios", complaint: "Something wrong, I don't know", mood: "Angry", budget: 6000, dialogue_start: "Kanina pa 'to nagpoproblema! Dapat libre 'to kasi dito ko rin pinaayos last time!", technicianReport: "Vibration noted at idle. NVH concerns. Could be drivetrain, engine, or mounting related. Road test inconclusive.", actualProblem: "Worn engine mounts causing vibration and rough idle", correctParts: ["Engine Mount (Front)", "Engine Mount (Rear)"] },
        { name: "Ate Nene", vehicle: "2012 Suzuki Ertiga", complaint: "Umiingay kapag lumiliko", mood: "Suspicious", budget: 10000, dialogue_start: "Kanina pa ako nagpunta sa ibang shop, ang mahal daw. Totoo ba yun?", technicianReport: "Noise when turning - could be CV joints, power steering, wheel bearings, or suspension. Steering system requires inspection.", actualProblem: "Worn CV joint boots and low power steering fluid causing noise when turning", correctParts: ["CV Joint Boot Kit", "Power Steering Fluid", "Tie Rod Ends"] },
        { name: "Boss Eddie", vehicle: "2005 Toyota Hi-Ace", complaint: "Ang gastos ng gasolina", mood: "Angry", budget: 7000, dialogue_start: "Bakit ang dami kong gastos sa gas? May problema ba?", technicianReport: "Fuel consumption higher than normal. No codes stored. Possible causes: fuel system, air intake, ignition, or driving habits.", actualProblem: "Clogged fuel injectors and dirty air filter reducing fuel efficiency", correctParts: ["Fuel Injector Cleaning", "Air Filter", "Fuel Filter"] }
    ]
};

const getFallbackServiceCustomer = (difficulty = 'easy') => {
    const customers = FALLBACK_CUSTOMERS[difficulty] || FALLBACK_CUSTOMERS.easy;
    return customers[Math.floor(Math.random() * customers.length)];
};

export const evaluateEstimate = async (customer, estimate, notes) => {
    const prompt = `
You are a Filipino customer at an auto repair shop. Respond IN CHARACTER.

YOUR INFO:
- Name: ${customer.name}
- Vehicle: ${customer.vehicle}  
- Problem: ${customer.complaint}
- Mood: ${customer.mood}
- Maximum Budget: ₱${customer.budget} (This is the MOST you can afford. You will reject anything above this.)

THE ESTIMATE:
- Total: ₱${estimate.grandTotal.toFixed(2)}
- Parts: ₱${estimate.partsTotal.toFixed(2)}
- Labor: ₱${estimate.laborTotal.toFixed(2)}

SERVICE WRITER'S EXPLANATION:
"${notes}"

DECISION RULES:
1. If total ≤ budget AND explanation is good → "Accepted"
2. If total is slightly over budget (within 20%) → "Negotiated" 
3. If total > budget OR explanation is bad/rude → "Rejected"
4. Mood affects tolerance: Friendly=forgiving, Angry=strict, Suspicious=needs convincing

Return ONLY this JSON (no extra text):
{
  "outcome": "Accepted" or "Negotiated" or "Rejected",
  "message": "Your response in Taglish (1-2 sentences, stay in character based on mood)",
  "feedback": "What the service writer did right or wrong",
  "correctApproach": "If not accepted: what should they have quoted (must be ≤ ₱${customer.budget})? If accepted: null",
  "idealEstimate": If not accepted: number ≤ ${customer.budget}. If accepted: null
}
    `;

    // Try OpenRouter first (PRIMARY)
    if (openRouterAvailable) {
        try {
            const text = await callOpenRouter(prompt);
            console.log("✅ Estimate evaluated via OpenRouter (Kimi K2)");
            return JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch (openRouterError) {
            console.warn("⚠️ OpenRouter failed, trying Gemini:", openRouterError.message);
        }
    }

    // Try Gemini as fallback
    if (model) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log("✅ Estimate evaluated via Gemini");
            return JSON.parse(response.text().replace(/```json|```/g, '').trim());
        } catch (geminiError) {
            console.warn("⚠️ Gemini failed:", geminiError.message);
        }
    }

    // Fall back to static evaluation
    console.log("📋 Using fallback evaluation");
    return getFallbackEvaluation(customer, estimate);
};

const getFallbackEvaluation = (customer, estimate) => {
    // Reject empty estimates - must have parts or labor
    const hasParts = estimate.partsTotal > 0 || (estimate.parts && estimate.parts.length > 0);
    const hasLabor = estimate.laborTotal > 0;

    if (!hasParts && !hasLabor) {
        return {
            outcome: 'Rejected',
            message: "Ano 'to? Walang laman! Saan yung estimate mo?",
            feedback: "You submitted an empty estimate with no parts or labor. You must provide a proper repair estimate.",
            correctApproach: `You need to add the required parts and labor for the repair. The customer has a budget of ₱${customer.budget.toLocaleString()}.`,
            idealEstimate: Math.round(customer.budget * 0.8)
        };
    }

    if (estimate.grandTotal <= 0) {
        return {
            outcome: 'Rejected',
            message: "Zero pesos? Libre ba 'to? Hindi ka seryoso!",
            feedback: "Your estimate total is zero. You must provide realistic pricing for parts and labor.",
            correctApproach: `Create a proper estimate with realistic prices. The customer's budget is ₱${customer.budget.toLocaleString()}.`,
            idealEstimate: Math.round(customer.budget * 0.8)
        };
    }

    // Simple logic fallback - now only runs if estimate has content
    if (estimate.grandTotal <= customer.budget) {
        return {
            outcome: 'Accepted',
            message: "That sounds reasonable. Go ahead.",
            feedback: "Good job staying within budget.",
            correctApproach: null,
            idealEstimate: null
        };
    } else if (estimate.grandTotal <= customer.budget * 1.2) {
        return {
            outcome: 'Negotiated',
            message: "It's a bit high... can you do any better?",
            feedback: "You were slightly over budget, but close enough to negotiate.",
            correctApproach: `Try to stay within the customer's ₱${customer.budget.toLocaleString()} budget. Explain the value clearly and offer alternatives if needed.`,
            idealEstimate: Math.round(customer.budget * 0.9)
        };
    } else {
        return {
            outcome: 'Rejected',
            message: "No way! That's too expensive!",
            feedback: "You significantly exceeded the customer's budget.",
            correctApproach: `This customer has a budget of ₱${customer.budget.toLocaleString()}. You should have quoted closer to that amount and explained why each part/labor is necessary. For a ${customer.mood} customer, focus on building trust first.`,
            idealEstimate: Math.round(customer.budget * 0.85)
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
You are ${customer.name}, a ${customer.mood.toLowerCase()} Filipino customer at an auto repair shop.

YOUR CAR PROBLEM: ${customer.complaint}
YOUR VEHICLE: ${customer.vehicle}
${historyText}
The mechanic NOW asks: "${question}"

CRITICAL RULES:
1. Be CONSISTENT with your previous answers - do NOT contradict what you already said
2. Answer ONLY the new question
3. Do NOT repeat your original complaint
4. Do NOT introduce yourself
5. Keep response to 1-2 sentences in Taglish
6. Stay in character as ${customer.mood}

Reply with ONLY your spoken response:
    `;

    // Try OpenRouter first (unlimited usage)
    if (openRouterAvailable) {
        try {
            const text = await callOpenRouter(prompt);
            console.log("✅ Customer response via OpenRouter (Kimi K2)");
            return text.trim().replace(/^["']|["']$/g, '');
        } catch (openRouterError) {
            console.warn("⚠️ OpenRouter failed, trying Gemini:", openRouterError.message);
        }
    }

    // Try Gemini as fallback
    if (model) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log("✅ Customer response via Gemini");
            return response.text().trim().replace(/^["']|["']$/g, '');
        } catch (geminiError) {
            console.warn("⚠️ Gemini failed:", geminiError.message);
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

    // Try OpenRouter first (PRIMARY)
    if (openRouterAvailable) {
        try {
            const text = await callOpenRouter(prompt);
            console.log("✅ Technician response via OpenRouter (Kimi K2)");
            return text.trim().replace(/^["']|["']$/g, '');
        } catch (openRouterError) {
            console.warn("⚠️ OpenRouter failed, trying Gemini:", openRouterError.message);
        }
    }

    // Try Gemini as fallback
    if (model) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log("✅ Technician response via Gemini");
            return response.text().trim().replace(/^["']|["']$/g, '');
        } catch (geminiError) {
            console.warn("⚠️ Gemini failed:", geminiError.message);
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

    // Try OpenRouter first (PRIMARY)
    if (openRouterAvailable) {
        try {
            const text = await callOpenRouter(prompt);
            console.log("✅ Cross-system case generated via OpenRouter (Kimi K2)");
            return processCaseData(text);
        } catch (openRouterError) {
            console.warn("⚠️ OpenRouter failed, trying Gemini:", openRouterError.message);
        }
    }

    // Try Gemini as fallback
    if (model) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log("✅ Cross-system case generated via Gemini");
            return processCaseData(response.text());
        } catch (geminiError) {
            console.warn("⚠️ Gemini failed:", geminiError.message);
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

    const prompt = `You are an automotive instructor creating a "System Chain Reaction" quiz about how failures cascade through interconnected vehicle systems.

DIFFICULTY: ${difficulty.toUpperCase()}
${difficultyGuides[difficulty]}

PRIMARY SYSTEM: ${primarySystem}
Random seed for variety: ${randomSeed}

Create a scenario where a failure in one system causes a cascade effect on other systems.

Return ONLY this JSON (no markdown):
{
    "primaryFailure": "Short description of what failed (e.g., 'Thermostat stuck open')",
    "affectedSystem": "${primarySystem}",
    "scenario": "Customer complaint and symptoms they describe",
    "chainEffect": "Correct answer: System A fails → Effect on B → Effect on C (use arrows)",
    "wrongEffects": [
        "Plausible but wrong chain effect #1",
        "Plausible but wrong chain effect #2", 
        "Plausible but wrong chain effect #3"
    ],
    "explanation": "Detailed explanation of why and how the cascade happens",
    "systems": ["List", "Of", "Affected", "Systems"]
}`;

    // Helper to parse AI response and format scenario
    const parseScenario = (text) => {
        const cleanText = text.replace(/```json|```/g, '').trim();
        const scenario = JSON.parse(cleanText);

        // Create options array with shuffled order
        const options = [
            { id: 'correct', text: scenario.chainEffect, isCorrect: true },
            ...scenario.wrongEffects.map((effect, i) => ({ id: `wrong${i}`, text: effect, isCorrect: false }))
        ];

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

    // Try OpenRouter first (unlimited usage with Kimi K2)
    if (openRouterAvailable) {
        try {
            const text = await callOpenRouter(prompt);
            console.log("✅ Chain Reaction generated via OpenRouter (Kimi K2)");
            return parseScenario(text);
        } catch (openRouterError) {
            console.warn("⚠️ OpenRouter failed, trying Gemini:", openRouterError.message);
        }
    }

    // Try Gemini as fallback
    if (model) {
        try {
            checkRateLimit();
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            console.log("✅ Chain Reaction generated via Gemini");
            return parseScenario(text);
        } catch (geminiError) {
            console.warn("⚠️ Gemini failed:", geminiError.message);
        }
    }

    // Fall back to static scenarios
    console.log("📋 Using fallback scenario data");
    return getChainReactionScenario(difficulty);
};

