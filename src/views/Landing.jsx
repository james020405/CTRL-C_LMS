import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, ArrowRight, Wrench, Brain, Zap, Award, Sparkles, BarChart, Target, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Header } from '../components/Header';
import { GooeyText } from '../components/ui/GooeyText';

export default function Landing() {
    const navigate = useNavigate();
    const [accessCode, setAccessCode] = useState('');

    const handleStudentLogin = (e) => {
        e.preventDefault();
        if (accessCode.length === 6) {
            // TODO: Verify code with Supabase
            navigate('/student/dashboard');
        }
    };

    const scrollToAccess = () => {
        document.getElementById('access-portal').scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-x-hidden">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-slate-50 dark:from-blue-950/40 dark:via-slate-950 dark:to-slate-950 -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-4xl mx-auto space-y-8">
                        {/* Gooey Morphing Text */}
                        <div className="h-32 md:h-40 flex items-center justify-center">
                            <GooeyText
                                texts={["Master", "Learn", "Diagnose", "Repair", "Excel"]}
                                morphTime={1}
                                cooldownTime={0.5}
                                className="font-black"
                                textClassName="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent"
                            />
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                                Master <span className="text-blue-600 dark:text-blue-500">Automotive</span> <br />
                                <span className="relative inline-block">
                                    Engineering
                                    <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-200 dark:text-blue-900/50 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                        <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                                    </svg>
                                </span>
                            </h1>
                            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                                The most advanced learning platform for modern technicians. Experience interactive 3D disassembly, real-time diagnostics, and AI-powered curriculum.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Button
                                onClick={scrollToAccess}
                                className="h-14 px-8 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 dark:shadow-blue-900/20 transition-all hover:scale-105 flex items-center gap-2"
                            >
                                Get Started <ArrowRight className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                                className="h-14 px-8 text-lg rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                                Explore Features
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -z-10" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl -z-10" />
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-white dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800/50">
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
                            icon={<Award className="w-6 h-6 text-emerald-600" />}
                            title="Certification Prep"
                            desc="Curriculum aligned with ASE standards to get you job-ready."
                            color="bg-emerald-50 dark:bg-emerald-900/20"
                        />
                    </div>
                </div>
            </section>

            {/* Access Portal Section */}
            <section id="access-portal" className="py-24 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">

                        {/* Student Access */}
                        <div className="relative group">
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

                                <form onSubmit={handleStudentLogin} className="space-y-4 mt-auto">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Class Code</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: AUTO24"
                                            maxLength={6}
                                            value={accessCode}
                                            onChange={(e) => setAccessCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono text-center text-lg tracking-widest uppercase"
                                        />
                                    </div>
                                    <Button
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 rounded-xl"
                                        disabled={accessCode.length !== 6}
                                    >
                                        Enter Classroom
                                    </Button>
                                </form>
                            </Card>
                        </div>

                        {/* Professor Portal */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                            <Card className="relative p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-full flex flex-col">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                                        <GraduationCap size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Professor Portal</h3>
                                        <p className="text-slate-500 dark:text-slate-400">Manage curriculum & students</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mt-auto">
                                    <ul className="space-y-3 mb-6">
                                        <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                            <CheckCircle2 size={18} className="text-blue-500" />
                                            <span>Create interactive assignments</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                            <CheckCircle2 size={18} className="text-blue-500" />
                                            <span>Track real-time progress</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                            <CheckCircle2 size={18} className="text-blue-500" />
                                            <span>Manage course content</span>
                                        </li>
                                    </ul>
                                    <Button
                                        onClick={() => navigate('/professor/dashboard')}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg shadow-lg shadow-blue-200 dark:shadow-blue-900/20 rounded-xl flex items-center justify-center gap-2"
                                    >
                                        Access Portal <ArrowRight size={18} />
                                    </Button>
                                </div>
                            </Card>
                        </div>

                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
                        <span className="font-bold text-slate-900 dark:text-white">Ctrl C Academy</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        © 2024 Ctrl C Academy. All rights reserved.
                    </p>
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
