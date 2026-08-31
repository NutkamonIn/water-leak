import { NextResponse } from 'next/server';
import { getHouses } from '@/lib/mockData';

export async function GET() {
  const houses = getHouses();
  
  // Return houses summary with mapPosition for map rendering
  const housesSummary = houses.map(({ id, houseNumber, status, mapPosition, lat, lng }) => ({
    id,
    houseNumber,
    status,
    mapPosition,
    lat,
    lng
  }));

  return NextResponse.json(housesSummary);
}
