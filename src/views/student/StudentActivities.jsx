import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { getAllStudentActivities } from '../../lib/activityService';
import {
    ClipboardList, Calendar, Clock, CheckCircle, AlertCircle,
    FileText, Loader2, BookOpen, Award, Paperclip, ExternalLink
} from 'lucide-react';

export default function StudentActivities() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, submitted, overdue

    useEffect(() => {
        if (user?.id) {
            loadActivities();
        }
    }, [user?.id]);

    const loadActivities = async () => {
        setLoading(true);
        try {
            const data = await getAllStudentActivities(user.id);
            setActivities(data);
        } catch (err) {
            console.error('Error loading activities:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDeadline = (deadline) => {
        const date = new Date(deadline);
        const now = new Date();
        const diff = date - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        if (diff < 0) {
            return { text: dateStr, relative: 'Past due', isUrgent: true };
        } else if (days === 0) {
            return { text: dateStr, relative: `${hours}h left`, isUrgent: true };
        } else if (days === 1) {
            return { text: dateStr, relative: 'Tomorrow', isUrgent: true };
        } else if (days <= 3) {
            return { text: dateStr, relative: `${days} days left`, isUrgent: false };
        }
        return { text: dateStr, relative: null, isUrgent: false };
    };

    const getStatusBadge = (activity) => {
        if (activity.status === 'graded') {
            return (
                <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                    <CheckCircle size={12} />
                    Graded: {activity.submission?.score}/{activity.max_score}
                </span>
            );
        }
        if (activity.status === 'submitted' || activity.status === 'late') {
            return (
                <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${activity.status === 'late'
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    }`}>
                    <CheckCircle size={12} />
                    {activity.status === 'late' ? 'Submitted Late' : 'Submitted'}
                </span>
            );
        }
        if (activity.isOverdue) {
            return (
                <span className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">
                    <AlertCircle size={12} />
                    Missing
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-full">
                <Clock size={12} />
                To Do
            </span>
        );
    };

    // Filter activities
    const filteredActivities = activities.filter(a => {
        if (filter === 'all') return true;
        if (filter === 'pending') return a.status === 'pending';
        if (filter === 'submitted') return ['submitted', 'late', 'graded'].includes(a.status);
        if (filter === 'overdue') return a.status === 'overdue' || a.isOverdue;
        return true;
    });

    // Group by upcoming vs past
    const upcomingActivities = filteredActivities.filter(a => !a.isOverdue || a.status !== 'overdue');
    const pastDueActivities = filteredActivities.filter(a => a.isOverdue && a.status === 'overdue');

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <ClipboardList className="text-blue-600" size={28} />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Activities</h1>
                        <p className="text-slate-500 text-sm">All your assignments and deadlines</p>
                    </div>
                </div>
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <ClipboardList className="text-blue-600" size={28} />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Activities</h1>
                        <p className="text-slate-500 text-sm">All your assignments and deadlines</p>
                    </div>
                </div>
                <Button onClick={loadActivities} variant="outline">
                    <Loader2 size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { value: 'all', label: 'All', count: activities.length },
                    { value: 'pending', label: 'To Do', count: activities.filter(a => a.status === 'pending').length },
                    { value: 'submitted', label: 'Submitted', count: activities.filter(a => ['submitted', 'late', 'graded'].includes(a.status)).length },
                    { value: 'overdue', label: 'Missing', count: activities.filter(a => a.isOverdue && a.status === 'overdue').length },
                ].map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === f.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {f.label}
                        {f.count > 0 && (
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${filter === f.value ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'
                                }`}>
                                {f.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Empty State */}
            {activities.length === 0 && (
                <Card className="p-12 text-center">
                    <ClipboardList className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={64} />
                    <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                        No activities yet
                    </h3>
                    <p className="text-slate-500 mb-4">
                        Activities from your enrolled courses will appear here
                    </p>
                    <Button onClick={() => navigate('/student/dashboard')} variant="outline">
                        Go to Dashboard
                    </Button>
                </Card>
            )}

            {/* Past Due Section */}
            {pastDueActivities.length > 0 && filter !== 'submitted' && (
                <div>
                    <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <AlertCircle size={14} />
                        Missing ({pastDueActivities.length})
                    </h2>
                    <div className="space-y-3">
                        {pastDueActivities.map(activity => {
                            const deadline = formatDeadline(activity.deadline);
                            return (
                                <Card key={activity.id} className="p-4 border-l-4 border-l-red-500">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                                                    {activity.courseName}
                                                </span>
                                                <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded capitalize">
                                                    {activity.type}
                                                </span>
                                                {getStatusBadge(activity)}
                                            </div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                {activity.title}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                                <span className="flex items-center gap-1 text-red-500">
                                                    <Calendar size={14} />
                                                    {deadline.text}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Award size={14} />
                                                    {activity.max_score} pts
                                                </span>
                                            </div>
                                        </div>
                                        {activity.canSubmit && (
                                            <Button
                                                onClick={() => navigate(`/student/activity/${activity.id}`)}
                                                className="bg-red-600 hover:bg-red-700 text-white text-sm"
                                            >
                                                Submit Late
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Upcoming / All Activities */}
            {upcomingActivities.length > 0 && (
                <div>
                    {pastDueActivities.length > 0 && filter === 'all' && (
                        <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
                            Upcoming & Submitted
                        </h2>
                    )}
                    <div className="space-y-3">
                        {upcomingActivities.map(activity => {
                            const deadline = formatDeadline(activity.deadline);
                            const isSubmitted = ['submitted', 'late', 'graded'].includes(activity.status);

                            return (
                                <Card
                                    key={activity.id}
                                    className={`p-4 border-l-4 ${activity.status === 'graded'
                                            ? 'border-l-green-500'
                                            : isSubmitted
                                                ? 'border-l-blue-500'
                                                : deadline.isUrgent
                                                    ? 'border-l-orange-500'
                                                    : 'border-l-slate-200 dark:border-l-slate-700'
                                        }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                                                    {activity.courseName}
                                                </span>
                                                <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded capitalize">
                                                    {activity.type}
                                                </span>
                                                {getStatusBadge(activity)}
                                            </div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                {activity.title}
                                            </h3>
                                            {activity.description && (
                                                <p className="text-sm text-slate-500 line-clamp-1 mt-1">
                                                    {activity.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3 mt-2 text-sm text-slate-500 flex-wrap">
                                                <span className={`flex items-center gap-1 ${deadline.isUrgent && !isSubmitted ? 'text-orange-600 font-medium' : ''}`}>
                                                    <Calendar size={14} />
                                                    {deadline.text}
                                                    {deadline.relative && !isSubmitted && (
                                                        <span className={`ml-1 ${deadline.isUrgent ? 'text-orange-600' : 'text-slate-400'}`}>
                                                            ({deadline.relative})
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Award size={14} />
                                                    {activity.max_score} pts
                                                </span>
                                                {activity.attachment_url && (
                                                    <a
                                                        href={activity.attachment_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Paperclip size={14} />
                                                        Attachment
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        {!isSubmitted && activity.canSubmit && (
                                            <Button
                                                onClick={() => navigate(`/student/activity/${activity.id}`)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                                            >
                                                View & Submit
                                            </Button>
                                        )}
                                        {isSubmitted && (
                                            <Button
                                                onClick={() => navigate(`/student/activity/${activity.id}`)}
                                                variant="outline"
                                                className="text-sm"
                                            >
                                                View Details
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {filteredActivities.length === 0 && activities.length > 0 && (
                <Card className="p-8 text-center">
                    <p className="text-slate-500">No activities match this filter</p>
                </Card>
            )}
        </div>
    );
}
