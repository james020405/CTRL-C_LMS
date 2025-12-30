import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Copy, Trash2, ChevronRight, Check, Loader2, BookOpen, Users, X, UserMinus, ClipboardList } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';

export default function CourseManager({ onSelectCourse, mode = 'content' }) {
    const { user } = useAuth();
    const toast = useToast();
    const [courses, setCourses] = useState([]);
    const [newCourseTitle, setNewCourseTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);
    const [error, setError] = useState('');

    // Delete Confirmation State
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);

    // Enrolled Students Modal State
    const [showEnrolledModal, setShowEnrolledModal] = useState(false);
    const [selectedCourseForStudents, setSelectedCourseForStudents] = useState(null);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [studentToRemove, setStudentToRemove] = useState(null);

    useEffect(() => {
        if (user) {
            fetchCourses();
        }
    }, [user]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            // Fetch courses with actual enrollment count from course_enrollments
            const { data, error } = await supabase
                .from('courses')
                .select('*, course_enrollments(count)')
                .eq('professor_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map the enrollment count to student_count for display
            const coursesWithCount = (data || []).map(course => ({
                ...course,
                student_count: course.course_enrollments?.[0]?.count || 0
            }));

            setCourses(coursesWithCount);
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
            toast.success('Course created successfully');
        } catch (error) {
            console.error('Error creating course:', error);
            toast.error(`Failed to create course: ${error.message}`);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteClick = (course) => {
        setCourseToDelete(course);
        setDeleteConfirmOpen(true);
    };

    const confirmDeleteCourse = async () => {
        if (!courseToDelete) return;

        try {
            // First delete materials in topics of this course
            const { data: topics } = await supabase
                .from('topics')
                .select('id')
                .eq('course_id', courseToDelete.id);

            if (topics?.length) {
                const topicIds = topics.map(t => t.id);
                await supabase.from('materials').delete().in('topic_id', topicIds);
            }

            // Then delete topics
            await supabase.from('topics').delete().eq('course_id', courseToDelete.id);

            // Finally delete the course
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', courseToDelete.id);

            if (error) throw error;

            setCourses(courses.filter(c => c.id !== courseToDelete.id));
            toast.success('Course deleted');
        } catch (error) {
            console.error('Error deleting course:', error);
            toast.error(`Failed to delete course: ${error.message}`);
        } finally {
            setDeleteConfirmOpen(false);
            setCourseToDelete(null);
        }
    };

    const handleCopyCode = async (code) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            toast.success('Access code copied!');
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
            toast.success('Code copied to clipboard');
            setTimeout(() => setCopiedCode(null), 2000);
        }
    };

    // Fetch enrolled students for a course
    const fetchEnrolledStudents = async (course) => {
        setSelectedCourseForStudents(course);
        setShowEnrolledModal(true);
        setLoadingStudents(true);

        try {
            // Get enrollments
            const { data: enrollments, error: enrollError } = await supabase
                .from('course_enrollments')
                .select('id, user_id, enrolled_at')
                .eq('course_id', course.id);

            if (enrollError) throw enrollError;

            if (!enrollments || enrollments.length === 0) {
                setEnrolledStudents([]);
                setLoadingStudents(false);
                return;
            }

            // Get profiles for enrolled users
            const userIds = enrollments.map(e => e.user_id);
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .in('id', userIds);

            if (profilesError) throw profilesError;

            // Combine enrollment and profile data
            const students = enrollments.map(enrollment => {
                const profile = profiles?.find(p => p.id === enrollment.user_id);
                return {
                    enrollment_id: enrollment.id,
                    user_id: enrollment.user_id,
                    name: profile?.full_name || profile?.email?.split('@')[0] || 'Unknown',
                    email: profile?.email || '',
                    enrolled_at: enrollment.enrolled_at
                };
            });

            setEnrolledStudents(students);
        } catch (error) {
            console.error('Error fetching enrolled students:', error);
            toast.error('Failed to load students');
        } finally {
            setLoadingStudents(false);
        }
    };

    // Remove student from course - initiate confirmation
    const initiateRemoveStudent = (student) => {
        setStudentToRemove(student);
    };

    // Confirm and remove student
    const confirmRemoveStudent = async () => {
        if (!studentToRemove) return;

        try {
            const { error } = await supabase
                .from('course_enrollments')
                .delete()
                .eq('id', studentToRemove.enrollment_id);

            if (error) throw error;

            // Update local state
            setEnrolledStudents(prev => prev.filter(s => s.enrollment_id !== studentToRemove.enrollment_id));

            // Decrement student count
            if (selectedCourseForStudents) {
                await supabase.rpc('decrement_student_count', { course_uuid: selectedCourseForStudents.id });

                // Update courses list
                setCourses(prev => prev.map(c =>
                    c.id === selectedCourseForStudents.id
                        ? { ...c, student_count: Math.max(0, (c.student_count || 0) - 1) }
                        : c
                ));
            }

            toast.success(`${studentToRemove.name} removed from course`);
        } catch (error) {
            console.error('Error removing student:', error);
            toast.error('Failed to remove student');
        } finally {
            setStudentToRemove(null);
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
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                fetchEnrolledStudents(course);
                                                            }}
                                                            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                                                            title="Click to view enrolled students"
                                                        >
                                                            <Users size={14} className="opacity-50" />
                                                            {course.student_count || 0} Students
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(course)}
                                                    className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                                <Button
                                                    onClick={() => onSelectCourse(course)}
                                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                                >
                                                    {mode === 'activities' ? (
                                                        <>Manage Activities <ClipboardList size={16} className="ml-1" /></>
                                                    ) : (
                                                        <>Manage Topics <ChevronRight size={16} className="ml-1" /></>
                                                    )}
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

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={confirmDeleteCourse}
                title="Delete Course?"
                description={`Are you sure you want to delete "${courseToDelete?.title}"? This will permanently remove all topics and materials associated with this course.`}
                confirmText="Delete Course"
                cancelText="Cancel"
                variant="danger"
            />

            {/* Enrolled Students Modal */}
            {showEnrolledModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Enrolled Students</h3>
                                <p className="text-sm text-slate-500">{selectedCourseForStudents?.title}</p>
                            </div>
                            <button
                                onClick={() => { setShowEnrolledModal(false); setSelectedCourseForStudents(null); setStudentToRemove(null); }}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {/* Removal Confirmation */}
                            {studentToRemove && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                                        Remove <strong>{studentToRemove.name}</strong> from this course?
                                    </p>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={confirmRemoveStudent} className="bg-red-600 hover:bg-red-700 text-white">Yes, Remove</Button>
                                        <Button size="sm" variant="outline" onClick={() => setStudentToRemove(null)}>Cancel</Button>
                                    </div>
                                </div>
                            )}
                            {loadingStudents ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="animate-spin text-blue-600" size={24} />
                                </div>
                            ) : enrolledStudents.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="mx-auto mb-2 text-slate-400" size={32} />
                                    <p className="text-slate-500">No students enrolled yet</p>
                                    <p className="text-xs text-slate-400 mt-1">Share the course code with your students</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {enrolledStudents.map((student) => (
                                        <div
                                            key={student.enrollment_id}
                                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{student.name}</p>
                                                <p className="text-xs text-slate-500">{student.email}</p>
                                            </div>
                                            <button
                                                onClick={() => initiateRemoveStudent(student)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Remove student"
                                            >
                                                <UserMinus size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
