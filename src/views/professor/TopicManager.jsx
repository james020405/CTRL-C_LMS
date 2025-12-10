import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, FileText, Video, Image as ImageIcon, Link as LinkIcon, Trash2, X, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export default function TopicManager({ course, onBack }) {
    const [topics, setTopics] = useState([]);
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [loading, setLoading] = useState(false);

    // Material modal state
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [selectedTopicId, setSelectedTopicId] = useState(null);
    const [materialTitle, setMaterialTitle] = useState('');
    const [materialType, setMaterialType] = useState('link');
    const [materialUrl, setMaterialUrl] = useState('');
    const [savingMaterial, setSavingMaterial] = useState(false);

    useEffect(() => {
        if (course) {
            fetchTopics();
        }
    }, [course]);

    const fetchTopics = async () => {
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTopic = async (e) => {
        e.preventDefault();
        if (!newTopicTitle.trim()) return;

        try {
            const { data, error } = await supabase
                .from('topics')
                .insert([{ title: newTopicTitle, course_id: course.id }])
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            setTopics([...topics, { ...data, materials: [] }]);
            setNewTopicTitle('');
        } catch (error) {
            console.error('Error creating topic:', error);
            const errorMessage = error?.message || error?.details || 'Unknown error';
            alert(`Failed to create topic: ${errorMessage}\n\nIf this says "permission denied", run the SQL schema in Supabase first.`);
        }
    };

    const handleDeleteTopic = async (topicId, topicTitle) => {
        if (!window.confirm(`Delete "${topicTitle}" and all its materials?`)) return;

        try {
            await supabase.from('materials').delete().eq('topic_id', topicId);
            const { error } = await supabase.from('topics').delete().eq('id', topicId);
            if (error) throw error;
            setTopics(topics.filter(t => t.id !== topicId));
        } catch (error) {
            console.error('Error deleting topic:', error);
            alert(`Failed to delete topic: ${error.message}`);
        }
    };

    const openMaterialModal = (topicId) => {
        setSelectedTopicId(topicId);
        setMaterialTitle('');
        setMaterialType('link');
        setMaterialUrl('');
        setShowMaterialModal(true);
    };

    const handleAddMaterial = async (e) => {
        e.preventDefault();
        if (!materialTitle.trim() || !materialUrl.trim()) return;

        setSavingMaterial(true);
        try {
            const { data, error } = await supabase
                .from('materials')
                .insert([{
                    title: materialTitle,
                    type: materialType,
                    url: materialUrl,
                    topic_id: selectedTopicId
                }])
                .select()
                .single();

            if (error) throw error;

            // Update local state
            setTopics(topics.map(t =>
                t.id === selectedTopicId
                    ? { ...t, materials: [...(t.materials || []), data] }
                    : t
            ));
            setShowMaterialModal(false);
        } catch (error) {
            console.error('Error adding material:', error);
            alert(`Failed to add material: ${error.message}`);
        } finally {
            setSavingMaterial(false);
        }
    };

    const handleDeleteMaterial = async (topicId, materialId) => {
        try {
            const { error } = await supabase.from('materials').delete().eq('id', materialId);
            if (error) throw error;

            setTopics(topics.map(t =>
                t.id === topicId
                    ? { ...t, materials: t.materials.filter(m => m.id !== materialId) }
                    : t
            ));
        } catch (error) {
            console.error('Error deleting material:', error);
            alert(`Failed to delete material: ${error.message}`);
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="secondary" onClick={onBack}>
                    ← Back to Courses
                </Button>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{course.title}</h2>
            </div>

            {/* Add Topic Form */}
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

            {/* Topics List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : topics.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-slate-500">No topics yet. Add your first topic above!</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {topics.map((topic) => (
                        <Card key={topic.id} className="overflow-hidden">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">{topic.title}</h3>
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        className="text-xs h-8 px-3"
                                        onClick={() => openMaterialModal(topic.id)}
                                    >
                                        + Material
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleDeleteTopic(topic.id, topic.title)}
                                        className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 h-8 px-2"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4 space-y-2">
                                {!topic.materials || topic.materials.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic">No materials uploaded yet.</p>
                                ) : (
                                    topic.materials.map((material) => (
                                        <div key={material.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                                    {getIcon(material.type)}
                                                </div>
                                                <div>
                                                    <span className="text-slate-700 dark:text-slate-300 font-medium">{material.title}</span>
                                                    {material.url && (
                                                        <a
                                                            href={material.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block text-xs text-blue-600 hover:underline truncate max-w-xs"
                                                        >
                                                            {material.url}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleDeleteMaterial(topic.id, material.id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 h-auto"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add Material Modal */}
            {showMaterialModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md p-6 m-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Material</h3>
                            <button
                                onClick={() => setShowMaterialModal(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddMaterial} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={materialTitle}
                                    onChange={(e) => setMaterialTitle(e.target.value)}
                                    placeholder="e.g., Introduction Video"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Type
                                </label>
                                <select
                                    value={materialType}
                                    onChange={(e) => setMaterialType(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                >
                                    <option value="link">Link</option>
                                    <option value="video">Video</option>
                                    <option value="pdf">PDF</option>
                                    <option value="image">Image</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    URL
                                </label>
                                <input
                                    type="url"
                                    value={materialUrl}
                                    onChange={(e) => setMaterialUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowMaterialModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={savingMaterial || !materialTitle || !materialUrl}
                                    className="flex-1"
                                >
                                    {savingMaterial ? (
                                        <Loader2 className="animate-spin mr-2" size={16} />
                                    ) : (
                                        <Plus size={16} className="mr-2" />
                                    )}
                                    Add Material
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
