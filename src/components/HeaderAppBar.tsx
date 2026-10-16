import React, { useState } from 'react';
import { Volume2, VolumeX, Moon, Sun, Trophy, ChevronDown, Check, Sparkles, Music, Users, BarChart3 } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface Props {
  currentPhase: number;
  onSelectPhase: (phase: number) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  onOpenPlayerStats?: () => void;
  onOpenTeamManagement?: () => void;
  onTriggerDJCelebration?: () => void;
}

const PHASES = [
  { id: 1, name: 'Setup', title: 'Phase 1: Match Setup' },
  { id: 2, name: 'Toss', title: 'Phase 2: Toss Management' },
  { id: 3, name: 'Live', title: 'Phase 3: Live Scoring Engine' },
  { id: 4, name: 'Comm', title: 'Phase 4: Live Commentary' },
  { id: 5, name: 'Card', title: 'Phase 5: Scorecard & Batting' },
  { id: 6, name: 'Stats', title: 'Phase 6: Advanced Analytics' },
  { id: 7, name: 'Predict', title: 'Phase 7: Score Predictor' },
  { id: 8, name: 'Win %', title: 'Phase 8: Win Probability' },
  { id: 9, name: 'Graphs', title: 'Phase 9: Match Graphs' },
  { id: 10, name: 'Result', title: 'Phase 10: Match Result & Honors' },
  { id: 11, name: 'History', title: 'Phase 11: Auto-Save & Storage' },
  { id: 12, name: 'PDF', title: 'Phase 12: PDF Scorecard' },
  { id: 13, name: 'Share', title: 'Phase 13: Export & Backup' },
  { id: 14, name: 'DJ', title: 'Phase 14: Celebrations & DJ' },
  { id: 15, name: 'Engine', title: 'Phase 15: Flutter & AdMob' },
];

export const HeaderAppBar: React.FC<Props> = ({
  currentPhase,
  onSelectPhase,
  isDarkMode = true,
  onToggleDarkMode,
  soundEnabled = true,
  onToggleSound,
  onOpenPlayerStats,
  onOpenTeamManagement,
  onTriggerDJCelebration,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const activePhaseInfo = PHASES.find((p) => p.id === currentPhase) || PHASES[2];

  // Core tabs visible directly without horizontal scroll
  const primaryTabs = [
    { id: 1, label: 'Home' },
    { id: 3, label: 'Live' },
    { id: 5, label: 'Scorecard' },
    { id: 4, label: 'Commentary' },
    { id: 10, label: 'Result & AI' },
    { id: 7, label: 'Predictor' },
    { id: 14, label: 'DJ Arena' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-emerald-950 text-white shadow-xl border-b border-emerald-800">
      {/* Top Bar matching screenshot */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            onClick={() => onSelectPhase(1)}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/60 ring-2 ring-amber-400/40 cursor-pointer"
          >
            <Trophy className="w-5 h-5 text-emerald-950 fill-emerald-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                onClick={() => onSelectPhase(1)}
                className="font-black text-sm sm:text-base tracking-wide bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-200 bg-clip-text text-transparent cursor-pointer"
              >
                CRICKET SCOREBOARD
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 tracking-wider">
                PRO
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-800/80 text-emerald-300 border border-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Auto-Saved
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/80 font-medium leading-none mt-0.5 hidden xs:block">
              {activePhaseInfo.title}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {onOpenTeamManagement && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenTeamManagement();
              }}
              title="Manage Teams & Rosters"
              className="p-1.5 sm:p-2 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 transition-colors"
            >
              <Users className="w-4 h-4 text-emerald-300" />
            </button>
          )}

          {onOpenPlayerStats && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenPlayerStats();
              }}
              title="Career Player Statistics"
              className="p-1.5 sm:p-2 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-emerald-300" />
            </button>
          )}

          {onTriggerDJCelebration && (
            <button
              onClick={() => {
                sounds.playCelebration();
                onTriggerDJCelebration();
              }}
              title="Stadium DJ Celebration"
              className="px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black text-xs flex items-center gap-1 shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <Music className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">DJ Cheer</span>
            </button>
          )}

          {onToggleSound && (
            <button
              onClick={() => {
                sounds.playClick();
                onToggleSound();
              }}
              title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
              className="p-1.5 sm:p-2 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-300" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>
          )}

          {onToggleDarkMode && (
            <button
              onClick={() => {
                sounds.playClick();
                onToggleDarkMode();
              }}
              title="Toggle Theme"
              className="p-1.5 sm:p-2 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-emerald-300" />}
            </button>
          )}

          {/* Phase Quick Selector Dropdown (Terminates Endless Horizontal Scrolling) */}
          <div className="relative">
            <button
              onClick={() => {
                sounds.playClick();
                setDropdownOpen(!dropdownOpen);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-950" />
              <span className="font-extrabold hidden sm:inline">{activePhaseInfo.name}</span>
              <span className="font-extrabold sm:hidden">P{currentPhase}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-emerald-950/98 backdrop-blur-md border border-emerald-700 rounded-xl shadow-2xl z-50 p-2 text-white animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 border-b border-emerald-800 flex items-center justify-between text-xs font-bold text-amber-300 uppercase tracking-wider">
                    <span>15 Production Phases</span>
                    <span className="text-[10px] text-emerald-400 font-normal">Direct Jump</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto py-1 divide-y divide-emerald-900/60">
                    {PHASES.map((phase) => (
                      <button
                        key={phase.id}
                        onClick={() => {
                          sounds.playClick();
                          onSelectPhase(phase.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                          currentPhase === phase.id
                            ? 'bg-amber-400 text-emerald-950 font-bold shadow-sm'
                            : 'text-emerald-100 hover:bg-emerald-900/80 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{phase.title}</span>
                        {currentPhase === phase.id && <Check className="w-3.5 h-3.5 text-emerald-950 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Non-scrolling quick-nav grid eliminating horizontal scroll fatigue */}
      <div className="bg-emerald-900/90 border-t border-emerald-800/80 px-2 py-1 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-7 w-full gap-1">
          {primaryTabs.map((tab) => {
            const isActive = currentPhase === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  onSelectPhase(tab.id);
                }}
                className={`py-1 px-1 rounded-md text-[11px] font-bold text-center truncate transition-all ${
                  isActive
                    ? 'bg-amber-400 text-emerald-950 shadow-sm scale-100'
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-800/60'
                }`}
                title={tab.label}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
