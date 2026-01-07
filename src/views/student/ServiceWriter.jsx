import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/input';
import { generateServiceCustomer, evaluateEstimate, askCustomerQuestion } from '../../lib/gemini';
import { getRemainingPlays, recordPlay, submitScore, SCORE_MULTIPLIERS } from '../../lib/gameService';
import { useAuth } from '../../contexts/AuthContext';
import DifficultySelector from '../../components/DifficultySelector';
import { Loader2, User, Car, FileText, CheckCircle, XCircle, Calculator, RefreshCw, MessageSquare, Trophy, HelpCircle, Send, Wrench, ClipboardList, Stethoscope, Check } from 'lucide-react';

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

    // Multiple Choice State (NEW - replaces old estimate builder)
    const [selectedOption, setSelectedOption] = useState(null);
    const [notes, setNotes] = useState('');
    const [result, setResult] = useState(null);
    const [score, setScore] = useState(0);

    // Question State
    const [questionsRemaining, setQuestionsRemaining] = useState(0);
    const [questionInput, setQuestionInput] = useState('');
    const [questionHistory, setQuestionHistory] = useState([]);
    const [askingQuestion, setAskingQuestion] = useState(false);
    const askingRef = useRef(false);



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
        setSelectedOption(null); // Reset multiple choice selection
        setNotes('');
        setScore(0);
        setQuestionsRemaining(QUESTION_LIMITS[selectedDifficulty] || 3);
        setQuestionHistory([]);
        setQuestionInput('');


        try {
            // Record the play and immediately update remaining plays
            await recordPlay(user?.id, 'service_writer', selectedDifficulty);
            await loadRemainingPlays();

            const newCustomer = await generateServiceCustomer(selectedDifficulty);
            setCustomer(newCustomer);
        } catch (err) {
            console.error("Error starting scenario:", err);
        } finally {
            setLoading(false);
        }
    };

    // Handle asking a question to the customer
    const handleAskQuestion = async () => {
        if (!questionInput.trim() || questionsRemaining <= 0 || askingRef.current) return;

        askingRef.current = true;
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



    // Calculate total for a given estimate option
    const calculateOptionTotal = (option) => {
        if (!option) return 0;
        const partsTotal = option.parts?.reduce((sum, p) => sum + (p.cost || 0), 0) || 0;
        const laborTotal = (option.laborHours || 0) * (option.laborRate || 500);
        return partsTotal + laborTotal;
    };

    // Submit the selected answer
    const submitAnswer = async () => {
        if (!selectedOption) return;

        setLoading(true);

        const chosen = customer.estimateOptions?.find(o => o.id === selectedOption);
        const isCorrect = selectedOption === customer.correctAnswer;
        const chosenTotal = calculateOptionTotal(chosen);

        // Simple scoring: correct answer = high score, wrong = low score
        // Communication/notes adds bonus points
        let baseScore = isCorrect ? 80 : 20;

        // Add communication bonus (up to 20 points for notes)
        const notesBonus = notes.trim().length > 50 ? 20 : notes.trim().length > 20 ? 10 : 0;
        baseScore += notesBonus;

        // Apply difficulty multiplier
        const multiplier = SCORE_MULTIPLIERS[difficulty] || 1;
        const finalScore = Math.round(baseScore * multiplier);
        setScore(finalScore);

        // Submit score
        if (finalScore > 0) {
            await submitScore(user?.id, 'service_writer', difficulty, finalScore);
        }

        setResult({
            isCorrect,
            selectedOption,
            correctAnswer: customer.correctAnswer,
            chosenEstimate: chosen,
            correctEstimate: customer.estimateOptions?.find(o => o.id === customer.correctAnswer),
            allOptions: customer.estimateOptions,
            grandTotal: chosenTotal,
            type: isCorrect ? 'success' : 'error',
            notesBonus
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
                <DifficultySelector
                    remainingPlays={remainingPlays}
                    onSelect={selectDifficulty}
                    loading={loading}
                    customConfig={{
                        easy: { description: 'Friendly customers, clear problems' },
                        medium: { description: 'Mixed moods, tighter budgets' },
                        hard: { description: 'Demanding customers, complex issues' }
                    }}
                />
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
                                <Card className={`p-6 border-l-4 ${result.isCorrect
                                    ? 'border-l-green-500 bg-green-50 dark:bg-slate-800'
                                    : 'border-l-red-500 bg-red-50 dark:bg-slate-800'
                                    }`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        {result.isCorrect ? (
                                            <CheckCircle className="text-green-600 dark:text-green-400" size={28} />
                                        ) : (
                                            <XCircle className="text-red-600 dark:text-red-400" size={28} />
                                        )}
                                        <h3 className={`font-bold text-xl ${result.isCorrect ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
                                            {result.isCorrect ? 'Correct!' : 'Incorrect'}
                                        </h3>
                                        {score > 0 && (
                                            <span className="ml-auto text-sm font-bold text-blue-600 dark:text-blue-400">+{score} pts</span>
                                        )}
                                    </div>

                                    {/* Diagnosis */}
                                    {customer.actualProblem && (
                                        <div className="bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 p-4 rounded-lg mb-4">
                                            <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
                                                <Wrench size={18} />
                                                Actual Problem
                                            </h4>
                                            <p className="text-slate-700 dark:text-slate-300">
                                                {customer.actualProblem}
                                            </p>
                                        </div>
                                    )}

                                    {/* Your Choice vs Correct Answer */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className={`p-4 rounded-lg border-2 ${result.isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
                                            <p className="text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">Your Choice: Option {result.selectedOption}</p>
                                            <p className="font-bold text-lg text-slate-900 dark:text-white">
                                                ₱{result.grandTotal?.toLocaleString()}
                                            </p>
                                        </div>
                                        {!result.isCorrect && (
                                            <div className="p-4 rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
                                                <p className="text-xs font-bold uppercase tracking-wider mb-2 text-green-600">Correct: Option {result.correctAnswer}</p>
                                                <p className="font-bold text-lg text-slate-900 dark:text-white">
                                                    ₱{(result.correctEstimate?.parts?.reduce((s, p) => s + (p.cost || 0), 0) || 0 + (result.correctEstimate?.laborHours || 0) * (result.correctEstimate?.laborRate || 500)).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Notes Bonus */}
                                    {result.notesBonus > 0 && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4 text-center">
                                            <span className="text-blue-600 dark:text-blue-400 font-bold">
                                                📝 Notes Bonus: +{result.notesBonus} pts
                                            </span>
                                        </div>
                                    )}

                                    <div className="text-sm text-slate-500 mb-4">
                                        Customer Budget: ₱{customer.budget.toLocaleString()}
                                    </div>

                                    <Button onClick={playAgain} className="w-full">
                                        <RefreshCw className="mr-2" size={16} /> Play Again
                                    </Button>
                                </Card>
                            )
                        }
                    </div>

                    {/* Right: Multiple Choice Estimate Selection */}
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Calculator size={20} />
                                Choose the Best Repair Estimate
                            </h3>

                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                Review the technician's findings and select the most appropriate repair estimate for this customer.
                            </p>

                            {/* Multiple Choice Options */}
                            <div className="space-y-3">
                                {customer.estimateOptions?.map((option) => {
                                    const partsTotal = option.parts?.reduce((sum, p) => sum + (p.cost || 0), 0) || 0;
                                    const laborTotal = (option.laborHours || 0) * (option.laborRate || 500);
                                    const grandTotal = partsTotal + laborTotal;
                                    const isSelected = selectedOption === option.id;

                                    return (
                                        <div
                                            key={option.id}
                                            onClick={() => gameState !== 'result' && setSelectedOption(option.id)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${gameState === 'result'
                                                ? option.id === customer.correctAnswer
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                    : option.id === selectedOption
                                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                        : 'border-slate-200 dark:border-slate-700 opacity-50'
                                                : isSelected
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                                                }`}
                                        >
                                            {/* Option Header */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isSelected
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                                        }`}>
                                                        {option.id}
                                                    </span>
                                                    <span className="font-bold text-slate-900 dark:text-white">
                                                        Option {option.id}
                                                    </span>
                                                    {isSelected && gameState !== 'result' && (
                                                        <Check className="text-blue-500" size={18} />
                                                    )}
                                                    {gameState === 'result' && option.id === customer.correctAnswer && (
                                                        <span className="text-green-600 text-xs font-bold">✓ CORRECT</span>
                                                    )}
                                                    {gameState === 'result' && option.id === selectedOption && option.id !== customer.correctAnswer && (
                                                        <span className="text-red-600 text-xs font-bold">✗ YOUR CHOICE</span>
                                                    )}
                                                </div>
                                                <span className="text-lg font-bold text-slate-900 dark:text-white">
                                                    ₱{grandTotal.toLocaleString()}
                                                </span>
                                            </div>

                                            {/* Parts List */}
                                            <div className="mb-2">
                                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Parts:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {option.parts?.map((part, idx) => (
                                                        <span key={idx} className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                            {part.name} <span className="text-slate-400">₱{part.cost?.toLocaleString()}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Labor */}
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span>Labor: {option.laborHours}hrs × ₱{option.laborRate}/hr = ₱{laborTotal.toLocaleString()}</span>
                                            </div>

                                            {/* Show explanation after result */}
                                            {gameState === 'result' && (
                                                <div className={`mt-3 pt-3 border-t text-sm ${option.id === customer.correctAnswer
                                                    ? 'text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                                                    : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                                    }`}>
                                                    {option.explanation}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Notes to Customer */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                    <MessageSquare size={16} />
                                    Notes to Customer
                                    <span className="text-xs text-slate-400">(bonus points for detailed explanation)</span>
                                </label>
                                <textarea
                                    className="w-full p-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Explain the repair to the customer... (more detailed = more bonus points)"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    disabled={gameState === 'result'}
                                />
                            </div>

                            {/* Submit Button */}
                            {gameState !== 'result' && (
                                <div className="mt-4">
                                    {!selectedOption && (
                                        <p className="text-sm text-amber-500 text-center mb-2">
                                            ⚠️ Select an estimate option above
                                        </p>
                                    )}
                                    <Button
                                        onClick={submitAnswer}
                                        disabled={loading || !selectedOption}
                                        className={`w-full ${selectedOption ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-400 cursor-not-allowed'} text-white`}
                                    >
                                        {loading ? <Loader2 className="animate-spin mr-2" /> : 'Submit Answer'}
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            )
            }
        </div >
    );
}
