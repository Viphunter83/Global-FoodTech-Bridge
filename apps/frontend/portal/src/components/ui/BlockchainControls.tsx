'use client';

import { useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { notarizeBatch, finalizeHandover, reportViolation } from '@/lib/api';
import { Button } from './Button';
import { Loader2, ShieldCheck, AlertTriangle, CheckCircle, Truck } from 'lucide-react';

interface BlockchainControlsProps {
    batchId: string;
    blockchainStatus: {
        verified: boolean;
        handover?: boolean;
        violation?: string | null;
        txHash?: string;
    };
}

export function BlockchainControls({ batchId, blockchainStatus }: BlockchainControlsProps) {
    const { role } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleNotarize = async () => {
        setLoading(true);
        await notarizeBatch(batchId, `hash_${Date.now()}`);
        setLoading(false);
        window.location.reload();
    };

    const handleHandover = async () => {
        setLoading(true);
        await finalizeHandover(batchId);
        setLoading(false);
        window.location.reload();
    };

    const handleReport = async () => {
        setLoading(true);
        await reportViolation(batchId, "Manual Safety Report");
        setLoading(false);
        window.location.reload();
    };

    if (loading) {
        return <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Blockchain Tx...</Button>;
    }

    // 1. Violation State (High Alert)
    if (blockchainStatus.violation) {
        return (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex items-center text-red-700 font-bold mb-2">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Compliance Violation Recorded
                </div>
                <p className="text-sm text-red-600 mb-2">Details: {blockchainStatus.violation}</p>
                <div className="text-xs font-mono text-gray-500 bg-white p-1 rounded inline-block">
                    Tx: {blockchainStatus.txHash?.substring(0, 16)}...
                </div>
            </div>
        );
    }

    // 2. Handover Complete
    if (blockchainStatus.handover) {
        return (
            <div className="rounded-md bg-green-50 p-4 border border-green-200">
                <div className="flex items-center text-green-700 font-bold">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Handover Completed & Verified
                </div>
                <p className="text-sm text-green-600 mt-1">Product successfully accepted by Retailer.</p>
            </div>
        );
    }

    // 3. Notarized (In Transit)
    if (blockchainStatus.verified) {
        return (
            <div className="space-y-4">
                <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
                    <div className="flex items-center text-blue-700 font-bold">
                        <ShieldCheck className="mr-2 h-5 w-5" />
                        Secured on Polygon
                    </div>
                    <p className="text-sm text-blue-600 mt-1">Batch passport is immutable.</p>
                </div>

                {/* Logistics Actions */}
                {role === 'LOGISTICS' && (
                    <div className="flex gap-2">
                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleReport}>
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Report Incident
                        </Button>
                    </div>
                )}

                {/* Retailer Actions */}
                {role === 'RETAILER' && (
                    <div className="rounded-md bg-slate-50 p-4 border border-slate-200">
                        <h4 className="font-semibold text-sm mb-2">Retailer Checkpoint</h4>
                        <Button onClick={handleHandover} className="bg-green-600 hover:bg-green-700 text-white">
                            <Truck className="mr-2 h-4 w-4" />
                            Accept & Finalize Handover
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    // 4. Initial State (Not Notarized)
    if (role === 'MANUFACTURER') {
        return (
            <Button onClick={handleNotarize} className="w-full bg-purple-600 hover:bg-purple-700">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Notarize on Blockchain
            </Button>
        );
    }

    return <div className="text-sm text-gray-500 italic">Waiting for Manufacturer to notarize...</div>;
}
