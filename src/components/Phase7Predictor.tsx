import React from 'react';
import { Target, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { CricketMatch } from '../types/cricket';

interface Props {
  match: CricketMatch;
}

export const Phase7Predictor: React.FC<Props> = ({ match }) => {
  const inn1 = match.innings1;
  const isSecondInnings = match.currentInningsIndex === 1 && match.innings2;
  const activeInn = isSecondInnings ? match.innings2! : inn1;

  const totalOvers = match.settings.totalOvers;
  const completedOvers = activeInn.completedOvers;
  const ballsInOver = activeInn.ballsInCurrentOver;
  const oversBowledDecimal = completedOvers + ballsInOver / 6.0;
  const oversRemainingDecimal = Math.max(0, totalOvers - oversBowledDecimal);

  const crr = activeInn.currentRunRate;
  const projectedCurrentRR = Math.round(activeInn.totalRuns + crr * oversRemainingDecimal);
  const projectedAt6 = Math.round(activeInn.totalRuns + 6.0 * oversRemainingDecimal);
  const projectedAt8 = Math.round(activeInn.totalRuns + 8.0 * oversRemainingDecimal);
  const projectedAt10 = Math.round(activeInn.totalRuns + 10.0 * oversRemainingDecimal);
  const projectedAt12 = Math.round(activeInn.totalRuns + 12.0 * oversRemainingDecimal);

  // Chase parameters
  const target = match.target || projectedCurrentRR + 1;
  const runsRemaining = Math.max(0, target - activeInn.totalRuns);
  const totalBalls = totalOvers * 6;
  const ballsRemaining = Math.max(0, totalBalls - (completedOvers * 6 + ballsInOver));
  const requiredRR = oversRemainingDecimal > 0 ? (runsRemaining / oversRemainingDecimal).toFixed(2) : '0.00';
  const projectedChaseFinish = Math.round(activeInn.totalRuns + crr * oversRemainingDecimal);

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header */}
      <div>
        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold border border-blue-500/30">
          PHASE 7: SCORE PREDICTOR
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Intelligent Score Predictor & Chase Calculator</span>
        </h2>
        <p className="text-xs text-slate-400">
          Dynamic run rate projections based on current match pacing and historical venue algorithms
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* CARD 1: 1st Innings (Current) */}
        <div className="bg-slate-900 border border-blue-900/50 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>🏏 1st Innings Projection</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 font-mono">
              {inn1.battingTeamName}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Current Score</span>
              <span className="text-xl font-bold text-white font-mono">
                {inn1.totalRuns}/{inn1.totalWickets} ({inn1.oversDisplay} ov)
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Current Run Rate</span>
              <span className="text-xl font-bold text-cyan-400 font-mono">
                {inn1.currentRunRate.toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Overs Remaining</span>
              <span className="text-xl font-bold text-slate-200 font-mono">
                {oversRemainingDecimal.toFixed(1)} ov
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-blue-600/40 bg-blue-950/20">
              <span className="text-cyan-300 font-bold block mb-1">Projected Total</span>
              <span className="text-2xl font-black text-cyan-300 font-mono">
                {projectedCurrentRR}
              </span>
            </div>
          </div>

          {/* Dynamic Projected Variations at different RPOs */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block">
              Projection at Alternative Accelerations:
            </span>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">@ 6 RPO</span>
                <span className="font-bold text-white font-mono">{projectedAt6}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">@ 8 RPO</span>
                <span className="font-bold text-white font-mono">{projectedAt8}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">@ 10 RPO</span>
                <span className="font-bold text-white font-mono">{projectedAt10}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">@ 12 RPO</span>
                <span className="font-bold text-white font-mono">{projectedAt12}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Chase Calculator (Target tracking) */}
        <div className="bg-slate-900 border border-amber-900/50 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span>Run Chase Calculator</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
              Target: {target}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Runs Remaining</span>
              <span className="text-2xl font-black text-amber-400 font-mono">
                {runsRemaining}
              </span>
              <span className="text-[10px] text-slate-500 block">needed for win</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Balls Remaining</span>
              <span className="text-2xl font-black text-white font-mono">
                {ballsRemaining}
              </span>
              <span className="text-[10px] text-slate-500 block">deliveries left</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Required Run Rate</span>
              <span className="text-2xl font-black text-rose-400 font-mono">
                {requiredRR}
              </span>
              <span className="text-[10px] text-slate-500 block">runs per over</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Projected Finish</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {projectedChaseFinish}
              </span>
              <span className="text-[10px] text-slate-500 block">at current CRR</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>Equation: Projected = CRR * Total Overs</span>
            <span className="font-mono text-cyan-400 font-bold">{crr} &times; {totalOvers} = {Math.round(crr * totalOvers)}</span>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer Note */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
        <span>Note: This is an estimated prediction based on current data. Match momentum, pitches, and wicket losses will vary final totals.</span>
      </div>
    </div>
  );
};
