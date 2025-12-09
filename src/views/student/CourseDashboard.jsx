import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Activity, PlayCircle, ArrowRight, Gamepad2, TrendingUp, Loader2 } from 'lucide-react';
import { BentoGrid, BentoGridItem } from '../../components/ui/bento-grid';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentProgress } from '../../lib/progressService';

export default function StudentDashboard() {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalPoints: 0, gamesPlayed: 0 });

    const items = [
        {
            title: "7 Systems Explorer",
            description: "Interactive 3D-style exploration of the major automotive systems.",
            header: (
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/10 items-center justify-center group-hover/bento:scale-105 transition-transform duration-300">
                    <Activity className="w-12 h-12 text-blue-500" />
                </div>
            ),
            icon: <Activity className="h-4 w-4 text-blue-500" />,
            onClick: () => navigate('/student/systems'),
        },
        {
            title: "Flashcards",
            description: "Master technical terms with our spaced repetition study tool.",
            header: (
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/10 items-center justify-center group-hover/bento:scale-105 transition-transform duration-300">
                    <BookOpen className="w-12 h-12 text-emerald-500" />
                </div>
            ),
            icon: <BookOpen className="h-4 w-4 text-emerald-500" />,
            onClick: () => navigate('/student/flashcards'),
        },
        {
            title: "3D Simulator",
            description: "Interactive 3D disassembly and assembly practice.",
            header: (
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/10 items-center justify-center group-hover/bento:scale-105 transition-transform duration-300">
                    <PlayCircle className="w-12 h-12 text-purple-500" />
                </div>
            ),
            icon: <PlayCircle className="h-4 w-4 text-purple-500" />,
            onClick: () => navigate('/student/simulator'),
        },
        {
            title: "Skill Games",
            description: "Test your knowledge with fun, competitive learning games.",
            header: (
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/10 items-center justify-center group-hover/bento:scale-105 transition-transform duration-300">
                    <Gamepad2 className="w-12 h-12 text-orange-500" />
                </div>
            ),
            icon: <Gamepad2 className="h-4 w-4 text-orange-500" />,
            onClick: () => navigate('/student/roulette'),
        },
    ];

    useEffect(() => {
        fetchCourses();
        if (user?.id) {
            fetchStats();
        }
    }, [user?.id]);

    const fetchStats = async () => {
        try {
            const progress = await getStudentProgress(user.id);
            setStats({
                totalPoints: progress.totalPoints || 0,
                gamesPlayed: progress.gamesPlayed || 0
            });
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const fetchCourses = async () => {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCourses(data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Student';

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            {/* Welcome Header with Stats */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                        Welcome back, <span className="text-blue-600">{displayName}</span>!
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">Continue your automotive journey.</p>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-4">
                    <div
                        onClick={() => navigate('/student/progress')}
                        className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 px-5 py-3 rounded-xl cursor-pointer hover:shadow-lg transition-all group"
                    >
                        <div className="text-xs text-slate-500 dark:text-slate-400">Total Points</div>
                        <div className="text-2xl font-bold text-yellow-600 group-hover:scale-105 transition-transform">
                            {stats.totalPoints.toLocaleString()}
                        </div>
                    </div>
                    <div
                        onClick={() => navigate('/student/progress')}
                        className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-5 py-3 rounded-xl cursor-pointer hover:shadow-lg transition-all group"
                    >
                        <div className="text-xs text-slate-500 dark:text-slate-400">Games Played</div>
                        <div className="text-2xl font-bold text-blue-600 group-hover:scale-105 transition-transform">
                            {stats.gamesPlayed}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links Bento Grid */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Quick Access</h2>
                <BentoGrid className="max-w-6xl mx-0">
                    {items.map((item, i) => (
                        <div key={i} onClick={item.onClick} className="cursor-pointer h-full">
                            <BentoGridItem
                                title={item.title}
                                description={item.description}
                                header={item.header}
                                icon={item.icon}
                            />
                        </div>
                    ))}
                </BentoGrid>
            </div>

            {/* Enrolled Courses Section */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">My Courses</h2>
                {loading ? (
                    <div className="flex items-center justify-center p-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                        <Loader2 className="animate-spin text-blue-600 mr-2" />
                        <span className="text-slate-500">Loading courses...</span>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center p-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                        <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 mb-2">No courses available yet</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500">Check back later or ask your professor for the course code.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                onClick={() => navigate(`/student/course/${course.id}`)}
                                className="group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <BookOpen size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                    Code: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{course.access_code}</span>
                                </p>
                                <div className="flex items-center text-blue-600 dark:text-blue-500 font-medium text-sm">
                                    View Lessons <ArrowRight size={16} className="ml-1 group-hover:translate-x-2 transition-transform duration-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
