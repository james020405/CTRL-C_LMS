import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Card } from '../../components/ui/Card';
import { X, Box, Layers, Eye, PlayCircle } from 'lucide-react';

function Model({ url, onPartClick, isExploded, xrayMode, onHover, sequenceMode, sequenceStep }) {
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

    // Log available animations
    useEffect(() => {
        if (hasAnimations) {
            console.log(`Found ${animations.length} animations in model:`, animations.map(a => a.name));
            console.log('Available actions:', Object.keys(actions));
        } else {
            console.log('No animations found in model, using manual explosion');
        }
    }, [animations, actions, hasAnimations]);

    useEffect(() => {
        const bbox = new THREE.Box3().setFromObject(scene);
        const modelCenter = bbox.getCenter(new THREE.Vector3());

        meshList.current = [];
        partsData.current.clear();

        let partIndex = 0;
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

        console.log(`Loaded ${meshList.current.length} meshes`);
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
                    console.log('Playing disassembly animation');
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
                    console.log('Playing assembly animation (reverse)');
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

    // Only use manual explosion if no animations available
    useFrame((state, delta) => {
        if (hasAnimations) {
            // Animation mixer handles movement, we just need to update it
            return;
        }

        // Fall back to manual explosion for models without animations
        let explosionDistance = 0;

        if (sequenceMode) {
            for (let i = 0; i < meshList.current.length; i++) {
                const child = meshList.current[i];
                const data = partsData.current.get(child.uuid);

                if (data) {
                    const partProgress = Math.max(0, Math.min(1, (sequenceStep - data.partIndex) / 3));
                    const partExplosion = partProgress * 0.5;

                    const offset = data.explosionDirection.clone().multiplyScalar(partExplosion);
                    const targetPos = data.originalPosition.clone().add(offset);

                    child.position.lerp(targetPos, delta * 2);
                }
            }
        } else if (isExploded) {
            explosionDistance = 0.3;

            for (let i = 0; i < meshList.current.length; i++) {
                const child = meshList.current[i];
                const data = partsData.current.get(child.uuid);

                if (data) {
                    const offset = data.explosionDirection.clone().multiplyScalar(explosionDistance);
                    const targetPos = data.originalPosition.clone().add(offset);

                    if (child.position.distanceTo(targetPos) > 0.01) {
                        child.position.lerp(targetPos, delta * 1.2);
                    }
                }
            }
        } else {
            for (let i = 0; i < meshList.current.length; i++) {
                const child = meshList.current[i];
                const data = partsData.current.get(child.uuid);

                if (data && child.position.distanceTo(data.originalPosition) > 0.01) {
                    child.position.lerp(data.originalPosition, delta * 1.2);
                }
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
                    const partName = target?.name || mesh.name || "Unknown Component";
                    onHover?.(partName);
                }
            }
        };

        gl.domElement.addEventListener('mousemove', handleMouseMove);
        return () => gl.domElement.removeEventListener('mousemove', handleMouseMove);
    }, [camera, gl, onHover]);

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
                onPartClick(partName);
            }}
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
    const [currentSystem, setCurrentSystem] = React.useState('engine');
    const [selectedPart, setSelectedPart] = React.useState(null);
    const [hoveredPart, setHoveredPart] = React.useState(null);
    const [isExploded, setIsExploded] = React.useState(false);
    const [xrayMode, setXrayMode] = React.useState(false);
    const [sequenceMode, setSequenceMode] = React.useState(false);
    const [sequenceStep, setSequenceStep] = React.useState(0);

    const systems = [
        { id: 'engine', name: 'Engine', model: '/models/Engine.glb' },
        { id: 'transmission', name: 'Transmission', model: '/models/Transmission(No Anim).glb' },
        { id: 'suspension', name: 'Suspension', model: '/models/Suspension.glb' },
        { id: 'steering', name: 'Steering', model: '/models/Steering.glb' },
        { id: 'brakes', name: 'Brakes', model: '/models/BRAKE.glb' },
        { id: 'electrical', name: 'Electrical', model: '/models/Electrical.glb' },
    ];

    const currentModelUrl = systems.find(s => s.id === currentSystem)?.model;

    useEffect(() => {
        if (sequenceMode) {
            const interval = setInterval(() => {
                setSequenceStep(prev => {
                    if (prev >= 20) {
                        return 0;
                    }
                    return prev + 1;
                });
            }, 200);
            return () => clearInterval(interval);
        } else {
            setSequenceStep(0);
        }
    }, [sequenceMode]);

    React.useEffect(() => {
        return () => {
            systems.forEach(sys => {
                if (sys.id !== currentSystem && sys.model) {
                    useGLTF.clear(sys.model);
                }
            });
        };
    }, [currentSystem]);

    React.useEffect(() => {
        setSelectedPart(null);
        setIsExploded(false);
        setXrayMode(false);
        setSequenceMode(false);
    }, [currentSystem]);

    const toggleSequence = () => {
        setSequenceMode(!sequenceMode);
        setIsExploded(false);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Interactive Simulator</h1>
                    <p className="text-slate-600 dark:text-slate-400">Practice disassembly and assembly in a 3D environment.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => { setIsExploded(!isExploded); setSequenceMode(false); }}
                        disabled={sequenceMode}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isExploded
                            ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
                            } disabled:opacity-50`}
                    >
                        {isExploded ? <Box size={20} /> : <Layers size={20} />}
                        {isExploded ? 'Assemble' : 'Disassemble'}
                    </button>

                    <button
                        onClick={toggleSequence}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${sequenceMode
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                    >
                        <PlayCircle size={20} />
                        Sequence
                    </button>

                    <button
                        onClick={() => setXrayMode(!xrayMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${xrayMode
                            ? 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                    >
                        <Eye size={20} />
                        X-Ray
                    </button>
                </div>
            </div>

            <Card className="aspect-video w-full bg-slate-900 flex flex-col overflow-hidden relative">
                <Canvas
                    dpr={1}
                    camera={{ fov: 50, position: [5, 5, 5] }}
                    gl={{
                        antialias: false,
                        powerPreference: "high-performance"
                    }}
                >
                    <Suspense fallback={<Loader />}>
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[10, 10, 5]} intensity={0.8} />
                        <directionalLight position={[-10, -10, -5]} intensity={0.3} />

                        {currentModelUrl && (
                            <Model
                                key={currentModelUrl}
                                url={currentModelUrl}
                                onPartClick={setSelectedPart}
                                onHover={setHoveredPart}
                                isExploded={isExploded}
                                xrayMode={xrayMode}
                                sequenceMode={sequenceMode}
                                sequenceStep={sequenceStep}
                            />
                        )}

                        <OrbitControls
                            makeDefault
                            enableDamping={false}
                        />
                    </Suspense>
                </Canvas>

                {hoveredPart && !selectedPart && (
                    <div className="absolute top-4 left-4 bg-slate-800/90 text-white px-3 py-2 rounded-lg text-sm pointer-events-none">
                        {hoveredPart}
                    </div>
                )}

                {selectedPart && (
                    <div className="absolute top-4 right-4 w-72 bg-white/95 dark:bg-slate-800/95 backdrop-blur p-4 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-10 animate-in fade-in slide-in-from-right-4 duration-200">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg break-words">{selectedPart}</h3>
                            <button
                                onClick={() => setSelectedPart(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                Selected component from the <strong>{systems.find(s => s.id === currentSystem)?.name}</strong> system.
                            </p>
                            <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/50 p-2 rounded">
                                Status: Functional<br />
                                Condition: Good<br />
                                Material: Steel Alloy
                            </div>
                        </div>
                    </div>
                )}

                <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 pointer-events-auto">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">
                                    {systems.find(s => s.id === currentSystem)?.name} System
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Hover: Highlight • Click: Inspect • <strong>Use mode buttons above</strong>
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {systems.map((sys) => (
                                    <button
                                        key={sys.id}
                                        onClick={() => setCurrentSystem(sys.id)}
                                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${currentSystem === sys.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                                            }`}
                                    >
                                        {sys.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
