import { CricketMatch, Team, PlayerCareerStats, MatchPerformanceRecord } from '../types/cricket';
import { DEFAULT_TEAMS } from '../data/defaultTeams';

const STORAGE_KEY_MATCHES = 'cricket_scoreboard_matches_v1';
const STORAGE_KEY_TEAMS = 'cricket_scoreboard_teams_v1';
const STORAGE_KEY_ACTIVE_MATCH = 'cricket_scoreboard_active_match_v1';

// Seed mock completed match between Thunderbolts and Falcons to populate historical data
export function generateSeedMatches(): CricketMatch[] {
  const teamA = DEFAULT_TEAMS[0]; // Thunderbolts
  const teamB = DEFAULT_TEAMS[1]; // Falcons

  const seedMatch: CricketMatch = {
    id: 'match-seed-1',
    title: 'Thunderbolts XI vs Falcons United - Super League Final',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2 + 10800000,
    status: 'completed',
    teamA: { ...teamA },
    teamB: { ...teamB },
    settings: {
      format: 'T20',
      totalOvers: 20,
      maxOversPerBowler: 4,
      ballsPerOver: 6,
      powerplayOvers: 6,
      venue: 'National Cricket Stadium',
      matchDate: '2026-10-04',
      matchTime: '19:30'
    },
    toss: {
      winnerTeamId: teamA.id,
      decision: 'bat'
    },
    currentInningsIndex: 1,
    innings1: {
      inningsNumber: 1,
      battingTeamId: teamA.id,
      battingTeamName: teamA.name,
      bowlingTeamId: teamB.id,
      bowlingTeamName: teamB.name,
      totalRuns: 178,
      totalWickets: 5,
      completedOvers: 20,
      ballsInCurrentOver: 0,
      oversDisplay: '20.0',
      currentRunRate: 8.9,
      extras: { wides: 5, noBalls: 1, byes: 2, legByes: 3, penalty: 0, total: 11 },
      batterStats: [
        { playerId: 'tb-1', name: 'Zayn Malik', runs: 74, balls: 48, fours: 7, sixes: 3, strikeRate: 154.17, isOut: true, dismissalText: 'c Rizwan b Naseem Shah', bowlerName: 'Naseem Shah' },
        { playerId: 'tb-2', name: 'Tariq Aziz', runs: 28, balls: 22, fours: 3, sixes: 1, strikeRate: 127.27, isOut: true, dismissalText: 'b Shaheen Shah', bowlerName: 'Shaheen Shah' },
        { playerId: 'tb-3', name: 'Farhan Saeed', runs: 42, balls: 26, fours: 4, sixes: 2, strikeRate: 161.54, isOut: false, dismissalText: 'not out' },
        { playerId: 'tb-4', name: 'Hamza Bilal', runs: 12, balls: 11, fours: 1, sixes: 0, strikeRate: 109.09, isOut: true, dismissalText: 'c Babar b Shadab Khan', bowlerName: 'Shadab Khan' },
        { playerId: 'tb-5', name: 'Bilal Khan', runs: 9, balls: 8, fours: 0, sixes: 1, strikeRate: 112.5, isOut: true, dismissalText: 'run out (Fakhar)', fielderName: 'Fakhar Zaman' },
        { playerId: 'tb-6', name: 'Saad Rafiq', runs: 2, balls: 5, fours: 0, sixes: 0, strikeRate: 40.0, isOut: false, dismissalText: 'not out' },
      ],
      bowlerStats: [
        { playerId: 'flc-8', name: 'Naseem Shah', overs: 4, ballsInOver: 0, maidens: 0, runsConceded: 32, wickets: 2, economy: 8.0, wides: 2, noBalls: 0, dots: 12 },
        { playerId: 'flc-9', name: 'Mohammad Amir', overs: 4, ballsInOver: 0, maidens: 1, runsConceded: 28, wickets: 1, economy: 7.0, wides: 1, noBalls: 0, dots: 14 },
        { playerId: 'flc-6', name: 'Shadab Khan', overs: 4, ballsInOver: 0, maidens: 0, runsConceded: 38, wickets: 1, economy: 9.5, wides: 1, noBalls: 1, dots: 8 },
        { playerId: 'flc-7', name: 'Imad Wasim', overs: 4, ballsInOver: 0, maidens: 0, runsConceded: 36, wickets: 0, economy: 9.0, wides: 1, noBalls: 0, dots: 9 },
        { playerId: 'flc-11', name: 'Zaman Khan', overs: 4, ballsInOver: 0, maidens: 0, runsConceded: 42, wickets: 0, economy: 10.5, wides: 0, noBalls: 0, dots: 6 },
      ],
      currentStrikerId: 'tb-3',
      currentNonStrikerId: 'tb-6',
      currentBowlerId: 'flc-11',
      deliveries: [],
      fallOfWickets: [
        { wicketNumber: 1, score: 54, overs: '6.2', playerOutName: 'Tariq Aziz' },
        { wicketNumber: 2, score: 126, overs: '14.5', playerOutName: 'Zayn Malik' },
        { wicketNumber: 3, score: 148, overs: '17.1', playerOutName: 'Hamza Bilal' },
        { wicketNumber: 4, score: 165, overs: '18.4', playerOutName: 'Bilal Khan' }
      ],
      partnerships: [
        { batter1Name: 'Zayn Malik', batter2Name: 'Tariq Aziz', runs: 54, balls: 38 },
        { batter1Name: 'Zayn Malik', batter2Name: 'Farhan Saeed', runs: 72, balls: 51 },
        { batter1Name: 'Farhan Saeed', batter2Name: 'Hamza Bilal', runs: 22, balls: 14 },
        { batter1Name: 'Farhan Saeed', batter2Name: 'Bilal Khan', runs: 17, balls: 9 },
        { batter1Name: 'Farhan Saeed', batter2Name: 'Saad Rafiq', runs: 13, balls: 8 }
      ],
      currentPartnership: { batter1Name: 'Farhan Saeed', batter2Name: 'Saad Rafiq', runs: 13, balls: 8 },
      isCompleted: true
    },
    innings2: {
      inningsNumber: 2,
      battingTeamId: teamB.id,
      battingTeamName: teamB.name,
      bowlingTeamId: teamA.id,
      bowlingTeamName: teamA.name,
      totalRuns: 162,
      totalWickets: 9,
      completedOvers: 20,
      ballsInCurrentOver: 0,
      oversDisplay: '20.0',
      currentRunRate: 8.1,
      extras: { wides: 6, noBalls: 1, byes: 1, legByes: 2, penalty: 0, total: 10 },
      batterStats: [
        { playerId: 'flc-1', name: 'Babar Azam', runs: 65, balls: 44, fours: 6, sixes: 2, strikeRate: 147.73, isOut: true, dismissalText: 'c Hamza b Shaheen Shah', bowlerName: 'Shaheen Shah' },
        { playerId: 'flc-2', name: 'Rizwan Ahmed', runs: 34, balls: 28, fours: 4, sixes: 0, strikeRate: 121.43, isOut: true, dismissalText: 'c Tariq b Haris Rauf', bowlerName: 'Haris Rauf' },
        { playerId: 'flc-3', name: 'Fakhar Zaman', runs: 18, balls: 14, fours: 2, sixes: 1, strikeRate: 128.57, isOut: true, dismissalText: 'b Umar Riaz', bowlerName: 'Umar Riaz' },
        { playerId: 'flc-4', name: 'Saim Ayub', runs: 14, balls: 12, fours: 1, sixes: 0, strikeRate: 116.67, isOut: true, dismissalText: 'lbw b Shaheen Shah', bowlerName: 'Shaheen Shah' },
        { playerId: 'flc-5', name: 'Iftikhar Ahmed', runs: 15, balls: 10, fours: 1, sixes: 1, strikeRate: 150.0, isOut: true, dismissalText: 'c Farhan b Haris Rauf', bowlerName: 'Haris Rauf' },
        { playerId: 'flc-6', name: 'Shadab Khan', runs: 8, balls: 6, fours: 1, sixes: 0, strikeRate: 133.33, isOut: true, dismissalText: 'b Shaheen Shah', bowlerName: 'Shaheen Shah' },
        { playerId: 'flc-7', name: 'Imad Wasim', runs: 4, balls: 3, fours: 0, sixes: 0, strikeRate: 133.33, isOut: true, dismissalText: 'run out (Zayn)', fielderName: 'Zayn Malik' },
        { playerId: 'flc-8', name: 'Naseem Shah', runs: 2, balls: 2, fours: 0, sixes: 0, strikeRate: 100.0, isOut: true, dismissalText: 'b Haris Rauf', bowlerName: 'Haris Rauf' },
        { playerId: 'flc-9', name: 'Mohammad Amir', runs: 1, balls: 2, fours: 0, sixes: 0, strikeRate: 50.0, isOut: false, dismissalText: 'not out' },
        { playerId: 'flc-10', name: 'Abrar Ahmed', runs: 0, balls: 1, fours: 0, sixes: 0, strikeRate: 0.0, isOut: false, dismissalText: 'not out' }
      ],
      bowlerStats: [
        { playerId: 'tb-11', name: 'Shaheen Shah', overs: 4, ballsInOver: 0, maidens: 0, runsConceded: 24, wickets: 3, economy: 6.0, wides: 2, noBalls: 0, dots: 14 },
        { playerId: 'tb-10', name: 'Haris Rauf', overs: 4, ballsInOver: 0, maidens: 0, runsConceded: 29, wickets: 3, economy: 7.25, wides: 1, noBalls: 1, dots: 13 },
        { playerId: 'tb-9', name: 'Umar Riaz', overs: 4, ballsInOver: 0, maidens: 0, runsConceded: 35, wickets: 1, economy: 8.75, wides: 2, noBalls: 0, dots: 10 },
        { playerId: 'tb-8', name: 'Arshad Nadeem', overs: 4, ballsInOver: 0, maidens: 0, runsConceded: 38, wickets: 0, economy: 9.5, wides: 1, noBalls: 0, dots: 8 },
        { playerId: 'tb-5', name: 'Bilal Khan', overs: 4, ballsInOver: 0, maidens: 0, runsConceded: 34, wickets: 0, economy: 8.5, wides: 0, noBalls: 0, dots: 9 }
      ],
      currentStrikerId: 'flc-9',
      currentNonStrikerId: 'flc-10',
      currentBowlerId: 'tb-11',
      deliveries: [],
      fallOfWickets: [
        { wicketNumber: 1, score: 68, overs: '8.1', playerOutName: 'Rizwan Ahmed' },
        { wicketNumber: 2, score: 105, overs: '12.4', playerOutName: 'Fakhar Zaman' },
        { wicketNumber: 3, score: 118, overs: '14.2', playerOutName: 'Babar Azam' },
        { wicketNumber: 4, score: 132, overs: '15.5', playerOutName: 'Saim Ayub' },
        { wicketNumber: 5, score: 145, overs: '17.3', playerOutName: 'Iftikhar Ahmed' },
        { wicketNumber: 6, score: 151, overs: '18.1', playerOutName: 'Shadab Khan' },
        { wicketNumber: 7, score: 156, overs: '18.5', playerOutName: 'Imad Wasim' },
        { wicketNumber: 8, score: 159, overs: '19.2', playerOutName: 'Naseem Shah' }
      ],
      partnerships: [],
      currentPartnership: { batter1Name: 'Mohammad Amir', batter2Name: 'Abrar Ahmed', runs: 3, balls: 4 },
      isCompleted: true
    },
    target: 179,
    result: {
      winnerTeamId: teamA.id,
      resultText: 'Thunderbolts XI won by 16 runs',
      marginText: '16 runs',
      playerOfTheMatch: {
        playerId: 'tb-1',
        playerName: 'Zayn Malik',
        teamName: 'Thunderbolts XI',
        performance: '74 (48 balls, 7x4, 3x6) & 1 direct hit run out'
      }
    }
  };

  return [seedMatch];
}

export class StorageService {
  static getTeams(): Team[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TEAMS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    this.saveTeams(DEFAULT_TEAMS);
    return DEFAULT_TEAMS;
  }

  static saveTeams(teams: Team[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(teams));
    } catch {
      // ignore
    }
  }

  static addOrUpdateTeam(team: Team): void {
    const teams = this.getTeams();
    const idx = teams.findIndex((t) => t.id === team.id);
    if (idx >= 0) {
      teams[idx] = team;
    } else {
      teams.push(team);
    }
    this.saveTeams(teams);
  }

  static deleteTeam(teamId: string): void {
    const teams = this.getTeams().filter((t) => t.id !== teamId);
    this.saveTeams(teams);
  }

  static getMatches(): CricketMatch[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_MATCHES);
      if (data !== null) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    // Fresh install starts with a clean slate (no cluttering old mock matches)
    this.saveMatches([]);
    return [];
  }

  static clearAllMatches(): void {
    try {
      localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify([]));
      localStorage.removeItem(STORAGE_KEY_ACTIVE_MATCH);
    } catch {
      // ignore
    }
  }

  static saveMatches(matches: CricketMatch[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(matches));
    } catch {
      // ignore
    }
  }

  static saveMatch(match: CricketMatch): void {
    const matches = this.getMatches();
    const idx = matches.findIndex((m) => m.id === match.id);
    if (idx >= 0) {
      matches[idx] = match;
    } else {
      matches.unshift(match);
    }
    this.saveMatches(matches);
  }

  static deleteMatch(matchId: string): void {
    const matches = this.getMatches().filter((m) => m.id !== matchId);
    this.saveMatches(matches);
  }

  static getActiveMatch(): CricketMatch | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ACTIVE_MATCH);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return null;
  }

  static setActiveMatch(match: CricketMatch | null): void {
    try {
      if (match) {
        localStorage.setItem(STORAGE_KEY_ACTIVE_MATCH, JSON.stringify(match));
      } else {
        localStorage.removeItem(STORAGE_KEY_ACTIVE_MATCH);
      }
    } catch {
      // ignore
    }
  }

  // Aggregate Player Career Statistics across all completed matches
  static getPlayerCareerStats(): PlayerCareerStats[] {
    const matches = this.getMatches().filter((m) => m.status === 'completed');
    const teams = this.getTeams();
    const statsMap: Map<string, PlayerCareerStats> = new Map();

    // Initialize all players from saved teams
    teams.forEach((t) => {
      t.players.forEach((p) => {
        statsMap.set(p.id, {
          playerId: p.id,
          playerName: p.name,
          teamId: t.id,
          teamName: t.name,
          role: p.role,
          matches: 0,
          inningsBatted: 0,
          notOuts: 0,
          runs: 0,
          ballsFaced: 0,
          highestScore: 0,
          highestScoreNotOut: false,
          battingAverage: 0,
          strikeRate: 0,
          fifties: 0,
          centuries: 0,
          fours: 0,
          sixes: 0,
          inningsBowled: 0,
          ballsBowled: 0,
          oversBowledDisplay: '0.0',
          maidens: 0,
          runsConceded: 0,
          wickets: 0,
          bestBowlingWickets: 0,
          bestBowlingRuns: 0,
          bowlingEconomy: 0,
          bowlingAverage: 0,
          bowlingStrikeRate: 0,
          matchPerformances: []
        });
      });
    });

    matches.forEach((m) => {
      const playedInMatch = new Set<string>();

      const processInnings = (inn: typeof m.innings1, opponentTeam: string) => {
        // Batters
        inn.batterStats.forEach((bat) => {
          let stat = statsMap.get(bat.playerId);
          if (!stat) {
            stat = {
              playerId: bat.playerId,
              playerName: bat.name,
              teamId: inn.battingTeamId,
              teamName: inn.battingTeamName,
              role: 'Batsman',
              matches: 0,
              inningsBatted: 0,
              notOuts: 0,
              runs: 0,
              ballsFaced: 0,
              highestScore: 0,
              highestScoreNotOut: false,
              battingAverage: 0,
              strikeRate: 0,
              fifties: 0,
              centuries: 0,
              fours: 0,
              sixes: 0,
              inningsBowled: 0,
              ballsBowled: 0,
              oversBowledDisplay: '0.0',
              maidens: 0,
              runsConceded: 0,
              wickets: 0,
              bestBowlingWickets: 0,
              bestBowlingRuns: 0,
              bowlingEconomy: 0,
              bowlingAverage: 0,
              bowlingStrikeRate: 0,
              matchPerformances: []
            };
            statsMap.set(bat.playerId, stat);
          }
          playedInMatch.add(bat.playerId);
          stat.inningsBatted += 1;
          stat.runs += bat.runs;
          stat.ballsFaced += bat.balls;
          stat.fours += bat.fours;
          stat.sixes += bat.sixes;
          if (!bat.isOut) {
            stat.notOuts += 1;
          }
          if (bat.runs >= 100) stat.centuries += 1;
          else if (bat.runs >= 50) stat.fifties += 1;

          if (bat.runs > stat.highestScore) {
            stat.highestScore = bat.runs;
            stat.highestScoreNotOut = !bat.isOut;
          }

          // Add match performance record
          let perf = stat.matchPerformances.find((p) => p.matchId === m.id);
          if (!perf) {
            perf = {
              matchId: m.id,
              matchTitle: m.title,
              matchDate: m.settings.matchDate,
              opponentTeam,
              venue: m.settings.venue,
              resultSummary: m.result?.resultText
            };
            stat.matchPerformances.push(perf);
          }
          perf.batting = {
            runs: bat.runs,
            balls: bat.balls,
            fours: bat.fours,
            sixes: bat.sixes,
            strikeRate: bat.strikeRate,
            isOut: bat.isOut,
            dismissalText: bat.dismissalText
          };
        });

        // Bowlers
        inn.bowlerStats.forEach((bowl) => {
          let stat = statsMap.get(bowl.playerId);
          if (!stat) {
            stat = {
              playerId: bowl.playerId,
              playerName: bowl.name,
              teamId: inn.bowlingTeamId,
              teamName: inn.bowlingTeamName,
              role: 'Bowler',
              matches: 0,
              inningsBatted: 0,
              notOuts: 0,
              runs: 0,
              ballsFaced: 0,
              highestScore: 0,
              highestScoreNotOut: false,
              battingAverage: 0,
              strikeRate: 0,
              fifties: 0,
              centuries: 0,
              fours: 0,
              sixes: 0,
              inningsBowled: 0,
              ballsBowled: 0,
              oversBowledDisplay: '0.0',
              maidens: 0,
              runsConceded: 0,
              wickets: 0,
              bestBowlingWickets: 0,
              bestBowlingRuns: 0,
              bowlingEconomy: 0,
              bowlingAverage: 0,
              bowlingStrikeRate: 0,
              matchPerformances: []
            };
            statsMap.set(bowl.playerId, stat);
          }
          playedInMatch.add(bowl.playerId);
          stat.inningsBowled += 1;
          const totalBalls = bowl.overs * 6 + bowl.ballsInOver;
          stat.ballsBowled += totalBalls;
          stat.maidens += bowl.maidens;
          stat.runsConceded += bowl.runsConceded;
          stat.wickets += bowl.wickets;

          // Best Bowling
          if (
            bowl.wickets > stat.bestBowlingWickets ||
            (bowl.wickets === stat.bestBowlingWickets && bowl.runsConceded < stat.bestBowlingRuns)
          ) {
            stat.bestBowlingWickets = bowl.wickets;
            stat.bestBowlingRuns = bowl.runsConceded;
          }

          let perf = stat.matchPerformances.find((p) => p.matchId === m.id);
          if (!perf) {
            perf = {
              matchId: m.id,
              matchTitle: m.title,
              matchDate: m.settings.matchDate,
              opponentTeam,
              venue: m.settings.venue,
              resultSummary: m.result?.resultText
            };
            stat.matchPerformances.push(perf);
          }
          perf.bowling = {
            overs: bowl.overs,
            ballsInOver: bowl.ballsInOver,
            oversDisplay: `${bowl.overs}.${bowl.ballsInOver}`,
            maidens: bowl.maidens,
            runsConceded: bowl.runsConceded,
            wickets: bowl.wickets,
            economy: bowl.economy
          };
        });
      };

      processInnings(m.innings1, m.innings1.bowlingTeamName);
      if (m.innings2) {
        processInnings(m.innings2, m.innings2.bowlingTeamName);
      }

      playedInMatch.forEach((pid) => {
        const stat = statsMap.get(pid);
        if (stat) stat.matches += 1;
      });
    });

    // Compute averages, strike rates, economy
    const result: PlayerCareerStats[] = [];
    statsMap.forEach((stat) => {
      // Batting Avg & SR
      const timesDismissed = stat.inningsBatted - stat.notOuts;
      stat.battingAverage = timesDismissed > 0 ? Number((stat.runs / timesDismissed).toFixed(2)) : stat.runs;
      stat.strikeRate = stat.ballsFaced > 0 ? Number(((stat.runs / stat.ballsFaced) * 100).toFixed(2)) : 0;

      // Bowling Avg, Eco, SR
      const totalOvers = Math.floor(stat.ballsBowled / 6);
      const remBalls = stat.ballsBowled % 6;
      stat.oversBowledDisplay = `${totalOvers}.${remBalls}`;
      const overDecimal = totalOvers + remBalls / 6;

      stat.bowlingEconomy = overDecimal > 0 ? Number((stat.runsConceded / overDecimal).toFixed(2)) : 0;
      stat.bowlingAverage = stat.wickets > 0 ? Number((stat.runsConceded / stat.wickets).toFixed(2)) : 0;
      stat.bowlingStrikeRate = stat.wickets > 0 ? Number((stat.ballsBowled / stat.wickets).toFixed(2)) : 0;

      result.push(stat);
    });

    return result.sort((a, b) => b.runs - a.runs);
  }
}
