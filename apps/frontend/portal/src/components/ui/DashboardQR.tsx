'use client';

import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay';
import { useState, useEffect } from 'react';

export function DashboardQR({ batchId }: { batchId: string }) {
    const [mounted, setMounted] = useState(false);

    // Only render on client to access window.location.origin
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="mt-6 flex flex-col items-center">
            <h3 className="mb-2 text-sm font-medium text-gray-500">Scan to Verify</h3>
            <QRCodeDisplay value={`${window.location.origin}/verify/${batchId}`} size={100} />
            <a
                href={`/verify/${batchId}`}
                target="_blank"
                className="mt-3 text-xs text-blue-600 hover:text-blue-800 underline"
            >
                Open Public Passport
            </a>
        </div>
    );
}
