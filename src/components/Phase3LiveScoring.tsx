import React, { useState } from 'react';
import { RotateCcw, ArrowRightLeft, Shield, AlertTriangle, Check, UserPlus, Users, Sparkles } from 'lucide-react';
import { CricketMatch, DismissalType, BallDelivery } from '../types/cricket';
import { sounds } from '../services/soundEffects';
import { generateBallCommentary } from '../services/commentaryEngine';
import { CelebrationType } from './CelebrationOverlay';
import { adMobService } from '../services/adMobService';

interface Props {
  match: CricketMatch;
  onUpdateMatch: (updated: CricketMatch) => void;
  onTriggerCelebration: (type: CelebrationType, title?: string, subtitle?: string) => void;
  onNavigatePhase: (phaseNumber: number) => void;
}

export const Phase3LiveScoring: React.FC<Props> = ({
  match,
  onUpdateMatch,
  onTriggerCelebration,
  onNavigatePhase
}) => {
  const currentInnings = match.currentInningsIndex === 0 ? match.innings1 : match.innings2!;
  const battingTeam = match.teamA.id === currentInnings.battingTeamId ? match.teamA : match.teamB;
  const bowlingTeam = match.teamA.id === currentInnings.bowlingTeamId ? match.teamA : match.teamB;

  // Modals
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [dismissalType, setDismissalType] = useState<DismissalType>('Caught');
  const [fielderName, setFielderName] = useState('');
  const [selectedNewBatterId, setSelectedNewBatterId] = useState('');
  const [selectedNextBowlerId, setSelectedNextBowlerId] = useState('');

  // Batter & Bowler stats
  const striker = currentInnings.batterStats.find((b) => b.playerId === currentInnings.currentStrikerId);
  const nonStriker = currentInnings.batterStats.find((b) => b.playerId === currentInnings.currentNonStrikerId);
  const bowler = currentInnings.bowlerStats.find((b) => b.playerId === currentInnings.currentBowlerId);

  // Remaining eligible batters who haven't batted yet
  const availableBatters = battingTeam.players.filter(
    (p) => !currentInnings.batterStats.some((b) => b.playerId === p.id)
  );

  // Eligible bowlers (cannot be previous bowler in consecutive overs)
  const availableBowlers = bowlingTeam.players.filter(
    (p) => p.id !== currentInnings.currentBowlerId
  );

  // Match Completion & Chase Condition:
  const maxOvers = match.settings.totalOvers;
  const maxWicketsBatting = battingTeam.players.length > 1 ? Math.min(10, battingTeam.players.length - 1) : 10;

  // 1st Innings Finished Check:
  const isInnings1Finished = match.currentInningsIndex === 0 && (
    match.status === 'innings_break' ||
    currentInnings.completedOvers >= maxOvers ||
    currentInnings.totalWickets >= maxWicketsBatting
  );

  // 2nd Innings / Match Finished Check:
  const isTargetChased = match.currentInningsIndex === 1 && !!match.target && currentInnings.totalRuns >= match.target;
  const is2ndInningsOversOrWicketsDone = match.currentInningsIndex === 1 && (
    currentInnings.completedOvers >= maxOvers ||
    currentInnings.totalWickets >= maxWicketsBatting
  );
  const isMatchFinished = match.status === 'completed' || isTargetChased || is2ndInningsOversOrWicketsDone;

  // Core Scoring Engine Function
  const recordDelivery = (params: {
    runsOffBat: number;
    extrasType?: 'wide' | 'no-ball' | 'bye' | 'leg-bye' | 'penalty';
    extrasRuns?: number;
    isWicket?: boolean;
    dismissal?: DismissalType;
    fielder?: string;
    newBatterId?: string;
  }) => {
    // If match is already completed or target already chased, DO NOT continue scoring balls!
    if (isMatchFinished) {
      sounds.playClick();
      onNavigatePhase(10);
      return;
    }
    // If 1st innings is complete, do not allow balls to exceed total overs (like 20.1)!
    if (isInnings1Finished || match.status === 'innings_break' || currentInnings.completedOvers >= maxOvers) {
      sounds.playClick();
      return;
    }

    sounds.playClick();
    const { runsOffBat, extrasType, extrasRuns = 0, isWicket = false, dismissal, fielder, newBatterId } = params;

    const isLegal = extrasType !== 'wide' && extrasType !== 'no-ball';
    const totalBallRuns = runsOffBat + extrasRuns;

    // Clone match and innings
    const updatedMatch: CricketMatch = JSON.parse(JSON.stringify(match));
    const inn = updatedMatch.currentInningsIndex === 0 ? updatedMatch.innings1 : updatedMatch.innings2!;

    // 1. Update Totals
    inn.totalRuns += totalBallRuns;

    // 2. Extras
    if (extrasType === 'wide') inn.extras.wides += extrasRuns;
    else if (extrasType === 'no-ball') inn.extras.noBalls += extrasRuns;
    else if (extrasType === 'bye') inn.extras.byes += extrasRuns;
    else if (extrasType === 'leg-bye') inn.extras.legByes += extrasRuns;
    else if (extrasType === 'penalty') inn.extras.penalty += extrasRuns;
    inn.extras.total =
      inn.extras.wides + inn.extras.noBalls + inn.extras.byes + inn.extras.legByes + inn.extras.penalty;

    // 3. Batters Update
    const currentBat = inn.batterStats.find((b) => b.playerId === inn.currentStrikerId);
    if (currentBat) {
      currentBat.runs += runsOffBat;
      if (extrasType !== 'wide') {
        currentBat.balls += 1;
      }
      if (runsOffBat === 4) currentBat.fours += 1;
      if (runsOffBat === 6) currentBat.sixes += 1;
      currentBat.strikeRate = currentBat.balls > 0 ? Number(((currentBat.runs / currentBat.balls) * 100).toFixed(1)) : 0;

      // Milestone celebrations
      if (currentBat.runs >= 100 && currentBat.runs - runsOffBat < 100) {
        onTriggerCelebration('hundred', `${currentBat.name} 100* Runs!`, 'Centurion! A classic masterpiece inning!');
      } else if (currentBat.runs >= 50 && currentBat.runs - runsOffBat < 50) {
        onTriggerCelebration('fifty', `${currentBat.name} 50* Runs!`, 'Well played half-century milestone!');
      }
    }

    // 4. Bowler Update
    const currentBowl = inn.bowlerStats.find((b) => b.playerId === inn.currentBowlerId);
    if (currentBowl) {
      if (extrasType !== 'bye' && extrasType !== 'leg-bye') {
        currentBowl.runsConceded += totalBallRuns;
      }
      if (extrasType === 'wide') currentBowl.wides += 1;
      if (extrasType === 'no-ball') currentBowl.noBalls += 1;
      if (isLegal) {
        currentBowl.ballsInOver += 1;
        if (runsOffBat === 0 && !extrasType) {
          currentBowl.dots += 1;
        }
      }
      if (isWicket && dismissal !== 'Run Out') {
        currentBowl.wickets += 1;
      }
      const totalBowlerOvers = currentBowl.overs + currentBowl.ballsInOver / 6;
      currentBowl.economy = totalBowlerOvers > 0 ? Number((currentBowl.runsConceded / totalBowlerOvers).toFixed(2)) : 0;
    }

    // 5. Overs Count
    let overCompleted = false;
    if (isLegal) {
      inn.ballsInCurrentOver += 1;
      if (inn.ballsInCurrentOver === 6) {
        inn.completedOvers += 1;
        inn.ballsInCurrentOver = 0;
        overCompleted = true;
        if (currentBowl) {
          currentBowl.overs += 1;
          currentBowl.ballsInOver = 0;
        }
      }
    }
    inn.oversDisplay = `${inn.completedOvers}.${inn.ballsInCurrentOver}`;
    const totalDecimalOvers = inn.completedOvers + inn.ballsInCurrentOver / 6;
    inn.currentRunRate = totalDecimalOvers > 0 ? Number((inn.totalRuns / totalDecimalOvers).toFixed(2)) : 0;

    // 6. Wicket Handling
    if (isWicket) {
      inn.totalWickets += 1;
      if (currentBat) {
        currentBat.isOut = true;
        currentBat.dismissalType = dismissal;
        currentBat.dismissalText = `${dismissal} ${fielder ? 'c ' + fielder : ''} b ${currentBowl?.name || ''}`;
      }
      inn.fallOfWickets.push({
        wicketNumber: inn.totalWickets,
        score: inn.totalRuns,
        overs: inn.oversDisplay,
        playerOutName: currentBat?.name || 'Batsman'
      });

      // Insert new batter
      if (newBatterId) {
        const nextPlayer = battingTeam.players.find((p) => p.id === newBatterId);
        if (nextPlayer) {
          inn.batterStats.push({
            playerId: nextPlayer.id,
            name: nextPlayer.name,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isOut: false
          });
          inn.currentStrikerId = nextPlayer.id;
        }
      }

      sounds.playWicket();
      onTriggerCelebration('wicket', 'OUT! WICKET FALLS!', `${currentBat?.name || 'Batsman'} departs!`);
    } else {
      // Boundaries sound / celebration
      if (runsOffBat === 6) {
        sounds.playMaximumSix();
        onTriggerCelebration('six', 'MAXIMUM! 6 RUNS!', 'Dispatched into the stands!');
      } else if (runsOffBat === 4) {
        sounds.playBoundaryFour();
        onTriggerCelebration('four', 'FOUR BOUNDARY!', 'Timed to absolute perfection!');
      }
    }

    // 7. Partnership
    inn.currentPartnership.runs += totalBallRuns;
    if (isLegal) inn.currentPartnership.balls += 1;

    // 8. Commentary Log
    const commentaryText = generateBallCommentary({
      runsOffBat,
      extrasType,
      extrasRuns,
      isWicket,
      dismissalType: dismissal,
      batterName: currentBat?.name || 'Batter',
      bowlerName: currentBowl?.name || 'Bowler',
      fielderName: fielder
    });

    const ballRecord: BallDelivery = {
      ballId: `ball-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      overNumber: inn.completedOvers,
      ballInOver: inn.ballsInCurrentOver,
      overDisplay: inn.oversDisplay,
      batterId: currentBat?.playerId || '',
      batterName: currentBat?.name || '',
      bowlerId: currentBowl?.playerId || '',
      bowlerName: currentBowl?.name || '',
      runsOffBat,
      extrasType,
      extrasRuns,
      isLegalDelivery: isLegal,
      isWicket,
      dismissalType: dismissal,
      playerOutName: isWicket ? currentBat?.name : undefined,
      fielderName: fielder,
      commentary: commentaryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      scoreAfterBall: {
        runs: inn.totalRuns,
        wickets: inn.totalWickets,
        overs: inn.oversDisplay
      }
    };
    inn.deliveries.unshift(ballRecord);

    // 9. Strike Rotation
    // In cricket, strike rotates on odd runs (1, 3, 5). If over completes, strike also rotates.
    if (!isWicket) {
      if (runsOffBat % 2 === 1 || (extrasType && totalBallRuns % 2 === 1)) {
        const temp = inn.currentStrikerId;
        inn.currentStrikerId = inn.currentNonStrikerId;
        inn.currentNonStrikerId = temp;
      }
    }
    if (overCompleted) {
      const temp = inn.currentStrikerId;
      inn.currentStrikerId = inn.currentNonStrikerId;
      inn.currentNonStrikerId = temp;

      // STRICT CHECK: ONLY show next bowler modal if innings is NOT finished!
      const isOverLimitReached = inn.completedOvers >= updatedMatch.settings.totalOvers;
      const isAllOut = inn.totalWickets >= maxWicketsBatting;
      if (!isOverLimitReached && !isAllOut && updatedMatch.status === 'live') {
        setShowBowlerModal(true);

        // SMART AD CAP: Not every over! Only milestone overs up to max 8 ads in the complete match!
        const totalOvs = updatedMatch.settings.totalOvers;
        const isMilestoneOver =
          totalOvs >= 10
            ? inn.completedOvers === Math.round(totalOvs * 0.25) ||
              inn.completedOvers === Math.round(totalOvs * 0.55) ||
              inn.completedOvers === Math.round(totalOvs * 0.8)
            : inn.completedOvers === Math.round(totalOvs / 2);

        if (isMilestoneOver && adMobService.matchAdsShown < 8) {
          setTimeout(() => {
            adMobService.showInterstitial({
              trigger: 'over_break',
              title: `MILESTONE OVER ${inn.completedOvers} • ADMOB`,
              subtitle: `${inn.battingTeamName}: ${inn.totalRuns}/${inn.totalWickets} (${inn.oversDisplay} ov)`
            });
          }, 500);
        }
      }
    }

    // 10. Check Target or Match Completion
    if (updatedMatch.currentInningsIndex === 1 && updatedMatch.target) {
      if (inn.totalRuns >= updatedMatch.target) {
        // Target chased successfully! Match immediately finishes!
        inn.isCompleted = true;
        updatedMatch.status = 'completed';
        const wicketsLeft = Math.max(1, maxWicketsBatting - inn.totalWickets);
        const totalBallsInMatch = updatedMatch.settings.totalOvers * 6;
        const ballsBowled = inn.completedOvers * 6 + inn.ballsInCurrentOver;
        const ballsRemaining = Math.max(0, totalBallsInMatch - ballsBowled);

        updatedMatch.result = {
          winnerTeamId: inn.battingTeamId,
          resultText: `${inn.battingTeamName} won by ${wicketsLeft} wicket${wicketsLeft === 1 ? '' : 's'}${ballsRemaining > 0 ? ` (${ballsRemaining} balls rem)` : ''}`,
          marginText: `${wicketsLeft} wicket${wicketsLeft === 1 ? '' : 's'}`
        };
        sounds.playVictory();
        onTriggerCelebration('match_won', `${inn.battingTeamName.toUpperCase()} WON!`, `Target of ${updatedMatch.target} reached! Won by ${wicketsLeft} wickets!`);

        // AUTOMATIC AD AT MATCH END (TARGET CHASED)
        setTimeout(() => {
          adMobService.showInterstitial({
            trigger: 'match_end',
            title: '🏆 MATCH CONCLUDED • GOOGLE ADMOB',
            subtitle: updatedMatch.result?.resultText || 'Match Won!'
          });
        }, 600);
      } else if (
        inn.totalWickets >= maxWicketsBatting ||
        inn.completedOvers >= updatedMatch.settings.totalOvers
      ) {
        // Bowling team won or Tie
        inn.isCompleted = true;
        updatedMatch.status = 'completed';
        if (inn.totalRuns === updatedMatch.target - 1) {
          updatedMatch.result = {
            winnerTeamId: '',
            resultText: `Match Tied! Both teams scored ${inn.totalRuns} runs`,
            marginText: 'Match Tied'
          };
          sounds.playVictory();
          onTriggerCelebration('match_won', 'MATCH TIED!', `Scores level at ${inn.totalRuns}!`);
        } else {
          const runsDefended = updatedMatch.target - 1 - inn.totalRuns;
          updatedMatch.result = {
            winnerTeamId: inn.bowlingTeamId,
            resultText: `${inn.bowlingTeamName} won by ${runsDefended} run${runsDefended === 1 ? '' : 's'}`,
            marginText: `${runsDefended} runs`
          };
          sounds.playVictory();
          onTriggerCelebration('match_won', `${inn.bowlingTeamName.toUpperCase()} WON!`, `Defended total! Won by ${runsDefended} runs!`);
        }

        // AUTOMATIC AD AT MATCH END
        setTimeout(() => {
          adMobService.showInterstitial({
            trigger: 'match_end',
            title: '🏆 MATCH CONCLUDED • GOOGLE ADMOB',
            subtitle: updatedMatch.result?.resultText || 'Match Concluded!'
          });
        }, 600);
      }
    } else if (updatedMatch.currentInningsIndex === 0) {
      if (
        inn.totalWickets >= maxWicketsBatting ||
        inn.completedOvers >= updatedMatch.settings.totalOvers
      ) {
        inn.isCompleted = true;
        updatedMatch.status = 'innings_break';
        updatedMatch.target = inn.totalRuns + 1;

        // AUTOMATIC AD DURING MATCH: INNINGS BREAK
        setTimeout(() => {
          adMobService.showInterstitial({
            trigger: 'innings_break',
            title: 'INNINGS BREAK • GOOGLE ADMOB',
            subtitle: `Target for ${match.teamA.id === inn.battingTeamId ? match.teamB.name : match.teamA.name}: ${updatedMatch.target} Runs`
          });
        }, 500);
      }
    }

    updatedMatch.updatedAt = Date.now();
    onUpdateMatch(updatedMatch);
  };

  const handleManualStrikeSwap = () => {
    sounds.playClick();
    const updatedMatch: CricketMatch = JSON.parse(JSON.stringify(match));
    const inn = updatedMatch.currentInningsIndex === 0 ? updatedMatch.innings1 : updatedMatch.innings2!;
    const temp = inn.currentStrikerId;
    inn.currentStrikerId = inn.currentNonStrikerId;
    inn.currentNonStrikerId = temp;
    onUpdateMatch(updatedMatch);
  };

  const handleUndoBall = () => {
    if (currentInnings.deliveries.length === 0) return;
    sounds.playClick();
    const updatedMatch: CricketMatch = JSON.parse(JSON.stringify(match));
    const inn = updatedMatch.currentInningsIndex === 0 ? updatedMatch.innings1 : updatedMatch.innings2!;
    inn.deliveries.shift(); // remove last ball

    // Recompute deliveries from remaining list or rollback state
    if (inn.deliveries.length > 0) {
      const last = inn.deliveries[0];
      inn.totalRuns = last.scoreAfterBall.runs;
      inn.totalWickets = last.scoreAfterBall.wickets;
      inn.oversDisplay = last.scoreAfterBall.overs;
      const parts = last.scoreAfterBall.overs.split('.');
      inn.completedOvers = parseInt(parts[0]);
      inn.ballsInCurrentOver = parseInt(parts[1] || '0');
    } else {
      inn.totalRuns = 0;
      inn.totalWickets = 0;
      inn.completedOvers = 0;
      inn.ballsInCurrentOver = 0;
      inn.oversDisplay = '0.0';
    }
    onUpdateMatch(updatedMatch);
  };

  const handleConfirmWicket = () => {
    if (!selectedNewBatterId && availableBatters.length > 0) {
      alert('Please select the incoming batsman.');
      return;
    }
    recordDelivery({
      runsOffBat: 0,
      isWicket: true,
      dismissal: dismissalType,
      fielder: fielderName.trim() || undefined,
      newBatterId: selectedNewBatterId || undefined
    });
    setShowWicketModal(false);
    setSelectedNewBatterId('');
    setFielderName('');
  };

  const handleSelectNextBowler = () => {
    if (!selectedNextBowlerId) return;
    sounds.playClick();
    const updatedMatch: CricketMatch = JSON.parse(JSON.stringify(match));
    const inn = updatedMatch.currentInningsIndex === 0 ? updatedMatch.innings1 : updatedMatch.innings2!;

    // Check if bowler stats exists or add new
    let bowlerStat = inn.bowlerStats.find((b) => b.playerId === selectedNextBowlerId);
    if (!bowlerStat) {
      const p = bowlingTeam.players.find((x) => x.id === selectedNextBowlerId);
      if (p) {
        inn.bowlerStats.push({
          playerId: p.id,
          name: p.name,
          overs: 0,
          ballsInOver: 0,
          maidens: 0,
          runsConceded: 0,
          wickets: 0,
          economy: 0,
          wides: 0,
          noBalls: 0,
          dots: 0
        });
      }
    }
    inn.previousBowlerId = inn.currentBowlerId;
    inn.currentBowlerId = selectedNextBowlerId;
    onUpdateMatch(updatedMatch);
    setShowBowlerModal(false);
  };

  const startSecondInnings = () => {
    const updatedMatch: CricketMatch = JSON.parse(JSON.stringify(match));
    const teamToBat = match.teamA.id === updatedMatch.innings1.battingTeamId ? match.teamB : match.teamA;
    const teamToBowl = match.teamA.id === updatedMatch.innings1.battingTeamId ? match.teamA : match.teamB;

    const strikerP = teamToBat.players[0] || { id: 'p-bat-1', name: 'Opening Batsman 1', role: 'Batsman' };
    const nonStrikerP = teamToBat.players[1] || { id: 'p-bat-2', name: 'Opening Batsman 2', role: 'Batsman' };
    const bowlerP = teamToBowl.players[teamToBowl.players.length - 1] || teamToBowl.players[0] || { id: 'p-bowl-1', name: 'Opening Bowler', role: 'Bowler' };

    updatedMatch.currentInningsIndex = 1;
    updatedMatch.status = 'live';
    updatedMatch.target = updatedMatch.innings1.totalRuns + 1;
    updatedMatch.innings2 = {
      inningsNumber: 2,
      battingTeamId: teamToBat.id,
      battingTeamName: teamToBat.name,
      bowlingTeamId: teamToBowl.id,
      bowlingTeamName: teamToBowl.name,
      totalRuns: 0,
      totalWickets: 0,
      completedOvers: 0,
      ballsInCurrentOver: 0,
      oversDisplay: '0.0',
      currentRunRate: 0,
      extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0, total: 0 },
      batterStats: [
        { playerId: strikerP.id, name: strikerP.name, runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false },
        { playerId: nonStrikerP.id, name: nonStrikerP.name, runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false }
      ],
      bowlerStats: [
        { playerId: bowlerP.id, name: bowlerP.name, overs: 0, ballsInOver: 0, maidens: 0, runsConceded: 0, wickets: 0, economy: 0, wides: 0, noBalls: 0, dots: 0 }
      ],
      currentStrikerId: strikerP.id,
      currentNonStrikerId: nonStrikerP.id,
      currentBowlerId: bowlerP.id,
      deliveries: [],
      fallOfWickets: [],
      partnerships: [],
      currentPartnership: { batter1Name: strikerP.name, batter2Name: nonStrikerP.name, runs: 0, balls: 0 },
      isCompleted: false
    };

    onUpdateMatch(updatedMatch);

    // AUTOMATIC AD: 2ND INNINGS START
    setTimeout(() => {
      adMobService.showInterstitial({
        trigger: 'match_start',
        title: 'RUN CHASE START • GOOGLE ADMOB',
        subtitle: `Target: ${updatedMatch.target} Runs in ${updatedMatch.settings.totalOvers} Overs`
      });
    }, 450);
  };

  return (
    <div className="space-y-5 animate-in fade-in pb-16">
      {/* Innings Break Notification if Innings 1 is Complete */}
      {match.status === 'innings_break' && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-5 rounded-3xl shadow-2xl text-center space-y-3 border-2 border-white/20 animate-pulse">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-200">
            INNINGS BREAK
          </span>
          <h3 className="text-2xl font-black text-white">
            1st Innings Concluded: {currentInnings.battingTeamName} scored {currentInnings.totalRuns}/{currentInnings.totalWickets} ({currentInnings.oversDisplay} ov)
          </h3>
          <p className="text-amber-100 font-bold text-sm">
            Target for {match.teamA.id === currentInnings.battingTeamId ? match.teamB.name : match.teamA.name}: {match.target} Runs in {match.settings.totalOvers} Overs
          </p>
          <button
            onClick={startSecondInnings}
            className="px-6 py-2.5 bg-white text-slate-950 font-black rounded-2xl shadow-lg hover:bg-amber-100 transition-all text-sm"
          >
            Start 2nd Innings (Run Chase) &rarr;
          </button>
        </div>
      )}

      {/* Main Live Scoreboard Hero Card */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border border-blue-900/60 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Match Header Info */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-cyan-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800/50">
              {currentInnings.inningsNumber === 1 ? '1st INNINGS' : '2nd INNINGS (CHASE)'}
            </span>
            <span className="hidden xs:inline">•</span>
            <span className="hidden xs:inline font-medium">{match.settings.venue}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-mono">
              CRR: <strong className="text-white font-bold">{currentInnings.currentRunRate.toFixed(2)}</strong>
            </span>
            {match.target && (
              <span className="text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Target: {match.target}
              </span>
            )}
          </div>
        </div>

        {/* Big Score Display */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{battingTeam.logo}</span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                {currentInnings.battingTeamName}
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              vs {bowlingTeam.logo} {currentInnings.bowlingTeamName}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="flex items-baseline gap-2 sm:justify-end">
              <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 font-mono tracking-tight">
                {currentInnings.totalRuns}/{currentInnings.totalWickets}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-slate-400 font-mono">
                ({currentInnings.oversDisplay} / {match.settings.totalOvers} ov)
              </span>
            </div>

            {match.target && (
              <p className="text-xs text-amber-300 font-semibold mt-1">
                Need {Math.max(0, match.target - currentInnings.totalRuns)} runs in{' '}
                {match.settings.totalOvers * 6 - (currentInnings.completedOvers * 6 + currentInnings.ballsInCurrentOver)} balls
              </p>
            )}
          </div>
        </div>

        {/* Live Batters & Bowler Mini Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          {/* Batters */}
          <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800/50 pb-1">
              <span>Batter</span>
              <span>R (B) • 4s • 6s • SR</span>
            </div>

            {striker && (
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-white flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="truncate">{striker.name} *</span>
                </span>
                <span className="text-cyan-300 font-bold">
                  {striker.runs} ({striker.balls}) • {striker.fours} • {striker.sixes} • {striker.strikeRate}
                </span>
              </div>
            )}

            {nonStriker && (
              <div className="flex justify-between items-center text-xs font-mono text-slate-300">
                <span className="truncate">{nonStriker.name}</span>
                <span className="text-slate-400">
                  {nonStriker.runs} ({nonStriker.balls}) • {nonStriker.fours} • {nonStriker.sixes} • {nonStriker.strikeRate}
                </span>
              </div>
            )}
          </div>

          {/* Bowler */}
          <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800/50 pb-1">
              <span>Bowler</span>
              <span>O • M • R • W • ECO</span>
            </div>

            {bowler ? (
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-white truncate flex items-center gap-1">
                  <span>🎯</span>
                  <span className="truncate">{bowler.name}</span>
                </span>
                <span className="text-emerald-400 font-bold">
                  {bowler.overs}.{bowler.ballsInOver} • {bowler.maidens} • {bowler.runsConceded} • {bowler.wickets} • {bowler.economy}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-500">No active bowler assigned</span>
            )}

            {/* Quick Strike Rotation CTA */}
            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span className="text-slate-400">
                Partnership: <strong className="text-white">{currentInnings.currentPartnership.runs}</strong> ({currentInnings.currentPartnership.balls}b)
              </span>
              <button
                onClick={handleManualStrikeSwap}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                title="Swap Strike"
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>Swap Strike</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Deliveries Bubble Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center gap-2 overflow-x-auto shadow-inner">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap pl-1">
          Recent Balls:
        </span>
        {currentInnings.deliveries.length === 0 ? (
          <span className="text-xs text-slate-500 italic">Deliveries will appear here...</span>
        ) : (
          currentInnings.deliveries.slice(0, 8).map((d) => (
            <span
              key={d.ballId}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-md ${
                d.isWicket
                  ? 'bg-rose-600 text-white animate-pulse'
                  : d.runsOffBat === 6
                  ? 'bg-blue-600 text-white'
                  : d.runsOffBat === 4
                  ? 'bg-emerald-600 text-white'
                  : d.extrasType
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-200'
              }`}
            >
              {d.isWicket ? 'W' : d.extrasType ? `${d.extrasType === 'wide' ? 'Wd' : 'Nb'}${d.runsOffBat ? '+' + d.runsOffBat : ''}` : d.runsOffBat}
            </span>
          ))
        )}
      </div>

      {/* MATCH CONCLUDED CARD OR SCORING CONTROLS */}
      {isMatchFinished ? (
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-blue-950 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-center animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-3xl shadow-lg">
            🏆
          </div>
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/90 px-3 py-1 rounded-full border border-emerald-500/40">
              MATCH CONCLUDED • TARGET CHASED
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {match.result?.resultText || `${battingTeam.name} WON THE MATCH!`}
            </h3>
            <p className="text-sm text-slate-300">
              {match.innings1.battingTeamName}: <strong className="text-white">{match.innings1.totalRuns}/{match.innings1.totalWickets}</strong> ({match.innings1.oversDisplay} ov) &bull; {currentInnings.battingTeamName}: <strong className="text-emerald-300">{currentInnings.totalRuns}/{currentInnings.totalWickets}</strong> ({currentInnings.oversDisplay} ov)
            </p>
            <p className="text-xs text-emerald-400 font-medium">
              ✓ Target score achieved. Scoring completed automatically.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigatePhase(10)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl shadow-xl transition-all transform active:scale-95 text-sm flex items-center gap-2"
            >
              <span>View Match Result & Awards (Phase 10)</span>
              <Sparkles className="w-4 h-4 text-slate-950" />
            </button>
            <button
              onClick={() => onNavigatePhase(5)}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-slate-700 transition-all text-sm"
            >
              Full Scorecard (Phase 5)
            </button>
            <button
              onClick={() => onNavigatePhase(12)}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold rounded-2xl border border-slate-700 transition-all text-sm"
            >
              Download PDF Report (Phase 12)
            </button>
            <button
              onClick={handleUndoBall}
              className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Undo last ball if entered by mistake"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo Last Ball</span>
            </button>
          </div>
        </div>
      ) : isInnings1Finished ? (
        /* 1ST INNINGS CONCLUDED CARD (Overs Reached or All Out) */
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 sm:p-8 rounded-3xl shadow-2xl text-center space-y-4 border-2 border-white/20 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-black/20 border-2 border-white/30 mx-auto flex items-center justify-center text-3xl shadow-lg">
            ⏱️
          </div>
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-amber-200 bg-black/30 px-3 py-1 rounded-full border border-white/20">
              1ST INNINGS CONCLUDED • {maxOvers} OVERS COMPLETED
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {currentInnings.battingTeamName}: {currentInnings.totalRuns}/{currentInnings.totalWickets} ({currentInnings.oversDisplay} ov)
            </h3>
            <p className="text-amber-100 font-bold text-sm sm:text-base">
              Target for {match.teamA.id === currentInnings.battingTeamId ? match.teamB.name : match.teamA.name}: <span className="text-white underline font-black">{match.target || currentInnings.totalRuns + 1} Runs</span> in {match.settings.totalOvers} Overs
            </p>
            <p className="text-xs text-amber-200">
              ✓ All {maxOvers} overs bowled. No extra deliveries allowed.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={startSecondInnings}
              className="px-8 py-3.5 bg-white text-slate-950 font-black rounded-2xl shadow-xl hover:bg-amber-100 transition-all text-sm transform active:scale-95"
            >
              Start 2nd Innings (Run Chase) &rarr;
            </button>
            <button
              onClick={() => onNavigatePhase(5)}
              className="px-5 py-3.5 bg-black/30 hover:bg-black/50 text-white font-bold rounded-2xl border border-white/20 text-sm transition-all"
            >
              View Scorecard
            </button>
            <button
              onClick={handleUndoBall}
              className="px-4 py-3.5 bg-black/40 hover:bg-black/60 text-amber-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo Last Ball</span>
            </button>
          </div>
        </div>
      ) : (
        /* PHASE 3 BIG SCORING BUTTONS GRID */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>⚡ Professional Scoring Engine Buttons</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleUndoBall}
                disabled={currentInnings.deliveries.length === 0}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo Ball</span>
              </button>
            </div>
          </div>

          {/* Regular Runs Big Buttons */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
            {[0, 1, 2, 3, 4, 5, 6].map((run) => (
              <button
                key={run}
                onClick={() => recordDelivery({ runsOffBat: run })}
                className={`h-16 sm:h-20 rounded-2xl font-black text-2xl sm:text-3xl flex flex-col items-center justify-center shadow-lg transition-all transform active:scale-95 ${
                  run === 6
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white ring-2 ring-blue-400/50'
                    : run === 4
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white'
                    : run === 0
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    : 'bg-slate-800 hover:bg-slate-750 text-white border border-slate-700'
                }`}
              >
                <span>{run}</span>
                <span className="text-[10px] font-sans font-normal opacity-70">
                  {run === 0 ? 'Dot' : run === 4 ? 'Four' : run === 6 ? 'Six' : 'Runs'}
                </span>
              </button>
            ))}
          </div>

          {/* Extras & Wicket Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-slate-800">
            {/* Wide */}
            <button
              onClick={() => recordDelivery({ runsOffBat: 0, extrasType: 'wide', extrasRuns: 1 })}
              className="h-14 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-sm flex flex-col items-center justify-center transition-all active:scale-95"
            >
              <span>Wide (Wd)</span>
              <span className="text-[10px] text-amber-400/70">+1 Extra</span>
            </button>

            {/* No Ball */}
            <button
              onClick={() => recordDelivery({ runsOffBat: 0, extrasType: 'no-ball', extrasRuns: 1 })}
              className="h-14 rounded-2xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 font-bold text-sm flex flex-col items-center justify-center transition-all active:scale-95"
            >
              <span>No Ball (Nb)</span>
              <span className="text-[10px] text-orange-400/70">+1 & Free Hit</span>
            </button>

            {/* Bye */}
            <button
              onClick={() => recordDelivery({ runsOffBat: 0, extrasType: 'bye', extrasRuns: 1 })}
              className="h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm flex flex-col items-center justify-center transition-all active:scale-95"
            >
              <span>Bye (B)</span>
              <span className="text-[10px] text-slate-400">+1 Bye</span>
            </button>

            {/* Leg Bye */}
            <button
              onClick={() => recordDelivery({ runsOffBat: 0, extrasType: 'leg-bye', extrasRuns: 1 })}
              className="h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm flex flex-col items-center justify-center transition-all active:scale-95"
            >
              <span>Leg-Bye (Lb)</span>
              <span className="text-[10px] text-slate-400">+1 Leg-bye</span>
            </button>

            {/* WICKET BUTTON */}
            <button
              onClick={() => setShowWicketModal(true)}
              className="col-span-2 sm:col-span-1 h-14 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-base shadow-xl shadow-rose-600/30 flex flex-col items-center justify-center transition-all transform active:scale-95 border border-rose-400/40"
            >
              <span>⚡ WICKET!</span>
              <span className="text-[10px] text-rose-200 font-normal">Out Batsman</span>
            </button>
          </div>
        </div>
      )}

      {/* WICKET MODAL */}
      {showWicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-rose-800/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-rose-500">⚡</span>
                <span>Fall of Wicket ({striker?.name})</span>
              </h3>
              <button
                onClick={() => setShowWicketModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Dismissal Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Caught', 'Bowled', 'LBW', 'Run Out', 'Stumped', 'Hit Wicket'] as DismissalType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDismissalType(type)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl transition-all ${
                      dismissalType === type
                        ? 'bg-rose-600 text-white shadow'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {(dismissalType === 'Caught' || dismissalType === 'Run Out' || dismissalType === 'Stumped') && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fielder Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Rizwan / Babar"
                  value={fielderName}
                  onChange={(e) => setFielderName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
            )}

            {availableBatters.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select New Incoming Batsman
                </label>
                <select
                  value={selectedNewBatterId}
                  onChange={(e) => setSelectedNewBatterId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500"
                >
                  <option value="">-- Choose Next Batsman --</option>
                  {availableBatters.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.role})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleConfirmWicket}
              className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-600/30 transition-all"
            >
              Confirm Wicket
            </button>
          </div>
        </div>
      )}

      {/* OVER COMPLETED / NEW BOWLER MODAL */}
      {showBowlerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-blue-800/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="text-center">
              <span className="text-3xl">🎯</span>
              <h3 className="text-lg font-black text-white mt-2">Over Completed!</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Select next bowler for the upcoming over
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Available Bowlers</label>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {availableBowlers.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedNextBowlerId(b.id)}
                    className={`w-full p-3 rounded-xl text-left text-xs flex justify-between items-center transition-all ${
                      selectedNextBowlerId === b.id
                        ? 'bg-blue-600 text-white font-bold shadow-md'
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{b.name} ({b.role})</span>
                    {selectedNextBowlerId === b.id && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSelectNextBowler}
              disabled={!selectedNextBowlerId}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all disabled:opacity-40"
            >
              Start Next Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
