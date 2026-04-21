'use client';

import { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { Thermometer, Cpu, RefreshCcw, ShieldCheck, Wifi, Battery, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PairSensorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPair: (sensorId: string) => void;
    batchId: string;
}

export function PairSensorModal({ isOpen, onClose, onPair, batchId }: PairSensorModalProps) {
    const t = useTranslations('IoT');
    const [step, setStep] = useState<'ID' | 'SYNC' | 'SUCCESS'>('ID');
    const [sensorId, setSensorId] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    const handleStartSync = () => {
        if (!sensorId) return;
        setIsSyncing(true);
        setTimeout(() => {
            setStep('SYNC');
            setIsSyncing(false);
            // Simulate handshake
            setTimeout(() => {
                setStep('SUCCESS');
            }, 3000);
        }, 1500);
    };

    const handleFinalize = () => {
        onPair(sensorId);
        onClose();
        // Reset state for next time
        setTimeout(() => setStep('ID'), 300);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] glass border-primary/10 p-0 overflow-hidden">
                <div className="bg-primary/5 p-10 pb-6">
                    <DialogHeader>
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-inner">
                            <Cpu className="h-8 w-8" />
                        </div>
                        <DialogTitle className="text-3xl font-serif font-black italic tracking-tighter text-foreground">
                            {step === 'SUCCESS' ? t('pairing_complete') : t('pair_sensor_title')}
                        </DialogTitle>
                        <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            {t('batch_reference')}: {batchId.slice(0, 8)}...
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-10 pt-6">
                    <AnimatePresence mode="wait">
                        {step === 'ID' && (
                            <motion.div 
                                key="id"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="space-y-3">
                                    <Label htmlFor="sensorId" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 pl-1">{t('sensor_serial_label')}</Label>
                                    <Input 
                                        id="sensorId"
                                        placeholder="GFTB-XXXXX-XXXX"
                                        value={sensorId}
                                        onChange={(e) => setSensorId(e.target.value.toUpperCase())}
                                        className="h-16 rounded-2xl border-primary/10 bg-background/50 focus:ring-primary/20 font-mono text-lg font-bold tracking-widest"
                                    />
                                </div>
                                <div className="p-6 rounded-2xl bg-muted/20 border border-primary/5 flex items-start gap-4">
                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-background flex items-center justify-center text-primary/40">
                                        <Wifi size={18} />
                                    </div>
                                    <p className="text-[11px] font-black uppercase tracking-tight text-muted-foreground/60 leading-relaxed italic">
                                        {t('pairing_instr')}
                                    </p>
                                </div>
                                <Button 
                                    className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50"
                                    onClick={handleStartSync}
                                    disabled={!sensorId || isSyncing}
                                >
                                    {isSyncing ? <RefreshCcw className="animate-spin mr-3 h-5 w-5" /> : t('start_handshake')}
                                </Button>
                            </motion.div>
                        )}

                        {step === 'SYNC' && (
                            <motion.div 
                                key="sync"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center py-10"
                            >
                                <div className="relative mb-10">
                                    <div className="h-32 w-32 rounded-full border-4 border-primary/10 animate-ping absolute inset-0" />
                                    <div className="h-32 w-32 rounded-full border-4 border-primary/5 absolute inset-0" />
                                    <div className="h-32 w-32 rounded-full border-t-4 border-primary animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center text-primary">
                                        <Wifi size={40} className="animate-pulse" />
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-xl font-serif font-black italic text-foreground">{t('establishing_handshake')}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{t('notarizing_link')}</p>
                                </div>
                            </motion.div>
                        )}

                        {step === 'SUCCESS' && (
                            <motion.div 
                                key="success"
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center py-10 space-y-8"
                            >
                                <div className="h-32 w-32 rounded-[3rem] bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)] flex items-center justify-center text-white">
                                    <ShieldCheck size={64} className="animate-in zoom-in duration-500" />
                                </div>
                                <div className="text-center space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-2xl font-serif font-black italic text-emerald-600">{t('link_immutable')}</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{t('crypto_proof_generated')}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-700">
                                            <Battery className="h-4 w-4 mb-2 opacity-60" />
                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Battery</p>
                                            <p className="font-mono font-bold">100%</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-700">
                                            <Thermometer className="h-4 w-4 mb-2 opacity-60" />
                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Calibration</p>
                                            <p className="font-mono font-bold">NIST-V</p>
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    className="w-full h-16 rounded-[1.5rem] bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest shadow-xl transition-all"
                                    onClick={handleFinalize}
                                >
                                    {t('finalize_pairing')}
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
