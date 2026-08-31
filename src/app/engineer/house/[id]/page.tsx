"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
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
}

export default function HouseDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [house, setHouse] = useState<House | null>(null);
  const router = useRouter();

  const fetchHouse = async () => {
    try {
      const res = await fetch(`/api/houses/${resolvedParams.id}`);
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
      <button className={styles.backBtn} onClick={() => router.push('/engineer/dashboard')}>
        ← Back to Dashboard
      </button>

      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.houseTitle}>House {house.houseNumber}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>ID: {house.id}</p>
        </div>
        <StatusBadge status={house.status} size="lg" />
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
