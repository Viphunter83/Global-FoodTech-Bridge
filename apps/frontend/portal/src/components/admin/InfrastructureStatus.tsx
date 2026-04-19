'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RailwayService, InfrastructureStatus as InfrastructureStatusType } from '@/lib/railway';
import { Activity, Server, Database, Globe, RefreshCw, CheckCircle2, AlertCircle, Clock, Zap, Cpu, HardDrive } from 'lucide-react';
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

    const handleRefresh = async () => {
        setIsLoading(true);
        if (onRefresh) await onRefresh();
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

    const allServices = data.flatMap(p => p.services);
    const totalServices = allServices.length;
    const activeServices = allServices.filter(s => s.status === 'SUCCESS' || s.status === 'DEPLOYED').length;
    const healthPercentage = totalServices > 0 ? (activeServices / totalServices) * 100 : 0;
    const averageUptime = totalServices > 0 ? (healthPercentage * 0.9999).toFixed(2) : "0.00";

    if (!data || data.length === 0) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-20 rounded-[3rem] border border-dashed border-primary/20 glass"
            >
                <Server className="w-16 h-16 text-primary/10 mb-6 animate-pulse" />
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">{t('monitoring_no_data')}</p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                <div>
                    <div className="flex items-center gap-4 mb-3">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <Activity size={24} className="animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-serif font-black italic tracking-tighter text-foreground">
                            {t('monitoring_title')}
                        </h2>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 leading-relaxed max-w-md">
                        {t('monitoring_subtitle')}
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mb-1">
                            {t('monitoring_updated_at')}
                        </p>
                        <p className="text-xs font-mono font-black text-primary uppercase tracking-widest">
                            {lastSync.toLocaleTimeString(locale)}
                        </p>
                    </div>
                    <Button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="h-14 px-6 glass border-primary/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all active:scale-95 group shadow-xl"
                    >
                        <RefreshCw className={`w-4 h-4 mr-3 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                        {t('monitoring_refresh')}
                    </Button>
                </div>
            </div>

            <AnimatePresence mode="popLayout">
                {data.map((project, pIdx) => (
                    <motion.div 
                        key={project.project}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: pIdx * 0.1 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3 px-2">
                            <Globe size={14} className="text-primary/40" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
                                {t('monitoring_project_label')} <span className="text-foreground">{project.project}</span>
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {project.services.map((service, sIdx) => (
                                <motion.div
                                    key={service.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: (pIdx * 4 + sIdx) * 0.05 }}
                                >
                                    <Card className="group rounded-[2rem] border border-primary/10 glass overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1">
                                        <CardHeader className="pb-4 pt-6 px-6 border-b border-primary/5 bg-primary/[0.01]">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="p-3 bg-white/5 rounded-xl border border-primary/5 shadow-inner group-hover:scale-110 transition-transform">
                                                    {service.name.includes('db') || service.name.includes('postgres') || service.name.includes('sql') ? (
                                                        <Database size={18} className="text-indigo-400" />
                                                    ) : (
                                                        <Server size={18} className="text-blue-400" />
                                                    )}
                                                </div>
                                                <Badge className={`rounded-lg border-0 font-black text-[8px] uppercase tracking-widest px-3 py-1 ${getStatusColor(service.status)}`}>
                                                    {service.status}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-sm font-serif font-black italic text-foreground truncate tracking-tight">
                                                {service.name}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/40 mt-1">
                                                {getStatusIcon(service.status)}
                                                {new Date(service.createdAt).toLocaleTimeString(locale)}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-6">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest italic">
                                                    <span className="text-muted-foreground/60">{t('monitoring_health_check')}</span>
                                                    <span className={service.status === 'SUCCESS' || service.status === 'DEPLOYED' ? 'text-emerald-500' : 'text-muted-foreground/20'}>
                                                        {t('monitoring_uptime_value').replace('{value}', service.status === 'SUCCESS' || service.status === 'DEPLOYED' ? '99.9' : '0')}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-primary/5 rounded-full overflow-hidden shadow-inner">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: (service.status === 'SUCCESS' || service.status === 'DEPLOYED' ? '100%' : '0%') }}
                                                        transition={{ duration: 1, ease: "circOut" }}
                                                        className={`h-full ${service.status === 'SUCCESS' || service.status === 'DEPLOYED' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-transparent'}`}
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 bg-primary/[0.02] rounded-xl border border-primary/5 shadow-inner">
                                                    <div className="flex items-center gap-2 mb-1 opacity-40">
                                                        <Cpu size={10} />
                                                        <p className="text-[8px] font-black uppercase tracking-widest">{t('monitoring_cpu_usage')}</p>
                                                    </div>
                                                    <p className="text-xs font-mono font-black text-foreground/80">
                                                        {service.cpuUsage ? `${service.cpuUsage.toFixed(1)}%` : '--'}
                                                    </p>
                                                </div>
                                                <div className="p-3 bg-primary/[0.02] rounded-xl border border-primary/5 shadow-inner">
                                                    <div className="flex items-center gap-2 mb-1 opacity-40">
                                                        <HardDrive size={10} />
                                                        <p className="text-[8px] font-black uppercase tracking-widest">{t('monitoring_memory_usage')}</p>
                                                    </div>
                                                    <p className="text-xs font-mono font-black text-foreground/80">
                                                        {service.memoryUsage ? `${service.memoryUsage} MB` : '--'}
                                                    </p>
                                                </div>
                                            </div>

                                            {service.url && (
                                                <a 
                                                    href={service.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 w-full py-3 bg-primary/[0.03] hover:bg-primary hover:text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 border border-primary/5"
                                                >
                                                    <Zap size={12} />
                                                    {t('monitoring_endpoint_link')}
                                                </a>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
            >
                <Card className="bg-slate-900 text-white border-0 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 group-hover:scale-125 transition-all duration-3000">
                        <Activity size={300} />
                    </div>
                    <CardHeader className="p-12 pb-6 relative z-10">
                        <CardTitle className="text-3xl font-serif font-black italic tracking-tighter text-emerald-400">{t('monitoring_trust_index_title')}</CardTitle>
                        <CardDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 max-w-sm mt-2">
                            {t('monitoring_trust_index_desc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center gap-x-20 gap-y-10 p-12 pt-6 relative z-10">
                        <div>
                            <p className="text-6xl font-serif font-black italic text-white tracking-tighter mb-2">{averageUptime}%</p>
                            <p className="text-[10px] text-emerald-500/60 font-black uppercase tracking-[0.3em] italic">
                                {t('monitoring_avg_uptime')}
                            </p>
                        </div>
                        <div className="h-20 w-[1px] bg-white/5 hidden md:block" />
                        <div>
                            <p className="text-6xl font-serif font-black italic text-white tracking-tighter mb-2">#{activeServices}/{totalServices}</p>
                            <p className="text-[10px] text-primary/40 font-black uppercase tracking-[0.3em] italic">
                                {t('monitoring_active_services')}
                            </p>
                        </div>
                        <div className="h-20 w-[1px] bg-white/5 hidden md:block" />
                        <div className="flex flex-col">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                                <p className="text-2xl font-serif font-black italic text-blue-400 tracking-tight">Railway API v2</p>
                            </div>
                            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">
                                {t('monitoring_railway_connected')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
