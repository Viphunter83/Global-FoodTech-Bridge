import { ShieldCheck, CheckCircle, Cpu, Fingerprint } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BlockchainStatusCardProps {
    status: string;
    owner?: string;
    pendingOwner?: string | null;
    sensorPaired?: boolean;
}

export function BlockchainStatusCard({ status, owner, pendingOwner, sensorPaired }: BlockchainStatusCardProps) {
    const t = useTranslations('Tracking');

    return (
        <div className="rounded-[2.5rem] bg-gradient-to-br from-primary/[0.08] via-background to-primary/[0.02] p-8 border border-primary/10 shadow-2xl relative overflow-hidden group transition-all hover:shadow-primary/5">
            {/* Background Decor */}
            <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-1000 rotate-12">
                <ShieldCheck size={240} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-sm font-black text-primary uppercase tracking-tight italic">
                            {t('bc_validation_title')}
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-0.5">
                            Real-time Ledger Verification
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        {owner && (
                            <div className="flex flex-col gap-1.5 p-4 bg-background/60 backdrop-blur-xl border border-primary/5 rounded-2xl shadow-sm">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 flex items-center gap-2">
                                    <Fingerprint size={10} />
                                    Active Custody
                                </span>
                                <span className="text-[11px] font-mono font-bold text-primary truncate">
                                    {owner}
                                </span>
                            </div>
                        )}
                        
                        {pendingOwner && (
                            <div className="flex flex-col gap-1.5 p-4 bg-orange-500/[0.03] border border-orange-500/10 rounded-2xl shadow-sm animate-pulse">
                                <span className="text-[9px] font-black uppercase tracking-widest text-orange-600/60 flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                    Transfer Protocol Active
                                </span>
                                <span className="text-[11px] font-mono font-bold text-orange-700 truncate">
                                    {pendingOwner}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col justify-center">
                        {sensorPaired && (
                            <div className="flex items-center gap-4 p-5 bg-emerald-500/[0.03] border border-emerald-500/20 rounded-2xl shadow-xl shadow-emerald-500/5 animate-in fade-in slide-in-from-right-4 duration-1000">
                                <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                    <Cpu size={20} className="animate-pulse" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-emerald-900 uppercase tracking-widest italic">
                                        {t('iot_monitoring')}
                                    </div>
                                    <div className="text-[8px] font-bold text-emerald-600/60 uppercase tracking-widest mt-0.5">
                                        End-to-end Telemetry
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {!sensorPaired && (
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/20 italic text-right pr-4">
                                Waiting for IoT Data
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

