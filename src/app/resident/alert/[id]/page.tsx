"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import styles from './page.module.css';

interface SensorDetail {
  houseNumber: string;
  id: string;
  type: 'main' | 'detection';
  location: string;
  status: string;
  value?: number;
  threshold?: number;
  lastSeen: string;
}

export default function ResidentAlertPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [sensor, setSensor] = useState<SensorDetail | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSensor = async () => {
      try {
        const res = await fetch(`/api/sensors/${resolvedParams.id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setSensor(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSensor();
    const intervalId = setInterval(fetchSensor, 5000);
    return () => clearInterval(intervalId);
  }, [resolvedParams.id]);

  if (!sensor) return <div style={{ padding: '2rem' }}>Loading Alert...</div>;

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => router.push('/resident/dashboard')}>
        ← Back to My House
      </button>

      <Card className={styles.alertCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>WATER LEAK DETECTED</h1>
          <p className={styles.timestamp}>
            Detected at: {new Date(sensor.lastSeen).toLocaleString()}
          </p>
        </div>

        <div className={styles.detailsList}>
          <div className={styles.detailItem}>
            <span className={styles.label}>House</span>
            <span className={styles.value}>{sensor.houseNumber}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>Location</span>
            <span className={styles.value}>{sensor.location} (Sensor: {sensor.id})</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>Current Water Level</span>
            <span className={styles.leakValue}>{sensor.value}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>Warning Threshold</span>
            <span className={styles.value}>{sensor.threshold}</span>
          </div>
        </div>

        <div className={styles.actionArea}>
          <p className={styles.actionNote}>
            Please check the affected area immediately to prevent water damage.<br />
            Our engineering team has been notified.
          </p>
        </div>
      </Card>
    </div>
  );
}
