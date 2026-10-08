import React from 'react';
import { Volume2, VolumeX, Moon, Sun, Shield, Trophy, Users, FileCode } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface Props {
  currentPhase: number;
  onSelectPhase: (phaseNum: number) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenPlayerStats: () => void;
  onOpenTeamManagement: () => void;
}

const PHASES_LIST = [
  { id: 1, title: 'Phase 1: Home' },
  { id: 2, title: 'Phase 2: Teams & Toss' },
  { id: 3, title: 'Phase 3: Live Scoring' },
  { id: 4, title: 'Phase 4: Commentary' },
  { id: 5, title: 'Phase 5: Scorecard' },
  { id: 6, title: 'Phase 6: Analytics' },
  { id: 7, title: 'Phase 7: Predictor' },
  { id: 8, title: 'Phase 8: Win Prob' },
  { id: 9, title: 'Phase 9: Graphs' },
  { id: 10, title: 'Phase 10: Result' },
  { id: 11, title: 'Phase 11: Auto-Save' },
  { id: 12, title: 'Phase 12: PDF Report' },
  { id: 13, title: 'Phase 13: Share' },
  { id: 14, title: 'Phase 14: Animations' },
  { id: 15, title: 'Phase 15: Flutter Dart' },
];

export const HeaderAppBar: React.FC<Props> = ({
  currentPhase,
  onSelectPhase,
  isDarkMode,
  onToggleDarkMode,
  soundEnabled,
  onToggleSound,
  onOpenPlayerStats,
  onOpenTeamManagement
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-blue-900/40">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-xl shadow-lg border border-cyan-400/40">
            <img src="/app_icon.png" alt="Cricket App Icon" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
            <span className="sr-only">Cricket Scoreboard Icon</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                Cricket Scoreboard App
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                15 PHASES
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden xs:block">
              Complete Data • Smart Features • Professional Experience
            </p>
          </div>
        </div>

        {/* Action Controls: Sound, Theme, Player Stats, Teams */}
        <div className="flex items-center gap-2">
          {/* Player Stats Button */}
          <button
            onClick={onOpenPlayerStats}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-colors"
            title="Player Career Statistics"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Player Stats</span>
          </button>

          {/* Teams Button */}
          <button
            onClick={onOpenTeamManagement}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-colors"
            title="Team & Roster Management"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Teams</span>
          </button>

          {/* Flutter Dart Studio */}
          <button
            onClick={() => onSelectPhase(15)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-md"
            title="Flutter & Dart Source Code Studio"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dart Engine</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title={soundEnabled ? 'Disable Audio Effects' : 'Enable Audio Effects'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Toggle Theme"
          >
            {isDarkMode ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* 15 PHASES HORIZONTAL SCROLLABLE NAV STRIP */}
      <div className="max-w-7xl mx-auto px-4 py-1.5 overflow-x-auto no-scrollbar border-t border-slate-800/60 flex items-center gap-1.5 text-xs">
        {PHASES_LIST.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectPhase(p.id)}
            className={`px-3 py-1 rounded-xl whitespace-nowrap font-bold transition-all text-xs ${
              currentPhase === p.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-cyan-400/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>
    </header>
  );
};
