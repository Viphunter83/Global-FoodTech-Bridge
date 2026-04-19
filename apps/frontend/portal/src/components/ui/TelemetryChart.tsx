'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Telemetry } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Activity, Thermometer, Clock } from 'lucide-react';

interface TelemetryChartProps {
    data: Telemetry[];
}

export default function TelemetryChart({ data }: TelemetryChartProps) {
    const t = useTranslations('Tracking');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <Card className="rounded-[2.5rem] border border-primary/10 glass overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-serif font-black italic tracking-tight">{t('chart_title')}</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{t('chart_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex flex-col items-center justify-center bg-primary/[0.02] animate-pulse">
                    <Activity size={40} className="text-primary/10 mb-4" />
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card className="h-[300px] rounded-[2.5rem] border border-dashed border-primary/20 glass flex flex-col items-center justify-center text-muted-foreground/30">
                <Activity size={32} className="mb-4 opacity-20" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">{t('chart_no_data')}</span>
            </Card>
        );
    }

    // Format data for chart
    const chartData = data.map(d => ({
        time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: d.temperature_celsius
    }));

    return (
        <Card className="rounded-[2.5rem] border border-primary/10 glass overflow-hidden shadow-2xl shadow-primary/5 group">
            <CardHeader className="pb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-serif font-black italic tracking-tight flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Activity size={18} />
                            </div>
                            {t('chart_title')}
                        </CardTitle>
                        <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-1 pl-11">{t('chart_desc')}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="h-[350px] px-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--primary) / 0.05)" />
                        <XAxis
                            dataKey="time"
                            stroke="hsl(var(--muted-foreground) / 0.4)"
                            fontSize={10}
                            fontWeight="bold"
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground) / 0.4)"
                            fontSize={10}
                            fontWeight="bold"
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                            dx={-10}
                        />
                        <Tooltip
                            contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                                backdropFilter: 'blur(12px)',
                                borderRadius: '1.5rem', 
                                border: '1px solid rgba(0, 0, 0, 0.05)',
                                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                                padding: '12px 16px'
                            }}
                            itemStyle={{
                                fontSize: '11px',
                                fontWeight: 'bold',
                                color: 'hsl(var(--primary))',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}
                            labelStyle={{
                                fontSize: '10px',
                                fontWeight: 'black',
                                color: 'hsl(var(--muted-foreground) / 0.6)',
                                marginBottom: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.2em'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="temp"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorTemp)"
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
