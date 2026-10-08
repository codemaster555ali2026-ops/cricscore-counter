import 'dart:convert';
import 'package:hive/hive.dart';
import '../models/match_model.dart';
import '../models/player_career_stats.dart';

class HiveStorageService {
  static const String boxMatches = 'matches_box';
  static const String boxTeams = 'teams_box';
  static const String boxPlayerStats = 'player_stats_box';

  static Future<void> init() async {
    await Hive.openBox(boxMatches);
    await Hive.openBox(boxTeams);
    await Hive.openBox(boxPlayerStats);
  }

  static Future<void> saveMatch(String matchId, Map<String, dynamic> matchData) async {
    final box = Hive.box(boxMatches);
    await box.put(matchId, jsonEncode(matchData));
  }

  static List<Map<String, dynamic>> getAllMatches() {
    final box = Hive.box(boxMatches);
    return box.values
        .map((e) => jsonDecode(e as String) as Map<String, dynamic>)
        .toList();
  }

  static Future<void> deleteMatch(String matchId) async {
    final box = Hive.box(boxMatches);
    await box.delete(matchId);
  }

  static Future<void> saveTeam(String teamId, Map<String, dynamic> teamData) async {
    final box = Hive.box(boxTeams);
    await box.put(teamId, jsonEncode(teamData));
  }

  static List<Map<String, dynamic>> getAllTeams() {
    final box = Hive.box(boxTeams);
    return box.values
        .map((e) => jsonDecode(e as String) as Map<String, dynamic>)
        .toList();
  }
}
