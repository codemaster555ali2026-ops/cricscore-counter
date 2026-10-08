import React from 'react';
import { Sparkles, Volume2, Smartphone, Award, Flame, Zap } from 'lucide-react';
import { CelebrationType } from './CelebrationOverlay';
import { sounds } from '../services/soundEffects';

interface Props {
  onTriggerCelebration: (type: CelebrationType, title?: string, subtitle?: string) => void;
}

export const Phase14Animations: React.FC<Props> = ({ onTriggerCelebration }) => {
  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header */}
      <div>
        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold border border-blue-500/30">
          PHASE 14: PROFESSIONAL UI & ANIMATION
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Interactive Animation Engine & Sound System</span>
        </h2>
        <p className="text-xs text-slate-400">
          Instant visual fireworks, milestone animations, synthesized Web Audio cricket SFX, and haptic feedback
        </p>
      </div>

      {/* Animation Showcase Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          Trigger In-Game Milestone Animations
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {/* SIX! Animation */}
          <button
            onClick={() => {
              sounds.playMaximumSix();
              onTriggerCelebration('six', '6 SIX!', 'Massive Maximum High Over the Ropes!');
            }}
            className="p-5 rounded-2xl bg-gradient-to-br from-blue-900/40 to-slate-950 border border-blue-600/50 hover:border-cyan-400 text-center space-y-2 transition-all transform hover:scale-105 active:scale-95 group"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-blue-600 flex items-center justify-center text-3xl font-black text-white shadow-lg group-hover:bg-cyan-400 transition-colors">
              6
            </div>
            <h4 className="font-bold text-white text-sm">SIX! Maximum</h4>
            <p className="text-[11px] text-slate-400">With cheer & confetti</p>
          </button>

          {/* FOUR! Animation */}
          <button
            onClick={() => {
              sounds.playBoundaryFour();
              onTriggerCelebration('four', '4 FOUR!', 'Classic Boundary through Extra Cover!');
            }}
            className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900/40 to-slate-950 border border-emerald-600/50 hover:border-emerald-400 text-center space-y-2 transition-all transform hover:scale-105 active:scale-95 group"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-600 flex items-center justify-center text-3xl font-black text-white shadow-lg group-hover:bg-teal-400 transition-colors">
              4
            </div>
            <h4 className="font-bold text-white text-sm">FOUR! Boundary</h4>
            <p className="text-[11px] text-slate-400">Crisp cover drive</p>
          </button>

          {/* WICKET! Animation */}
          <button
            onClick={() => {
              sounds.playWicket();
              onTriggerCelebration('wicket', 'WICKET!', 'Timber! Middle Stump Knocked Back!');
            }}
            className="p-5 rounded-2xl bg-gradient-to-br from-rose-900/40 to-slate-950 border border-rose-600/50 hover:border-rose-400 text-center space-y-2 transition-all transform hover:scale-105 active:scale-95 group"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-600 flex items-center justify-center text-3xl font-black text-white shadow-lg group-hover:bg-red-500 transition-colors">
              ⚡W
            </div>
            <h4 className="font-bold text-white text-sm">WICKET!</h4>
            <p className="text-[11px] text-slate-400">Dramatic crash SFX</p>
          </button>

          {/* FIFTY! Milestone */}
          <button
            onClick={() => {
              sounds.playVictory();
              onTriggerCelebration('fifty', '50 FIFTY!', 'Half Century Milestone Reached!');
            }}
            className="p-5 rounded-2xl bg-gradient-to-br from-amber-900/40 to-slate-950 border border-amber-600/50 hover:border-yellow-400 text-center space-y-2 transition-all transform hover:scale-105 active:scale-95 group"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-2xl font-black shadow-lg">
              50
            </div>
            <h4 className="font-bold text-white text-sm">50 FIFTY!</h4>
            <p className="text-[11px] text-slate-400">Golden badge salute</p>
          </button>

          {/* HUNDRED! Milestone */}
          <button
            onClick={() => {
              sounds.playVictory();
              onTriggerCelebration('hundred', '100 CENTURY!', 'Glorious Ton! Masterclass Inning!');
            }}
            className="p-5 rounded-2xl bg-gradient-to-br from-amber-900/40 to-slate-950 border border-amber-600/50 hover:border-yellow-400 text-center space-y-2 transition-all transform hover:scale-105 active:scale-95 group"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center text-2xl font-black shadow-lg">
              100
            </div>
            <h4 className="font-bold text-white text-sm">100 CENTURY!</h4>
            <p className="text-[11px] text-slate-400">Standing ovation fanfare</p>
          </button>

          {/* MATCH WON! Victory Confetti */}
          <button
            onClick={() => {
              sounds.playVictory();
              onTriggerCelebration('match_won', 'MATCH WON!', 'Trophy celebration and ticker confetti!');
            }}
            className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-slate-950 border border-indigo-600/50 hover:border-indigo-400 text-center space-y-2 transition-all transform hover:scale-105 active:scale-95 group"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl shadow-lg">
              🏆
            </div>
            <h4 className="font-bold text-white text-sm">MATCH WON!</h4>
            <p className="text-[11px] text-slate-400">Continuous confetti</p>
          </button>
        </div>
      </div>

      {/* Sound Board & Vibrator Tests */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <span>Web Audio Synthesized Cricket Sound Effects</span>
        </h3>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => sounds.playClick()}
            className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 text-xs font-semibold text-white transition-colors"
          >
            Button Click (Pop)
          </button>
          <button
            onClick={() => sounds.playBoundaryFour()}
            className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-xs font-semibold text-emerald-300 transition-colors"
          >
            Four Boundary Fanfare
          </button>
          <button
            onClick={() => sounds.playMaximumSix()}
            className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500 text-xs font-semibold text-cyan-300 transition-colors"
          >
            Six Maximum Roar
          </button>
          <button
            onClick={() => sounds.playWicket()}
            className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500 text-xs font-semibold text-rose-300 transition-colors"
          >
            Wicket Timber Crash
          </button>
          <button
            onClick={() => sounds.playVictory()}
            className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-xs font-semibold text-amber-300 transition-colors"
          >
            Victory Fanfare Chime
          </button>
        </div>
      </div>
    </div>
  );
};
