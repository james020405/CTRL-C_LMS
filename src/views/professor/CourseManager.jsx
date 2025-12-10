import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Copy, Trash2, ChevronRight, Check, Loader2, BookOpen, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export default function CourseManager({ onSelectCourse }) {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [newCourseTitle, setNewCourseTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            fetchCourses();
        }
    }, [user]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('professor_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCourses(data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setError('Failed to load courses. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        if (!newCourseTitle.trim() || !user) return;

        setCreating(true);
        setError('');
        const accessCode = Math.random().toString(36).substr(2, 6).toUpperCase();

        try {
            const { data, error } = await supabase
                .from('courses')
                .insert([
                    {
                        title: newCourseTitle,
                        access_code: accessCode,
                        professor_id: user.id,
                        student_count: 0
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            setCourses([data, ...courses]);
            setNewCourseTitle('');
        } catch (error) {
            console.error('Error creating course:', error);
            setError(`Failed to create course: ${error.message}`);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteCourse = async (courseId, courseTitle) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${courseTitle}"?\n\nThis will also delete all topics and materials in this course. This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            // First delete materials in topics of this course
            const { data: topics } = await supabase
                .from('topics')
                .select('id')
                .eq('course_id', courseId);

            if (topics?.length) {
                const topicIds = topics.map(t => t.id);
                await supabase.from('materials').delete().in('topic_id', topicIds);
            }

            // Then delete topics
            await supabase.from('topics').delete().eq('course_id', courseId);

            // Finally delete the course
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', courseId);

            if (error) throw error;

            setCourses(courses.filter(c => c.id !== courseId));
        } catch (error) {
            console.error('Error deleting course:', error);
            setError(`Failed to delete course: ${error.message}`);
        }
    };

    const handleCopyCode = async (code) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000);
        }
    };

    return (
        <div className="space-y-6">
            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            {/* Create Course Card */}
            <Card className="p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Create New Course</h2>
                <form onSubmit={handleCreateCourse} className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Course Title (e.g., Engine Repair 101)"
                        value={newCourseTitle}
                        onChange={(e) => setNewCourseTitle(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button type="submit" disabled={!newCourseTitle || !user || creating}>
                        {creating ? (
                            <Loader2 size={20} className="mr-2 animate-spin" />
                        ) : (
                            <Plus size={20} className="mr-2" />
                        )}
                        {creating ? 'Creating...' : 'Create'}
                    </Button>
                </form>
            </Card>

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : courses.length === 0 ? (
                /* Empty State */
                <Card className="p-12 text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        No courses yet
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        Create your first course above and start adding topics and materials for your students.
                    </p>
                </Card>
            ) : (
                /* Course List */
                <div className="grid gap-4">
                    {courses.map((course, index) => {
                        // Gradient colors based on index
                        const gradients = [
                            'from-blue-500 to-indigo-600',
                            'from-emerald-500 to-teal-600',
                            'from-purple-500 to-pink-600',
                            'from-orange-500 to-red-600',
                            'from-cyan-500 to-blue-600',
                        ];
                        const gradient = gradients[index % gradients.length];

                        return (
                            <Card
                                key={course.id}
                                className="overflow-hidden hover:shadow-lg transition-all duration-200 group"
                            >
                                <div className="flex">
                                    {/* Gradient Left Border */}
                                    <div className={`w-1.5 bg-gradient-to-b ${gradient}`} />

                                    <div className="flex-1 p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {/* Course Avatar */}
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                                                    {course.title[0]?.toUpperCase()}
                                                </div>

                                                <div>
                                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                        {course.title}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCopyCode(course.access_code);
                                                            }}
                                                            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                                                            title="Click to copy access code"
                                                        >
                                                            <span className="text-slate-400">Code:</span>
                                                            <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-mono text-slate-700 dark:text-slate-300 text-xs">
                                                                {course.access_code}
                                                            </code>
                                                            {copiedCode === course.access_code ? (
                                                                <Check size={14} className="text-green-500" />
                                                            ) : (
                                                                <Copy size={14} className="opacity-50" />
                                                            )}
                                                        </button>
                                                        <span className="flex items-center gap-1">
                                                            <Users size={14} className="opacity-50" />
                                                            {course.student_count || 0} Students
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteCourse(course.id, course.title)}
                                                    className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                                <Button
                                                    onClick={() => onSelectCourse(course)}
                                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                                >
                                                    Manage Topics <ChevronRight size={16} className="ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
