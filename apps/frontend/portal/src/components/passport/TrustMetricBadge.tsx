import React from 'react';
import { ShieldCheck, Database, Zap, Thermometer, Leaf, FlaskConical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type MetricType = 'purity' | 'temperature' | 'carbon' | 'organic' | 'nutrition' | 'origin';

interface TrustMetricBadgeProps {
    type: MetricType;
    label: string;
    value: string;
    source: 'Blockchain' | 'IoT' | 'Lab Report';
    status: 'verified' | 'warning' | 'pending';
    className?: string;
}

const iconMap = {
    purity: FlaskConical,
    temperature: Thermometer,
    carbon: Zap,
    organic: Leaf,
    nutrition: ShieldCheck,
    origin: Database,
};

export function TrustMetricBadge({ type, label, value, source, status, className }: TrustMetricBadgeProps) {
    const Icon = iconMap[type] || ShieldCheck;

    const statusStyles = {
        verified: "bg-emerald-50 border-emerald-100 text-emerald-700",
        warning: "bg-amber-50 border-amber-100 text-amber-700",
        pending: "bg-gray-50 border-gray-100 text-gray-500",
    };

    const iconStyles = {
        verified: "bg-emerald-100 text-emerald-600",
        warning: "bg-amber-100 text-amber-600",
        pending: "bg-gray-200 text-gray-400",
    };

    return (
        <Card className={cn(
            "p-4 border transition-all hover:shadow-md",
            statusStyles[status],
            className
        )}>
            <div className="flex items-start justify-between mb-2">
                <div className={cn("p-2 rounded-lg", iconStyles[status])}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">Verified by</span>
                    <span className="text-[10px] font-black uppercase tracking-tighter text-blue-600/70">{source}</span>
                </div>
            </div>
            
            <div className="space-y-1">
                <h4 className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</h4>
                <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold font-serif">{value}</span>
                    {status === 'verified' && (
                        <ShieldCheck className="h-3 w-3 text-emerald-600 animate-pulse" />
                    )}
                </div>
            </div>
        </Card>
    );
}
