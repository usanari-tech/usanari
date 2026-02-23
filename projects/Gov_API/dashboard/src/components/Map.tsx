'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leafletのデフォルトアイコン問題を修正
const icon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapProps {
    locations: {
        lat: number;
        lng: number;
        name: string;
        price: string;
    }[];
    center?: [number, number];
}

const Map: React.FC<MapProps> = ({ locations, center = [35.6812, 139.7671] }) => {
    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-sm border border-stone-200 z-0 relative">
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {locations.map((loc, idx) => (
                    <Marker key={idx} position={[loc.lat, loc.lng]} icon={icon}>
                        <Popup>
                            <div className="font-bold">{loc.name}</div>
                            <div className="text-sm text-stone-600">取引価格: ¥{(parseInt(loc.price) / 100000000).toFixed(1)}億円</div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default Map;
