/**
 * Fallback task data for Tool Selection Challenge
 * Each task includes repair description, vehicle info, required tools, and all tools in toolbox
 */

// Tool database - all available tools
export const TOOL_DATABASE = {
    // Wrenches & Sockets
    socket_10mm: { id: 'socket_10mm', name: '10mm Socket', category: 'Sockets', icon: '🔧' },
    socket_12mm: { id: 'socket_12mm', name: '12mm Socket', category: 'Sockets', icon: '🔧' },
    socket_14mm: { id: 'socket_14mm', name: '14mm Socket', category: 'Sockets', icon: '🔧' },
    socket_17mm: { id: 'socket_17mm', name: '17mm Socket', category: 'Sockets', icon: '🔧' },
    socket_19mm: { id: 'socket_19mm', name: '19mm Socket', category: 'Sockets', icon: '🔧' },
    socket_21mm: { id: 'socket_21mm', name: '21mm Socket', category: 'Sockets', icon: '🔧' },
    socket_22mm: { id: 'socket_22mm', name: '22mm Socket', category: 'Sockets', icon: '🔧' },
    ratchet_3_8: { id: 'ratchet_3_8', name: '3/8" Ratchet', category: 'Ratchets', icon: '🔧' },
    ratchet_1_2: { id: 'ratchet_1_2', name: '1/2" Ratchet', category: 'Ratchets', icon: '🔧' },
    torque_wrench: { id: 'torque_wrench', name: 'Torque Wrench', category: 'Specialty', icon: '🔧' },
    breaker_bar: { id: 'breaker_bar', name: 'Breaker Bar', category: 'Specialty', icon: '🔧' },

    // Screwdrivers
    flathead_small: { id: 'flathead_small', name: 'Flathead Screwdriver (Small)', category: 'Screwdrivers', icon: '🪛' },
    flathead_large: { id: 'flathead_large', name: 'Flathead Screwdriver (Large)', category: 'Screwdrivers', icon: '🪛' },
    phillips_1: { id: 'phillips_1', name: 'Phillips #1', category: 'Screwdrivers', icon: '🪛' },
    phillips_2: { id: 'phillips_2', name: 'Phillips #2', category: 'Screwdrivers', icon: '🪛' },

    // Pliers
    needle_nose: { id: 'needle_nose', name: 'Needle Nose Pliers', category: 'Pliers', icon: '🔧' },
    slip_joint: { id: 'slip_joint', name: 'Slip Joint Pliers', category: 'Pliers', icon: '🔧' },
    locking_pliers: { id: 'locking_pliers', name: 'Locking Pliers (Vise Grip)', category: 'Pliers', icon: '🔧' },
    hose_clamp_pliers: { id: 'hose_clamp_pliers', name: 'Hose Clamp Pliers', category: 'Specialty', icon: '🔧' },

    // Specialty Tools
    oil_filter_wrench: { id: 'oil_filter_wrench', name: 'Oil Filter Wrench', category: 'Specialty', icon: '🔧' },
    drain_pan: { id: 'drain_pan', name: 'Drain Pan', category: 'Specialty', icon: '🫗' },
    funnel: { id: 'funnel', name: 'Funnel', category: 'Specialty', icon: '🫗' },
    jack: { id: 'jack', name: 'Floor Jack', category: 'Lifting', icon: '🏋️' },
    jack_stands: { id: 'jack_stands', name: 'Jack Stands (Pair)', category: 'Lifting', icon: '🏋️' },
    wheel_chocks: { id: 'wheel_chocks', name: 'Wheel Chocks', category: 'Safety', icon: '🔶' },
    multimeter: { id: 'multimeter', name: 'Multimeter', category: 'Electrical', icon: '⚡' },
    test_light: { id: 'test_light', name: 'Test Light', category: 'Electrical', icon: '⚡' },
    wire_strippers: { id: 'wire_strippers', name: 'Wire Strippers', category: 'Electrical', icon: '⚡' },
    crimping_tool: { id: 'crimping_tool', name: 'Crimping Tool', category: 'Electrical', icon: '⚡' },
    belt_tensioner_tool: { id: 'belt_tensioner_tool', name: 'Belt Tensioner Tool', category: 'Specialty', icon: '🔧' },
    spark_plug_socket: { id: 'spark_plug_socket', name: 'Spark Plug Socket', category: 'Specialty', icon: '🔧' },
    gap_gauge: { id: 'gap_gauge', name: 'Spark Plug Gap Gauge', category: 'Specialty', icon: '📏' },
    battery_terminal_puller: { id: 'battery_terminal_puller', name: 'Battery Terminal Puller', category: 'Specialty', icon: '🔧' },
    pry_bar: { id: 'pry_bar', name: 'Pry Bar', category: 'Specialty', icon: '🔧' },
    hammer: { id: 'hammer', name: 'Ball Peen Hammer', category: 'Striking', icon: '🔨' },
    rubber_mallet: { id: 'rubber_mallet', name: 'Rubber Mallet', category: 'Striking', icon: '🔨' },
    brake_caliper_tool: { id: 'brake_caliper_tool', name: 'Brake Caliper Piston Tool', category: 'Specialty', icon: '🔧' },
    c_clamp: { id: 'c_clamp', name: 'C-Clamp', category: 'Specialty', icon: '🔧' },
    tire_iron: { id: 'tire_iron', name: 'Tire Iron / Lug Wrench', category: 'Specialty', icon: '🔧' },
};

// Helper function to get tools by IDs
const getTools = (toolIds) => toolIds.map(id => TOOL_DATABASE[id]);

// Fallback tasks by difficulty - EXPANDED with many more scenarios
const FALLBACK_TASKS = {
    easy: [
        {
            id: 'easy_1',
            title: 'Oil Change',
            description: 'Perform a complete engine oil and filter change',
            vehicleInfo: '2019 Toyota Vios 1.3L',
            requiredTools: ['socket_14mm', 'ratchet_3_8', 'oil_filter_wrench', 'drain_pan', 'funnel'],
            toolbox: ['socket_10mm', 'socket_12mm', 'socket_14mm', 'socket_17mm', 'ratchet_3_8', 'ratchet_1_2',
                'oil_filter_wrench', 'drain_pan', 'funnel', 'flathead_small', 'phillips_2', 'hammer'],
            explanations: {
                socket_14mm: 'Needed to remove the drain plug',
                ratchet_3_8: 'To drive the socket for the drain plug',
                oil_filter_wrench: 'To remove the oil filter',
                drain_pan: 'To catch the old oil',
                funnel: 'To pour new oil without spilling'
            }
        },
        {
            id: 'easy_2',
            title: 'Tire Rotation',
            description: 'Rotate all four tires following the recommended pattern',
            vehicleInfo: '2020 Honda City',
            requiredTools: ['jack', 'jack_stands', 'socket_19mm', 'ratchet_1_2', 'torque_wrench', 'wheel_chocks'],
            toolbox: ['jack', 'jack_stands', 'socket_17mm', 'socket_19mm', 'socket_21mm', 'ratchet_1_2',
                'torque_wrench', 'wheel_chocks', 'tire_iron', 'breaker_bar', 'pry_bar', 'hammer'],
            explanations: {
                jack: 'To lift the vehicle',
                jack_stands: 'Safety support while working',
                socket_19mm: 'Lug nut size for this vehicle',
                ratchet_1_2: 'To drive the socket',
                torque_wrench: 'To properly torque lug nuts to spec',
                wheel_chocks: 'Prevent vehicle from rolling'
            }
        },
        {
            id: 'easy_3',
            title: 'Air Filter Replacement',
            description: 'Replace the engine air filter',
            vehicleInfo: '2018 Mitsubishi Mirage',
            requiredTools: ['flathead_small', 'phillips_2'],
            toolbox: ['socket_10mm', 'socket_12mm', 'ratchet_3_8', 'flathead_small', 'flathead_large',
                'phillips_1', 'phillips_2', 'needle_nose', 'hammer'],
            explanations: {
                flathead_small: 'To release air box clips',
                phillips_2: 'To remove air box cover screws'
            }
        },
        {
            id: 'easy_4',
            title: 'Wiper Blade Replacement',
            description: 'Replace front windshield wiper blades',
            vehicleInfo: '2021 Suzuki Ertiga',
            requiredTools: ['flathead_small'],
            toolbox: ['flathead_small', 'flathead_large', 'phillips_1', 'phillips_2', 'needle_nose', 'socket_10mm'],
            explanations: {
                flathead_small: 'To release wiper blade clip/tab'
            }
        },
        {
            id: 'easy_5',
            title: 'Cabin Air Filter Change',
            description: 'Replace the cabin/AC air filter behind the glove box',
            vehicleInfo: '2019 Honda CR-V',
            requiredTools: ['phillips_2', 'flathead_small'],
            toolbox: ['phillips_1', 'phillips_2', 'flathead_small', 'flathead_large', 'socket_10mm', 'needle_nose'],
            explanations: {
                phillips_2: 'To remove glove box screws',
                flathead_small: 'To release filter housing clips'
            }
        },
        {
            id: 'easy_6',
            title: 'Headlight Bulb Replacement',
            description: 'Replace a burned-out halogen headlight bulb',
            vehicleInfo: '2017 Toyota Innova',
            requiredTools: ['flathead_small', 'phillips_2'],
            toolbox: ['flathead_small', 'flathead_large', 'phillips_1', 'phillips_2', 'socket_10mm', 'socket_12mm', 'needle_nose'],
            explanations: {
                flathead_small: 'To release bulb socket retaining clip',
                phillips_2: 'To remove headlight housing screws if needed'
            }
        }
    ],
    medium: [
        {
            id: 'med_1',
            title: 'Brake Pad Replacement (Front)',
            description: 'Replace front brake pads on disc brake system',
            vehicleInfo: '2018 Mitsubishi Montero Sport',
            requiredTools: ['jack', 'jack_stands', 'socket_14mm', 'socket_17mm', 'ratchet_3_8', 'c_clamp',
                'brake_caliper_tool', 'flathead_large', 'wheel_chocks'],
            toolbox: ['jack', 'jack_stands', 'socket_10mm', 'socket_12mm', 'socket_14mm', 'socket_17mm',
                'ratchet_3_8', 'ratchet_1_2', 'c_clamp', 'brake_caliper_tool', 'flathead_small',
                'flathead_large', 'wheel_chocks', 'pry_bar'],
            explanations: {
                jack: 'To lift vehicle and remove wheel',
                jack_stands: 'Safety support',
                socket_14mm: 'Caliper slide pin bolts',
                socket_17mm: 'Caliper bracket bolts',
                ratchet_3_8: 'To drive sockets',
                c_clamp: 'To compress caliper piston',
                brake_caliper_tool: 'Alternative piston compression tool',
                flathead_large: 'To pry caliper off rotor',
                wheel_chocks: 'Safety - prevent rolling'
            }
        },
        {
            id: 'med_2',
            title: 'Serpentine Belt Replacement',
            description: 'Replace the serpentine/accessory drive belt',
            vehicleInfo: '2017 Ford Ranger 2.2L',
            requiredTools: ['socket_14mm', 'ratchet_3_8', 'belt_tensioner_tool', 'breaker_bar'],
            toolbox: ['socket_10mm', 'socket_12mm', 'socket_14mm', 'socket_17mm', 'ratchet_3_8', 'ratchet_1_2',
                'belt_tensioner_tool', 'breaker_bar', 'flathead_small', 'pry_bar', 'needle_nose', 'phillips_2'],
            explanations: {
                socket_14mm: 'Tensioner bolt size',
                ratchet_3_8: 'To work in tight spaces',
                belt_tensioner_tool: 'To release spring-loaded tensioner',
                breaker_bar: 'Extra leverage for tensioner'
            }
        },
        {
            id: 'med_3',
            title: 'Coolant Hose Replacement',
            description: 'Replace upper radiator hose',
            vehicleInfo: '2015 Toyota Innova',
            requiredTools: ['flathead_large', 'hose_clamp_pliers', 'drain_pan', 'funnel'],
            toolbox: ['socket_10mm', 'socket_12mm', 'ratchet_3_8', 'flathead_small', 'flathead_large',
                'hose_clamp_pliers', 'needle_nose', 'drain_pan', 'funnel', 'pry_bar'],
            explanations: {
                flathead_large: 'To loosen traditional hose clamps',
                hose_clamp_pliers: 'To release spring-type clamps',
                drain_pan: 'To catch coolant spillage',
                funnel: 'To refill coolant without spilling'
            }
        },
        {
            id: 'med_4',
            title: 'Thermostat Replacement',
            description: 'Replace faulty engine thermostat',
            vehicleInfo: '2016 Nissan Navara',
            requiredTools: ['socket_10mm', 'socket_12mm', 'ratchet_3_8', 'drain_pan', 'flathead_small'],
            toolbox: ['socket_10mm', 'socket_12mm', 'socket_14mm', 'ratchet_3_8', 'drain_pan', 'flathead_small',
                'flathead_large', 'hose_clamp_pliers', 'funnel', 'pry_bar'],
            explanations: {
                socket_10mm: 'Thermostat housing bolts',
                socket_12mm: 'Water outlet housing bolts',
                ratchet_3_8: 'To drive sockets',
                drain_pan: 'To catch coolant when opened',
                flathead_small: 'To pry off old gasket material'
            }
        },
        {
            id: 'med_5',
            title: 'Starter Motor Replacement',
            description: 'Remove and replace the starter motor',
            vehicleInfo: '2014 Honda City',
            requiredTools: ['socket_10mm', 'socket_12mm', 'socket_14mm', 'ratchet_3_8', 'ratchet_1_2'],
            toolbox: ['socket_10mm', 'socket_12mm', 'socket_14mm', 'socket_17mm', 'ratchet_3_8', 'ratchet_1_2',
                'breaker_bar', 'flathead_small', 'multimeter', 'pry_bar', 'jack', 'jack_stands'],
            explanations: {
                socket_10mm: 'Battery terminal and electrical connections',
                socket_12mm: 'Starter mounting bolts',
                socket_14mm: 'Main starter bolt',
                ratchet_3_8: 'For smaller bolts',
                ratchet_1_2: 'For main mounting bolts'
            }
        },
        {
            id: 'med_6',
            title: 'Water Pump Replacement',
            description: 'Replace the engine water pump',
            vehicleInfo: '2018 Hyundai Accent',
            requiredTools: ['socket_10mm', 'socket_12mm', 'ratchet_3_8', 'drain_pan', 'belt_tensioner_tool', 'funnel'],
            toolbox: ['socket_10mm', 'socket_12mm', 'socket_14mm', 'ratchet_3_8', 'ratchet_1_2', 'drain_pan',
                'belt_tensioner_tool', 'funnel', 'flathead_small', 'hose_clamp_pliers', 'breaker_bar'],
            explanations: {
                socket_10mm: 'Water pump mounting bolts',
                socket_12mm: 'Pump pulley bolts',
                ratchet_3_8: 'To drive sockets',
                drain_pan: 'To catch coolant',
                belt_tensioner_tool: 'To remove serpentine belt first',
                funnel: 'To refill coolant'
            }
        }
    ],
    hard: [
        {
            id: 'hard_1',
            title: 'Spark Plug Replacement',
            description: 'Replace all spark plugs and check gap',
            vehicleInfo: '2016 Toyota Fortuner 2.7L (4-cylinder)',
            requiredTools: ['socket_10mm', 'ratchet_3_8', 'spark_plug_socket', 'gap_gauge', 'torque_wrench',
                'flathead_small', 'needle_nose'],
            toolbox: ['socket_10mm', 'socket_12mm', 'socket_14mm', 'ratchet_3_8', 'ratchet_1_2',
                'spark_plug_socket', 'gap_gauge', 'torque_wrench', 'flathead_small', 'flathead_large',
                'phillips_1', 'phillips_2', 'needle_nose', 'locking_pliers', 'pry_bar', 'wire_strippers'],
            explanations: {
                socket_10mm: 'To remove ignition coil bolts',
                ratchet_3_8: 'To drive sockets',
                spark_plug_socket: 'Has rubber insert to grip spark plug',
                gap_gauge: 'To verify/adjust plug gap before installation',
                torque_wrench: 'Spark plugs require specific torque',
                flathead_small: 'To release coil connectors',
                needle_nose: 'To handle small clips and connectors'
            }
        },
        {
            id: 'hard_2',
            title: 'Battery and Terminal Service',
            description: 'Replace battery, clean terminals, test charging system',
            vehicleInfo: '2019 Nissan Navara',
            requiredTools: ['socket_10mm', 'socket_12mm', 'ratchet_3_8', 'battery_terminal_puller',
                'wire_strippers', 'multimeter', 'flathead_small'],
            toolbox: ['socket_10mm', 'socket_12mm', 'socket_14mm', 'socket_17mm', 'ratchet_3_8', 'ratchet_1_2',
                'battery_terminal_puller', 'wire_strippers', 'crimping_tool', 'multimeter', 'test_light',
                'flathead_small', 'flathead_large', 'needle_nose', 'locking_pliers', 'hammer'],
            explanations: {
                socket_10mm: 'Terminal clamp bolts',
                socket_12mm: 'Battery hold-down bolt',
                ratchet_3_8: 'To drive sockets',
                battery_terminal_puller: 'To safely remove corroded terminals',
                wire_strippers: 'If cable ends need repair',
                multimeter: 'To test battery voltage and alternator output',
                flathead_small: 'To spread terminal clamps'
            }
        },
        {
            id: 'hard_3',
            title: 'Alternator Replacement',
            description: 'Remove and replace the alternator',
            vehicleInfo: '2017 Hyundai Accent',
            requiredTools: ['socket_10mm', 'socket_12mm', 'socket_14mm', 'ratchet_3_8', 'breaker_bar',
                'belt_tensioner_tool', 'multimeter'],
            toolbox: ['socket_10mm', 'socket_12mm', 'socket_14mm', 'socket_17mm', 'ratchet_3_8', 'ratchet_1_2',
                'breaker_bar', 'belt_tensioner_tool', 'multimeter', 'test_light', 'flathead_small',
                'flathead_large', 'needle_nose', 'pry_bar', 'wire_strippers'],
            explanations: {
                socket_10mm: 'Electrical connector bolt',
                socket_12mm: 'Alternator mounting bolts',
                socket_14mm: 'Alternator pivot bolt',
                ratchet_3_8: 'To drive sockets',
                breaker_bar: 'Extra leverage for tight bolts',
                belt_tensioner_tool: 'To release belt tensioner',
                multimeter: 'To verify charging output after installation'
            }
        },
        {
            id: 'hard_4',
            title: 'Fuel Filter Replacement',
            description: 'Replace inline fuel filter with proper safety precautions',
            vehicleInfo: '2015 Mitsubishi L300',
            requiredTools: ['socket_10mm', 'flathead_small', 'hose_clamp_pliers', 'drain_pan', 'needle_nose'],
            toolbox: ['socket_10mm', 'socket_12mm', 'ratchet_3_8', 'flathead_small', 'flathead_large',
                'hose_clamp_pliers', 'drain_pan', 'needle_nose', 'pry_bar', 'funnel', 'locking_pliers'],
            explanations: {
                socket_10mm: 'Fuel filter bracket bolts',
                flathead_small: 'To release fuel line clips',
                hose_clamp_pliers: 'To remove spring clamps on fuel lines',
                drain_pan: 'To catch fuel spillage',
                needle_nose: 'To handle small clips and fittings'
            }
        },
        {
            id: 'hard_5',
            title: 'Timing Belt Inspection Access',
            description: 'Remove timing cover for belt inspection (not replacement)',
            vehicleInfo: '2014 Mitsubishi Montero',
            requiredTools: ['socket_10mm', 'socket_12mm', 'socket_14mm', 'ratchet_3_8', 'belt_tensioner_tool', 'breaker_bar'],
            toolbox: ['socket_10mm', 'socket_12mm', 'socket_14mm', 'socket_17mm', 'ratchet_3_8', 'ratchet_1_2',
                'belt_tensioner_tool', 'breaker_bar', 'flathead_small', 'flathead_large', 'pry_bar', 'torque_wrench'],
            explanations: {
                socket_10mm: 'Timing cover bolts',
                socket_12mm: 'Water pump pulley bolts',
                socket_14mm: 'Crankshaft pulley bolts',
                ratchet_3_8: 'For smaller bolts',
                belt_tensioner_tool: 'To remove accessory belt first',
                breaker_bar: 'For crankshaft pulley bolt'
            }
        },
        {
            id: 'hard_6',
            title: 'Oxygen Sensor Replacement',
            description: 'Replace upstream O2 sensor',
            vehicleInfo: '2018 Toyota Vios',
            requiredTools: ['socket_22mm', 'ratchet_3_8', 'multimeter', 'wire_strippers', 'needle_nose'],
            toolbox: ['socket_10mm', 'socket_14mm', 'socket_22mm', 'ratchet_3_8', 'ratchet_1_2',
                'multimeter', 'wire_strippers', 'needle_nose', 'flathead_small', 'pry_bar', 'test_light', 'breaker_bar'],
            explanations: {
                socket_22mm: 'Standard O2 sensor size',
                ratchet_3_8: 'To drive the socket',
                multimeter: 'To verify sensor signal after installation',
                wire_strippers: 'If wiring harness needs repair',
                needle_nose: 'To handle sensor connector clips'
            }
        }
    ]
};

// Track used tasks to prevent repetition - uses localStorage for ALL-TIME tracking
const usedTasks = {
    easy: [],
    medium: [],
    hard: []
};

// Try to load history from localStorage (persistent across sessions)
try {
    const saved = localStorage.getItem('toolSelectionCompletedTasks');
    if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(usedTasks, parsed);
    }
} catch (e) {
    // localStorage not available, continue with empty history
}

// Save history to localStorage
const saveTaskHistory = () => {
    try {
        localStorage.setItem('toolSelectionCompletedTasks', JSON.stringify(usedTasks));
    } catch (e) {
        // localStorage not available, continue without saving
    }
};

/**
 * Get remaining plays for Tool Selection (all-time based on tasks completed)
 * @returns {Object} - { easy: number, medium: number, hard: number }
 */
export const getRemainingToolSelectionPlays = () => {
    return {
        easy: Math.max(0, FALLBACK_TASKS.easy.length - usedTasks.easy.length),
        medium: Math.max(0, FALLBACK_TASKS.medium.length - usedTasks.medium.length),
        hard: Math.max(0, FALLBACK_TASKS.hard.length - usedTasks.hard.length)
    };
};

/**
 * Get total task counts per difficulty
 * @returns {Object} - { easy: number, medium: number, hard: number }
 */
export const getToolSelectionTaskCounts = () => {
    return {
        easy: FALLBACK_TASKS.easy.length,
        medium: FALLBACK_TASKS.medium.length,
        hard: FALLBACK_TASKS.hard.length
    };
};

/**
 * Get a random task for the given difficulty
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {Object|null} Task object or null if all completed
 */
export const getToolSelectionTask = (difficulty = 'easy') => {
    const tasks = FALLBACK_TASKS[difficulty] || FALLBACK_TASKS.easy;
    const used = usedTasks[difficulty] || [];

    // Get available tasks (not yet used)
    let availableTasks = tasks.filter(t => !used.includes(t.id));

    // If all tasks have been completed, return null (all done!)
    if (availableTasks.length === 0) {
        return null; // Player completed all tasks for this difficulty
    }

    // Select a random task from available ones
    const task = availableTasks[Math.floor(Math.random() * availableTasks.length)];

    // Mark this task as used
    usedTasks[difficulty].push(task.id);
    saveTaskHistory();

    // Convert tool IDs to full tool objects
    return {
        ...task,
        difficulty,
        requiredTools: getTools(task.requiredTools),
        toolbox: getTools(task.toolbox).sort(() => Math.random() - 0.5) // Shuffle toolbox
    };
};

// Reset task history (useful for testing or replay)
export const resetToolSelectionHistory = () => {
    usedTasks.easy = [];
    usedTasks.medium = [];
    usedTasks.hard = [];
    saveTaskHistory();
};

/**
 * Evaluate the student's tool selection
 * @param {Object} task - The task object
 * @param {string[]} selectedToolIds - Array of selected tool IDs
 * @returns {Object} Evaluation result
 */
export const evaluateToolSelection = (task, selectedToolIds) => {
    const requiredIds = task.requiredTools.map(t => t.id);
    const selectedSet = new Set(selectedToolIds);
    const requiredSet = new Set(requiredIds);

    const correct = selectedToolIds.filter(id => requiredSet.has(id));
    const incorrect = selectedToolIds.filter(id => !requiredSet.has(id));
    const missed = requiredIds.filter(id => !selectedSet.has(id));

    // Scoring
    const correctPoints = correct.length * 20;
    const incorrectPenalty = incorrect.length * 10;
    const missedPenalty = missed.length * 5;
    const rawScore = Math.max(0, correctPoints - incorrectPenalty - missedPenalty);

    // Difficulty multiplier
    const multipliers = { easy: 1, medium: 1.5, hard: 2 };
    const finalScore = Math.round(rawScore * (multipliers[task.difficulty] || 1));

    // Perfect score check
    const isPerfect = correct.length === requiredIds.length && incorrect.length === 0;

    return {
        isPerfect,
        score: finalScore,
        correct: getTools(correct),
        incorrect: getTools(incorrect),
        missed: getTools(missed),
        explanations: task.explanations,
        feedback: isPerfect
            ? 'Perfect! You selected exactly the right tools for this job.'
            : `You got ${correct.length}/${requiredIds.length} correct. ${incorrect.length > 0 ? `${incorrect.length} unnecessary tools selected. ` : ''}${missed.length > 0 ? `${missed.length} required tools missed.` : ''}`
    };
};
