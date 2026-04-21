'use client';

import { Link } from '@/navigation';
import { PackageSearch, LayoutDashboard, Menu, X, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { LanguageSwitcher } from './ui/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/providers/AuthProvider';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { GFTBLogo } from './GFTBLogo';


export function Header() {
    const t = useTranslations();
    const { user, role, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full glass border-b border-primary/10 transition-all duration-300">
            <div className="container flex h-16 max-w-screen-2xl items-center mx-auto px-4 md:px-8">
                <div className="mr-4 flex flex-1 items-center gap-8">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <GFTBLogo className="h-10" />
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Link href="/how-it-works" className="transition-all hover:text-primary text-foreground/70">
                                {t('Menu.how_it_works')}
                            </Link>
                        </motion.div>
                        {role === 'ADMIN' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-all text-xs">
                                    <LayoutDashboard className="h-3.5 w-3.5" />
                                    {t('Menu.admin')}
                                </Link>
                            </motion.div>
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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-primary/10 hover:border-primary/30 transition-all">
                                        <div className="bg-primary/5 w-full h-full flex items-center justify-center">
                                            <UserIcon className="h-5 w-5 text-primary" />
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 mt-2 glass border-primary/10">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-bold leading-none text-primary uppercase tracking-wider">{role}</p>
                                            <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-primary/5" />
                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/5">
                                        <Link href="/dashboard" className="w-full flex items-center">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>{t('Menu.dashboard')}</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-primary/5" />
                                    <DropdownMenuItem 
                                        onClick={() => logout()}
                                        className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>{t('Menu.logout')}</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button asChild variant="default" className="premium-gradient text-white rounded-full px-6 font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all">
                                <Link href="/auth/login">{t('Menu.login')}</Link>
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
                            {role === 'ADMIN' && <Link href="/admin/dashboard" onClick={() => setIsMenuOpen(false)}>{t('Menu.admin')}</Link>}
                            
                            <div className="mt-8 pt-8 border-t border-primary/10 flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">{t('Menu.language')}</span>
                                    <LanguageSwitcher />
                                </div>
                                {user ? (
                                    <Button onClick={() => { logout(); setIsMenuOpen(false); }} variant="destructive" className="w-full h-14 rounded-2xl gap-2 font-bold">
                                        <LogOut className="h-5 w-5" /> {t('Menu.logout')}
                                    </Button>
                                ) : (
                                    <Button asChild onClick={() => setIsMenuOpen(false)} className="w-full h-14 rounded-2xl font-bold premium-gradient">
                                        <Link href="/auth/login">{t('Menu.login')}</Link>
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

