'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RailwayService, InfrastructureStatus as InfrastructureStatusType } from '@/lib/railway';
import { Activity, Server, Database, Globe, RefreshCw, CheckCircle2, AlertCircle, Clock, Zap, Cpu, HardDrive, ExternalLink, Radio } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

interface InfrastructureStatusProps {
    data: InfrastructureStatusType[];
    onRefresh?: () => void;
}

export function InfrastructureStatus({ data, onRefresh }: InfrastructureStatusProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [lastSync, setLastSync] = useState<Date>(new Date());
    const t = useTranslations('Admin');
    const locale = useLocale();

    useEffect(() => {
        setLastSync(new Date());
    }, [data]);

    // Implementation of Auto-Refresh (Live Data)
    useEffect(() => {
        if (!onRefresh) return;

        const intervalId = setInterval(() => {
            console.log('[GFTB-MONITOR] Auto-refreshing infrastructure data...');
            onRefresh();
        }, 60000); // Every 60 seconds

        return () => clearInterval(intervalId);
    }, [onRefresh]);

    // Fix: Move the null check to the top to prevent flatMap crash
    if (!data || data.length === 0) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-20 rounded-[3rem] border border-dashed border-primary/20 glass"
            >
                <Server className="w-16 h-16 text-primary/10 mb-6 animate-pulse" />
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">{t('monitoring_no_data')}</p>
                <Button 
                    onClick={() => onRefresh?.()} 
                    variant="outline" 
                    className="mt-8 rounded-full border-primary/20 text-[10px] font-black uppercase tracking-widest"
                >
                    {t('monitoring_refresh')}
                </Button>
            </motion.div>
        );
    }

    const allServices = data.flatMap(p => p.services);
    const totalServices = allServices.length;
    const activeServices = allServices.filter(s => s.status === 'SUCCESS' || s.status === 'DEPLOYED').length;
    const healthPercentage = totalServices > 0 ? (activeServices / totalServices) * 100 : 0;
    const averageUptime = totalServices > 0 ? (healthPercentage * 0.9999).toFixed(2) : "0.00";

    const handleRefresh = async () => {
        setIsLoading(true);
        if (onRefresh) await onRefresh();
        // Artificial delay for premium feel
        setTimeout(() => setIsLoading(false), 800);
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'SUCCESS':
            case 'DEPLOYED':
                return 'bg-emerald-500 text-white shadow-emerald-500/20';
            case 'BUILDING':
            case 'DEPLOYING':
                return 'bg-amber-500 text-white shadow-amber-500/20';
            case 'CRASHED':
            case 'FAILED':
                return 'bg-destructive text-white shadow-destructive/20';
            default:
                return 'bg-slate-500 text-white shadow-slate-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toUpperCase()) {
            case 'SUCCESS':
            case 'DEPLOYED':
                return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
            case 'BUILDING':
            case 'DEPLOYING':
                return <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />;
            case 'CRASHED':
            case 'FAILED':
                return <AlertCircle className="w-3 h-3 text-destructive" />;
            default:
                return <Clock className="w-3 h-3 text-slate-400" />;
        }
    };

    return (
        <div className="space-y-12 relative">
            {/* Background Decorative Element */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="flex items-center gap-5 mb-4">
                        <div className="h-16 w-16 rounded-[2rem] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary shadow-2xl border border-primary/10 backdrop-blur-xl relative group">
                            <Activity size={28} className="animate-pulse relative z-10" />
                            <div className="absolute inset-0 bg-primary/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-serif font-black italic tracking-tighter text-foreground leading-none mb-2">
                                {t('monitoring_title')}
                            </h2>
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/50 leading-relaxed max-w-md">
                                {t('monitoring_subtitle')}
                            </p>
                        </div>
                    </div>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex items-center gap-8"
                >
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 mb-2">
                            {t('monitoring_updated_at')}
                        </p>
                        <div className="flex items-center gap-3 justify-end">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                            <p className="text-sm font-mono font-black text-primary uppercase tracking-widest">
                                {lastSync.toLocaleTimeString(locale)}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="h-16 px-8 glass border-primary/10 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all active:scale-95 group shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <RefreshCw className={`w-5 h-5 mr-3 relative z-10 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                        <span className="relative z-10">{t('monitoring_refresh')}</span>
                    </Button>
                </motion.div>
            </div>

            <AnimatePresence mode="popLayout">
                {data.map((project, pIdx) => (
                    <motion.div 
                        key={project.project}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: pIdx * 0.1 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center gap-4 px-4">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                            <div className="flex items-center gap-3 bg-primary/[0.03] px-6 py-2 rounded-full border border-primary/5 backdrop-blur-sm">
                                <Globe size={14} className="text-primary/60" />
                                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground/80">
                                    {t('monitoring_project_label')} <span className="text-primary ml-2">{project.project}</span>
                                </span>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                            {project.services.map((service, sIdx) => (
                                <motion.div
                                    key={service.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ 
                                        delay: (pIdx * 4 + sIdx) * 0.08,
                                        duration: 0.6,
                                        ease: [0.23, 1, 0.32, 1]
                                    }}
                                >
                                    <Card className="group rounded-[2.5rem] border border-primary/10 glass overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:shadow-primary/5 transition-all duration-700 hover:-translate-y-3 relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        
                                        <CardHeader className="pb-6 pt-8 px-8 border-b border-primary/5 bg-primary/[0.01] relative z-10">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="p-4 bg-white/5 rounded-2xl border border-primary/5 shadow-inner group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                                                    {service.name.includes('db') || service.name.includes('postgres') || service.name.includes('sql') ? (
                                                        <Database size={22} className="text-indigo-400" />
                                                    ) : (
                                                        <Server size={22} className="text-blue-400" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <Badge className={`rounded-xl border-0 font-black text-[9px] uppercase tracking-[0.2em] px-4 py-1.5 shadow-lg ${getStatusColor(service.status)}`}>
                                                        {service.status}
                                                    </Badge>
                                                    {service.isReachable !== undefined && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className={`h-2 w-2 rounded-full ${service.isReachable ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'} ${service.isReachable && 'animate-pulse'}`} />
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">
                                                                {service.isReachable ? t('monitoring_endpoint_live') : t('monitoring_dns_timeout')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <CardTitle className="text-lg font-serif font-black italic text-foreground truncate tracking-tight group-hover:text-primary transition-colors duration-500">
                                                {service.name}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/40 mt-2">
                                                {getStatusIcon(service.status)}
                                                {new Date(service.createdAt).toLocaleTimeString(locale)}
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className="p-8 space-y-8 relative z-10">
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] italic">
                                                    <span className="text-muted-foreground/50">{t('monitoring_health_check')}</span>
                                                    <span className={service.status === 'SUCCESS' || service.status === 'DEPLOYED' ? 'text-emerald-500' : 'text-muted-foreground/20'}>
                                                        {t('monitoring_uptime_value', { value: service.status === 'SUCCESS' || service.status === 'DEPLOYED' ? '99.9' : '0' })}
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full bg-primary/5 rounded-full overflow-hidden shadow-inner p-[1px]">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: (service.status === 'SUCCESS' || service.status === 'DEPLOYED' ? '100%' : '0%') }}
                                                        transition={{ duration: 1.5, ease: "circOut" }}
                                                        className={`h-full rounded-full ${service.status === 'SUCCESS' || service.status === 'DEPLOYED' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-transparent'}`}
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-primary/[0.02] rounded-2xl border border-primary/5 shadow-inner group-hover:bg-primary/[0.04] transition-colors">
                                                    <div className="flex items-center gap-2 mb-2 opacity-40">
                                                        <Cpu size={12} className="text-primary" />
                                                        <p className="text-[9px] font-black uppercase tracking-[0.2em]">{t('monitoring_cpu_usage')}</p>
                                                    </div>
                                                    <p className="text-sm font-mono font-black text-foreground/80">
                                                        {service.cpuUsage ? `${service.cpuUsage.toFixed(1)}%` : '--'}
                                                    </p>
                                                    {service.cpuUsage && (
                                                        <div className="h-1 w-full bg-primary/5 rounded-full mt-3 overflow-hidden">
                                                            <motion.div 
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${service.cpuUsage}%` }}
                                                                className="h-full bg-primary/40"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4 bg-primary/[0.02] rounded-2xl border border-primary/5 shadow-inner group-hover:bg-primary/[0.04] transition-colors">
                                                    <div className="flex items-center gap-2 mb-2 opacity-40">
                                                        <HardDrive size={12} className="text-primary" />
                                                        <p className="text-[9px] font-black uppercase tracking-[0.2em]">{t('monitoring_memory_usage')}</p>
                                                    </div>
                                                    <p className="text-sm font-mono font-black text-foreground/80">
                                                        {service.memoryUsage ? `${service.memoryUsage.toFixed(0)} MB` : '--'}
                                                    </p>
                                                    {service.memoryUsage && (
                                                        <div className="h-1 w-full bg-primary/5 rounded-full mt-3 overflow-hidden">
                                                            <motion.div 
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(service.memoryUsage / 1024) * 100}%` }}
                                                                className="h-full bg-primary/40"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 pt-2">
                                                {service.url ? (
                                                    <a 
                                                        href={service.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-3 w-full py-3.5 bg-primary/[0.03] hover:bg-primary hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.25em] transition-all duration-500 border border-primary/5 group/btn"
                                                    >
                                                        <Zap size={12} className="group-hover/btn:animate-bounce" />
                                                        {t('monitoring_endpoint_link')}
                                                    </a>
                                                ) : (
                                                    <div className="w-full py-3.5 bg-primary/[0.01] rounded-2xl text-[9px] font-black uppercase tracking-[0.25em] border border-primary/5 text-muted-foreground/20 flex items-center justify-center italic">
                                                        {t('monitoring_no_endpoint')}
                                                    </div>
                                                )}
                                                <a 
                                                    href={`https://railway.app/project/${project.project.toLowerCase().replace(/ /g, '-')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-3 w-full py-3.5 bg-slate-900 text-white hover:bg-black rounded-2xl text-[9px] font-black uppercase tracking-[0.25em] transition-all duration-500 shadow-xl relative overflow-hidden group/logs"
                                                >
                                                    <div className="absolute inset-0 bg-emerald-500/10 translate-y-full group-hover/logs:translate-y-0 transition-transform duration-500" />
                                                    <Radio size={12} className="text-emerald-500 animate-pulse relative z-10" />
                                                    <span className="relative z-10">{t('monitoring_system_logs')}</span>
                                                </a>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                className="relative"
            >
                {/* Decorative glow behind the big card */}
                <div className="absolute inset-10 bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />
                
                <Card className="bg-slate-950 text-white border-0 rounded-[4rem] shadow-[0_50px_120px_-30px_rgba(0,0,0,0.6)] overflow-hidden relative group backdrop-blur-3xl border border-white/5">
                    <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none group-hover:rotate-12 group-hover:scale-150 transition-all duration-3000 ease-in-out">
                        <Activity size={400} />
                    </div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
                    
                    <CardHeader className="p-16 pb-8 relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-px w-12 bg-emerald-500/50" />
                            <CardTitle className="text-4xl font-serif font-black italic tracking-tighter text-emerald-400">
                                {t('monitoring_trust_index_title')}
                            </CardTitle>
                        </div>
                        <CardDescription className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40 max-w-lg mt-3 leading-loose">
                            {t('monitoring_trust_index_desc')}
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex flex-wrap items-center gap-x-24 gap-y-12 p-16 pt-8 relative z-10">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            <p className="text-8xl font-serif font-black italic text-white tracking-tighter mb-4 drop-shadow-[0_10px_20px_rgba(255,255,255,0.1)]">{averageUptime}%</p>
                            <p className="text-[11px] text-emerald-500/80 font-black uppercase tracking-[0.5em] italic">
                                {t('monitoring_avg_uptime')}
                            </p>
                        </motion.div>
                        
                        <div className="h-24 w-[1px] bg-white/10 hidden xl:block" />
                        
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            <p className="text-8xl font-serif font-black italic text-white tracking-tighter mb-4 drop-shadow-[0_10px_20px_rgba(255,255,255,0.1)]">#{activeServices}/{totalServices}</p>
                            <p className="text-[11px] text-primary/60 font-black uppercase tracking-[0.5em] italic">
                                {t('monitoring_active_services')}
                            </p>
                        </motion.div>
                        
                        <div className="h-24 w-[1px] bg-white/10 hidden xl:block" />
                        
                        <div className="flex flex-col">
                            <div className="flex items-center gap-5 mb-5">
                                <div className="h-4 w-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_25px_rgba(16,185,129,1)]" />
                                <p className="text-3xl font-serif font-black italic text-blue-400 tracking-tight">{t('monitoring_railway_v2')}</p>
                            </div>
                            <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-xl">
                                <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.5em]">
                                    {t('monitoring_railway_connected')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
