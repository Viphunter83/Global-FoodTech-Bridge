'use client';

import { Link } from '@/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Search, ShieldCheck, Thermometer, Globe, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function Home() {
    const [batchId, setBatchId] = useState('');
    const router = useRouter();
    const t = useTranslations();

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (batchId.trim()) {
            router.push(`/batches/${batchId.trim()}`);
        }
    };

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    return (
        <main className="flex flex-col items-center bg-background min-h-screen">
            {/* Hero Section with Cinematic Background */}
            <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/hero-bridge.png"
                        alt="Global Supply Chain Bridge"
                        fill
                        className="object-cover opacity-60 dark:opacity-40 scale-105"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
                </div>

                <div className="container relative z-10 px-4 md:px-6 mx-auto">
                    <div className="flex flex-col items-center text-center space-y-12 max-w-5xl mx-auto">
                        <motion.div 
                            className="space-y-6"
                            initial="initial"
                            animate="animate"
                            variants={{
                                initial: { opacity: 0 },
                                animate: { opacity: 1, transition: { staggerChildren: 0.2 } }
                            }}
                        >
                            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-primary/20 text-primary text-xs font-bold uppercase tracking-widest leading-none">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                Blockchain Verified Supply Chain
                            </motion.div>
                            
                            <motion.h1 
                                variants={fadeInUp}
                                className="text-5xl md:text-8xl font-serif font-bold tracking-tight text-foreground leading-[1.1] text-shadow"
                            >
                                {t('Hero.title').split('.')[0]}<span className="text-secondary">.</span>
                            </motion.h1>
                            
                            <motion.p 
                                variants={fadeInUp}
                                className="text-lg md:text-2xl text-muted-foreground/90 max-w-3xl mx-auto leading-relaxed text-shadow"
                            >
                                {t('Hero.subtitle')}
                            </motion.p>
                        </motion.div>

                        {/* Interactive Verification Widget */}
                        <div className="w-full flex flex-col items-center gap-6">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.8, duration: 0.8 }}
                                className="w-full max-w-2xl p-1 rounded-[2.5rem] bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 shadow-2xl"
                            >
                                <div className="glass rounded-[2.4rem] p-4 md:p-8 flex flex-col md:flex-row items-stretch gap-4">
                                    <form onSubmit={handleTrack} className="flex-1 flex flex-col sm:flex-row gap-3">
                                        <div className="relative flex-1">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                <Search className="h-5 w-5" />
                                            </div>
                                            <Input
                                                placeholder={t('Hero.try_demo')}
                                                className="w-full h-16 pl-12 pr-6 rounded-2xl bg-background/50 border-primary/10 focus:ring-secondary/50 focus:border-secondary text-lg transition-all"
                                                value={batchId}
                                                onChange={(e) => setBatchId(e.target.value)}
                                            />
                                        </div>
                                        <Button type="submit" size="lg" className="h-16 px-8 rounded-2xl text-lg font-bold premium-gradient text-white border-0 hover:shadow-lg hover:shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 group">
                                            {t('Hero.cta_track')}
                                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </form>
                                </div>
                            </motion.div>

                            {/* Quick Examples */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.2 }}
                                className="flex flex-wrap items-center gap-3 text-sm text-white/70 animate-in fade-in slide-in-from-top-4 duration-1000 delay-500 fill-mode-both"
                            >
                                <span>{t('Hero.try_demo')}</span>
                                <div className="flex gap-2">
                                    {['2cbade92-e88e-48a8-a682-94ae0a0205e8', 'cde03dc1-202b-43c7-a0cd-7cbcbbeeb884'].map((id) => (
                                        <button
                                            key={id}
                                            onClick={() => setBatchId(id)}
                                            className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 border border-white/20 transition-colors text-xs font-mono"
                                        >
                                            {id.slice(0, 8)}...
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        <motion.div 
                            variants={fadeInUp}
                            initial="initial"
                            animate="animate"
                            transition={{ delay: 1.4 }}
                            className="flex items-center gap-8 text-sm font-medium text-muted-foreground/80"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                Fully Automated
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                Real-time IoT
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                Immutable Ledger
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* Feature Modules */}
            <section className="w-full py-24 relative">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="grid gap-8 md:grid-cols-3">
                        <FeatureCard 
                            icon={<Globe className="h-8 w-8" />}
                            title={t('Features.traceability_title')}
                            desc={t('Features.traceability_desc')}
                            delay={0.2}
                        />
                        <FeatureCard 
                            icon={<Thermometer className="h-8 w-8" />}
                            title={t('Features.iot_title')}
                            desc={t('Features.iot_desc')}
                            delay={0.4}
                        />
                        <FeatureCard 
                            icon={<ShieldCheck className="h-8 w-8" />}
                            title={t('Features.blockchain_title')}
                            desc={t('Features.blockchain_desc')}
                            delay={0.6}
                        />
                    </div>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="mt-24 p-8 md:p-16 rounded-[3rem] bg-primary/5 border border-primary/10 flex flex-col items-center text-center space-y-8"
                    >
                        <h2 className="text-3xl md:text-5xl font-serif font-bold">{t('Compliance.sla_violations_title')}</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                            {t('Compliance.sla_violations_desc')}
                        </p>
                        <Button variant="outline" size="lg" asChild className="rounded-full px-8 h-14 font-bold border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                            <Link href="/dashboard">
                                {t('Hero.cta_dashboard')}
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.8 }}
            viewport={{ once: true }}
            className="group relative p-8 rounded-[2rem] glass hover:bg-background/80 transition-all border-primary/5 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
        >
            <div className="mb-6 p-4 rounded-2xl bg-primary/5 text-primary w-fit group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                {icon}
            </div>
            <h3 className="text-2xl font-serif font-bold mb-4">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{desc}</p>
        </motion.div>
    );
}

