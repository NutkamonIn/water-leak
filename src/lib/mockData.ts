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

export interface Sensor {
  id: string;
  type: 'main' | 'detection';
  location: string;
  status: SensorStatus;
  value?: number;
  threshold?: number;
  battery?: number;
  lastSeen: string;
}

export interface House {
  id: string;
  houseNumber: string;
  status: SensorStatus;
  sensors: Sensor[];
}

const locations = [
  'ห้องน้ำ', 'ห้องครัว', 'ห้องน้ำชั้น 2', 'ห้องนอน', 
  'ห้องซักล้าง', 'หลังบ้าน', 'ใต้ซิงค์ครัว', 'จุดน้ำหลัก'
];

function generateSensors(houseId: string, forceLeak: boolean = false, forceOffline: boolean = false): Sensor[] {
  const now = new Date().toISOString();
  const sensors: Sensor[] = [];
  
  // Main Sensor
  sensors.push({
    id: `MAIN-${houseId}`,
    type: 'main',
    location: 'Gateway',
    status: forceOffline ? 'offline' : 'normal',
    lastSeen: now,
  });

  // 8 Detection Sensors
  for (let i = 1; i <= 8; i++) {
    const sId = `S0${i}`;
    let sStatus: SensorStatus = forceOffline ? 'offline' : 'normal';
    let val = Math.floor(Math.random() * 20); // Normal is 0-19
    const threshold = 50;

    if (forceLeak && i === 3) {
      sStatus = 'leak';
      val = 87; // Above 50
    }

    sensors.push({
      id: sId,
      type: 'detection',
      location: locations[i - 1],
      status: sStatus,
      value: forceOffline ? 0 : val,
      threshold,
      battery: forceOffline ? 0 : 80 + Math.floor(Math.random() * 20),
      lastSeen: now
    });
  }
  return sensors;
}

// Compute house status based on business logic
export function computeHouseStatus(sensors: Sensor[]): SensorStatus {
  const main = sensors.find(s => s.type === 'main');
  if (!main || main.status === 'offline') return 'offline';
  
  const hasLeak = sensors.some(s => s.status === 'leak');
  if (hasLeak) return 'leak';
  
  const hasWarning = sensors.some(s => s.status === 'warning');
  if (hasWarning) return 'warning';
  
  return 'normal';
}

function initialMockData(): House[] {
  const houses: House[] = [];
  for (let i = 1; i <= 10; i++) {
    const num = i.toString().padStart(3, '0');
    const houseId = `HOUSE-${num}`;
    const houseNumber = `A${num}`;
    
    // Scenario setup
    const forceLeak = (houseNumber === 'A002' || houseNumber === 'A007');
    const forceOffline = (houseNumber === 'A008');
    
    const sensors = generateSensors(houseId, forceLeak, forceOffline);
    const status = computeHouseStatus(sensors);
    
    houses.push({ id: houseId, houseNumber, status, sensors });
  }
  return houses;
}

// Singleton for API routes to share memory during dev
declare global {
  var _mockHouses: House[] | undefined;
}

if (!global._mockHouses) {
  global._mockHouses = initialMockData();
}

export const getHouses = () => global._mockHouses!;

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
  
  // Sort by newest (though mock is all same time initially)
  return alerts.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
};

// Auto-refresh logic: slightly randomize sensor values every time this is called
// This simulates real-time data changes
export const simulateDataTick = () => {
  const houses = getHouses();
  const now = new Date().toISOString();
  
  houses.forEach(house => {
    // Only update online houses
    if (house.status === 'offline') return;
    
    house.sensors.forEach(sensor => {
      if (sensor.type === 'detection' && sensor.status !== 'offline') {
        // Random fluctuation -2 to +2
        const change = Math.floor(Math.random() * 5) - 2;
        let newVal = (sensor.value || 0) + change;
        
        // Prevent normal houses from suddenly leaking
        const isLeakHouse = house.houseNumber === 'A002' || house.houseNumber === 'A007';
        const maxLimit = isLeakHouse ? 100 : 45;
        
        if (newVal < 0) newVal = 0;
        if (newVal > maxLimit) newVal = maxLimit;
        
        sensor.value = newVal;
        sensor.lastSeen = now;
        
        // Update status based on new value
        if (newVal >= (sensor.threshold || 50)) {
          sensor.status = 'leak';
        } else if (newVal >= (sensor.threshold || 50) * 0.8) {
          sensor.status = 'warning';
        } else {
          sensor.status = 'normal';
        }
      }
    });
    
    // Recompute house status
    house.status = computeHouseStatus(house.sensors);
  });
};
