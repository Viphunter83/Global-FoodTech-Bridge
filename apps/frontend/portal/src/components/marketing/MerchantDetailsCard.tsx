'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, ExternalLink, ShieldCheck, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface MerchantDetailsCardProps {
    merchantName: string;
    redirectUrl?: string;
    description?: string;
}

export function MerchantDetailsCard({ merchantName, redirectUrl, description }: MerchantDetailsCardProps) {
    const t = useTranslations('Compliance');

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20 p-8 md:p-12 shadow-2xl group"
        >
            {/* Ambient Background Glow */}
            <div className="absolute -top-10 -right-10 h-40 w-40 bg-secondary/30 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-6 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center text-secondary-foreground shadow-lg shadow-secondary/20">
                            <ShoppingBag className="h-8 w-8" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-secondary mb-1">
                                <ShieldCheck size={14} />
                                <span className="text-[10px] font-black uppercase tracking-[.3em] leading-none">
                                    {t('verified_direct')}
                                </span>
                            </div>
                            <h2 className="text-4xl font-serif font-black italic tracking-tighter text-foreground leading-none">
                                {merchantName}
                            </h2>
                        </div>
                    </div>
                    
                    <p className="text-muted-foreground font-medium max-w-md leading-relaxed">
                        {description || t('brand_story_short')}
                    </p>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/10 text-[10px] font-black uppercase tracking-widest text-secondary">
                            <Heart size={10} className="fill-secondary" />
                            Eco-Friendly
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/10 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                             Premium Quality
                        </div>
                    </div>
                </div>

                <div className="shrink-0 w-full md:w-auto">
                    {redirectUrl ? (
                        <Button 
                            size="lg" 
                            asChild 
                            className="h-20 px-12 rounded-3xl bg-secondary text-secondary-foreground hover:bg-secondary/90 font-black text-xl shadow-2xl shadow-secondary/20 hover:scale-105 transition-all group/btn w-full md:w-auto"
                        >
                            <a href={redirectUrl} target="_blank" rel="noopener noreferrer">
                                {t('buy_now')}
                                <ArrowRight className="ml-3 h-6 w-6 group-hover/btn:translate-x-1 transition-transform" />
                            </a>
                        </Button>
                    ) : (
                         <Button 
                            size="lg" 
                            disabled 
                            className="h-20 px-12 rounded-3xl bg-muted text-muted-foreground font-black text-xl w-full md:w-auto"
                        >
                            {t('buy_now')}
                        </Button>
                    )}
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 text-center mt-6">
                         Secure Merchant Redirect
                    </p>
                </div>
            </div>
            
            {/* Animated Decoration */}
            <motion.div 
                className="absolute bottom-0 right-0 p-8 opacity-5 text-secondary pointer-events-none"
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
            >
                <ExternalLink size={120} />
            </motion.div>
        </motion.div>
    );
}
