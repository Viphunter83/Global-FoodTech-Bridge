'use client';

import { Link } from '@/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Database, ShieldCheck, Thermometer, Truck, FileCheck, Server, Factory, ArrowRight, ScanLine, CheckCircle2, Globe, Lock, Cpu, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

export function HowItWorksClient() {
    const t = useTranslations('HowItWorks');
    const ct = useTranslations('Common');
    const at = useTranslations('Auth');
    const tt = useTranslations('Tracking');
    const locale = useLocale();

    const STEPS = [
        { id: 'production', title: t('step_production'), icon: Factory, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { id: 'logistics', title: t('step_logistics'), icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { id: 'handover', title: t('step_handover'), icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { id: 'verify', title: t('step_verify'), icon: ScanLine, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];

    const [currentStep, setCurrentStep] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [truckProgress, setTruckProgress] = useState(0);
    const [tempReading, setTempReading] = useState(-20);

    useEffect(() => {
        if (currentStep === 1) { 
            const interval = setInterval(() => {
                setTruckProgress(prev => {
                    if (prev >= 100) return 0;
                    return prev + 1;
                });
                setTempReading(prev => {
                    const noise = (Math.random() - 0.5) * 1.5;
                    return Math.max(-23, Math.min(-17, prev + noise));
                });
            }, 60);
            return () => clearInterval(interval);
        }
    }, [currentStep]);

    const nextStep = () => {
        if (currentStep < STEPS.length - 1) {
            setAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
                setAnimating(false);
            }, 400);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev - 1);
                setAnimating(false);
            }, 400);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafbfc] flex flex-col selection:bg-primary/10">
            <header className="bg-white/80 backdrop-blur-2xl border-b border-primary/5 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="group flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 hover:text-primary transition-all">
                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center mr-4 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                            <ArrowLeft size={16} />
                        </div>
                        {ct('back_to_app')}
                    </Link>
                    <h1 className="text-xl font-serif font-black italic tracking-tighter text-foreground">
                        {t('how_title')}
                    </h1>
                    <div className="w-24 flex justify-end">
                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary/40">
                            <Lock size={16} />
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-20 flex flex-col items-center">
                <div className="w-full mb-32 relative flex items-center justify-between px-16 group">
                    <div className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-[2px] bg-primary/5 -z-10">
                        <motion.div
                            className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                        />
                    </div>
                    {STEPS.map((step, idx) => {
                        const isPast = idx < currentStep;
                        const isCurrent = idx === currentStep;
                        const Icon = step.icon;
                        
                        return (
                            <div key={step.id} className="flex flex-col items-center relative">
                                <motion.button
                                    onClick={() => setCurrentStep(idx)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`
                                        h-16 w-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 z-10
                                        ${isPast || isCurrent ? 'bg-white border-primary shadow-2xl shadow-primary/10' : 'bg-gray-50 border-primary/5 grayscale opacity-40'}
                                        ${isCurrent ? 'scale-125 ring-8 ring-primary/5' : ''}
                                    `}
                                >
                                    <Icon className={`h-6 w-6 ${isPast || isCurrent ? step.color : 'text-muted-foreground'}`} />
                                    {isPast && (
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg"
                                        >
                                            <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={4} />
                                        </motion.div>
                                    )}
                                </motion.button>
                                <span className={`text-[9px] font-black uppercase tracking-[0.3em] absolute -bottom-12 w-40 text-center transition-all duration-500 ${isCurrent ? 'text-primary' : 'text-muted-foreground/40'}`}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="w-full max-w-4xl min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 50, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -50, scale: 0.95 }}
                            transition={{ duration: 0.5, ease: "circOut" }}
                            className="w-full"
                        >
                            <Card className="rounded-[3rem] border border-primary/10 glass overflow-hidden shadow-2xl shadow-primary/5 p-16 md:p-24 text-center group">
                                <CardContent className="p-0 flex flex-col items-center">
                                    {currentStep === 0 && (
                                        <div className="space-y-10 w-full">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full scale-150 opacity-20" />
                                                <div className="h-24 w-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner relative z-10">
                                                    <FileCheck className="h-12 w-12 text-primary animate-pulse" />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h2 className="text-4xl font-serif font-black italic tracking-tighter text-foreground">
                                                    {t('passport_creation')}
                                                </h2>
                                                <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60 max-w-xl mx-auto leading-relaxed">
                                                    {t('passport_desc')}
                                                </p>
                                            </div>
                                            <div className="bg-slate-900 rounded-[2rem] p-8 text-left w-full max-w-md mx-auto shadow-2xl border border-white/5 relative overflow-hidden group/console">
                                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
                                                <div className="flex gap-2 mb-4">
                                                    <div className="h-2 w-2 rounded-full bg-red-500/50" />
                                                    <div className="h-2 w-2 rounded-full bg-amber-500/50" />
                                                    <div className="h-2 w-2 rounded-full bg-emerald-500/50" />
                                                </div>
                                                <div className="font-mono text-[10px] space-y-2 opacity-80">
                                                    <p className="text-emerald-400">&gt; gftb-bridge init --batch 902f1e</p>
                                                    <p className="text-blue-400">&gt; PREDICATE: manufacturer_origin_verified</p>
                                                    <p className="text-purple-400">&gt; CID: QmXoyp... (IPFS Primary Cluster)</p>
                                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                                                        <Fingerprint size={14} className="text-primary animate-pulse" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">{t('notarized_label')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 1 && (
                                        <div className="space-y-12 w-full">
                                            <div className="w-full bg-primary/[0.02] rounded-[2.5rem] border border-primary/5 p-12 relative overflow-hidden flex items-center shadow-inner">
                                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:20px_20px]" />
                                                <motion.div
                                                    className="relative z-10 flex flex-col items-center"
                                                    animate={{ x: `${truckProgress}%` }}
                                                    transition={{ duration: 0.1 }}
                                                    style={{ width: '40px' }}
                                                >
                                                    <div className="p-3 bg-white rounded-xl shadow-xl border border-primary/10">
                                                        <Truck size={24} className="text-indigo-500 transform -scale-x-100" />
                                                    </div>
                                                    <div className="h-24 w-0.5 bg-gradient-to-b from-primary/20 to-transparent mt-2 border-dashed border-r" />
                                                </motion.div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6 w-full max-w-lg mx-auto">
                                                <div className="p-8 bg-white rounded-[2rem] border border-primary/5 shadow-xl flex flex-col items-center group/card">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary mb-4 group-hover/card:scale-110 transition-transform">
                                                        <Thermometer size={18} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">{tt('temp_title')}</span>
                                                    <span className={`text-3xl font-mono font-black tracking-tighter transition-colors ${tempReading > -18 ? 'text-destructive' : 'text-emerald-500'}`}>
                                                        {tempReading.toFixed(1)}°C
                                                    </span>
                                                </div>
                                                <div className="p-8 bg-white rounded-[2rem] border border-primary/5 shadow-xl flex flex-col items-center group/card">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary mb-4 group-hover/card:scale-110 transition-transform">
                                                        <Globe size={18} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">{tt('location_updated_iot')}</span>
                                                    <span className="text-xl font-serif font-black italic text-foreground tracking-tight">{t('active_transit')}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h2 className="text-4xl font-serif font-black italic tracking-tighter text-foreground">{tt('iot_monitoring')}</h2>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 max-w-xl mx-auto leading-relaxed">
                                                    {tt('iot_monitoring')}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 2 && (
                                        <div className="space-y-12 w-full">
                                            <div className="flex items-center justify-center gap-12">
                                                <div className="flex flex-col items-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                                                    <div className="h-20 w-20 rounded-[2rem] bg-indigo-505/10 border border-indigo-500/20 flex items-center justify-center">
                                                        <Truck size={32} className="text-indigo-400" />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{at('role_logistics')}</span>
                                                </div>
                                                <div className="flex flex-col items-center shrink-0">
                                                    <motion.div
                                                        animate={{ x: [0, 10, 0] }}
                                                        transition={{ repeat: Infinity, duration: 2 }}
                                                    >
                                                        <ArrowRight size={32} className="text-primary/20" />
                                                    </motion.div>
                                                </div>
                                                <div className="flex flex-col items-center gap-4 relative">
                                                    <motion.div 
                                                        animate={{ scale: [1, 1.05, 1] }}
                                                        transition={{ repeat: Infinity, duration: 3 }}
                                                        className="h-24 w-24 rounded-[2.5rem] bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center shadow-2xl shadow-emerald-500/20"
                                                    >
                                                        <ShieldCheck size={40} className="text-emerald-500" />
                                                    </motion.div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{at('role_retailer')}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h2 className="text-4xl font-serif font-black italic tracking-tighter text-foreground">
                                                    {t('crypto_handover')}
                                                </h2>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 max-w-xl mx-auto leading-relaxed">
                                                    {t('crypto_desc')}
                                                </p>
                                            </div>
                                            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 max-w-sm mx-auto flex items-center gap-4">
                                                <Cpu className="text-primary" size={20} />
                                                <div className="text-left">
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-primary/40 leading-none mb-1">{t('dual_sig_consensus')}</p>
                                                    <p className="text-[10px] font-bold text-foreground">{t('handoff_validation')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 3 && (
                                        <div className="space-y-12 w-full">
                                            <motion.div 
                                                initial={{ scale: 0.8 }}
                                                animate={{ scale: 1 }}
                                                className="relative mx-auto h-64 w-64 bg-white p-6 rounded-[3rem] shadow-2xl border border-primary/5 overflow-hidden group/qr"
                                            >
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500/90 z-20 backdrop-blur-md opacity-0 group-hover/qr:opacity-100 transition-all duration-700">
                                                    <CheckCircle2 size={48} className="text-white mb-4" />
                                                    <span className="text-lg font-serif font-black italic text-white tracking-tight">{at('verified_badge')}</span>
                                                </div>
                                                <div className="w-full h-full bg-slate-900 rounded-2xl pattern-grid-lg opacity-10" />
                                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                                    <ScanLine size={100} className="text-primary/10 animate-pulse" />
                                                </div>
                                            </motion.div>
                                            <div className="space-y-4">
                                                <h2 className="text-4xl font-serif font-black italic tracking-tighter text-foreground">
                                                    {t('consumer_trust')}
                                                </h2>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 max-w-xl mx-auto leading-relaxed">
                                                    {t('consumer_desc')}
                                                </p>
                                            </div>
                                            <Link href="/">
                                                <Button className="h-16 px-12 bg-primary text-white hover:bg-primary/90 rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 transition-all active:scale-95">
                                                    {t('try_live_demo')}
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-8 mt-20">
                    <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={currentStep === 0 || animating}
                        className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-20"
                    >
                        {t('prev_step')}
                    </Button>
                    <div className="flex gap-4">
                        {STEPS.map((_, idx) => (
                            <motion.div
                                key={idx}
                                initial={false}
                                animate={{ 
                                    width: idx === currentStep ? 32 : 8,
                                    backgroundColor: idx === currentStep ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.1)'
                                }}
                                className="h-2 rounded-full cursor-pointer"
                                onClick={() => setCurrentStep(idx)}
                            />
                        ))}
                    </div>
                    <Button
                        onClick={nextStep}
                        disabled={currentStep === STEPS.length - 1 || animating}
                        className={`
                            h-14 px-10 bg-white border border-primary/10 hover:bg-primary hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl
                            ${currentStep === STEPS.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                        `}
                    >
                        {t('next_step')} <ArrowRight className="ml-3 h-4 w-4" />
                    </Button>
                </div>
            </main>
        </div>
    );
}
