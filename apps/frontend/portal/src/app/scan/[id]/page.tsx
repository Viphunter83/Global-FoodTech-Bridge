"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBlockchainStatus, acceptHandover, reportViolation } from '@/lib/api';
import { Loader2, CheckCircle, AlertTriangle, XCircle, PackageCheck, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ScanPage() {
    const params = useParams();
    const router = useRouter();
    const batchId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [status, setStatus] = useState<{ verified: boolean; violation?: string | null; pendingOwner?: string | null } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!batchId) return;

        const fetchData = async () => {
            try {
                const data = await getBlockchainStatus(batchId);
                setStatus(data);
            } catch (err) {
                setError("Failed to load batch data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [batchId]);

    const handleAccept = async () => {
        setActionLoading(true);
        const res = await acceptHandover(batchId);
        setActionLoading(false);
        if (res.status === 'success') {
            router.push('/dashboard');
        } else {
            alert('Failed to accept: ' + res.error);
        }
    };

    const handleReport = async () => {
        // In a real app, this would open a form details dialog
        const reason = prompt("Describe the issue:");
        if (!reason) return;

        setActionLoading(true);
        const res = await reportViolation(batchId, reason);
        setActionLoading(false);
        if (res.status === 'success') {
            window.location.reload();
        } else {
            alert('Failed to report: ' + res.error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !status || !status.verified) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center space-y-4">
                    <XCircle className="h-20 w-20 text-gray-400 mx-auto" />
                    <h1 className="text-2xl font-bold text-gray-800">Batch Not Found or Invalid</h1>
                    <p className="text-gray-500">The scanned QR code does not match any active blockchain record.</p>
                    <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    // RED SCREEN: Violation
    if (status.violation) {
        return (
            <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center p-6 text-white text-center">
                <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border-2 border-white/20 max-w-lg w-full shadow-2xl space-y-6">
                    <div className="bg-white rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="h-14 w-14 text-red-600" />
                    </div>

                    <div>
                        <h1 className="text-4xl font-extrabold mb-2">STOP!</h1>
                        <h2 className="text-2xl font-bold opacity-90">SLA Violation Detected</h2>
                    </div>

                    <div className="bg-black/20 p-4 rounded-xl text-left">
                        <p className="text-sm font-semibold uppercase tracking-wider opacity-70 mb-1">Issue Details:</p>
                        <p className="text-lg font-medium">{status.violation}</p>
                    </div>

                    <div className="pt-4 space-y-3">
                        <div className="text-sm opacity-75">
                            This batch should typically be rejected or inspected by QA.
                        </div>
                        <Button
                            onClick={handleReport}
                            disabled={actionLoading}
                            className="w-full h-14 text-lg bg-white text-red-600 hover:bg-red-50 font-bold shadow-lg"
                        >
                            Update Report
                        </Button>
                        <Button
                            onClick={() => router.push('/dashboard')}
                            variant="outline"
                            className="w-full border-white text-white hover:bg-white/10"
                        >
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // GREEN SCREEN: Success / Ready to Accept
    return (
        <div className="min-h-screen bg-emerald-600 flex flex-col items-center justify-center p-6 text-white text-center">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border-2 border-white/20 max-w-lg w-full shadow-2xl space-y-6">
                <div className="bg-white rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-14 w-14 text-emerald-600" />
                </div>

                <div>
                    <h1 className="text-4xl font-extrabold mb-2">VERIFIED</h1>
                    <h2 className="text-2xl font-bold opacity-90">Safe to Accept</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="bg-black/10 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck className="h-4 w-4 opacity-75" />
                            <span className="text-xs uppercase font-bold opacity-75">Halal Status</span>
                        </div>
                        <p className="text-lg font-bold">Confirmed</p>
                    </div>
                    <div className="bg-black/10 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="h-4 w-4 opacity-75" />
                            <span className="text-xs uppercase font-bold opacity-75">Temperature</span>
                        </div>
                        <p className="text-lg font-bold">Optimal</p>
                    </div>
                </div>

                <div className="pt-6 space-y-4">
                    <Button
                        onClick={handleAccept}
                        disabled={actionLoading}
                        className="w-full h-16 text-xl bg-white text-emerald-700 hover:bg-emerald-50 font-bold shadow-xl flex items-center justify-center gap-3 transform transition hover:scale-105"
                    >
                        {actionLoading ? <Loader2 className="animate-spin" /> : <PackageCheck className="h-6 w-6" />}
                        Accept Batch
                    </Button>
                    <Button
                        onClick={handleReport}
                        disabled={actionLoading}
                        variant="ghost"
                        className="w-full text-white/70 hover:text-white hover:bg-white/10"
                    >
                        Report Issue
                    </Button>
                </div>
            </div>
        </div>
    );
}
