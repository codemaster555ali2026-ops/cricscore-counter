import React, { useState } from 'react';
import { LineChart, BarChart2, TrendingUp, Layers } from 'lucide-react';
import { CricketMatch } from '../types/cricket';

interface Props {
  match: CricketMatch;
}

export const Phase9Graphs: React.FC<Props> = ({ match }) => {
  const [activeChart, setActiveChart] = useState<'worm' | 'manhattan' | 'runrate' | 'partnerships'>('worm');

  const inn1 = match.innings1;
  const inn2 = match.innings2;

  // Build over-by-over progression data for Innings 1
  const overData1: { over: number; runsInOver: number; cumulativeRuns: number; wickets: number }[] = [];
  const maxOvers = match.settings.totalOvers;

  // Aggregate deliveries per over for Innings 1
  for (let o = 1; o <= maxOvers; o++) {
    const balls = inn1.deliveries.filter((d) => d.overNumber === o - 1);
    const runs = balls.reduce((acc, b) => acc + b.runsOffBat + b.extrasRuns, 0);
    const wkts = balls.filter((b) => b.isWicket).length;
    const prevCum = overData1.length > 0 ? overData1[overData1.length - 1].cumulativeRuns : 0;

    if (balls.length > 0 || o <= inn1.completedOvers) {
      overData1.push({
        over: o,
        runsInOver: runs,
        cumulativeRuns: prevCum + runs,
        wickets: wkts
      });
    }
  }

  // Aggregate deliveries per over for Innings 2 if available
  const overData2: { over: number; runsInOver: number; cumulativeRuns: number; wickets: number }[] = [];
  if (inn2) {
    for (let o = 1; o <= maxOvers; o++) {
      const balls = inn2.deliveries.filter((d) => d.overNumber === o - 1);
      const runs = balls.reduce((acc, b) => acc + b.runsOffBat + b.extrasRuns, 0);
      const wkts = balls.filter((b) => b.isWicket).length;
      const prevCum = overData2.length > 0 ? overData2[overData2.length - 1].cumulativeRuns : 0;

      if (balls.length > 0 || o <= inn2.completedOvers) {
        overData2.push({
          over: o,
          runsInOver: runs,
          cumulativeRuns: prevCum + runs,
          wickets: wkts
        });
      }
    }
  }

  // Partnerships list for currently active innings
  const activeInn = match.currentInningsIndex === 1 && inn2 ? inn2 : inn1;
  const partnerships = activeInn.partnerships.length > 0
    ? activeInn.partnerships
    : [activeInn.currentPartnership];

  // SVG dimensions for graphs
  const svgWidth = 600;
  const svgHeight = 240;
  const padding = 35;

  const maxRuns = Math.max(
    inn1.totalRuns,
    inn2?.totalRuns || 0,
    100
  );

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold border border-blue-500/30">
            PHASE 9: GRAPHS & VISUAL ANALYTICS
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Visual Score Progression & Worm Chart
          </h2>
        </div>

        {/* Chart Selector Pills */}
        <div className="flex flex-wrap gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveChart('worm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeChart === 'worm' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Worm Graph
          </button>
          <button
            onClick={() => setActiveChart('manhattan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeChart === 'manhattan' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Runs / Over (Manhattan)
          </button>
          <button
            onClick={() => setActiveChart('runrate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeChart === 'runrate' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Run Rate Curve
          </button>
          <button
            onClick={() => setActiveChart('partnerships')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeChart === 'partnerships' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Partnerships
          </button>
        </div>
      </div>

      {/* Main Graph Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
        {/* Graph Legend */}
        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-blue-400">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span>{inn1.battingTeamName} ({inn1.totalRuns}/{inn1.totalWickets})</span>
            </span>

            {inn2 && (
              <span className="flex items-center gap-1.5 font-bold text-cyan-400">
                <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block" />
                <span>{inn2.battingTeamName} ({inn2.totalRuns}/{inn2.totalWickets})</span>
              </span>
            )}
          </div>

          <span className="text-slate-400 font-mono text-[11px]">
            Format: {match.settings.totalOvers} Overs
          </span>
        </div>

        {/* 1. WORM GRAPH (Line Chart Overs vs Runs) */}
        {activeChart === 'worm' && (
          <div className="w-full overflow-x-auto">
            <svg
              className="w-full min-w-[500px] h-64 bg-slate-950/70 rounded-2xl p-2 border border-slate-800/80"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            >
              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = padding + (svgHeight - 2 * padding) * (1 - pct);
                const runVal = Math.round(maxRuns * pct);
                return (
                  <g key={i}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={svgWidth - padding}
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray="4"
                    />
                    <text x={padding - 6} y={y + 3} fill="#64748b" fontSize="9" textAnchor="end">
                      {runVal}
                    </text>
                  </g>
                );
              })}

              {/* Vertical Overs lines */}
              {[1, 5, 10, 15, 20].filter((o) => o <= maxOvers).map((ov) => {
                const x = padding + ((ov - 1) / (maxOvers - 1)) * (svgWidth - 2 * padding);
                return (
                  <g key={ov}>
                    <line
                      x1={x}
                      y1={padding}
                      x2={x}
                      y2={svgHeight - padding}
                      stroke="#1e293b"
                      strokeDasharray="2"
                    />
                    <text x={x} y={svgHeight - padding + 14} fill="#64748b" fontSize="9" textAnchor="middle">
                      {ov} ov
                    </text>
                  </g>
                );
              })}

              {/* Innings 1 Path */}
              {overData1.length > 0 && (
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={overData1
                    .map((d) => {
                      const x = padding + ((d.over - 1) / (maxOvers - 1)) * (svgWidth - 2 * padding);
                      const y = padding + (svgHeight - 2 * padding) * (1 - d.cumulativeRuns / (maxRuns || 1));
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              )}

              {/* Innings 2 Path */}
              {overData2.length > 0 && (
                <polyline
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={overData2
                    .map((d) => {
                      const x = padding + ((d.over - 1) / (maxOvers - 1)) * (svgWidth - 2 * padding);
                      const y = padding + (svgHeight - 2 * padding) * (1 - d.cumulativeRuns / (maxRuns || 1));
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              )}
            </svg>
          </div>
        )}

        {/* 2. MANHATTAN GRAPH (Bar chart runs per over with wickets) */}
        {activeChart === 'manhattan' && (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[500px] h-64 bg-slate-950/70 rounded-2xl p-4 border border-slate-800/80 flex items-end gap-2">
              {(overData1.length > 0 ? overData1 : [{ over: 1, runsInOver: 8, cumulativeRuns: 8, wickets: 0 }]).map((d) => {
                const heightPercent = Math.min(100, (d.runsInOver / 24) * 100);
                return (
                  <div key={d.over} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] text-slate-400 font-mono font-bold">
                      {d.runsInOver}
                    </span>
                    <div
                      className="w-full rounded-t-lg bg-blue-600 group-hover:bg-cyan-400 transition-all relative"
                      style={{ height: `${Math.max(12, heightPercent * 1.6)}px` }}
                    >
                      {d.wickets > 0 && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {d.over}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. RUN RATE CURVE */}
        {activeChart === 'runrate' && (
          <div className="w-full overflow-x-auto">
            <svg
              className="w-full min-w-[500px] h-64 bg-slate-950/70 rounded-2xl p-2 border border-slate-800/80"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            >
              {[0, 4, 8, 12, 16].map((rr, i) => {
                const y = padding + (svgHeight - 2 * padding) * (1 - rr / 16);
                return (
                  <g key={i}>
                    <line x1={padding} y1={y} x2={svgWidth - padding} y2={y} stroke="#1e293b" strokeDasharray="3" />
                    <text x={padding - 6} y={y + 3} fill="#64748b" fontSize="9" textAnchor="end">{rr}</text>
                  </g>
                );
              })}
              {overData1.length > 0 && (
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  points={overData1
                    .map((d) => {
                      const crr = d.cumulativeRuns / d.over;
                      const x = padding + ((d.over - 1) / (maxOvers - 1)) * (svgWidth - 2 * padding);
                      const y = padding + (svgHeight - 2 * padding) * (1 - crr / 16);
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              )}
            </svg>
          </div>
        )}

        {/* 4. PARTNERSHIPS BAR CHART */}
        {activeChart === 'partnerships' && (
          <div className="space-y-3">
            {partnerships.map((p, idx) => (
              <div key={idx} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">
                    {p.batter1Name} & {p.batter2Name}
                  </span>
                  <span className="font-mono font-bold text-cyan-400">
                    {p.runs} runs ({p.balls}b)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
                    style={{ width: `${Math.min(100, (p.runs / 100) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
