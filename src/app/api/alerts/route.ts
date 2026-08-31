import { NextResponse } from 'next/server';
import { getAlerts, simulateDataTick } from '@/lib/mockData';

export async function GET() {
  // Tick the simulation slightly each time alerts are fetched to simulate realtime behavior
  simulateDataTick();
  
  const alerts = getAlerts();
  return NextResponse.json(alerts);
}
