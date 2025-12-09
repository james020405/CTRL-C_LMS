import React, { useState, useEffect } from 'react';
import { Wrench, CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw, HelpCircle, Trophy } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { getToolSelectionTask, evaluateToolSelection, getRemainingToolSelectionPlays, getToolSelectionTaskCounts, resetToolSelectionHistory } from '../../data/toolSelectionTasks';
import { submitScore } from '../../lib/gameService';
import DifficultySelector from '../../components/DifficultySelector';

// Tool card in the toolbox
function ToolCard({ tool, isSelected, onToggle, disabled }) {
    return (
        <button
            onClick={() => onToggle(tool.id)}
            disabled={disabled}
            className={`p-4 rounded-xl border-2 transition-all text-center ${isSelected
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 ring-2 ring-orange-500/50'
                : 'border-slate-200 dark:border-slate-700 hover:border-orange-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <div className="text-3xl mb-2">{tool.icon}</div>
            <div className="text-sm font-medium text-slate-900 dark:text-white leading-tight">
                {tool.name}
            </div>
            <div className="text-xs text-slate-500 mt-1">{tool.category}</div>
            {isSelected && (
                <div className="mt-2">
                    <CheckCircle2 size={16} className="text-orange-500 mx-auto" />
                </div>
            )}
        </button>
    );
}

export default function ToolSelectionChallenge() {
    const { user } = useAuth();

    // Game state
    const [gameState, setGameState] = useState('difficulty'); // difficulty, playing, result, completed
    const [difficulty, setDifficulty] = useState(null);
    const [currentTask, setCurrentTask] = useState(null);
    const [selectedTools, setSelectedTools] = useState(new Set());
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [remainingPlays, setRemainingPlays] = useState(null);
    const [taskCounts, setTaskCounts] = useState(null);

    // Load remaining plays (all-time, from localStorage)
    useEffect(() => {
        loadRemainingPlays();
    }, []);

    const loadRemainingPlays = () => {
        const plays = getRemainingToolSelectionPlays();
        const counts = getToolSelectionTaskCounts();
        setRemainingPlays(plays);
        setTaskCounts(counts);
    };

    const selectDifficulty = async (selectedDifficulty) => {
        setDifficulty(selectedDifficulty);
        setLoading(true);
        setSelectedTools(new Set());
        setResult(null);

        try {
            const task = getToolSelectionTask(selectedDifficulty);

            if (task === null) {
                // All tasks completed for this difficulty!
                setGameState('completed');
            } else {
                setCurrentTask(task);
                setGameState('playing');
            }

            loadRemainingPlays(); // Update counts after getting task
        } catch (err) {
            console.error("Error starting task:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleTool = (toolId) => {
        setSelectedTools(prev => {
            const newSet = new Set(prev);
            if (newSet.has(toolId)) {
                newSet.delete(toolId);
            } else {
                newSet.add(toolId);
            }
            return newSet;
        });
    };

    const submitSelection = async () => {
        if (selectedTools.size === 0) return;

        setLoading(true);
        const evaluation = evaluateToolSelection(currentTask, Array.from(selectedTools));

        if (evaluation.score > 0) {
            await submitScore(user?.id, 'tool_selection', difficulty, evaluation.score);
        }

        setResult(evaluation);
        setGameState('result');
        setLoading(false);
    };

    const playAgain = () => {
        loadRemainingPlays();
        setGameState('difficulty');
        setCurrentTask(null);
        setDifficulty(null);
        setSelectedTools(new Set());
        setResult(null);
    };

    // Loading state
    if (loading && gameState === 'playing' && !currentTask) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Wrench className="text-orange-600" />
                            Tool Selection Challenge
                        </h1>
                        <p className="text-slate-500">Pick the right tools for the job</p>
                    </div>
                </div>
                <div className="flex items-center justify-center p-24 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
                    <div className="text-center">
                        <Loader2 className="animate-spin text-orange-600 mx-auto mb-4" size={48} />
                        <p className="text-slate-600 dark:text-slate-400">Setting up your workbench...</p>
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
                        Tool Selection Challenge
                    </h1>
                    <p className="text-slate-500">Pick the right tools for the job</p>
                </div>
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
            {gameState !== 'difficulty' && currentTask && (
                <div className="space-y-6">
                    {/* Task Info */}
                    <Card className="p-6 border-l-4 border-l-orange-500">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className={`text-xs px-2 py-1 rounded-full mb-2 inline-block ${difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                    difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    {difficulty?.toUpperCase()}
                                </span>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {currentTask.title}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mt-1">
                                    {currentTask.description}
                                </p>
                                <p className="text-sm text-slate-500 mt-2">
                                    🚗 {currentTask.vehicleInfo}
                                </p>
                            </div>
                            {gameState === 'playing' && (
                                <div className="text-right">
                                    <div className="text-sm text-slate-500">Selected</div>
                                    <div className="text-2xl font-bold text-orange-600">
                                        {selectedTools.size} tools
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Toolbox Grid */}
                    {gameState === 'playing' && (
                        <>
                            <Card className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <HelpCircle size={20} className="text-slate-400" />
                                    <span className="text-slate-600 dark:text-slate-400">
                                        Click on the tools you need for this repair
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {currentTask.toolbox.map(tool => (
                                        <ToolCard
                                            key={tool.id}
                                            tool={tool}
                                            isSelected={selectedTools.has(tool.id)}
                                            onToggle={toggleTool}
                                            disabled={loading}
                                        />
                                    ))}
                                </div>
                            </Card>

                            <Button
                                onClick={submitSelection}
                                disabled={selectedTools.size === 0 || loading}
                                className="w-full bg-orange-600 hover:bg-orange-700 py-4 text-lg"
                            >
                                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                Submit Tool Selection ({selectedTools.size} selected)
                            </Button>
                        </>
                    )}

                    {/* Results */}
                    {gameState === 'result' && result && (
                        <Card className={`p-6 border-l-4 ${result.isPerfect ? 'border-l-green-500 bg-green-50 dark:bg-green-900/10' : 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10'}`}>
                            <div className="flex items-center gap-3 mb-6">
                                {result.isPerfect ? (
                                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                                ) : (
                                    <AlertCircle className="w-10 h-10 text-orange-600" />
                                )}
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {result.isPerfect ? 'Perfect Selection!' : 'Good Try!'}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400">{result.feedback}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <div className="text-sm text-slate-500">Score</div>
                                    <div className="text-3xl font-bold text-orange-600">+{result.score}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {/* Correct Tools */}
                                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-bold mb-3">
                                        <CheckCircle2 size={18} />
                                        Correct ({result.correct.length})
                                    </div>
                                    <div className="space-y-1">
                                        {result.correct.map(tool => (
                                            <div key={tool.id} className="text-sm text-green-800 dark:text-green-200">
                                                {tool.icon} {tool.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Incorrect Tools */}
                                <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-xl">
                                    <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold mb-3">
                                        <XCircle size={18} />
                                        Unnecessary ({result.incorrect.length})
                                    </div>
                                    <div className="space-y-1">
                                        {result.incorrect.length === 0 ? (
                                            <div className="text-sm text-red-600 dark:text-red-300 italic">None</div>
                                        ) : result.incorrect.map(tool => (
                                            <div key={tool.id} className="text-sm text-red-800 dark:text-red-200">
                                                {tool.icon} {tool.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Missed Tools */}
                                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                                    <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 font-bold mb-3">
                                        <AlertCircle size={18} />
                                        Missed ({result.missed.length})
                                    </div>
                                    <div className="space-y-1">
                                        {result.missed.length === 0 ? (
                                            <div className="text-sm text-yellow-600 dark:text-yellow-300 italic">None</div>
                                        ) : result.missed.map(tool => (
                                            <div key={tool.id} className="text-sm text-yellow-800 dark:text-yellow-200">
                                                {tool.icon} {tool.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Explanations */}
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-3">Why These Tools?</h4>
                                <div className="space-y-2">
                                    {Object.entries(result.explanations).map(([toolId, explanation]) => {
                                        const tool = currentTask.toolbox.find(t => t.id === toolId);
                                        return (
                                            <div key={toolId} className="flex items-start gap-2 text-sm">
                                                <span className="text-lg">{tool?.icon}</span>
                                                <div>
                                                    <span className="font-medium text-slate-900 dark:text-white">{tool?.name}:</span>
                                                    <span className="text-slate-600 dark:text-slate-400 ml-1">{explanation}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <Button
                                onClick={playAgain}
                                className="w-full mt-6 bg-orange-600 hover:bg-orange-700"
                            >
                                <RefreshCw size={18} className="mr-2" />
                                Try Another Task
                            </Button>
                        </Card>
                    )}
                </div>
            )}

            {/* All Tasks Completed State */}
            {gameState === 'completed' && (
                <Card className="p-8 border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/10">
                    <div className="text-center">
                        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Congratulations! 🎉
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            You've completed all {difficulty?.toUpperCase()} tasks! You've mastered all the tool selection scenarios for this difficulty level.
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
