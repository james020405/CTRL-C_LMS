import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, MailWarning } from 'lucide-react';

export default function ProtectedRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Enforce Email Verification
    if (!user.email_confirmed_at) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md text-center border border-slate-700">
                    <div className="bg-yellow-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MailWarning className="text-yellow-500" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Verify your Email</h2>
                    <p className="text-slate-400 mb-6">
                        We sent a confirmation link to <strong>{user.email}</strong>.<br />
                        Please check your inbox (and spam folder) to verify your account before continuing.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        I've Verified It
                    </button>
                </div>
            </div>
        );
    }

    return <Outlet />;
}
