import { NextResponse } from 'next/server';
import { getHouses } from '@/lib/db';

export async function GET() {
  const houses = await getHouses();
  
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
export const dynamic = 'force-dynamic';