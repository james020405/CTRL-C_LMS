/**
 * OBD-II Diagnostic Trouble Codes Data
 * Used for Code Cracker game fallback scenarios
 */

// Common P0 codes - Powertrain (Engine/Transmission)
export const OBD_CODES = {
    easy: [
        {
            code: "P0300",
            meaning: "Random/Multiple Cylinder Misfire Detected",
            category: "Misfire",
            symptoms: ["Rough idle", "Engine shaking", "Check engine light flashing", "Loss of power"],
            correctAction: "Check spark plugs, ignition coils, fuel injectors, and compression across all cylinders",
            wrongActions: ["Replace catalytic converter", "Change transmission fluid", "Replace O2 sensors"]
        },
        {
            code: "P0301",
            meaning: "Cylinder 1 Misfire Detected",
            category: "Misfire",
            symptoms: ["Rough idle", "Engine vibration", "Check engine light", "Power loss"],
            correctAction: "Check spark plug, ignition coil, and fuel injector for cylinder 1",
            wrongActions: ["Replace mass airflow sensor", "Clean throttle body", "Replace PCV valve"]
        },
        {
            code: "P0302",
            meaning: "Cylinder 2 Misfire Detected",
            category: "Misfire",
            symptoms: ["Rough idle", "Engine vibration", "Check engine light"],
            correctAction: "Check spark plug, ignition coil, and fuel injector for cylinder 2",
            wrongActions: ["Replace catalytic converter", "Change engine oil", "Replace air filter"]
        },
        {
            code: "P0171",
            meaning: "System Too Lean (Bank 1)",
            category: "Fuel System",
            symptoms: ["Rough idle", "Hesitation on acceleration", "Poor fuel economy", "Check engine light"],
            correctAction: "Check for vacuum leaks, inspect MAF sensor, check fuel pressure",
            wrongActions: ["Replace spark plugs", "Change transmission fluid", "Replace coolant"]
        },
        {
            code: "P0174",
            meaning: "System Too Lean (Bank 2)",
            category: "Fuel System",
            symptoms: ["Rough idle", "Hesitation", "Poor fuel economy"],
            correctAction: "Check for vacuum leaks, inspect MAF sensor, check fuel pressure on bank 2",
            wrongActions: ["Replace ignition coils", "Flush cooling system", "Replace brake pads"]
        },
        {
            code: "P0420",
            meaning: "Catalyst System Efficiency Below Threshold (Bank 1)",
            category: "Emissions",
            symptoms: ["Check engine light", "Slight power loss", "Failed emissions test", "Sulfur smell"],
            correctAction: "First check for exhaust leaks and O2 sensor function before replacing catalytic converter",
            wrongActions: ["Replace spark plugs immediately", "Change engine oil", "Replace air filter"]
        },
        {
            code: "P0440",
            meaning: "Evaporative Emission Control System Malfunction",
            category: "EVAP",
            symptoms: ["Check engine light", "Fuel smell", "Failed emissions test"],
            correctAction: "Check gas cap seal, inspect EVAP system for leaks, check purge valve",
            wrongActions: ["Replace fuel pump", "Change spark plugs", "Replace oxygen sensors"]
        },
        {
            code: "P0442",
            meaning: "Evaporative Emission Control System Leak Detected (Small Leak)",
            category: "EVAP",
            symptoms: ["Check engine light", "Possible fuel smell"],
            correctAction: "Perform smoke test on EVAP system, check gas cap, inspect hoses",
            wrongActions: ["Replace catalytic converter", "Replace fuel injectors", "Change coolant"]
        },
        {
            code: "P0455",
            meaning: "Evaporative Emission Control System Leak Detected (Large Leak)",
            category: "EVAP",
            symptoms: ["Check engine light", "Strong fuel smell", "Failed emissions"],
            correctAction: "Check gas cap first, then smoke test EVAP system for large leaks",
            wrongActions: ["Replace engine", "Flush transmission", "Replace radiator"]
        },
        {
            code: "P0500",
            meaning: "Vehicle Speed Sensor Malfunction",
            category: "Speed Sensor",
            symptoms: ["Speedometer not working", "ABS light on", "Transmission shifting issues"],
            correctAction: "Check vehicle speed sensor wiring and connector, test or replace VSS",
            wrongActions: ["Replace transmission", "Change brake fluid", "Replace wheel bearings"]
        },
        {
            code: "P0128",
            meaning: "Coolant Thermostat Below Regulating Temperature",
            category: "Cooling System",
            symptoms: ["Engine runs cold", "Poor fuel economy", "Heater not hot", "Check engine light"],
            correctAction: "Replace thermostat - it's stuck open",
            wrongActions: ["Replace water pump", "Flush radiator", "Replace head gasket"]
        },
        {
            code: "P0340",
            meaning: "Camshaft Position Sensor Circuit Malfunction",
            category: "Ignition/Timing",
            symptoms: ["No start or hard start", "Stalling", "Rough idle", "Check engine light"],
            correctAction: "Check camshaft position sensor wiring, connector, and replace sensor if needed",
            wrongActions: ["Replace timing belt immediately", "Change engine oil", "Replace alternator"]
        }
    ],
    medium: [
        {
            code: "P0101",
            meaning: "Mass Air Flow Sensor Circuit Range/Performance Problem",
            category: "Air Intake",
            symptoms: ["Poor acceleration", "Rough idle", "Black smoke", "Poor fuel economy"],
            correctAction: "Clean MAF sensor first, check for air leaks, replace if cleaning doesn't help",
            wrongActions: ["Replace catalytic converter", "Change transmission fluid", "Replace fuel pump"]
        },
        {
            code: "P0102",
            meaning: "Mass Air Flow Sensor Circuit Low Input",
            category: "Air Intake",
            symptoms: ["Stalling", "Hard starting", "Rough idle"],
            correctAction: "Check MAF sensor wiring/connector for damage, test voltage output",
            wrongActions: ["Replace spark plugs", "Change engine oil", "Replace air conditioning compressor"]
        },
        {
            code: "P0113",
            meaning: "Intake Air Temperature Sensor 1 Circuit High Input",
            category: "Air Intake",
            symptoms: ["Rich running condition", "Poor fuel economy", "Hard cold starts"],
            correctAction: "Check IAT sensor connector and wiring, test sensor resistance, replace if faulty",
            wrongActions: ["Replace throttle body", "Change coolant", "Replace fuel filter"]
        },
        {
            code: "P0131",
            meaning: "O2 Sensor Circuit Low Voltage (Bank 1, Sensor 1)",
            category: "Oxygen Sensor",
            symptoms: ["Poor fuel economy", "Rough idle", "Failed emissions"],
            correctAction: "Check O2 sensor wiring, check for exhaust leaks before sensor, replace sensor if needed",
            wrongActions: ["Replace catalytic converter first", "Change spark plugs", "Replace fuel pump"]
        },
        {
            code: "P0135",
            meaning: "O2 Sensor Heater Circuit Malfunction (Bank 1, Sensor 1)",
            category: "Oxygen Sensor",
            symptoms: ["Check engine light", "Poor fuel economy during warm-up", "Failed emissions"],
            correctAction: "Check O2 sensor heater circuit fuse and wiring, replace O2 sensor",
            wrongActions: ["Replace catalytic converter", "Change engine oil", "Replace MAF sensor"]
        },
        {
            code: "P0141",
            meaning: "O2 Sensor Heater Circuit Malfunction (Bank 1, Sensor 2)",
            category: "Oxygen Sensor",
            symptoms: ["Check engine light", "Possible slight fuel economy decrease"],
            correctAction: "Check downstream O2 sensor heater circuit fuse and wiring, replace sensor",
            wrongActions: ["Replace upstream O2 sensor", "Replace fuel injectors", "Change coolant"]
        },
        {
            code: "P0172",
            meaning: "System Too Rich (Bank 1)",
            category: "Fuel System",
            symptoms: ["Black smoke from exhaust", "Strong fuel smell", "Poor fuel economy", "Spark plug fouling"],
            correctAction: "Check for leaking fuel injectors, stuck open fuel pressure regulator, faulty MAF sensor",
            wrongActions: ["Add fuel injector cleaner only", "Replace air filter only", "Change engine oil"]
        },
        {
            code: "P0175",
            meaning: "System Too Rich (Bank 2)",
            category: "Fuel System",
            symptoms: ["Black smoke", "Poor fuel economy", "Rough idle on bank 2"],
            correctAction: "Check fuel injectors, fuel pressure regulator, and MAF sensor on bank 2 side",
            wrongActions: ["Replace catalytic converter", "Change transmission fluid", "Replace thermostat"]
        },
        {
            code: "P0401",
            meaning: "Exhaust Gas Recirculation Flow Insufficient Detected",
            category: "EGR",
            symptoms: ["Check engine light", "Rough idle", "Engine knock/ping under load"],
            correctAction: "Clean or replace EGR valve, check EGR passages for carbon buildup",
            wrongActions: ["Replace catalytic converter", "Change spark plugs", "Replace fuel pump"]
        },
        {
            code: "P0402",
            meaning: "Exhaust Gas Recirculation Flow Excessive Detected",
            category: "EGR",
            symptoms: ["Rough idle", "Stalling", "Hesitation"],
            correctAction: "EGR valve stuck open - clean or replace EGR valve, check vacuum lines",
            wrongActions: ["Replace oxygen sensors", "Change engine oil", "Replace fuel filter"]
        },
        {
            code: "P0505",
            meaning: "Idle Air Control System Malfunction",
            category: "Idle Control",
            symptoms: ["Erratic idle", "Stalling at stops", "Idle too high or too low"],
            correctAction: "Clean or replace idle air control valve, check for vacuum leaks",
            wrongActions: ["Replace fuel pump", "Change transmission fluid", "Replace alternator"]
        },
        {
            code: "P0507",
            meaning: "Idle Air Control System RPM Higher Than Expected",
            category: "Idle Control",
            symptoms: ["High idle speed", "Racing engine at stops"],
            correctAction: "Check for vacuum leaks, clean throttle body, check IAC valve",
            wrongActions: ["Replace starter motor", "Change brake fluid", "Replace water pump"]
        }
    ],
    hard: [
        {
            code: "P0011",
            meaning: "Camshaft Position Timing Over-Advanced (Bank 1)",
            category: "Variable Valve Timing",
            symptoms: ["Rattling on startup", "Poor fuel economy", "Rough idle", "Reduced power"],
            correctAction: "Check oil level/condition first, inspect VVT solenoid and timing chain for stretch",
            wrongActions: ["Replace camshaft immediately", "Change transmission fluid", "Replace water pump"]
        },
        {
            code: "P0016",
            meaning: "Crankshaft/Camshaft Position Correlation (Bank 1 Sensor A)",
            category: "Variable Valve Timing",
            symptoms: ["Hard starting", "Rough running", "Possible no-start"],
            correctAction: "Check timing chain/belt for stretch or jumped teeth, inspect VVT system",
            wrongActions: ["Replace crankshaft sensor only", "Change engine oil only", "Replace fuel pump"]
        },
        {
            code: "P0087",
            meaning: "Fuel Rail/System Pressure Too Low",
            category: "Fuel System",
            symptoms: ["Loss of power", "Rough running", "Long crank times", "Stalling under load"],
            correctAction: "Check fuel pump pressure, inspect fuel filter, check for fuel leaks in high-pressure system",
            wrongActions: ["Replace spark plugs", "Change engine oil", "Replace mass airflow sensor"]
        },
        {
            code: "P0089",
            meaning: "Fuel Pressure Regulator Performance",
            category: "Fuel System",
            symptoms: ["Rough running", "Power loss", "Hard starting"],
            correctAction: "Test fuel pressure regulator operation, check for vacuum leaks at regulator",
            wrongActions: ["Replace fuel injectors", "Change coolant", "Replace thermostat"]
        },
        {
            code: "P0299",
            meaning: "Turbo/Supercharger Underboost Condition",
            category: "Forced Induction",
            symptoms: ["Loss of power", "Limp mode", "Turbo not spooling properly"],
            correctAction: "Check for boost leaks, inspect wastegate operation, check turbo for shaft play",
            wrongActions: ["Replace engine", "Change transmission", "Replace radiator"]
        },
        {
            code: "P0304",
            meaning: "Cylinder 4 Misfire Detected",
            category: "Misfire",
            symptoms: ["Rough idle", "Vibration", "Power loss"],
            correctAction: "Swap ignition coil with known good cylinder to diagnose, check injector and compression",
            wrongActions: ["Replace all coils immediately", "Change all spark plugs without testing", "Replace PCM"]
        },
        {
            code: "P0335",
            meaning: "Crankshaft Position Sensor A Circuit Malfunction",
            category: "Ignition/Timing",
            symptoms: ["No start", "Intermittent stalling", "Rough running"],
            correctAction: "Check crankshaft sensor wiring and connector, check sensor gap, replace sensor",
            wrongActions: ["Replace timing belt immediately", "Replace engine", "Replace transmission"]
        },
        {
            code: "P0446",
            meaning: "Evaporative Emission Control System Vent Control Circuit Malfunction",
            category: "EVAP",
            symptoms: ["Check engine light", "Fuel tank pressure issues"],
            correctAction: "Check EVAP vent solenoid wiring, test solenoid operation, check for blockages",
            wrongActions: ["Replace fuel tank", "Replace fuel pump", "Change engine oil"]
        },
        {
            code: "P0700",
            meaning: "Transmission Control System Malfunction",
            category: "Transmission",
            symptoms: ["Check engine light", "Transmission shifting problems", "Limp mode"],
            correctAction: "Scan transmission module for specific codes, this is a general indicator code",
            wrongActions: ["Replace transmission immediately", "Change engine oil", "Replace catalytic converter"]
        },
        {
            code: "P0715",
            meaning: "Input/Turbine Speed Sensor Circuit Malfunction",
            category: "Transmission",
            symptoms: ["Harsh shifting", "Speedometer issues", "Transmission slipping"],
            correctAction: "Check input speed sensor wiring, test sensor output, replace if faulty",
            wrongActions: ["Replace transmission immediately", "Flush transmission only", "Replace torque converter"]
        },
        {
            code: "P2096",
            meaning: "Post Catalyst Fuel Trim System Too Lean (Bank 1)",
            category: "Emissions",
            symptoms: ["Check engine light", "Slight power loss", "Failed emissions"],
            correctAction: "Check for exhaust leaks near downstream O2 sensor, test catalytic converter efficiency",
            wrongActions: ["Replace upstream O2 sensor", "Change spark plugs", "Replace fuel filter"]
        },
        {
            code: "P2271",
            meaning: "O2 Sensor Signal Stuck Rich (Bank 1, Sensor 2)",
            category: "Oxygen Sensor",
            symptoms: ["Check engine light", "Poor fuel economy"],
            correctAction: "Check for rich running condition first, then inspect downstream O2 sensor wiring and replace",
            wrongActions: ["Replace catalytic converter first", "Replace upstream sensor", "Change engine oil"]
        }
    ]
};

/**
 * Get a random code challenge for the Code Cracker game
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @param {string} mode - 'code_to_meaning' | 'symptoms_to_code' | 'code_to_action'
 * @returns {Object} Challenge object
 */
export const getCodeChallenge = (difficulty = 'easy', mode = 'code_to_meaning') => {
    const codes = OBD_CODES[difficulty] || OBD_CODES.easy;
    const selectedCode = codes[Math.floor(Math.random() * codes.length)];

    // Get distractor codes from same difficulty
    const otherCodes = codes.filter(c => c.code !== selectedCode.code);
    const shuffledOthers = otherCodes.sort(() => Math.random() - 0.5).slice(0, 3);

    switch (mode) {
        case 'code_to_meaning':
            return {
                question: `What does code ${selectedCode.code} indicate?`,
                code: selectedCode.code,
                options: shuffleArray([
                    { id: 'correct', text: selectedCode.meaning, isCorrect: true },
                    ...shuffledOthers.map((c, i) => ({ id: `wrong${i}`, text: c.meaning, isCorrect: false }))
                ]),
                explanation: `${selectedCode.code} means "${selectedCode.meaning}". Category: ${selectedCode.category}. Common symptoms include: ${selectedCode.symptoms.join(', ')}.`,
                correctAction: selectedCode.correctAction
            };

        case 'symptoms_to_code':
            // NOTE: Don't include 'code' field here - the student must figure it out from symptoms
            return {
                question: `A vehicle is experiencing a rough idle and the check engine light is illuminated. During a visual inspection, no obvious issues are found. A scan tool reveals a single cylinder misfire. Which code is most likely present?`,
                symptoms: selectedCode.symptoms,
                options: shuffleArray([
                    { id: 'correct', text: `${selectedCode.code} - ${selectedCode.meaning}`, isCorrect: true },
                    ...shuffledOthers.map((c, i) => ({ id: `wrong${i}`, text: `${c.code} - ${c.meaning}`, isCorrect: false }))
                ]),
                explanation: `These symptoms point to ${selectedCode.code}: "${selectedCode.meaning}". ${selectedCode.correctAction}`,
                correctAction: selectedCode.correctAction
            };

        case 'code_to_action':
            return {
                question: `Code ${selectedCode.code} (${selectedCode.meaning}) is present. What should you do FIRST?`,
                code: selectedCode.code,
                meaning: selectedCode.meaning,
                options: shuffleArray([
                    { id: 'correct', text: selectedCode.correctAction, isCorrect: true },
                    ...selectedCode.wrongActions.map((action, i) => ({ id: `wrong${i}`, text: action, isCorrect: false }))
                ]),
                explanation: `For ${selectedCode.code}, the correct approach is: ${selectedCode.correctAction}. The other options would waste time or money without addressing the actual issue.`,
                correctAction: selectedCode.correctAction
            };

        default:
            return getCodeChallenge(difficulty, 'code_to_meaning');
    }
};

// Helper function to shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Re-assign IDs after shuffle
    return shuffled.map((item, idx) => ({ ...item, id: `option${idx + 1}` }));
}

export default OBD_CODES;
