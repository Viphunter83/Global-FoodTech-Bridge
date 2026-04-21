import React from 'react';
import { ShieldCheck, PlusCircle, Thermometer, Link2, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export function EmptyStateGuide() {
    const router = useRouter();
    const t = useTranslations();

    // Fallbacks if translations are missing for this new component
    const title = t.has('EmptyState.title') ? t('EmptyState.title') : 'Welcome to the Bridge';
    const subtitle = t.has('EmptyState.subtitle') ? t('EmptyState.subtitle') : 'Your operations control center is ready. Initialize your first digital passport to begin tracking.';
    const btnText = t.has('EmptyState.create_btn') ? t('EmptyState.create_btn') : 'Create First Passport';

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 w-full">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl w-full glass rounded-[3rem] p-10 md:p-16 border-primary/10 shadow-2xl relative overflow-hidden"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                    <div className="h-24 w-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg mb-4">
                        <Box className="h-12 w-12 text-primary" />
                    </div>

                    <div className="space-y-4 max-w-xl">
                        <h2 className="text-4xl md:text-5xl font-serif font-black italic tracking-tighter text-foreground/90">
                            {title}
                        </h2>
                        <p className="text-muted-foreground/80 leading-relaxed font-medium">
                            {subtitle}
                        </p>
                    </div>

                    <div className="w-full grid md:grid-cols-3 gap-6 text-left mt-8">
                        <div className="p-6 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-primary/5 space-y-3">
                            <span className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-black font-mono text-xs mb-4">1</span>
                            <h4 className="font-bold text-foreground">Digital Identity</h4>
                            <p className="text-xs text-muted-foreground">Register product metadata and manufacturer details in the immutable ledger.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-primary/5 space-y-3">
                             <span className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 font-black font-mono text-xs mb-4">2</span>
                            <h4 className="font-bold text-foreground">IoT Telemetry</h4>
                            <p className="text-xs text-muted-foreground">Attach a smart sensor to monitor temperature and location in real-time.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-primary/5 space-y-3">
                            <span className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 font-black font-mono text-xs mb-4">3</span>
                            <h4 className="font-bold text-foreground">Trust Handover</h4>
                            <p className="text-xs text-muted-foreground">Securely transfer ownership across the supply chain until it reaches the consumer.</p>
                        </div>
                    </div>

                    <div className="pt-10 w-full flex justify-center">
                        <Button 
                            onClick={() => router.push('/batches/new')}
                            className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                        >
                            <PlusCircle className="mr-3 h-6 w-6" />
                            {btnText}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
