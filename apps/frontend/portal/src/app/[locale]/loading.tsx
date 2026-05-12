import { Shield } from "lucide-react";

export default function Loading() {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-background/50 backdrop-blur-sm selection:bg-primary/10">
            <div className="flex flex-col items-center gap-8">
                {/* Animated Logo Pulse */}
                <div className="relative">
                    <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-2xl animate-pulse" />
                    <div className="relative h-20 w-20 rounded-3xl bg-slate-900 flex items-center justify-center shadow-2xl border border-white/5">
                        <Shield className="h-10 w-10 text-primary animate-pulse" strokeWidth={1.5} />
                    </div>
                </div>
                
                {/* Loading bar */}
                <div className="w-48 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-primary/60 via-primary to-primary/60 rounded-full animate-loading-bar"
                        style={{
                            animation: 'loading-bar 1.5s ease-in-out infinite',
                        }}
                    />
                </div>

                {/* Brand Text */}
                <div className="text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                        Global FoodTech Bridge
                    </p>
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] text-muted-foreground/20 mt-2">
                        Initializing Trust Layer...
                    </p>
                </div>
            </div>

            {/* Inline keyframes for the loading bar */}
            <style>{`
                @keyframes loading-bar {
                    0% { transform: translateX(-100%); width: 40%; }
                    50% { width: 60%; }
                    100% { transform: translateX(350%); width: 40%; }
                }
            `}</style>
        </div>
    );
}
