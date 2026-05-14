'use client';

import { useEffect } from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Global Error Boundary for the [locale] segment.
 * Catches unhandled runtime errors and displays a branded recovery UI.
 * This prevents the entire app from white-screening in production.
 */
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log to external monitoring (Sentry, etc.) when available
        console.error('[GFTB Error Boundary]', {
            message: error.message,
            digest: error.digest,
            stack: error.stack?.slice(0, 500),
        });
    }, [error]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <div className="max-w-lg w-full text-center space-y-8">
                {/* Decorative blurs */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
                </div>

                {/* Icon */}
                <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <ShieldAlert className="h-10 w-10 text-red-500/80" />
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-3">
                    <h2 className="text-3xl font-serif font-black tracking-tight text-foreground">
                        Something went wrong
                    </h2>
                    <p className="text-muted-foreground/80 text-sm leading-relaxed max-w-md mx-auto">
                        An unexpected error occurred. Our systems have been notified and we're working to resolve it. 
                        Please try again or return to the homepage.
                    </p>
                </div>

                {/* Error digest (production-safe) */}
                {error.digest && (
                    <div className="inline-block px-4 py-2 rounded-xl bg-muted/50 text-xs font-mono text-muted-foreground">
                        Error ID: {error.digest}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <Button
                        onClick={reset}
                        className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = '/'}
                        className="h-12 px-6 rounded-xl border-primary/20 font-bold transition-all"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
