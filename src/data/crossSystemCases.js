// Cross-System Detective Cases
// Problems that appear in one system but are caused by another

export const crossSystemCases = {
    easy: [
        {
            id: 'cs-easy-1',
            title: 'AC Stops Working in Traffic',
            symptomSystem: 'AC/Climate Control',
            rootCauseSystem: 'Cooling System',
            customerComplaint: 'Yung aircon ko, kapag naka-traffic, biglang hindi na lumalamig. Pag mabilis naman takbo, okay.',
            vehicleInfo: '2017 Toyota Vios, 65,000 km',
            symptomDescription: 'AC cuts out during slow traffic or idle, works fine at highway speeds',
            clues: [
                { id: 1, text: 'AC refrigerant pressure: Normal (within spec)', system: 'AC' },
                { id: 2, text: 'AC compressor clutch: Engaging correctly', system: 'AC' },
                { id: 3, text: 'Engine temperature gauge: Creeping towards hot in traffic', system: 'Cooling' },
                { id: 4, text: 'Radiator fan: Not spinning at idle when AC is on', system: 'Cooling' },
                { id: 5, text: 'Coolant level: Slightly low', system: 'Cooling' },
            ],
            options: [
                { id: 'ac_compressor', label: 'Faulty AC Compressor', description: 'Compressor failing under load', isCorrect: false },
                { id: 'low_refrigerant', label: 'Low Refrigerant', description: 'AC system needs recharge', isCorrect: false },
                { id: 'radiator_fan', label: 'Radiator Fan Motor Failure', description: 'Fan not cooling engine at idle, triggering AC cutoff protection', isCorrect: true },
                { id: 'clogged_condenser', label: 'Clogged AC Condenser', description: 'Restricted airflow through condenser', isCorrect: false },
            ],
            explanation: 'The AC system has a safety feature that cuts off the compressor when engine temperature gets too high. The radiator fan motor has failed, so at idle/low speeds (no airflow), the engine overheats and triggers this cutoff. At highway speeds, natural airflow keeps the engine cool enough.',
            systemConnection: 'Cooling System → Engine Temperature → AC Safety Cutoff → AC System',
            correctParts: ['Radiator Fan Motor', 'Coolant Top-up'],
            difficulty: 'easy'
        },
        {
            id: 'cs-easy-2',
            title: 'Hard Starting in the Morning',
            symptomSystem: 'Starting/Ignition',
            rootCauseSystem: 'Fuel System',
            customerComplaint: 'Mahirap i-start yung kotse pag umaga, kailangan ko i-crank ng matagal. Pag mainit na, okay naman.',
            vehicleInfo: '2015 Mitsubishi Mirage, 80,000 km',
            symptomDescription: 'Engine cranks long before starting when cold, starts immediately when warm',
            clues: [
                { id: 1, text: 'Battery: Fully charged, cranking strong', system: 'Electrical' },
                { id: 2, text: 'Starter motor: Good condition, no unusual noises', system: 'Starting' },
                { id: 3, text: 'Fuel smell: Slight gasoline odor near engine after failed start attempts', system: 'Fuel' },
                { id: 4, text: 'Fuel pressure: Drops to zero after sitting overnight', system: 'Fuel' },
                { id: 5, text: 'Spark plugs: Normal condition, good spark', system: 'Ignition' },
            ],
            options: [
                { id: 'weak_battery', label: 'Weak Battery', description: 'Battery losing charge overnight', isCorrect: false },
                { id: 'bad_starter', label: 'Worn Starter Motor', description: 'Starter not cranking properly when cold', isCorrect: false },
                { id: 'fuel_injector_leak', label: 'Leaking Fuel Injector', description: 'Fuel draining back into tank overnight, requiring long crank to re-pressurize', isCorrect: true },
                { id: 'bad_spark_plugs', label: 'Fouled Spark Plugs', description: 'Spark plugs not firing properly when cold', isCorrect: false },
            ],
            explanation: 'A leaking fuel injector allows fuel to drain back into the tank overnight. When you try to start in the morning, the fuel pump needs extra time to re-pressurize the fuel rail. Once the engine is warm and running, the fuel system stays pressurized between short stops.',
            systemConnection: 'Fuel Injector Leak → Fuel Pressure Loss → Extended Cranking → Appears as Starting Problem',
            correctParts: ['Fuel Injector', 'Fuel Injector O-rings'],
            difficulty: 'easy'
        },
        {
            id: 'cs-easy-3',
            title: 'Engine Overheating at Highway Speed',
            symptomSystem: 'Cooling System',
            rootCauseSystem: 'AC System',
            customerComplaint: 'Umiinit yung engine pag matagal sa highway, pero okay lang sa city driving.',
            vehicleInfo: '2016 Honda City, 70,000 km',
            symptomDescription: 'Engine temperature rises after extended highway driving, normal in city traffic',
            clues: [
                { id: 1, text: 'Coolant level: Full, no leaks visible', system: 'Cooling' },
                { id: 2, text: 'Thermostat: Opens at correct temperature', system: 'Cooling' },
                { id: 3, text: 'Radiator cap: Holds proper pressure', system: 'Cooling' },
                { id: 4, text: 'AC condenser: Heavy debris and bugs blocking airflow', system: 'AC' },
                { id: 5, text: 'Radiator fins: Slightly bent in places', system: 'Cooling' },
            ],
            options: [
                { id: 'bad_thermostat', label: 'Stuck Thermostat', description: 'Thermostat not opening fully', isCorrect: false },
                { id: 'water_pump', label: 'Weak Water Pump', description: 'Water pump not circulating coolant properly', isCorrect: false },
                { id: 'clogged_condenser', label: 'Debris-Clogged AC Condenser', description: 'Blocked condenser reducing airflow to radiator behind it', isCorrect: true },
                { id: 'head_gasket', label: 'Blown Head Gasket', description: 'Combustion gases entering cooling system', isCorrect: false },
            ],
            explanation: 'The AC condenser is mounted in front of the radiator. When it\'s clogged with debris, it blocks the airflow that the radiator needs. At highway speeds, this restricted airflow causes overheating. In city driving, the radiator fan provides enough cooling.',
            systemConnection: 'AC Condenser Blockage → Reduced Airflow → Radiator Can\'t Cool → Engine Overheating',
            correctParts: ['Condenser Cleaning', 'Radiator Fin Straightening'],
            difficulty: 'easy'
        },
    ],
    medium: [
        {
            id: 'cs-med-1',
            title: 'Vibration at Highway Speed',
            symptomSystem: 'Suspension/Steering',
            rootCauseSystem: 'Drivetrain',
            customerComplaint: 'May vibration sa steering wheel pag naka-100 kph. Akala ko gulong, pero pinalitan ko na, vibrate pa rin.',
            vehicleInfo: '2016 Honda CR-V AWD, 90,000 km',
            symptomDescription: 'Steering wheel vibrates between 90-110 kph, new tires installed but problem persists',
            clues: [
                { id: 1, text: 'Tires: New, properly balanced', system: 'Suspension' },
                { id: 2, text: 'Wheel alignment: Within spec', system: 'Suspension' },
                { id: 3, text: 'Tie rod ends: Tight, no play', system: 'Steering' },
                { id: 4, text: 'CV axle boots: One boot torn, grease visible', system: 'Drivetrain' },
                { id: 5, text: 'Vibration changes: Gets worse during light acceleration', system: 'Drivetrain' },
            ],
            options: [
                { id: 'wheel_balance', label: 'Wheel Balance Issue', description: 'Wheels need rebalancing', isCorrect: false },
                { id: 'tie_rod', label: 'Worn Tie Rod Ends', description: 'Steering components causing vibration', isCorrect: false },
                { id: 'cv_joint', label: 'Worn CV Joint', description: 'Damaged CV joint from torn boot causing drivetrain vibration felt in steering', isCorrect: true },
                { id: 'wheel_bearing', label: 'Bad Wheel Bearing', description: 'Worn bearing causing vibration', isCorrect: false },
            ],
            explanation: 'The torn CV boot allowed grease to escape and dirt to enter, damaging the CV joint. CV joint vibration is transmitted through the drivetrain to the chassis and felt in the steering wheel. The clue is that vibration changes with acceleration, not just speed.',
            systemConnection: 'Torn CV Boot → CV Joint Damage → Drivetrain Vibration → Felt in Steering Wheel',
            correctParts: ['CV Axle Assembly', 'CV Boot Kit'],
            difficulty: 'medium'
        },
        {
            id: 'cs-med-2',
            title: 'Check Engine Light with Poor AC',
            symptomSystem: 'Engine/Emissions',
            rootCauseSystem: 'Electrical System',
            customerComplaint: 'May check engine light tapos parang mahina na rin yung aircon. Di ko alam kung related ba.',
            vehicleInfo: '2018 Hyundai Accent, 55,000 km',
            symptomDescription: 'Check engine light on, AC performance reduced, slight idle fluctuation',
            clues: [
                { id: 1, text: 'OBD Code: P0113 - Intake Air Temperature Sensor High Input', system: 'Engine' },
                { id: 2, text: 'IAT Sensor: Reads -40°C (impossible for Philippines weather)', system: 'Engine' },
                { id: 3, text: 'Sensor connector: Corroded pins visible', system: 'Electrical' },
                { id: 4, text: 'AC magnetic clutch: Intermittently not engaging', system: 'AC' },
                { id: 5, text: 'Ground wire near fender: Loose connection', system: 'Electrical' },
            ],
            options: [
                { id: 'iat_sensor', label: 'Failed IAT Sensor', description: 'Intake air temperature sensor needs replacement', isCorrect: false },
                { id: 'ac_clutch', label: 'AC Clutch Failure', description: 'Magnetic clutch wearing out', isCorrect: false },
                { id: 'ground_issue', label: 'Poor Ground Connection', description: 'Bad ground causing multiple sensor and electrical issues', isCorrect: true },
                { id: 'ecm_problem', label: 'ECM Malfunction', description: 'Engine computer giving false readings', isCorrect: false },
            ],
            explanation: 'A poor ground connection affects multiple systems sharing that ground path. The IAT sensor shows impossible readings because of voltage reference issues. The AC clutch doesn\'t engage properly because the ground for its relay is compromised. Fixing one ground can solve multiple "unrelated" problems.',
            systemConnection: 'Bad Ground → Sensor Voltage Issues → False DTCs + AC Relay Problems → Multiple Symptoms',
            correctParts: ['Ground Wire Terminal', 'Electrical Connector Cleaner'],
            difficulty: 'medium'
        },
        {
            id: 'cs-med-3',
            title: 'Transmission Slipping with Engine Stalling',
            symptomSystem: 'Transmission',
            rootCauseSystem: 'Engine/Vacuum',
            customerComplaint: 'Parang dumudulas yung transmission tapos minsan namamatay pag stop light.',
            vehicleInfo: '2014 Toyota Fortuner, 120,000 km',
            symptomDescription: 'Automatic transmission slips between gears, engine stalls at stops',
            clues: [
                { id: 1, text: 'Transmission fluid: Level correct, color normal', system: 'Transmission' },
                { id: 2, text: 'Transmission codes: None stored', system: 'Transmission' },
                { id: 3, text: 'Idle speed: Fluctuates between 500-900 RPM', system: 'Engine' },
                { id: 4, text: 'Vacuum hose to transmission modulator: Cracked and leaking', system: 'Engine' },
                { id: 5, text: 'Brake booster: Feels harder than normal to press', system: 'Brakes' },
            ],
            options: [
                { id: 'torque_converter', label: 'Worn Torque Converter', description: 'Torque converter clutch slipping', isCorrect: false },
                { id: 'transmission_solenoid', label: 'Bad Shift Solenoid', description: 'Electronic solenoid malfunction', isCorrect: false },
                { id: 'vacuum_leak', label: 'Vacuum Leak at Modulator', description: 'Cracked vacuum hose causing low vacuum to transmission and engine', isCorrect: true },
                { id: 'low_fluid', label: 'Low Transmission Fluid', description: 'Internal leak causing low fluid', isCorrect: false },
            ],
            explanation: 'The cracked vacuum hose causes a vacuum leak that affects both the engine (causing stalling) and the transmission vacuum modulator (causing improper shift timing that feels like slipping). The harder brake pedal also indicates vacuum loss affecting the brake booster.',
            systemConnection: 'Vacuum Leak → Low Engine Vacuum → Affects Transmission Modulator + Engine Idle + Brake Booster',
            correctParts: ['Vacuum Hose', 'Hose Clamps'],
            difficulty: 'medium'
        },
    ],
    hard: [
        {
            id: 'cs-hard-1',
            title: 'Intermittent Power Loss',
            symptomSystem: 'Engine Performance',
            rootCauseSystem: 'Exhaust System',
            customerComplaint: 'Minsan biglang nawawalan ng power yung kotse, lalo na pag ahon. Tapos may amoy na kakaiba.',
            vehicleInfo: '2014 Toyota Innova 2.5D, 150,000 km',
            symptomDescription: 'Random power loss especially under load, unusual smell, sometimes returns to normal',
            clues: [
                { id: 1, text: 'Turbo boost: Lower than spec during power loss episodes', system: 'Engine' },
                { id: 2, text: 'Fuel pressure: Normal', system: 'Fuel' },
                { id: 3, text: 'Air filter: Recently replaced, clean', system: 'Engine' },
                { id: 4, text: 'Exhaust back pressure: Elevated when tested', system: 'Exhaust' },
                { id: 5, text: 'Catalytic converter: Rattling sound when tapped', system: 'Exhaust' },
                { id: 6, text: 'Exhaust color: Slightly darker than normal', system: 'Exhaust' },
            ],
            options: [
                { id: 'turbo_failure', label: 'Turbo Failure', description: 'Turbocharger not producing boost', isCorrect: false },
                { id: 'fuel_pump', label: 'Weak Fuel Pump', description: 'Fuel pump can\'t keep up under load', isCorrect: false },
                { id: 'clogged_cat', label: 'Clogged Catalytic Converter', description: 'Broken substrate blocking exhaust flow, causing back pressure that limits engine power', isCorrect: true },
                { id: 'egr_stuck', label: 'Stuck EGR Valve', description: 'EGR valve stuck open reducing power', isCorrect: false },
            ],
            explanation: 'The catalytic converter substrate has broken apart and is intermittently blocking the exhaust flow. When pieces shift and block more, exhaust back pressure increases dramatically, the turbo can\'t spool properly, and power drops. The rattle confirms loose pieces inside. This is common in high-mileage diesel vehicles.',
            systemConnection: 'Cat Converter Breakdown → Exhaust Blockage → Back Pressure → Turbo Efficiency Loss → Power Loss',
            correctParts: ['Catalytic Converter', 'Exhaust Gaskets'],
            difficulty: 'hard'
        },
        {
            id: 'cs-hard-2',
            title: 'Mysterious Battery Drain',
            symptomSystem: 'Electrical/Battery',
            rootCauseSystem: 'Body Control Module',
            customerComplaint: 'Ang bilis ma-drain ng battery ko kahit bago. Pag iniwan ko ng dalawang araw, patay na.',
            vehicleInfo: '2019 Nissan Navara, 40,000 km',
            symptomDescription: 'New battery drains within 2 days of sitting, no obvious electrical issues',
            clues: [
                { id: 1, text: 'Battery: New, load test passed', system: 'Electrical' },
                { id: 2, text: 'Alternator: Charging at 14.2V, within spec', system: 'Electrical' },
                { id: 3, text: 'Parasitic draw: 850mA (spec: under 50mA)', system: 'Electrical' },
                { id: 4, text: 'After removing fuses one by one: BCM fuse drops draw to 40mA', system: 'Body' },
                { id: 5, text: 'Interior lights: Sometimes stay on briefly after locking', system: 'Body' },
                { id: 6, text: 'Door ajar sensor: Intermittently shows door open when closed', system: 'Body' },
            ],
            options: [
                { id: 'alternator', label: 'Faulty Alternator', description: 'Alternator diode leaking current backwards', isCorrect: false },
                { id: 'aftermarket', label: 'Aftermarket Accessories', description: 'Poorly installed accessories draining battery', isCorrect: false },
                { id: 'bcm_door', label: 'BCM Not Sleeping Due to Door Sensor', description: 'Faulty door sensor keeping BCM awake, preventing system sleep mode', isCorrect: true },
                { id: 'relay_stuck', label: 'Stuck Relay', description: 'A relay staying energized when it shouldn\'t', isCorrect: false },
            ],
            explanation: 'The faulty door ajar sensor intermittently tells the Body Control Module that a door is open. The BCM stays "awake" waiting for the door to close, preventing the vehicle from entering deep sleep mode. This keeps multiple modules powered, causing the excessive 850mA parasitic draw instead of the normal 50mA.',
            systemConnection: 'Door Sensor Fault → BCM Stays Awake → All Modules Stay Powered → Excessive Battery Drain',
            correctParts: ['Door Ajar Switch', 'Door Jamb Wiring Repair'],
            difficulty: 'hard'
        },
        {
            id: 'cs-hard-3',
            title: 'Random ABS Activation on Dry Road',
            symptomSystem: 'Brakes/ABS',
            rootCauseSystem: 'Wheel Speed Sensor',
            customerComplaint: 'Yung ABS ko, minsan nag-a-activate kahit dry ang kalsada. Nakakatakot.',
            vehicleInfo: '2017 Mazda 3, 85,000 km',
            symptomDescription: 'ABS activates randomly during normal braking on dry pavement',
            clues: [
                { id: 1, text: 'ABS light: Occasionally flashing during braking', system: 'Brakes' },
                { id: 2, text: 'Brake pads and rotors: Good condition', system: 'Brakes' },
                { id: 3, text: 'Wheel speed sensor readings: Left rear shows erratic values', system: 'ABS' },
                { id: 4, text: 'Tone ring (reluctor): Visible rust and debris buildup', system: 'ABS' },
                { id: 5, text: 'Wheel bearing: Slight play detected', system: 'Suspension' },
                { id: 6, text: 'CV axle: Normal operation', system: 'Drivetrain' },
            ],
            options: [
                { id: 'abs_module', label: 'Faulty ABS Module', description: 'ABS computer malfunctioning', isCorrect: false },
                { id: 'brake_fluid', label: 'Contaminated Brake Fluid', description: 'Air or moisture in brake lines', isCorrect: false },
                { id: 'wheel_bearing_sensor', label: 'Worn Wheel Bearing Affecting Sensor', description: 'Loose bearing causes inconsistent gap between sensor and tone ring', isCorrect: true },
                { id: 'master_cylinder', label: 'Failing Master Cylinder', description: 'Internal leak causing pressure loss', isCorrect: false },
            ],
            explanation: 'The worn wheel bearing allows the hub to move slightly, changing the gap between the wheel speed sensor and tone ring. This creates erratic speed readings that the ABS interprets as a wheel locking up, triggering unwanted ABS activation. The rust on the tone ring compounds the problem.',
            systemConnection: 'Wheel Bearing Wear → Inconsistent Sensor Gap → Erratic Speed Signal → False ABS Activation',
            correctParts: ['Wheel Bearing Hub Assembly', 'Wheel Speed Sensor'],
            difficulty: 'hard'
        },
    ]
};

// Track used cases to prevent repetition
const usedCases = {
    easy: [],
    medium: [],
    hard: []
};

// Try to load history from sessionStorage
try {
    const saved = sessionStorage.getItem('crossSystemUsedCases');
    if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(usedCases, parsed);
    }
} catch (e) {
    // sessionStorage not available, continue with empty history
}

// Save history to sessionStorage
const saveHistory = () => {
    try {
        sessionStorage.setItem('crossSystemUsedCases', JSON.stringify(usedCases));
    } catch (e) {
        // sessionStorage not available, continue without saving
    }
};

export const getCrossSystemCase = (difficulty = 'easy') => {
    const cases = crossSystemCases[difficulty] || crossSystemCases.easy;
    const used = usedCases[difficulty] || [];

    // Get available cases (not yet used)
    let availableCases = cases.filter(c => !used.includes(c.id));

    // If all cases have been used, reset the history for this difficulty
    if (availableCases.length === 0) {
        usedCases[difficulty] = [];
        availableCases = cases;
        saveHistory();
    }

    // Select a random case from available ones
    const selectedCase = availableCases[Math.floor(Math.random() * availableCases.length)];

    // Mark this case as used
    usedCases[difficulty].push(selectedCase.id);
    saveHistory();

    return selectedCase;
};

// Reset case history (useful for testing)
export const resetCrossSystemHistory = () => {
    usedCases.easy = [];
    usedCases.medium = [];
    usedCases.hard = [];
    saveHistory();
};

