"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBlockchainStatus, acceptHandover, reportViolation, getBatchDetails, BatchDetails } from '@/lib/api';
import { Loader2, CheckCircle, AlertTriangle, XCircle, PackageCheck, ShieldCheck, FileCheck, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { ProductHero } from '@/components/passport/ProductHero';
import { JourneyTimeline } from '@/components/passport/JourneyTimeline';
import { CertificateCard } from '@/components/passport/CertificateCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function ScanPage() {
    const params = useParams();
    const router = useRouter();
    const batchId = params.id as string;
    const { role } = useAuth();

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [status, setStatus] = useState<{ verified: boolean; violation?: string | null; pendingOwner?: string | null } | null>(null);
    const [batchDetails, setBatchDetails] = useState<BatchDetails | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'passport' | 'logistics'>('passport');

    useEffect(() => {
        if (!batchId) return;

        const fetchData = async () => {
            try {
                const [blockchainData, detailsData] = await Promise.all([
                    getBlockchainStatus(batchId),
                    getBatchDetails(batchId)
                ]);
                setStatus(blockchainData);
                setBatchDetails(detailsData);

                // Auto-switch to Logistics mode for operational roles if there is an issue or pending action
                if (role === 'LOGISTICS' || role === 'RETAILER') {
                    if (blockchainData.violation || blockchainData.pendingOwner) {
                        setViewMode('logistics');
                    }
                }
            } catch (err) {
                setError("Failed to load batch data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [batchId, role]);

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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !status || !status.verified) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center space-y-4">
                    <XCircle className="h-20 w-20 text-gray-400 mx-auto" />
                    <h1 className="text-2xl font-bold text-gray-800">Batch Not Found</h1>
                    <p className="text-gray-500">The scanned QR code does not match any active blockchain record.</p>
                    <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    // === ROLE TOGGLE ===
    const ToggleButton = () => (
        (role === 'LOGISTICS' || role === 'RETAILER' || role === 'MANUFACTURER') ? (
            <Button
                variant="outline"
                size="sm"
                className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur shadow-sm"
                onClick={() => setViewMode(viewMode === 'passport' ? 'logistics' : 'passport')}
            >
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Switch to {viewMode === 'passport' ? 'Logistics' : 'Passport'} View
            </Button>
        ) : null
    );

    // === LOGISTICS VIEW (Original Red/Green Screen) ===
    if (viewMode === 'logistics') {
        if (status.violation) {
            return (
                <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center p-6 text-white text-center">
                    <ToggleButton />
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
                            <Button onClick={handleReport} disabled={actionLoading} className="w-full h-14 text-lg bg-white text-red-600 hover:bg-red-50 font-bold shadow-lg">
                                Update Report
                            </Button>
                            <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full border-white text-white hover:bg-white/10">
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-emerald-600 flex flex-col items-center justify-center p-6 text-white text-center">
                <ToggleButton />
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
                        <Button onClick={handleAccept} disabled={actionLoading} className="w-full h-16 text-xl bg-white text-emerald-700 hover:bg-emerald-50 font-bold shadow-xl flex items-center justify-center gap-3 transform transition hover:scale-105">
                            {actionLoading ? <Loader2 className="animate-spin" /> : <PackageCheck className="h-6 w-6" />}
                            Accept Batch
                        </Button>
                        <Button onClick={handleReport} disabled={actionLoading} variant="ghost" className="w-full text-white/70 hover:text-white hover:bg-white/10">
                            Report Issue
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // === DIGITAL PASSPORT VIEW (Consumer Mode) ===
    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <ToggleButton />
            <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">

                {/* 1. Hero Section */}
                <ProductHero
                    productName={batchDetails?.product_type?.replace(/_/g, ' ') || "Premium Product"}
                    batchId={batchId}
                    freshnessScore={98}
                    status={status.violation ? 'Warning' : (status.verified ? 'Verified' : 'Pending')}
                />

                {/* 2. Main Content Tabs */}
                <Tabs defaultValue="story" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="story">Journey Story</TabsTrigger>
                        <TabsTrigger value="details">Product Details</TabsTrigger>
                    </TabsList>

                    <TabsContent value="story" className="space-y-4">
                        <Card className="p-6">
                            <JourneyTimeline events={batchDetails?.history || []} />
                        </Card>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-6">
                        {/* Ingredients */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {batchDetails?.ingredients?.en || "Loading ingredients..."}
                            </p>
                            <div className="mt-4 flex gap-2">
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                    Natural
                                </span>
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                    No Preservatives
                                </span>
                            </div>
                        </Card>

                        {/* Nutrition */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Nutrition Facts</h3>
                            <div className="grid grid-cols-4 gap-4 text-center">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xl font-bold text-gray-900">{batchDetails?.nutrition?.calories || 0}</div>
                                    <div className="text-xs text-gray-500">kcal</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xl font-bold text-gray-900">{batchDetails?.nutrition?.protein || 0}g</div>
                                    <div className="text-xs text-gray-500">Protein</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xl font-bold text-gray-900">{batchDetails?.nutrition?.fat || 0}g</div>
                                    <div className="text-xs text-gray-500">Fat</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xl font-bold text-gray-900">{batchDetails?.nutrition?.carbs || 0}g</div>
                                    <div className="text-xs text-gray-500">Carbs</div>
                                </div>
                            </div>
                        </Card>

                        {/* Compliance */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold px-1">Certificates</h3>
                            <CertificateCard
                                title="Halal Certified"
                                issuer="Gulf Accreditation Center"
                                date="Valid until Dec 2026"
                                type="halal"
                            />
                            <CertificateCard
                                title="HACCP Safety Standard"
                                issuer="SGS"
                                date="Audit: Oct 2025"
                                type="haccp"
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="text-center text-xs text-gray-400 pt-8">
                    Powered by Global FoodTech Bridge Blockchain
                </div>
            </div>
        </div>
    );
}
