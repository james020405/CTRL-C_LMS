import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, FileText, Video, Image as ImageIcon, Link as LinkIcon, Trash2, X, Loader2, Upload } from 'lucide-react';
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
    const [materialFile, setMaterialFile] = useState(null);
    const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
    const [savingMaterial, setSavingMaterial] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

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
            alert(`Failed to create topic: ${errorMessage}\n\nMake sure you've run the SQL schema in Supabase.`);
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
        setMaterialFile(null);
        setUploadMode('url');
        setUploadProgress(0);
        setShowMaterialModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setMaterialFile(file);
            if (!materialTitle) {
                setMaterialTitle(file.name.replace(/\.[^/.]+$/, "")); // Use filename without extension
            }
            // Auto-detect type
            if (file.type.includes('pdf')) setMaterialType('pdf');
            else if (file.type.includes('video')) setMaterialType('video');
            else if (file.type.includes('image')) setMaterialType('image');
        }
    };

    const handleAddMaterial = async (e) => {
        e.preventDefault();
        if (!materialTitle.trim()) return;
        if (uploadMode === 'url' && !materialUrl.trim()) return;
        if (uploadMode === 'file' && !materialFile) return;

        setSavingMaterial(true);
        setUploadProgress(0);

        try {
            let fileUrl = materialUrl;

            // Upload file if in file mode
            if (uploadMode === 'file' && materialFile) {
                const fileExt = materialFile.name.split('.').pop();
                const fileName = `${course.id}/${selectedTopicId}/${Date.now()}.${fileExt}`;

                setUploadProgress(10);

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('materials')
                    .upload(fileName, materialFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    // Check if bucket doesn't exist
                    if (uploadError.message.includes('bucket') || uploadError.message.includes('Bucket')) {
                        throw new Error('Storage bucket "materials" does not exist. Please create it in Supabase Storage.');
                    }
                    throw uploadError;
                }

                setUploadProgress(70);

                // Get public URL
                const { data: urlData } = supabase.storage
                    .from('materials')
                    .getPublicUrl(fileName);

                fileUrl = urlData.publicUrl;
                setUploadProgress(90);
            }

            // Save to database
            const { data, error } = await supabase
                .from('materials')
                .insert([{
                    title: materialTitle,
                    type: materialType,
                    url: fileUrl,
                    topic_id: selectedTopicId
                }])
                .select()
                .single();

            if (error) throw error;

            setUploadProgress(100);

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

    const handleDeleteMaterial = async (topicId, materialId, materialUrl) => {
        try {
            // Try to delete from storage if it's a stored file
            if (materialUrl?.includes('supabase')) {
                const path = materialUrl.split('/materials/')[1];
                if (path) {
                    await supabase.storage.from('materials').remove([path]);
                }
            }

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
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded flex-shrink-0">
                                                    {getIcon(material.type)}
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-slate-700 dark:text-slate-300 font-medium block">{material.title}</span>
                                                    {material.url && (
                                                        <a
                                                            href={material.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-blue-600 hover:underline truncate block max-w-xs"
                                                        >
                                                            {material.url.length > 50 ? material.url.substring(0, 50) + '...' : material.url}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleDeleteMaterial(topic.id, material.id, material.url)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 h-auto flex-shrink-0"
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
                            {/* Upload Mode Toggle */}
                            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setUploadMode('url')}
                                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${uploadMode === 'url'
                                            ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    <LinkIcon size={14} className="inline mr-1" />
                                    URL / Link
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUploadMode('file')}
                                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${uploadMode === 'file'
                                            ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    <Upload size={14} className="inline mr-1" />
                                    Upload File
                                </button>
                            </div>

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

                            {uploadMode === 'url' ? (
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
                                        required={uploadMode === 'url'}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        File
                                    </label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.jpg,.jpeg,.png,.gif"
                                        className="hidden"
                                    />
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors text-center"
                                    >
                                        {materialFile ? (
                                            <div className="text-sm">
                                                <FileText className="mx-auto text-blue-600 mb-1" size={24} />
                                                <p className="font-medium text-slate-700 dark:text-slate-300">{materialFile.name}</p>
                                                <p className="text-slate-500 text-xs">
                                                    {(materialFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-slate-500">
                                                <Upload className="mx-auto mb-1" size={24} />
                                                <p>Click to select a file</p>
                                                <p className="text-xs">PDF, DOC, PPT, MP4, Images</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Upload Progress */}
                            {savingMaterial && uploadProgress > 0 && (
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            )}

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
                                    disabled={savingMaterial || !materialTitle || (uploadMode === 'url' ? !materialUrl : !materialFile)}
                                    className="flex-1"
                                >
                                    {savingMaterial ? (
                                        <Loader2 className="animate-spin mr-2" size={16} />
                                    ) : (
                                        <Plus size={16} className="mr-2" />
                                    )}
                                    {savingMaterial ? 'Uploading...' : 'Add Material'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
