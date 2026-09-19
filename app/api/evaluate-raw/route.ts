import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { evaluateTechItem } from '@/lib/evaluator';
import { sendDiscordAlert } from '@/lib/discord';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing raw feed item ID' }, { status: 400 });
    }

    const rawItem = await prisma.rawFeedItem.findUnique({ where: { id } });
    if (!rawItem) {
      return NextResponse.json({ error: 'Raw feed item not found' }, { status: 404 });
    }

    // Evaluate
    const evaluation = await evaluateTechItem({
      title: rawItem.title,
      link: rawItem.url,
      pubDate: rawItem.pubDate.toISOString(),
      contentSnippet: '',
      feedTitle: rawItem.source,
      feedUrl: rawItem.source // Using source as fallback for feedUrl
    });

    let notified = false;
    if (evaluation.opportunityScore >= 75) {
      const alertResult = await sendDiscordAlert({
        title: rawItem.title,
        company: rawItem.source,
        summary: evaluation.reasoning,
        whyItMatters: '',
        whatIsNew: '',
        visualPotential: '',
        score: evaluation.opportunityScore,
        status: evaluation.category,
        angleA: evaluation.hookAngles[0] || '',
        angleB: evaluation.hookAngles[1] || '',
        angleC: evaluation.hookAngles[2] || '',
        url: rawItem.url,
        releaseDate: new Date(rawItem.pubDate),
      });
      if (alertResult.success) notified = true;
    }

    const trueReleaseDate = rawItem.pubDate;

    const record = await prisma.techOpportunity.upsert({
      where: { url: rawItem.url },
      update: {
        title: rawItem.title,
        company: rawItem.source,
        summary: evaluation.reasoning,
        whyItMatters: '',
        whatIsNew: '',
        visualPotential: '',
        score: evaluation.opportunityScore,
        status: evaluation.category,
        angleA: evaluation.hookAngles[0] || '',
        angleB: evaluation.hookAngles[1] || '',
        angleC: evaluation.hookAngles[2] || '',
        releaseDate: trueReleaseDate,
        notified,
      },
      create: {
        title: rawItem.title,
        company: rawItem.source,
        url: rawItem.url,
        summary: evaluation.reasoning,
        whyItMatters: '',
        whatIsNew: '',
        visualPotential: '',
        score: evaluation.opportunityScore,
        status: evaluation.category,
        angleA: evaluation.hookAngles[0] || '',
        angleB: evaluation.hookAngles[1] || '',
        angleC: evaluation.hookAngles[2] || '',
        releaseDate: trueReleaseDate,
        notified,
      },
    });

    // Mark raw item as promoted
    await prisma.rawFeedItem.update({
      where: { id },
      data: { promotedToAI: true },
    });

    return NextResponse.json({ success: true, opportunity: record });
  } catch (error: any) {
    console.error('Error promoting raw item:', error);
    
    if (error?.status === 429 || error?.message?.includes('quota')) {
      return NextResponse.json({ error: 'Daily evaluation quota reached. Please try again shortly.' }, { status: 429 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
