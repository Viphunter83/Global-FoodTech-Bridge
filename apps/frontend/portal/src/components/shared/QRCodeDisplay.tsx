'use client';

import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
    value: string;
    size?: number;
    className?: string;
}

export function QRCodeDisplay({ value, size = 128, className }: QRCodeDisplayProps) {
    return (
        <div className={`rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200 ${className}`}>
            <QRCodeSVG
                value={value}
                size={size}
                level={'H'}
                includeMargin={true}
                className="h-auto w-full"
            />
            <p className="mt-2 text-center text-[10px] font-mono text-gray-400">SCAN TO TRACK</p>
        </div>
    );
}
