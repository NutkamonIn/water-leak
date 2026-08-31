"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import styles from './page.module.css';

type Status = 'normal' | 'warning' | 'leak' | 'offline';

interface House {
  id: string;
  houseNumber: string;
  status: Status;
}

interface Alert {
  id: string;
  houseId: string;
  houseNumber: string;
  sensorId: string;
  location: string;
  value: number;
  threshold: number;
  detectedAt: string;
}

export default function EngineerDashboard() {
  const [houses, setHouses] = useState<House[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const [housesRes, alertsRes] = await Promise.all([
        fetch('/api/houses'),
        fetch('/api/alerts')
      ]);
      
      const housesData = await housesRes.json();
      const alertsData = await alertsRes.json();
      
      setHouses(housesData);
      setAlerts(alertsData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 seconds to simulate real-time MVP
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const stats = {
    total: houses.length,
    normal: houses.filter(h => h.status === 'normal').length,
    warning: houses.filter(h => h.status === 'warning').length,
    leak: houses.filter(h => h.status === 'leak').length,
    offline: houses.filter(h => h.status === 'offline').length,
  };

  return (
    <div className={styles.dashboard}>
      <section>
        <h2 className={styles.sectionTitle}>Overview System Stats</h2>
        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.label}>Total Houses</div>
            <div className={styles.statValue}>{stats.total}</div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.label}>Normal</div>
            <div className={`${styles.statValue} ${styles.textNormal}`}>{stats.normal}</div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.label}>Leak Detected</div>
            <div className={`${styles.statValue} ${styles.textLeak}`}>{stats.leak}</div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.label}>Offline</div>
            <div className={`${styles.statValue} ${styles.textOffline}`}>{stats.offline}</div>
          </Card>
        </div>
      </section>

      {alerts.length > 0 && (
        <section className={styles.alertsSection}>
          <h2 className={styles.sectionTitle}>Active Alerts</h2>
          <div className={styles.alertList}>
            {alerts.map(alert => (
              <div key={alert.id} className={styles.alertItem}>
                <div className={styles.alertHouse}>{alert.houseNumber}</div>
                <div className={styles.alertDetails}>
                  <StatusBadge status="leak" size="sm" />
                  <span className={styles.alertSensor}>
                    {alert.sensorId} • {alert.location} • Value: {alert.value} (Limit: {alert.threshold})
                  </span>
                </div>
                <button 
                  className="glass-panel" 
                  style={{ padding: '0.5rem 1rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)' }}
                  onClick={() => router.push(`/engineer/house/${alert.houseId}`)}
                >
                  View House
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className={styles.sectionTitle}>House Directory</h2>
        <div className={styles.houseGrid}>
          {houses.map(house => (
            <Card 
              key={house.id} 
              onClick={() => router.push(`/engineer/house/${house.id}`)}
            >
              <div className={styles.houseHeader}>
                <span className={styles.houseNumber}>{house.houseNumber}</span>
                <StatusBadge status={house.status} size="sm" />
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
