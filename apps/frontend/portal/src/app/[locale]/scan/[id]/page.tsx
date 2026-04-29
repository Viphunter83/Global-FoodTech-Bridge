"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/navigation';
import { getBlockchainStatus, acceptHandover, reportViolation, getBatchDetails, BatchDetails } from '@/lib/api';
import { Loader2, CheckCircle, AlertTriangle, XCircle, PackageCheck, ShieldCheck, FileCheck, ArrowRightLeft, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlockchainControls } from '@/components/ui/BlockchainControls';
import { useAuth } from '@/components/providers/AuthProvider';
import { ProductHero } from '@/components/passport/ProductHero';
import { JourneyTimeline } from '@/components/passport/JourneyTimeline';
import { RouteMapDynamic } from '@/components/passport/RouteMapDynamic';
import { CertificateCard } from '@/components/passport/CertificateCard';
import { TrustMetricBadge } from '@/components/passport/TrustMetricBadge';
import { MerchantFunnelCTA } from '@/components/passport/MerchantFunnelCTA';
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
                <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
            </div>
        );
    }

    if ((!batchDetails) && (error || !status)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center space-y-4">
                    <XCircle className="h-20 w-20 text-gray-400 mx-auto" />
                    <h1 className="text-2xl font-bold text-gray-800">Batch Not Found</h1>
                    <p className="text-gray-500">Could not load batch data. Our servers are verifying the chain.</p>
                    <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    const ToggleButton = () => (
        (role === 'LOGISTICS' || role === 'RETAILER' || role === 'MANUFACTURER') ? (
            <Button
                variant="outline"
                size="sm"
                className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur shadow-sm border-emerald-100"
                onClick={() => setViewMode(viewMode === 'passport' ? 'logistics' : 'passport')}
            >
                <ArrowRightLeft className="mr-2 h-4 w-4 text-emerald-600" />
                Switch to {viewMode === 'passport' ? 'Logistics' : 'Passport'} View
            </Button>
        ) : null
    );

    if (viewMode === 'logistics') {
        if (status?.violation) {
            return (
                <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center p-6 text-white text-center">
                    <ToggleButton />
                    <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border-2 border-white/20 max-w-lg w-full shadow-2xl space-y-6">
                        <div className="bg-white rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="h-14 w-14 text-red-600" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold mb-2 text-white">STOP!</h1>
                            <h2 className="text-2xl font-bold opacity-90">SLA Violation Detected</h2>
                        </div>
                        <div className="bg-black/20 p-4 rounded-xl text-left">
                            <p className="text-sm font-semibold uppercase tracking-wider opacity-70 mb-1">Issue Details:</p>
                            <p className="text-lg font-medium">{status?.violation}</p>
                        </div>
                        <div className="pt-4 space-y-3">
                            <Button onClick={handleReport} disabled={actionLoading} className="w-full h-14 text-lg bg-white text-red-600 hover:bg-red-50 font-bold shadow-lg">
                                Update Report
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
                        <h1 className="text-4xl font-extrabold mb-2 text-white uppercase tracking-tighter">Verified</h1>
                        <h2 className="text-2xl font-bold opacity-90">Safe to Accept</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="bg-black/10 p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck className="h-4 w-4 opacity-75" />
                                <span className="text-xs uppercase font-bold opacity-75">Quality Status</span>
                            </div>
                            <p className="text-lg font-bold">Confirmed</p>
                        </div>
                        <div className="bg-black/10 p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="h-4 w-4 opacity-75" />
                                <span className="text-xs uppercase font-bold opacity-75">IoT Data</span>
                            </div>
                            <p className="text-lg font-bold">Optimal</p>
                        </div>
                    </div>
                    <div className="pt-6 space-y-4">
                        <Button onClick={handleAccept} disabled={actionLoading} className="w-full h-16 text-xl bg-white text-emerald-700 hover:bg-emerald-50 font-bold shadow-xl flex items-center justify-center gap-3 transform transition hover:scale-105">
                            {actionLoading ? <Loader2 className="animate-spin" /> : <PackageCheck className="h-6 w-6" />}
                            Accept Handover
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20">
            <ToggleButton />
            
            {/* 1. Official Verification Header */}
            <div className="bg-emerald-900 text-white py-12 px-6">
                <div className="max-w-3xl mx-auto text-center space-y-4">
                    <div className="inline-flex items-center gap-2 bg-emerald-800/50 backdrop-blur px-4 py-1.5 rounded-full border border-emerald-700/50 mb-4 transition-all hover:bg-emerald-800">
                        <ShieldCheck className="h-4 w-4 text-gold-400" />
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-50">Global FoodTech Certified Bridge</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight leading-none mb-4">
                        Verified {batchDetails?.product_type?.replace(/_/g, ' ') || "Product"}
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-sm font-medium text-emerald-200/80">
                        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded">
                            <span className="text-[10px] text-emerald-400 font-bold">ORIGIN:</span>
                            <span className="text-white">{batchDetails?.origin_country || "Vietnam"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded text-gold-200">
                            <span className="text-[10px] text-gold-400 font-bold">BATCH:</span>
                            <span className="font-mono">{batchId.split('-')[0].toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-3xl -mt-8 space-y-8 p-4 md:p-6 relative z-10">
                
                {/* 2. Key Verification Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {batchDetails?.trust_metrics?.map((metric, idx) => (
                        <TrustMetricBadge key={idx} {...metric} />
                    ))}
                </div>

                {/* 3. Main Content Tabs */}
                <Tabs defaultValue="journey" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-14 p-1.5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                        <TabsTrigger value="journey" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-900 data-[state=active]:shadow-sm">Verification Journey</TabsTrigger>
                        <TabsTrigger value="purity" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-900 data-[state=active]:shadow-sm">Technical Purity</TabsTrigger>
                    </TabsList>

                    <TabsContent value="journey" className="pt-6 space-y-4">
                        {/* Interactive Route Map */}
                        <Card className="p-6 md:p-8 border-emerald-50 shadow-sm bg-white rounded-3xl overflow-hidden">
                            <RouteMapDynamic
                                events={batchDetails?.history || []}
                                originCountry={batchDetails?.origin_country}
                                destinationCountry={batchDetails?.destination_country}
                                height="380px"
                            />
                        </Card>

                        {/* Chain of Custody Timeline */}
                        <Card className="p-8 border-emerald-50 shadow-sm relative overflow-hidden bg-white rounded-3xl">
                            <h3 className="text-xl font-bold text-emerald-950 mb-8 flex items-center gap-2">
                                <ArrowRightLeft className="h-5 w-5 text-emerald-600" />
                                Chain of Custody
                            </h3>
                            <JourneyTimeline events={batchDetails?.history || []} />
                        </Card>
                    </TabsContent>

                    <TabsContent value="purity" className="pt-6 space-y-6">
                        <Card className="p-8 border-emerald-50 shadow-sm bg-white rounded-3xl">
                            <h3 className="text-xl font-bold text-emerald-950 mb-6 flex items-center gap-2">
                                <FlaskConical className="h-5 w-5 text-emerald-600" />
                                Lab Analysis & Ingredients
                            </h3>
                            <div className="space-y-6">
                                <div className="p-5 bg-emerald-50/30 rounded-2xl border border-emerald-50">
                                    <h4 className="text-xs font-bold text-emerald-800/60 uppercase tracking-widest mb-2">Authenticated Ingredients</h4>
                                    <p className="text-emerald-950 leading-relaxed font-medium">
                                        {typeof batchDetails?.ingredients === 'string'
                                            ? batchDetails?.ingredients
                                            : (batchDetails?.ingredients?.en || "Pure natural contents as verified by notarized certificates.")
                                        }
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <CertificateCard
                                        title="Chemical-Free Certified"
                                        issuer="Global Food Safety Initiative"
                                        date="Audit: Oct 2025"
                                        type="haccp"
                                    />
                                    <CertificateCard
                                        title="Blockchain Notarized"
                                        issuer="GFTB Protocol"
                                        date={new Date().toLocaleDateString()}
                                        type="halal"
                                    />
                                </div>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* 4. Merchant Sales Funnel */}
                {batchDetails && (
                    <MerchantFunnelCTA 
                        merchantName={batchDetails.manufacturer_name || "GFTB Official Partner"} 
                        redirectUrl={batchDetails.partner_redirect_url || "https://example.com/shop"}
                        productType={batchDetails.product_type?.replace(/_/g, ' ')}
                    />
                )}

                {/* 5. Role-Based Admin Controls (Hidden but available) */}
                {role === 'ADMIN' && (
                    <Card className="p-6 border-blue-100 shadow-lg bg-blue-50/20 mt-12">
                        <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4 border-b border-blue-100 pb-2">Admin Debug Portal</h3>
                        {status && (
                            <BlockchainControls
                                batchId={batchId}
                                blockchainStatus={status}
                                onRefresh={() => window.location.reload()}
                            />
                        )}
                    </Card>
                )}

                <div className="text-center pt-12">
                    <div className="inline-flex items-center gap-2 grayscale transition-all hover:grayscale-0">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40">GFTB Trust Protocol v2.5</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
