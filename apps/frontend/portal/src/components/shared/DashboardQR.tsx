'use client';

import { QRCodeDisplay } from '@/components/shared/QRCodeDisplay';
import { useState, useEffect } from 'react';

export function DashboardQR({ batchId, partnerRedirectUrl }: { batchId: string; partnerRedirectUrl?: string }) {
    const [mounted, setMounted] = useState(false);

    // Only render on client to access window.location.origin
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const verificationUrl = partnerRedirectUrl 
        ? `${partnerRedirectUrl}/${batchId}`
        : `${window.location.origin}/verify/${batchId}`;

    return (
        <div className="mt-6 flex flex-col items-center">
            <h3 className="mb-2 text-sm font-medium text-gray-500">Scan to Verify</h3>
            <QRCodeDisplay value={verificationUrl} size={100} />
            <a
                href={verificationUrl}
                target="_blank"
                className="mt-3 text-xs text-blue-600 hover:text-blue-800 underline"
            >
                {partnerRedirectUrl ? 'Open Partner Verification' : 'Open Public Passport'}
            </a>
        </div>
    );
}
