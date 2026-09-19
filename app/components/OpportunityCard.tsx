'use client';

import React from 'react';
import { Flame, Eye, EyeOff, Clock, ExternalLink, Sparkles, Send, Video } from 'lucide-react';
import { TechOpportunity } from '@/lib/types';

interface OpportunityCardProps {
  opportunity: TechOpportunity;
  onSelect: (opp: TechOpportunity) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, onSelect }) => {
  const isMakeNow = opportunity.status === 'MAKE_NOW';
  const isWatch = opportunity.status === 'WATCH';

  // Format relative discovery time
  const formatTimeAgo = (dateStr: Date | string) => {
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor(diffMs / (1000 * 60));

      if (diffMins < 60) {
        return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
      }
      if (diffHrs < 24) {
        return `${diffHrs}h ago`;
      }
      const diffDays = Math.floor(diffHrs / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  // Border & Glow based on status
  const cardBorderClass = isMakeNow
    ? 'border-emerald-500/40 hover:border-emerald-400 bg-gradient-to-b from-emerald-950/20 via-zinc-900/90 to-zinc-900/95 hover:shadow-lg hover:shadow-emerald-950/30'
    : isWatch
    ? 'border-amber-500/30 hover:border-amber-400/80 bg-zinc-900/80 hover:shadow-md hover:shadow-amber-950/20'
    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-zinc-400';

  // Score Badge
  const getScoreBadge = (score: number) => {
    if (score >= 90) {
      return 'bg-red-500/20 text-red-400 border-red-500/40 ring-1 ring-red-500/20';
    }
    if (score >= 75) {
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 ring-1 ring-emerald-500/20';
    }
    if (score >= 50) {
      return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    }
    return 'bg-zinc-800 text-zinc-400 border-zinc-700';
  };

  return (
    <div
      onClick={() => onSelect(opportunity)}
      className={`group relative rounded-2xl border p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between ${cardBorderClass}`}
    >
      <div>
        {/* Top bar: Company & Score Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              {opportunity.company || 'Tech Frontier'}
            </span>

            {opportunity.notified && (
              <span className="flex items-center space-x-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Send className="w-2.5 h-2.5" />
                <span>Discord Alerted</span>
              </span>
            )}
          </div>

          {/* Score Badge */}
          <div
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${getScoreBadge(
              opportunity.score
            )}`}
          >
            {isMakeNow ? (
              <Flame className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
            ) : isWatch ? (
              <Eye className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
            )}
            <span>{opportunity.score}</span>
            <span className="text-[10px] opacity-70 font-normal">/100</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-semibold text-zinc-100 group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug mb-2">
          {opportunity.title}
        </h3>

        {/* Summary */}
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
          {opportunity.summary}
        </p>

        {/* Highlight Hook Preview */}
        {opportunity.angleA && (
          <div className="mt-3 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-emerald-400 mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Shorts Opening Hook Preview (Angle A):</span>
            </div>
            <p className="text-xs text-zinc-300 italic line-clamp-2">
              &quot;{opportunity.angleA}&quot;
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-zinc-800/70 flex items-center justify-between text-[11px] text-zinc-500">
        <div className="flex items-center space-x-1.5">
          <Clock className="w-3 h-3" />
          <span>Discovered {formatTimeAgo(opportunity.discoveredAt)}</span>
        </div>

        <div className="flex items-center space-x-1 text-emerald-400 group-hover:translate-x-0.5 transition-transform font-medium">
          <span>View Production Breakdown</span>
          <span className="text-xs">→</span>
        </div>
      </div>
    </div>
  );
};
