import { NextResponse } from 'next/server';
import { getHouses } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const houses = await getHouses();
  
  const house = houses.find(h => h.id === id);
  
  if (!house) {
    return NextResponse.json({ error: 'House not found' }, { status: 404 });
  }

  return NextResponse.json(house);
}
