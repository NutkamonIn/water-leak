import { supabase } from './supabase';

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

// Compute status based on sensors
export function computeHouseStatus(sensors: Sensor[]): SensorStatus {
  const main = sensors.find(s => s.type === 'main');
  if (!main || main.status === 'offline') return 'offline';
  
  const hasLeak = sensors.some(s => s.status === 'leak');
  if (hasLeak) return 'leak';
  
  const hasWarning = sensors.some(s => s.status === 'warning');
  if (hasWarning) return 'warning';
  
  return 'normal';
}

export const getHouses = async (): Promise<House[]> => {
  const { data: housesData, error: housesError } = await supabase
    .from('houses')
    .select('*')
    .order('house_number', { ascending: true });

  if (housesError) {
    console.error("Error fetching houses:", housesError);
    return [];
  }

  const { data: sensorsData, error: sensorsError } = await supabase
    .from('sensors')
    .select('*');

  if (sensorsError) {
    console.error("Error fetching sensors:", sensorsError);
    return [];
  }

  return housesData.map(h => {
    const houseSensors = sensorsData.filter(s => s.house_id === h.id).map(s => ({
      id: s.id,
      type: s.type as 'main' | 'detection',
      location: s.location,
      status: s.status as SensorStatus,
      value: s.value,
      threshold: s.threshold,
      battery: s.battery,
      lastSeen: s.last_seen,
      history: [] // Ignoring history for now to keep it simple, or can fetch from sensor_history if needed
    }));

    return {
      id: h.id,
      houseNumber: h.house_number,
      status: h.status as SensorStatus,
      sensors: houseSensors,
      mapPosition: { x: h.map_x, y: h.map_y },
      lat: h.lat,
      lng: h.lng
    };
  });
};

export const getAlerts = async (): Promise<Alert[]> => {
  const alerts: Alert[] = [];
  const houses = await getHouses();
  
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

export const resolveHouseAlert = async (houseNumber: string) => {
  const { data: house, error: houseError } = await supabase
    .from('houses')
    .select('id, status')
    .eq('house_number', houseNumber)
    .single();

  if (houseError || !house) return;

  // Update detection sensors that are 'leak' or 'warning' back to 'normal'
  const { error: sensorError } = await supabase
    .from('sensors')
    .update({ status: 'normal', value: 15 }) // Reset value to a normal baseline
    .eq('house_id', house.id)
    .eq('type', 'detection');

  if (sensorError) {
    console.error("Error updating sensors:", sensorError);
    return;
  }

  // Fetch updated sensors to recompute house status
  const { data: updatedSensors } = await supabase
    .from('sensors')
    .select('*')
    .eq('house_id', house.id);

  if (updatedSensors) {
    const newStatus = computeHouseStatus(updatedSensors.map(s => ({ ...s, type: s.type as any })));
    await supabase
      .from('houses')
      .update({ status: newStatus })
      .eq('id', house.id);
  }
};

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

const defaultPositions20 = [
  { x: 15, y: 15, lat: 13.78000, lng: 100.50000 }, 
  { x: 35, y: 15, lat: 13.78000, lng: 100.52000 }, 
  { x: 55, y: 15, lat: 13.78000, lng: 100.54000 }, 
  { x: 75, y: 15, lat: 13.78000, lng: 100.56000 }, 
  { x: 90, y: 15, lat: 13.78000, lng: 100.58000 }, 
  { x: 15, y: 40, lat: 13.76000, lng: 100.50000 }, 
  { x: 35, y: 40, lat: 13.76000, lng: 100.52000 }, 
  { x: 55, y: 40, lat: 13.76000, lng: 100.54000 }, 
  { x: 75, y: 40, lat: 13.76000, lng: 100.56000 }, 
  { x: 90, y: 40, lat: 13.76000, lng: 100.58000 }, 
  { x: 15, y: 65, lat: 13.74000, lng: 100.50000 }, 
  { x: 35, y: 65, lat: 13.74000, lng: 100.52000 }, 
  { x: 55, y: 65, lat: 13.74000, lng: 100.54000 }, 
  { x: 75, y: 65, lat: 13.74000, lng: 100.56000 }, 
  { x: 90, y: 65, lat: 13.74000, lng: 100.58000 }, 
  { x: 15, y: 88, lat: 13.72000, lng: 100.50000 }, 
  { x: 35, y: 88, lat: 13.72000, lng: 100.52000 }, 
  { x: 55, y: 88, lat: 13.72000, lng: 100.54000 }, 
  { x: 75, y: 88, lat: 13.72000, lng: 100.56000 }, 
  { x: 90, y: 88, lat: 13.72000, lng: 100.58000 }, 
];

export const resetMockData = async (): Promise<{ success: boolean; error?: any }> => {
  // Clear all existing data
  const { error: err1 } = await supabase.from('sensors').delete().neq('id', 'dummy');
  if (err1) return { success: false, error: err1 };

  const { error: err2 } = await supabase.from('houses').delete().neq('id', 'dummy');
  if (err2) return { success: false, error: err2 };

  // Insert houses
  const housesToInsert = [];
  for (let i = 1; i <= 20; i++) {
    const num = i.toString().padStart(3, '0');
    const pos = defaultPositions20[i - 1];
    housesToInsert.push({
      house_number: `A${num}`,
      status: 'normal',
      map_x: pos.x,
      map_y: pos.y,
      lat: pos.lat,
      lng: pos.lng
    });
  }

  const { data: insertedHouses, error: houseErr } = await supabase
    .from('houses')
    .insert(housesToInsert)
    .select();
    
  if (houseErr || !insertedHouses) {
    console.error("Failed to seed houses", houseErr);
    return { success: false, error: houseErr };
  }

  // Insert sensors
  const sensorsToInsert = [];
  for (const house of insertedHouses) {
    const houseNumber = house.house_number;
    const forceLeak = (houseNumber === 'A002' || houseNumber === 'A007' || houseNumber === 'A015');
    const forceOffline = (houseNumber === 'A008');

    // Main sensor
    sensorsToInsert.push({
      id: `MAIN-${house.id.substring(0, 8)}`,
      house_id: house.id,
      type: 'main',
      location: 'Gateway',
      status: forceOffline ? 'offline' : 'normal',
      value: 0,
      threshold: 0,
      battery: 100
    });

    // Detection sensors
    for (let i = 1; i <= 8; i++) {
      let sStatus = forceOffline ? 'offline' : 'normal';
      let val = 12 + (i * 2);
      const isLeakPoint = forceLeak && i === 3;
      if (isLeakPoint) {
        sStatus = 'leak';
        val = 87;
      }
      sensorsToInsert.push({
        id: `S0${i}-${house.id.substring(0, 8)}`,
        house_id: house.id,
        type: 'detection',
        location: locations[i - 1],
        status: sStatus,
        value: forceOffline ? 0 : val,
        threshold: 50,
        battery: forceOffline ? 0 : 85 + (i * 2)
      });
    }
  }

  const { error: sensorErr } = await supabase.from('sensors').insert(sensorsToInsert);
  if (sensorErr) return { success: false, error: sensorErr };

  // Update house statuses
  for (const house of insertedHouses) {
    const houseSensors = sensorsToInsert.filter(s => s.house_id === house.id).map(s => ({ ...s, type: s.type as any }));
    const newStatus = computeHouseStatus(houseSensors as any);
    await supabase.from('houses').update({ status: newStatus }).eq('id', house.id);
  }

  return { success: true };
};
