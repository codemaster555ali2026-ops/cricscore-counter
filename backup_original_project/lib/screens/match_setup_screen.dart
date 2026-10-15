import 'package:flutter/material.dart';
import '../models/match_model.dart';
import '../models/player_model.dart';
import '../services/admob_service.dart';

class MatchSetupScreen extends StatefulWidget {
  final Function(MatchFormat format, int totalOvers, Team teamA, Team teamB) onStartMatch;

  const MatchSetupScreen({super.key, required this.onStartMatch});

  @override
  State<MatchSetupScreen> createState() => _MatchSetupScreenState();
}

class _MatchSetupScreenState extends State<MatchSetupScreen> {
  MatchFormat _selectedFormat = MatchFormat.t20;
  int _totalOvers = 20;

  // Custom Team Names
  final TextEditingController _teamAController = TextEditingController(text: 'Thunderbolts XI');
  final TextEditingController _teamBController = TextEditingController(text: 'Falcons United');

  // Lonely Player Addition Controllers
  final TextEditingController _playerAInputController = TextEditingController();
  PlayerRole _selectedRoleA = PlayerRole.batsman;
  final List<Player> _teamAPlayers = [];

  final TextEditingController _playerBInputController = TextEditingController();
  PlayerRole _selectedRoleB = PlayerRole.batsman;
  final List<Player> _teamBPlayers = [];

  @override
  void initState() {
    super.initState();
    _fillDefaultSampleRoster();
  }

  void _fillDefaultSampleRoster() {
    _teamAPlayers.clear();
    _teamBPlayers.clear();

    final namesA = [
      'Zayn Malik', 'Tariq Aziz', 'Farhan Saeed', 'Hamza Bilal',
      'Bilal Khan', 'Saad Rafiq', 'Daniyal Qureshi', 'Arshad Nadeem',
      'Umar Riaz', 'Haris Rauf', 'Shaheen Shah'
    ];
    for (int i = 0; i < namesA.length; i++) {
      _teamAPlayers.add(Player(
        id: 'p-a-$i',
        name: namesA[i],
        role: i < 5 ? PlayerRole.batsman : (i < 7 ? PlayerRole.allRounder : PlayerRole.bowler),
        isCaptain: i == 0,
        isViceCaptain: i == 1,
        isWicketKeeper: i == 3,
      ));
    }

    final namesB = [
      'Babar Azam', 'Rizwan Ahmed', 'Fakhar Zaman', 'Saim Ayub',
      'Iftikhar Ahmed', 'Shadab Khan', 'Imad Wasim', 'Naseem Shah',
      'Mohammad Amir', 'Abrar Ahmed', 'Zaman Khan'
    ];
    for (int i = 0; i < namesB.length; i++) {
      _teamBPlayers.add(Player(
        id: 'p-b-$i',
        name: namesB[i],
        role: i < 5 ? PlayerRole.batsman : (i < 7 ? PlayerRole.allRounder : PlayerRole.bowler),
        isCaptain: i == 0,
        isViceCaptain: i == 1,
        isWicketKeeper: i == 1,
      ));
    }
  }

  void _addPlayerALonely() {
    final text = _playerAInputController.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _teamAPlayers.add(Player(
        id: 'p-a-${DateTime.now().millisecondsSinceEpoch}',
        name: text,
        role: _selectedRoleA,
        isCaptain: _teamAPlayers.isEmpty,
        isViceCaptain: _teamAPlayers.length == 1,
        isWicketKeeper: _selectedRoleA == PlayerRole.wicketKeeper,
      ));
      _playerAInputController.clear();
      // Auto-advance role based on player number
      final nextNum = _teamAPlayers.length;
      if (nextNum >= 7) _selectedRoleA = PlayerRole.bowler;
      else if (nextNum >= 5) _selectedRoleA = PlayerRole.allRounder;
      else _selectedRoleA = PlayerRole.batsman;
    });
  }

  void _addPlayerBLonely() {
    final text = _playerBInputController.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _teamBPlayers.add(Player(
        id: 'p-b-${DateTime.now().millisecondsSinceEpoch}',
        name: text,
        role: _selectedRoleB,
        isCaptain: _teamBPlayers.isEmpty,
        isViceCaptain: _teamBPlayers.length == 1,
        isWicketKeeper: _selectedRoleB == PlayerRole.wicketKeeper,
      ));
      _playerBInputController.clear();
      // Auto-advance role based on player number
      final nextNum = _teamBPlayers.length;
      if (nextNum >= 7) _selectedRoleB = PlayerRole.bowler;
      else if (nextNum >= 5) _selectedRoleB = PlayerRole.allRounder;
      else _selectedRoleB = PlayerRole.batsman;
    });
  }

  void _onFormatChanged(MatchFormat format) {
    setState(() {
      _selectedFormat = format;
      if (format == MatchFormat.t20) _totalOvers = 20;
      else if (format == MatchFormat.odi) _totalOvers = 50;
      else if (format == MatchFormat.test) _totalOvers = 90;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('New Match Setup (1-20 Overs & Lonely Players)'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Format Selector: T20, One-Day (ODI), Test, Custom
            const Text('Match Format & Overs', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: ChoiceChip(
                    label: const Text('T20 (20 ov)'),
                    selected: _selectedFormat == MatchFormat.t20 && _totalOvers == 20,
                    onSelected: (_) => _onFormatChanged(MatchFormat.t20),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ChoiceChip(
                    label: const Text('One-Day (50 ov)'),
                    selected: _selectedFormat == MatchFormat.odi && _totalOvers == 50,
                    onSelected: (_) => _onFormatChanged(MatchFormat.odi),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ChoiceChip(
                    label: const Text('Test (90 ov)'),
                    selected: _selectedFormat == MatchFormat.test && _totalOvers == 90,
                    onSelected: (_) => _onFormatChanged(MatchFormat.test),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Choice of overs from 1 to 20
            const Text('Choice of Overs (1 to 20 Overs):', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: List.generate(20, (index) {
                final overNum = index + 1;
                return ChoiceChip(
                  label: Text('$overNum'),
                  selected: _totalOvers == overNum,
                  onSelected: (_) {
                    setState(() {
                      _totalOvers = overNum;
                      if (overNum == 20) _selectedFormat = MatchFormat.t20;
                      else _selectedFormat = MatchFormat.custom;
                    });
                  },
                );
              }),
            ),
            const SizedBox(height: 24),

            // Custom Team Names
            const Text('Custom Team Names', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            TextField(
              controller: _teamAController,
              decoration: const InputDecoration(
                labelText: 'Custom Team A Name',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.shield),
              ),
            ),
            const SizedBox(height: 12),

            // Team A Lonely Players Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Team A Players (${_teamAPlayers.length} of 11):',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
                TextButton.icon(
                  onPressed: () => setState(() => _teamAPlayers.clear()),
                  icon: const Icon(Icons.delete_sweep, size: 16, color: Colors.redAccent),
                  label: const Text('Start Lonely (#1)', style: TextStyle(color: Colors.redAccent, fontSize: 12)),
                ),
              ],
            ),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _playerAInputController,
                    decoration: InputDecoration(
                      labelText: 'Add Player #${_teamAPlayers.length + 1} Name',
                      border: const OutlineInputBorder(),
                      isDense: true,
                    ),
                    onSubmitted: (_) => _addPlayerALonely(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _addPlayerALonely,
                  icon: const Icon(Icons.add),
                  tooltip: 'Add Player Lonely',
                ),
              ],
            ),
            const SizedBox(height: 8),
            // Numbered list of Team A players
            Container(
              height: 120,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: ListView.builder(
                itemCount: _teamAPlayers.length,
                itemBuilder: (context, idx) {
                  final p = _teamAPlayers[idx];
                  return ListTile(
                    dense: true,
                    leading: CircleAvatar(
                      radius: 12,
                      child: Text('${idx + 1}', style: const TextStyle(fontSize: 10)),
                    ),
                    title: Text(p.name, style: const TextStyle(fontSize: 13)),
                    subtitle: Text(p.role.name, style: const TextStyle(fontSize: 10)),
                    trailing: IconButton(
                      icon: const Icon(Icons.close, size: 16, color: Colors.redAccent),
                      onPressed: () => setState(() => _teamAPlayers.removeAt(idx)),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 20),

            TextField(
              controller: _teamBController,
              decoration: const InputDecoration(
                labelText: 'Custom Team B Name',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.shield_outlined),
              ),
            ),
            const SizedBox(height: 12),

            // Team B Lonely Players Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Team B Players (${_teamBPlayers.length} of 11):',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
                TextButton.icon(
                  onPressed: () => setState(() => _teamBPlayers.clear()),
                  icon: const Icon(Icons.delete_sweep, size: 16, color: Colors.redAccent),
                  label: const Text('Start Lonely (#1)', style: TextStyle(color: Colors.redAccent, fontSize: 12)),
                ),
              ],
            ),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _playerBInputController,
                    decoration: InputDecoration(
                      labelText: 'Add Player #${_teamBPlayers.length + 1} Name',
                      border: const OutlineInputBorder(),
                      isDense: true,
                    ),
                    onSubmitted: (_) => _addPlayerBLonely(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _addPlayerBLonely,
                  icon: const Icon(Icons.add),
                  tooltip: 'Add Player Lonely',
                ),
              ],
            ),
            const SizedBox(height: 8),
            // Numbered list of Team B players
            Container(
              height: 120,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: ListView.builder(
                itemCount: _teamBPlayers.length,
                itemBuilder: (context, idx) {
                  final p = _teamBPlayers[idx];
                  return ListTile(
                    dense: true,
                    leading: CircleAvatar(
                      radius: 12,
                      child: Text('${idx + 1}', style: const TextStyle(fontSize: 10)),
                    ),
                    title: Text(p.name, style: const TextStyle(fontSize: 13)),
                    subtitle: Text(p.role.name, style: const TextStyle(fontSize: 10)),
                    trailing: IconButton(
                      icon: const Icon(Icons.close, size: 16, color: Colors.redAccent),
                      onPressed: () => setState(() => _teamBPlayers.removeAt(idx)),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),

            ElevatedButton.icon(
              onPressed: () {
                // AUTOMATIC AD AT MATCH START
                AdMobService.showInterstitialAd();

                final teamA = Team(
                  id: 'team-a',
                  name: _teamAController.text.trim(),
                  shortName: 'TA',
                  players: _teamAPlayers,
                  playingXIIds: _teamAPlayers.map((p) => p.id).toList(),
                );
                final teamB = Team(
                  id: 'team-b',
                  name: _teamBController.text.trim(),
                  shortName: 'TB',
                  players: _teamBPlayers,
                  playingXIIds: _teamBPlayers.map((p) => p.id).toList(),
                );
                widget.onStartMatch(_selectedFormat, _totalOvers, teamA, teamB);
              },
              icon: const Icon(Icons.sports_cricket),
              label: Text('Start Match ($_totalOvers Overs)'),
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.all(16)),
            ),
          ],
        ),
      ),
    );
  }
}
