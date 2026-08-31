"use client";

import { useRouter } from 'next/navigation';
import styles from './EstateMap.module.css';

export type SensorStatus = 'normal' | 'warning' | 'leak' | 'offline';

export interface HouseMapItem {
  id: string;
  houseNumber: string;
  status: SensorStatus;
  mapPosition: {
    x: number;
    y: number;
  };
}

interface EstateMapProps {
  houses: HouseMapItem[];
}

export default function EstateMap({ houses }: EstateMapProps) {
  const router = useRouter();

  const getPinStyle = (status: SensorStatus) => {
    switch (status) {
      case 'leak': return styles.leakPin;
      case 'warning': return styles.warningPin;
      case 'offline': return styles.offlinePin;
      default: return styles.normalPin;
    }
  };

  const getStatusLabel = (status: SensorStatus) => {
    switch (status) {
      case 'leak': return '🔴 LEAK';
      case 'warning': return '🟡 WARNING';
      case 'offline': return '⚫ OFFLINE';
      default: return '🟢 OK';
    }
  };

  return (
    <div className={styles.mapContainer}>
      <div className={styles.mapBackground} />
      
      {/* Street Layout Representation */}
      <div className={`${styles.streetLabel} ${styles.streetTop}`}>ซอย 1 (Phase 1)</div>
      <div className={styles.roadMain}>— ถนนหลักโครงการ (Main Estate Avenue) —</div>
      <div className={`${styles.streetLabel} ${styles.streetBottom}`}>ซอย 2 (Phase 1)</div>

      {/* House Pins */}
      {houses.map(house => {
        const posX = house.mapPosition?.x ?? 50;
        const posY = house.mapPosition?.y ?? 50;
        const pinClass = getPinStyle(house.status);

        return (
          <div
            key={house.id}
            className={styles.housePin}
            style={{ left: `${posX}%`, top: `${posY}%` }}
            onClick={() => router.push(`/engineer/house/${house.id}`)}
            title={`บ้าน ${house.houseNumber} - คลิกเพื่อดูรายละเอียด`}
          >
            <div className={`${styles.pinCard} ${pinClass}`}>
              <span className={styles.pinDot} />
              <span>{house.houseNumber}</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                {house.status === 'leak' ? '💧 รั่ว!' : ''}
              </span>
            </div>
          </div>
        );
      })}

      {/* Map Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}><span style={{ color: '#10b981' }}>●</span> Normal</div>
        <div className={styles.legendItem}><span style={{ color: '#ef4444' }}>●</span> Leak</div>
        <div className={styles.legendItem}><span style={{ color: '#64748b' }}>●</span> Offline</div>
      </div>
    </div>
  );
}
