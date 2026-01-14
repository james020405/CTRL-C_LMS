import React, { useState, Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getRemainingPlays, recordPlay, submitScore, SCORE_MULTIPLIERS } from '../../lib/gameService';
import { useAuth } from '../../contexts/AuthContext';
import DifficultySelector from '../../components/DifficultySelector';
import { Loader2, AlertTriangle, CheckCircle, XCircle, RefreshCw, Car, Wrench, Target } from 'lucide-react';

// --- 3D Model Component ---
function RouletteModel({ system, onPartClick, highlightPart }) {
    const modelMap = {
        brakes: '/models/BRAKE.glb',
        engine: '/models/Engine.glb',
        suspension: '/models/Suspension.glb',
        steering: '/models/Steering.glb',
        transmission: '/models/Transmission(No Anim).glb',
        electrical: '/models/Electrical.glb',
    };

    const modelUrl = modelMap[system] || modelMap.engine;
    const { scene } = useGLTF(modelUrl);
    const groupRef = useRef();

    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh) {
                if (!child.userData.originalMaterial) {
                    child.userData.originalMaterial = child.material.clone();
                }
                child.material = child.userData.originalMaterial.clone();
            }
        });
    }, [scene, system]);

    return (
        <primitive
            ref={groupRef}
            object={scene}
            onClick={(e) => {
                e.stopPropagation();
                let target = e.object;
                while (target && (!target.name || target.name.startsWith('Object_') || target.name.startsWith('Mesh'))) {
                    target = target.parent;
                }
                const partName = target?.name || e.object.name || "Unknown Component";
                onPartClick(partName, e.object);
            }}
        />
    );
}

function Loader() {
    return (
        <Html center>
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-sm font-medium text-slate-400">Loading Model...</p>
            </div>
        </Html>
    );
}
// --- Game Data with Pre-built Complaints ---
// IMPORTANT: 'part' must match actual 3D model part names for click matching
// 'displayName' is what shows in the UI (human readable)
const SYSTEMS = ['engine', 'brakes', 'suspension', 'steering', 'electrical'];

const VEHICLES = [
    '2018 Toyota Vios 1.3L', '2015 Honda City 1.5L', '2020 Mitsubishi Xpander',
    '2017 Nissan Navara 4x4', '2019 Suzuki Ertiga GLX', '2016 Hyundai Accent',
    '2021 Toyota Fortuner', '2014 Honda CR-V 2.4L', '2019 Ford Ranger',
    '2018 Mazda 3 Skyactiv', '2017 Kia Picanto', '2020 Isuzu MU-X'
];

const FAULTS_BY_DIFFICULTY = {
    easy: {
        engine: [
            { id: 'e1', part: 'V6_Piston', displayName: 'Piston', fault: 'Worn Piston', symptoms: 'Loss of compression, oil consumption', complaint: '"Yung sasakyan ko, parang bumababa yung power. Tapos mabilis maubos ang langis."' },
            { id: 'e2', part: 'V6_Valve', displayName: 'Valve', fault: 'Valve Issue', symptoms: 'Ticking noise, rough idle', complaint: '"May tik-tik na tunog sa engine. Tapos pag naka-idle, parang kinakabog."' },
            { id: 'e3', part: 'Alternator', displayName: 'Alternator', fault: 'Failing Alternator', symptoms: 'Dim lights, battery warning', complaint: '"Yung ilaw ko parang humihina. Tapos may warning light na battery sa dashboard."' }
        ],
        brakes: [
            { id: 'e4', part: 'Caliper', displayName: 'Brake Caliper', fault: 'Sticking Caliper', symptoms: 'Car pulls to one side', complaint: '"Pag nakabrado, humihilig yung kotse sa isang side. Tapos mainit yung gulong."' },
            { id: 'e5', part: 'Wheel', displayName: 'Brake Rotor', fault: 'Warped Rotor', symptoms: 'Vibration when braking', complaint: '"Pag pumipiga ako ng preno, umiiling yung steering wheel. May vibration."' },
            { id: 'e6', part: 'Master_Cylinder', displayName: 'Master Cylinder', fault: 'Low Brake Fluid', symptoms: 'Soft brake pedal', complaint: '"Ang lambot ng preno ko lately. Kailangan ko ng mas malakas na piga para tumigil."' }
        ],
        suspension: [
            { id: 'e7', part: 'Damper', displayName: 'Shock Absorber', fault: 'Worn Shock Absorber', symptoms: 'Bouncy ride', complaint: '"Pag dadaan sa humps, ang taas ng tulon. Parang basketball yung kotse."' },
            { id: 'e8', part: 'Tire', displayName: 'Tire', fault: 'Tire Wear', symptoms: 'Uneven tire wear, vibration', complaint: '"Hindi pantay yung pagkaubos ng gulong ko. Tapos may vibration pag mabilis."' }
        ],
        steering: [
            { id: 'e9', part: 'g_object', displayName: 'Steering Rack', fault: 'Worn Steering Rack', symptoms: 'Loose steering feel', complaint: '"Parang ang luwag ng steering. Hindi na sya responsive tulad dati."' },
            { id: 'e10', part: 'c_component#5', displayName: 'Power Steering Pump', fault: 'Power Steering Belt Issue', symptoms: 'Squealing when turning', complaint: '"Pag lumiliko ako, may tunog na squeak. Lalo na pag malamig pa yung makina."' }
        ],
        electrical: [
            { id: 'e11', part: 'Battery', displayName: 'Battery', fault: 'Weak Battery', symptoms: 'Slow engine crank', complaint: '"Mahina na yung pag-start. Parang hirap na hirap mag-crank yung makina."' },
            { id: 'e12', part: 'Main_Fuse_Block', displayName: 'Fuse Box', fault: 'Blown Fuse', symptoms: 'One system not working', complaint: '"Hindi gumagana yung power windows ko sa driver side. Yung iba okay naman."' }
        ]
    },
    medium: {
        engine: [
            { id: 'm1', part: 'V6_Piston', displayName: 'Piston', fault: 'Worn Piston Rings', symptoms: 'Blue smoke, oil consumption', complaint: '"Mabilis maubos ang langis ng kotse ko. Tapos may asul na usok pag malakas ang takbo."' },
            { id: 'm2', part: 'V6_Crankshaft', displayName: 'Crankshaft', fault: 'Worn Crankshaft Bearing', symptoms: 'Knocking under load', complaint: '"Pag naka-load ang engine, may malakas na katok. Nababahala ako baka masira."' },
            { id: 'm3', part: 'V6_Head_Gasket', displayName: 'Head Gasket', fault: 'Blown Head Gasket', symptoms: 'White smoke, overheating', complaint: '"Nag-o-overheat ang kotse. Tapos may puting usok sa exhaust. Yung coolant, mabilis maubos."' }
        ],
        brakes: [
            { id: 'm4', part: 'Caliper', displayName: 'Brake Caliper', fault: 'Seized Caliper Piston', symptoms: 'Dragging brakes, hot wheel', complaint: '"Mainit yung isang gulong ko kahit matagal nang nakaparada. Tapos may amoy goma."' },
            { id: 'm5', part: 'Master_Cylinder', displayName: 'Master Cylinder', fault: 'Failing Master Cylinder', symptoms: 'Pedal sinks slowly', complaint: '"Pag naka-tapak ako sa preno ng matagal, bumababa sya slowly. Parang may leak."' }
        ],
        suspension: [
            { id: 'm6', part: 'Damper', displayName: 'Shock Absorber', fault: 'Leaking Strut', symptoms: 'Oil on strut, poor handling', complaint: '"May langis sa shock ko. Tapos hindi na maganda yung handling ng kotse."' },
            { id: 'm7', part: 'Upper_Arm', displayName: 'Control Arm', fault: 'Worn Control Arm Bushing', symptoms: 'Clunking, vague steering', complaint: '"May kalampag sa ilalim pag nadaanan ko yung lubak o hump."' },
            { id: 'm8', part: 'Radius_Rod', displayName: 'Radius Rod', fault: 'Worn Radius Rod', symptoms: 'Wheel hop, vibration', complaint: '"Pag umaandar, parang umaalog yung gulong. Hindi stable."' }
        ],
        steering: [
            { id: 'm9', part: 'g_object', displayName: 'Steering Rack', fault: 'Power Steering Leak', symptoms: 'Groaning when turning', complaint: '"Pag pumipihit ng steering, may ungol na tunog. Tapos mabigat na sya."' },
            { id: 'm10', part: 'c_component#5', displayName: 'Power Steering Pump', fault: 'Worn Power Steering Pump', symptoms: 'Whining noise when turning', complaint: '"May tunog na parang humming pag gumagalaw yung steering. Lalo na pag mabilis."' }
        ],
        electrical: [
            { id: 'm11', part: 'Starter_Motor', displayName: 'Starter Motor', fault: 'Failing Starter Motor', symptoms: 'Grinding when starting', complaint: '"Pag nagsta-start ako, may grinding na tunog. Minsan hindi agad umaandar."' },
            { id: 'm12', part: 'Battery_Cable', displayName: 'Battery Cable', fault: 'Bad Ground Connection', symptoms: 'Flickering lights', complaint: '"Nagfa-flicker yung mga ilaw ko. Minsan okay, minsan hindi. Intermittent."' }
        ]
    },
    hard: {
        engine: [
            { id: 'h1', part: 'V6_Valve', displayName: 'Valve', fault: 'Bent Valve', symptoms: 'Ticking noise, misfires', complaint: '"May tik-tik na tunog sa engine. Tapos parang kulang ang power, may hesitation."' },
            { id: 'h2', part: 'V6_Head_Gasket', displayName: 'Head Gasket', fault: 'Internal Head Gasket Leak', symptoms: 'Coolant in oil, overheating', complaint: '"May gatas yung langis. Tapos nag-o-overheat pag matagal na biyahe."' },
            { id: 'h3', part: 'V6_Crankshaft', displayName: 'Crankshaft', fault: 'Main Bearing Wear', symptoms: 'Deep knocking, low oil pressure', complaint: '"May malalim na katok sa engine. Tapos bumababa yung oil pressure warning."' }
        ],
        brakes: [
            { id: 'h4', part: 'Master_Cylinder', displayName: 'Master Cylinder', fault: 'Internal Master Cylinder Leak', symptoms: 'Slow pedal sink, no external leak', complaint: '"Bumababa yung preno pag nakatapak ng matagal, pero walang leak sa labas."' },
            { id: 'h5', part: 'Caliper', displayName: 'Brake Caliper', fault: 'Brake Caliper Bore Corrosion', symptoms: 'Intermittent braking, sticking', complaint: '"Minsan okay ang preno, minsan hindi. Parang may sabit."' }
        ],
        suspension: [
            { id: 'h6', part: 'Upper_Arm', displayName: 'Control Arm', fault: 'Cracked Control Arm', symptoms: 'Vague steering, clunking', complaint: '"Parang walang feel yung steering. Tapos may kalampag pag bumibiyahe."' },
            { id: 'h7', part: 'Damper', displayName: 'Shock Absorber', fault: 'Internal Shock Failure', symptoms: 'Poor handling, no visible leak', complaint: '"Hindi na maganda ang ride. Pero tignan mo, walang leak sa shock."' }
        ],
        steering: [
            { id: 'h8', part: 'g_object', displayName: 'Steering Rack', fault: 'Worn Rack Bushings', symptoms: 'Play in steering, clicking', complaint: '"May clicking sound pag dinidirection yung steering. Parang may kalampag sa loob."' },
            { id: 'h9', part: 'c_component#5', displayName: 'Power Steering Pump', fault: 'Internal Pump Wear', symptoms: 'Intermittent hard steering', complaint: '"Minsan okay ang steering, minsan mabigat. Walang consistent."' }
        ],
        electrical: [
            { id: 'h10', part: 'Charging_System_Harness', displayName: 'Wiring Harness', fault: 'Wiring Harness Fault', symptoms: 'Random electrical issues', complaint: '"Maraming problema ng kotse. Minsan aircon, minsan ilaw. Paiba-iba."' },
            { id: 'h11', part: 'Alternator', displayName: 'Alternator', fault: 'Voltage Regulator Failure', symptoms: 'Overcharging, bulbs blowing', complaint: '"Mabilis maputok yung mga ilaw. Tapos sobrang bright pag gabi."' }
        ]
    }
};

// Track used faults
let usedFaults = { easy: [], medium: [], hard: [] };
try {
    const saved = sessionStorage.getItem('faultRouletteUsedFaults');
    if (saved) usedFaults = JSON.parse(saved);
} catch (e) { }

const saveFaultHistory = () => {
    try { sessionStorage.setItem('faultRouletteUsedFaults', JSON.stringify(usedFaults)); } catch (e) { }
};

const getAllFaults = (difficulty) => {
    const faultsBySystem = FAULTS_BY_DIFFICULTY[difficulty];
    const allFaults = [];
    for (const system of SYSTEMS) {
        if (faultsBySystem[system]) {
            for (const fault of faultsBySystem[system]) {
                allFaults.push({ system, ...fault });
            }
        }
    }
    return allFaults;
};

const getUnusedFault = (difficulty) => {
    const allFaults = getAllFaults(difficulty);
    const used = usedFaults[difficulty] || [];
    let available = allFaults.filter(f => !used.includes(f.id));
    if (available.length === 0) {
        usedFaults[difficulty] = [];
        available = allFaults;
        saveFaultHistory();
    }
    const selected = available[Math.floor(Math.random() * available.length)];
    usedFaults[difficulty].push(selected.id);
    saveFaultHistory();

    // Add random vehicle
    const vehicle = VEHICLES[Math.floor(Math.random() * VEHICLES.length)];
    return { ...selected, vehicle };
};

export default function FaultRoulette() {
    const { user } = useAuth();
    const [gameState, setGameState] = useState('difficulty');
    const [difficulty, setDifficulty] = useState(null);
    const [remainingPlays, setRemainingPlays] = useState({ easy: 5, medium: 5, hard: 2 });
    const [currentCase, setCurrentCase] = useState(null);
    const [roundScore, setRoundScore] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [selectedPart, setSelectedPart] = useState(null);
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        if (user?.id) loadRemainingPlays();
    }, [user?.id]);

    const loadRemainingPlays = async () => {
        const plays = await getRemainingPlays(user?.id, 'fault_roulette');
        setRemainingPlays(plays);
    };

    const selectDifficulty = async (selectedDifficulty) => {
        setDifficulty(selectedDifficulty);
        setFeedback(null);
        setSelectedPart(null);
        setAttempts(0);
        setRoundScore(0);

        await recordPlay(user?.id, 'fault_roulette', selectedDifficulty);
        await loadRemainingPlays();

        const faultData = getUnusedFault(selectedDifficulty);
        setCurrentCase(faultData);
        setGameState('playing');
    };

    // Map raw model names to friendly display names
    const getPartDisplayName = (rawName) => {
        const displayNames = {
            // Engine
            'V6_Piston': 'Piston', 'V6_Piston_Mesh': 'Piston',
            'V6_Valve': 'Valve', 'V6_Valve_Mesh': 'Valve',
            'V6_Crankshaft': 'Crankshaft', 'V6_Crankshaft_Mesh': 'Crankshaft',
            'V6_Head_Gasket': 'Head Gasket', 'Alternator': 'Alternator',
            // Brakes
            'Caliper': 'Brake Caliper', 'Caliper001': 'Brake Caliper',
            'Master_Cylinder': 'Master Cylinder', 'Wheel': 'Brake Rotor',
            // Suspension
            'Damper': 'Shock Absorber', 'Tire': 'Tire',
            'Upper_Arm': 'Control Arm', 'Radius_Rod': 'Radius Rod',
            // Steering
            'g_object': 'Steering Rack', 'g_object_2': 'Steering Rack',
            'c_component#5': 'Power Steering Pump',
            // Electrical  
            'Battery': 'Battery', 'Starter_Motor': 'Starter Motor',
            'Main_Fuse_Block': 'Fuse Box', 'Battery_Cable': 'Battery Cable',
            'Charging_System_Harness': 'Wiring Harness',
        };

        // Check for exact match first
        if (displayNames[rawName]) return displayNames[rawName];

        // Check if any key is contained in the raw name
        for (const [key, display] of Object.entries(displayNames)) {
            if (rawName.includes(key) || key.includes(rawName.split('_')[0])) {
                return display;
            }
        }

        // Fallback: clean up the name
        return rawName.replace(/_/g, ' ').replace(/\d+$/, '').trim() || rawName;
    };

    const handlePartClick = (partName, meshObj) => {
        if (gameState !== 'playing') return;
        if (selectedPart?.mesh) {
            selectedPart.mesh.material.emissive.setHex(0x000000);
        }
        meshObj.material.emissive.setHex(0xf97316); // Orange highlight
        setSelectedPart({
            name: partName,
            displayName: getPartDisplayName(partName),
            mesh: meshObj
        });
    };

    const submitDiagnosis = async () => {
        if (!selectedPart) return;

        const targetPart = currentCase.part.toLowerCase().replace(/_/g, '');
        const clickedPart = selectedPart.name.toLowerCase().replace(/_/g, '');
        const isCorrect = clickedPart.includes(targetPart) || targetPart.includes(clickedPart);

        const multiplier = SCORE_MULTIPLIERS[difficulty] || 1;

        if (isCorrect) {
            const baseScore = Math.max(10, 100 - (attempts * 20));
            const earnedScore = Math.round(baseScore * multiplier);

            setRoundScore(earnedScore);
            setFeedback({ type: 'success', message: `Correct! You found the ${currentCase.fault}.` });
            setGameState('result');

            await submitScore(user?.id, 'fault_roulette', difficulty, earnedScore);
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= 3) {
                setRoundScore(0);
                setFeedback({ type: 'giveup', message: 'Out of attempts!' });
                setGameState('result');
            } else {
                setFeedback({ type: 'error', message: `Wrong part. ${3 - newAttempts} attempts left!` });
                if (selectedPart.mesh) {
                    selectedPart.mesh.material.emissive.setHex(0xff0000);
                    setTimeout(() => {
                        if (selectedPart.mesh) selectedPart.mesh.material.emissive.setHex(0x000000);
                    }, 500);
                }
            }
        }
    };

    const giveUp = () => {
        setRoundScore(0);
        setFeedback({ type: 'giveup', message: 'Here\'s the correct answer:' });
        setGameState('result');
    };

    const playAgain = () => {
        loadRemainingPlays();
        setGameState('difficulty');
        setCurrentCase(null);
        setDifficulty(null);
        setRoundScore(0);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <AlertTriangle className="text-orange-500" />
                        Fault Roulette
                    </h1>
                    <p className="text-slate-500">Find the faulty part based on symptoms</p>
                </div>
                {gameState !== 'difficulty' && (
                    <div className="text-right">
                        <div className="text-sm text-slate-500">Attempts</div>
                        <div className="text-2xl font-bold text-orange-600">{3 - attempts}/3</div>
                    </div>
                )}
            </div>

            {/* Difficulty Selection */}
            {gameState === 'difficulty' && (
                <DifficultySelector
                    remainingPlays={remainingPlays}
                    onSelect={selectDifficulty}
                    loading={false}
                    customConfig={{
                        easy: { description: 'Common faults, clear symptoms' },
                        medium: { description: 'Trickier diagnoses required' },
                        hard: { description: 'Obscure faults, subtle clues' }
                    }}
                />
            )}

            {/* Game Play */}
            {(gameState === 'playing' || gameState === 'result') && currentCase && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Panel - Info */}
                    <div className="lg:col-span-4 space-y-4">
                        {/* Vehicle Card */}
                        <Card className="p-5 border-l-4 border-l-orange-500">
                            <div className="flex items-center gap-3 mb-3">
                                <Car className="text-orange-500" size={24} />
                                <div>
                                    <div className="text-xs text-slate-500 uppercase">Vehicle</div>
                                    <div className="font-bold text-slate-900 dark:text-white">{currentCase.vehicle}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                    difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>{difficulty?.toUpperCase()}</span>
                                <span className="text-sm text-slate-500">• {currentCase.system.toUpperCase()} System</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                                <div className="text-xs text-slate-500 uppercase mb-2">Customer Says:</div>
                                <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                                    {currentCase.complaint}
                                </p>
                            </div>
                        </Card>

                        {/* Selection Card */}
                        <Card className="p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Target className="text-blue-500" size={20} />
                                <h3 className="font-bold text-slate-900 dark:text-white">Your Selection</h3>
                            </div>

                            {selectedPart ? (
                                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                                    <div className="text-sm text-orange-600 dark:text-orange-400 mb-1">Selected Part:</div>
                                    <div className="font-bold text-orange-800 dark:text-orange-200 text-lg">
                                        {selectedPart.displayName || selectedPart.name.replace(/_/g, ' ')}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-center">
                                    <p className="text-slate-500">Click on a part in the 3D model</p>
                                </div>
                            )}

                            {feedback && (
                                <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${feedback.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                    feedback.type === 'giveup' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                    }`}>
                                    {feedback.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                    <span className="flex-1 font-medium">{feedback.message}</span>
                                    {feedback.type === 'success' && <span className="font-bold">+{roundScore}</span>}
                                </div>
                            )}

                            {/* Answer Reveal */}
                            {gameState === 'result' && (
                                <div className="mt-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Wrench className="text-blue-500" size={18} />
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {feedback?.type === 'success' ? 'Diagnosis Summary' : 'Correct Answer'}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Faulty Part:</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{currentCase.displayName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Fault:</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{currentCase.fault}</span>
                                        </div>
                                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                                            <span className="text-slate-500">Symptoms:</span>
                                            <p className="text-slate-700 dark:text-slate-300 mt-1">{currentCase.symptoms}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {gameState === 'playing' && (
                                <div className="mt-4 space-y-2">
                                    <Button onClick={submitDiagnosis} disabled={!selectedPart} className="w-full bg-orange-600 hover:bg-orange-700">
                                        Submit Diagnosis
                                    </Button>
                                    <Button onClick={giveUp} variant="ghost" className="w-full text-slate-500">
                                        Give Up
                                    </Button>
                                </div>
                            )}

                            {gameState === 'result' && (
                                <Button onClick={playAgain} className="mt-4 w-full bg-orange-600 hover:bg-orange-700">
                                    <RefreshCw className="mr-2" size={16} /> Next Challenge
                                </Button>
                            )}
                        </Card>
                    </div>

                    {/* Right Panel - 3D Model */}
                    <div className="lg:col-span-8">
                        <Card className="h-[400px] lg:h-[600px] bg-slate-900 overflow-hidden relative border-0">
                            <Canvas camera={{ fov: 45, position: [5, 5, 5] }} gl={{ antialias: true }}>
                                <Suspense fallback={<Loader />}>
                                    <ambientLight intensity={0.5} />
                                    <directionalLight position={[10, 10, 5]} intensity={1} />
                                    <directionalLight position={[-10, -10, -5]} intensity={0.5} />
                                    <RouletteModel system={currentCase.system} onPartClick={handlePartClick} />
                                    <OrbitControls makeDefault />
                                </Suspense>
                            </Canvas>
                            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur text-white px-3 py-1.5 rounded-full text-sm font-bold">
                                {currentCase.system.toUpperCase()}
                            </div>
                            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur text-white px-3 py-2 rounded-lg text-xs text-center lg:hidden">
                                Tap and drag to rotate • Pinch to zoom • Tap parts to select
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
