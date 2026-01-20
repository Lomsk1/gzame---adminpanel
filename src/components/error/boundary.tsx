import React, { Component,  } from "react";
import { logoutAndClearAll } from "../../utils/auth";

interface Props {
    children: React.ReactNode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    externalError?: any; // To pass router errors into the class
}

interface State {
    hasError: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any;
    type: 'auth' | 'network' | 'generic';
}

const PATTERNS = {
    auth: ['jsonwebtokenerror', 'invalid algorithm', 'jwt expired', 'unauthorized', 'invalid token', '401'],
    network: ['network error', 'failed to fetch', 'err_connection_', 'load failed', 'offline']
};

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, error: null, type: 'generic' };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static getDerivedStateFromError(error: any) {
        const msg = (error?.message || error?.data?.message || String(error)).toLowerCase();

        let type: State['type'] = 'generic';
        if (PATTERNS.auth.some(p => msg.includes(p))) type = 'auth';
        else if (PATTERNS.network.some(p => msg.includes(p))) type = 'network';

        return { hasError: true, error, type };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("Boundary Caught:", error, info);
    }

    render() {
        if (this.state.hasError) {
            const { type, error } = this.state;

            if (type === 'auth') {
                return (
                    <div className="flex h-screen items-center justify-center bg-admin-bg p-6 text-center">
                        <div className="max-w-sm rounded-xl border border-admin-primary/20 bg-admin-card p-8 shadow-2xl">
                            <div className="mb-4 text-5xl">🔒</div>
                            <h2 className="mb-2 text-xl font-bold text-admin-primary">Session Expired</h2>
                            <p className="mb-6 text-sm text-admin-text-dim">Your security token is invalid or has expired. Please log in again.</p>
                            <button onClick={logoutAndClearAll} className="w-full rounded-lg bg-admin-primary py-3 font-semibold text-white transition-all hover:opacity-90">
                                Re-authenticate
                            </button>
                        </div>
                    </div>
                );
            }

            if (type === 'network') {
                return (
                    <div className="flex h-screen items-center justify-center bg-admin-bg p-6 text-center">
                        <div className="max-w-sm rounded-xl border border-admin-warning/20 bg-admin-card p-8 shadow-2xl">
                            <div className="mb-4 text-5xl">📡</div>
                            <h2 className="mb-2 text-xl font-bold text-admin-warning">Connection Issue</h2>
                            <p className="mb-6 text-sm text-admin-text-dim">Unable to connect to the server. Please check your internet.</p>
                            <button onClick={() => window.location.reload()} className="w-full rounded-lg border border-admin-warning py-3 font-semibold text-admin-warning hover:bg-admin-warning/10">
                                Retry Connection
                            </button>
                        </div>
                    </div>
                );
            }

            return (
                <div className="flex h-screen items-center justify-center bg-admin-bg p-6 text-center">
                    <div className="max-w-md rounded-xl border border-admin-error/20 bg-admin-card p-8 shadow-2xl">
                        <div className="mb-4 text-5xl text-admin-error">⚠️</div>
                        <h2 className="mb-2 text-xl font-bold text-admin-error">System Error</h2>
                        <p className="mb-6 text-sm text-admin-text-dim">An unexpected application crash occurred.</p>
                        <button onClick={() => window.location.href = '/'} className="mb-4 w-full rounded-lg bg-admin-error py-3 font-semibold text-white">
                            Return to Dashboard
                        </button>
                        <details className="text-left text-[10px] opacity-40">
                            <pre className="whitespace-pre-wrap">{error?.stack || JSON.stringify(error)}</pre>
                        </details>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}