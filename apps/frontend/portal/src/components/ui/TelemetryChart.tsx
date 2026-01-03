'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Telemetry } from '@/lib/api';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useState, useEffect } from 'react';

interface TelemetryChartProps {
    data: Telemetry[];
}

export function TelemetryChart({ data }: TelemetryChartProps) {
    const { t } = useLanguage();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('chart_title')}</CardTitle>
                    <CardDescription>{t('chart_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center bg-gray-50 animate-pulse">
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card className="h-[300px] flex items-center justify-center text-gray-400">
                {t('chart_no_data')}
            </Card>
        );
    }

    // Format data for chart
    const chartData = data.map(d => ({
        time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: d.temperature_celsius
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('chart_title')}</CardTitle>
                <CardDescription>{t('chart_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] overflow-x-auto flex justify-center">
                <LineChart width={500} height={250} data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="time"
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="temp"
                        stroke="#2563EB"
                        strokeWidth={2}
                        dot={{ fill: '#2563EB', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </CardContent>
        </Card>
    );
}
