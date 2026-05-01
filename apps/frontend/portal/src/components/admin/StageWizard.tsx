'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Zap, 
    ArrowRight, 
    Package, 
    Truck, 
    Warehouse, 
    CheckCircle,
    AlertCircle,
    Loader2,
    Search
} from 'lucide-react';
import { useState } from 'react';
import { BatchDetails, advanceBatchDemo, reportViolation } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface StageWizardProps {
    batches: BatchDetails[];
}

export function StageWizard({ batches }: StageWizardProps) {
    const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || '');
    const [loading, setLoading] = useState<string | null>(null);

    const selectedBatch = batches.find(b => b.id === selectedBatchId);

    const handleAdvance = async (targetRole: 'LOGISTICS' | 'RETAILER') => {
        if (!selectedBatchId) return;
        setLoading(targetRole);
        try {
            const res = await advanceBatchDemo(selectedBatchId, targetRole);
            alert(`Succesfully advanced to ${targetRole}. TX: ${res.txHash}`);
            window.location.reload(); // Refresh to show new state
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(null);
        }
    };

    const handleTriggerViolation = async () => {
        if (!selectedBatchId) return;
        setLoading('violation');
        try {
            const res = await reportViolation(selectedBatchId, "Demo Violation: Critical temperature threshold exceeded (+12°C above limit)");
            alert(`Violation Reported: ${res.txHash}`);
            window.location.reload();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(null);
        }
    };

    const stages = [
        { name: 'Производство (Manufacturer)', icon: Package, role: 'MANUFACTURER', status: 'completed' },
        { name: 'Логистика (Transit)', icon: Truck, role: 'LOGISTICS', status: selectedBatch?.history?.some(h => h.stage === 'Логистика') ? 'completed' : 'pending' },
        { name: 'Дистрибьютор (Importer)', icon: Warehouse, role: 'RETAILER', status: selectedBatch?.history?.some(h => h.stage === 'Дистрибуция') ? 'completed' : 'pending' },
        { name: 'Конечный потребитель', icon: CheckCircle, role: 'END_USER', status: 'pending' },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            {/* Wizard Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest">
                    <Zap size={14} className="animate-pulse" />
                    Admin Simulation Environment
                </div>
                <h1 className="text-5xl font-serif font-black italic tracking-tighter uppercase">
                    Stage Wizard
                </h1>
                <p className="text-muted-foreground/60 text-sm max-w-lg mx-auto">
                    Bypass physical world constraints and simulate end-to-end supply chain transitions for partners and clients.
                </p>
                <div className="pt-4">
                    {selectedBatchId && (
                        <a href={`/en/batches/${selectedBatchId}`} target="_blank">
                            <Button variant="outline" className="rounded-full px-8 text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5">
                                <Search className="mr-2" size={14} />
                                View Digital Passport (Consumer View)
                            </Button>
                        </a>
                    )}
                </div>
            </div>

            {/* Selection Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <Card className="rounded-[2.5rem] border-primary/5 glass p-8 space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">1. Target Selection</h3>
                    <div className="space-y-4">
                        <p className="text-xs font-bold">Select Active Batch</p>
                        <div className="space-y-2 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                            {batches.map(batch => (
                                <button
                                    key={batch.id}
                                    onClick={() => setSelectedBatchId(batch.id)}
                                    className={`w-full p-4 rounded-2xl text-left transition-all border ${
                                        selectedBatchId === batch.id 
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-xl' 
                                            : 'bg-white/40 border-primary/5 hover:border-primary/20'
                                    }`}
                                >
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">
                                        {batch.product_type}
                                    </p>
                                    <p className="text-sm font-serif font-black italic truncate">
                                        #{batch.id.slice(0, 12).toUpperCase()}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Execution Area */}
                <div className="md:col-span-2 space-y-8">
                    <Card className="rounded-[3rem] border-primary/5 glass overflow-hidden">
                        <CardHeader className="p-10 border-b border-primary/5 bg-slate-900 text-white">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-2xl font-serif font-black italic tracking-tighter">Current Lifecycle State</CardTitle>
                                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-white/30">
                                        Blockchain Notarized Progress
                                    </CardDescription>
                                </div>
                                <Badge className="bg-emerald-500 text-white border-0 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    LIVE SYNC
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10">
                            <div className="flex justify-between items-center relative mb-20">
                                {/* Connector Line */}
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
                                
                                {stages.map((stage, idx) => (
                                    <div key={idx} className="relative z-10 flex flex-col items-center gap-4">
                                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center border-4 transition-all duration-500 ${
                                            stage.status === 'completed' 
                                                ? 'bg-emerald-500 border-emerald-100 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                                                : 'bg-white border-slate-100 text-slate-300'
                                        }`}>
                                            <stage.icon size={24} />
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${stage.status === 'completed' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                {stage.name}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Button 
                                    onClick={() => handleAdvance('LOGISTICS')}
                                    disabled={loading !== null}
                                    className="h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] group shadow-xl"
                                >
                                    {loading === 'LOGISTICS' ? <Loader2 className="animate-spin" /> : (
                                        <>
                                            Handover to Logistics
                                            <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={16} />
                                        </>
                                    )}
                                </Button>
                                <Button 
                                    onClick={() => handleAdvance('RETAILER')}
                                    disabled={loading !== null}
                                    className="h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] group shadow-xl"
                                >
                                    {loading === 'RETAILER' ? <Loader2 className="animate-spin" /> : (
                                        <>
                                            Handover to Distributor
                                            <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={16} />
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div className="mt-8 p-8 border-t border-dashed border-primary/10 bg-rose-50/50 rounded-[2.5rem]">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                            <AlertCircle size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black uppercase tracking-widest text-rose-600">Chaos Engineering</h4>
                                            <p className="text-[10px] font-medium text-rose-600/60 uppercase tracking-widest">Simulate critical SLA breach</p>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={handleTriggerViolation}
                                        disabled={loading !== null}
                                        variant="outline" 
                                        className="h-12 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest px-8 transition-all"
                                    >
                                        {loading === 'violation' ? <Loader2 className="animate-spin" /> : 'Trigger Violation'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
