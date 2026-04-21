"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getBlockchainStatus, getTelemetry, getBlockchainHistory, BlockchainStatus, Telemetry, BlockchainEvent } from '@/lib/api';
import { Loader2, CheckCircle, ShieldCheck, MapPin, Thermometer, Leaf, Calendar, History } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { BlockchainProof } from '@/components/blockchain/BlockchainProof';
import { BlockchainHistory } from '@/components/blockchain/BlockchainHistory';

const TelemetryChart = dynamic<{ data: Telemetry[] }>(
    () => import('@/components/ui/TelemetryChart'),
    { ssr: false, loading: () => <div className="h-40 w-full bg-gray-50 animate-pulse rounded-md" /> }
);

export default function VerifyPage() {
    const params = useParams();
    const batchId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [batch, setBatch] = useState<any>(null);
    const [status, setStatus] = useState<BlockchainStatus | null>(null);
    const [telemetry, setTelemetry] = useState<Telemetry[]>([]);
    const [bcHistory, setBcHistory] = useState<BlockchainEvent[]>([]);

    const fetchData = async (silent = false) => {
        if (!batchId) return;
        if (!silent) setLoading(true);
        
        try {
            const [batchData, bcData, telemData, historyData] = await Promise.all([
                import('@/lib/api').then(mod => mod.getBatchDetails(batchId)),
                import('@/lib/api').then(mod => mod.getBlockchainStatus(batchId)),
                import('@/lib/api').then(mod => mod.getTelemetry(batchId)),
                import('@/lib/api').then(mod => mod.getBlockchainHistory(batchId))
            ]);
            
            setBatch(batchData);
            setStatus(bcData);
            setTelemetry(telemData);
            setBcHistory(historyData);
        } catch (error) {
            console.error("Verification data fetch failed:", error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        
        // Polling for live telemetry (every 15s)
        const interval = setInterval(() => fetchData(true), 15000);
        return () => clearInterval(interval);
    }, [batchId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-12 w-12 animate-spin text-green-600" />
            </div>
        );
    }

    if (!status || !status.verified || !batch) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                <ShieldCheck className="h-20 w-20 text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800">Product Not Verified</h1>
                <p className="text-gray-500">This product does not have a valid digital passport record.</p>
            </div>
        );
    }

    // Dynamic metrics derivation
    const displayMetrics = batch.trust_metrics || [
        { label: 'Carbon', value: '0.4 kg', icon: <Leaf className="h-5 w-5" />, color: 'bg-blue-100 text-blue-600' },
        { label: 'Authenticity', value: 'Blockchain Verified', icon: <ShieldCheck className="h-5 w-5" />, color: 'bg-purple-100 text-purple-600' }
    ];

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
                        <span>ID: {batch.id.substring(0, 8)}...</span>
                        <span>•</span>
                        <span>Polygon Mainnet</span>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 -mt-8 space-y-6">

                {/* 1. PRODUCT CARD */}
                <Card className="shadow-lg border-0 overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-green-400 to-emerald-600" />
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Digital Passport</p>
                                <h2 className="text-xl font-bold text-gray-900">{batch.product_type?.replace(/_/g, ' ') || 'Food Product'}</h2>
                                <p className="text-gray-500 text-xs font-mono">#{batch.id.substring(0, 8)}</p>
                            </div>
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-[10px] font-black italic tracking-tighter">
                                PREMIUM GRADE
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                            {displayMetrics.slice(0, 2).map((metric: any, i: number) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`${metric.color || 'bg-gray-100 text-gray-600'} p-2 rounded-xl`}>
                                        {metric.icon || <ShieldCheck className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-gray-400 font-bold">{metric.label}</p>
                                        <p className="font-bold text-sm text-gray-800">{metric.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. BLOCKCHAIN JOURNEY */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Immutable Timeline</h3>
                    <BlockchainHistory history={bcHistory} />
                </div>

                {/* 3. TEMPERATURE PROOF */}
                <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
                            <span className="flex items-center">
                                <Thermometer className="h-5 w-5 mr-2 text-blue-600" />
                                Cold Chain Proof
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-bold">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                LIVE IOT
                            </span>
                        </h3>
                        <div className="h-40 w-full">
                            <TelemetryChart data={telemetry} />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-4 text-center font-medium italic">
                            Verified by Tive™ IoT Sensors & Polygon Blockchain
                        </p>
                    </CardContent>
                </Card>

                {/* 4. BLOCKCHAIN PROOF & TRANSPARENCY */}
                <BlockchainProof 
                    batchId={batchId}
                    txHash={status.txHash}
                    dataHash={batch.token_uri?.replace('ipfs://', '')}
                    issuer={batch.manufacturer_id}
                    timestamp={new Date(batch.created_at).toLocaleString()}
                    violation={status.violation || undefined}
                />

                <div className="text-center pb-12 pt-4 space-y-2">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                        Powered by Global FoodTech Bridge
                    </p>
                    <div className="flex justify-center gap-4 opacity-30 grayscale grayscale-100 scale-75">
                         <ShieldCheck className="h-6 w-6" />
                         <Leaf className="h-6 w-6" />
                         <CheckCircle className="h-6 w-6" />
                    </div>
                </div>

            </div>
        </div>
    );
}
