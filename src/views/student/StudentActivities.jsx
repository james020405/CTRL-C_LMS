import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/Header';
import { supabase } from '../../lib/supabase';
import {
    getStudentActivities,
    submitActivity,
    getActivityById,
    getMySubmission
} from '../../lib/activityService';
import { uploadActivityFile, getFileInfoFromUrl } from '../../lib/activityFileService';
import {
    FileText, Calendar, Award, Clock, CheckCircle,
    AlertCircle, Loader2, ChevronLeft, Send, Upload,
    AlertTriangle, Eye, Paperclip, ExternalLink, File, X
} from 'lucide-react';

export default function StudentActivities() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();
    const fileInputRef = useRef(null);

    // Activities state
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courseName, setCourseName] = useState('');

    // Submission view state
    const [viewingActivity, setViewingActivity] = useState(null);
    const [mySubmission, setMySubmission] = useState(null);
    const [submissionContent, setSubmissionContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [attachedFileUrl, setAttachedFileUrl] = useState('');

    useEffect(() => {
        if (courseId && user?.id) {
            loadActivities();
            loadCourseName();
        }
    }, [courseId, user?.id]);

    const loadCourseName = async () => {
        try {
            const { data } = await supabase
                .from('courses')
                .select('title')
                .eq('id', courseId)
                .single();
            if (data) setCourseName(data.title);
        } catch (err) {
            console.error('Error loading course name:', err);
        }
    };

    const loadActivities = async () => {
        try {
            setLoading(true);
            const data = await getStudentActivities(courseId, user.id);
            setActivities(data);
        } catch (err) {
            console.error('Error loading activities:', err);
            toast.error('Failed to load activities');
        } finally {
            setLoading(false);
        }
    };

    const openActivity = async (activity) => {
        setViewingActivity(activity);
        setSubmissionContent('');
        setSelectedFile(null);
        setAttachedFileUrl('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        if (activity.submission) {
            setMySubmission(activity.submission);
            setSubmissionContent(activity.submission.content || '');
            setAttachedFileUrl(activity.submission.file_url || '');
        } else {
            setMySubmission(null);
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
        if (!selectedFile || !user?.id) return null;

        setUploadingFile(true);
        try {
            const url = await uploadActivityFile(selectedFile, 'submissions', user.id);
            setAttachedFileUrl(url);
            toast.success('File attached!');
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

    const handleSubmit = async () => {
        if (!submissionContent.trim() && !attachedFileUrl) {
            toast.error('Please enter your submission or attach a file');
            return;
        }

        setSubmitting(true);
        try {
            const submission = await submitActivity(
                viewingActivity.id,
                user.id,
                submissionContent.trim(),
                attachedFileUrl || null
            );

            toast.success('Submitted successfully!');
            setMySubmission(submission);

            // Refresh activities list
            loadActivities();
        } catch (err) {
            console.error('Error submitting:', err);
            toast.error(err.message || 'Failed to submit');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDeadline = (deadline) => {
        const date = new Date(deadline);
        const now = new Date();
        const diff = date - now;
        const isOverdue = diff < 0;

        const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
        const hoursLeft = Math.ceil(diff / (1000 * 60 * 60));

        let timeLeft = '';
        if (isOverdue) {
            timeLeft = 'Past due';
        } else if (daysLeft > 1) {
            timeLeft = `${daysLeft} days left`;
        } else if (hoursLeft > 1) {
            timeLeft = `${hoursLeft} hours left`;
        } else {
            timeLeft = 'Due soon';
        }

        return {
            text: date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            timeLeft,
            isOverdue,
            isUrgent: !isOverdue && hoursLeft < 24
        };
    };

    const getStatusBadge = (activity) => {
        if (activity.submission?.status === 'graded') {
            return (
                <span className="flex items-center gap-1 text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full text-xs font-medium">
                    <CheckCircle size={12} />
                    Graded: {activity.submission.score}/{activity.max_score}
                </span>
            );
        }
        if (activity.submission) {
            return (
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${activity.submission.status === 'late'
                    ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
                    : 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    }`}>
                    <CheckCircle size={12} />
                    {activity.submission.status === 'late' ? 'Submitted Late' : 'Submitted'}
                </span>
            );
        }
        if (activity.isOverdue) {
            return (
                <span className="flex items-center gap-1 text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full text-xs font-medium">
                    <AlertCircle size={12} />
                    {activity.allow_late ? 'Late' : 'Missing'}
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1 text-slate-600 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs font-medium">
                <Clock size={12} />
                Not Submitted
            </span>
        );
    };

    // Activity Detail View
    if (viewingActivity) {
        const deadline = formatDeadline(viewingActivity.deadline);
        const isGraded = mySubmission?.status === 'graded';
        const canSubmit = viewingActivity.canSubmit && !isGraded;

        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                <Header />
                <main className="max-w-4xl mx-auto px-4 py-8">
                    <Button
                        variant="outline"
                        onClick={() => setViewingActivity(null)}
                        className="mb-4"
                    >
                        <ChevronLeft size={16} className="mr-1" />
                        Back to Activities
                    </Button>

                    <Card className="p-6 mb-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    {viewingActivity.title}
                                </h1>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        Due: {deadline.text}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Award size={14} />
                                        {viewingActivity.max_score} pts
                                    </span>
                                </div>
                            </div>
                            {getStatusBadge(viewingActivity)}
                        </div>

                        {viewingActivity.description && (
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
                                <h3 className="font-medium text-slate-900 dark:text-white mb-2">Instructions</h3>
                                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                    {viewingActivity.description}
                                </p>
                            </div>
                        )}

                        {/* Attachment Link */}
                        {viewingActivity.attachment_url && (
                            <a
                                href={viewingActivity.attachment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            >
                                <Paperclip size={18} />
                                <span className="font-medium">View Attachment / Resources</span>
                                <ExternalLink size={14} className="ml-auto" />
                            </a>
                        )}

                        {/* Deadline Warning */}
                        {deadline.isOverdue && !viewingActivity.allow_late && !mySubmission && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 flex items-center gap-3">
                                <AlertTriangle className="text-red-500" size={20} />
                                <p className="text-red-700 dark:text-red-300">
                                    This activity is past due and no longer accepts submissions.
                                </p>
                            </div>
                        )}

                        {deadline.isUrgent && !mySubmission && (
                            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6 flex items-center gap-3">
                                <Clock className="text-orange-500" size={20} />
                                <p className="text-orange-700 dark:text-orange-300">
                                    Due soon! Only {deadline.timeLeft} remaining.
                                </p>
                            </div>
                        )}

                        {/* Graded Result */}
                        {isGraded && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="text-green-600" size={20} />
                                    <span className="font-bold text-green-700 dark:text-green-300">
                                        Score: {mySubmission.score}/{viewingActivity.max_score}
                                    </span>
                                </div>
                                {mySubmission.feedback && (
                                    <div className="mt-3">
                                        <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                                            Feedback:
                                        </p>
                                        <p className="text-slate-600 dark:text-slate-300">
                                            {mySubmission.feedback}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Submission Area */}
                        {canSubmit && (
                            <div className="space-y-4">
                                <h3 className="font-medium text-slate-900 dark:text-white">Your Submission</h3>
                                <textarea
                                    value={submissionContent}
                                    onChange={(e) => setSubmissionContent(e.target.value)}
                                    placeholder="Type your answer here..."
                                    rows={6}
                                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />

                                {/* File Attachment Section */}
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        <Paperclip size={14} className="inline mr-1" />
                                        Attach a file (optional)
                                    </label>

                                    {/* Attached file display */}
                                    {attachedFileUrl && (
                                        <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <File size={18} className="text-green-600" />
                                                <span className="text-sm text-green-700 dark:text-green-300">
                                                    {getFileInfoFromUrl(attachedFileUrl)?.name || 'Attached file'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={attachedFileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <ExternalLink size={16} />
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => setAttachedFileUrl('')}
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* File upload section */}
                                    {!attachedFileUrl && (
                                        <div className="flex gap-2">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                onChange={handleFileSelect}
                                                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.gif,.zip"
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
                                    {selectedFile && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={submitting || (!submissionContent.trim() && !attachedFileUrl)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {submitting ? (
                                            <Loader2 className="animate-spin mr-2" size={16} />
                                        ) : (
                                            <Send size={16} className="mr-2" />
                                        )}
                                        {mySubmission ? 'Resubmit' : 'Submit'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* View Previous Submission */}
                        {mySubmission && !canSubmit && (
                            <div className="space-y-4">
                                <h3 className="font-medium text-slate-900 dark:text-white">Your Submission</h3>
                                {mySubmission.content && (
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                                        <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                            {mySubmission.content}
                                        </p>
                                    </div>
                                )}
                                {mySubmission.file_url && (
                                    <a
                                        href={mySubmission.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-100"
                                    >
                                        <Paperclip size={16} />
                                        <span className="font-medium">View Attached File</span>
                                        <ExternalLink size={14} className="ml-auto" />
                                    </a>
                                )}
                                <p className="text-xs text-slate-500">
                                    Submitted: {new Date(mySubmission.submitted_at).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Header />
            <main className="max-w-4xl mx-auto px-4 py-8">
                <Button
                    variant="outline"
                    onClick={() => navigate('/student/dashboard')}
                    className="mb-4"
                >
                    <ChevronLeft size={16} className="mr-1" />
                    Back to Dashboard
                </Button>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Course Activities
                    </h1>
                    <p className="text-slate-500">{courseName}</p>
                </div>

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
                        <p className="text-slate-500">
                            Your professor hasn't created any activities for this course yet.
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {activities.map(activity => {
                            const deadline = formatDeadline(activity.deadline);

                            return (
                                <Card
                                    key={activity.id}
                                    className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => openActivity(activity)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FileText className="text-blue-600" size={18} />
                                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                                    {activity.title}
                                                </h3>
                                                {getStatusBadge(activity)}
                                            </div>
                                            {activity.description && (
                                                <p className="text-sm text-slate-500 mb-2 line-clamp-1">
                                                    {activity.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className={`flex items-center gap-1 ${deadline.isOverdue ? 'text-red-500' :
                                                    deadline.isUrgent ? 'text-orange-500' : 'text-slate-500'
                                                    }`}>
                                                    <Calendar size={14} />
                                                    {deadline.text}
                                                    {!deadline.isOverdue && (
                                                        <span className="ml-1">({deadline.timeLeft})</span>
                                                    )}
                                                </span>
                                                <span className="flex items-center gap-1 text-slate-500">
                                                    <Award size={14} />
                                                    {activity.max_score} pts
                                                </span>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="ml-4">
                                            <Eye size={16} className="mr-1" />
                                            View
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
