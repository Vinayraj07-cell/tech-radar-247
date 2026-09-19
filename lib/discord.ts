import { TechOpportunity } from './types';

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  title: string;
  description?: string;
  url?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  footer?: { text: string };
  timestamp?: string;
}

export async function sendDiscordAlert(
  opportunity: TechOpportunity | (Omit<TechOpportunity, 'id' | 'discoveredAt' | 'notified'> & { id?: string }),
  webhookUrl?: string
): Promise<{ success: boolean; error?: string }> {
  const targetWebhook = webhookUrl || process.env.DISCORD_WEBHOOK_URL;

  if (!targetWebhook || !targetWebhook.trim()) {
    console.warn('[Discord Webhook] No DISCORD_WEBHOOK_URL set. Skipping webhook alert.');
    return { success: false, error: 'DISCORD_WEBHOOK_URL is not set' };
  }

  // Determine accent color: Hot red if >= 90, emerald if >= 75
  const color = opportunity.score >= 90 ? 0xef4444 : 0x10b981;

  const embed: DiscordEmbed = {
    title: `🚨 [MAKE NOW - ${opportunity.score}/100] ${opportunity.title}`,
    url: opportunity.url,
    color,
    description: `**Summary:** ${opportunity.summary}`,
    fields: [
      {
        name: '🏢 Source / Company',
        value: opportunity.company || 'Unknown',
        inline: true,
      },
      {
        name: '🔥 Shorts Viral Potential',
        value: `**${opportunity.score}/100** (Urgent Priority)`,
        inline: true,
      },
      {
        name: '💡 Reasoning',
        value: opportunity.summary.slice(0, 1024),
        inline: false,
      },
      {
        name: '🎬 Shorts Hook Angle A (Breaking News)',
        value: `> "${opportunity.angleA}"`.slice(0, 1024),
        inline: false,
      },
      {
        name: '🤯 Shorts Hook Angle B (Mind-Blowing / Curiosity)',
        value: `> "${opportunity.angleB}"`.slice(0, 1024),
        inline: false,
      },
      {
        name: '🧪 Shorts Hook Angle C (Hands-On / Benchmark Test)',
        value: `> "${opportunity.angleC}"`.slice(0, 1024),
        inline: false,
      },
    ],
    footer: {
      text: '⚡ Tech Radar 24/7 • YouTube Shorts Autonomous Sentinel',
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(targetWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: `🚨 **High-Priority YouTube Shorts Opportunity Discovered!** (${opportunity.score}/100)`,
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Discord Webhook] Failed with status ${response.status}: ${errorText}`);
      return { success: false, error: `Discord responded with ${response.status}: ${errorText}` };
    }

    console.log(`[Discord Webhook] Successfully sent alert for "${opportunity.title}"`);
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[Discord Webhook] Network exception sending webhook:', errorMsg);
    return { success: false, error: errorMsg };
  }
}
