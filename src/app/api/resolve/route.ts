import { NextResponse } from 'next/server';
import { resolveHouseAlert } from '@/lib/mockData';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { houseNumber } = body;

    if (!houseNumber) {
      return NextResponse.json({ error: 'Missing houseNumber' }, { status: 400 });
    }

    resolveHouseAlert(houseNumber);
    return NextResponse.json({ success: true, message: `Resolved alert for ${houseNumber}` });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
