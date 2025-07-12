import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Contract Redliner API',
    timestamp: new Date().toISOString()
  });
} 