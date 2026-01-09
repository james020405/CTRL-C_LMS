import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Card } from '../../components/ui/Card';
import { X, Box, Layers, Eye, Stethoscope, AlertTriangle } from 'lucide-react';
import { getPartName, getPartDescription, PRESET_COMPLAINTS, getRelevantSystems } from '../../data/partNames';

function Model({ url, onPartClick, isExploded, xrayMode, onHover, systemType }) {
    const { scene, animations } = useGLTF(url);
    const { actions, mixer } = useAnimations(animations, scene);
    const { camera, gl } = useThree();
    const groupRef = useRef();
    const partsData = useRef(new Map());
    const meshList = useRef([]);
    const raycaster = useRef(new THREE.Raycaster());
    const mouse = useRef(new THREE.Vector2());
    const hoveredMesh = useRef(null);
    const hasAnimations = animations && animations.length > 0;

    useEffect(() => {
        const bbox = new THREE.Box3().setFromObject(scene);
        const modelCenter = bbox.getCenter(new THREE.Vector3());

        meshList.current = [];
        partsData.current.clear();

        let partIndex = 0;
        const allPartNames = new Set();

        scene.traverse((child) => {
            if (child.isMesh) {
                meshList.current.push(child);

                // Collect part name for logging
                let target = child;
                while (target && (!target.name || target.name.startsWith('Object_') || target.name.startsWith('Mesh'))) {
                    target = target.parent;
                }
                const partName = target?.name || child.name || "Unknown";
                allPartNames.add(partName);

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

                child.userData.originalMaterial = child.material.clone();
                child.userData.originalEmissive = child.material.emissive?.clone();
                child.userData.partIndex = partIndex++;

                partsData.current.set(child.uuid, {
                    originalPosition: child.position.clone(),
                    explosionDirection: direction,
                    partIndex: child.userData.partIndex
                });
            }
        });
    }, [scene]);

    // Handle animation playback for baked animations
    useEffect(() => {
        if (hasAnimations && actions) {
            const firstAction = Object.values(actions)[0];

            if (isExploded) {
                // Play animation forward (disassembly)
                if (firstAction) {
                    firstAction.reset();
                    firstAction.timeScale = 1; // Normal speed forward
                    firstAction.clampWhenFinished = true;
                    firstAction.loop = THREE.LoopOnce;
                    firstAction.play();
                }
            } else {
                // Play animation in reverse (assembly)
                if (firstAction) {
                    firstAction.paused = false;
                    firstAction.timeScale = -1; // Reverse
                    firstAction.clampWhenFinished = true;
                    firstAction.loop = THREE.LoopOnce;

                    // Start from the end if just starting reverse
                    if (firstAction.time === 0) {
                        firstAction.time = firstAction.getClip().duration;
                    }

                    firstAction.play();
                }
            }
        }
    }, [isExploded, actions, hasAnimations]);

    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                if (xrayMode) {
                    child.material.transparent = true;
                    child.material.opacity = 0.3;
                    child.material.depthWrite = false;
                } else {
                    child.material.transparent = false;
                    child.material.opacity = 1.0;
                    child.material.depthWrite = true;
                }
                child.material.needsUpdate = true;
            }
        });
    }, [xrayMode, scene]);

    // Enhanced manual explosion animation for models without baked animations
    const explosionProgress = useRef(0);
    const explosionSpeed = 2.0; // Speed of explosion animation

    useFrame((state, delta) => {
        if (hasAnimations) {
            // Animation mixer handles movement, we just need to update it
            return;
        }

        // Animate explosion progress
        const targetProgress = isExploded ? 1 : 0;
        const progressDiff = targetProgress - explosionProgress.current;

        if (Math.abs(progressDiff) > 0.001) {
            explosionProgress.current += progressDiff * delta * explosionSpeed;
            explosionProgress.current = Math.max(0, Math.min(1, explosionProgress.current));
        }

        // Enhanced explosion with staggered timing per part
        const baseExplosionDistance = 0.4; // Subtle separation for realistic disassembly
        const totalParts = meshList.current.length;

        for (let i = 0; i < meshList.current.length; i++) {
            const child = meshList.current[i];
            const data = partsData.current.get(child.uuid);

            if (data) {
                // Staggered animation - parts explode sequentially based on their index
                const partDelay = (data.partIndex / totalParts) * 0.5; // 0 to 0.5 delay
                const adjustedProgress = Math.max(0, Math.min(1, (explosionProgress.current - partDelay) / (1 - partDelay)));

                // Easing function for smooth animation
                const easedProgress = adjustedProgress < 0.5
                    ? 2 * adjustedProgress * adjustedProgress
                    : 1 - Math.pow(-2 * adjustedProgress + 2, 2) / 2;

                // Calculate target position with varied distances per part
                const partDistanceMultiplier = 0.8 + (data.partIndex % 5) * 0.1; // Slight variation
                const explosionDistance = baseExplosionDistance * partDistanceMultiplier * easedProgress;

                const offset = data.explosionDirection.clone().multiplyScalar(explosionDistance);
                const targetPos = data.originalPosition.clone().add(offset);

                // Smooth interpolation
                child.position.lerp(targetPos, delta * 8);
            }
        }
    });

    useEffect(() => {
        let lastCheck = 0;
        const handleMouseMove = (event) => {
            const now = Date.now();
            if (now - lastCheck < 100) return;
            lastCheck = now;

            const rect = gl.domElement.getBoundingClientRect();
            mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.current.setFromCamera(mouse.current, camera);
            const intersects = raycaster.current.intersectObjects(meshList.current, false);

            if (hoveredMesh.current && hoveredMesh.current !== intersects[0]?.object) {
                if (hoveredMesh.current.material && hoveredMesh.current.userData.originalEmissive) {
                    hoveredMesh.current.material.emissive.copy(hoveredMesh.current.userData.originalEmissive);
                }
                hoveredMesh.current = null;
                onHover?.(null);
            }

            if (intersects.length > 0) {
                const mesh = intersects[0].object;
                if (mesh !== hoveredMesh.current) {
                    hoveredMesh.current = mesh;
                    if (mesh.material) {
                        mesh.material.emissive = new THREE.Color(0x3b82f6);
                    }

                    let target = mesh;
                    while (target && (!target.name || target.name.startsWith('Object_') || target.name.startsWith('Mesh'))) {
                        target = target.parent;
                    }
                    const rawName = target?.name || mesh.name || "Unknown";
                    // Use raw model name directly
                    onHover?.(rawName);
                }
            }
        };

        gl.domElement.addEventListener('mousemove', handleMouseMove);
        return () => gl.domElement.removeEventListener('mousemove', handleMouseMove);
    }, [camera, gl, onHover]);
    // Handle click with proper raycasting (same as hover)
    useEffect(() => {
        const handleClick = (event) => {
            const rect = gl.domElement.getBoundingClientRect();
            mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.current.setFromCamera(mouse.current, camera);
            const intersects = raycaster.current.intersectObjects(meshList.current, false);

            if (intersects.length > 0) {
                const mesh = intersects[0].object;
                let target = mesh;
                while (target && (!target.name || target.name.startsWith('Object_') || target.name.startsWith('Mesh'))) {
                    target = target.parent;
                }
                const rawName = target?.name || mesh.name || "Unknown";
                // Use rawName directly instead of getPartName to show actual model names
                console.log('Clicked part raw name:', rawName);
                onPartClick(rawName);
            }
        };

        gl.domElement.addEventListener('click', handleClick);
        return () => gl.domElement.removeEventListener('click', handleClick);
    }, [camera, gl, onPartClick]);

    return (
        <primitive
            ref={groupRef}
            object={scene}
        />
    );
}

function Loader() {
    return (
        <Html center>
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading 3D Model...</p>
            </div>
        </Html>
    );
}

export default function SimulatorView() {
    const [searchParams] = useSearchParams();
    const initialSystem = searchParams.get('system') || 'engine';

    const [currentSystem, setCurrentSystem] = React.useState(initialSystem);
    const [selectedPart, setSelectedPart] = React.useState(null);
    const [hoveredPart, setHoveredPart] = React.useState(null);
    const [isExploded, setIsExploded] = React.useState(false);
    const [xrayMode, setXrayMode] = React.useState(false);

    // Diagnostic mode state
    const [diagnosticMode, setDiagnosticMode] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [relevantSystems, setRelevantSystems] = useState([]);


    const systems = [
        { id: 'engine', name: 'Engine', model: '/models/Engine.glb' },
        { id: 'transmission', name: 'Transmission', model: '/models/Transmission(No Anim).glb' },
        { id: 'suspension', name: 'Suspension', model: '/models/Suspension.glb' },
        { id: 'steering', name: 'Steering', model: '/models/Steering.glb' },
        { id: 'brakes', name: 'Brakes', model: '/models/BRAKE.glb' },
        { id: 'electrical', name: 'Electrical', model: '/models/Electrical.glb' },
    ];

    const currentModelUrl = systems.find(s => s.id === currentSystem)?.model;



    const handleSystemChange = (systemId) => {
        setCurrentSystem(systemId);
        setSelectedPart(null);
        setIsExploded(false);
        setXrayMode(false);
    };

    // Handle diagnostic complaint selection
    const handleComplaintSelect = (complaint) => {
        if (complaint) {
            setSelectedComplaint(complaint);
            setRelevantSystems(complaint.systems);
            // Auto-select the first relevant system
            if (complaint.systems.length > 0) {
                setCurrentSystem(complaint.systems[0]);
            }
        } else {
            setSelectedComplaint(null);
            setRelevantSystems([]);
        }
    };

    // Check if current system is relevant to the complaint
    const isSystemRelevant = (systemId) => {
        if (!diagnosticMode || relevantSystems.length === 0) return true;
        return relevantSystems.includes(systemId);
    };

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-4 p-4 bg-slate-50 dark:bg-slate-900">
            {/* Systems Panel */}
            <Card className="lg:w-64 p-4 flex-shrink-0 overflow-y-auto max-h-[calc(100vh-120px)]">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    3D Simulator
                </h2>

                {/* Diagnostic Mode Toggle */}
                <div className="mb-4">
                    <button
                        onClick={() => {
                            setDiagnosticMode(!diagnosticMode);
                            if (diagnosticMode) {
                                setSelectedComplaint(null);
                                setRelevantSystems([]);
                            }
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${diagnosticMode
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-2 border-amber-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        <Stethoscope size={18} />
                        <span className="font-medium">Diagnostic Mode</span>
                    </button>
                </div>

                {/* Complaint Selector (shown when diagnostic mode is on) */}
                {diagnosticMode && (
                    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <label className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block mb-2">
                            Customer Complaint
                        </label>
                        <select
                            value={selectedComplaint?.id || ''}
                            onChange={(e) => {
                                const complaint = PRESET_COMPLAINTS.find(c => c.id === e.target.value);
                                handleComplaintSelect(complaint || null);
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="">Select a complaint...</option>
                            {PRESET_COMPLAINTS.map(complaint => (
                                <option key={complaint.id} value={complaint.id}>
                                    {complaint.label}
                                </option>
                            ))}
                        </select>
                        {selectedComplaint && (
                            <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                                <span className="font-medium">Focus on: </span>
                                {selectedComplaint.systems.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-2">
                    {systems.map((system) => {
                        const isRelevant = isSystemRelevant(system.id);
                        return (
                            <button
                                key={system.id}
                                onClick={() => handleSystemChange(system.id)}
                                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${currentSystem === system.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20'
                                    : !isRelevant && diagnosticMode
                                        ? 'bg-slate-100/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <span className="font-medium">{system.name}</span>
                                {diagnosticMode && isRelevant && relevantSystems.length > 0 && (
                                    <AlertTriangle size={14} className="text-amber-500" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Controls */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                        View Controls
                    </h3>

                    <button
                        onClick={() => setIsExploded(!isExploded)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isExploded
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {isExploded ? <Box size={18} /> : <Layers size={18} />}
                        <span className="font-medium">{isExploded ? 'Assemble' : 'Explode'}</span>
                    </button>

                    <button
                        onClick={() => setXrayMode(!xrayMode)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${xrayMode
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        <Eye size={18} />
                        <span className="font-medium">X-Ray Mode</span>
                    </button>

                </div>
            </Card>

            {/* 3D Canvas */}
            <div className="flex-1 relative">
                <Card className="absolute inset-0 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
                    <Canvas
                        camera={{ position: [5, 5, 5], fov: 50 }}
                        gl={{
                            antialias: true,
                            powerPreference: 'high-performance',
                        }}
                        dpr={[1, 2]}
                        performance={{ min: 0.5 }}
                    >
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[10, 10, 5]} intensity={1} />
                        <directionalLight position={[-10, -10, -5]} intensity={0.5} />

                        <Suspense fallback={<Loader />}>
                            {currentModelUrl && (
                                <Model
                                    url={currentModelUrl}
                                    onPartClick={setSelectedPart}
                                    isExploded={isExploded}
                                    xrayMode={xrayMode}
                                    onHover={setHoveredPart}

                                    systemType={currentSystem}
                                />
                            )}
                        </Suspense>

                        <OrbitControls
                            makeDefault
                            enableDamping={false}
                        />
                    </Canvas>

                    {/* Hover tooltip */}
                    {hoveredPart && (
                        <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium pointer-events-none">
                            {hoveredPart}
                        </div>
                    )}

                    {/* Selected part info */}
                    {selectedPart && (
                        <div className="absolute bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-80">
                            <Card className="p-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur shadow-xl">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                                            {selectedPart}
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                            {getPartDescription(selectedPart)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedPart(null)}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </Card>
                        </div>
                    )}


                </Card>
            </div>
        </div>
    );
}
