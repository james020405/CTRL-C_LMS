import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
    User, Mail, Calendar, Shield, Lock, Save, Loader2,
    CheckCircle, AlertCircle, Trophy, Brain, Gamepad2,
    BookOpen, TrendingUp, Clock
} from 'lucide-react';

export default function ProfileSettings() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    // Profile State
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState('');

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    // Stats State
    const [stats, setStats] = useState({
        flashcardsCreated: 0,
        flashcardsStudied: 0,
        totalGameScore: 0,
        gamesPlayed: 0
    });

    // Messages
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.id) {
            loadProfile();
            loadStats();
        }
    }, [user?.id]);

    const loadProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setProfile(data);
                setFullName(data.full_name || '');
            } else {
                // Create profile if doesn't exist
                setFullName(user.user_metadata?.full_name || '');
            }
        } catch (err) {
            console.error('Error loading profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            // Get flashcard count
            const { count: flashcardCount } = await supabase
                .from('student_flashcards')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            // Get game scores
            const { data: scores } = await supabase
                .from('game_scores')
                .select('score')
                .eq('user_id', user.id);

            // Get game plays
            const { count: playsCount } = await supabase
                .from('game_plays')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            setStats({
                flashcardsCreated: flashcardCount || 0,
                flashcardsStudied: 0, // Would need review history table
                totalGameScore: scores?.reduce((sum, s) => sum + s.score, 0) || 0,
                gamesPlayed: playsCount || 0
            });
        } catch (err) {
            console.error('Error loading stats:', err);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            // Update profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: fullName,
                    email: user.email,
                    updated_at: new Date().toISOString()
                });

            if (profileError) throw profileError;

            // Update auth user metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });

            if (authError) throw authError;

            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setChangingPassword(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setSuccess('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            'Are you sure you want to delete your account? This action cannot be undone.'
        );

        if (!confirmed) return;

        const doubleConfirm = window.prompt(
            'Type "DELETE" to confirm account deletion:'
        );

        if (doubleConfirm !== 'DELETE') {
            setError('Account deletion cancelled.');
            return;
        }

        try {
            // Delete profile from profiles table
            await supabase.from('profiles').delete().eq('id', user.id);

            // Delete flashcards
            await supabase.from('student_flashcards').delete().eq('user_id', user.id);

            // Sign out
            await signOut();
            navigate('/');
        } catch (err) {
            setError('Failed to delete account. Please contact support.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    const memberSince = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'Unknown';

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <User className="text-blue-600" />
                    Profile & Settings
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Manage your account and view your progress
                </p>
            </div>

            {/* Messages */}
            {success && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2">
                    <CheckCircle size={18} />
                    {success}
                </div>
            )}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Profile Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Card */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <User size={20} />
                            Profile Information
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-900 dark:text-white text-lg">
                                        {fullName || 'Set your name'}
                                    </p>
                                    <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Mail size={14} />
                                        {user?.email}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Full Name
                                </label>
                                <Input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <Calendar size={16} />
                                    <span>Member since {memberSince}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <Shield size={16} />
                                    <span className="capitalize">{profile?.role || 'Student'}</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {saving ? (
                                    <Loader2 className="animate-spin mr-2" size={16} />
                                ) : (
                                    <Save size={16} className="mr-2" />
                                )}
                                Save Changes
                            </Button>
                        </div>
                    </Card>

                    {/* Change Password Card */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Lock size={20} />
                            Change Password
                        </h2>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    New Password
                                </label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Confirm New Password
                                </label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="w-full"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={changingPassword || !newPassword || !confirmPassword}
                                className="bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white"
                            >
                                {changingPassword ? (
                                    <Loader2 className="animate-spin mr-2" size={16} />
                                ) : (
                                    <Lock size={16} className="mr-2" />
                                )}
                                Update Password
                            </Button>
                        </form>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="p-6 border-red-200 dark:border-red-800">
                        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
                            Danger Zone
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <Button
                            onClick={handleDeleteAccount}
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            Delete Account
                        </Button>
                    </Card>
                </div>

                {/* Right Column - Stats */}
                <div className="space-y-6">
                    {/* Stats Overview */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp size={18} />
                            Your Progress
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Brain className="text-blue-600" size={20} />
                                    <span className="text-slate-700 dark:text-slate-300">Flashcards Created</span>
                                </div>
                                <span className="font-bold text-blue-600">{stats.flashcardsCreated}</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Gamepad2 className="text-purple-600" size={20} />
                                    <span className="text-slate-700 dark:text-slate-300">Games Played</span>
                                </div>
                                <span className="font-bold text-purple-600">{stats.gamesPlayed}</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Trophy className="text-yellow-600" size={20} />
                                    <span className="text-slate-700 dark:text-slate-300">Total Score</span>
                                </div>
                                <span className="font-bold text-yellow-600">{stats.totalGameScore.toLocaleString()}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Tips */}
                    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                        <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">
                            💡 Tips for Success
                        </h2>
                        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                            <li className="flex items-start gap-2">
                                <Clock size={14} className="mt-1 flex-shrink-0" />
                                Review flashcards daily for best retention
                            </li>
                            <li className="flex items-start gap-2">
                                <BookOpen size={14} className="mt-1 flex-shrink-0" />
                                Complete all 7 systems to master automotive basics
                            </li>
                            <li className="flex items-start gap-2">
                                <Gamepad2 size={14} className="mt-1 flex-shrink-0" />
                                Play games on Hard mode for maximum points
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
}
