import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Header } from '../components/Header';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Login() {
    const navigate = useNavigate();
    const { signIn } = useAuth();

    // Auth State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form Data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Password Reset
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    const location = useLocation();
    const from = location.state?.from?.pathname || '/student/dashboard';
    const isProfessor = from.includes('professor');

    // Detect password recovery or email confirmation from URL hash
    useEffect(() => {
        const handleAuthChange = async () => {
            // Check if there's a hash in the URL (tokens from Supabase)
            if (window.location.hash) {
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const type = hashParams.get('type');

                // If this is a recovery (password reset) flow, redirect to reset-password
                if (type === 'recovery') {
                    navigate('/reset-password' + window.location.hash, { replace: true });
                    return;
                }

                // If this is email confirmation (signup), redirect to email-confirmed
                if (type === 'signup' || type === 'email_change') {
                    navigate('/email-confirmed', { replace: true });
                    return;
                }
            }
        };

        handleAuthChange();

        // Also listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                navigate('/reset-password', { replace: true });
            }
            if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
                // User just confirmed email and signed in
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await signIn(email, password);
            if (error) throw error;
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (!resetEmail.trim()) {
            setError('Please enter your email address.');
            return;
        }

        setResetLoading(true);
        setError('');
        setSuccess('');

        try {
            // Debug logging only in development
            if (import.meta.env.DEV) {
                console.log('Attempting password reset for:', resetEmail);
                console.log('Redirect URL:', `${window.location.origin}/login`);
            }

            const { data, error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (import.meta.env.DEV) {
                console.log('Reset response - data:', data);
                console.log('Reset response - error:', error);
            }

            if (error) throw error;

            setSuccess('Password reset email sent! Check your inbox (and spam folder).');
            setShowResetModal(false);
            setResetEmail('');
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error('Password reset error:', err);
            }
            setError(err.message || 'Failed to send reset email. Please try again.');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Header />

            {/* Status Messages */}
            {error && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg backdrop-blur-sm">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}
            {success && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg backdrop-blur-sm">
                    <CheckCircle size={16} />
                    {success}
                </div>
            )}

            {/* Login Form */}
            <section className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl px-8 py-10">
                    <div className="flex flex-col items-center gap-y-6 mb-8">
                        <a href="/" className="group">
                            <div className="h-14 w-14 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 group-hover:scale-105 transition-transform">
                                C
                            </div>
                        </a>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {isProfessor ? "Professor Portal" : "Portal Login"}
                        </h1>
                    </div>

                    <form onSubmit={handleLogin} className="flex w-full flex-col gap-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-12 pl-10 pr-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-12 pl-10 pr-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Forgot Password Link */}
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={() => setShowResetModal(true)}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20 rounded-xl mt-2"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400 flex justify-center gap-1">
                        <p>New to Ctrl C Academy?</p>
                        <a
                            href="/register"
                            className="text-blue-600 dark:text-blue-500 font-semibold hover:underline"
                        >
                            Sign up
                        </a>
                    </div>
                </div>
            </section>

            {/* Password Reset Modal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            Reset Password
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        <form onSubmit={handlePasswordReset} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    required
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    className="w-full h-12 pl-10 pr-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => { setShowResetModal(false); setResetEmail(''); }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={resetLoading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {resetLoading ? <Loader2 className="animate-spin" size={20} /> : "Send Reset Link"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
