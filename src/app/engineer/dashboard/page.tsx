"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { FlaskConical, Droplets, RotateCcw, Check, CheckCircle2, Clock, Navigation, Search, Globe, LayoutGrid, Home, AlertTriangle, ShieldCheck, Radio } from 'lucide-react';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import styles from './page.module.css';

const RealGISMap = dynamic(() => import('@/components/ui/RealGISMap'), {
  ssr: false,
  loading: () => <div style={{ height: 520, background: '#1e293b', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>กำลังโหลดแผนที่ GIS...</div>
});

type Status = 'normal' | 'warning' | 'leak' | 'offline';

interface House {
  id: string;
  houseNumber: string;
  status: Status;
  lat: number;
  lng: number;
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
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'normal' | 'leak' | 'offline'>('all');
  const [ackedAlerts, setAckedAlerts] = useState<Record<string, boolean>>({});

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
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleResolveTicket = async (houseNumber: string) => {
    try {
      await fetch('/api/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ houseNumber })
      });
      fetchData();
    } catch (err) {
      console.error("Resolve ticket error:", err);
    }
  };

  const handleResetMockData = async () => {
    try {
      await fetch('/api/reset_mock', { method: 'POST' });
      setAckedAlerts({});
      fetchData();
    } catch (err) {
      console.error("Reset mock data error:", err);
    }
  };

  const handleAcknowledge = (alertId: string) => {
    setAckedAlerts(prev => ({ ...prev, [alertId]: true }));
  };

  const stats = {
    total: houses.length,
    normal: houses.filter(h => h.status === 'normal').length,
    warning: houses.filter(h => h.status === 'warning').length,
    leak: houses.filter(h => h.status === 'leak').length,
    offline: houses.filter(h => h.status === 'offline').length,
  };

  const filteredHouses = houses.filter(h => {
    const matchesSearch = h.houseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === 'all' || h.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={styles.dashboard}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={handleResetMockData}
          className="glass-panel"
          style={{ padding: '0.4rem 0.8rem', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid var(--surface-border)', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: 6, fontWeight: 600, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RotateCcw size={14} /> รีเซ็ตข้อมูลจำลองทั้งหมด
        </button>
      </div>

      {/* System Overview Stats */}
      <section>
        <h2 className={styles.sectionTitle}>Overview System Stats (20 Houses)</h2>
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

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <section className={styles.alertsSection}>
          <h2 className={styles.sectionTitle}>Active Alerts ({alerts.length})</h2>
          <div className={styles.alertList}>
            {alerts.map(alert => {
              const isAcked = ackedAlerts[alert.id];
              return (
                <div key={alert.id} className={styles.alertItem} style={{ borderColor: isAcked ? 'rgba(245, 158, 11, 0.6)' : 'rgba(239, 68, 68, 0.4)' }}>
                  <div className={styles.alertHouse}>{alert.houseNumber}</div>
                  <div className={styles.alertDetails}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <StatusBadge status="leak" size="sm" />
                      {isAcked && (
                        <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> ช่างรับเรื่องแล้ว (In Progress)
                        </span>
                      )}
                    </div>
                    <span className={styles.alertSensor}>
                      {alert.sensorId} • {alert.location} • Value: {alert.value} (Limit: {alert.threshold})
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {!isAcked ? (
                      <button
                        className="glass-panel"
                        style={{ padding: '0.5rem 1rem', cursor: 'pointer', border: '1px solid rgba(245, 158, 11, 0.6)', background: 'rgba(245, 158, 11, 0.25)', color: '#ffffff', borderRadius: '8px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        onClick={() => handleAcknowledge(alert.id)}
                      >
                        <Check size={14} /> รับเรื่อง (Acknowledge)
                      </button>
                    ) : (
                      <button
                        className="glass-panel"
                        style={{ padding: '0.5rem 1rem', cursor: 'pointer', border: '1px solid rgba(16, 185, 129, 0.6)', background: 'rgba(16, 185, 129, 0.3)', color: '#ffffff', borderRadius: '8px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        onClick={() => handleResolveTicket(alert.houseNumber)}
                      >
                        <CheckCircle2 size={14} /> ปิดงาน (Resolve Ticket)
                      </button>
                    )}
                    <button 
                      className="glass-panel" 
                      style={{ padding: '0.5rem 1rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.3)', color: '#ffffff', fontWeight: 600 }}
                      onClick={() => router.push(`/engineer/house/${alert.houseId}`)}
                    >
                      รายละเอียดในบ้าน
                    </button>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${houses.find(h => h.id === alert.houseId)?.lat || 13.7564},${houses.find(h => h.id === alert.houseId)?.lng || 100.5020}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-panel"
                      style={{
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        border: '1px solid rgba(16, 185, 129, 0.5)',
                        background: 'rgba(16, 185, 129, 0.25)',
                        color: '#ffffff',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Navigation size={14} /> นำทางด้วย Google Maps
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* House Directory & Real GIS Map Section with Search & Filter */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Project Directory & GIS Map ({filteredHouses.length} Houses)</h2>
          
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="ค้นหาบ้าน (e.g. A002)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--surface-border)',
                  color: '#fff',
                  padding: '0.5rem 0.8rem 0.5rem 2rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  outline: 'none',
                  width: '180px'
                }}
              />
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(0,0,0,0.2)', padding: '2px', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
              {(['all', 'normal', 'leak', 'offline'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    background: statusFilter === status ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    border: 'none',
                    color: statusFilter === status ? '#fff' : 'var(--text-secondary)',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* View Mode Switcher */}
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                className="glass-panel"
                style={{
                  padding: '0.5rem 0.8rem',
                  cursor: 'pointer',
                  background: viewMode === 'map' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  borderColor: viewMode === 'map' ? '#fff' : 'var(--surface-border)',
                  color: 'var(--text-primary)',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
                onClick={() => setViewMode('map')}
              >
                <Globe size={14} /> GIS Map
              </button>
              <button
                className="glass-panel"
                style={{
                  padding: '0.5rem 0.8rem',
                  cursor: 'pointer',
                  background: viewMode === 'grid' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  borderColor: viewMode === 'grid' ? '#fff' : 'var(--surface-border)',
                  color: 'var(--text-primary)',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid size={14} /> Directory Grid
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'map' ? (
          <RealGISMap houses={filteredHouses} />
        ) : (
          <div className={styles.houseGrid}>
            {filteredHouses.map(house => (
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
        )}
      </section>
    </div>
  );
}
