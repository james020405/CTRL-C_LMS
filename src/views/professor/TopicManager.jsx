import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, FileText, Video, Image as ImageIcon, Link as LinkIcon, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export default function TopicManager({ course, onBack }) {
    const [topics, setTopics] = useState([]);
    const [newTopicTitle, setNewTopicTitle] = useState('');

    useEffect(() => {
        if (course) {
            fetchTopics();
        }
    }, [course]);

    const fetchTopics = async () => {
        try {
            const { data, error } = await supabase
                .from('topics')
                .select('*, materials(*)')
                .eq('course_id', course.id)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setTopics(data || []);
        } catch (error) {
            console.error('Error fetching topics:', error);
        }
    };

    const handleCreateTopic = async (e) => {
        e.preventDefault();
        if (!newTopicTitle.trim()) return;

        try {
            const { data, error } = await supabase
                .from('topics')
                .insert([
                    {
                        title: newTopicTitle,
                        course_id: course.id
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            setTopics([...topics, { ...data, materials: [] }]);
            setNewTopicTitle('');
        } catch (error) {
            console.error('Error creating topic:', error);
            alert('Failed to create topic.');
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="secondary" onClick={onBack}>
                    ← Back to Courses
                </Button>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{course.title}</h2>
            </div>

            <Card className="p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Add New Topic</h3>
                <form onSubmit={handleCreateTopic} className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Topic Title (e.g., Week 2: Transmission)"
                        value={newTopicTitle}
                        onChange={(e) => setNewTopicTitle(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button type="submit" disabled={!newTopicTitle}>
                        <Plus size={20} className="mr-2" />
                        Add Topic
                    </Button>
                </form>
            </Card>

            <div className="space-y-4">
                {topics.map((topic) => (
                    <Card key={topic.id} className="overflow-hidden">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{topic.title}</h3>
                            <div className="flex gap-2">
                                <Button variant="secondary" className="text-xs h-8 px-3">
                                    + Material
                                </Button>
                            </div>
                        </div>

                        <div className="p-4 space-y-2">
                            {topic.materials.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No materials uploaded yet.</p>
                            ) : (
                                topic.materials.map((material) => (
                                    <div key={material.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                                {getIcon(material.type)}
                                            </div>
                                            <span className="text-slate-700 dark:text-slate-300 font-medium">{material.title}</span>
                                        </div>
                                        <Button variant="secondary" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 h-auto">
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
