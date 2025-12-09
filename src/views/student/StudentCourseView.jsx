import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FileText, Video, Image as ImageIcon, Link as LinkIcon, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export default function StudentCourseView() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedTopic, setExpandedTopic] = useState(null);

    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    const fetchCourseDetails = async () => {
        setLoading(true);
        try {
            // Fetch Course Info
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .single();

            if (courseError) throw courseError;
            setCourse(courseData);

            // Fetch Topics and Materials
            const { data: topicsData, error: topicsError } = await supabase
                .from('topics')
                .select('*, materials(*)')
                .eq('course_id', courseId)
                .order('created_at', { ascending: true });

            if (topicsError) throw topicsError;
            setTopics(topicsData || []);

        } catch (error) {
            console.error('Error fetching course details:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'pdf': return <FileText size={16} />;
            case 'video': return <Video size={16} />;
            case 'image': return <ImageIcon size={16} />;
            default: return <LinkIcon size={16} />;
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading course content...</div>;
    }

    if (!course) {
        return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Course not found.</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => navigate('/student/dashboard')} className="p-2">
                    <ChevronLeft size={24} />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{course.title}</h1>
                    <p className="text-slate-500 dark:text-slate-400">Course Code: {course.access_code}</p>
                </div>
            </div>

            <div className="space-y-4">
                {topics.length === 0 ? (
                    <Card className="p-8 text-center text-slate-500 dark:text-slate-400">
                        No topics have been added to this course yet.
                    </Card>
                ) : (
                    topics.map((topic) => (
                        <Card key={topic.id} className="overflow-hidden">
                            <button
                                onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                                className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{topic.title}</h3>
                                {expandedTopic === topic.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>

                            {expandedTopic === topic.id && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                    {topic.materials.length === 0 ? (
                                        <p className="text-sm text-slate-500 italic px-2">No materials available.</p>
                                    ) : (
                                        topic.materials.map((material) => (
                                            <a
                                                key={material.id}
                                                href={material.url || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all group"
                                            >
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded group-hover:scale-110 transition-transform">
                                                    {getIcon(material.type)}
                                                </div>
                                                <span className="text-slate-700 dark:text-slate-300 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {material.title}
                                                </span>
                                            </a>
                                        ))
                                    )}
                                </div>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
