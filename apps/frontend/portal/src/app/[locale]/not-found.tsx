'use client';

import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
    const t = useTranslations('NotFound');

    return (
        <div className="relative flex flex-col items-center justify-center min-h-[80vh] px-6 text-center overflow-hidden selection:bg-primary/10">
            {/* Decorative Background */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/5 blur-[100px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'circOut' }}
                className="relative z-10 flex flex-col items-center"
            >
                {/* Icon */}
                <motion.div
                    initial={{ rotate: -20, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="mb-8"
                >
                    <div className="h-24 w-24 rounded-[2rem] bg-primary/5 flex items-center justify-center border border-primary/10 shadow-2xl shadow-primary/5">
                        <Compass className="h-12 w-12 text-primary/40" strokeWidth={1.5} />
                    </div>
                </motion.div>

                {/* 404 Number */}
                <h1 className="text-[120px] md:text-[180px] font-serif font-black italic tracking-tighter leading-none text-foreground/5 select-none">
                    404
                </h1>
                
                {/* Title & Description */}
                <div className="-mt-8 md:-mt-12">
                    <h2 className="text-2xl md:text-3xl font-serif font-black italic tracking-tight mb-4">
                        {t('title')}
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground/60 max-w-md mx-auto leading-relaxed">
                        {t('description')}
                    </p>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-10"
                >
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:shadow-slate-900/40 hover:scale-[1.02] transition-all active:scale-95"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t('back_home')}
                    </Link>
                </motion.div>

                {/* Subtle Footer */}
                <p className="mt-12 text-[8px] font-black uppercase tracking-[0.5em] text-muted-foreground/20">
                    Global FoodTech Bridge • Trust Infrastructure
                </p>
            </motion.div>
        </div>
    );
}
