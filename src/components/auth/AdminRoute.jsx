import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, Loader2 } from 'lucide-react';
import MfaVerification from './MfaVerification';

/**
 * AdminRoute - Protects admin routes with email check + MFA verification
 * 
 * Flow:
 * 1. Check if user email matches admin email
 * 2. Check MFA factors - if none enrolled, redirect to setup
 * 3. Check AAL level - if aal1, show MFA verification
 * 4. If aal2, allow access
 */
export default function AdminRoute() {
    const { user, signOut, loading: authLoading } = useAuth();
    const location = useLocation();
    const ALLOWED_ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

    const [loading, setLoading] = useState(true);
    const [mfaState, setMfaState] = useState({
        needsSetup: false,
        needsVerification: false,
        factorId: null,
        verified: false
    });

    useEffect(() => {
        if (!authLoading && user) {
            checkMfaStatus();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [user, authLoading]);

    const checkMfaStatus = async () => {
        try {
            // Get current AAL level
            const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

            if (aalError) {
                console.error('AAL check error:', aalError);
                setLoading(false);
                return;
            }

            console.log('MFA AAL Status:', aalData);

            // Check if already aal2 (MFA verified)
            if (aalData.currentLevel === 'aal2') {
                setMfaState({ needsSetup: false, needsVerification: false, factorId: null, verified: true });
                setLoading(false);
                return;
            }

            // Get enrolled factors
            const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();

            if (factorsError) {
                console.error('Factors list error:', factorsError);
                setLoading(false);
                return;
            }

            console.log('MFA Factors:', factorsData);

            // Check for verified TOTP factors
            const verifiedFactors = factorsData.totp?.filter(f => f.status === 'verified') || [];

            if (verifiedFactors.length === 0) {
                // No MFA enrolled - needs setup
                setMfaState({ needsSetup: true, needsVerification: false, factorId: null, verified: false });
            } else {
                // Has MFA but needs to verify (aal1 -> aal2)
                setMfaState({
                    needsSetup: false,
                    needsVerification: true,
                    factorId: verifiedFactors[0].id,
                    verified: false
                });
            }
        } catch (err) {
            console.error('MFA check error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMfaSuccess = () => {
        setMfaState(prev => ({ ...prev, needsVerification: false, verified: true }));
    };

    const handleCancel = async () => {
        await signOut();
    };

    // Show loading while checking auth and MFA
    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <p className="text-slate-400">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Not logged in or not admin email
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

    // Needs MFA setup - redirect to setup page
    if (mfaState.needsSetup && location.pathname !== '/admin/mfa-setup') {
        return <Navigate to="/admin/mfa-setup" replace />;
    }

    // Needs MFA verification - show inline verification
    if (mfaState.needsVerification && !mfaState.verified) {
        return (
            <MfaVerification
                factorId={mfaState.factorId}
                onSuccess={handleMfaSuccess}
                onCancel={handleCancel}
            />
        );
    }

    // All checks passed - allow access
    return <Outlet />;
}
