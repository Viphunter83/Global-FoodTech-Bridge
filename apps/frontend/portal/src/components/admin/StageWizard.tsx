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
import { useState, useEffect } from 'react';
import { 
    BatchDetails, 
    reportViolation, 
    notarizeBatch, 
    initiateHandover, 
    acceptHandover, 
    getBlockchainAdminStatus,
    getBlockchainStatus,
    resetBatchDemo
} from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { refreshAdminData } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from 'next-intl';

interface StageWizardProps {
    batches: BatchDetails[];
}

export function StageWizard({ batches }: StageWizardProps) {
    const router = useRouter();
    const { getToken } = useAuth();
    const tAdmin = useTranslations('Admin');
    const tTracking = useTranslations('Tracking');
    const tAuth = useTranslations('Auth');
    const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || '');
    const [loading, setLoading] = useState<string | null>(null);
    const [adminStatus, setAdminStatus] = useState<any>(null);
    const [bcStatus, setBcStatus] = useState<any>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const selectedBatch = batches.find(b => b.id === selectedBatchId);

    useEffect(() => {
        const fetchMeta = async () => {
            // No longer explicitly fetching token to avoid blocking on Firebase SDK
            const [admin, status] = await Promise.all([
                getBlockchainAdminStatus(),
                selectedBatchId ? getBlockchainStatus(selectedBatchId) : null
            ]);
            setAdminStatus(admin);
            setBcStatus(status);
        };
        fetchMeta();
    }, [selectedBatchId, refreshKey]);

    const handleNotarize = async () => {
        if (!selectedBatchId) return;
        setLoading('notarize');
        try {
            const token = await getToken();
            const res = await notarizeBatch(selectedBatchId, `ipfs://metadata-${selectedBatchId}`, token ?? undefined);
            
            if (res.status === 'error' || res.error) {
                throw new Error(res.error || 'Notarization failed');
            }

            if (res.txHash) {
                toast.success(tAdmin('notarized_success'));
                setRefreshKey(prev => prev + 1);
                refreshAdminData();
                router.refresh();
            }
        } catch (err: any) {
            console.error('Notarize Error:', err);
            toast.error(err.message || tAdmin('notarization_failed'));
        } finally {
            setLoading(null);
        }
    };

    const handleInitiate = async (targetRole: 'LOGISTICS' | 'RETAILER') => {
        if (!selectedBatchId) return;
        if (!adminStatus) {
            toast.error(tAdmin('wallet_status_error'));
            return;
        }

        setLoading(`initiate-${targetRole}`);
        try {
            const targetAddress = targetRole === 'LOGISTICS' 
                ? adminStatus.wallets.find((w: any) => w.name.includes('Logistics'))?.address 
                : adminStatus.wallets.find((w: any) => w.name.includes('Retailer'))?.address;

            if (!targetAddress) {
                throw new Error(`Target address for ${targetRole} not found in admin wallets`);
            }

            const token = await getToken();
            const res = await initiateHandover(selectedBatchId, targetAddress, token ?? undefined);
            
            if (res.status === 'error' || res.error) {
                throw new Error(res.error || 'Initiation failed');
            }

            if (res.txHash) {
                const localizedRole = tAuth(`role_${targetRole.toLowerCase()}` as any);
                toast.success(tAdmin('handover_initiated', { role: localizedRole }));
                setRefreshKey(prev => prev + 1);
                refreshAdminData();
                router.refresh();
            }
        } catch (err: any) {
            console.error('Initiate Error:', err);
            toast.error(err.message || tAdmin('failed_to_initiate'));
        } finally {
            setLoading(null);
        }
    };

    const handleAccept = async () => {
        if (!selectedBatchId) return;
        setLoading('accept');
        try {
            const token = await getToken();
            const res = await acceptHandover(selectedBatchId, token ?? undefined);
            
            if (res.status === 'error' || res.error) {
                throw new Error(res.error || 'Acceptance failed');
            }

            if (res.txHash) {
                toast.success(tAdmin('ownership_transferred'));
                setRefreshKey(prev => prev + 1);
                refreshAdminData();
                router.refresh();
            }
        } catch (err: any) {
            console.error('Accept Error:', err);
            toast.error(err.message || tAdmin('failed_to_accept'));
        } finally {
            setLoading(null);
        }
    };

    const handleReset = async () => {
        if (!selectedBatchId) return;
        setLoading('reset');
        try {
            const token = await getToken();
            const promise = resetBatchDemo(selectedBatchId, token ?? undefined);
            toast.promise(promise, {
                loading: tAdmin('reset_loading'),
                success: () => {
                    setRefreshKey(prev => prev + 1);
                    refreshAdminData();
                    router.refresh();
                    return tAdmin('reset_success');
                },
                error: tAdmin('reset_failed')
            });
            await promise;
        } catch (err: any) {
            toast.error(tAdmin('auth_error', { msg: err.message }));
        } finally {
            setLoading(null);
        }
    };

    const handleTriggerViolation = async () => {
        if (!selectedBatchId) return;
        setLoading('violation');
        
        try {
            const token = await getToken();
            const demoMsg = tAdmin('demo_violation_msg');
            const promise = reportViolation(selectedBatchId, demoMsg, token ?? undefined);

            toast.promise(promise, {
                loading: tAdmin('notarizing_violation'),
                success: (data) => {
                    refreshAdminData();
                    router.refresh();
                    return tAdmin('violation_recorded', { tx: data.txHash?.slice(0, 10) || 'Confirmed' });
                },
                error: (err) => tAdmin('failed_to_report', { msg: err.message })
            });

            await promise;
        } catch (err: any) {
            toast.error(tAdmin('auth_error', { msg: err.message }));
        } finally {
            setLoading(null);
        }
    };

    const getStageStatus = (idx: number): 'completed' | 'current' | 'future' => {
        if (!bcStatus) return selectedBatch?.history?.[idx]?.status || 'future';
        
        const ownerRole = bcStatus.ownerRole || 'MANUFACTURER';
        
        if (ownerRole === 'MANUFACTURER') {
            return idx === 0 ? 'current' : 'future';
        } else if (ownerRole === 'LOGISTICS') {
            if (idx === 0) return 'completed';
            if (idx === 1) return 'current';
            return 'future';
        } else if (ownerRole === 'RETAILER') {
            if (idx <= 1) return 'completed';
            if (idx === 2) return 'current';
            return 'future';
        } else if (ownerRole === 'END_USER' || bcStatus.shippingStatus === 'Delivered') {
            return idx <= 2 ? 'completed' : 'current';
        }
        return 'future';
    };

    const stages = [
        { name: tTracking('stage_produced'), icon: Package, role: 'MANUFACTURER', status: getStageStatus(0) },
        { name: tTracking('in_transit'), icon: Truck, role: 'LOGISTICS', status: getStageStatus(1) },
        { name: tTracking('stage_quality'), icon: Warehouse, role: 'RETAILER', status: getStageStatus(2) },
        { name: tTracking('timeline_arrived_destination'), icon: CheckCircle, role: 'END_USER', status: getStageStatus(3) },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            {/* Wizard Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest">
                    <Zap size={14} className="animate-pulse" />
                    {tAdmin('admin_simulation_env')}
                </div>
                <h1 className="text-5xl font-serif font-black italic tracking-tighter uppercase">
                    {tAdmin('stage_wizard_title')}
                </h1>
                <p className="text-muted-foreground/60 text-sm max-w-lg mx-auto">
                    {tAdmin('stage_wizard_subtitle')}
                </p>
                <div className="pt-4">
                    {selectedBatchId && (
                        <a href={`/en/batches/${selectedBatchId}`} target="_blank">
                            <Button variant="outline" className="rounded-full px-8 text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5">
                                <Search className="mr-2" size={14} />
                                {tAdmin('view_digital_passport')}
                            </Button>
                        </a>
                    )}
                </div>
            </div>

            {/* Selection Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <Card className="rounded-[2.5rem] border-primary/5 glass p-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">{tAdmin('target_selection')}</h3>
                        {!adminStatus && <Loader2 className="animate-spin text-blue-500" size={14} />}
                    </div>
                    <div className="space-y-4">
                        <p className="text-xs font-bold">{tAdmin('select_active_batch')}</p>
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
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">
                                                {batch.product_type}
                                            </p>
                                            <p className="text-sm font-serif font-black italic truncate">
                                                #{batch.id.slice(0, 12).toUpperCase()}
                                            </p>
                                        </div>
                                        {selectedBatchId === batch.id && <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />}
                                    </div>
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
                                    <CardTitle className="text-2xl font-serif font-black italic tracking-tighter">{tAdmin('lifecycle_state')}</CardTitle>
                                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-white/30">
                                        {tAdmin('notarized_progress')}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    {bcStatus?.violation && (
                                        <Badge className="bg-rose-500 text-white border-0 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-bounce">
                                            {tAdmin('violation_detected')}
                                        </Badge>
                                    )}
                                    <Badge className="bg-emerald-500 text-white border-0 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        {tAdmin('live_sync')}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10">
                            {bcStatus?.violation && (
                                <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3">
                                    <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-1">{tAdmin('blockchain_alert')}</p>
                                        <p className="text-xs text-rose-600/80 font-medium">{bcStatus.violation}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-between items-center relative mb-20">
                                {/* Connector Line */}
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
                                
                                {stages.map((stage, idx) => (
                                    <div key={idx} className="relative z-10 flex flex-col items-center gap-4">
                                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center border-4 transition-all duration-500 ${
                                            stage.status === 'completed' 
                                                ? 'bg-emerald-500 border-emerald-100 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                                                : stage.status === 'current'
                                                ? 'bg-blue-600 border-blue-100 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] animate-pulse'
                                                : 'bg-white border-slate-100 text-slate-300'
                                        }`}>
                                            <stage.icon size={24} />
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${
                                                stage.status === 'completed' ? 'text-emerald-500' : 
                                                stage.status === 'current' ? 'text-blue-600' : 
                                                'text-slate-400'
                                            }`}>
                                                {stage.name}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {bcStatus?.verified === false && (
                                    <Button 
                                        onClick={handleNotarize}
                                        disabled={loading !== null}
                                        className="col-span-2 h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl"
                                    >
                                        {loading === 'notarize' ? <Loader2 className="animate-spin" /> : tAdmin('notarize_product')}
                                    </Button>
                                )}

                                {bcStatus?.verified && bcStatus?.ownerRole === 'MANUFACTURER' && (bcStatus?.pendingOwnerRole === null || bcStatus?.pendingOwnerRole === 'MANUFACTURER') && (
                                    <Button 
                                        onClick={() => handleInitiate('LOGISTICS')}
                                        disabled={loading !== null}
                                        className="col-span-2 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] group shadow-xl"
                                    >
                                        {loading === 'initiate-LOGISTICS' ? <Loader2 className="animate-spin" /> : (
                                            <>
                                                {tAdmin('initiate_logistics')}
                                                <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={16} />
                                            </>
                                        )}
                                    </Button>
                                )}

                                {bcStatus?.pendingOwnerRole && (
                                    <Button 
                                        onClick={handleAccept}
                                        disabled={loading !== null}
                                        className="col-span-2 h-16 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl"
                                    >
                                        {loading === 'accept' ? <Loader2 className="animate-spin" /> : tAdmin('confirm_acceptance', { 
                                            role: tAuth(`role_${bcStatus.pendingOwnerRole.toLowerCase()}` as any) 
                                        })}
                                    </Button>
                                )}

                                {bcStatus?.ownerRole === 'LOGISTICS' && !bcStatus?.pendingOwnerRole && (
                                    <Button 
                                        onClick={() => handleInitiate('RETAILER')}
                                        disabled={loading !== null}
                                        className="col-span-2 h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] group shadow-xl"
                                    >
                                        {loading === 'initiate-RETAILER' ? <Loader2 className="animate-spin" /> : (
                                            <>
                                                {tAdmin('initiate_distributor')}
                                                <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={16} />
                                            </>
                                        )}
                                    </Button>
                                )}

                                <Button 
                                    onClick={handleReset}
                                    disabled={loading !== null}
                                    variant="ghost"
                                    className="col-span-2 mt-4 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 hover:text-rose-500 hover:bg-rose-50 rounded-xl"
                                >
                                    {loading === 'reset' ? <Loader2 className="animate-spin" /> : tAdmin('emergency_reset')}
                                </Button>
                            </div>

                            <div className="mt-8 p-8 border-t border-dashed border-primary/10 bg-rose-50/50 rounded-[2.5rem]">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                            <AlertCircle size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black uppercase tracking-widest text-rose-600">{tAdmin('chaos_engineering')}</h4>
                                            <p className="text-[10px] font-medium text-rose-600/60 uppercase tracking-widest">{tAdmin('simulate_sla_breach')}</p>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={handleTriggerViolation}
                                        disabled={loading !== null}
                                        variant="outline" 
                                        className="h-12 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest px-8 transition-all"
                                    >
                                        {loading === 'violation' ? <Loader2 className="animate-spin" /> : tAdmin('trigger_violation')}
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
