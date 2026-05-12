'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Package, 
    Truck, 
    AlertTriangle, 
    ShieldCheck, 
    ArrowRight, 
    Globe, 
    Zap, 
    TrendingUp, 
    Activity,
    Plus,
    LayoutDashboard,
    ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { BatchDetails, reportViolation, advanceBatchDemo } from '@/lib/api';
import { Link } from '@/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { refreshAdminData } from '@/app/actions';
import { auth } from '@/lib/firebase';

interface AdminDashboardProps {
    batches: BatchDetails[];
}

export function AdminDashboard({ batches }: AdminDashboardProps) {
    const t = useTranslations('Admin');

    const totalBatches = batches.length;
    const activeShipments = batches.filter(b => b.history?.some(h => h.status === 'current')).length || 0;
    const compliantBatches = batches.filter(b => b.history?.every(h => h.is_compliant !== false)).length || 0;
    const violations = totalBatches - compliantBatches;

    // Premium KPIs
    const stats = [
        { 
            label: t('total_value_secured'), 
            value: `$${(totalBatches * 12500).toLocaleString()}`, 
            icon: ShieldCheck, 
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        },
        { 
            label: t('active_batches_kpi'), 
            value: totalBatches.toString(), 
            icon: Package, 
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        { 
            label: t('compliance_rate'), 
            value: `${totalBatches > 0 ? Math.round((compliantBatches / totalBatches) * 100) : 100}%`, 
            icon: Activity, 
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
        },
        { 
            label: t('live_violations'), 
            value: violations.toString(), 
            icon: AlertTriangle, 
            color: 'text-destructive',
            bg: 'bg-destructive/10'
        }
    ];

    const [isDemoLoading, setIsDemoLoading] = useState<string | null>(null);

    const handleSimulateViolation = async () => {
        const latestBatch = batches[0];
        if (!latestBatch) return;

        setIsDemoLoading('violation');
        
        try {
            const token = await auth.currentUser?.getIdToken();
            const promise = reportViolation(latestBatch.id, "Demo: Artificial temperature excursion recorded (+24°C)", token);
            
            toast.promise(promise, {
                loading: 'Reporting violation...',
                success: (data) => {
                    refreshAdminData();
                    return `Violation Notarized: ${data.txHash?.slice(0, 10) || 'Confirmed'}...`;
                },
                error: (err) => `Error: ${err.message}`
            });

            await promise;
        } catch (err: any) {
            toast.error(`Auth Error: ${err.message}`);
        } finally {
            setIsDemoLoading(null);
        }
    };

    const handleRapidHandover = async () => {
        const latestBatch = batches[0];
        if (!latestBatch) return;

        setIsDemoLoading('handover');
        
        try {
            const token = await auth.currentUser?.getIdToken();
            const promise = advanceBatchDemo(latestBatch.id, 'LOGISTICS', token);

            toast.promise(promise, {
                loading: 'Processing handover...',
                success: (data) => {
                    refreshAdminData();
                    return `Handover complete: ${data.txHash?.slice(0, 10) || 'Confirmed'}...`;
                },
                error: (err) => `Error: ${err.message}`
            });

            await promise;
        } catch (err: any) {
            toast.error(`Auth Error: ${err.message}`);
        } finally {
            setIsDemoLoading(null);
        }
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <div className="flex items-center gap-4 mb-3">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <LayoutDashboard size={24} />
                        </div>
                        <h1 className="text-4xl font-serif font-black italic tracking-tighter text-foreground uppercase">
                            {t('command_center')}
                        </h1>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 italic">
                        {t('global_ops_subtitle')}
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <Link href="/batches/new">
                        <Button className="h-14 px-8 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95">
                            <Plus className="w-4 h-4 mr-3" aria-hidden="true" />
                            {t('create_global_batch')}
                        </Button>
                    </Link>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="rounded-[2.5rem] border-primary/5 glass overflow-hidden hover:shadow-2xl transition-all duration-500 group">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl group-hover:scale-110 transition-transform`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <TrendingUp size={16} className="text-emerald-500 opacity-20" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-3xl font-serif font-black italic tracking-tighter text-foreground">
                                        {stat.value}
                                    </p>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
                                        {stat.label}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main Operations Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Batches Ledger */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-xl font-serif font-black italic tracking-tight flex items-center gap-3">
                            <Zap className="text-primary" size={20} aria-hidden="true" />
                            {t('recent_ledger_activity')}
                        </h2>
                        <Link href="/admin/operations" className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline">
                            {t('view_all_operations')}
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {batches.length === 0 ? (
                            <Card className="rounded-[3rem] border-dashed border-primary/10 p-20 flex flex-col items-center justify-center text-center glass">
                                <Package className="w-16 h-16 text-primary/10 mb-6" />
                                <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/30">{t('no_active_batches')}</p>
                            </Card>
                        ) : (
                            batches.slice(0, 5).map((batch, idx) => (
                                <motion.div
                                    key={batch.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + (idx * 0.1) }}
                                >
                                    <Card className="rounded-[2rem] border-primary/5 glass hover:shadow-xl transition-all group overflow-hidden">
                                        <CardContent className="p-0">
                                            <div className="flex items-center p-6 gap-6">
                                                <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 group-hover:bg-primary/5 transition-colors">
                                                    <Package className="text-slate-400 group-hover:text-primary transition-colors" size={24} />
                                                </div>
                                                
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="text-sm font-serif font-black italic text-foreground truncate">
                                                            Batch #{batch.id.slice(0, 8).toUpperCase()}
                                                        </h3>
                                                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border-primary/10">
                                                            {batch.product_type}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                                                        <span className="flex items-center gap-1.5">
                                                            <Globe size={10} />
                                                            {batch.origin_country} → {batch.destination_country}
                                                        </span>
                                                        <span className="h-1 w-1 rounded-full bg-slate-200" />
                                                        <span>{new Date(batch.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>

                                                <div className="hidden md:flex items-center gap-10 px-10">
                                                    <div className="text-right">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30 mb-1">{t('status_label')}</p>
                                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t('status_in_transit')}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30 mb-1">{t('trust_label')}</p>
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <div key={s} className="h-3 w-1 rounded-full bg-emerald-500/40" />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <Link href={`/batches/${batch.id}`}>
                                                    <Button size="icon" variant="ghost" className="rounded-xl hover:bg-primary/5 hover:text-primary transition-all">
                                                        <ArrowRight size={20} />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-8">
                    {/* Demo Controller Card */}
                    <Card className="rounded-[3rem] bg-slate-900 text-white border-0 shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Zap size={120} />
                        </div>
                        <CardHeader className="p-10 relative z-10">
                            <CardTitle className="text-2xl font-serif font-black italic tracking-tighter text-blue-400">{t('demo_engine_title')}</CardTitle>
                            <CardDescription className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                                {t('demo_engine_desc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 pt-0 relative z-10 space-y-4">
                            <Button 
                                onClick={handleSimulateViolation}
                                disabled={isDemoLoading !== null}
                                className="w-full h-14 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest justify-start px-6 group"
                            >
                                <Activity className={`mr-4 text-emerald-500 ${isDemoLoading === 'violation' ? 'animate-spin' : 'group-hover:animate-pulse'}`} size={18} />
                                {isDemoLoading === 'violation' ? t('notarizing') : t('simulate_violation')}
                            </Button>
                            <Button 
                                onClick={handleRapidHandover}
                                disabled={isDemoLoading !== null}
                                className="w-full h-14 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest justify-start px-6 group"
                            >
                                <Truck className={`mr-4 text-blue-400 ${isDemoLoading === 'handover' ? 'animate-bounce' : ''}`} size={18} />
                                {isDemoLoading === 'handover' ? t('processing') : t('rapid_handover')}
                            </Button>
                            <div className="pt-4 mt-4 border-t border-white/5">
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-4 italic">
                                    {t('demo_custodial_note')}
                                </p>
                                <Link href="/admin/demo">
                                    <Button className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">
                                        {t('launch_stage_wizard')}
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Network Health Summary */}
                    <Card className="rounded-[3rem] border-primary/5 glass p-10 space-y-8">
                        <div className="space-y-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">{t('network_pulse')}</h3>
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                                <span className="text-sm font-serif font-black italic">{t('polygon_active')}</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{t('gas_level')}</span>
                                <span className="text-[10px] font-mono font-black text-emerald-500">42.5 MATIC</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full w-4/5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                            </div>
                        </div>

                        <Button variant="outline" className="w-full h-12 rounded-xl border-primary/10 text-[9px] font-black uppercase tracking-widest">
                            <ExternalLink size={14} className="mr-2 opacity-40" aria-hidden="true" />
                            {t('block_explorer')}
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
