import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getLeaderboard, getOverallLeaderboard } from '../../lib/gameService';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Medal, Award, Crown, User, Loader2, BarChart3, Users } from 'lucide-react';

const GAME_OPTIONS = [
    { value: 'overall', label: 'Overall (All Games)' },
    { value: 'fault_roulette', label: 'Fault Roulette' },
    { value: 'service_writer', label: 'Service Writer' },
    { value: 'cross_system', label: 'Cross-System Detective' },
    { value: 'tool_selection', label: 'Tool Selection' },
    { value: 'chain_reaction', label: 'Chain Reaction' },
    { value: 'technician_detective', label: 'Tech Detective' }
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
    const [userSection, setUserSection] = useState(null);
    const [sectionLoading, setSectionLoading] = useState(true);

    // Fetch user's section on mount
    useEffect(() => {
        const fetchUserSection = async () => {
            if (!user?.id) {
                setSectionLoading(false);
                return;
            }
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('section')
                    .eq('id', user.id)
                    .single();
                setUserSection(data?.section || null);
            } catch (err) {
                console.error('Error fetching user section:', err);
            } finally {
                setSectionLoading(false);
            }
        };
        fetchUserSection();
    }, [user?.id]);

    // Fetch leaderboard when dependencies change
    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (sectionLoading) return; // Wait for section to load
            setLoading(true);
            let data;
            if (gameType === 'overall') {
                data = await getOverallLeaderboard(user?.id, userSection);
            } else {
                data = await getLeaderboard(gameType, difficulty, user?.id, userSection);
            }
            setLeaderboard(data);
            setLoading(false);
        };
        fetchLeaderboard();
    }, [gameType, difficulty, user?.id, userSection, sectionLoading]);

    const isOverall = gameType === 'overall';

    return (
        <div className="max-w-3xl mx-auto space-y-6 px-4 sm:px-0">
            <div className="flex items-center gap-3">
                <BarChart3 className="text-purple-500 flex-shrink-0" size={28} />
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Leaderboard</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        {userSection ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                                <Users size={12} />
                                Section: {userSection}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-full">
                                <Users size={12} />
                                All Students
                            </span>
                        )}
                        <span className="text-slate-500 text-sm">Compete with your classmates!</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="text-xs text-slate-500 mb-1 block">Game</label>
                        <select
                            value={gameType}
                            onChange={(e) => setGameType(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                        >
                            {GAME_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    {!isOverall && (
                        <div className="flex-1">
                            <label className="text-xs text-slate-500 mb-1 block">Difficulty</label>
                            <div className="flex gap-1 sm:gap-2">
                                {DIFFICULTY_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setDifficulty(opt.value)}
                                        className={`flex-1 py-2.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${difficulty === opt.value
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
                            <User className="text-purple-500" size={20} />
                            <div>
                                <p className="text-xs sm:text-sm text-slate-500">Your Rank</p>
                                <p className="text-xl sm:text-2xl font-bold text-purple-600">#{leaderboard.userRank}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs sm:text-sm text-slate-500">{isOverall ? 'Total Points' : 'Best Score'}</p>
                            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
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
                        <Loader2 className="animate-spin mx-auto text-slate-400" size={32} />
                        <p className="text-slate-500 mt-2">Loading leaderboard...</p>
                    </div>
                ) : leaderboard.topScores.length === 0 ? (
                    <div className="p-8 sm:p-12 text-center">
                        <Medal className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                        <p className="text-slate-500 font-medium mb-2">No scores yet</p>
                        <p className="text-sm text-slate-400 mb-4">Be the first to claim the top spot!</p>
                        <Button
                            onClick={() => window.location.href = '/student/dashboard'}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            Play a Game
                        </Button>
                    </div>
                ) : (
                    <div>
                        {leaderboard.topScores.map((entry, index) => {
                            const RankIcon = RANK_ICONS[index] || null;
                            const rankColor = RANK_COLORS[index] || 'text-slate-400';
                            const isCurrentUser = entry.user_id === user?.id;
                            const isEvenRow = index % 2 === 1;

                            return (
                                <div
                                    key={index}
                                    className={`p-3 sm:p-4 transition-colors
                                        ${isCurrentUser
                                            ? 'bg-purple-100 dark:bg-purple-900/40 border-l-4 border-l-purple-500'
                                            : isEvenRow
                                                ? 'bg-slate-50 dark:bg-slate-800/50'
                                                : 'bg-white dark:bg-slate-900'
                                        }
                                        ${index > 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Rank Badge */}
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center rounded-full font-bold text-sm ${index < 3
                                            ? `${rankColor} ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30' : index === 1 ? 'bg-slate-100 dark:bg-slate-700' : 'bg-amber-100 dark:bg-amber-900/30'}`
                                            : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                                            }`}>
                                            {RankIcon ? <RankIcon size={18} /> : index + 1}
                                        </div>

                                        {/* Name & Meta */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`font-medium truncate text-sm sm:text-base ${isCurrentUser ? 'text-purple-700 dark:text-purple-300' : 'text-slate-900 dark:text-white'}`}>
                                                    {entry.profiles?.full_name || entry.profiles?.email?.split('@')[0] || 'Anonymous'}
                                                </p>
                                                {isCurrentUser && (
                                                    <span className="flex-shrink-0 text-xs bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-200 px-1.5 py-0.5 rounded-full">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                            {isOverall && entry.gamesPlayed && (
                                                <p className="text-xs text-slate-400">{entry.gamesPlayed} games</p>
                                            )}
                                            {!isOverall && entry.created_at && (
                                                <p className="text-xs text-slate-400">{new Date(entry.created_at).toLocaleDateString()}</p>
                                            )}
                                        </div>

                                        {/* Score */}
                                        <div className={`text-base sm:text-xl font-bold tabular-nums flex-shrink-0 ${isCurrentUser ? 'text-purple-600 dark:text-purple-400' : 'text-slate-900 dark:text-white'}`}>
                                            {entry.score.toLocaleString()}
                                        </div>
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
