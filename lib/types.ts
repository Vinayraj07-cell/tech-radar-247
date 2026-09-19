export type OpportunityStatus = 'MAKE_NOW' | 'WATCH' | 'IGNORE';

export interface TechOpportunity {
  id: string;
  title: string;
  company: string;
  url: string;
  summary: string;
  whyItMatters: string;
  whatIsNew: string;
  visualPotential: string;
  score: number; // 0-100
  status: OpportunityStatus | string;
  angleA: string; // News hook
  angleB: string; // "You won't believe this exists" hook
  angleC: string; // Hands-on demo/test hook
  releaseDate: Date | string;
  discoveredAt: Date | string;
  notified: boolean;
}

export interface EvaluationResult {
  opportunityScore: number;
  category: OpportunityStatus;
  reasoning: string;
  hookAngles: string[];
}

export interface RawFeedItem {
  feedTitle: string;
  feedUrl: string;
  category?: string;
  title: string;
  link: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
}

export interface ScanStats {
  totalFeedsScanned: number;
  totalItemsFound: number;
  newItemsEvaluated: number;
  makeNowCount: number;
  watchCount: number;
  ignoreCount: number;
  discordAlertsSent: number;
  errors: string[];
}
