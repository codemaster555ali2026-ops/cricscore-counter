import React from 'react';
import { BarChart3, TrendingUp, Zap, Target, PieChart, Shield } from 'lucide-react';
import { CricketMatch } from '../types/cricket';

interface Props {
  match: CricketMatch;
}

export const Phase6Analytics: React.FC<Props> = ({ match }) => {
  const inn = match.currentInningsIndex === 0 ? match.innings1 : match.innings2 || match.innings1;

  // Compute key stats
  const totalDeliveries = inn.deliveries.length;
  const legalDeliveries = inn.deliveries.filter((d) => d.isLegalDelivery);
  const dotDeliveries = inn.deliveries.filter((d) => d.runsOffBat === 0 && !d.extrasType);
  const fourDeliveries = inn.deliveries.filter((d) => d.runsOffBat === 4);
  const sixDeliveries = inn.deliveries.filter((d) => d.runsOffBat === 6);

  const dotPercent = legalDeliveries.length > 0 ? ((dotDeliveries.length / legalDeliveries.length) * 100).toFixed(1) : '0.0';
  const boundaryRuns = fourDeliveries.length * 4 + sixDeliveries.length * 6;
  const boundaryPercent = inn.totalRuns > 0 ? ((boundaryRuns / inn.totalRuns) * 100).toFixed(1) : '0.0';

  // Phases: Powerplay (overs 0-5), Middle (overs 6-14), Death (overs 15-19)
  const powerplayDeliveries = inn.deliveries.filter((d) => d.overNumber < 6);
  const middleDeliveries = inn.deliveries.filter((d) => d.overNumber >= 6 && d.overNumber < 15);
  const deathDeliveries = inn.deliveries.filter((d) => d.overNumber >= 15);

  const calcPhaseStats = (balls: typeof inn.deliveries) => {
    const runs = balls.reduce((acc, b) => acc + b.runsOffBat + b.extrasRuns, 0);
    const wkts = balls.filter((b) => b.isWicket).length;
    const legalCount = balls.filter((b) => b.isLegalDelivery).length;
    const overs = Math.floor(legalCount / 6) + '.' + (legalCount % 6);
    return { runs, wkts, overs };
  };

  const ppStats = calcPhaseStats(powerplayDeliveries);
  const midStats = calcPhaseStats(middleDeliveries);
  const deathStats = calcPhaseStats(deathDeliveries);

  // Required Run Rate (if chasing)
  let requiredRR: string | null = null;
  if (match.currentInningsIndex === 1 && match.target) {
    const runsNeeded = Math.max(0, match.target - inn.totalRuns);
    const totalBalls = match.settings.totalOvers * 6;
    const ballsBowled = inn.completedOvers * 6 + inn.ballsInCurrentOver;
    const ballsLeft = Math.max(0, totalBalls - ballsBowled);
    const oversLeft = ballsLeft / 6.0;
    requiredRR = oversLeft > 0 ? (runsNeeded / oversLeft).toFixed(2) : '0.00';
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header */}
      <div>
        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold border border-blue-500/30">
          PHASE 6: ADVANCED CRICKET ANALYTICS
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <span>Deep In-Game Match Metrics</span>
        </h2>
        <p className="text-xs text-slate-400">
          {inn.battingTeamName} • Real-time run rates, phase distribution, dot-ball pressure
        </p>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block mb-1">Current Run Rate (CRR)</span>
          <span className="text-2xl font-black text-white font-mono">{inn.currentRunRate.toFixed(2)}</span>
          <span className="text-[11px] text-cyan-400 block mt-1">Runs per over</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block mb-1">Required RR (RRR)</span>
          <span className="text-2xl font-black text-amber-400 font-mono">
            {requiredRR ? requiredRR : 'N/A (1st Inn)'}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">For victory chase</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block mb-1">Dot Ball Pressure</span>
          <span className="text-2xl font-black text-rose-400 font-mono">{dotPercent}%</span>
          <span className="text-[11px] text-slate-400 block mt-1">{dotDeliveries.length} dot balls bowled</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block mb-1">Boundary Contribution</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">{boundaryPercent}%</span>
          <span className="text-[11px] text-slate-400 block mt-1">{fourDeliveries.length}x4s • {sixDeliveries.length}x6s</span>
        </div>
      </div>

      {/* Match Phase Breakdown (Powerplay, Middle, Death) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Match Phase Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Powerplay */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">
              Powerplay (Overs 1-6)
            </span>
            <div className="text-2xl font-black text-white font-mono">
              {ppStats.runs}/{ppStats.wkts}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              {ppStats.overs} Overs Bowled
            </span>
          </div>

          {/* Middle Overs */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">
              Middle Overs (Overs 7-15)
            </span>
            <div className="text-2xl font-black text-white font-mono">
              {midStats.runs}/{midStats.wkts}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              {midStats.overs} Overs Bowled
            </span>
          </div>

          {/* Death Overs */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-1">
              Death Overs (Overs 16-20)
            </span>
            <div className="text-2xl font-black text-white font-mono">
              {deathStats.runs}/{deathStats.wkts}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              {deathStats.overs} Overs Bowled
            </span>
          </div>
        </div>
      </div>

      {/* Current & Highest Partnerships */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Active Partnership</span>
          </h3>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-bold text-white block">
                  {inn.currentPartnership.batter1Name} & {inn.currentPartnership.batter2Name}
                </span>
                <span className="text-xs text-slate-400">
                  {inn.currentPartnership.balls} deliveries faced
                </span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-emerald-400 font-mono">
                  {inn.currentPartnership.runs}
                </span>
                <span className="text-xs text-slate-400 block">runs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fall of Wickets Timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-400" />
            <span>Wickets Timeline Dots</span>
          </h3>

          {inn.fallOfWickets.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No wickets fallen yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-2">
              {inn.fallOfWickets.map((f, i) => (
                <div
                  key={i}
                  className="bg-slate-950 border border-rose-900/50 p-2.5 rounded-xl text-xs flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="font-bold text-white">{f.wicketNumber}-{f.score}</span>
                  <span className="text-[11px] text-slate-400">({f.overs} ov)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
