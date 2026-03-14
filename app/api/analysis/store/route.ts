import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisResult, setAnalysisResult } from '@/lib/api-store';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session') || 'default';
    const data = getAnalysisResult(sessionId);
    
    if (!data) {
      return NextResponse.json({ error: 'No analysis data' }, { status: 404 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/analysis/store error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session') || 'default';
    const body = await request.json();
    
    setAnalysisResult(body, sessionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/analysis/store error:', error);
    return NextResponse.json(
      { error: 'Failed to store analysis' },
      { status: 500 }
    );
  }
}
