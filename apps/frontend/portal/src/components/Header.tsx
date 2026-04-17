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
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4">
                <div className="mr-4 flex flex-1 items-center">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="font-bold inline-block">
                            GFTB
                        </span>
                        <span className="hidden lg:inline-block font-medium text-xs text-muted-foreground">
                            Global Supply Chain
                        </span>
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                        <Link href="/batches/new" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            {t('menu_create_batch')}
                        </Link>
                        <Link href="/how-it-works" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            {t('menu_how_it_works')}
                        </Link>
                        <Link href="/admin/companies" className="transition-colors hover:text-foreground/80 text-foreground/60 font-semibold text-primary">
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
