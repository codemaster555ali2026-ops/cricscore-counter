import React, { useState } from 'react';
import { Cloud, Save, RotateCcw, Trash2, Copy, Filter, CheckCircle2, ShieldCheck } from 'lucide-react';
import { CricketMatch } from '../types/cricket';
import { StorageService } from '../services/storageService';

interface Props {
  matches: CricketMatch[];
  activeMatch: CricketMatch | null;
  onResumeMatch: (match: CricketMatch) => void;
  onRefreshMatches: () => void;
}

export const Phase11AutoSave: React.FC<Props> = ({
  matches,
  activeMatch,
  onResumeMatch,
  onRefreshMatches
}) => {
  const [filter, setFilter] = useState<'all' | 'live' | 'completed'>('all');

  const filteredMatches = matches.filter((m) => {
    if (filter === 'live') return m.status === 'live' || m.status === 'innings_break';
    if (filter === 'completed') return m.status === 'completed';
    return true;
  });

  const handleDelete = (matchId: string) => {
    if (confirm('Are you sure you want to delete this saved match record?')) {
      StorageService.deleteMatch(matchId);
      onRefreshMatches();
    }
  };

  const handleDuplicate = (match: CricketMatch) => {
    const copy: CricketMatch = JSON.parse(JSON.stringify(match));
    copy.id = `match-${Date.now()}`;
    copy.title = `${copy.title} (Duplicate)`;
    copy.createdAt = Date.now();
    copy.updatedAt = Date.now();
    StorageService.saveMatch(copy);
    onRefreshMatches();
    alert('Match duplicated successfully!');
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Auto Saved Status Hero Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-600/40 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-cyan-300">
            <Cloud className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                ACTIVE CLOUD / LOCAL SYNC
              </span>
            </div>
            <h3 className="text-xl font-black text-white mt-0.5">
              Match Auto Saved!
            </h3>
            <p className="text-xs text-slate-300">
              Every delivery and ball score is persisted automatically via Hive & Local DB.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
            <span>100% Persisted</span>
          </span>
        </div>
      </div>

      {/* Filter and Match Manager List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Saved Matches ({matches.length})
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'all' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setFilter('live')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'live' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Unfinished / Live
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'completed' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* List Cards */}
        <div className="space-y-3">
          {filteredMatches.map((m) => (
            <div
              key={m.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg hover:border-blue-900/60 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-cyan-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-800/40">
                    {m.settings.format}
                  </span>
                  <span className="text-slate-400">• {m.settings.matchDate} • {m.settings.venue}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      m.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white">{m.title}</h4>

                <p className="text-xs text-slate-400 font-mono">
                  {m.teamA.shortName}: {m.innings1.totalRuns}/{m.innings1.totalWickets} ({m.innings1.oversDisplay} ov)
                  {m.innings2 && (
                    <> vs {m.teamB.shortName}: {m.innings2.totalRuns}/{m.innings2.totalWickets} ({m.innings2.oversDisplay} ov)</>
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => onResumeMatch(m)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{m.status === 'completed' ? 'View Score' : 'Resume'}</span>
                </button>

                <button
                  onClick={() => handleDuplicate(m)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Duplicate Match"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(m.id)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
                  title="Delete Match"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
