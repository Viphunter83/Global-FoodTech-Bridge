'use client';

import { useAuth, UserRole } from '@/components/providers/AuthProvider';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Shield, Truck, ShoppingBag, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';

export function RoleSwitcher() {
    const { role, setRole } = useAuth();
    const t = useTranslations('Auth');

    const roles: { id: UserRole; label: string; icon: React.ReactNode }[] = [
        { id: 'MANUFACTURER', label: t('role_manufacturer'), icon: <Shield size={14} /> },
        { id: 'LOGISTICS', label: t('role_logistics'), icon: <Truck size={14} /> },
        { id: 'RETAILER', label: t('role_retailer'), icon: <ShoppingBag size={14} /> },
    ];

    return (
        <div className="flex items-center space-x-6 border-l border-primary/5 pl-6 ml-4">
            <div className="hidden xl:flex flex-col items-end">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 leading-none mb-1">{t('role_persona')}</span>
                <span className="text-[10px] font-bold text-primary/60 italic lowercase tracking-tighter leading-none">{role?.toLowerCase()}@gftb.bridge</span>
            </div>
            
            <div className="flex bg-muted/20 rounded-[1.2rem] p-1.5 border border-primary/5 backdrop-blur-md shadow-inner">
                {roles.map((r) => {
                    const isActive = role === r.id;
                    return (
                        <button
                            key={r.id}
                            onClick={() => setRole(r.id)}
                            className={`
                                relative flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300
                                ${isActive 
                                    ? 'bg-white text-primary shadow-xl shadow-primary/5 scale-105' 
                                    : 'text-muted-foreground/40 hover:text-muted-foreground hover:bg-white/5'}
                            `}
                            title={`Switch to ${r.label}`}
                        >
                            {isActive && (
                                <motion.div 
                                    layoutId="role-active"
                                    className="absolute inset-0 bg-white rounded-xl -z-10 shadow-lg"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className={`mr-2 transition-transform duration-500 ${isActive ? 'scale-110' : 'opacity-40'}`}>{r.icon}</span>
                            <span className="hidden lg:inline">{r.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
