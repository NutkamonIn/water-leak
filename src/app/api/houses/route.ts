import { NextResponse } from 'next/server';
import { getHouses, simulateDataTick } from '@/lib/mockData';

export async function GET() {
  // Tick the simulation slightly each time houses are fetched
  simulateDataTick();
  
  const houses = getHouses();
  
  // Return houses without their detailed sensors list to save bandwidth in overview
  const housesSummary = houses.map(({ id, houseNumber, status }) => ({
    id,
    houseNumber,
    status
  }));

  return NextResponse.json(housesSummary);
}
