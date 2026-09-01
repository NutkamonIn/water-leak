"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import 'leaflet/dist/leaflet.css';
import styles from './RealGISMap.module.css';

export type SensorStatus = 'normal' | 'warning' | 'leak' | 'offline';

export interface GISHouseItem {
  id: string;
  houseNumber: string;
  status: SensorStatus;
  lat: number;
  lng: number;
}

interface RealGISMapProps {
  houses: GISHouseItem[];
}

function getFixedHouseCoordinates(house: GISHouseItem): { lat: number; lng: number } {
  if (typeof house.lat === 'number' && !isNaN(house.lat) && typeof house.lng === 'number' && !isNaN(house.lng) && house.lat !== 0) {
    return { lat: house.lat, lng: house.lng };
  }
  // Fixed fallback coordinates derived from house number so positions never shift during filtering
  const numMatch = house.houseNumber.match(/\d+/);
  const num = numMatch ? parseInt(numMatch[0], 10) : 1;
  const row = Math.floor((num - 1) / 5); // 0, 1, 2, 3
  const col = (num - 1) % 5;             // 0, 1, 2, 3, 4

  const lat = 13.7570 - (row * 0.0005);
  const lng = 100.5012 + (col * 0.0004);
  return { lat, lng };
}

export default function RealGISMap({ houses }: RealGISMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const markersMapRef = useRef<Map<string, any>>(new Map());
  const prevFilterKeyRef = useRef<string>('');
  const router = useRouter();

  // 1. Initialize Map Container ONCE
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current || mapInstanceRef.current) return;

      const centerLat = 13.7562;
      const centerLng = 100.5020;

      const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 17);
      mapInstanceRef.current = map;

      // Use CartoDB Dark Matter tile layer for dark theme UI
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20,
        subdomains: 'abcd',
      }).addTo(map);

      // Create a dedicated LayerGroup for markers
      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
        markersMapRef.current.clear();
      }
      if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }
    };
  }, []);

  // 2. Update Markers in-place when houses data updates or filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current || houses.length === 0) return;

    import('leaflet').then((L) => {
      if (!layerGroupRef.current || !mapInstanceRef.current) return;

      const currentHouseIds = new Set(houses.map(h => h.id));

      // 2a. Clean up markers that are no longer in the filtered list
      markersMapRef.current.forEach((marker, houseId) => {
        if (!currentHouseIds.has(houseId)) {
          layerGroupRef.current.removeLayer(marker);
          markersMapRef.current.delete(houseId);
        }
      });

      const bounds = L.latLngBounds([]);

      // 2b. Add or update markers in-place without destroying open popups
      houses.forEach((house) => {
        const { lat, lng } = getFixedHouseCoordinates(house);
        bounds.extend([lat, lng]);

        let pinColorClass = styles.normalPin;
        let badgeLabel = 'OK';

        if (house.status === 'leak') {
          pinColorClass = styles.leakPin;
          badgeLabel = 'LEAK!';
        } else if (house.status === 'warning') {
          pinColorClass = styles.warningPin;
          badgeLabel = 'WARN';
        } else if (house.status === 'offline') {
          pinColorClass = styles.offlinePin;
          badgeLabel = 'OFFLINE';
        }

        const iconHtml = `
          <div class="${styles.markerPin} ${pinColorClass}">
            <span>${house.houseNumber}</span>
            <span style="font-size:0.75rem">${badgeLabel}</span>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: '', // disable default leaflet white box
          iconSize: null as any, // Allow marker to size itself based on content via CSS max-content
          iconAnchor: [0, 0], // The CSS transform will center it
        });

        const popupContainer = document.createElement('div');
        popupContainer.className = styles.popupContent;
        popupContainer.innerHTML = `
          <div class="${styles.popupTitle}">บ้าน ${house.houseNumber}</div>
          <div>พิกัด: ${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
          <div>สถานะ: <strong>${house.status.toUpperCase()}</strong></div>
        `;

        const btn = document.createElement('button');
        btn.className = styles.popupBtn;
        btn.innerText = 'รายละเอียดในบ้าน';
        btn.onclick = () => {
          router.push(`/engineer/house/${house.id}`);
        };
        popupContainer.appendChild(btn);

        const gmapsBtn = document.createElement('a');
        gmapsBtn.className = styles.gmapsBtn;
        gmapsBtn.href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        gmapsBtn.target = '_blank';
        gmapsBtn.rel = 'noopener noreferrer';
        gmapsBtn.innerText = 'นำทางด้วย Google Maps';
        popupContainer.appendChild(gmapsBtn);

        const existingMarker = markersMapRef.current.get(house.id);
        if (existingMarker) {
          const isPopupOpen = existingMarker.isPopupOpen();
          layerGroupRef.current.removeLayer(existingMarker);
          markersMapRef.current.delete(house.id);
          
          const newMarker = L.marker([lat, lng], { icon: customIcon });
          newMarker.bindPopup(popupContainer, { autoPan: false });
          layerGroupRef.current.addLayer(newMarker);
          markersMapRef.current.set(house.id, newMarker);
          
          if (isPopupOpen) {
            newMarker.openPopup();
          }
        } else {
          // Create new marker
          const newMarker = L.marker([lat, lng], { icon: customIcon });
          newMarker.bindPopup(popupContainer, { autoPan: false });
          layerGroupRef.current.addLayer(newMarker);
          markersMapRef.current.set(house.id, newMarker);
        }
      });

      // Only adjust map camera bounds when filter/search changes, NOT on every 5s background auto-refresh
      const currentFilterKey = houses.map(h => h.id).sort().join(',');
      if (bounds.isValid() && prevFilterKeyRef.current !== currentFilterKey) {
        prevFilterKeyRef.current = currentFilterKey;
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 19 });
      }
    });
  }, [houses, router]);

  return (
    <div className={styles.mapWrapper}>
      <div ref={mapContainerRef} className={styles.mapContainer} />
    </div>
  );
}
