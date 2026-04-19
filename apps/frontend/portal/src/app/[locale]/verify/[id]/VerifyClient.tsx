'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { CheckCircle, ShieldCheck, AlertTriangle, FileText, Activity, MapPin, Truck, ChevronRight } from 'lucide-react';
import { BatchDetails, BlockchainStatus } from '@/lib/api';

interface VerifyClientProps {
    batch: BatchDetails;
    blockchain: BlockchainStatus;
}

export function VerifyClient({ batch, blockchain }: VerifyClientProps) {
    const t = useTranslations();
    const locale = useLocale();
    const [activeTab, setActiveTab] = useState<'details' | 'process'>('details');

    const isVerified = blockchain.verified && !blockchain.violation;

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
            {/* Mobile Header - Premium Glassmorphism */}
            <header className="sticky top-0 z-50 flex items-center justify-between border-b border-primary/10 bg-background/80 px-6 py-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xs shadow-lg shadow-primary/20">
                        GF
                    </div>
                    <div className="font-serif font-black text-xl tracking-tighter">
                        <span className="text-primary pr-0.5">Bridge</span>
                        <span className="text-muted-foreground font-light text-sm uppercase tracking-widest pl-1 border-l border-primary/20 ml-1">Verify</span>
                    </div>
                </div>
                <LanguageSwitcher />
            </header>

            <main className="pb-32">
                {/* Hero Status Section - High Impact */}
                <div className={`relative overflow-hidden flex flex-col items-center justify-center p-12 text-center transition-all duration-700 ${isVerified ? 'bg-emerald-500/5' : 'bg-destructive/5'}`}>
                    <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
                    
                    <div className="relative z-10 animate-in fade-in zoom-in duration-700">
                        {isVerified ? (
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                                <div className="relative rounded-[2rem] bg-emerald-500 p-6 shadow-2xl shadow-emerald-500/30 ring-1 ring-white/20">
                                    <ShieldCheck className="h-16 w-16 text-white" />
                                </div>
                            </div>
                        ) : (
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                                <div className="relative rounded-[2rem] bg-destructive p-6 shadow-2xl shadow-destructive/30 ring-1 ring-white/20 text-white">
                                    <AlertTriangle className="h-16 w-16" />
                                </div>
                            </div>
                        )}

                        <h1 className="text-4xl font-serif font-black text-foreground mb-3 tracking-tight italic">
                            {isVerified ? t('Compliance.verified_badge') : 'CONSULT AUTHORITY'}
                        </h1>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60 mb-8 bg-muted/50 px-4 py-1 rounded-full border border-primary/5 inline-block">
                            {t('Common.batch_id')} {batch.id.substring(0, 12)}
                        </p>

                        {blockchain.txHash && (
                            <div className="flex justify-center">
                                <a
                                    href={`https://amoy.polygonscan.com/tx/${blockchain.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-2 px-6 py-3 bg-white hover:bg-primary hover:text-white transition-all rounded-2xl shadow-lg border border-primary/10 text-xs font-bold uppercase tracking-widest text-primary"
                                >
                                    {t('Batch.view_explorer_link')}
                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modern Navigation Tabs */}
                <div className="flex bg-muted/30 p-2 mx-6 mt-8 rounded-[1.5rem] border border-primary/5">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'details' ? 'bg-background shadow-lg text-primary scale-[1.02]' : 'text-muted-foreground hover:bg-muted/50'}`}
                    >
                        {t('Batch.product_details_tab')}
                    </button>
                    <button
                        onClick={() => setActiveTab('process')}
                        className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'process' ? 'bg-background shadow-lg text-primary scale-[1.02]' : 'text-muted-foreground hover:bg-muted/50'}`}
                    >
                        {t('Batch.provenance_tab')}
                    </button>
                </div>

                {/* Content Area */}
                <div className="px-6 mt-10">
                    {activeTab === 'details' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Product Info Card */}
                            <div className="glass border-primary/5 p-8 rounded-[2.5rem] shadow-sm">
                                <h2 className="text-3xl font-serif font-black text-foreground mb-2 leading-tight italic">{batch.product_type.replace(/_/g, ' ')}</h2>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                    <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-tighter">
                                        {batch.batch_size} {t(`Batch.unit_${batch.unit_of_measure}` as any) || batch.unit_of_measure}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                                        <MapPin className="h-4 w-4 text-primary/40" />
                                        <span>{batch.origin_country}</span>
                                        <ChevronRight className="h-3 w-3 text-muted-foreground/30" />
                                        <span>{batch.destination_country}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Compliance Badge - Premium Card */}
                            <div className="relative overflow-hidden group rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/[0.03] p-8 transition-all hover:bg-emerald-500/[0.05]">
                                <div className="absolute right-0 top-0 -mr-6 -mt-6 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl transition-all group-hover:scale-150" />
                                <div className="relative z-10 flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-3xl bg-emerald-500 flex items-center justify-center text-white font-serif font-black text-2xl shadow-xl shadow-emerald-500/20">
                                        حلال
                                    </div>
                                    <div>
                                        <div className="text-xl font-black text-emerald-900 tracking-tight italic underline decoration-emerald-500/30 underline-offset-4">{t('Compliance.halal_cert_label')}</div>
                                        <div className="text-sm font-bold text-emerald-700/70 mt-1 uppercase tracking-widest">Global Halal Trust • UAE Gvt Certified</div>
                                    </div>
                                </div>
                            </div>

                            {/* Technical Specs: Ingredients & Nutrition */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="glass border-primary/5 p-8 rounded-[2rem]">
                                    <h3 className="flex items-center font-black text-xs uppercase tracking-[0.2em] text-primary mb-6">
                                        <FileText className="mr-3 h-5 w-5 text-primary/40" />
                                        {t('Batch.ingredients')}
                                    </h3>
                                    <p className="text-lg font-medium text-foreground italic leading-relaxed">
                                        {typeof batch.ingredients === 'string'
                                            ? batch.ingredients
                                            : (batch.ingredients?.[locale as 'en' | 'ru' | 'ar' | 'vi'] || batch.ingredients?.['en'])
                                        }
                                    </p>
                                </div>

                                <div className="glass border-primary/5 p-8 rounded-[2rem]">
                                    <h3 className="flex items-center font-black text-xs uppercase tracking-[0.2em] text-primary mb-6">
                                        <Activity className="mr-3 h-5 w-5 text-primary/40" />
                                        {t('Batch.nutrition_label')}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Energy', val: batch.nutrition?.calories, unit: 'kcal' },
                                            { label: 'Prot.', val: batch.nutrition?.protein, unit: 'g' },
                                            { label: 'Fat', val: batch.nutrition?.fat, unit: 'g' },
                                            { label: 'Carbs', val: batch.nutrition?.carbs, unit: 'g' }
                                        ].map(item => (
                                            <div key={item.label} className="bg-background/50 rounded-2xl p-4 border border-primary/5 text-center">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">{item.label}</div>
                                                <div className="text-xl font-serif font-black">{item.val}<span className="text-[10px] font-bold text-primary/60 ml-0.5">{item.unit}</span></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'process' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="relative pl-12 before:absolute before:left-0 before:top-4 before:bottom-0 before:w-0.5 before:bg-primary/10">
                                {/* Step 1: Production */}
                                <div className="relative mb-12">
                                    <div className="absolute -left-[60px] top-0 h-10 w-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg ring-8 ring-background">
                                        <Activity className="h-5 w-5" />
                                    </div>
                                    <h4 className="text-xl font-black text-foreground italic tracking-tight">{t('Batch.step_production')}</h4>
                                    <p className="text-sm font-bold text-muted-foreground/60 mt-1 uppercase tracking-widest">Phase 01 • Immutable Record</p>
                                    <div className="mt-4 p-4 glass rounded-2xl border border-primary/5 inline-flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <MapPin className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="text-sm font-black uppercase tracking-tight">{batch.origin_country || 'Vietnam'} Production Plant</span>
                                    </div>
                                </div>

                                {/* Step 2: Logistics */}
                                <div className="relative">
                                    <div className="absolute -left-[60px] top-0 h-10 w-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg ring-8 ring-background animate-pulse">
                                        <Truck className="h-5 w-5" />
                                    </div>
                                    <h4 className="text-xl font-black text-foreground italic tracking-tight">{t('Batch.step_logistics')}</h4>
                                    <p className="text-sm font-bold text-emerald-600/60 mt-1 uppercase tracking-widest">Phase 02 • Live IoT monitoring</p>
                                    
                                    <div className="mt-6 flex flex-col gap-3">
                                        <div className="p-5 glass border-emerald-500/20 bg-emerald-500/[0.02] rounded-[1.5rem] flex items-center gap-4">
                                            <div className="relative">
                                                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping absolute" />
                                                <div className="h-3 w-3 rounded-full bg-emerald-500 relative" />
                                            </div>
                                            <span className="text-sm font-bold text-emerald-900">{t('Tracking.live_tracking_active')}</span>
                                        </div>
                                        <p className="text-xs font-bold text-muted-foreground/40 pl-2 leading-relaxed italic uppercase tracking-wider">
                                            {t('Tracking.iot_monitoring')} via GFTB-Bridge-V2 Protocol
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action - Floating Premium Bar */}
                <div className="fixed bottom-6 left-6 right-6 z-50">
                    <div className="max-w-2xl mx-auto glass dark:bg-slate-900/90 border-primary/10 p-4 rounded-[2rem] shadow-2xl shadow-primary/20 backdrop-blur-2xl">
                        <button
                            onClick={() => alert("Global FoodTech Security Protocol: Issue reporting system is being migrated to automated smart contracts. Please use the dashboard for active disputes.")}
                            className="w-full bg-primary text-white rounded-[1.5rem] h-14 font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            {t('Common.report_issue')}
                        </button>
                        <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            <ShieldCheck className="h-3 w-3" />
                            Global FoodTech Bridge Protocol ID: {batch.id.substring(0, 16)}...
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

