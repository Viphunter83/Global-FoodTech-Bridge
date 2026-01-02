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
    ReferenceArea,
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
                        domain={[-25, -5]}
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
                    {/* Zones */}
                    <ReferenceArea y1={-50} y2={-18} fill="#dcfce7" fillOpacity={0.4} /> {/* Green Zone */}
                    <ReferenceArea y1={-18} y2={-10} fill="#fef9c3" fillOpacity={0.4} /> {/* Yellow Zone */}
                    <ReferenceArea y1={-10} y2={10} fill="#fee2e2" fillOpacity={0.4} />   {/* Red Zone */}

                    <ReferenceLine y={-18} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Max Limit (-18°C)', fill: '#ef4444', fontSize: 12, position: 'insideTopRight' }} />

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
