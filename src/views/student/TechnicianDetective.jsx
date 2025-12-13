import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/input';
import {
    Wrench, Search, Car, Zap, Battery, Droplet, Gauge,
    ClipboardCheck, Trophy, RefreshCw, ArrowLeft, CheckCircle,
    XCircle, HelpCircle, ChevronRight, Plus, Trash2, Send, Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { generateTechnicianCase, runDiagnosticTest, evaluateTechnicianDiagnosis, askTechnicianToCheck } from '../../lib/gemini';
import { submitScore } from '../../lib/gameService';

const DIFFICULTY_CONFIG = {
    easy: {
        label: 'Easy',
        description: 'Pre-defined diagnostic tests',
        testsAllowed: 5,
        usePresetTests: true,
        color: 'emerald',
        multiplier: 1.0
    },
    medium: {
        label: 'Medium',
        description: 'Type your own diagnostic commands',
        testsAllowed: 3,
        usePresetTests: false,
        color: 'amber',
        multiplier: 1.5
    },
    hard: {
        label: 'Hard',
        description: 'Limited custom commands, no hints',
        testsAllowed: 2,
        usePresetTests: false,
        color: 'red',
        multiplier: 2.0
    }
};

const PRESET_TESTS = [
    { id: 'battery', label: 'Battery & Charging Test', icon: Battery, description: 'Test battery voltage and alternator output' },
    { id: 'scan', label: 'OBD-II Scan', icon: Zap, description: 'Read diagnostic trouble codes' },
    { id: 'visual', label: 'Detailed Visual Inspection', icon: Search, description: 'Thorough visual check of components' },
    { id: 'fluids', label: 'Fluid Level Check', icon: Droplet, description: 'Check all fluid levels and conditions' },
    { id: 'drive', label: 'Test Drive', icon: Car, description: 'Road test to observe symptoms' },
    { id: 'compression', label: 'Compression Test', icon: Gauge, description: 'Test engine compression per cylinder' },
    { id: 'pressure', label: 'Pressure Test', icon: Gauge, description: 'Fuel or coolant system pressure test' }
];

export default function TechnicianDetective() {
    const { user } = useAuth();
    const [gameState, setGameState] = useState('difficulty');
    const [difficulty, setDifficulty] = useState(null);
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [testsUsed, setTestsUsed] = useState([]);
    const [testResults, setTestResults] = useState([]);
    const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
    const [selectedParts, setSelectedParts] = useState([]);
    const [partInput, setPartInput] = useState('');
    const [result, setResult] = useState(null);
    const [score, setScore] = useState(0);
    // For custom test input (medium/hard)
    const [customTestInput, setCustomTestInput] = useState('');
    const [runningCustomTest, setRunningCustomTest] = useState(false);

    const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : null;

    const startGame = async (selectedDifficulty) => {
        setDifficulty(selectedDifficulty);
        setLoading(true);
        setTestsUsed([]);
        setTestResults([]);
        setSelectedDiagnosis(null);
        setSelectedParts([]);
        setPartInput('');
        setResult(null);
        setScore(0);
        setCustomTestInput('');

        try {
            const newCase = await generateTechnicianCase(selectedDifficulty);
            setCaseData(newCase);
            setGameState('investigation');
        } catch (error) {
            console.error('Error generating case:', error);
        } finally {
            setLoading(false);
        }
    };

    // Preset test (Easy mode)
    const performPresetTest = (testId) => {
        if (testsUsed.includes(testId)) return;
        if (testsUsed.length >= config?.testsAllowed) return;

        const testResult = runDiagnosticTest(caseData, testId);
        const test = PRESET_TESTS.find(t => t.id === testId);

        setTestsUsed(prev => [...prev, testId]);
        setTestResults(prev => [...prev, {
            command: test?.label || testId,
            result: testResult
        }]);
    };

    // Custom test via AI (Medium/Hard modes)
    const performCustomTest = async () => {
        if (!customTestInput.trim()) return;
        if (testsUsed.length >= config?.testsAllowed) return;

        setRunningCustomTest(true);
        try {
            // Use AI to interpret and respond to the custom command
            const response = await askTechnicianToCheck(caseData, customTestInput);

            setTestsUsed(prev => [...prev, `custom-${testsUsed.length}`]);
            setTestResults(prev => [...prev, {
                command: customTestInput,
                result: response
            }]);
            setCustomTestInput('');
        } catch (error) {
            console.error('Error running custom test:', error);
            // Fallback to basic response
            setTestResults(prev => [...prev, {
                command: customTestInput,
                result: 'Test completed. Unable to provide detailed results at this time.'
            }]);
            setTestsUsed(prev => [...prev, `custom-${testsUsed.length}`]);
            setCustomTestInput('');
        } finally {
            setRunningCustomTest(false);
        }
    };

    const addPart = () => {
        if (partInput.trim() && !selectedParts.includes(partInput.trim())) {
            setSelectedParts(prev => [...prev, partInput.trim()]);
            setPartInput('');
        }
    };

    const removePart = (part) => {
        setSelectedParts(prev => prev.filter(p => p !== part));
    };

    const proceedToDiagnosis = () => {
        setGameState('diagnosis');
    };

    const submitDiagnosis = async () => {
        if (!selectedDiagnosis) return;

        setLoading(true);
        try {
            const evaluation = evaluateTechnicianDiagnosis(
                caseData,
                selectedDiagnosis,
                selectedParts,
                testsUsed.length,
                config?.testsAllowed || 3
            );

            const multiplier = config?.multiplier || 1.0;
            const finalScore = Math.round(evaluation.scoreBreakdown.total * multiplier);
            setScore(finalScore);

            if (finalScore > 0) {
                await submitScore(user?.id, 'technician_detective', difficulty, finalScore);
            }

            setResult(evaluation);
            setGameState('result');
        } catch (error) {
            console.error('Error evaluating diagnosis:', error);
        } finally {
            setLoading(false);
        }
    };

    const playAgain = () => {
        setGameState('difficulty');
        setCaseData(null);
        setDifficulty(null);
        setTestsUsed([]);
        setTestResults([]);
        setSelectedDiagnosis(null);
        setSelectedParts([]);
        setResult(null);
        setScore(0);
        setCustomTestInput('');
    };

    if (loading && gameState === 'difficulty') {
        return (
            <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-cyan-500 mx-auto mb-4" />
                    <p className="text-slate-700 dark:text-slate-300 text-lg">Generating diagnostic case...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Search className="text-cyan-500" />
                        Technician Detective
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Diagnose vehicle problems like a real technician</p>
                </div>
                {gameState !== 'difficulty' && (
                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
                        <span className="text-slate-500 dark:text-slate-400">Score: </span>
                        <span className="text-cyan-600 dark:text-cyan-400 font-bold">{score}</span>
                    </div>
                )}
            </div>

            {/* Difficulty Selection */}
            {gameState === 'difficulty' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => (
                        <Card
                            key={key}
                            className={`p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-${cfg.color}-500`}
                            onClick={() => startGame(key)}
                        >
                            <div className={`w-12 h-12 rounded-full bg-${cfg.color}-100 dark:bg-${cfg.color}-900/30 flex items-center justify-center mb-4`}>
                                <Search className={`text-${cfg.color}-600 dark:text-${cfg.color}-400`} size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{cfg.label}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{cfg.description}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                                <span>{cfg.testsAllowed} tests</span>
                                <span>{cfg.multiplier}x score</span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Investigation Phase */}
            {gameState === 'investigation' && caseData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Case Information */}
                    <div className="space-y-6">
                        {/* Vehicle Info */}
                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Car className="text-cyan-500" size={24} />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{caseData.vehicle}</h3>
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                Mileage: {caseData.mileage?.toLocaleString()} km
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-2">Customer Complaint:</h4>
                                <p className="text-slate-700 dark:text-slate-300 italic">"{caseData.customerComplaint}"</p>
                            </div>
                        </Card>

                        {/* Initial Observations */}
                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Search className="text-amber-500" size={20} />
                                Initial Observations
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300">{caseData.initialObservations}</p>
                        </Card>

                        {/* Test Results */}
                        {testResults.length > 0 && (
                            <Card className="p-6">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <ClipboardCheck className="text-green-500" size={20} />
                                    Test Results ({testsUsed.length}/{config?.testsAllowed})
                                </h3>
                                <div className="space-y-3">
                                    {testResults.map((test, idx) => (
                                        <div key={idx} className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                                            <h4 className="text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-2">
                                                {test.command}
                                            </h4>
                                            <p className="text-slate-600 dark:text-slate-300 text-sm">{test.result}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Proceed Button */}
                        <Button
                            onClick={proceedToDiagnosis}
                            className="w-full"
                            disabled={testsUsed.length === 0}
                        >
                            Ready to Diagnose <ChevronRight size={16} className="ml-2" />
                        </Button>
                    </div>

                    {/* Right: Diagnostic Tests */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Zap className="text-yellow-500" size={20} />
                                Diagnostic Tests
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm ${testsUsed.length >= config?.testsAllowed
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}>
                                {config?.testsAllowed - testsUsed.length} remaining
                            </span>
                        </div>

                        {/* Easy Mode: Preset Test Buttons */}
                        {config?.usePresetTests && (
                            <div className="grid grid-cols-1 gap-3">
                                {PRESET_TESTS.map(test => {
                                    const isUsed = testsUsed.includes(test.id);
                                    const isDisabled = isUsed || testsUsed.length >= config?.testsAllowed;
                                    return (
                                        <button
                                            key={test.id}
                                            onClick={() => performPresetTest(test.id)}
                                            disabled={isDisabled}
                                            className={`flex items-center gap-4 p-4 rounded-lg text-left transition-all ${isUsed
                                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                                : isDisabled
                                                    ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed'
                                                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-transparent hover:border-cyan-500'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isUsed ? 'bg-green-100 dark:bg-green-900/50' : 'bg-slate-200 dark:bg-slate-700'
                                                }`}>
                                                {isUsed
                                                    ? <CheckCircle className="text-green-500" size={20} />
                                                    : <test.icon className="text-slate-500 dark:text-slate-400" size={20} />
                                                }
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-slate-900 dark:text-white">{test.label}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{test.description}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Medium/Hard Mode: Custom Test Input */}
                        {!config?.usePresetTests && (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                    Type your diagnostic command. Be specific about what you want to check or test.
                                </p>
                                <div className="flex gap-2">
                                    <Input
                                        value={customTestInput}
                                        onChange={(e) => setCustomTestInput(e.target.value)}
                                        placeholder="e.g., Check brake pad thickness, Test battery voltage..."
                                        className="flex-1"
                                        onKeyPress={(e) => e.key === 'Enter' && !runningCustomTest && performCustomTest()}
                                        disabled={testsUsed.length >= config?.testsAllowed || runningCustomTest}
                                    />
                                    <Button
                                        onClick={performCustomTest}
                                        disabled={!customTestInput.trim() || testsUsed.length >= config?.testsAllowed || runningCustomTest}
                                    >
                                        {runningCustomTest ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                    </Button>
                                </div>

                                {/* Example commands */}
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Example commands:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['Check brake pads', 'Test battery', 'Scan for codes', 'Inspect belt condition', 'Check coolant level'].map((cmd, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCustomTestInput(cmd)}
                                                disabled={testsUsed.length >= config?.testsAllowed}
                                                className="px-3 py-1 text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full hover:border-cyan-500 transition-colors disabled:opacity-50"
                                            >
                                                {cmd}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* Diagnosis Phase */}
            {gameState === 'diagnosis' && caseData && (
                <div className="max-w-3xl mx-auto space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <HelpCircle className="text-cyan-500" size={20} />
                            What is your diagnosis?
                        </h3>
                        <div className="grid gap-3">
                            {caseData.possibleDiagnoses?.map(diag => (
                                <button
                                    key={diag.id}
                                    onClick={() => setSelectedDiagnosis(diag.id)}
                                    className={`p-4 rounded-lg text-left transition-all ${selectedDiagnosis === diag.id
                                        ? 'bg-cyan-50 dark:bg-cyan-900/30 border-2 border-cyan-500'
                                        : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-2 border-transparent'
                                        }`}
                                >
                                    <span className="text-slate-900 dark:text-white font-medium">{diag.label}</span>
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Parts Selection */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Wrench className="text-amber-500" size={20} />
                            What parts are needed? (Optional)
                        </h3>
                        <div className="flex gap-2 mb-4">
                            <Input
                                value={partInput}
                                onChange={(e) => setPartInput(e.target.value)}
                                placeholder="Enter part name..."
                                onKeyPress={(e) => e.key === 'Enter' && addPart()}
                            />
                            <Button onClick={addPart} variant="outline">
                                <Plus size={16} />
                            </Button>
                        </div>
                        {selectedParts.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {selectedParts.map((part, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2"
                                    >
                                        {part}
                                        <button onClick={() => removePart(part)} className="hover:text-red-500">
                                            <Trash2 size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </Card>

                    <div className="flex gap-4">
                        <Button
                            onClick={() => setGameState('investigation')}
                            variant="outline"
                            className="flex-1"
                        >
                            <ArrowLeft size={16} className="mr-2" /> Back
                        </Button>
                        <Button
                            onClick={submitDiagnosis}
                            disabled={!selectedDiagnosis || loading}
                            className="flex-1"
                        >
                            {loading ? 'Evaluating...' : 'Submit Diagnosis'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Result Phase */}
            {gameState === 'result' && result && (
                <div className="max-w-2xl mx-auto">
                    <Card className={`p-8 text-center border-2 ${result.isCorrect
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        }`}>
                        <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${result.isCorrect ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'
                            }`}>
                            {result.isCorrect
                                ? <CheckCircle className="text-green-500" size={48} />
                                : <XCircle className="text-red-500" size={48} />
                            }
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            {result.isCorrect ? 'Correct Diagnosis!' : 'Incorrect Diagnosis'}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">{result.feedback}</p>

                        {/* Score Breakdown */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 mb-6 text-left border border-slate-200 dark:border-slate-700">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Trophy className="text-yellow-500" size={18} />
                                Score Breakdown
                            </h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg text-center">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Diagnosis</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{result.scoreBreakdown.diagnosis}</p>
                                    <p className="text-xs text-slate-400">/50</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg text-center">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Parts</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{result.scoreBreakdown.parts}</p>
                                    <p className="text-xs text-slate-400">/30</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg text-center">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Efficiency</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{result.scoreBreakdown.efficiency}</p>
                                    <p className="text-xs text-slate-400">/20</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600 flex justify-between items-center">
                                <span className="text-slate-600 dark:text-slate-300">Total Score (×{config?.multiplier}):</span>
                                <span className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{score}</span>
                            </div>
                        </div>

                        {/* Correct Parts */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 text-left border border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Correct Parts Needed:</p>
                            <div className="flex flex-wrap gap-2">
                                {result.correctParts?.map((part, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm">
                                        {part}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <Button onClick={playAgain} className="w-full">
                            <RefreshCw size={16} className="mr-2" /> Play Again
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
}
