import { NextResponse } from 'next/server';
import { triggerHouseSimulation, resetAllSimulations } from '@/lib/mockData';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { houseNumber, action } = body;

    if (action === 'reset_all') {
      resetAllSimulations();
      return NextResponse.json({ success: true, message: 'Reset all simulations to default' });
    }

    if (!houseNumber || !action) {
      return NextResponse.json({ error: 'Missing houseNumber or action' }, { status: 400 });
    }

    triggerHouseSimulation(houseNumber, action);
    return NextResponse.json({ success: true, message: `Updated ${houseNumber} to ${action}` });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
