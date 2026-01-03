import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ShieldCheck, ThermometerSnowflake } from 'lucide-react';

interface ProductHeroProps {
    productName: string;
    batchId: string;
    freshnessScore: number;
    status: 'Verified' | 'Warning' | 'Pending';
}

export function ProductHero({ productName, batchId, freshnessScore, status }: ProductHeroProps) {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white shadow-2xl">
            {/* Background Decor */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl filter" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl filter" />

            <div className="relative z-10 flex flex-col items-center text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Badge variant={status === 'Verified' ? 'default' : 'destructive'}
                        className={`mb-4 px-4 py-1 text-sm ${status === 'Verified' ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' : ''}`}>
                        {status === 'Verified' ? (
                            <span className="flex items-center gap-2">
                                <CheckCircle size={14} /> Blockchain Verified
                            </span>
                        ) : 'Status Pending'}
                    </Badge>
                </motion.div>

                <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-5xl">
                    {productName}
                </h1>
                <p className="mb-8 font-mono text-sm text-gray-400">
                    Batch UUID: {batchId.substring(0, 8)}...
                </p>

                <div className="grid w-full max-w-lg grid-cols-2 gap-4">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10"
                    >
                        <div className="mb-2 flex items-center justify-center rounded-full bg-blue-500/20 p-3 w-12 h-12 mx-auto">
                            <ThermometerSnowflake className="text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold">Excellent</div>
                        <div className="text-xs text-gray-400">Freshness Score</div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10"
                    >
                        <div className="mb-2 flex items-center justify-center rounded-full bg-emerald-500/20 p-3 w-12 h-12 mx-auto">
                            <ShieldCheck className="text-emerald-400" />
                        </div>
                        <div className="text-2xl font-bold">100%</div>
                        <div className="text-xs text-gray-400">Halal Compliant</div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
