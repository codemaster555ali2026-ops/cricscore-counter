export type PlayerRole = 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicketkeeper';
export type MatchFormat = 'T20' | 'ODI' | 'Test' | 'Custom';
export type DismissalType =
  | 'Bowled'
  | 'Caught'
  | 'LBW'
  | 'Run Out'
  | 'Stumped'
  | 'Hit Wicket'
  | 'Retired Hurt';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isWicketKeeper?: boolean;
  avatar?: string;
}

export interface BatterStats {
  playerId: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissalText?: string;
  dismissalType?: DismissalType;
  bowlerId?: string;
  bowlerName?: string;
  fielderName?: string;
}

export interface BowlerStats {
  playerId: string;
  name: string;
  overs: number; // completed overs e.g. 3
  ballsInOver: number; // 0..5
  maidens: number;
  runsConceded: number;
  wickets: number;
  economy: number;
  wides: number;
  noBalls: number;
  dots: number;
}

export interface Extras {
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
  penalty: number;
  total: number;
}

export interface BallDelivery {
  ballId: string;
  overNumber: number; // 0-indexed (e.g. 0 means 1st over)
  ballInOver: number; // 1-6 (legal)
  overDisplay: string; // e.g. "16.4"
  batterId: string;
  batterName: string;
  bowlerId: string;
  bowlerName: string;
  runsOffBat: number;
  extrasType?: 'wide' | 'no-ball' | 'bye' | 'leg-bye' | 'penalty';
  extrasRuns: number;
  isLegalDelivery: boolean;
  isWicket: boolean;
  dismissalType?: DismissalType;
  playerOutId?: string;
  playerOutName?: string;
  fielderName?: string;
  commentary: string;
  timestamp: string;
  scoreAfterBall: {
    runs: number;
    wickets: number;
    overs: string;
  };
}

export interface FallOfWicket {
  wicketNumber: number;
  score: number;
  overs: string;
  playerOutName: string;
}

export interface Partnership {
  batter1Name: string;
  batter2Name: string;
  runs: number;
  balls: number;
}

export interface Innings {
  inningsNumber: 1 | 2;
  battingTeamId: string;
  battingTeamName: string;
  bowlingTeamId: string;
  bowlingTeamName: string;
  totalRuns: number;
  totalWickets: number;
  completedOvers: number;
  ballsInCurrentOver: number;
  oversDisplay: string;
  currentRunRate: number;
  extras: Extras;
  batterStats: BatterStats[];
  bowlerStats: BowlerStats[];
  currentStrikerId: string;
  currentNonStrikerId: string;
  currentBowlerId: string;
  previousBowlerId?: string;
  deliveries: BallDelivery[];
  fallOfWickets: FallOfWicket[];
  partnerships: Partnership[];
  currentPartnership: Partnership;
  isCompleted: boolean;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  players: Player[];
  playingXIIds: string[];
  benchPlayerIds: string[];
}

export interface MatchSettings {
  format: MatchFormat;
  totalOvers: number;
  maxOversPerBowler: number;
  ballsPerOver: number;
  powerplayOvers: number;
  venue: string;
  matchDate: string;
  matchTime: string;
}

export interface TossInfo {
  winnerTeamId: string;
  decision: 'bat' | 'bowl';
}

export interface MatchResult {
  winnerTeamId: string | 'tie' | 'draw' | 'no_result';
  resultText: string;
  marginText: string;
  playerOfTheMatch?: {
    playerId: string;
    playerName: string;
    teamName: string;
    performance: string;
    photoUrl?: string;
  };
}

export interface CricketMatch {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  status: 'setup' | 'live' | 'innings_break' | 'completed';
  teamA: Team;
  teamB: Team;
  settings: MatchSettings;
  toss?: TossInfo;
  currentInningsIndex: 0 | 1;
  innings1: Innings;
  innings2?: Innings;
  target?: number;
  result?: MatchResult;
}

export interface MatchPerformanceRecord {
  matchId: string;
  matchTitle: string;
  matchDate: string;
  opponentTeam: string;
  venue: string;
  resultSummary?: string;
  batting?: {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: number;
    isOut: boolean;
    dismissalText?: string;
  };
  bowling?: {
    overs: number;
    ballsInOver: number;
    oversDisplay: string;
    maidens: number;
    runsConceded: number;
    wickets: number;
    economy: number;
  };
}

export interface PlayerCareerStats {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  role: PlayerRole;
  avatar?: string;
  matches: number;
  // Batting stats
  inningsBatted: number;
  notOuts: number;
  runs: number;
  ballsFaced: number;
  highestScore: number;
  highestScoreNotOut: boolean;
  battingAverage: number;
  strikeRate: number;
  fifties: number;
  centuries: number;
  fours: number;
  sixes: number;
  // Bowling stats
  inningsBowled: number;
  ballsBowled: number;
  oversBowledDisplay: string;
  maidens: number;
  runsConceded: number;
  wickets: number;
  bestBowlingWickets: number;
  bestBowlingRuns: number;
  bowlingEconomy: number;
  bowlingAverage: number;
  bowlingStrikeRate: number;
  // Match breakdown
  matchPerformances: MatchPerformanceRecord[];
}

