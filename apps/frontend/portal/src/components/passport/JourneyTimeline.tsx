import { motion } from 'framer-motion';
import { Package, Truck, MapPin, ChefHat } from 'lucide-react';

interface TimelineEvent {
    stage: string;
    location: string;
    timestamp: string;
    status: 'completed' | 'current' | 'future';
    icon: 'package' | 'truck' | 'warehouse' | 'fork';
}

const ICONS = {
    package: Package,
    truck: Truck,
    warehouse: MapPin,
    fork: ChefHat
};

export function JourneyTimeline({ events }: { events: TimelineEvent[] }) {
    return (
        <div className="py-8">
            <h3 className="mb-6 text-xl font-semibold">Farm-to-Fork Journey</h3>
            <div className="relative space-y-8 pl-4 before:absolute before:left-3 before:top-2 before:h-full before:w-0.5 before:bg-gray-200">
                {events.map((event, idx) => {
                    const Icon = ICONS[event.icon];
                    const isCompleted = event.status === 'completed' || event.status === 'current';

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

                            <div className="pb-8">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900">{event.stage}</span>
                                    {event.status === 'current' && (
                                        <span className="animate-pulse rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-600">
                                            LIVE
                                        </span>
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
