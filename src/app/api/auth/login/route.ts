import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Simple mock authentication based on Demo MVP requirements
    if (email === 'engineer@demo.com') {
      return NextResponse.json({
        user: {
          id: 'USER-001',
          name: 'System Engineer',
          email: 'engineer@demo.com',
          role: 'engineer',
        },
        token: 'mock-jwt-token-engineer',
      });
    }

    if (email === 'resident@demo.com') {
      const { supabase } = require('@/lib/supabase');
      const { data: house } = await supabase.from('houses').select('id').eq('house_number', 'A002').single();
      
      return NextResponse.json({
        user: {
          id: 'USER-002',
          name: 'Resident A002',
          email: 'resident@demo.com',
          role: 'resident',
          houseId: house ? house.id : 'NOT_FOUND', 
        },
        token: 'mock-jwt-token-resident',
      });
    }

    return NextResponse.json(
      { error: 'Invalid credentials. Use engineer@demo.com or resident@demo.com' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}
