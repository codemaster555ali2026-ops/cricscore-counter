import React, { useState } from 'react';
import { Share2, Download, Upload, Copy, Check, FileJson, MessageSquare, ShieldCheck } from 'lucide-react';
import { CricketMatch } from '../types/cricket';
import { generateCricketMatchPDF } from '../services/pdfGenerator';
import { StorageService } from '../services/storageService';

interface Props {
  match: CricketMatch;
  onMatchImported: (match: CricketMatch) => void;
}

export const Phase13ShareBackup: React.FC<Props> = ({ match, onMatchImported }) => {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  // Generate WhatsApp / SMS formatted match scorecard text
  const generateShareText = () => {
    let text = `🏏 *${match.title}*\n`;
    text += `📍 ${match.settings.venue} | ${match.settings.format} Match\n\n`;
    text += `*1st Innings: ${match.innings1.battingTeamName}*\n`;
    text += `Score: ${match.innings1.totalRuns}/${match.innings1.totalWickets} (${match.innings1.oversDisplay} ov)\n`;

    const topBat1 = match.innings1.batterStats.slice(0, 2).map((b) => `${b.name} ${b.runs}(${b.balls})`).join(', ');
    if (topBat1) text += `Batting: ${topBat1}\n\n`;

    if (match.innings2) {
      text += `*2nd Innings: ${match.innings2.battingTeamName}*\n`;
      text += `Score: ${match.innings2.totalRuns}/${match.innings2.totalWickets} (${match.innings2.oversDisplay} ov)\n`;
      const topBat2 = match.innings2.batterStats.slice(0, 2).map((b) => `${b.name} ${b.runs}(${b.balls})`).join(', ');
      if (topBat2) text += `Batting: ${topBat2}\n\n`;
    }

    if (match.result) {
      text += `🏆 *Result: ${match.result.resultText}*\n`;
    }
    text += `\n_Generated via Cricket Scoreboard App - 15 Phases_`;
    return text;
  };

  const handleCopySummary = () => {
    const text = generateShareText();
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(match, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${match.title.replace(/\s+/g, '_')}_backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(match, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleImportJson = () => {
    try {
      const parsed: CricketMatch = JSON.parse(jsonInput.trim());
      if (!parsed.id || !parsed.teamA || !parsed.innings1) {
        alert('Invalid Cricket Match JSON format');
        return;
      }
      StorageService.saveMatch(parsed);
      onMatchImported(parsed);
      alert('Match successfully imported and restored!');
    } catch (err) {
      alert('Failed to parse JSON. Please check formatting.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header */}
      <div>
        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold border border-blue-500/30">
          PHASE 13: SHARE & BACKUP
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-cyan-400" />
          <span>Match Sharing, JSON Export & Backup System</span>
        </h2>
        <p className="text-xs text-slate-400">
          Transfer matches between devices, share formatted scorecards to WhatsApp, or download complete JSON archives
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* SHARE SECTION */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>Share Match Scorecard</span>
          </h3>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-line max-h-48 overflow-y-auto">
            {generateShareText()}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleCopySummary}
              className="py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/30"
            >
              {copiedSummary ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSummary ? 'Copied Text!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={() => generateCricketMatchPDF(match)}
              className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Share PDF</span>
            </button>
          </div>
        </div>

        {/* BACKUP & RESTORE SECTION */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileJson className="w-4 h-4 text-amber-400" />
            <span>JSON Backup & Device Transfer</span>
          </h3>

          <p className="text-xs text-slate-400">
            Export complete raw match payload with all deliveries, statistics, and overs for cross-device migration.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportJson}
              className="py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-600/30"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON</span>
            </button>

            <button
              onClick={handleCopyJson}
              className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              {copiedJson ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedJson ? 'Copied JSON!' : 'Copy Raw JSON'}</span>
            </button>
          </div>

          {/* Import JSON Form */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-300 block">Restore Match from JSON</span>
            <textarea
              placeholder="Paste raw cricket match JSON payload here..."
              rows={3}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleImportJson}
              disabled={!jsonInput.trim()}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Upload className="w-4 h-4" />
              <span>Import & Restore Match</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
