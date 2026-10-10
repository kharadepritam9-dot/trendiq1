import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const trendsFilePath = path.join(process.cwd(), 'trends.json');
    if (fs.existsSync(trendsFilePath)) {
      const data = fs.readFileSync(trendsFilePath, 'utf-8');
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json({ error: 'trends.json not found' }, { status: 404 });
  } catch (err) {
    console.error('Error reading trends in Next.js API route:', err);
    return NextResponse.json({ error: 'Failed to read trends data' }, { status: 500 });
  }
}
