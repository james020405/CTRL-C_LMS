import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getLeaderboard, getOverallLeaderboard } from '../../lib/gameService';
import { useAuth } from '../../contexts/AuthContext';
import { Medal, Award, Crown, User, Loader2, BarChart3 } from 'lucide-react';

const GAME_OPTIONS = [
    { value: 'overall', label: 'Overall (All Games)' },
    { value: 'fault_roulette', label: 'Fault Roulette' },
    { value: 'service_writer', label: 'Service Writer' },
    { value: 'cross_system', label: 'Cross-System Detective' },
    { value: 'tool_selection', label: 'Tool Selection' }
];

const DIFFICULTY_OPTIONS = [
    { value: 'easy', label: 'Easy', color: 'text-green-500' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
    { value: 'hard', label: 'Hard', color: 'text-red-500' }
];

const RANK_ICONS = [Crown, Medal, Award];
const RANK_COLORS = ['text-yellow-500', 'text-slate-400', 'text-amber-600'];

export default function Leaderboard() {
    const { user } = useAuth();
    const [gameType, setGameType] = useState('overall');
    const [difficulty, setDifficulty] = useState('easy');
    const [leaderboard, setLeaderboard] = useState({ topScores: [], userRank: null, userBestScore: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            let data;
            if (gameType === 'overall') {
                data = await getOverallLeaderboard(user?.id);
            } else {
                data = await getLeaderboard(gameType, difficulty, user?.id);
            }
            setLeaderboard(data);
            setLoading(false);
        };
        fetchLeaderboard();
    }, [gameType, difficulty, user?.id]);

    const isOverall = gameType === 'overall';

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <BarChart3 className="text-purple-500" size={32} />
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Leaderboard</h1>
                    <p className="text-slate-500">Compete with your classmates!</p>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[150px]">
                        <label className="text-xs text-slate-500 mb-1 block">Game</label>
                        <select
                            value={gameType}
                            onChange={(e) => setGameType(e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                            {GAME_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    {!isOverall && (
                        <div className="flex-1 min-w-[150px]">
                            <label className="text-xs text-slate-500 mb-1 block">Difficulty</label>
                            <div className="flex gap-2">
                                {DIFFICULTY_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setDifficulty(opt.value)}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${difficulty === opt.value
                                            ? `${opt.color} bg-slate-100 dark:bg-slate-700`
                                            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Your Rank */}
            {user && leaderboard.userRank && (
                <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <User className="text-purple-500" />
                            <div>
                                <p className="text-sm text-slate-500">Your Rank</p>
                                <p className="text-2xl font-bold text-purple-600">#{leaderboard.userRank}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-500">{isOverall ? 'Total Points' : 'Best Score'}</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {leaderboard.userBestScore?.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Top 10 */}
            <Card className="overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="font-bold text-slate-900 dark:text-white">
                        {isOverall ? 'Top 10 Overall' : 'Top 10 Players'}
                    </h2>
                    {isOverall && (
                        <p className="text-xs text-slate-500">Combined scores from all games</p>
                    )}
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <Loader2 className="animate-spin mx-auto text-slate-400" />
                    </div>
                ) : leaderboard.topScores.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No scores yet. Be the first to play!
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {leaderboard.topScores.map((entry, index) => {
                            const RankIcon = RANK_ICONS[index] || null;
                            const rankColor = RANK_COLORS[index] || 'text-slate-400';
                            const isCurrentUser = entry.user_id === user?.id;

                            return (
                                <div
                                    key={index}
                                    className={`flex items-center gap-4 p-4 ${isCurrentUser ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                                        }`}
                                >
                                    <div className={`w-8 text-center font-bold ${rankColor}`}>
                                        {RankIcon ? <RankIcon size={24} /> : `#${index + 1}`}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {entry.profiles?.full_name || entry.profiles?.email?.split('@')[0] || 'Anonymous'}
                                            {isCurrentUser && <span className="text-purple-500 ml-2">(You)</span>}
                                        </p>
                                        {isOverall && entry.gamesPlayed && (
                                            <p className="text-xs text-slate-400">
                                                {entry.gamesPlayed} games played
                                            </p>
                                        )}
                                        {!isOverall && entry.created_at && (
                                            <p className="text-xs text-slate-400">
                                                {new Date(entry.created_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                                        {entry.score.toLocaleString()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
}
