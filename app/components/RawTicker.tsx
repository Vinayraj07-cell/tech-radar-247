import React, { useEffect, useState, useMemo } from 'react';
import { ExternalLink, Sparkles, RefreshCw, ChevronDown, ChevronUp, Youtube, Flame } from 'lucide-react';

interface RawFeedItem {
  id: string;
  title: string;
  source: string;
  category: string;
  url: string;
  pubDate: string;
}

interface RawTickerProps {
  onPromoteSuccess: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  timeWindow: string; // Passed down to filter local view if needed, but the main fetch could also just fetch all or filter client side.
}

const VIRAL_KEYWORDS = ["5090", "rtx", "humanoid", "leak", "secret", "breakthrough", "supermoto", "autonomous", "banned", "digit", "nova lake"];

const CATEGORIES = [
  '🧠 AI Research & Models',
  '⚡ Hardware, GPUs & Chips',
  '🤖 Robotics & Automation',
  '🚗 EVs, Hydrogen & Mobility',
  '🌐 Global Tech & Big Tech'
];

export const RawTicker: React.FC<RawTickerProps> = ({ onPromoteSuccess, showToast, timeWindow }) => {
  const [items, setItems] = useState<RawFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const fetchRawItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/raw-feeds');
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Failed to fetch raw items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRawItems();
  }, []);

  const timeFilteredItems = useMemo(() => {
    if (timeWindow === 'ALL') return items;
    return items.filter(item => {
      const hoursDiff = (Date.now() - new Date(item.pubDate).getTime()) / (1000 * 60 * 60);
      return hoursDiff <= parseInt(timeWindow, 10);
    });
  }, [items, timeWindow]);

  // Group and calculate hot hooks
  const groupedData = useMemo(() => {
    const map = new Map<string, { items: RawFeedItem[], hotCount: number }>();
    CATEGORIES.forEach(c => map.set(c, { items: [], hotCount: 0 }));

    timeFilteredItems.forEach(item => {
      // Fallback category if not found
      const cat = map.has(item.category) ? item.category : '🌐 Global Tech & Big Tech';
      
      let isHot = false;
      const scanText = (item.title + ' ' + item.source).toLowerCase();
      if (VIRAL_KEYWORDS.some(kw => scanText.includes(kw))) {
        isHot = true;
      }
      
      const group = map.get(cat)!;
      group.items.push(item);
      if (isHot) group.hotCount++;
    });

    // Determine default expansions (top 2 hot hooks)
    const sortedCats = Array.from(map.entries())
      .map(([name, data]) => ({ name, hotCount: data.hotCount }))
      .sort((a, b) => b.hotCount - a.hotCount);
    
    const defaultExpanded: Record<string, boolean> = {};
    sortedCats.forEach((c, idx) => {
      defaultExpanded[c.name] = idx < 2 && c.hotCount > 0; 
    });

    return { map, defaultExpanded };
  }, [timeFilteredItems]);

  useEffect(() => {
    if (Object.keys(expandedCategories).length === 0) {
      setExpandedCategories(groupedData.defaultExpanded);
    }
  }, [groupedData, expandedCategories]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handlePromote = async (id: string) => {
    if (promotingId) return;
    try {
      setPromotingId(id);
      showToast('Sending raw signal to Gemini for analysis...', 'info');
      const res = await fetch('/api/evaluate-raw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Successfully promoted item to Tech Radar', 'success');
        setItems(items.filter((item) => item.id !== id));
        onPromoteSuccess();
      } else {
        showToast(`Failed to evaluate: ${data.error}`, 'error');
      }
    } catch (err) {
      console.error('Error promoting:', err);
      showToast('Network error during promotion', 'error');
    } finally {
      setPromotingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-sm text-zinc-400 font-medium">Fetching raw feed ticker...</p>
      </div>
    );
  }

  const isAllExpanded = Object.values(expandedCategories).every(v => v);

  const toggleAll = () => {
    const newState = !isAllExpanded;
    const next: Record<string, boolean> = {};
    CATEGORIES.forEach(c => next[c] = newState);
    setExpandedCategories(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={toggleAll}
          className="text-xs text-emerald-400 font-semibold hover:text-emerald-300 transition-colors bg-emerald-500/10 px-3 py-1.5 rounded-md"
        >
          {isAllExpanded ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      {CATEGORIES.map(category => {
        const data = groupedData.map.get(category)!;
        if (data.items.length === 0) return null;

        const isExpanded = !!expandedCategories[category];

        return (
          <div key={category} className="border border-zinc-800 rounded-xl bg-zinc-950/50 overflow-hidden">
            {/* Accordion Header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between p-4 bg-zinc-900/80 hover:bg-zinc-800/80 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-zinc-100">{category}</h3>
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-semibold text-zinc-400">
                  {data.items.length} items
                </span>
                {data.hotCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-[10px] font-bold text-orange-400 flex items-center gap-1 shadow-[0_0_8px_rgba(249,115,22,0.2)]">
                    <Flame className="w-3 h-3" /> {data.hotCount} Hot Hooks
                  </span>
                )}
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
            </button>

            {/* Accordion Content */}
            {isExpanded && (
              <div className="p-3 space-y-2 bg-zinc-950/50">
                {data.items.map(item => {
                  const scanText = (item.title + ' ' + item.source).toLowerCase();
                  const isHot = VIRAL_KEYWORDS.some(kw => scanText.includes(kw));
                  const isYouTube = item.url.includes('youtube.com');

                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 rounded-lg border transition-all ${
                        isHot 
                          ? 'bg-orange-500/5 border-orange-500/30 shadow-[inset_0_0_12px_rgba(249,115,22,0.05)]' 
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-1">
                          <span className="font-semibold text-zinc-300 flex items-center gap-1">
                            {isYouTube && <Youtube className="w-3.5 h-3.5 text-red-500" />}
                            {item.source}
                          </span>
                          <span>•</span>
                          <span>{new Date(item.pubDate).toLocaleString()}</span>
                          {isHot && (
                            <>
                              <span>•</span>
                              <span className="text-orange-400 font-bold bg-orange-500/10 px-1.5 rounded-sm flex items-center gap-1">
                                <Flame className="w-3 h-3" /> HOOK POTENTIAL
                              </span>
                            </>
                          )}
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`font-semibold transition-colors flex items-center gap-1.5 line-clamp-2 text-sm ${
                            isHot ? 'text-orange-100 hover:text-orange-400' : 'text-zinc-100 hover:text-emerald-400'
                          }`}
                        >
                          {item.title}
                        </a>
                      </div>
                      
                      <button
                        onClick={() => handlePromote(item.id)}
                        disabled={promotingId === item.id}
                        className="flex-shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700"
                      >
                        {promotingId === item.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span>Promote to AI Analysis</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
