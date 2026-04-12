import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      error:
        'Deprecated route. Use the backend dashboard organizer stats endpoint instead.',
    },
    { status: 410 }
  );
}
