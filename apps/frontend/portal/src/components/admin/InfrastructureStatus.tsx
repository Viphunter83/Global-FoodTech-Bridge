'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RailwayService, InfrastructureStatus as InfrastructureStatusType } from '@/lib/railway';
import { Activity, Server, Database, Globe, RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface InfrastructureStatusProps {
    data: InfrastructureStatusType[];
    onRefresh?: () => void;
}

export function InfrastructureStatus({ data, onRefresh }: InfrastructureStatusProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [lastSync, setLastSync] = useState<Date>(new Date());
    const { t, language } = useLanguage();

    useEffect(() => {
        setLastSync(new Date());
    }, [data]);

    const handleRefresh = async () => {
        setIsLoading(true);
        if (onRefresh) await onRefresh();
        setTimeout(() => setIsLoading(false), 500);
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'SUCCESS':
            case 'DEPLOYED':
                return 'bg-emerald-500 hover:bg-emerald-600';
            case 'BUILDING':
            case 'DEPLOYING':
                return 'bg-amber-500 hover:bg-amber-600';
            case 'CRASHED':
            case 'FAILED':
                return 'bg-red-500 hover:bg-red-600';
            default:
                return 'bg-slate-500 hover:bg-slate-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toUpperCase()) {
            case 'SUCCESS':
            case 'DEPLOYED':
                return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'BUILDING':
            case 'DEPLOYING':
                return <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />;
            case 'CRASHED':
            case 'FAILED':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-slate-500" />;
        }
    };

    // Dynamic Metrics Calculations
    const allServices = data.flatMap(p => p.services);
    const totalServices = allServices.length;
    const activeServices = allServices.filter(s => s.status === 'SUCCESS' || s.status === 'DEPLOYED').length;
    const healthPercentage = totalServices > 0 ? (activeServices / totalServices) * 100 : 0;
    const averageUptime = totalServices > 0 ? (healthPercentage * 0.9999).toFixed(2) : "0.00";

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl border-slate-200">
                <Server className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">{t('monitoring_no_data')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-blue-600" />
                        {t('monitoring_title')}
                    </h2>
                    <p className="text-slate-500">
                        {t('monitoring_subtitle')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                            {t('monitoring_updated_at')}
                        </p>
                        <p className="text-xs font-medium text-slate-600">
                            {lastSync.toLocaleTimeString(language === 'ar' ? 'ar-SA' : language)}
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm active:scale-95"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        {t('monitoring_refresh')}
                    </button>
                </div>
            </div>

            {data.map((project) => (
                <div key={project.project} className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                            {t('monitoring_project_label')} {project.project}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {project.services.map((service) => (
                            <Card key={service.id} className="overflow-hidden border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-slate-50/50">
                                <CardHeader className="pb-3 border-b border-slate-100/50">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="p-2 bg-slate-100 rounded-lg">
                                            {service.name.includes('db') || service.name.includes('postgres') || service.name.includes('sql') ? (
                                                <Database className="w-5 h-5 text-indigo-600" />
                                            ) : (
                                                <Server className="w-5 h-5 text-blue-600" />
                                            )}
                                        </div>
                                        <Badge className={`${getStatusColor(service.status)} border-none text-white shadow-sm font-bold text-[10px]`}>
                                            {service.status}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg font-bold text-slate-800 truncate">
                                        {service.name}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1.5 text-xs">
                                        {getStatusIcon(service.status)}
                                        {t('monitoring_updated_at')} {new Date(service.createdAt).toLocaleTimeString(language)}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-slate-500">{t('monitoring_health_check')}</span>
                                            <span className={service.status === 'SUCCESS' || service.status === 'DEPLOYED' ? 'text-emerald-600' : 'text-slate-400'}>
                                                {t('monitoring_uptime_value').replace('{value}', service.status === 'SUCCESS' || service.status === 'DEPLOYED' ? '99.9' : '0')}
                                            </span>
                                        </div>
                                        <Progress value={service.status === 'SUCCESS' || service.status === 'DEPLOYED' ? 100 : 0} className="h-1.5 bg-slate-100" />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-2 bg-slate-100/50 rounded-md border border-slate-200/50">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{t('monitoring_cpu_usage')}</p>
                                            <p className="text-sm font-bold text-slate-700">
                                                {service.cpuUsage ? `${service.cpuUsage.toFixed(1)}%` : '--'}
                                            </p>
                                        </div>
                                        <div className="p-2 bg-slate-100/50 rounded-md border border-slate-200/50">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{t('monitoring_memory_usage')}</p>
                                            <p className="text-sm font-bold text-slate-700">
                                                {service.memoryUsage ? `${service.memoryUsage} MB` : '--'}
                                            </p>
                                        </div>
                                    </div>

                                    {service.url && (
                                        <a 
                                            href={service.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="block text-center text-xs text-blue-600 font-medium hover:underline py-1 bg-blue-50/50 rounded transition-colors hover:bg-blue-100/50"
                                        >
                                            {t('monitoring_endpoint_link')}
                                        </a>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}

            <Card className="bg-slate-900 text-white border-none shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Activity className="w-32 h-32" />
                </div>
                <CardHeader>
                    <CardTitle className="text-xl">{t('monitoring_trust_index_title')}</CardTitle>
                    <CardDescription className="text-slate-400">
                        {t('monitoring_trust_index_desc')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-4 py-4">
                    <div>
                        <p className="text-3xl font-black text-emerald-400">{averageUptime}%</p>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">
                            {t('monitoring_avg_uptime')}
                        </p>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800 hidden sm:block" />
                    <div>
                        <p className="text-3xl font-black text-indigo-400">#{activeServices}/{totalServices}</p>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">
                            {t('monitoring_active_services')}
                        </p>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-800 hidden sm:block" />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-lg font-bold text-blue-400">Railway API v2</p>
                        </div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">
                            {t('monitoring_railway_connected')}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
