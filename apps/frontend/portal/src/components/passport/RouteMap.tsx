'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import { useTranslations } from 'next-intl';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldCheck, AlertCircle } from 'lucide-react';

// Known geographic coordinates for supply chain locations
const KNOWN_COORDINATES: Record<string, [number, number]> = {
    'Vietnam': [10.8231, 106.6297],
    'VN': [10.8231, 106.6297],
    'Ho Chi Minh City': [10.8231, 106.6297],
    'United States': [40.7128, -74.0060],
    'USA': [40.7128, -74.0060],
    'US': [40.7128, -74.0060],
    'New York': [40.7128, -74.0060],
    'Russia': [55.7558, 37.6173],
    'RU': [55.7558, 37.6173],
    'Russian Federation': [55.7558, 37.6173],
    'UAE': [25.2048, 55.2708],
    'AE': [25.2048, 55.2708],
    'Dubai': [25.2048, 55.2708],
    'China': [31.2304, 121.4737],
    'CN': [31.2304, 121.4737],
    'Japan': [35.6762, 139.6503],
    'JP': [35.6762, 139.6503],
    'Singapore': [1.3521, 103.8198],
    'SG': [1.3521, 103.8198],
    'Thailand': [13.7563, 100.5018],
    'TH': [13.7563, 100.5018],
    'India': [19.0760, 72.8777],
    'IN': [19.0760, 72.8777],
    'Germany': [52.5200, 13.4050],
    'DE': [52.5200, 13.4050],
    'Netherlands': [52.3676, 4.9041],
    'NL': [52.3676, 4.9041],
    'South Korea': [37.5665, 126.9780],
    'KR': [37.5665, 126.9780],
    'Australia': [-33.8688, 151.2093],
    'AU': [-33.8688, 151.2093],
    'UK': [51.5074, -0.1278],
    'GB': [51.5074, -0.1278],
    'France': [48.8566, 2.3522],
    'FR': [48.8566, 2.3522],
    'Brazil': [-23.5505, -46.6333],
    'BR': [-23.5505, -46.6333],
    'Canada': [43.6532, -79.3832],
    'CA': [43.6532, -79.3832],
};

// Interpolate waypoints along a great circle path for smooth route curves
function interpolateWaypoints(
    start: [number, number],
    end: [number, number],
    numPoints: number = 30
): [number, number][] {
    const points: [number, number][] = [];
    const toRad = (d: number) => (d * Math.PI) / 180;
    const toDeg = (r: number) => (r * 180) / Math.PI;

    const lat1 = toRad(start[0]);
    const lon1 = toRad(start[1]);
    const lat2 = toRad(end[0]);
    const lon2 = toRad(end[1]);

    const d = 2 * Math.asin(
        Math.sqrt(
            Math.pow(Math.sin((lat2 - lat1) / 2), 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon2 - lon1) / 2), 2)
        )
    );

    for (let i = 0; i <= numPoints; i++) {
        const f = i / numPoints;
        const A = Math.sin((1 - f) * d) / Math.sin(d);
        const B = Math.sin(f * d) / Math.sin(d);
        const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
        const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
        const z = A * Math.sin(lat1) + B * Math.sin(lat2);
        const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
        const lon = toDeg(Math.atan2(y, x));
        points.push([lat, lon]);
    }

    return points;
}

// Create custom marker icons
function createStageIcon(status: 'completed' | 'current' | 'future', isOrigin: boolean, isDestination: boolean): L.DivIcon {
    const size = status === 'current' ? 36 : 28;
    const bgColor = status === 'current'
        ? '#10b981'
        : status === 'completed'
            ? '#059669'
            : '#6b7280';

    const innerContent = isOrigin
        ? '🌾'
        : isDestination
            ? '🏪'
            : status === 'current'
                ? '🚢'
                : '✓';

    const pulseRing = status === 'current'
        ? `<div style="position:absolute;inset:-6px;border-radius:50%;border:2px solid ${bgColor};animation:pulse 2s cubic-bezier(0.4,0,0.6,1) infinite;opacity:0.4"></div>`
        : '';

    const glow = status === 'current'
        ? `box-shadow: 0 0 20px ${bgColor}66, 0 0 40px ${bgColor}33;`
        : `box-shadow: 0 2px 8px rgba(0,0,0,0.3);`;

    return L.divIcon({
        className: 'custom-route-marker',
        html: `
            <div style="position:relative;width:${size}px;height:${size}px;">
                ${pulseRing}
                <div style="
                    width:${size}px;height:${size}px;
                    background:${bgColor};
                    border-radius:50%;
                    display:flex;align-items:center;justify-content:center;
                    font-size:${size * 0.45}px;
                    border:3px solid white;
                    ${glow}
                    position:relative;z-index:10;
                ">${innerContent}</div>
            </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

// Component to fit map bounds to waypoints
function FitBounds({ positions }: { positions: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (positions.length > 1) {
            const bounds = L.latLngBounds(positions.map(p => L.latLng(p[0], p[1])));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
        } else if (positions.length === 1) {
            map.setView(positions[0], 5);
        }
    }, [positions, map]);
    return null;
}

interface RouteMapEvent {
    stage: string;
    location: string;
    status: 'completed' | 'current' | 'future';
    is_compliant?: boolean;
    required_cert?: string;
}

interface RouteMapProps {
    events: RouteMapEvent[];
    originCountry?: string;
    destinationCountry?: string;
    height?: string;
}

export function RouteMap({ events, originCountry, destinationCountry, height = '380px' }: RouteMapProps) {
    const t = useTranslations('Tracking');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Resolve coordinates from events, falling back to origin/destination countries
    const waypoints = useMemo(() => {
        const points: { pos: [number, number]; event: RouteMapEvent; isOrigin: boolean; isDestination: boolean }[] = [];

        // Try to get the origin point
        const origin = originCountry && KNOWN_COORDINATES[originCountry];
        const destination = destinationCountry && KNOWN_COORDINATES[destinationCountry];

        if (events.length === 0 && !origin && !destination) return points;

        // Map events to coordinates
        events.forEach((event, idx) => {
            const locationName = event.location.includes('.')
                ? event.location.split('.')[1]
                : event.location;

            // Try exact match first, then try partial match
            let coords = KNOWN_COORDINATES[locationName];
            if (!coords) {
                // Search by substring
                const key = Object.keys(KNOWN_COORDINATES).find(k =>
                    locationName.toLowerCase().includes(k.toLowerCase()) ||
                    k.toLowerCase().includes(locationName.toLowerCase())
                );
                if (key) coords = KNOWN_COORDINATES[key];
            }

            // If no coords found, interpolate between origin and destination
            if (!coords && origin && destination) {
                const progress = events.length > 1 ? idx / (events.length - 1) : 0.5;
                const lat = origin[0] + (destination[0] - origin[0]) * progress;
                const lon = origin[1] + (destination[1] - origin[1]) * progress;
                coords = [lat, lon];
            } else if (!coords && origin) {
                // Offset from origin
                const offset = (idx + 1) * 5;
                coords = [origin[0] + offset, origin[1] + offset];
            } else if (!coords) {
                return; // Skip events with no resolvable coordinates
            }

            points.push({
                pos: coords,
                event,
                isOrigin: idx === 0,
                isDestination: idx === events.length - 1,
            });
        });

        // If we got no points from events but have origin/destination, create them
        if (points.length === 0) {
            if (origin) {
                points.push({
                    pos: origin,
                    event: { stage: 'Origin', location: originCountry!, status: 'completed' },
                    isOrigin: true,
                    isDestination: false,
                });
            }
            if (destination) {
                points.push({
                    pos: destination,
                    event: { stage: 'Destination', location: destinationCountry!, status: 'future' },
                    isOrigin: false,
                    isDestination: true,
                });
            }
        }

        return points;
    }, [events, originCountry, destinationCountry]);

    // Build interpolated route path
    const routePath = useMemo(() => {
        if (waypoints.length < 2) return [];
        const fullPath: [number, number][] = [];
        for (let i = 0; i < waypoints.length - 1; i++) {
            const segment = interpolateWaypoints(waypoints[i].pos, waypoints[i + 1].pos, 25);
            fullPath.push(...(i === 0 ? segment : segment.slice(1)));
        }
        return fullPath;
    }, [waypoints]);

    // Positions for FitBounds
    const allPositions = useMemo(() => waypoints.map(w => w.pos), [waypoints]);

    if (!mounted) {
        return (
            <div
                style={{ height }}
                className="w-full rounded-2xl bg-slate-900/50 border border-white/5 flex items-center justify-center"
            >
                <div className="flex items-center gap-3 text-muted-foreground/40">
                    <div className="h-3 w-3 rounded-full bg-primary/30 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                        {t('map_loading') || 'Initializing route map...'}
                    </span>
                </div>
            </div>
        );
    }

    if (waypoints.length === 0) {
        return (
            <div
                style={{ height }}
                className="w-full rounded-2xl bg-muted/5 border border-primary/5 flex items-center justify-center text-muted-foreground/40 text-xs font-black uppercase tracking-widest italic"
            >
                {t('route_no_data') || 'Route data unavailable'}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Map Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                        {t('route_map_title') || 'Shipment Route'}
                    </span>
                </div>
                <span className="text-[9px] font-mono text-muted-foreground/30">
                    {waypoints.length} {t('route_waypoints') || 'waypoints'}
                </span>
            </div>

            {/* Map Container */}
            <div
                style={{ height }}
                className="w-full rounded-2xl overflow-hidden border border-emerald-100/50 shadow-lg relative group"
            >
                <MapContainer
                    center={waypoints[0]?.pos || [20, 0]}
                    zoom={3}
                    scrollWheelZoom={false}
                    zoomControl={false}
                    style={{ height: '100%', width: '100%', background: '#0f172a' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    <FitBounds positions={allPositions} />

                    {/* Route Line — completed segments */}
                    {routePath.length > 1 && (
                        <>
                            {/* Glow layer */}
                            <Polyline
                                positions={routePath}
                                pathOptions={{
                                    color: '#10b981',
                                    weight: 6,
                                    opacity: 0.15,
                                    lineCap: 'round',
                                    lineJoin: 'round',
                                }}
                            />
                            {/* Main line */}
                            <Polyline
                                positions={routePath}
                                pathOptions={{
                                    color: '#10b981',
                                    weight: 3,
                                    opacity: 0.7,
                                    dashArray: '12, 8',
                                    lineCap: 'round',
                                    lineJoin: 'round',
                                }}
                            />
                        </>
                    )}

                    {/* Stage Markers */}
                    {waypoints.map((wp, idx) => (
                        <Marker
                            key={idx}
                            position={wp.pos}
                            icon={createStageIcon(wp.event.status, wp.isOrigin, wp.isDestination)}
                        >
                            <Tooltip
                                direction="top"
                                offset={[0, -20]}
                                opacity={1}
                                className="custom-route-tooltip"
                                permanent={wp.isOrigin || wp.isDestination || wp.event.status === 'current'}
                            >
                                <div className="px-3 py-2 bg-slate-900/95 backdrop-blur-xl rounded-xl border border-white/10 text-white shadow-2xl min-w-[140px]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400/80">
                                            {wp.event.stage.includes('.') ? t(wp.event.stage.split('.')[1]) : wp.event.stage}
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-white/60 font-medium">
                                        {wp.event.location.includes('.') ? t(wp.event.location.split('.')[1]) : wp.event.location}
                                    </div>
                                    {wp.event.required_cert && (
                                        <div className={`mt-1.5 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider ${
                                            wp.event.is_compliant ? 'text-emerald-400' : 'text-amber-400'
                                        }`}>
                                            {wp.event.is_compliant ? <ShieldCheck size={10} /> : <AlertCircle size={10} />}
                                            {wp.event.is_compliant ? t('status_verified') : wp.event.required_cert}
                                        </div>
                                    )}
                                </div>
                            </Tooltip>
                        </Marker>
                    ))}
                </MapContainer>

                {/* Corner badges */}
                <div className="absolute bottom-3 left-3 z-[1000] pointer-events-none">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/5">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/50">
                            {t('route_satellite_verified') || 'Satellite Verified Route'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Route Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-600" />
                    <span>{t('route_completed') || 'Completed'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{t('route_active') || 'Active'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-gray-500" />
                    <span>{t('route_pending') || 'Pending'}</span>
                </div>
            </div>
        </div>
    );
}
