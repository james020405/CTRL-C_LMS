/**
 * Standard Automotive Parts Dictionary
 * Pre-defined parts for AI guardrails - AI must use these specific part names
 * This ensures technical specificity in game scenarios and answers
 * 
 * Based on Philippine automotive curriculum standards (MacPherson suspension, 7 key components)
 */

// ============================================
// ENGINE COMPONENTS
// ============================================
export const ENGINE_COMPONENTS = {
    internal: [
        'Piston Assembly',
        'Piston Ring Set (Compression & Oil)',
        'Connecting Rod',
        'Crankshaft',
        'Camshaft',
        'Timing Chain',
        'Timing Belt',
        'Timing Chain Tensioner',
        'Cylinder Head',
        'Cylinder Block',
        'Head Gasket',
        'Intake Valve',
        'Exhaust Valve',
        'Valve Spring',
        'Valve Seal',
        'Rocker Arm',
        'Push Rod',
        'Lifter/Tappet',
        'Oil Pump',
        'Oil Pan',
        'Oil Filter',
        'Oil Pressure Sensor',
    ],
    cooling: [
        'Radiator',
        'Radiator Cap',
        'Radiator Hose (Upper)',
        'Radiator Hose (Lower)',
        'Water Pump',
        'Thermostat',
        'Thermostat Housing',
        'Coolant Temperature Sensor',
        'Cooling Fan',
        'Fan Clutch',
        'Expansion Tank',
        'Heater Core',
        'Heater Hose',
    ],
    fuel: [
        'Fuel Injector',
        'Fuel Pump',
        'Fuel Filter',
        'Fuel Pressure Regulator',
        'Throttle Body',
        'Idle Air Control Valve',
        'Mass Air Flow Sensor (MAF)',
        'Manifold Absolute Pressure Sensor (MAP)',
        'Intake Manifold',
        'Intake Manifold Gasket',
        'Fuel Rail',
        'PCV Valve',
    ],
    exhaust: [
        'Exhaust Manifold',
        'Exhaust Manifold Gasket',
        'Catalytic Converter',
        'Oxygen Sensor (O2 Sensor)',
        'Muffler',
        'Exhaust Pipe',
        'EGR Valve',
        'Exhaust Heat Shield',
    ],
    ignition: [
        'Spark Plug',
        'Ignition Coil',
        'Ignition Coil Pack',
        'Distributor Cap',
        'Distributor Rotor',
        'Spark Plug Wire Set',
        'Crankshaft Position Sensor',
        'Camshaft Position Sensor',
        'Knock Sensor',
    ],
    accessories: [
        'Alternator',
        'Serpentine Belt',
        'Belt Tensioner',
        'Idler Pulley',
        'Power Steering Pump',
        'A/C Compressor',
        'Starter Motor',
        'Flywheel',
        'Flexplate',
    ]
};

// ============================================
// TRANSMISSION COMPONENTS
// ============================================
export const TRANSMISSION_COMPONENTS = {
    manual: [
        'Clutch Disc',
        'Clutch Pressure Plate',
        'Clutch Release Bearing (Throw-out Bearing)',
        'Clutch Master Cylinder',
        'Clutch Slave Cylinder',
        'Pilot Bearing',
        'Input Shaft',
        'Output Shaft',
        'Countershaft',
        'Synchronizer Ring',
        'Synchronizer Hub',
        'Synchronizer Sleeve',
        'Shift Fork',
        'Shift Rail',
        'Gear Set (1st-5th)',
        'Reverse Idler Gear',
        'Main Shaft Bearing',
        'Transmission Case',
        'Extension Housing',
        'Transmission Mount',
    ],
    automatic: [
        'Torque Converter',
        'Stator',
        'Impeller',
        'Turbine',
        'Planetary Gear Set',
        'Sun Gear',
        'Planet Gears',
        'Ring Gear',
        'Clutch Pack',
        'Band',
        'Valve Body',
        'Shift Solenoid',
        'Transmission Control Module (TCM)',
        'Input Speed Sensor',
        'Output Speed Sensor',
        'Transmission Fluid Pump',
        'Transmission Filter',
        'Transmission Pan',
        'Park Pawl',
    ]
};

// ============================================
// SUSPENSION COMPONENTS (7 Key Components - MacPherson Focus)
// ============================================
export const SUSPENSION_COMPONENTS = {
    // The 7 standard components per client requirement
    standard_seven: [
        'MacPherson Strut Assembly',
        'Coil Spring',
        'Upper Strut Mount (Top Mount)',
        'Lower Control Arm',
        'Ball Joint',
        'Stabilizer Bar (Sway Bar)',
        'Stabilizer Bar End Link',
    ],
    additional: [
        'Shock Absorber',
        'Strut Bearing',
        'Control Arm Bushing',
        'Strut Bumper',
        'Dust Boot',
        'Knuckle/Steering Knuckle',
        'Wheel Hub Assembly',
        'Wheel Bearing',
        'Tie Rod End',
        'Inner Tie Rod',
        'Subframe',
        'Subframe Bushing',
        'Trailing Arm',
        'Upper Control Arm',
        'Camber Bolt',
    ]
};

// ============================================
// STEERING COMPONENTS
// ============================================
export const STEERING_COMPONENTS = {
    rack_and_pinion: [
        'Steering Rack',
        'Pinion Gear',
        'Inner Tie Rod',
        'Outer Tie Rod',
        'Tie Rod End',
        'Steering Rack Boot',
        'Steering Rack Bushing',
        'Power Steering Pump',
        'Power Steering Reservoir',
        'Power Steering Hose (Pressure)',
        'Power Steering Hose (Return)',
        'Power Steering Fluid',
        'Steering Wheel',
        'Steering Column',
        'Steering Shaft',
        'Universal Joint (Steering)',
        'Intermediate Shaft',
        'Steering Angle Sensor',
        'Electric Power Steering Motor',
    ],
    recirculating_ball: [
        'Steering Gear Box',
        'Pitman Arm',
        'Idler Arm',
        'Center Link',
        'Drag Link',
        'Sector Shaft',
        'Worm Gear',
    ]
};

// ============================================
// BRAKE COMPONENTS
// ============================================
export const BRAKE_COMPONENTS = {
    disc: [
        'Brake Rotor (Disc)',
        'Brake Pad Set',
        'Brake Caliper',
        'Caliper Piston',
        'Caliper Bracket',
        'Caliper Guide Pin',
        'Caliper Slide Pin',
        'Brake Pad Wear Sensor',
        'Brake Pad Shim',
        'Anti-Rattle Clip',
        'Brake Dust Shield',
    ],
    drum: [
        'Brake Drum',
        'Brake Shoe Set',
        'Wheel Cylinder',
        'Brake Adjuster',
        'Return Spring',
        'Hold-Down Spring',
        'Backing Plate',
    ],
    hydraulic: [
        'Brake Master Cylinder',
        'Brake Booster (Vacuum)',
        'Brake Fluid Reservoir',
        'Brake Line (Steel)',
        'Brake Hose (Flexible)',
        'Brake Bleeder Valve',
        'Proportioning Valve',
        'ABS Module',
        'ABS Wheel Speed Sensor',
        'ABS Pump',
        'Brake Pressure Sensor',
    ],
    parking: [
        'Parking Brake Cable',
        'Parking Brake Lever',
        'Parking Brake Shoe',
        'Parking Brake Drum',
    ]
};

// ============================================
// ELECTRICAL COMPONENTS
// ============================================
export const ELECTRICAL_COMPONENTS = {
    starting: [
        'Battery',
        'Battery Terminal',
        'Battery Cable',
        'Starter Motor',
        'Starter Solenoid',
        'Starter Relay',
        'Ignition Switch',
        'Neutral Safety Switch',
    ],
    charging: [
        'Alternator',
        'Voltage Regulator',
        'Alternator Belt',
        'Battery Charge Sensor',
    ],
    sensors: [
        'Engine Control Unit (ECU)',
        'Crankshaft Position Sensor',
        'Camshaft Position Sensor',
        'Mass Air Flow Sensor (MAF)',
        'Manifold Absolute Pressure Sensor (MAP)',
        'Throttle Position Sensor (TPS)',
        'Oxygen Sensor (O2)',
        'Knock Sensor',
        'Coolant Temperature Sensor (ECT)',
        'Intake Air Temperature Sensor (IAT)',
        'Vehicle Speed Sensor (VSS)',
        'Oil Pressure Sensor',
        'Fuel Level Sensor',
    ],
    lighting: [
        'Headlight Assembly',
        'Headlight Bulb',
        'Tail Light Assembly',
        'Brake Light Switch',
        'Turn Signal Switch',
        'Combination Switch',
        'Relay',
        'Fuse',
        'Fuse Box',
    ]
};

// ============================================
// TOOL SIZES (Metric Only per client requirement)
// ============================================
export const METRIC_TOOL_SIZES = {
    wrenches: ['6mm', '8mm', '10mm', '12mm', '13mm', '14mm', '17mm', '19mm', '21mm', '22mm', '24mm', '27mm', '30mm', '32mm', '36mm'],
    sockets: ['6mm', '8mm', '10mm', '12mm', '13mm', '14mm', '17mm', '19mm', '21mm', '22mm', '24mm', '27mm', '30mm', '32mm', '36mm'],
    allen_keys: ['3mm', '4mm', '5mm', '6mm', '8mm', '10mm'],
    torx: ['T10', 'T15', 'T20', 'T25', 'T27', 'T30', 'T40', 'T45', 'T50', 'T55'],
    torque_specs: {
        'Wheel Lug Nut': '100-120 Nm',
        'Spark Plug': '20-30 Nm',
        'Oil Drain Plug': '30-40 Nm',
        'Cylinder Head Bolt': '60-80 Nm (check spec)',
        'Connecting Rod Bolt': '40-50 Nm',
        'Main Bearing Cap': '60-70 Nm',
        'Brake Caliper Bracket': '80-100 Nm',
        'Brake Caliper Slide Pin': '25-35 Nm',
        'Ball Joint Nut': '50-70 Nm',
        'Tie Rod End Nut': '40-60 Nm',
        'Control Arm Bolt': '100-120 Nm',
        'Strut Top Mount Nut': '40-50 Nm',
    }
};

// ============================================
// FLUIDS (With specifications)
// ============================================
export const AUTOMOTIVE_FLUIDS = {
    engine_oil: ['5W-30', '5W-40', '10W-30', '10W-40', '0W-20', '0W-40', '15W-40'],
    transmission_fluid: ['ATF Type A', 'ATF Dexron III', 'ATF Dexron VI', 'CVT Fluid', 'Manual Transmission Fluid (MTF)'],
    coolant: ['50/50 Pre-mixed Coolant', 'Ethylene Glycol', 'Propylene Glycol', 'Long-Life Coolant (LLC)'],
    brake_fluid: ['DOT 3', 'DOT 4', 'DOT 5', 'DOT 5.1'],
    power_steering: ['ATF', 'Power Steering Fluid (PSF)', 'CHF 11S'],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all parts for a specific system
 */
export function getPartsForSystem(system) {
    switch (system.toLowerCase()) {
        case 'engine':
            return Object.values(ENGINE_COMPONENTS).flat();
        case 'transmission':
            return Object.values(TRANSMISSION_COMPONENTS).flat();
        case 'suspension':
            return Object.values(SUSPENSION_COMPONENTS).flat();
        case 'steering':
            return Object.values(STEERING_COMPONENTS).flat();
        case 'brakes':
            return Object.values(BRAKE_COMPONENTS).flat();
        case 'electrical':
            return Object.values(ELECTRICAL_COMPONENTS).flat();
        default:
            return [];
    }
}

/**
 * Get random parts for generating game scenarios
 */
export function getRandomParts(system, count = 4) {
    const parts = getPartsForSystem(system);
    const shuffled = [...parts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

/**
 * Get the 7 standard suspension components
 */
export function getStandardSuspensionComponents() {
    return SUSPENSION_COMPONENTS.standard_seven;
}

/**
 * Validate if a part name is in our standard dictionary
 */
export function isValidPart(partName, system = null) {
    if (system) {
        const parts = getPartsForSystem(system);
        return parts.some(p => p.toLowerCase() === partName.toLowerCase());
    }

    // Check all systems
    const allParts = [
        ...Object.values(ENGINE_COMPONENTS).flat(),
        ...Object.values(TRANSMISSION_COMPONENTS).flat(),
        ...Object.values(SUSPENSION_COMPONENTS).flat(),
        ...Object.values(STEERING_COMPONENTS).flat(),
        ...Object.values(BRAKE_COMPONENTS).flat(),
        ...Object.values(ELECTRICAL_COMPONENTS).flat(),
    ];

    return allParts.some(p => p.toLowerCase() === partName.toLowerCase());
}

/**
 * Get metric tool sizes for a given tool type
 */
export function getToolSizes(toolType = 'wrenches') {
    return METRIC_TOOL_SIZES[toolType] || METRIC_TOOL_SIZES.wrenches;
}

/**
 * Get all standard parts as a flat list for AI prompts
 */
export function getAllStandardParts() {
    return {
        engine: Object.values(ENGINE_COMPONENTS).flat(),
        transmission: Object.values(TRANSMISSION_COMPONENTS).flat(),
        suspension: Object.values(SUSPENSION_COMPONENTS).flat(),
        steering: Object.values(STEERING_COMPONENTS).flat(),
        brakes: Object.values(BRAKE_COMPONENTS).flat(),
        electrical: Object.values(ELECTRICAL_COMPONENTS).flat(),
    };
}

/**
 * Get parts list formatted for AI prompts
 */
export function getPartsListForPrompt(system) {
    const parts = getPartsForSystem(system);
    return parts.join(', ');
}

/**
 * Get tool sizes formatted for AI prompts
 */
export function getToolSizesForPrompt() {
    return `Wrenches/Sockets: ${METRIC_TOOL_SIZES.wrenches.join(', ')}; Allen Keys: ${METRIC_TOOL_SIZES.allen_keys.join(', ')}; Torx: ${METRIC_TOOL_SIZES.torx.join(', ')}`;
}
