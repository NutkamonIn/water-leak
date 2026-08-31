"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import SensorChart from '@/components/ui/SensorChart';
import styles from './page.module.css';

import { AlertTriangle, Radio, Activity } from 'lucide-react';

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

export default function ResidentDashboard() {
  const [house, setHouse] = useState<House | null>(null);
  const router = useRouter();

  const fetchMyHouse = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      
      const res = await fetch(`/api/houses/${user.houseId}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setHouse(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMyHouse();
    const intervalId = setInterval(fetchMyHouse, 5000);
    return () => clearInterval(intervalId);
  }, []);

  if (!house) return <div style={{ padding: '2rem' }}>Loading...</div>;

  const mainSensor = house.sensors.find(s => s.type === 'main');
  const detectionSensors = house.sensors.filter(s => s.type === 'detection');
  const activeLeak = detectionSensors.find(s => s.status === 'leak');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.houseTitle}>My House: {house.houseNumber}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Status Overview</p>
        </div>
        <StatusBadge status={house.status} size="lg" />
      </header>

      {activeLeak && (
        <div className={styles.alertBanner}>
          <div className={styles.alertText}>
            <span className={styles.alertTitle} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={18} /> WATER LEAK DETECTED
            </span>
            <span>Location: {activeLeak.location} (Sensor: {activeLeak.id})</span>
          </div>
          <button 
            className={styles.viewAlertBtn}
            onClick={() => router.push(`/resident/alert/${house.id}_${activeLeak.id}`)}
          >
            View Alert Details
          </button>
        </div>
      )}

      <section>
        <h2 className={styles.sectionTitle}>Home Sensors</h2>
        <div className={styles.sensorsGrid}>
          {mainSensor && (
            <Card className={styles.sensorCard}>
              <div className={styles.sensorHeader}>
                <span className={styles.sensorId}>{mainSensor.id} (Gateway)</span>
                <StatusBadge status={mainSensor.status} size="sm" />
              </div>
              <div className={styles.sensorLocation}>Main Controller</div>
            </Card>
          )}
          
          {detectionSensors.map(sensor => (
            <Card key={sensor.id} className={styles.sensorCard}>
              <div className={styles.sensorHeader}>
                <span className={styles.sensorId}>{sensor.id}</span>
                <StatusBadge status={sensor.status} size="sm" />
              </div>
              <div className={styles.sensorLocation}>{sensor.location}</div>
              <SensorChart 
                currentValue={sensor.value || 0} 
                threshold={sensor.threshold || 50} 
              />
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
