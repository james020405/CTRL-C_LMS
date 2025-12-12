import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Header } from '../components/Header';

export default function Register() {
    const navigate = useNavigate();
    const { signUp } = useAuth();

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // UI State
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear errors when user types
        if (error) setError('');
    };

    const validateForm = () => {
        if (!formData.fullName.trim()) return "Full Name is required";

        // Allow admin email or cvsu.edu.ph emails
        const isAdmin = formData.email === import.meta.env.VITE_ADMIN_EMAIL;
        if (!isAdmin && !formData.email.endsWith('@cvsu.edu.ph')) {
            return "Only @cvsu.edu.ph emails are allowed";
        }

        if (formData.password.length < 6) return "Password must be at least 6 characters";
        if (formData.password !== formData.confirmPassword) return "Passwords do not match";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const isAdmin = formData.email === import.meta.env.VITE_ADMIN_EMAIL;
            const role = isAdmin ? 'admin' : 'professor';
            const isApproved = isAdmin; // Admin is auto-approved, others are pending

            // 1. Sign up with Supabase Auth
            const { data: authData, error: authError } = await signUp(
                formData.email,
                formData.password,
                formData.fullName,
                { role, is_approved: isApproved } // Pass metadata
            );
            if (authError) throw authError;

            // Check if user already exists (Supabase returns user with empty identities array if exists)
            if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
                throw new Error('This email is already registered. Please sign in instead.');
            }

            // 2. Create public profile entry (for Admin Dashboard listing)
            if (authData.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: authData.user.id,
                            email: formData.email,
                            full_name: formData.fullName,
                            role: role,
                            is_approved: isApproved
                        }
                    ]);

                if (profileError) {
                    console.error("Error creating profile:", profileError);
                    // Continue anyway, as auth account was created
                }
            }

            setSuccess('Account created successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Header />
            <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h1>
                        <p className="text-slate-500 dark:text-slate-400">Join the academy today</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                            <CheckCircle size={16} />
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="student@cvsu.edu.ph"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-6"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
