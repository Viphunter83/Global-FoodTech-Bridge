'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
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

    // Filter points with valid coordinates
    const path = telemetry
        .filter(t => t.location_lat !== null && t.location_lon !== null)
        .map(t => [t.location_lat, t.location_lon] as [number, number]);

    const latest = path[0]; // Assuming sorted by timestamp desc

    if (path.length === 0) {
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
        <div style={{ height }} className="w-full rounded-[2rem] overflow-hidden border border-primary/10 shadow-inner">
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
                    positions={path} 
                    pathOptions={{ color: '#00D1FF', weight: 3, opacity: 0.6, dashArray: '10, 10' }} 
                />
                <Marker position={latest}>
                    <Popup className="custom-popup">
                        <div className="p-2 font-serif italic font-black">
                            Last Reported Location
                        </div>
                    </Popup>
                </Marker>
                <RecenterMap position={latest} />
            </MapContainer>
        </div>
    );
}
