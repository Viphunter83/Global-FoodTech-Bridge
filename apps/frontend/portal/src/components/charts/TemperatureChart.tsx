'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import { Telemetry } from '@/lib/api';

export function TemperatureChart({ data }: { data: Telemetry[] }) {
    if (!data || data.length === 0) {
        return <div className="flex h-64 items-center justify-center text-gray-400">No telemetry data</div>;
    }

    const formattedData = data.map((d) => ({
        ...d,
        time: format(new Date(d.timestamp), 'HH:mm'),
        fullDate: format(new Date(d.timestamp), 'dd MMM HH:mm'),
    }));

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="time"
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        unit="°C"
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelFormatter={(label, payload) => {
                            // Safe access to nested property to prevent crash
                            if (payload && payload.length > 0 && payload[0]?.payload?.fullDate) {
                                return payload[0].payload.fullDate;
                            }
                            return label;
                        }}
                    />
                    <ReferenceLine y={-18} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Max Limit (-18°C)', fill: '#ef4444', fontSize: 12 }} />
                    <Line
                        type="monotone"
                        dataKey="temperature_celsius"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#2563eb' }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
