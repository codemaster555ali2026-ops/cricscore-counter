import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export type CelebrationType = 'six' | 'four' | 'wicket' | 'fifty' | 'hundred' | 'match_won' | null;

interface Props {
  type: CelebrationType;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const CelebrationOverlay: React.FC<Props> = ({ type, onClose, title, subtitle }) => {
  useEffect(() => {
    if (!type) return;

    if (type === 'match_won') {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } else if (type === 'six' || type === 'hundred' || type === 'fifty') {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    const timer = setTimeout(() => {
      onClose();
    }, 2400);

    return () => clearTimeout(timer);
  }, [type, onClose]);

  if (!type) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md cursor-pointer animate-in fade-in duration-200"
    >
      <div className="text-center p-8 max-w-sm mx-auto transform scale-100 transition-all">
        {type === 'six' && (
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-500 flex items-center justify-center text-7xl font-black text-white shadow-2xl shadow-cyan-500/50 animate-bounce border-4 border-white">
              6
            </div>
            <h2 className="text-5xl font-black text-white mt-6 tracking-wider drop-shadow-lg">
              SIX!
            </h2>
            <p className="text-cyan-300 text-lg font-bold mt-2">
              {subtitle || 'HUGE MAXIMUM OVER THE ROPES!'}
            </p>
          </div>
        )}

        {type === 'four' && (
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-6xl font-black text-white shadow-2xl shadow-emerald-500/50 rotate-3 border-4 border-white">
              4
            </div>
            <h2 className="text-5xl font-black text-white mt-6 tracking-wider drop-shadow-lg">
              FOUR!
            </h2>
            <p className="text-emerald-300 text-lg font-bold mt-2">
              {subtitle || 'CRACKING BOUNDARY TO THE FENCE!'}
            </p>
          </div>
        )}

        {type === 'wicket' && (
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-red-500/60 -rotate-3 border-4 border-white animate-pulse">
              ⚡W
            </div>
            <h2 className="text-5xl font-black text-red-400 mt-6 tracking-wider drop-shadow-lg">
              WICKET!
            </h2>
            <p className="text-red-200 text-lg font-bold mt-2">
              {subtitle || 'TIMBER! THE STUMPS ARE RATTLED!'}
            </p>
          </div>
        )}

        {type === 'fifty' && (
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-6xl font-black text-slate-950 shadow-2xl shadow-yellow-500/50 border-4 border-white">
              50
            </div>
            <h2 className="text-4xl font-black text-yellow-400 mt-6 tracking-wide drop-shadow-lg">
              HALF CENTURY!
            </h2>
            <p className="text-amber-200 text-lg font-semibold mt-2">
              {title || 'Magnificent Fifty Milestone!'}
            </p>
          </div>
        )}

        {type === 'hundred' && (
          <div className="flex flex-col items-center">
            <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-amber-300 via-yellow-400 to-orange-500 flex items-center justify-center text-6xl font-black text-slate-950 shadow-2xl shadow-amber-500/70 border-4 border-white">
              100
            </div>
            <h2 className="text-4xl font-black text-yellow-300 mt-6 tracking-wide drop-shadow-lg">
              CENTURY!
            </h2>
            <p className="text-amber-200 text-lg font-semibold mt-2">
              {title || 'Take a Bow! Masterclass 100 Runs!'}
            </p>
          </div>
        )}

        {type === 'match_won' && (
          <div className="flex flex-col items-center">
            <div className="text-7xl mb-2 animate-bounce">🏆</div>
            <h2 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-xl">
              MATCH WON!
            </h2>
            <p className="text-2xl font-bold text-white mt-4">{title}</p>
            <p className="text-blue-300 text-base mt-2">{subtitle}</p>
          </div>
        )}

        <p className="text-slate-400 text-xs mt-8">Tap anywhere to dismiss</p>
      </div>
    </div>
  );
};
