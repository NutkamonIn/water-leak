import fs from 'fs';
import path from 'path';

export type SensorStatus = 'normal' | 'warning' | 'leak' | 'offline';

export interface Alert {
  id: string;
  houseId: string;
  houseNumber: string;
  sensorId: string;
  location: string;
  value: number;
  threshold: number;
  detectedAt: string;
}

export interface SensorHistoryPoint {
  time: string;
  value: number;
}

export interface Sensor {
  id: string;
  type: 'main' | 'detection';
  location: string;
  status: SensorStatus;
  value?: number;
  threshold?: number;
  battery?: number;
  lastSeen: string;
  history?: SensorHistoryPoint[];
}

export interface House {
  id: string;
  houseNumber: string;
  status: SensorStatus;
  sensors: Sensor[];
  mapPosition: {
    x: number;
    y: number;
  };
  lat: number;
  lng: number;
}

const DATA_FILE = path.join(process.cwd(), '.mockData.json');

const locations = [
  '[ชั้น 1] ห้องน้ำรับแขก (ใต้สายฉีด/ชักโครก)',
  '[ชั้น 1] ห้องครัว (ใต้ซิงค์ล้างจาน)',
  '[ชั้น 1] โซนซักล้าง (ใต้เครื่องซักผ้า)',
  '[ชั้น 1] ใต้เครื่องกรองน้ำ',
  '[ชั้น 2] ห้องน้ำ Master (ใต้ชักโครก)',
  '[ชั้น 2] ห้องน้ำ Master (ใต้ซิงค์ล้างหน้า)',
  '[ชั้น 2] ห้องน้ำ 2 (ใต้สายฉีดชำระ)',
  '[ภายนอก] โซนปั๊มน้ำ & วาล์วน้ำหลัก'
];

const staticLastSeen = "2026-08-31T10:28:31.000Z";

function generateHistory(isLeak: boolean, finalValue: number): SensorHistoryPoint[] {
  const times = ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'];
  if (isLeak) {
    return [
      { time: '10:00', value: 18 },
      { time: '10:05', value: 22 },
      { time: '10:10', value: 25 },
      { time: '10:15', value: 32 },
      { time: '10:20', value: 45 },
      { time: '10:25', value: 67 },
      { time: '10:30', value: finalValue },
    ];
  } else {
    return times.map((t, idx) => ({
      time: t,
      value: Math.max(5, finalValue - (6 - idx) * 2)
    }));
  }
}

function generateSensors(houseId: string, forceLeak: boolean = false, forceOffline: boolean = false): Sensor[] {
  const sensors: Sensor[] = [];
  
  sensors.push({
    id: `MAIN-${houseId}`,
    type: 'main',
    location: 'Gateway',
    status: forceOffline ? 'offline' : 'normal',
    lastSeen: staticLastSeen,
  });

  for (let i = 1; i <= 8; i++) {
    const sId = `S0${i}`;
    let sStatus: SensorStatus = forceOffline ? 'offline' : 'normal';
    let val = 12 + (i * 2); 
    const threshold = 50;

    const isLeakPoint = forceLeak && i === 3;
    if (isLeakPoint) {
      sStatus = 'leak';
      val = 87; 
    }

    sensors.push({
      id: sId,
      type: 'detection',
      location: locations[i - 1],
      status: sStatus,
      value: forceOffline ? 0 : val,
      threshold,
      battery: forceOffline ? 0 : 85 + (i * 2),
      lastSeen: staticLastSeen,
      history: generateHistory(isLeakPoint, val)
    });
  }
  return sensors;
}

export function computeHouseStatus(sensors: Sensor[]): SensorStatus {
  const main = sensors.find(s => s.type === 'main');
  if (!main || main.status === 'offline') return 'offline';
  
  const hasLeak = sensors.some(s => s.status === 'leak');
  if (hasLeak) return 'leak';
  
  const hasWarning = sensors.some(s => s.status === 'warning');
  if (hasWarning) return 'warning';
  
  return 'normal';
}

const defaultPositions20 = [
  { x: 15, y: 15, lat: 13.75700, lng: 100.50120 }, 
  { x: 35, y: 15, lat: 13.75700, lng: 100.50160 }, 
  { x: 55, y: 15, lat: 13.75700, lng: 100.50200 }, 
  { x: 75, y: 15, lat: 13.75700, lng: 100.50240 }, 
  { x: 90, y: 15, lat: 13.75700, lng: 100.50280 }, 
  { x: 15, y: 40, lat: 13.75650, lng: 100.50120 }, 
  { x: 35, y: 40, lat: 13.75650, lng: 100.50160 }, 
  { x: 55, y: 40, lat: 13.75650, lng: 100.50200 }, 
  { x: 75, y: 40, lat: 13.75650, lng: 100.50240 }, 
  { x: 90, y: 40, lat: 13.75650, lng: 100.50280 }, 
  { x: 15, y: 65, lat: 13.75600, lng: 100.50120 }, 
  { x: 35, y: 65, lat: 13.75600, lng: 100.50160 }, 
  { x: 55, y: 65, lat: 13.75600, lng: 100.50200 }, 
  { x: 75, y: 65, lat: 13.75600, lng: 100.50240 }, 
  { x: 90, y: 65, lat: 13.75600, lng: 100.50280 }, 
  { x: 15, y: 88, lat: 13.75550, lng: 100.50120 }, 
  { x: 35, y: 88, lat: 13.75550, lng: 100.50160 }, 
  { x: 55, y: 88, lat: 13.75550, lng: 100.50200 }, 
  { x: 75, y: 88, lat: 13.75550, lng: 100.50240 }, 
  { x: 90, y: 88, lat: 13.75550, lng: 100.50280 }, 
];

function initialMockData(): House[] {
  const houses: House[] = [];
  for (let i = 1; i <= 20; i++) {
    const num = i.toString().padStart(3, '0');
    const houseId = `HOUSE-${num}`;
    const houseNumber = `A${num}`;
    
    const forceLeak = (houseNumber === 'A002' || houseNumber === 'A007' || houseNumber === 'A015');
    const forceOffline = (houseNumber === 'A008');
    
    const sensors = generateSensors(houseId, forceLeak, forceOffline);
    const status = computeHouseStatus(sensors);
    const pos = defaultPositions20[i - 1] || { x: 50, y: 50, lat: 13.75640, lng: 100.50200 };
    
    houses.push({ 
      id: houseId, 
      houseNumber, 
      status, 
      sensors, 
      mapPosition: { x: pos.x, y: pos.y },
      lat: pos.lat,
      lng: pos.lng
    });
  }
  return houses;
}

export const getHouses = (): House[] => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading mock data:", err);
  }
  const initial = initialMockData();
  fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
  return initial;
};

export const getAlerts = (): Alert[] => {
  const alerts: Alert[] = [];
  const houses = getHouses();
  
  houses.forEach(house => {
    house.sensors.forEach(sensor => {
      if (sensor.status === 'leak' && sensor.type === 'detection') {
        alerts.push({
          id: `ALERT-${house.id}-${sensor.id}`,
          houseId: house.id,
          houseNumber: house.houseNumber,
          sensorId: sensor.id,
          location: sensor.location,
          value: sensor.value || 0,
          threshold: sensor.threshold || 50,
          detectedAt: sensor.lastSeen
        });
      }
    });
  });
  
  return alerts;
};

export const resolveHouseAlert = (houseNumber: string) => {
  const houses = getHouses();
  const target = houses.find(h => h.houseNumber === houseNumber);
  if (!target) return;

  target.sensors.forEach((sensor, idx) => {
    if (sensor.type === 'detection' && target.status !== 'offline') {
      sensor.status = 'normal';
      sensor.value = 14 + idx;
      sensor.history = generateHistory(false, 14 + idx);
    }
  });
  
  target.status = computeHouseStatus(target.sensors);
  fs.writeFileSync(DATA_FILE, JSON.stringify(houses, null, 2));
};

export const resetMockData = () => {
  const initial = initialMockData();
  fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
};
