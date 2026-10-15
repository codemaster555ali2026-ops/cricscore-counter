import React, { useState } from 'react';
import { ArrowLeft, Shield, Check, Play, Award, Coins, Users, Plus, Trash2, Edit3, Sparkles } from 'lucide-react';
import { Team, CricketMatch, MatchFormat, Player, PlayerRole } from '../types/cricket';
import { sounds } from '../services/soundEffects';
import { StorageService } from '../services/storageService';

interface Props {
  teams: Team[];
  onStartMatch: (newMatch: CricketMatch) => void;
  onCancel: () => void;
}

const PRESET_ICONS = ['⚡', '🦅', '🐎', '⚔️', '🦁', '🐯', '🛡️', '🌪️', '🎯', '🚀', '👑', '🏏', '🔥', '🏆'];

export const Phase2TeamSetup: React.FC<Props> = ({ teams, onStartMatch, onCancel }) => {
  // Format & Overs Selection (1 to 20 overs choice, plus T20, One-Day, Test)
  const [format, setFormat] = useState<MatchFormat>('T20');
  const [totalOvers, setTotalOvers] = useState(20);
  const [venue, setVenue] = useState('National Cricket Stadium');
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [matchTime, setMatchTime] = useState('19:00');

  // Team A State (Custom name or selected team + custom players list)
  const [isCustomTeamA, setIsCustomTeamA] = useState(true);
  const [saveTeamAToLibrary, setSaveTeamAToLibrary] = useState(true);
  const [teamAName, setTeamAName] = useState(teams[0]?.name || 'Thunderbolts XI');
  const [teamAShortName, setTeamAShortName] = useState(teams[0]?.shortName || 'TB');
  const [teamALogo, setTeamALogo] = useState(teams[0]?.logo || '⚡');
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>(() =>
    teams[0]?.players ? JSON.parse(JSON.stringify(teams[0].players)) : []
  );

  // Team B State (Custom name or selected team + custom players list)
  const [isCustomTeamB, setIsCustomTeamB] = useState(true);
  const [saveTeamBToLibrary, setSaveTeamBToLibrary] = useState(true);
  const [teamBName, setTeamBName] = useState(teams[1]?.name || 'Falcons United');
  const [teamBShortName, setTeamBShortName] = useState(teams[1]?.shortName || 'FLC');
  const [teamBLogo, setTeamBLogo] = useState(teams[1]?.logo || '🦅');
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>(() =>
    teams[1]?.players ? JSON.parse(JSON.stringify(teams[1].players)) : []
  );

  // Expandable player editors
  const [editingTeamAPlayers, setEditingTeamAPlayers] = useState(true);
  const [editingTeamBPlayers, setEditingTeamBPlayers] = useState(true);
  const [newPlayerNameA, setNewPlayerNameA] = useState('');
  const [newPlayerRoleA, setNewPlayerRoleA] = useState<PlayerRole>('Batsman');
  const [newPlayerNameB, setNewPlayerNameB] = useState('');
  const [newPlayerRoleB, setNewPlayerRoleB] = useState<PlayerRole>('Batsman');

  // Position labels helper
  const getPositionLabel = (index: number) => {
    switch (index) {
      case 0: return 'Opening Batsman #1';
      case 1: return 'Opening Batsman #2';
      case 2: return 'Top Order #3 (One Down)';
      case 3: return 'Middle Order #4';
      case 4: return 'Middle Order #5';
      case 5: return 'Finisher / All-Rounder #6';
      case 6: return 'All-Rounder #7';
      case 7: return 'Bowler / Spinner #8';
      case 8: return 'Fast Bowler #9';
      case 9: return 'Bowler #10';
      case 10: return 'Strike Bowler #11';
      default: return `Substitute / Bench #${index + 1}`;
    }
  };

  const handleClearPlayersA = () => {
    setTeamAPlayers([]);
  };

  const handleFillSampleA = () => {
    const sample: Player[] = [
      { id: `p-a-${Date.now()}-1`, name: 'Opening Batsman 1', role: 'Batsman', isCaptain: true, isViceCaptain: false, isWicketKeeper: false },
      { id: `p-a-${Date.now()}-2`, name: 'Opening Batsman 2', role: 'Batsman', isCaptain: false, isViceCaptain: false, isWicketKeeper: false },
      { id: `p-a-${Date.now()}-3`, name: 'Top Order 3', role: 'Batsman', isCaptain: false, isViceCaptain: true, isWicketKeeper: false },
      { id: `p-a-${Date.now()}-4`, name: 'Middle Order 4', role: 'Batsman', isCaptain: false, isViceCaptain: false, isWicketKeeper: false },
      { id: `p-a-${Date.now()}-5`, name: 'Wicketkeeper Batsman', role: 'Wicketkeeper', isCaptain: false, isViceCaptain: false, isWicketKeeper: true },
      { id: `p-a-${Date.now()}-6`, name: 'All-rounder 1', role: 'All-rounder', isCaptain: false, isViceCaptain: false, isWicketKeeper: false },
      { id: `p-a-${Date.now()}-7`, name: 'All-rounder 2', role: 'All-rounder', isCaptain: false, isViceCaptain: false, isWicketKeeper: false },
      { id: `p-a-${Date.now()}-8`, name: 'Spin Bowler', role: 'Bowler', isCaptain: false, isViceCaptain: false, isWicketKeeper: false },
      { id: `p-a-${Date.now()}-9`, name: 'Fast Bowler 1', role: 'Bowler', isCaptain: false, isViceCaptain: false, isWicketKeeper: false },
      { id: `p-a-${Date.now()}-10`, name: 'Fast Bowler 2', role: 'Bowler', isCaptain: false, isViceCaptain: false, isWicketKeeper: false },
      { id: `p-a-${Date.now()}-11`, name: 'Fast Bowler 3', role: 'Bowler', isCaptain: false, isViceCaptain: false, isWicketKeeper: false },
    ];
    setTeamAPlayers(sample);
  };

  const handleClearPlayersB = () => {
    setTeamBPlayers([]);
  };

  const handleFillSampleB = () => {
    const sample: Player[] = [
      { id: `p-b-${Date.now()}-1`, name: 'Opening Batsman 1', role: 'Batsman', isCaptain: true, isViceCaptain: false, isWicketKeeper: false },
      { id: `p-b-${Date.now()}-2`, name: 'Opening Batsman 2', role: 'Batsman', isCaptain: false, isViceCaptain: false, isWicketKeeper: false },
      { id: `p-b-${Date.now()}-3`, name: 'Top Order 3', role: 'Batsman', isCaptain: false, isViceCaptain: true, isWicketKeeper: false },
      { id: `p-b-${Date.now()}-4`, name: 'Middle Order 4', role: 'Batsman', isCaptain: false, isViceCaptain: false, isWicketKeeper: false },
      { id: `p-b-${Date.now()}-5`, name: 'Wicketkeeper Batsman', role: 'Wicketkeeper', isCaptain: false, isViceCaptain: false, isWicketKeeper: true },
      { id: `p-b-${Date.now()}-6`, name: 'All-rounder 1', role: 'All-rounder', isCaptain: false, isViceCaptain: false, isWicketKeeper: false },
      { id: `p-b-${Date.now()}-7`, name: 'All-rounder 2', role: 'All-rounder', isCaptain: false, isViceCaptain: false, isWicketKeeper: false },
      { id: `p-b-${Date.now()}-8`, name: 'Spin Bowler', role: 'Bowler', isCaptain: false, isViceCaptain: false, isWicketKeeper: false },
      { id: `p-b-${Date.now()}-9`, name: 'Fast Bowler 1', role: 'Bowler', isCaptain: false, isViceCaptain: false, isWicketKeeper: false },
      { id: `p-b-${Date.now()}-10`, name: 'Fast Bowler 2', role: 'Bowler', isCaptain: false, isViceCaptain: false, isWicketKeeper: false },
      { id: `p-b-${Date.now()}-11`, name: 'Fast Bowler 3', role: 'Bowler', isCaptain: false, isViceCaptain: false, isWicketKeeper: false },
    ];
    setTeamBPlayers(sample);
  };

  const toggleCaptainA = (id: string) => {
    setTeamAPlayers(teamAPlayers.map((p) => ({ ...p, isCaptain: p.id === id ? !p.isCaptain : false })));
  };
  const toggleViceCaptainA = (id: string) => {
    setTeamAPlayers(teamAPlayers.map((p) => ({ ...p, isViceCaptain: p.id === id ? !p.isViceCaptain : false })));
  };
  const toggleKeeperA = (id: string) => {
    setTeamAPlayers(teamAPlayers.map((p) => ({ ...p, isWicketKeeper: p.id === id ? !p.isWicketKeeper : false })));
  };

  const toggleCaptainB = (id: string) => {
    setTeamBPlayers(teamBPlayers.map((p) => ({ ...p, isCaptain: p.id === id ? !p.isCaptain : false })));
  };
  const toggleViceCaptainB = (id: string) => {
    setTeamBPlayers(teamBPlayers.map((p) => ({ ...p, isViceCaptain: p.id === id ? !p.isViceCaptain : false })));
  };
  const toggleKeeperB = (id: string) => {
    setTeamBPlayers(teamBPlayers.map((p) => ({ ...p, isWicketKeeper: p.id === id ? !p.isWicketKeeper : false })));
  };

  // Toss State
  const [tossWinner, setTossWinner] = useState<'teamA' | 'teamB'>('teamA');
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl'>('bat');
  const [isFlippingCoin, setIsFlippingCoin] = useState(false);

  // Format selection logic
  const handleFormatChange = (fmt: MatchFormat) => {
    setFormat(fmt);
    if (fmt === 'T20') setTotalOvers(20);
    else if (fmt === 'ODI') setTotalOvers(50);
    else if (fmt === 'Test') setTotalOvers(90);
    else setTotalOvers(10);
  };

  const handleSelectPredefinedTeamA = (teamId: string) => {
    const t = teams.find((item) => item.id === teamId);
    if (t) {
      setTeamAName(t.name);
      setTeamAShortName(t.shortName);
      setTeamALogo(t.logo);
      setTeamAPlayers(JSON.parse(JSON.stringify(t.players)));
    }
  };

  const handleSelectPredefinedTeamB = (teamId: string) => {
    const t = teams.find((item) => item.id === teamId);
    if (t) {
      setTeamBName(t.name);
      setTeamBShortName(t.shortName);
      setTeamBLogo(t.logo);
      setTeamBPlayers(JSON.parse(JSON.stringify(t.players)));
    }
  };

  // Add / Remove / Edit Players for Team A (Lonely one-by-one by number)
  const handleAddPlayerA = () => {
    if (!newPlayerNameA.trim()) return;
    const isFirst = teamAPlayers.length === 0;
    const isSecond = teamAPlayers.length === 1;
    const newPlayer: Player = {
      id: `p-a-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newPlayerNameA.trim(),
      role: newPlayerRoleA,
      isCaptain: isFirst,
      isViceCaptain: isSecond,
      isWicketKeeper: newPlayerRoleA === 'Wicketkeeper'
    };
    const updated = [...teamAPlayers, newPlayer];
    setTeamAPlayers(updated);
    setNewPlayerNameA('');
    // Auto advance suggested role for next lonely player number
    const nextIdx = updated.length;
    if (nextIdx >= 7) setNewPlayerRoleA('Bowler');
    else if (nextIdx >= 5) setNewPlayerRoleA('All-rounder');
    else setNewPlayerRoleA('Batsman');
  };

  const handleRemovePlayerA = (id: string) => {
    setTeamAPlayers(teamAPlayers.filter((p) => p.id !== id));
  };

  const handleUpdatePlayerNameA = (id: string, name: string) => {
    setTeamAPlayers(teamAPlayers.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  // Add / Remove / Edit Players for Team B (Lonely one-by-one by number)
  const handleAddPlayerB = () => {
    if (!newPlayerNameB.trim()) return;
    const isFirst = teamBPlayers.length === 0;
    const isSecond = teamBPlayers.length === 1;
    const newPlayer: Player = {
      id: `p-b-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newPlayerNameB.trim(),
      role: newPlayerRoleB,
      isCaptain: isFirst,
      isViceCaptain: isSecond,
      isWicketKeeper: newPlayerRoleB === 'Wicketkeeper'
    };
    const updated = [...teamBPlayers, newPlayer];
    setTeamBPlayers(updated);
    setNewPlayerNameB('');
    // Auto advance suggested role for next lonely player number
    const nextIdx = updated.length;
    if (nextIdx >= 7) setNewPlayerRoleB('Bowler');
    else if (nextIdx >= 5) setNewPlayerRoleB('All-rounder');
    else setNewPlayerRoleB('Batsman');
  };

  const handleRemovePlayerB = (id: string) => {
    setTeamBPlayers(teamBPlayers.filter((p) => p.id !== id));
  };

  const handleUpdatePlayerNameB = (id: string, name: string) => {
    setTeamBPlayers(teamBPlayers.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  // Coin Toss Flip
  const handleFlipCoin = () => {
    setIsFlippingCoin(true);
    sounds.playClick();
    setTimeout(() => {
      setTossWinner(Math.random() > 0.5 ? 'teamA' : 'teamB');
      setIsFlippingCoin(false);
    }, 600);
  };

  // Build match object and start
  const handleProceed = () => {
    if (!teamAName.trim() || !teamBName.trim()) {
      alert('Please provide names for both Team A and Team B');
      return;
    }
    if (teamAPlayers.length < 2 || teamBPlayers.length < 2) {
      alert('Each team must have players configured.');
      return;
    }

    sounds.playClick();

    const teamAId = `team-a-${Date.now()}`;
    const teamBId = `team-b-${Date.now()}`;

    const finalTeamA: Team = {
      id: teamAId,
      name: teamAName.trim(),
      shortName: (teamAShortName.trim() || teamAName.trim().substring(0, 3)).toUpperCase(),
      primaryColor: '#008DDA',
      secondaryColor: '#1E3E62',
      logo: teamALogo,
      players: teamAPlayers,
      playingXIIds: teamAPlayers.slice(0, 11).map((p) => p.id),
      benchPlayerIds: teamAPlayers.slice(11).map((p) => p.id)
    };

    const finalTeamB: Team = {
      id: teamBId,
      name: teamBName.trim(),
      shortName: (teamBShortName.trim() || teamBName.trim().substring(0, 3)).toUpperCase(),
      primaryColor: '#F4538A',
      secondaryColor: '#FFB800',
      logo: teamBLogo,
      players: teamBPlayers,
      playingXIIds: teamBPlayers.slice(0, 11).map((p) => p.id),
      benchPlayerIds: teamBPlayers.slice(11).map((p) => p.id)
    };

    if (saveTeamAToLibrary) {
      StorageService.addOrUpdateTeam(finalTeamA);
    }
    if (saveTeamBToLibrary) {
      StorageService.addOrUpdateTeam(finalTeamB);
    }

    const isTeamAWinner = tossWinner === 'teamA';
    const teamABatsFirst = isTeamAWinner ? tossDecision === 'bat' : tossDecision === 'bowl';
    const battingTeam = teamABatsFirst ? finalTeamA : finalTeamB;
    const bowlingTeam = teamABatsFirst ? finalTeamB : finalTeamA;

    const striker = battingTeam.players[0];
    const nonStriker = battingTeam.players[1];
    const bowler = bowlingTeam.players[bowlingTeam.players.length - 1];

    const match: CricketMatch = {
      id: `match-${Date.now()}`,
      title: `${finalTeamA.name} vs ${finalTeamB.name}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'live',
      teamA: finalTeamA,
      teamB: finalTeamB,
      settings: {
        format,
        totalOvers,
        maxOversPerBowler: Math.max(1, Math.ceil(totalOvers / 5)),
        ballsPerOver: 6,
        powerplayOvers: Math.ceil(totalOvers * 0.3),
        venue,
        matchDate,
        matchTime
      },
      toss: {
        winnerTeamId: tossWinner === 'teamA' ? teamAId : teamBId,
        decision: tossDecision
      },
      currentInningsIndex: 0,
      innings1: {
        inningsNumber: 1,
        battingTeamId: battingTeam.id,
        battingTeamName: battingTeam.name,
        bowlingTeamId: bowlingTeam.id,
        bowlingTeamName: bowlingTeam.name,
        totalRuns: 0,
        totalWickets: 0,
        completedOvers: 0,
        ballsInCurrentOver: 0,
        oversDisplay: '0.0',
        currentRunRate: 0,
        extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0, total: 0 },
        batterStats: [
          {
            playerId: striker.id,
            name: striker.name,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isOut: false
          },
          {
            playerId: nonStriker.id,
            name: nonStriker.name,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isOut: false
          }
        ],
        bowlerStats: [
          {
            playerId: bowler.id,
            name: bowler.name,
            overs: 0,
            ballsInOver: 0,
            maidens: 0,
            runsConceded: 0,
            wickets: 0,
            economy: 0,
            wides: 0,
            noBalls: 0,
            dots: 0
          }
        ],
        currentStrikerId: striker.id,
        currentNonStrikerId: nonStriker.id,
        currentBowlerId: bowler.id,
        deliveries: [],
        fallOfWickets: [],
        partnerships: [],
        currentPartnership: {
          batter1Name: striker.name,
          batter2Name: nonStriker.name,
          runs: 0,
          balls: 0
        },
        isCompleted: false
      }
    };

    onStartMatch(match);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="text-right">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 justify-end">
            <Shield className="w-5 h-5 text-blue-400" />
            <span>Match Setup & Teams</span>
          </h2>
          <p className="text-xs text-slate-400">Custom Overs (1-20, T20, One-Day, Test) & Custom Names</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
        {/* SECTION 1: FORMAT & CHOICE OF OVERS (1 to 20, T20, One-Day, Test) */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-blue-900/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Match Format & Overs Selection</span>
              </h3>
              <p className="text-xs text-slate-400">Choice of overs from 1 to 20, T20, One-Day (50 ov), and Test</p>
            </div>
            <span className="font-mono text-xs px-3 py-1 rounded-xl bg-blue-600/30 text-cyan-300 font-bold border border-blue-500/40 self-start sm:self-auto">
              Selected: {totalOvers} Overs ({format})
            </span>
          </div>

          {/* Preset Format Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Standard Formats</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => handleFormatChange('T20')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                  format === 'T20' && totalOvers === 20
                    ? 'bg-blue-600 text-white shadow-lg ring-2 ring-cyan-400'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
                }`}
              >
                <span>T20 Format</span>
                <span className="text-[10px] opacity-70">20 Overs</span>
              </button>

              <button
                type="button"
                onClick={() => handleFormatChange('ODI')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                  format === 'ODI' && totalOvers === 50
                    ? 'bg-blue-600 text-white shadow-lg ring-2 ring-cyan-400'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
                }`}
              >
                <span>One-Day (ODI)</span>
                <span className="text-[10px] opacity-70">50 Overs</span>
              </button>

              <button
                type="button"
                onClick={() => handleFormatChange('Test')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                  format === 'Test' && totalOvers === 90
                    ? 'bg-blue-600 text-white shadow-lg ring-2 ring-cyan-400'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
                }`}
              >
                <span>Test Match</span>
                <span className="text-[10px] opacity-70">90 Overs</span>
              </button>

              <button
                type="button"
                onClick={() => handleFormatChange('Custom')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                  format === 'Custom'
                    ? 'bg-blue-600 text-white shadow-lg ring-2 ring-cyan-400'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
                }`}
              >
                <span>Custom Overs</span>
                <span className="text-[10px] opacity-70">Choice: 1 - 20 Ov</span>
              </button>
            </div>
          </div>

          {/* Quick Choice of Overs from 1 to 20 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-300">
                Quick Overs Choice (1 to 20 Overs):
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Custom Input:</span>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={totalOvers}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 1;
                    setTotalOvers(Math.max(1, Math.min(val, 90)));
                    setFormat('Custom');
                  }}
                  className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-xs text-center focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Quick 1 to 20 overs chips */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setTotalOvers(num);
                      if (num === 20) setFormat('T20');
                      else setFormat('Custom');
                    }}
                    className={`w-9 h-8 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center ${
                      totalOvers === num
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-black scale-105 ring-2 ring-cyan-300'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
                <span className="text-cyan-300 font-semibold">Match Rules:</span>
                <span>Max Bowler Quota: <strong className="text-white">{Math.max(1, Math.ceil(totalOvers / 5))} overs</strong></span>
                <span>•</span>
                <span>Powerplay: <strong className="text-white">{Math.ceil(totalOvers * 0.3)} overs</strong></span>
                <span>•</span>
                <span>Balls Per Over: <strong className="text-white">6</strong></span>
              </div>
            </div>
          </div>

          {/* Venue & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Venue / Stadium</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. National Stadium / City Sports Ground"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Match Date & Time</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
                <input
                  type="time"
                  value={matchTime}
                  onChange={(e) => setMatchTime(e.target.value)}
                  className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: TEAMS & PLAYERS SETUP (Full custom names & player customization) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* TEAM A SETUP CARD */}
          <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                TEAM A (HOME)
              </span>
              {/* Prominent Choice Tabs: Custom Team Name vs Pick Saved Team */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCustomTeamA(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isCustomTeamA ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Custom Team Name</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomTeamA(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    !isCustomTeamA ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Pick Saved Team</span>
                </button>
              </div>
            </div>

            {/* Team Selection or Custom Input */}
            {!isCustomTeamA ? (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Select from Saved Teams</label>
                <select
                  value={teams.find((t) => t.name === teamAName)?.id || teams[0]?.id}
                  onChange={(e) => handleSelectPredefinedTeamA(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-blue-500"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.logo} {t.name} ({t.shortName})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Custom Team Name
                    </label>
                    <input
                      type="text"
                      value={teamAName}
                      onChange={(e) => setTeamAName(e.target.value)}
                      placeholder="e.g. Lahore Badshahs / Karachi Kings"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Short Code</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={teamAShortName}
                      onChange={(e) => setTeamAShortName(e.target.value.toUpperCase())}
                      placeholder="TB"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-white text-sm font-mono text-center focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Logo emblem picker */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Emblem Logo</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_ICONS.slice(0, 8).map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setTeamALogo(icon)}
                        className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all ${
                          teamALogo === icon ? 'bg-blue-600 ring-2 ring-cyan-400' : 'bg-slate-900 hover:bg-slate-800'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save to library checkbox */}
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={saveTeamAToLibrary}
                    onChange={(e) => setSaveTeamAToLibrary(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>Save this custom team to my Teams Library (Hive Storage)</span>
                </label>
              </div>
            )}

            {/* Numbered Players Setup (Lonely one-by-one according to numbers) */}
            <div className="border-t border-slate-800 pt-3 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span>Team A Roster: {teamAPlayers.length} of 11 Players</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      teamAPlayers.length >= 11
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {teamAPlayers.length >= 11 ? '✓ Complete Squad' : `Need ${11 - teamAPlayers.length} more`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Add players lonely according to their batting & jersey numbers</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearPlayersA}
                    className="text-[11px] font-bold text-rose-400 hover:text-rose-300 px-2.5 py-1 bg-rose-950/40 rounded-lg border border-rose-900/50 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear (Start Lonely #1)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleFillSampleA}
                    className="text-[11px] font-bold text-slate-300 hover:text-white px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Sample 11</span>
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (teamAPlayers.length / 11) * 100)}%` }}
                />
              </div>

              {/* Step-by-Step Single Player Adder (Lonely Add) */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-blue-900/40 space-y-2">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <span>➕ Add Player #{teamAPlayers.length + 1}</span>
                  <span className="text-slate-400 font-normal">({getPositionLabel(teamAPlayers.length)})</span>
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder={`Enter Player #${teamAPlayers.length + 1} Name...`}
                    value={newPlayerNameA}
                    onChange={(e) => setNewPlayerNameA(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlayerA()}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 font-medium"
                  />
                  <div className="flex gap-1.5">
                    <select
                      value={newPlayerRoleA}
                      onChange={(e) => setNewPlayerRoleA(e.target.value as PlayerRole)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none"
                    >
                      <option value="Batsman">Batsman</option>
                      <option value="Bowler">Bowler</option>
                      <option value="All-rounder">All-rounder</option>
                      <option value="Wicketkeeper">Wicketkeeper</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddPlayerA}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold whitespace-nowrap shadow-md flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add #{teamAPlayers.length + 1}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Numbered Slots List (Individual slots #1 to #N) */}
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {teamAPlayers.length === 0 ? (
                  <div className="p-4 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-xs text-slate-400">
                    No players yet. Type Player #1 name above and click <strong>Add #1</strong> to begin!
                  </div>
                ) : (
                  teamAPlayers.map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800/90 text-xs hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {/* Number Badge */}
                        <span className="w-6 h-6 rounded-lg bg-blue-600/30 border border-blue-500/40 font-mono font-bold text-cyan-300 text-[11px] flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => handleUpdatePlayerNameA(p.id, e.target.value)}
                            className="w-full bg-transparent text-white font-semibold text-xs focus:outline-none border-b border-transparent focus:border-blue-500 px-1 truncate"
                          />
                          <span className="text-[10px] text-slate-500 block truncate">
                            {getPositionLabel(idx)}
                          </span>
                        </div>
                      </div>

                      {/* Role & Role Badges */}
                      <div className="flex items-center gap-1 shrink-0">
                        <select
                          value={p.role}
                          onChange={(e) => {
                            const newRole = e.target.value as PlayerRole;
                            setTeamAPlayers(teamAPlayers.map((item) => (item.id === p.id ? { ...item, role: newRole } : item)));
                          }}
                          className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[10px] text-slate-300 focus:outline-none"
                        >
                          <option value="Batsman">Bat</option>
                          <option value="Bowler">Bowl</option>
                          <option value="All-rounder">All</option>
                          <option value="Wicketkeeper">WK</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => toggleCaptainA(p.id)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            p.isCaptain ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-500 hover:text-white'
                          }`}
                          title="Captain"
                        >
                          (C)
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleViceCaptainA(p.id)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            p.isViceCaptain ? 'bg-blue-500 text-white' : 'bg-slate-950 text-slate-500 hover:text-white'
                          }`}
                          title="Vice Captain"
                        >
                          (VC)
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleKeeperA(p.id)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            p.isWicketKeeper ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-500 hover:text-white'
                          }`}
                          title="Wicketkeeper"
                        >
                          (WK)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePlayerA(p.id)}
                          className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-950/40 rounded transition-colors"
                          title="Remove Player"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {/* Remaining Empty Numbered Slots for Team A */}
                {teamAPlayers.length < 11 && (
                  <div className="space-y-1.5 pt-1.5 opacity-75">
                    {Array.from({ length: 11 - teamAPlayers.length }).map((_, i) => {
                      const slotNum = teamAPlayers.length + i + 1;
                      return (
                        <div
                          key={`empty-slot-a-${slotNum}`}
                          className="flex items-center justify-between p-2 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-xs text-slate-400"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 font-mono font-bold text-slate-500 text-[11px] flex items-center justify-center">
                              #{slotNum}
                            </span>
                            <span className="italic text-slate-400">
                              {getPositionLabel(slotNum - 1)} (Waiting to add lonely #{slotNum})
                            </span>
                          </div>
                          <span className="text-[10px] text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-950/40 border border-blue-900/40">
                            Slot #{slotNum} Ready
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TEAM B SETUP CARD */}
          <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-pink-400">
                TEAM B (AWAY)
              </span>
              {/* Prominent Choice Tabs: Custom Team Name vs Pick Saved Team */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCustomTeamB(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isCustomTeamB ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Custom Team Name</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomTeamB(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    !isCustomTeamB ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Pick Saved Team</span>
                </button>
              </div>
            </div>

            {/* Team Selection or Custom Input */}
            {!isCustomTeamB ? (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Select from Saved Teams</label>
                <select
                  value={teams.find((t) => t.name === teamBName)?.id || teams[1]?.id}
                  onChange={(e) => handleSelectPredefinedTeamB(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-blue-500"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.logo} {t.name} ({t.shortName})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Custom Team Name
                    </label>
                    <input
                      type="text"
                      value={teamBName}
                      onChange={(e) => setTeamBName(e.target.value)}
                      placeholder="e.g. Falcons United / Rawalpindi Stars"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Short Code</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={teamBShortName}
                      onChange={(e) => setTeamBShortName(e.target.value.toUpperCase())}
                      placeholder="FLC"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-white text-sm font-mono text-center focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Logo emblem picker */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Emblem Logo</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_ICONS.slice(0, 8).map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setTeamBLogo(icon)}
                        className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all ${
                          teamBLogo === icon ? 'bg-pink-600 ring-2 ring-pink-400' : 'bg-slate-900 hover:bg-slate-800'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save to library checkbox */}
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={saveTeamBToLibrary}
                    onChange={(e) => setSaveTeamBToLibrary(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-pink-600 focus:ring-0"
                  />
                  <span>Save this custom team to my Teams Library (Hive Storage)</span>
                </label>
              </div>
            )}

            {/* Numbered Players Setup for Team B */}
            <div className="border-t border-slate-800 pt-3 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-pink-400" />
                      <span>Team B Roster: {teamBPlayers.length} of 11 Players</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      teamBPlayers.length >= 11
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {teamBPlayers.length >= 11 ? '✓ Complete Squad' : `Need ${11 - teamBPlayers.length} more`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Add players lonely according to their batting & jersey numbers</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearPlayersB}
                    className="text-[11px] font-bold text-rose-400 hover:text-rose-300 px-2.5 py-1 bg-rose-950/40 rounded-lg border border-rose-900/50 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear (Start Lonely #1)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleFillSampleB}
                    className="text-[11px] font-bold text-slate-300 hover:text-white px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-pink-400" />
                    <span>Sample 11</span>
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-pink-500 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (teamBPlayers.length / 11) * 100)}%` }}
                />
              </div>

              {/* Step-by-Step Single Player Adder (Lonely Add) */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-pink-900/40 space-y-2">
                <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                  <span>➕ Add Player #{teamBPlayers.length + 1}</span>
                  <span className="text-slate-400 font-normal">({getPositionLabel(teamBPlayers.length)})</span>
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder={`Enter Player #${teamBPlayers.length + 1} Name...`}
                    value={newPlayerNameB}
                    onChange={(e) => setNewPlayerNameB(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlayerB()}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-pink-500 font-medium"
                  />
                  <div className="flex gap-1.5">
                    <select
                      value={newPlayerRoleB}
                      onChange={(e) => setNewPlayerRoleB(e.target.value as PlayerRole)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none"
                    >
                      <option value="Batsman">Batsman</option>
                      <option value="Bowler">Bowler</option>
                      <option value="All-rounder">All-rounder</option>
                      <option value="Wicketkeeper">Wicketkeeper</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddPlayerB}
                      className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-bold whitespace-nowrap shadow-md flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add #{teamBPlayers.length + 1}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Numbered Slots List (Individual slots #1 to #N) */}
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {teamBPlayers.length === 0 ? (
                  <div className="p-4 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-xs text-slate-400">
                    No players yet. Type Player #1 name above and click <strong>Add #1</strong> to begin!
                  </div>
                ) : (
                  teamBPlayers.map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800/90 text-xs hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {/* Number Badge */}
                        <span className="w-6 h-6 rounded-lg bg-pink-600/30 border border-pink-500/40 font-mono font-bold text-pink-300 text-[11px] flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => handleUpdatePlayerNameB(p.id, e.target.value)}
                            className="w-full bg-transparent text-white font-semibold text-xs focus:outline-none border-b border-transparent focus:border-pink-500 px-1 truncate"
                          />
                          <span className="text-[10px] text-slate-500 block truncate">
                            {getPositionLabel(idx)}
                          </span>
                        </div>
                      </div>

                      {/* Role & Role Badges */}
                      <div className="flex items-center gap-1 shrink-0">
                        <select
                          value={p.role}
                          onChange={(e) => {
                            const newRole = e.target.value as PlayerRole;
                            setTeamBPlayers(teamBPlayers.map((item) => (item.id === p.id ? { ...item, role: newRole } : item)));
                          }}
                          className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[10px] text-slate-300 focus:outline-none"
                        >
                          <option value="Batsman">Bat</option>
                          <option value="Bowler">Bowl</option>
                          <option value="All-rounder">All</option>
                          <option value="Wicketkeeper">WK</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => toggleCaptainB(p.id)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            p.isCaptain ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-500 hover:text-white'
                          }`}
                          title="Captain"
                        >
                          (C)
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleViceCaptainB(p.id)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            p.isViceCaptain ? 'bg-pink-500 text-white' : 'bg-slate-950 text-slate-500 hover:text-white'
                          }`}
                          title="Vice Captain"
                        >
                          (VC)
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleKeeperB(p.id)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            p.isWicketKeeper ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-500 hover:text-white'
                          }`}
                          title="Wicketkeeper"
                        >
                          (WK)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePlayerB(p.id)}
                          className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-950/40 rounded transition-colors"
                          title="Remove Player"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {/* Remaining Empty Numbered Slots for Team B */}
                {teamBPlayers.length < 11 && (
                  <div className="space-y-1.5 pt-1.5 opacity-75">
                    {Array.from({ length: 11 - teamBPlayers.length }).map((_, i) => {
                      const slotNum = teamBPlayers.length + i + 1;
                      return (
                        <div
                          key={`empty-slot-b-${slotNum}`}
                          className="flex items-center justify-between p-2 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-xs text-slate-400"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 font-mono font-bold text-slate-500 text-[11px] flex items-center justify-center">
                              #{slotNum}
                            </span>
                            <span className="italic text-slate-400">
                              {getPositionLabel(slotNum - 1)} (Waiting to add lonely #{slotNum})
                            </span>
                          </div>
                          <span className="text-[10px] text-pink-400 font-semibold px-2 py-0.5 rounded bg-pink-950/40 border border-pink-900/40">
                            Slot #{slotNum} Ready
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: TOSS DECISION */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Coin Toss</span>
            </h4>
            <button
              onClick={handleFlipCoin}
              disabled={isFlippingCoin}
              className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold hover:bg-amber-500/30 transition-all flex items-center gap-1.5"
            >
              <span>{isFlippingCoin ? 'Flipping...' : '🎲 Random Flip Coin'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-xs text-slate-400 mb-1.5 font-medium">Toss Won By:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTossWinner('teamA')}
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    tossWinner === 'teamA'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span>{teamALogo}</span>
                  <span className="truncate">{teamAName}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTossWinner('teamB')}
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    tossWinner === 'teamB'
                      ? 'bg-pink-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span>{teamBLogo}</span>
                  <span className="truncate">{teamBName}</span>
                </button>
              </div>
            </div>

            <div>
              <span className="block text-xs text-slate-400 mb-1.5 font-medium">Elected To:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTossDecision('bat')}
                  className={`p-3 rounded-xl text-xs font-bold transition-all ${
                    tossDecision === 'bat'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-300 border border-slate-800'
                  }`}
                >
                  🏏 Bat First
                </button>
                <button
                  type="button"
                  onClick={() => setTossDecision('bowl')}
                  className={`p-3 rounded-xl text-xs font-bold transition-all ${
                    tossDecision === 'bowl'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-300 border border-slate-800'
                  }`}
                >
                  🎯 Bowl First
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Start Match CTA */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleProceed}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-bold shadow-xl shadow-blue-600/30 flex items-center gap-2 transition-all transform hover:scale-105"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Live Match ({totalOvers} Ov)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
