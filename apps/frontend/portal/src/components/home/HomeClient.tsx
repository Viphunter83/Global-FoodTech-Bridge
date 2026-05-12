'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search } from 'lucide-react';

/**
 * Interactive search widget — Client Island for the homepage.
 * Only this part requires 'use client' because of useState + localStorage.
 */
export function SearchWidget() {
    const [batchId, setBatchId] = useState('');
    const [recentBatches, setRecentBatches] = useState<string[]>([]);
    const router = useRouter();
    const t = useTranslations();

    useEffect(() => {
        const stored = localStorage.getItem('recent_batches');
        if (stored) {
            try {
                const ids = JSON.parse(stored);
                if (Array.isArray(ids) && ids.length > 0) {
                    setRecentBatches(ids.slice(0, 2));
                }
            } catch(e) {}
        }
    }, []);

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (batchId.trim()) {
            router.push(`/verify/${batchId.trim()}`);
        }
    };

    return (
        <div className="w-full flex flex-col items-center gap-8 text-foreground">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-full max-w-3xl p-1 rounded-[2.5rem] bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 shadow-2xl"
            >
                <div className="glass rounded-[2.4rem] p-4 md:p-8 flex flex-col md:flex-row items-stretch gap-4">
                    <form onSubmit={handleTrack} className="flex-1 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <Search className="h-5 w-5" />
                            </div>
                            <Input
                                placeholder="Batch UUID (e.g. 2cbade92...)"
                                className="w-full h-16 pl-12 pr-6 rounded-2xl bg-background/50 border-primary/10 focus:ring-secondary/50 focus:border-secondary text-lg transition-all"
                                value={batchId}
                                onChange={(e) => setBatchId(e.target.value)}
                                aria-label="Batch ID search"
                            />
                        </div>
                        <Button type="submit" size="lg" className="h-auto min-h-[4rem] py-4 px-8 rounded-2xl text-lg font-bold premium-gradient text-white border-0 hover:shadow-lg hover:shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 group whitespace-normal leading-tight">
                            {t('Hero.cta_track')}
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform shrink-0" />
                        </Button>
                    </form>
                </div>
            </motion.div>

            {recentBatches.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span className="font-bold uppercase tracking-widest text-[10px]">{t('Hero.try_demo')}</span>
                    <div className="flex gap-2">
                        {recentBatches.map((id) => (
                            <button
                                key={id}
                                onClick={() => setBatchId(id)}
                                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs font-mono"
                            >
                                {id.slice(0, 8)}...
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Animated Hero Section — Client Island for Framer Motion entrance animations.
 */
export function HeroAnimations({ children }: { children: React.ReactNode }) {
    return (
        <motion.div 
            className="space-y-6"
            initial="initial"
            animate="animate"
            variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
        >
            {children}
        </motion.div>
    );
}

export function FadeInUp({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.div 
            variants={{ initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function SlideInLeft({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function SlideInRight({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function ScaleIn({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedBar({ height, index }: { height: number; index: number }) {
    return (
        <motion.div 
            initial={{ height: 0 }}
            whileInView={{ height: `${height}%` }}
            className="flex-1 bg-gradient-to-t from-emerald-500/20 to-emerald-500" 
        />
    );
}

export function ScrollToButton({ targetId, children, className }: { targetId: string; children: React.ReactNode; className?: string }) {
    return (
        <Button 
            size="lg" 
            onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })} 
            className={className}
        >
            {children}
        </Button>
    );
}
