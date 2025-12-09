import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Copy, Trash2, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export default function CourseManager({ onSelectCourse }) {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [newCourseTitle, setNewCourseTitle] = useState('');
    const [loading, setLoading] = useState(false);

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
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        if (!newCourseTitle.trim() || !user) return;

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
            alert('Failed to create course. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
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
                    <Button type="submit" disabled={!newCourseTitle || !user}>
                        <Plus size={20} className="mr-2" />
                        {loading ? 'Creating...' : 'Create'}
                    </Button>
                </form>
            </Card>

            <div className="grid gap-4">
                {courses.map((course) => (
                    <Card key={course.id} className="flex items-center justify-between p-4 hover:border-blue-500 transition-colors">
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{course.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                <span className="flex items-center gap-1">
                                    Code: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-700 dark:text-slate-300">{course.access_code}</code>
                                </span>
                                <span>{course.student_count} Students</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="secondary" onClick={() => onSelectCourse(course)}>
                                Manage Topics <ChevronRight size={16} className="ml-1" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
