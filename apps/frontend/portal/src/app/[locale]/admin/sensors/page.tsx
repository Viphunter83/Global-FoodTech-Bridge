'use client';

import { useTranslations } from 'next-intl';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cpu, Battery, RefreshCcw, MoreVertical, Plus, Radio, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SensorsPage() {
    const t = useTranslations('Admin');

    // Mock sensor fleet data
    const sensors = [
        { id: '1', serial: 'GFTB-9921-X102', model: 'Tive Solo 5G', status: 'ACTIVE', battery: 88, partner: 'VinGroup Logistics' },
        { id: '2', serial: 'GFTB-4432-Z900', model: 'Emerson GO', status: 'IDLE', battery: 95, partner: '-' },
        { id: '3', serial: 'GFTB-1120-Q441', model: 'Tive Solo 5G', status: 'ACTIVE', battery: 12, partner: 'Masan Group' },
        { id: '4', serial: 'GFTB-0088-K223', model: 'Tive Solo 5G', status: 'FAULTY', battery: 0, partner: '-' },
        { id: '5', serial: 'GFTB-5561-L001', model: 'Emerson GO', status: 'IDLE', battery: 100, partner: '-' },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 rounded-full text-[9px] font-black tracking-widest">{status}</Badge>;
            case 'IDLE': return <Badge variant="outline" className="text-primary/40 border-primary/10 px-3 py-1 rounded-full text-[9px] font-black tracking-widest">{status}</Badge>;
            case 'FAULTY': return <Badge className="bg-destructive/10 text-destructive border-destructive/20 px-3 py-1 rounded-full text-[9px] font-black tracking-widest">{status}</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-2xl border border-primary/5">
                            <Cpu className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-serif font-black italic tracking-tighter text-slate-900 uppercase">
                                {t('admin_sensors_title')}
                            </h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/50">
                                {t('admin_sensors_subtitle')}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 rounded-2xl border-primary/10 text-[10px] font-black uppercase tracking-widest">
                        <RefreshCcw className="mr-2 h-4 w-4 opacity-40 shrink-0" />
                        Sync Registry
                    </Button>
                    <Button className="h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 text-[10px] font-black uppercase tracking-widest px-6">
                        <Plus className="mr-2 h-4 w-4 shrink-0" />
                        Register Device
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Network Coverage', value: '98.2%', icon: Radio, trend: '+0.4%' },
                    { label: 'Active Sessions', value: '142', icon: Zap, trend: '+12' },
                    { label: 'Critical Battery', value: '3', icon: Battery, trend: 'Warning', color: 'text-destructive' }
                ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                <stat.icon size={20} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${stat.color || 'text-emerald-500'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <div className="text-4xl font-serif font-black italic tracking-tighter mb-1">{stat.value}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="rounded-[3rem] bg-white border border-slate-100 shadow-xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-100 h-20">
                            <TableHead className="w-[250px] pl-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('admin_sensor_serial')}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Model</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('admin_sensor_status')}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('admin_sensor_battery')}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('admin_sensor_assignment')}</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sensors.map((sensor) => (
                            <TableRow key={sensor.id} className="border-slate-50 h-24 hover:bg-slate-50/30 transition-colors">
                                <TableCell className="pl-10">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900">
                                            <Cpu size={16} />
                                        </div>
                                        <span className="font-mono text-sm font-bold tracking-tight text-slate-900">{sensor.serial}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 italic">{sensor.model}</span>
                                </TableCell>
                                <TableCell>{getStatusBadge(sensor.status)}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${sensor.battery < 20 ? 'bg-destructive' : 'bg-emerald-500'}`} 
                                                style={{ width: `${sensor.battery}%` }} 
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-600">{sensor.battery}%</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs font-serif font-black italic text-slate-800">{sensor.partner}</span>
                                </TableCell>
                                <TableCell className="pr-10 text-right">
                                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
                                        <MoreVertical size={16} className="text-slate-300" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
