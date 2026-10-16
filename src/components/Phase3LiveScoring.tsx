import React, { useState } from 'react';
import {
  RotateCcw, ArrowRightLeft, Check, Plus, X,
  TrendingUp, Target, Brain, FileDown,
  Volume2, VolumeX, Sparkles, MessageSquare, ListFilter,
  Swords
} from 'lucide-react';
import { CricketMatch, DismissalType, BallDelivery, Player, PlayerRole } from '../types/cricket';
import { sounds } from '../services/soundEffects';
import { generateBallCommentary } from '../services/commentaryEngine';
import { CelebrationType } from './CelebrationOverlay';
import { adMobService } from '../services/adMobService';
import { generateCricketMatchPDF } from '../services/pdfGenerator';
import { synthesizeLocalCricketReport, generateAIMatchReport, AIMatchReport } from '../services/aiMatchReportService';

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

  // View toggles within Live Scoring
  const [activeTab, setActiveTab] = useState<'scoring' | 'predictor' | 'win_pct' | 'h2h' | 'stadium_dj'>('scoring');

  // Modals
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [wicketStep, setWicketStep] = useState<1 | 2>(1); // Step 1: Mode & Batsman; Step 2: Select New Batsman
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [showAddBatterModal, setShowAddBatterModal] = useState(false);
  const [showAIReportModal, setShowAIReportModal] = useState(false);

  // Wicket Modal Detailed States
  const [outBatterChoice, setOutBatterChoice] = useState<'striker' | 'nonStriker'>('striker');
  const [dismissalType, setDismissalType] = useState<DismissalType>('Bowled');
  const [fielderName, setFielderName] = useState('');
  const [fielderName2, setFielderName2] = useState('');
  const [selectedNewBatterId, setSelectedNewBatterId] = useState('');
  const [wicketBatterTab, setWicketBatterTab] = useState<'squad' | 'custom'>('squad');
  const [squadSearchTerm, setSquadSearchTerm] = useState('');
  const [wicketErrorMessage, setWicketErrorMessage] = useState('');

  // Crease / Custom Batsman Modal States
  const [batterSelectionTarget, setBatterSelectionTarget] = useState<'striker' | 'nonStriker' | 'squadOnly'>('striker');
  const [creaseBatterTab, setCreaseBatterTab] = useState<'squad' | 'custom'>('squad');
  const [creaseSearchTerm, setCreaseSearchTerm] = useState('');
  const [customBatterName, setCustomBatterName] = useState('');
  const [customBatterRole, setCustomBatterRole] = useState<PlayerRole>('Batsman');
  const [creaseErrorMessage, setCreaseErrorMessage] = useState('');

  // Bowler Selection
  const [selectedNextBowlerId, setSelectedNextBowlerId] = useState('');

  // AI Report State
  const [aiReport, setAiReport] = useState<AIMatchReport | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // H2H state
  const [h2hBatterId, setH2hBatterId] = useState(currentInnings.currentStrikerId || '');
  const [h2hBowlerId, setH2hBowlerId] = useState(currentInnings.currentBowlerId || '');

  // Batter & Bowler stats
  const striker = currentInnings.batterStats.find((b) => b.playerId === currentInnings.currentStrikerId);
  const nonStriker = currentInnings.batterStats.find((b) => b.playerId === currentInnings.currentNonStrikerId);
  const bowler = currentInnings.bowlerStats.find((b) => b.playerId === currentInnings.currentBowlerId);

  // Remaining eligible batters who haven't batted yet
  const availableBatters = battingTeam.players.filter(
    (p) => !currentInnings.batterStats.some((b) => b.playerId === p.id && b.isOut)
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

  // Run rates & calculations
  const totalDecimalOvers = currentInnings.completedOvers + currentInnings.ballsInCurrentOver / 6;
  const crr = totalDecimalOvers > 0 ? Number((currentInnings.totalRuns / totalDecimalOvers).toFixed(2)) : 0;

  const totalBallsInMatch = maxOvers * 6;
  const ballsBowled = currentInnings.completedOvers * 6 + currentInnings.ballsInCurrentOver;
  const ballsRemaining = Math.max(0, totalBallsInMatch - ballsBowled);
  const oversRemainingDecimal = Math.max(0, maxOvers - totalDecimalOvers);

  const runsNeeded = match.target ? Math.max(0, match.target - currentInnings.totalRuns) : null;
  const rrr = runsNeeded !== null && ballsRemaining > 0
    ? Number(((runsNeeded / ballsRemaining) * 6).toFixed(2))
    : runsNeeded !== null && runsNeeded > 0 ? 99.0 : 0.0;

  const projectedScore = Math.round(currentInnings.totalRuns + crr * oversRemainingDecimal);
  const projectedAt8 = Math.round(currentInnings.totalRuns + 8.0 * oversRemainingDecimal);
  const projectedAt10 = Math.round(currentInnings.totalRuns + 10.0 * oversRemainingDecimal);
  const projectedAt12 = Math.round(currentInnings.totalRuns + 12.0 * oversRemainingDecimal);

  // Win Probability calculation
  let teamAWinPct = 50;
  let teamBWinPct = 50;
  if (match.status === 'completed' && match.result) {
    if (match.result.winnerTeamId === match.teamA.id) {
      teamAWinPct = 100;
      teamBWinPct = 0;
    } else if (match.result.winnerTeamId === match.teamB.id) {
      teamAWinPct = 0;
      teamBWinPct = 100;
    } else {
      teamAWinPct = 50;
      teamBWinPct = 50;
    }
  } else if (match.currentInningsIndex === 0) {
    const wicketsLeft = 10 - currentInnings.totalWickets;
    const battingAdvantage = (crr - 7.5) * 4 + (wicketsLeft - 5) * 2;
    const clampedBattingPct = Math.min(88, Math.max(12, Math.round(50 + battingAdvantage)));
    const isBattingTeamA = currentInnings.battingTeamId === match.teamA.id;
    teamAWinPct = isBattingTeamA ? clampedBattingPct : 100 - clampedBattingPct;
    teamBWinPct = 100 - teamAWinPct;
  } else {
    const target = match.target || (match.innings1.totalRuns + 1);
    const need = Math.max(0, target - currentInnings.totalRuns);
    const wicketsLeft = 10 - currentInnings.totalWickets;
    const reqRate = ballsRemaining > 0 ? (need / ballsRemaining) * 6 : 99;

    let chasingProb = 50;
    if (need <= 0) chasingProb = 100;
    else if (wicketsLeft <= 0 || ballsRemaining <= 0) chasingProb = 0;
    else if (reqRate > 14) chasingProb = Math.max(5, wicketsLeft * 3);
    else if (reqRate > 11) chasingProb = Math.max(15, wicketsLeft * 4);
    else if (reqRate > 9) chasingProb = Math.max(28, 18 + wicketsLeft * 4);
    else if (reqRate <= 6) chasingProb = Math.min(95, 62 + wicketsLeft * 3.5);
    else chasingProb = Math.min(82, Math.max(18, Math.round(50 + (8.5 - reqRate) * 7 + (wicketsLeft - 4) * 3.5)));

    const isChasingTeamA = currentInnings.battingTeamId === match.teamA.id;
    teamAWinPct = isChasingTeamA ? Math.round(chasingProb) : Math.round(100 - chasingProb);
    teamBWinPct = 100 - teamAWinPct;
  }

  // Core Scoring Engine Function
  const recordDelivery = (params: {
    runsOffBat: number;
    extrasType?: 'wide' | 'no-ball' | 'bye' | 'leg-bye' | 'penalty';
    extrasRuns?: number;
    isWicket?: boolean;
    dismissal?: DismissalType;
    outBatterId?: string;
    fielder?: string;
    newBatterId?: string;
    isMaxSix?: boolean;
  }) => {
    // If match is already completed or target already chased, DO NOT continue scoring balls!
    if (isMatchFinished) {
      sounds.playClick();
      onNavigatePhase(10);
      return;
    }
    // If 1st innings is complete, do not allow balls to exceed total overs
    if (isInnings1Finished || match.status === 'innings_break' || currentInnings.completedOvers >= maxOvers) {
      sounds.playClick();
      return;
    }

    sounds.playClick();
    const { runsOffBat, extrasType, extrasRuns = 0, isWicket = false, dismissal, outBatterId, fielder, newBatterId, isMaxSix } = params;

    const isLegal = extrasType !== 'wide' && extrasType !== 'no-ball';
    const totalBallRuns = runsOffBat + extrasRuns;

    // Clone match and innings
    const updatedMatch: CricketMatch = JSON.parse(JSON.stringify(match));
    const inn = updatedMatch.currentInningsIndex === 0 ? updatedMatch.innings1 : updatedMatch.innings2!;

    // 1. Update Totals
    inn.totalRuns += totalBallRuns;

    // 2. Extras tracking
    if (extrasType) {
      if (extrasType === 'wide') {
        inn.extras.wides += extrasRuns;
      } else if (extrasType === 'no-ball') {
        inn.extras.noBalls += extrasRuns;
      } else if (extrasType === 'bye') {
        inn.extras.byes += extrasRuns;
      } else if (extrasType === 'leg-bye') {
        inn.extras.legByes += extrasRuns;
      } else if (extrasType === 'penalty') {
        inn.extras.penalty += extrasRuns;
      }
      inn.extras.total += extrasRuns;
    }

    // 3. Batter Stats
    const currentBat = inn.batterStats.find((b) => b.playerId === inn.currentStrikerId);
    if (currentBat) {
      currentBat.runs += runsOffBat;
      if (isLegal) {
        currentBat.balls += 1;
      }
      if (runsOffBat === 4) {
        currentBat.fours += 1;
      } else if (runsOffBat === 6) {
        currentBat.sixes += 1;
      }
      currentBat.strikeRate = currentBat.balls > 0 ? Number(((currentBat.runs / currentBat.balls) * 100).toFixed(1)) : 0;
    }

    // 4. Bowler Stats
    const currentBowl = inn.bowlerStats.find((b) => b.playerId === inn.currentBowlerId);
    if (currentBowl) {
      if (extrasType !== 'bye' && extrasType !== 'leg-bye') {
        currentBowl.runsConceded += totalBallRuns;
      }
      if (extrasType === 'wide') {
        currentBowl.wides += 1;
      } else if (extrasType === 'no-ball') {
        currentBowl.noBalls += 1;
      }

      if (isLegal) {
        currentBowl.ballsInOver += 1;
        if (totalBallRuns === 0) {
          currentBowl.dots += 1;
        }
        if (currentBowl.ballsInOver === 6) {
          currentBowl.overs += 1;
          currentBowl.ballsInOver = 0;
        }
      }
      if (isWicket && dismissal !== 'Run Out' && dismissal !== 'Retired Hurt' && dismissal !== 'Retired Out' && dismissal !== 'Obstructing Field') {
        currentBowl.wickets += 1;
      }
      const totalBowled = currentBowl.overs + currentBowl.ballsInOver / 6;
      currentBowl.economy = totalBowled > 0 ? Number((currentBowl.runsConceded / totalBowled).toFixed(2)) : 0;
    }

    // 5. Legal Delivery & Overs
    let overCompleted = false;
    if (isLegal) {
      inn.ballsInCurrentOver += 1;
      if (inn.ballsInCurrentOver === 6) {
        inn.completedOvers += 1;
        inn.ballsInCurrentOver = 0;
        overCompleted = true;
      }
    }
    inn.oversDisplay = `${inn.completedOvers}.${inn.ballsInCurrentOver}`;
    const newTotalDecimalOvers = inn.completedOvers + inn.ballsInCurrentOver / 6;
    inn.currentRunRate = newTotalDecimalOvers > 0 ? Number((inn.totalRuns / newTotalDecimalOvers).toFixed(2)) : 0;

    // 6. Wicket Handling
    const dismissedBatterId = outBatterId || inn.currentStrikerId;
    const dismissedBat = inn.batterStats.find((b) => b.playerId === dismissedBatterId);

    if (isWicket) {
      inn.totalWickets += 1;
      if (dismissedBat) {
        dismissedBat.isOut = true;
        dismissedBat.dismissalType = dismissal;
        dismissedBat.bowlerId = currentBowl?.playerId;
        dismissedBat.bowlerName = currentBowl?.name;
        dismissedBat.fielderName = fielder;

        if (dismissal === 'Caught') {
          dismissedBat.dismissalText = `c ${fielder || 'sub'} b ${currentBowl?.name || 'bowler'}`;
        } else if (dismissal === 'Caught & Bowled') {
          dismissedBat.dismissalText = `c & b ${currentBowl?.name || 'bowler'}`;
        } else if (dismissal === 'Bowled') {
          dismissedBat.dismissalText = `b ${currentBowl?.name || 'bowler'}`;
        } else if (dismissal === 'LBW') {
          dismissedBat.dismissalText = `lbw b ${currentBowl?.name || 'bowler'}`;
        } else if (dismissal === 'Run Out') {
          dismissedBat.dismissalText = `run out (${fielder || 'fielder'})`;
        } else if (dismissal === 'Stumped') {
          dismissedBat.dismissalText = `st ${fielder || 'keeper'} b ${currentBowl?.name || 'bowler'}`;
        } else if (dismissal === 'Hit Wicket') {
          dismissedBat.dismissalText = `hit wicket b ${currentBowl?.name || 'bowler'}`;
        } else {
          dismissedBat.dismissalText = `${dismissal} ${fielder ? 'c ' + fielder : ''} b ${currentBowl?.name || ''}`;
        }
      }

      inn.fallOfWickets.push({
        wicketNumber: inn.totalWickets,
        score: inn.totalRuns,
        overs: inn.oversDisplay,
        playerOutName: dismissedBat?.name || 'Batsman'
      });

      // Insert new batter
      if (newBatterId) {
        const nextPlayer = battingTeam.players.find((p) => p.id === newBatterId);
        if (nextPlayer) {
          let nextStat = inn.batterStats.find((b) => b.playerId === nextPlayer.id);
          if (!nextStat) {
            nextStat = {
              playerId: nextPlayer.id,
              name: nextPlayer.name,
              runs: 0,
              balls: 0,
              fours: 0,
              sixes: 0,
              strikeRate: 0,
              isOut: false
            };
            inn.batterStats.push(nextStat);
          } else {
            nextStat.isOut = false;
          }

          if (dismissedBatterId === inn.currentNonStrikerId) {
            inn.currentNonStrikerId = nextPlayer.id;
          } else {
            inn.currentStrikerId = nextPlayer.id;
          }

          const activeOtherBatter = inn.batterStats.find(
            (b) => b.playerId === (dismissedBatterId === inn.currentNonStrikerId ? inn.currentStrikerId : inn.currentNonStrikerId)
          );
          inn.currentPartnership = {
            batter1Name: activeOtherBatter?.name || 'Batter',
            batter2Name: nextPlayer.name,
            runs: 0,
            balls: 0
          };
        }
      }

      sounds.playWicket();
      onTriggerCelebration('wicket', 'OUT! WICKET FALLS!', `${dismissedBat?.name || 'Batsman'} departs! (${dismissedBat?.dismissalText || dismissal})`);
    } else {
      // Boundaries sound / celebration
      if (runsOffBat === 6) {
        sounds.playMaximumSix();
        onTriggerCelebration('six', '6 MAXIMUM SIX!', isMaxSix ? 'High, handsome and way into the stands! 🚀 102 Meters' : 'Dispatched cleanly into the crowd!');
      } else if (runsOffBat === 4) {
        sounds.playBoundaryFour();
        onTriggerCelebration('four', '4 CRACKING FOUR!', 'Pierced the infield with majestic timing!');
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
      batterName: dismissedBat?.name || currentBat?.name || 'Batter',
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
      playerOutName: isWicket ? dismissedBat?.name : undefined,
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
    if (!isWicket) {
      if (runsOffBat % 2 === 1 || (extrasType && totalBallRuns % 2 === 1)) {
        const temp = inn.currentStrikerId;
        inn.currentStrikerId = inn.currentNonStrikerId;
        inn.currentNonStrikerId = temp;
      }
    }

    // Check match completion conditions BEFORE showing bowler modal!
    const isTargetChasedNow = updatedMatch.currentInningsIndex === 1 && !!updatedMatch.target && inn.totalRuns >= updatedMatch.target;
    const is2ndInningsDone = updatedMatch.currentInningsIndex === 1 && (inn.completedOvers >= updatedMatch.settings.totalOvers || inn.totalWickets >= maxWicketsBatting);

    if (overCompleted) {
      const temp = inn.currentStrikerId;
      inn.currentStrikerId = inn.currentNonStrikerId;
      inn.currentNonStrikerId = temp;

      // STRICT REQUIREMENT: After winning the match, DO NOT give option of New bowler!
      const is1stInningsDone = updatedMatch.currentInningsIndex === 0 && (inn.completedOvers >= updatedMatch.settings.totalOvers || inn.totalWickets >= maxWicketsBatting);

      if (!isTargetChasedNow && !is2ndInningsDone && !is1stInningsDone && updatedMatch.status === 'live') {
        setShowBowlerModal(true);
      }
    }

    // 10. Check Target or Match Completion
    if (updatedMatch.currentInningsIndex === 1 && updatedMatch.target) {
      if (inn.totalRuns >= updatedMatch.target) {
        // Target chased successfully! Match concludes immediately!
        setShowBowlerModal(false);
        inn.isCompleted = true;
        updatedMatch.status = 'completed';
        const wicketsLeft = Math.max(1, maxWicketsBatting - inn.totalWickets);

        updatedMatch.result = {
          winnerTeamId: inn.battingTeamId,
          resultText: `${inn.battingTeamName} won by ${wicketsLeft} wicket${wicketsLeft === 1 ? '' : 's'}`,
          marginText: `${wicketsLeft} wicket${wicketsLeft === 1 ? '' : 's'}`
        };
        sounds.playVictory();
        onTriggerCelebration('match_won', `${inn.battingTeamName.toUpperCase()} WON!`, `Target of ${updatedMatch.target} reached! Won by ${wicketsLeft} wickets!`);
      } else if (
        inn.totalWickets >= maxWicketsBatting ||
        inn.completedOvers >= updatedMatch.settings.totalOvers
      ) {
        // Defending team won or Tie
        setShowBowlerModal(false);
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
          onTriggerCelebration('match_won', `${inn.bowlingTeamName.toUpperCase()} WON!`, `Defended total by ${runsDefended} runs!`);
        }
      }
    } else if (updatedMatch.currentInningsIndex === 0) {
      // 1st innings check
      if (
        inn.completedOvers >= updatedMatch.settings.totalOvers ||
        inn.totalWickets >= maxWicketsBatting
      ) {
        setShowBowlerModal(false);
        inn.isCompleted = true;
        updatedMatch.status = 'innings_break';
        updatedMatch.target = inn.totalRuns + 1;
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

    // Revert match status if it was completed
    if (updatedMatch.status === 'completed' || updatedMatch.status === 'innings_break') {
      updatedMatch.status = 'live';
      inn.isCompleted = false;
      delete updatedMatch.result;
    }

    onUpdateMatch(updatedMatch);
  };

  const handleConfirmWicket = () => {
    let incomingBatterId = selectedNewBatterId;

    if (availableBatters.length > 0 && !incomingBatterId) {
      if (wicketBatterTab === 'custom') {
        if (!customBatterName.trim()) {
          setWicketErrorMessage('Please enter the name of the new custom batsman.');
          return;
        }
      } else {
        setWicketErrorMessage('Please select the incoming batsman from the team player list, or add a custom batsman.');
        return;
      }
    }

    setWicketErrorMessage('');

    if (wicketBatterTab === 'custom' && customBatterName.trim()) {
      const newCustomPlayer: Player = {
        id: `custom-p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: customBatterName.trim(),
        role: customBatterRole,
      };
      battingTeam.players.push(newCustomPlayer);
      incomingBatterId = newCustomPlayer.id;
    }

    const outBatterId = outBatterChoice === 'nonStriker' ? currentInnings.currentNonStrikerId : currentInnings.currentStrikerId;

    let finalFielder = fielderName.trim();
    if (dismissalType === 'Caught & Bowled') {
      finalFielder = bowler?.name || 'Bowler';
    } else if (dismissalType === 'Run Out' && fielderName2.trim()) {
      finalFielder = fielderName.trim() ? `${fielderName.trim()} / ${fielderName2.trim()}` : fielderName2.trim();
    }

    recordDelivery({
      runsOffBat: 0,
      isWicket: true,
      dismissal: dismissalType,
      outBatterId,
      fielder: finalFielder || undefined,
      newBatterId: incomingBatterId || undefined
    });

    setShowWicketModal(false);
    setWicketStep(1);
    setSelectedNewBatterId('');
    setFielderName('');
    setFielderName2('');
    setCustomBatterName('');
    setWicketBatterTab('squad');
    setOutBatterChoice('striker');
  };

  const handleAssignBatterFromSquad = (playerId: string, target: 'striker' | 'nonStriker') => {
    sounds.playClick();
    const updatedMatch: CricketMatch = JSON.parse(JSON.stringify(match));
    const inn = updatedMatch.currentInningsIndex === 0 ? updatedMatch.innings1 : updatedMatch.innings2!;
    const p = battingTeam.players.find((x) => x.id === playerId);
    if (!p) return;

    let bStat = inn.batterStats.find((b) => b.playerId === playerId);
    if (!bStat) {
      bStat = {
        playerId: p.id,
        name: p.name,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        isOut: false
      };
      inn.batterStats.push(bStat);
    } else {
      bStat.isOut = false;
    }

    if (target === 'striker') {
      inn.currentStrikerId = playerId;
    } else {
      inn.currentNonStrikerId = playerId;
    }

    onUpdateMatch(updatedMatch);
    setShowAddBatterModal(false);
    setCreaseErrorMessage('');
  };

  const handleCreateAndAssignCustomBatter = () => {
    if (!customBatterName.trim()) {
      setCreaseErrorMessage('Please enter a batsman name.');
      return;
    }
    sounds.playClick();
    const updatedMatch: CricketMatch = JSON.parse(JSON.stringify(match));
    const inn = updatedMatch.currentInningsIndex === 0 ? updatedMatch.innings1 : updatedMatch.innings2!;
    const bTeam = updatedMatch.teamA.id === inn.battingTeamId ? updatedMatch.teamA : updatedMatch.teamB;

    const newPlayer: Player = {
      id: `p-custom-${Date.now()}`,
      name: customBatterName.trim(),
      role: customBatterRole
    };
    bTeam.players.push(newPlayer);

    const newStat = {
      playerId: newPlayer.id,
      name: newPlayer.name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      isOut: false
    };
    inn.batterStats.push(newStat);

    if (batterSelectionTarget === 'striker') {
      inn.currentStrikerId = newPlayer.id;
    } else if (batterSelectionTarget === 'nonStriker') {
      inn.currentNonStrikerId = newPlayer.id;
    }

    onUpdateMatch(updatedMatch);
    setShowAddBatterModal(false);
    setCustomBatterName('');
    setCreaseErrorMessage('');
  };

  const handleSelectNextBowler = () => {
    if (!selectedNextBowlerId) return;
    sounds.playClick();
    const updatedMatch: CricketMatch = JSON.parse(JSON.stringify(match));
    const inn = updatedMatch.currentInningsIndex === 0 ? updatedMatch.innings1 : updatedMatch.innings2!;

    inn.currentBowlerId = selectedNextBowlerId;
    let bStat = inn.bowlerStats.find((b) => b.playerId === selectedNextBowlerId);
    if (!bStat) {
      const p = bowlingTeam.players.find((x) => x.id === selectedNextBowlerId);
      bStat = {
        playerId: selectedNextBowlerId,
        name: p?.name || 'Bowler',
        overs: 0,
        ballsInOver: 0,
        maidens: 0,
        runsConceded: 0,
        wickets: 0,
        economy: 0,
        wides: 0,
        noBalls: 0,
        dots: 0
      };
      inn.bowlerStats.push(bStat);
    }

    setShowBowlerModal(false);
    setSelectedNextBowlerId('');
    onUpdateMatch(updatedMatch);
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
  };

  const openFullAIReport = async () => {
    sounds.playClick();
    setShowAIReportModal(true);
    if (!aiReport) {
      setIsGeneratingAI(true);
      try {
        const res = await generateAIMatchReport(match);
        setAiReport(res);
      } finally {
        setIsGeneratingAI(false);
      }
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in pb-20">
      {/* 1. MATCH FINISHED RESULT BANNER (from Screenshot 10) */}
      {isMatchFinished && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 border-2 border-emerald-500/60 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-2xl shadow-md shrink-0">
              🏆
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                Match Finished! Result Decided
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {match.result?.resultText || `${battingTeam.name} won by ${match.result?.marginText || 'Victory'}`}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigatePhase(10)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>View Match Result & Trophy (Phase 10)</span>
            </button>
            <button
              onClick={openFullAIReport}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
            >
              <Brain className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Match Report</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. 1ST INNINGS COMPLETED BANNER (from Screenshot 9) */}
      {!isMatchFinished && isInnings1Finished && (
        <div className="bg-gradient-to-r from-amber-950 via-orange-950 to-amber-900 border-2 border-amber-500/60 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-xl shrink-0">
              ✓
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                1st Innings Completed ({maxOvers} Overs Reached)
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                {currentInnings.battingTeamName} scored {currentInnings.totalRuns}/{currentInnings.totalWickets}. Target for {match.teamA.id === currentInnings.battingTeamId ? match.teamB.name : match.teamA.name} is {match.target || (currentInnings.totalRuns + 1)} runs in {match.settings.totalOvers} overs.
              </h3>
            </div>
          </div>

          <button
            onClick={startSecondInnings}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all shrink-0 flex items-center gap-1.5"
          >
            <span>Start 2nd Innings (Chase Target {match.target || (currentInnings.totalRuns + 1)})</span>
            <span>&rarr;</span>
          </button>
        </div>
      )}

      {/* 3. PHASE 3 HEADER & QUICK SHORTCUTS STRIP (from Screenshot 9 & 11) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl p-2 sm:p-2.5 backdrop-blur-sm shadow-md">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-blue-950 text-cyan-400 text-xs font-black border border-blue-800/60 uppercase">
            Phase 3: Live Scoring Engine
          </span>
        </div>

        {/* Action button triggers from Screenshot 9 & 11 */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <button
            onClick={() => setActiveTab(activeTab === 'stadium_dj' ? 'scoring' : 'stadium_dj')}
            className={`px-2.5 py-1 rounded-xl border flex items-center gap-1 transition-all ${
              activeTab === 'stadium_dj'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}
          >
            <span>🎵 Stadium DJ</span>
          </button>

          <button
            onClick={() => generateCricketMatchPDF(match)}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition-all"
          >
            <FileDown className="w-3 h-3 text-cyan-400" />
            <span>Export</span>
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'h2h' ? 'scoring' : 'h2h')}
            className={`px-2.5 py-1 rounded-xl border flex items-center gap-1 transition-all ${
              activeTab === 'h2h'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow'
                : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
            }`}
          >
            <Swords className="w-3 h-3 text-indigo-400" />
            <span>H2H Matchup</span>
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'predictor' ? 'scoring' : 'predictor')}
            className={`px-2.5 py-1 rounded-xl border flex items-center gap-1 transition-all ${
              activeTab === 'predictor'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow'
                : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
            }`}
          >
            <TrendingUp className="w-3 h-3 text-cyan-400" />
            <span>Predictor</span>
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'win_pct' ? 'scoring' : 'win_pct')}
            className={`px-2.5 py-1 rounded-xl border flex items-center gap-1 transition-all ${
              activeTab === 'win_pct'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}
          >
            <Target className="w-3 h-3 text-emerald-400" />
            <span>Win %</span>
          </button>

          <button
            onClick={openFullAIReport}
            className="px-2.5 py-1 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 flex items-center gap-1 transition-all"
          >
            <Brain className="w-3 h-3 text-purple-400" />
            <span>AI Report</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN LIVE SCOREBOARD HERO CARD (Exact Screenshot 9, 10 & 11) */}
      <div className="bg-gradient-to-br from-[#0c1427] via-[#091122] to-[#0d1629] border border-blue-900/60 rounded-3xl p-5 sm:p-6 shadow-2xl relative space-y-4">
        {/* Team Matchup Title Header */}
        <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{battingTeam.logo || '👑'}</span>
            <span className="font-black text-white text-base sm:text-lg">
              {currentInnings.battingTeamName}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-600/30 text-cyan-300 border border-blue-500/40">
              {match.settings.format} • {currentInnings.inningsNumber === 1 ? '1st Innings' : '2nd Innings (Chasing Target)'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>vs</span>
            <span className="font-bold text-slate-300">{currentInnings.bowlingTeamName}</span>
            <span className="text-xl">{bowlingTeam.logo || '⚔️'}</span>
          </div>
        </div>

        {/* Big Score & CRR / RRR / Target / Projected */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tight">
                {currentInnings.totalRuns}/{currentInnings.totalWickets}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-amber-300 font-mono">
                ({currentInnings.oversDisplay} ov)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Match Overs: <strong className="text-white">{maxOvers} max</strong> ({maxOvers * 6} legal balls limit) &bull; Legal deliveries counted automatically
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="flex items-center sm:justify-end gap-2">
              <span className="text-xs text-slate-400">CRR:</span>
              <span className="text-lg font-mono font-black text-emerald-400">
                {crr.toFixed(2)}
              </span>
            </div>

            {match.currentInningsIndex === 1 && match.target ? (
              <div className="flex items-center sm:justify-end gap-2 text-xs">
                <span className="text-slate-400">Target:</span>
                <span className="text-sm font-mono font-black text-amber-300">
                  {match.target}
                </span>
              </div>
            ) : (
              <div className="flex items-center sm:justify-end gap-2 text-xs">
                <span className="text-slate-400">Projected:</span>
                <span className="text-sm font-mono font-black text-cyan-300">
                  {projectedScore}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Chase Target Bar (if 2nd Innings) */}
        {match.currentInningsIndex === 1 && match.target && (
          <div className="p-3 bg-purple-950/40 border border-purple-800/50 rounded-2xl flex flex-wrap items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Target: {match.target}</span>
            </div>
            <div>
              {currentInnings.totalRuns >= match.target ? (
                <span className="font-black text-emerald-400">
                  Target Chased! Chasing Team Won
                </span>
              ) : (
                <span className="text-amber-300 font-bold font-mono">
                  Need {Math.max(0, match.target - currentInnings.totalRuns)} runs in {ballsRemaining} balls &bull; RRR: <strong className="text-amber-200">{rrr.toFixed(2)}</strong>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Current Partnership & Run Rate */}
        <div className="flex items-center justify-between text-xs bg-slate-950/50 px-3.5 py-2 rounded-xl border border-slate-800/70">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span>👥</span>
            <span>Current Partnership:</span>
            <strong className="text-white font-mono">{currentInnings.currentPartnership.runs} runs</strong>
            <span className="text-slate-500">({currentInnings.currentPartnership.balls} b)</span>
          </span>

          <span className="text-emerald-400 font-mono font-bold text-xs">
            Run Rate: {currentInnings.currentPartnership.balls > 0 ? ((currentInnings.currentPartnership.runs / (currentInnings.currentPartnership.balls / 6)).toFixed(2)) : '0.00'}
          </span>
        </div>

        {/* THIS OVER BALLS DISPLAY */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
            THIS OVER:
          </span>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {currentInnings.deliveries.filter((d) => d.overNumber === currentInnings.completedOvers).length === 0 ? (
              <span className="text-slate-500 text-xs italic">Over starting...</span>
            ) : (
              currentInnings.deliveries
                .filter((d) => d.overNumber === currentInnings.completedOvers)
                .slice()
                .reverse()
                .map((d) => (
                  <span
                    key={d.ballId}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shadow-md border ${
                      d.isWicket
                        ? 'bg-rose-600 text-white border-rose-400'
                        : d.runsOffBat === 6
                        ? 'bg-purple-600 text-white border-purple-400'
                        : d.runsOffBat === 4
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : d.extrasType
                        ? 'bg-amber-500 text-slate-950 border-amber-300'
                        : 'bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    {d.isWicket ? 'W' : d.extrasType ? (d.extrasType === 'wide' ? 'Wd' : 'Nb') : d.runsOffBat}
                  </span>
                ))
            )}
          </div>
        </div>

        {/* BATTING & CURRENT BOWLER TWO-COLUMN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* Batting Box */}
          <div className="bg-[#070e1c] border border-slate-800/90 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800/60 pb-1.5">
              <span>BATTING</span>
              <span className="font-mono text-slate-400">R (B) • 4S • 6S • SR</span>
            </div>

            {/* Striker */}
            {striker && (
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 truncate max-w-[55%]">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                  <span className="font-bold text-white truncate">{striker.name} *</span>
                </div>
                <div className="text-right shrink-0">
                  <strong className="text-amber-400 font-black">{striker.runs}</strong>
                  <span className="text-slate-400 font-normal"> ({striker.balls}) &bull; {striker.fours} &bull; {striker.sixes} &bull; </span>
                  <strong className="text-emerald-400 font-bold">SR {striker.strikeRate}</strong>
                </div>
              </div>
            )}

            {/* Non-Striker */}
            {nonStriker && (
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <div className="flex items-center gap-1.5 truncate max-w-[55%]">
                  <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
                  <span className="truncate">{nonStriker.name}</span>
                </div>
                <div className="text-right shrink-0">
                  <strong className="text-white font-bold">{nonStriker.runs}</strong>
                  <span className="text-slate-400 font-normal"> ({nonStriker.balls}) &bull; {nonStriker.fours} &bull; {nonStriker.sixes} &bull; </span>
                  <strong className="text-emerald-400 font-bold">SR {nonStriker.strikeRate}</strong>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/50 text-[10px]">
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowAddBatterModal(true);
                }}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3 h-3" />
                <span>Change / Add Custom Batsman</span>
              </button>
              <button
                onClick={handleManualStrikeSwap}
                className="text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
                title="Swap Strike"
              >
                <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
                <span>Swap Strike</span>
              </button>
            </div>
          </div>

          {/* Current Bowler Box */}
          <div className="bg-[#070e1c] border border-slate-800/90 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800/60 pb-1.5">
              <span>CURRENT BOWLER</span>
              {/* REQUIREMENT: After match is won, DO NOT give option of change bowler! */}
              {!isMatchFinished && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    setShowBowlerModal(true);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-sans text-[10px] font-bold underline"
                >
                  Change Bowler
                </button>
              )}
            </div>

            {bowler ? (
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-black text-white truncate">{bowler.name}</span>
                  <span className="font-bold text-white">
                    {bowler.overs}.{bowler.ballsInOver} - {bowler.maidens} - {bowler.runsConceded} - <strong className="text-rose-400">{bowler.wickets}</strong>
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Right-arm medium</span>
                  <span className="font-mono">
                    ECO: <strong className="text-emerald-400">{bowler.economy.toFixed(2)}</strong>
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-500">No active bowler assigned</span>
            )}

            <div className="pt-1 border-t border-slate-800/50 flex items-center justify-between text-[10px] text-slate-400">
              <span>Balls Bowled: {currentInnings.completedOvers * 6 + currentInnings.ballsInCurrentOver}</span>
              <span>Wickets Fallen: {currentInnings.totalWickets}/{maxWicketsBatting}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. EMBEDDED SCORE PREDICTOR (Visible by default or toggle) */}
      {(activeTab === 'predictor' || activeTab === 'scoring') && (
        <div className="bg-[#0a1224] border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-amber-400">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="uppercase tracking-wider font-black">SCORE PREDICTOR & PACE ESTIMATES</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-slate-400">CRR: <strong className="text-emerald-400">{crr.toFixed(2)}</strong></span>
              {match.currentInningsIndex === 1 && runsNeeded !== null && (
                <span className="text-slate-400">RRR: <strong className="text-amber-300">{rrr.toFixed(2)}</strong></span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-cyan-500/30">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">At Current RR ({crr.toFixed(1)})</span>
              <strong className="text-cyan-300 text-base font-mono font-black">{projectedScore} Runs</strong>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">At 8.00 RPO</span>
              <strong className="text-white text-base font-mono font-black">{projectedAt8} Runs</strong>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">At 10.00 RPO</span>
              <strong className="text-amber-300 text-base font-mono font-black">{projectedAt10} Runs</strong>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">At 12.00 RPO</span>
              <strong className="text-emerald-300 text-base font-mono font-black">{projectedAt12} Runs</strong>
            </div>
          </div>
        </div>
      )}

      {/* 6. EMBEDDED WIN PERCENTAGE DUEL GAUGE */}
      {(activeTab === 'win_pct' || activeTab === 'scoring') && (
        <div className="bg-[#0a1224] border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Target className="w-4 h-4 text-cyan-400" />
              <span className="uppercase tracking-wider font-black">WIN PERCENTAGE ENGINE</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-mono">Dynamic Real-Time</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono font-black">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="text-base">{match.teamA.logo}</span>
                <span className="font-bold">{match.teamA.name}</span>
                <span className="text-white bg-blue-900/80 px-2 py-0.5 rounded-full text-xs border border-blue-500/40">{teamAWinPct}%</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-300">
                <span className="text-white bg-emerald-900/80 px-2 py-0.5 rounded-full text-xs border border-emerald-500/40">{teamBWinPct}%</span>
                <span className="font-bold">{match.teamB.name}</span>
                <span className="text-base">{match.teamB.logo}</span>
              </span>
            </div>

            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-l-full transition-all duration-700 ease-out"
                style={{ width: `${teamAWinPct}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-r-full transition-all duration-700 ease-out"
                style={{ width: `${teamBWinPct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 7. H2H MATCHUP SECTION (when clicked from header) */}
      {activeTab === 'h2h' && (
        <div className="bg-[#0a1224] border border-indigo-900/60 rounded-3xl p-5 space-y-4 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Swords className="w-4 h-4 text-indigo-400" />
              <span>Bowler vs Batsman Matchup</span>
            </h4>
            <button
              onClick={() => setActiveTab('scoring')}
              className="px-3 py-1 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Back to Live Scoring
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">SELECT BATSMAN ({battingTeam.name})</label>
              <select
                value={h2hBatterId}
                onChange={(e) => setH2hBatterId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white text-xs"
              >
                {battingTeam.players.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">SELECT BOWLER ({bowlingTeam.name})</label>
              <select
                value={h2hBowlerId}
                onChange={(e) => setH2hBowlerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white text-xs"
              >
                {bowlingTeam.players.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">HISTORICAL STRIKE RATE</span>
              <strong className="text-amber-400 text-base font-mono">107.7</strong>
              <span className="text-[9px] text-slate-500 block">Runs per 100 balls</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">HEAD-TO-HEAD AVERAGE</span>
              <strong className="text-emerald-400 text-base font-mono">56.0</strong>
              <span className="text-[9px] text-slate-500 block">Runs per dismissal</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">BALLS FACED</span>
              <strong className="text-white text-base font-mono">52</strong>
              <span className="text-[9px] text-slate-500 block">56 runs scored</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">TIMES DISMISSED</span>
              <strong className="text-rose-400 text-base font-mono">1</strong>
              <span className="text-[9px] text-slate-500 block">Bowler breakthroughs</span>
            </div>
          </div>
        </div>
      )}

      {/* 8. STADIUM DJ TRACKS (when clicked from header) */}
      {activeTab === 'stadium_dj' && (
        <div className="bg-[#0a1224] border border-amber-900/60 rounded-3xl p-5 space-y-4 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
              <span>🎵</span>
              <span>Stadium Celebration Music & Anthems</span>
            </h4>
            <button
              onClick={() => setActiveTab('scoring')}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
            >
              Back to Live Scoring
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <button
              onClick={() => {
                sounds.playBoundaryFour();
                onTriggerCelebration('four', '4 FOUR!', 'Latin Brass Fanfare');
              }}
              className="p-3 bg-slate-950 hover:bg-slate-900 border border-emerald-500/30 rounded-xl text-left space-y-1 transition-all"
            >
              <strong className="text-emerald-400 block">4 FOUR!</strong>
              <span className="text-[10px] text-slate-400 block">Latin Brass Fanfare</span>
              <span className="text-[10px] text-emerald-300 font-bold">Play Track &rarr;</span>
            </button>

            <button
              onClick={() => {
                sounds.playMaximumSix();
                onTriggerCelebration('six', '6 SIX!', 'Stadium EDM Blast');
              }}
              className="p-3 bg-slate-950 hover:bg-slate-900 border border-blue-500/30 rounded-xl text-left space-y-1 transition-all"
            >
              <strong className="text-blue-400 block">6 SIX!</strong>
              <span className="text-[10px] text-slate-400 block">Stadium EDM Blast</span>
              <span className="text-[10px] text-blue-300 font-bold">Play Track &rarr;</span>
            </button>

            <button
              onClick={() => {
                sounds.playWicket();
                onTriggerCelebration('wicket', 'WICKET!', 'DJ Stinger & Crash');
              }}
              className="p-3 bg-slate-950 hover:bg-slate-900 border border-rose-500/30 rounded-xl text-left space-y-1 transition-all"
            >
              <strong className="text-rose-400 block">WICKET!</strong>
              <span className="text-[10px] text-slate-400 block">DJ Stinger & Crash</span>
              <span className="text-[10px] text-rose-300 font-bold">Play Track &rarr;</span>
            </button>

            <button
              onClick={() => {
                sounds.playVictory();
                onTriggerCelebration('match_won', 'VICTORY!', 'Grand Championship');
              }}
              className="p-3 bg-slate-950 hover:bg-slate-900 border border-amber-500/30 rounded-xl text-left space-y-1 transition-all"
            >
              <strong className="text-amber-400 block">VICTORY!</strong>
              <span className="text-[10px] text-slate-400 block">Grand Championship</span>
              <span className="text-[10px] text-amber-300 font-bold">Play Track &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* 9. SCORING KEYPAD OR MATCH CONCLUDED PANEL (Exact Screenshot 10) */}
      {isMatchFinished ? (
        /* EXACT SCREENSHOT 10: MATCH CONCLUDED PANEL */
        <div className="bg-[#070e1c] border border-slate-800 rounded-3xl p-5 sm:p-6 text-center space-y-4 shadow-2xl">
          <div className="space-y-1">
            <h3 className="text-base font-black text-white flex items-center justify-center gap-2">
              <span>🏁</span>
              <span>MATCH CONCLUDED</span>
            </h3>
            <p className="text-xs text-slate-400">
              All deliveries completed for this fixture. Review scorecard and results.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            <button
              onClick={handleUndoBall}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo Last Ball</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigatePhase(4)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                Commentary
              </button>
              <button
                onClick={() => onNavigatePhase(5)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition-colors"
              >
                Scorecard
              </button>
            </div>
          </div>
        </div>
      ) : isInnings1Finished ? (
        /* OVERS LIMIT REACHED (from Screenshot 9) */
        <div className="bg-[#070e1c] border border-slate-800 rounded-3xl p-5 text-center space-y-4 shadow-2xl">
          <div className="space-y-1">
            <h3 className="text-base font-black text-amber-400 flex items-center justify-center gap-2">
              <span>🏆</span>
              <span>OVERS LIMIT REACHED</span>
            </h3>
            <p className="text-xs text-slate-400">
              Completed {maxOvers} overs. Proceed to the 2nd innings.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            <button
              onClick={handleUndoBall}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo Last Ball</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigatePhase(4)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                Commentary
              </button>
              <button
                onClick={() => onNavigatePhase(5)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition-colors"
              >
                Scorecard
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ACTIVE SCORING KEYPAD (from Screenshot 9 & 11) */
        <div className="bg-[#070e1c] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
          {/* Row 1: 0, 1, 2, 3 */}
          <div className="grid grid-cols-4 gap-2.5">
            {[0, 1, 2, 3].map((run) => (
              <button
                key={run}
                onClick={() => recordDelivery({ runsOffBat: run })}
                className="h-14 sm:h-16 rounded-2xl bg-[#141e33] hover:bg-[#1a2742] text-white font-black text-2xl flex items-center justify-center shadow-md border border-slate-800 transition-all active:scale-95"
              >
                {run}
              </button>
            ))}
          </div>

          {/* Row 2: 4 (green), 5, 6 (purple), MAX 6 (amber) */}
          <div className="grid grid-cols-4 gap-2.5">
            {/* 4 */}
            <button
              onClick={() => recordDelivery({ runsOffBat: 4 })}
              className="h-14 sm:h-16 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-700/30 transition-all active:scale-95"
            >
              4
            </button>

            {/* 5 */}
            <button
              onClick={() => recordDelivery({ runsOffBat: 5 })}
              className="h-14 sm:h-16 rounded-2xl bg-[#141e33] hover:bg-[#1a2742] text-white font-black text-2xl flex items-center justify-center shadow-md border border-slate-800 transition-all active:scale-95"
            >
              5
            </button>

            {/* 6 */}
            <button
              onClick={() => recordDelivery({ runsOffBat: 6 })}
              className="h-14 sm:h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              6
            </button>

            {/* MAX 6 */}
            <button
              onClick={() => recordDelivery({ runsOffBat: 6, isMaxSix: true })}
              className="h-14 sm:h-16 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-base sm:text-lg flex items-center justify-center shadow-lg shadow-amber-500/30 transition-all active:scale-95"
            >
              MAX 6
            </button>
          </div>

          {/* Row 3: Wide (+1), No-Ball (+1), Bye, Leg-Bye, WICKET */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 border-t border-slate-800/80">
            <button
              onClick={() => recordDelivery({ runsOffBat: 0, extrasType: 'wide', extrasRuns: 1 })}
              className="h-12 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 font-bold text-xs flex items-center justify-center transition-all active:scale-95"
            >
              Wide (+1)
            </button>

            <button
              onClick={() => recordDelivery({ runsOffBat: 0, extrasType: 'no-ball', extrasRuns: 1 })}
              className="h-12 rounded-xl bg-orange-950/60 hover:bg-orange-900/60 text-orange-300 border border-orange-800/60 font-bold text-xs flex items-center justify-center transition-all active:scale-95"
            >
              No-Ball (+1)
            </button>

            <button
              onClick={() => recordDelivery({ runsOffBat: 0, extrasType: 'bye', extrasRuns: 1 })}
              className="h-12 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 font-bold text-xs flex items-center justify-center transition-all active:scale-95"
            >
              Bye
            </button>

            <button
              onClick={() => recordDelivery({ runsOffBat: 0, extrasType: 'leg-bye', extrasRuns: 1 })}
              className="h-12 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 font-bold text-xs flex items-center justify-center transition-all active:scale-95"
            >
              Leg-Bye
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setWicketStep(1);
                setShowWicketModal(true);
              }}
              className="col-span-2 sm:col-span-1 h-12 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center transition-all active:scale-95"
            >
              WICKET
            </button>
          </div>

          {/* Row 4: Undo Last Ball, Commentary, Scorecard */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-xs">
            <button
              onClick={handleUndoBall}
              disabled={currentInnings.deliveries.length === 0}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo Last Ball</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigatePhase(4)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
              >
                Commentary
              </button>
              <button
                onClick={() => onNavigatePhase(5)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow transition-colors"
              >
                Scorecard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. GOOGLE ADMOB BANNER AT BOTTOM OF SCORING SCREEN (from Screenshot 9, 10, 11) */}
      <div className="bg-[#0b1220] border border-blue-900/50 rounded-2xl p-3 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-2.5">
          <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px]">
            AD
          </span>
          <div>
            <strong className="text-white font-bold">Pro Cricket Live Gear & Willow Bats</strong>
            <span className="text-amber-400 font-semibold ml-1.5">&bull; 40% Off Mega Sale</span>
            <p className="text-[10px] text-slate-500 font-mono">Google AdMob Unit: ca-app-pub-3940256099942...</p>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            adMobService.showInterstitial({
              trigger: 'custom',
              title: 'PRO CRICKET GEAR SPONSOR',
              subtitle: 'Exclusive Willow Bats & Match Kits'
            });
          }}
          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition-all"
        >
          Learn More
        </button>
      </div>

      {/* WICKET FALL MODAL (Exact Screenshot 1 & 4) */}
      {showWicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0c1427] border border-rose-600/70 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-auto">
            {wicketStep === 1 ? (
              /* SCREENSHOT 1: Wicket Fall Modal */
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💥</span>
                    <h3 className="text-base font-black text-rose-400">
                      Wicket Fall
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowWicketModal(false);
                      setWicketErrorMessage('');
                    }}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {wicketErrorMessage && (
                  <p className="text-xs text-rose-400 font-bold bg-rose-950/60 p-2 rounded-lg border border-rose-800">
                    {wicketErrorMessage}
                  </p>
                )}

                {/* Batsman Dismissed */}
                <div className="space-y-1.5 text-xs">
                  <label className="text-slate-400 font-bold block text-[11px]">Batsman Dismissed</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOutBatterChoice('striker')}
                      className={`p-2.5 rounded-xl text-left font-bold border transition-all text-xs ${
                        outBatterChoice === 'striker'
                          ? 'bg-blue-900/60 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Striker: {striker?.name || 'Striker'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOutBatterChoice('nonStriker')}
                      className={`p-2.5 rounded-xl text-left font-bold border transition-all text-xs ${
                        outBatterChoice === 'nonStriker'
                          ? 'bg-rose-950/80 border-rose-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Non-Striker: {nonStriker?.name || 'Non-Striker'}
                    </button>
                  </div>
                </div>

                {/* Dismissal Type Buttons */}
                <div className="space-y-1.5 text-xs">
                  <label className="text-slate-400 font-bold block text-[11px]">Dismissal Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['BOWLED', 'CAUGHT', 'LBW', 'RUN OUT', 'STUMPED', 'HIT WICKET'] as const).map((mode) => {
                      const formattedMode = mode === 'BOWLED' ? 'Bowled' : mode === 'CAUGHT' ? 'Caught' : mode === 'LBW' ? 'LBW' : mode === 'RUN OUT' ? 'Run Out' : mode === 'STUMPED' ? 'Stumped' : 'Hit Wicket';
                      const isSelected = dismissalType === formattedMode;
                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setDismissalType(formattedMode as DismissalType)}
                          className={`py-2 rounded-xl text-center font-bold text-xs uppercase border transition-all ${
                            isSelected
                              ? 'bg-rose-600 border-rose-400 text-white shadow-md'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {mode}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowWicketModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => setWicketStep(2)}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition-all text-center"
                  >
                    Select New Batsman &rarr;
                  </button>
                </div>
              </>
            ) : (
              /* SCREENSHOT 4: Select New Batsman Modal */
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏏</span>
                    <div>
                      <h3 className="text-base font-black text-white">
                        Select New Batsman
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Wicket fell: <span className="text-rose-400 font-bold">{outBatterChoice === 'striker' ? striker?.name : nonStriker?.name} departs</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowWicketModal(false);
                      setWicketStep(1);
                    }}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Currently at crease banner */}
                <div className="p-3 bg-blue-950/40 border border-blue-800/50 rounded-xl text-xs flex justify-between items-center text-slate-300">
                  <span>Currently at crease (Non-Striker):</span>
                  <strong className="text-white">
                    {outBatterChoice === 'striker' ? nonStriker?.name : striker?.name}
                  </strong>
                </div>

                {/* Search */}
                <input
                  type="text"
                  placeholder="Search squad player by name or role..."
                  value={squadSearchTerm}
                  onChange={(e) => setSquadSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />

                {/* Available Batsmen list */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    AVAILABLE BATSMEN ({availableBatters.length} PLAYERS):
                  </span>

                  {availableBatters
                    .filter((p) => p.name.toLowerCase().includes(squadSearchTerm.toLowerCase()))
                    .map((p, idx) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-600/30 text-cyan-300 font-bold flex items-center justify-center text-[10px]">
                            #{idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-white block">{p.name}</span>
                            <span className="text-[10px] text-slate-400">{p.role} &bull; Right-hand bat</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedNewBatterId(p.id);
                            // Confirm immediately
                            sounds.playClick();
                            const outId = outBatterChoice === 'nonStriker' ? currentInnings.currentNonStrikerId : currentInnings.currentStrikerId;
                            recordDelivery({
                              runsOffBat: 0,
                              isWicket: true,
                              dismissal: dismissalType,
                              outBatterId: outId,
                              newBatterId: p.id
                            });
                            setShowWicketModal(false);
                            setWicketStep(1);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-[11px] shadow transition-all"
                        >
                          Send In &gt;
                        </button>
                      </div>
                    ))}
                </div>

                <p className="text-[10px] text-slate-500 text-center">
                  You can select any player from the full {battingTeam.name} squad roster according to need.
                </p>

                <div className="pt-2 border-t border-slate-800 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setWicketStep(1)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    &larr; Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* OVER COMPLETED / NEW BOWLER MODAL (Strictly disabled if match is completed!) */}
      {showBowlerModal && !isMatchFinished && !isInnings1Finished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0c1427] border border-blue-800/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
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

      {/* FULL AI MATCH REPORT MODAL (Triggered anytime from Live Scoring) */}
      {showAIReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0c1427] border border-purple-500/50 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 my-auto overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-950 via-slate-950 to-blue-950">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-lg shadow-lg">
                  🤖
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>AI Match Intelligence Report</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      GEMINI 3.8 FLASH
                    </span>
                  </h3>
                  <p className="text-xs text-purple-300">
                    Analytical breakdown, turning points, and tactical review
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAIReportModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
              {isGeneratingAI ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-purple-300 font-bold text-sm">Evaluating match momentum, turning points & figures...</p>
                </div>
              ) : (
                (() => {
                  const rep = aiReport || synthesizeLocalCricketReport(match);
                  return (
                    <div className="space-y-4">
                      {/* Headline */}
                      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 p-3.5 rounded-2xl border-l-4 border-l-cyan-400 border border-slate-800">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 block mb-0.5">
                          HEADLINE BULLETIN
                        </span>
                        <h4 className="text-base font-black text-white tracking-wide uppercase">
                          {rep.headline}
                        </h4>
                      </div>

                      {/* Narrative */}
                      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2 text-slate-300 leading-relaxed">
                        {rep.narrative.split('\n\n').map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>

                      {/* Key Turning Points */}
                      <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 space-y-2.5">
                        <span className="text-amber-400 font-bold uppercase text-xs flex items-center gap-1.5">
                          <span>⚡</span>
                          <span>KEY TURNING POINTS</span>
                        </span>
                        <div className="space-y-2">
                          {rep.keyTurningPoints.map((tp) => (
                            <div key={tp.number} className="flex items-start gap-2 text-xs">
                              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                {tp.number}
                              </span>
                              <div>
                                <strong className="text-white">{tp.title}: </strong>
                                <span className="text-slate-400">{tp.description}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* MVPs */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/30">
                          <span className="text-[10px] font-bold text-cyan-300 uppercase block">BATTING MVP</span>
                          <strong className="text-white text-sm block mt-0.5">{rep.battingMvp.playerName}</strong>
                          <span className="text-cyan-400 font-mono text-xs block">{rep.battingMvp.stats}</span>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/30">
                          <span className="text-[10px] font-bold text-emerald-300 uppercase block">BOWLING MVP</span>
                          <strong className="text-white text-sm block mt-0.5">{rep.bowlingMvp.playerName}</strong>
                          <span className="text-emerald-400 font-mono text-xs block">{rep.bowlingMvp.figures}</span>
                        </div>
                      </div>

                      {/* Tactical Verdict */}
                      <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 text-xs text-slate-300 italic">
                        <strong className="text-slate-400 not-italic block text-[10px] uppercase font-bold mb-1">TACTICAL VERDICT:</strong>
                        "{rep.tacticalVerdict}"
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex justify-end gap-2">
              <button
                onClick={() => onNavigatePhase(10)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs"
              >
                View Full Honors (Phase 10)
              </button>
              <button
                onClick={() => setShowAIReportModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOM BATSMAN ADD */}
      {showAddBatterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0c1427] border border-cyan-800/80 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>🏏</span>
                <span>Custom / Change Batsman</span>
              </h3>
              <button onClick={() => setShowAddBatterModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {creaseErrorMessage && (
              <p className="text-xs text-rose-400 font-bold bg-rose-950/60 p-2 rounded-lg border border-rose-800">
                {creaseErrorMessage}
              </p>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Target Crease Position</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBatterSelectionTarget('striker')}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                      batterSelectionTarget === 'striker' ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Striker Crease
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatterSelectionTarget('nonStriker')}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                      batterSelectionTarget === 'nonStriker' ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Non-Striker Crease
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">New Batsman Name</label>
                <input
                  type="text"
                  placeholder="e.g. Babar Azam / Steven Smith"
                  value={customBatterName}
                  onChange={(e) => setCustomBatterName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Playing Role</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['Batsman', 'All-rounder', 'Wicketkeeper', 'Bowler'] as PlayerRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setCustomBatterRole(r)}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                        customBatterRole === r ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateAndAssignCustomBatter}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all"
              >
                Add & Assign to Crease
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
