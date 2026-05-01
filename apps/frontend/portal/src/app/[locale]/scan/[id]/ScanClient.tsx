'use client';

import { useState } from 'react';
import { useRouter } from '@/navigation';
import { 
    getBlockchainStatus, 
    acceptHandover, 
    reportViolation, 
    getBatchDetails, 
    BatchDetails, 
    BlockchainStatus 
} from '@/lib/api';
import { 
    Loader2, 
    CheckCircle, 
    AlertTriangle, 
    PackageCheck, 
    ShieldCheck, 
    FlaskConical, 
    ArrowRightLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlockchainControls } from '@/components/blockchain/BlockchainControls';
import { useAuth } from '@/components/providers/AuthProvider';
import { JourneyTimeline } from '@/components/passport/JourneyTimeline';
import { RouteMapDynamic } from '@/components/passport/RouteMapDynamic';
import { CertificateCard } from '@/components/passport/CertificateCard';
import { TrustMetricBadge } from '@/components/passport/TrustMetricBadge';
import { MerchantFunnelCTA } from '@/components/passport/MerchantFunnelCTA';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface ScanClientProps {
    batchId: string;
    initialBatch: BatchDetails;
    initialStatus: BlockchainStatus;
}

export function ScanClient({ batchId, initialBatch, initialStatus }: ScanClientProps) {
    const router = useRouter();
    const { role } = useAuth();

    const [actionLoading, setActionLoading] = useState(false);
    const [status, setStatus] = useState<BlockchainStatus>(initialStatus);
    const [batchDetails, setBatchDetails] = useState<BatchDetails | null>(initialBatch);
    const [viewMode, setViewMode] = useState<'passport' | 'logistics'>(
        (role === 'LOGISTICS' || role === 'RETAILER') && (initialStatus.violation || initialStatus.pendingOwner) 
        ? 'logistics' : 'passport'
    );

    const refreshData = async () => {
        try {
            const [newStatus, newDetails] = await Promise.all([
                getBlockchainStatus(batchId),
                getBatchDetails(batchId)
            ]);
            setStatus(newStatus);
            setBatchDetails(newDetails);
        } catch (err) {
            console.error("Refresh failed:", err);
        }
    };

    const handleAccept = async () => {
        setActionLoading(true);
        try {
            const res = await acceptHandover(batchId);
            if (res.status === 'success') {
                toast.success('Handover accepted successfully');
                router.push('/dashboard');
            } else {
                toast.error(`Accept failed: ${res.error}`);
            }
        } catch (err) {
            toast.error('An error occurred during handover');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReport = async () => {
        const reason = prompt("Describe the issue:");
        if (!reason) return;

        setActionLoading(true);
        try {
            const res = await reportViolation(batchId, reason);
            if (res.status === 'success') {
                toast.success('Violation reported to the blockchain');
                await refreshData();
            } else {
                toast.error(`Report failed: ${res.error}`);
            }
        } catch (err) {
            toast.error('An error occurred during reporting');
        } finally {
            setActionLoading(false);
        }
    };

    const ToggleButton = () => (
        (role === 'LOGISTICS' || role === 'RETAILER' || role === 'MANUFACTURER' || role === 'ADMIN') ? (
            <Button
                variant="outline"
                size="sm"
                className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur shadow-xl border-emerald-100 rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-6"
                onClick={() => setViewMode(viewMode === 'passport' ? 'logistics' : 'passport')}
            >
                <ArrowRightLeft className="mr-2 h-4 w-4 text-emerald-600" />
                Switch to {viewMode === 'passport' ? 'Logistics' : 'Passport'}
            </Button>
        ) : null
    );
    
    if (!batchDetails) return null;

    if (viewMode === 'logistics') {
        if (status.violation) {
            return (
                <div className="min-h-screen bg-destructive flex flex-col items-center justify-center p-6 text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                    <ToggleButton />
                    <Card className="bg-white/10 backdrop-blur-2xl p-12 rounded-[3rem] border-2 border-white/20 max-w-lg w-full shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] space-y-8 relative z-10">
                        <div className="bg-white rounded-3xl h-24 w-24 flex items-center justify-center mx-auto mb-4 shadow-2xl">
                            <AlertTriangle className="h-14 w-14 text-destructive animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-serif font-black italic mb-2 text-white tracking-tighter">STOP!</h1>
                            <h2 className="text-xl font-black opacity-90 uppercase tracking-widest">SLA Violation Detected</h2>
                        </div>
                        <div className="bg-black/20 p-6 rounded-2xl text-left border border-white/10 shadow-inner">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-2">Immutable Proof Details:</p>
                            <p className="text-lg font-serif font-black italic">{status.violation}</p>
                        </div>
                        <div className="pt-4 space-y-4">
                            <Button 
                                onClick={handleReport} 
                                disabled={actionLoading} 
                                className="w-full h-16 text-xs bg-white text-destructive hover:bg-white/90 font-black uppercase tracking-[0.2em] shadow-2xl rounded-2xl transition-all active:scale-95"
                            >
                                {actionLoading ? <Loader2 className="animate-spin" /> : 'Update Audit Log'}
                            </Button>
                        </div>
                    </Card>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-emerald-600 flex flex-col items-center justify-center p-6 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                <ToggleButton />
                <Card className="bg-white/10 backdrop-blur-2xl p-12 rounded-[3rem] border-2 border-white/20 max-w-lg w-full shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] space-y-8 relative z-10">
                    <div className="bg-white rounded-3xl h-24 w-24 flex items-center justify-center mx-auto mb-4 shadow-2xl">
                        <CheckCircle className="h-14 w-14 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-serif font-black italic mb-2 text-white tracking-tighter uppercase">Verified</h1>
                        <h2 className="text-xl font-black opacity-90 uppercase tracking-widest">Safe to Accept</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-6 text-left">
                        <div className="bg-black/10 p-5 rounded-2xl border border-white/5 shadow-inner">
                            <div className="flex items-center gap-2 mb-2 opacity-60">
                                <ShieldCheck className="h-4 w-4" />
                                <span className="text-[9px] uppercase font-black tracking-widest">Quality</span>
                            </div>
                            <p className="text-lg font-serif font-black italic">Confirmed</p>
                        </div>
                        <div className="bg-black/10 p-5 rounded-2xl border border-white/5 shadow-inner">
                            <div className="flex items-center gap-2 mb-2 opacity-60">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-[9px] uppercase font-black tracking-widest">IoT Data</span>
                            </div>
                            <p className="text-lg font-serif font-black italic">Optimal</p>
                        </div>
                    </div>
                    <div className="pt-6">
                        <Button 
                            onClick={handleAccept} 
                            disabled={actionLoading} 
                            className="w-full h-20 text-xs bg-white text-emerald-800 hover:bg-white/90 font-black uppercase tracking-[0.2em] shadow-2xl rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-95"
                        >
                            {actionLoading ? <Loader2 className="animate-spin" /> : <PackageCheck className="h-8 w-8" />}
                            Accept Handover
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-32">
            <ToggleButton />
            
            <div className="bg-slate-900 text-white py-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 scale-150">
                    <ShieldCheck size={300} />
                </div>
                <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
                    <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl px-6 py-2.5 rounded-full border border-white/10 mb-4 transition-all hover:bg-white/10">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-50">Global FoodTech Certified Bridge</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif font-black italic tracking-tighter leading-[0.8] mb-4">
                        Verified {batchDetails.product_type?.replace(/_/g, ' ')}
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
                            <span className="text-primary">ORIGIN:</span>
                            <span className="text-white">{batchDetails.origin_country}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
                            <span className="text-primary">BATCH:</span>
                            <span className="font-mono text-white">#{batchId.substring(0, 8).toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-3xl -mt-12 space-y-12 p-4 md:p-6 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {batchDetails.trust_metrics?.map((metric, idx) => (
                        <TrustMetricBadge key={idx} {...metric} />
                    ))}
                </div>

                <Tabs defaultValue="journey" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-16 p-2 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                        <TabsTrigger value="journey" className="rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg">Verification Journey</TabsTrigger>
                        <TabsTrigger value="purity" className="rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg">Technical Purity</TabsTrigger>
                    </TabsList>

                    <TabsContent value="journey" className="pt-10 space-y-8">
                        <Card className="p-2 border-slate-100 shadow-2xl bg-white rounded-[3rem] overflow-hidden">
                            <RouteMapDynamic
                                events={batchDetails.history || []}
                                originCountry={batchDetails.origin_country}
                                destinationCountry={batchDetails.destination_country}
                                height="450px"
                            />
                        </Card>

                        <Card className="p-10 border-slate-100 shadow-2xl bg-white rounded-[3rem] relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.02] rotate-12">
                                <ArrowRightLeft size={150} />
                            </div>
                            <h3 className="text-2xl font-serif font-black italic text-slate-900 mb-10 flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                    <ArrowRightLeft size={20} />
                                </div>
                                Chain of Custody
                            </h3>
                            <JourneyTimeline events={batchDetails.history || []} />
                        </Card>
                    </TabsContent>

                    <TabsContent value="purity" className="pt-10 space-y-8">
                        <Card className="p-10 border-slate-100 shadow-2xl bg-white rounded-[3rem]">
                            <h3 className="text-2xl font-serif font-black italic text-slate-900 mb-8 flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                    <FlaskConical size={20} />
                                </div>
                                Lab Analysis & Ingredients
                            </h3>
                            <div className="space-y-10">
                                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                                    <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Authenticated Ingredients</h4>
                                    <p className="text-xl font-serif font-black italic text-slate-800 leading-relaxed">
                                        {typeof batchDetails.ingredients === 'string'
                                            ? batchDetails.ingredients
                                            : (batchDetails.ingredients?.en || "Pure natural contents as verified by notarized certificates.")
                                        }
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {batchDetails && (
                    <MerchantFunnelCTA 
                        merchantName={batchDetails.manufacturer_name || "GFTB Official Partner"} 
                        redirectUrl={batchDetails.partner_redirect_url || "https://example.com/shop"}
                        productType={batchDetails.product_type?.replace(/_/g, ' ')}
                    />
                )}

                {(role === 'ADMIN' || role === 'MANUFACTURER') && (
                    <Card className="p-10 border-blue-100 shadow-2xl bg-blue-50/10 rounded-[3rem] mt-20">
                        <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.4em] mb-8 border-b border-blue-100 pb-4 italic">Security Infrastructure Controls</h3>
                        <BlockchainControls
                            batchId={batchId}
                            blockchainStatus={status}
                            onRefresh={refreshData}
                        />
                    </Card>
                )}

                <div className="text-center pt-20">
                    <div className="inline-flex items-center gap-3 opacity-20 grayscale transition-all hover:opacity-100 hover:grayscale-0">
                        <ShieldCheck className="h-5 w-5 text-emerald-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">GFTB Trust Protocol v2.5</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
