'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import { DashboardMap } from '@/components/ui/DashboardMap';
import { TelemetryChart } from '@/components/ui/TelemetryChart';
import { BlockchainControls } from '@/components/ui/BlockchainControls';
import { Package, Plus, Search, Calendar, MapPin, Truck } from 'lucide-react';
import { getBlockchainStatus, getTelemetry, BlockchainStatus, Telemetry } from '@/lib/api';
import { useLanguage } from '@/components/providers/LanguageProvider';

// Mock Data for Dashboard Listing
const MOCK_BATCHES = [
    { id: '902f1e4c-3861-458d-8e76-7054b86c0cf1', product: 'Premium Dairy #402', date: '2023-10-25', status: 'In Transit', location: 'Lyon, FR' },
    { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', product: 'Organic Meat #881', date: '2023-10-26', status: 'Registered', location: 'Munich, DE' },
    { id: 'f1e2d3c4-b5a6-9780-4321-098765fedcba', product: 'Seafood Invoice #99', date: '2023-10-24', status: 'Delivered', location: 'Paris, FR' },
];

export default function DashboardPage() {
    const { t } = useLanguage();
    const [batches, setBatches] = useState(MOCK_BATCHES);
    const [selectedId, setSelectedId] = useState<string>(MOCK_BATCHES[0].id);
    const [blockchainStatus, setBlockchainStatus] = useState<BlockchainStatus | null>(null);
    const [telemetryData, setTelemetryData] = useState<Telemetry[]>([]);
    const [loadingStatus, setLoadingStatus] = useState(false);

    // Fetch blockchain status and telemetry when selected batch changes
    useEffect(() => {
        if (!selectedId) return;

        async function fetchData() {
            setLoadingStatus(true);
            const [status, telemetry] = await Promise.all([
                getBlockchainStatus(selectedId),
                getTelemetry(selectedId)
            ]);
            setBlockchainStatus(status);
            setTelemetryData(telemetry);
            setLoadingStatus(false);
        }

        fetchData();

        // Poll for telemetry updates every 5 seconds
        const interval = setInterval(async () => {
            const telemetry = await getTelemetry(selectedId);
            setTelemetryData(telemetry);
        }, 5000);

        return () => clearInterval(interval);

    }, [selectedId]);

    const selectedBatch = batches.find(b => b.id === selectedId);

    // Calculate current temp from latest telemetry
    const currentTemp = telemetryData.length > 0 ? telemetryData[telemetryData.length - 1].temperature_celsius : null;

    const handleCreateBatch = () => {
        const newId = crypto.randomUUID();
        const newBatch = {
            id: newId,
            product: `New Batch #${Math.floor(Math.random() * 1000)}`,
            date: new Date().toISOString().split('T')[0],
            status: 'Draft',
            location: 'Warehouse A'
        };
        setBatches([newBatch, ...batches]);
        setSelectedId(newId);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
            {/* Dashboard Toolbar */}
            <div className="flex items-center justify-between border-b bg-white dark:bg-gray-950 px-6 py-3 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
                    <Package className="h-6 w-6" />
                    <span>SupplyChain<span className="text-gray-900 dark:text-gray-100">OS</span></span>
                </div>
                <div className="flex items-center gap-4">
                    <RoleSwitcher />
                </div>
            </div>

            <main className="grid flex-1 gap-4 p-4 md:grid-cols-[300px_1fr] md:gap-8 md:p-8">
                {/* Left Sidebar: Batch List */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-lg font-semibold">{t('dashboard_active_batches')}</h2>
                        <Button size="sm" variant="outline" onClick={handleCreateBatch}>
                            <Plus className="h-4 w-4 mr-1" /> {t('dashboard_new')}
                        </Button>
                    </div>

                    <div className="grid gap-2">
                        {batches.map((batch) => (
                            <div
                                key={batch.id}
                                onClick={() => setSelectedId(batch.id)}
                                className={`
                                    flex flex-col items-start gap-1 rounded-lg border p-3 text-left text-sm transition-all hover:bg-slate-100 cursor-pointer
                                    ${selectedId === batch.id ? "bg-slate-100 border-blue-500 ring-1 ring-blue-500" : "bg-white border-slate-200"}
                                `}
                            >
                                <div className="flex w-full flex-col gap-1">
                                    <div className="flex items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="font-semibold">{batch.product}</div>
                                        </div>
                                        <div className="ml-auto text-xs text-gray-500">{batch.date}</div>
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
                                <div className="text-2xl font-bold">
                                    {loadingStatus ? 'Loading...' : (blockchainStatus?.verified ? t('status_connection_secured') : t('status_connection_pending'))}
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

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="text-xs text-gray-400 mb-2">Technician Data</div>
                                    <div className="bg-slate-100 p-2 rounded text-xs font-mono break-all text-gray-600">
                                        Batch ID: <br />{selectedId}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
