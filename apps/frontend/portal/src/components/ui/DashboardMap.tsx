'use client';

import { MapPin, Globe, Satellite } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

interface DashboardMapProps {
    lat?: number;
    lon?: number;
    locationName?: string;
}

export function DashboardMap({ lat = 25.276987, lon = 55.296249, locationName = "Dubai, UAE" }: DashboardMapProps) {
    const t = useTranslations('Tracking');
    
    // Abstract normalization for the "High-Tech" grid
    // Mapping lat/lon to percentage for visual representation
    // Dubai is roughly 25N, 55E. We'll use a relative offset logic.
    const xPos = 50 + (lon - 55) * 5; // Simple linear offset for the demo grid
    const yPos = 50 - (lat - 25) * 5; 
    
    // Zoom logic - scale the background elements
    const zoomLevel = 1.2;

    return (
        <div className="relative w-full aspect-video md:aspect-[21/9] bg-slate-900 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-[inset_0_20px_40px_-10px_rgba(0,0,0,0.5)] group">
            {/* Zoomable Background Layer */}
            <motion.div 
                className="absolute inset-0"
                animate={{ scale: zoomLevel }}
                transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            >
                {/* High-Tech Grid & Scan Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:8px_8px]"></div>
                
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" 
                />

                {/* Abstract Global Connection Paths */}
                <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full text-primary/20 pointer-events-none group-hover:text-primary/40 transition-colors duration-1000">
                    <motion.path 
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 3, delay: 0.5 }}
                        d="M100,200 Q400,50 700,200" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="5,10" 
                    />
                    <motion.path 
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 4, delay: 1 }}
                        d="M150,250 Q400,350 650,250" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="2,5" 
                    />
                </svg>
            </motion.div>

            <div className="absolute top-8 left-8 flex items-center gap-4 z-20">
                <div className="flex h-10 px-4 items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/5 shadow-2xl">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/80">{t('live_tracking_active')}</span>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 backdrop-blur-xl border border-white/5 text-primary/60">
                    <Satellite size={16} />
                </div>
            </div>

            <div className="absolute bottom-8 right-8 z-20">
                <div className="p-5 rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/5 shadow-2xl text-right">
                    <div className="text-[8px] font-black uppercase tracking-[0.4em] text-primary/40 leading-none mb-1">Satellite Reference</div>
                    <div className="font-mono text-[10px] font-bold text-white tracking-widest">{lat.toFixed(6)} N / {lon.toFixed(6)} E</div>
                </div>
            </div>

            {/* Pulsing Dynamic Beacon */}
            <motion.div 
                className="absolute"
                style={{ 
                    left: `${Math.max(10, Math.min(90, xPos))}%`, 
                    top: `${Math.max(10, Math.min(90, yPos))}%`,
                    transform: 'translate(-50%, -50%)'
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
            >
                <div className="h-40 w-40 bg-primary/10 rounded-full animate-ping absolute -inset-16 opacity-20"></div>
                <div className="h-24 w-24 bg-primary/5 rounded-full animate-pulse absolute -inset-8"></div>
                
                <div className="relative group/pin flex flex-col items-center">
                    <motion.div 
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        className="z-10 bg-primary p-3 rounded-2xl text-white shadow-[0_0_40px_rgba(var(--primary-rgb),0.5)] cursor-pointer"
                    >
                        <MapPin className="h-6 w-6 fill-current" />
                    </motion.div>
                    
                    <div className="mt-4 bg-white/10 backdrop-blur-3xl border border-white/10 p-5 rounded-[1.5rem] shadow-2xl translate-y-4 opacity-0 group-hover/pin:opacity-100 group-hover/pin:translate-y-0 transition-all duration-500 min-w-[200px]">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Globe size={14} />
                            </div>
                            <div className="text-xs font-serif font-black italic text-white tracking-tight">{locationName}</div>
                        </div>
                        <div className="h-[1px] w-full bg-white/5 my-3" />
                        <div className="text-[9px] text-white/40 font-black uppercase tracking-widest leading-none">
                            Blockchain Node Certified
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Vignette Overlay */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
        </div>
    );
}
