'use client';

import React from 'react';
import { Search, Flame, Eye, EyeOff, LayoutGrid } from 'lucide-react';
import { OpportunityStatus } from '@/lib/types';

interface StatusFilterTabsProps {
  currentFilter: OpportunityStatus | 'ALL';
  onFilterChange: (filter: OpportunityStatus | 'ALL') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  counts: {
    all: number;
    makeNow: number;
    watch: number;
    ignore: number;
  };
}

export const StatusFilterTabs: React.FC<StatusFilterTabsProps> = ({
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  counts,
}) => {
  const tabs: { id: OpportunityStatus | 'ALL'; label: string; icon: React.ReactNode; count: number; activeColor: string }[] = [
    {
      id: 'ALL',
      label: 'All Leads',
      icon: <LayoutGrid className="w-3.5 h-3.5" />,
      count: counts.all,
      activeColor: 'bg-zinc-800 text-white border-zinc-700',
    },
    {
      id: 'MAKE_NOW',
      label: 'MAKE NOW',
      icon: <Flame className="w-3.5 h-3.5 text-emerald-400" />,
      count: counts.makeNow,
      activeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-950',
    },
    {
      id: 'WATCH',
      label: 'WATCH',
      icon: <Eye className="w-3.5 h-3.5 text-amber-400" />,
      count: counts.watch,
      activeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-950',
    },
    {
      id: 'IGNORE',
      label: 'IGNORE',
      icon: <EyeOff className="w-3.5 h-3.5 text-zinc-500" />,
      count: counts.ignore,
      activeColor: 'bg-zinc-900 text-zinc-400 border-zinc-800',
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
      {/* Tabs */}
      <div className="flex items-center space-x-1.5 p-1 bg-zinc-900/80 border border-zinc-800/80 rounded-xl overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = currentFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
                isActive
                  ? tab.activeColor
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-zinc-800/80 text-white' : 'bg-zinc-800/40 text-zinc-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-64">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter by title, company..."
          className="w-full pl-9 pr-3 py-1.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
