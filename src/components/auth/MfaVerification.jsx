import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

/**
 * MFA Verification Component
 * Prompts user to enter 6-digit TOTP code from authenticator app
 */
export default function MfaVerification({ factorId, onSuccess, onCancel }) {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRefs = useRef([]);

    // Focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits entered
        if (value && index === 5 && newCode.every(d => d !== '')) {
            handleVerify(newCode.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        // Handle paste
        if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            navigator.clipboard.readText().then(text => {
                const digits = text.replace(/\D/g, '').slice(0, 6).split('');
                const newCode = [...code];
                digits.forEach((d, i) => {
                    if (i < 6) newCode[i] = d;
                });
                setCode(newCode);
                if (digits.length === 6) {
                    handleVerify(newCode.join(''));
                } else {
                    inputRefs.current[digits.length]?.focus();
                }
            });
        }
    };

    const handleVerify = async (codeStr) => {
        if (codeStr.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Create challenge
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId
            });

            if (challengeError) throw challengeError;

            // Verify with the code
            const { data, error: verifyError } = await supabase.auth.mfa.verify({
                factorId,
                challengeId: challengeData.id,
                code: codeStr
            });

            if (verifyError) throw verifyError;

            // Success! Session is now aal2
            onSuccess?.();
        } catch (err) {
            console.error('MFA verification error:', err);
            setError(err.message || 'Invalid code. Please try again.');
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700">
                <div className="text-center mb-8">
                    <div className="bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="text-blue-500" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Two-Factor Authentication</h2>
                    <p className="text-slate-400">
                        Enter the 6-digit code from your authenticator app
                    </p>
                </div>

                {/* 6-digit code input */}
                <div className="flex gap-2 justify-center mb-6">
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
                            disabled={loading}
                            className={`w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 
                                ${error ? 'border-red-500 bg-red-500/10' : 'border-slate-600 bg-slate-700'}
                                text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                                outline-none transition-all disabled:opacity-50`}
                        />
                    ))}
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
                    disabled={loading || code.some(d => d === '')}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 
                        text-white py-3 rounded-lg font-semibold transition-colors
                        flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Verifying...
                        </>
                    ) : (
                        'Verify Code'
                    )}
                </button>

                {/* Cancel option */}
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="w-full mt-4 text-slate-400 hover:text-white transition-colors text-sm"
                    >
                        Cancel and sign out
                    </button>
                )}
            </div>
        </div>
    );
}
