import 'dart:convert';
import 'package:hive/hive.dart';
import '../models/match_model.dart';

class HiveStorageService {
  static const String boxMatches = 'matches_box';
  static const String boxTeams = 'teams_box';
  static const String boxSettings = 'settings_box';
  static const String activeMatchKey = 'active_match_id';

  static Future<void> init() async {
    await Hive.openBox(boxMatches);
    await Hive.openBox(boxTeams);
    await Hive.openBox(boxSettings);
  }

  /// Auto-Save Match After Every Ball (Phase 11)
  static Future<void> saveCricketMatch(CricketMatch match) async {
    final box = Hive.box(boxMatches);
    await box.put(match.id, jsonEncode(match.toJson()));
    await setActiveMatchId(match.id);
  }

  static CricketMatch? getCricketMatch(String matchId) {
    final box = Hive.box(boxMatches);
    final raw = box.get(matchId);
    if (raw == null) return null;
    return CricketMatch.fromJson(jsonDecode(raw as String));
  }

  static List<CricketMatch> getAllCricketMatches() {
    final box = Hive.box(boxMatches);
    final list = <CricketMatch>[];
    for (var val in box.values) {
      try {
        if (val is String) {
          list.add(CricketMatch.fromJson(jsonDecode(val)));
        }
      } catch (e) {
        // Skip corrupted entries
      }
    }
    // Sort newest first
    list.sort((a, b) => b.date.compareTo(a.date));
    return list;
  }

  static Future<void> deleteMatch(String matchId) async {
    final box = Hive.box(boxMatches);
    await box.delete(matchId);
    final settingsBox = Hive.box(boxSettings);
    if (settingsBox.get(activeMatchKey) == matchId) {
      await settingsBox.delete(activeMatchKey);
    }
  }

  static Future<void> setActiveMatchId(String matchId) async {
    final box = Hive.box(boxSettings);
    await box.put(activeMatchKey, matchId);
  }

  static String? getActiveMatchId() {
    final box = Hive.box(boxSettings);
    return box.get(activeMatchKey) as String?;
  }

  /// Phase 13: Export All Matches to JSON string for backup
  static String exportAllMatchesJson() {
    final all = getAllCricketMatches();
    return jsonEncode(all.map((m) => m.toJson()).toList());
  }

  /// Phase 13: Restore/Import Matches from JSON string
  static Future<int> importMatchesJson(String jsonStr) async {
    final box = Hive.box(boxMatches);
    final decoded = jsonDecode(jsonStr);
    int count = 0;
    if (decoded is List) {
      for (var item in decoded) {
        final match = CricketMatch.fromJson(item as Map<String, dynamic>);
        await box.put(match.id, jsonEncode(match.toJson()));
        count++;
      }
    } else if (decoded is Map<String, dynamic>) {
      final match = CricketMatch.fromJson(decoded);
      await box.put(match.id, jsonEncode(match.toJson()));
      count++;
    }
    return count;
  }

  // Legacy team methods
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
