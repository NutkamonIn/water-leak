"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Navigation, CheckCircle2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import SensorChart from '@/components/ui/SensorChart';
import styles from './page.module.css';

// Using types defined earlier
type Status = 'normal' | 'warning' | 'leak' | 'offline';

interface Sensor {
  id: string;
  type: 'main' | 'detection';
  location: string;
  status: Status;
  value?: number;
  threshold?: number;
  lastSeen: string;
}

interface House {
  id: string;
  houseNumber: string;
  status: Status;
  sensors: Sensor[];
  lat?: number;
  lng?: number;
}

export default function HouseDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [house, setHouse] = useState<House | null>(null);
  const router = useRouter();

  const fetchHouse = async () => {
    try {
      const res = await fetch(`/api/houses/${resolvedParams.id}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setHouse(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchHouse();
    const intervalId = setInterval(fetchHouse, 5000);
    return () => clearInterval(intervalId);
  }, [resolvedParams.id]);

  if (!house) return <div style={{ padding: '2rem' }}>Loading...</div>;

  const mainSensor = house.sensors.find(s => s.type === 'main');
  const detectionSensors = house.sensors.filter(s => s.type === 'detection');

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => router.push('/engineer/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.houseTitle}>House {house.houseNumber}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>ID: {house.id} • พิกัด: {house.lat?.toFixed(5) || '13.75670'}, {house.lng?.toFixed(5) || '100.50160'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {house.status === 'leak' && (
            <button
              className="glass-panel"
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                color: '#ffffff',
                background: 'rgba(16, 185, 129, 0.3)',
                border: '1px solid rgba(16, 185, 129, 0.6)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              onClick={async () => {
                await fetch('/api/resolve', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ houseNumber: house.houseNumber })
                });
                fetchHouse();
              }}
            >
              <CheckCircle2 size={16} /> ซ่อมเสร็จแล้ว (ปิดงาน)
            </button>
          )}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${house.lat || 13.7567},${house.lng || 100.5016}`}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-panel"
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              color: '#ffffff',
              background: 'rgba(16, 185, 129, 0.25)',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Navigation size={16} /> นำทางด้วย Google Maps
          </a>
          <StatusBadge status={house.status} size="lg" />
        </div>
      </header>

      {mainSensor && (
        <section>
          <Card title="Main Sensor Gateway" className={styles.mainSensorCard}>
            <div className={styles.mainSensorInfo}>
              <div className={styles.sensorName}>{mainSensor.id}</div>
              <StatusBadge status={mainSensor.status} size="sm" />
            </div>
            <div className={styles.lastSeen}>
              Last Update: {new Date(mainSensor.lastSeen).toLocaleTimeString()}
            </div>
          </Card>
        </section>
      )}

      <section>
        <h2 className={styles.sectionTitle}>Detection Sensors</h2>
        <div className={styles.sensorsGrid}>
          {detectionSensors.map(sensor => (
            <Card 
              key={sensor.id} 
              className={styles.sensorCard}
              onClick={() => router.push(`/engineer/sensor/${house.id}_${sensor.id}`)}
            >
              <div className={styles.sensorHeader}>
                <span className={styles.sensorId}>{sensor.id}</span>
                <StatusBadge status={sensor.status} size="sm" />
              </div>
              <div className={styles.sensorLocation}>{sensor.location}</div>
              
              <SensorChart 
                currentValue={sensor.value || 0} 
                threshold={sensor.threshold || 50} 
              />
              
              <div className={styles.lastSeen} style={{ marginTop: '0.5rem', textAlign: 'right', fontSize: '0.8rem' }}>
                {new Date(sensor.lastSeen).toLocaleTimeString()}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
