import React from 'react';
import PropTypes from 'prop-types';
import { Card } from './ui/Card';
import { Zap, Flame, Skull, Lock, Search } from 'lucide-react';

const DIFFICULTY_CONFIG = {
    easy: {
        label: 'Easy',
        description: 'Friendly customers, clear problems',
        icon: Zap,
        color: 'emerald',
        multiplier: '1x'
    },
    medium: {
        label: 'Medium',
        description: 'Mixed moods, tighter budgets',
        icon: Flame,
        color: 'amber',
        multiplier: '1.5x'
    },
    hard: {
        label: 'Hard',
        description: 'Angry customers, vague complaints',
        icon: Skull,
        color: 'red',
        multiplier: '2x'
    }
};

/**
 * Clean difficulty selector matching TechnicianDetective design
 * 
 * @param {Object} props
 * @param {Object} remainingPlays - Plays remaining per difficulty { easy, medium, hard }
 * @param {Function} onSelect - Callback when difficulty selected
 * @param {boolean} loading - Show loading state
 * @param {Object} customConfig - Override default descriptions/info per difficulty
 * @param {string} Icon - Override the icon component used (default uses difficulty-specific)
 */
export default function DifficultySelector({
    remainingPlays,
    onSelect,
    loading,
    customConfig = {},
    GameIcon = null  // Optional: use same icon for all difficulties like TechnicianDetective
}) {
    const getConfig = (key) => {
        return {
            ...DIFFICULTY_CONFIG[key],
            ...customConfig[key]
        };
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {Object.entries(DIFFICULTY_CONFIG).map(([key, baseConfig]) => {
                const config = getConfig(key);
                const remaining = remainingPlays?.[key] ?? 5;
                const isLocked = remaining <= 0;
                const IconComponent = GameIcon || (isLocked ? Lock : config.icon);

                // Color classes for each difficulty
                const colorClasses = {
                    emerald: {
                        iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
                        iconText: 'text-emerald-600 dark:text-emerald-400',
                        hoverBorder: 'hover:border-emerald-500'
                    },
                    amber: {
                        iconBg: 'bg-amber-100 dark:bg-amber-900/30',
                        iconText: 'text-amber-600 dark:text-amber-400',
                        hoverBorder: 'hover:border-amber-500'
                    },
                    red: {
                        iconBg: 'bg-red-100 dark:bg-red-900/30',
                        iconText: 'text-red-600 dark:text-red-400',
                        hoverBorder: 'hover:border-red-500'
                    }
                };

                const colors = colorClasses[config.color] || colorClasses.emerald;

                return (
                    <Card
                        key={key}
                        className={`p-6 cursor-pointer transition-all border-2 border-transparent ${isLocked
                                ? 'opacity-50 cursor-not-allowed'
                                : `hover:scale-105 hover:shadow-lg ${colors.hoverBorder}`
                            }`}
                        onClick={() => !isLocked && !loading && onSelect(key)}
                    >
                        {/* Circular Icon */}
                        <div className={`w-12 h-12 rounded-full ${colors.iconBg} flex items-center justify-center mb-4`}>
                            <IconComponent
                                className={isLocked ? 'text-slate-400' : colors.iconText}
                                size={24}
                                aria-hidden="true"
                            />
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {config.label}
                        </h3>

                        {/* Description */}
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                            {config.description}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>{isLocked ? 'No plays left' : `${remaining} plays`}</span>
                            <span>{config.multiplier} score</span>
                        </div>
                    </Card>
                );
            })}
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
    /** Custom config to override descriptions per difficulty */
    customConfig: PropTypes.object,
    /** Optional icon component to use for all difficulties */
    GameIcon: PropTypes.elementType
};

DifficultySelector.defaultProps = {
    remainingPlays: { easy: 5, medium: 5, hard: 2 },
    loading: false,
    customConfig: {},
    GameIcon: null
};
