'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { CheckCircle, ShieldCheck, AlertTriangle, FileText, Activity, MapPin, Truck } from 'lucide-react';
import { BatchDetails, BlockchainStatus } from '@/lib/api';

interface VerifyClientProps {
    batch: BatchDetails;
    blockchain: BlockchainStatus;
}

export function VerifyClient({ batch, blockchain }: VerifyClientProps) {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState<'details' | 'process'>('details');

    const isVerified = blockchain.verified && !blockchain.violation;

    return (
        <div className="min-h-screen bg-white">
            {/* Mobile Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="font-bold text-lg text-blue-600">
                    GFTB<span className="text-gray-900">Verify</span>
                </div>
                <LanguageSwitcher />
            </header>

            <main className="pb-20">
                {/* Hero Status Section */}
                <div className={`flex flex-col items-center justify-center p-8 text-center ${isVerified ? 'bg-green-50' : 'bg-red-50'}`}>
                    {isVerified ? (
                        <div className="rounded-full bg-green-100 p-4 ring-1 ring-green-600/20 mb-4">
                            <ShieldCheck className="h-12 w-12 text-green-600" />
                        </div>
                    ) : (
                        <div className="rounded-full bg-red-100 p-4 ring-1 ring-red-600/20 mb-4">
                            <AlertTriangle className="h-12 w-12 text-red-600" />
                        </div>
                    )}

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {isVerified ? t('verified_badge') : 'Attention Needed'}
                    </h1>
                    <p className="text-sm text-gray-500 font-mono">
                        {t('batch_id')} {batch.id.substring(0, 8)}...
                    </p>

                    {blockchain.txHash && (
                        <a
                            href={`https://mumbai.polygonscan.com/tx/${blockchain.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 text-xs text-blue-600 underline"
                        >
                            {t('view_explorer_link')}
                        </a>
                    )}
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 border-b">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`py-4 text-sm font-medium ${activeTab === 'details' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                    >
                        {t('product_details_tab')}
                    </button>
                    <button
                        onClick={() => setActiveTab('process')}
                        className={`py-4 text-sm font-medium ${activeTab === 'process' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                    >
                        {t('provenance_tab')}
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            {/* Product Info */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-1">{batch.product_type.replace('_', ' ')}</h2>
                                <div className="text-sm text-gray-500">Premium Selection</div>
                            </div>

                            {/* Halal Badge */}
                            <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                                <div className="rounded-full bg-emerald-100 p-2 text-emerald-700 font-bold text-xs">حلال</div>
                                <div>
                                    <div className="font-semibold text-emerald-900">{t('halal_cert_label')}</div>
                                    <div className="text-xs text-emerald-700">Verified by UAE Authority</div>
                                </div>
                            </div>

                            {/* Ingredients */}
                            <div>
                                <h3 className="flex items-center font-semibold text-gray-900 mb-2">
                                    <FileText className="mr-2 h-4 w-4 text-gray-400" />
                                    {t('ingredients_label')}
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {batch.ingredients?.[language as 'en' | 'ru' | 'ar'] || batch.ingredients?.['en']}
                                </p>
                            </div>

                            {/* Nutrition */}
                            <div>
                                <h3 className="flex items-center font-semibold text-gray-900 mb-3">
                                    <Activity className="mr-2 h-4 w-4 text-gray-400" />
                                    {t('nutrition_label')}
                                </h3>
                                <div className="grid grid-cols-4 gap-2 text-center">
                                    <div className="rounded bg-gray-50 p-2">
                                        <div className="text-xs text-gray-500">Kcal</div>
                                        <div className="font-bold">{batch.nutrition?.calories}</div>
                                    </div>
                                    <div className="rounded bg-gray-50 p-2">
                                        <div className="text-xs text-gray-500">Prot</div>
                                        <div className="font-bold">{batch.nutrition?.protein}g</div>
                                    </div>
                                    <div className="rounded bg-gray-50 p-2">
                                        <div className="text-xs text-gray-500">Fat</div>
                                        <div className="font-bold">{batch.nutrition?.fat}g</div>
                                    </div>
                                    <div className="rounded bg-gray-50 p-2">
                                        <div className="text-xs text-gray-500">Carb</div>
                                        <div className="font-bold">{batch.nutrition?.carbs}g</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'process' && (
                        <div className="relative border-l border-gray-200 pl-4 ml-2 space-y-8">
                            <div className="relative">
                                <div className="absolute -left-[21px] rounded-full bg-blue-600 h-3 w-3 mt-1.5 ring-4 ring-white"></div>
                                <h4 className="font-semibold text-gray-900">Manufacturing</h4>
                                <div className="text-sm text-gray-500">Packed & Sealed</div>
                                <div className="mt-1 inline-flex items-center text-xs font-mono bg-gray-100 rounded px-1.5 py-0.5">
                                    <MapPin className="h-3 w-3 mr-1" /> Lyon, FR
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute -left-[21px] rounded-full bg-blue-600 h-3 w-3 mt-1.5 ring-4 ring-white"></div>
                                <h4 className="font-semibold text-gray-900">Logistics Transport</h4>
                                <div className="text-sm text-gray-500">Cold Chain Monitored (-20°C)</div>
                                <div className="mt-1 inline-flex items-center text-xs font-mono bg-gray-100 rounded px-1.5 py-0.5">
                                    <Truck className="h-3 w-3 mr-1" /> In Transit
                                </div>
                            </div>

                            <div className="relative opacity-50">
                                <div className="absolute -left-[21px] rounded-full bg-gray-300 h-3 w-3 mt-1.5 ring-4 ring-white"></div>
                                <h4 className="font-semibold text-gray-900">Retail Delivery</h4>
                                <div className="text-sm text-gray-500">Pending Arrival</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t safe-area-bottom">
                    <button
                        onClick={() => alert("Report feature coming soon. Please contact support@gfb.com")}
                        className="w-full bg-slate-900 text-white rounded-lg py-3 font-semibold hover:bg-slate-800 transition-colors"
                    >
                        {t('report_issue_btn')}
                    </button>
                    <div className="mt-2 text-center text-xs text-gray-400">
                        Global FoodTech Bridge ID: {batch.id}
                    </div>
                </div>
            </main>
        </div>
    );
}
