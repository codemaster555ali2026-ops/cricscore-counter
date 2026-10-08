import React from 'react';
import { Target, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { CricketMatch } from '../types/cricket';

interface Props {
  match: CricketMatch;
}

export const Phase8WinProbability: React.FC<Props> = ({ match }) => {
  const isSecondInnings = match.currentInningsIndex === 1 && match.innings2;
  const activeInn = isSecondInnings ? match.innings2! : match.innings1;

  const teamA = match.teamA;
  const teamB = match.teamB;
  const totalOvers = match.settings.totalOvers;

  // Compute realistic cricket Win Probability algorithm
  let teamAWinPct = 50;
  let teamBWinPct = 50;

  if (match.status === 'completed' && match.result) {
    if (match.result.winnerTeamId === teamA.id) {
      teamAWinPct = 100;
      teamBWinPct = 0;
    } else if (match.result.winnerTeamId === teamB.id) {
      teamAWinPct = 0;
      teamBWinPct = 100;
    } else {
      teamAWinPct = 50;
      teamBWinPct = 50;
    }
  } else if (!isSecondInnings) {
    // 1st Innings: based on Run Rate vs typical par of 8.0 in T20, and wickets in hand
    const crr = activeInn.currentRunRate;
    const wicketsLeft = 10 - activeInn.totalWickets;
    const battingAdvantage = (crr - 7.5) * 4 + (wicketsLeft - 5) * 2;
    const clampedBattingPct = Math.min(85, Math.max(15, 50 + battingAdvantage));

    const isBattingTeamA = activeInn.battingTeamId === teamA.id;
    teamAWinPct = isBattingTeamA ? Math.round(clampedBattingPct) : Math.round(100 - clampedBattingPct);
    teamBWinPct = 100 - teamAWinPct;
  } else {
    // 2nd Innings: based on Required RR vs balls and wickets remaining
    const target = match.target || 180;
    const runsNeeded = Math.max(0, target - activeInn.totalRuns);
    const ballsRemaining = Math.max(1, totalOvers * 6 - (activeInn.completedOvers * 6 + activeInn.ballsInCurrentOver));
    const wicketsLeft = 10 - activeInn.totalWickets;
    const rrr = (runsNeeded / ballsRemaining) * 6;

    let chasingProb = 50;
    if (rrr > 14) chasingProb = Math.max(5, wicketsLeft * 3);
    else if (rrr > 11) chasingProb = Math.max(15, wicketsLeft * 5);
    else if (rrr > 9) chasingProb = Math.max(30, 20 + wicketsLeft * 4);
    else if (rrr <= 6) chasingProb = Math.min(95, 60 + wicketsLeft * 4);
    else chasingProb = Math.min(80, Math.max(20, 50 + (8.5 - rrr) * 8 + (wicketsLeft - 4) * 4));

    const isChasingTeamA = activeInn.battingTeamId === teamA.id;
    teamAWinPct = isChasingTeamA ? Math.round(chasingProb) : Math.round(100 - chasingProb);
    teamBWinPct = 100 - teamAWinPct;
  }

  // Key factors calculations
  const wicketsRemaining = 10 - activeInn.totalWickets;
  const ballsRemaining = Math.max(0, totalOvers * 6 - (activeInn.completedOvers * 6 + activeInn.ballsInCurrentOver));
  const currentRR = activeInn.currentRunRate.toFixed(2);
  const target = match.target || Math.round(activeInn.totalRuns + activeInn.currentRunRate * (totalOvers - activeInn.completedOvers)) + 1;
  const runsRemaining = Math.max(0, target - activeInn.totalRuns);
  const oversLeft = ballsRemaining / 6.0;
  const requiredRR = oversLeft > 0 ? (runsRemaining / oversLeft).toFixed(2) : '0.00';
  const projectedFinish = Math.round(activeInn.totalRuns + activeInn.currentRunRate * oversLeft);

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header */}
      <div>
        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold border border-blue-500/30">
          PHASE 8: WIN-PROBABILITY DISPLAY
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          <span>Real-Time Win Probability (App Estimate)</span>
        </h2>
        <p className="text-xs text-slate-400">
          Dynamic machine model incorporating current run rate, wickets in hand, and balls remaining
        </p>
      </div>

      {/* BIG CIRCULAR / GAUGE CHARTS CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
          {/* Team A Wheel */}
          <div className="flex flex-col items-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-500 transition-all duration-1000 ease-out"
                  strokeDasharray={`${teamAWinPct}, 100`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-white font-mono">{teamAWinPct}%</span>
                <span className="text-[11px] text-blue-300 font-bold uppercase">Win Chance</span>
              </div>
            </div>
            <h4 className="text-base font-bold text-white mt-3 flex items-center gap-1.5">
              <span>{teamA.logo}</span>
              <span>{teamA.name}</span>
            </h4>
          </div>

          <div className="text-center font-black text-slate-600 text-lg uppercase tracking-widest hidden sm:block">
            VS
          </div>

          {/* Team B Wheel */}
          <div className="flex flex-col items-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-cyan-400 transition-all duration-1000 ease-out"
                  strokeDasharray={`${teamBWinPct}, 100`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-white font-mono">{teamBWinPct}%</span>
                <span className="text-[11px] text-cyan-300 font-bold uppercase">Win Chance</span>
              </div>
            </div>
            <h4 className="text-base font-bold text-white mt-3 flex items-center gap-1.5">
              <span>{teamB.logo}</span>
              <span>{teamB.name}</span>
            </h4>
          </div>
        </div>

        {/* Dual Progress Meter Bar */}
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            <div
              className="bg-blue-600 transition-all duration-700"
              style={{ width: `${teamAWinPct}%` }}
            />
            <div
              className="bg-cyan-400 transition-all duration-700"
              style={{ width: `${teamBWinPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>{teamA.shortName}: {teamAWinPct}%</span>
            <span>{teamB.shortName}: {teamBWinPct}%</span>
          </div>
        </div>
      </div>

      {/* KEY FACTORS LIST */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Live Match Key Factors</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Current Score</span>
            <span className="text-lg font-bold text-white font-mono">
              {activeInn.totalRuns}/{activeInn.totalWickets} ({activeInn.oversDisplay} ov)
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Wickets Remaining</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              {wicketsRemaining} in hand
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Balls Remaining</span>
            <span className="text-lg font-bold text-cyan-400 font-mono">
              {ballsRemaining} balls
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Current Run Rate (CRR)</span>
            <span className="text-lg font-bold text-white font-mono">
              {currentRR}
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Required Run Rate (RRR)</span>
            <span className="text-lg font-bold text-amber-400 font-mono">
              {isSecondInnings ? requiredRR : 'N/A (1st Inn)'}
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Projected Finish Total</span>
            <span className="text-lg font-bold text-blue-300 font-mono">
              {projectedFinish}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
