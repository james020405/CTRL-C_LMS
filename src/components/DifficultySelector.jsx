import React from 'react';
import PropTypes from 'prop-types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Zap, Flame, Skull, Lock } from 'lucide-react';

const DIFFICULTY_CONFIG = {
    easy: {
        label: 'Easy',
        description: 'Friendly customers, clear problems',
        icon: Zap,
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-500',
        multiplier: '1x'
    },
    medium: {
        label: 'Medium',
        description: 'Mixed moods, tighter budgets',
        icon: Flame,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-500',
        multiplier: '1.5x'
    },
    hard: {
        label: 'Hard',
        description: 'Angry customers, vague complaints',
        icon: Skull,
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-500',
        multiplier: '2x'
    }
};

export default function DifficultySelector({ remainingPlays, onSelect, loading }) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-6">
                Select Difficulty
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => {
                    const remaining = remainingPlays?.[key] ?? 0;
                    const isLocked = remaining <= 0;
                    const Icon = isLocked ? Lock : config.icon;

                    return (
                        <button
                            key={key}
                            onClick={() => !isLocked && !loading && onSelect(key)}
                            disabled={isLocked || loading}
                            aria-label={`Select ${config.label} difficulty. ${remaining} plays remaining. Score multiplier: ${config.multiplier}`}
                            className={`
                                p-6 rounded-xl border-2 text-left transition-all
                                ${isLocked
                                    ? 'border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
                                    : `${config.borderColor} ${config.bgColor} hover:scale-105 cursor-pointer`
                                }
                            `}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <Icon className={isLocked ? 'text-slate-400' : config.color} size={28} aria-hidden="true" />
                                <div>
                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                                        {config.label}
                                    </h4>
                                    <span className={`text-xs font-mono ${config.color}`}>
                                        {config.multiplier} Score
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                {config.description}
                            </p>

                            <div className={`text-sm font-medium ${isLocked ? 'text-red-500' : 'text-slate-500'}`}>
                                {isLocked ? 'No plays left today' : `${remaining} plays remaining`}
                            </div>
                        </button>
                    );
                })}
            </div>

            <p className="text-center text-xs text-slate-400 mt-4">
                Daily limits reset at midnight (PH time)
            </p>
        </div>
    );
}

DifficultySelector.propTypes = {
    /** Object containing remaining plays for each difficulty level */
    remainingPlays: PropTypes.shape({
        easy: PropTypes.number,
        medium: PropTypes.number,
        hard: PropTypes.number,
    }),
    /** Callback function when a difficulty is selected */
    onSelect: PropTypes.func.isRequired,
    /** Whether the selector is in a loading state */
    loading: PropTypes.bool,
};

DifficultySelector.defaultProps = {
    remainingPlays: { easy: 5, medium: 5, hard: 2 },
    loading: false,
};

