import React from 'react';
import { FileText, Download, ShieldCheck, Printer } from 'lucide-react';
import { CricketMatch } from '../types/cricket';
import { generateCricketMatchPDF } from '../services/pdfGenerator';

interface Props {
  match: CricketMatch;
}

export const Phase12PdfReport: React.FC<Props> = ({ match }) => {
  const handleDownload = () => {
    generateCricketMatchPDF(match);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold border border-blue-500/30">
            PHASE 12: PROFESSIONAL PDF REPORT
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Official Cricket Match Scorecard Report</span>
          </h2>
          <p className="text-xs text-slate-400">
            Formatted PDF export ready for printing, archiving, and official league records
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Generate Match Report PDF</span>
        </button>
      </div>

      {/* PDF Document Live Preview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 max-w-3xl mx-auto">
        {/* PDF Header Simulation */}
        <div className="border-b-2 border-blue-600 pb-4 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase">
              CRICKET FEDERATION OFFICIAL SCORECARD
            </span>
            <h3 className="text-xl font-black text-white mt-0.5">{match.title}</h3>
            <p className="text-xs text-slate-400">
              Format: {match.settings.format} • Venue: {match.settings.venue} • Date: {match.settings.matchDate}
            </p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 rounded-xl bg-blue-950 text-cyan-300 text-xs font-bold border border-blue-800/60 inline-block font-mono">
              VERIFIED SCORE
            </span>
          </div>
        </div>

        {/* Toss & Result Summary Box */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1 text-xs">
          <p className="font-bold text-white text-sm">
            {match.result ? match.result.resultText : 'Match in Progress'}
          </p>
          <p className="text-slate-400">
            Toss: {match.toss ? `${match.toss.winnerTeamId === match.teamA.id ? match.teamA.name : match.teamB.name} won and elected to ${match.toss.decision}` : 'Not recorded'}
          </p>
          {match.result?.playerOfTheMatch && (
            <p className="text-amber-300 font-semibold">
              Player of the Match: {match.result.playerOfTheMatch.playerName} ({match.result.playerOfTheMatch.performance})
            </p>
          )}
        </div>

        {/* Innings 1 Summary Preview */}
        <div className="space-y-2">
          <div className="bg-slate-800 px-3 py-1.5 rounded-lg flex justify-between items-center text-xs font-bold text-white">
            <span>1st Innings: {match.innings1.battingTeamName}</span>
            <span className="font-mono text-cyan-300">
              {match.innings1.totalRuns}/{match.innings1.totalWickets} ({match.innings1.oversDisplay} ov)
            </span>
          </div>

          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/80 text-xs space-y-1">
            <div className="grid grid-cols-4 font-bold text-slate-400 border-b border-slate-800 pb-1">
              <span className="col-span-2">Top Batters</span>
              <span>Runs</span>
              <span className="text-right">SR</span>
            </div>
            {match.innings1.batterStats.slice(0, 3).map((b) => (
              <div key={b.playerId} className="grid grid-cols-4 text-slate-300">
                <span className="col-span-2 text-white font-medium">{b.name}</span>
                <span>{b.runs} ({b.balls}b)</span>
                <span className="text-right font-mono">{b.strikeRate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Innings 2 Summary Preview if exists */}
        {match.innings2 && (
          <div className="space-y-2">
            <div className="bg-slate-800 px-3 py-1.5 rounded-lg flex justify-between items-center text-xs font-bold text-white">
              <span>2nd Innings: {match.innings2.battingTeamName}</span>
              <span className="font-mono text-cyan-300">
                {match.innings2.totalRuns}/{match.innings2.totalWickets} ({match.innings2.oversDisplay} ov)
              </span>
            </div>

            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/80 text-xs space-y-1">
              <div className="grid grid-cols-4 font-bold text-slate-400 border-b border-slate-800 pb-1">
                <span className="col-span-2">Top Batters</span>
                <span>Runs</span>
                <span className="text-right">SR</span>
              </div>
              {match.innings2.batterStats.slice(0, 3).map((b) => (
                <div key={b.playerId} className="grid grid-cols-4 text-slate-300">
                  <span className="col-span-2 text-white font-medium">{b.name}</span>
                  <span>{b.runs} ({b.balls}b)</span>
                  <span className="text-right font-mono">{b.strikeRate}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 text-center">
          <button
            onClick={handleDownload}
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Resolution PDF Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
