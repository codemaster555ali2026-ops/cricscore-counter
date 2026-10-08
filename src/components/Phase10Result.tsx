import React, { useEffect } from 'react';
import { Trophy, Award, Star, Share2, FileDown, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CricketMatch } from '../types/cricket';
import { generateCricketMatchPDF } from '../services/pdfGenerator';

interface Props {
  match: CricketMatch;
  onNavigateHome: () => void;
  onShareSummary: () => void;
}

export const Phase10Result: React.FC<Props> = ({ match, onNavigateHome, onShareSummary }) => {
  useEffect(() => {
    // Launch festive confetti on load
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  }, []);

  const result = match.result;
  const winnerTeam = result?.winnerTeamId === match.teamA.id
    ? match.teamA
    : result?.winnerTeamId === match.teamB.id
    ? match.teamB
    : null;

  // Determine top performers for Player of the Match if not set
  const allBatters = [
    ...match.innings1.batterStats,
    ...(match.innings2?.batterStats || [])
  ];
  const topBatter = [...allBatters].sort((a, b) => b.runs - a.runs)[0];

  const pomName = result?.playerOfTheMatch?.playerName || topBatter?.name || 'Top Performer';
  const pomPerf = result?.playerOfTheMatch?.performance || (topBatter ? `${topBatter.runs} (${topBatter.balls} balls, ${topBatter.fours}x4, ${topBatter.sixes}x6)` : 'Match Winning Performance');

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Trophy & Winner Headline Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 border border-amber-500/40 p-6 sm:p-10 text-center shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>PHASE 10: OFFICIAL MATCH RESULT</span>
        </div>

        <div className="text-7xl sm:text-8xl my-2 filter drop-shadow-xl animate-bounce">
          🏆
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 tracking-tight">
          {result?.resultText.toUpperCase() || 'MATCH COMPLETED'}
        </h1>

        <p className="text-slate-300 text-sm sm:text-base font-semibold max-w-lg mx-auto">
          {match.title} • {match.settings.venue} • {match.settings.matchDate}
        </p>

        {/* Quick summary scores pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <div className="bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800 text-sm font-mono">
            <span className="text-slate-400 mr-2">{match.teamA.name}:</span>
            <strong className="text-white">
              {match.innings1.totalRuns}/{match.innings1.totalWickets} ({match.innings1.oversDisplay} ov)
            </strong>
          </div>

          {match.innings2 && (
            <div className="bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800 text-sm font-mono">
              <span className="text-slate-400 mr-2">{match.teamB.name}:</span>
              <strong className="text-white">
                {match.innings2.totalRuns}/{match.innings2.totalWickets} ({match.innings2.oversDisplay} ov)
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* PLAYER OF THE MATCH CARD */}
      <div className="bg-slate-900 border border-blue-900/50 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Player of the Match Award
          </h3>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-4xl shadow-lg border-2 border-white/20 shrink-0">
            🏏
          </div>

          <div className="text-center sm:text-left space-y-1 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h4 className="text-2xl font-black text-white">{pomName}</h4>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                POTM
              </span>
            </div>
            <p className="text-sm text-cyan-400 font-semibold">{pomPerf}</p>
            <p className="text-xs text-slate-500">
              Outstanding contribution steering the match victory
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons: PDF, Share, Back to Home */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={() => generateCricketMatchPDF(match)}
          className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center gap-2 transition-all transform hover:scale-105"
        >
          <FileDown className="w-4 h-4" />
          <span>Download PDF Report</span>
        </button>

        <button
          onClick={onShareSummary}
          className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-colors border border-slate-700"
        >
          <Share2 className="w-4 h-4 text-cyan-400" />
          <span>Share Match Summary</span>
        </button>

        <button
          onClick={onNavigateHome}
          className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-colors border border-slate-700"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
};
