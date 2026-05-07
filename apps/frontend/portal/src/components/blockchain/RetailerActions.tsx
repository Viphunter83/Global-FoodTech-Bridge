import { Button } from '@/components/ui/button';
import { PackageCheck, AlertTriangle, Loader2, Store } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { RETAILER_ADDR } from '@/lib/constants';

interface RetailerActionsProps {
    status: any;
    onAccept: () => void;
    onReport: () => void;
    loading: boolean;
}

export function RetailerActions({ status, onAccept, onReport, loading }: RetailerActionsProps) {
    const t = useTranslations('Tracking');
    const isPendingForRetailer = status.pendingOwner === RETAILER_ADDR;

    return (
        <div className="rounded-[2rem] bg-slate-500/[0.03] p-8 border border-slate-500/10 space-y-8 shadow-xl shadow-slate-500/5 animate-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-500/10 flex items-center justify-center">
                    <Store size={20} className="text-slate-600" />
                </div>
                <h4 className="font-black text-slate-800 text-[10px] uppercase tracking-[0.3em]">{t('retailer_checkpoint')}</h4>
            </div>
            
            <div className="flex flex-col gap-4">
                {isPendingForRetailer ? (
                    <Button 
                        onClick={onAccept} 
                        disabled={loading}
                        className="w-full min-h-16 h-auto py-4 bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 border-0 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center text-center whitespace-normal leading-tight"
                    >
                        {loading ? <Loader2 className="animate-spin mr-3 h-5 w-5 shrink-0" /> : <PackageCheck className="mr-3 h-5 w-5 shrink-0" />}
                        <span className="block">{t('btn_accept_custody')}</span>
                    </Button>
                ) : (
                    <div className="text-center p-8 bg-background/40 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center gap-3">
                        <Loader2 className="h-4 w-4 text-slate-300 animate-spin" />
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                            {t('bc_waiting_partner')}
                        </div>
                    </div>
                )}

                <Button 
                    variant="ghost"
                    className="w-full min-h-12 h-auto py-3 text-destructive hover:text-destructive hover:bg-destructive/5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center text-center whitespace-normal leading-tight" 
                    onClick={onReport} 
                    disabled={loading}
                >
                    <AlertTriangle className="mr-2 h-3 w-3 shrink-0" />
                    {t('btn_report')}
                </Button>
            </div>
        </div>
    );
}

