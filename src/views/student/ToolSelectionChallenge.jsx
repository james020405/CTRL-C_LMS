import React, { useState, useEffect } from 'react';
import { Wrench, CheckCircle2, XCircle, Loader2, RefreshCw, Trophy, Lightbulb, ArrowRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { getToolSelectionTask, evaluateToolSelection, getRemainingToolSelectionPlays, getToolSelectionTaskCounts, resetToolSelectionHistory } from '../../data/toolSelectionTasks';
import { submitScore } from '../../lib/gameService';
import DifficultySelector from '../../components/DifficultySelector';

// Option button component
function OptionButton({ option, isSelected, isCorrect, showResult, onSelect, disabled }) {
    const getStyles = () => {
        if (showResult) {
            if (isCorrect) {
                return 'border-green-500 bg-green-50 dark:bg-green-900/30 ring-2 ring-green-500/50';
            }
            if (isSelected && !isCorrect) {
                return 'border-red-500 bg-red-50 dark:bg-red-900/30 ring-2 ring-red-500/50';
            }
            return 'border-slate-200 dark:border-slate-700 opacity-50';
        }
        if (isSelected) {
            return 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 ring-2 ring-orange-500/50';
        }
        return 'border-slate-200 dark:border-slate-700 hover:border-orange-300 hover:bg-slate-50 dark:hover:bg-slate-800';
    };

    return (
        <button
            onClick={() => onSelect(option.id)}
            disabled={disabled || showResult}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${getStyles()} ${disabled ? 'cursor-not-allowed' : ''}`}
        >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${showResult && isCorrect ? 'bg-green-500 text-white' :
                showResult && isSelected && !isCorrect ? 'bg-red-500 text-white' :
                    isSelected ? 'bg-orange-500 text-white' :
                        'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                {option.id.toUpperCase()}
            </div>
            <span className="text-slate-900 dark:text-white font-medium flex-1">
                {option.text}
            </span>
            {showResult && isCorrect && (
                <CheckCircle2 className="text-green-500 flex-shrink-0" size={24} />
            )}
            {showResult && isSelected && !isCorrect && (
                <XCircle className="text-red-500 flex-shrink-0" size={24} />
            )}
        </button>
    );
}

export default function ToolSelectionChallenge() {
    const { user } = useAuth();

    // Game state
    const [gameState, setGameState] = useState('difficulty'); // difficulty, question, twist, result, completed
    const [difficulty, setDifficulty] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [twistAnswer, setTwistAnswer] = useState(null);
    const [mainResult, setMainResult] = useState(null);
    const [twistResult, setTwistResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [remainingPlays, setRemainingPlays] = useState(null);
    const [totalScore, setTotalScore] = useState(0);

    // Load remaining plays
    useEffect(() => {
        loadRemainingPlays();
    }, []);

    const loadRemainingPlays = () => {
        const plays = getRemainingToolSelectionPlays();
        setRemainingPlays(plays);
    };

    const selectDifficulty = async (selectedDifficulty) => {
        setDifficulty(selectedDifficulty);
        setLoading(true);
        setSelectedAnswer(null);
        setTwistAnswer(null);
        setMainResult(null);
        setTwistResult(null);
        setTotalScore(0);

        try {
            const question = getToolSelectionTask(selectedDifficulty);

            if (question === null) {
                setGameState('completed');
            } else {
                setCurrentQuestion(question);
                setGameState('question');
            }

            loadRemainingPlays();
        } catch (err) {
            console.error("Error starting question:", err);
        } finally {
            setLoading(false);
        }
    };

    const submitMainAnswer = async () => {
        if (!selectedAnswer) return;

        setLoading(true);
        const evaluation = evaluateToolSelection(currentQuestion, selectedAnswer, false);
        setMainResult(evaluation);
        setTotalScore(prev => prev + evaluation.score);

        // Move to twist question if available, otherwise show result
        if (currentQuestion.twist) {
            setGameState('twist');
        } else {
            if (evaluation.score > 0) {
                await submitScore(user?.id, 'tool_selection', difficulty, evaluation.score);
            }
            setGameState('result');
        }
        setLoading(false);
    };

    const submitTwistAnswer = async () => {
        if (!twistAnswer) return;

        setLoading(true);
        const evaluation = evaluateToolSelection(currentQuestion, twistAnswer, true);
        setTwistResult(evaluation);
        const newTotal = totalScore + evaluation.score;
        setTotalScore(newTotal);

        // Submit combined score
        if (newTotal > 0) {
            await submitScore(user?.id, 'tool_selection', difficulty, newTotal);
        }

        setGameState('result');
        setLoading(false);
    };

    const playAgain = () => {
        loadRemainingPlays();
        setGameState('difficulty');
        setCurrentQuestion(null);
        setDifficulty(null);
        setSelectedAnswer(null);
        setTwistAnswer(null);
        setMainResult(null);
        setTwistResult(null);
        setTotalScore(0);
    };

    // Loading state
    if (loading && gameState === 'question' && !currentQuestion) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Wrench className="text-orange-600" />
                            Tool Challenge
                        </h1>
                        <p className="text-slate-500">Test your automotive tool knowledge</p>
                    </div>
                </div>
                <div className="flex items-center justify-center p-24 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
                    <div className="text-center">
                        <Loader2 className="animate-spin text-orange-600 mx-auto mb-4" size={48} />
                        <p className="text-slate-600 dark:text-slate-400">Loading question...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Wrench className="text-orange-600" />
                        Tool Challenge
                    </h1>
                    <p className="text-slate-500">Test your automotive tool knowledge</p>
                </div>
                {gameState !== 'difficulty' && gameState !== 'completed' && (
                    <div className="text-right">
                        <div className="text-sm text-slate-500">Score</div>
                        <div className="text-2xl font-bold text-orange-600">{totalScore}</div>
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
                        easy: { description: 'Basic tool identification' },
                        medium: { description: 'Specialized tools & applications' },
                        hard: { description: 'Expert diagnostics & techniques' }
                    }}
                />
            )}

            {/* Main Question */}
            {gameState === 'question' && currentQuestion && (
                <div className="space-y-6">
                    <Card className="p-6 border-l-4 border-l-orange-500">
                        <div className="flex items-start justify-between mb-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                {difficulty?.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-lg text-slate-900 dark:text-white leading-relaxed">
                            {currentQuestion.scenario}
                        </p>
                    </Card>

                    <div className="space-y-3">
                        {currentQuestion.options.map(option => (
                            <OptionButton
                                key={option.id}
                                option={option}
                                isSelected={selectedAnswer === option.id}
                                isCorrect={option.isCorrect}
                                showResult={false}
                                onSelect={setSelectedAnswer}
                                disabled={loading}
                            />
                        ))}
                    </div>

                    <Button
                        onClick={submitMainAnswer}
                        disabled={!selectedAnswer || loading}
                        className="w-full bg-orange-600 hover:bg-orange-700 py-4 text-lg"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                        Submit Answer
                        <ArrowRight className="ml-2" size={20} />
                    </Button>
                </div>
            )}

            {/* Twist Question */}
            {gameState === 'twist' && currentQuestion?.twist && (
                <div className="space-y-6">
                    {/* Main Question Result */}
                    <Card className={`p-4 border-l-4 ${mainResult?.isCorrect ? 'border-l-green-500 bg-green-50 dark:bg-green-900/10' : 'border-l-red-500 bg-red-50 dark:bg-red-900/10'}`}>
                        <div className="flex items-center gap-3">
                            {mainResult?.isCorrect ? (
                                <CheckCircle2 className="text-green-600" size={24} />
                            ) : (
                                <XCircle className="text-red-600" size={24} />
                            )}
                            <div className="flex-1">
                                <span className={`font-bold ${mainResult?.isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                    {mainResult?.isCorrect ? 'Correct!' : 'Incorrect'}
                                </span>
                                <span className="text-slate-600 dark:text-slate-400 ml-2 text-sm">
                                    +{mainResult?.score} points
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Follow-up Question */}
                    <Card className="p-6 border-l-4 border-l-orange-500">
                        <p className="text-lg text-slate-900 dark:text-white leading-relaxed">
                            {currentQuestion.twist.question}
                        </p>
                    </Card>

                    <div className="space-y-3">
                        {currentQuestion.twist.options.map(option => (
                            <OptionButton
                                key={option.id}
                                option={option}
                                isSelected={twistAnswer === option.id}
                                isCorrect={option.isCorrect}
                                showResult={false}
                                onSelect={setTwistAnswer}
                                disabled={loading}
                            />
                        ))}
                    </div>

                    <Button
                        onClick={submitTwistAnswer}
                        disabled={!twistAnswer || loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 py-4 text-lg"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                        Submit Bonus Answer
                        <ArrowRight className="ml-2" size={20} />
                    </Button>
                </div>
            )}

            {/* Final Results */}
            {gameState === 'result' && (
                <Card className="p-6 border-l-4 border-l-orange-500">
                    <div className="text-center mb-6">
                        <div className="text-6xl mb-4">
                            {mainResult?.isCorrect && (!currentQuestion.twist || twistResult?.isCorrect) ? '🎯' :
                                mainResult?.isCorrect || twistResult?.isCorrect ? '👍' : '📚'}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            {mainResult?.isCorrect && (!currentQuestion.twist || twistResult?.isCorrect) ? 'Perfect Round!' :
                                mainResult?.isCorrect || twistResult?.isCorrect ? 'Good Work!' : 'Keep Learning!'}
                        </h3>
                        <div className="text-4xl font-bold text-orange-600">+{totalScore} points</div>
                    </div>

                    {/* Main Question Result */}
                    <div className={`p-4 rounded-xl mb-4 ${mainResult?.isCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            {mainResult?.isCorrect ? (
                                <CheckCircle2 className="text-green-600" size={20} />
                            ) : (
                                <XCircle className="text-red-600" size={20} />
                            )}
                            <span className="font-bold text-slate-900 dark:text-white">Main Question</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{mainResult?.explanation}</p>
                    </div>

                    {/* Twist Question Result */}
                    {twistResult && (
                        <div className={`p-4 rounded-xl mb-4 ${twistResult?.isCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                {twistResult?.isCorrect ? (
                                    <CheckCircle2 className="text-green-600" size={20} />
                                ) : (
                                    <XCircle className="text-red-600" size={20} />
                                )}
                                <span className="font-bold text-slate-900 dark:text-white">Bonus: The Twist</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{twistResult?.explanation}</p>
                        </div>
                    )}

                    <Button
                        onClick={playAgain}
                        className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
                    >
                        <RefreshCw size={18} className="mr-2" />
                        Next Question
                    </Button>
                </Card>
            )}

            {/* All Questions Completed */}
            {gameState === 'completed' && (
                <Card className="p-8 border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/10">
                    <div className="text-center">
                        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Congratulations!
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            You've completed all {difficulty?.toUpperCase()} questions! You're a true tool expert.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={playAgain}
                                className="bg-orange-600 hover:bg-orange-700"
                            >
                                Try Another Difficulty
                            </Button>
                            <Button
                                onClick={() => {
                                    resetToolSelectionHistory();
                                    loadRemainingPlays();
                                    setGameState('difficulty');
                                }}
                                variant="outline"
                                className="border-slate-300 dark:border-slate-600"
                            >
                                Reset All Progress
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
