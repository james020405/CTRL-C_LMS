import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, ArrowRight, Wrench, Brain, Zap, Gamepad2, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Header } from '../components/Header';
import { GooeyText } from '../components/ui/GooeyText';
import { AuroraBackground } from '../components/ui/aurora-background';
import { Button as MovingButton } from '../components/ui/moving-border';
import { supabase } from '../lib/supabase';

export default function Landing() {
    const navigate = useNavigate();

    // Handle Supabase auth redirects (password recovery, email confirmation)
    useEffect(() => {
        // Check if there's a hash in the URL (tokens from Supabase)
        if (window.location.hash) {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const type = hashParams.get('type');
            const error = hashParams.get('error');
            const errorCode = hashParams.get('error_code');
            const accessToken = hashParams.get('access_token');

            console.log('Landing: Hash detected', { type, error, errorCode, hasAccessToken: !!accessToken });

            // If this is a recovery (password reset) flow, redirect to reset-password
            if (type === 'recovery') {
                navigate('/reset-password' + window.location.hash, { replace: true });
                return;
            }

            // If this is email confirmation (signup), redirect to email-confirmed
            if (type === 'signup' || type === 'email_change' || type === 'magiclink') {
                navigate('/email-confirmed', { replace: true });
                return;
            }

            // If there's an access token but no type, it might be email confirmation
            // (Supabase sometimes doesn't include type in the hash)
            if (accessToken && !error) {
                navigate('/email-confirmed', { replace: true });
                return;
            }

            // If there's an auth error, redirect to login with error info
            if (error) {
                navigate('/login' + window.location.hash, { replace: true });
                return;
            }
        }

        // Listen for auth events
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Landing: Auth event', event, session?.user?.email_confirmed_at);
            if (event === 'PASSWORD_RECOVERY') {
                navigate('/reset-password', { replace: true });
            }
            // Email confirmation triggers SIGNED_IN - check if email was just confirmed
            if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
                const confirmedAt = new Date(session.user.email_confirmed_at);
                const now = new Date();
                const diffSeconds = (now - confirmedAt) / 1000;
                console.log('Landing: Email confirmed', diffSeconds, 'seconds ago');
                // If email was confirmed within last 2 minutes, redirect to confirmation page
                if (diffSeconds < 120) {
                    navigate('/email-confirmed', { replace: true });
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const scrollToAccess = () => {
        document.getElementById('access-portal').scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-x-hidden">
            <Header />

            {/* Hero Section with Aurora Background */}
            <AuroraBackground>
                <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-20 pb-10 px-4">

                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <div className="h-20 md:h-24 flex items-center justify-center">
                            <GooeyText
                                texts={["Master", "Learn", "Diagnose", "Repair", "Excel"]}
                                morphTime={1}
                                cooldownTime={0.5}
                                className="font-black"
                                textClassName="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent"
                            />
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                            Master <span className="text-blue-600 dark:text-blue-500">Automotive</span> <br />
                            <span className="relative inline-block">
                                Engineering
                            </span>
                        </h1>

                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            The most advanced learning platform for modern technicians. Experience interactive 3D disassembly, real-time diagnostics, and AI-powered curriculum.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                            <MovingButton
                                borderRadius="1.75rem"
                                className="bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800 font-semibold text-lg"
                                onClick={() => navigate('/login')}
                            >
                                Get Started
                            </MovingButton>
                            <Button
                                variant="outline"
                                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                                className="h-16 px-8 text-lg rounded-full border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                                Explore Features
                            </Button>
                        </div>
                    </div>
                </div>
            </AuroraBackground>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-white dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800/50 relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Everything you need to excel</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">Comprehensive tools for the next generation of mechanics.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<Wrench className="w-6 h-6 text-blue-600" />}
                            title="3D Simulator"
                            desc="Interactive engine models with explosion views and part inspection."
                            color="bg-blue-50 dark:bg-blue-900/20"
                        />
                        <FeatureCard
                            icon={<Brain className="w-6 h-6 text-purple-600" />}
                            title="Diagnostic Cases"
                            desc="Solve real-world mechanical problems in a risk-free virtual environment."
                            color="bg-purple-50 dark:bg-purple-900/20"
                        />
                        <FeatureCard
                            icon={<Zap className="w-6 h-6 text-amber-600" />}
                            title="Smart Flashcards"
                            desc="Master terminology with spaced repetition and swipe-based learning."
                            color="bg-amber-50 dark:bg-amber-900/20"
                        />
                        <FeatureCard
                            icon={<Gamepad2 className="w-6 h-6 text-emerald-600" />}
                            title="Interactive Games"
                            desc="Gamified learning challenges to test your diagnostic and repair skills."
                            color="bg-emerald-50 dark:bg-emerald-900/20"
                        />
                    </div>
                </div>
            </section>

            {/* Access Portal Section */}
            <section id="access-portal" className="py-24 relative z-20 bg-slate-50 dark:bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center max-w-5xl mx-auto">

                        {/* Student Access */}
                        <div className="relative group w-full max-w-md">
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                            <Card className="relative p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-full flex flex-col">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                                        <Users size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Student Access</h3>
                                        <p className="text-slate-500 dark:text-slate-400">Join your virtual classroom</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mt-auto">
                                    <p className="text-slate-600 dark:text-slate-300">
                                        Access your courses, simulations, and quizzes.
                                    </p>
                                    <div className="flex gap-4">
                                        <Button
                                            onClick={() => navigate('/login')}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 rounded-xl"
                                        >
                                            Login
                                        </Button>
                                        <Button
                                            onClick={() => navigate('/register')}
                                            variant="outline"
                                            className="flex-1 h-12 text-lg rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                                        >
                                            Register
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>



                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 py-12 relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
                        <span className="font-bold text-slate-900 dark:text-white">Ctrl C Academy</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/professor/login')}
                            className="text-slate-400 dark:text-slate-600 text-xs hover:text-slate-500 dark:hover:text-slate-500 transition-colors"
                        >
                            Staff
                        </button>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            © 2024 Ctrl C Academy. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc, color }) {
    return (
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-lg group">
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {desc}
            </p>
        </div>
    );
}
