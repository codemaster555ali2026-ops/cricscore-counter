import React, { useState } from 'react';
import { Table, Shield, Sparkles, Award } from 'lucide-react';
import { CricketMatch } from '../types/cricket';

interface Props {
  match: CricketMatch;
}

export const Phase5Scorecard: React.FC<Props> = ({ match }) => {
  const [selectedInningsNum, setSelectedInningsNum] = useState<1 | 2>(1);
  const [activeTab, setActiveTab] = useState<'batting' | 'bowling' | 'extras'>('batting');

  const inn = selectedInningsNum === 1 ? match.innings1 : match.innings2 || match.innings1;

  return (
    <div className="space-y-5 animate-in fade-in pb-16">
      {/* Header & Innings Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold border border-blue-500/30">
            PHASE 5: COMPLETE SCORECARD
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Detailed Match Scorecard
          </h2>
        </div>

        {/* Innings 1 vs 2 Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setSelectedInningsNum(1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedInningsNum === 1
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1st Inn ({match.innings1.battingTeamName})
          </button>
          {match.innings2 && (
            <button
              onClick={() => setSelectedInningsNum(2)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedInningsNum === 2
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2nd Inn ({match.innings2.battingTeamName})
            </button>
          )}
        </div>
      </div>

      {/* Innings Summary Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-900/60 p-4 rounded-2xl flex items-center justify-between shadow-lg">
        <div>
          <h3 className="text-base font-black text-white">
            {inn.battingTeamName}
          </h3>
          <p className="text-xs text-slate-400">
            vs {inn.bowlingTeamName} • {match.settings.venue}
          </p>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-white font-mono">
            {inn.totalRuns}/{inn.totalWickets}
          </span>
          <span className="text-xs text-slate-400 ml-1 font-mono">
            ({inn.oversDisplay} ov)
          </span>
          <p className="text-[11px] text-cyan-300 font-mono">
            Run Rate: {inn.currentRunRate.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Scorecard Tabs: Batting, Bowling, Extras */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {(['batting', 'bowling', 'extras'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab === 'batting' ? '🏏 Batting Scorecard' : tab === 'bowling' ? '🎯 Bowling Figures' : '📊 Extras & Totals'}
          </button>
        ))}
      </div>

      {/* Batting Tab Content */}
      {activeTab === 'batting' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4"># Batter</th>
                  <th className="py-3 px-3">Dismissal</th>
                  <th className="py-3 px-3">R</th>
                  <th className="py-3 px-3">B</th>
                  <th className="py-3 px-3">4s</th>
                  <th className="py-3 px-3">6s</th>
                  <th className="py-3 px-4 text-right">SR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {inn.batterStats.map((bat, idx) => (
                  <tr key={bat.playerId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-500">{idx + 1}</span>
                      <span>{bat.name} {!bat.isOut && '*'}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] italic">
                      {bat.dismissalText || (!bat.isOut ? 'not out' : 'out')}
                    </td>
                    <td className="py-3 px-3 font-black text-white font-mono text-sm">{bat.runs}</td>
                    <td className="py-3 px-3 text-slate-300 font-mono">{bat.balls}</td>
                    <td className="py-3 px-3 text-slate-300 font-mono">{bat.fours}</td>
                    <td className="py-3 px-3 text-cyan-400 font-bold font-mono">{bat.sixes}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">{bat.strikeRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Extras Strip in Batting */}
          <div className="bg-slate-950 p-3.5 px-4 text-xs text-slate-400 border-t border-slate-800 flex justify-between items-center">
            <span>
              <strong>Extras:</strong> {inn.extras.total} (b {inn.extras.byes}, lb {inn.extras.legByes}, w {inn.extras.wides}, nb {inn.extras.noBalls})
            </span>
            <span className="font-mono font-bold text-white">
              Total: {inn.totalRuns}/{inn.totalWickets} ({inn.oversDisplay} Overs)
            </span>
          </div>
        </div>
      )}

      {/* Bowling Tab Content */}
      {activeTab === 'bowling' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Bowler</th>
                  <th className="py-3 px-3">O</th>
                  <th className="py-3 px-3">M</th>
                  <th className="py-3 px-3">R</th>
                  <th className="py-3 px-3">W</th>
                  <th className="py-3 px-3">Dots</th>
                  <th className="py-3 px-4 text-right">ECO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {inn.bowlerStats.map((bowl) => (
                  <tr key={bowl.playerId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{bowl.name}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{bowl.overs}.{bowl.ballsInOver}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{bowl.maidens}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{bowl.runsConceded}</td>
                    <td className="py-3 px-3 font-mono font-black text-emerald-400 text-sm">{bowl.wickets}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{bowl.dots}</td>
                    <td className="py-3 px-4 text-right font-mono text-cyan-300 font-bold">{bowl.economy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Extras & Fall of Wickets Tab */}
      {activeTab === 'extras' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Extras Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider text-amber-400">
              Extras Breakdown (Total {inn.extras.total})
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Wide Balls (wd)</span>
                <span className="text-xl font-bold text-white">{inn.extras.wides}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">No Balls (nb)</span>
                <span className="text-xl font-bold text-white">{inn.extras.noBalls}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Byes (b)</span>
                <span className="text-xl font-bold text-white">{inn.extras.byes}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Leg Byes (lb)</span>
                <span className="text-xl font-bold text-white">{inn.extras.legByes}</span>
              </div>
            </div>
          </div>

          {/* Fall of Wickets Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider text-rose-400">
              Fall of Wickets ({inn.fallOfWickets.length})
            </h4>
            {inn.fallOfWickets.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No wickets fallen in this innings yet.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {inn.fallOfWickets.map((f, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800"
                  >
                    <span className="font-bold text-white">
                      {f.wicketNumber}-{f.score}{' '}
                      <span className="text-slate-400 font-normal">({f.playerOutName})</span>
                    </span>
                    <span className="font-mono text-cyan-400">{f.overs} ov</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
