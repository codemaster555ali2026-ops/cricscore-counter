import 'package:flutter/material.dart';
import '../models/match_model.dart';
import '../models/player_model.dart';
import '../services/admob_service.dart';
import '../widgets/ad_banner_widget.dart';
import 'match_setup_screen.dart';
import 'live_scoring_screen.dart';
import 'privacy_policy_screen.dart';
import 'phase_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentTabIndex = 0;
  bool _autoDeleteOldHistory = true;
  int _selectedTeamIndex = 0; // 0 for Team A, 1 for Team B

  // Default Sample Teams with 11 Players each
  final List<Player> _teamAPlayers = [
    Player(id: 'p-a-1', name: 'Zayn Malik', role: PlayerRole.batsman, isCaptain: true),
    Player(id: 'p-a-2', name: 'Tariq Aziz', role: PlayerRole.batsman, isViceCaptain: true),
    Player(id: 'p-a-3', name: 'Farhan Saeed', role: PlayerRole.batsman),
    Player(id: 'p-a-4', name: 'Hamza Bilal', role: PlayerRole.wicketKeeper, isWicketKeeper: true),
    Player(id: 'p-a-5', name: 'Bilal Khan', role: PlayerRole.batsman),
    Player(id: 'p-a-6', name: 'Saad Rafiq', role: PlayerRole.allRounder),
    Player(id: 'p-a-7', name: 'Daniyal Qureshi', role: PlayerRole.allRounder),
    Player(id: 'p-a-8', name: 'Arshad Nadeem', role: PlayerRole.bowler),
    Player(id: 'p-a-9', name: 'Umar Riaz', role: PlayerRole.bowler),
    Player(id: 'p-a-10', name: 'Haris Rauf', role: PlayerRole.bowler),
    Player(id: 'p-a-11', name: 'Shaheen Shah', role: PlayerRole.bowler),
  ];

  final List<Player> _teamBPlayers = [
    Player(id: 'p-b-1', name: 'Babar Azam', role: PlayerRole.batsman, isCaptain: true),
    Player(id: 'p-b-2', name: 'Rizwan Ahmed', role: PlayerRole.wicketKeeper, isViceCaptain: true, isWicketKeeper: true),
    Player(id: 'p-b-3', name: 'Fakhar Zaman', role: PlayerRole.batsman),
    Player(id: 'p-b-4', name: 'Saim Ayub', role: PlayerRole.batsman),
    Player(id: 'p-b-5', name: 'Iftikhar Ahmed', role: PlayerRole.allRounder),
    Player(id: 'p-b-6', name: 'Shadab Khan', role: PlayerRole.allRounder),
    Player(id: 'p-b-7', name: 'Imad Wasim', role: PlayerRole.allRounder),
    Player(id: 'p-b-8', name: 'Naseem Shah', role: PlayerRole.bowler),
    Player(id: 'p-b-9', name: 'Mohammad Amir', role: PlayerRole.bowler),
    Player(id: 'p-b-10', name: 'Abrar Ahmed', role: PlayerRole.bowler),
    Player(id: 'p-b-11', name: 'Zaman Khan', role: PlayerRole.bowler),
  ];

  // 15 Complete Phases metadata
  final List<Map<String, dynamic>> _phasesList = [
    {
      'num': 1,
      'title': 'Match Dashboard',
      'desc': 'Recent matches, quick play, and hub controls',
      'icon': Icons.dashboard_outlined,
      'color': const Color(0xFF008DDA),
    },
    {
      'num': 2,
      'title': 'Team & Squad Setup',
      'desc': '11 of 11 player selection, Captains, WK & Lonely Entry',
      'icon': Icons.groups_outlined,
      'color': const Color(0xFF41B06E),
    },
    {
      'num': 3,
      'title': 'Live Scoring Engine',
      'desc': 'Striker, Non-striker, Bowler, strike rotation & keypad',
      'icon': Icons.sports_cricket_outlined,
      'color': const Color(0xFF008DDA),
    },
    {
      'num': 4,
      'title': 'Live Commentary',
      'desc': 'Real-time automated ball-by-ball commentary feed',
      'icon': Icons.mic_none_outlined,
      'color': const Color(0xFF8B5CF6),
    },
    {
      'num': 5,
      'title': 'Complete Scorecard',
      'desc': 'Full batting scorecard, bowling figures & extras summary',
      'icon': Icons.table_chart_outlined,
      'color': const Color(0xFF0284C7),
    },
    {
      'num': 6,
      'title': 'Match Analytics',
      'desc': 'Run rate comparison, partnerships, boundaries & dots',
      'icon': Icons.insights_outlined,
      'color': const Color(0xFF10B981),
    },
    {
      'num': 7,
      'title': 'Match Predictor',
      'desc': 'Projected score at current RR, 6.0, 8.0, 10.0, 12.0 RPO',
      'icon': Icons.auto_graph_outlined,
      'color': const Color(0xFFF59E0B),
    },
    {
      'num': 8,
      'title': 'Win Probability',
      'desc': 'Dynamic real-time winning percentage meter',
      'icon': Icons.query_stats_outlined,
      'color': const Color(0xFF06B6D4),
    },
    {
      'num': 9,
      'title': 'Over-by-Over Charts',
      'desc': 'Visual Manhattan chart & Worm progression curve',
      'icon': Icons.bar_chart_outlined,
      'color': const Color(0xFF6366F1),
    },
    {
      'num': 10,
      'title': 'Match Result & POTM',
      'desc': 'Conclusive win summary & Player of the Match awards',
      'icon': Icons.emoji_events_outlined,
      'color': const Color(0xFFEAB308),
    },
    {
      'num': 11,
      'title': 'Match History Folders',
      'desc': 'Folder archive storage & automatic cache cleanup',
      'icon': Icons.folder_special_outlined,
      'color': const Color(0xFF14B8A6),
    },
    {
      'num': 12,
      'title': 'Scorecard Export',
      'desc': 'Digital match summary and PDF printable reports',
      'icon': Icons.picture_as_pdf_outlined,
      'color': const Color(0xFFEC4899),
    },
    {
      'num': 13,
      'title': 'Share & Backup',
      'desc': 'One-tap WhatsApp share and match data backups',
      'icon': Icons.share_outlined,
      'color': const Color(0xFF22C55E),
    },
    {
      'num': 14,
      'title': 'Fireworks & Fanfare',
      'desc': 'Haptic animations, 4s, 6s, and milestone celebrations',
      'icon': Icons.celebration_outlined,
      'color': const Color(0xFFA855F7),
    },
    {
      'num': 15,
      'title': 'Pure Flutter Engine',
      'desc': 'Native Flutter 3.x, AdMob smart monetization & Privacy Policy',
      'icon': Icons.phone_android_outlined,
      'color': const Color(0xFF38BDF8),
    },
  ];

  void _startNewMatchWorkflow() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => MatchSetupScreen(
          onStartMatch: (format, totalOvers, teamA, teamB) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (context) => LiveScoringScreen(
                  teamA: teamA,
                  teamB: teamB,
                  totalOvers: totalOvers,
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  void _showAddPlayerDialog(int teamIndex) {
    final controller = TextEditingController();
    PlayerRole role = PlayerRole.batsman;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          title: Text(
            teamIndex == 0 ? 'Add Player to Thunderbolts XI' : 'Add Player to Falcons United',
            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: controller,
                autofocus: true,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Enter Player Full Name',
                  hintStyle: const TextStyle(color: Colors.white54),
                  filled: true,
                  fillColor: const Color(0xFF0F172A),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<PlayerRole>(
                value: role,
                dropdownColor: const Color(0xFF0F172A),
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: 'Player Role',
                  labelStyle: const TextStyle(color: Colors.cyanAccent),
                  filled: true,
                  fillColor: const Color(0xFF0F172A),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
                items: PlayerRole.values.map((r) {
                  return DropdownMenuItem(
                    value: r,
                    child: Text(r.name.toUpperCase()),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) setDialogState(() => role = val);
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: Colors.white60)),
            ),
            ElevatedButton(
              onPressed: () {
                final name = controller.text.trim();
                if (name.isNotEmpty) {
                  setState(() {
                    final targetList = teamIndex == 0 ? _teamAPlayers : _teamBPlayers;
                    targetList.add(Player(
                      id: 'p-custom-${DateTime.now().millisecondsSinceEpoch}',
                      name: name,
                      role: role,
                      isCaptain: targetList.isEmpty,
                      isViceCaptain: targetList.length == 1,
                    ));
                  });
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Player "$name" added to squad!'), backgroundColor: Colors.green),
                  );
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF008DDA)),
              child: const Text('Add Player'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B192C),
      drawer: _buildAppDrawer(),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E3E62),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.sports_cricket, color: Colors.cyanAccent, size: 20),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Cricket Scoreboard',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                ),
                Text(
                  '15 Phases Complete Engine',
                  style: TextStyle(fontSize: 10, color: Colors.cyanAccent),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.privacy_tip_outlined, color: Colors.cyanAccent),
            tooltip: 'Phase 15: Privacy Policy',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const PrivacyPolicyScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.ads_click, color: Colors.white70),
            tooltip: 'Test AdMob Interstitial',
            onPressed: () => AdMobService.showInterstitialAd(),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: IndexedStack(
              index: _currentTabIndex,
              children: [
                _buildHomeDashboardTab(),
                _buildTeamsAndPlayersTab(),
                _buildPlayerStatsTab(),
                _build15PhasesTab(),
              ],
            ),
          ),
          // Persistent Google AdMob Banner
          const AdBannerWidget(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentTabIndex,
        onTap: (index) => setState(() => _currentTabIndex = index),
        backgroundColor: const Color(0xFF1E3E62),
        selectedItemColor: Colors.cyanAccent,
        unselectedItemColor: Colors.white60,
        type: BottomNavigationBarType.fixed,
        selectedFontSize: 11,
        unselectedFontSize: 10,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Matches',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.groups_outlined),
            activeIcon: Icon(Icons.groups),
            label: 'Players',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.leaderboard_outlined),
            activeIcon: Icon(Icons.leaderboard),
            label: 'Stats',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.layers_outlined),
            activeIcon: Icon(Icons.layers),
            label: '15 Phases',
          ),
        ],
      ),
    );
  }

  // TAB 0: HOME / MATCHES DASHBOARD
  Widget _buildHomeDashboardTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Hero Cricket Banner with Attractive Graphic
          _buildHeroBanner(),

          const SizedBox(height: 16),

          // Primary Quick Action Buttons (Matching Preview)
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: _startNewMatchWorkflow,
                  icon: const Icon(Icons.play_circle_fill, size: 20),
                  label: const Text('Start Match', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF008DDA),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 4,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => setState(() => _currentTabIndex = 1),
                  icon: const Icon(Icons.shield_outlined, size: 20),
                  label: const Text('Squads (22)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1E293B),
                    foregroundColor: Colors.cyanAccent,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: Colors.white12)),
                    elevation: 2,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => setState(() => _currentTabIndex = 2),
                  icon: const Icon(Icons.emoji_events_outlined, size: 20),
                  label: const Text('Top Stats', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1E293B),
                    foregroundColor: Colors.amberAccent,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: Colors.white12)),
                    elevation: 2,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          // Match Storage Folders Section (Phase 11)
          _buildHistoryFoldersSection(),

          const SizedBox(height: 18),

          // Quick 15 Phases Access Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.layers, color: Colors.cyanAccent, size: 18),
                  SizedBox(width: 6),
                  Text(
                    '15 PHASES SYSTEM',
                    style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                ],
              ),
              TextButton(
                onPressed: () => setState(() => _currentTabIndex = 3),
                child: const Text('View All (15/15) →', style: TextStyle(color: Colors.cyanAccent, fontSize: 12)),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // Preview of 15 Phases Grid (First 4 Quick Cards)
          _buildQuickPhasesGrid(),

          const SizedBox(height: 18),

          // Player Rosters Preview Card
          _buildRostersPreviewCard(),

          const SizedBox(height: 16),

          // AdMob Monetization Overview Card
          _buildAdMobCard(),
        ],
      ),
    );
  }

  // TAB 1: TEAMS & PLAYERS SQUAD MANAGER
  Widget _buildTeamsAndPlayersTab() {
    final activePlayers = _selectedTeamIndex == 0 ? _teamAPlayers : _teamBPlayers;
    final activeTeamName = _selectedTeamIndex == 0 ? 'Thunderbolts XI' : 'Falcons United';

    return Column(
      children: [
        // Team Selector Header
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          color: const Color(0xFF1E293B),
          child: Row(
            children: [
              Expanded(
                child: ChoiceChip(
                  label: Text('Thunderbolts XI (${_teamAPlayers.length})'),
                  selected: _selectedTeamIndex == 0,
                  onSelected: (selected) => setState(() => _selectedTeamIndex = 0),
                  selectedColor: const Color(0xFF008DDA),
                  backgroundColor: const Color(0xFF0F172A),
                  labelStyle: TextStyle(
                    color: _selectedTeamIndex == 0 ? Colors.white : Colors.white70,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ChoiceChip(
                  label: Text('Falcons United (${_teamBPlayers.length})'),
                  selected: _selectedTeamIndex == 1,
                  onSelected: (selected) => setState(() => _selectedTeamIndex = 1),
                  selectedColor: const Color(0xFF41B06E),
                  backgroundColor: const Color(0xFF0F172A),
                  labelStyle: TextStyle(
                    color: _selectedTeamIndex == 1 ? Colors.white : Colors.white70,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),

        // Squad Actions & Count Bar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          color: const Color(0xFF0F172A),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Squad List • ${activePlayers.length} Players',
                style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold),
              ),
              ElevatedButton.icon(
                onPressed: () => _showAddPlayerDialog(_selectedTeamIndex),
                icon: const Icon(Icons.person_add, size: 16),
                label: const Text('Add Player', style: TextStyle(fontSize: 12)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF008DDA),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                ),
              ),
            ],
          ),
        ),

        // Players List
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: activePlayers.length,
            itemBuilder: (context, index) {
              final player = activePlayers[index];
              return Card(
                color: const Color(0xFF1E293B),
                margin: const EdgeInsets.only(bottom: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: _getRoleColor(player.role).withOpacity(0.2),
                    child: Text(
                      '${index + 1}',
                      style: TextStyle(color: _getRoleColor(player.role), fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                  title: Row(
                    children: [
                      Text(
                        player.name,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      const SizedBox(width: 6),
                      if (player.isCaptain)
                        _badgeChip('C', Colors.amber),
                      if (player.isViceCaptain)
                        _badgeChip('VC', Colors.blueAccent),
                      if (player.isWicketKeeper)
                        _badgeChip('WK', Colors.greenAccent),
                    ],
                  ),
                  subtitle: Text(
                    player.role.name.toUpperCase(),
                    style: TextStyle(color: _getRoleColor(player.role), fontSize: 11, fontWeight: FontWeight.w600),
                  ),
                  trailing: Icon(
                    _getRoleIcon(player.role),
                    color: _getRoleColor(player.role),
                    size: 20,
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  // TAB 2: PLAYER STATS & CAREER LEADERBOARD
  Widget _buildPlayerStatsTab() {
    final stats = [
      {'name': 'Zayn Malik', 'team': 'Thunderbolts', 'role': 'Batsman', 'runs': 382, 'hs': '89*', 'sr': 148.5, 'wkts': 0, 'econ': '-'},
      {'name': 'Babar Azam', 'team': 'Falcons', 'role': 'Batsman', 'runs': 415, 'hs': '104*', 'sr': 139.2, 'wkts': 0, 'econ': '-'},
      {'name': 'Rizwan Ahmed', 'team': 'Falcons', 'role': 'WK-Bat', 'runs': 340, 'hs': '78', 'sr': 131.0, 'wkts': 0, 'econ': '-'},
      {'name': 'Shaheen Shah', 'team': 'Thunderbolts', 'role': 'Bowler', 'runs': 45, 'hs': '22*', 'sr': 160.0, 'wkts': 19, 'econ': '6.4'},
      {'name': 'Haris Rauf', 'team': 'Thunderbolts', 'role': 'Bowler', 'runs': 18, 'hs': '11', 'sr': 120.0, 'wkts': 17, 'econ': '7.2'},
      {'name': 'Naseem Shah', 'team': 'Falcons', 'role': 'Bowler', 'runs': 32, 'hs': '14*', 'sr': 145.0, 'wkts': 16, 'econ': '6.8'},
      {'name': 'Shadab Khan', 'team': 'Falcons', 'role': 'All-Rounder', 'runs': 210, 'hs': '52', 'sr': 142.0, 'wkts': 14, 'econ': '7.1'},
      {'name': 'Saad Rafiq', 'team': 'Thunderbolts', 'role': 'All-Rounder', 'runs': 195, 'hs': '48*', 'sr': 136.0, 'wkts': 12, 'econ': '7.5'},
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Header
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFFEAB308), Color(0xFF1E3E62)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text('Career Performance Hub', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              SizedBox(height: 4),
              Text('Real-time tracked batting averages, wickets, strike rate, and best figures.', style: TextStyle(color: Colors.white70, fontSize: 12)),
            ],
          ),
        ),

        const SizedBox(height: 16),

        const Text('PLAYER LEADERBOARDS & STATS', style: TextStyle(color: Colors.cyanAccent, fontWeight: FontWeight.bold, fontSize: 13)),
        const SizedBox(height: 10),

        ...stats.map((s) => Card(
              color: const Color(0xFF1E293B),
              margin: const EdgeInsets.only(bottom: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: const Color(0xFF008DDA).withOpacity(0.2),
                      child: const Icon(Icons.person, color: Colors.cyanAccent),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(s['name'] as String, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                          Text('${s['team']} • ${s['role']}', style: const TextStyle(color: Colors.white54, fontSize: 11)),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('${s['runs']} Runs (HS: ${s['hs']})', style: const TextStyle(color: Colors.amberAccent, fontWeight: FontWeight.bold, fontSize: 12)),
                        Text('SR: ${s['sr']} • Wkts: ${s['wkts']} (Econ: ${s['econ']})', style: const TextStyle(color: Colors.cyanAccent, fontSize: 11)),
                      ],
                    ),
                  ],
                ),
              ),
            )),
      ],
    );
  }

  // TAB 3: COMPLETE 15 PHASES EXPLORER
  Widget _build15PhasesTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Header
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF008DDA), Color(0xFF1E3E62)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text('Complete 15 Phases Architecture', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              SizedBox(height: 4),
              Text('Explore and execute each phase individually. From Match Setup to Pure Flutter 3 Engine & Privacy Policy.', style: TextStyle(color: Colors.white70, fontSize: 12)),
            ],
          ),
        ),

        const SizedBox(height: 14),

        ..._phasesList.map((p) => Card(
              color: const Color(0xFF1E293B),
              margin: const EdgeInsets.only(bottom: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: BorderSide(color: (p['color'] as Color).withOpacity(0.2))),
              child: ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: (p['color'] as Color).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(p['icon'] as IconData, color: p['color'] as Color, size: 22),
                ),
                title: Text('Phase ${p['num']}: ${p['title']}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                subtitle: Text(p['desc'] as String, style: const TextStyle(color: Colors.white60, fontSize: 11)),
                trailing: const Icon(Icons.arrow_forward_ios, color: Colors.white38, size: 14),
                onTap: () {
                  if (p['num'] == 2) {
                    _startNewMatchWorkflow();
                  } else {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => PhaseDetailScreen(
                          phaseNumber: p['num'],
                          title: p['title'],
                          subtitle: p['desc'],
                          icon: p['icon'],
                          themeColor: p['color'],
                        ),
                      ),
                    );
                  }
                },
              ),
            )),
      ],
    );
  }

  // WIDGET HELPERS
  Widget _buildHeroBanner() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF008DDA), Color(0xFF1E3E62)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF008DDA).withOpacity(0.3),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          // Cricket Icon Graphic
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.cyanAccent.withOpacity(0.5), width: 2),
            ),
            child: const Icon(Icons.sports_cricket, color: Colors.cyanAccent, size: 36),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text(
                    '15 PHASES INTEGRATED',
                    style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Cricket Scoreboard Pro',
                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Real-time striking engine, ball commentary, 22 squad players & AdMob smart monetization.',
                  style: TextStyle(color: Colors.white70, fontSize: 11, height: 1.3),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryFoldersSection() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.folder_outlined, color: Colors.cyanAccent, size: 18),
                  SizedBox(width: 8),
                  Text(
                    'Phase 11: Match Storage Folders',
                    style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              InkWell(
                onTap: () {
                  setState(() => _autoDeleteOldHistory = !_autoDeleteOldHistory);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(_autoDeleteOldHistory ? 'Auto-clean old history enabled.' : 'Auto-clean old history disabled.'),
                    ),
                  );
                },
                child: Row(
                  children: [
                    Icon(
                      _autoDeleteOldHistory ? Icons.check_box : Icons.check_box_outline_blank,
                      size: 16,
                      color: Colors.cyanAccent,
                    ),
                    const SizedBox(width: 4),
                    const Text('Auto-Clean', style: TextStyle(color: Colors.cyanAccent, fontSize: 11)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _folderChip('📁 Completed Matches (8)', Colors.greenAccent),
                const SizedBox(width: 8),
                _folderChip('📁 T20 League Cup (4)', Colors.blueAccent),
                const SizedBox(width: 8),
                _folderChip('📁 Quick Practice (3)', Colors.orangeAccent),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _folderChip(String name, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(name, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600)),
    );
  }

  Widget _buildQuickPhasesGrid() {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: 4,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 1.45,
      ),
      itemBuilder: (context, index) {
        final item = _phasesList[index];
        return InkWell(
          onTap: () {
            if (item['num'] == 2) {
              _startNewMatchWorkflow();
            } else {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => PhaseDetailScreen(
                    phaseNumber: item['num'],
                    title: item['title'],
                    subtitle: item['desc'],
                    icon: item['icon'],
                    themeColor: item['color'],
                  ),
                ),
              );
            }
          },
          borderRadius: BorderRadius.circular(14),
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: (item['color'] as Color).withOpacity(0.2)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: (item['color'] as Color).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(item['icon'] as IconData, size: 18, color: item['color'] as Color),
                    ),
                    Text('P${item['num']}', style: TextStyle(color: (item['color'] as Color), fontWeight: FontWeight.bold, fontSize: 11)),
                  ],
                ),
                Text(item['title'], style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold), maxLines: 1),
                Text(item['desc'], style: const TextStyle(color: Colors.white60, fontSize: 10), maxLines: 1),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildRostersPreviewCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.person_pin_outlined, color: Colors.amber, size: 18),
                  SizedBox(width: 8),
                  Text(
                    'Squads & Players (11 of 11 Each)',
                    style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              InkWell(
                onTap: () => setState(() => _currentTabIndex = 1),
                child: const Text('Manage →', style: TextStyle(color: Colors.cyanAccent, fontSize: 12)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            '• Thunderbolts XI: Zayn Malik (C), Tariq Aziz (VC), Farhan Saeed, Hamza Bilal (WK), Bilal Khan, etc.\n• Falcons United: Babar Azam (C), Rizwan Ahmed (WK/VC), Fakhar Zaman, Saim Ayub, etc.',
            style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.5),
          ),
        ],
      ),
    );
  }

  Widget _buildAdMobCard() {
    return Card(
      color: const Color(0xFF1E293B),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(14.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: const [
                Icon(Icons.monetization_on, color: Colors.amber, size: 20),
                SizedBox(width: 8),
                Text(
                  'Google AdMob Monetization (Max 8 Ads Cap)',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ],
            ),
            const SizedBox(height: 6),
            const Text(
              'Active: Bottom Banner (320x50), Interstitial on Over End, and Rewarded Video Ads.',
              style: TextStyle(color: Colors.white70, fontSize: 11),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => AdMobService.showInterstitialAd(),
                    icon: const Icon(Icons.fullscreen, size: 16),
                    label: const Text('Test Interstitial', style: TextStyle(fontSize: 11)),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      AdMobService.showRewardedAd(
                        onUserEarnedReward: (r) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Claimed +50 Cricket Pro Coins!')),
                          );
                        },
                      );
                    },
                    icon: const Icon(Icons.videocam, size: 16),
                    label: const Text('Test Rewarded', style: TextStyle(fontSize: 11)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _badgeChip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }

  Color _getRoleColor(PlayerRole role) {
    switch (role) {
      case PlayerRole.batsman:
        return Colors.blueAccent;
      case PlayerRole.bowler:
        return Colors.greenAccent;
      case PlayerRole.allRounder:
        return Colors.purpleAccent;
      case PlayerRole.wicketKeeper:
        return Colors.orangeAccent;
    }
  }

  IconData _getRoleIcon(PlayerRole role) {
    switch (role) {
      case PlayerRole.batsman:
        return Icons.sports_cricket;
      case PlayerRole.bowler:
        return Icons.sports_baseball;
      case PlayerRole.allRounder:
        return Icons.star_half;
      case PlayerRole.wicketKeeper:
        return Icons.pan_tool;
    }
  }

  Widget _buildAppDrawer() {
    return Drawer(
      backgroundColor: const Color(0xFF0F172A),
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF008DDA), Color(0xFF1E3E62)],
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: const [
                Icon(Icons.sports_cricket, color: Colors.cyanAccent, size: 36),
                SizedBox(height: 8),
                Text('Cricket Scoreboard Pro', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                Text('15 Phases Complete Architecture', style: TextStyle(color: Colors.cyanAccent, fontSize: 12)),
              ],
            ),
          ),
          ListTile(
            leading: const Icon(Icons.home, color: Colors.cyanAccent),
            title: const Text('Match Hub', style: TextStyle(color: Colors.white)),
            onTap: () {
              Navigator.pop(context);
              setState(() => _currentTabIndex = 0);
            },
          ),
          ListTile(
            leading: const Icon(Icons.groups, color: Colors.greenAccent),
            title: const Text('Teams & Squad Players (22)', style: TextStyle(color: Colors.white)),
            onTap: () {
              Navigator.pop(context);
              setState(() => _currentTabIndex = 1);
            },
          ),
          ListTile(
            leading: const Icon(Icons.leaderboard, color: Colors.amberAccent),
            title: const Text('Player Career Stats', style: TextStyle(color: Colors.white)),
            onTap: () {
              Navigator.pop(context);
              setState(() => _currentTabIndex = 2);
            },
          ),
          ListTile(
            leading: const Icon(Icons.layers, color: Colors.purpleAccent),
            title: const Text('15 Phases Explorer', style: TextStyle(color: Colors.white)),
            onTap: () {
              Navigator.pop(context);
              setState(() => _currentTabIndex = 3);
            },
          ),
          const Divider(color: Colors.white12),
          ListTile(
            leading: const Icon(Icons.shield_outlined, color: Colors.cyanAccent, size: 20),
            title: const Text('Phase 15: Privacy Policy', style: TextStyle(color: Colors.white, fontSize: 13)),
            onTap: () {
              Navigator.pop(context);
              Navigator.push(context, MaterialPageRoute(builder: (c) => const PrivacyPolicyScreen()));
            },
          ),
        ],
      ),
    );
  }
}
