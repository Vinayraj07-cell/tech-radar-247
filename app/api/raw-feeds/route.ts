import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const rawItems = await prisma.rawFeedItem.findMany({
      where: { promotedToAI: false },
      orderBy: { pubDate: 'desc' },
      take: 100,
    });
    return NextResponse.json({ success: true, items: rawItems });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
