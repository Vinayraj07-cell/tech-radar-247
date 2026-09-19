'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './Header';
import { StatusFilterTabs } from './StatusFilterTabs';
import { OpportunityCard } from './OpportunityCard';
import { OpportunityDetailModal } from './OpportunityDetailModal';
import { RawTicker } from './RawTicker';
import { TechOpportunity, OpportunityStatus } from '@/lib/types';
import { AlertTriangle, Sparkles, Filter, RefreshCw, Zap, RadioReceiver } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [opportunities, setOpportunities] = useState<TechOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState<OpportunityStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeWindow, setTimeWindow] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'EVALUATED' | 'RAW'>('EVALUATED');
  const [selectedOpportunity, setSelectedOpportunity] = useState<TechOpportunity | null>(null);
  const [lastScannedTime, setLastScannedTime] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/opportunities');
      const data = await res.json();
      if (data.success && Array.isArray(data.opportunities)) {
        setOpportunities(data.opportunities);
      }
    } catch (err) {
      console.error('Failed to fetch opportunities:', err);
      showToast('Could not fetch opportunities from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
    setLastScannedTime(new Date().toISOString());
  }, []);

  const handleScanNow = async () => {
    if (scanning) return;
    try {
      setScanning(true);
      showToast('Radar sweep initiated: Ingesting global tech feeds, frontier AI, and YouTube channels...', 'info');

      const res = await fetch('/api/cron/scan?limit=10', {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        const stats = data.stats;
        showToast(
          `Radar sweep complete: Evaluated ${stats.newItemsEvaluated} fresh items. ${stats.makeNowCount} MAKE NOW, ${stats.discordAlertsSent} Discord alerts sent!`,
          'success'
        );
        setLastScannedTime(new Date().toISOString());
        await fetchOpportunities();
      } else {
        showToast(`Scan notice: ${data.error || 'Check scanner logs'}`, 'error');
      }
    } catch (err: unknown) {
      console.error('Manual scan failed:', err);
      showToast('Network error triggering feed scan', 'error');
    } finally {
      setScanning(false);
    }
  };

  // Time-filtered opportunities (for accurate tab counts)
  const timeFilteredOpportunities = useMemo(() => {
    return opportunities.filter((item) => {
      if (timeWindow !== 'ALL') {
        const itemDate = new Date(item.releaseDate || item.discoveredAt);
        const hoursDiff = (Date.now() - itemDate.getTime()) / (1000 * 60 * 60);
        if (hoursDiff > parseInt(timeWindow, 10)) {
          return false;
        }
      }
      return true;
    });
  }, [opportunities, timeWindow]);

  // Metrics computation based on timeWindow
  const counts = useMemo(() => {
    return {
      all: timeFilteredOpportunities.length,
      makeNow: timeFilteredOpportunities.filter((o) => o.status === 'MAKE_NOW').length,
      watch: timeFilteredOpportunities.filter((o) => o.status === 'WATCH').length,
      ignore: timeFilteredOpportunities.filter((o) => o.status === 'IGNORE').length,
    };
  }, [timeFilteredOpportunities]);

  // Filtered and searched opportunities
  const filteredOpportunities = useMemo(() => {
    return timeFilteredOpportunities.filter((item) => {
      // Status filter
      if (filter !== 'ALL' && item.status !== filter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesCompany = item.company?.toLowerCase().includes(q);
        const matchesSummary = item.summary?.toLowerCase().includes(q);
        const matchesMatters = item.whyItMatters?.toLowerCase().includes(q);
        return matchesTitle || matchesCompany || matchesSummary || matchesMatters;
      }
      return true;
    });
  }, [timeFilteredOpportunities, filter, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-zinc-100">
      {/* Top Header */}
      <Header
        onScan={handleScanNow}
        isScanning={scanning}
        totalCount={counts.all}
        makeNowCount={counts.makeNow}
        watchCount={counts.watch}
        lastScannedTime={lastScannedTime}
        timeWindow={timeWindow}
        onTimeWindowChange={setTimeWindow}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-2.5 max-w-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-emerald-950/50'
                : toastMessage.type === 'error'
                ? 'bg-red-950/90 text-red-300 border-red-500/50 shadow-red-950/50'
                : 'bg-zinc-900 text-zinc-200 border-zinc-700 shadow-black'
            }`}
          >
            <Zap className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-zinc-800 pb-4">
          <button
            onClick={() => setActiveTab('EVALUATED')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'EVALUATED'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Evaluated Leads
          </button>
          <button
            onClick={() => setActiveTab('RAW')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'RAW'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <RadioReceiver className="w-4 h-4" />
            📡 Raw Feed Ticker
          </button>
        </div>

        {activeTab === 'RAW' ? (
          <RawTicker onPromoteSuccess={fetchOpportunities} showToast={showToast} timeWindow={timeWindow} />
        ) : (
          <>
            {/* Filter and Search Bar */}
            <StatusFilterTabs
              currentFilter={filter}
              onFilterChange={setFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              counts={counts}
            />

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-sm text-zinc-400 font-medium">Scanning frontier radar opportunities...</p>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-12 text-center max-w-lg mx-auto my-12 space-y-4">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              <Filter className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-200">No opportunities match this filter</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Try switching filter tabs, clearing your search term, or click &quot;Scan Feeds Now&quot; to ingest new tech breakthroughs.
              </p>
            </div>
            <button
              onClick={() => {
                setFilter('ALL');
                setSearchQuery('');
                setTimeWindow('ALL');
              }}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOpportunities.map((opp) => (
              <OpportunityCard
                key={opp.id || opp.url}
                opportunity={opp}
                onSelect={setSelectedOpportunity}
              />
            ))}
          </div>
        )}
        </>
        )}

      </main>

      {/* Slide-over / Modal for selected item */}
      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-850 bg-zinc-950/80 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Technology Radar for YouTube Shorts • Automated AI Sentinel</span>
          <span>Google GenAI (`gemini-2.5-flash`) • Prisma • PostgreSQL • Discord Webhooks</span>
        </div>
      </footer>
    </div>
  );
};
