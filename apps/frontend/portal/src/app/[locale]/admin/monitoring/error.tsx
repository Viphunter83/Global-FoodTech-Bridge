'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, ShieldAlert, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MonitoringError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('[GFTB-MONITOR-ERROR]', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-destructive/5 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-2xl w-full"
      >
        <div className="glass border-destructive/20 rounded-[3rem] p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-destructive to-transparent" />
          
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-destructive/10 text-destructive mb-8 border border-destructive/20 shadow-inner">
            <ShieldAlert size={40} className="animate-pulse" />
          </div>
          
          <h2 className="text-4xl font-serif font-black italic tracking-tighter text-foreground mb-4">
            Infrastructure Monitoring Offline
          </h2>
          
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 mb-12 max-w-md mx-auto leading-relaxed">
            We encountered a connectivity issue with the Railway API or a rendering fault. Our automated systems are investigating.
          </p>

          <div className="bg-slate-950/50 rounded-2xl p-6 border border-white/5 mb-12 text-left font-mono relative group">
            <div className="flex items-center gap-2 mb-3 opacity-40">
              <Terminal size={12} />
              <span className="text-[9px] uppercase tracking-widest font-black">Error Logs</span>
            </div>
            <p className="text-[10px] text-destructive/80 break-all leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
              {error.message || 'Unknown system fault'}
              {error.digest && <span className="block mt-2 opacity-50">Digest: {error.digest}</span>}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button
              onClick={() => reset()}
              className="h-16 px-10 bg-destructive text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-destructive/90 transition-all active:scale-95 shadow-xl shadow-destructive/20"
            >
              <RefreshCcw className="w-4 h-4 mr-3" />
              Attempt System Recovery
            </Button>
            
            <Button
              variant="ghost"
              asChild
              className="h-16 px-10 glass border-white/5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white/5 transition-all"
            >
              <a href="/admin">Return to Command Center</a>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
