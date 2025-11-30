import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Header } from '../components/Header';

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

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <Header />

            <main className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center gap-12">
                {/* Hero Section */}
                <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Now Live: 7 Systems Module
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
                        Master Automotive <br />
                        <span className="text-blue-600">Engineering</span>
                    </h1>

                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg">
                        The comprehensive learning platform for future automotive technicians.
                        Interactive simulations, theory modules, and real-time assessments.
                    </p>
                </div>

                {/* Login Cards */}
                <div className="flex-1 w-full max-w-md space-y-6">
                    {/* Student Login */}
                    <Card className="border-l-4 border-l-emerald-500">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                                <Users size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Student Access</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Enter your 6-digit class code</p>
                            </div>
                        </div>

                        <form onSubmit={handleStudentLogin} className="space-y-3">
                            <input
                                type="text"
                                placeholder="Ex: AUTO24"
                                maxLength={6}
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-center text-lg tracking-widest uppercase"
                            />
                            <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 dark:shadow-emerald-900/20"
                                disabled={accessCode.length !== 6}
                            >
                                Enter Classroom
                            </Button>
                        </form>
                    </Card>

                    {/* Professor Login */}
                    <Card className="border-l-4 border-l-blue-500">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                <GraduationCap size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Professor Login</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Manage courses and content</p>
                            </div>
                        </div>

                        <Button
                            className="w-full flex items-center justify-center gap-2"
                            onClick={() => navigate('/professor/dashboard')}
                        >
                            Professor Portal <ArrowRight size={18} />
                        </Button>
                    </Card>
                </div>
            </main>
        </div>
    );
}
