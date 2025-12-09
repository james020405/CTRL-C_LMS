import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function ProfessorRoute() {
    const { user, loading } = useAuth();
    const [isApproved, setIsApproved] = React.useState(null);
    const [checking, setChecking] = React.useState(true);

    React.useEffect(() => {
        async function checkApproval() {
            if (!user) {
                setChecking(false);
                return;
            }

            // Check metadata first (fastest)
            if (user.user_metadata?.role === 'admin') {
                setIsApproved(true);
                setChecking(false);
                return;
            }

            // Then check profiles table
            const { data, error } = await supabase
                .from('profiles')
                .select('is_approved, role')
                .eq('id', user.id)
                .single();

            if (data && data.is_approved && data.role === 'professor') {
                setIsApproved(true);
            } else {
                setIsApproved(false);
            }
            setChecking(false);
        }

        if (!loading) {
            checkApproval();
        }
    }, [user, loading]);

    if (loading || checking) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    if (!isApproved) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md text-center border border-slate-700">
                    <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="text-red-500" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Access Pending</h2>
                    <p className="text-slate-400 mb-6">
                        Your professor account is currently pending approval from the administrator.
                        Please contact support or wait for verification.
                    </p>
                    <a
                        href="/student/dashboard"
                        className="inline-block bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Return to Student Dashboard
                    </a>
                </div>
            </div>
        );
    }

    return <Outlet />;
}
