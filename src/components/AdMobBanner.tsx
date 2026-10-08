import React, { useState, useEffect } from 'react';
import { X, ExternalLink, ShieldCheck, Sparkles, HelpCircle, Copy, Check, Play, Smartphone, Terminal, Award, Clock } from 'lucide-react';
import { adMobService, AdInterstitialEvent } from '../services/adMobService';

interface Props {
  onAdClicked?: () => void;
}

export const AdMobBanner: React.FC<Props> = () => {
  const [closed, setClosed] = useState(false);
  const [activeInterstitial, setActiveInterstitial] = useState<AdInterstitialEvent | null>(null);
  const [countdown, setCountdown] = useState<number>(3);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [showRewarded, setShowRewarded] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [rewardEarned, setRewardEarned] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Subscribe to automatic ad events
  useEffect(() => {
    return adMobService.subscribe((ad) => {
      setActiveInterstitial(ad);
      if (ad) {
        setCountdown(3);
        setCanSkip(false);
      }
    });
  }, []);

  // Automatic countdown timer for interstitial ad
  useEffect(() => {
    if (!activeInterstitial) return;
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanSkip(true);
    }
  }, [activeInterstitial, countdown]);

  const handleCloseInterstitial = () => {
    adMobService.closeInterstitial();
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (closed) return null;

  return (
    <>
      {/* Mobile/Desktop Simulated Google AdMob Banner */}
      <div className="w-full bg-slate-900/95 border-t border-blue-900/40 px-3 py-2 flex items-center justify-between text-xs text-slate-300 shadow-lg relative z-20">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase border border-amber-500/30">
            Ad
          </span>
          <span className="font-semibold text-white truncate text-xs sm:text-sm">
            Google AdMob Banner (320x50)
          </span>
          <span className="hidden sm:inline-block text-slate-400 text-[11px] font-mono">
            ID: ca-app-pub-3940256099942544/6300978111
          </span>
          <span className="hidden md:inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
            Auto Ads: Start • Over • End ✓
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* How to Run Ads Button */}
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2 py-1 rounded-lg text-[11px] font-bold border border-amber-500/30 transition-colors"
            title="Read complete guide on how to run Google AdMob ads"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">AdMob Setup Guide</span>
          </button>

          {/* Quick test triggers */}
          <button
            onClick={() => adMobService.showInterstitial({ trigger: 'match_start' })}
            className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 px-2 py-1 rounded-lg text-[10px] font-semibold border border-blue-500/30 transition-colors hidden sm:inline-block"
            title="Test Match Start Ad"
          >
            Start Ad
          </button>
          <button
            onClick={() => adMobService.showInterstitial({ trigger: 'over_break' })}
            className="bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 px-2 py-1 rounded-lg text-[10px] font-semibold border border-cyan-500/30 transition-colors hidden sm:inline-block"
            title="Test Over Break Ad"
          >
            Over Ad
          </button>
          <button
            onClick={() => adMobService.showInterstitial({ trigger: 'match_end' })}
            className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 px-2 py-1 rounded-lg text-[10px] font-semibold border border-emerald-500/30 transition-colors hidden sm:inline-block"
            title="Test Match Concluded Ad"
          >
            End Ad
          </button>

          {/* Dismiss button */}
          <button
            onClick={() => setClosed(true)}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
            title="Dismiss test banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Simulated Automated AdMob Interstitial Dialog */}
      {activeInterstitial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-5 shadow-2xl relative animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <span className="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded text-[11px] border border-amber-500/30 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>{activeInterstitial.title}</span>
              </span>

              {canSkip ? (
                <button
                  onClick={handleCloseInterstitial}
                  className="text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-full flex items-center gap-1 text-xs font-bold px-2.5 transition-colors"
                  title="Close Ad"
                >
                  <span>Close</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-1 rounded-full font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>Reward in {countdown}s</span>
                </span>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-900/60 via-slate-950 to-indigo-950 p-6 rounded-2xl border border-blue-800/40 text-center mb-4 shadow-inner">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-3xl shadow-lg">
                {activeInterstitial.creativeIcon}
              </div>
              <h4 className="text-lg font-bold text-white mb-1 tracking-wide">
                {activeInterstitial.creativeName}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeInterstitial.creativeDescription}
              </p>
              <div className="mt-4 pt-3 border-t border-blue-900/40 flex items-center justify-center gap-1.5 text-[11px] text-blue-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google AdMob Test Unit: 1033173712</span>
              </div>
            </div>

            <p className="text-[11px] text-center text-slate-400 mb-3 italic">
              {activeInterstitial.subtitle}
            </p>

            <button
              onClick={handleCloseInterstitial}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 transform active:scale-95"
            >
              <span>{activeInterstitial.ctaText}</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Simulated Rewarded Ad Dialog */}
      {showRewarded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4">
              <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded text-xs border border-emerald-500/30">
                Rewarded Video Ad
              </span>
              <button
                onClick={() => setShowRewarded(false)}
                className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-emerald-900/50 to-slate-950 p-6 rounded-xl border border-emerald-800/40 text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-3xl shadow-lg">
                🏆
              </div>
              <h4 className="text-lg font-bold text-white mb-1">Watch Video to Unlock Pro Analytics</h4>
              <p className="text-xs text-slate-300">
                Full wagon wheel, player worm graph & PDF HD export badge!
              </p>
              {rewardEarned && (
                <div className="mt-3 py-1.5 px-3 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-bold border border-emerald-500/40 flex items-center justify-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>Reward Granted! +100 Credits</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setRewardEarned(true);
                setTimeout(() => setShowRewarded(false), 1200);
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>{rewardEarned ? 'Claimed!' : 'Watch & Claim Reward'}</span>
              <Play className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* HOW TO RUN ADS: Comprehensive Step-by-Step Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xl font-bold">
                  📢
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>How to Run Google AdMob Ads</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                      Step-by-Step
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Complete integration guide for Flutter, Dart, Android & iOS
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
              {/* Quick Simulator Test Section */}
              <div className="bg-gradient-to-r from-blue-950/70 to-slate-950 p-4 rounded-2xl border border-blue-800/40 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-cyan-400" />
                  <span>Test Live Ad Simulators in This App</span>
                </h4>
                <p className="text-slate-300">
                  Try out the ad formats below to see how they behave in the Cricket Scoreboard:
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => {
                      setShowGuideModal(false);
                      adMobService.showInterstitial({ trigger: 'over_break' });
                    }}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Trigger Interstitial (Over End)</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowGuideModal(false);
                      setShowRewarded(true);
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Trigger Rewarded Video Ad</span>
                  </button>
                </div>
              </div>

              {/* Step 1: AdMob Account & App IDs */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    1
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Create Google AdMob Account & Get Ad Unit IDs
                  </h4>
                </div>
                <p className="text-slate-400 pl-8">
                  Visit <strong className="text-cyan-300">admob.google.com</strong>, sign in with your Google account, and create a new App (Android & iOS). You will obtain:
                </p>
                <ul className="list-disc list-inside pl-8 space-y-1 text-slate-300 font-mono">
                  <li><strong>App ID:</strong> ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY</li>
                  <li><strong>Banner Unit ID:</strong> ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ</li>
                  <li><strong>Interstitial Unit ID:</strong> ca-app-pub-XXXXXXXXXXXXXXXX/AAAAAAAAAA</li>
                </ul>
                <div className="bg-amber-950/30 border border-amber-900/50 p-3 rounded-xl ml-8 text-[11px] text-amber-200">
                  ⚠️ <strong>Important:</strong> Always use the Google Test IDs shown below during development to prevent account suspension!
                </div>
              </div>

              {/* Step 2: Add Dependency in pubspec.yaml */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    2
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Add google_mobile_ads to pubspec.yaml
                  </h4>
                </div>
                <div className="ml-8 bg-slate-950 border border-slate-800 rounded-xl p-3 relative group">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'dependencies:\n  flutter:\n    sdk: flutter\n  google_mobile_ads: ^5.1.0',
                        1
                      )
                    }
                    className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  >
                    {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre className="font-mono text-[11px] text-cyan-300 overflow-x-auto">
{`dependencies:
  flutter:
    sdk: flutter
  google_mobile_ads: ^5.1.0`}
                  </pre>
                </div>
              </div>

              {/* Step 3: Configure AndroidManifest.xml */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    3
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Add AdMob App ID in AndroidManifest.xml
                  </h4>
                </div>
                <p className="text-slate-400 pl-8">
                  File: <code className="text-cyan-300">android/app/src/main/AndroidManifest.xml</code> inside the <code className="text-cyan-300">&lt;application&gt;</code> tag:
                </p>
                <div className="ml-8 bg-slate-950 border border-slate-800 rounded-xl p-3 relative group">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        '<meta-data\n    android:name="com.google.android.gms.ads.APPLICATION_ID"\n    android:value="ca-app-pub-3940256099942544~3347511713"/>',
                        2
                      )
                    }
                    className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  >
                    {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre className="font-mono text-[11px] text-cyan-300 overflow-x-auto">
{`<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-3940256099942544~3347511713"/>`}
                  </pre>
                </div>
              </div>

              {/* Step 4: Configure iOS Info.plist */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    4
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Add AdMob App ID in iOS Info.plist
                  </h4>
                </div>
                <p className="text-slate-400 pl-8">
                  File: <code className="text-cyan-300">ios/Runner/Info.plist</code> inside the <code className="text-cyan-300">&lt;dict&gt;</code> tag:
                </p>
                <div className="ml-8 bg-slate-950 border border-slate-800 rounded-xl p-3 relative group">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        '<key>GADApplicationIdentifier</key>\n<string>ca-app-pub-3940256099942544~1458002511</string>',
                        3
                      )
                    }
                    className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  >
                    {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre className="font-mono text-[11px] text-cyan-300 overflow-x-auto">
{`<key>GADApplicationIdentifier</key>
<string>ca-app-pub-3940256099942544~1458002511</string>`}
                  </pre>
                </div>
              </div>

              {/* Step 5: Dart Service & Initialization */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    5
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Initialize & Run Ads in Dart (lib/main.dart)
                  </h4>
                </div>
                <div className="ml-8 bg-slate-950 border border-slate-800 rounded-xl p-3 relative group">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `void main() async {\n  WidgetsFlutterBinding.ensureInitialized();\n  await MobileAds.instance.initialize();\n  runApp(const CricketScoreboardApp());\n}`,
                        4
                      )
                    }
                    className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  >
                    {copiedIndex === 4 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre className="font-mono text-[11px] text-cyan-300 overflow-x-auto">
{`void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await MobileAds.instance.initialize();
  AdMobService.initialize();
  runApp(const CricketScoreboardApp());
}`}
                  </pre>
                </div>
              </div>

              {/* Step 6: Official Google Test IDs */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    6
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Official Google AdMob Test Ad Unit IDs
                  </h4>
                </div>
                <div className="ml-8 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Android Banner:</span>
                    <span className="text-cyan-300">ca-app-pub-3940256099942544/6300978111</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Android Interstitial:</span>
                    <span className="text-cyan-300">ca-app-pub-3940256099942544/1033173712</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Android Rewarded Video:</span>
                    <span className="text-cyan-300">ca-app-pub-3940256099942544/5224354917</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">iOS Banner:</span>
                    <span className="text-cyan-300">ca-app-pub-3940256099942544/2934735716</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                All Dart code is pre-configured in Phase 15 & <code className="text-cyan-300">lib/services/admob_service.dart</code>
              </span>
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
