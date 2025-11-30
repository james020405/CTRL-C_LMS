import React, { useState } from 'react';
import { Stethoscope, CheckCircle2, XCircle, Award } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { diagnosticCases } from '../../data/diagnosticCases';

export default function DiagnosticTraining() {
    const [selectedSystem, setSelectedSystem] = useState('brakes');
    const [selectedCase, setSelectedCase] = useState(null);
    const [currentPhase, setCurrentPhase] = useState('selection');
    const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
    const [showResults, setShowResults] = useState(false);

    const systems = Object.keys(diagnosticCases);
    const caseStudies = diagnosticCases[selectedSystem] || [];
    const activeCase = selectedCase ? caseStudies.find(c => c.id === selectedCase) : null;

    const startCase = (caseId) => {
        setSelectedCase(caseId);
        setCurrentPhase('briefing');
        setSelectedDiagnosis(null);
        setShowResults(false);
    };

    const submitDiagnosis = () => {
        setShowResults(true);
    };

    const resetCase = () => {
        setSelectedCase(null);
        setCurrentPhase('selection');
        setSelectedDiagnosis(null);
        setShowResults(false);
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
