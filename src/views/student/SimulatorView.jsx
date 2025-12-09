import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Card } from '../../components/ui/Card';
import { X, Box, Layers, Eye, PlayCircle } from 'lucide-react';
import { getPartName, getPartDescription } from '../../data/partNames';

function Model({ url, onPartClick, isExploded, xrayMode, onHover, sequenceMode, sequenceStep, systemType }) {
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
                    const rawName = target?.name || mesh.name || "Unknown";
                    const partName = getPartName(rawName, systemType);
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
                const rawName = target?.name || e.object.name || "Unknown";
                const partName = getPartName(rawName, systemType);
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
            }, 500);

            return () => clearInterval(interval);
        } else {
            setSequenceStep(0);
        }
    }, [sequenceMode]);

    const handleSystemChange = (systemId) => {
        setCurrentSystem(systemId);
        setSelectedPart(null);
        setIsExploded(false);
        setXrayMode(false);
        setSequenceMode(false);
    };

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-4 p-4 bg-slate-50 dark:bg-slate-900">
            {/* Systems Panel */}
            <Card className="lg:w-64 p-4 flex-shrink-0">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    3D Simulator
                </h2>
                <div className="space-y-2">
                    {systems.map((system) => (
                        <button
                            key={system.id}
                            onClick={() => handleSystemChange(system.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-all ${currentSystem === system.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            <span className="font-medium">{system.name}</span>
                        </button>
                    ))}
                </div>

                {/* Controls */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                        View Controls
                    </h3>

                    <button
                        onClick={() => { setIsExploded(!isExploded); setSequenceMode(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isExploded && !sequenceMode
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

                    <button
                        onClick={() => { setSequenceMode(!sequenceMode); setIsExploded(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${sequenceMode
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        <PlayCircle size={18} />
                        <span className="font-medium">Sequence Mode</span>
                    </button>
                </div>
            </Card>

            {/* 3D Canvas */}
            <div className="flex-1 relative">
                <Card className="absolute inset-0 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
                    <Canvas
                        camera={{ position: [5, 5, 5], fov: 50 }}
                        gl={{ antialias: true }}
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
                                    sequenceMode={sequenceMode}
                                    sequenceStep={sequenceStep}
                                    systemType={currentSystem}
                                />
                            )}
                        </Suspense>

                        <OrbitControls
                            makeDefault
                            enableDamping
                            dampingFactor={0.05}
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

                    {/* Sequence progress */}
                    {sequenceMode && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-6 py-2 rounded-full text-sm font-medium">
                            Sequence Step: {sequenceStep} / 20
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
