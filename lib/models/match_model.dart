import 'player_model.dart';

enum MatchFormat { t20, odi, test, custom }
enum DismissalType { bowled, caught, lbw, runOut, stumped, hitWicket, retiredHurt }

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
        id: json['id'],
        name: json['name'],
        shortName: json['shortName'],
        primaryColorHex: json['primaryColorHex'] ?? '#008DDA',
        logo: json['logo'] ?? '⚡',
        players: (json['players'] as List)
            .map((p) => Player.fromJson(p))
            .toList(),
        playingXIIds: List<String>.from(json['playingXIIds']),
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
}
