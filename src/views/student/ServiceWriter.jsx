import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/input';
import { generateServiceCustomer, evaluateEstimate, askCustomerQuestion, askTechnicianToCheck } from '../../lib/gemini';
import { getRemainingPlays, recordPlay, submitScore, SCORE_MULTIPLIERS } from '../../lib/gameService';
import { useAuth } from '../../contexts/AuthContext';
import DifficultySelector from '../../components/DifficultySelector';
import { Loader2, User, Car, FileText, CheckCircle, XCircle, Calculator, RefreshCw, MessageSquare, Trophy, HelpCircle, Send, Wrench, ClipboardList, Stethoscope } from 'lucide-react';

// Question limits per difficulty
const QUESTION_LIMITS = {
    easy: 5,
    medium: 3,
    hard: 1
};

export default function ServiceWriter() {
    const { user } = useAuth();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [gameState, setGameState] = useState('difficulty'); // difficulty, estimating, result
    const [difficulty, setDifficulty] = useState(null);
    const [remainingPlays, setRemainingPlays] = useState({ easy: 5, medium: 5, hard: 2 });

    // Estimate State
    const [parts, setParts] = useState([{ name: '', cost: '' }]);
    const [laborHours, setLaborHours] = useState('');
    const [laborRate, setLaborRate] = useState(500);
    const [notes, setNotes] = useState('');
    const [result, setResult] = useState(null);
    const [score, setScore] = useState(0);

    // Question State
    const [questionsRemaining, setQuestionsRemaining] = useState(0);
    const [questionInput, setQuestionInput] = useState('');
    const [questionHistory, setQuestionHistory] = useState([]);
    const [askingQuestion, setAskingQuestion] = useState(false);
    const askingRef = useRef(false); // Ref to prevent race condition with double-submit

    // Technician Command State (1 command allowed per game)
    const [technicianCommandUsed, setTechnicianCommandUsed] = useState(false);
    const [technicianCommandInput, setTechnicianCommandInput] = useState('');
    const [technicianCommandResponse, setTechnicianCommandResponse] = useState(null);
    const [sendingTechCommand, setSendingTechCommand] = useState(false);

    // Load remaining plays on mount
    useEffect(() => {
        if (user?.id) {
            loadRemainingPlays();
        }
    }, [user?.id]);

    const loadRemainingPlays = async () => {
        const plays = await getRemainingPlays(user?.id, 'service_writer');
        setRemainingPlays(plays);
    };

    const selectDifficulty = async (selectedDifficulty) => {
        setDifficulty(selectedDifficulty);
        setLoading(true);
        setGameState('estimating');
        setResult(null);
        setParts([{ name: '', cost: '' }]);
        setLaborHours('');
        setNotes('');
        setScore(0);
        setQuestionsRemaining(QUESTION_LIMITS[selectedDifficulty] || 3);
        setQuestionHistory([]);
        setQuestionInput('');
        // Reset technician command state
        setTechnicianCommandUsed(false);
        setTechnicianCommandInput('');
        setTechnicianCommandResponse(null);

        try {
            // Record the play and immediately update remaining plays
            await recordPlay(user?.id, 'service_writer', selectedDifficulty);
            await loadRemainingPlays(); // Refresh count immediately

            const newCustomer = await generateServiceCustomer(selectedDifficulty);
            setCustomer(newCustomer);
        } catch (err) {
            console.error("Error starting scenario:", err);
        } finally {
            setLoading(false);
        }
    };

    const addPart = () => setParts([...parts, { name: '', cost: '' }]);

    const updatePart = (index, field, value) => {
        const newParts = [...parts];
        newParts[index][field] = value;
        setParts(newParts);
    };

    const removePart = (index) => setParts(parts.filter((_, i) => i !== index));

    // Handle asking a question to the customer
    const handleAskQuestion = async () => {
        // Use ref for immediate check to prevent race condition
        if (!questionInput.trim() || questionsRemaining <= 0 || askingRef.current) return;

        askingRef.current = true; // Immediately block further calls
        setAskingQuestion(true);
        try {
            const response = await askCustomerQuestion(customer, questionInput, questionHistory);
            setQuestionHistory([...questionHistory, {
                question: questionInput,
                answer: response
            }]);
            setQuestionsRemaining(prev => prev - 1);
            setQuestionInput('');
        } catch (err) {
            console.error("Error asking question:", err);
        } finally {
            askingRef.current = false;
            setAskingQuestion(false);
        }
    };

    // Handle sending a command to the technician (1 allowed per game)
    const handleTechnicianCommand = async () => {
        if (!technicianCommandInput.trim() || technicianCommandUsed || sendingTechCommand) return;

        setSendingTechCommand(true);
        try {
            const response = await askTechnicianToCheck(customer, technicianCommandInput);
            setTechnicianCommandResponse({
                command: technicianCommandInput,
                response: response
            });
            setTechnicianCommandUsed(true);
            setTechnicianCommandInput('');
        } catch (err) {
            console.error("Error sending technician command:", err);
        } finally {
            setSendingTechCommand(false);
        }
    };

    const calculateTotal = () => {
        const partsTotal = parts.reduce((sum, part) => sum + (parseFloat(part.cost) || 0), 0);
        const laborTotal = (parseFloat(laborHours) || 0) * laborRate;
        return { partsTotal, laborTotal, grandTotal: partsTotal + laborTotal };
    };

    // Validation: Check if estimate is complete enough to submit
    const validateEstimate = () => {
        // Must have at least 1 part with a name AND cost
        const validParts = parts.filter(p => p.name.trim() !== '' && parseFloat(p.cost) > 0);
        if (validParts.length === 0) return { valid: false, error: 'Add at least 1 part with name and cost' };

        // Must have labor hours specified
        if (!laborHours || parseFloat(laborHours) <= 0) return { valid: false, error: 'Enter labor hours' };

        return { valid: true, error: null };
    };

    // Calculate parts accuracy score (how many correct parts the student identified)
    const calculatePartsAccuracy = () => {
        if (!customer?.correctParts || customer.correctParts.length === 0) return { matched: 0, total: 0, accuracy: 0 };

        const studentParts = parts.filter(p => p.name.trim()).map(p => p.name.toLowerCase());
        const correctParts = customer.correctParts.map(p => p.toLowerCase());

        // Count how many correct parts were included
        let matchedCount = 0;
        correctParts.forEach(correct => {
            const found = studentParts.some(student =>
                student.includes(correct) || correct.includes(student)
            );
            if (found) matchedCount++;
        });

        return {
            matched: matchedCount,
            total: correctParts.length,
            accuracy: correctParts.length > 0 ? (matchedCount / correctParts.length) * 100 : 0
        };
    };

    const submitEstimate = async () => {
        // Double-check validation
        const validation = validateEstimate();
        if (!validation.valid) return;

        setLoading(true);
        const totals = calculateTotal();
        const partsAccuracy = calculatePartsAccuracy();
        const evaluation = await evaluateEstimate(customer, totals, notes);

        let type = '';
        let baseScore = 0;

        // Scoring now factors in BOTH price acceptance AND parts accuracy!
        // - 50 points max from customer acceptance (price within budget, good communication)
        // - 50 points max from parts accuracy (identifying correct parts)

        if (evaluation.outcome === 'Accepted') {
            type = 'success';
            baseScore = 50; // Customer happy with price
        } else if (evaluation.outcome === 'Negotiated') {
            type = 'warning';
            baseScore = 25; // Partial credit for close price
        } else {
            type = 'error';
            baseScore = 0;
        }

        // Add parts accuracy bonus (up to 50 points)
        const partsBonus = Math.round((partsAccuracy.accuracy / 100) * 50);
        baseScore += partsBonus;

        // Apply difficulty multiplier
        const multiplier = SCORE_MULTIPLIERS[difficulty] || 1;
        const finalScore = Math.round(baseScore * multiplier);
        setScore(finalScore);

        // Only submit positive scores to leaderboard
        if (finalScore > 0) {
            await submitScore(user?.id, 'service_writer', difficulty, finalScore);
        }

        setResult({
            outcome: evaluation.outcome,
            message: evaluation.message,
            feedback: evaluation.feedback,
            correctApproach: evaluation.correctApproach,
            idealEstimate: evaluation.idealEstimate,
            type,
            grandTotal: totals.grandTotal,
            partsAccuracy // Include parts accuracy in result for display
        });

        setGameState('result');
        setLoading(false);
    };

    const playAgain = () => {
        loadRemainingPlays();
        setGameState('difficulty');
        setCustomer(null);
        setDifficulty(null);
    };

    if (loading && gameState !== 'difficulty') {
        return (
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FileText className="text-blue-600" />
                            Service Writer Simulator
                        </h1>
                        <p className="text-slate-500">Master the art of the estimate.</p>
                    </div>
                </div>
                <div className="flex items-center justify-center p-24 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
                    <Loader2 className="animate-spin text-blue-600" size={48} />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="text-blue-600 flex-shrink-0" size={24} />
                        <span className="hidden sm:inline">Service Writer Simulator</span>
                        <span className="sm:hidden">Service Writer</span>
                    </h1>
                    <p className="text-slate-500 text-sm sm:text-base">Master the art of the estimate.</p>
                </div>
                {score > 0 && (
                    <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-3 sm:px-4 py-2 rounded-xl">
                        <Trophy className="text-yellow-500" size={18} />
                        <span className="font-bold text-yellow-700 dark:text-yellow-400">{score} pts</span>
                    </div>
                )}
            </div>

            {/* Difficulty Selection */}
            {gameState === 'difficulty' && (
                <Card className="p-8">
                    <DifficultySelector
                        remainingPlays={remainingPlays}
                        onSelect={selectDifficulty}
                        loading={loading}
                    />
                </Card>
            )}

            {/* Game UI */}
            {gameState !== 'difficulty' && customer && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Customer Profile */}
                    <div className="space-y-6">
                        <Card className="p-6 border-l-4 border-l-purple-500">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                                    <User className="text-purple-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{customer.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">{customer.mood}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                            difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>{difficulty?.toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                    <Car size={18} className="text-slate-400" />
                                    <span className="font-mono">{customer.vehicle}</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg italic text-slate-600 dark:text-slate-400">
                                    "{customer.dialogue_start}"
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Complaint</h4>
                                    <p className="text-slate-900 dark:text-white">{customer.complaint}</p>
                                </div>
                            </div>
                        </Card>

                        {/* Technician Report - shown during estimating */}
                        {gameState === 'estimating' && customer.technicianReport && (
                            <Card className="p-6 border-l-4 border-l-orange-500">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                                    <ClipboardList size={20} className="text-orange-600" />
                                    Technician Report
                                </h3>

                                {/* Initial Findings */}
                                <div className="bg-orange-50 dark:bg-slate-800 border border-orange-200 dark:border-slate-700 p-4 rounded-lg mb-4">
                                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium uppercase tracking-wider mb-1">Initial Inspection:</p>
                                    <p className="text-slate-700 dark:text-slate-300 text-sm font-mono">
                                        {customer.technicianReport}
                                    </p>
                                </div>

                                {/* Additional Technician Command - 1 per game */}
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Stethoscope size={18} className="text-purple-600" />
                                            <span className="font-medium text-slate-900 dark:text-white">Request Additional Diagnosis</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${!technicianCommandUsed
                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                            {technicianCommandUsed ? 'Used' : '1 command left'}
                                        </span>
                                    </div>

                                    {/* Command Input */}
                                    {!technicianCommandUsed && (
                                        <div className="flex gap-2">
                                            <Input
                                                value={technicianCommandInput}
                                                onChange={(e) => setTechnicianCommandInput(e.target.value)}
                                                placeholder="e.g., Check compression, Test fuel pressure, Scan for codes..."
                                                disabled={sendingTechCommand}
                                                onKeyPress={(e) => e.key === 'Enter' && handleTechnicianCommand()}
                                                className="flex-1"
                                            />
                                            <Button
                                                onClick={handleTechnicianCommand}
                                                disabled={!technicianCommandInput.trim() || sendingTechCommand}
                                                className="bg-purple-600 hover:bg-purple-700 px-4"
                                            >
                                                {sendingTechCommand ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                            </Button>
                                        </div>
                                    )}

                                    {/* Command Response */}
                                    {technicianCommandResponse && (
                                        <div className="mt-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4 rounded-lg">
                                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase tracking-wider mb-1">
                                                Your Request: "{technicianCommandResponse.command}"
                                            </p>
                                            <p className="text-slate-700 dark:text-slate-300 text-sm font-mono mt-2">
                                                {technicianCommandResponse.response}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 italic">
                                    Based on the diagnosis, determine the parts needed and create your estimate.
                                </p>
                            </Card>
                        )
                        }

                        {/* Ask Customer Questions */}
                        {
                            gameState === 'estimating' && (
                                <Card className="p-6 border-l-4 border-l-blue-500">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                            <HelpCircle size={20} className="text-blue-600" />
                                            Ask the Customer
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${questionsRemaining > 2 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            questionsRemaining > 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {questionsRemaining} question{questionsRemaining !== 1 ? 's' : ''} left
                                        </span>
                                    </div>

                                    {/* Question History */}
                                    {questionHistory.length > 0 && (
                                        <div className="mb-4 space-y-3 max-h-48 overflow-y-auto">
                                            {questionHistory.map((qa, idx) => (
                                                <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                                                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                                                        You: "{qa.question}"
                                                    </p>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                                                        {customer.name}: "{qa.answer}"
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Question Input */}
                                    {questionsRemaining > 0 ? (
                                        <div className="flex gap-2">
                                            <Input
                                                value={questionInput}
                                                onChange={(e) => setQuestionInput(e.target.value)}
                                                placeholder="Ask about symptoms, when it started, maintenance history..."
                                                className="flex-1"
                                                onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                                                disabled={askingQuestion}
                                            />
                                            <Button
                                                onClick={handleAskQuestion}
                                                disabled={!questionInput.trim() || askingQuestion}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                                            >
                                                {askingQuestion ? (
                                                    <Loader2 className="animate-spin" size={18} />
                                                ) : (
                                                    <Send size={18} />
                                                )}
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center italic">
                                            No more questions available. Make your estimate based on the information gathered!
                                        </p>
                                    )}

                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                                        Tip: Ask about sounds, smells, when it happens, or recent maintenance
                                    </p>
                                </Card>
                            )
                        }

                        {/* Result Display */}
                        {
                            gameState === 'result' && (
                                <Card className={`p-6 border-l-4 ${result.type === 'success' ? 'border-l-green-500 bg-green-50 dark:bg-slate-800' :
                                    result.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50 dark:bg-slate-800' :
                                        'border-l-red-500 bg-red-50 dark:bg-slate-800'
                                    }`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        {result.type === 'success' && <CheckCircle className="text-green-600 dark:text-green-400" />}
                                        {result.type === 'warning' && <CheckCircle className="text-yellow-600 dark:text-yellow-400" />}
                                        {result.type === 'error' && <XCircle className="text-red-600 dark:text-red-400" />}
                                        <h3 className={`font-bold text-lg ${result.type === 'success' ? 'text-green-800 dark:text-green-400' : result.type === 'warning' ? 'text-yellow-800 dark:text-yellow-400' : 'text-red-800 dark:text-red-400'}`}>{result.outcome}</h3>
                                        {score > 0 && <span className="ml-auto text-sm font-bold text-blue-600 dark:text-blue-400">+{score} pts</span>}
                                    </div>
                                    <p className="italic text-lg mb-4 text-slate-700 dark:text-slate-300">"{result.message}"</p>
                                    {result.feedback && (
                                        <div className="bg-white/50 dark:bg-slate-700 p-3 rounded-lg text-sm mb-4">
                                            <span className="font-bold text-slate-700 dark:text-slate-200">AI Feedback:</span> <span className="text-slate-600 dark:text-slate-300">{result.feedback}</span>
                                        </div>
                                    )}

                                    {/* Correct Approach - shows on rejection/negotiation */}
                                    {result.correctApproach && (
                                        <div className="bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 p-4 rounded-lg mb-4">
                                            <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-2 flex items-center gap-2">
                                                Correct Approach
                                            </h4>
                                            <p className="text-blue-700 dark:text-slate-300 text-sm mb-2">
                                                {result.correctApproach}
                                            </p>
                                            {result.idealEstimate && (
                                                <div className="text-sm font-mono bg-blue-100 dark:bg-slate-700 text-blue-800 dark:text-blue-300 px-3 py-2 rounded inline-block">
                                                    Ideal Estimate: <span className="font-bold">₱{result.idealEstimate.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Parts Comparison - always show after game ends */}
                                    {customer.actualProblem && (
                                        <div className="bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 p-4 rounded-lg mb-4">
                                            <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
                                                <Wrench size={18} />
                                                Diagnosis: {customer.actualProblem}
                                            </h4>

                                            {/* Your Parts */}
                                            <div className="mb-3">
                                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Your Parts:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {parts.filter(p => p.name.trim()).length > 0 ? (
                                                        parts.filter(p => p.name.trim()).map((part, idx) => {
                                                            const isCorrect = customer.correctParts?.some(cp =>
                                                                cp.toLowerCase().includes(part.name.toLowerCase()) ||
                                                                part.name.toLowerCase().includes(cp.toLowerCase())
                                                            );
                                                            return (
                                                                <span key={idx} className={`px-2 py-1 text-xs rounded-full ${isCorrect ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                                                    {isCorrect ? '✓' : '✗'} {part.name}
                                                                </span>
                                                            );
                                                        })
                                                    ) : (
                                                        <span className="text-xs text-slate-500 italic">No parts listed</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Correct Parts */}
                                            {customer.correctParts && customer.correctParts.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-medium text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-2">Correct Parts Needed:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {customer.correctParts.map((part, idx) => {
                                                            const wasListed = parts.some(p =>
                                                                p.name.toLowerCase().includes(part.toLowerCase()) ||
                                                                part.toLowerCase().includes(p.name.toLowerCase())
                                                            );
                                                            return (
                                                                <span key={idx} className={`px-2 py-1 text-xs rounded-full ${wasListed ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-slate-700 text-amber-800 dark:text-amber-300'}`}>
                                                                    {wasListed ? '✓' : '○'} {part}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Score Breakdown */}
                                    {result.partsAccuracy && (
                                        <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg mb-4">
                                            <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                                                <Trophy size={16} className="text-yellow-500" />
                                                Score Breakdown
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Price Acceptance</p>
                                                    <p className="font-bold text-lg text-slate-900 dark:text-white">
                                                        {result.type === 'success' ? '50' : result.type === 'warning' ? '25' : '0'}/50 pts
                                                    </p>
                                                    <p className="text-xs text-slate-400">{result.outcome}</p>
                                                </div>
                                                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Parts Accuracy</p>
                                                    <p className="font-bold text-lg text-slate-900 dark:text-white">
                                                        {Math.round(result.partsAccuracy.accuracy / 2)}/50 pts
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {result.partsAccuracy.matched}/{result.partsAccuracy.total} correct parts
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="text-sm text-slate-500">
                                        Customer Budget: ₱{customer.budget.toLocaleString()} <br />
                                        Your Estimate: ₱{result.grandTotal.toLocaleString()}
                                    </div>
                                    <Button onClick={playAgain} className="mt-4 w-full">
                                        <RefreshCw className="mr-2" size={16} /> Play Again
                                    </Button>
                                </Card>
                            )
                        }
                    </div >

                    {/* Right: Estimate Builder */}
                    < div className="space-y-6" >
                        <Card className="p-6">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <Calculator size={20} />
                                Repair Estimate
                            </h3>
                            <div className="space-y-6">
                                {/* Parts */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Parts</label>
                                        <Button variant="ghost" size="sm" onClick={addPart} disabled={gameState === 'result'}>+ Add Part</Button>
                                    </div>
                                    <div className="space-y-2">
                                        {parts.map((part, index) => (
                                            <div key={index} className="flex gap-2">
                                                <Input
                                                    placeholder="Part Name"
                                                    value={part.name}
                                                    onChange={(e) => updatePart(index, 'name', e.target.value)}
                                                    disabled={gameState === 'result'}
                                                    className="flex-1"
                                                />
                                                <div className="relative w-32">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₱</span>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={part.cost}
                                                        onChange={(e) => updatePart(index, 'cost', e.target.value)}
                                                        disabled={gameState === 'result'}
                                                        className="pl-8"
                                                    />
                                                </div>
                                                {parts.length > 1 && (
                                                    <Button variant="ghost" size="icon" onClick={() => removePart(index)} disabled={gameState === 'result'}>
                                                        <XCircle size={16} className="text-red-400" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Labor */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Labor</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-xs text-slate-500">Hours</span>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 2.5"
                                                value={laborHours}
                                                onChange={(e) => setLaborHours(e.target.value)}
                                                disabled={gameState === 'result'}
                                            />
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-500">Rate (₱/hr)</span>
                                            <Input
                                                type="number"
                                                value={laborRate}
                                                onChange={(e) => setLaborRate(e.target.value)}
                                                disabled={gameState === 'result'}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                        <MessageSquare size={16} />
                                        Notes to Customer
                                    </label>
                                    <textarea
                                        className="w-full p-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Explain the repair to the customer..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        disabled={gameState === 'result'}
                                    />
                                </div>

                                {/* Totals */}
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
                                    <div className="flex justify-between text-sm text-slate-500">
                                        <span>Parts Total:</span>
                                        <span>₱{calculateTotal().partsTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-500">
                                        <span>Labor Total:</span>
                                        <span>₱{calculateTotal().laborTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg text-slate-900 dark:text-white pt-2">
                                        <span>Grand Total:</span>
                                        <span>₱{calculateTotal().grandTotal.toLocaleString()}</span>
                                    </div>
                                </div>

                                {gameState !== 'result' && (() => {
                                    const validation = validateEstimate();
                                    return (
                                        <div className="space-y-2">
                                            {!validation.valid && (
                                                <p className="text-sm text-red-500 dark:text-red-400 text-center">
                                                    ⚠️ {validation.error}
                                                </p>
                                            )}
                                            <Button
                                                onClick={submitEstimate}
                                                disabled={loading || !validation.valid}
                                                className={`w-full ${validation.valid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-400 cursor-not-allowed'} text-white`}
                                            >
                                                {loading ? <Loader2 className="animate-spin mr-2" /> : 'Present Estimate'}
                                            </Button>
                                        </div>
                                    );
                                })()}
                            </div>
                        </Card>
                    </div >
                </div >
            )
            }
        </div >
    );
}
