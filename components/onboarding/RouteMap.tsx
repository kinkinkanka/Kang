'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const ORIGIN_ICON = L.divIcon({
  html: `<div style="background:#3B82F6;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const DEST_ICON = L.divIcon({
  html: `<div style="background:#B2F2BB;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Known Korean area coordinates for fallback
const FALLBACK_COORDS: Record<string, [number, number]> = {
  '역삼동': [37.5012, 127.0396],
  '강남구': [37.4979, 127.0276],
  '합정동': [37.5495, 126.9056],
  '마포구': [37.5663, 126.9019],
  '서울': [37.5665, 126.978],
};

async function geocodeAddress(address: string): Promise<[number, number] | null> {
  if (!address?.trim()) return null;
  const q = address.trim().includes('서울') || address.trim().includes('대한민국')
    ? address.trim()
    : `${address.trim()}, 대한민국`;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`,
      { headers: { 'Accept-Language': 'ko' } }
    );
    const data = await res.json();
    if (data?.[0]?.lat && data?.[0]?.lon) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (e) {
    console.warn('Geocode failed:', e);
  }
  for (const [key, coords] of Object.entries(FALLBACK_COORDS)) {
    if (address.includes(key)) return coords;
  }
  return [37.5665, 126.978]; // Seoul center fallback
}

interface RouteResult {
  coordinates: [number, number][];
  durationSeconds: number;
  distanceMeters: number;
}

async function fetchRoute(
  from: [number, number],
  to: [number, number]
): Promise<RouteResult | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    const route = data?.routes?.[0];
    const coords = route?.geometry?.coordinates;
    if (Array.isArray(coords) && coords.length > 0) {
      return {
        coordinates: coords.map((c: number[]) => [c[1], c[0]]),
        durationSeconds: route.duration ?? 0,
        distanceMeters: route.distance ?? 0,
      };
    }
  } catch (e) {
    console.warn('Route fetch failed:', e);
  }
  return null;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}초`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins < 60) return secs > 0 ? `${mins}분 ${secs}초` : `${mins}분`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hours}시간 ${remainMins}분` : `${hours}시간`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  const km = (meters / 1000).toFixed(1);
  return `${km}km`;
}

function MapUpdater({
  origin,
  dest,
}: {
  origin: [number, number] | null;
  dest: [number, number] | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!origin || !dest) return;
    const bounds = L.latLngBounds([origin, dest]).pad(0.15);
    map.fitBounds(bounds, { maxZoom: 14 });
  }, [map, origin, dest]);
  return null;
}

export function RouteMap({
  origin,
  destination,
}: {
  origin: string;
  destination: string;
}) {
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [o, d] = await Promise.all([
        geocodeAddress(origin),
        geocodeAddress(destination),
      ]);
      if (cancelled) return;
      setOriginCoords(o);
      setDestCoords(d);
      if (o && d) {
        const r = await fetchRoute(o, d);
        if (!cancelled) setRoute(r);
      } else {
        setRoute(null);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [origin, destination]);

  const center = useMemo((): [number, number] => {
    if (originCoords && destCoords) {
      return [
        (originCoords[0] + destCoords[0]) / 2,
        (originCoords[1] + destCoords[1]) / 2,
      ];
    }
    return [37.549, 126.97];
  }, [originCoords, destCoords]);

  return (
    <div className="relative w-full h-full min-h-[200px] bg-[#FFFFFF]">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-[1000] bg-[#FFFFFF]/80">
          <span className="text-[#636E72] text-sm">경로 검색 중...</span>
        </div>
      )}
      {route && route.durationSeconds > 0 && (
        <div className="absolute top-2 left-2 right-2 z-[1000] flex gap-2 flex-wrap">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur border border-[#2D3436]/20 text-[#2D3436] text-sm"
            title="일반 도로 기준 평균 속도(실시간 교통 미반영)"
          >
            <span className="text-[#636E72]">예상 소요</span>
            <span className="font-semibold text-[#FF7F50]">{formatDuration(route.durationSeconds)}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur border border-[#2D3436]/20 text-[#2D3436] text-sm">
            <span className="text-[#636E72]">거리</span>
            <span className="font-semibold text-[#B2F2BB]">{formatDistance(route.distanceMeters)}</span>
          </div>
        </div>
      )}
      <MapContainer
        center={center}
        zoom={11}
        className="w-full h-full z-0"
        style={{ minHeight: 200 }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater origin={originCoords} dest={destCoords} />
        {originCoords && (
          <Marker position={originCoords} icon={ORIGIN_ICON}>
            <Popup>출발: {origin || '출발지'}</Popup>
          </Marker>
        )}
        {destCoords && (
          <Marker position={destCoords} icon={DEST_ICON}>
            <Popup>도착: {destination || '도착지'}</Popup>
          </Marker>
        )}
        {route && route.coordinates.length > 0 && (
          <>
            {/* 그림자/외곽선 - 더 두껍게 */}
            <Polyline
              positions={route.coordinates}
              pathOptions={{ color: '#2D3436', weight: 8, opacity: 0.5 }}
            />
            {/* 메인 경로 선 */}
            <Polyline
              positions={route.coordinates}
              pathOptions={{ color: '#FF7F50', weight: 5, opacity: 1 }}
            />
          </>
        )}
        {/* OSRM 경로 없을 때: 출발-도착 직선 표시 */}
        {originCoords && destCoords && (!route || route.coordinates.length === 0) && (
          <Polyline
            positions={[originCoords, destCoords]}
            pathOptions={{
              color: '#FF7F50',
              weight: 4,
              opacity: 0.8,
              dashArray: '10, 10',
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
