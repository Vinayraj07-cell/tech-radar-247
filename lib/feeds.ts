import Parser from 'rss-parser';
import { RawFeedItem } from './types';

export interface FeedSource {
  name: string;
  url: string;
  category: string;
}

export const TECH_RADAR_SOURCES: FeedSource[] = [
  // --- 🧠 AI Research & Models ---
  { name: 'Google AI', url: 'https://blog.google/innovation-and-ai/technology/ai/rss/', category: '🧠 AI Research & Models' },
  { name: 'OpenAI', url: 'https://openai.com/news/rss.xml', category: '🧠 AI Research & Models' },
  { name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml', category: '🧠 AI Research & Models' },
  { name: 'ArXiv CS.AI', url: 'http://export.arxiv.org/rss/cs.AI', category: '🧠 AI Research & Models' },

  // --- ⚡ Hardware, GPUs & Chips ---
  { name: 'NVIDIA', url: 'https://blogs.nvidia.com/feed/', category: '⚡ Hardware, GPUs & Chips' },
  { name: 'Tom\'s Hardware', url: 'https://www.tomshardware.com/feeds/all', category: '⚡ Hardware, GPUs & Chips' },

  // --- 🤖 Robotics & Automation ---
  { name: 'Boston Dynamics (YouTube)', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC7vVhkEfw4nOGp8TyDk7RcQ', category: '🤖 Robotics & Automation' },
  { name: 'Two Minute Papers (YouTube)', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCbfYPyITQ-7l4upoX8nvctg', category: '🤖 Robotics & Automation' },
  { name: 'IEEE Spectrum', url: 'https://spectrum.ieee.org/rss/robotics/fulltext', category: '🤖 Robotics & Automation' },
  { name: 'Robot Report', url: 'https://therobotreport.com/feed/', category: '🤖 Robotics & Automation' },

  // --- 🚗 EVs, Hydrogen & Mobility ---
  { name: 'Electrek', url: 'https://electrek.co/feed/', category: '🚗 EVs, Hydrogen & Mobility' },
  { name: 'InsideEVs', url: 'https://insideevs.com/rss/articles/all/', category: '🚗 EVs, Hydrogen & Mobility' },
  { name: 'Tesla Motors (YouTube)', url: 'https://www.youtube.com/feeds/videos.xml?user=teslamotors', category: '🚗 EVs, Hydrogen & Mobility' },

  // --- 🌐 Global Tech & Big Tech ---
  { name: 'The Verge', url: 'https://www.theverge.com/rss/tech/index.xml', category: '🌐 Global Tech & Big Tech' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: '🌐 Global Tech & Big Tech' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com/rss', category: '🌐 Global Tech & Big Tech' }
];

// 5-second hard abort timeout and custom User-Agent
const parser = new Parser({
  headers: {
    'User-Agent': 'TechRadarBot/2.0',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
  timeout: 5000,
});

// Fast keyword pre-filter to eliminate non-tech noise from broader news feeds
const TECH_KEYWORDS = [
  'ai',
  'model',
  'robot',
  'humanoid',
  'ev',
  'hydrogen',
  'battery',
  'gpu',
  'chip',
  'breakthrough',
  'autonomous',
  'tesla',
  'apple',
  'nvidia',
  'google',
  'anthropic',
  'quantum',
  'llm',
  'deepseek',
  'openai',
  'processor',
  'semiconductor',
  'supercomputer',
];

const DEDICATED_TECH_CATEGORIES = new Set([
  '🧠 AI Research & Models',
  '⚡ Hardware, GPUs & Chips',
  '🤖 Robotics & Automation',
  '🚗 EVs, Hydrogen & Mobility',
]);

const MAX_AGE_MS = 48 * 60 * 60 * 1000; // Strictly within the last 48 hours

// Decode HTML entities
function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&#8217;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#160;/g, ' ')
    .replace(/&nbsp;/g, ' ');
}

export async function fetchAllFeeds(feeds: FeedSource[] = TECH_RADAR_SOURCES): Promise<{
  items: RawFeedItem[];
  errors: { feed: string; error: string }[];
  scannedFeedsCount: number;
}> {
  const allItems: RawFeedItem[] = [];
  const errors: { feed: string; error: string }[] = [];
  const now = Date.now();

  const feedPromises = feeds.map(async (feed) => {
    try {
      const feedData = await parser.parseURL(feed.url);
      const parsedItems = (feedData.items || []).slice(0, 20);

      for (const item of parsedItems) {
        const cleanLink = (item.link || item.guid || '').trim();
        const rawTitle = (item.title || '').trim().replace(/\s+/g, ' ');
        const cleanTitle = decodeHtmlEntities(rawTitle);

        if (!cleanLink || !cleanTitle) continue;

        // 1. Extract true publication date
        const rawDate = item.isoDate || item.pubDate || (item as Record<string, unknown>)['dc:date'];
        if (!rawDate) {
          continue;
        }

        const pubDateObj = new Date(String(rawDate));
        if (isNaN(pubDateObj.getTime())) {
          continue;
        }

        // 2. Strict 48-Hour Freshness Check
        const ageMs = now - pubDateObj.getTime();
        if (ageMs > MAX_AGE_MS || ageMs < -24 * 60 * 60 * 1000) {
          // Older than 48 hours or invalid future date -> skip
          continue;
        }

        // 3. Fast keyword pre-filter to eliminate non-tech noise
        const textToScan = `${cleanTitle} ${item.contentSnippet || ''} ${item.content || ''}`.toLowerCase();
        const isFromSpecializedSource = DEDICATED_TECH_CATEGORIES.has(feed.category);
        const matchesKeyword = TECH_KEYWORDS.some((kw) => {
          if (kw.length <= 3) {
            const regex = new RegExp(`\\b${kw}\\b`, 'i');
            return regex.test(textToScan);
          }
          return textToScan.includes(kw);
        });

        if (!isFromSpecializedSource && !matchesKeyword) {
          continue;
        }

        allItems.push({
          feedTitle: feed.name,
          feedUrl: feed.url,
          category: feed.category,
          title: cleanTitle,
          link: cleanLink,
          pubDate: pubDateObj.toISOString(),
          contentSnippet: decodeHtmlEntities((item.contentSnippet || item.content || item.summary || '').slice(0, 1000)),
          content: decodeHtmlEntities((item.content || item.contentSnippet || '').slice(0, 1500)),
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      errors.push({ feed: feed.name, error: errorMsg });
    }
  });

  // Safe execution with allSettled to ensure no slow feed hangs the scan
  await Promise.allSettled(feedPromises);

  // Deduplicate by URL
  const uniqueItemsMap = new Map<string, RawFeedItem>();
  for (const item of allItems) {
    if (!uniqueItemsMap.has(item.link)) {
      uniqueItemsMap.set(item.link, item);
    }
  }

  // Sort freshest first
  const sortedItems = Array.from(uniqueItemsMap.values()).sort(
    (a, b) => new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime()
  );

  return {
    items: sortedItems,
    errors,
    scannedFeedsCount: feeds.length,
  };
}
