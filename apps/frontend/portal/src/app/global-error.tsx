'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

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
                    <h2 className="text-2xl font-bold text-red-900">Critical System Error</h2>
                    <p className="text-red-700 max-w-md text-center">
                        The application encountered a critical error and could not load.
                    </p>
                    <Button onClick={() => reset()} className="bg-red-600 text-white hover:bg-red-700">
                        Try Again
                    </Button>
                </div>
            </body>
        </html>
    );
}
