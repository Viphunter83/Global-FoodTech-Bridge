"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getBlockchainStatus, getTelemetry, BlockchainStatus, Telemetry } from '@/lib/api';
import { Loader2, CheckCircle, ShieldCheck, MapPin, Thermometer, Leaf, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { TelemetryChart } from '@/components/ui/TelemetryChart';

export default function VerifyPage() {
    const params = useParams();
    const batchId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<BlockchainStatus | null>(null);
    const [telemetry, setTelemetry] = useState<Telemetry[]>([]);

    useEffect(() => {
        if (!batchId) return;

        const fetchData = async () => {
            const [bcData, telemData] = await Promise.all([
                getBlockchainStatus(batchId),
                getTelemetry(batchId)
            ]);
            setStatus(bcData);
            setTelemetry(telemData);
            setLoading(false);
        };

        fetchData();
    }, [batchId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-12 w-12 animate-spin text-green-600" />
            </div>
        );
    }

    if (!status || !status.verified) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                <ShieldCheck className="h-20 w-20 text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800">Product Not Verified</h1>
                <p className="text-gray-500">This product does not have a valid digital passport record.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* HERRO SECTION */}
            <div className="bg-gradient-to-b from-green-600 to-green-500 text-white p-8 rounded-b-[3rem] shadow-xl">
                <div className="max-w-md mx-auto text-center space-y-4">
                    <div className="bg-white/20 backdrop-blur-md rounded-full p-2 w-fit mx-auto border border-white/30">
                        <div className="bg-white text-green-600 rounded-full p-3 shadow-lg">
                            <CheckCircle className="h-10 w-10" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Authentic Product</h1>
                        <p className="opacity-90 font-medium text-lg mt-1">Global FoodTech Bridge Verified</p>
                    </div>
                    <div className="flex justify-center gap-2 text-sm font-mono opacity-75">
                        <span>ID: {batchId.substring(0, 8)}...</span>
                        <span>•</span>
                        <span>Polygon Network</span>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 -mt-8 space-y-6">

                {/* 1. PRODUCT CARD */}
                <Card className="shadow-lg border-0">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Product</p>
                                <h2 className="text-xl font-bold text-gray-900">Pho Bo Soup Premium</h2>
                                <p className="text-gray-600 text-sm">Batch #4021A</p>
                            </div>
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                                PREMIUM
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                    <Leaf className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-gray-500 font-bold">Carbon</p>
                                    <p className="font-semibold text-sm">0.4 kg</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-gray-500 font-bold">Halal</p>
                                    <p className="font-semibold text-sm">Certified</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. JOURNEY MAP */}
                <Card className="shadow-md border-0">
                    <CardContent className="p-6">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center">
                            <MapPin className="h-5 w-5 mr-2 text-green-600" />
                            Journey History
                        </h3>

                        <div className="relative pl-6 border-l-2 border-green-200 space-y-8">
                            {/* Step 1 */}
                            <div className="relative">
                                <div className="absolute -left-[29px] top-0 bg-green-600 h-4 w-4 rounded-full border-4 border-white shadow-sm"></div>
                                <p className="text-xs text-gray-500 font-bold mb-1">2026-01-01 08:30</p>
                                <h4 className="font-semibold text-gray-800">Production Completed</h4>
                                <p className="text-sm text-gray-600">Moscow, RU • Factory A</p>
                            </div>
                            {/* Step 2 */}
                            <div className="relative">
                                <div className="absolute -left-[29px] top-0 bg-green-600 h-4 w-4 rounded-full border-4 border-white shadow-sm"></div>
                                <p className="text-xs text-gray-500 font-bold mb-1">2026-01-02 14:15</p>
                                <h4 className="font-semibold text-gray-800">Logistics Hub Departure</h4>
                                <p className="text-sm text-gray-600">Dispatched via Cold Truck</p>
                            </div>
                            {/* Step 3 */}
                            <div className="relative">
                                <div className="absolute -left-[29px] top-0 bg-green-600 h-4 w-4 rounded-full border-4 border-white shadow-sm"></div>
                                <p className="text-xs text-gray-500 font-bold mb-1">2026-01-03 09:00</p>
                                <h4 className="font-semibold text-gray-800">Arrived at Retailer</h4>
                                <p className="text-sm text-gray-600">Dubai, UAE • Warehouse 4</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. TEMPERATURE PROOF */}
                <Card className="shadow-md border-0">
                    <CardContent className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
                            <span className="flex items-center">
                                <Thermometer className="h-5 w-5 mr-2 text-blue-600" />
                                Cold Chain Proof
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">IoT Data</span>
                        </h3>
                        <div className="h-40 w-full">
                            <TelemetryChart data={telemetry} />
                        </div>
                        <p className="text-xs text-gray-500 mt-4 text-center">
                            Recorded every 15 mins by Tive™ IoT Sensor
                        </p>
                    </CardContent>
                </Card>

                <div className="text-center pb-8 pt-4">
                    <p className="text-xs text-gray-400">Powered by Global FoodTech Bridge Blockchain</p>
                </div>

            </div>
        </div>
    );
}
