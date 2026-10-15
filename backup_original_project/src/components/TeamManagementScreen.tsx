import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Shield, Users, Check, ArrowLeft, Star, Award, ShieldAlert } from 'lucide-react';
import { Team, Player, PlayerRole } from '../types/cricket';
import { StorageService } from '../services/storageService';

interface Props {
  onBack: () => void;
  onTeamsUpdated: () => void;
}

const PRESET_ICONS = ['⚡', '🦅', '🐎', '⚔️', '🦁', '🐯', '🛡️', '🌪️', '🎯', '🚀', '👑', '🏏', '🔥', '🏆'];
const PRESET_COLORS = [
  '#008DDA', '#1E3E62', '#F4538A', '#FFB800', '#41B06E',
  '#8E44AD', '#E74C3C', '#16A085', '#E67E22', '#2C3E50'
];

export const TeamManagementScreen: React.FC<Props> = ({ onBack, onTeamsUpdated }) => {
  const [teams, setTeams] = useState<Team[]>(() => StorageService.getTeams());
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form State
  const [teamName, setTeamName] = useState('');
  const [shortName, setShortName] = useState('');
  const [selectedLogo, setSelectedLogo] = useState('⚡');
  const [selectedColor, setSelectedColor] = useState('#008DDA');
  const [playersList, setPlayersList] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState<PlayerRole>('Batsman');

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

  const startCreateTeam = () => {
    setIsCreatingNew(true);
    setEditingTeam(null);
    setTeamName('');
    setShortName('');
    setSelectedLogo('⚡');
    setSelectedColor('#008DDA');
    // Start empty so user can add each player lonely according to their number
    setPlayersList([]);
  };

  const handlePreFillTemplate = () => {
    const defaultRoster: Player[] = [
      { id: `p-${Date.now()}-1`, name: 'Opening Batsman 1', role: 'Batsman', isCaptain: true },
      { id: `p-${Date.now()}-2`, name: 'Opening Batsman 2', role: 'Batsman' },
      { id: `p-${Date.now()}-3`, name: 'Top Order 3', role: 'Batsman', isViceCaptain: true },
      { id: `p-${Date.now()}-4`, name: 'Wicketkeeper Batsman', role: 'Wicketkeeper', isWicketKeeper: true },
      { id: `p-${Date.now()}-5`, name: 'Middle Order 5', role: 'Batsman' },
      { id: `p-${Date.now()}-6`, name: 'All-rounder 1', role: 'All-rounder' },
      { id: `p-${Date.now()}-7`, name: 'All-rounder 2', role: 'All-rounder' },
      { id: `p-${Date.now()}-8`, name: 'Spin Bowler', role: 'Bowler' },
      { id: `p-${Date.now()}-9`, name: 'Fast Bowler 1', role: 'Bowler' },
      { id: `p-${Date.now()}-10`, name: 'Fast Bowler 2', role: 'Bowler' },
      { id: `p-${Date.now()}-11`, name: 'Fast Bowler 3', role: 'Bowler' },
    ];
    setPlayersList(defaultRoster);
  };

  const startEditTeam = (team: Team) => {
    setEditingTeam(team);
    setIsCreatingNew(false);
    setTeamName(team.name);
    setShortName(team.shortName);
    setSelectedLogo(team.logo);
    setSelectedColor(team.primaryColor);
    setPlayersList([...team.players]);
  };

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    const newPlayer: Player = {
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newPlayerName.trim(),
      role: newPlayerRole,
      isCaptain: false,
      isViceCaptain: false,
      isWicketKeeper: newPlayerRole === 'Wicketkeeper'
    };
    setPlayersList([...playersList, newPlayer]);
    setNewPlayerName('');
  };

  const handleRemovePlayer = (id: string) => {
    if (playersList.length <= 11) {
      if (!confirm('A playing team typically needs at least 11 players. Are you sure?')) {
        return;
      }
    }
    setPlayersList(playersList.filter((p) => p.id !== id));
  };

  const toggleCaptain = (id: string) => {
    setPlayersList(playersList.map((p) => ({
      ...p,
      isCaptain: p.id === id ? !p.isCaptain : false
    })));
  };

  const toggleViceCaptain = (id: string) => {
    setPlayersList(playersList.map((p) => ({
      ...p,
      isViceCaptain: p.id === id ? !p.isViceCaptain : false
    })));
  };

  const toggleKeeper = (id: string) => {
    setPlayersList(playersList.map((p) => ({
      ...p,
      isWicketKeeper: p.id === id ? !p.isWicketKeeper : (p.isWicketKeeper && p.id !== id ? false : p.isWicketKeeper)
    })));
  };

  const handleSaveTeam = () => {
    if (!teamName.trim()) {
      alert('Please enter a team name');
      return;
    }
    if (playersList.length < 11) {
      alert('Please add at least 11 players for this team');
      return;
    }

    const teamId = editingTeam ? editingTeam.id : `team-${Date.now()}`;
    const shortCode = (shortName.trim() || teamName.trim().substring(0, 3)).toUpperCase();

    const playingXI = playersList.slice(0, 11).map((p) => p.id);
    const bench = playersList.slice(11).map((p) => p.id);

    const updatedTeam: Team = {
      id: teamId,
      name: teamName.trim(),
      shortName: shortCode,
      primaryColor: selectedColor,
      secondaryColor: '#1E3E62',
      logo: selectedLogo,
      players: playersList,
      playingXIIds: playingXI,
      benchPlayerIds: bench
    };

    StorageService.addOrUpdateTeam(updatedTeam);
    const refreshed = StorageService.getTeams();
    setTeams(refreshed);
    setEditingTeam(null);
    setIsCreatingNew(false);
    onTeamsUpdated();
  };

  const handleDeleteTeam = (teamId: string) => {
    if (teams.length <= 2) {
      alert('You must have at least 2 teams for match setup.');
      return;
    }
    if (confirm('Are you sure you want to delete this team?')) {
      StorageService.deleteTeam(teamId);
      const refreshed = StorageService.getTeams();
      setTeams(refreshed);
      onTeamsUpdated();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="text-right">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 justify-end">
            <Shield className="w-5 h-5 text-blue-400" />
            <span>Team Management</span>
          </h2>
          <p className="text-xs text-slate-400">Hive Local Storage • Custom Rosters</p>
        </div>
      </div>

      {/* If Creating or Editing Team */}
      {(isCreatingNew || editingTeam) ? (
        <div className="bg-slate-900 border border-blue-900/50 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-2xl">{selectedLogo}</span>
              <span>{editingTeam ? 'Edit Team Details' : 'Create New Team'}</span>
            </h3>
            <button
              onClick={() => { setIsCreatingNew(false); setEditingTeam(null); }}
              className="text-xs text-slate-400 hover:text-white px-3 py-1 bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
          </div>

          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Team Name</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Thunderbolts XI"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Short Name (2-4 letters)</label>
              <input
                type="text"
                maxLength={4}
                value={shortName}
                onChange={(e) => setShortName(e.target.value.toUpperCase())}
                placeholder="e.g. TB"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Logo / Emblem Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Select Team Emblem</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedLogo(icon)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    selectedLogo === icon
                      ? 'bg-blue-600 ring-2 ring-blue-400 scale-110 shadow-lg'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Color Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Team Primary Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setSelectedColor(col)}
                  style={{ backgroundColor: col }}
                  className={`w-8 h-8 rounded-full transition-transform flex items-center justify-center ${
                    selectedColor === col ? 'ring-4 ring-white/60 scale-110' : 'hover:scale-105'
                  }`}
                >
                  {selectedColor === col && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Players Roster Section */}
          <div className="border-t border-slate-800 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Squad Players ({playersList.length})</span>
                </h4>
                <p className="text-xs text-slate-400">At least 11 players required for match play</p>
              </div>
            </div>

            {/* Quick Add Player Form */}
            <div className="flex flex-col sm:flex-row gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <input
                type="text"
                placeholder="Player name (e.g. Zain Qureshi)"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
              />
              <select
                value={newPlayerRole}
                onChange={(e) => setNewPlayerRole(e.target.value as PlayerRole)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="Batsman">Batsman</option>
                <option value="Bowler">Bowler</option>
                <option value="All-rounder">All-rounder</option>
                <option value="Wicketkeeper">Wicketkeeper</option>
              </select>
              <button
                type="button"
                onClick={handleAddPlayer}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Player</span>
              </button>
            </div>

            {/* Player List Table */}
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {playersList.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-xl text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 w-5">#{idx + 1}</span>
                    <div>
                      <span className="font-semibold text-white">{p.name}</span>
                      <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {p.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleCaptain(p.id)}
                      title="Captain"
                      className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                        p.isCaptain
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      (C)
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleViceCaptain(p.id)}
                      title="Vice Captain"
                      className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                        p.isViceCaptain
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      (VC)
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleKeeper(p.id)}
                      title="Wicketkeeper"
                      className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                        p.isWicketKeeper
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      (WK)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(p.id)}
                      className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={() => { setIsCreatingNew(false); setEditingTeam(null); }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveTeam}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{editingTeam ? 'Update Team' : 'Save New Team'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Team List Cards */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">
              Registered Teams ({teams.length}) • Fully available in Match Setup
            </p>
            <button
              onClick={startCreateTeam}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Team</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-slate-900 border border-slate-800 hover:border-blue-900/70 rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all group"
              >
                <div
                  className="absolute top-0 left-0 bottom-0 w-2"
                  style={{ backgroundColor: team.primaryColor }}
                />
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md border border-white/10"
                      style={{ backgroundColor: team.primaryColor + '30' }}
                    >
                      {team.logo}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                        {team.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-blue-300">
                          {team.shortName}
                        </span>
                        <span>•</span>
                        <span>{team.players.length} Players</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => startEditTeam(team)}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors"
                      title="Edit Team"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
                      title="Delete Team"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap gap-1.5 text-xs text-slate-300">
                  {team.players.slice(0, 5).map((p) => (
                    <span
                      key={p.id}
                      className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80 text-[11px]"
                    >
                      {p.name} {p.isCaptain && '(C)'} {p.isWicketKeeper && '(WK)'}
                    </span>
                  ))}
                  {team.players.length > 5 && (
                    <span className="text-slate-500 self-center text-[11px]">
                      +{team.players.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
