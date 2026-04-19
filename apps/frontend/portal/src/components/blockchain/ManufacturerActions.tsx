import { Button } from '@/components/ui/button';
import { Thermometer, Truck, ShieldCheck, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ManufacturerActionsProps {
    batchId: string;
    isVerified: boolean;
    sensorPaired?: boolean;
    pendingOwner?: string | null;
    owner?: string;
    manufacturerAddr: string;
    onPairSensor: () => void;
    onTransfer: () => void;
    onNotarize: () => void;
    loading: boolean;
}

export function ManufacturerActions({
    isVerified,
    sensorPaired,
    pendingOwner,
    owner,
    manufacturerAddr,
    onPairSensor,
    onTransfer,
    onNotarize,
    loading
}: ManufacturerActionsProps) {
    const t = useTranslations('Tracking');

    if (!isVerified) {
        return (
            <div className="space-y-4 pt-4">
                <Button 
                    onClick={onNotarize} 
                    disabled={loading}
                    className="w-full h-16 text-xs font-black uppercase tracking-[0.2em] bg-primary hover:bg-primary/90 text-white border-0 shadow-xl shadow-primary/20 rounded-2xl transition-all active:scale-[0.98]"
                >
                    {loading ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : <ShieldCheck className="mr-3 h-5 w-5" />}
                    {t('btn_notarize')}
                </Button>
            </div>
        );
    }

    const isCurrentOwner = owner === manufacturerAddr;

    return (
        <div className="space-y-6">
            {!sensorPaired && !pendingOwner && isCurrentOwner && (
                <div className="p-6 bg-amber-500/[0.03] border border-amber-500/20 rounded-[2rem] flex flex-col gap-4 shadow-lg shadow-amber-500/5 animate-in slide-in-from-left-4 duration-500">
                    <div className="text-[10px] text-amber-600 font-black uppercase tracking-widest flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Thermometer size={16} className="text-amber-600" />
                        </div>
                        {t('action_pair_sensor')}
                    </div>
                    <Button 
                        onClick={onPairSensor} 
                        variant="secondary" 
                        disabled={loading}
                        className="w-full h-12 bg-white hover:bg-amber-50 border-amber-200 text-amber-700 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-sm"
                    >
                        {t('btn_pair_sensor')}
                    </Button>
                </div>
            )}

            {isCurrentOwner && !pendingOwner && sensorPaired && (
                <Button 
                    onClick={onTransfer} 
                    disabled={loading}
                    variant="outline" 
                    className="w-full h-16 border-primary/20 hover:bg-primary/5 text-primary font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-lg transition-all active:scale-[0.98]"
                >
                    <Truck className="mr-3 h-5 w-5" />
                    {t('btn_transfer_logistics')}
                </Button>
            )}

            {pendingOwner && (
                <div className="text-center p-6 bg-muted/20 border border-primary/5 rounded-[2rem] flex flex-col items-center gap-3 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center shadow-md">
                        <Loader2 className="h-5 w-5 text-primary/40 animate-spin" />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">
                        {t('bc_waiting_partner')}
                    </div>
                </div>
            )}

            {!isCurrentOwner && !pendingOwner && (
                <div className="flex items-center gap-4 p-6 bg-emerald-500/[0.03] border border-emerald-500/20 rounded-[2rem] shadow-xl shadow-emerald-500/5">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-sm font-black text-emerald-900 uppercase tracking-tight italic">
                            {t('bc_handover_title')}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest mt-0.5">
                            Provenance Secured
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

