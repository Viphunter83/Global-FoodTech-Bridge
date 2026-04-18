'use client';

import Link from 'next/link';
import { PackageSearch, LayoutDashboard, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { RoleSwitcher } from './ui/RoleSwitcher';
import { LanguageSwitcher } from './ui/LanguageSwitcher';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useState } from 'react';

export function Header() {
    const { t } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full glass border-b border-primary/10 transition-all duration-300">
            <div className="container flex h-16 max-w-screen-2xl items-center mx-auto px-4 md:px-8">
                <div className="mr-4 flex flex-1 items-center gap-8">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                            <PackageSearch className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-xl tracking-tight text-foreground">
                                GFTB <span className="text-primary">Bridge</span>
                            </span>
                            <span className="hidden lg:inline-block font-medium text-[10px] uppercase tracking-widest text-muted-foreground/80">
                                Global Supply Chain
                            </span>
                        </div>
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold">
                        <Link href="/batches/new" className="transition-all hover:text-primary text-foreground/70">
                            {t('menu_create_batch')}
                        </Link>
                        <Link href="/how-it-works" className="transition-all hover:text-primary text-foreground/70">
                            {t('menu_how_it_works')}
                        </Link>
                        <Link href="/admin/companies" className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 transition-all">
                            <LayoutDashboard className="h-3.5 w-3.5" />
                            {t('menu_admin')}
                        </Link>
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <button 
                        className="md:hidden ml-auto p-2" 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                <div className="flex flex-1 items-center justify-end space-x-2">
                    <div className="hidden sm:flex items-center gap-2">
                        <LanguageSwitcher />
                        <RoleSwitcher />
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 top-14 z-50 grid h-[calc(100vh-3.5rem)] grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in slide-in-from-top-2 md:hidden bg-background">
                    <div className="relative z-20 grid gap-6 rounded-md p-4 text-popover-foreground">
                        <nav className="grid grid-flow-row auto-rows-max gap-4 text-lg font-medium">
                            <Link 
                                href="/batches/new" 
                                className="flex w-full items-center rounded-md p-2 hover:underline"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('menu_create_batch')}
                            </Link>
                            <Link 
                                href="/how-it-works" 
                                className="flex w-full items-center rounded-md p-2 hover:underline"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('menu_how_it_works')}
                            </Link>
                            <Link 
                                href="/admin/companies" 
                                className="flex w-full items-center rounded-md p-2 hover:underline font-bold"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('menu_admin')}
                            </Link>
                        </nav>
                        <div className="border-t pt-4 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Language</span>
                                <LanguageSwitcher />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Role</span>
                                <RoleSwitcher />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
