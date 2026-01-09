import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton, StatsGridSkeleton, InsightsCardSkeleton } from '../../components/ui/Skeleton';
import {
    Sparkles, TrendingUp, TrendingDown, Users, Trophy,
    AlertCircle, Lightbulb, BarChart3, Target, Zap,
    Loader2, RefreshCw, ChevronDown, ChevronUp, Brain,
    Star, AlertTriangle, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import { generateTeachingInsights } from '../../lib/professorAI';

// Game name mapping
const GAME_NAMES = {
    fault_roulette: 'Fault Roulette',
    service_writer: 'Service Writer',
    cross_system: 'Cross-System Detective',
    tool_selection: 'Tool Selection',
    chain_reaction: 'Chain Reaction'
};

export default function StudentInsights() {
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [students, setStudents] = useState([]);
    const [gameStats, setGameStats] = useState({});
    const [aiInsights, setAiInsights] = useState(null);
    const [showNeedsSupport, setShowNeedsSupport] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError('');

        try {
            // Get current professor's ID
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) throw new Error('Not authenticated');

            // Get professor's courses
            const { data: courses, error: coursesError } = await supabase
                .from('courses')
                .select('id')
                .eq('professor_id', authUser.id);

            if (coursesError) throw coursesError;

            if (!courses || courses.length === 0) {
                setStudents([]);
                setGameStats({});
                setLoading(false);
                return;
            }

            const courseIds = courses.map(c => c.id);

            // Get enrolled student IDs
            const { data: enrollments } = await supabase
                .from('course_enrollments')
                .select('user_id')
                .in('course_id', courseIds);

            const enrolledUserIds = [...new Set(enrollments?.map(e => e.user_id) || [])];

            if (enrolledUserIds.length === 0) {
                setStudents([]);
                setGameStats({});
                setLoading(false);
                return;
            }

            // Get enrolled student profiles
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, email, role')
                .in('id', enrolledUserIds);

            if (profilesError) throw profilesError;

            // Get game scores for enrolled students
            let scores = [];
            const { data: scoresData, error: scoresError } = await supabase
                .from('game_scores')
                .select('user_id, game_type, difficulty, score, created_at')
                .in('user_id', enrolledUserIds);

            if (!scoresError) scores = scoresData || [];

            // Get game plays for enrolled students
            let plays = [];
            const { data: playsData, error: playsError } = await supabase
                .from('game_plays')
                .select('user_id, game_type, difficulty, created_at')
                .in('user_id', enrolledUserIds);

            if (!playsError) plays = playsData || [];

            // Process student data
            const studentData = profiles?.map(profile => {
                const studentScores = scores.filter(s => s.user_id === profile.id);
                const studentPlays = plays.filter(p => p.user_id === profile.id);

                const totalPoints = studentScores.reduce((sum, s) => sum + (s.score || 0), 0);
                // Fallback to counting scores if plays table is empty (backwards compatibility)
                const gamesPlayed = studentPlays.length > 0 ? studentPlays.length : studentScores.length;

                // Get best game
                const gamePoints = {};
                studentScores.forEach(s => {
                    gamePoints[s.game_type] = (gamePoints[s.game_type] || 0) + s.score;
                });
                const bestGame = Object.entries(gamePoints).sort((a, b) => b[1] - a[1])[0];

                // Calculate recent trend (last 7 days vs previous 7 days)
                const now = new Date();
                const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
                const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

                const recentScores = studentScores.filter(s => new Date(s.created_at) >= weekAgo);
                const previousScores = studentScores.filter(s => {
                    const date = new Date(s.created_at);
                    return date >= twoWeeksAgo && date < weekAgo;
                });

                const recentTotal = recentScores.reduce((sum, s) => sum + s.score, 0);
                const previousTotal = previousScores.reduce((sum, s) => sum + s.score, 0);
                const trend = previousTotal > 0 ? ((recentTotal - previousTotal) / previousTotal) * 100 : 0;

                return {
                    id: profile.id,
                    name: profile.full_name || profile.email?.split('@')[0] || 'Unknown',
                    email: profile.email,
                    role: profile.role,
                    totalPoints,
                    gamesPlayed,
                    bestGame: bestGame ? { type: bestGame[0], points: bestGame[1] } : null,
                    trend,
                    recentActivity: recentScores.length > 0
                };
            }).filter(s => s.role !== 'professor') || [];

            setStudents(studentData);

            // Calculate game statistics
            const gameStatsData = {};
            ['fault_roulette', 'service_writer', 'cross_system', 'tool_selection', 'chain_reaction'].forEach(gameType => {
                const gameScores = scores.filter(s => s.game_type === gameType);
                const avgScore = gameScores.length > 0
                    ? Math.round(gameScores.reduce((sum, s) => sum + s.score, 0) / gameScores.length)
                    : 0;
                // Fallback: if no plays tracked, use score count
                const gamePlays = plays.filter(p => p.game_type === gameType);
                const playCount = gamePlays.length > 0 ? gamePlays.length : gameScores.length;
                const uniquePlayers = new Set(gameScores.map(s => s.user_id)).size;

                gameStatsData[gameType] = {
                    avgScore,
                    playCount,
                    uniquePlayers,
                    completionRate: playCount > 0 ? Math.round((uniquePlayers / (studentData.length || 1)) * 100) : 0
                };
            });

            setGameStats(gameStatsData);

        } catch (err) {
            console.error('Error loading insights data:', err);
            setError('Failed to load insights data');
        } finally {
            setLoading(false);
        }
    };

    const generateInsights = async () => {
        setGenerating(true);
        try {
            const insights = await generateTeachingInsights(students, gameStats);
            setAiInsights(insights);
        } catch (err) {
            console.error('Error generating insights:', err);
            setError('Failed to generate AI insights');
        } finally {
            setGenerating(false);
        }
    };

    // Sort students by points
    const starPerformers = [...students]
        .filter(s => s.totalPoints > 0)
        .sort((a, b) => b.trend - a.trend)
        .slice(0, 5);

    const needsSupport = [...students]
        .filter(s => s.gamesPlayed < 3 || (s.gamesPlayed > 5 && s.trend < -20))
        .slice(0, 5);

    // Calculate class average
    const classAverage = students.length > 0
        ? Math.round(students.reduce((sum, s) => sum + s.totalPoints, 0) / students.length)
        : 0;

    // Find strongest and weakest games
    const sortedGames = Object.entries(gameStats)
        .filter(([_, stats]) => stats.playCount > 0)
        .sort((a, b) => b[1].avgScore - a[1].avgScore);

    const strongestGame = sortedGames[0];
    const weakestGame = sortedGames[sortedGames.length - 1];

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header skeleton */}
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-24" />
                </div>
                {/* Stats skeleton */}
                <StatsGridSkeleton count={3} />
                {/* Cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InsightsCardSkeleton />
                    <InsightsCardSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Brain className="text-purple-600" />
                        Student Insights
                    </h2>
                    <p className="text-slate-500">AI-powered analysis of your students' performance</p>
                </div>
                <Button onClick={loadData} variant="outline">
                    <RefreshCw size={16} className="mr-2" />
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Class Average</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{classAverage.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">points per student</p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                            <BarChart3 className="text-white" size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Strongest Area</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                {strongestGame ? GAME_NAMES[strongestGame[0]] : 'N/A'}
                            </p>
                            <p className="text-xs text-green-600">
                                {strongestGame ? `${strongestGame[1].avgScore} avg score` : 'No data yet'}
                            </p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                            <TrendingUp className="text-white" size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Needs Focus</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                {weakestGame && weakestGame[0] !== strongestGame?.[0]
                                    ? GAME_NAMES[weakestGame[0]]
                                    : 'All balanced'}
                            </p>
                            <p className="text-xs text-orange-600">
                                {weakestGame && weakestGame[0] !== strongestGame?.[0]
                                    ? `${weakestGame[1].avgScore} avg score`
                                    : 'Great job!'}
                            </p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                            <Target className="text-white" size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* AI Recommendations */}
            <Card className="p-6 border-2 border-dashed border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                            <Sparkles className="text-white" size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">AI Teaching Recommendations</h3>
                            <p className="text-xs text-slate-500">Powered by Gemini 2.5 Flash</p>
                        </div>
                    </div>
                    <Button
                        onClick={generateInsights}
                        disabled={generating || students.length === 0}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="animate-spin mr-2" size={16} />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Zap size={16} className="mr-2" />
                                Generate Insights
                            </>
                        )}
                    </Button>
                </div>

                {aiInsights ? (
                    <div className="space-y-4">
                        {/* Summary */}
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <Lightbulb className="text-yellow-500" size={18} />
                                Summary
                            </h4>
                            <p className="text-slate-700 dark:text-slate-300">{aiInsights.summary}</p>
                        </div>

                        {/* Recommendations */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {aiInsights.recommendations?.map((rec, idx) => (
                                <div key={idx} className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-1.5 rounded-lg ${rec.priority === 'high'
                                            ? 'bg-red-100 dark:bg-red-900/30'
                                            : rec.priority === 'medium'
                                                ? 'bg-yellow-100 dark:bg-yellow-900/30'
                                                : 'bg-green-100 dark:bg-green-900/30'
                                            }`}>
                                            {rec.priority === 'high' ? (
                                                <AlertTriangle className="text-red-600" size={16} />
                                            ) : rec.priority === 'medium' ? (
                                                <AlertCircle className="text-yellow-600" size={16} />
                                            ) : (
                                                <CheckCircle2 className="text-green-600" size={16} />
                                            )}
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-slate-900 dark:text-white">{rec.title}</h5>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{rec.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Items */}
                        {aiInsights.actionItems && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                                    <Target size={16} />
                                    Action Items for This Week
                                </h4>
                                <ul className="space-y-1">
                                    {aiInsights.actionItems.map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                                            <ArrowUpRight size={14} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-500">
                        <Brain className="mx-auto mb-3 opacity-30" size={48} />
                        <p>Click "Generate Insights" to get AI-powered teaching recommendations</p>
                        <p className="text-xs mt-1">Based on your students' performance data</p>
                    </div>
                )}
            </Card>

            {/* Star Performers & Needs Support */}
            < div className="grid md:grid-cols-2 gap-6" >
                {/* Star Performers */}
                < Card className="p-5" >
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Star className="text-yellow-500" />
                        Star Performers
                        <span className="text-xs font-normal text-slate-500 ml-2">Highest growth</span>
                    </h3>

                    {
                        starPerformers.length > 0 ? (
                            <div className="space-y-3">
                                {starPerformers.map((student, idx) => (
                                    <div key={student.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${idx === 0 ? 'bg-yellow-500' :
                                                idx === 1 ? 'bg-slate-400' :
                                                    idx === 2 ? 'bg-amber-600' :
                                                        'bg-slate-300'
                                                }`}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{student.name}</p>
                                                <p className="text-xs text-slate-500">
                                                    {student.bestGame
                                                        ? `Best: ${GAME_NAMES[student.bestGame.type]}`
                                                        : 'No games yet'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900 dark:text-white">{student.totalPoints.toLocaleString()}</p>
                                            {student.trend > 0 && (
                                                <p className="text-xs text-green-600 flex items-center gap-1">
                                                    <TrendingUp size={12} />
                                                    +{Math.round(student.trend)}%
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-4">No active students yet</p>
                        )
                    }
                </Card >

                {/* Needs Support (Private) */}
                < Card className="p-5" >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertCircle className="text-orange-500" />
                            Needs Support
                            <span className="text-xs font-normal text-slate-500 ml-2">Private view</span>
                        </h3>
                        <button
                            onClick={() => setShowNeedsSupport(!showNeedsSupport)}
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                            {showNeedsSupport ? 'Hide' : 'Show'}
                            {showNeedsSupport ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    </div>

                    {
                        showNeedsSupport ? (
                            needsSupport.length > 0 ? (
                                <div className="space-y-3">
                                    {needsSupport.map((student) => (
                                        <div key={student.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{student.name}</p>
                                                <p className="text-xs text-orange-600">
                                                    {student.gamesPlayed < 3
                                                        ? 'Low activity - only ' + student.gamesPlayed + ' games'
                                                        : 'Declining performance'
                                                    }
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-slate-700 dark:text-slate-300">{student.gamesPlayed} games</p>
                                                {student.trend < 0 && (
                                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                                        <TrendingDown size={12} />
                                                        {Math.round(student.trend)}%
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-center py-4">All students are on track!</p>
                            )
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <AlertCircle className="mx-auto mb-2 opacity-30" size={32} />
                                <p className="text-sm">Click "Show" to view students who may need extra help</p>
                                <p className="text-xs mt-1">This list is private and only visible to you</p>
                            </div>
                        )
                    }
                </Card >
            </div >

            {/* Game Popularity Insights */}
            < Card className="p-5" >
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="text-blue-600" />
                    Game Popularity Insights
                </h3>

                {/* Popularity Bar Chart */}
                <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                        Most Played Games
                    </h4>
                    <div className="space-y-3">
                        {Object.entries(GAME_NAMES)
                            .map(([gameType, gameName]) => ({
                                gameType,
                                gameName,
                                stats: gameStats[gameType] || { avgScore: 0, playCount: 0, uniquePlayers: 0 }
                            }))
                            .sort((a, b) => b.stats.playCount - a.stats.playCount)
                            .map(({ gameType, gameName, stats }, idx) => {
                                const maxPlays = Math.max(...Object.values(gameStats).map(s => s.playCount || 0), 1);
                                const barWidth = (stats.playCount / maxPlays) * 100;
                                const isTop = idx === 0 && stats.playCount > 0;

                                return (
                                    <div key={gameType} className="relative">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                {isTop && <Trophy className="text-yellow-500" size={14} />}
                                                {gameName}
                                            </span>
                                            <span className="text-sm text-slate-500">
                                                {stats.playCount} plays • {stats.uniquePlayers} students
                                            </span>
                                        </div>
                                        <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2 ${isTop
                                                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                                                    : idx === 1
                                                        ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                                                        : 'bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500'
                                                    }`}
                                                style={{ width: `${Math.max(barWidth, 5)}%` }}
                                            >
                                                {barWidth > 20 && (
                                                    <span className="text-xs font-bold text-white">{stats.avgScore} avg</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Game Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(GAME_NAMES).map(([gameType, gameName]) => {
                        const stats = gameStats[gameType] || { avgScore: 0, playCount: 0, completionRate: 0, uniquePlayers: 0 };
                        const isStrong = strongestGame?.[0] === gameType;
                        const isWeak = weakestGame?.[0] === gameType && !isStrong;
                        const sortedByPlays = Object.entries(gameStats).sort((a, b) => (b[1].playCount || 0) - (a[1].playCount || 0));
                        const isMostPlayed = sortedByPlays[0]?.[0] === gameType;

                        return (
                            <div
                                key={gameType}
                                className={`p-4 rounded-xl text-center transition-all ${isStrong
                                    ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                                    : isWeak
                                        ? 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500'
                                        : 'bg-slate-50 dark:bg-slate-800'
                                    }`}
                            >
                                <p className="text-xs text-slate-500 mb-1 truncate">{gameName}</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.avgScore}
                                </p>
                                <p className="text-xs text-slate-500">avg score</p>
                                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        {stats.playCount} plays
                                    </p>
                                    {isMostPlayed && stats.playCount > 0 && (
                                        <span className="inline-flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                            <Trophy size={10} /> Popular
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Engagement Summary */}
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                        <BarChart3 size={14} />
                        Engagement Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-slate-600 dark:text-slate-400">Total Game Sessions</p>
                            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                                {Object.values(gameStats).reduce((sum, s) => sum + (s.playCount || 0), 0)}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-600 dark:text-slate-400">Most Popular</p>
                            <p className="font-bold text-blue-700 dark:text-blue-300">
                                {(() => {
                                    const sorted = Object.entries(gameStats).sort((a, b) => (b[1].playCount || 0) - (a[1].playCount || 0));
                                    return sorted[0] ? GAME_NAMES[sorted[0][0]] : 'N/A';
                                })()}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-600 dark:text-slate-400">Needs Promotion</p>
                            <p className="font-bold text-orange-600 dark:text-orange-400">
                                {(() => {
                                    const sorted = Object.entries(gameStats).filter(([_, s]) => s.playCount > 0).sort((a, b) => (a[1].playCount || 0) - (b[1].playCount || 0));
                                    return sorted[0] ? GAME_NAMES[sorted[0][0]] : 'N/A';
                                })()}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-600 dark:text-slate-400">Highest Avg Score</p>
                            <p className="font-bold text-green-600 dark:text-green-400">
                                {strongestGame ? `${GAME_NAMES[strongestGame[0]]} (${strongestGame[1].avgScore})` : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </Card >
        </div >
    );
}
