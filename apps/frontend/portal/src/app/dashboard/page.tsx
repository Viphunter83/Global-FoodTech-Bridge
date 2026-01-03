'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { getBatchDetails, getBlockchainStatus, getTelemetry, getAlerts, BatchDetails, BlockchainStatus, Telemetry, Alert } from '@/lib/api';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DashboardMap } from "@/components/ui/DashboardMap";
import { TelemetryChart } from "@/components/ui/TelemetryChart";
import { BlockchainControls } from "@/components/ui/BlockchainControls";
import { Plus, Search, MapPin, Thermometer, Box, Truck, AlertTriangle, Trash2, Package } from 'lucide-react';
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

// ... imports remain same ...

// ... imports remain same ...

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

    // Derive current temperature from latest telemetry or batch data
    const currentTemp = telemetryData.length > 0
        ? telemetryData[telemetryData.length - 1].temperature_celsius
        : (selectedBatch?.temperature || null);


    // New Batch Form State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newBatchData, setNewBatchData] = useState({
        sku: 'Pho Bo Soup Premium',
        productionDate: new Date().toISOString().split('T')[0],
        rawMaterial: '',
        sensorId: ''
    });

    // ... lifecycle hooks ...

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
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
            {/* Dashboard Toolbar Removed (Duplicate of Global Header) */}

            <main className="grid flex-1 gap-4 p-4 md:grid-cols-[300px_1fr] md:gap-8 md:p-8">
                {/* Left Sidebar: Batch List */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-lg font-semibold">{t('dashboard_active_batches')}</h2>
                        {role === 'MANUFACTURER' && (
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                        <Plus className="h-4 w-4 mr-1" /> {t('dashboard_new')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Create New Batch</DialogTitle>
                                        <DialogDescription>
                                            Enter batch details and pair with IoT sensor.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="sku" className="text-right">
                                                SKU
                                            </Label>
                                            <Select
                                                defaultValue={newBatchData.sku}
                                                onValueChange={(val) => setNewBatchData({ ...newBatchData, sku: val })}
                                            >
                                                <SelectTrigger className="col-span-3">
                                                    <SelectValue placeholder="Select product" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Pho Bo Soup Premium">Pho Bo Soup Premium</SelectItem>
                                                    <SelectItem value="Ramen Tonkotsu">Ramen Tonkotsu</SelectItem>
                                                    <SelectItem value="Udon Noodle Kit">Udon Noodle Kit</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="bs-raw" className="text-right">
                                                Raw Mat.
                                            </Label>
                                            <Input
                                                id="bs-raw"
                                                placeholder="e.g. Beef Batch #991"
                                                className="col-span-3"
                                                value={newBatchData.rawMaterial}
                                                onChange={(e) => setNewBatchData({ ...newBatchData, rawMaterial: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="bs-date" className="text-right">
                                                Date
                                            </Label>
                                            <Input
                                                id="bs-date"
                                                type="date"
                                                className="col-span-3"
                                                value={newBatchData.productionDate}
                                                onChange={(e) => setNewBatchData({ ...newBatchData, productionDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4 border-t pt-4 mt-2">
                                            <Label htmlFor="sensor" className="text-right font-bold text-blue-600">
                                                Sensor ID
                                            </Label>
                                            <Input
                                                id="sensor"
                                                placeholder="Scan TIVE Sensor..."
                                                className="col-span-3 ring-1 ring-blue-200"
                                                value={newBatchData.sensorId}
                                                onChange={(e) => setNewBatchData({ ...newBatchData, sensorId: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleCreateBatch}>Create & Pair</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    <div className="grid gap-2">
                        {batches.map((batch) => (
                            <div
                                key={batch.id}
                                onClick={() => setSelectedId(batch.id)}
                                className={`
                                    group flex flex-col items-start gap-1 rounded-lg border p-3 text-left text-sm transition-all hover:bg-slate-100 cursor-pointer relative
                                    ${selectedId === batch.id ? "bg-slate-100 border-blue-500 ring-1 ring-blue-500" : "bg-white border-slate-200"}
                                `}
                            >
                                <div className="flex w-full flex-col gap-1">
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-2">
                                            <div className="font-semibold">{batch.product_type}</div>
                                        </div>
                                        {batch.status === 'Draft' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteBatch(batch.id);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <div className={`text-xs ${batch.status === 'Draft' ? 'mr-0' : 'ml-auto'} text-gray-500`}>{new Date(batch.last_updated || "").toLocaleDateString()}</div>
                                    </div>
                                    <div className="text-xs text-gray-500 font-mono truncate w-full" title={batch.id}>
                                        UUID: {batch.id.substring(0, 8)}...
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col gap-6">
                    {/* Hero Status Card */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">{t('status_blockchain')}</CardTitle>
                                <Package className="h-4 w-4 text-gray-500" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${blockchainStatus?.violation ? 'text-red-600' : ''}`}>
                                    {loadingStatus ? 'Loading...' : (
                                        blockchainStatus?.violation ? t('bc_violation_title') :
                                            (blockchainStatus?.verified ? t('status_connection_secured') : t('status_connection_pending'))
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">
                                    {blockchainStatus?.txHash ? `Tx: ${blockchainStatus.txHash.substring(0, 10)}...` : 'Not yet notarized'}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">{t('location_current')}</CardTitle>
                                <MapPin className="h-4 w-4 text-gray-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{selectedBatch?.location || 'Unknown'}</div>
                                <p className="text-xs text-gray-500">{t('location_updated_iot')}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">{t('temp_title')}</CardTitle>
                                <Truck className="h-4 w-4 text-gray-500" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${Number(currentTemp) > -18 ? 'text-red-500' : 'text-green-600'}`}>
                                    {currentTemp !== null ? `${currentTemp}°C` : '--'}
                                </div>
                                <p className="text-xs text-gray-500">{t('temp_optimal')}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Alerts Banner - SIMPLIFIED STYLES */}
                    {alerts.length > 0 && (
                        <div
                            className="rounded-xl border-2 border-red-500 bg-red-100 p-4 mb-6"
                            style={{ display: 'block', visibility: 'visible', opacity: 1, zIndex: 9999 }}
                        >
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <AlertTriangle className="h-6 w-6 text-red-700" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-bold text-red-800">{t('sla_violations_title')}</h3>
                                    <div className="mt-2 text-base text-red-900">
                                        <ul role="list" className="list-disc space-y-1 pl-5">
                                            {alerts.slice(0, 3).map((alert: any) => (
                                                <li key={alert.id}>
                                                    <span className="font-semibold">{new Date(alert.created_at).toLocaleTimeString()}:</span> {alert.message}
                                                </li>
                                            ))}
                                            {alerts.length > 3 && (
                                                <li>...and {alerts.length - 3} more</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Interactive Map & Controls */}
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Map & Telemetry Section */}
                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('live_tracking')}</CardTitle>
                                    <CardDescription>{t('live_tracking_desc')}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 overflow-hidden">
                                    <DashboardMap locationName={selectedBatch?.location} />
                                </CardContent>
                            </Card>

                            {/* Telemetry Chart */}
                            <TelemetryChart data={telemetryData} />
                        </div>

                        {/* Action Center */}
                        <Card className="h-fit">
                            <CardHeader>
                                <CardTitle>{t('action_center')}</CardTitle>
                                <CardDescription>{t('action_desc')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedId && blockchainStatus && (
                                    <BlockchainControls
                                        batchId={selectedId}
                                        blockchainStatus={blockchainStatus}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
