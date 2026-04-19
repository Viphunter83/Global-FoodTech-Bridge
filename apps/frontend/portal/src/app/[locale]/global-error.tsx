'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="h-screen w-full flex flex-col items-center justify-center gap-6 bg-red-50 p-4">
                    <h2 className="text-2xl font-bold text-red-900">Critical Error</h2>
                    <p className="text-red-700 max-w-md text-center">
                        The portal encountered a critical failure. This is often caused by missing environment variables or network issues.
                    </p>
                    <button 
                        onClick={() => reset()}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </body>
        </html>
    );
}
