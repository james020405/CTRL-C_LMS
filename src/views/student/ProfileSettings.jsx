import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
    User, Mail, Calendar, Shield, Lock, Save, Loader2,
    CheckCircle, AlertCircle, Trophy, Brain, Gamepad2,
    BookOpen, TrendingUp, Clock, Hash, GraduationCap
} from 'lucide-react';

export default function ProfileSettings() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    // Profile State
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState('');

    // Student-specific fields
    const [studentNumber, setStudentNumber] = useState('');
    const [yearLevel, setYearLevel] = useState('1');
    const [section, setSection] = useState('');
    const [semester, setSemester] = useState('1st');
    const [schoolYear, setSchoolYear] = useState('');

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordVerified, setPasswordVerified] = useState(false);
    const [verifyingPassword, setVerifyingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    // Delete Account State
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

    // Stats State
    const [stats, setStats] = useState({
        flashcardsCreated: 0,
        flashcardsStudied: 0,
        totalGameScore: 0,
        gamesPlayed: 0
    });

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
                // Load student fields
                setStudentNumber(data.student_number || '');
                setYearLevel(data.year_level?.toString() || '1');
                setSection(data.section || '');
                setSemester(data.semester || '1st');
                setSchoolYear(data.school_year || '');
            } else {
                // Create profile if doesn't exist
                setFullName(user.user_metadata?.full_name || '');
            }
        } catch (err) {
            console.error('Error loading profile:', err);
            toast.error('Failed to load profile');
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
        try {
            // Build profile data
            const profileData = {
                id: user.id,
                full_name: fullName,
                email: user.email,
                updated_at: new Date().toISOString()
            };

            // Add student fields if this is a student profile
            if (profile?.role === 'student' || !profile?.role) {
                profileData.student_number = studentNumber;
                profileData.year_level = parseInt(yearLevel);
                profileData.section = section;
                profileData.semester = semester;
                profileData.school_year = schoolYear;
            }

            // Update profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert(profileData);

            if (profileError) throw profileError;

            // Update auth user metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });

            if (authError) throw authError;

            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Step 1: Verify current password
    const handleVerifyPassword = async () => {
        if (!currentPassword) {
            setPasswordError('Please enter your current password.');
            return;
        }

        setVerifyingPassword(true);
        setPasswordError('');

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword
            });

            if (authError) {
                throw new Error('Current password is incorrect.');
            }

            setPasswordVerified(true);
            toast.success('Password verified! You can now set a new password.');
        } catch (err) {
            setPasswordError(err.message);
            toast.error(err.message);
        } finally {
            setVerifyingPassword(false);
        }
    };

    // Step 2: Change to new password (only after verification)
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');

        if (!passwordVerified) {
            setPasswordError('Please verify your current password first.');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters.');
            toast.error('New password must be at least 6 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match.');
            toast.error('Passwords do not match.');
            return;
        }

        if (currentPassword === newPassword) {
            setPasswordError('New password must be different from current password.');
            toast.error('New password must be different from current password.');
            return;
        }

        setChangingPassword(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            toast.success('Password changed successfully!');
            // Reset all password fields and state
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordVerified(false);
            setPasswordError('');
        } catch (err) {
            setPasswordError(err.message);
            toast.error(err.message);
        } finally {
            setChangingPassword(false);
        }
    };

    // Cancel password change and reset
    const handleCancelPasswordChange = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordVerified(false);
        setPasswordError('');
    };

    const handleDeleteClick = () => {
        setDeleteConfirmationText('');
        setDeleteConfirmOpen(true);
    };

    const confirmDeleteAccount = async () => {
        if (deleteConfirmationText !== 'DELETE') {
            toast.error('Please type "DELETE" to confirm.');
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
            toast.success('Account deleted successfully');
        } catch (err) {
            toast.error('Failed to delete account. Please contact support.');
            setDeleteConfirmOpen(false);
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
                                    {(studentNumber || section) && (
                                        <div className="flex flex-wrap gap-3 mt-2">
                                            {studentNumber && (
                                                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-sm bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                                    <Hash size={12} />
                                                    {studentNumber}
                                                </p>
                                            )}
                                            {section && (
                                                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-sm bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                                    <Users size={12} />
                                                    {section}
                                                </p>
                                            )}
                                        </div>
                                    )}
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

                            {/* Student-specific fields */}
                            {(profile?.role === 'student' || !profile?.role) && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl space-y-4">
                                    <h3 className="text-sm font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                        <GraduationCap size={16} />
                                        Student Information
                                    </h3>

                                    {/* Student Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Student Number
                                        </label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <Input
                                                type="text"
                                                value={studentNumber}
                                                onChange={(e) => setStudentNumber(e.target.value)}
                                                placeholder="202X-XXXXX"
                                                className="w-full pl-10"
                                            />
                                        </div>
                                    </div>

                                    {/* Year Level and Section */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Year Level
                                            </label>
                                            <select
                                                value={yearLevel}
                                                onChange={(e) => setYearLevel(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="1">1st Year</option>
                                                <option value="2">2nd Year</option>
                                                <option value="3">3rd Year</option>
                                                <option value="4">4th Year</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Section
                                            </label>
                                            <Input
                                                type="text"
                                                value={section}
                                                onChange={(e) => setSection(e.target.value)}
                                                placeholder="e.g., BSIT-3A"
                                                className="w-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Semester and School Year */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Semester
                                            </label>
                                            <select
                                                value={semester}
                                                onChange={(e) => setSemester(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="1st">1st Semester</option>
                                                <option value="2nd">2nd Semester</option>
                                                <option value="Summer">Summer</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                School Year
                                            </label>
                                            <Input
                                                type="text"
                                                value={schoolYear}
                                                onChange={(e) => setSchoolYear(e.target.value)}
                                                placeholder="2025-2026"
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

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

                        {/* Error Display */}
                        {passwordError && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                                <AlertCircle size={16} />
                                {passwordError}
                            </div>
                        )}

                        {/* Verify Current Password */}
                        {!passwordVerified ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Current Password
                                    </label>
                                    <Input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter your current password"
                                        className="w-full"
                                    />
                                </div>

                                <Button
                                    type="button"
                                    onClick={handleVerifyPassword}
                                    disabled={verifyingPassword || !currentPassword}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {verifyingPassword ? (
                                        <Loader2 className="animate-spin mr-2" size={16} />
                                    ) : (
                                        <Shield size={16} className="mr-2" />
                                    )}
                                    Verify Password
                                </Button>
                            </div>
                        ) : (
                            /* Enter New Password */
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-2">
                                    <CheckCircle size={18} className="text-green-600" />
                                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">Password Verified</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        New Password
                                    </label>
                                    <Input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password (min 6 characters)"
                                        className="w-full"
                                        minLength={6}
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

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCancelPasswordChange}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={changingPassword || !newPassword || !confirmPassword}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {changingPassword ? (
                                            <Loader2 className="animate-spin mr-2" size={16} />
                                        ) : (
                                            <CheckCircle size={16} className="mr-2" />
                                        )}
                                        Update Password
                                    </Button>
                                </div>
                            </form>
                        )}
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
                            onClick={handleDeleteClick}
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

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={confirmDeleteAccount}
                title="Delete Account?"
                description="This action will permanently delete your account and all associated data (flashcards, progress, etc). This cannot be undone."
                confirmText="Delete Account"
                cancelText="Cancel"
                variant="danger"
            >
                <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Type "DELETE" to confirm
                    </label>
                    <Input
                        value={deleteConfirmationText}
                        onChange={(e) => setDeleteConfirmationText(e.target.value)}
                        placeholder="DELETE"
                        className="w-full"
                    />
                </div>
            </ConfirmDialog>
        </div>
    );
}
