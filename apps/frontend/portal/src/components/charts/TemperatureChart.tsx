'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    ReferenceArea,
    ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { Telemetry } from '@/lib/api';
import { useState, useEffect } from 'react';

export function TemperatureChart({ 
    data, 
    minLimit = -22, 
    maxLimit = -18 
}: { 
    data: Telemetry[];
    minLimit?: number;
    maxLimit?: number;
}) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const formattedData = data.map((d) => ({
        ...d,
        time: format(new Date(d.timestamp), 'HH:mm'),
        fullDate: format(new Date(d.timestamp), 'dd MMM HH:mm'),
    }));

    if (!isMounted) {
        return <div className="h-80 w-full bg-gray-50 animate-pulse rounded-md" />;
    }

    // Dynamic scale logic
    const padding = Math.abs(maxLimit - minLimit) * 0.5 || 5;
    const yDomain = [minLimit - padding, maxLimit + padding];

    return (
        <div className="h-80 w-full min-h-[320px] min-w-[300px]">
            <ResponsiveContainer width="99%" height="100%">
                <LineChart data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    <XAxis
                        dataKey="time"
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        minTickGap={30}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        unit="°C"
                        domain={yDomain}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelFormatter={(label, payload) => {
                            if (payload && payload.length > 0 && payload[0]?.payload?.fullDate) {
                                return payload[0].payload.fullDate;
                            }
                            return label;
                        }}
                    />
                    {/* Safe Zone */}
                    <ReferenceArea y1={minLimit} y2={maxLimit} fill="#dcfce7" fillOpacity={0.4} />
                    {/* Danger Zones */}
                    <ReferenceArea y1={yDomain[0]} y2={minLimit} fill="#fee2e2" fillOpacity={0.4} />
                    <ReferenceArea y1={maxLimit} y2={yDomain[1]} fill="#fee2e2" fillOpacity={0.4} />
                    
                    <ReferenceLine y={maxLimit} stroke="#ef4444" strokeDasharray="3 3" label={{ value: `Max (${maxLimit}°C)`, fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} />
                    <ReferenceLine y={minLimit} stroke="#ef4444" strokeDasharray="3 3" label={{ value: `Min (${minLimit}°C)`, fill: '#ef4444', fontSize: 10, position: 'insideBottomRight' }} />
                    
                    <Line
                        type="monotone"
                        dataKey="temperature_celsius"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                        isAnimationActive={true}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
