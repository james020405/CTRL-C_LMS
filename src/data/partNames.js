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
        // ============ BRAKE SYSTEM (All actual model parts) ============
        'Wheel': 'Wheel assembly including the tire, rim, and hub. Transfers braking force to the ground and provides traction.',
        'Wheel001': 'Front wheel assembly with tire, rim, and hub. Handles steering and primary braking forces.',
        'Rear_Wheel': 'Rear wheel assembly including the tire, rim, and hub. Transfers braking force to the ground.',
        'Rear_Wheel001': 'Second rear wheel assembly. Part of the rear axle that receives braking force.',
        'Caliper': 'Brake caliper housing the brake pads and pistons. Squeezes pads against the rotor when brakes are applied.',
        'Caliper001': 'Second brake caliper unit. Each wheel has its own caliper for independent braking.',
        'Master_Cylinder': 'Converts brake pedal force into hydraulic pressure. Heart of the braking system that distributes force to all wheels.',
        'Adjustable_Proportioning_Valve': 'Controls the brake pressure ratio between front and rear brakes. Allows fine-tuning of brake balance for optimal stopping.',
        'Combination_Valve': 'Multi-function valve containing metering, proportioning, and pressure differential components. Central brake control unit.',
        'Metering_Valve': 'Delays front brake application until rear brakes engage. Prevents front brake lock-up and nosedive during braking.',
        'Residual_Valve': 'Maintains slight pressure in brake lines to keep wheel cylinder cups sealed against the pistons.',
        'Residual_Valve001': 'Second residual valve for the opposite brake circuit. Ensures consistent brake feel.',
        'T_Fitting': 'T-shaped pipe fitting that splits brake fluid flow to multiple brake lines. Distributes hydraulic pressure.',
        'Flex_Line002': 'Flexible brake hose connecting the rigid brake lines to the moving caliper. Allows suspension travel.',
        'Circle_004001': 'Brake disc rotor surface. The circular friction surface where brake pads make contact.',
        'Circle_004001_1': 'Inner rotor surface. Ventilated rotors have two surfaces for improved cooling.',
        'Circle_008': 'Brake rotor assembly. Cast iron disc that provides the friction surface for braking.',
        'Circle_010001': 'Wheel hub connection point. Where the brake rotor mounts to the wheel hub.',
        'Circle_010001_1': 'Hub bearing surface. Allows smooth wheel rotation while supporting vehicle weight.',

        // ============ ELECTRICAL SYSTEM (All actual model parts) ============
        'Battery': '12-volt lead-acid power source. Provides 400-800 cold cranking amps to start the engine and power accessories.',
        'Battery_Cable': 'Heavy gauge cable connecting the battery to the starter and ground. Carries high current for starting.',
        'Battery_Cable001': 'Positive battery cable connecting to the starter motor and fuse block.',
        'Battery_Cable002': 'Negative ground cable connecting battery to the engine block and chassis.',
        'Battery_Cable003': 'Auxiliary power cable supplying current to the main electrical system.',
        'Battery_Cable004': 'Secondary ground strap ensuring proper electrical grounding throughout the vehicle.',
        'Alternator': 'Generates electricity while the engine runs. Produces 13.5-14.5 volts to charge the battery and power electronics.',
        'Starter_Motor': 'High-torque electric motor that cranks the engine for starting. Draws 150-200 amps during operation.',
        'Engine': 'Internal combustion engine - the power plant converting fuel into mechanical energy to drive the vehicle.',
        'Main_Fuse_Block': 'Central fuse panel protecting all electrical circuits. Contains fuses and relays for various systems.',
        'Charge_Indicator': 'Dashboard warning light or gauge showing charging system status. Alerts driver to alternator problems.',
        'Charging_System_Harness': 'Wiring connecting the alternator, battery, and charge indicator. Carries charging current and signals.',
        'tmpzm4bo0d5_ply__C_tmpzm4bo0d5_ply_Defintion__005': 'Ignition switch wiring connector. Links the key switch to the starter and accessory circuits.',
        'tmpzm4bo0d5_ply__C_tmpzm4bo0d5_ply_Defintion__010': 'Electrical junction connector. Distribution point for multiple wire connections.',


        // ============ SUSPENSION SYSTEM (All actual model parts) ============
        'Damper': 'Shock absorber/damper that controls suspension movement. Uses hydraulic fluid to absorb bumps and prevent bouncing.',
        'Radius_Rod': 'Suspension link that controls forward/backward wheel movement. Prevents wheel hop and maintains alignment under acceleration.',
        'Tire': 'Rubber tire mounted on the wheel rim. Provides traction, absorbs minor road imperfections, and supports vehicle weight.',
        'Upper_Arm_and_Damper_Spring': 'Upper control arm assembly with integrated coil spring and damper mount. Controls wheel camber and absorbs impacts.',
        'tmpkjcnard__ply__C_tmpkjcnard__ply_Defintion__002': 'Lower control arm - A-shaped suspension link connecting the wheel hub to the chassis. Allows vertical wheel travel.',
        'tmpkjcnard__ply__C_tmpkjcnard__ply_Defintion__005': 'Ball joint assembly - Spherical bearing allowing the suspension to pivot while the wheel turns and moves up/down.',
        'tmpkjcnard__ply__C_tmpkjcnard__ply_Defintion__006': 'Steering knuckle - Central pivot point connecting wheel hub, brake, suspension arms, and steering linkage.',
        'tmpkjcnard__ply__C_tmpkjcnard__ply_Defintion__008': 'Wheel hub and bearing assembly - Allows wheel rotation while supporting vehicle weight and transferring braking forces.',
        // Additional suspension parts
        'Coil_Spring': 'Wound steel spring that absorbs road impacts and supports vehicle weight. Compresses with suspension travel.',
        'Spring': 'Suspension spring that absorbs road impacts and supports vehicle weight.',
        'Shock': 'Shock absorber - hydraulic damper that controls spring oscillation for a smooth ride.',
        'Shock_Absorber': 'Hydraulic damper that controls spring oscillation. Prevents excessive bouncing for a smooth ride.',
        'Strut': 'Combined spring and shock absorber unit. Structural component that also affects steering geometry.',
        'Control_Arm': 'A-shaped arm connecting wheel hub to chassis. Allows vertical wheel movement while maintaining alignment.',
        'Lower_Control_Arm': 'Lower suspension arm connecting the wheel hub to the vehicle frame.',
        'Upper_Control_Arm': 'Upper suspension arm that helps control wheel movement and camber angle.',
        'Ball_Joint': 'Spherical bearing connecting control arm to steering knuckle. Allows wheel to turn and move up/down.',
        'Sway_Bar': 'Anti-roll bar linking left and right suspension. Reduces body lean during cornering.',
        'Stabilizer_Bar': 'Anti-roll bar linking left and right suspension. Reduces body lean during cornering.',
        'Tie_Rod': 'Connects steering rack to steering knuckle. Transmits steering input to turn the wheels.',
        'Wheel_Hub': 'Central component holding the wheel. Contains the wheel bearing for smooth rotation.',
        'Hub': 'Wheel hub - central component where the wheel mounts. Contains bearings for rotation.',
        'Knuckle': 'Steering knuckle - the pivot point connecting wheel, suspension, steering, and brakes together.',
        'Steering_Knuckle': 'Pivot point connecting wheel hub to suspension. Allows steering and suspension movement.',
        'Bushing': 'Rubber component absorbing vibration and allowing controlled movement between suspension parts.',


        // ============ STEERING SYSTEM (All actual model parts) ============
        '(loose_entity)_2': 'Steering wheel - driver interface for directional control. Contains airbag and horn controls.',
        '(loose_entity)_2_1': 'Steering wheel hub - center mounting point connecting wheel to steering column.',
        'c_airbox_2': 'Steering column shroud - plastic cover protecting steering column internals and wiring.',
        'c_airbox_2_1': 'Steering column upper shroud - covers turn signal and wiper stalks.',
        'c_component#1': 'Steering rack housing - main body of the rack and pinion assembly.',
        'c_component#1_2': 'Steering rack inner tie rod socket - threaded connection for tie rod adjustment.',
        'c_component#1_3': 'Steering rack boot clamp - secures the protective boot to prevent contamination.',
        'c_component#5': 'Power steering pump - hydraulic pump providing assist for easier steering.',
        'c_component#5_2': 'Power steering reservoir - holds power steering fluid for the hydraulic system.',
        'c_weld_pro_star_(loose_mesh)': 'Steering wheel rim - outer grip portion of the steering wheel.',
        'c_weld_pro_star_(loose_mesh)_2': 'Steering wheel spoke - connects the rim to the center hub.',
        'g_cylinder': 'Steering column shaft - connects steering wheel rotation to the steering gear.',
        'g_object': 'Steering rack - converts rotational input to linear motion for the tie rods.',
        'g_object_2': 'Pinion gear - meshes with the rack to transfer steering input.',
        'g_object_3': 'Rack teeth - precision-cut teeth engaging with the pinion gear.',
        'g_object_4': 'Inner tie rod - connects steering rack to the outer tie rod end.',
        'g_object_5': 'Outer tie rod end - ball joint connecting tie rod to steering knuckle.',
        'g_object_6': 'Steering rack boot - rubber bellows protecting tie rod and rack internals.',
        'g_object_7': 'Tie rod adjustment sleeve - allows toe alignment adjustment.',
        'g_object_8': 'Steering knuckle - pivot point connecting wheel hub to suspension and steering.',
        'g_object_9': 'Steering arm - extension from knuckle where tie rod connects.',
        'g_object_11': 'Steering column universal joint - allows angular movement in the column.',
        'g_object_12': 'Intermediate steering shaft - connects column to steering gear through firewall.',
        'g_object_13': 'Steering gear mounting bracket - secures the rack to the subframe.',
        'g_object_14': 'Power steering line - high pressure hose from pump to steering gear.',
        'g_object_15': 'Power steering return line - low pressure hose returning fluid to reservoir.',
        'g_object_17': 'Steering stop bolt - limits maximum steering angle to prevent damage.',
        'g_object_18': 'Rack mounting bushing - rubber isolator reducing vibration and noise.',
        'g_object_19': 'Pinion bearing - supports the pinion gear for smooth rotation.',
        'g_object_20': 'Rack guide - spring-loaded support keeping rack engaged with pinion.',
        'g_object_21': 'Steering column bearing - allows smooth rotation of the steering shaft.',
        'g_object_22': 'Column lock mechanism - security device preventing steering without key.',
        'g_object_23': 'Steering angle sensor - reports wheel position to stability control system.',
        'g_object_34': 'Control valve spool - directs hydraulic fluid in the power steering system.',
        'g_object_34_1': 'Torsion bar - senses steering effort to control power assist level.',
        'g_object_40': 'Wheel hub assembly - contains bearings and mounts the wheel and brake.',
        'g_object_40_1': 'Wheel bearing - allows wheel rotation with minimal friction.',
        'g_object_49': 'Lower ball joint - pivot point for steering knuckle on the control arm.',
        'g_object_49_1': 'Ball joint boot - protective cover preventing contamination of the ball joint.',
        'g_object__(loose_mesh)': 'Steering damper - reduces steering vibration and shimmy at highway speeds.',
        // Generic steering parts
        'Steering_Wheel': 'Driver interface for directional control. Connected to steering column and may contain airbag.',
        'Steering_Column': 'Connects steering wheel to steering rack. Contains ignition lock and is collapsible for safety.',
        'Steering_Rack': 'Rack and pinion mechanism converting steering wheel rotation into left-right wheel movement.',
        'Rack': 'Steering rack - converts rotational steering input into linear side-to-side motion.',
        'Pinion': 'Small gear meshing with the steering rack. Converts rotational input to linear motion.',
        'Power_Steering_Pump': 'Hydraulic pump providing steering assist. Makes turning effortless at low speeds.',
        'Power_Steering': 'System providing steering assist using hydraulic or electric power.',


        // ============ ENGINE SYSTEM (All V6 model parts) ============
        'V6_Engine_Block': 'V6 engine block - main casting housing 6 cylinders in a V configuration. Contains water jacket and oil passages.',
        'V6_Cylinder_Bank_Left': 'Left cylinder bank containing 3 cylinders. One half of the V6 configuration.',
        'V6_Cylinder_Head_Right_Mesh': 'Right cylinder head assembly housing valves, camshaft, and combustion chambers for the right bank.',
        'V6_Cylinder_Head_Right_Mesh_1': 'Right cylinder head intake port section. Routes air-fuel mixture into the combustion chamber.',
        'V6_Cylinder_Head_Right_Mesh_2': 'Right cylinder head exhaust port section. Routes exhaust gases to the manifold.',
        'V6_Crankshaft_Mesh': 'V6 crankshaft - converts reciprocating piston motion into rotational motion. Features offset journals for each cylinder.',
        'V6_Crankshaft_Mesh_1': 'Crankshaft main bearing journal. Supported by main bearings in the engine block.',
        'V6_Crankshaft_Pulley_Hub': 'Crankshaft pulley hub - mounts the harmonic balancer and drives the serpentine belt for accessories.',
        'V6_Piston_Mesh': 'Cylinder 1 piston - aluminum alloy piston with compression and oil control rings.',
        'V6_Piston_Mesh_1': 'Cylinder 2 piston - moves through intake, compression, power, and exhaust strokes.',
        'V6_Piston_Mesh_2': 'Cylinder 3 piston - fires in sequence according to the V6 firing order.',
        'V6_Piston_Mesh_3': 'Cylinder 4 piston - transfers combustion force to the crankshaft via connecting rod.',
        'V6_Piston_Mesh_4': 'Cylinder 5 piston - equipped with rings to seal combustion gases and control oil.',
        'V6_Piston_Mesh_5': 'Cylinder 6 piston - completes the V6 firing order for balanced power delivery.',
        'V6_Piston_Mesh_6': 'Additional piston assembly component. Part of the piston and connecting rod system.',
        'V6_Valve_Mesh': 'Intake valve - opens to allow air-fuel mixture into the combustion chamber.',
        'V6_Valve_Mesh_1': 'Exhaust valve - opens to release burnt gases after the power stroke.',
        'V6_Valve_Mesh_2': 'Second intake valve - V6 engines often use 4 valves per cylinder for better breathing.',
        'V6_Valve_Mesh_3': 'Second exhaust valve - improves exhaust flow for increased performance.',
        'V6_Valve_Cover': 'V6 valve cover - seals the top of the cylinder head, protecting camshaft and valve train.',
        'V6_Intake_Manifold_Mesh': 'V6 intake manifold - distributes air-fuel mixture evenly to all 6 cylinders.',
        'V6_Intake_Manifold_Mesh_1': 'Intake manifold plenum - large chamber that stores air for instant throttle response.',
        'V6_Intake_Manifold_Mesh_2': 'Intake manifold runner - individual tube directing airflow to each cylinder.',
        'V6_Intake_Manifold_Mesh_3': 'Intake manifold throttle body mount. Where the throttle body connects to control airflow.',
        'V6_Intake_Manifold_Mesh_4': 'Intake manifold sensor mount for MAP, IAT, and other engine sensors.',
        'V6_Intake_Manifold_Gasket': 'Intake manifold gasket - seals the joint between intake manifold and cylinder heads.',
        'V6_Exhaust_Manifold_Left': 'Left exhaust manifold - collects exhaust from left bank cylinders and routes to exhaust system.',
        'V6_Exhaust_Manifold_Right': 'Right exhaust manifold - collects exhaust from right bank cylinders. Made of cast iron for heat resistance.',
        'V6_Exhaust_Gasket_Left': 'Left exhaust manifold gasket - seals the connection between manifold and cylinder head.',
        'V6_Exhaust_Gasket_Right': 'Right exhaust manifold gasket - prevents exhaust leaks at high temperatures.',
        'V6_Head_Gasket_Left': 'Left head gasket - seals combustion chambers and prevents coolant/oil mixing between head and block.',
        'V6_Head_Gasket_Right': 'Right head gasket - critical seal that must withstand high compression and temperature.',
        'V6_Gasket_Set': 'Complete engine gasket set including head gaskets, manifold gaskets, and valve cover gaskets.',
        'V6_Head_Bolt_01': 'Cylinder head bolt 1 - torque-to-yield bolt that clamps head to block at specific tension.',
        'V6_Head_Bolt_02': 'Cylinder head bolt 2 - must be tightened in correct sequence to ensure even clamping.',
        'V6_Head_Bolt_03': 'Cylinder head bolt 3 - critical fastener preventing head gasket failure.',
        'V6_Head_Bolt_04': 'Cylinder head bolt 4 - expands when torqued to maintain clamping force.',
        'V6_Head_Bolt_05': 'Cylinder head bolt 5 - part of the bolt pattern securing the cylinder head.',
        'V6_Head_Bolt_06': 'Cylinder head bolt 6 - replaced during head gasket service.',
        'V6_Head_Bolt_07': 'Cylinder head bolt 7 - requires specific torque and angle during installation.',
        'V6_Head_Bolt_08': 'Cylinder head bolt 8 - helps seal the combustion chamber and coolant passages.',
        'V6_Head_Bolt_09': 'Cylinder head bolt 9 - final bolt in the head bolt torque sequence.',
        'V6_Oil_Pan': 'V6 oil pan - reservoir holding 5-6 quarts of engine oil. Contains oil pickup and drain plug.',
        'V6_Oil_Filter': 'V6 oil filter - removes contaminants from engine oil. Replace every oil change.',
        'V6_Timing_Belt': 'V6 timing belt - synchronizes crankshaft and camshaft rotation for proper valve timing.',
        'V6_Accessory_Mount_Mesh': 'Engine accessory mounting bracket - supports alternator, A/C compressor, and power steering pump.',
        'V6_Accessory_Mount_Mesh_1': 'Upper accessory bracket section providing support and adjustment for accessories.',
        'V6_Accessory_Mount_Mesh_2': 'Lower accessory bracket section with mounting points for belt-driven components.',
        'V6_Bracket_Mesh_09': 'Engine support bracket - structural component connecting engine to motor mounts.',
        'V6_Bracket_Mesh_09_1': 'Alternator mounting bracket - positions and secures the alternator to the engine.',
        'V6_Bracket_Mesh_09_2': 'Power steering pump bracket - holds the pump in position for belt alignment.',
        'V6_Bracket_Mesh_09_3': 'Idler pulley bracket - supports the serpentine belt tensioner and idler.',
        'V6_Bracket_Mesh_09_4': 'A/C compressor bracket - mounts the air conditioning compressor to the engine.',
        'V6_Bracket_Mesh_09_5': 'Belt tensioner bracket - maintains proper tension on the serpentine belt.',
        'V6_Bracket_Mesh_09_6': 'Accessory drive bracket - part of the front accessory drive system.',
        // Generic engine parts
        'Engine_Block': 'Main housing of the engine containing cylinders, water jacket, and oil passages.',
        'Cylinder_Head': 'Top of engine containing valves, spark plugs, and combustion chambers.',
        'Piston': 'Moves up and down in cylinder during combustion. Equipped with rings to seal gases and oil.',
        'Crankshaft': 'Converts piston reciprocating motion into rotational motion for the drivetrain.',
        'Camshaft': 'Rotating shaft with lobes controlling valve timing. Critical for engine breathing.',
        'Valve_Cover': 'Protective cover sealing the top of cylinder head over the valve train.',
        'Intake_Manifold': 'Distributes air-fuel mixture to each cylinder for combustion.',
        'Exhaust_Manifold': 'Collects exhaust gases from cylinders and routes to catalytic converter.',
        'Timing_Cover': 'Protects timing chain/belt from debris and contains timing marks for engine service.',
        'Oil_Pan': 'Bottom reservoir holding engine oil. Contains drain plug for oil changes.',
        'Starter': 'Electric motor that cranks the engine to start combustion.',


        // ============ TRANSMISSION SYSTEM (All actual model parts) ============
        'c_stick_shift_(loose_mesh)_2': 'Gear shift lever - driver-operated stick for selecting transmission gears. Connects to shift linkage.',
        'c_component#5_4': 'Transmission main case - aluminum housing containing the gear train, shift mechanism, and bearings.',
        'c_component#5_4_1': 'Transmission extension housing - rear section containing the output shaft and speedometer drive.',
        'c_component#5_4_2': 'Bell housing - front section connecting transmission to engine. Houses clutch or torque converter.',
        'g_cylinder_7': 'Input shaft - splined shaft receiving power from the clutch disc. Drives the countershaft gears.',
        'g_cylinder_7_1': 'Input shaft bearing - supports the input shaft at the front of the transmission.',
        'g_cylinder_7_2': 'Input shaft pilot bearing - centers the input shaft in the crankshaft.',
        'g_cylinder_8': 'Output shaft - main shaft carrying the driven gears. Transfers power to the driveshaft.',
        'g_cylinder_8_1': 'Output shaft front bearing - supports the output shaft at the front.',
        'g_cylinder_8_2': 'Output shaft rear bearing - supports the output shaft at the extension housing.',
        'g_cylinder_8_3': 'Output shaft seal - prevents fluid leakage where the shaft exits the transmission.',
        'g_object_11': 'Countershaft assembly - auxiliary shaft with fixed gears meshing with output shaft gears.',
        'g_object_22': 'First gear - largest driven gear providing maximum torque for starting. Ratio about 3.5:1.',
        'g_object_22_1': 'First gear synchronizer hub - allows smooth engagement of first gear.',
        'g_object_24': 'Second gear - provides strong acceleration after first gear. Ratio about 2:1.',
        'g_object_24_1': 'Second gear synchronizer ring - brass ring matching gear speed to shaft speed.',
        'g_object_24_2': 'Third gear - mid-range gear for city driving. Balanced power and economy.',
        'g_object_24_3': 'Third gear synchronizer hub - hub assembly for 3rd/4th gear selection.',
        'g_object_24_4': 'Fourth gear - often direct drive (1:1 ratio) for highway cruising.',
        'g_object_24_5': 'Fourth gear synchronizer sleeve - slides to engage fourth gear.',
        'g_object_24_6': 'Fifth gear - overdrive gear reducing engine RPM for fuel economy. Ratio about 0.8:1.',
        'g_object_24_7': 'Fifth gear synchronizer - allows smooth upshift to overdrive.',
        'g_object_24_8': 'Fifth gear bearing - supports the fifth gear at the rear of the mainshaft.',
        'g_object_25': 'Reverse idler gear - intermediate gear allowing backward rotation for reverse.',
        'g_object_25_1': 'Reverse idler shaft - supports the reverse idler gear.',
        'g_object_25_2': 'Reverse gear - engaged through the idler to reverse output rotation.',
        'g_object_26': 'Shift fork - 1st/2nd - slides the synchronizer sleeve to select first or second gear.',
        'g_object_26_1': 'Shift fork - 3rd/4th - moves the synchronizer for third and fourth gear selection.',
        'g_object_26_2': 'Shift fork - 5th/reverse - controls fifth gear and reverse gear engagement.',
        'g_object_28': 'Synchronizer assembly - matches shaft speeds for smooth, clash-free shifting.',
        'g_object_28_1': 'Synchronizer hub - splined to the shaft, carries the sleeve and keys.',
        'g_object_28_2': 'Synchronizer sleeve - outer ring that slides to lock gear to shaft.',
        'g_object_28_3': 'Synchronizer keys - spring-loaded keys pressing the blocker ring against the gear cone.',
        'g_object_28_4': 'Blocker ring - brass friction ring that synchronizes gear and shaft speeds.',
        'g_object_28_5': 'Synchronizer spring - provides tension for the keys against the blocker ring.',
        'g_object_28_6': 'Gear cone - tapered surface on the gear that contacts the blocker ring.',
        'g_object_28_7': 'Detent ball - spring-loaded ball holding the shift rail in position.',
        'g_object_28_8': 'Shift rail - rod connecting the shift lever to the shift forks.',
        'g_object_28_9': 'Interlock plate - prevents selecting two gears simultaneously.',
        'g_object_28_10': 'Shift lever pivot - fulcrum point for the gear shift lever.',
        'g_object_28_11': 'Shift boot seal - rubber seal preventing dirt entry at the shift lever.',
        'g_object_8': 'Clutch release bearing - also called throw-out bearing. Disengages the clutch when pedal is pressed.',
        'g_object_(loose_mesh)_3': 'Transmission mount - rubber isolator reducing vibration transfer to the chassis.',
        // Generic transmission parts
        'Transmission_Case': 'Main housing containing all gears, shafts, and synchronizers.',
        'Transmission': 'Gearbox that transfers power from engine to wheels at various speed ratios.',
        'Bell_Housing': 'Connects transmission to engine and houses clutch or torque converter.',
        'Gear_Set': 'Collection of gears providing different speed ratios for driving conditions.',
        'Input_Shaft': 'Receives power from engine via clutch. First shaft in power flow.',
        'Output_Shaft': 'Delivers power to driveshaft. Connected to differential.',
        'Clutch': 'Friction disc connecting/disconnecting engine from transmission for gear changes.',
        'Clutch_Disc': 'Friction plate that engages with flywheel to transmit engine power.',
        'Flywheel': 'Heavy disc storing rotational energy. Smooths power delivery from engine.',
        'Torque_Converter': 'Fluid coupling in automatic transmissions. Multiplies torque at low speeds.',

        // ============ ADDITIONAL COMMON PARTS ============
        'Fuse_Box': 'Central location for circuit protection fuses. Protects electrical systems.',
        'Fuses': 'Circuit protection devices that break connection when overloaded.',
        'Wiring_Harness': 'Bundle of wires connecting all electrical components throughout the vehicle.',
        'Wiring': 'Electrical wires transmitting power and signals throughout the vehicle.',
        'ECU': 'Engine Control Unit - computer brain managing fuel injection and ignition timing.',
        'Headlight': 'Front lighting assembly for night visibility. May include low/high beam and signals.',
        'Taillight': 'Rear lighting assembly including brake lights, reverse lights, and turn signals.',
    };

    // If exact match not found, try replacing underscores with spaces
    if (!descriptions[partName]) {
        const spacedName = partName.replace(/_/g, ' ');
        if (descriptions[spacedName]) {
            return descriptions[spacedName];
        }
    }

    return descriptions[partName] || `${partName} - Automotive component. (Description coming soon)`;
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
