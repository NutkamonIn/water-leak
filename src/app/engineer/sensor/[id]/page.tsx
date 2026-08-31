"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import SensorChart from '@/components/ui/SensorChart';
import styles from './page.module.css';

import { ArrowLeft } from 'lucide-react';
import HistoricalLineChart, { HistoryPoint } from '@/components/ui/HistoricalLineChart';

type Status = 'normal' | 'warning' | 'leak' | 'offline';

interface SensorDetail {
  houseNumber: string;
  id: string;
  type: 'main' | 'detection';
  location: string;
  status: Status;
  value?: number;
  threshold?: number;
  battery?: number;
  lastSeen: string;
  history?: HistoryPoint[];
}

export default function SensorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [sensor, setSensor] = useState<SensorDetail | null>(null);
  const router = useRouter();
  const houseId = resolvedParams.id.split('_')[0]; // Extract HOUSE-xxx

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

  useEffect(() => {
    fetchSensor();
    const intervalId = setInterval(fetchSensor, 5000);
    return () => clearInterval(intervalId);
  }, [resolvedParams.id]);

  if (!sensor) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => router.push(`/engineer/house/${houseId}`)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <ArrowLeft size={16} /> Back to House {sensor.houseNumber}
      </button>

      <Card>
        <div className={styles.sensorHeader}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Sensor {sensor.id}</h1>
            <p className={styles.subtitle}>
              Location: <strong>{sensor.location}</strong>
            </p>
          </div>
          <StatusBadge status={sensor.status} size="lg" />
        </div>

        <div className={styles.detailGrid}>
          <div className={styles.infoBlock}>
            <span className={styles.label}>House Number</span>
            <span className={styles.value}>{sensor.houseNumber}</span>
          </div>
          <div className={styles.infoBlock}>
            <span className={styles.label}>Battery Level</span>
            <span className={styles.value}>{sensor.battery}%</span>
          </div>
          <div className={styles.infoBlock}>
            <span className={styles.label}>Last Update</span>
            <span className={styles.value}>{new Date(sensor.lastSeen).toLocaleTimeString()}</span>
          </div>
        </div>

        {sensor.type === 'detection' && (
          <div className={styles.chartSection}>
            <h3 className={styles.label} style={{ marginBottom: '1.5rem' }}>Water Level Analysis & Trend</h3>
            <SensorChart 
              currentValue={sensor.value || 0} 
              threshold={sensor.threshold || 50} 
            />
            {sensor.history && (
              <HistoricalLineChart history={sensor.history} threshold={sensor.threshold || 50} />
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
