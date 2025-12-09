import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function AdminRoute() {
    const { user, loading } = useAuth();
    // Admin email from environment variable for security
    const ALLOWED_ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

    if (loading) return null;

    if (!user || user.email !== ALLOWED_ADMIN_EMAIL) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md text-center border border-slate-700">
                    <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="text-red-500" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Admin Access Only</h2>
                    <p className="text-slate-400 mb-6">
                        You do not have permission to view this page.
                    </p>
                    <a
                        href="/student/dashboard"
                        className="inline-block bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Return to Dashboard
                    </a>
                </div>
            </div>
        );
    }

    return <Outlet />;
}
