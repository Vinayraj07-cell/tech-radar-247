# Technology Radar 24/7 (YouTube Shorts Channel Sentinel)

A production-ready autonomous 24/7 Technology Radar system built specifically for a YouTube Shorts channel.

## 🚀 Features

- **24/7 Autonomous Scanning**: Ingests primary feeds from arXiv AI, OpenAI News, Google DeepMind, and Hugging Face.
- **AI Content Evaluator**: Leverages the official Google Gen AI SDK (`@google/genai`) with `gemini-2.5-flash` and strict structured JSON schemas to evaluate viral Shorts potential (0-100 score).
- **Creator Hook Engine**: Generates 3 distinctive YouTube Shorts script hooks for every topic:
  - **Angle A**: Breaking News / Urgent Alert style.
  - **Angle B**: "You won't believe this exists" mind-bending curiosity hook.
  - **Angle C**: Hands-on demo / benchmark challenge hook.
- **Discord Webhook Alerts**: Automatically dispatches rich embed cards to Discord when score >= 75 (`MAKE_NOW`).
- **Creator Dashboard**:
  - Filter by `MAKE NOW`, `WATCH`, `IGNORE`, or `All Leads`.
  - Real-time search across topics, companies, and summaries.
  - Interactive production modal with 1-click **"Copy Hook"** buttons and clipboard toasts.
  - Manual **"Scan Feeds Now"** button with live progress indicator.
- **Prisma & PostgreSQL**: Robust schema with indexes on status, score, and discovery dates.
- **Vercel Cron**: Pre-configured `vercel.json` with a 15-minute cron schedule.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS + Lucide Icons
- **ORM**: Prisma + PostgreSQL
- **AI Model**: `gemini-2.5-flash` via `@google/genai`
- **Ingestion**: `rss-parser`

## ⚙️ Setup & Installation

1. Clone and install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/techradar?schema=public"
GEMINI_API_KEY="your-gemini-api-key"
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/your-webhook-id/your-webhook-token"
CRON_SECRET="" # Optional: protect the cron endpoint
```

3. Generate Prisma client & push schema:
```bash
npx prisma generate
npx prisma db push
```

4. Seed initial high-priority opportunities:
```bash
npm run seed
```

5. Run development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the Technology Radar dashboard.
