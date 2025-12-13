import React, { useState, Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { generateCustomerScenario } from '../../lib/gemini';
import { getRemainingPlays, recordPlay, submitScore, SCORE_MULTIPLIERS } from '../../lib/gameService';
import { useAuth } from '../../contexts/AuthContext';
import DifficultySelector from '../../components/DifficultySelector';
import { Loader2, AlertTriangle, CheckCircle, XCircle, Trophy, RefreshCw, Sparkles } from 'lucide-react';

// --- 3D Model Component ---
function RouletteModel({ system, onPartClick }) {
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
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-sm font-medium text-slate-500">Loading Model...</p>
            </div>
        </Html>
    );
}

// --- Game Data ---
const SYSTEMS = ['engine', 'brakes', 'suspension', 'steering', 'electrical'];

// Faults organized by difficulty - expanded with more variety
const FAULTS_BY_DIFFICULTY = {
    easy: {
        engine: [
            { id: 'e1', part: 'spark_plug', fault: 'Fouled Spark Plug', symptoms: 'Engine misfires, rough idle, car shakes' },
            { id: 'e2', part: 'air_filter', fault: 'Clogged Air Filter', symptoms: 'Poor acceleration, black smoke' },
            { id: 'e3', part: 'oil_cap', fault: 'Missing Oil Cap', symptoms: 'Oil smell, low oil pressure warning' }
        ],
        brakes: [
            { id: 'e4', part: 'pad', fault: 'Worn Brake Pads', symptoms: 'Squealing noise when braking' },
            { id: 'e5', part: 'rotor', fault: 'Warped Rotor', symptoms: 'Vibration in steering wheel when braking' },
            { id: 'e6', part: 'brake_fluid', fault: 'Low Brake Fluid', symptoms: 'Soft brake pedal, warning light on' }
        ],
        suspension: [
            { id: 'e7', part: 'shock', fault: 'Worn Shock Absorber', symptoms: 'Bouncy ride, car bounces after bumps' },
            { id: 'e8', part: 'bushing', fault: 'Worn Bushing', symptoms: 'Clunking noise over bumps' }
        ],
        steering: [
            { id: 'e9', part: 'tie_rod', fault: 'Worn Tie Rod End', symptoms: 'Loose steering, car wanders' },
            { id: 'e10', part: 'belt', fault: 'Loose Power Steering Belt', symptoms: 'Squealing when turning' }
        ],
        electrical: [
            { id: 'e11', part: 'battery', fault: 'Dead Battery', symptoms: 'Car won\'t start, no lights' },
            { id: 'e12', part: 'fuse', fault: 'Blown Fuse', symptoms: 'One specific system not working' }
        ]
    },
    medium: {
        engine: [
            { id: 'm1', part: 'piston', fault: 'Worn Piston Rings', symptoms: 'Blue smoke from exhaust, oil consumption' },
            { id: 'm2', part: 'alternator', fault: 'Failing Alternator', symptoms: 'Dim lights, battery warning light' },
            { id: 'm3', part: 'timing_chain', fault: 'Loose Timing Chain', symptoms: 'Rattling noise at startup, rough idle' }
        ],
        brakes: [
            { id: 'm4', part: 'caliper', fault: 'Sticking Caliper', symptoms: 'Car pulls to one side when braking' },
            { id: 'm5', part: 'abs_sensor', fault: 'Dirty ABS Sensor', symptoms: 'ABS light on, erratic ABS activation' }
        ],
        suspension: [
            { id: 'm6', part: 'spring', fault: 'Broken Coil Spring', symptoms: 'Car sits lower on one side' },
            { id: 'm7', part: 'shock', fault: 'Leaking Strut', symptoms: 'Oil on strut, poor handling' },
            { id: 'm8', part: 'sway_bar', fault: 'Worn Sway Bar Link', symptoms: 'Clunking in corners, body roll' }
        ],
        steering: [
            { id: 'm9', part: 'rack', fault: 'Power Steering Leak', symptoms: 'Groaning noise when turning, low fluid' },
            { id: 'm10', part: 'pump', fault: 'Worn Power Steering Pump', symptoms: 'Whining noise when turning' }
        ],
        electrical: [
            { id: 'm11', part: 'starter', fault: 'Failing Starter Motor', symptoms: 'Grinding noise when starting' },
            { id: 'm12', part: 'ground', fault: 'Bad Ground Connection', symptoms: 'Flickering lights, intermittent issues' }
        ]
    },
    hard: {
        engine: [
            { id: 'h1', part: 'valve', fault: 'Bent Valve', symptoms: 'Ticking noise, loss of power, misfires' },
            { id: 'h2', part: 'head_gasket', fault: 'Blown Head Gasket', symptoms: 'White smoke, overheating, milky oil' },
            { id: 'h3', part: 'crankshaft', fault: 'Worn Crankshaft Bearings', symptoms: 'Knocking noise under load, low oil pressure' }
        ],
        brakes: [
            { id: 'h4', part: 'master_cylinder', fault: 'Failing Master Cylinder', symptoms: 'Spongy brake pedal, pedal sinks slowly' },
            { id: 'h5', part: 'booster', fault: 'Bad Brake Booster', symptoms: 'Hard brake pedal, needs extra force' }
        ],
        suspension: [
            { id: 'h6', part: 'control_arm', fault: 'Worn Control Arm Bushing', symptoms: 'Clunking over bumps, vague steering' },
            { id: 'h7', part: 'ball_joint', fault: 'Failing Ball Joint', symptoms: 'Creaking when turning, uneven tire wear' }
        ],
        steering: [
            { id: 'h8', part: 'rack', fault: 'Worn Steering Rack', symptoms: 'Clicking when turning, loose feel' },
            { id: 'h9', part: 'column', fault: 'Worn Steering Column Bearing', symptoms: 'Grinding feel when turning wheel' }
        ],
        electrical: [
            { id: 'h10', part: 'ecu', fault: 'ECU Malfunction', symptoms: 'Random misfires, check engine light, erratic behavior' },
            { id: 'h11', part: 'wiring', fault: 'Corroded Wiring Harness', symptoms: 'Multiple intermittent electrical issues' }
        ]
    }
};

// Track used faults to prevent repetition
let usedFaults = {
    easy: [],
    medium: [],
    hard: []
};

// Try to load history from sessionStorage
try {
    const saved = sessionStorage.getItem('faultRouletteUsedFaults');
    if (saved) {
        usedFaults = JSON.parse(saved);
    }
} catch (e) {
    // sessionStorage not available
}

const saveFaultHistory = () => {
    try {
        sessionStorage.setItem('faultRouletteUsedFaults', JSON.stringify(usedFaults));
    } catch (e) {
        // sessionStorage not available
    }
};

// Get all faults as a flat array for a difficulty
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

// Get an unused fault, reset if all used
const getUnusedFault = (difficulty) => {
    const allFaults = getAllFaults(difficulty);
    const used = usedFaults[difficulty] || [];

    let available = allFaults.filter(f => !used.includes(f.id));

    // Reset if all used
    if (available.length === 0) {
        usedFaults[difficulty] = [];
        available = allFaults;
        saveFaultHistory();
    }

    // Select random from available
    const selected = available[Math.floor(Math.random() * available.length)];

    // Mark as used
    usedFaults[difficulty].push(selected.id);
    saveFaultHistory();

    return selected;
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
        setGameState('loading');
        setFeedback(null);
        setSelectedPart(null);
        setAttempts(0);
        setRoundScore(0);

        await recordPlay(user?.id, 'fault_roulette', selectedDifficulty);
        await loadRemainingPlays();

        // Use the history-aware fault selection
        const faultData = getUnusedFault(selectedDifficulty);
        const scenario = await generateCustomerScenario(faultData.system, faultData.fault, faultData.part);

        setCurrentCase({ ...faultData, scenario });
        setGameState('playing');
    };

    const handlePartClick = (partName, meshObj) => {
        if (gameState !== 'playing') return;
        if (selectedPart?.mesh) {
            selectedPart.mesh.material.emissive.setHex(0x000000);
        }
        meshObj.material.emissive.setHex(0x3b82f6);
        setSelectedPart({ name: partName, mesh: meshObj });
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
            setFeedback({ type: 'success', message: `Correct! The ${currentCase.fault} was found.` });
            setGameState('result');

            await submitScore(user?.id, 'fault_roulette', difficulty, earnedScore);
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= 3) {
                // After 3 wrong attempts, reveal the answer
                setRoundScore(0);
                setFeedback({
                    type: 'giveup',
                    message: 'Out of attempts! Here\'s what you should have found...'
                });
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
        setFeedback({
            type: 'giveup',
            message: 'No worries! Here\'s the correct answer...'
        });
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
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="text-orange-500" />
                    Fault Roulette
                </h1>
                <p className="text-slate-500">Diagnose the mystery fault!</p>
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

            {/* Loading */}
            {gameState === 'loading' && (
                <Card className="p-12">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Generating Scenario...</h3>
                            <p className="text-slate-500 flex items-center gap-2 justify-center">
                                <Sparkles className="w-4 h-4 text-purple-500" />
                                AI is creating a customer complaint
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Game Play */}
            {(gameState === 'playing' || gameState === 'result') && currentCase && (
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6">
                    {/* 3D View - Shown first on mobile, right side on desktop */}
                    <div className="order-1 lg:order-2 lg:col-span-8 xl:col-span-9">
                        <Card className="h-[300px] sm:h-[400px] lg:h-full min-h-[400px] bg-slate-900 overflow-hidden relative border-0">
                            <Canvas camera={{ fov: 45, position: [5, 5, 5] }} gl={{ antialias: true }}>
                                <Suspense fallback={<Loader />}>
                                    <ambientLight intensity={0.5} />
                                    <directionalLight position={[10, 10, 5]} intensity={1} />
                                    <directionalLight position={[-10, -10, -5]} intensity={0.5} />
                                    <RouletteModel system={currentCase.system} onPartClick={handlePartClick} />
                                    <OrbitControls makeDefault />
                                </Suspense>
                            </Canvas>
                            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold">
                                System: {currentCase.system.toUpperCase()}
                            </div>
                            {/* Mobile instruction overlay */}
                            <div className="lg:hidden absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur text-white px-3 py-2 rounded-lg text-xs text-center">
                                Tap and drag to rotate • Pinch to zoom • Tap parts to select
                            </div>
                        </Card>
                    </div>

                    {/* Left Panel - Controls */}
                    <div className="order-2 lg:order-1 lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
                        <Card className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/50 border-l-4 border-l-blue-500">
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Difficulty</h3>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                        difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>{difficulty?.toUpperCase()}</span>
                                </div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vehicle</h3>
                                <p className="font-mono text-base sm:text-lg text-slate-900 dark:text-white">{currentCase.scenario.vehicle}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Customer Complaint</h3>
                                <p className="italic text-slate-700 dark:text-slate-300 text-base sm:text-lg">
                                    "{currentCase.scenario.complaint}"
                                </p>
                            </div>
                            {currentCase.scenario.isAI && (
                                <div className="mt-4 flex items-center gap-1 text-xs text-purple-500">
                                    <Sparkles size={12} /> Generated by AI
                                </div>
                            )}
                        </Card>

                        <Card className="p-4 sm:p-6 flex-1 flex flex-col">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Diagnostic Tool</h3>
                            <div className="flex-1 bg-slate-900 rounded-lg p-3 sm:p-4 font-mono text-green-400 text-xs sm:text-sm overflow-y-auto min-h-[100px]">
                                <p>{'>'} SYSTEM: {currentCase.system.toUpperCase()}</p>
                                <p className="text-red-500">{'>'} FAULT DETECTED</p>
                                {selectedPart ? (
                                    <div className="mt-4 border-t border-slate-700 pt-4">
                                        <p className="text-white">TARGET: {selectedPart.name}</p>
                                    </div>
                                ) : (
                                    <p className="mt-4 text-slate-500 animate-pulse">Select a component...</p>
                                )}
                            </div>

                            {feedback && (
                                <div className={`mt-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${feedback.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                    feedback.type === 'giveup' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                    }`}>
                                    {feedback.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                    <span className="flex-1">{feedback.message}</span>
                                    {feedback.type === 'success' && (
                                        <span className="font-bold">+{roundScore} pts</span>
                                    )}
                                </div>
                            )}

                            {/* Correct Answer Display - shown on give up or 3 wrong attempts */}
                            {gameState === 'result' && feedback?.type === 'giveup' && (
                                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 sm:p-4 rounded-lg">
                                    <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                                        💡 Correct Answer
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-blue-600 dark:text-blue-400">Faulty Part:</span>
                                            <span className="font-bold text-blue-800 dark:text-blue-200">{currentCase.part.replace(/_/g, ' ').toUpperCase()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-600 dark:text-blue-400">Fault:</span>
                                            <span className="font-bold text-blue-800 dark:text-blue-200">{currentCase.fault}</span>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                                            <span className="text-blue-600 dark:text-blue-400">Symptoms to look for:</span>
                                            <p className="mt-1 text-blue-800 dark:text-blue-200 italic">{currentCase.symptoms || currentCase.scenario?.complaint}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {gameState === 'playing' && (
                                <>
                                    <Button
                                        onClick={submitDiagnosis}
                                        disabled={!selectedPart}
                                        className="mt-4 w-full"
                                    >
                                        Confirm Diagnosis ({3 - attempts} attempts left)
                                    </Button>
                                    <Button onClick={giveUp} variant="ghost" className="mt-2 w-full text-slate-500">
                                        Give Up & Show Answer
                                    </Button>
                                </>
                            )}

                            {gameState === 'result' && (
                                <Button onClick={playAgain} variant="outline" className="mt-4 w-full">
                                    <RefreshCw className="mr-2" size={16} /> Play Again
                                </Button>
                            )}
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
