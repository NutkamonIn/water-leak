import { NextResponse } from 'next/server';
import { resetMockData } from '@/lib/mockData';

export async function POST() {
  try {
    resetMockData();
    return NextResponse.json({ success: true, message: 'Mock data reset successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset mock data' }, { status: 500 });
  }
}
