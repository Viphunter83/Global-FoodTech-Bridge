'use client';

import Link from 'next/link';
import { Home, Users, Shield, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { t } = useLanguage();

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Shield className="h-6 w-6 text-blue-400" />
                        GFTB Admin
                    </h1>
                    <p className="text-xs text-gray-400 mt-2">{t('admin_operator_title')}</p>
                </div>
                <nav className="mt-6 px-4 space-y-2 flex-grow">
                    <Link href="/admin/companies">
                        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10">
                            <Users className="mr-2 h-4 w-4" />
                            {t('admin_companies')}
                        </Button>
                    </Link>
                    <Link href="/admin/monitoring">
                        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10">
                            <Activity className="mr-2 h-4 w-4" />
                            {t('admin_monitoring')}
                        </Button>
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10">
                            <Home className="mr-2 h-4 w-4" />
                            {t('admin_back_to_app')}
                        </Button>
                    </Link>
                </div>
            </aside>
            <main className="flex-1 p-8 overflow-auto h-screen">
                {children}
            </main>
        </div>
    );
}
