'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { getBatchDetails, getBlockchainStatus, getTelemetry, getAlerts, BatchDetails, BlockchainStatus, Telemetry, Alert } from '@/lib/api';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DashboardMap } from "@/components/ui/DashboardMap";
const TelemetryChart = dynamic(
    () => import("@/components/ui/TelemetryChart").then((mod) => mod.TelemetryChart),
    { ssr: false, loading: () => <div className="h-[300px] w-full bg-primary/5 animate-pulse rounded-2xl" /> }
);
import { BlockchainControls } from "@/components/ui/BlockchainControls";
import { Plus, Search, MapPin, Thermometer, Box, Truck, AlertTriangle, Trash2, Package, LayoutDashboard } from 'lucide-react';
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
import { motion } from 'framer-motion';

const MOCK_BATCHES = [
    { id: '902f1e4c-3861-458d-8e76-7054b86c0cf1', product_type: 'Pho_Bo_Soup', status: 'In Transit', location: 'Dubai, UAE', temperature: -20.5, last_updated: '2024-10-15T10:30:00Z' },
    { id: 'batch-002', product_type: 'Wagyu_Beef', status: 'Delivered', location: 'Riyadh, KSA', temperature: -18.2, last_updated: '2024-10-14T09:15:00Z' },
    { id: 'batch-003', product_type: 'Organic_Chicken', status: 'Processing', location: 'Hanoi, VN', temperature: -4.0, last_updated: '2024-10-16T08:00:00Z' },
];

export default function DashboardPage() {
    const { t } = useLanguage();
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
        });
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
        <div className="min-h-screen bg-background">
            <main className="grid flex-1 gap-4 p-4 md:grid-cols-[320px_1fr] md:gap-8 md:p-8">
                {/* Left Sidebar: Batch List */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-serif font-bold tracking-tight">{t('dashboard_active_batches')}</h2>
                        {role === 'MANUFACTURER' && (
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="rounded-full premium-gradient text-white border-0 shadow-lg shadow-primary/20">
                                        <Plus className="h-4 w-4 mr-1" /> {t('dashboard_new')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] rounded-[2rem] glass">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-serif">{t('dashboard_new')}</DialogTitle>
                                        <DialogDescription>
                                            Enter batch details and pair with IoT sensor.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="sku">SKU</Label>
                                            <Select
                                                defaultValue={newBatchData.sku}
                                                onValueChange={(val) => setNewBatchData({ ...newBatchData, sku: val })}
                                            >
                                                <SelectTrigger className="rounded-xl h-12 bg-background/50">
                                                    <SelectValue placeholder="Select product" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="Pho Bo Soup Premium">Pho Bo Soup Premium</SelectItem>
                                                    <SelectItem value="Ramen Tonkotsu">Ramen Tonkotsu</SelectItem>
                                                    <SelectItem value="Udon Noodle Kit">Udon Noodle Kit</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bs-raw">Raw Material Origin</Label>
                                            <Input
                                                id="bs-raw"
                                                placeholder="e.g. Beef Batch #991"
                                                className="rounded-xl h-12 bg-background/50"
                                                value={newBatchData.rawMaterial}
                                                onChange={(e) => setNewBatchData({ ...newBatchData, rawMaterial: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bs-date">Production Date</Label>
                                            <Input
                                                id="bs-date"
                                                type="date"
                                                className="rounded-xl h-12 bg-background/50"
                                                value={newBatchData.productionDate}
                                                onChange={(e) => setNewBatchData({ ...newBatchData, productionDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2 border-t border-primary/10 pt-4 mt-2">
                                            <Label htmlFor="sensor" className="font-bold text-secondary">
                                                IoT Sensor ID
                                            </Label>
                                            <Input
                                                id="sensor"
                                                placeholder="Scan TIVE / Emerson..."
                                                className="rounded-xl h-12 bg-secondary/5 border-secondary/20 focus:border-secondary"
                                                value={newBatchData.sensorId}
                                                onChange={(e) => setNewBatchData({ ...newBatchData, sensorId: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleCreateBatch} className="w-full h-12 rounded-xl premium-gradient text-white font-bold text-lg">
                                            Create & Pair
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
                        {batches.map((batch) => (
                            <motion.div
                                key={batch.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedId(batch.id)}
                                className={`
                                    group flex flex-col p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden
                                    ${selectedId === batch.id 
                                        ? "glass border-primary/40 shadow-xl shadow-primary/5 ring-1 ring-primary/20" 
                                        : "bg-background border-primary/5 hover:border-primary/20 hover:bg-primary/5"}
                                `}
                            >
                                {selectedId === batch.id && (
                                    <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
                                )}
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${batch.status === 'In Transit' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                                        {batch.status}
                                    </span>
                                    {batch.status === 'Draft' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteBatch(batch.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <h3 className="font-serif font-bold text-lg truncate mb-1">{batch.product_type.replace(/_/g, ' ')}</h3>
                                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium uppercase tracking-tighter">
                                    <span>#{batch.id.substring(0, 8)}</span>
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
                            title={t('status_blockchain')}
                            value={loadingStatus ? 'Checking...' : (blockchainStatus?.violation ? t('bc_violation_title') : (blockchainStatus?.verified ? t('status_connection_secured') : t('status_connection_pending')))}
                            subText={blockchainStatus?.txHash ? `Tx: ${blockchainStatus.txHash.substring(0, 10)}...` : 'Unverified Ledger'}
                            isAlert={!!blockchainStatus?.violation}
                        />
                        <StatusMetric 
                            icon={<MapPin className="h-5 w-5 text-primary" />}
                            title={t('location_current')}
                            value={selectedBatch?.location || 'Awaiting Link'}
                            subText={t('location_updated_iot')}
                        />
                        <StatusMetric 
                            icon={<Thermometer className="h-5 w-5 text-primary" />}
                            title={t('temp_title')}
                            value={currentTemp !== null ? `${currentTemp}°C` : '--'}
                            subText={t('temp_optimal')}
                            isAlert={Number(currentTemp) > -18}
                        />
                    </div>

                    {/* Alerts Section */}
                    {alerts.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 border-l-[12px] border-l-destructive"
                        >
                            <div className="flex items-start gap-4">
                                <AlertTriangle className="h-8 w-8 text-destructive animate-pulse" />
                                <div className="flex-1">
                                    <h3 className="text-xl font-serif font-bold text-destructive mb-3">{t('sla_violations_title')}</h3>
                                    <div className="grid gap-3">
                                        {alerts.slice(0, 2).map((alert: any) => (
                                            <div key={alert.id} className="flex items-center justify-between text-sm bg-destructive/10 p-3 rounded-xl border border-destructive/10">
                                                <span className="font-bold">{alert.message}</span>
                                                <span className="text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleTimeString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Interactive Map & Telemetry Row */}
                    <div className="grid gap-8 lg:grid-cols-3">
                        <Card className="lg:col-span-2 rounded-[2.5rem] overflow-hidden glass border-primary/10 shadow-2xl">
                            <CardHeader className="p-8 pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-3xl font-serif">{t('live_tracking')}</CardTitle>
                                        <CardDescription>{t('live_tracking_desc')}</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary">
                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                        Satellite Link Active
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 h-[400px]">
                                <DashboardMap locationName={selectedBatch?.location} />
                            </CardContent>
                            <div className="p-8 bg-background/20 backdrop-blur-sm border-t border-primary/5">
                                <TelemetryChart data={telemetryData} />
                            </div>
                        </Card>

                        {/* Control Center */}
                        <Card className="rounded-[2.5rem] glass border-primary/10 shadow-2xl flex flex-col items-stretch">
                            <CardHeader className="p-8">
                                <CardTitle className="text-2xl font-serif">{t('action_center')}</CardTitle>
                                <CardDescription>{t('action_desc')}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 flex-1 space-y-6">
                                {selectedId && blockchainStatus ? (
                                    <>
                                        <BlockchainControls
                                            batchId={selectedId}
                                            blockchainStatus={blockchainStatus}
                                            onRefresh={() => window.location.reload()}
                                        />
                                        <div className="pt-6 border-t border-primary/10">
                                            <Button
                                                variant="outline"
                                                className="w-full h-16 rounded-2xl border-secondary/30 text-secondary hover:bg-secondary/5 font-bold shadow-sm"
                                                onClick={() => window.open(`/scan/${selectedId}`, '_blank')}
                                            >
                                                <Search className="mr-3 h-5 w-5" />
                                                View Digital Twin
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-50 grayscale">
                                        <Box className="h-16 w-16 mb-4 text-muted-foreground" />
                                        <p className="text-sm font-medium">Select a batch to initialize controls</p>
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
        <Card className={`rounded-[2rem] glass transition-all hover:scale-[1.02] border-primary/5 ${isAlert ? 'border-destructive/30' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-3 px-6 pt-6">
                <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
                <div className="p-2 rounded-lg bg-primary/5">{icon}</div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
                <div className={`text-2xl font-serif font-bold ${isAlert ? 'text-destructive' : 'text-foreground'}`}>
                    {value}
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{subText}</p>
            </CardContent>
        </Card>
    );
}
