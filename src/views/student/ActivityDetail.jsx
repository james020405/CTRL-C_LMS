import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { getActivityById, getMySubmission, submitActivity } from '../../lib/activityService';
import { uploadActivityFile } from '../../lib/activityFileService';
import {
    ArrowLeft, Calendar, Award, Clock, CheckCircle, AlertCircle,
    Paperclip, Loader2, Send, FileText, ExternalLink, Upload, X
} from 'lucide-react';

export default function ActivityDetail() {
    const { activityId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const fileInputRef = useRef(null);

    const [activity, setActivity] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [content, setContent] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [fileUrl, setFileUrl] = useState('');

    useEffect(() => {
        if (activityId && user?.id) {
            loadActivity();
        }
    }, [activityId, user?.id]);

    const loadActivity = async () => {
        setLoading(true);
        try {
            const activityData = await getActivityById(activityId);
            setActivity(activityData);

            const submissionData = await getMySubmission(activityId, user.id);
            setSubmission(submissionData);
            if (submissionData?.content) {
                setContent(submissionData.content);
            }
        } catch (err) {
            console.error('Error loading activity:', err);
            toast.error('Failed to load activity');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile || !user?.id) return;

        setUploadingFile(true);
        try {
            const url = await uploadActivityFile(selectedFile, 'submissions', user.id);
            setFileUrl(url);
            toast.success('File uploaded!');
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            console.error('Upload error:', err);
            toast.error('Failed to upload file');
        } finally {
            setUploadingFile(false);
        }
    };

    const handleSubmit = async () => {
        if (!content.trim() && !fileUrl) {
            toast.error('Please add content or upload a file');
            return;
        }

        setSubmitting(true);
        try {
            await submitActivity(activityId, user.id, content, fileUrl || null);
            toast.success('Submitted successfully!');
            loadActivity();
        } catch (err) {
            console.error('Submit error:', err);
            toast.error(err.message || 'Failed to submit');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDeadline = (deadline) => {
        const date = new Date(deadline);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isOverdue = activity ? new Date(activity.deadline) < new Date() : false;
    const canSubmit = activity && (!isOverdue || activity.allow_late);
    const isGraded = submission?.status === 'graded';

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="max-w-3xl mx-auto">
                <Card className="p-8 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Activity not found
                    </h2>
                    <Button onClick={() => navigate('/student/activities')} variant="outline">
                        Back to Activities
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <Button
                    variant="outline"
                    onClick={() => navigate('/student/activities')}
                    className="mb-4"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Activities
                </Button>

                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                                {activity.courses?.title || 'Course'}
                            </span>
                            <span className="text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded capitalize">
                                {activity.type}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {activity.title}
                        </h1>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Award size={16} />
                            {activity.max_score} points
                        </div>
                    </div>
                </div>
            </div>

            {/* Deadline & Status */}
            <Card className={`p-4 ${isOverdue && !isGraded ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className={isOverdue ? 'text-red-500' : 'text-slate-500'} />
                        <span className={`font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            Due: {formatDeadline(activity.deadline)}
                        </span>
                        {isOverdue && <span className="text-red-500 text-sm">(Past due)</span>}
                    </div>

                    {submission && (
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${isGraded
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : submission.status === 'late'
                                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            }`}>
                            <CheckCircle size={14} />
                            {isGraded
                                ? `Graded: ${submission.score}/${activity.max_score}`
                                : submission.status === 'late'
                                    ? 'Submitted Late'
                                    : 'Submitted'}
                        </div>
                    )}
                </div>
            </Card>

            {/* Description */}
            {activity.description && (
                <Card className="p-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Instructions</h3>
                    <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                        {activity.description}
                    </p>
                </Card>
            )}

            {/* Attachment */}
            {activity.attachment_url && (
                <Card className="p-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Attachments</h3>
                    <a
                        href={activity.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                        <Paperclip size={16} />
                        View Attachment
                        <ExternalLink size={14} />
                    </a>
                </Card>
            )}

            {/* Graded Feedback */}
            {isGraded && submission.feedback && (
                <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                        Professor Feedback
                    </h3>
                    <p className="text-green-700 dark:text-green-400 whitespace-pre-wrap">
                        {submission.feedback}
                    </p>
                </Card>
            )}

            {/* Submission Form */}
            {canSubmit && !isGraded && (
                <Card className="p-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                        {submission ? 'Update Your Submission' : 'Your Submission'}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Content
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Type your answer or response here..."
                                rows={6}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <Paperclip size={14} className="inline mr-1" />
                                Attach File (optional)
                            </label>

                            {fileUrl && (
                                <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
                                    <span className="text-sm text-green-700 dark:text-green-300">
                                        File attached
                                    </span>
                                    <button
                                        onClick={() => setFileUrl('')}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            {!fileUrl && (
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
                            )}
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={submitting || (!content.trim() && !fileUrl)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {submitting ? (
                                <Loader2 className="animate-spin mr-2" size={16} />
                            ) : (
                                <Send size={16} className="mr-2" />
                            )}
                            {submission ? 'Update Submission' : 'Submit'}
                        </Button>
                    </div>
                </Card>
            )}

            {/* Already Submitted View */}
            {submission && !canSubmit && !isGraded && (
                <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                        Your Submission
                    </h3>
                    {submission.content && (
                        <p className="text-blue-700 dark:text-blue-400 whitespace-pre-wrap mb-2">
                            {submission.content}
                        </p>
                    )}
                    {submission.file_url && (
                        <a
                            href={submission.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:underline"
                        >
                            <Paperclip size={14} />
                            View attached file
                        </a>
                    )}
                    <p className="text-sm text-blue-600 dark:text-blue-500 mt-2">
                        Submitted: {new Date(submission.submitted_at).toLocaleString()}
                    </p>
                </Card>
            )}
        </div>
    );
}
