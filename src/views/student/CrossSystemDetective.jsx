import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, CheckCircle2, XCircle, ArrowRight, Loader2, Trophy, RefreshCw, Zap, Link2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { generateCrossSystemCase, evaluateCrossSystemDiagnosis } from '../../lib/gemini';
import { getRemainingPlays, recordPlay, submitScore } from '../../lib/gameService';
import DifficultySelector from '../../components/DifficultySelector';

const SCORE_MULTIPLIERS = { easy: 1, medium: 1.5, hard: 2 };

export default function CrossSystemDetective() {
    const { user } = useAuth();

    // Game state
    const [gameState, setGameState] = useState('difficulty'); // difficulty, playing, result
    const [difficulty, setDifficulty] = useState(null);
    const [currentCase, setCurrentCase] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [result, setResult] = useState(null);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(false);
    const [remainingPlays, setRemainingPlays] = useState(null);

    // Load remaining plays
    useEffect(() => {
        if (user?.id) {
            loadRemainingPlays();
        }
    }, [user?.id]);

    const loadRemainingPlays = async () => {
        const plays = await getRemainingPlays(user?.id, 'cross_system');
        setRemainingPlays(plays);
    };

    const selectDifficulty = async (selectedDifficulty) => {
        setDifficulty(selectedDifficulty);
        setLoading(true);
        setGameState('playing');
        setSelectedOption(null);
        setResult(null);
        setScore(0);

        try {
            await recordPlay(user?.id, 'cross_system', selectedDifficulty);
            await loadRemainingPlays();

            const newCase = await generateCrossSystemCase(selectedDifficulty);
            setCurrentCase(newCase);
        } catch (err) {
            console.error("Error starting case:", err);
        } finally {
            setLoading(false);
        }
    };

    const submitDiagnosis = async () => {
        if (!selectedOption) return;

        setLoading(true);
        const evaluation = evaluateCrossSystemDiagnosis(currentCase, selectedOption);

        // Calculate score
        let finalScore = 0;
        if (evaluation.isCorrect) {
            const baseScore = 100;
            const multiplier = SCORE_MULTIPLIERS[difficulty] || 1;
            finalScore = Math.round(baseScore * multiplier);
            await submitScore(user?.id, 'cross_system', difficulty, finalScore);
        }

        setScore(finalScore);
        setResult(evaluation);
        setGameState('result');
        setLoading(false);
    };

    const playAgain = () => {
        loadRemainingPlays();
        setGameState('difficulty');
        setCurrentCase(null);
        setDifficulty(null);
        setSelectedOption(null);
        setResult(null);
        setScore(0);
    };

    // Loading state
    if (loading && gameState === 'playing' && !currentCase) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Link2 className="text-purple-600" />
                            Cross-System Detective
                        </h1>
                        <p className="text-slate-500">Trace problems across interconnected systems</p>
                    </div>
                </div>
                <div className="flex items-center justify-center p-24 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
                    <div className="text-center">
                        <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
                        <p className="text-slate-600 dark:text-slate-400">Generating mystery case...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Link2 className="text-purple-600" />
                        Cross-System Detective
                    </h1>
                    <p className="text-slate-500">Trace problems across interconnected systems</p>
                </div>
                {score > 0 && (
                    <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-xl">
                        <Trophy className="text-yellow-500" />
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

            {/* Game Playing State */}
            {gameState !== 'difficulty' && currentCase && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Case Info */}
                    <div className="space-y-6">
                        {/* Case Title & Info */}
                        <Card className="p-6 border-l-4 border-l-purple-500">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                        {currentCase.title}
                                    </h2>
                                    <span className={`text-xs px-2 py-1 rounded-full ${difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                        difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {difficulty?.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                {currentCase.vehicleInfo}
                            </div>

                            {/* Customer Complaint */}
                            <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-r-lg mb-4">
                                <div className="text-xs font-bold text-orange-800 dark:text-orange-300 uppercase mb-1">
                                    Customer Says:
                                </div>
                                <p className="text-orange-900 dark:text-orange-100 italic">
                                    "{currentCase.customerComplaint}"
                                </p>
                            </div>

                            {/* Symptom Info */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold mb-2">
                                    <AlertTriangle size={18} />
                                    Symptom Appears In: {currentCase.symptomSystem}
                                </div>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                    {currentCase.symptomDescription}
                                </p>
                            </div>
                        </Card>

                        {/* Clues Panel */}
                        <Card className="p-6 border-l-4 border-l-amber-500">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                <Search size={20} className="text-amber-600" />
                                Investigation Clues
                            </h3>
                            <div className="space-y-3">
                                {currentCase.clues?.map((clue, idx) => (
                                    <div key={clue.id || idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                        <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-sm font-bold text-amber-700 dark:text-amber-400 flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-slate-700 dark:text-slate-300">{clue.text}</p>
                                            <span className="text-xs text-slate-500 dark:text-slate-500">
                                                System: {clue.system}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Diagnosis */}
                    <div className="space-y-6">
                        {/* Diagnosis Options */}
                        {gameState === 'playing' && (
                            <Card className="p-6 border-l-4 border-l-green-500">
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                    <Zap size={20} className="text-green-600" />
                                    What's the ROOT CAUSE?
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    Remember: The problem might originate from a DIFFERENT system!
                                </p>
                                <div className="space-y-3">
                                    {currentCase.options?.map(option => (
                                        <button
                                            key={option.id}
                                            onClick={() => setSelectedOption(option.id)}
                                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedOption === option.id
                                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'
                                                }`}
                                        >
                                            <div className="font-medium text-slate-900 dark:text-white">
                                                {option.label}
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                                {option.description}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <Button
                                    onClick={submitDiagnosis}
                                    disabled={!selectedOption || loading}
                                    className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
                                >
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                    Submit Diagnosis
                                </Button>
                            </Card>
                        )}

                        {/* Results */}
                        {gameState === 'result' && result && (
                            <Card className={`p-6 border-l-4 ${result.isCorrect ? 'border-l-green-500 bg-green-50 dark:bg-green-900/10' : 'border-l-red-500 bg-red-50 dark:bg-red-900/10'}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    {result.isCorrect ? (
                                        <>
                                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                                            <h3 className="text-2xl font-bold text-green-900 dark:text-green-100">
                                                Correct!
                                            </h3>
                                            {score > 0 && (
                                                <span className="ml-auto text-sm font-bold text-purple-600 dark:text-purple-400">+{score} pts</span>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-8 h-8 text-red-600" />
                                            <h3 className="text-2xl font-bold text-red-900 dark:text-red-100">
                                                Not Quite
                                            </h3>
                                        </>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {/* Your Answer vs Correct */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                                            <div className="text-xs font-medium text-slate-500 uppercase mb-1">Your Answer</div>
                                            <div className={`font-medium ${result.isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                                {result.selectedAnswer}
                                            </div>
                                        </div>
                                        {!result.isCorrect && (
                                            <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                                                <div className="text-xs font-medium text-slate-500 uppercase mb-1">Correct Answer</div>
                                                <div className="font-medium text-green-700 dark:text-green-300">
                                                    {result.correctAnswer}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* System Connection Chain */}
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <div className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase mb-2 flex items-center gap-2">
                                            <Link2 size={14} />
                                            System Connection
                                        </div>
                                        <div className="text-sm font-mono text-purple-900 dark:text-purple-100">
                                            {result.systemConnection}
                                        </div>
                                    </div>

                                    {/* Explanation */}
                                    <div>
                                        <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-2">
                                            Explanation
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">
                                            {result.explanation}
                                        </p>
                                    </div>

                                    {/* Correct Parts */}
                                    {result.correctParts && (
                                        <div>
                                            <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-2">
                                                Parts Needed
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {result.correctParts.map((part, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-full text-sm text-slate-700 dark:text-slate-300">
                                                        {part}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    onClick={playAgain}
                                    className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
                                >
                                    <RefreshCw size={18} className="mr-2" />
                                    Play Again
                                </Button>
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
