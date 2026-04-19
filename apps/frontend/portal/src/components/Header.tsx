'use client';

import { Link } from '@/navigation';
import { PackageSearch, LayoutDashboard, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from './ui/button';
import { LanguageSwitcher } from './ui/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/providers/AuthProvider';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
    const t = useTranslations();
    const { user, role, logout } = useAuth();
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
                                GFTB <span className="text-secondary">Bridge</span>
                            </span>
                        </div>
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold">
                        <Link href="/how-it-works" className="transition-all hover:text-primary text-foreground/70">
                            {t('Menu.how_it_works')}
                        </Link>
                        {user && (
                            <Link href="/batches/new" className="transition-all hover:text-primary text-foreground/70">
                                {t('Menu.create_batch')}
                            </Link>
                        )}
                        {role === 'ADMIN' && (
                            <Link href="/admin/companies" className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 transition-all">
                                <LayoutDashboard className="h-3.5 w-3.5" />
                                {t('Menu.admin')}
                            </Link>
                        )}
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <button 
                        className="md:hidden ml-auto p-2" 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                <div className="flex flex-1 items-center justify-end space-x-4">
                    <div className="hidden sm:flex items-center gap-4">
                        <LanguageSwitcher />
                        <div className="h-4 w-[1px] bg-border mx-2" />
                        
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end mr-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{role}</span>
                                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">{user.email}</span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => logout()} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            </div>
                        ) : (
                            <Button asChild variant="default" className="premium-gradient text-white rounded-full px-6 font-bold">
                                <Link href="/auth/login">Login</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 top-16 z-50 h-[calc(100vh-4rem)] bg-background/95 backdrop-blur-md md:hidden"
                    >
                        <nav className="flex flex-col p-8 gap-6 text-xl font-bold">
                            <Link href="/how-it-works" onClick={() => setIsMenuOpen(false)}>{t('Menu.how_it_works')}</Link>
                            {user && <Link href="/batches/new" onClick={() => setIsMenuOpen(false)}>{t('Menu.create_batch')}</Link>}
                            {role === 'ADMIN' && <Link href="/admin/companies" onClick={() => setIsMenuOpen(false)}>{t('Menu.admin')}</Link>}
                            
                            <div className="mt-8 pt-8 border-t border-primary/10 flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Language</span>
                                    <LanguageSwitcher />
                                </div>
                                {user ? (
                                    <Button onClick={() => { logout(); setIsMenuOpen(false); }} variant="destructive" className="w-full h-14 rounded-2xl gap-2 font-bold">
                                        <LogOut className="h-5 w-5" /> Logout
                                    </Button>
                                ) : (
                                    <Button asChild onClick={() => setIsMenuOpen(false)} className="w-full h-14 rounded-2xl font-bold premium-gradient">
                                        <Link href="/auth/login">Login</Link>
                                    </Button>
                                )}
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

