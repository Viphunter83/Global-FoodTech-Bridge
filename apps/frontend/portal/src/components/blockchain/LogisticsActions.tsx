import { Button } from '@/components/ui/button';
import { PackageCheck, AlertTriangle, CheckCircle, Loader2, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LOGISTICS_ADDR } from '@/lib/constants';

interface LogisticsActionsProps {
    status: any;
    onAccept: () => void;
    onTransfer: () => void;
    onReport: () => void;
    onStatusUpdate: (id: string, label: string) => void;
    loading: boolean;
}

export function LogisticsActions({
    status,
    onAccept,
    onTransfer,
    onReport,
    onStatusUpdate,
    loading
}: LogisticsActionsProps) {
    const t = useTranslations('Tracking');

    const isPendingForLogistics = status.pendingOwner === LOGISTICS_ADDR;
    const isCurrentOwner = status.owner === LOGISTICS_ADDR;

    return (
        <div className="space-y-6">
            {/* A. Accept Incoming */}
            {isPendingForLogistics && (
                <Button
                    onClick={onAccept}
                    disabled={loading}
                    className="w-full min-h-16 h-auto py-4 bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/20 border-0 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center text-center whitespace-normal leading-tight"
                >
                    {loading ? <Loader2 className="animate-spin mr-3 h-5 w-5 shrink-0" /> : <PackageCheck className="mr-3 h-5 w-5 shrink-0" />}
                    <span className="block">{t('btn_accept_custody')}</span>
                </Button>
            )}

            {/* B. Update Shipping Status (We are Owner) */}
            {isCurrentOwner && !status.pendingOwner && (
                <div className="bg-muted/20 p-8 rounded-[2rem] border border-primary/5 shadow-inner space-y-6">
                    <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] flex items-center gap-2">
                        <MapPin size={12} />
                        {t('timeline_update_checkpoint')}
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { id: 'DEPARTED_ORIGIN', label: `🚚 ${t('timeline_departed_origin')}` },
                            { id: 'ARRIVED_PORT', label: `⚓️ ${t('timeline_arrived_port')}` },
                            { id: 'LOADED_VESSEL', label: `🚢 ${t('timeline_loaded_vessel')}` },
                            { id: 'CUSTOMS_CLEARANCE', label: `🛃 ${t('timeline_customs_clearance')}` },
                            { id: 'ARRIVED_DESTINATION', label: `📦 ${t('timeline_arrived_destination')}` }
                        ].map((s) => (
                            <button
                                key={s.id}
                                onClick={() => onStatusUpdate(s.id, s.label)}
                                disabled={loading || status.shippingStatus === s.id}
                                className={`text-left px-6 py-4 text-xs font-bold rounded-2xl border transition-all flex items-center justify-between group ${
                                    status.shippingStatus === s.id
                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                        : 'bg-background hover:bg-primary/5 border-primary/10 text-muted-foreground hover:text-primary'
                                }`}
                            >
                                <span className="uppercase tracking-widest">{s.label}</span>
                                {status.shippingStatus === s.id ? (
                                    <CheckCircle className="h-4 w-4" />
                                ) : (
                                    <div className="h-2 w-2 rounded-full border border-primary/20 group-hover:bg-primary/20" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* C. Forward to Retailer */}
            {isCurrentOwner && !status.pendingOwner && (
                <Button 
                    onClick={onTransfer} 
                    variant="outline" 
                    disabled={loading}
                    className="w-full min-h-16 h-auto py-4 border-primary/20 hover:bg-primary/5 text-primary font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center text-center whitespace-normal leading-tight"
                >
                    <PackageCheck className="mr-3 h-5 w-5 shrink-0" />
                    <span className="block">{t('btn_transfer_retail')}</span>
                </Button>
            )}

            {/* D. Violation Report (Always available for Logistics) */}
            <Button 
                variant="ghost"
                className="w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all" 
                onClick={onReport}
                disabled={loading}
            >
                <AlertTriangle className="mr-2 h-3 w-3" />
                {t('btn_report')}
            </Button>
        </div>
    );
}

