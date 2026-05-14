'use client';

import { useEffect } from 'react';

/**
 * Root-level error boundary.
 * Catches errors outside the [locale] layout (e.g., middleware crashes).
 * Must provide its own <html>/<body> since the root layout may have failed.
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[GFTB Global Error]', error);
    }, [error]);

    return (
        <html lang="en">
            <body style={{
                margin: 0,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                background: '#0f172a',
                color: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
            }}>
                <div style={{ textAlign: 'center', maxWidth: 480, padding: 32 }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
                        Critical Error
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                        A critical application error occurred. Please refresh the page. If the problem persists, contact support.
                    </p>
                    {error.digest && (
                        <p style={{ 
                            fontSize: 11, 
                            fontFamily: 'monospace', 
                            color: '#64748b',
                            background: '#1e293b',
                            padding: '8px 16px',
                            borderRadius: 8,
                            display: 'inline-block',
                            marginBottom: 24,
                        }}>
                            Ref: {error.digest}
                        </p>
                    )}
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
                        <button
                            onClick={reset}
                            style={{
                                padding: '12px 24px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: 14,
                            }}
                        >
                            Retry
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            style={{
                                padding: '12px 24px',
                                background: 'transparent',
                                color: '#94a3b8',
                                border: '1px solid #334155',
                                borderRadius: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: 14,
                            }}
                        >
                            Home
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
