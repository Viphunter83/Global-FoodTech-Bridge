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
    Legend,
} from 'recharts';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

interface TelemetryPoint {
    timestamp: string;
    temperature_celsius: number;
    humidity?: number;
    pressure?: number;
}

export function TemperatureChart({ 
    data, 
    minLimit = -22, 
    maxLimit = -18 
}: { 
    data: TelemetryPoint[];
    minLimit?: number;
    maxLimit?: number;
}) {
    const [isMounted, setIsMounted] = useState(false);
    const [view, setView] = useState<'temp' | 'humidity'>('temp');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const formattedData = data.map((d) => ({
        ...d,
        time: format(new Date(d.timestamp), 'HH:mm'),
        fullDate: format(new Date(d.timestamp), 'dd MMM HH:mm'),
    }));

    if (!isMounted) {
        return <div className="h-80 w-full bg-primary/5 animate-pulse rounded-[2rem]" />;
    }

    const padding = Math.abs(maxLimit - minLimit) * 0.5 || 5;
    const tempDomain = [minLimit - padding, maxLimit + padding];

    return (
        <div className="space-y-6">
            <div className="flex gap-2 mb-4">
                <button 
                    onClick={() => setView('temp')}
                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'temp' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-primary/5 text-primary/40 hover:bg-primary/10'}`}
                >
                    Temperature
                </button>
                <button 
                    onClick={() => setView('humidity')}
                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'humidity' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-primary/5 text-primary/40 hover:bg-primary/10'}`}
                >
                    Humidity
                </button>
            </div>

            <div className="h-80 w-full min-h-[320px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <LineChart data={formattedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,209,255,0.05)" />
                        <XAxis
                            dataKey="time"
                            stroke="rgba(0,0,0,0.2)"
                            fontSize={10}
                            fontFamily="monospace"
                            tickLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            stroke="rgba(0,0,0,0.2)"
                            fontSize={10}
                            fontFamily="monospace"
                            tickLine={false}
                            unit={view === 'temp' ? '°C' : '%'}
                            domain={view === 'temp' ? tempDomain : [0, 100]}
                        />
                        <Tooltip
                            contentStyle={{ 
                                borderRadius: '24px', 
                                border: '1px solid rgba(0,209,255,0.1)', 
                                background: 'rgba(255,255,255,0.95)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)'
                            }}
                            labelStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', color: '#00D1FF' }}
                        />
                        <Legend />
                        
                        {view === 'temp' && (
                            <>
                                <ReferenceArea y1={minLimit} y2={maxLimit} fill="#00D1FF" fillOpacity={0.05} />
                                <ReferenceLine y={maxLimit} stroke="#FF4B4B" strokeDasharray="4 4" label={{ value: 'MAX', fill: '#FF4B4B', fontSize: 8, fontWeight: '900', position: 'insideTopRight' }} />
                                <ReferenceLine y={minLimit} stroke="#FF4B4B" strokeDasharray="4 4" label={{ value: 'MIN', fill: '#FF4B4B', fontSize: 8, fontWeight: '900', position: 'insideBottomRight' }} />
                                <Line
                                    name="Temperature"
                                    type="monotone"
                                    dataKey="temperature_celsius"
                                    stroke="#00D1FF"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
                                    isAnimationActive={true}
                                />
                            </>
                        )}

                        {view === 'humidity' && (
                            <Line
                                name="Humidity"
                                type="monotone"
                                dataKey="humidity"
                                stroke="#10B981"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
                                animationDuration={1500}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
