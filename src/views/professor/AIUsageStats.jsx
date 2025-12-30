import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    Loader2, Zap, RefreshCw, AlertCircle, CheckCircle,
    TrendingUp, Clock, DollarSign, Activity, Play, Square, AlertTriangle
} from 'lucide-react';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export default function AIUsageStats() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Stress test state
    const [testing, setTesting] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [testLog, setTestLog] = useState([]);

    const fetchUsageStats = async () => {
        if (!OPENROUTER_API_KEY) {
            setError("OpenRouter API key not configured");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch("https://openrouter.ai/api/v1/key", {
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`
                }
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            setStats(data.data);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsageStats();
    }, []);

    const formatCredits = (credits) => {
        if (!credits && credits !== 0) return 'N/A';
        return `$${credits.toFixed(4)}`;
    };

    const formatNumber = (num) => {
        if (!num && num !== 0) return 'N/A';
        return num.toLocaleString();
    };

    // Stress test function to find rate limits
    const runStressTest = async () => {
        setTesting(true);
        setTestResults(null);
        setTestLog([]);

        let successCount = 0;
        let failCount = 0;
        let lastError = null;
        const startTime = Date.now();
        const maxRequests = 100; // Test up to 100 requests
        const delayBetween = 500; // 500ms between requests

        const addLog = (msg, type = 'info') => {
            setTestLog(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);
        };

        addLog('🚀 Starting stress test...', 'info');
        addLog(`Will send up to ${maxRequests} requests with ${delayBetween}ms delay`, 'info');

        for (let i = 1; i <= maxRequests; i++) {
            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": window.location.origin,
                        "X-Title": "Ctrl C Academy - Rate Limit Test"
                    },
                    body: JSON.stringify({
                        model: "moonshotai/kimi-k2:free",
                        messages: [{ role: "user", content: "Say hi in 2 words" }],
                        max_tokens: 10
                    })
                });

                if (response.ok) {
                    successCount++;
                    if (successCount % 10 === 0 || successCount <= 5) {
                        addLog(`✅ Request ${i} succeeded (${successCount} total)`, 'success');
                    }
                } else {
                    const errorData = await response.text();
                    failCount++;
                    lastError = `${response.status}: ${errorData.substring(0, 100)}`;
                    addLog(`❌ Request ${i} FAILED: ${response.status}`, 'error');

                    // If we hit a rate limit (429), stop testing
                    if (response.status === 429) {
                        addLog('🛑 RATE LIMIT HIT! Stopping test.', 'error');
                        break;
                    }
                }
            } catch (err) {
                failCount++;
                lastError = err.message;
                addLog(`❌ Request ${i} error: ${err.message}`, 'error');
            }

            // Update results in real-time
            setTestResults({
                successCount,
                failCount,
                lastError,
                duration: Math.round((Date.now() - startTime) / 1000),
                inProgress: true
            });

            // Delay between requests
            await new Promise(r => setTimeout(r, delayBetween));
        }

        const duration = Math.round((Date.now() - startTime) / 1000);
        addLog(`🏁 Test complete: ${successCount} success, ${failCount} failed in ${duration}s`, 'info');

        setTestResults({
            successCount,
            failCount,
            lastError,
            duration,
            inProgress: false
        });
        setTesting(false);
    };

    const stopTest = () => {
        setTesting(false);
    };

    if (loading) {
        return (
            <Card className="p-8">
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                    <p className="text-slate-500">Loading AI usage statistics...</p>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-8">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="text-red-500 mb-4" size={40} />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        Failed to load AI stats
                    </h3>
                    <p className="text-slate-500 mb-4">{error}</p>
                    <Button onClick={fetchUsageStats}>
                        <RefreshCw size={16} className="mr-2" />
                        Retry
                    </Button>
                </div>
            </Card>
        );
    }

    // Calculate if we're on free tier (no limit set usually means free)
    const isFreeModel = !stats?.limit || stats.limit === null;
    const hasRateLimit = stats?.rate_limit;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Zap className="text-yellow-500" />
                        AI Usage Statistics
                    </h2>
                    <p className="text-slate-500">
                        OpenRouter (Kimi K2) usage and limits
                    </p>
                </div>
                <Button variant="outline" onClick={fetchUsageStats} disabled={loading}>
                    <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Status Card */}
            <Card className={`p-6 border-l-4 ${isFreeModel ? 'border-l-green-500 bg-green-50 dark:bg-green-900/10' : 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10'}`}>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${isFreeModel ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                        <CheckCircle className={isFreeModel ? 'text-green-600' : 'text-blue-600'} size={28} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {isFreeModel ? 'Free Tier Active' : 'Paid Plan Active'}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                            {isFreeModel
                                ? 'Using free Kimi K2 model - no credit costs!'
                                : `Credit limit: ${formatCredits(stats?.limit)}`
                            }
                        </p>
                    </div>
                </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Usage This Month */}
                <Card className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                            <TrendingUp className="text-white" size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Monthly Usage</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                {formatCredits(stats?.usage)}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Remaining Credits */}
                <Card className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                            <DollarSign className="text-white" size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Remaining</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                {isFreeModel ? 'Unlimited' : formatCredits(stats?.limit_remaining)}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Rate Limit */}
                <Card className="p-5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                            <Activity className="text-white" size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Rate Limit</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                {hasRateLimit && stats.rate_limit.requests > 0
                                    ? `${stats.rate_limit.requests}/${stats.rate_limit.interval}`
                                    : 'No limit'}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Last Updated */}
                <Card className="p-5 bg-gradient-to-br from-orange-500/10 to-amber-500/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
                            <Clock className="text-white" size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Last Updated</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                {lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Detailed Info */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    API Key Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">Label</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                            {stats?.label || 'Default Key'}
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">Is Free Tier</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                            {stats?.is_free_tier ? 'Yes ✅' : 'No'}
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">Total Usage (All Time)</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                            {formatCredits(stats?.usage)}
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">Credit Limit</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                            {stats?.limit ? formatCredits(stats.limit) : 'None (Free)'}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Stress Test Card */}
            <Card className="p-6 border-l-4 border-l-orange-500">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="text-orange-500" />
                            Rate Limit Stress Test
                        </h3>
                        <p className="text-sm text-slate-500">
                            Send multiple requests to find the actual rate limit
                        </p>
                    </div>
                    <Button
                        onClick={testing ? stopTest : runStressTest}
                        className={testing ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}
                        disabled={false}
                    >
                        {testing ? (
                            <>
                                <Square size={16} className="mr-2" />
                                Stop Test
                            </>
                        ) : (
                            <>
                                <Play size={16} className="mr-2" />
                                Run Test (100 requests)
                            </>
                        )}
                    </Button>
                </div>

                {/* Test Results */}
                {testResults && (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                                {testResults.successCount}
                            </p>
                            <p className="text-xs text-green-600">Successful</p>
                        </div>
                        <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                                {testResults.failCount}
                            </p>
                            <p className="text-xs text-red-600">Failed</p>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                {testResults.duration}s
                            </p>
                            <p className="text-xs text-blue-600">Duration</p>
                        </div>
                    </div>
                )}

                {/* Test Log */}
                {testLog.length > 0 && (
                    <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-3 max-h-48 overflow-y-auto font-mono text-xs">
                        {testLog.map((log, idx) => (
                            <div
                                key={idx}
                                className={`${log.type === 'success' ? 'text-green-400' :
                                    log.type === 'error' ? 'text-red-400' :
                                        'text-slate-400'
                                    }`}
                            >
                                <span className="text-slate-500">[{log.time}]</span> {log.msg}
                            </div>
                        ))}
                    </div>
                )}

                {!testResults && !testing && (
                    <p className="text-sm text-slate-500 italic">
                        Click "Run Test" to send 100 requests and find the rate limit. Test will stop automatically if rate limit (429) is hit.
                    </p>
                )}
            </Card>

            {/* Info Box */}
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <Zap className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                        <p className="font-medium mb-1">About OpenRouter Free Tier</p>
                        <p className="text-blue-600 dark:text-blue-400">
                            Free models like Kimi K2 have no credit costs. Rate limits may apply based on daily request quotas.
                            For higher limits, you can add credits at{' '}
                            <a
                                href="https://openrouter.ai/settings/credits"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:no-underline"
                            >
                                openrouter.ai/settings/credits
                            </a>
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
