import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton, StudentListSkeleton } from '../../components/ui/Skeleton';
import {
    Users, TrendingUp, Trophy, Target, Loader2,
    ChevronDown, ChevronUp, AlertTriangle, FileText, Link2, Wrench,
    BarChart2, Award, Search, RefreshCw, Download, FileSpreadsheet
} from 'lucide-react';
import { exportStudentProgress, exportToCSV } from '../../lib/exportService';

// Game icons
const GAME_ICONS = {
    fault_roulette: AlertTriangle,
    service_writer: FileText,
    cross_system: Link2,
    tool_selection: Wrench
};

const GAME_NAMES = {
    fault_roulette: 'Fault Roulette',
    service_writer: 'Service Writer',
    cross_system: 'Cross-System',
    tool_selection: 'Tool Selection'
};

export default function StudentProgress() {
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [expandedStudent, setExpandedStudent] = useState(null);
    const [sortBy, setSortBy] = useState('points');
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    const [exporting, setExporting] = useState(false);
    // Section filters
    const [yearLevelFilter, setYearLevelFilter] = useState('all');
    const [sectionFilter, setSectionFilter] = useState('all');

    useEffect(() => {
        loadStudentsProgress();
    }, []);

    const loadStudentsProgress = async () => {
        setLoading(true);
        setError('');

        try {
            // Get current professor's ID from auth
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
                setLoading(false);
                return;
            }

            const courseIds = courses.map(c => c.id);

            // Get enrollments for professor's courses
            const { data: enrollments, error: enrollError } = await supabase
                .from('course_enrollments')
                .select('user_id')
                .in('course_id', courseIds);

            if (enrollError) {
                console.log('Enrollments query error:', enrollError.message);
            }

            // Get unique enrolled user IDs
            const enrolledUserIds = [...new Set(enrollments?.map(e => e.user_id) || [])];

            if (enrolledUserIds.length === 0) {
                setStudents([]);
                setLoading(false);
                return;
            }

            // Get profiles for enrolled students only - include student fields
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, email, role, student_number, year_level, section, semester, school_year')
                .in('id', enrolledUserIds);

            if (profilesError) {
                console.error('Profiles error:', profilesError);
                throw new Error(`Cannot load profiles: ${profilesError.message}`);
            }

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
                .select('user_id, game_type, difficulty')
                .in('user_id', enrolledUserIds);

            if (!playsError) plays = playsData || [];

            console.log('Enrolled students:', enrolledUserIds.length, 'Scores:', scores.length);

            // Aggregate data per student
            const studentData = (profiles || []).map(profile => {
                const studentScores = scores.filter(s => s.user_id === profile.id) || [];
                const studentPlays = plays.filter(p => p.user_id === profile.id) || [];

                // Total points
                const totalPoints = studentScores.reduce((sum, s) => sum + (s.score || 0), 0);

                // Games played - use plays table, but fallback to scores count if plays is empty
                // This handles cases where game_plays wasn't being populated before the fix
                const gamesPlayed = studentPlays.length > 0 ? studentPlays.length : studentScores.length;

                // Breakdown by game
                const gameBreakdown = {};
                ['fault_roulette', 'service_writer', 'cross_system', 'tool_selection'].forEach(gameType => {
                    const gameScores = studentScores.filter(s => s.game_type === gameType);
                    gameBreakdown[gameType] = {
                        points: gameScores.reduce((sum, s) => sum + (s.score || 0), 0),
                        games: studentPlays.filter(p => p.game_type === gameType).length,
                        best: Math.max(...gameScores.map(s => s.score || 0), 0)
                    };
                });

                // Difficulty breakdown
                const difficultyStats = {
                    easy: studentPlays.filter(p => p.difficulty === 'easy').length,
                    medium: studentPlays.filter(p => p.difficulty === 'medium').length,
                    hard: studentPlays.filter(p => p.difficulty === 'hard').length
                };

                // Last activity
                const lastActivity = studentScores.length > 0
                    ? new Date(Math.max(...studentScores.map(s => new Date(s.created_at))))
                    : null;

                return {
                    id: profile.id,
                    name: profile.full_name || profile.email?.split('@')[0] || 'Unknown',
                    full_name: profile.full_name,
                    email: profile.email,
                    role: profile.role || 'student',
                    student_number: profile.student_number,
                    year_level: profile.year_level,
                    section: profile.section,
                    semester: profile.semester,
                    school_year: profile.school_year,
                    totalPoints,
                    totalScore: totalPoints,
                    gamesPlayed,
                    gameBreakdown,
                    difficultyStats,
                    lastActivity
                };
            });

            // Sort by points by default
            studentData.sort((a, b) => b.totalPoints - a.totalPoints);

            setStudents(studentData);
        } catch (err) {
            console.error('Error loading students progress:', err);
            setError(err.message || 'Failed to load student progress');
        } finally {
            setLoading(false);
        }
    };

    const sortStudents = (by) => {
        setSortBy(by);
        const sorted = [...students].sort((a, b) => {
            if (by === 'points') return b.totalPoints - a.totalPoints;
            if (by === 'games') return b.gamesPlayed - a.gamesPlayed;
            if (by === 'name') return a.name.localeCompare(b.name);
            if (by === 'recent') {
                if (!a.lastActivity) return 1;
                if (!b.lastActivity) return -1;
                return b.lastActivity - a.lastActivity;
            }
            return 0;
        });
        setStudents(sorted);
    };

    // Get unique filter options from students
    const yearLevelOptions = [...new Set(students.map(s => s.year_level).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
    const sectionOptions = [...new Set(students.map(s => s.section).filter(Boolean))].sort();

    // Apply filters first, then search
    const filteredStudents = students
        .filter(s => {
            if (yearLevelFilter !== 'all' && s.year_level?.toString() !== yearLevelFilter) return false;
            if (sectionFilter !== 'all' && s.section !== sectionFilter) return false;
            return true;
        })
        .filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header skeleton */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
                {/* Table skeleton */}
                <Card className="overflow-hidden">
                    <StudentListSkeleton count={6} />
                </Card>
            </div>
        );
    }

    // Summary stats - use filtered students
    const totalStudents = filteredStudents.length;
    const activeStudents = filteredStudents.filter(s => s.gamesPlayed > 0).length;
    const totalPointsAll = filteredStudents.reduce((sum, s) => sum + s.totalPoints, 0);
    const avgPointsPerStudent = totalStudents > 0 ? Math.round(totalPointsAll / totalStudents) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="text-blue-600" />
                        Student Progress
                    </h2>
                    <p className="text-slate-500">View all students' game performance</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        onClick={() => {
                            setExporting(true);
                            try {
                                exportStudentProgress(students);
                            } catch (err) {
                                console.error('Export error:', err);
                            } finally {
                                setExporting(false);
                            }
                        }}
                        variant="outline"
                        disabled={students.length === 0 || exporting}
                        className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100"
                    >
                        {exporting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <FileSpreadsheet size={16} className="mr-2" />}
                        Export Excel
                    </Button>
                    <Button
                        onClick={() => exportToCSV(students)}
                        variant="outline"
                        disabled={students.length === 0}
                    >
                        <Download size={16} className="mr-2" />
                        CSV
                    </Button>
                    <Button onClick={loadStudentsProgress} variant="outline">
                        <RefreshCw size={16} className="mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                    <Users className="mx-auto text-blue-600 mb-2" size={24} />
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalStudents}</div>
                    <div className="text-xs text-slate-500">Total Users</div>
                </Card>
                <Card className="p-4 text-center">
                    <TrendingUp className="mx-auto text-green-600 mb-2" size={24} />
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{activeStudents}</div>
                    <div className="text-xs text-slate-500">Active Players</div>
                </Card>
                <Card className="p-4 text-center">
                    <Trophy className="mx-auto text-yellow-600 mb-2" size={24} />
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalPointsAll.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">Total Points Earned</div>
                </Card>
                <Card className="p-4 text-center">
                    <Target className="mx-auto text-purple-600 mb-2" size={24} />
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{avgPointsPerStudent}</div>
                    <div className="text-xs text-slate-500">Avg Points/User</div>
                </Card>
            </div>

            {/* Filters, Search and Sort */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {/* Section Filters */}
                <div className="flex gap-2">
                    <select
                        value={yearLevelFilter}
                        onChange={(e) => setYearLevelFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    >
                        <option value="all">All Years</option>
                        {yearLevelOptions.map(yl => (
                            <option key={yl} value={yl.toString()}>Year {yl}</option>
                        ))}
                    </select>
                    <select
                        value={sectionFilter}
                        onChange={(e) => setSectionFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    >
                        <option value="all">All Sections</option>
                        {sectionOptions.map(sec => (
                            <option key={sec} value={sec}>{sec}</option>
                        ))}
                    </select>
                </div>

                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <span className="text-sm text-slate-500 self-center">Sort by:</span>
                    {['points', 'games', 'name', 'recent'].map(sort => (
                        <button
                            key={sort}
                            onClick={() => sortStudents(sort)}
                            className={`px-3 py-1 rounded-lg text-sm ${sortBy === sort
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                }`}
                        >
                            {sort.charAt(0).toUpperCase() + sort.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Student List */}
            <Card className="divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                {/* Table Header - Desktop */}
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-4">User</div>
                    <div className="col-span-2 text-center">Points</div>
                    <div className="col-span-2 text-center">Games</div>
                    <div className="col-span-2 text-center">Last Active</div>
                    <div className="col-span-1"></div>
                </div>

                {filteredStudents.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        {searchQuery ? 'No users match your search.' : 'No users found. Make sure profiles are populated.'}
                    </div>
                ) : (
                    filteredStudents.map((student, index) => (
                        <div key={student.id}>
                            {/* Student Row */}
                            <div
                                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                                onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
                            >
                                {/* Mobile Layout */}
                                <div className="md:hidden flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`font-bold text-lg w-8 ${index === 0 ? 'text-yellow-600' :
                                            index === 1 ? 'text-slate-400' :
                                                index === 2 ? 'text-amber-600' :
                                                    'text-slate-500'
                                            }`}>
                                            #{index + 1}
                                        </span>
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {student.name[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{student.name}</p>
                                            <p className="text-xs text-slate-500">{student.totalPoints} pts • {student.gamesPlayed} games</p>
                                        </div>
                                    </div>
                                    {expandedStudent === student.id
                                        ? <ChevronUp size={18} className="text-slate-400" />
                                        : <ChevronDown size={18} className="text-slate-400" />
                                    }
                                </div>

                                {/* Desktop Layout */}
                                <div className="hidden md:block col-span-1">
                                    <span className={`font-bold ${index === 0 ? 'text-yellow-600' :
                                        index === 1 ? 'text-slate-400' :
                                            index === 2 ? 'text-amber-600' :
                                                'text-slate-500'
                                        }`}>
                                        #{index + 1}
                                    </span>
                                </div>
                                <div className="hidden md:block col-span-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {student.name[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{student.name}</p>
                                            <p className="text-xs text-slate-500">{student.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:block col-span-2 text-center">
                                    <span className="font-bold text-yellow-600">{student.totalPoints.toLocaleString()}</span>
                                </div>
                                <div className="hidden md:block col-span-2 text-center">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{student.gamesPlayed}</span>
                                </div>
                                <div className="hidden md:block col-span-2 text-center text-sm text-slate-500">
                                    {student.lastActivity
                                        ? student.lastActivity.toLocaleDateString()
                                        : 'Never'
                                    }
                                </div>
                                <div className="hidden md:block col-span-1 text-right">
                                    {expandedStudent === student.id
                                        ? <ChevronUp size={18} className="text-slate-400" />
                                        : <ChevronDown size={18} className="text-slate-400" />
                                    }
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedStudent === student.id && (
                                <div className="px-4 pb-4 bg-slate-50 dark:bg-slate-800/30">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                        {/* Game Breakdown */}
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                                <BarChart2 size={16} />
                                                Points by Game
                                            </h4>
                                            <div className="space-y-2">
                                                {Object.entries(GAME_NAMES).map(([gameType, gameName]) => {
                                                    const stats = student.gameBreakdown[gameType];
                                                    const GameIcon = GAME_ICONS[gameType];
                                                    return (
                                                        <div key={gameType} className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded-lg">
                                                            <GameIcon size={16} className="text-slate-500" />
                                                            <span className="flex-1 text-sm">{gameName}</span>
                                                            <span className="text-xs text-slate-500">{stats.games} games</span>
                                                            <span className="font-bold text-sm">{stats.points} pts</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Difficulty Breakdown */}
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                                <Award size={16} />
                                                Difficulty Breakdown
                                            </h4>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="text-center p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                                        {student.difficultyStats.easy}
                                                    </div>
                                                    <div className="text-xs text-green-600">Easy</div>
                                                </div>
                                                <div className="text-center p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                                    <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                                                        {student.difficultyStats.medium}
                                                    </div>
                                                    <div className="text-xs text-yellow-600">Medium</div>
                                                </div>
                                                <div className="text-center p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                                    <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                                                        {student.difficultyStats.hard}
                                                    </div>
                                                    <div className="text-xs text-red-600">Hard</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </Card>
        </div>
    );
}
