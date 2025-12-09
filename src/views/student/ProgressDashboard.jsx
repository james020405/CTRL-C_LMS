import React, { useState, useEffect } from 'react';
import {
    TrendingUp, Award, Target, Flame, BarChart2,
    Trophy, Loader2, Zap, AlertTriangle, FileText, Link2, Wrench, X
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentProgress, getClassRank, checkBadges } from '../../lib/progressService';
import { BADGES, BADGE_CATEGORIES } from '../../data/badges';

// Game icons using Lucide
const GAME_ICONS = {
    fault_roulette: AlertTriangle,
    service_writer: FileText,
    cross_system: Link2,
    tool_selection: Wrench
};

const GAME_LABELS = {
    fault_roulette: { name: 'Fault Roulette', color: 'bg-red-500' },
    service_writer: { name: 'Service Writer', color: 'bg-blue-500' },
    cross_system: { name: 'Cross-System', color: 'bg-purple-500' },
    tool_selection: { name: 'Tool Selection', color: 'bg-orange-500' }
};

// Stat card component
function StatCard({ icon: Icon, label, value, subtext, color = 'text-blue-600' }) {
    return (
        <Card className="p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                    <p className={`text-3xl font-bold ${color} mt-1`}>{value}</p>
                    {subtext && (
                        <p className="text-xs text-slate-400 mt-1">{subtext}</p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('-600', '-100')} dark:bg-opacity-20`}>
                    <Icon className={color} size={24} />
                </div>
            </div>
        </Card>
    );
}

// Activity chart bar
function ActivityBar({ day, points, maxPoints }) {
    const height = maxPoints > 0 ? Math.max(4, (points / maxPoints) * 100) : 4;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="w-full h-24 flex items-end justify-center">
                <div
                    className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-500"
                    style={{ height: `${height}%` }}
                />
            </div>
            <span className="text-xs text-slate-500">{day}</span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {points > 0 ? points : '-'}
            </span>
        </div>
    );
}

// Badge component - now uses Lucide icons
function Badge({ badgeId, earned, onClick }) {
    const badgeData = BADGES[badgeId];
    if (!badgeData) return null;
    const IconComponent = badgeData.Icon;

    return (
        <div
            onClick={onClick}
            className={`p-3 rounded-xl text-center transition-all cursor-pointer ${earned
                ? `${badgeData.color} shadow-md hover:scale-105`
                : 'bg-slate-100 dark:bg-slate-800 opacity-40'
                }`}
        >
            <div className="flex justify-center mb-1">
                <IconComponent size={24} className={earned ? badgeData.iconColor : 'text-slate-400'} />
            </div>
            <div className="text-xs font-medium truncate">{badgeData.name}</div>
        </div>
    );
}

// Badges Modal
function BadgesModal({ isOpen, onClose, earnedBadges }) {
    if (!isOpen) return null;

    const categoryNames = {
        points: 'Points Milestones',
        games: 'Games Played',
        difficulty: 'Difficulty Challenges',
        rank: 'Ranking Achievements',
        variety: 'Skill Variety'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Award className="text-yellow-600" />
                        All Badges ({earnedBadges.length}/{Object.keys(BADGES).length})
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                    {Object.entries(BADGE_CATEGORIES).map(([category, badgeIds]) => (
                        <div key={category}>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                                {categoryNames[category]}
                            </h3>
                            <div className="grid grid-cols-4 gap-3">
                                {badgeIds.map(badgeId => {
                                    const badge = BADGES[badgeId];
                                    const earned = earnedBadges.includes(badgeId);
                                    const IconComponent = badge.Icon;
                                    return (
                                        <div
                                            key={badgeId}
                                            className={`p-4 rounded-xl text-center transition-all ${earned
                                                ? `${badge.color} shadow-md`
                                                : 'bg-slate-100 dark:bg-slate-800 opacity-50'
                                                }`}
                                        >
                                            <div className="flex justify-center mb-2">
                                                <IconComponent size={28} className={earned ? badge.iconColor : 'text-slate-400'} />
                                            </div>
                                            <div className="text-sm font-medium">{badge.name}</div>
                                            <div className="text-xs text-slate-500 mt-1">{badge.description}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Game breakdown row
function GameBreakdownRow({ gameType, stats }) {
    const game = GAME_LABELS[gameType];
    const GameIcon = GAME_ICONS[gameType];
    if (!game) return null;

    return (
        <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className={`w-10 h-10 ${game.color} rounded-xl flex items-center justify-center text-white`}>
                <GameIcon size={20} />
            </div>
            <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white">{game.name}</p>
                <p className="text-xs text-slate-500">
                    {stats.gamesPlayed} games • Best: {stats.bestScore}
                </p>
            </div>
            <div className="text-right">
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {stats.totalPoints}
                </p>
                <p className="text-xs text-slate-500">points</p>
            </div>
        </div>
    );
}

export default function ProgressDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(null);
    const [classRank, setClassRank] = useState(null);
    const [earnedBadges, setEarnedBadges] = useState([]);
    const [showBadgesModal, setShowBadgesModal] = useState(false);

    useEffect(() => {
        if (user?.id) {
            loadProgress();
        }
    }, [user?.id]);

    const loadProgress = async () => {
        setLoading(true);
        try {
            const [progressData, rankData] = await Promise.all([
                getStudentProgress(user.id),
                getClassRank(user.id)
            ]);

            setProgress(progressData);
            setClassRank(rankData);
            setEarnedBadges(checkBadges(progressData, rankData));
        } catch (err) {
            console.error('Error loading progress:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-center p-24">
                    <div className="text-center">
                        <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
                        <p className="text-slate-600 dark:text-slate-400">Loading your progress...</p>
                    </div>
                </div>
            </div>
        );
    }

    const maxDailyPoints = Math.max(...(progress?.activityChart?.map(d => d.points) || [1]));

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="text-blue-600" />
                        My Progress
                    </h1>
                    <p className="text-slate-500">Track your learning journey</p>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={Zap}
                    label="Total Points"
                    value={progress?.totalPoints?.toLocaleString() || 0}
                    color="text-yellow-600"
                />
                <StatCard
                    icon={Target}
                    label="Games Played"
                    value={progress?.gamesPlayed || 0}
                    color="text-blue-600"
                />
                <StatCard
                    icon={Trophy}
                    label="Class Rank"
                    value={classRank?.rank ? `#${classRank.rank}` : '-'}
                    subtext={classRank?.totalStudents ? `of ${classRank.totalStudents} students` : null}
                    color="text-purple-600"
                />
                <StatCard
                    icon={Award}
                    label="Badges Earned"
                    value={earnedBadges.length}
                    subtext={`of ${Object.keys(BADGES).length} available`}
                    color="text-green-600"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Activity & Game Breakdown */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Weekly Activity Chart */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <BarChart2 size={20} className="text-blue-600" />
                                Weekly Activity
                            </h2>
                            <span className="text-sm text-slate-500">Last 7 days</span>
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {progress?.activityChart?.map((day, idx) => (
                                <ActivityBar
                                    key={idx}
                                    day={day.dayName}
                                    points={day.points}
                                    maxPoints={maxDailyPoints}
                                />
                            ))}
                        </div>
                    </Card>

                    {/* Game Breakdown */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <Flame size={20} className="text-orange-600" />
                            Points by Game
                        </h2>
                        <div className="space-y-2">
                            {Object.keys(GAME_LABELS).map((gameType) => (
                                <GameBreakdownRow
                                    key={gameType}
                                    gameType={gameType}
                                    stats={progress?.gameBreakdown?.[gameType] || { gamesPlayed: 0, totalPoints: 0, bestScore: 0 }}
                                />
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right Column - Badges & Rank */}
                <div className="space-y-6">
                    {/* Class Rank Card */}
                    {classRank?.rank && (
                        <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                                    <Trophy className="text-white" size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                    Rank #{classRank.rank}
                                </h3>
                                <p className="text-sm text-purple-600 dark:text-purple-400">
                                    Top {classRank.percentile}% of class
                                </p>
                            </div>
                        </Card>
                    )}

                    {/* Difficulty Stats */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            Difficulty Breakdown
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-green-500 rounded-full" />
                                    Easy
                                </span>
                                <span className="font-bold">{progress?.difficultyStats?.easy || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-yellow-500 rounded-full" />
                                    Medium
                                </span>
                                <span className="font-bold">{progress?.difficultyStats?.medium || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-red-500 rounded-full" />
                                    Hard
                                </span>
                                <span className="font-bold">{progress?.difficultyStats?.hard || 0}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Badges */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Award size={20} className="text-yellow-600" />
                                Badges
                            </h2>
                            <span className="text-sm text-slate-500">
                                {earnedBadges.length}/{Object.keys(BADGES).length}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.keys(BADGES).slice(0, 9).map(badgeId => (
                                <Badge
                                    key={badgeId}
                                    badgeId={badgeId}
                                    earned={earnedBadges.includes(badgeId)}
                                />
                            ))}
                        </div>
                        {Object.keys(BADGES).length > 9 && (
                            <Button
                                variant="ghost"
                                onClick={() => setShowBadgesModal(true)}
                                className="w-full mt-3 text-blue-600 hover:text-blue-700"
                            >
                                View all {Object.keys(BADGES).length} badges
                            </Button>
                        )}
                    </Card>
                </div>
            </div>

            {/* Badges Modal */}
            <BadgesModal
                isOpen={showBadgesModal}
                onClose={() => setShowBadgesModal(false)}
                earnedBadges={earnedBadges}
            />
        </div>
    );
}
