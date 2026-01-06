/**
 * Part Names Database
 * Maps generic mesh/object names to proper automotive part names
 * This compensates for GLB files that don't have properly named parts
 */

export const ENGINE_PARTS = {
    // Common engine part mappings based on object names
    'Cylinder_Block': 'Cylinder Block',
    'Cylinder_Head': 'Cylinder Head',
    'Crankshaft': 'Crankshaft',
    'Camshaft': 'Camshaft',
    'Piston': 'Piston',
    'Piston_1': 'Piston 1',
    'Piston_2': 'Piston 2',
    'Piston_3': 'Piston 3',
    'Piston_4': 'Piston 4',
    'Connecting_Rod': 'Connecting Rod',
    'Valve': 'Valve',
    'Valve_Spring': 'Valve Spring',
    'Intake_Valve': 'Intake Valve',
    'Exhaust_Valve': 'Exhaust Valve',
    'Timing_Chain': 'Timing Chain',
    'Timing_Belt': 'Timing Belt',
    'Oil_Pan': 'Oil Pan',
    'Oil_Pump': 'Oil Pump',
    'Water_Pump': 'Water Pump',
    'Thermostat': 'Thermostat',
    'Spark_Plug': 'Spark Plug',
    'Ignition_Coil': 'Ignition Coil',
    'Intake_Manifold': 'Intake Manifold',
    'Exhaust_Manifold': 'Exhaust Manifold',
    'Throttle_Body': 'Throttle Body',
    'Fuel_Injector': 'Fuel Injector',
    'Flywheel': 'Flywheel',
    'Starter_Motor': 'Starter Motor',
    'Alternator': 'Alternator',
    'Belt': 'Serpentine Belt',
    'Pulley': 'Pulley',
    'Head_Gasket': 'Head Gasket',
    'Rocker_Arm': 'Rocker Arm',

    // Generic fallbacks for unnamed objects
    'Object_1': 'Engine Block',
    'Object_2': 'Cylinder Head Assembly',
    'Object_3': 'Valve Cover',
    'Object_4': 'Crankshaft',
    'Object_5': 'Piston Assembly',
    'Object_6': 'Connecting Rod',
    'Object_7': 'Oil Pan',
    'Object_8': 'Timing Cover',
    'Object_9': 'Water Pump Housing',
    'Object_10': 'Intake Manifold',
};

export const TRANSMISSION_PARTS = {
    // Common transmission part mappings
    'Transmission_Case': 'Transmission Case',
    'Bell_Housing': 'Bell Housing',
    'Input_Shaft': 'Input Shaft',
    'Output_Shaft': 'Output Shaft',
    'Countershaft': 'Countershaft',
    'Gear_1': 'First Gear',
    'Gear_2': 'Second Gear',
    'Gear_3': 'Third Gear',
    'Gear_4': 'Fourth Gear',
    'Gear_5': 'Fifth Gear',
    'Reverse_Gear': 'Reverse Gear',
    'Synchronizer': 'Synchronizer Ring',
    'Shift_Fork': 'Shift Fork',
    'Selector_Rod': 'Selector Rod',
    'Clutch': 'Clutch Assembly',
    'Clutch_Disc': 'Clutch Disc',
    'Pressure_Plate': 'Pressure Plate',
    'Release_Bearing': 'Throw-Out Bearing',
    'Flywheel': 'Flywheel',
    'Torque_Converter': 'Torque Converter',
    'Planetary_Gear': 'Planetary Gear Set',
    'Valve_Body': 'Valve Body',
    'Main_Shaft': 'Main Shaft',
    'Bearing': 'Bearing',
    'Seal': 'Oil Seal',

    // Generic fallbacks
    'Object_1': 'Transmission Housing',
    'Object_2': 'Bell Housing',
    'Object_3': 'Main Shaft Assembly',
    'Object_4': 'Gear Set',
    'Object_5': 'Synchronizer Assembly',
    'Object_6': 'Input Shaft',
    'Object_7': 'Output Shaft',
    'Object_8': 'Shift Mechanism',
    'Object_9': 'Clutch Pack',
    'Object_10': 'Extension Housing',
};

export const STEERING_PARTS = {
    // Common steering part mappings
    'Steering_Wheel': 'Steering Wheel',
    'Steering_Column': 'Steering Column',
    'Steering_Shaft': 'Steering Shaft',
    'Universal_Joint': 'Universal Joint',
    'Steering_Rack': 'Steering Rack',
    'Pinion': 'Pinion Gear',
    'Tie_Rod': 'Tie Rod',
    'Tie_Rod_End': 'Tie Rod End',
    'Inner_Tie_Rod': 'Inner Tie Rod',
    'Outer_Tie_Rod': 'Outer Tie Rod',
    'Steering_Knuckle': 'Steering Knuckle',
    'Ball_Joint': 'Ball Joint',
    'Power_Steering_Pump': 'Power Steering Pump',
    'Steering_Gear': 'Steering Gear Box',
    'Pitman_Arm': 'Pitman Arm',
    'Idler_Arm': 'Idler Arm',
    'Center_Link': 'Center Link',
    'Drag_Link': 'Drag Link',
    'Steering_Boot': 'Steering Rack Boot',
    'Reservoir': 'Power Steering Reservoir',

    // Generic fallbacks
    'Object_1': 'Steering Rack Assembly',
    'Object_2': 'Steering Column',
    'Object_3': 'Tie Rod Assembly',
    'Object_4': 'Power Steering Pump',
    'Object_5': 'Steering Gear',
    'Object_6': 'Steering Shaft',
    'Object_7': 'Universal Joint',
    'Object_8': 'Steering Wheel Hub',
    'Object_9': 'Tie Rod End',
    'Object_10': 'Steering Knuckle',
};

export const SUSPENSION_PARTS = {
    'Shock_Absorber': 'Shock Absorber',
    'Strut': 'MacPherson Strut',
    'Coil_Spring': 'Coil Spring',
    'Leaf_Spring': 'Leaf Spring',
    'Control_Arm': 'Control Arm',
    'Upper_Control_Arm': 'Upper Control Arm',
    'Lower_Control_Arm': 'Lower Control Arm',
    'Sway_Bar': 'Stabilizer Bar',
    'End_Link': 'Stabilizer End Link',
    'Bushing': 'Suspension Bushing',
    'Ball_Joint': 'Ball Joint',
    'Hub': 'Wheel Hub',
    'Bearing': 'Wheel Bearing',
    'Knuckle': 'Steering Knuckle',
};

export const BRAKE_PARTS = {
    'Brake_Rotor': 'Brake Rotor',
    'Brake_Disc': 'Brake Disc',
    'Brake_Pad': 'Brake Pad',
    'Caliper': 'Brake Caliper',
    'Brake_Line': 'Brake Line',
    'Master_Cylinder': 'Master Cylinder',
    'Brake_Booster': 'Brake Booster',
    'ABS_Module': 'ABS Module',
    'Brake_Drum': 'Brake Drum',
    'Brake_Shoe': 'Brake Shoe',
    'Wheel_Cylinder': 'Wheel Cylinder',
    'Parking_Brake': 'Parking Brake Cable',
};

export const ELECTRICAL_PARTS = {
    'Battery': 'Battery',
    'Alternator': 'Alternator',
    'Starter': 'Starter Motor',
    'Fuse_Box': 'Fuse Box',
    'Relay': 'Relay',
    'ECU': 'Engine Control Unit',
    'Wiring_Harness': 'Wiring Harness',
    'Ignition_Switch': 'Ignition Switch',
    'Headlight': 'Headlight Assembly',
    'Taillight': 'Taillight Assembly',
    'Turn_Signal': 'Turn Signal',
};

// All parts combined
export const ALL_PART_MAPS = {
    engine: ENGINE_PARTS,
    transmission: TRANSMISSION_PARTS,
    steering: STEERING_PARTS,
    suspension: SUSPENSION_PARTS,
    brakes: BRAKE_PARTS,
    electrical: ELECTRICAL_PARTS,
};

/**
 * Get a human-readable part name from a mesh/object name
 * @param {string} objectName - The original object name from the 3D model
 * @param {string} systemType - The type of system (engine, transmission, etc.)
 * @returns {string} Human-readable part name
 */
export function getPartName(objectName, systemType = 'engine') {
    if (!objectName) return 'Unknown Component';

    // Clean up the name
    const cleanName = objectName.trim();

    // Get the appropriate map
    const partMap = ALL_PART_MAPS[systemType] || {};

    // Check for exact match
    if (partMap[cleanName]) {
        return partMap[cleanName];
    }

    // Check if any key contains or matches the name (case-insensitive)
    const lowerName = cleanName.toLowerCase();
    for (const [key, value] of Object.entries(partMap)) {
        if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
            return value;
        }
    }

    // Try to extract a meaningful name from patterns like "Object_123" or "Mesh_456"
    if (cleanName.startsWith('Object_') || cleanName.startsWith('Mesh_')) {
        const num = parseInt(cleanName.split('_')[1]);
        if (!isNaN(num) && partMap[`Object_${num}`]) {
            return partMap[`Object_${num}`];
        }
    }

    // Clean up names like "Cylinder_Head_001" → "Cylinder Head"
    const cleaned = cleanName
        .replace(/_\d+$/, '') // Remove trailing numbers
        .replace(/_/g, ' ')   // Replace underscores with spaces
        .replace(/\./g, ' ')  // Replace dots with spaces
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();

    // Capitalize first letter of each word
    if (cleaned && cleaned !== cleanName) {
        return cleaned.split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }

    // If still no match, return the original or "Component"
    return cleanName || 'Component';
}

/**
 * Get part description/info
 */
export function getPartDescription(partName) {
    const descriptions = {
        'Cylinder Block': 'The main body of the engine that houses the cylinders and crankcase.',
        'Cylinder Head': 'Sits on top of the cylinder block and contains the combustion chambers.',
        'Crankshaft': 'Converts the reciprocating motion of pistons into rotational motion.',
        'Piston': 'Moves up and down in the cylinder during the combustion cycle.',
        'Camshaft': 'Controls the opening and closing of intake and exhaust valves.',
        'Connecting Rod': 'Links the piston to the crankshaft.',
        'Oil Pan': 'Reservoir at the bottom of the engine that holds the engine oil.',
        'Intake Manifold': 'Distributes air/fuel mixture to the cylinders.',
        'Exhaust Manifold': 'Collects exhaust gases from the cylinders.',
        'Transmission Case': 'The main housing that contains all transmission components.',
        'Steering Rack': 'Converts rotational steering input into linear motion for the wheels.',
        'Tie Rod': 'Connects the steering rack to the steering knuckle.',
        // Add more descriptions as needed
    };

    return descriptions[partName] || `Click to learn more about the ${partName}.`;
}

/**
 * Complaint-to-System Mapping
 * Maps customer complaints to relevant automotive systems for focused 3D visualization
 */
export const COMPLAINT_SYSTEM_MAP = {
    // Engine-related complaints
    'check engine light': ['engine', 'electrical'],
    'engine light': ['engine', 'electrical'],
    'engine misfire': ['engine'],
    'rough idle': ['engine', 'electrical'],
    'stalling': ['engine', 'electrical'],
    'hard to start': ['engine', 'electrical'],
    'won\'t start': ['engine', 'electrical'],
    'no start': ['engine', 'electrical'],
    'engine noise': ['engine'],
    'knocking sound': ['engine'],
    'overheating': ['engine'],
    'coolant leak': ['engine'],
    'oil leak': ['engine'],
    'loss of power': ['engine', 'transmission'],
    'power loss': ['engine', 'transmission'],
    'poor acceleration': ['engine', 'transmission'],
    'black smoke': ['engine'],
    'white smoke': ['engine'],
    'blue smoke': ['engine'],

    // Transmission-related complaints
    'hard shifting': ['transmission'],
    'grinding gears': ['transmission'],
    'slipping gears': ['transmission'],
    'won\'t shift': ['transmission'],
    'transmission noise': ['transmission'],
    'clutch slip': ['transmission'],
    'clutch problems': ['transmission'],
    'vibration when accelerating': ['transmission', 'engine'],

    // Brake-related complaints
    'brake noise': ['brakes'],
    'squealing': ['brakes'],
    'grinding brakes': ['brakes'],
    'soft brake pedal': ['brakes'],
    'spongy brake': ['brakes'],
    'brake pedal goes to floor': ['brakes'],
    'car pulls when braking': ['brakes', 'suspension'],
    'abs light': ['brakes', 'electrical'],
    'brake warning light': ['brakes'],
    'vibration when braking': ['brakes'],

    // Steering-related complaints
    'hard steering': ['steering'],
    'steering wheel shakes': ['steering', 'suspension'],
    'steering noise': ['steering'],
    'power steering leak': ['steering'],
    'steering play': ['steering'],
    'car pulls to one side': ['steering', 'suspension'],
    'off-center steering': ['steering'],
    'loose steering': ['steering'],

    // Suspension-related complaints
    'rough ride': ['suspension'],
    'bouncy ride': ['suspension'],
    'clunking sound': ['suspension'],
    'noise over bumps': ['suspension'],
    'uneven tire wear': ['suspension', 'steering'],
    'car sits low': ['suspension'],
    'suspension noise': ['suspension'],
    'shaking at highway speeds': ['suspension', 'steering'],

    // Electrical-related complaints
    'battery dead': ['electrical'],
    'lights dim': ['electrical'],
    'electrical problems': ['electrical'],
    'car won\'t crank': ['electrical'],
    'dashboard lights': ['electrical'],
    'warning lights': ['electrical'],
    'no power': ['electrical'],
    'alternator light': ['electrical'],
    'fuse keeps blowing': ['electrical']
};

/**
 * Common preset complaints for diagnostic mode
 */
export const PRESET_COMPLAINTS = [
    { id: 'check_engine', label: 'Check Engine Light', systems: ['engine', 'electrical'] },
    { id: 'power_loss', label: 'Power Loss While Climbing', systems: ['engine', 'transmission'] },
    { id: 'brake_noise', label: 'Squealing Brakes', systems: ['brakes'] },
    { id: 'steering_shake', label: 'Steering Wheel Shakes', systems: ['steering', 'suspension'] },
    { id: 'rough_ride', label: 'Rough/Bumpy Ride', systems: ['suspension'] },
    { id: 'hard_shifting', label: 'Hard Shifting', systems: ['transmission'] },
    { id: 'car_pulls', label: 'Car Pulls to Side', systems: ['steering', 'brakes', 'suspension'] },
    { id: 'no_start', label: 'Won\'t Start', systems: ['engine', 'electrical'] },
    { id: 'overheating', label: 'Engine Overheating', systems: ['engine'] },
    { id: 'abs_light', label: 'ABS Warning Light', systems: ['brakes', 'electrical'] }
];

/**
 * Get relevant systems for a given complaint
 * @param {string} complaint - The customer complaint text
 * @returns {string[]} Array of relevant system IDs
 */
export function getRelevantSystems(complaint) {
    if (!complaint) return [];

    const lowerComplaint = complaint.toLowerCase().trim();

    // Check for exact match first
    if (COMPLAINT_SYSTEM_MAP[lowerComplaint]) {
        return COMPLAINT_SYSTEM_MAP[lowerComplaint];
    }

    // Check if complaint contains any mapped phrases
    for (const [phrase, systems] of Object.entries(COMPLAINT_SYSTEM_MAP)) {
        if (lowerComplaint.includes(phrase) || phrase.includes(lowerComplaint)) {
            return systems;
        }
    }

    // Default: return all systems if no match found
    return ['engine', 'transmission', 'brakes', 'steering', 'suspension', 'electrical'];
}
