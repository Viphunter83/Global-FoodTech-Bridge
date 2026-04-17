'use client';

import { motion } from 'framer-motion';
import { Package, Truck, MapPin, ChefHat, Leaf, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

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
    const { t } = useLanguage();

    return (
        <div className="py-8">
            <h3 className="mb-6 text-xl font-semibold">{t('farm_to_fork_journey')}</h3>
            <div className="relative space-y-8 pl-4 before:absolute before:left-3 before:top-2 before:h-full before:w-0.5 before:bg-gray-200">
                {events.map((event, idx) => {
                    const Icon = ICONS[event.icon];
                    const isCompleted = event.status === 'completed' || event.status === 'current';
                    const hasComplianceRequirement = !!event.required_cert;

                    return (
                        <motion.div
                            key={idx}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.2 }}
                            className="relative flex items-start gap-4"
                        >
                            <div className={`
                                z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 
                                ${event.status === 'current' ? 'border-sky-500 bg-sky-50 text-sky-600 shadow-lg shadow-sky-200' :
                                    isCompleted ? 'border-emerald-500 bg-emerald-50 text-emerald-600' :
                                        'border-gray-200 bg-white text-gray-300'}
                            `}>
                                <Icon size={14} />
                            </div>

                            <div className="flex-1 pb-8">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-bold text-gray-900">{event.stage}</span>
                                    {event.status === 'current' && (
                                        <span className="animate-pulse rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-600">
                                            LIVE
                                        </span>
                                    )}
                                    
                                    {hasComplianceRequirement && (
                                        <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                                            event.is_compliant 
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                            {event.is_compliant ? (
                                                <ShieldCheck size={10} />
                                            ) : (
                                                <AlertCircle size={10} />
                                            )}
                                            {event.is_compliant ? t('status_verified') : `${t('required')}: ${event.required_cert}`}
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm text-gray-600">{event.location}</div>
                                <div className="mt-1 text-xs font-mono text-gray-400">{event.timestamp}</div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
