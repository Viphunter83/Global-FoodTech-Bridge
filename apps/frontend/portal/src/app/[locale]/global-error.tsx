'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[GFTB-CRITICAL]', error);
    }, [error]);

    return (
        <html>
            <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <div style={{
                    minHeight: '100vh',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2rem',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                    padding: '2rem',
                    color: '#f1f5f9',
                }}>
                    {/* Decorative glow */}
                    <div style={{
                        position: 'absolute',
                        width: '400px',
                        height: '400px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                        pointerEvents: 'none',
                    }} />

                    <div style={{
                        position: 'relative',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2rem',
                        maxWidth: '480px',
                        textAlign: 'center',
                    }}>
                        {/* Icon */}
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '24px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 20px 50px -15px rgba(239, 68, 68, 0.3)',
                        }}>
                            <AlertTriangle size={40} color="#ef4444" />
                        </div>

                        {/* Text */}
                        <div>
                            <h2 style={{
                                fontSize: '2rem',
                                fontWeight: 900,
                                fontStyle: 'italic',
                                letterSpacing: '-0.05em',
                                marginBottom: '0.75rem',
                                color: '#f1f5f9',
                            }}>
                                System Error
                            </h2>
                            <p style={{
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.2em',
                                color: 'rgba(241, 245, 249, 0.4)',
                                lineHeight: '1.8',
                                maxWidth: '360px',
                                margin: '0 auto',
                            }}>
                                The portal encountered a critical failure. This is often caused by missing environment variables or network issues.
                            </p>
                        </div>

                        {/* Error digest */}
                        {error.digest && (
                            <div style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                fontSize: '0.625rem',
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                color: 'rgba(241, 245, 249, 0.3)',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                            }}>
                                Digest: {error.digest}
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button
                                onClick={() => reset()}
                                aria-label="Retry loading the page"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '1rem 2rem',
                                    borderRadius: '1.5rem',
                                    background: 'rgba(239, 68, 68, 0.9)',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '0.625rem',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.2em',
                                    cursor: 'pointer',
                                    boxShadow: '0 10px 30px -5px rgba(239, 68, 68, 0.4)',
                                    transition: 'all 0.2s',
                                }}
                                onMouseOver={(e) => {
                                    (e.target as HTMLButtonElement).style.transform = 'scale(1.05)';
                                }}
                                onMouseOut={(e) => {
                                    (e.target as HTMLButtonElement).style.transform = 'scale(1)';
                                }}
                            >
                                <RefreshCcw size={16} />
                                Try Again
                            </button>
                            <a
                                href="/"
                                aria-label="Return to homepage"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '1rem 2rem',
                                    borderRadius: '1.5rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: 'rgba(241, 245, 249, 0.7)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    fontSize: '0.625rem',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.2em',
                                    textDecoration: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <Home size={16} />
                                Go Home
                            </a>
                        </div>

                        {/* Footer branding */}
                        <div style={{
                            marginTop: '2rem',
                            fontSize: '0.5rem',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.4em',
                            color: 'rgba(241, 245, 249, 0.15)',
                            fontStyle: 'italic',
                        }}>
                            Global FoodTech Bridge • System Recovery
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
