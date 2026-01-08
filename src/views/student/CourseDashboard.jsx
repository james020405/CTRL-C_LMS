import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Activity, PlayCircle, ArrowRight, Gamepad2, Loader2, Plus, X, LogOut } from 'lucide-react';
import { BentoGrid, BentoGridItem } from '../../components/ui/bento-grid';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentProgress } from '../../lib/progressService';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';

export default function StudentDashboard() {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const toast = useToast();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalPoints: 0, gamesPlayed: 0 });

    // Join Course Modal State
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [joinError, setJoinError] = useState('');

    // Leave Course Confirmation State
    const [courseToLeave, setCourseToLeave] = useState(null);
    const [leaving, setLeaving] = useState(false);

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
            onClick: () => navigate('/student/games'),
        },
    ];

    useEffect(() => {
        if (user?.id) {
            fetchEnrolledCourses();
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

    // Fetch only courses the student is enrolled in
    const fetchEnrolledCourses = async () => {
        setLoading(true);
        try {
            // Get enrollments for this user
            const { data: enrollments, error: enrollError } = await supabase
                .from('course_enrollments')
                .select('course_id')
                .eq('user_id', user.id);

            if (enrollError) throw enrollError;

            if (!enrollments || enrollments.length === 0) {
                setCourses([]);
                setLoading(false);
                return;
            }

            // Get course details for enrolled courses
            const courseIds = enrollments.map(e => e.course_id);
            const { data: coursesData, error: coursesError } = await supabase
                .from('courses')
                .select('*')
                .in('id', courseIds)
                .order('created_at', { ascending: false });

            if (coursesError) throw coursesError;
            setCourses(coursesData || []);
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
        } finally {
            setLoading(false);
        }
    };

    // Join course with access code
    const handleJoinCourse = async (e) => {
        e.preventDefault();
        if (!joinCode.trim()) return;

        setJoining(true);
        setJoinError('');

        try {
            // Find course by access code
            const { data: course, error: findError } = await supabase
                .from('courses')
                .select('id, title')
                .eq('access_code', joinCode.trim().toUpperCase())
                .single();

            if (findError || !course) {
                setJoinError('Invalid course code. Please check and try again.');
                setJoining(false);
                return;
            }

            // Check if already enrolled
            const { data: existing } = await supabase
                .from('course_enrollments')
                .select('id')
                .eq('user_id', user.id)
                .eq('course_id', course.id)
                .single();

            if (existing) {
                setJoinError('You are already enrolled in this course.');
                setJoining(false);
                return;
            }

            // Enroll in course
            const { error: enrollError } = await supabase
                .from('course_enrollments')
                .insert({
                    user_id: user.id,
                    course_id: course.id
                });

            if (enrollError) throw enrollError;

            // Update course student count
            await supabase.rpc('increment_student_count', { course_uuid: course.id });

            toast.success(`Joined "${course.title}" successfully!`);
            setShowJoinModal(false);
            setJoinCode('');
            fetchEnrolledCourses();
        } catch (error) {
            console.error('Error joining course:', error);
            setJoinError('Failed to join course. Please try again.');
        } finally {
            setJoining(false);
        }
    };

    // Leave course - initiate confirmation
    const initiateLeaveCourse = (course, e) => {
        e.stopPropagation();
        setCourseToLeave(course);
    };

    // Leave course - confirm
    const confirmLeaveCourse = async () => {
        if (!courseToLeave) return;

        setLeaving(true);
        try {
            const { error } = await supabase
                .from('course_enrollments')
                .delete()
                .eq('user_id', user.id)
                .eq('course_id', courseToLeave.id);

            if (error) throw error;

            // Decrement student count
            await supabase.rpc('decrement_student_count', { course_uuid: courseToLeave.id });

            toast.success(`Left "${courseToLeave.title}"`);
            setCourseToLeave(null);
            fetchEnrolledCourses();
        } catch (error) {
            console.error('Error leaving course:', error);
            toast.error('Failed to leave course');
        } finally {
            setLeaving(false);
        }
    };

    const getFirstName = () => {
        let name = 'Student';
        if (profile?.full_name) {
            name = profile.full_name.split(' ')[0];
        } else if (user?.email) {
            const username = user.email.split('@')[0];
            name = username.split(/[._]/)[0];
        }
        // Capitalize first letter
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    };
    const displayName = getFirstName();

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
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Courses</h2>
                    <Button onClick={() => setShowJoinModal(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus size={16} className="mr-2" />
                        Join Course
                    </Button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                        <Loader2 className="animate-spin text-blue-600 mr-2" />
                        <span className="text-slate-500">Loading courses...</span>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center p-12 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
                        <BookOpen className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                        <p className="text-slate-600 dark:text-slate-400 mb-2 font-medium">No courses yet</p>
                        <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
                            Ask your professor for a course code to get started.
                        </p>
                        <Button onClick={() => setShowJoinModal(true)} variant="outline">
                            <Plus size={16} className="mr-2" />
                            Join Your First Course
                        </Button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl"
                            >
                                {/* Leave button */}
                                <button
                                    onClick={(e) => initiateLeaveCourse(course, e)}
                                    className="absolute top-3 right-3 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    title="Leave course"
                                >
                                    <LogOut size={16} />
                                </button>

                                <div
                                    onClick={() => navigate(`/student/course/${course.id}`)}
                                    className="cursor-pointer"
                                >
                                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <BookOpen size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {course.title}
                                    </h3>
                                    <div className="flex items-center text-blue-600 dark:text-blue-500 font-medium text-sm">
                                        View Lessons <ArrowRight size={16} className="ml-1 group-hover:translate-x-2 transition-transform duration-300" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Join Course Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Join Course</h3>
                            <button
                                onClick={() => { setShowJoinModal(false); setJoinCode(''); setJoinError(''); }}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            Enter the course code provided by your professor.
                        </p>

                        <form onSubmit={handleJoinCourse}>
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="Enter code (e.g., KXSBNS)"
                                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-center text-xl tracking-widest uppercase mb-4"
                                maxLength={10}
                                autoFocus
                            />

                            {joinError && (
                                <p className="text-red-500 text-sm mb-4">{joinError}</p>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                disabled={joining || !joinCode.trim()}
                            >
                                {joining ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={16} />
                                        Joining...
                                    </>
                                ) : (
                                    'Join Course'
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Leave Course Confirmation Modal */}
            {courseToLeave && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md m-4 shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            Leave Course?
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Are you sure you want to leave <span className="font-semibold">"{courseToLeave.title}"</span>?
                            You can rejoin later with the course code.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setCourseToLeave(null)}
                                className="flex-1"
                                disabled={leaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmLeaveCourse}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                disabled={leaving}
                            >
                                {leaving ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={16} />
                                        Leaving...
                                    </>
                                ) : (
                                    'Yes, Leave Course'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

