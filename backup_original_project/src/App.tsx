import React, { useState, useEffect } from 'react';
import { CricketMatch, Team } from './types/cricket';
import { StorageService } from './services/storageService';
import { sounds } from './services/soundEffects';
import { adMobService } from './services/adMobService';

// Components
import { HeaderAppBar } from './components/HeaderAppBar';
import { AdMobBanner } from './components/AdMobBanner';
import { CelebrationOverlay, CelebrationType } from './components/CelebrationOverlay';

// 15 Phases
import { Phase1Home } from './components/Phase1Home';
import { Phase2TeamSetup } from './components/Phase2TeamSetup';
import { Phase3LiveScoring } from './components/Phase3LiveScoring';
import { Phase4Commentary } from './components/Phase4Commentary';
import { Phase5Scorecard } from './components/Phase5Scorecard';
import { Phase6Analytics } from './components/Phase6Analytics';
import { Phase7Predictor } from './components/Phase7Predictor';
import { Phase8WinProbability } from './components/Phase8WinProbability';
import { Phase9Graphs } from './components/Phase9Graphs';
import { Phase10Result } from './components/Phase10Result';
import { Phase11AutoSave } from './components/Phase11AutoSave';
import { Phase12PdfReport } from './components/Phase12PdfReport';
import { Phase13ShareBackup } from './components/Phase13ShareBackup';
import { Phase14Animations } from './components/Phase14Animations';
import { Phase15FlutterEngine } from './components/Phase15FlutterEngine';

// Feature screens
import { PlayerStatsScreen } from './components/PlayerStatsScreen';
import { TeamManagementScreen } from './components/TeamManagementScreen';

export default function App() {
  const [matches, setMatches] = useState<CricketMatch[]>(() => StorageService.getMatches());
  const [teams, setTeams] = useState<Team[]>(() => StorageService.getTeams());
  const [activeMatch, setActiveMatch] = useState<CricketMatch | null>(() => {
    const stored = StorageService.getActiveMatch();
    if (stored) return stored;
    // Default to first match in list
    const all = StorageService.getMatches();
    return all[0] || null;
  });

  const [currentPhase, setCurrentPhase] = useState<number>(1);
  const [isPlayerStatsOpen, setIsPlayerStatsOpen] = useState(false);
  const [isTeamManagementOpen, setIsTeamManagementOpen] = useState(false);

  // Theme & Sound
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Celebrations
  const [celebration, setCelebration] = useState<{
    type: CelebrationType;
    title?: string;
    subtitle?: string;
  }>({ type: null });

  const triggerCelebration = (type: CelebrationType, title?: string, subtitle?: string) => {
    setCelebration({ type, title, subtitle });
  };

  const handleUpdateMatch = (updated: CricketMatch) => {
    setActiveMatch(updated);
    StorageService.saveMatch(updated);
    StorageService.setActiveMatch(updated);
    setMatches(StorageService.getMatches());
  };

  const handleStartNewMatch = (newMatch: CricketMatch) => {
    adMobService.resetMatchAdsCount();
    StorageService.saveMatch(newMatch);
    StorageService.setActiveMatch(newMatch);
    setActiveMatch(newMatch);
    setMatches(StorageService.getMatches());
    setCurrentPhase(3); // Jump right into Phase 3 Live Scoring!

    // AUTOMATIC MATCH START AD
    setTimeout(() => {
      adMobService.showInterstitial({
        trigger: 'match_start',
        title: 'MATCH START • GOOGLE ADMOB',
        subtitle: `${newMatch.teamA.name} vs ${newMatch.teamB.name} • 1st Innings`
      });
    }, 450);
  };

  const handleResumeMatch = (m: CricketMatch) => {
    setActiveMatch(m);
    StorageService.setActiveMatch(m);
    setCurrentPhase(3); // Jump to Live Scoring
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
  };

  const refreshTeamsAndMatches = () => {
    setTeams(StorageService.getTeams());
    setMatches(StorageService.getMatches());
  };

  const handleClearHistory = () => {
    StorageService.clearAllMatches();
    setMatches([]);
    setActiveMatch(null);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-[#0B192C] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Top Header App Bar */}
      <HeaderAppBar
        currentPhase={currentPhase}
        onSelectPhase={(p) => {
          setIsPlayerStatsOpen(false);
          setIsTeamManagementOpen(false);
          setCurrentPhase(p);
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenPlayerStats={() => {
          setIsPlayerStatsOpen(true);
          setIsTeamManagementOpen(false);
        }}
        onOpenTeamManagement={() => {
          setIsTeamManagementOpen(true);
          setIsPlayerStatsOpen(false);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5">
        {/* Dedicated Player Stats Screen */}
        {isPlayerStatsOpen ? (
          <PlayerStatsScreen onBack={() => setIsPlayerStatsOpen(false)} />
        ) : isTeamManagementOpen ? (
          <TeamManagementScreen
            onBack={() => setIsTeamManagementOpen(false)}
            onTeamsUpdated={refreshTeamsAndMatches}
          />
        ) : (
          <>
            {/* 15 PHASES CONTENT ROUTING */}
            {currentPhase === 1 && (
              <Phase1Home
                matches={matches}
                activeMatch={activeMatch}
                onNewMatch={() => setCurrentPhase(2)}
                onResumeMatch={handleResumeMatch}
                onSelectMatch={(m) => {
                  setActiveMatch(m);
                  setCurrentPhase(5); // View Scorecard
                }}
                onOpenPlayerStats={() => setIsPlayerStatsOpen(true)}
                onOpenTeamManagement={() => setIsTeamManagementOpen(true)}
                onClearHistory={handleClearHistory}
              />
            )}

            {currentPhase === 2 && (
              <Phase2TeamSetup
                teams={teams}
                onStartMatch={handleStartNewMatch}
                onCancel={() => setCurrentPhase(1)}
              />
            )}

            {currentPhase === 3 && activeMatch && (
              <Phase3LiveScoring
                match={activeMatch}
                onUpdateMatch={handleUpdateMatch}
                onTriggerCelebration={triggerCelebration}
                onNavigatePhase={(p) => setCurrentPhase(p)}
              />
            )}

            {currentPhase === 4 && activeMatch && (
              <Phase4Commentary match={activeMatch} />
            )}

            {currentPhase === 5 && activeMatch && (
              <Phase5Scorecard match={activeMatch} />
            )}

            {currentPhase === 6 && activeMatch && (
              <Phase6Analytics match={activeMatch} />
            )}

            {currentPhase === 7 && activeMatch && (
              <Phase7Predictor match={activeMatch} />
            )}

            {currentPhase === 8 && activeMatch && (
              <Phase8WinProbability match={activeMatch} />
            )}

            {currentPhase === 9 && activeMatch && (
              <Phase9Graphs match={activeMatch} />
            )}

            {currentPhase === 10 && activeMatch && (
              <Phase10Result
                match={activeMatch}
                onNavigateHome={() => setCurrentPhase(1)}
                onShareSummary={() => setCurrentPhase(13)}
              />
            )}

            {currentPhase === 11 && (
              <Phase11AutoSave
                matches={matches}
                activeMatch={activeMatch}
                onResumeMatch={handleResumeMatch}
                onRefreshMatches={refreshTeamsAndMatches}
              />
            )}

            {currentPhase === 12 && activeMatch && (
              <Phase12PdfReport match={activeMatch} />
            )}

            {currentPhase === 13 && activeMatch && (
              <Phase13ShareBackup
                match={activeMatch}
                onMatchImported={(imported) => {
                  setActiveMatch(imported);
                  refreshTeamsAndMatches();
                  setCurrentPhase(5);
                }}
              />
            )}

            {currentPhase === 14 && (
              <Phase14Animations onTriggerCelebration={triggerCelebration} />
            )}

            {currentPhase === 15 && <Phase15FlutterEngine />}
          </>
        )}
      </main>

      {/* Milestone Celebrations Overlay */}
      <CelebrationOverlay
        type={celebration.type}
        title={celebration.title}
        subtitle={celebration.subtitle}
        onClose={() => setCelebration({ type: null })}
      />

      {/* Google AdMob Banner Simulation at Bottom */}
      <AdMobBanner />
    </div>
  );
}
