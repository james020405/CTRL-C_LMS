import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import logger from '../lib/logger';

/**
 * Error Boundary component to catch and handle React errors gracefully.
 * Use this to wrap components that might fail (3D views, API-dependent content).
 * Integrates with centralized logger for error tracking.
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Log error using centralized logger (handles dev/prod modes)
        logger.reportError('ErrorBoundary', error);
        logger.debug('Error component stack:', errorInfo?.componentStack);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            // Check if it's a WebGL/3D error
            const is3DError =
                this.state.error?.message?.includes('WebGL') ||
                this.state.error?.message?.includes('THREE') ||
                this.state.error?.message?.includes('canvas');

            return (
                <Card className="p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                {is3DError ? '3D Viewer Error' : 'Something went wrong'}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 max-w-md">
                                {is3DError
                                    ? 'The 3D viewer encountered an error. This might be due to browser compatibility or graphics driver issues.'
                                    : 'An unexpected error occurred. Please try again or refresh the page.'
                                }
                            </p>
                        </div>

                        {is3DError && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-sm text-amber-800 dark:text-amber-200 max-w-md">
                                <strong>Tips:</strong>
                                <ul className="list-disc list-inside mt-2 space-y-1 text-left">
                                    <li>Try using Chrome or Firefox</li>
                                    <li>Update your graphics drivers</li>
                                    <li>Disable browser extensions</li>
                                </ul>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button onClick={this.handleRetry} variant="outline">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                            <Button onClick={() => window.location.reload()}>
                                Refresh Page
                            </Button>
                        </div>

                        {import.meta.env.DEV && this.state.error && (
                            <details className="mt-4 text-left w-full max-w-md">
                                <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-700">
                                    Technical Details
                                </summary>
                                <pre className="mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded text-xs overflow-auto text-red-600 dark:text-red-400">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </Card>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
