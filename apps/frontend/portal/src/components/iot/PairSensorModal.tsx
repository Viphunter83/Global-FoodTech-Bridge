'use client';

import { useState } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTranslations } from 'next-intl';
import { Thermometer, Cpu, RefreshCcw, ShieldCheck, Wifi, Battery, Plus, Trash2, X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface PairSensorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPair: (sensorIds: string[], startTracking: boolean) => void;
    batchId: string;
}

export function PairSensorModal({ isOpen, onClose, onPair, batchId }: PairSensorModalProps) {
    const t = useTranslations('IoT');
    const [step, setStep] = useState<'ID' | 'SYNC' | 'SUCCESS'>('ID');
    const [sensorIds, setSensorIds] = useState<string[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [startTracking, setStartTracking] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    const addSensor = () => {
        const input = currentInput.trim();
        if (!input) return;

        const ids = input.split(/[, \n]+/).map(id => id.trim().toUpperCase()).filter(id => id.length > 0);
        
        const newIds = [...sensorIds];
        let addedCount = 0;
        let skippedCount = 0;

        ids.forEach(id => {
            if (newIds.length < 8) {
                if (!newIds.includes(id)) {
                    newIds.push(id);
                    addedCount++;
                } else {
                    skippedCount++;
                }
            }
        });

        if (skippedCount > 0 && addedCount === 0) {
            toast.error(t('sensor_already_added'));
        } else if (newIds.length >= 8 && ids.length > addedCount) {
            toast.warning(t('max_sensors_reached', { count: 8 }));
        }

        setSensorIds(newIds);
        setCurrentInput('');
    };

    const removeSensor = (id: string) => {
        setSensorIds(sensorIds.filter(s => s !== id));
    };

    const handleStartSync = () => {
        if (sensorIds.length === 0) return;
        setIsSyncing(true);
        // Professional simulation of connecting to multiple devices
        setTimeout(() => {
            setStep('SYNC');
            setIsSyncing(false);
            setTimeout(() => {
                setStep('SUCCESS');
            }, 3000);
        }, 1500);
    };

    const handleFinalize = () => {
        onPair(sensorIds, startTracking);
        onClose();
        setTimeout(() => {
            setStep('ID');
            setSensorIds([]);
            setStartTracking(true);
        }, 300);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] glass border-primary/10 p-0 overflow-hidden shadow-2xl">
                <div className="bg-primary/5 p-10 pb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Cpu size={120} />
                    </div>
                    <DialogHeader className="relative z-10">
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
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 pl-1">
                                        {t('sensor_serial_label')} {t('max_sensors', { count: 8 })}
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            placeholder="GFTB-XXXXX"
                                            value={currentInput}
                                            onChange={(e) => setCurrentInput(e.target.value.toUpperCase())}
                                            onKeyDown={(e) => e.key === 'Enter' && addSensor()}
                                            disabled={sensorIds.length >= 8}
                                            className="h-14 rounded-2xl border-primary/10 bg-background/50 focus:ring-primary/20 font-mono text-sm font-bold tracking-widest"
                                        />
                                        <Button 
                                            variant="outline" 
                                            size="icon" 
                                            className="h-14 w-14 rounded-2xl border-primary/10 hover:bg-primary/5 shrink-0"
                                            onClick={addSensor}
                                            disabled={!currentInput || currentInput.length < 4 || sensorIds.length >= 8}
                                        >
                                            <Plus className="h-5 w-5 text-primary" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <AnimatePresence mode="popLayout">
                                        {sensorIds.map((id) => (
                                            <motion.div 
                                                key={id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-primary/5"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-primary/40">
                                                        <Wifi size={14} />
                                                    </div>
                                                    <span className="font-mono text-xs font-black tracking-widest">{id}</span>
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground/40"
                                                    onClick={() => removeSensor(id)}
                                                >
                                                    <X size={14} />
                                                </Button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {sensorIds.length === 0 && (
                                        <div className="py-8 text-center border-2 border-dashed border-primary/5 rounded-[2rem] opacity-40">
                                            <p className="text-[10px] font-black uppercase tracking-widest italic">{t('no_sensors_added')}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                                                {t('start_monitoring')}
                                            </Label>
                                            <p className="text-[9px] text-muted-foreground italic font-medium">{t('activate_on_loading')}</p>
                                        </div>
                                        <Switch 
                                            checked={startTracking}
                                            onCheckedChange={setStartTracking}
                                            className="data-[state=checked]:bg-primary"
                                        />
                                    </div>
                                </div>

                                <Button 
                                    className="w-full min-h-[4rem] h-auto py-4 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 whitespace-normal leading-tight px-6 text-xs"
                                    onClick={handleStartSync}
                                    disabled={sensorIds.length === 0 || isSyncing}
                                >
                                    {isSyncing ? <RefreshCcw className="animate-spin mr-3 h-5 w-5 shrink-0" /> : t('start_handshake')}
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
                                        <Activity size={40} className="animate-pulse" />
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-xl font-serif font-black italic text-foreground">{t('syncing_devices', { count: sensorIds.length })}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">{t('notarizing_link')}</p>
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
                                        <p className="text-2xl font-serif font-black italic text-emerald-600">{t('devices_linked', { count: sensorIds.length })}</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic">
                                            {startTracking ? t('monitoring_activated') : t('pending_deployment')}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-700">
                                            <Battery className="h-4 w-4 mb-2 opacity-60" />
                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-60">{t('fleet_health')}</p>
                                            <p className="font-mono font-bold">100%</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-700">
                                            <Wifi className="h-4 w-4 mb-2 opacity-60" />
                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Status</p>
                                            <p className="font-mono font-bold italic">ENCRYPTED</p>
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    className="w-full min-h-[4rem] h-auto py-4 rounded-[1.5rem] bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest shadow-xl transition-all whitespace-normal leading-tight px-6 text-xs"
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

