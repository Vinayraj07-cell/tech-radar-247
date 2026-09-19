import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fetchAllFeeds } from '@/lib/feeds';
import { evaluateTechItem } from '@/lib/evaluator';
import { sendDiscordAlert } from '@/lib/discord';
import { ScanStats, TechOpportunity } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes for ingestion & evaluation

export async function GET(request: NextRequest) {
  return handleScan(request);
}

export async function POST(request: NextRequest) {
  return handleScan(request);
}

async function handleScan(request: NextRequest) {
  const startTime = Date.now();
  const searchParams = request.nextUrl.searchParams;
  const maxItemsToProcess = parseInt(searchParams.get('limit') || '15', 10);
  const secret = searchParams.get('secret');

  // Verify CRON_SECRET if configured
  if (process.env.CRON_SECRET && secret && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized: Invalid CRON_SECRET' }, { status: 401 });
  }

  const stats: ScanStats = {
    totalFeedsScanned: 0,
    totalItemsFound: 0,
    newItemsEvaluated: 0,
    makeNowCount: 0,
    watchCount: 0,
    ignoreCount: 0,
    discordAlertsSent: 0,
    errors: [],
  };

  const processedOpportunities: TechOpportunity[] = [];

  try {
    // 1. Ingest RSS feeds across all global sources
    console.log('[Scanner] Ingesting broad tech ecosystem feeds with 5s timeout & 48h filter...');
    const feedResult = await fetchAllFeeds();
    stats.totalFeedsScanned = feedResult.scannedFeedsCount;
    stats.totalItemsFound = feedResult.items.length;

    if (feedResult.errors.length > 0) {
      stats.errors.push(...feedResult.errors.map((e) => `${e.feed}: ${e.error}`));
    }

    if (feedResult.items.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No items published within the last 48 hours matched the tech signal filter.',
        stats,
        opportunities: [],
      });
    }

    // 2. Query Neon DB for existing URLs to deduplicate before invoking Gemini
    const incomingUrls = feedResult.items.map((i) => i.link);
    const existingRecords = await prisma.techOpportunity.findMany({
      where: {
        url: { in: incomingUrls },
      },
      select: { url: true },
    });
    const existingUrlSet = new Set(existingRecords.map((r) => r.url));

    // Save all incoming raw items into RawFeedItem
    for (const item of feedResult.items) {
      try {
        await prisma.rawFeedItem.upsert({
          where: { url: item.link },
          update: {
            title: item.title,
            source: item.feedTitle,
            category: item.category || 'Uncategorized',
            pubDate: new Date(item.pubDate || new Date()),
          },
          create: {
            title: item.title,
            source: item.feedTitle,
            category: item.category || 'Uncategorized',
            url: item.link,
            pubDate: new Date(item.pubDate || new Date()),
          },
        });
      } catch (err) {
        console.error('Failed to save raw feed item:', item.link, err);
      }
    }

    // 3. Filter unparsed, strictly fresh items
    const freshItems = feedResult.items.filter((item) => !existingUrlSet.has(item.link));
    const itemsToEvaluate = freshItems.slice(0, Math.min(maxItemsToProcess, 20));

    console.log(
      `[Scanner] ${feedResult.items.length} fresh (<48h) items found, ${freshItems.length} unparsed in DB. Evaluating top ${itemsToEvaluate.length} with Gemini...`
    );

    // No AI evaluation in background to preserve tokens (Zero Token Background Ingestion)

    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(2);

    return NextResponse.json({
      success: true,
      message: `Scanner complete. Processed ${stats.newItemsEvaluated} fresh items in ${durationSeconds}s.`,
      stats,
      opportunities: processedOpportunities,
    });
  } catch (globalErr: unknown) {
    const errorMsg = globalErr instanceof Error ? globalErr.message : String(globalErr);
    console.error('[Scanner] Global execution error:', errorMsg);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        stats,
      },
      { status: 500 }
    );
  }
}
