'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ShieldCheck, ThermometerSnowflake, AlertTriangle, Leaf, Award } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ProductHeroProps {
    productName: string;
    batchId: string;
    status: 'Verified' | 'Warning' | 'Pending';
    trustMetrics?: {
        type: 'purity' | 'temperature' | 'carbon' | 'organic' | 'nutrition' | 'origin';
        label: string;
        value: string;
        source: 'Blockchain' | 'IoT' | 'Lab Report';
        status: 'verified' | 'warning' | 'pending';
    }[];
}

export function ProductHero({ productName, batchId, status, trustMetrics }: ProductHeroProps) {
    const t = useTranslations('Tracking');
    const tBatch = useTranslations('Batch');

    const getMetricIcon = (type: string) => {
        switch (type) {
            case 'temperature': return <ThermometerSnowflake className="text-blue-400" size={20} />;
            case 'purity': return <Leaf className="text-emerald-400" size={20} />;
            case 'origin': return <Award className="text-amber-400" size={20} />;
            case 'carbon': return <CheckCircle className="text-sky-400" size={20} />;
            default: return <ShieldCheck className="text-emerald-400" size={20} />;
        }
    };

    const getMetricColor = (type: string) => {
        switch (type) {
            case 'temperature': return 'bg-blue-500/10 border-blue-500/20';
            case 'purity': return 'bg-emerald-500/10 border-emerald-500/20';
            case 'origin': return 'bg-amber-500/10 border-amber-500/20';
            default: return 'bg-white/5 border-white/10';
        }
    };

    // Fallback metrics if none provided
    const displayMetrics = trustMetrics || [
        { type: 'temperature', label: t('metric_cold_chain'), value: t('metric_optimal'), source: 'IoT' as const, status: 'verified' as const },
        { type: 'origin', label: t('metric_origin'), value: t('metric_traceable'), source: 'Blockchain' as const, status: 'verified' as const }
    ];

    return (
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-10 md:p-14 text-white shadow-2xl border border-white/5 group">
            {/* Dynamic Ambient Background */}
            <div className={`absolute -right-20 -top-20 h-96 w-96 rounded-full blur-3xl filter transition-all duration-1000 ${status === 'Verified' ? 'bg-emerald-500/20 group-hover:scale-125' : 'bg-destructive/20 group-hover:scale-125'}`} />
            <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl filter group-hover:scale-110 transition-transform duration-[3000ms]" />

            <div className="relative z-10 flex flex-col items-center text-center">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Badge variant={status === 'Verified' ? 'default' : 'destructive'}
                        className={`mb-10 px-6 py-2 text-[10px] font-black tracking-[0.3em] uppercase border-0 shadow-2xl ${
                            status === 'Verified' 
                                ? 'bg-emerald-500 text-white shadow-emerald-500/40' 
                                : 'bg-red-500 text-white shadow-red-500/40'
                        }`}>
                        <span className="flex items-center gap-3">
                            {status === 'Verified' ? (
                                <><ShieldCheck size={16} /> {t('bc_secured_badge')}</>
                            ) : (
                                <><AlertTriangle size={16} /> {t('qc_rejected_title')}</>
                            )}
                        </span>
                    </Badge>
                </motion.div>

                <h1 className="mb-6 text-5xl md:text-8xl font-serif font-black italic tracking-tighter text-white leading-[0.9] drop-shadow-2xl">
                    {productName}
                </h1>
                
                <div className="mb-14 flex items-center gap-3 px-5 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md shadow-xl">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{tBatch('form_manufacturer_id')}</span>
                    <div className="h-1 w-1 rounded-full bg-blue-500" />
                    <span className="font-mono text-xs font-bold text-blue-400 uppercase tracking-widest">{batchId}</span>
                </div>

                <div className="grid w-full max-w-4xl grid-cols-1 sm:grid-cols-2 gap-6">
                    {displayMetrics.map((metric, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (idx * 0.1), duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            whileHover={{ y: -6, backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' }}
                            className={`flex items-center gap-6 rounded-[2rem] p-6 backdrop-blur-xl border transition-all shadow-xl ${getMetricColor(metric.type)}`}
                        >
                            <div className="flex-shrink-0 rounded-2xl bg-white/5 p-4 border border-white/10 shadow-inner">
                                {getMetricIcon(metric.type)}
                            </div>
                            <div className="text-left space-y-1">
                                <div className="text-xl font-serif font-black italic text-white leading-none tracking-tight">{metric.value}</div>
                                <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                    {metric.label} 
                                    <div className="h-0.5 w-0.5 rounded-full bg-blue-400" />
                                    <span className="text-blue-400">{metric.source}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
