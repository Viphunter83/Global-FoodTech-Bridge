'use client';

import { Link } from '@/navigation';
import { Home, Users, Shield, Activity, Fingerprint, LayoutDashboard, Database, Settings, Cpu, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

function NavItems({ t, onNavigate }: { t: any; onNavigate?: () => void }) {
    const navItemClass = "w-full h-14 justify-start text-white/40 hover:text-white hover:bg-white/5 rounded-2xl px-4 group transition-all";
    const labelClass = "text-[10px] font-black uppercase tracking-[0.2em]";
    const iconClass = "mr-4 h-5 w-5 group-hover:text-primary transition-colors";

    return (
        <>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 mb-4 px-4">{t('nav_core_clusters')}</div>
            
            <Link href="/admin/dashboard" onClick={onNavigate}>
                <Button asChild variant="ghost" className={navItemClass}>
                    <span>
                        <LayoutDashboard className={iconClass} />
                        <span className={labelClass}>{t('admin_dashboard')}</span>
                    </span>
                </Button>
            </Link>

            <Link href="/admin/companies" onClick={onNavigate}>
                <Button asChild variant="ghost" className={navItemClass}>
                    <span>
                        <Users className={iconClass} />
                        <span className={labelClass}>{t('admin_companies')}</span>
                    </span>
                </Button>
            </Link>
            
            <Link href="/admin/monitoring" onClick={onNavigate}>
                <Button asChild variant="ghost" className={navItemClass}>
                    <span>
                        <Activity className={iconClass} />
                        <span className={labelClass}>{t('admin_monitoring')}</span>
                    </span>
                </Button>
            </Link>

            <div className="pt-8 text-[8px] font-black uppercase tracking-[0.4em] text-white/20 mb-4 px-4">{t('nav_ledger_actions')}</div>
            
            <Link href="/admin/protocols" onClick={onNavigate}>
                <Button asChild variant="ghost" className={navItemClass}>
                    <span>
                        <Fingerprint className={iconClass} />
                        <span className={labelClass}>{t('admin_auth_protocols')}</span>
                    </span>
                </Button>
            </Link>

            <Link href="/admin/sensors" onClick={onNavigate}>
                <Button asChild variant="ghost" className={navItemClass}>
                    <span>
                        <Cpu className={iconClass} />
                        <span className={labelClass}>{t('admin_sensors_title')}</span>
                    </span>
                </Button>
            </Link>
            
            <Link href="/admin/contracts" onClick={onNavigate}>
                <Button asChild variant="ghost" className={navItemClass}>
                    <span>
                        <Database className={iconClass} />
                        <span className={labelClass}>{t('smart_contracts')}</span>
                    </span>
                </Button>
            </Link>
        </>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const t = useTranslations('Admin');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#fafbfc] selection:bg-primary/10">
            {/* Premium Desktop Sidebar */}
            <aside className="w-80 bg-slate-900 text-white flex-shrink-0 hidden lg:flex flex-col border-r border-white/5 relative overflow-hidden" role="navigation" aria-label="Admin navigation">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32 opacity-50" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 blur-[80px] rounded-full -ml-24 -mb-24" />

                <div className="p-10 relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-white/10 shadow-2xl">
                            <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
                        </div>
                        <div>
                            <h1 className="text-xl font-serif font-black italic tracking-tighter text-white">
                                GFTB Admin
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30">{t('admin_operator_title')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="mt-4 px-6 space-y-2 flex-grow relative z-10">
                    <NavItems t={t} />
                </nav>

                <div className="p-8 relative z-10">
                    <Link href="/dashboard">
                        <Button asChild className="w-full h-14 bg-white/5 hover:bg-white/10 text-white rounded-[1.5rem] border border-white/5 justify-start px-6 group transition-all">
                            <span>
                                <LayoutDashboard className="mr-4 h-5 w-5 text-primary/60 group-hover:text-primary transition-all" aria-hidden="true" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('admin_back_to_app')}</span>
                            </span>
                        </Button>
                    </Link>
                    
                    <div className="mt-8 flex items-center justify-between px-2 opacity-20">
                        <span className="text-[8px] font-black uppercase tracking-widest">v2.4.0-STABLE</span>
                        <Settings size={12} className="cursor-pointer hover:rotate-90 transition-transform duration-500" aria-hidden="true" />
                    </div>
                </div>
            </aside>

            {/* Mobile Navigation Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                            aria-hidden="true"
                        />
                        {/* Slide-over Panel */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-slate-900 text-white flex flex-col border-r border-white/5 overflow-y-auto lg:hidden"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Admin navigation menu"
                        >
                            {/* Header */}
                            <div className="p-8 flex items-center justify-between border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center border border-white/10">
                                        <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-serif font-black italic tracking-tighter">GFTB Admin</h2>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-white/30">{t('admin_operator_title')}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                                    aria-label="Close navigation menu"
                                >
                                    <X className="h-5 w-5 text-white/60" />
                                </button>
                            </div>

                            {/* Nav Items */}
                            <nav className="flex-1 px-6 py-6 space-y-2">
                                <NavItems t={t} onNavigate={() => setIsMobileMenuOpen(false)} />
                            </nav>

                            {/* Footer */}
                            <div className="p-6 border-t border-white/5">
                                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button asChild className="w-full h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5 justify-start px-4 group transition-all text-[10px]">
                                        <span>
                                            <LayoutDashboard className="mr-3 h-4 w-4 text-primary/60 group-hover:text-primary transition-all" aria-hidden="true" />
                                            <span className="font-black uppercase tracking-[0.2em]">{t('admin_back_to_app')}</span>
                                        </span>
                                    </Button>
                                </Link>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 min-h-screen overflow-hidden flex flex-col" role="main">
                {/* Mobile Header with Menu Button */}
                <header className="h-24 border-b border-primary/5 bg-white/40 backdrop-blur-2xl lg:hidden flex items-center px-6 justify-between sticky top-0 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all"
                            aria-label="Open admin navigation menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-primary" aria-hidden="true" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">GFTB OS</span>
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">{t('admin_operator_title')}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary/20 to-emerald-500/20 border border-primary/10 flex items-center justify-center">
                            <Users size={16} className="text-primary" />
                        </div>
                    </div>
                </header>
                
                <div className="flex-1 overflow-auto p-6 md:p-12 xl:p-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "circOut" }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
