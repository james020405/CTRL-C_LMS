import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { CheckCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function EmailConfirmed() {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);

    // Countdown to auto-redirect
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/login');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Header />

            <section className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl px-8 py-10 text-center">
                    {/* Success Icon */}
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-full animate-ping opacity-25"></div>
                        <div className="relative w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Email Confirmed! 🎉
                    </h1>

                    {/* Message */}
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Your email has been successfully verified. You can now sign in to your account and start learning.
                    </p>

                    {/* Action Button */}
                    <Button
                        onClick={() => navigate('/login')}
                        className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20 rounded-xl"
                    >
                        <Mail className="mr-2" size={20} />
                        Sign In Now
                    </Button>

                    {/* Auto-redirect notice */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Loader2 className="animate-spin" size={16} />
                        <span>Redirecting to login in {countdown}s...</span>
                    </div>

                    {/* Welcome message */}
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Welcome to <span className="font-semibold text-blue-600">Ctrl C Academy</span>!
                            <br />
                            Start your automotive learning journey today.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
