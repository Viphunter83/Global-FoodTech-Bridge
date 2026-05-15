'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, Globe, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Link } from '@/navigation';

export function ContactClient() {
    const t = useTranslations();

    return (
        <main className="min-h-screen bg-background py-32 px-4 selection:bg-primary/10">
            <div className="container max-w-6xl mx-auto">
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center space-y-6 mb-24"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                        <Globe className="h-3 w-3 animate-pulse" />
                        {t('Marketing.ecosystem_title')}
                    </div>
                    <h1 className="text-6xl md:text-9xl font-serif font-black italic tracking-tighter leading-[0.85]">
                        {t('Marketing.contact_sales').split(' ')[0]}<br/>
                        <span className="text-primary">{t('Marketing.contact_sales').split(' ')[1] || 'Today'}</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                        {t('Hero.subtitle')}
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-12 gap-16 items-start">
                    {/* Left Column: Context & Global Presence */}
                    <div className="lg:col-span-5 space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-4xl font-serif font-black italic tracking-tight text-foreground/90">
                                {t('Marketing.merchant_title')}
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {t('Marketing.merchant_funnel_desc')}
                            </p>
                        </div>

                        <div className="grid gap-4">
                            <div className="flex items-center gap-4 p-6 rounded-[2rem] glass border-primary/10 hover:border-primary/30 transition-all">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Mail className="text-primary h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-1">Global Partnership</p>
                                    <p className="text-lg font-bold">bridge@gftb.tech</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 p-6 rounded-[2rem] glass border-secondary/10 hover:border-secondary/30 transition-all">
                                <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
                                    <Zap className="text-secondary h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/60 mb-1">Fast-Track Integration</p>
                                    <p className="text-lg font-bold">api-support@gftb.tech</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-6 rounded-[2rem] glass border-foreground/5 hover:border-foreground/10 transition-all">
                                <div className="h-12 w-12 rounded-2xl bg-foreground/5 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="text-foreground/60 h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-1">Compliance & ESG</p>
                                    <p className="text-lg font-bold font-serif italic italic font-black">Audit Ready 24/7</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-primary/10">
                            <Link href="/" className="text-sm font-black uppercase tracking-widest text-primary hover:tracking-[0.2em] transition-all flex items-center gap-2">
                                <ArrowRight className="h-4 w-4 rotate-180" />
                                {t('Common.back_to_app')}
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Inquiry Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="lg:col-span-7"
                    >
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-[4rem] opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="relative p-10 md:p-16 rounded-[4rem] bg-slate-950/40 backdrop-blur-3xl border border-primary/20 shadow-2xl space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-serif font-black italic tracking-tight">{t('Marketing.ready_title')}</h3>
                                    <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">Expected Response Time: &lt; 4 Hours</p>
                                </div>

                                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-2">Full Name</Label>
                                            <Input placeholder="John Doe" className="h-16 rounded-2xl bg-background/50 border-primary/10 focus:border-primary/40 focus:ring-primary/10 text-lg" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-2">Corporate Email</Label>
                                            <Input placeholder="john@industry.com" className="h-16 rounded-2xl bg-background/50 border-primary/10 focus:border-primary/40 focus:ring-primary/10 text-lg" />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-2">Trade Corridor / Interest Area</Label>
                                        <Input placeholder="e.g. EU-Vietnam Logistics" className="h-16 rounded-2xl bg-background/50 border-primary/10 focus:border-primary/40 focus:ring-primary/10 text-lg" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-2">Inquiry Details</Label>
                                        <Textarea 
                                            placeholder="Tell us about your supply chain scale and compliance requirements..." 
                                            className="min-h-[160px] rounded-[2rem] bg-background/50 border-primary/10 focus:border-primary/40 focus:ring-primary/10 text-lg p-6" 
                                        />
                                    </div>

                                    <Button className="w-full h-20 rounded-[2rem] text-xl font-black uppercase tracking-widest premium-gradient text-white shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all group">
                                        Initialize Consultation
                                        <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                                    </Button>

                                    <p className="text-center text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] pt-4">
                                        Data secured via GFTB Encryption Protocols
                                    </p>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
    return <label className={`block font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>{children}</label>;
}
