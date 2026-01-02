'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
            <Card className="max-w-md w-full border-red-200 bg-red-50/50">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                    <CardTitle className="text-red-900">Something went wrong!</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                    <p className="text-sm text-red-700">
                        {error.message || "We couldn't load the batch details. Please try again or contact support."}
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button
                            onClick={reset}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
