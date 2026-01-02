'use client';

import { MapPin } from 'lucide-react';

interface DashboardMapProps {
    lat?: number;
    lon?: number;
    locationName?: string;
}

export function DashboardMap({ lat = 48.8, lon = 2.3, locationName = "Paris, FR" }: DashboardMapProps) {
    return (
        <div className="relative w-full h-[300px] bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
            {/* Simple static map background simulation */}
            <div className="absolute inset-0 bg-[#e5e7eb] opacity-50"
                style={{ backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
            </div>

            {/* World Map SVG Abstract Representation */}
            <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full text-slate-300 pointer-events-none">
                <path d="M20,15 Q30,5 40,15 T60,15 T80,25" stroke="currentColor" strokeWidth="0.5" fill="none" />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-mono">
                [ Interactive Supply Chain Map Loading... ]
            </div>

            {/* Pin */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative group">
                    <MapPin className="h-8 w-8 text-blue-600 fill-blue-100 drop-shadow-md animate-bounce" />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {locationName} ({lat}, {lon})
                    </div>
                </div>
            </div>
        </div>
    );
}
