'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowLeft, Database, ShieldCheck, Thermometer, Truck, FileCheck, Server, Factory, ArrowRight, ScanLine, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function HowItWorksPage() {
    const { t } = useLanguage();

    // We define steps inside the component to use the 't' function
    const STEPS = [
        { id: 'production', title: t('step_production'), icon: Factory, color: 'text-blue-600', bg: 'bg-blue-100' },
        { id: 'logistics', title: t('step_logistics'), icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { id: 'handover', title: t('step_handover'), icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-100' },
        { id: 'verify', title: t('step_verify'), icon: ScanLine, color: 'text-green-600', bg: 'bg-green-100' },
    ];

    const [currentStep, setCurrentStep] = useState(0);
    const [animating, setAnimating] = useState(false);

    // Auto-advance for logistics demo
    const [truckProgress, setTruckProgress] = useState(0);
    const [tempReading, setTempReading] = useState(-20);

    useEffect(() => {
        if (currentStep === 1) { // Logistics step
            const interval = setInterval(() => {
                setTruckProgress(prev => {
                    if (prev >= 100) return 0;
                    return prev + 1;
                });
                setTempReading(prev => {
                    // Fluctuate between -22 and -17
                    const noise = (Math.random() - 0.5) * 2;
                    return Math.max(-25, Math.min(-16, prev + noise));
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [currentStep]);

    const nextStep = () => {
        if (currentStep < STEPS.length - 1) {
            setAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
                setAnimating(false);
            }, 300);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev - 1);
                setAnimating(false);
            }, 300);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('back_to_app')}
                    </Link>
                    <span className="font-bold text-lg">{t('how_title')}</span>
                    <div className="w-20"></div> {/* Spacer */}
                </div>
            </div>

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12 flex flex-col items-center">

                {/* Progress Visualizer */}
                <div className="w-full mb-12 relative flex items-center justify-between px-10">
                    <div className="absolute left-10 right-10 top-1/2 h-1 bg-gray-200 -z-10">
                        <div
                            className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
                            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                        />
                    </div>
                    {STEPS.map((step, idx) => {
                        const active = idx <= currentStep;
                        const current = idx === currentStep;
                        const Icon = step.icon;
                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 relative bg-gray-50 p-2">
                                <div
                                    className={`
                                        h-12 w-12 rounded-full flex items-center justify-center border-4 transition-all duration-500
                                        ${active ? 'border-blue-600 bg-white' : 'border-gray-200 bg-gray-100'}
                                        ${current ? 'scale-125 shadow-lg' : ''}
                                    `}
                                >
                                    <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                                </div>
                                <span className={`text-xs font-semibold absolute -bottom-8 w-32 text-center transition-colors ${current ? 'text-blue-700' : 'text-gray-400'}`}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Interactive Stage Area */}
                <div className="w-full max-w-3xl min-h-[400px] mt-8 relative perspective-1000">
                    <Card className={`w-full overflow-hidden transition-all duration-300 ease-in-out transform ${animating ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
                        <CardContent className="p-8 md:p-12 flex flex-col items-center text-center">

                            {/* STEP 1: PRODUCTION */}
                            {currentStep === 0 && (
                                <div className="space-y-6 w-full">
                                    <div className="h-24 w-24 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                                        <FileCheck className="h-12 w-12 text-blue-600" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900">{t('passport_creation')}</h2>
                                    <p className="text-lg text-gray-500 max-w-lg mx-auto">
                                        {t('passport_desc')}
                                    </p>
                                    <div className="bg-slate-900 text-green-400 font-mono text-xs p-4 rounded-lg text-left w-full max-w-md mx-auto shadow-inner">
                                        <p>&gt; mint_nft_batch(uuid="902f1e...")</p>
                                        <p className="text-blue-400">&gt; verifying PRODUCER_ROLE...</p>
                                        <p>&gt; token_id: <span className="text-purple-400">#49281</span> generated</p>
                                        <p>&gt; status: <span className="text-white">ON-CHAIN</span></p>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: LOGISTICS */}
                            {currentStep === 1 && (
                                <div className="space-y-6 w-full">
                                    <div className="h-24 w-full bg-slate-50 rounded-2xl border border-dashed border-gray-300 relative overflow-hidden flex items-center">

                                        {/* Moving Truck */}
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 transition-all duration-75 text-indigo-600"
                                            style={{ left: `${truckProgress}%` }}
                                        >
                                            <Truck className="h-10 w-10 transform -scale-x-100" />
                                        </div>

                                        {/* Road markers */}
                                        <div className="absolute bottom-2 left-0 right-0 h-0.5 bg-gray-200 flex justify-between px-2">
                                            {[...Array(10)].map((_, i) => <div key={i} className="w-1 h-2 bg-gray-300 rounded-full"></div>)}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto">
                                        <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex flex-col items-center">
                                            <span className="text-xs text-red-500 uppercase font-bold">{t('temp_title')}</span>
                                            <span className={`text-2xl font-mono font-bold ${tempReading > -18 ? 'text-red-600' : 'text-green-600'}`}>
                                                {tempReading.toFixed(1)}°C
                                            </span>
                                            <span className="text-[10px] text-gray-400">Target: &lt; -18.0°C</span>
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-center">
                                            <span className="text-xs text-blue-500 uppercase font-bold">{t('location_updated_iot')}</span>
                                            <span className="text-2xl font-bold text-gray-800">In Transit</span>
                                            <span className="text-[10px] text-gray-400">Updating 5s...</span>
                                        </div>
                                    </div>

                                    <h2 className="text-3xl font-bold text-gray-900">{t('iot_monitoring')}</h2>
                                    <p className="text-lg text-gray-500 max-w-lg mx-auto">
                                        {t('iot_desc')}
                                    </p>
                                </div>
                            )}

                            {/* STEP 3: HANDOVER */}
                            {currentStep === 2 && (
                                <div className="space-y-6 w-full">
                                    <div className="h-32 w-full flex items-center justify-center gap-8">
                                        <div className="flex flex-col items-center gap-2 opacity-50">
                                            <Truck className="h-12 w-12 text-gray-400" />
                                            <span className="text-xs font-bold text-gray-400">{t('role_logistics')}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <ArrowRight className="h-8 w-8 text-purple-300 animate-pulse" />
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center ring-4 ring-purple-50">
                                                <ShieldCheck className="h-8 w-8 text-purple-600" />
                                            </div>
                                            <span className="text-xs font-bold text-purple-600">{t('role_retailer')}</span>
                                        </div>
                                    </div>

                                    <h2 className="text-3xl font-bold text-gray-900">{t('crypto_handover')}</h2>
                                    <p className="text-lg text-gray-500 max-w-lg mx-auto">
                                        {t('crypto_desc')}
                                    </p>
                                </div>
                            )}

                            {/* STEP 4: VERIFY */}
                            {currentStep === 3 && (
                                <div className="space-y-6 w-full">
                                    <div className="relative mx-auto h-48 w-48 bg-white p-2 rounded-xl shadow-lg border">
                                        <div className="absolute inset-0 flex items-center justify-center bg-green-50/90 z-10 backdrop-blur-[2px] animate-in fade-in duration-1000">
                                            <div className="flex flex-col items-center gap-2">
                                                <CheckCircle2 className="h-16 w-16 text-green-600 drop-shadow-md" />
                                                <span className="text-xl font-bold text-green-800">{t('verified_badge')}</span>
                                            </div>
                                        </div>
                                        {/* Mock QR */}
                                        <div className="w-full h-full bg-slate-900 opacity-10 pattern-grid-lg"></div>
                                    </div>

                                    <h2 className="text-3xl font-bold text-gray-900">{t('consumer_trust')}</h2>
                                    <p className="text-lg text-gray-500 max-w-lg mx-auto">
                                        {t('consumer_desc')}
                                    </p>

                                    <Button size="lg" className="mt-4" onClick={() => window.location.href = '/'}>
                                        {t('try_live_demo')}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center gap-4 mt-8">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 0 || animating}
                    >
                        {t('prev_step')}
                    </Button>
                    <div className="flex gap-2">
                        {STEPS.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-2 w-2 rounded-full transition-colors ${idx === currentStep ? 'bg-blue-600' : 'bg-gray-300'}`}
                            />
                        ))}
                    </div>
                    <Button
                        onClick={nextStep}
                        disabled={currentStep === STEPS.length - 1 || animating}
                        className={currentStep === STEPS.length - 1 ? 'invisible' : ''}
                    >
                        {t('next_step')} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>

            </main>
        </div>
    );
}
