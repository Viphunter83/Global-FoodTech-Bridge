'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ProcessStepProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    index: number;
}

export function ProcessStep({ icon, title, description, index }: ProcessStepProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="group relative flex flex-col items-center text-center p-8 rounded-[2.5rem] glass hover:bg-white/5 transition-all border-primary/5 hover:border-primary/20"
        >
            <div className="absolute -top-6 h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black shadow-xl shadow-primary/20 z-10 group-hover:scale-110 transition-transform">
                {index + 1}
            </div>
            
            <div className="mb-8 p-6 rounded-[2rem] bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                {icon}
            </div>
            
            <h3 className="text-2xl font-serif font-black italic tracking-tighter mb-4 text-foreground">
                {title}
            </h3>
            
            <p className="text-muted-foreground/80 leading-relaxed text-sm font-medium">
                {description}
            </p>
            
            {/* Connecting lines for desktop */}
            {index < 3 && (
                <div className="hidden lg:block absolute -right-1/2 top-1/2 w-full h-[1px] bg-gradient-to-r from-primary/20 to-transparent -z-20 pointer-events-none" />
            )}
        </motion.div>
    );
}
