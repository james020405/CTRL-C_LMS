import React, { useState } from 'react';
import { Settings, Zap, Activity, Box, Disc, Move, Truck, X } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

const systems = [
    { id: 'engine', name: 'Engine', icon: Settings, desc: 'The heart of the vehicle, converting fuel into mechanical energy.', components: ['Pistons', 'Crankshaft', 'Camshaft', 'Valves'] },
    { id: 'transmission', name: 'Transmission', icon: Box, desc: 'Transfers power from the engine to the wheels.', components: ['Gears', 'Clutch', 'Torque Converter', 'Driveshaft'] },
    { id: 'suspension', name: 'Suspension', icon: Activity, desc: 'Maximizes friction between tires and road for stability.', components: ['Springs', 'Shock Absorbers', 'Struts', 'Control Arms'] },
    { id: 'steering', name: 'Steering', icon: Move, desc: 'Allows the driver to control the direction of the vehicle.', components: ['Steering Wheel', 'Rack and Pinion', 'Tie Rods', 'Power Steering Pump'] },
    { id: 'brakes', name: 'Brakes', icon: Disc, desc: 'Slowing and stopping the vehicle safely.', components: ['Brake Pads', 'Rotors', 'Calipers', 'Master Cylinder'] },
    { id: 'electrical', name: 'Electrical', icon: Zap, desc: 'Power supply and electronics management.', components: ['Battery', 'Alternator', 'Starter', 'Wiring Harness'] },
    { id: 'body', name: 'Body & Chassis', icon: Truck, desc: 'The structural framework and outer shell.', components: ['Frame', 'Body Panels', 'Bumpers', 'Crumple Zones'] },
];

export default function SevenSystems() {
    const [active, setActive] = useState(null);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
            {systems.map((sys) => (
                <Card
                    key={sys.id}
                    onClick={() => setActive(sys)}
                    className="cursor-pointer hover:border-blue-500 hover:shadow-md flex flex-col items-center gap-3 text-center group"
                >
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <sys.icon size={32} />
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{sys.name}</h3>
                </Card>
            ))}

            {active && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" onClick={() => setActive(null)}>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                <active.icon className="text-blue-600 dark:text-blue-400" />
                                {active.name}
                            </h2>
                            <button onClick={() => setActive(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X size={24} />
                            </button>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">{active.desc}</p>

                        <div className="mb-6">
                            <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Key Components:</h4>
                            <ul className="grid grid-cols-2 gap-2">
                                {active.components.map((comp, idx) => (
                                    <li key={idx} className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-md border border-slate-100 dark:border-slate-700">
                                        {comp}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => window.location.href = `/student/simulator?system=${active.id}`}
                        >
                            Launch Simulator
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
