'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export function GFTBLogo({ className = "h-8 w-auto" }: { className?: string }) {
    const t = useTranslations('Branding');
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-auto"
            >
                {/* Background Shape */}
                <rect width="100" height="100" rx="20" fill="url(#logo-gradient)" />
                
                {/* Bridge Element */}
                <motion.path
                    d="M20 60C20 60 35 40 50 40C65 40 80 60 80 60"
                    stroke="white"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />
                
                {/* Data Nodes */}
                <motion.circle
                    cx="20" cy="60" r="6"
                    fill="white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                />
                <motion.circle
                    cx="50" cy="40" r="6"
                    fill="white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 }}
                />
                <motion.circle
                    cx="80" cy="60" r="6"
                    fill="white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.1 }}
                />

                {/* Connection Lines (Pulsing) */}
                <motion.path
                    d="M20 60L50 40L80 60"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    animate={{ strokeDashoffset: [0, -8] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />

                <defs>
                    <linearGradient id="logo-gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#0062ff" />
                        <stop offset="1" stopColor="#00d4ff" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="flex flex-col leading-none">
                <span className="font-black text-xl tracking-tighter text-foreground">
                    GFTB <span className="text-primary">{t('name_accent')}</span>
                </span>
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-70">
                    {t('tagline')}
                </span>
            </div>
        </div>
    );
}
