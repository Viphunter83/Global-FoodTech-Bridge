'use client';

import { Link } from '@/navigation';
import { Home, Users, Shield, Activity, Fingerprint, LayoutDashboard, Database, Settings, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const t = useTranslations('Admin');

    return (
        <div className="flex min-h-screen bg-[#fafbfc] selection:bg-primary/10">
            {/* Premium Sidebar */}
            <aside className="w-80 bg-slate-900 text-white flex-shrink-0 hidden lg:flex flex-col border-r border-white/5 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32 opacity-50" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 blur-[80px] rounded-full -ml-24 -mb-24" />

                <div className="p-10 relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-white/10 shadow-2xl">
                            <Shield className="h-6 w-6 text-primary" />
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
                    <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 mb-4 px-4">Core Clusters</div>
                    
                    <Link href="/admin/dashboard">
                        <Button asChild variant="ghost" className="w-full h-14 justify-start text-white/40 hover:text-white hover:bg-white/5 rounded-2xl px-4 group transition-all">
                            <span>
                                <LayoutDashboard className="mr-4 h-5 w-5 group-hover:text-primary transition-colors" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('admin_dashboard')}</span>
                            </span>
                        </Button>
                    </Link>

                    <Link href="/admin/companies">
                        <Button asChild variant="ghost" className="w-full h-14 justify-start text-white/40 hover:text-white hover:bg-white/5 rounded-2xl px-4 group transition-all">
                            <span>
                                <Users className="mr-4 h-5 w-5 group-hover:text-primary transition-colors" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('admin_companies')}</span>
                            </span>
                        </Button>
                    </Link>
                    
                    <Link href="/admin/monitoring">
                        <Button asChild variant="ghost" className="w-full h-14 justify-start text-white/40 hover:text-white hover:bg-white/5 rounded-2xl px-4 group transition-all">
                            <span>
                                <Activity className="mr-4 h-5 w-5 group-hover:text-primary transition-colors" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('admin_monitoring')}</span>
                            </span>
                        </Button>
                    </Link>

                    <div className="pt-8 text-[8px] font-black uppercase tracking-[0.4em] text-white/20 mb-4 px-4">Ledger Actions</div>
                    
                    <Link href="/admin/protocols">
                        <Button asChild variant="ghost" className="w-full h-14 justify-start text-white/40 hover:text-white hover:bg-white/5 rounded-2xl px-4 group transition-all">
                            <span>
                                <Fingerprint className="mr-4 h-5 w-5 group-hover:text-primary transition-colors" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('admin_auth_protocols')}</span>
                            </span>
                        </Button>
                    </Link>

                    <Link href="/admin/sensors">
                        <Button asChild variant="ghost" className="w-full h-14 justify-start text-white/40 hover:text-white hover:bg-white/5 rounded-2xl px-4 group transition-all">
                            <span>
                                <Cpu className="mr-4 h-5 w-5 group-hover:text-primary transition-colors" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('admin_sensors_title')}</span>
                            </span>
                        </Button>
                    </Link>
                    
                    <Button variant="ghost" className="w-full h-14 justify-start text-white/20 cursor-not-allowed rounded-2xl px-4 opacity-50">
                        <Database className="mr-4 h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Smart Contracts</span>
                    </Button>
                </nav>

                <div className="p-8 relative z-10">
                    <Link href="/dashboard">
                        <Button asChild className="w-full h-14 bg-white/5 hover:bg-white/10 text-white rounded-[1.5rem] border border-white/5 justify-start px-6 group transition-all">
                            <span>
                                <LayoutDashboard className="mr-4 h-5 w-5 text-primary/60 group-hover:text-primary transition-all" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('admin_back_to_app')}</span>
                            </span>
                        </Button>
                    </Link>
                    
                    <div className="mt-8 flex items-center justify-between px-2 opacity-20">
                        <span className="text-[8px] font-black uppercase tracking-widest">v2.4.0-STABLE</span>
                        <Settings size={12} className="cursor-pointer hover:rotate-90 transition-transform duration-500" />
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-h-screen overflow-hidden flex flex-col">
                <header className="h-20 border-b border-primary/5 bg-white/50 backdrop-blur-xl xl:hidden flex items-center px-8">
                    <Shield className="h-6 w-6 text-primary mr-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('admin_operator_title')}</span>
                </header>
                
                <div className="flex-1 overflow-auto p-8 md:p-12 xl:p-20">
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
