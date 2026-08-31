"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import styles from './page.module.css';

import { ArrowLeft, PhoneCall } from 'lucide-react';

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
      <button className={styles.backBtn} onClick={() => router.push('/resident/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <ArrowLeft size={16} /> Back to My House
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
            โปรดตรวจสอบบริเวณจุดเกิดเหตุทันทีเพื่อป้องกันความเสียหาย<br />
            ระบบได้ทำการส่งการแจ้งเตือนไปยังวิศวกร/ช่างประจำโครงการเรียบร้อยแล้ว
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <a
              href="tel:021234567"
              className="glass-panel"
              style={{
                padding: '0.75rem 1.5rem',
                color: '#ffffff',
                background: 'rgba(16, 185, 129, 0.3)',
                border: '1px solid rgba(16, 185, 129, 0.6)',
                borderRadius: '8px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <PhoneCall size={18} /> โทรหานิติบุคคล / ช่างโครงการ
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
