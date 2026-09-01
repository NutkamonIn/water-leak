import { NextResponse } from 'next/server';
import { resetMockData } from '@/lib/db';

export async function POST() {
  try {
    const result = await resetMockData();
    if (!result.success) {
      return NextResponse.json({ error: 'Failed to reset mock data', details: result.error }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: 'Mock data reset successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset mock data' }, { status: 500 });
  }
}
