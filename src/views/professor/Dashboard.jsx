import React, { useState, useEffect } from 'react';
import { Header } from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import CourseManager from './CourseManager';
import TopicManager from './TopicManager';
import ActivityManager from './ActivityManager';
import StudentProgress from './StudentProgress';
import StudentInsights from './StudentInsights';
import AIUsageStats from './AIUsageStats';
import { Card } from '../../components/ui/Card';
import {
    BookOpen, Users, TrendingUp, Sparkles, FileText,
    Activity, ChevronRight, Loader2, GraduationCap,
    BarChart3, Brain, Zap, ClipboardList
} from 'lucide-react';

export default function ProfessorDashboard() {
    const { user, profile } = useAuth();
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [activeTab, setActiveTab] = useState('courses');
    const [activityCourse, setActivityCourse] = useState(null);
    const [stats, setStats] = useState({
        courses: 0,
        students: 0,
        materials: 0,
        activeToday: 0
    });
    const [loadingStats, setLoadingStats] = useState(true);

    // Get professor's first name
    const getFirstName = () => {
        if (profile?.full_name) {
            return profile.full_name.split(' ')[0];
        }
        if (user?.email) {
            const username = user.email.split('@')[0];
            return username.split(/[._]/)[0];
        }
        return 'Professor';
    };
    const displayName = getFirstName();

    // Fetch stats
    useEffect(() => {
        if (user?.id) {
            fetchStats();
        }
    }, [user?.id]);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            // Get courses count
            const { data: courses } = await supabase
                .from('courses')
                .select('id')
                .eq('professor_id', user.id);

            // Get total materials
            const courseIds = courses?.map(c => c.id) || [];
            let materialsCount = 0;
            let topicsCount = 0;
            let enrolledStudents = 0;

            if (courseIds.length > 0) {
                // Get topics for professor's courses
                const { data: topics } = await supabase
                    .from('topics')
                    .select('id')
                    .in('course_id', courseIds);

                topicsCount = topics?.length || 0;
                const topicIds = topics?.map(t => t.id) || [];

                if (topicIds.length > 0) {
                    const { data: materials } = await supabase
                        .from('materials')
                        .select('id')
                        .in('topic_id', topicIds);

                    materialsCount = materials?.length || 0;
                }

                // Get enrolled students count (unique students across professor's courses)
                const { data: enrollments } = await supabase
                    .from('course_enrollments')
                    .select('user_id')
                    .in('course_id', courseIds);

                const uniqueStudents = new Set(enrollments?.map(e => e.user_id) || []);
                enrolledStudents = uniqueStudents.size;
            }

            // Get active today (enrolled students who played games today)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let activeToday = 0;
            if (courseIds.length > 0) {
                try {
                    // Get enrolled student IDs first
                    const { data: enrollments } = await supabase
                        .from('course_enrollments')
                        .select('user_id')
                        .in('course_id', courseIds);

                    const enrolledIds = enrollments?.map(e => e.user_id) || [];

                    if (enrolledIds.length > 0) {
                        const { data: recentScores } = await supabase
                            .from('game_scores')
                            .select('user_id')
                            .in('user_id', enrolledIds)
                            .gte('created_at', today.toISOString());

                        const uniqueUsers = new Set(recentScores?.map(s => s.user_id) || []);
                        activeToday = uniqueUsers.size;
                    }
                } catch (e) {
                    // game_scores table may not exist
                }
            }

            setStats({
                courses: courses?.length || 0,
                students: enrolledStudents,
                materials: materialsCount,
                activeToday
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const tabs = [
        { id: 'courses', label: 'Course Management', icon: BookOpen },
        { id: 'activities', label: 'Activities', icon: ClipboardList },
        { id: 'progress', label: 'Student Progress', icon: BarChart3 },
        { id: 'insights', label: 'AI Insights', icon: Brain, isNew: true },
        { id: 'ai-usage', label: 'AI Usage', icon: Zap },
    ];

    const statCards = [
        {
            label: 'Total Courses',
            value: stats.courses,
            icon: BookOpen,
            gradient: 'from-blue-500 to-indigo-600',
            bgGradient: 'from-blue-500/10 to-indigo-600/10'
        },
        {
            label: 'Total Students',
            value: stats.students,
            icon: Users,
            gradient: 'from-emerald-500 to-teal-600',
            bgGradient: 'from-emerald-500/10 to-teal-600/10'
        },
        {
            label: 'Materials Uploaded',
            value: stats.materials,
            icon: FileText,
            gradient: 'from-purple-500 to-pink-600',
            bgGradient: 'from-purple-500/10 to-pink-600/10'
        },
        {
            label: 'Active Today',
            value: stats.activeToday,
            icon: Activity,
            gradient: 'from-orange-500 to-red-600',
            bgGradient: 'from-orange-500/10 to-red-600/10'
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <Header userInitial={displayName[0]?.toUpperCase() || 'P'} />

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Welcome Header */}
                {!selectedCourse && (
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                                    Welcome back, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{displayName}</span>!
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Here's what's happening with your courses today.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <GraduationCap className="text-blue-600" size={20} />
                                <span>Professor Dashboard</span>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {statCards.map((stat) => (
                                <Card
                                    key={stat.label}
                                    className={`p-4 bg-gradient-to-br ${stat.bgGradient} border-0 hover:scale-[1.02] transition-transform duration-200`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                                            <stat.icon className="text-white" size={20} />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                                {loadingStats ? (
                                                    <Loader2 className="animate-spin" size={20} />
                                                ) : (
                                                    stat.value
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-600 dark:text-slate-400">
                                                {stat.label}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === tab.id
                                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                    {tab.isNew && (
                                        <span className="px-1.5 py-0.5 text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                                            NEW
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Topic Manager Header */}
                {selectedCourse && (
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Manage Course Content
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Editing <span className="font-semibold text-blue-600">{selectedCourse.title}</span>
                        </p>
                    </div>
                )}

                {/* Content */}
                {selectedCourse ? (
                    <TopicManager
                        course={selectedCourse}
                        onBack={() => setSelectedCourse(null)}
                    />
                ) : activityCourse ? (
                    <ActivityManager
                        courseId={activityCourse.id}
                        courseName={activityCourse.title}
                        onBack={() => setActivityCourse(null)}
                        enrolledCount={activityCourse.student_count}
                    />
                ) : activeTab === 'courses' ? (
                    <CourseManager onSelectCourse={setSelectedCourse} />
                ) : activeTab === 'activities' ? (
                    <CourseManager onSelectCourse={setActivityCourse} mode="activities" />
                ) : activeTab === 'progress' ? (
                    <StudentProgress />
                ) : activeTab === 'insights' ? (
                    <StudentInsights />
                ) : activeTab === 'ai-usage' ? (
                    <AIUsageStats />
                ) : null}
            </main>
        </div>
    );
}
