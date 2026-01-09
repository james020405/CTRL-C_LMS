import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, ShieldCheck, QrCode, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * MFA Setup Component
 * First-time setup for admin MFA - displays QR code for authenticator app
 */
export default function MfaSetup() {
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [secret, setSecret] = useState('');
    const [factorId, setFactorId] = useState(null);
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const inputRefs = React.useRef([]);

    useEffect(() => {
        startEnrollment();
    }, []);

    const startEnrollment = async () => {
        setLoading(true);
        setError('');

        try {
            const { data, error: enrollError } = await supabase.auth.mfa.enroll({
                factorType: 'totp',
                friendlyName: 'CTRL-C LMS Admin'
            });

            if (enrollError) throw enrollError;

            setQrCode(data.totp.qr_code);
            setSecret(data.totp.secret);
            setFactorId(data.id);
        } catch (err) {
            console.error('MFA enrollment error:', err);
            setError(err.message || 'Failed to start MFA setup');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (index, value) => {
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError('');

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        if (value && index === 5 && newCode.every(d => d !== '')) {
            handleVerify(newCode.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (codeStr) => {
        if (codeStr.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setEnrolling(true);
        setError('');

        try {
            // Challenge to verify the factor
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId
            });

            if (challengeError) throw challengeError;

            // Verify the code
            const { error: verifyError } = await supabase.auth.mfa.verify({
                factorId,
                challengeId: challengeData.id,
                code: codeStr
            });

            if (verifyError) throw verifyError;

            // Success!
            setSuccess(true);
            setTimeout(() => {
                navigate('/admin/dashboard');
            }, 2000);
        } catch (err) {
            console.error('MFA verification error:', err);
            setError(err.message || 'Invalid code. Please try again.');
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setEnrolling(false);
        }
    };

    const handleCancel = async () => {
        // Unenroll the factor if user cancels
        if (factorId) {
            try {
                await supabase.auth.mfa.unenroll({ factorId });
            } catch (e) {
                // Ignore errors
            }
        }
        await signOut();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700 text-center">
                    <div className="bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-green-500" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">MFA Setup Complete!</h2>
                    <p className="text-slate-400">Redirecting to admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-700">
                <div className="text-center mb-6">
                    <div className="bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="text-blue-500" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Set Up Two-Factor Authentication</h2>
                    <p className="text-slate-400">
                        Admin access requires MFA. Scan the QR code with your authenticator app.
                    </p>
                </div>

                {/* QR Code */}
                {qrCode && (
                    <div className="bg-white p-4 rounded-xl mx-auto w-fit mb-6">
                        <div dangerouslySetInnerHTML={{ __html: qrCode }} />
                    </div>
                )}

                {/* Manual secret */}
                <div className="mb-6">
                    <p className="text-slate-400 text-sm text-center mb-2">
                        Or enter this code manually:
                    </p>
                    <div className="bg-slate-700 p-3 rounded-lg">
                        <code className="text-blue-400 text-sm break-all block text-center font-mono">
                            {secret}
                        </code>
                    </div>
                </div>

                {/* Verification code input */}
                <div className="mb-4">
                    <p className="text-slate-300 text-sm text-center mb-3">
                        Enter the 6-digit code from your app to verify:
                    </p>
                    <div className="flex gap-2 justify-center">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                disabled={enrolling}
                                className={`w-11 h-12 text-center text-xl font-bold rounded-lg border-2 
                                    ${error ? 'border-red-500 bg-red-500/10' : 'border-slate-600 bg-slate-700'}
                                    text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                                    outline-none transition-all disabled:opacity-50`}
                            />
                        ))}
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm mb-4 justify-center">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Verify button */}
                <button
                    onClick={() => handleVerify(code.join(''))}
                    disabled={enrolling || code.some(d => d === '')}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 
                        text-white py-3 rounded-lg font-semibold transition-colors
                        flex items-center justify-center gap-2"
                >
                    {enrolling ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Verifying...
                        </>
                    ) : (
                        'Complete Setup'
                    )}
                </button>

                {/* Cancel */}
                <button
                    onClick={handleCancel}
                    className="w-full mt-4 text-slate-400 hover:text-white transition-colors text-sm"
                >
                    Cancel and sign out
                </button>

                {/* Instructions */}
                <div className="mt-6 pt-6 border-t border-slate-700">
                    <p className="text-slate-500 text-xs text-center">
                        Recommended apps: Google Authenticator, Authy, 1Password, Microsoft Authenticator
                    </p>
                </div>
            </div>
        </div>
    );
}
