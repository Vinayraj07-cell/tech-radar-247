'use client';

import React from 'react';
import { Radio, RefreshCw, Bell, Video, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onScan: () => void;
  isScanning: boolean;
  totalCount: number;
  makeNowCount: number;
  watchCount: number;
  lastScannedTime: string | null;
  timeWindow: string;
  onTimeWindowChange: (val: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onScan,
  isScanning,
  totalCount,
  makeNowCount,
  watchCount,
  lastScannedTime,
  timeWindow,
  onTimeWindowChange,
}) => {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo and Sentinel Status */}
          <div className="flex items-center space-x-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 via-zinc-900 to-indigo-500/20 border border-emerald-500/30 shadow-lg shadow-emerald-950/40">
              <Radio className="w-5 h-5 text-emerald-400" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  TECH RADAR <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold tracking-wider">24/7 LIVE</span>
                </h1>
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <Video className="w-3.5 h-3.5 text-zinc-500" />
                Autonomous YouTube Shorts Intelligence • Gemini 2.5 Flash Lite Evaluator
              </p>
            </div>
          </div>

          {/* Quick Metrics & Manual Scan Action */}
          <div className="flex items-center flex-wrap gap-3">
            {/* Metric pill */}
            <div className="flex items-center space-x-3 px-3.5 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-zinc-400">Make Now:</span>
                <span className="font-semibold text-emerald-400">{makeNowCount}</span>
              </div>
              <div className="w-px h-3.5 bg-zinc-800"></div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-zinc-400">Watch:</span>
                <span className="font-semibold text-amber-400">{watchCount}</span>
              </div>
              <div className="w-px h-3.5 bg-zinc-800"></div>
              <div className="flex items-center space-x-1.5">
                <span className="text-zinc-400">Tracked:</span>
                <span className="font-semibold text-zinc-200">{totalCount}</span>
              </div>
            </div>

            {/* Time Window Filter */}
            <select
              value={timeWindow}
              onChange={(e) => onTimeWindowChange(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
            >
              <option value="6">Last 6 Hours</option>
              <option value="12">Last 12 Hours</option>
              <option value="24">Last 24 Hours</option>
              <option value="48">Last 48 Hours</option>
              <option value="ALL">All Time</option>
            </select>

            {/* Scan Now button */}
            <button
              onClick={onScan}
              disabled={isScanning}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 shadow-md ${
                isScanning
                  ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-700'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isScanning ? 'Scanning Feeds...' : 'Scan Feeds Now'}</span>
            </button>
          </div>

        </div>

        {/* Status subheader */}
        {lastScannedTime && (
          <div className="mt-2 text-[11px] text-zinc-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Last radar synchronization: {new Date(lastScannedTime).toLocaleTimeString()}</span>
          </div>
        )}
      </div>
    </header>
  );
};
