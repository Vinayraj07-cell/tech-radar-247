'use client';

import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Flame,
  Eye,
  EyeOff,
  Sparkles,
  Video,
  Lightbulb,
  Zap,
  Film,
  Send,
  Calendar,
} from 'lucide-react';
import { TechOpportunity } from '@/lib/types';

interface OpportunityDetailModalProps {
  opportunity: TechOpportunity | null;
  onClose: () => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  onClose,
}) => {
  const [copiedAngle, setCopiedAngle] = useState<string | null>(null);

  if (!opportunity) return null;

  const copyToClipboard = async (text: string, angleName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAngle(angleName);
      setTimeout(() => setCopiedAngle(null), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const isMakeNow = opportunity.status === 'MAKE_NOW';
  const isWatch = opportunity.status === 'WATCH';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl shadow-black/80 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-6 border-b border-zinc-800/80 bg-zinc-900/40 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                {opportunity.company}
              </span>

              {/* Status Badge */}
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 ${
                  isMakeNow
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                    : isWatch
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                {isMakeNow ? <Flame className="w-3.5 h-3.5" /> : isWatch ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{opportunity.status}</span>
                <span className="text-zinc-500">•</span>
                <span>{opportunity.score}/100</span>
              </span>

              {opportunity.notified && (
                <span className="flex items-center space-x-1 text-xs font-medium px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Send className="w-3 h-3" />
                  <span>Discord Alert Dispatched</span>
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {opportunity.title}
            </h2>

            <div className="flex items-center text-xs text-zinc-400 gap-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                Released: {new Date(opportunity.releaseDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-180px)] overflow-y-auto">
          
          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Executive Summary
            </h4>
            <p className="text-sm text-zinc-200 leading-relaxed">
              {opportunity.summary}
            </p>
          </div>

          {/* Breakdown Grid: Why It Matters & What Is New */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                Why It Matters
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {opportunity.whyItMatters}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                What Is New & Novel
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {opportunity.whatIsNew}
              </p>
            </div>
          </div>

          {/* Visual Potential & Demo / B-Roll Ideas */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/20 via-zinc-900/60 to-purple-950/20 border border-indigo-500/20">
            <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-indigo-400" />
              Visual Demonstration & B-Roll Ideas (45s Shorts Format)
            </h4>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
              {opportunity.visualPotential}
            </p>
          </div>

          {/* 3 Ready-to-Record Shorts Script Hooks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-400" />
                Ready-to-Record YouTube Shorts Hooks (First 3 Seconds)
              </h4>
              {copiedAngle && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-in fade-in">
                  <Check className="w-3.5 h-3.5" /> {copiedAngle} Copied!
                </span>
              )}
            </div>

            {/* Angle A */}
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group">
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ANGLE A • BREAKING NEWS HOOK
                </span>
                <p className="text-sm font-medium text-zinc-100 italic mt-1">
                  &quot;{opportunity.angleA}&quot;
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(opportunity.angleA, 'Angle A')}
                className="self-end sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-500 hover:text-zinc-950 text-zinc-300 text-xs font-semibold transition-all border border-zinc-700 whitespace-nowrap active:scale-95"
              >
                {copiedAngle === 'Angle A' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Hook</span>
                  </>
                )}
              </button>
            </div>

            {/* Angle B */}
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group">
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ANGLE B • &quot;YOU WON&apos;T BELIEVE THIS EXISTS&quot; CURIOSITY
                </span>
                <p className="text-sm font-medium text-zinc-100 italic mt-1">
                  &quot;{opportunity.angleB}&quot;
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(opportunity.angleB, 'Angle B')}
                className="self-end sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-purple-500 hover:text-zinc-950 text-zinc-300 text-xs font-semibold transition-all border border-zinc-700 whitespace-nowrap active:scale-95"
              >
                {copiedAngle === 'Angle B' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Hook</span>
                  </>
                )}
              </button>
            </div>

            {/* Angle C */}
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group">
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  ANGLE C • HANDS-ON DEMO / BENCHMARK CHALLENGE
                </span>
                <p className="text-sm font-medium text-zinc-100 italic mt-1">
                  &quot;{opportunity.angleC}&quot;
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(opportunity.angleC, 'Angle C')}
                className="self-end sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-blue-500 hover:text-zinc-950 text-zinc-300 text-xs font-semibold transition-all border border-zinc-700 whitespace-nowrap active:scale-95"
              >
                {copiedAngle === 'Angle C' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Hook</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            Close Breakdown
          </button>

          <a
            href={opportunity.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <span>Open Primary Source</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
};
