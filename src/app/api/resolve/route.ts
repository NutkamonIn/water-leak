import { NextResponse } from 'next/server';
import { resolveHouseAlert } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { houseNumber } = await request.json();
    if (!houseNumber) {
      return NextResponse.json({ error: 'Missing houseNumber' }, { status: 400 });
    }
    
    await resolveHouseAlert(houseNumber);
    return NextResponse.json({ success: true, message: `Resolved alert for ${houseNumber}` });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
