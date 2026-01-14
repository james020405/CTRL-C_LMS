/**
 * Tool Challenge Quiz Data
 * Multiple-choice questions testing tool identification and alternative applications
 * Follows metric units (mm), functional descriptions, and includes "twist" questions
 */

// Questions database organized by difficulty
const TOOL_CHALLENGE_QUESTIONS = {
    easy: [
        {
            id: 'easy_1',
            scenario: 'A technician needs to loosen a 14 mm bolt in a recessed engine compartment where a standard wrench cannot swing more than 15 degrees. Which tool would allow continuous ratcheting action in this confined space?',
            options: [
                { id: 'a', text: 'Adjustable wrench', isCorrect: false },
                { id: 'b', text: 'Combination wrench (14 mm)', isCorrect: false },
                { id: 'c', text: 'Ratcheting box-end wrench (14 mm)', isCorrect: true },
                { id: 'd', text: 'Open-end wrench (14 mm)', isCorrect: false },
                { id: 'e', text: 'Locking pliers', isCorrect: false }
            ],
            explanation: 'A ratcheting box-end wrench allows continuous rotation with minimal swing arc, making it ideal for tight spaces where standard wrenches cannot operate effectively.',
            twist: {
                question: 'Besides loosening bolts, this same tool can be used to:',
                options: [
                    { id: 'a', text: 'Measure torque values', isCorrect: false },
                    { id: 'b', text: 'Hold a nut stationary while another wrench turns the bolt', isCorrect: true },
                    { id: 'c', text: 'Cut through seized fasteners', isCorrect: false },
                    { id: 'd', text: 'Extract stripped bolts', isCorrect: false },
                    { id: 'e', text: 'Calibrate socket extensions', isCorrect: false }
                ],
                explanation: 'The ratcheting mechanism can be locked in position to hold a nut while a second wrench applies torque to the bolt.'
            }
        },
        {
            id: 'easy_2',
            scenario: 'A technician is installing a cylinder head and must tighten 12 mm bolts to exactly 65 Nm in a specific sequence. Which tool ensures this level of precision?',
            options: [
                { id: 'a', text: 'Impact wrench', isCorrect: false },
                { id: 'b', text: 'Breaker bar', isCorrect: false },
                { id: 'c', text: 'Socket wrench with extension', isCorrect: false },
                { id: 'd', text: 'Click-type torque wrench', isCorrect: true },
                { id: 'e', text: 'Ratcheting combination wrench', isCorrect: false }
            ],
            explanation: 'A click-type torque wrench provides audible and tactile feedback when the preset torque value is reached, ensuring precise and consistent fastener tightening.',
            twist: {
                question: 'Beyond torquing fasteners, this tool can serve as:',
                options: [
                    { id: 'a', text: 'A pry bar for stubborn components', isCorrect: false },
                    { id: 'b', text: 'A reference to verify if existing bolts meet specification', isCorrect: true },
                    { id: 'c', text: 'A hammer for seized parts', isCorrect: false },
                    { id: 'd', text: 'A socket extension', isCorrect: false },
                    { id: 'e', text: 'A bolt extractor', isCorrect: false }
                ],
                explanation: 'A torque wrench can be used to check if previously installed bolts are tightened to specification by slowly applying torque until the wrench clicks.'
            }
        },
        {
            id: 'easy_3',
            scenario: 'A technician needs to remove a 22 mm oil filter cap that is too tight for hand removal but cannot risk damaging the plastic housing. Which tool provides controlled grip without crushing?',
            options: [
                { id: 'a', text: 'Channel-lock pliers', isCorrect: false },
                { id: 'b', text: 'Oil filter cap wrench (22 mm)', isCorrect: true },
                { id: 'c', text: 'Pipe wrench', isCorrect: false },
                { id: 'd', text: 'Vise-grip pliers', isCorrect: false },
                { id: 'e', text: 'Strap wrench', isCorrect: false }
            ],
            explanation: 'An oil filter cap wrench is specifically designed with the correct internal dimensions to grip the cap securely without applying crushing force to the plastic housing.',
            twist: {
                question: 'This same tool style can alternatively be used to:',
                options: [
                    { id: 'a', text: 'Tighten lug nuts', isCorrect: false },
                    { id: 'b', text: 'Remove similarly-sized plastic drain plugs and caps', isCorrect: true },
                    { id: 'c', text: 'Compress suspension springs', isCorrect: false },
                    { id: 'd', text: 'Align brake rotors', isCorrect: false },
                    { id: 'e', text: 'Extract fuel injectors', isCorrect: false }
                ],
                explanation: 'The socket-style design works on any similarly-sized hexagonal or fluted cap, including transmission fluid check plugs and coolant reservoir caps.'
            }
        },
        {
            id: 'easy_4',
            scenario: 'A technician must remove a 10 mm bolt located 250 mm deep inside a transmission bell housing. Standard sockets cannot reach. Which combination provides both depth and secure fastener engagement?',
            options: [
                { id: 'a', text: 'Magnetic pickup tool', isCorrect: false },
                { id: 'b', text: 'Flexible socket extension', isCorrect: false },
                { id: 'c', text: 'Deep socket (10 mm) with long extension bar', isCorrect: true },
                { id: 'd', text: 'Universal joint with standard socket', isCorrect: false },
                { id: 'e', text: 'Offset screwdriver', isCorrect: false }
            ],
            explanation: 'A deep socket combined with a long extension bar provides the reach needed while maintaining proper engagement with the fastener for secure removal.',
            twist: {
                question: 'Deep sockets are also commonly used to:',
                options: [
                    { id: 'a', text: 'Remove oil drain plugs', isCorrect: false },
                    { id: 'b', text: 'Access spark plugs recessed in aluminum cylinder heads', isCorrect: true },
                    { id: 'c', text: 'Loosen wheel lug nuts', isCorrect: false },
                    { id: 'd', text: 'Install brake caliper bolts', isCorrect: false },
                    { id: 'e', text: 'Remove radiator hoses', isCorrect: false }
                ],
                explanation: 'Spark plugs in modern aluminum heads are often deeply recessed, requiring deep sockets with rubber inserts to grip and protect the ceramic insulator.'
            }
        },
        {
            id: 'easy_5',
            scenario: 'A 13 mm bolt is positioned behind the intake manifold at an awkward angle, making straight-on access impossible. Which tool allows socket engagement at variable angles?',
            options: [
                { id: 'a', text: 'Offset box wrench', isCorrect: false },
                { id: 'b', text: 'Crowfoot wrench', isCorrect: false },
                { id: 'c', text: 'Universal joint (wobble socket adapter)', isCorrect: true },
                { id: 'd', text: 'Ratcheting wrench', isCorrect: false },
                { id: 'e', text: 'Flex-head ratchet', isCorrect: false }
            ],
            explanation: 'A universal joint (wobble adapter) allows the socket to engage the fastener at angles up to 30 degrees, enabling access in tight or obstructed areas.',
            twist: {
                question: 'Universal joints are particularly valuable for:',
                options: [
                    { id: 'a', text: 'Measuring torque at angles', isCorrect: false },
                    { id: 'b', text: 'Accessing starter motor bolts obstructed by exhaust components', isCorrect: true },
                    { id: 'c', text: 'Cutting rusted fasteners', isCorrect: false },
                    { id: 'd', text: 'Compressing valve springs', isCorrect: false },
                    { id: 'e', text: 'Aligning timing chains', isCorrect: false }
                ],
                explanation: 'Starter motors are often positioned where exhaust pipes or other components block straight access, making universal joints essential for removal.'
            }
        }
    ],
    medium: [
        {
            id: 'med_1',
            scenario: 'When replacing a serpentine belt, a technician must release tension from a spring-loaded tensioner that controls the alternator, AC compressor, and water pump pulleys simultaneously. Which specialized tool is designed specifically for this task?',
            options: [
                { id: 'a', text: 'Pry bar', isCorrect: false },
                { id: 'b', text: 'Standard 15 mm socket with breaker bar', isCorrect: false },
                { id: 'c', text: 'Serpentine belt tensioner tool', isCorrect: true },
                { id: 'd', text: 'Adjustable pliers', isCorrect: false },
                { id: 'e', text: 'Torque wrench', isCorrect: false }
            ],
            explanation: 'A serpentine belt tensioner tool is designed with specific profiles to fit various tensioner mounting points and provides the leverage needed to release spring-loaded tensioners safely.',
            twist: {
                question: 'This tool can also be adapted to:',
                options: [
                    { id: 'a', text: 'Release tension on timing belt tensioners with similar mounting points', isCorrect: true },
                    { id: 'b', text: 'Remove spark plugs', isCorrect: false },
                    { id: 'c', text: 'Tighten cylinder head bolts', isCorrect: false },
                    { id: 'd', text: 'Compress valve springs', isCorrect: false },
                    { id: 'e', text: 'Align camshaft timing marks', isCorrect: false }
                ],
                explanation: 'Many timing belt tensioners use similar mounting designs, allowing the serpentine belt tool to be used during timing belt service.'
            }
        },
        {
            id: 'med_2',
            scenario: 'A 19 mm nut on an exhaust manifold has become seized due to heat cycling and corrosion. The technician needs maximum leverage to break it free without rounding the fastener. Which tool provides the greatest mechanical advantage?',
            options: [
                { id: 'a', text: 'Adjustable wrench', isCorrect: false },
                { id: 'b', text: 'Standard ratchet with 19 mm socket', isCorrect: false },
                { id: 'c', text: 'Breaker bar with 19 mm six-point socket', isCorrect: true },
                { id: 'd', text: 'Impact screwdriver', isCorrect: false },
                { id: 'e', text: 'Locking pliers', isCorrect: false }
            ],
            explanation: 'A breaker bar provides a long lever arm for maximum torque, and a six-point socket grips all six corners of the nut, reducing the risk of rounding.',
            twist: {
                question: 'When not breaking seized fasteners, a breaker bar is commonly used to:',
                options: [
                    { id: 'a', text: 'Measure bolt diameter', isCorrect: false },
                    { id: 'b', text: 'Rotate the crankshaft pulley during timing belt alignment', isCorrect: true },
                    { id: 'c', text: 'Compress brake pistons', isCorrect: false },
                    { id: 'd', text: 'Extract broken studs', isCorrect: false },
                    { id: 'e', text: 'Test electrical continuity', isCorrect: false }
                ],
                explanation: 'When setting timing, the crankshaft must be rotated to align timing marks. A breaker bar on the crankshaft pulley bolt allows precise, controlled rotation.'
            }
        },
        {
            id: 'med_3',
            scenario: 'Before removing a MacPherson strut from a vehicle, the technician must safely compress the coil spring to release tension. Which specialized tool prevents dangerous spring release?',
            options: [
                { id: 'a', text: 'Pry bar set', isCorrect: false },
                { id: 'b', text: 'Hydraulic jack', isCorrect: false },
                { id: 'c', text: 'Coil spring compressor', isCorrect: true },
                { id: 'd', text: 'Ball joint separator', isCorrect: false },
                { id: 'e', text: 'Tie rod puller', isCorrect: false }
            ],
            explanation: 'A coil spring compressor uses threaded rods or clamps to safely compress the spring, allowing the strut assembly to be disassembled without the stored spring energy causing injury.',
            twist: {
                question: 'Some spring compressor designs can also be adapted to:',
                options: [
                    { id: 'a', text: 'Remove wheel bearings', isCorrect: false },
                    { id: 'b', text: 'Compress valve springs during cylinder head work', isCorrect: true },
                    { id: 'c', text: 'Extract pressed-in bushings', isCorrect: false },
                    { id: 'd', text: 'Align suspension geometry', isCorrect: false },
                    { id: 'e', text: 'Test shock absorber travel', isCorrect: false }
                ],
                explanation: 'Universal spring compressor designs can be configured to compress valve springs when removing or installing valves during cylinder head service.'
            }
        },
        {
            id: 'med_4',
            scenario: 'A 12 mm bolt has sheared off flush with the engine block surface. The technician needs to remove the embedded portion without damaging the threads. Which tool is specifically designed for this situation?',
            options: [
                { id: 'a', text: 'Drill bit set', isCorrect: false },
                { id: 'b', text: 'Left-hand twist drill', isCorrect: false },
                { id: 'c', text: 'Screw extractor (easy-out) set', isCorrect: true },
                { id: 'd', text: 'Tap and die set', isCorrect: false },
                { id: 'e', text: 'Thread chaser', isCorrect: false }
            ],
            explanation: 'Screw extractors have a tapered, reverse-threaded design that bites into the drilled pilot hole and backs out the broken fastener when turned counter-clockwise.',
            twist: {
                question: 'Before using this extraction tool, technicians often first use:',
                options: [
                    { id: 'a', text: 'Penetrating oil only', isCorrect: false },
                    { id: 'b', text: 'A center punch to create a pilot point, then a left-hand drill bit', isCorrect: true },
                    { id: 'c', text: 'A grinding wheel to flatten the surface', isCorrect: false },
                    { id: 'd', text: 'A chisel to crack the bolt', isCorrect: false },
                    { id: 'e', text: 'Heat from a propane torch exclusively', isCorrect: false }
                ],
                explanation: 'A center punch creates a starting point to prevent drill wandering. A left-hand drill sometimes removes the bolt on its own, and if not, creates the pilot hole for the extractor.'
            }
        },
        {
            id: 'med_5',
            scenario: 'A technician suspects a cooling system leak but cannot locate the source visually. Which tool pressurizes the system to reveal the leak point?',
            options: [
                { id: 'a', text: 'Vacuum pump', isCorrect: false },
                { id: 'b', text: 'Cooling system pressure tester', isCorrect: true },
                { id: 'c', text: 'Compression tester', isCorrect: false },
                { id: 'd', text: 'Fuel pressure gauge', isCorrect: false },
                { id: 'e', text: 'Leak-down tester', isCorrect: false }
            ],
            explanation: 'A cooling system pressure tester connects to the radiator cap opening and uses a hand pump to pressurize the system, making leaks visible through escaping coolant or bubbles.',
            twist: {
                question: 'This same pressure testing principle is applied when:',
                options: [
                    { id: 'a', text: 'Checking tire pressure', isCorrect: false },
                    { id: 'b', text: 'Testing radiator cap pressure relief valve function', isCorrect: true },
                    { id: 'c', text: 'Measuring engine oil pressure', isCorrect: false },
                    { id: 'd', text: 'Verifying fuel injector flow rates', isCorrect: false },
                    { id: 'e', text: 'Checking brake fluid viscosity', isCorrect: false }
                ],
                explanation: 'The pressure tester kit includes an adapter to test radiator caps, verifying they hold pressure to specification and release at the correct pressure rating.'
            }
        }
    ],
    hard: [
        {
            id: 'hard_1',
            scenario: 'A technician needs to measure the compression pressure in each cylinder of a 4-cylinder engine to diagnose a misfire. Which tool provides accurate cylinder pressure readings during the cranking cycle?',
            options: [
                { id: 'a', text: 'Vacuum gauge', isCorrect: false },
                { id: 'b', text: 'Cylinder leak-down tester', isCorrect: false },
                { id: 'c', text: 'Compression tester with gauge', isCorrect: true },
                { id: 'd', text: 'Oil pressure gauge', isCorrect: false },
                { id: 'e', text: 'Fuel pressure tester', isCorrect: false }
            ],
            explanation: 'A compression tester screws into the spark plug hole and measures the maximum pressure developed in the cylinder during cranking, indicating engine mechanical condition.',
            twist: {
                question: 'If compression readings are low, the technician can further diagnose using:',
                options: [
                    { id: 'a', text: 'A higher-capacity compression tester', isCorrect: false },
                    { id: 'b', text: 'A wet test by adding oil to the cylinder and retesting', isCorrect: true },
                    { id: 'c', text: 'A multimeter on the ignition coil', isCorrect: false },
                    { id: 'd', text: 'A timing light on the cylinder', isCorrect: false },
                    { id: 'e', text: 'A fuel injector pulse tester', isCorrect: false }
                ],
                explanation: 'Adding oil temporarily seals worn piston rings. If compression increases significantly, the rings are worn. If unchanged, the valves or head gasket are the likely cause.'
            }
        },
        {
            id: 'hard_2',
            scenario: 'A technician needs to verify that a newly installed alternator is charging correctly. Which tool provides precise voltage and current measurements for the charging system?',
            options: [
                { id: 'a', text: 'Test light', isCorrect: false },
                { id: 'b', text: 'Continuity tester', isCorrect: false },
                { id: 'c', text: 'Digital multimeter', isCorrect: true },
                { id: 'd', text: 'Circuit breaker finder', isCorrect: false },
                { id: 'e', text: 'Spark tester', isCorrect: false }
            ],
            explanation: 'A digital multimeter can measure battery voltage at rest, charging voltage under load, and current draw, providing complete verification of charging system function.',
            twist: {
                question: 'This same tool can diagnose:',
                options: [
                    { id: 'a', text: 'Mechanical timing belt stretch', isCorrect: false },
                    { id: 'b', text: 'Parasitic battery drain by measuring milliamp current with the vehicle off', isCorrect: true },
                    { id: 'c', text: 'Engine vacuum leaks', isCorrect: false },
                    { id: 'd', text: 'Wheel bearing play', isCorrect: false },
                    { id: 'e', text: 'Coolant concentration', isCorrect: false }
                ],
                explanation: 'By connecting the multimeter in series with the battery cable and measuring current draw with everything off, technicians can identify components draining the battery.'
            }
        },
        {
            id: 'hard_3',
            scenario: 'A technician needs to remove and install press-fit wheel bearings from a steering knuckle. Which tool applies controlled force without damaging the bearing races or housing?',
            options: [
                { id: 'a', text: 'Slide hammer', isCorrect: false },
                { id: 'b', text: 'Ball joint press', isCorrect: false },
                { id: 'c', text: 'Hydraulic bearing press', isCorrect: true },
                { id: 'd', text: 'Gear puller', isCorrect: false },
                { id: 'e', text: 'Pickle fork', isCorrect: false }
            ],
            explanation: 'A hydraulic bearing press applies even, controlled force to press bearings in or out without the shock loading that can damage precision bearing surfaces.',
            twist: {
                question: 'This same tool or technique can be used for:',
                options: [
                    { id: 'a', text: 'Removing brake rotors', isCorrect: false },
                    { id: 'b', text: 'Installing and removing suspension bushings', isCorrect: true },
                    { id: 'c', text: 'Adjusting wheel alignment', isCorrect: false },
                    { id: 'd', text: 'Bleeding brake lines', isCorrect: false },
                    { id: 'e', text: 'Testing shock absorbers', isCorrect: false }
                ],
                explanation: 'Control arm bushings and other press-fit suspension components require the same controlled pressing force for removal and installation.'
            }
        },
        {
            id: 'hard_4',
            scenario: 'A technician needs to set the valve lash on a 16-valve engine with mechanical lifters. Which tools are required to measure and adjust the clearance between the camshaft lobe and valve stem?',
            options: [
                { id: 'a', text: 'Dial indicator and magnetic base', isCorrect: false },
                { id: 'b', text: 'Feeler gauge set and adjustment shims or screws', isCorrect: true },
                { id: 'c', text: 'Micrometer and depth gauge', isCorrect: false },
                { id: 'd', text: 'Bore gauge and plastigage', isCorrect: false },
                { id: 'e', text: 'Timing light and tachometer', isCorrect: false }
            ],
            explanation: 'Feeler gauges of precise thicknesses are inserted between the cam lobe and follower to measure clearance. Adjustment is made via shims or screw adjusters depending on engine design.',
            twist: {
                question: 'Feeler gauges are also essential when:',
                options: [
                    { id: 'a', text: 'Measuring tire tread depth', isCorrect: false },
                    { id: 'b', text: 'Setting spark plug electrode gap', isCorrect: true },
                    { id: 'c', text: 'Checking brake rotor thickness', isCorrect: false },
                    { id: 'd', text: 'Measuring piston ring end gap in the cylinder', isCorrect: false },
                    { id: 'e', text: 'Both B and D are correct', isCorrect: false }
                ],
                explanation: 'Spark plug gaps are set using wire-type feeler gauges, though flat feeler gauges can also verify the gap measurement before installation.'
            }
        },
        {
            id: 'hard_5',
            scenario: 'A technician needs to diagnose an intermittent electrical fault in a wire harness that only occurs when the vehicle is moving. Which tool can record voltage fluctuations over time?',
            options: [
                { id: 'a', text: 'Standard test light', isCorrect: false },
                { id: 'b', text: 'Analog multimeter', isCorrect: false },
                { id: 'c', text: 'Oscilloscope or graphing multimeter', isCorrect: true },
                { id: 'd', text: 'Logic probe', isCorrect: false },
                { id: 'e', text: 'Continuity buzzer', isCorrect: false }
            ],
            explanation: 'An oscilloscope or graphing multimeter can display and record voltage changes over time, capturing intermittent spikes, dropouts, or noise that a standard meter would miss.',
            twist: {
                question: 'This same diagnostic capability is valuable for:',
                options: [
                    { id: 'a', text: 'Checking engine oil level', isCorrect: false },
                    { id: 'b', text: 'Analyzing fuel injector pulse width and waveform patterns', isCorrect: true },
                    { id: 'c', text: 'Measuring coolant temperature', isCorrect: false },
                    { id: 'd', text: 'Testing brake pad thickness', isCorrect: false },
                    { id: 'e', text: 'Checking transmission fluid condition', isCorrect: false }
                ],
                explanation: 'Fuel injector waveforms reveal injector response time, hold current, and pintle movement, allowing diagnosis of clogged, stuck, or electrically faulty injectors.'
            }
        }
    ]
};

// Track used questions to prevent repetition
const usedQuestions = {
    easy: [],
    medium: [],
    hard: []
};

// Try to load history from localStorage
try {
    const saved = localStorage.getItem('toolChallengeCompletedQuestions');
    if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(usedQuestions, parsed);
    }
} catch (e) {
    // localStorage not available
}

// Save history to localStorage
const saveQuestionHistory = () => {
    try {
        localStorage.setItem('toolChallengeCompletedQuestions', JSON.stringify(usedQuestions));
    } catch (e) {
        // localStorage not available
    }
};

/**
 * Get remaining plays for Tool Challenge
 * @returns {Object} - { easy: number, medium: number, hard: number }
 */
export const getRemainingToolSelectionPlays = () => {
    return {
        easy: Math.max(0, TOOL_CHALLENGE_QUESTIONS.easy.length - usedQuestions.easy.length),
        medium: Math.max(0, TOOL_CHALLENGE_QUESTIONS.medium.length - usedQuestions.medium.length),
        hard: Math.max(0, TOOL_CHALLENGE_QUESTIONS.hard.length - usedQuestions.hard.length)
    };
};

/**
 * Get total question counts per difficulty
 * @returns {Object} - { easy: number, medium: number, hard: number }
 */
export const getToolSelectionTaskCounts = () => {
    return {
        easy: TOOL_CHALLENGE_QUESTIONS.easy.length,
        medium: TOOL_CHALLENGE_QUESTIONS.medium.length,
        hard: TOOL_CHALLENGE_QUESTIONS.hard.length
    };
};

/**
 * Get a random question for the given difficulty
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {Object|null} Question object or null if all completed
 */
export const getToolSelectionTask = (difficulty = 'easy') => {
    const questions = TOOL_CHALLENGE_QUESTIONS[difficulty] || TOOL_CHALLENGE_QUESTIONS.easy;
    const used = usedQuestions[difficulty] || [];

    // Get available questions (not yet used)
    let availableQuestions = questions.filter(q => !used.includes(q.id));

    // If all questions have been completed, return null
    if (availableQuestions.length === 0) {
        return null;
    }

    // Select a random question from available ones
    const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    // Mark this question as used
    usedQuestions[difficulty].push(question.id);
    saveQuestionHistory();

    // Shuffle options for both main question and twist
    const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
    const shuffledTwistOptions = question.twist
        ? [...question.twist.options].sort(() => Math.random() - 0.5)
        : [];

    return {
        ...question,
        difficulty,
        options: shuffledOptions,
        twist: question.twist ? {
            ...question.twist,
            options: shuffledTwistOptions
        } : null
    };
};

/**
 * Reset question history
 */
export const resetToolSelectionHistory = () => {
    usedQuestions.easy = [];
    usedQuestions.medium = [];
    usedQuestions.hard = [];
    saveQuestionHistory();
};

/**
 * Evaluate the student's answer
 * @param {Object} question - The question object
 * @param {string} selectedOptionId - The selected option ID
 * @param {boolean} isTwist - Whether this is the twist question
 * @returns {Object} Evaluation result
 */
export const evaluateToolSelection = (question, selectedOptionId, isTwist = false) => {
    const questionPart = isTwist ? question.twist : question;
    const correctOption = questionPart.options.find(opt => opt.isCorrect);
    const isCorrect = selectedOptionId === correctOption?.id;

    // Scoring based on difficulty
    const basePoints = { easy: 10, medium: 20, hard: 30 };
    const twistBonus = isTwist ? 1.5 : 1;
    const score = isCorrect ? Math.round(basePoints[question.difficulty] * twistBonus) : 0;

    return {
        isCorrect,
        isPerfect: isCorrect,
        score,
        correctAnswer: correctOption,
        explanation: questionPart.explanation,
        feedback: isCorrect
            ? 'Correct! ' + questionPart.explanation
            : `Incorrect. The correct answer was "${correctOption?.text}". ${questionPart.explanation}`
    };
};

// Export questions for reference
export const TOOL_DATABASE = TOOL_CHALLENGE_QUESTIONS;
