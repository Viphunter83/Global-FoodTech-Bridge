'use client';

import { MapPin } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface DashboardMapProps {
    lat?: number;
    lon?: number;
    locationName?: string;
}

export function DashboardMap({ lat = 48.8, lon = 2.3, locationName = "Paris, FR" }: DashboardMapProps) {
    const { t } = useLanguage();

    return (
        <div className="relative w-full aspect-video md:aspect-[21/9] bg-slate-50 rounded-xl overflow-hidden border border-border shadow-inner">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            
            {/* Abstract Global Connection Paths */}
            <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full text-blue-200/40 pointer-events-none">
                <path d="M100,200 Q400,50 700,200" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="5,5" />
                <path d="M150,250 Q400,350 650,250" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="5,5" />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-background/80 backdrop-blur-sm border border-border px-4 py-2 rounded-full text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                    {t('live_tracking_active')}
                </div>
            </div>

            {/* Pulsing Base */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="h-20 w-20 bg-blue-500/10 rounded-full animate-ping absolute -inset-6"></div>
                <div className="relative group flex flex-col items-center">
                    <div className="z-10 bg-blue-600 p-2 rounded-full text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                        <MapPin className="h-5 w-5 fill-current" />
                    </div>
                    <div className="mt-2 bg-background/90 backdrop-blur-md border border-border px-3 py-1.5 rounded-lg shadow-xl translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                        <div className="text-[10px] font-bold text-foreground leading-tight">{locationName}</div>
                        <div className="text-[9px] text-muted-foreground font-mono">{lat.toFixed(4)}, {lon.toFixed(4)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
