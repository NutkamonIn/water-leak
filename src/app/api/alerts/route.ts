import { NextResponse } from 'next/server';
import { getAlerts } from '@/lib/mockData';

export async function GET() {
  const alerts = getAlerts();
  return NextResponse.json(alerts);
}

export const dynamic = 'force-dynamic';
