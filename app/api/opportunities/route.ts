import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { TechOpportunity } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const statusFilter = searchParams.get('status'); // 'MAKE_NOW' | 'WATCH' | 'IGNORE' | 'ALL'
  const searchQuery = searchParams.get('q')?.toLowerCase() || '';

  try {
    const records = await prisma.techOpportunity.findMany({
      where: {
        ...(statusFilter && statusFilter !== 'ALL' ? { status: statusFilter } : {}),
        ...(searchQuery
          ? {
              OR: [
                { title: { contains: searchQuery, mode: 'insensitive' } },
                { company: { contains: searchQuery, mode: 'insensitive' } },
                { summary: { contains: searchQuery, mode: 'insensitive' } },
                { whyItMatters: { contains: searchQuery, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [
        { score: 'desc' },
        { discoveredAt: 'desc' },
      ],
    });

    const opportunities: TechOpportunity[] = records.map((r) => ({
      ...r,
      releaseDate: r.releaseDate.toISOString(),
      discoveredAt: r.discoveredAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      count: opportunities.length,
      opportunities,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Opportunities API] Error querying database:', errorMsg);
    return NextResponse.json(
      { success: false, error: errorMsg, count: 0, opportunities: [] },
      { status: 500 }
    );
  }
}
