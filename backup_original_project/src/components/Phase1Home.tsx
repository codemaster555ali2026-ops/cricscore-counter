import React, { useState } from 'react';
import { Play, RotateCcw, Clock, Shield, Calendar, MapPin, ChevronRight, Trophy, Users, Folder, FolderOpen, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { CricketMatch } from '../types/cricket';

interface Props {
  matches: CricketMatch[];
  activeMatch: CricketMatch | null;
  onNewMatch: () => void;
  onResumeMatch: (match: CricketMatch) => void;
  onSelectMatch: (match: CricketMatch) => void;
  onOpenPlayerStats: () => void;
  onOpenTeamManagement: () => void;
  onClearHistory?: () => void;
}

export const Phase1Home: React.FC<Props> = ({
  matches,
  activeMatch,
  onNewMatch,
  onResumeMatch,
  onSelectMatch,
  onOpenPlayerStats,
  onOpenTeamManagement,
  onClearHistory
}) => {
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [folderTab, setFolderTab] = useState<'all' | 'live' | 'completed'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const completedMatches = matches.filter((m) => m.status === 'completed');
  const liveMatches = matches.filter((m) => m.status === 'live' || m.status === 'innings_break');

  const displayedMatches =
    folderTab === 'live'
      ? liveMatches
      : folderTab === 'completed'
      ? completedMatches
      : matches;

  const handleConfirmClear = () => {
    if (onClearHistory) {
      onClearHistory();
    }
    setShowClearConfirm(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in pb-16 max-w-4xl mx-auto">
      {/* Hero Welcome Card - Compact & Clean */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 border border-blue-800/40 p-5 sm:p-7 shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold border border-blue-500/30">
              CRICKET SCOREBOARD PRO
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
              v2.0 Clean UI
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Match Dashboard & Scoring
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Complete Match Data • AdMob Capped (~8 Ads/Match) • Foldered History Space
          </p>

          {/* Primary Quick CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 mt-5">
            <button
              onClick={onNewMatch}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start New Match</span>
            </button>

            {activeMatch && (
              <button
                onClick={() => onResumeMatch(activeMatch)}
                className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Resume Live ({activeMatch.teamA.shortName} vs {activeMatch.teamB.shortName})</span>
              </button>
            )}

            <button
              onClick={onOpenTeamManagement}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm flex items-center gap-2 border border-slate-700 transition-colors"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Teams & Rosters</span>
            </button>

            <button
              onClick={onOpenPlayerStats}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm flex items-center gap-2 border border-slate-700 transition-colors"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Player Stats</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-[-30px] top-[-30px] w-48 h-48 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      </div>

      {/* DEDICATED FOLDER SECTION: Stores all teams matches without long screen scroll */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        {/* Folder Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xl shadow-inner">
              {isFolderOpen ? <FolderOpen className="w-6 h-6 text-cyan-400" /> : <Folder className="w-6 h-6 text-blue-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Match History & Teams Folder
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                  {matches.length} Matches
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Matches stored inside this folder space to keep screen compact with no long scrolling.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {matches.length > 0 && onClearHistory && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-semibold rounded-xl border border-rose-500/30 flex items-center gap-1.5 transition-colors"
                title="Clear old history on fresh install"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Old History</span>
              </button>
            )}

            <button
              onClick={() => setIsFolderOpen(!isFolderOpen)}
              className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 hover:text-white text-xs font-bold rounded-xl border border-blue-500/40 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span>{isFolderOpen ? 'Close Folder' : 'Open Folder'}</span>
              <span className="text-sm font-bold">{isFolderOpen ? '▲' : '▼'}</span>
            </button>
          </div>
        </div>

        {/* Delete Old History Confirmation Modal */}
        {showClearConfirm && (
          <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                Purge all saved match records? This creates a completely clean slate for new mobile usage.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold"
              >
                Yes, Delete History
              </button>
            </div>
          </div>
        )}

        {/* FOLDER CONTENTS: Scroll-contained view (Never stretches the whole page) */}
        {isFolderOpen && (
          <div className="space-y-3 pt-3 border-t border-slate-800 animate-in fade-in">
            {/* Folder Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFolderTab('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                  folderTab === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All Matches ({matches.length})
              </button>
              <button
                onClick={() => setFolderTab('live')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                  folderTab === 'live'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Live ({liveMatches.length})
              </button>
              <button
                onClick={() => setFolderTab('completed')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                  folderTab === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Completed ({completedMatches.length})
              </button>
            </div>

            {/* Contained Scroll Container (max-h-72 keeps screen short and neat) */}
            <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1 divide-y divide-slate-800/60">
              {displayedMatches.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/80 flex items-center justify-center text-xl">
                    📁
                  </div>
                  <p className="text-sm font-medium">This folder is currently empty.</p>
                  <p className="text-xs text-slate-500">
                    Old sample history was cleared. New matches you score will be stored here.
                  </p>
                </div>
              ) : (
                displayedMatches.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      if (m.status === 'live' || m.status === 'innings_break') {
                        onResumeMatch(m);
                      } else {
                        onSelectMatch(m);
                      }
                    }}
                    className="p-3 bg-slate-950/60 hover:bg-slate-800/80 rounded-xl cursor-pointer transition-colors border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                        <span className="font-mono text-cyan-300 font-bold bg-blue-950 px-1.5 py-0.5 rounded">
                          {m.settings.format}
                        </span>
                        <span>•</span>
                        <span>{m.settings.venue}</span>
                        {m.status === 'live' ? (
                          <span className="text-rose-400 font-bold ml-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" /> LIVE
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold ml-1">COMPLETED</span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs font-bold text-white">
                        <span>
                          {m.teamA.name}: <span className="text-cyan-300 font-mono">{m.innings1.totalRuns}/{m.innings1.totalWickets}</span> ({m.innings1.oversDisplay} ov)
                        </span>
                        {m.innings2 && (
                          <span>
                            vs {m.teamB.name}: <span className="text-emerald-300 font-mono">{m.innings2.totalRuns}/{m.innings2.totalWickets}</span> ({m.innings2.oversDisplay} ov)
                          </span>
                        )}
                      </div>

                      {m.result?.resultText && (
                        <p className="text-[11px] text-amber-300 font-semibold mt-1">
                          {m.result.resultText}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-blue-400 font-semibold group-hover:text-cyan-300 self-end sm:self-center">
                      <span>{m.status === 'completed' ? 'Scorecard' : 'Resume'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Compact Fixtures Strip */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-slate-300">Upcoming League Tournaments</span>
          <span className="hidden sm:inline text-slate-500">• 1-20 Overs Configurable</span>
        </div>
        <span className="text-cyan-400 font-mono">AdMob Safe Capped (Max 8/Match)</span>
      </div>
    </div>
  );
};
