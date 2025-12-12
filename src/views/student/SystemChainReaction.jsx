import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { generateChainReactionScenario } from '../../lib/gemini';
import { getRemainingPlays, recordPlay, submitScore, SCORE_MULTIPLIERS } from '../../lib/gameService';
import { useAuth } from '../../contexts/AuthContext';
import DifficultySelector from '../../components/DifficultySelector';
import {
    Loader2, Link2, CheckCircle, XCircle, RefreshCw, Trophy,
    AlertTriangle, Zap, ArrowRight, Info
} from 'lucide-react';

export default function SystemChainReaction() {
    const { user } = useAuth();
    const [gameState, setGameState] = useState('difficulty'); // difficulty, playing, result
    const [difficulty, setDifficulty] = useState(null);
    const [remainingPlays, setRemainingPlays] = useState({ easy: 5, medium: 5, hard: 2 });
    const [loading, setLoading] = useState(false);

    // Game state
    const [currentScenario, setCurrentScenario] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    // Scoring
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [roundNumber, setRoundNumber] = useState(1);

    // Load remaining plays on mount
    useEffect(() => {
        if (user?.id) {
            loadRemainingPlays();
        }
    }, [user?.id]);

    const loadRemainingPlays = async () => {
        const plays = await getRemainingPlays(user?.id, 'chain_reaction');
        setRemainingPlays(plays);
    };

    const selectDifficulty = async (selectedDifficulty) => {
        setDifficulty(selectedDifficulty);
        setLoading(true);
        setGameState('playing');
        setScore(0);
        setStreak(0);
        setRoundNumber(1);

        try {
            await recordPlay(user?.id, 'chain_reaction', selectedDifficulty);
            await loadRemainingPlays();
            loadScenario(selectedDifficulty);
        } catch (err) {
            console.error("Error starting game:", err);
        }
    };

    const loadScenario = async (diff = difficulty) => {
        setLoading(true);
        setSelectedOption(null);
        setShowResult(false);

        try {
            const scenario = await generateChainReactionScenario(diff);
            setCurrentScenario(scenario);
        } catch (err) {
            console.error("Error loading scenario:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = async (optionId) => {
        if (showResult) return;

        setSelectedOption(optionId);
        setShowResult(true);

        const option = currentScenario.options.find(o => o.id === optionId);
        const correct = option?.isCorrect || false;
        setIsCorrect(correct);

        if (correct) {
            const basePoints = 100;
            const multiplier = SCORE_MULTIPLIERS[difficulty] || 1;
            const streakBonus = Math.min(streak, 5) * 10;
            const points = Math.round((basePoints + streakBonus) * multiplier);

            setScore(prev => prev + points);
            setStreak(prev => prev + 1);

            await submitScore(user?.id, 'chain_reaction', difficulty, points);
        } else {
            setStreak(0);
        }
    };

    const nextRound = () => {
        setRoundNumber(prev => prev + 1);
        loadScenario();
    };

    const playAgain = () => {
        loadRemainingPlays();
        setGameState('difficulty');
        setDifficulty(null);
        setCurrentScenario(null);
        setScore(0);
        setStreak(0);
        setRoundNumber(1);
    };

    // Loading state
    if (loading && !currentScenario) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Link2 className="text-orange-600" />
                            System Chain Reaction
                        </h1>
                        <p className="text-slate-500">Predict how failures cascade through systems.</p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center p-24 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
                    <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
                    <p className="text-slate-500">Loading scenario...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Link2 className="text-orange-600" />
                        System Chain Reaction
                    </h1>
                    <p className="text-slate-500">Predict how failures cascade through systems.</p>
                </div>
                {gameState === 'playing' && (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-xl">
                            <Trophy className="text-yellow-500" />
                            <span className="font-bold text-yellow-700 dark:text-yellow-400">{score} pts</span>
                        </div>
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

            {/* Game Playing */}
            {gameState === 'playing' && currentScenario && (
                <div className="space-y-4">
                    {/* Difficulty Badge */}
                    <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                            {difficulty?.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Zap size={16} className="text-orange-500" />
                            Systems: {currentScenario.systems?.join(', ')}
                        </div>
                    </div>

                    {/* Primary Failure Card */}
                    <Card className="p-6 border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white dark:from-red-900/10 dark:to-slate-800">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                                <AlertTriangle className="text-red-600" size={28} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
                                    Primary Failure
                                </p>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {currentScenario.primaryFailure}
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Affected System: {currentScenario.affectedSystem}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Scenario Description */}
                    <Card className="p-6">
                        <div className="flex items-start gap-3">
                            <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Customer Presents With:</p>
                                <p className="text-slate-700 dark:text-slate-300">{currentScenario.scenario}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Question */}
                    <Card className="p-6 border-l-4 border-l-orange-500">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            What is the chain reaction effect?
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                            Select the correct sequence of events that occurs due to this failure:
                        </p>

                        {/* Options */}
                        <div className="space-y-3">
                            {currentScenario.options.map((option) => {
                                const isSelected = selectedOption === option.id;
                                const isCorrectOption = option.isCorrect;

                                let optionClass = 'border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500';
                                if (showResult) {
                                    if (isCorrectOption) {
                                        optionClass = 'border-green-500 bg-green-50 dark:bg-green-900/20';
                                    } else if (isSelected && !isCorrectOption) {
                                        optionClass = 'border-red-500 bg-red-50 dark:bg-red-900/20';
                                    } else {
                                        optionClass = 'border-slate-200 dark:border-slate-700 opacity-50';
                                    }
                                }

                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => handleOptionSelect(option.id)}
                                        disabled={showResult}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${optionClass} flex items-start gap-3`}
                                    >
                                        {showResult && isCorrectOption && (
                                            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                                        )}
                                        {showResult && isSelected && !isCorrectOption && (
                                            <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                                        )}
                                        <span className={`flex-1 text-sm ${showResult && isCorrectOption ? 'font-bold text-green-700 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {option.text}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Result & Explanation */}
                    {showResult && (
                        <Card className={`p-6 ${isCorrect ? 'bg-green-50 dark:bg-slate-800 border-l-4 border-l-green-500' : 'bg-red-50 dark:bg-slate-800 border-l-4 border-l-red-500'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                {isCorrect ? (
                                    <>
                                        <CheckCircle className="text-green-600" size={32} />
                                        <div>
                                            <h3 className="font-bold text-green-800 dark:text-green-400 text-lg">Correct! 🎉</h3>
                                            <p className="text-sm text-green-600 dark:text-green-500">
                                                +{Math.round((100 + Math.min(streak - 1, 5) * 10) * (SCORE_MULTIPLIERS[difficulty] || 1))} points
                                                {streak > 1 && ` (${streak} streak bonus!)`}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="text-red-600" size={32} />
                                        <div>
                                            <h3 className="font-bold text-red-800 dark:text-red-400 text-lg">Incorrect</h3>
                                            <p className="text-sm text-red-600 dark:text-red-500">Streak reset to 0</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="bg-white/50 dark:bg-slate-700 p-4 rounded-lg mb-4">
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2">
                                    <Link2 size={16} className="text-orange-500" />
                                    Chain Reaction Explained
                                </h4>
                                <p className="text-slate-600 dark:text-slate-300 text-sm">{currentScenario.explanation}</p>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button
                                    onClick={nextRound}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <>Next Scenario <ArrowRight size={16} className="ml-2" /></>
                                    )}
                                </Button>
                                <Button variant="ghost" onClick={playAgain}>
                                    <RefreshCw size={16} className="mr-2" />
                                    New Game
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
