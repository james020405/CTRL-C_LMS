/**
 * Chain Reaction Data
 * Scenarios for the System Chain Reaction game
 * Teaches how failures in one system cascade to affect others
 */

export const CHAIN_REACTION_SCENARIOS = {
    easy: [
        {
            id: 'thermostat_stuck_open',
            primaryFailure: 'Thermostat stuck OPEN',
            affectedSystem: 'Cooling System',
            scenario: 'A customer complains that their heater is blowing cold air and their fuel economy has dropped significantly.',
            chainEffect: 'Engine runs cold → Heater blows cold air → ECU keeps engine in rich mode → Poor fuel economy',
            wrongEffects: [
                'Engine overheats → Head gasket fails → Coolant mixes with oil',
                'AC compressor overworks → AC stops cooling → Belt squeals',
                'Battery drains faster → Electrical systems fail → No start condition'
            ],
            explanation: 'When the thermostat is stuck open, coolant flows constantly through the radiator. The engine never reaches optimal operating temperature (around 90°C), which means: the heater core doesn\'t get hot coolant (cold air), and the ECU thinks the engine is still warming up, keeping the fuel mixture rich (poor fuel economy).',
            systems: ['Cooling', 'HVAC', 'Fuel System']
        },
        {
            id: 'serpentine_belt_worn',
            primaryFailure: 'Serpentine belt slipping',
            affectedSystem: 'Belt Drive System',
            scenario: 'A vehicle makes a squealing noise on startup, the battery light occasionally flickers, and AC is weak.',
            chainEffect: 'Belt slips → Alternator undercharges → Power steering pump struggles → AC compressor slips',
            wrongEffects: [
                'Engine misfires → Catalytic converter overheats → Emissions fail',
                'Transmission overheats → Harsh shifting → Limp mode activates',
                'Fuel pump fails → Engine stalls → Injectors get damaged'
            ],
            explanation: 'The serpentine belt drives multiple accessories: alternator, power steering pump, AC compressor, and water pump. When it slips, all these systems receive inconsistent power. The squealing is the belt losing grip, the flickering battery light indicates alternator output issues, and the weak AC is due to inconsistent compressor operation.',
            systems: ['Electrical', 'Steering', 'AC', 'Cooling']
        },
        {
            id: 'battery_weak',
            primaryFailure: 'Weak/dying battery',
            affectedSystem: 'Electrical System',
            scenario: 'The vehicle is slow to crank, headlights dim at idle, and the radio resets when starting the car.',
            chainEffect: 'Low battery voltage → ECU gets unstable power → Sensors give erratic readings → Check engine light',
            wrongEffects: [
                'Engine runs hot → Radiator fan fails → Overheating occurs',
                'Transmission slips → Torque converter locks up → Stalling',
                'Brake booster fails → Hard brake pedal → Longer stopping distance'
            ],
            explanation: 'Modern vehicles rely heavily on stable voltage. A weak battery causes voltage drops during high-demand situations (cranking, idle with loads). This affects the ECU\'s ability to properly read sensors and control the engine, causing erratic behavior and possible warning lights.',
            systems: ['Electrical', 'Engine Management', 'Accessories']
        },
        {
            id: 'air_filter_clogged',
            primaryFailure: 'Severely clogged air filter',
            affectedSystem: 'Air Intake System',
            scenario: 'The engine feels sluggish, fuel economy has dropped, and there\'s black smoke from the exhaust on acceleration.',
            chainEffect: 'Restricted air → Engine runs rich → Incomplete combustion → Carbon buildup on spark plugs',
            wrongEffects: [
                'Turbo overspeeds → Wastegate fails → Boost pressure too high',
                'Coolant mixes with fuel → Head gasket blown → Engine seizes',
                'Transmission hunts for gears → Clutch slips → Burning smell'
            ],
            explanation: 'When airflow is restricted, the engine can\'t get enough air for proper combustion. The ECU adds fuel based on expected air, but less air means a rich mixture. This causes incomplete combustion (black smoke), wasted fuel (poor economy), and eventually fouls spark plugs with carbon deposits.',
            systems: ['Air Intake', 'Fuel System', 'Ignition', 'Emissions']
        },
        {
            id: 'low_coolant',
            primaryFailure: 'Low coolant level',
            affectedSystem: 'Cooling System',
            scenario: 'The temperature gauge reads higher than normal, heater performance is inconsistent, and there\'s a gurgling sound from the dashboard.',
            chainEffect: 'Low coolant → Air pockets form → Heater core gets air → Temperature spikes when air passes sensor',
            wrongEffects: [
                'AC refrigerant leaks → Compressor seizes → Belt breaks',
                'Oil pressure drops → Rod bearings knock → Engine failure',
                'Fuel injectors clog → Lean misfire → Catalytic converter damage'
            ],
            explanation: 'When coolant is low, air gets into the system. Air pockets cause inconsistent flow through the heater core (variable heat) and can pass by the temperature sensor causing momentary high readings. The gurgling sound is air moving through the heater core behind the dashboard.',
            systems: ['Cooling', 'HVAC', 'Engine']
        }
    ],
    medium: [
        {
            id: 'vacuum_leak',
            primaryFailure: 'Vacuum leak in intake manifold',
            affectedSystem: 'Engine/Intake System',
            scenario: 'The engine has a rough idle that smooths out at higher RPM, fuel economy is poor, and there\'s a check engine light with lean codes.',
            chainEffect: 'Unmetered air enters → MAF reading wrong vs actual air → Lean condition → Idle instability → Possible misfire',
            wrongEffects: [
                'Exhaust leak → O2 sensor reads wrong → Rich condition → Black smoke',
                'Fuel pump dying → Low pressure → Stalling under load → Overheating',
                'Timing belt stretched → Valve timing off → Backfiring → No power'
            ],
            explanation: 'A vacuum leak allows unmetered air into the engine after the MAF sensor. The ECU doesn\'t know about this extra air, so it doesn\'t add fuel to compensate. This creates a lean condition (P0171/P0174 codes). The effect is worse at idle because the leak represents a larger percentage of total airflow at low RPM.',
            systems: ['Intake', 'Fuel System', 'Engine Management', 'Emissions']
        },
        {
            id: 'failing_fuel_pump',
            primaryFailure: 'Fuel pump losing pressure',
            affectedSystem: 'Fuel System',
            scenario: 'The vehicle hesitates during hard acceleration, surges at highway speeds, and occasionally stalls when coming to a stop.',
            chainEffect: 'Low fuel pressure → Lean condition under load → O2 sensor compensates → ECU adjusts trims → Eventually overwhelmed',
            wrongEffects: [
                'Alternator overcharges → Battery swells → Electrical shorts → Fire risk',
                'Power steering rack leaks → Low fluid → Pump whines → Steering failure',
                'Brake master cylinder fails → Soft pedal → ABS activates constantly'
            ],
            explanation: 'A weak fuel pump can\'t maintain pressure under high demand (acceleration, sustained highway speeds). The engine goes lean during these times. The O2 sensors detect this and the ECU adds fuel trim, but eventually the pump can\'t keep up. At idle, fuel demand is low enough that the weak pump can cope, but when you stop, residual pressure may be too low for restart.',
            systems: ['Fuel System', 'Engine Management', 'Emissions']
        },
        {
            id: 'worn_cv_joint',
            primaryFailure: 'Torn CV boot / worn CV joint',
            affectedSystem: 'Drivetrain',
            scenario: 'There\'s a clicking noise when turning, a vibration at highway speeds, and grease splatter visible on the inner fender.',
            chainEffect: 'Torn boot → Grease escapes → Dirt enters joint → Accelerated wear → Clicking → Eventually joint fails',
            wrongEffects: [
                'Transmission mount broken → Vibration → Shifter shakes → Hard shifting',
                'Wheel bearing failing → Humming noise → ABS fault → Traction control issues',
                'Exhaust heat shield loose → Rattling → Carpet burns → Fire risk'
            ],
            explanation: 'The CV boot keeps lubricating grease in and dirt out. When it tears, the grease slings out (visible splatter) and contaminants enter. The CV joint then wears rapidly, causing the clicking sound that\'s most noticeable in turns (when the joint is at maximum angle). Left unchecked, the joint will eventually fail completely.',
            systems: ['Drivetrain', 'Steering', 'Suspension']
        },
        {
            id: 'egr_stuck_open',
            primaryFailure: 'EGR valve stuck open',
            affectedSystem: 'Emissions System',
            scenario: 'The engine idles rough and may stall, there\'s noticeable hesitation from a stop, and the check engine light is on.',
            chainEffect: 'Excessive exhaust gas at idle → Displaces fresh air → Poor combustion → Rough idle → Carbon buildup → More sticking',
            wrongEffects: [
                'Turbo wastegate stuck → Overboost → Engine knock → Piston damage',
                'Fuel pressure regulator failed → Flooding → Hydrolocked engine',
                'Timing chain jumped → Bent valves → No compression → No start'
            ],
            explanation: 'The EGR valve is supposed to open only under specific conditions to reduce NOx emissions. When stuck open, exhaust gas constantly enters the intake, displacing fresh oxygen-rich air. This is most noticeable at idle and low-load conditions where the exhaust gas represents a larger percentage of the intake charge.',
            systems: ['Emissions', 'Intake', 'Engine', 'Fuel System']
        },
        {
            id: 'bad_wheel_bearing',
            primaryFailure: 'Failing wheel bearing',
            affectedSystem: 'Suspension/Drivetrain',
            scenario: 'There\'s a humming noise that changes with speed, the ABS light is on, and the tire on one side is wearing unevenly.',
            chainEffect: 'Bearing wear → Wheel wobble → ABS tone ring gap changes → False ABS readings → Uneven tire wear',
            wrongEffects: [
                'Brake rotor warped → Pulsating pedal → Caliper sticks → Overheating',
                'Control arm bushing torn → Clunking → Steering wander → Front end shakes',
                'Shock absorber blown → Bouncing → Tire cupping → Noise on bumps'
            ],
            explanation: 'A failing wheel bearing causes the wheel hub to have play. This affects the ABS sensor which relies on precise distance from the tone ring. The bearing noise sounds like a hum or drone that changes with speed. The play in the bearing also causes the wheel to not sit perfectly straight, leading to uneven tire wear.',
            systems: ['Suspension', 'Brakes', 'ABS', 'Tires']
        }
    ],
    hard: [
        {
            id: 'serpentine_snapped',
            primaryFailure: 'Serpentine belt suddenly breaks',
            affectedSystem: 'Accessory Drive',
            scenario: 'While driving, the battery light comes on, power steering becomes very heavy, the temperature gauge starts rising, and the AC stops working.',
            chainEffect: 'Belt breaks → Alternator stops (battery light) → Water pump stops (overheating) → Power steering pump stops (heavy steering) → AC compressor stops',
            wrongEffects: [
                'Only the AC stops working, other systems are fine',
                'Engine stalls immediately and won\'t restart',
                'Transmission goes into limp mode, all other systems normal'
            ],
            explanation: 'The serpentine belt drives ALL accessories simultaneously: alternator, water pump, power steering pump, and AC compressor. When it breaks, you have minutes before overheating damages the engine and the battery depletes. You must pull over immediately and shut off the engine.',
            systems: ['Electrical', 'Cooling', 'Steering', 'AC']
        },
        {
            id: 'head_gasket_failing',
            primaryFailure: 'Head gasket beginning to fail',
            affectedSystem: 'Engine',
            scenario: 'The engine overheats in traffic but is fine at highway speeds, there\'s white smoke on cold starts that clears up, and coolant level slowly drops with no visible leak.',
            chainEffect: 'Gasket leaks internally → Coolant enters combustion chamber → White smoke → Coolant loss → Overheating → More gasket damage → Eventually hydrolock risk',
            wrongEffects: [
                'Oil enters fuel system → Black smoke → Catalytic converter melts → Fire',
                'Exhaust enters transmission → Fluid foams → Slipping → Total failure',
                'Brake fluid absorbs into coolant → Soft brakes → Master cylinder fails'
            ],
            explanation: 'A head gasket can fail internally between a coolant passage and a cylinder. Coolant seeps into the combustion chamber and burns as white smoke. It\'s worse on cold starts because the engine hasn\'t fully expanded to temporarily seal the gap. In traffic, less airflow means less cooling. At highway speeds, more airflow compensates for the compromised cooling system. This is a progressive failure that gets worse.',
            systems: ['Engine', 'Cooling', 'Exhaust', 'Emissions']
        },
        {
            id: 'timing_chain_stretched',
            primaryFailure: 'Timing chain has stretched',
            affectedSystem: 'Engine/Valvetrain',
            scenario: 'The engine rattles on cold starts, there\'s a slight loss of power, fuel economy has decreased, and there might be a check engine light for cam/crank correlation.',
            chainEffect: 'Chain stretches → Valve timing retards slightly → VVT system can\'t compensate → P0016/P0017 codes → Poor performance → Eventually chain can jump',
            wrongEffects: [
                'Transmission shifts early → Poor acceleration → Limp mode',
                'Fuel pump timing off → Lean surge → Detonation → Piston damage',
                'Alternator rotor drags → High electrical load → Battery overheats'
            ],
            explanation: 'As a timing chain wears, it lengthens. This retards the camshaft timing relative to the crankshaft. The engine computer monitors both positions, and if they drift too far apart, it sets correlation codes (P0016/P0017). The rattling on cold starts is the loose chain slapping before oil pressure builds up to tension it. If left unchecked, the chain can jump teeth and cause severe engine damage.',
            systems: ['Engine', 'Valvetrain', 'Fuel System', 'Engine Management']
        },
        {
            id: 'transmission_overheating',
            primaryFailure: 'Transmission fluid overheating',
            affectedSystem: 'Transmission',
            scenario: 'The transmission slips during hard acceleration, shifts are becoming harsh, there\'s a burning smell when stopped, and the trans temp warning appears when towing.',
            chainEffect: 'Fluid overheats → Friction material glazes → Clutches slip → More heat generated → Fluid breaks down → Varnish forms → Valve body sticks → Erratic shifting',
            wrongEffects: [
                'Engine overheats first → Radiator fails → Coolant leaks → Hydrolock',
                'Differential fails → Rear wheels lock → Loss of control → Crash',
                'Exhaust manifold cracks → Fumes enter cabin → CO poisoning risk'
            ],
            explanation: 'Transmission fluid cools, lubricates, and provides hydraulic pressure. When it overheats, it breaks down chemically. The clutch friction materials glaze (become smooth), causing slipping which generates more heat. The degraded fluid can\'t protect components or maintain proper pressure, leading to harsh or erratic shifts. This is a cascading failure that accelerates.',
            systems: ['Transmission', 'Cooling', 'Drivetrain']
        },
        {
            id: 'multiple_misfires',
            primaryFailure: 'Multiple cylinder misfires (P0300)',
            affectedSystem: 'Engine/Ignition',
            scenario: 'The engine shakes badly at idle, there\'s significant power loss, the check engine light is flashing, and there\'s a strong fuel smell from the exhaust.',
            chainEffect: 'Misfires → Unburnt fuel enters exhaust → Catalytic converter overheats → Substrate melts → Exhaust restriction → More misfires → Cat failure',
            wrongEffects: [
                'Misfires → Vibration breaks motor mounts → Transmission input shaft bends',
                'Misfires → Fuel dilutes oil → Rod bearings fail → Engine seizes',
                'Misfires → Backfire ignites air filter → Engine bay fire'
            ],
            explanation: 'When cylinders misfire, unburnt fuel passes into the exhaust system. This fuel ignites in the hot catalytic converter, causing it to overheat (potentially glowing red). A flashing check engine light indicates active catalyst damage is occurring. The melting catalyst substrate restricts exhaust flow, making the engine run worse, creating a destructive feedback loop. Pull over and shut off immediately.',
            systems: ['Ignition', 'Fuel System', 'Emissions', 'Exhaust']
        }
    ]
};

/**
 * Get a random chain reaction scenario
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {Object} Scenario object
 */
export const getChainReactionScenario = (difficulty = 'easy') => {
    const scenarios = CHAIN_REACTION_SCENARIOS[difficulty] || CHAIN_REACTION_SCENARIOS.easy;
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

    // Shuffle options
    const options = [
        { id: 'correct', text: scenario.chainEffect, isCorrect: true },
        ...scenario.wrongEffects.map((effect, i) => ({ id: `wrong${i}`, text: effect, isCorrect: false }))
    ];

    // Fisher-Yates shuffle
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }

    // Re-assign IDs after shuffle
    options.forEach((opt, idx) => {
        opt.id = `option${idx + 1}`;
    });

    return {
        ...scenario,
        options
    };
};

export default CHAIN_REACTION_SCENARIOS;
