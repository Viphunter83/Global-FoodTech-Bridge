'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';

// Leaflet requires browser APIs (window, document), so it must be loaded client-only.
const RouteMapInner = dynamic(
    () => import('./RouteMap').then(mod => ({ default: mod.RouteMap })),
    {
        ssr: false,
        loading: () => (
            <div className="w-full rounded-2xl bg-slate-900/50 border border-white/5 flex items-center justify-center" style={{ height: '380px' }}>
                <div className="flex items-center gap-3 text-muted-foreground/40">
                    <div className="h-3 w-3 rounded-full bg-primary/30 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                        Initializing route map...
                    </span>
                </div>
            </div>
        ),
    }
);

type RouteMapProps = ComponentProps<typeof RouteMapInner>;

export function RouteMapDynamic(props: RouteMapProps) {
    return <RouteMapInner {...props} />;
}
