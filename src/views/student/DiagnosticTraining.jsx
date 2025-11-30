import React, { useState, Suspense, useEffect, useRef } from 'react';
import { Stethoscope, CheckCircle2, XCircle, Box, Layers, Wrench } from 'lucide-react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { diagnosticCases } from '../../data/diagnosticCases';

// 3D Model with Faulty Parts Highlighting and Explosion
function DiagnosticModel({ system, faultyParts = [], isExploded, onPartClick }) {
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
    const partsData = useRef(new Map());
    const meshList = useRef([]);

    useEffect(() => {
        const bbox = new THREE.Box3().setFromObject(scene);
        const modelCenter = bbox.getCenter(new THREE.Vector3());

        meshList.current = [];
        partsData.current.clear();

        scene.traverse((child) => {
            if (child.isMesh) {
                meshList.current.push(child);

                const meshWorldPos = new THREE.Vector3();
                child.getWorldPosition(meshWorldPos);

                const directionFromCenter = new THREE.Vector3().subVectors(meshWorldPos, modelCenter);

                if (directionFromCenter.length() < 0.001) {
                    directionFromCenter.set(
                        Math.random() - 0.5,
                        Math.random() - 0.5,
                        Math.random() - 0.5
                    );
                }

                const direction = directionFromCenter.clone().normalize();

                partsData.current.set(child.uuid, {
                    originalPosition: child.position.clone(),
                    explosionDirection: direction,
                });
            }
        });
    }, [scene]);

    // Highlight faulty parts with red glow
    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                const partName = child.name.toLowerCase();
                const isFaulty = faultyParts.some(fault => partName.includes(fault.replace(/_/g, '')));

                if (isFaulty) {
                    child.material.emissive = new THREE.Color(0xff3333);
                    child.material.emissiveIntensity = 0.5;
                } else {
                    child.material.emissive = new THREE.Color(0x000000);
                    child.material.emissiveIntensity = 0;
                }
                child.material.needsUpdate = true;
            }
        });
    }, [scene, faultyParts]);

    // Handle explosion animation
    useFrame((state, delta) => {
        const explosionDistance = isExploded ? 0.3 : 0;

        meshList.current.forEach((child) => {
            const data = partsData.current.get(child.uuid);
            if (data) {
                const offset = data.explosionDirection.clone().multiplyScalar(explosionDistance);
                const targetPos = data.originalPosition.clone().add(offset);
                child.position.lerp(targetPos, delta * 2);
            }
        });
    });

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
                onPartClick?.(partName, e.object);
            }}
        />
    );
}

function Loader() {
    return (
        <Html center>
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-slate-500">Loading Model...</p>
            </div>
        </Html>
    );
}

export default function DiagnosticTraining() {
    const [selectedSystem, setSelectedSystem] = useState('brakes');
    const [selectedCase, setSelectedCase] = useState(null);
    const [currentPhase, setCurrentPhase] = useState('selection');
    const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
    const [showResults, setShowResults] = useState(false);

    // 3D Simulator states
    const [isExploded, setIsExploded] = useState(false);
    const [selectedTool, setSelectedTool] = useState(null);
    const [inspectedPart, setInspectedPart] = useState(null);
    const [toolReadings, setToolReadings] = useState({});

    const systems = Object.keys(diagnosticCases);
    const caseStudies = diagnosticCases[selectedSystem] || [];
    const activeCase = selectedCase ? caseStudies.find(c => c.id === selectedCase) : null;

    const startCase = (caseId) => {
        setSelectedCase(caseId);
        setCurrentPhase('briefing');
        setSelectedDiagnosis(null);
        setShowResults(false);
        setIsExploded(false);
        setSelectedTool(null);
        setInspectedPart(null);
        setToolReadings({});
    };

    const handlePartClick = (partName, meshObject) => {
        setInspectedPart(partName);

        // Get tool readings for this part if a tool is selected
        if (selectedTool && activeCase) {
            const readings = activeCase.toolReadings?.[selectedTool];
            if (readings) {
                // Try to find matching reading for this part
                const partKey = Object.keys(readings).find(key =>
                    partName.toLowerCase().includes(key.toLowerCase().replace(/_/g, ''))
                );
                if (partKey) {
                    setToolReadings(readings[partKey]);
                } else {
                    setToolReadings({ error: 'No reading available for this part' });
                }
            }
        }
    };

    const submitDiagnosis = () => {
        setShowResults(true);
    };

    const resetCase = () => {
        setSelectedCase(null);
        setCurrentPhase('selection');
        setSelectedDiagnosis(null);
        setShowResults(false);
        setIsExploded(false);
        setSelectedTool(null);
        setInspectedPart(null);
        setToolReadings({});
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Stethoscope className="text-blue-600" />
                    Diagnostic Training Center
                </h1>
                <p className="text-slate-600 dark:text-slate-400">Master real-world automotive troubleshooting</p>
            </div>

            {!activeCase ? (
                <div className="grid grid-cols-12 gap-6">
                    {/* System Selector */}
                    <div className="col-span-3">
                        <Card className="p-4">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Select System</h3>
                            <div className="space-y-2">
                                {systems.map((system) => (
                                    <button
                                        key={system}
                                        onClick={() => setSelectedSystem(system)}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedSystem === system
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                            }`}
                                    >
                                        {system.charAt(0).toUpperCase() + system.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-4 mt-4">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Case Studies</h3>
                            <div className="space-y-2">
                                {caseStudies.map((caseStudy) => (
                                    <button
                                        key={caseStudy.id}
                                        onClick={() => startCase(caseStudy.id)}
                                        className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <div className="font-medium text-slate-900 dark:text-white text-sm">
                                            {caseStudy.title}
                                        </div>
                                        <div className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${getDifficultyColor(caseStudy.difficulty)}`}>
                                            {caseStudy.difficulty}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Info Panel */}
                    <div className="col-span-9">
                        <Card className="p-12 text-center">
                            <Stethoscope className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                Select a Case Study to Begin
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Choose a system and case from the left panel to start diagnostic training
                            </p>
                        </Card>
                    </div>
                </div>
            ) : (
                <Card className="p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                {activeCase.title}
                            </h2>
                            <span className={`text-sm px-3 py-1 rounded-full ${getDifficultyColor(activeCase.difficulty)}`}>
                                {activeCase.difficulty}
                            </span>
                        </div>
                        <Button onClick={resetCase} variant="secondary">
                            Back to Cases
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {/* Customer Complaint */}
                        <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4">
                            <h4 className="font-bold text-orange-900 dark:text-orange-100 mb-2">
                                Customer Complaint
                            </h4>
                            <p className="text-orange-800 dark:text-orange-200 italic">"{activeCase.customerComplaint}"</p>
                        </div>

                        {/* Vehicle Info */}
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Vehicle Information</h4>
                            <p className="text-slate-600 dark:text-slate-400">{activeCase.vehicleInfo}</p>
                        </div>

                        {/* 3D Simulator with Tools */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Wrench size={20} className="text-blue-600" />
                                    Interactive 3D Diagnostic Simulator
                                </h4>
                                <button
                                    onClick={() => setIsExploded(!isExploded)}
                                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ${isExploded
                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                        }`}
                                >
                                    {isExploded ? <><Box size={16} /> Assemble</> : <><Layers size={16} /> Disassemble</>}
                                </button>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                {/* Diagnostic Tools Panel */}
                                <div className="col-span-1 space-y-2">
                                    <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Diagnostic Tools</h5>
                                    {['scanner', 'multimeter', 'caliper', 'compression', 'pressure'].map((tool) => (
                                        <button
                                            key={tool}
                                            onClick={() => setSelectedTool(selectedTool === tool ? null : tool)}
                                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedTool === tool
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                                }`}
                                        >
                                            {tool === 'scanner' && '🖥️ OBD Scanner'}
                                            {tool === 'multimeter' && '⚡ Multimeter'}
                                            {tool === 'caliper' && '📏 Caliper'}
                                            {tool === 'compression' && '🔧 Compression'}
                                            {tool === 'pressure' && '💨 Pressure'}
                                        </button>
                                    ))}

                                    {/* Tool Readings Display */}
                                    {selectedTool && (
                                        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                                            <div className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                                                {selectedTool.toUpperCase()}
                                            </div>
                                            {inspectedPart ? (
                                                <div className="text-xs space-y-1">
                                                    <div className="text-slate-600 dark:text-slate-400 truncate">
                                                        {inspectedPart}
                                                    </div>
                                                    {toolReadings.error ? (
                                                        <div className="text-orange-600 dark:text-orange-400">
                                                            {toolReadings.error}
                                                        </div>
                                                    ) : toolReadings.value !== undefined ? (
                                                        <>
                                                            <div className="font-bold text-slate-900 dark:text-white">
                                                                {toolReadings.value} {toolReadings.unit}
                                                            </div>
                                                            <div className={`${toolReadings.status === 'OK' ? 'text-green-600' :
                                                                    toolReadings.status === 'FAIL' ? 'text-red-600' :
                                                                        'text-orange-600'
                                                                }`}>
                                                                {toolReadings.status}
                                                            </div>
                                                            <div className="text-slate-500 dark:text-slate-400">
                                                                Spec: {toolReadings.spec}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="text-slate-500 dark:text-slate-400">
                                                            Click part to measure
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    Click on parts to inspect
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* 3D Canvas */}
                                <div className="col-span-3">
                                    <Card className="aspect-video bg-slate-900 overflow-hidden relative">
                                        <Canvas
                                            camera={{ fov: 50, position: [5, 5, 5] }}
                                            gl={{ antialias: false, powerPreference: "high-performance" }}
                                        >
                                            <Suspense fallback={<Loader />}>
                                                <ambientLight intensity={0.5} />
                                                <directionalLight position={[10, 10, 5]} intensity={0.8} />
                                                <directionalLight position={[-10, -10, -5]} intensity={0.3} />

                                                <DiagnosticModel
                                                    system={selectedSystem}
                                                    faultyParts={activeCase.faultyParts}
                                                    isExploded={isExploded}
                                                    onPartClick={handlePartClick}
                                                />

                                                <OrbitControls makeDefault enableDamping={false} />
                                            </Suspense>
                                        </Canvas>

                                        {/* Indicators */}
                                        <div className="absolute bottom-2 left-2 space-y-1">
                                            <div className="bg-red-500/90 text-white px-3 py-1 rounded text-xs font-medium">
                                                🔴 Red Glow = Faulty
                                            </div>
                                            {selectedTool && (
                                                <div className="bg-blue-500/90 text-white px-3 py-1 rounded text-xs font-medium">
                                                    📍 Click to use {selectedTool}
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>

                        {!showResults ? (
                            <>
                                {/* Diagnosis Options */}
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-3">Select Your Diagnosis</h4>
                                    <div className="grid gap-3">
                                        {activeCase.options.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => setSelectedDiagnosis(option.id)}
                                                className={`text-left p-4 rounded-lg border-2 transition-colors ${selectedDiagnosis === option.id
                                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                                    }`}
                                            >
                                                <div className="font-bold text-slate-900 dark:text-white">{option.label}</div>
                                                <div className="text-sm text-slate-600 dark:text-slate-400">{option.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    onClick={submitDiagnosis}
                                    disabled={!selectedDiagnosis}
                                    className="w-full"
                                >
                                    Submit Diagnosis
                                </Button>
                            </>
                        ) : (
                            <div className="space-y-6">
                                {/* Results */}
                                <div className={`p-6 rounded-lg ${selectedDiagnosis === activeCase.correctDiagnosis
                                    ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                                    : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500'
                                    }`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        {selectedDiagnosis === activeCase.correctDiagnosis ? (
                                            <>
                                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                                                <h3 className="text-2xl font-bold text-green-900 dark:text-green-100">
                                                    Correct Diagnosis!
                                                </h3>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-8 h-8 text-red-600" />
                                                <h3 className="text-2xl font-bold text-red-900 dark:text-red-100">
                                                    Incorrect Diagnosis
                                                </h3>
                                            </>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Explanation:</h4>
                                            <p className="text-slate-700 dark:text-slate-300">{activeCase.explanation}</p>
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Repair Procedure:</h4>
                                            <ol className="list-decimal list-inside space-y-1 text-slate-700 dark:text-slate-300">
                                                {activeCase.repairProcedure.map((step, idx) => (
                                                    <li key={idx} className="text-sm">{step}</li>
                                                ))}
                                            </ol>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-300 dark:border-slate-600">
                                            <div>
                                                <div className="text-sm text-slate-600 dark:text-slate-400">Estimated Cost</div>
                                                <div className="text-lg font-bold text-slate-900 dark:text-white">{activeCase.estimatedCost}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-slate-600 dark:text-slate-400">Time Required</div>
                                                <div className="text-lg font-bold text-slate-900 dark:text-white">{activeCase.timeToComplete}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button onClick={resetCase} variant="secondary" className="flex-1">
                                        Try Another Case
                                    </Button>
                                    <Button onClick={() => setShowResults(false)} className="flex-1">
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}
