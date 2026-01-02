'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowRight, Search, ShieldCheck, Thermometer, Globe } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function Home() {
    const [batchId, setBatchId] = useState('');
    const router = useRouter();
    const { t } = useLanguage();

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (batchId.trim()) {
            router.push(`/batches/${batchId.trim()}`);
        }
    };

    return (
        <main className="flex flex-col items-center">
            {/* Hero Section */}
            <section className="w-full py-20 md:py-32 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
                <div className="container px-4 md:px-6 mx-auto flex flex-col items-center text-center space-y-8">
                    <div className="space-y-4 max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                            {t('hero_title')}
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-[700px] mx-auto">
                            {t('hero_subtitle')}
                        </p>
                    </div>

                    {/* Tracking Input */}
                    <div className="w-full max-w-md space-y-2">
                        <form onSubmit={handleTrack} className="flex space-x-2">
                            <Input
                                placeholder={t('track_placeholder')}
                                className="flex-1 h-12 text-lg"
                                value={batchId}
                                onChange={(e) => setBatchId(e.target.value)}
                            />
                            <Button type="submit" size="lg" className="h-12 px-6">
                                <Search className="mr-2 h-5 w-5" />
                                {t('track_button')}
                            </Button>
                        </form>
                        <p className="text-xs text-gray-400">
                            {t('try_demo')} <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">902f1e4c-3861-458d-8e76-7054b86c0cf1</code>
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                        <Link href="/dashboard">
                            <Button variant="outline" size="lg">
                                {t('business_dashboard')} <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="w-full py-16 bg-white dark:bg-gray-900 border-t border-gray-100">
                <div className="container px-4 md:px-6 mx-auto grid gap-10 md:grid-cols-3">
                    <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                        <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-2">
                            <Globe className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold">{t('feature_traceability_title')}</h3>
                        <p className="text-gray-500">{t('feature_traceability_desc')}</p>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                        <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-2">
                            <Thermometer className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold">{t('feature_iot_title')}</h3>
                        <p className="text-gray-500">{t('feature_iot_desc')}</p>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                        <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-2">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold">{t('feature_blockchain_title')}</h3>
                        <p className="text-gray-500">{t('feature_blockchain_desc')}</p>
                    </div>
                </div>
            </section>
        </main>
    );
}
