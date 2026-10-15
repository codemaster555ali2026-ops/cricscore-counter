import React, { useState } from 'react';
import { Search, Trophy, TrendingUp, Award, ArrowLeft, Shield, User, Filter, Zap, Target, Star } from 'lucide-react';
import { PlayerCareerStats, MatchPerformanceRecord } from '../types/cricket';
import { StorageService } from '../services/storageService';

interface Props {
  onBack: () => void;
}

export const PlayerStatsScreen: React.FC<Props> = ({ onBack }) => {
  const [stats, setStats] = useState<PlayerCareerStats[]>(() => StorageService.getPlayerCareerStats());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'batting' | 'bowling'>('batting');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerCareerStats | null>(null);

  // Filter and sort players
  const filteredPlayers = stats.filter((p) => {
    const matchesSearch =
      p.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.teamName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'batting') return p.runs > 0 || p.inningsBatted > 0 || p.role === 'Batsman' || p.role === 'Wicketkeeper';
    if (activeTab === 'bowling') return p.wickets > 0 || p.ballsBowled > 0 || p.role === 'Bowler';
    return true;
  });

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (activeTab === 'batting') return b.runs - a.runs;
    if (activeTab === 'bowling') return b.wickets - a.wickets || a.bowlingEconomy - b.bowlingEconomy;
    return b.runs - a.runs;
  });

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <div className="text-right">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 justify-end">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Player Career Statistics</span>
          </h2>
          <p className="text-xs text-slate-400">Aggregated from all completed matches • Hive DB</p>
        </div>
      </div>

      {/* Selected Player Detailed Profile Screen */}
      {selectedPlayer ? (
        <div className="bg-slate-900 border border-blue-900/60 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
          <div className="flex items-start justify-between border-b border-slate-800 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg border-2 border-white/20">
                {selectedPlayer.playerName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-white">{selectedPlayer.playerName}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                    {selectedPlayer.role}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>{selectedPlayer.teamName}</span>
                  <span>•</span>
                  <span>{selectedPlayer.matches} Matches Played</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedPlayer(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            >
              Close Profile
            </button>
          </div>

          {/* Career Totals Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Total Runs</span>
              <span className="text-2xl font-black text-white">{selectedPlayer.runs}</span>
              <span className="text-[11px] text-blue-400 block mt-1">HS: {selectedPlayer.highestScore}{selectedPlayer.highestScoreNotOut ? '*' : ''}</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Batting Avg</span>
              <span className="text-2xl font-black text-cyan-400">{selectedPlayer.battingAverage}</span>
              <span className="text-[11px] text-slate-400 block mt-1">SR: {selectedPlayer.strikeRate}</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">50s / 100s</span>
              <span className="text-2xl font-black text-amber-400">
                {selectedPlayer.fifties} <span className="text-slate-500 text-lg">/</span> {selectedPlayer.centuries}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">4s: {selectedPlayer.fours} | 6s: {selectedPlayer.sixes}</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Wickets / Eco</span>
              <span className="text-2xl font-black text-emerald-400">{selectedPlayer.wickets}</span>
              <span className="text-[11px] text-slate-400 block mt-1">
                Eco: {selectedPlayer.bowlingEconomy} | Best: {selectedPlayer.bestBowlingWickets}/{selectedPlayer.bestBowlingRuns}
              </span>
            </div>
          </div>

          {/* Match-by-Match Breakdown */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Match-by-Match Performance Breakdown</span>
            </h4>

            {selectedPlayer.matchPerformances.length === 0 ? (
              <div className="bg-slate-950/60 p-6 rounded-2xl text-center text-slate-400 text-sm border border-slate-800">
                No completed matches recorded yet for this player.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Date & Match</th>
                      <th className="py-2.5 px-3">Opponent</th>
                      <th className="py-2.5 px-3">Batting</th>
                      <th className="py-2.5 px-3">Bowling Figures</th>
                      <th className="py-2.5 px-3">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {selectedPlayer.matchPerformances.map((perf, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-3 px-3">
                          <span className="font-semibold text-white block">{perf.matchTitle}</span>
                          <span className="text-[11px] text-slate-500">{perf.matchDate} • {perf.venue}</span>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-300">{perf.opponentTeam}</td>
                        <td className="py-3 px-3">
                          {perf.batting ? (
                            <div>
                              <span className="font-bold text-white text-sm">
                                {perf.batting.runs}
                              </span>
                              <span className="text-slate-400 ml-1">({perf.batting.balls}b, {perf.batting.fours}x4, {perf.batting.sixes}x6)</span>
                              <span className="block text-[11px] text-slate-500 italic mt-0.5">
                                {perf.batting.dismissalText || (perf.batting.isOut ? 'out' : 'not out')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500">DNB</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {perf.bowling ? (
                            <div>
                              <span className="font-bold text-emerald-400 text-sm">
                                {perf.bowling.wickets}/{perf.bowling.runsConceded}
                              </span>
                              <span className="text-slate-400 ml-1">({perf.bowling.oversDisplay} ov, Eco {perf.bowling.economy})</span>
                            </div>
                          ) : (
                            <span className="text-slate-500">DNB</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px]">
                          {perf.resultSummary || 'Completed'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Player List & Leaderboards */
        <div className="space-y-4">
          {/* Search & Tabs */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search player or team name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('batting')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'batting'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Batting Stats
              </button>
              <button
                onClick={() => setActiveTab('bowling')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'bowling'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Bowling Stats
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'all'
                    ? 'bg-slate-700 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Players
              </button>
            </div>
          </div>

          {/* Players Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4"># Player & Team</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Mat</th>
                    {activeTab !== 'bowling' && (
                      <>
                        <th className="py-3 px-3">Runs</th>
                        <th className="py-3 px-3">HS</th>
                        <th className="py-3 px-3">Avg</th>
                        <th className="py-3 px-3">SR</th>
                        <th className="py-3 px-3">50 / 100</th>
                      </>
                    )}
                    {activeTab !== 'batting' && (
                      <>
                        <th className="py-3 px-3">Overs</th>
                        <th className="py-3 px-3">Wkts</th>
                        <th className="py-3 px-3">Eco</th>
                        <th className="py-3 px-3">Avg</th>
                        <th className="py-3 px-3">BBI</th>
                      </>
                    )}
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {sortedPlayers.map((player, idx) => (
                    <tr
                      key={player.playerId}
                      onClick={() => setSelectedPlayer(player)}
                      className="hover:bg-blue-900/20 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 flex items-center gap-3">
                        <span className="font-mono text-slate-500 w-5 text-[11px] font-bold">
                          {idx + 1}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center font-bold text-blue-300">
                          {player.playerName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-white group-hover:text-blue-400 transition-colors block text-sm">
                            {player.playerName}
                          </span>
                          <span className="text-[11px] text-slate-400">{player.teamName}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                          {player.role}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-300">{player.matches}</td>

                      {activeTab !== 'bowling' && (
                        <>
                          <td className="py-3 px-3 font-black text-white text-sm">{player.runs}</td>
                          <td className="py-3 px-3 text-slate-300">{player.highestScore}{player.highestScoreNotOut ? '*' : ''}</td>
                          <td className="py-3 px-3 font-semibold text-cyan-400">{player.battingAverage}</td>
                          <td className="py-3 px-3 text-slate-300 font-mono">{player.strikeRate}</td>
                          <td className="py-3 px-3 text-amber-400 font-semibold">{player.fifties} / {player.centuries}</td>
                        </>
                      )}

                      {activeTab !== 'batting' && (
                        <>
                          <td className="py-3 px-3 text-slate-300 font-mono">{player.oversBowledDisplay}</td>
                          <td className="py-3 px-3 font-black text-emerald-400 text-sm">{player.wickets}</td>
                          <td className="py-3 px-3 text-slate-300 font-mono">{player.bowlingEconomy}</td>
                          <td className="py-3 px-3 text-slate-300 font-mono">{player.bowlingAverage}</td>
                          <td className="py-3 px-3 text-slate-400 text-[11px]">
                            {player.bestBowlingWickets > 0 ? `${player.bestBowlingWickets}/${player.bestBowlingRuns}` : '-'}
                          </td>
                        </>
                      )}

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlayer(player);
                          }}
                          className="px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold transition-colors"
                        >
                          View Bio
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
