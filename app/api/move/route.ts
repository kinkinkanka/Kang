import { NextRequest, NextResponse } from 'next/server';
import { getMoveData, setMoveData } from '@/lib/api-store';
import { defaultMoveData } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session') || 'default';
    const data = getMoveData(sessionId);
    
    if (!data) {
      return NextResponse.json(defaultMoveData);
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/move error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch move data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session') || 'default';
    const body = await request.json();
    
    const data = setMoveData(body, sessionId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('POST /api/move error:', error);
    return NextResponse.json(
      { error: 'Failed to save move data' },
      { status: 500 }
    );
  }
}
