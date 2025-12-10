import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import {
    Gamepad2, Target, FileText, Wrench, Puzzle, Cpu,
    Trophy, ArrowRight, Sparkles
} from 'lucide-react';

const games = [
    {
        id: 'roulette',
        title: 'Fault Roulette',
        description: 'Diagnose vehicle faults by clicking on the correct component in 3D models.',
        icon: Target,
        color: 'from-red-500 to-orange-500',
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-500',
        route: '/student/roulette',
    },
    {
        id: 'service-writer',
        title: 'Service Writer',
        description: 'Create accurate repair estimates for customers with realistic scenarios.',
        icon: FileText,
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-500',
        route: '/student/service-writer',
    },
    {
        id: 'cross-system',
        title: 'Cross-System Detective',
        description: 'Identify related faults across multiple vehicle systems.',
        icon: Puzzle,
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-500/10',
        textColor: 'text-purple-500',
        route: '/student/cross-system',
    },
    {
        id: 'tool-select',
        title: 'Tool Selection',
        description: 'Choose the right tool for each repair job.',
        icon: Wrench,
        color: 'from-emerald-500 to-teal-500',
        bgColor: 'bg-emerald-500/10',
        textColor: 'text-emerald-500',
        route: '/student/tool-selection',
    },
    {
        id: 'code-cracker',
        title: 'Code Cracker',
        description: 'Decode OBD-II diagnostic trouble codes and identify the issue.',
        icon: Cpu,
        color: 'from-amber-500 to-yellow-500',
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-500',
        route: '/student/code-cracker',
    },
];

export default function GamesHub() {
    const navigate = useNavigate();

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/30 mb-4">
                    <Gamepad2 size={32} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                    Skill Games
                    <Sparkles className="text-yellow-500 w-6 h-6" />
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                    Test your automotive knowledge with fun, competitive challenges
                </p>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                    <Card
                        key={game.id}
                        onClick={() => navigate(game.route)}
                        className="cursor-pointer group hover:border-transparent overflow-hidden relative"
                    >
                        {/* Gradient Border Effect on Hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`} />
                        <div className="absolute inset-[2px] bg-white dark:bg-slate-800 rounded-xl -z-10 group-hover:inset-[2px]" />

                        <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className={`p-4 rounded-xl ${game.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                                <game.icon className={`w-8 h-8 ${game.textColor}`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                                    {game.title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                    {game.description}
                                </p>

                                {/* Play Button */}
                                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    <Trophy size={16} />
                                    <span>Play Now</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Leaderboard Teaser */}
            <Card
                onClick={() => navigate('/student/leaderboard')}
                className="cursor-pointer bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800 hover:shadow-lg group"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                            <Trophy className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">View Leaderboard</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">See how you rank against your classmates</p>
                        </div>
                    </div>
                    <ArrowRight className="text-slate-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all" />
                </div>
            </Card>
        </div>
    );
}
