'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { useTranslations } from 'next-intl';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Fix for default marker icons in Leaflet + Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LiveMapProps {
    telemetry: any[];
    height?: string;
}

function RecenterMap({ position }: { position: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(position);
    }, [position, map]);
    return null;
}

export default function LiveMap({ telemetry, height = '400px' }: LiveMapProps) {
    const t = useTranslations('Tracking');

    if (!telemetry || telemetry.length === 0) {
        return (
            <div 
                style={{ height }} 
                className="w-full rounded-[2rem] bg-muted/5 border border-primary/5 flex items-center justify-center text-muted-foreground/40 text-xs font-black uppercase tracking-widest italic"
            >
                No Location Data Available
            </div>
        );
    }

    // Filter points with valid coordinates and sort by time
    const path = telemetry
        .filter(t => t.location_lat !== null && t.location_lon !== null)
        .map(t => ({
            pos: [t.location_lat, t.location_lon] as [number, number],
            temp: t.temperature_celsius,
            // Standardize to UTC for international logistics audit
            time: new Date(t.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit', 
                timeZone: 'UTC' 
            }) + ' (UTC)',
            humidity: t.humidity,
            isViolation: t.temperature_celsius > -18 // Professional threshold check
        }));

    const latest = path[0]?.pos; // Assuming sorted by timestamp desc

    if (path.length === 0 || !latest) {
        return (
            <div 
                style={{ height }} 
                className="w-full rounded-[2rem] bg-muted/5 border border-primary/5 flex items-center justify-center text-muted-foreground/40 text-xs font-black uppercase tracking-widest italic"
            >
                Invalid Coordinates
            </div>
        );
    }

    return (
        <div style={{ height }} className="w-full rounded-[2rem] overflow-hidden border border-primary/10 shadow-inner group">
            <MapContainer 
                center={latest} 
                zoom={5} 
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <Polyline 
                    positions={path.map(p => p.pos)} 
                    pathOptions={{ color: 'hsl(var(--primary))', weight: 4, opacity: 0.4, dashArray: '8, 12' }} 
                />
                
                {/* Historical Points with Tooltips */}
                {path.slice(1).map((point, idx) => (
                    <CircleMarker 
                        key={idx} 
                        center={point.pos} 
                        radius={point.isViolation ? 7 : 4}
                        pathOptions={{ 
                            color: point.isViolation ? '#ef4444' : 'hsl(var(--primary))', 
                            fillOpacity: point.isViolation ? 0.8 : 0.2, 
                            weight: point.isViolation ? 2 : 1,
                            className: point.isViolation ? 'animate-pulse' : ''
                        }}
                    >
                        <Tooltip direction="top" offset={[0, -5]} opacity={1} className="custom-tooltip">
                            <div className={`p-3 bg-black/80 backdrop-blur-md rounded-xl border ${point.isViolation ? 'border-destructive/50' : 'border-primary/20'} text-white shadow-2xl min-w-[140px]`}>
                                <div className="flex items-center justify-between gap-4 mb-2">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${point.isViolation ? 'text-destructive' : 'text-primary/60'}`}>
                                        {point.isViolation ? 'INCIDENT DETECTED' : t('tooltip_verified')}
                                    </span>
                                    <span className="text-[9px] font-mono opacity-40">{point.time}</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span className="opacity-60">{t('tooltip_temp')}:</span>
                                        <span className={point.isViolation ? 'text-destructive animate-pulse' : 'text-emerald-400'}>{point.temp}°C</span>
                                    </div>
                                    {point.humidity && (
                                        <div className="flex items-center justify-between text-xs font-bold">
                                            <span className="opacity-60">{t('tooltip_humidity')}:</span>
                                            <span>{point.humidity}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Tooltip>
                    </CircleMarker>
                ))}

                <Marker position={latest}>
                    <Popup className="custom-popup">
                        <div className="p-3 font-serif italic font-black text-foreground">
                            {t('live_iot_indicator')}
                        </div>
                    </Popup>
                </Marker>
                <RecenterMap position={latest} />
            </MapContainer>
        </div>
    );
}
