import React, { useState } from 'react';
import { Download, Copy, Check, FileCode, Folder, ShieldCheck, Terminal, Smartphone, Shield, Lock, Eye, X } from 'lucide-react';
import JSZip from 'jszip';
import { FLUTTER_CODEBASE, FlutterFile } from '../flutter_source/flutterCodebase';

export const Phase15FlutterEngine: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FlutterFile>(FLUTTER_CODEBASE[0]);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();

      // Add each file into the zip
      FLUTTER_CODEBASE.forEach((file) => {
        zip.file(file.path, file.content);
      });

      // Add README and Android Manifest snippet
      zip.file(
        'README.md',
        `# Cricket Scoreboard App - 15 Phases (Flutter & Dart)

Native Cross-Platform Cricket Scoring System with Material 3 Theme, Riverpod, Hive, fl_chart, PDF Generation & Google AdMob.

## How to Run & Build APK:
1. Ensure Flutter 3.x is installed: \`flutter doctor\`
2. Install dependencies: \`flutter pub get\`
3. Run on connected Android / iOS device: \`flutter run\`
4. Build release Android APK:
   \`flutter build apk --release\`
   The APK will be generated at: \`build/app/outputs/flutter-apk/app-release.apk\`

## Google AdMob Configuration:
- Android App ID: ca-app-pub-3940256099942544~3347511713
- Test Banner Unit ID: ca-app-pub-3940256099942544/6300978111
- Test Interstitial Unit ID: ca-app-pub-3940256099942544/1033173712
`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cricket_scoreboard_flutter_project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-600 to-cyan-500 flex-shrink-0 shadow-2xl border-2 border-cyan-400/50">
              <img src="/app_icon.png" alt="Cricket Icon" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30">
                  PHASE 15: COMPLETE DATA ENGINE
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  PURE FLUTTER 3 & DART
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Native Flutter Source Code Engine
              </h2>
              <p className="text-slate-300 text-sm mt-1 max-w-xl">
                100% production-ready Flutter & Dart codebase. Built with Flutter 3.x, Riverpod state management, Hive local storage, fl_chart graphs, PDF reporting, and Google AdMob.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="px-5 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-cyan-300 border border-cyan-500/30 font-bold text-sm shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
            >
              <Shield className="w-5 h-5 text-cyan-400" />
              <span>Privacy Policy</span>
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={downloading}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-blue-600/40 flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span>{downloading ? 'Packing ZIP...' : 'Download Full Project (.ZIP)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Terminal Command Pills */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Build Command:</span>
          <code className="bg-slate-900 px-2 py-1 rounded text-cyan-300 border border-slate-800">
            flutter pub get
          </code>
          <span>&rarr;</span>
          <code className="bg-slate-900 px-2 py-1 rounded text-emerald-300 border border-slate-800">
            flutter build apk --release --android-skip-build-dependency-validation
          </code>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 font-mono text-[11px] border border-cyan-500/30">
            Gradle 8.14 Verified
          </span>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>AdMob & Hive Integrated</span>
        </div>
      </div>

      {/* Code Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Explorer Sidebar */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-3 flex items-center gap-2">
            <Folder className="w-4 h-4 text-blue-400" />
            <span>Flutter Project Tree</span>
          </h3>

          <div className="space-y-1">
            {FLUTTER_CODEBASE.map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between transition-colors ${
                  selectedFile.path === file.path
                    ? 'bg-blue-600 text-white font-bold shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className="w-4 h-4 shrink-0 opacity-80" />
                  <span className="truncate">{file.path}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-slate-300 uppercase">
                  {file.category}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Code View Area */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white">{selectedFile.path}</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-4 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed max-h-[500px]">
            {selectedFile.content}
          </pre>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Privacy Policy</h3>
                  <p className="text-xs text-slate-400">Google Play Store & AdMob Compliance (Phase 15)</p>
                </div>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-200 text-xs">
                <strong>Why Privacy is required in Phase 15:</strong> Google Play Store requires every app with Google AdMob SDK or internet access to include an accessible Privacy Policy link both inside the app and in Google Play Console.
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-1 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  1. Local Data Storage & User Privacy
                </h4>
                <p className="text-xs text-slate-300">
                  Cricket Scoreboard stores all your team names, match records, player statistics, overs, and match history strictly on your local device storage (via Hive / Local Storage). No personal user data is ever uploaded to external databases or sold to third parties.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-1 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  2. Google AdMob Advertising & Analytics
                </h4>
                <p className="text-xs text-slate-300">
                  The application integrates Google Mobile Ads (AdMob) to display Banner and Interstitial advertisements. Google AdMob may collect and process device identifiers, advertising IDs, and diagnostic data to deliver personalized or non-personalized ads in compliance with GDPR, COPPA, and Google Play developer policies.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-1 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  3. Android Permissions
                </h4>
                <p className="text-xs text-slate-300">
                  The app uses minimal device permissions:
                  <br />• <code>INTERNET</code> & <code>ACCESS_NETWORK_STATE</code>: Required exclusively to fetch AdMob banner and interstitial advertisements and check network status.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-1">
                  4. Children's Privacy
                </h4>
                <p className="text-xs text-slate-300">
                  This application does not knowingly collect personally identifiable information from children under 13.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
              >
                Close Privacy Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
