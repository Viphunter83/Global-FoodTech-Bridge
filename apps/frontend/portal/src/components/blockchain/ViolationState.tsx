import { AlertTriangle, Fingerprint } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ViolationStateProps {
    violation: string;
    txHash?: string;
    children?: React.ReactNode;
}

export function ViolationState({ violation, txHash, children }: ViolationStateProps) {
    const t = useTranslations('Tracking');
    
    return (
        <div className="rounded-[2rem] bg-destructive/5 p-8 md:p-10 border border-destructive/20 shadow-2xl shadow-destructive/10 animate-in zoom-in duration-700">
            <div className="flex items-start md:items-center text-destructive font-serif font-black italic mb-6 text-xl md:text-2xl tracking-tight">
                <AlertTriangle className="mr-4 h-8 w-8 md:h-10 md:w-10 shrink-0 text-destructive mt-1 md:mt-0" />
                <span className="break-words leading-tight">{t('bc_violation_title')}</span>
            </div>
            <p className="text-xs md:text-[13px] font-bold text-destructive/80 mb-8 leading-relaxed uppercase tracking-wider italic break-words">
                <span className="block mb-2">{t('bc_violation_details')}</span>
                <span className="underline decoration-wavy underline-offset-4 break-all inline-block mt-1">{violation}</span>
            </p>
            {txHash && (
                <div className="flex items-center gap-3 p-4 bg-background/50 border border-destructive/10 rounded-2xl mb-6 shadow-sm overflow-hidden group">
                    <Fingerprint className="h-5 w-5 text-destructive/40 shrink-0" />
                    <div className="flex flex-col min-w-0">
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 mb-0.5">{t('audit_signature')}</span>
                        <span className="text-[10px] font-mono font-bold text-destructive/60 truncate group-hover:text-destructive transition-colors">
                            {txHash}
                        </span>
                    </div>
                </div>
            )}
            {children}
        </div>
    );
}

