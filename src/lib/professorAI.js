/**
 * Professor AI Module - Uses OpenRouter (Kimi K2) as primary, Gemini as fallback
 * Separate from student AI to handle professor-specific features
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

let professorModel = null;
let openRouterAvailable = false;

// OpenRouter initialization (PRIMARY)
if (OPENROUTER_API_KEY) {
    openRouterAvailable = true;
    console.log("🔑 Professor AI: OpenRouter ready (Kimi K2 - PRIMARY)");
}

// Initialize Gemini as FALLBACK
if (API_KEY) {
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        professorModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        console.log("✅ Professor AI: Gemini ready (FALLBACK)");
    } catch (error) {
        console.error("❌ Professor Gemini init failed:", error.message);
    }
}

/**
 * Call OpenRouter API for professor AI
 */
async function callProfessorOpenRouter(prompt) {
    if (!OPENROUTER_API_KEY) {
        throw new Error("OpenRouter API key not configured");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "Ctrl C Academy - Professor AI"
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

/**
 * Generate teaching insights and recommendations based on student data
 * @param {Array} students - Array of student objects with performance data
 * @param {Object} gameStats - Object with game statistics
 * @returns {Promise<Object>} - AI-generated insights
 */
export const generateTeachingInsights = async (students, gameStats) => {
    // Prepare data summary for AI
    const activeStudents = students.filter(s => s.gamesPlayed > 0);
    const totalStudents = students.length;
    const avgPoints = activeStudents.length > 0
        ? Math.round(activeStudents.reduce((sum, s) => sum + s.totalPoints, 0) / activeStudents.length)
        : 0;

    // Find patterns
    const gamePerformance = Object.entries(gameStats)
        .filter(([_, stats]) => stats.playCount > 0)
        .map(([game, stats]) => `${game}: ${stats.avgScore} avg, ${stats.playCount} plays`)
        .join('\n');

    const topStudents = [...students]
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 3)
        .map(s => `${s.name}: ${s.totalPoints} pts`)
        .join(', ');

    const strugglingStudents = students.filter(s => s.gamesPlayed < 3).length;
    const decliningStudents = students.filter(s => s.trend < -20).length;

    const prompt = `You are an educational AI assistant helping a professor teaching automotive technology at a Filipino college.

STUDENT DATA SUMMARY:
- Total students: ${totalStudents}
- Active students (played games): ${activeStudents.length}
- Class average: ${avgPoints} points
- Inactive students (< 3 games): ${strugglingStudents}
- Declining performance: ${decliningStudents} students

GAME PERFORMANCE:
${gamePerformance || 'No game data yet'}

TOP PERFORMERS: ${topStudents || 'None yet'}

CONTEXT:
- Games include: Fault Roulette (diagnosing faults), Service Writer (customer interaction), Cross-System Detective (system connections), Tool Selection, Chain Reaction (cascade effects)
- This is a practical automotive education LMS
- Students are learning car repair and diagnostics

Provide teaching insights in this JSON format:
{
    "summary": "2-3 sentence overview of class performance and key observation",
    "recommendations": [
        {
            "title": "Short recommendation title",
            "description": "Actionable advice for the professor",
            "priority": "high/medium/low"
        }
    ],
    "actionItems": ["Specific action 1", "Specific action 2", "Specific action 3"]
}

Focus on:
1. Which automotive topics need more classroom time based on game performance
2. Engagement strategies for inactive students
3. How to leverage top performers as peer tutors
4. Specific games/topics to emphasize

Return ONLY valid JSON, no markdown formatting.`;

    // Try OpenRouter first (PRIMARY)
    if (openRouterAvailable) {
        try {
            const text = await callProfessorOpenRouter(prompt);
            console.log("✅ Professor insights generated via OpenRouter (Kimi K2)");
            return JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch (openRouterError) {
            console.warn("⚠️ OpenRouter failed, trying Gemini:", openRouterError.message);
        }
    }

    // Try Gemini as fallback
    if (professorModel) {
        try {
            const result = await professorModel.generateContent(prompt);
            const response = await result.response;
            console.log("✅ Professor insights generated via Gemini");
            return JSON.parse(response.text().replace(/```json|```/g, '').trim());
        } catch (geminiError) {
            console.warn("⚠️ Gemini failed:", geminiError.message);
        }
    }

    // Fall back to static insights
    console.log("📋 Using fallback professor insights");
    return getFallbackInsights(students, gameStats);
};

/**
 * Fallback insights when AI is not available
 */
const getFallbackInsights = (students, gameStats) => {
    const activeStudents = students.filter(s => s.gamesPlayed > 0);
    const inactiveCount = students.filter(s => s.gamesPlayed < 3).length;

    // Find weakest game
    const sortedGames = Object.entries(gameStats)
        .filter(([_, stats]) => stats.playCount > 0)
        .sort((a, b) => a[1].avgScore - b[1].avgScore);
    const weakestGame = sortedGames[0];

    const recommendations = [];

    if (inactiveCount > students.length * 0.3) {
        recommendations.push({
            title: "Boost Student Engagement",
            description: `${inactiveCount} students have played fewer than 3 games. Consider making gameplay a graded activity or offering bonus points for participation.`,
            priority: "high"
        });
    }

    if (weakestGame) {
        const gameNames = {
            fault_roulette: 'fault diagnosis',
            service_writer: 'customer communication',
            cross_system: 'system interconnections',
            tool_selection: 'tool identification',
            chain_reaction: 'system cascade effects'
        };
        recommendations.push({
            title: `Focus on ${gameNames[weakestGame[0]] || weakestGame[0]}`,
            description: `Students are scoring lowest in this area (${weakestGame[1].avgScore} avg). Consider additional classroom instruction.`,
            priority: "medium"
        });
    }

    if (activeStudents.length >= 3) {
        recommendations.push({
            title: "Leverage Peer Learning",
            description: "Your top performers could help struggling students. Consider pairing them up for hands-on activities.",
            priority: "low"
        });
    }

    return {
        summary: `Your class has ${students.length} students with ${activeStudents.length} actively using the learning games. ${inactiveCount > 0 ? `${inactiveCount} students need encouragement to engage more with the platform.` : 'Great participation overall!'}`,
        recommendations: recommendations.length > 0 ? recommendations : [{
            title: "Keep Up the Good Work",
            description: "Your students are performing well. Continue with your current teaching approach.",
            priority: "low"
        }],
        actionItems: [
            "Review game scores before next class",
            "Encourage inactive students to try the games",
            "Discuss common mistakes from game results"
        ]
    };
};

export default { generateTeachingInsights };
