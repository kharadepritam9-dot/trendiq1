import { NextResponse } from 'next/server';
import { generateContentWithGemini } from '../../../lib/ai/contentGenerator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await generateContentWithGemini(body);

    if (result.success === false) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: result.message,
        },
        { status: result.status }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: 'INVALID_REQUEST',
        message: 'Invalid JSON request payload.',
      },
      { status: 400 }
    );
  }
}

