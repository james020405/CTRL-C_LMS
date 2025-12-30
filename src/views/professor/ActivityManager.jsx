import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/input';
import { useToast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useAuth } from '../../contexts/AuthContext';
import {
    createActivity,
    updateActivity,
    deleteActivity,
    getActivitiesForCourse,
    getActivitySubmissions,
    gradeSubmission
} from '../../lib/activityService';
import { uploadActivityFile, getFileInfoFromUrl } from '../../lib/activityFileService';
import {
    Plus, FileText, Calendar, Award, Users, Clock,
    Loader2, Edit2, Trash2, CheckCircle, AlertCircle,
    ChevronLeft, Eye, MessageSquare, X, Send, Paperclip, ExternalLink, Upload, File
} from 'lucide-react';

export default function ActivityManager({ courseId, courseName, onBack, enrolledCount }) {
    const { user } = useAuth();
    const toast = useToast();
    const fileInputRef = useRef(null);

    // Activities state
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'assignment',
        maxScore: 100,
        deadline: '',
        allowLate: false,
        attachmentUrl: ''
    });
    const [saving, setSaving] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    // Submissions view state
    const [viewingActivity, setViewingActivity] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);

    // Grading state
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [gradeScore, setGradeScore] = useState('');
    const [gradeFeedback, setGradeFeedback] = useState('');
    const [gradingSaving, setGradingSaving] = useState(false);

    // Delete state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [activityToDelete, setActivityToDelete] = useState(null);

    useEffect(() => {
        if (courseId) loadActivities();
    }, [courseId]);

    const loadActivities = async () => {
        try {
            setLoading(true);
            const data = await getActivitiesForCourse(courseId);
            setActivities(data);
        } catch (err) {
            console.error('Error loading activities:', err);
            toast.error('Failed to load activities');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            type: 'assignment',
            maxScore: 100,
            deadline: '',
            allowLate: false,
            attachmentUrl: ''
        });
        setEditingActivity(null);
        setShowForm(false);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Max 10MB
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile || !user?.id) return null;

        setUploadingFile(true);
        try {
            const url = await uploadActivityFile(selectedFile, 'instructions', user.id);
            setFormData(prev => ({ ...prev, attachmentUrl: url }));
            toast.success('File uploaded!');
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return url;
        } catch (err) {
            console.error('Upload error:', err);
            toast.error('Failed to upload file');
            return null;
        } finally {
            setUploadingFile(false);
        }
    };

    const handleEdit = (activity) => {
        setEditingActivity(activity);
        setFormData({
            title: activity.title,
            description: activity.description || '',
            type: activity.type,
            maxScore: activity.max_score,
            deadline: new Date(activity.deadline).toISOString().slice(0, 16),
            allowLate: activity.allow_late,
            attachmentUrl: activity.attachment_url || ''
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Title is required');
            return;
        }
        if (!formData.deadline) {
            toast.error('Deadline is required');
            return;
        }

        // Validate deadline is in the future (only for new activities)
        const deadlineDate = new Date(formData.deadline);
        const now = new Date();
        if (!editingActivity && deadlineDate <= now) {
            toast.error('Deadline must be in the future');
            return;
        }

        setSaving(true);
        try {
            if (editingActivity) {
                await updateActivity(editingActivity.id, formData);
                toast.success('Activity updated!');
            } else {
                await createActivity(courseId, formData);
                toast.success('Activity created!');
            }
            resetForm();
            loadActivities();
        } catch (err) {
            console.error('Error saving activity:', err);
            toast.error(err.message || 'Failed to save activity');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = (activity) => {
        setActivityToDelete(activity);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!activityToDelete) return;

        try {
            await deleteActivity(activityToDelete.id);
            toast.success('Activity deleted');
            setDeleteConfirmOpen(false);
            setActivityToDelete(null);
            loadActivities();
        } catch (err) {
            toast.error('Failed to delete activity');
        }
    };

    const viewSubmissions = async (activity) => {
        setViewingActivity(activity);
        setLoadingSubmissions(true);
        try {
            const data = await getActivitySubmissions(activity.id);
            setSubmissions(data);
        } catch (err) {
            console.error('Error loading submissions:', err);
            toast.error('Failed to load submissions');
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const startGrading = (submission) => {
        setGradingSubmission(submission);
        setGradeScore(submission.score?.toString() || '');
        setGradeFeedback(submission.feedback || '');
    };

    const handleGrade = async () => {
        if (!gradeScore || isNaN(parseInt(gradeScore))) {
            toast.error('Please enter a valid score');
            return;
        }

        const score = parseInt(gradeScore);
        if (score < 0 || score > viewingActivity.max_score) {
            toast.error(`Score must be between 0 and ${viewingActivity.max_score}`);
            return;
        }

        setGradingSaving(true);
        try {
            await gradeSubmission(gradingSubmission.id, score, gradeFeedback);
            toast.success('Submission graded!');
            setGradingSubmission(null);
            viewSubmissions(viewingActivity);
        } catch (err) {
            toast.error('Failed to grade submission');
        } finally {
            setGradingSaving(false);
        }
    };

    const formatDeadline = (deadline) => {
        const date = new Date(deadline);
        const now = new Date();
        const isOverdue = date < now;

        return {
            text: date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            isOverdue
        };
    };

    // Submissions View
    if (viewingActivity) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Button
                            variant="outline"
                            onClick={() => setViewingActivity(null)}
                            className="mb-2"
                        >
                            <ChevronLeft size={16} className="mr-1" />
                            Back to Activities
                        </Button>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {viewingActivity.title}
                        </h2>
                        <p className="text-slate-500">
                            {submissions.length} submission{submissions.length !== 1 ? 's' : ''} • Max {viewingActivity.max_score} pts
                        </p>
                    </div>
                </div>

                {loadingSubmissions ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                    </div>
                ) : submissions.length === 0 ? (
                    <Card className="p-8 text-center">
                        <FileText className="mx-auto text-slate-300 mb-3" size={48} />
                        <p className="text-slate-500">No submissions yet</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {submissions.map(sub => (
                            <Card key={sub.id} className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                {sub.profiles?.full_name || sub.profiles?.email || 'Unknown Student'}
                                            </span>
                                            {sub.status === 'late' && (
                                                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">
                                                    Late
                                                </span>
                                            )}
                                            {sub.status === 'graded' && (
                                                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded flex items-center gap-1">
                                                    <CheckCircle size={12} />
                                                    Graded: {sub.score}/{viewingActivity.max_score}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                            Submitted: {new Date(sub.submitted_at).toLocaleString()}
                                        </p>
                                        {sub.content && (
                                            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-sm">
                                                {sub.content}
                                            </div>
                                        )}
                                        {sub.file_url && (
                                            <a
                                                href={sub.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 text-sm hover:underline mt-2 inline-block"
                                            >
                                                📎 View Attachment
                                            </a>
                                        )}
                                    </div>
                                    <Button
                                        onClick={() => startGrading(sub)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <Award size={16} className="mr-1" />
                                        {sub.status === 'graded' ? 'Edit Grade' : 'Grade'}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Grading Modal */}
                {gradingSubmission && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Grade Submission
                                </h3>
                                <button onClick={() => setGradingSubmission(null)}>
                                    <X className="text-slate-400 hover:text-slate-600" size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Score (out of {viewingActivity.max_score})
                                    </label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max={viewingActivity.max_score}
                                        value={gradeScore}
                                        onChange={(e) => setGradeScore(e.target.value)}
                                        placeholder="Enter score"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Feedback (optional)
                                    </label>
                                    <textarea
                                        value={gradeFeedback}
                                        onChange={(e) => setGradeFeedback(e.target.value)}
                                        placeholder="Add feedback for the student..."
                                        rows={4}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setGradingSubmission(null)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleGrade}
                                        disabled={gradingSaving}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {gradingSaving ? (
                                            <Loader2 className="animate-spin" size={16} />
                                        ) : (
                                            <>
                                                <Send size={16} className="mr-1" />
                                                Save Grade
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="outline" onClick={onBack} className="mb-2">
                        <ChevronLeft size={16} className="mr-1" />
                        Back to Courses
                    </Button>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Activities
                    </h2>
                    <p className="text-slate-500">{courseName}</p>
                </div>
                <Button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <Plus size={16} className="mr-1" />
                    Create Activity
                </Button>
            </div>

            {/* Create/Edit Form */}
            {showForm && (
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                        {editingActivity ? 'Edit Activity' : 'Create Activity'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Title *
                            </label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Week 1 Assignment"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Instructions for students..."
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Type
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                >
                                    <option value="assignment">Assignment</option>
                                    <option value="quiz">Quiz</option>
                                    <option value="discussion">Discussion</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Max Score
                                </label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={formData.maxScore}
                                    onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 100 })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Deadline *
                            </label>
                            <Input
                                type="datetime-local"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                min={new Date().toISOString().slice(0, 16)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <Paperclip size={14} className="inline mr-1" />
                                Attachment (optional)
                            </label>

                            {/* Current attachment display */}
                            {formData.attachmentUrl && (
                                <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <File size={18} className="text-green-600" />
                                        <span className="text-sm text-green-700 dark:text-green-300">
                                            {getFileInfoFromUrl(formData.attachmentUrl)?.name || 'Attached file'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={formData.attachmentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-700"
                                        >
                                            <ExternalLink size={16} />
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, attachmentUrl: '' }))}
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* File upload section */}
                            {!formData.attachmentUrl && (
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            onChange={handleFileSelect}
                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.gif,.zip"
                                            className="flex-1 text-sm text-slate-600 dark:text-slate-400
                                                file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                                                file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-300
                                                file:cursor-pointer hover:file:bg-blue-100"
                                        />
                                        {selectedFile && (
                                            <Button
                                                type="button"
                                                onClick={handleFileUpload}
                                                disabled={uploadingFile}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                {uploadingFile ? (
                                                    <Loader2 className="animate-spin" size={16} />
                                                ) : (
                                                    <>
                                                        <Upload size={16} className="mr-1" />
                                                        Upload
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                    {selectedFile && (
                                        <p className="text-xs text-slate-500">
                                            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                        </p>
                                    )}
                                    <p className="text-xs text-slate-500">
                                        Or paste a URL directly:
                                    </p>
                                    <Input
                                        type="url"
                                        value={formData.attachmentUrl}
                                        onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                                        placeholder="https://drive.google.com/..."
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="allowLate"
                                checked={formData.allowLate}
                                onChange={(e) => setFormData({ ...formData, allowLate: e.target.checked })}
                                className="rounded"
                            />
                            <label htmlFor="allowLate" className="text-sm text-slate-700 dark:text-slate-300">
                                Allow late submissions
                            </label>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {saving ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : editingActivity ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Activities List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
            ) : activities.length === 0 ? (
                <Card className="p-12 text-center">
                    <FileText className="mx-auto text-slate-300 mb-4" size={64} />
                    <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                        No activities yet
                    </h3>
                    <p className="text-slate-500 mb-4">
                        Create your first activity for students to complete
                    </p>
                    <Button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus size={16} className="mr-1" />
                        Create Activity
                    </Button>
                </Card>
            ) : (
                <div className="space-y-4">
                    {activities.map(activity => {
                        const deadline = formatDeadline(activity.deadline);
                        return (
                            <Card key={activity.id} className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <FileText className="text-blue-600" size={18} />
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                {activity.title}
                                            </h3>
                                            <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded capitalize">
                                                {activity.type}
                                            </span>
                                        </div>
                                        {activity.description && (
                                            <p className="text-sm text-slate-500 mb-2 line-clamp-2">
                                                {activity.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span className={`flex items-center gap-1 ${deadline.isOverdue ? 'text-red-500' : ''}`}>
                                                <Calendar size={14} />
                                                {deadline.text}
                                                {deadline.isOverdue && ' (Past due)'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Award size={14} />
                                                {activity.max_score} pts
                                            </span>
                                            {activity.allow_late && (
                                                <span className="flex items-center gap-1 text-orange-500">
                                                    <Clock size={14} />
                                                    Late OK
                                                </span>
                                            )}
                                            {activity.attachment_url && (
                                                <a
                                                    href={activity.attachment_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                                                >
                                                    <Paperclip size={14} />
                                                    Attachment
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => viewSubmissions(activity)}
                                            className="text-sm"
                                        >
                                            <Eye size={14} className="mr-1" />
                                            Submissions
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleEdit(activity)}
                                            className="text-sm"
                                        >
                                            <Edit2 size={14} />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleDeleteClick(activity)}
                                            className="text-sm text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
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
                onConfirm={confirmDelete}
                title="Delete Activity?"
                description={`Are you sure you want to delete "${activityToDelete?.title}"? All submissions will also be deleted.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
