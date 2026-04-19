'use client';

import { motion } from 'framer-motion';
import { Package, Truck, MapPin, ChefHat, Leaf, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TimelineEvent {
    stage: string;
    location: string;
    timestamp: string;
    status: 'completed' | 'current' | 'future';
    icon: 'package' | 'truck' | 'warehouse' | 'fork' | 'leaf' | 'check';
    is_compliant?: boolean;
    required_cert?: string;
}

const ICONS = {
    package: Package,
    truck: Truck,
    warehouse: MapPin,
    fork: ChefHat,
    leaf: Leaf,
    check: CheckCircle
};

export function JourneyTimeline({ events }: { events: TimelineEvent[] }) {
    const t = useTranslations('Tracking');
    const tCommon = useTranslations('Common');

    return (
        <div className="py-12">
            <h3 className="mb-10 text-2xl font-serif font-black italic tracking-tight text-foreground">{t('farm_to_fork_journey')}</h3>
            <div className="relative space-y-12 pl-6 before:absolute before:left-3 before:top-4 before:h-[calc(100%-1rem)] before:w-[2px] before:bg-gradient-to-b before:from-primary/40 before:via-primary/20 before:to-transparent">
                {events.map((event, idx) => {
                    const Icon = ICONS[event.icon];
                    const isCompleted = event.status === 'completed' || event.status === 'current';
                    const hasComplianceRequirement = !!event.required_cert;

                    return (
                        <motion.div
                            key={idx}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="relative flex items-start gap-6 group"
                        >
                            <div className={`
                                z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition-all duration-500
                                ${event.status === 'current' ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20 scale-110' :
                                    isCompleted ? 'border-emerald-500 bg-emerald-50 text-emerald-600' :
                                        'border-muted bg-background text-muted-foreground/30'}
                            `}>
                                <Icon size={18} className={event.status === 'current' ? 'animate-pulse' : ''} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <span className={`text-lg font-serif font-black italic tracking-tight ${event.status === 'future' ? 'text-muted-foreground/40' : 'text-foreground'}`}>
                                        {event.stage}
                                    </span>
                                    
                                    {event.status === 'current' && (
                                        <span className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1 text-[9px] font-black tracking-[0.2em] text-primary animate-pulse border border-primary/20 uppercase">
                                            {t('live_badge')}
                                        </span>
                                    )}
                                    
                                    {hasComplianceRequirement && (
                                        <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-[0.1em] border transition-colors ${
                                            event.is_compliant 
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                            {event.is_compliant ? (
                                                <ShieldCheck size={12} />
                                            ) : (
                                                <AlertCircle size={12} className="animate-bounce" />
                                            )}
                                            {event.is_compliant ? t('status_verified') : `${tCommon('required')}: ${event.required_cert}`}
                                        </div>
                                    )}
                                </div>
                                
                                <div className={`flex items-center gap-2 text-sm font-medium ${event.status === 'future' ? 'text-muted-foreground/20' : 'text-muted-foreground'}`}>
                                    <MapPin size={14} className="opacity-40" />
                                    {event.location}
                                </div>
                                
                                {event.timestamp && (
                                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-muted/30 font-mono text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                                        {event.timestamp}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
