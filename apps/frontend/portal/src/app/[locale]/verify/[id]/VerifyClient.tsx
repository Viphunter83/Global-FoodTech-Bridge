'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    getBlockchainStatus, 
    getTelemetry, 
    getBlockchainHistory, 
    BlockchainStatus, 
    Telemetry, 
    BlockchainEvent, 
    BatchDetails 
} from '@/lib/api';
import { 
    Loader2, 
    CheckCircle, 
    ShieldCheck, 
    Thermometer, 
    Leaf, 
    ShoppingCart 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { BlockchainProof } from '@/components/blockchain/BlockchainProof';
import { BlockchainHistory } from '@/components/blockchain/BlockchainHistory';
import { useTranslations, useLocale } from 'next-intl';
import { SustainabilitySection } from '@/components/passport/SustainabilitySection';

const TelemetryChart = dynamic<{ data: Telemetry[] }>(
    () => import('@/components/charts/TelemetryChart'),
    { ssr: false, loading: () => <div className="h-40 w-full bg-gray-50 animate-pulse rounded-md" /> }
);

interface VerifyClientProps {
    batchId: string;
    initialBatch: BatchDetails;
    initialStatus: BlockchainStatus;
    initialTelemetry: Telemetry[];
    initialHistory: BlockchainEvent[];
}

export function VerifyClient({ 
    batchId, 
    initialBatch, 
    initialStatus, 
    initialTelemetry, 
    initialHistory 
}: VerifyClientProps) {
    const t = useTranslations('Tracking');
    const locale = useLocale();
    const [batch, setBatch] = useState<BatchDetails>(initialBatch);
    const [status, setStatus] = useState<BlockchainStatus>(initialStatus);
    const [telemetry, setTelemetry] = useState<Telemetry[]>(initialTelemetry);
    const [bcHistory, setBcHistory] = useState<BlockchainEvent[]>(initialHistory);

    // Refresh data periodically for live tracking
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const [bcData, telemData, historyData] = await Promise.all([
                    getBlockchainStatus(batchId),
                    getTelemetry(batchId),
                    getBlockchainHistory(batchId)
                ]);
                setStatus(bcData);
                setTelemetry(telemData);
                setBcHistory(historyData);
            } catch (error) {
                console.warn("Silent refresh failed:", error);
            }
        }, 15000);
        return () => clearInterval(interval);
    }, [batchId]);

    if (!status || !status.verified || !batch) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                <ShieldCheck className="h-20 w-20 text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800">{t('not_verified_title')}</h1>
                <p className="text-gray-500">{t('not_verified_desc')}</p>
            </div>
        );
    }

    const displayMetrics = batch.trust_metrics || [
        { label: t('metric_carbon'), value: '1.2 kg', icon: <Leaf className="h-5 w-5" />, color: 'bg-blue-100 text-blue-600' },
        { label: t('metric_authenticity'), value: t('bc_secured_value'), icon: <ShieldCheck className="h-5 w-5" />, color: 'bg-purple-100 text-purple-600' }
    ];

    const marketingStoryRaw = (batch as any).marketing_story?.[locale] || (batch as any).marketing_story?.en || (batch as any).marketing_story || "";
    const marketingStory = typeof marketingStoryRaw === 'string' ? marketingStoryRaw : "";

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* HERO SECTION */}
            <div className="bg-gradient-to-b from-green-600 to-green-500 text-white p-8 rounded-b-[3rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                    <ShieldCheck size={200} />
                </div>
                <div className="max-w-md mx-auto text-center space-y-4 relative z-10">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-white/20 backdrop-blur-md rounded-full p-2 w-fit mx-auto border border-white/30"
                    >
                        <div className="bg-white text-green-600 rounded-full p-3 shadow-lg">
                            <CheckCircle className="h-10 w-10" />
                        </div>
                    </motion.div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">{t('authentic_product')}</h1>
                        <p className="opacity-90 font-medium text-lg mt-1">{t('gftb_verified')}</p>
                    </div>
                    <div className="flex justify-center gap-2 text-sm font-mono opacity-75">
                        <span>ID: {batch.id.substring(0, 8)}...</span>
                        <span>•</span>
                        <span>{t('network_polygon')}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 -mt-8 space-y-6 relative z-20">
                {/* 1. PRODUCT CARD */}
                <Card className="shadow-lg border-0 overflow-hidden rounded-[2rem] bg-white">
                    <div className="h-1.5 w-full bg-gradient-to-r from-green-400 to-emerald-600" />
                    <CardContent className="p-8 space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{t('digital_passport_label')}</p>
                                <h2 className="text-2xl font-serif font-black italic text-gray-900 tracking-tighter">{batch.product_type?.replace(/_/g, ' ') || t('fallback_food_product')}</h2>
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">#{batch.id.substring(0, 12)}</p>
                            </div>
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-[9px] font-black italic tracking-tighter">
                                {t('premium_grade_badge')}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                            {displayMetrics.slice(0, 2).map((metric: any, i: number) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`${metric.color || 'bg-gray-100 text-gray-600'} p-2.5 rounded-xl shadow-inner`}>
                                        {metric.icon || <ShieldCheck className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase text-gray-400 font-black tracking-wider">{String(metric.label)}</p>
                                        <p className="font-serif font-black italic text-sm text-gray-800">
                                            {typeof metric.value === 'string' ? metric.value : JSON.stringify(metric.value)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 1.5 SUSTAINABILITY & QUALITY */}
                <SustainabilitySection 
                    marketingStory={marketingStory} 
                    certificates={batch.certificates}
                    productType={batch.product_type}
                />

                {/* 1.6 PURCHASE CTA */}
                {batch.partner_redirect_url && (
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <button 
                            onClick={() => window.open(batch.partner_redirect_url || '#', '_blank')}
                            className="w-full bg-slate-900 text-white h-20 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-4 transition-all"
                        >
                            <ShoppingCart size={22} className="text-primary" />
                            {t('order_now_cta')}
                        </button>
                    </motion.div>
                )}

                {/* 2. BLOCKCHAIN JOURNEY */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2 italic">{t('immutable_timeline')}</h3>
                    <BlockchainHistory history={bcHistory} />
                </div>

                {/* 3. TEMPERATURE PROOF */}
                <Card className="shadow-lg border-0 bg-white rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-8">
                        <h3 className="font-serif font-black italic text-gray-900 mb-6 flex items-center justify-between">
                            <span className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                                    <Thermometer size={20} />
                                </div>
                                {t('cold_chain_proof')}
                            </span>
                            <span className="flex items-center gap-1.5 text-[9px] bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-black uppercase tracking-widest">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                {t('live_iot_label')}
                            </span>
                        </h3>
                        <div className="h-48 w-full">
                            <TelemetryChart data={telemetry} />
                        </div>
                        <p className="text-[9px] text-gray-400 mt-6 text-center font-black uppercase tracking-widest opacity-40">
                            Verified by Tive™ IoT Sensors & Polygon Blockchain
                        </p>
                    </CardContent>
                </Card>

                {/* 4. BLOCKCHAIN PROOF & TRANSPARENCY */}
                <BlockchainProof 
                    batchId={batchId}
                    txHash={status.txHash}
                    dataHash={batch.token_uri?.replace('ipfs://', '')}
                    issuer={batch.manufacturer_id}
                    timestamp={new Date(batch.created_at).toLocaleString()}
                    violation={status.violation || undefined}
                />

                <div className="text-center pb-20 pt-8 space-y-4">
                    <div className="flex justify-center gap-8 opacity-20 grayscale grayscale-100 scale-90">
                         <ShieldCheck className="h-8 w-8" />
                         <Leaf className="h-8 w-8" />
                         <CheckCircle className="h-8 w-8" />
                    </div>
                    <p className="text-[9px] text-gray-400 uppercase tracking-[0.4em] font-black italic">
                        Powered by Global FoodTech Bridge
                    </p>
                </div>
            </div>
        </div>
    );
}
