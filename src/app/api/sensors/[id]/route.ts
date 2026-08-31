import { NextResponse } from 'next/server';
import { getHouses } from '@/lib/mockData';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // id format from frontend: HOUSE-002_S03
  const { id } = await params;
  const [houseId, sensorId] = id.split('_');
  
  if (!houseId || !sensorId) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
  }

  const houses = getHouses();
  const house = houses.find(h => h.id === houseId);
  
  if (!house) {
    return NextResponse.json({ error: 'House not found' }, { status: 404 });
  }

  const sensor = house.sensors.find(s => s.id === sensorId);
  
  if (!sensor) {
    return NextResponse.json({ error: 'Sensor not found' }, { status: 404 });
  }

  return NextResponse.json({
    houseNumber: house.houseNumber,
    ...sensor
  });
}
