'use client';

import { useEffect } from 'react';

// Global error page MUST be at the absolute root (src/app/global-error.tsx)
// in Next.js App Router to correctly handle failures in the root layout.
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error for infrastructure monitoring
        console.error("CRITICAL_SYSTEM_ERROR:", error);
    }, [error]);

    return (
        <html lang="en">
            <body style={{ margin: 0, padding: 0 }}>
                <div style={{
                    height: '100vh',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '24px',
                    backgroundColor: '#fef2f2',
                    padding: '16px',
                    fontFamily: 'sans-serif'
                }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#7f1d1d', margin: 0 }}>
                        Critical System Error
                    </h2>
                    <p style={{ color: '#b91c1c', maxWidth: '400px', textAlign: 'center', margin: 0 }}>
                        The GFTB Bridge application encountered a fatal error during initialization. 
                        Please try refreshing the page or contact the technical support if the issue persists.
                    </p>
                    <button 
                        onClick={() => reset()} 
                        style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Try Again
                    </button>
                    {error.digest && (
                        <span style={{ fontSize: '10px', color: '#991b1b', opacity: 0.5 }}>
                            Error Digest: {error.digest}
                        </span>
                    )}
                </div>
            </body>
        </html>
    );
}
