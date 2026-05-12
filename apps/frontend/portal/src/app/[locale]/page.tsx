import Image from 'next/image';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import { 
    ShieldCheck, Thermometer, Globe, CheckCircle2, Zap, 
    BarChart3, Cpu, ScanLine, Factory, Truck, Fingerprint, 
    Database, Warehouse, FileCheck, Store, ClipboardCheck 
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ProcessStep } from '@/components/marketing/ProcessStep';
import { TrustBadge } from '@/components/marketing/TrustBadge';
import { 
    SearchWidget, 
    HeroAnimations, 
    FadeInUp, 
    SlideInLeft, 
    ScaleIn, 
    SlideInRight,
    AnimatedBar,
    ScrollToButton 
} from '@/components/home/HomeClient';

/**
 * Homepage — Server Component (SSR).
 * 
 * All static marketing content is rendered on the server for SEO.
 * Interactive parts (search, animations) are Client Islands imported 
 * from HomeClient.tsx.
 */
export default function Home() {
    const t = useTranslations();

    return (
        <div className="flex flex-col items-center bg-background min-h-screen">
            {/* ═══════════════════════════════════════════════════════════════
                HERO SECTION — Cinematic Background
            ═══════════════════════════════════════════════════════════════ */}
            <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
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
                        <HeroAnimations>
                            <FadeInUp className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-primary/20 text-primary text-xs font-bold uppercase tracking-widest leading-none">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                {t('Marketing.blockchain_verified_badge')}
                            </FadeInUp>
                            
                            <FadeInUp>
                                <h1 className="text-6xl md:text-9xl font-serif font-black tracking-tighter text-foreground leading-[0.9] text-shadow">
                                    {t('Hero.title').split('.')[0]}<span className="text-secondary">.</span>
                                </h1>
                            </FadeInUp>
                            
                            <FadeInUp>
                                <p className="text-lg md:text-2xl text-muted-foreground/90 max-w-3xl mx-auto leading-relaxed font-medium">
                                    {t('Hero.subtitle')}
                                </p>
                            </FadeInUp>

                            <FadeInUp className="flex flex-wrap items-center justify-center gap-4 pt-4">
                                <ScrollToButton targetId="search-widget" className="h-auto min-h-[4rem] py-4 px-8 rounded-2xl text-lg font-bold premium-gradient text-white shadow-2xl shadow-primary/20 hover:scale-105 transition-all whitespace-normal leading-tight">
                                    {t('Hero.cta_track')}
                                </ScrollToButton>
                                <Button size="lg" variant="outline" asChild className="h-auto min-h-[4rem] py-4 px-8 rounded-2xl text-lg font-bold border-primary/20 glass hover:bg-white/5 transition-all whitespace-normal leading-tight">
                                    <Link href="/dashboard">
                                        {t('Hero.cta_dashboard')}
                                    </Link>
                                </Button>
                            </FadeInUp>
                        </HeroAnimations>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                HARD TRUST ADVANTAGE
            ═══════════════════════════════════════════════════════════════ */}
            <section className="w-full py-32 relative overflow-hidden">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <SlideInLeft className="space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-sm font-black uppercase tracking-[0.4em] text-primary">{t('Marketing.hard_trust_subtitle')}</h2>
                                <h3 className="text-4xl md:text-6xl font-serif font-black italic tracking-tighter leading-tight">
                                    {t('Marketing.hard_trust_title')}
                                </h3>
                            </div>
                            
                            <div className="grid gap-6">
                                <div className="flex gap-4 p-6 rounded-3xl glass border-primary/5 hover:border-primary/20 transition-all">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <Cpu className="text-primary h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2">{t('Marketing.iot_feature_title')}</h4>
                                        <p className="text-muted-foreground text-sm leading-relaxed">{t('Marketing.iot_feature_desc')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-6 rounded-3xl glass border-primary/5 hover:border-primary/20 transition-all">
                                    <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="text-secondary h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2">{t('Marketing.bc_feature_title')}</h4>
                                        <p className="text-muted-foreground text-sm leading-relaxed">{t('Marketing.bc_feature_desc')}</p>
                                    </div>
                                </div>
                            </div>
                        </SlideInLeft>
                        
                        <ScaleIn className="relative group">
                            <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full opacity-30 group-hover:opacity-50 transition-opacity" />
                            <div className="relative glass p-4 rounded-[3rem] border-primary/10 shadow-2xl">
                                <div className="bg-slate-950 rounded-[2.5rem] p-8 font-mono text-xs space-y-4 text-emerald-400 overflow-hidden">
                                    <div className="flex gap-2 mb-6">
                                        <div className="h-3 w-3 rounded-full bg-red-500/50" />
                                        <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                                        <div className="h-3 w-3 rounded-full bg-green-500/50" />
                                    </div>
                                    <p className="opacity-50"># {t('Terminal.header')}</p>
                                    <p>&gt; {t('Terminal.initializing')}</p>
                                    <p className="text-blue-400">&gt; {t('Terminal.verifying', { id: '2cbade92-e88e-48a8-a682-94ae0a0205e8' })}</p>
                                    <p className="text-purple-400">&gt; {t('Terminal.iot_sync', { sensor: 'EMERSON_492' })}</p>
                                    <p className="text-emerald-500">&gt; {t('Terminal.status')}</p>
                                    <div className="h-40 flex items-end gap-1 pt-8" aria-hidden="true">
                                        {[40, 70, 45, 90, 65, 80, 50, 95, 30, 85, 60, 75].map((h, i) => (
                                            <AnimatedBar key={i} height={h} index={i} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </ScaleIn>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                HOW IT WORKS JOURNEY
            ═══════════════════════════════════════════════════════════════ */}
            <section className="w-full py-32 bg-primary/[0.02]">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-24 space-y-4">
                        <h2 className="text-sm font-black uppercase tracking-[0.4em] text-primary">{t('Marketing.the_process')}</h2>
                        <h3 className="text-4xl md:text-6xl font-serif font-black italic tracking-tighter">{t('Marketing.process_subtitle')}</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <ProcessStep 
                            icon={Factory}
                            title={t('Marketing.passport_creation_title')}
                            description={t('Marketing.passport_creation_desc')}
                            index={0}
                        />
                        <ProcessStep 
                            icon={Thermometer}
                            title={t('Marketing.iot_monitoring_title')}
                            description={t('Marketing.iot_monitoring_desc')}
                            index={1}
                        />
                        <ProcessStep 
                            icon={Fingerprint}
                            title={t('Marketing.crypto_handover_title')}
                            description={t('Marketing.crypto_handover_desc')}
                            index={2}
                        />
                        <ProcessStep 
                            icon={Globe}
                            title={t('Marketing.consumer_proof_title')}
                            description={t('Marketing.consumer_proof_desc')}
                            index={3}
                        />
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                MERCHANT / B2B ADVANTAGE
            ═══════════════════════════════════════════════════════════════ */}
            <section className="w-full py-32 relative overflow-hidden">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <SlideInRight className="order-last lg:order-first">
                            <div className="relative max-w-md mx-auto">
                                <div className="absolute inset-0 bg-secondary/20 blur-[100px] rounded-full opacity-30" />
                                <Image 
                                    src="/images/mockup-phone.png"
                                    alt="Consumer Sales Funnel Integration"
                                    width={500}
                                    height={1000}
                                    className="relative rounded-[3rem] shadow-2xl border-4 border-white/10 hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute -bottom-10 -right-10 glass p-8 rounded-3xl border-primary/20 shadow-2xl space-y-4 max-w-[200px]">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Zap className="h-5 w-5" />
                                        <span className="font-black text-xs uppercase tracking-widest">+24% Sales</span>
                                    </div>
                                    <p className="text-[10px] font-medium text-muted-foreground">{t('Marketing.merchant_subtitle')}</p>
                                </div>
                            </div>
                        </SlideInRight>
                        
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-sm font-black uppercase tracking-[0.4em] text-secondary">{t('Marketing.merchant_subtitle')}</h2>
                                <h3 className="text-4xl md:text-6xl font-serif font-black italic tracking-tighter leading-tight">
                                    {t('Marketing.merchant_title')}
                                </h3>
                            </div>
                            
                            <div className="space-y-6">
                                <h4 className="text-2xl font-bold text-foreground/90">{t('Marketing.merchant_funnel_title')}</h4>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {t('Marketing.merchant_funnel_desc')}
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        t('Marketing.merchant_feature_1'),
                                        t('Marketing.merchant_feature_2'),
                                        t('Marketing.merchant_feature_3'),
                                        t('Marketing.merchant_feature_4')
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-foreground/80 font-medium">
                                            <CheckCircle2 className="h-5 w-5 text-secondary" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="pt-8">
                                    <Button size="lg" asChild className="h-auto min-h-[4rem] py-4 px-10 rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold shadow-xl shadow-secondary/20 transition-all whitespace-normal leading-tight">
                                        <Link href="/contact?subject=partner">
                                            {t('Marketing.partner_btn')}
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                INTERACTIVE SEARCH TOOL — Client Island
            ═══════════════════════════════════════════════════════════════ */}
            <section id="search-widget" className="w-full py-32 bg-slate-950/20 text-foreground">
                <div className="container px-4 md:px-6 mx-auto text-center space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-sm font-black uppercase tracking-[0.4em] text-primary">{t('Marketing.try_it_live')}</h2>
                        <h3 className="text-4xl md:text-5xl font-serif font-black italic tracking-tighter">{t('Marketing.enter_passport_id')}</h3>
                    </div>
                    <SearchWidget />
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                ECOSYSTEM SECTION
            ═══════════════════════════════════════════════════════════════ */}
            <section className="w-full py-32">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                        <h2 className="text-sm font-black uppercase tracking-[0.4em] text-primary">{t('Marketing.ecosystem_title')}</h2>
                        <h3 className="text-4xl md:text-5xl font-serif font-black italic tracking-tighter">
                            {t('Marketing.ecosystem_subtitle')}
                        </h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        <TrustBadge name={t('Tracking.ecosystem_logistics')} description={t('Tracking.hcmc_location')} icon={Warehouse} />
                        <TrustBadge name={t('Tracking.ecosystem_customs')} description={t('Tracking.ru_location')} icon={FileCheck} />
                        <TrustBadge name={t('Tracking.ecosystem_retail')} description={t('Tracking.uae_location')} icon={Store} />
                        <TrustBadge name={t('Tracking.ecosystem_audit')} description={t('Tracking.halal_cert')} icon={ClipboardCheck} />
                        <TrustBadge name={t('Tracking.ecosystem_iot')} description={t('Tracking.tive_integration')} icon={Cpu} />
                        <TrustBadge name={t('Tracking.ecosystem_l2')} description={t('Tracking.polygon_mainnet')} icon={Database} />
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                CTA FOOTER
            ═══════════════════════════════════════════════════════════════ */}
            <section className="w-full py-24 bg-gradient-to-t from-primary/10 to-transparent">
                <div className="container px-4 md:px-6 mx-auto text-center space-y-10">
                    <h2 className="text-4xl md:text-7xl font-serif font-black italic tracking-tighter">{t('Marketing.ready_title')}</h2>
                    <div className="flex flex-wrap justify-center gap-6">
                        <Button size="lg" asChild className="h-auto min-h-[4rem] py-4 px-12 rounded-2xl bg-primary text-white text-lg font-bold shadow-2xl shadow-primary/30 transition-all hover:scale-105 whitespace-normal leading-tight">
                            <Link href="/contact?subject=sales">
                                {t('Marketing.contact_sales')}
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="h-auto min-h-[4rem] py-4 px-12 rounded-2xl text-lg font-bold glass border-primary/20 hover:bg-white/5 transition-all whitespace-normal leading-tight">
                            <a href="https://github.com/Viphunter83/Global-FoodTech-Bridge/tree/main/docs" target="_blank" rel="noopener noreferrer">
                                {t('Marketing.view_docs')}
                            </a>
                        </Button>
                    </div>
                    
                    <footer className="pt-20 border-t border-primary/10 flex flex-col md:flex-row items-center justify-between gap-8 text-muted-foreground/60 text-xs font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-4">
                            <Database className="h-4 w-4" />
                            <span>{t('Marketing.blockchain_badge')}</span>
                        </div>
                        <nav className="flex gap-8" aria-label="Footer navigation">
                            <Link href="/contact?subject=privacy" className="hover:text-primary transition-colors">{t('Footer.privacy')}</Link>
                            <Link href="/contact?subject=terms" className="hover:text-primary transition-colors">{t('Footer.terms')}</Link>
                            <Link href="https://github.com/Viphunter83/Global-FoodTech-Bridge/blob/main/docs/COMPLIANCE.md" className="hover:text-primary transition-colors" target="_blank">{t('Footer.compliance')}</Link>
                        </nav>
                        <div className="flex items-center gap-2">
                             <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                             {t('Marketing.operational_status')}
                        </div>
                    </footer>
                </div>
            </section>
        </div>
    );
}
