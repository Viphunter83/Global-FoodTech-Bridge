'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface TrustBadgeProps {
    name: string;
    description: string;
    icon: LucideIcon;
}

export function TrustBadge({ name, description, icon: Icon }: TrustBadgeProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-4 p-6 rounded-[2rem] glass border-primary/5 hover:border-primary/20 transition-all group"
        >
            <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                <Icon className="h-8 w-8 text-primary group-hover:text-white" />
            </div>
            <div className="text-center">
                <p className="text-sm font-black uppercase tracking-widest text-foreground">{name}</p>
                <p className="text-[10px] font-medium text-muted-foreground/60">{description}</p>
            </div>
        </motion.div>
    );
}
