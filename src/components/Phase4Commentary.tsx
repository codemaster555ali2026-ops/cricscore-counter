import React, { useState } from 'react';
import { MessageSquare, Filter, Clock, Flame, Zap, ShieldAlert } from 'lucide-react';
import { CricketMatch } from '../types/cricket';

interface Props {
  match: CricketMatch;
}

export const Phase4Commentary: React.FC<Props> = ({ match }) => {
  const [filterType, setFilterType] = useState<'all' | 'wickets' | 'boundaries'>('all');
  const currentInnings = match.currentInningsIndex === 0 ? match.innings1 : match.innings2 || match.innings1;

  const deliveries = currentInnings.deliveries || [];

  const filteredDeliveries = deliveries.filter((d) => {
    if (filterType === 'wickets') return d.isWicket;
    if (filterType === 'boundaries') return d.runsOffBat === 4 || d.runsOffBat === 6;
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
              PHASE 4: BALL-BY-BALL COMMENTARY
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <span>Live Over-by-Over Commentary</span>
          </h2>
          <p className="text-xs text-slate-400">
            {currentInnings.battingTeamName} • Total {deliveries.length} deliveries recorded
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Balls
          </button>
          <button
            onClick={() => setFilterType('boundaries')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'boundaries'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Boundaries (4s & 6s)
          </button>
          <button
            onClick={() => setFilterType('wickets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'wickets'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Wickets Only
          </button>
        </div>
      </div>

      {/* Commentary Timeline List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-3">
        {filteredDeliveries.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p>No deliveries recorded matching this filter yet.</p>
          </div>
        ) : (
          filteredDeliveries.map((ball) => {
            const isFour = ball.runsOffBat === 4;
            const isSix = ball.runsOffBat === 6;
            const isWicket = ball.isWicket;

            return (
              <div
                key={ball.ballId}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isWicket
                    ? 'bg-rose-950/30 border-rose-800/60'
                    : isSix
                    ? 'bg-blue-950/30 border-blue-800/60'
                    : isFour
                    ? 'bg-emerald-950/30 border-emerald-800/60'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-950'
                }`}
              >
                {/* Left: Over pill & details */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-sm shrink-0 border ${
                      isWicket
                        ? 'bg-rose-600 text-white border-rose-400'
                        : isSix
                        ? 'bg-blue-600 text-white border-cyan-400'
                        : isFour
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : ball.extrasType
                        ? 'bg-amber-500 text-slate-950 border-amber-300'
                        : 'bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    {ball.overDisplay}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">
                        {ball.bowlerName} to {ball.batterName}
                      </span>
                      {isWicket && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider">
                          WICKET
                        </span>
                      )}
                      {isSix && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider">
                          SIX!
                        </span>
                      )}
                      {isFour && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                          FOUR!
                        </span>
                      )}
                    </div>

                    <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
                      {ball.commentary}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" /> {ball.timestamp}
                      </span>
                      <span>•</span>
                      <span>Score after ball: {ball.scoreAfterBall.runs}/{ball.scoreAfterBall.wickets}</span>
                    </div>
                  </div>
                </div>

                {/* Right outcome badge */}
                <div className="self-end sm:self-center font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 shrink-0">
                  {isWicket
                    ? 'W'
                    : ball.extrasType
                    ? `${ball.extrasType.toUpperCase()} +${ball.extrasRuns}`
                    : `${ball.runsOffBat} RUNS`}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
