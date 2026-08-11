import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, tag, secret } = body;

    // Validate secret token to prevent unauthorized revalidation
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { message: 'Invalid secret' },
        { status: 401 }
      );
    }

    // Revalidate by path or tag
    if (path) {
      revalidatePath(path);
      return NextResponse.json(
        { revalidated: true, path, now: Date.now() },
        { status: 200 }
      );
    }

    if (tag) {
      revalidateTag(tag, {});
      return NextResponse.json(
        { revalidated: true, tag, now: Date.now() },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: 'Missing path or tag parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Error revalidating', error: String(error) },
      { status: 500 }
    );
  }
}
