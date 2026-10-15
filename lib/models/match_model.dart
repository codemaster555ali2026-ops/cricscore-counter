import 'player_model.dart';

enum MatchFormat { t20, odi, test, custom }
enum DismissalType { bowled, caught, lbw, runOut, stumped, hitWicket, retiredHurt, handledBall, obstructingField, timedOut }

class Team {
  final String id;
  final String name;
  final String shortName;
  final String primaryColorHex;
  final String logo;
  final List<Player> players;
  final List<String> playingXIIds;
  final List<String> benchPlayerIds;

  Team({
    required this.id,
    required this.name,
    required this.shortName,
    this.primaryColorHex = '#008DDA',
    this.logo = '⚡',
    required this.players,
    required this.playingXIIds,
    this.benchPlayerIds = const [],
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'shortName': shortName,
        'primaryColorHex': primaryColorHex,
        'logo': logo,
        'players': players.map((p) => p.toJson()).toList(),
        'playingXIIds': playingXIIds,
        'benchPlayerIds': benchPlayerIds,
      };

  factory Team.fromJson(Map<String, dynamic> json) => Team(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        shortName: json['shortName'] ?? '',
        primaryColorHex: json['primaryColorHex'] ?? '#008DDA',
        logo: json['logo'] ?? '⚡',
        players: ((json['players'] as List?) ?? [])
            .map((p) => Player.fromJson(p))
            .toList(),
        playingXIIds: List<String>.from(json['playingXIIds'] ?? []),
        benchPlayerIds: List<String>.from(json['benchPlayerIds'] ?? []),
      );
}

class BatterScore {
  final String playerId;
  final String name;
  int runs;
  int balls;
  int fours;
  int sixes;
  bool isOut;
  String? dismissalText;

  BatterScore({
    required this.playerId,
    required this.name,
    this.runs = 0,
    this.balls = 0,
    this.fours = 0,
    this.sixes = 0,
    this.isOut = false,
    this.dismissalText,
  });

  double get strikeRate => balls > 0 ? (runs / balls) * 100 : 0.0;

  Map<String, dynamic> toJson() => {
        'playerId': playerId,
        'name': name,
        'runs': runs,
        'balls': balls,
        'fours': fours,
        'sixes': sixes,
        'isOut': isOut,
        'dismissalText': dismissalText,
      };

  factory BatterScore.fromJson(Map<String, dynamic> json) => BatterScore(
        playerId: json['playerId'] ?? '',
        name: json['name'] ?? '',
        runs: json['runs'] ?? 0,
        balls: json['balls'] ?? 0,
        fours: json['fours'] ?? 0,
        sixes: json['sixes'] ?? 0,
        isOut: json['isOut'] ?? false,
        dismissalText: json['dismissalText'],
      );
}

class BowlerScore {
  final String playerId;
  final String name;
  int overs;
  int ballsInOver;
  int maidens;
  int runsConceded;
  int wickets;

  BowlerScore({
    required this.playerId,
    required this.name,
    this.overs = 0,
    this.ballsInOver = 0,
    this.maidens = 0,
    this.runsConceded = 0,
    this.wickets = 0,
  });

  double get economy {
    final double totalOvers = overs + (ballsInOver / 6.0);
    return totalOvers > 0 ? runsConceded / totalOvers : 0.0;
  }

  Map<String, dynamic> toJson() => {
        'playerId': playerId,
        'name': name,
        'overs': overs,
        'ballsInOver': ballsInOver,
        'maidens': maidens,
        'runsConceded': runsConceded,
        'wickets': wickets,
      };

  factory BowlerScore.fromJson(Map<String, dynamic> json) => BowlerScore(
        playerId: json['playerId'] ?? '',
        name: json['name'] ?? '',
        overs: json['overs'] ?? 0,
        ballsInOver: json['ballsInOver'] ?? 0,
        maidens: json['maidens'] ?? 0,
        runsConceded: json['runsConceded'] ?? 0,
        wickets: json['wickets'] ?? 0,
      );
}

class CommentaryItem {
  final String overBall;
  final String text;
  final int runs;
  final bool isWicket;
  final bool isBoundary;
  final String? timestamp;

  CommentaryItem({
    required this.overBall,
    required this.text,
    required this.runs,
    this.isWicket = false,
    this.isBoundary = false,
    this.timestamp,
  });

  Map<String, dynamic> toJson() => {
        'overBall': overBall,
        'text': text,
        'runs': runs,
        'isWicket': isWicket,
        'isBoundary': isBoundary,
        'timestamp': timestamp,
      };

  factory CommentaryItem.fromJson(Map<String, dynamic> json) => CommentaryItem(
        overBall: json['overBall'] ?? '',
        text: json['text'] ?? '',
        runs: json['runs'] ?? 0,
        isWicket: json['isWicket'] ?? false,
        isBoundary: json['isBoundary'] ?? false,
        timestamp: json['timestamp'],
      );
}

class FallOfWicket {
  final int wicketNumber;
  final String batsmanName;
  final int teamRuns;
  final double over;

  FallOfWicket({
    required this.wicketNumber,
    required this.batsmanName,
    required this.teamRuns,
    required this.over,
  });

  Map<String, dynamic> toJson() => {
        'wicketNumber': wicketNumber,
        'batsmanName': batsmanName,
        'teamRuns': teamRuns,
        'over': over,
      };

  factory FallOfWicket.fromJson(Map<String, dynamic> json) => FallOfWicket(
        wicketNumber: json['wicketNumber'] ?? 1,
        batsmanName: json['batsmanName'] ?? '',
        teamRuns: json['teamRuns'] ?? 0,
        over: (json['over'] as num?)?.toDouble() ?? 0.0,
      );
}

class Partnership {
  final String batter1;
  final String batter2;
  final int runs;
  final int balls;

  Partnership({
    required this.batter1,
    required this.batter2,
    required this.runs,
    required this.balls,
  });

  Map<String, dynamic> toJson() => {
        'batter1': batter1,
        'batter2': batter2,
        'runs': runs,
        'balls': balls,
      };

  factory Partnership.fromJson(Map<String, dynamic> json) => Partnership(
        batter1: json['batter1'] ?? '',
        batter2: json['batter2'] ?? '',
        runs: json['runs'] ?? 0,
        balls: json['balls'] ?? 0,
      );
}

class MatchExtras {
  int wides;
  int noBalls;
  int byes;
  int legByes;

  MatchExtras({
    this.wides = 0,
    this.noBalls = 0,
    this.byes = 0,
    this.legByes = 0,
  });

  int get total => wides + noBalls + byes + legByes;

  Map<String, dynamic> toJson() => {
        'wides': wides,
        'noBalls': noBalls,
        'byes': byes,
        'legByes': legByes,
      };

  factory MatchExtras.fromJson(Map<String, dynamic> json) => MatchExtras(
        wides: json['wides'] ?? 0,
        noBalls: json['noBalls'] ?? 0,
        byes: json['byes'] ?? 0,
        legByes: json['legByes'] ?? 0,
      );
}

class InningsData {
  final int inningsNumber;
  final String teamName;
  int totalRuns;
  int wickets;
  int completedOvers;
  int ballsInOver;
  List<BatterScore> batters;
  List<BowlerScore> bowlers;
  MatchExtras extras;
  List<FallOfWicket> fallOfWickets;
  List<Partnership> partnerships;
  List<String> currentOverDeliveries;

  InningsData({
    required this.inningsNumber,
    required this.teamName,
    this.totalRuns = 0,
    this.wickets = 0,
    this.completedOvers = 0,
    this.ballsInOver = 0,
    required this.batters,
    required this.bowlers,
    required this.extras,
    required this.fallOfWickets,
    required this.partnerships,
    this.currentOverDeliveries = const [],
  });

  double get oversBowled => completedOvers + (ballsInOver / 6.0);
  double get runRate => oversBowled > 0 ? totalRuns / oversBowled : 0.0;

  Map<String, dynamic> toJson() => {
        'inningsNumber': inningsNumber,
        'teamName': teamName,
        'totalRuns': totalRuns,
        'wickets': wickets,
        'completedOvers': completedOvers,
        'ballsInOver': ballsInOver,
        'batters': batters.map((b) => b.toJson()).toList(),
        'bowlers': bowlers.map((b) => b.toJson()).toList(),
        'extras': extras.toJson(),
        'fallOfWickets': fallOfWickets.map((f) => f.toJson()).toList(),
        'partnerships': partnerships.map((p) => p.toJson()).toList(),
        'currentOverDeliveries': currentOverDeliveries,
      };

  factory InningsData.fromJson(Map<String, dynamic> json) => InningsData(
        inningsNumber: json['inningsNumber'] ?? 1,
        teamName: json['teamName'] ?? '',
        totalRuns: json['totalRuns'] ?? 0,
        wickets: json['wickets'] ?? 0,
        completedOvers: json['completedOvers'] ?? 0,
        ballsInOver: json['ballsInOver'] ?? 0,
        batters: ((json['batters'] as List?) ?? [])
            .map((b) => BatterScore.fromJson(b))
            .toList(),
        bowlers: ((json['bowlers'] as List?) ?? [])
            .map((b) => BowlerScore.fromJson(b))
            .toList(),
        extras: MatchExtras.fromJson(json['extras'] ?? {}),
        fallOfWickets: ((json['fallOfWickets'] as List?) ?? [])
            .map((f) => FallOfWicket.fromJson(f))
            .toList(),
        partnerships: ((json['partnerships'] as List?) ?? [])
            .map((p) => Partnership.fromJson(p))
            .toList(),
        currentOverDeliveries: List<String>.from(json['currentOverDeliveries'] ?? []),
      );
}

class CricketMatch {
  final String id;
  final String title;
  final MatchFormat format;
  final int totalOvers;
  final String venue;
  final String date;
  final Team teamA;
  final Team teamB;
  final String tossWinnerTeamId;
  final String tossDecision; // 'bat' | 'bowl'
  int currentInningsNumber;
  InningsData innings1;
  InningsData? innings2;
  int? target;
  bool isCompleted;
  String resultText;
  String? playerOfTheMatch;
  List<CommentaryItem> commentary;

  CricketMatch({
    required this.id,
    required this.title,
    required this.format,
    required this.totalOvers,
    required this.venue,
    required this.date,
    required this.teamA,
    required this.teamB,
    required this.tossWinnerTeamId,
    required this.tossDecision,
    this.currentInningsNumber = 1,
    required this.innings1,
    this.innings2,
    this.target,
    this.isCompleted = false,
    this.resultText = '',
    this.playerOfTheMatch,
    this.commentary = const [],
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'format': format.name,
        'totalOvers': totalOvers,
        'venue': venue,
        'date': date,
        'teamA': teamA.toJson(),
        'teamB': teamB.toJson(),
        'tossWinnerTeamId': tossWinnerTeamId,
        'tossDecision': tossDecision,
        'currentInningsNumber': currentInningsNumber,
        'innings1': innings1.toJson(),
        'innings2': innings2?.toJson(),
        'target': target,
        'isCompleted': isCompleted,
        'resultText': resultText,
        'playerOfTheMatch': playerOfTheMatch,
        'commentary': commentary.map((c) => c.toJson()).toList(),
      };

  factory CricketMatch.fromJson(Map<String, dynamic> json) => CricketMatch(
        id: json['id'] ?? '',
        title: json['title'] ?? '',
        format: MatchFormat.values.firstWhere(
          (e) => e.name == json['format'],
          orElse: () => MatchFormat.t20,
        ),
        totalOvers: json['totalOvers'] ?? 20,
        venue: json['venue'] ?? 'Grand International Stadium',
        date: json['date'] ?? '',
        teamA: Team.fromJson(json['teamA'] ?? {}),
        teamB: Team.fromJson(json['teamB'] ?? {}),
        tossWinnerTeamId: json['tossWinnerTeamId'] ?? '',
        tossDecision: json['tossDecision'] ?? 'bat',
        currentInningsNumber: json['currentInningsNumber'] ?? 1,
        innings1: InningsData.fromJson(json['innings1'] ?? {}),
        innings2: json['innings2'] != null ? InningsData.fromJson(json['innings2']) : null,
        target: json['target'],
        isCompleted: json['isCompleted'] ?? false,
        resultText: json['resultText'] ?? '',
        playerOfTheMatch: json['playerOfTheMatch'],
        commentary: ((json['commentary'] as List?) ?? [])
            .map((c) => CommentaryItem.fromJson(c))
            .toList(),
      );
}
