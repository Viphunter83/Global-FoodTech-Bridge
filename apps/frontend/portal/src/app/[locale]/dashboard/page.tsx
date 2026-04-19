'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/providers/AuthProvider';
import { getBatchDetails, getBlockchainStatus, getTelemetry, getAlerts, BatchDetails, BlockchainStatus, Telemetry, Alert } from '@/lib/api';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DashboardMap } from "@/components/ui/DashboardMap";
const TelemetryChart = dynamic(
    () => import("@/components/ui/TelemetryChart"),
    { ssr: false, loading: () => <div className="h-[300px] w-full bg-primary/5 animate-pulse rounded-2xl" /> }
);
import { BlockchainControls } from "@/components/ui/BlockchainControls";
import { Plus, Search, MapPin, Thermometer, Box, Truck, AlertTriangle, Trash2, Package, LayoutDashboard, RefreshCcw } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_BATCHES = [
    { id: '902f1e4c-3861-458d-8e76-7054b86c0cf1', product_type: 'Pho_Bo_Soup', status: 'In Transit', location: 'Dubai, UAE', temperature: -20.5, last_updated: '2024-10-15T10:30:00Z' },
    { id: 'batch-002', product_type: 'Wagyu_Beef', status: 'Delivered', location: 'Riyadh, KSA', temperature: -18.2, last_updated: '2024-10-14T09:15:00Z' },
    { id: 'batch-003', product_type: 'Organic_Chicken', status: 'Processing', location: 'Hanoi, VN', temperature: -4.0, last_updated: '2024-10-16T08:00:00Z' },
];

export default function DashboardPage() {
    const t = useTranslations();
    const { role } = useAuth();
    const [batches, setBatches] = useState(MOCK_BATCHES);
    const [selectedId, setSelectedId] = useState<string>(MOCK_BATCHES[0].id);
    const [blockchainStatus, setBlockchainStatus] = useState<BlockchainStatus | null>(null);
    const [telemetryData, setTelemetryData] = useState<Telemetry[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loadingStatus, setLoadingStatus] = useState(false);

    const selectedBatch = batches.find(b => b.id === selectedId);

    const currentTemp = telemetryData.length > 0
        ? telemetryData[telemetryData.length - 1].temperature_celsius
        : (selectedBatch?.temperature || null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newBatchData, setNewBatchData] = useState({
        sku: 'Pho Bo Soup Premium',
        productionDate: new Date().toISOString().split('T')[0],
        rawMaterial: '',
        sensorId: ''
    });

    useEffect(() => {
        const stored = localStorage.getItem('recent_batches');
        if (stored) {
            try {
                const ids = JSON.parse(stored);
                if (Array.isArray(ids) && ids.length > 0) {
                    const realBatches = ids.map((id: string) => ({
                        id,
                        product_type: 'Pho_Bo_Soup', 
                        status: 'Created',
                        location: 'Factory Line 1',
                        temperature: -20.0,
                        last_updated: new Date().toISOString()
                    }));
                    setBatches(prev => {
                        const unique = realBatches.filter(b => !prev.find(p => p.id === b.id));
                        return [...unique, ...prev];
                    });
                    setSelectedId(ids[0]);
                }
            } catch (e) {
                console.error('Failed to load recent batches', e);
            }
        }
    }, []);

    useEffect(() => {
        if (!selectedId) return;
        setLoadingStatus(true);
        Promise.all([
            getBatchDetails(selectedId),
            getBlockchainStatus(selectedId),
            getTelemetry(selectedId),
            getAlerts(selectedId)
        ]).then(([batch, bc, tel, al]) => {
            if (bc) setBlockchainStatus(bc);
            if (tel) setTelemetryData(tel);
            if (al) setAlerts(al);
            setLoadingStatus(false);
        }).catch(() => setLoadingStatus(false));
    }, [selectedId]);

    const handleCreateBatch = () => {
        const newId = crypto.randomUUID();
        const newBatch = {
            id: newId,
            product_type: newBatchData.sku,
            status: 'Processing',
            location: 'Factory (Lyon)',
            temperature: -4.0,
            last_updated: new Date().toISOString()
        };
        setBatches([newBatch, ...batches]);
        setSelectedId(newId);
        setIsDialogOpen(false);
    };

    const deleteBatch = (id: string) => {
        const newBatches = batches.filter(b => b.id !== id);
        setBatches(newBatches);
        if (selectedId === id && newBatches.length > 0) {
            setSelectedId(newBatches[0].id);
        } else if (newBatches.length === 0) {
            setSelectedId('');
        }
    };

    return (
        <div className="min-h-screen bg-background selection:bg-primary/10">
            <main className="grid flex-1 gap-4 p-4 md:grid-cols-[320px_1fr] md:gap-8 md:p-8">
                {/* Left Sidebar: Batch List */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-serif font-black tracking-tight">{t('Dashboard.active_batches')}</h2>
                        {role === 'MANUFACTURER' && (
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-white border-0 shadow-lg shadow-primary/20 transition-all active:scale-95">
                                        <Plus className="h-4 w-4 mr-1" /> {t('Dashboard.new')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] rounded-[2rem] glass border-primary/10">
                                    <DialogHeader>
                                        <DialogTitle className="text-3xl font-serif font-black italic">{t('Dashboard.new')}</DialogTitle>
                                        <DialogDescription className="font-medium text-muted-foreground/80">
                                            Initialize environmental monitoring & protocol pairing.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-6 py-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="sku" className="text-[10px] font-black uppercase tracking-widest text-primary/60">{t('Batch.product_type')}</Label>
                                            <Select
                                                defaultValue={newBatchData.sku}
                                                onValueChange={(val) => setNewBatchData({ ...newBatchData, sku: val })}
                                            >
                                                <SelectTrigger className="rounded-2xl h-14 bg-background/50 border-primary/10 focus:ring-primary/20">
                                                    <SelectValue placeholder="Select SKU" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-primary/10 shadow-2xl">
                                                    <SelectItem value="Pho Bo Soup Premium">Pho Bo Soup Premium</SelectItem>
                                                    <SelectItem value="Ramen Tonkotsu">Ramen Tonkotsu</SelectItem>
                                                    <SelectItem value="Udon Noodle Kit">Udon Noodle Kit</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bs-raw" className="text-[10px] font-black uppercase tracking-widest text-primary/60">{t('Batch.form_raw_material')}</Label>
                                            <Input
                                                id="bs-raw"
                                                placeholder="e.g. Beef Batch #991"
                                                className="rounded-2xl h-14 bg-background/50 border-primary/10"
                                                value={newBatchData.rawMaterial}
                                                onChange={(e) => setNewBatchData({ ...newBatchData, rawMaterial: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bs-date" className="text-[10px] font-black uppercase tracking-widest text-primary/60">{t('Batch.production_date')}</Label>
                                            <Input
                                                id="bs-date"
                                                type="date"
                                                className="rounded-2xl h-14 bg-background/50 border-primary/10"
                                                value={newBatchData.productionDate}
                                                onChange={(e) => setNewBatchData({ ...newBatchData, productionDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2 border-t border-primary/10 pt-6">
                                            <Label htmlFor="sensor" className="text-[10px] font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                                                <RefreshCcw className="h-3 w-3 animate-spin-slow" />
                                                {t('Batch.form_sensor_id')}
                                            </Label>
                                            <Input
                                                id="sensor"
                                                placeholder={t('Batch.form_sensor_placeholder')}
                                                className="rounded-2xl h-14 bg-secondary/5 border-secondary/20 focus:border-secondary focus:ring-secondary/20"
                                                value={newBatchData.sensorId}
                                                onChange={(e) => setNewBatchData({ ...newBatchData, sensorId: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleCreateBatch} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/95 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
                                            {t('Batch.btn_create_pair')}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar pb-10">
                        {batches.map((batch) => (
                            <motion.div
                                key={batch.id}
                                whileHover={{ scale: 1.02, x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedId(batch.id)}
                                className={`
                                    group flex flex-col p-5 rounded-[1.5rem] border transition-all cursor-pointer relative overflow-hidden
                                    ${selectedId === batch.id 
                                        ? "bg-primary/[0.03] border-primary/40 shadow-2xl shadow-primary/5 ring-1 ring-primary/20" 
                                        : "bg-background border-primary/5 hover:border-primary/20 hover:bg-primary/5"}
                                `}
                            >
                                {selectedId === batch.id && (
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                                )}
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${batch.status === 'In Transit' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                                        {batch.status}
                                    </span>
                                    {batch.status === 'Draft' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-full"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteBatch(batch.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <h3 className="font-serif font-black text-xl italic truncate mb-1 text-foreground/90">{batch.product_type.replace(/_/g, ' ')}</h3>
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">
                                    <span>#{batch.id.substring(0, 10)}</span>
                                    <span>{new Date(batch.last_updated || "").toLocaleDateString()}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col gap-8">
                    {/* Status Overview Card */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <StatusMetric 
                            icon={<LayoutDashboard className="h-5 w-5 text-primary" />}
                            title={t('Dashboard.status_blockchain')}
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
                                className="rounded-[2.5rem] border border-destructive/20 bg-destructive/[0.02] p-8 border-l-[16px] border-l-destructive shadow-xl"
                            >
                                <div className="flex items-start gap-6">
                                    <div className="h-14 w-14 rounded-3xl bg-destructive flex items-center justify-center text-white shadow-lg shadow-destructive/20 shrink-0">
                                        <AlertTriangle className="h-8 w-8 animate-pulse" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-serif font-black text-destructive mb-4 italic tracking-tight">{t('Compliance.sla_violations_title')}</h3>
                                        <div className="grid gap-3">
                                            {alerts.slice(0, 2).map((alert: any) => (
                                                <div key={alert.id} className="flex items-center justify-between text-sm p-4 rounded-2xl bg-white border border-destructive/10">
                                                    <span className="font-black text-foreground/80 uppercase tracking-tight">{alert.message}</span>
                                                    <span className="text-[10px] font-black text-muted-foreground/40 bg-muted px-2 py-1 rounded-full uppercase">{new Date(alert.created_at).toLocaleTimeString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Interactive Map & Telemetry Row */}
                    <div className="grid gap-8 lg:grid-cols-3">
                        <Card className="lg:col-span-2 rounded-[3rem] overflow-hidden glass border-primary/10 shadow-2xl">
                            <CardHeader className="p-10 pb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-4xl font-serif font-black italic tracking-tighter text-foreground/90">{t('Tracking.live_tracking')}</CardTitle>
                                        <CardDescription className="font-bold text-muted-foreground/60 uppercase tracking-widest text-[11px] mt-1">{t('Tracking.live_tracking_desc')}</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-3 px-5 py-2.5 rounded-full glass border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                                        <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                                        Satellite Link Active
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 h-[450px]">
                                <DashboardMap locationName={selectedBatch?.location} />
                            </CardContent>
                            <div className="p-10 bg-background/40 backdrop-blur-3xl border-t border-primary/5">
                                <div className="mb-6 flex items-center justify-between">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">{t('Tracking.iot_monitoring')}</h4>
                                    <span className="text-[10px] font-bold text-primary/60">GFTB-Live-Data-Stream</span>
                                </div>
                                <TelemetryChart data={telemetryData} />
                            </div>
                        </Card>

                        {/* Control Center */}
                        <Card className="rounded-[3rem] glass border-primary/10 shadow-2xl flex flex-col items-stretch overflow-hidden">
                            <CardHeader className="p-10">
                                <CardTitle className="text-3xl font-serif font-black italic text-foreground/90">{t('Dashboard.action_center')}</CardTitle>
                                <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mt-2">{t('Dashboard.action_desc')}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-10 pt-0 flex-1 flex flex-col gap-8">
                                {selectedId && blockchainStatus ? (
                                    <>
                                        <div className="flex-1">
                                            <BlockchainControls
                                                batchId={selectedId}
                                                blockchainStatus={blockchainStatus}
                                                onRefresh={() => window.location.reload()}
                                            />
                                        </div>
                                        <div className="pt-8 border-t border-primary/10">
                                            <Button
                                                variant="outline"
                                                className="w-full h-20 rounded-[2rem] border-primary/20 bg-background/50 text-foreground hover:bg-primary/5 font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                onClick={() => window.open(`/${t.raw('locale')}/verify/${selectedId}`, '_blank')}
                                            >
                                                <Search className="mr-3 h-6 w-6 text-primary/40" />
                                                View Digital Twin
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30 grayscale">
                                        <div className="h-24 w-24 rounded-[2rem] bg-muted/20 flex items-center justify-center mb-6">
                                            <Box className="h-12 w-12 text-muted-foreground" />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest">Select a batch to initialize controls</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatusMetric({ icon, title, value, subText, isAlert }: { icon: React.ReactNode, title: string, value: string, subText: string, isAlert?: boolean }) {
    return (
        <Card className={`rounded-[2.5rem] glass transition-all hover:scale-[1.02] border-primary/5 shadow-xl hover:shadow-primary/5 ${isAlert ? 'border-destructive/30' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-8 pt-8">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{title}</CardTitle>
                <div className="h-10 w-10 rounded-2xl bg-primary/5 flex items-center justify-center">{icon}</div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
                <div className={`text-3xl font-serif font-black italic tracking-tight ${isAlert ? 'text-destructive underline decoration-destructive/20 underline-offset-8' : 'text-foreground'}`}>
                    {value}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-3">{subText}</p>
            </CardContent>
        </Card>
    );
}
