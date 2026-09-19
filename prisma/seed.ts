import { PrismaClient } from '@prisma/client';
import { MOCK_OPPORTUNITIES } from '../lib/mockData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Tech Radar seed process...');

  for (const item of MOCK_OPPORTUNITIES) {
    const record = await prisma.techOpportunity.upsert({
      where: { url: item.url },
      update: {
        title: item.title,
        company: item.company,
        summary: item.summary,
        whyItMatters: item.whyItMatters,
        whatIsNew: item.whatIsNew,
        visualPotential: item.visualPotential,
        score: item.score,
        status: item.status,
        angleA: item.angleA,
        angleB: item.angleB,
        angleC: item.angleC,
        releaseDate: new Date(item.releaseDate),
        notified: item.notified,
      },
      create: {
        title: item.title,
        company: item.company,
        url: item.url,
        summary: item.summary,
        whyItMatters: item.whyItMatters,
        whatIsNew: item.whatIsNew,
        visualPotential: item.visualPotential,
        score: item.score,
        status: item.status,
        angleA: item.angleA,
        angleB: item.angleB,
        angleC: item.angleC,
        releaseDate: new Date(item.releaseDate),
        discoveredAt: new Date(item.discoveredAt),
        notified: item.notified,
      },
    });

    console.log(`✅ Seeded opportunity: [${record.status}] ${record.title} (${record.score}/100)`);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
