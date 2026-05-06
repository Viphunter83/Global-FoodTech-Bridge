'use client';

import dynamic from 'next/dynamic';

const TemperatureChart = dynamic(
    () => import('@/components/charts/TemperatureChart').then((mod) => mod.TemperatureChart),
    { ssr: false, loading: () => <div className="h-80 w-full bg-primary/5 animate-pulse rounded-3xl" /> }
);
const LiveMap = dynamic(
    () => import('@/components/maps/LiveMap'),
    { ssr: false, loading: () => <div className="h-80 w-full bg-primary/5 animate-pulse rounded-3xl" /> }
);
import { Link } from '@/navigation';
import { ArrowLeft, ShieldCheck, MapPin, Thermometer, AlertTriangle, RefreshCw, Search, Box, Fingerprint } from 'lucide-react';
import { DashboardQR } from '@/components/shared/DashboardQR';
import { BlockchainControls } from '@/components/blockchain/BlockchainControls';
import { motion } from 'framer-motion';
import { AuditReportModal } from '@/components/passport/AuditReportModal';
import { ProductHero } from '@/components/passport/ProductHero';
import { Image as ImageIcon, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useDemoState } from '@/components/providers/DemoStateProvider';
import { SustainabilitySection } from '@/components/passport/SustainabilitySection';
import { useState, useEffect, useCallback } from 'react';
import { 
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { BlockchainProof } from '@/components/blockchain/BlockchainProof';
import { MerchantDetailsCard } from '@/components/marketing/MerchantDetailsCard';
import { auth } from '@/lib/firebase';


interface BatchDetailsClientProps {
    batch: any;
    telemetry: any;
    blockchain: any;
    alerts: any[];
    bcHistory: any[];
}

export function BatchDetailsClient({ batch, telemetry: initialTelemetry, blockchain, alerts: initialAlerts, bcHistory }: BatchDetailsClientProps) {
    const t = useTranslations();
    const locale = useLocale();
    const { getBatchState, isInitialized } = useDemoState();
    const [mounted, setMounted] = useState(false);
    const [telemetry, setTelemetry] = useState(initialTelemetry);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const alerts = Array.isArray(initialAlerts) ? initialAlerts : [];

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchLatestTelemetry = useCallback(async () => {
        try {
            setIsRefreshing(true);
            const token = await auth.currentUser?.getIdToken();
            
            const res = await fetch(`/api/telemetry/${batch.id}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            
            if (res.status === 401) {
                console.warn('[GFTB-TELEMETRY] session expired, stopping polling');
                // Optional: trigger a re-login modal or toast
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setTelemetry(data);
            }
        } catch (error) {
            console.error('Failed to fetch live telemetry:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [batch.id]);

    // Implement Polling
    useEffect(() => {
        const interval = setInterval(fetchLatestTelemetry, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [fetchLatestTelemetry]);

    // hydration-safe state merging
    const clientState = getBatchState(batch.id);
    const effectiveBlockchain = (mounted && isInitialized && clientState) ? { ...blockchain, ...clientState } : blockchain;

    const isViolation = effectiveBlockchain.violation || alerts.length > 0;

    return (
        <div className="min-h-screen bg-background p-4 md:p-12 overflow-x-hidden">
            <div className="mx-auto max-w-6xl">
                <Link
                    href="/"
                    className="mb-12 inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 hover:text-primary transition-all group"
                >
                    <ArrowLeft className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    {t('Common.back_dashboard')}
                </Link>

                {/* Production Hardening: Real-time Indicators */}
                <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isViolation ? (
                        <div className="p-10 bg-destructive/5 border border-destructive/20 text-destructive rounded-[2.5rem] shadow-2xl shadow-destructive/10 flex items-center gap-8 animate-in zoom-in duration-700">
                            <div className="h-20 w-20 rounded-3xl bg-destructive/10 flex items-center justify-center text-5xl">⚠️</div>
                            <div>
                                <h2 className="text-3xl font-serif font-black uppercase tracking-tighter italic leading-none">{t('Tracking.qc_rejected_title')}</h2>
                                <p className="font-black text-[10px] uppercase tracking-[0.2em] mt-3 opacity-60 italic">{t('Tracking.qc_rejected_desc')}</p>
                            </div>
                        </div>
                    ) : (effectiveBlockchain.verified && (
                        <div className="p-10 bg-emerald-500/[0.03] border border-emerald-500/20 text-emerald-600 rounded-[2.5rem] shadow-2xl shadow-emerald-500/5 flex items-center gap-8 animate-in zoom-in duration-700">
                            <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-5xl">🛡️</div>
                            <div>
                                <h2 className="text-3xl font-serif font-black uppercase tracking-tighter italic leading-none">{t('Tracking.authenticity_verified_title')}</h2>
                                <p className="font-black text-[10px] uppercase tracking-[0.2em] mt-3 opacity-60 italic">{t('Tracking.authenticity_verified_desc')}</p>
                            </div>
                        </div>
                    ))}
                    
                    <div className="p-10 glass border-primary/10 rounded-[2.5rem] shadow-2xl flex flex-col justify-between group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-5">
                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${isRefreshing ? 'bg-primary/20 scale-110 shadow-lg shadow-primary/20' : 'bg-primary/10'}`}>
                                    <RefreshCw className={`h-7 w-7 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="font-serif font-black text-xl italic leading-none">{t('Tracking.live_tracking_active')}</h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{t('Tracking.polling_desc')}</p>
                                </div>
                            </div>
                            <div className="flex gap-1.5 pr-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" style={{ animationDelay: `${i * 300}ms` }} />
                                ))}
                            </div>
                        </div>
                        <div className="h-1 w-full bg-primary/5 rounded-full overflow-hidden mt-4">
                            <div className={`h-full bg-primary transition-all duration-10000 ease-linear ${isRefreshing ? 'w-0' : 'w-full'}`} />
                        </div>
                    </div>
                </div>

                {/* Product Hero Section */}
                <div className="mb-8">
                    <ProductHero 
                        productName={batch.product_type.replace('_', ' ')}
                        batchId={batch.id}
                        status={effectiveBlockchain.verified && !effectiveBlockchain.violation && alerts.length === 0 ? 'Verified' : (effectiveBlockchain.violation || alerts.length > 0 ? 'Warning' : 'Pending')}
                        trustMetrics={batch.trust_metrics}
                    />
                </div>

                {/* Merchant Sales Funnel */}
                <div className="mb-12">
                    <MerchantDetailsCard 
                        merchantName={batch.manufacturer_id?.toUpperCase() || t('Tracking.fallback_producer')}
                        redirectUrl={batch.partner_redirect_url}
                        description={batch.marketing_story?.[locale] || batch.marketing_story?.en}
                        badges={[
                            { label: t('Tracking.bc_secured_badge'), color: 'emerald' },
                            { label: t('Tracking.badge_fda_compliance'), color: 'emerald' },
                            { label: batch.product_type?.toUpperCase() || t('Tracking.fallback_premium'), color: 'secondary' },
                            ...(batch.certificates?.map((c: any) => ({ label: c.name || c, color: 'secondary' })) || [])
                        ]}
                    />
                </div>

                {/* Manufacturing Insight Section - NEW */}
                <div className="mb-12 rounded-[3rem] overflow-hidden border border-primary/10 glass bg-background/50 relative group">
                    <div className="grid md:grid-cols-2 gap-0">
                        <div className="relative aspect-video md:aspect-auto h-full overflow-hidden">
                            <Image 
                                src="/vietnam_mango_factory_premium_1778070839265.png" 
                                alt="Vietnam Factory" 
                                fill 
                                className="object-cover group-hover:scale-105 transition-transform duration-[3000ms]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent md:hidden" />
                        </div>
                        <div className="p-10 md:p-14 flex flex-col justify-center space-y-6">
                            <div className="flex items-center gap-3 text-primary mb-2">
                                <ImageIcon size={16} />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t('Tracking.mfg_insight_title')}</span>
                            </div>
                            <h2 className="text-4xl font-serif font-black italic tracking-tighter leading-tight">{t('Tracking.mfg_dehydration_title')}</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('Tracking.mfg_dehydration_desc')}
                            </p>
                            <div className="flex items-center gap-4 pt-4">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                    <CheckCircle size={12} />
                                    {t('Tracking.mfg_haccp_certified')}
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                                    <CheckCircle size={12} />
                                    {t('Tracking.mfg_iso_certified')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sustainability & Quality Proof Section - NEW */}
                <div className="mb-12">
                    <SustainabilitySection 
                        marketingStory={batch.marketing_story?.[locale] || batch.marketing_story?.en}
                        certificates={batch.certificates}
                        productType={batch.product_type}
                    />
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    
                    {/* IPFS Data Block: Ingredients & Certificates */}
                    <div className="col-span-3 rounded-[3rem] border border-primary/10 glass p-10 md:p-14 shadow-2xl shadow-primary/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12">
                            <Box size={200} />
                        </div>
                        
                        <div className="flex items-center mb-12 relative z-10">
                            <div className="mr-6 rounded-2xl bg-primary/10 p-4 text-primary shadow-inner">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-serif font-black italic text-foreground leading-tight tracking-tighter">{t('IPFS.section_title')}</h2>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <div className="h-1 w-1 rounded-full bg-primary/40" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{t('Tracking.ipfs_node_desc')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-16 md:grid-cols-2 relative z-10">
                            {/* Ingredients */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-px w-8 bg-primary/20" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">{t('Batch.ingredients')}</h3>
                                </div>
                                <div className="rounded-[2rem] bg-background/40 backdrop-blur-md border border-primary/5 p-8 text-xl font-medium text-foreground shadow-inner italic leading-relaxed text-balance">
                                    {typeof batch.ingredients === 'string' ? (
                                        <p>{batch.ingredients}</p>
                                    ) : (
                                        <p>{batch.ingredients?.[locale] || batch.ingredients?.en}</p>
                                    )}
                                </div>
                            </div>

                            {/* Dates & Certificates */}
                            <div className="space-y-12">
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="group space-y-3">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">{t('Batch.production_date')}</h3>
                                        <p className="font-serif text-3xl font-black italic text-foreground mt-2 group-hover:text-primary transition-all duration-500">
                                            {batch.production_date ? new Date(batch.production_date).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="group space-y-3">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">{t('Batch.expiration_date')}</h3>
                                        <p className="font-serif text-3xl font-black italic text-foreground mt-2 group-hover:text-primary transition-all duration-500">
                                            {batch.expiration_date ? new Date(batch.expiration_date).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-10">
                                    {batch.production_location && (
                                        <div className="space-y-2">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">{t('Batch.production_location')}</h3>
                                            <p className="text-sm font-black uppercase tracking-widest text-foreground">{batch.production_location}</p>
                                        </div>
                                    )}
                                    {batch.origin_location && (
                                        <div className="space-y-2">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">{t('Batch.origin_location')}</h3>
                                            <p className="text-sm font-black uppercase tracking-widest text-foreground">{batch.origin_location}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">{t('IPFS.certificates_header')}</h3>
                                    {batch.certificates && batch.certificates.length > 0 ? (
                                        <div className="flex flex-wrap gap-4">
                                            {batch.certificates.map((cert: any, idx: number) => (
                                                <a
                                                    key={idx}
                                                    href={cert.uri}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group inline-flex items-center px-6 py-4 glass border border-primary/10 shadow-xl shadow-primary/5 text-xs font-black uppercase tracking-widest rounded-2xl text-primary hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95"
                                                >
                                                    <Box size={14} className="mr-3 group-hover:rotate-12 transition-transform" />
                                                    {cert.name}
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/30 italic">{t('IPFS.no_documents')}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Alerts Banner */}
                    {alerts.length > 0 && (
                        <div className="col-span-3 rounded-[2.5rem] border border-destructive/20 bg-destructive/5 p-8 animate-in fade-in slide-in-from-top-4 duration-700 shadow-2xl shadow-destructive/10">
                            <div className="flex items-start gap-6">
                                <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
                                    <AlertTriangle className="h-8 w-8" aria-hidden="true" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-serif font-black italic uppercase tracking-tighter text-destructive leading-tight">{t('Compliance.sla_violations_title')}</h3>
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {alerts.slice(0, 4).map((alert: any) => (
                                            <div key={alert.id} className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-destructive/10 shadow-sm group hover:border-destructive/30 transition-colors">
                                                <div className="h-2 w-2 rounded-full bg-destructive/40 group-hover:bg-destructive transition-colors shrink-0" />
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-destructive/40 mb-0.5">{new Date(alert.created_at).toLocaleTimeString()}</span>
                                                    <span className="text-xs font-bold text-destructive/80 leading-tight uppercase tracking-tight">{alert.message}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Temperature Chart */}
                    <div className="col-span-3 md:col-span-2 rounded-[3rem] border border-primary/10 bg-background p-10 shadow-2xl shadow-primary/5">
                        <div className="mb-12 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                    <Thermometer className="h-8 w-8" />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-serif font-black italic text-foreground leading-tight tracking-tighter">{t('Tracking.temp_title')}</h2>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <div className="h-1 w-1 rounded-full bg-primary/40" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{t('Tracking.temp_desc')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-[2rem] bg-muted/5 p-6 border border-primary/5">
                            <TemperatureChart 
                                data={telemetry} 
                                minLimit={batch.min_temp ?? -22} 
                                maxLimit={batch.max_temp ?? -18} 
                            />
                        </div>
                    </div>

                    {/* Integrity Vault - Moved out for better layout */}
                    <div className="col-span-3 rounded-[3rem] border border-primary/10 glass p-10 md:p-14 shadow-2xl shadow-primary/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:rotate-6 transition-transform duration-1000">
                            <ShieldCheck size={240} />
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-primary mb-2">
                                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t('Blockchain.real_time_notary')}</span>
                                </div>
                                <h2 className="text-5xl font-serif font-black italic tracking-tighter">{t('Blockchain.integrity_vault')}</h2>
                            </div>
                            
                            <AuditReportModal 
                                batch={batch}
                                bcHistory={bcHistory}
                                telemetry={telemetry}
                                alerts={alerts}
                            />
                        </div>
                    </div>

                    {/* Sidebar components */}
                    <div className="col-span-3 md:col-span-1 space-y-10">
                        {/* Map Interface */}
                        <div className="rounded-[2.5rem] border border-primary/10 glass p-8 shadow-2xl shadow-primary/5 overflow-hidden group">
                            <div className="mb-8 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <h2 className="font-serif font-black italic text-xl tracking-tight text-foreground">{t('Tracking.location_tracking_title')}</h2>
                            </div>
                            <div className="relative overflow-hidden rounded-[2rem] aspect-square flex items-center justify-center bg-background/50 border border-primary/5 shadow-inner">
                                <LiveMap telemetry={telemetry} height="100%" />
                            </div>
                        </div>

                        {/* Blockchain Status Card */}
                        <div className="rounded-[2.5rem] border border-primary/10 glass p-8 shadow-2xl shadow-primary/5">
                            <h2 className="mb-8 font-serif font-black italic text-xl tracking-tight text-foreground flex items-center gap-4">
                                <ShieldCheck className="h-6 w-6 text-primary" />
                                {t('Tracking.bc_validation_title')}
                            </h2>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Fingerprint size={12} className="text-primary/40" />
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">{t('Tracking.tx_hash_label')}</p>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <p className="break-all font-mono text-[11px] font-bold text-primary bg-primary/[0.03] p-5 rounded-2xl border border-primary/10 shadow-inner leading-relaxed overflow-hidden">
                                            {effectiveBlockchain.txHash || t('Tracking.pending_consensus')}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="pt-8 border-t border-primary/5">
                                    <BlockchainControls
                                        batchId={batch.id}
                                        blockchainStatus={effectiveBlockchain}
                                        onRefresh={fetchLatestTelemetry}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* QR / Share */}
                        <div className="rounded-[2.5rem] border border-primary/10 glass p-8 shadow-2xl shadow-primary/5 flex flex-col items-center justify-center gap-6">
                            <div className="p-4 bg-white rounded-3xl shadow-xl shadow-primary/5">
                                <DashboardQR batchId={batch.id} partnerRedirectUrl={batch.partner_redirect_url} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">{t('Common.scan_share')}</p>
                        </div>
                    </div>

                    {/* Shipping Timeline - Dynamic from Blockchain History */}
                    {bcHistory && bcHistory.length > 0 && (
                        <div className="col-span-3 rounded-[3rem] border border-primary/10 glass p-10 md:p-14 shadow-2xl shadow-primary/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:rotate-6 transition-transform duration-1000">
                                <MapPin size={240} />
                            </div>
                            
                            <h2 className="mb-14 text-4xl font-serif font-black italic text-foreground tracking-tighter relative z-10">📦 {t('Tracking.logistics_flow_integrity')}</h2>
                            
                            <div className="relative z-10 pl-4 md:pl-0">
                                {/* Connector Line (Desktop) */}
                                <div className="absolute top-[28px] left-[20px] right-[20px] h-[2px] bg-primary/5 hidden md:block" />
                                {/* Connector Line (Mobile) */}
                                <div className="absolute left-[20px] top-[28px] bottom-0 w-[2px] bg-primary/5 md:hidden" />
                                
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-8">
                                    {bcHistory.map((step, index) => (
                                        <div key={index} className="relative flex flex-col md:items-center text-left md:text-center pl-12 md:pl-0 group/step">
                                            {/* Dot */}
                                            <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-0 w-10 h-10 rounded-2xl border-2 flex items-center justify-center z-10 transition-all duration-700 bg-primary border-primary shadow-xl shadow-primary/20 scale-110">
                                                <ShieldCheck className="h-5 w-5 text-white" />
                                            </div>

                                            <div className="mt-2 md:mt-16 space-y-2">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-primary">
                                                    {step.stage}
                                                </h3>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-primary/30">Verified Timestamp</span>
                                                    <p className="font-mono text-[10px] font-bold text-primary/60 italic leading-none">
                                                        {new Date(step.timestamp).toLocaleString()}
                                                    </p>
                                                    <p className="text-[9px] text-muted-foreground/60 mt-1 max-w-[150px] mx-auto">
                                                        {step.details}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Placeholder for future steps if only few history events exist */}
                                    {bcHistory.length < 3 && (
                                        <div className="relative flex flex-col md:items-center text-left md:text-center pl-12 md:pl-0 opacity-30">
                                            <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-0 w-10 h-10 rounded-2xl border-2 border-primary/10 flex items-center justify-center z-10">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary/20" />
                                            </div>
                                            <div className="mt-2 md:mt-16">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">{t('Tracking.timeline_arrived_destination')}</h3>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Sticky Mobile/Desktop CTA - NEW */}
            {batch.partner_redirect_url && (
                <motion.div 
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg"
                >
                    <Button 
                        asChild
                        className="w-full h-20 rounded-[2.5rem] bg-foreground text-background hover:bg-foreground/90 font-black text-xl shadow-2xl shadow-black/20 group/sticky overflow-hidden"
                    >
                        <a href={batch.partner_redirect_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-10">
                            <div className="flex flex-col items-start">
                                <span className="text-[10px] uppercase tracking-[0.3em] opacity-50 leading-none mb-1">{t('Tracking.bc_secured_badge')}</span>
                                <span>{t('Tracking.btn_buy_direct')}</span>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-background/10 flex items-center justify-center group-hover/sticky:translate-x-2 transition-transform">
                                <ArrowRight size={24} />
                            </div>
                        </a>
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
