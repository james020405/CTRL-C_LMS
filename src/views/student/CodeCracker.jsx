import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { generateCodeChallenge } from '../../lib/gemini';
import { getRemainingPlays, recordPlay, submitScore, SCORE_MULTIPLIERS } from '../../lib/gameService';
import { useAuth } from '../../contexts/AuthContext';
import DifficultySelector from '../../components/DifficultySelector';
import { Loader2, Cpu, CheckCircle, XCircle, RefreshCw, Trophy, Zap, BookOpen, Wrench, ArrowRight } from 'lucide-react';

// Game phases per round - all 3 modes combined
const PHASES = [
    { id: 'code_to_meaning', label: 'Phase 1: Identify', icon: BookOpen, description: 'What does this code mean?' },
    { id: 'symptoms_to_code', label: 'Phase 2: Recognize', icon: Zap, description: 'Match symptoms to codes' },
    { id: 'code_to_action', label: 'Phase 3: Diagnose', icon: Wrench, description: 'Choose the correct action' }
];

export default function CodeCracker() {
    const { user } = useAuth();
    const [gameState, setGameState] = useState('difficulty'); // difficulty, playing
    const [difficulty, setDifficulty] = useState(null);
    const [remainingPlays, setRemainingPlays] = useState({ easy: 5, medium: 5, hard: 2 });
    const [loading, setLoading] = useState(false);

    // Round state - cycles through all 3 phases
    const [currentPhase, setCurrentPhase] = useState(0); // 0, 1, 2
    const [challenges, setChallenges] = useState([]); // Pre-loaded challenges for all 3 phases
    const [currentChallenge, setCurrentChallenge] = useState(null);

    // Answer state
    const [selectedOption, setSelectedOption] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    // Scoring
    const [score, setScore] = useState(0);
    const [roundScore, setRoundScore] = useState(0); // Score for current round (all 3 phases)
    const [roundNumber, setRoundNumber] = useState(1);
    const [correctInRound, setCorrectInRound] = useState(0); // Track correct answers in current round

    // Load remaining plays on mount
    useEffect(() => {
        if (user?.id) {
            loadRemainingPlays();
        }
    }, [user?.id]);

    const loadRemainingPlays = async () => {
        const plays = await getRemainingPlays(user?.id, 'code_cracker');
        setRemainingPlays(plays);
    };

    const selectDifficulty = async (selectedDifficulty) => {
        setDifficulty(selectedDifficulty);
        setLoading(true);
        setGameState('playing');
        setScore(0);
        setRoundScore(0);
        setRoundNumber(1);
        setCurrentPhase(0);
        setCorrectInRound(0);

        try {
            // Record the play
            await recordPlay(user?.id, 'code_cracker', selectedDifficulty);
            await loadRemainingPlays();

            // Load all 3 challenges for the round
            await loadRound(selectedDifficulty);
        } catch (err) {
            console.error("Error starting game:", err);
        }
    };

    const loadRound = async (diff = difficulty) => {
        setLoading(true);
        setSelectedOption(null);
        setShowResult(false);
        setCurrentPhase(0);
        setRoundScore(0);
        setCorrectInRound(0);

        try {
            // Generate all 3 challenges in parallel
            const [challenge1, challenge2, challenge3] = await Promise.all([
                generateCodeChallenge(diff, 'code_to_meaning'),
                generateCodeChallenge(diff, 'symptoms_to_code'),
                generateCodeChallenge(diff, 'code_to_action')
            ]);

            setChallenges([challenge1, challenge2, challenge3]);
            setCurrentChallenge(challenge1);
        } catch (err) {
            console.error("Error loading round:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = async (optionId) => {
        if (showResult) return;

        setSelectedOption(optionId);
        setShowResult(true);

        const option = currentChallenge.options.find(o => o.id === optionId);
        const correct = option?.isCorrect || false;
        setIsCorrect(correct);

        if (correct) {
            // Points per phase
            const phasePoints = 50;
            const multiplier = SCORE_MULTIPLIERS[difficulty] || 1;
            const points = Math.round(phasePoints * multiplier);

            setRoundScore(prev => prev + points);
            setCorrectInRound(prev => prev + 1);
        }
    };

    const nextPhase = async () => {
        setSelectedOption(null);
        setShowResult(false);

        if (currentPhase < 2) {
            // Move to next phase
            const nextPhaseIndex = currentPhase + 1;
            setCurrentPhase(nextPhaseIndex);
            setCurrentChallenge(challenges[nextPhaseIndex]);
        } else {
            // Round complete - add round score to total and submit
            const finalRoundScore = roundScore;
            setScore(prev => prev + finalRoundScore);

            if (finalRoundScore > 0) {
                await submitScore(user?.id, 'code_cracker', difficulty, finalRoundScore);
            }

            // Start new round
            setRoundNumber(prev => prev + 1);
            await loadRound();
        }
    };

    const playAgain = () => {
        loadRemainingPlays();
        setGameState('difficulty');
        setDifficulty(null);
        setChallenges([]);
        setCurrentChallenge(null);
        setScore(0);
        setRoundScore(0);
        setRoundNumber(1);
    };

    // Loading state
    if (loading && !currentChallenge) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Cpu className="text-cyan-600" />
                            Code Cracker
                        </h1>
                        <p className="text-slate-500">Master OBD-II diagnostic codes.</p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center p-24 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
                    <Loader2 className="animate-spin text-cyan-600 mb-4" size={48} />
                    <p className="text-slate-500">Loading diagnostic challenge...</p>
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
                        <Cpu className="text-cyan-600" />
                        Code Cracker
                    </h1>
                    <p className="text-slate-500">Master OBD-II diagnostic codes.</p>
                </div>
                {gameState === 'playing' && (
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase">Round {roundNumber}</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                This round: +{roundScore} pts
                            </p>
                        </div>
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
            {gameState === 'playing' && currentChallenge && (
                <div className="space-y-4">
                    {/* Phase Progress Bar */}
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                {difficulty?.toUpperCase()}
                            </span>
                            <span className="text-sm text-slate-500">
                                {correctInRound}/3 correct this round
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {PHASES.map((phase, idx) => (
                                <div key={phase.id} className="flex-1 flex items-center gap-2">
                                    <div className={`flex-1 h-2 rounded-full transition-all ${idx < currentPhase ? 'bg-cyan-500' :
                                        idx === currentPhase ? 'bg-cyan-300 animate-pulse' :
                                            'bg-slate-300 dark:bg-slate-600'
                                        }`} />
                                    {idx < 2 && <ArrowRight className="text-slate-400" size={16} />}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2">
                            {PHASES.map((phase, idx) => (
                                <div key={phase.id} className={`text-xs flex-1 text-center ${idx === currentPhase ? 'text-cyan-600 font-bold' : 'text-slate-400'
                                    }`}>
                                    {phase.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Question Card */}
                    <Card className="p-8 border-l-4 border-l-cyan-500">
                        <div className="flex items-center gap-3 mb-4">
                            {React.createElement(PHASES[currentPhase].icon, {
                                className: "text-cyan-600",
                                size: 24
                            })}
                            <span className="text-sm font-medium text-cyan-600">
                                {PHASES[currentPhase].description}
                            </span>
                        </div>

                        {currentChallenge.code && (
                            <div className="mb-4">
                                <span className="inline-block px-4 py-2 bg-slate-900 dark:bg-slate-700 text-cyan-400 font-mono text-2xl font-bold rounded-lg">
                                    {currentChallenge.code}
                                </span>
                            </div>
                        )}
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                            {currentChallenge.question}
                        </h2>

                        {/* Options */}
                        <div className="space-y-3">
                            {currentChallenge.options.map((option) => {
                                const isSelected = selectedOption === option.id;
                                const isCorrectOption = option.isCorrect;

                                let optionClass = 'border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500';
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
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${optionClass} flex items-center gap-3`}
                                    >
                                        {showResult && isCorrectOption && (
                                            <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                                        )}
                                        {showResult && isSelected && !isCorrectOption && (
                                            <XCircle className="text-red-600 flex-shrink-0" size={24} />
                                        )}
                                        <span className={`flex-1 ${showResult && isCorrectOption ? 'font-bold text-green-700 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>
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
                                                +{Math.round(50 * (SCORE_MULTIPLIERS[difficulty] || 1))} points
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="text-red-600" size={32} />
                                        <div>
                                            <h3 className="font-bold text-red-800 dark:text-red-400 text-lg">Incorrect</h3>
                                            <p className="text-sm text-red-600 dark:text-red-500">No points this phase</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="bg-white/50 dark:bg-slate-700 p-4 rounded-lg mb-4">
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-2">Explanation</h4>
                                <p className="text-slate-600 dark:text-slate-300">{currentChallenge.explanation}</p>
                            </div>

                            {currentChallenge.correctAction && (
                                <div className="bg-blue-50 dark:bg-slate-700 border border-blue-200 dark:border-slate-600 p-4 rounded-lg">
                                    <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-1 flex items-center gap-2">
                                        <Wrench size={16} />
                                        Diagnostic Approach
                                    </h4>
                                    <p className="text-blue-700 dark:text-slate-300 text-sm">{currentChallenge.correctAction}</p>
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <Button
                                    onClick={nextPhase}
                                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : currentPhase < 2 ? (
                                        <>Next Phase <ArrowRight size={16} className="ml-2" /></>
                                    ) : (
                                        <>Next Round ({roundScore} pts earned)</>
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
