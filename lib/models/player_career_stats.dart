class MatchPerformanceRecord {
  final String matchId;
  final String matchTitle;
  final String matchDate;
  final String opponentTeam;
  final String venue;
  final int battingRuns;
  final int battingBalls;
  final int fours;
  final int sixes;
  final bool isOut;
  final String? dismissalText;
  final String bowlingOvers;
  final int bowlingRuns;
  final int bowlingWickets;
  final String? resultSummary;

  MatchPerformanceRecord({
    required this.matchId,
    required this.matchTitle,
    required this.matchDate,
    required this.opponentTeam,
    required this.venue,
    this.battingRuns = 0,
    this.battingBalls = 0,
    this.fours = 0,
    this.sixes = 0,
    this.isOut = false,
    this.dismissalText,
    this.bowlingOvers = '0.0',
    this.bowlingRuns = 0,
    this.bowlingWickets = 0,
    this.resultSummary,
  });
}

class PlayerCareerStats {
  final String playerId;
  final String playerName;
  final String teamName;
  final String role;
  int matches;
  int inningsBatted;
  int notOuts;
  int runs;
  int ballsFaced;
  int highestScore;
  bool highestScoreNotOut;
  int fifties;
  int centuries;
  int fours;
  int sixes;

  int inningsBowled;
  int ballsBowled;
  int maidens;
  int runsConceded;
  int wickets;
  int bestBowlingWickets;
  int bestBowlingRuns;

  final List<MatchPerformanceRecord> matchPerformances;

  PlayerCareerStats({
    required this.playerId,
    required this.playerName,
    required this.teamName,
    required this.role,
    this.matches = 0,
    this.inningsBatted = 0,
    this.notOuts = 0,
    this.runs = 0,
    this.ballsFaced = 0,
    this.highestScore = 0,
    this.highestScoreNotOut = false,
    this.fifties = 0,
    this.centuries = 0,
    this.fours = 0,
    this.sixes = 0,
    this.inningsBowled = 0,
    this.ballsBowled = 0,
    this.maidens = 0,
    this.runsConceded = 0,
    this.wickets = 0,
    this.bestBowlingWickets = 0,
    this.bestBowlingRuns = 0,
    List<MatchPerformanceRecord>? matchPerformances,
  }) : matchPerformances = matchPerformances ?? [];

  double get battingAverage {
    final dismissed = inningsBatted - notOuts;
    return dismissed > 0 ? (runs / dismissed) : runs.toDouble();
  }

  double get strikeRate => ballsFaced > 0 ? (runs / ballsFaced) * 100 : 0.0;
  
  double get bowlingEconomy {
    final overs = ballsBowled / 6.0;
    return overs > 0 ? runsConceded / overs : 0.0;
  }

  double get bowlingAverage => wickets > 0 ? runsConceded / wickets.toDouble() : 0.0;
}
