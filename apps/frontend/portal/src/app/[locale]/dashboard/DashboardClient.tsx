'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
    getBatchDetails, 
    getBlockchainStatus, 
    getTelemetry, 
    getAlerts, 
    BatchDetails, 
    BlockchainStatus, 
    Telemetry, 
    Alert 
} from '@/lib/api';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DashboardMap } from "@/components/maps/DashboardMap";
import { BlockchainControls } from "@/components/blockchain/BlockchainControls";
import { EmptyStateGuide } from "@/components/shared/EmptyStateGuide";
import { InUIDocTooltip } from "@/components/shared/InUIDocTooltip";
import { 
    Plus, 
    Search, 
    MapPin, 
    Thermometer, 
    Box, 
    AlertTriangle, 
    Trash2, 
    LayoutDashboard, 
    RefreshCcw,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const TelemetryChart = dynamic(
    () => import("@/components/charts/TelemetryChart"),
    { ssr: false, loading: () => <div className="h-[300px] w-full bg-primary/5 animate-pulse rounded-2xl" /> }
);

interface DashboardClientProps {
    initialBatches: any[];
}

export function DashboardClient({ initialBatches }: DashboardClientProps) {
    const t = useTranslations();
    const locale = useLocale();
    const router = useRouter();
    const { role } = useAuth();
    
    const [batches, setBatches] = useState<any[]>(initialBatches);
    const [selectedId, setSelectedId] = useState<string>(initialBatches[0]?.id || '');
    const [blockchainStatus, setBlockchainStatus] = useState<BlockchainStatus | null>(null);
    const [telemetryData, setTelemetryData] = useState<Telemetry[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const selectedBatch = batches.find(b => b.id === selectedId);

    const currentTemp = telemetryData.length > 0
        ? telemetryData[telemetryData.length - 1].temperature_celsius
        : (selectedBatch?.temperature || null);

    const currentLat = telemetryData.length > 0 && telemetryData[telemetryData.length - 1].location_lat
        ? telemetryData[telemetryData.length - 1].location_lat
        : undefined;
    const currentLon = telemetryData.length > 0 && telemetryData[telemetryData.length - 1].location_lon
        ? telemetryData[telemetryData.length - 1].location_lon
        : undefined;

    const fetchData = async (id: string, silent = false) => {
        if (!id) return;
        if (!silent) setLoadingStatus(true);
        try {
            const [bc, tel, al] = await Promise.all([
                getBlockchainStatus(id),
                getTelemetry(id),
                getAlerts(id)
            ]);
            if (bc) setBlockchainStatus(bc);
            if (tel) setTelemetryData(tel);
            if (al) setAlerts(al);
        } catch (error) {
            console.error('Fetch error:', error);
            if (!silent) toast.error('Failed to sync batch data');
        } finally {
            if (!silent) setLoadingStatus(false);
        }
    };

    useEffect(() => {
        const stored = localStorage.getItem('recent_batches');
        if (stored) {
            try {
                const ids = JSON.parse(stored);
                if (Array.isArray(ids) && ids.length > 0) {
                    Promise.all(ids.map(id => getBatchDetails(id))).then(results => {
                        const valid = results.filter(b => b !== null) as BatchDetails[];
                        const realBatches = valid.map(b => ({
                            id: b.id,
                            product_type: b.product_type || 'Unknown Product',
                            status: 'Tracked',
                            location: b.origin_country || 'Unknown Location',
                            temperature: b.min_temp || -18.0,
                            last_updated: b.created_at || new Date().toISOString()
                        }));
                        setBatches(realBatches);
                        if (realBatches.length > 0 && !selectedId) {
                            setSelectedId(realBatches[0].id);
                        }
                    });
                }
            } catch (e) {
                console.error('Failed to load recent batches', e);
            }
        }
    }, []);

    useEffect(() => {
        if (selectedId) {
            fetchData(selectedId);
        }
    }, [selectedId]);

    const handleRefresh = async () => {
        if (!selectedId) return;
        setIsRefreshing(true);
        await fetchData(selectedId, true);
        setIsRefreshing(false);
        toast.success('Live telemetry synchronized');
    };

    const handleCreateBatch = () => {
        router.push(`/${locale}/batches/new`);
    };

    const deleteBatch = (id: string) => {
        const newBatches = batches.filter(b => b.id !== id);
        setBatches(newBatches);
        // Also update localStorage
        localStorage.setItem('recent_batches', JSON.stringify(newBatches.map(b => b.id)));
        
        if (selectedId === id && newBatches.length > 0) {
            setSelectedId(newBatches[0].id);
        } else if (newBatches.length === 0) {
            setSelectedId('');
        }
        toast.info('Batch removed from local tracking');
    };

    return (
        <div className="min-h-screen bg-background selection:bg-primary/10">
            {role === 'PENDING' && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-500 p-4 flex items-center justify-center gap-3 shadow-inner">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <span className="font-black uppercase tracking-widest text-[10px]">Your account is PENDING administrative verification. Restricted mode active.</span>
                </div>
            )}
            
            {batches.length === 0 && !loadingStatus ? (
                <EmptyStateGuide />
            ) : (
                <main className="grid flex-1 gap-4 p-4 md:grid-cols-[380px_1fr] md:gap-12 md:p-12">
                {/* Left Sidebar: Batch List */}
                <div className="flex flex-col gap-10">
                    <div className="flex items-center justify-between px-2">
                        <div>
                            <h2 className="text-3xl font-serif font-black tracking-tighter italic">{t('Dashboard.active_batches')}</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1">Live Tracking Ledger</p>
                        </div>
                        {role === 'MANUFACTURER' && (
                            <Button 
                                onClick={handleCreateBatch}
                                size="icon"
                                className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 text-white border-0 shadow-2xl shadow-primary/20 transition-all active:scale-95"
                            >
                                <Plus className="h-6 w-6" />
                            </Button>
                        )}
                    </div>

                    <div className="space-y-4 overflow-y-auto max-h-[75vh] pr-4 custom-scrollbar pb-20">
                        <AnimatePresence mode="popLayout">
                            {batches.map((batch) => (
                                <motion.div
                                    key={batch.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onClick={() => setSelectedId(batch.id)}
                                    className={`
                                        group flex flex-col p-6 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden
                                        ${selectedId === batch.id 
                                            ? "bg-slate-900 border-slate-900 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.2)] text-white" 
                                            : "bg-white border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"}
                                    `}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${selectedId === batch.id ? 'bg-primary/20 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                                            {batch.status}
                                        </span>
                                        {selectedId !== batch.id && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteBatch(batch.id);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <h3 className={`font-serif font-black text-2xl italic truncate mb-2 ${selectedId === batch.id ? 'text-white' : 'text-slate-900'}`}>
                                        {batch.product_type.replace(/_/g, ' ')}
                                    </h3>
                                    <div className={`flex items-center justify-between text-[10px] font-black uppercase tracking-widest ${selectedId === batch.id ? 'text-white/40' : 'text-muted-foreground/60'}`}>
                                        <span>#{batch.id.substring(0, 10)}</span>
                                        <span>{new Date(batch.last_updated || "").toLocaleDateString()}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col gap-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                <LayoutDashboard size={24} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-serif font-black italic tracking-tighter text-slate-900">Operations</h1>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{selectedBatch?.product_type?.replace(/_/g, ' ')} • Current Session</p>
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="h-12 rounded-2xl border-slate-100 text-[10px] font-black uppercase tracking-widest px-6 shadow-sm hover:shadow-md transition-all"
                        >
                            {isRefreshing ? <Loader2 className="mr-3 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-3 h-4 w-4 text-primary/40" />}
                            Sync Live Data
                        </Button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <StatusMetric 
                            icon={<LayoutDashboard className="h-5 w-5 text-primary" />}
                            title={t('Dashboard.status_blockchain')}
                            docTooltip={<InUIDocTooltip titleKey="status_blockchain_title" descriptionKey="status_blockchain_desc" />}
                            value={loadingStatus ? '...' : (blockchainStatus?.violation ? t('Compliance.violation_title') : (blockchainStatus?.verified ? t('Dashboard.status_connection_secured') : t('Dashboard.status_connection_pending')))}
                            subText={blockchainStatus?.txHash ? `Tx: ${blockchainStatus.txHash.substring(0, 12)}...` : 'Unverified Ledger'}
                            isAlert={!!blockchainStatus?.violation}
                        />
                        <StatusMetric 
                            icon={<MapPin className="h-5 w-5 text-primary" />}
                            title={t('Tracking.location_current')}
                            value={selectedBatch?.location || 'Awaiting Link'}
                            subText={t('Tracking.location_updated_iot')}
                        />
                        <StatusMetric 
                            icon={<Thermometer className="h-5 w-5 text-primary" />}
                            title={t('Tracking.temp_title')}
                            value={currentTemp !== null ? `${currentTemp}°C` : '--'}
                            subText={t('Tracking.temp_optimal')}
                            isAlert={Number(currentTemp) > -18}
                        />
                    </div>

                    {/* Alerts Section */}
                    <AnimatePresence>
                        {alerts.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="rounded-[3rem] border border-destructive/20 bg-destructive/[0.02] p-10 border-l-[24px] border-l-destructive shadow-2xl shadow-destructive/5"
                            >
                                <div className="flex items-start gap-8">
                                    <div className="h-16 w-16 rounded-[2rem] bg-destructive flex items-center justify-center text-white shadow-2xl shadow-destructive/20 shrink-0">
                                        <AlertTriangle className="h-10 w-10 animate-pulse" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-3xl font-serif font-black text-destructive mb-6 italic tracking-tighter uppercase">{t('Compliance.sla_violations_title')}</h3>
                                        <div className="grid gap-4">
                                            {alerts.slice(0, 2).map((alert: any) => (
                                                <div key={alert.id} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-white border border-destructive/10 shadow-sm">
                                                    <span className="font-black text-slate-800 uppercase tracking-tight text-xs">{alert.message}</span>
                                                    <span className="text-[10px] font-black text-muted-foreground/40 bg-slate-50 px-3 py-1.5 rounded-full uppercase tracking-widest">{new Date(alert.created_at).toLocaleTimeString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Interactive Map & Telemetry Row */}
                    <div className="grid gap-10 lg:grid-cols-3">
                        <Card className="lg:col-span-2 rounded-[3.5rem] overflow-hidden bg-white border-slate-100 shadow-2xl">
                            <CardHeader className="p-12 pb-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-4xl font-serif font-black italic tracking-tighter text-slate-900">{t('Tracking.live_tracking')}</CardTitle>
                                        <CardDescription className="font-black text-muted-foreground/40 uppercase tracking-[0.2em] text-[10px] mt-2 italic">{t('Tracking.live_tracking_desc')}</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-primary/5 border border-primary/10 text-[9px] font-black uppercase tracking-widest text-primary shadow-inner">
                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                                        Satellite Link Active
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 h-[500px]">
                                <DashboardMap 
                                    locationName={selectedBatch?.location} 
                                    lat={currentLat} 
                                    lon={currentLon} 
                                />
                            </CardContent>
                            <div className="p-12 bg-slate-50/50 backdrop-blur-3xl border-t border-slate-100">
                                <div className="mb-8 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t('Tracking.iot_monitoring')}</h4>
                                        <InUIDocTooltip titleKey="telemetry_title" descriptionKey="telemetry_desc" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-primary/40">GFTB-Live-Data-Stream-Verified</span>
                                </div>
                                <div className="h-64">
                                    <TelemetryChart data={telemetryData} />
                                </div>
                            </div>
                        </Card>

                        {/* Control Center */}
                        <Card className="rounded-[3.5rem] bg-white border-slate-100 shadow-2xl flex flex-col items-stretch overflow-hidden">
                            <CardHeader className="p-12">
                                <CardTitle className="text-4xl font-serif font-black italic text-slate-900 tracking-tighter">{t('Dashboard.action_center')}</CardTitle>
                                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-3 italic">{t('Dashboard.action_desc')}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-12 pt-0 flex-1 flex flex-col gap-10">
                                {selectedId && blockchainStatus ? (
                                    <>
                                        <div className="flex-1">
                                            <BlockchainControls
                                                batchId={selectedId}
                                                blockchainStatus={blockchainStatus}
                                                onRefresh={handleRefresh}
                                            />
                                        </div>
                                        <div className="pt-10 border-t border-slate-100">
                                            <Button
                                                variant="outline"
                                                className="w-full h-24 rounded-[2.5rem] border-slate-200 bg-white text-slate-900 hover:bg-slate-50 font-black uppercase tracking-[0.2em] text-xs shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-4"
                                                onClick={() => window.open(`/${locale}/verify/${selectedId}`, '_blank')}
                                            >
                                                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                                    <Search className="h-6 w-6" />
                                                </div>
                                                View Digital Twin
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30 grayscale">
                                        <div className="h-24 w-24 rounded-[2.5rem] bg-slate-100 flex items-center justify-center mb-8">
                                            <Box className="h-12 w-12 text-slate-400" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Select a batch to initialize trust controls</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
                </main>
            )}
        </div>
    );
}

function StatusMetric({ icon, title, value, subText, isAlert, docTooltip }: { icon: React.ReactNode, title: string, value: string, subText: string, isAlert?: boolean, docTooltip?: React.ReactNode }) {
    return (
        <Card className={`rounded-[2.5rem] bg-white transition-all hover:scale-[1.02] border-slate-100 shadow-xl hover:shadow-primary/5 overflow-hidden group ${isAlert ? 'border-destructive/30 ring-1 ring-destructive/10' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-6 px-10 pt-10">
                <CardTitle className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {title}
                    {docTooltip}
                </CardTitle>
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner transition-colors ${isAlert ? 'bg-destructive/10 text-destructive' : 'bg-slate-50 text-primary'}`}>{icon}</div>
            </CardHeader>
            <CardContent className="px-10 pb-10">
                <div className={`text-4xl font-serif font-black italic tracking-tighter ${isAlert ? 'text-destructive' : 'text-slate-900'}`}>
                    {value}
                </div>
                <div className="flex items-center gap-3 mt-4">
                    <div className={`h-1.5 w-1.5 rounded-full ${isAlert ? 'bg-destructive animate-pulse' : 'bg-emerald-500'}`} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{subText}</p>
                </div>
            </CardContent>
        </Card>
    );
}
