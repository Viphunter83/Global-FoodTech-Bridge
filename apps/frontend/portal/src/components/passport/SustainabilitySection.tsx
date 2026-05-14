'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, ExternalLink, Leaf, Zap, ShieldCheck, Award } from 'lucide-react';
import { BatchCertificate } from '@/lib/api';
import { useTranslations } from 'next-intl';

interface SustainabilitySectionProps {
    marketingStory?: string;
    certificates?: BatchCertificate[];
    productType?: string;
}

export function SustainabilitySection({ marketingStory, certificates, productType }: SustainabilitySectionProps) {
    const t = useTranslations('Tracking');
    if (!marketingStory && (!certificates || certificates.length === 0)) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
        >
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                <Leaf className="h-3 w-3 text-emerald-500" />
                {t('sus_section_title')}
            </h3>

            {marketingStory && (
                <Card className="overflow-hidden border-0 shadow-xl bg-white/40 backdrop-blur-md relative group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                    <CardContent className="p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-[1rem] bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-inner">
                                <Award size={24} />
                            </div>
                            <div>
                                <h4 className="font-serif font-black italic text-gray-900 text-lg">{t('sus_premium_story')}</h4>
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none mt-1">{t('sus_verified_origin')}</p>
                            </div>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium italic text-lg leading-[1.6]">
                            &quot;{marketingStory}&quot;
                        </p>
                        <div className="mt-8 flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-amber-500" />
                                <span className="text-[10px] font-black uppercase text-gray-400">{t('sus_low_carbon')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-blue-500" />
                                <span className="text-[10px] font-black uppercase text-gray-400">{t('sus_traceable')}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {certificates && certificates.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                    {certificates.map((cert, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white rounded-3xl p-5 border border-gray-100 shadow-lg flex items-center justify-between group cursor-pointer"
                            onClick={() => window.open(cert.uri, '_blank')}
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h5 className="font-black text-gray-900 text-sm leading-tight uppercase tracking-tight">
                                        {typeof cert.name === 'string' ? cert.name : (cert as any).id || t('verified_lab_report_badge')}
                                    </h5>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                        {typeof cert.type === 'string' ? cert.type.replace(/_/g, ' ') : 'CERTIFICATE'} • {t('verified_lab_report_badge')}
                                    </p>
                                </div>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <ExternalLink size={16} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
