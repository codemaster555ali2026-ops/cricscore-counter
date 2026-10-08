import 'package:flutter/material.dart';
import '../models/match_model.dart';
import '../models/player_model.dart';
import '../services/admob_service.dart';
import 'privacy_policy_screen.dart';

class PhaseDetailScreen extends StatelessWidget {
  final int phaseNumber;
  final String title;
  final String subtitle;
  final IconData icon;
  final Color themeColor;

  const PhaseDetailScreen({
    super.key,
    required this.phaseNumber,
    required this.title,
    required this.subtitle,
    required this.icon,
    this.themeColor = const Color(0xFF008DDA),
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B192C),
      appBar: AppBar(
        title: Text('Phase $phaseNumber: $title'),
        backgroundColor: const Color(0xFF1E3E62),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Hero Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [themeColor, const Color(0xFF1E3E62)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: themeColor.withOpacity(0.3),
                    blurRadius: 16,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(icon, color: Colors.white, size: 28),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.cyanAccent.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: Colors.cyanAccent.withOpacity(0.4)),
                              ),
                              child: Text(
                                'PHASE $phaseNumber ARCHITECTURE',
                                style: const TextStyle(
                                  color: Colors.cyanAccent,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              title,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    subtitle,
                    style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Feature Details for this Phase
            _buildPhaseFeatures(context),

            const SizedBox(height: 24),

            // Action Button
            ElevatedButton.icon(
              onPressed: () => Navigator.pop(context),
              icon: const Icon(Icons.arrow_back),
              label: const Text('Back to Cricket Dashboard'),
              style: ElevatedButton.styleFrom(
                backgroundColor: themeColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPhaseFeatures(BuildContext context) {
    switch (phaseNumber) {
      case 1:
        return _featureCard(
          'Phase 1: Match Dashboard & Hub',
          '• Instant match start with 1 to 20 overs\n• Real-time match resume capabilities\n• Clean history management and quick play\n• Direct access to player statistics and team rosters',
          Icons.dashboard_outlined,
        );
      case 2:
        return _featureCard(
          'Phase 2: Team Setup & Playing XI Selection',
          '• Full Playing XI selection (11 of 11 players)\n• Captain (C) and Vice-Captain (VC) assignments\n• Wicket-Keeper (WK) roles\n• Lonely Player Entry for quick unassisted player addition\n• Custom team branding & color themes',
          Icons.groups_outlined,
        );
      case 3:
        return _featureCard(
          'Phase 3: Live Scoring & Strike Engine',
          '• Real-time Striker & Non-Striker batsman tracking\n• Live strike rate, 4s, 6s, and balls faced\n• Bowler overs, maidens, runs, wickets, and economy\n• Instant strike rotation on odd runs & over completion\n• Comprehensive extras (Wide, No-Ball, Byes, Leg-Byes)',
          Icons.sports_cricket_outlined,
        );
      case 4:
        return _featureCard(
          'Phase 4: Ball-by-Ball Live Commentary',
          '• Automated intelligent commentary for every ball\n• Dynamic boundary excitement descriptions\n• Wicket drama and dismissal notes\n• Over summary milestones',
          Icons.mic_none_outlined,
        );
      case 5:
        return _featureCard(
          'Phase 5: Complete Scorecard & Batting/Bowling',
          '• Professional batting scorecard table\n• Detailed bowling analysis (O-M-R-W-Econ)\n• Fall of Wickets (FOW) timeline\n• Extras summary (Wides, No Balls, Byes)',
          Icons.table_chart_outlined,
        );
      case 6:
        return _featureCard(
          'Phase 6: Match Analytics & Run Rates',
          '• Current Run Rate (CRR) calculation\n• Required Run Rate (RRR) for 2nd innings chase\n• Boundary percentage and dot-ball counters\n• Partnership analysis',
          Icons.insights_outlined,
        );
      case 7:
        return _featureCard(
          'Phase 7: Match Predictor & Projections',
          '• Projected total at Current Run Rate\n• Projected score at 6.0 RPO, 8.0 RPO, 10.0 RPO, and 12.0 RPO\n• Target defense probability calculation',
          Icons.auto_graph_outlined,
        );
      case 8:
        return _featureCard(
          'Phase 8: Dynamic Win Probability Meter',
          '• Live animated percentage bar (Team A vs Team B)\n• Adjusts on every single ball, boundary, and wicket\n• Contextual algorithm based on required runs vs balls left',
          Icons.query_stats_outlined,
        );
      case 9:
        return _featureCard(
          'Phase 9: Over-by-Over Worm & Manhattan Chart',
          '• Visual bars for runs scored in each over\n• Color-coded boundary overs and maiden overs\n• Wicket icons embedded above corresponding overs',
          Icons.bar_chart_outlined,
        );
      case 10:
        return _featureCard(
          'Phase 10: Match Result & Player of the Match',
          '• Conclusive victory announcement (Runs or Wickets)\n• Top batsman and top bowler performance highlights\n• Automated Player of the Match calculation',
          Icons.emoji_events_outlined,
        );
      case 11:
        return _featureCard(
          'Phase 11: Match Folders & Storage',
          '• Organized folders for Club Matches, Tournaments, Practice\n• Local offline storage (Hive fast DB)\n• Auto-delete old history toggle to keep storage minimal\n• Instant search across past matches',
          Icons.folder_special_outlined,
        );
      case 12:
        return _featureCard(
          'Phase 12: Scorecard Report & Print Export',
          '• Formatted match summary report\n• Clean printable text and digital scorecard\n• Ready for match officials and team captains',
          Icons.picture_as_pdf_outlined,
        );
      case 13:
        return _featureCard(
          'Phase 13: WhatsApp & Social Sharing',
          '• One-tap match summary export for WhatsApp\n• Live score text format for club groups\n• Complete match result broadcast',
          Icons.share_outlined,
        );
      case 14:
        return _featureCard(
          'Phase 14: Fireworks & Boundary Celebrations',
          '• Haptic and visual celebrations on 4s and 6s\n• Wicket celebration alert overlay\n• Century, Fifty, and Match Win fanfare',
          Icons.celebration_outlined,
        );
      case 15:
        return Column(
          children: [
            _featureCard(
              'Phase 15: Pure Flutter & AdMob Engine',
              '• 100% native Flutter 3.x with Material 3 Dark theme\n• High performance 60+ FPS rendering\n• Google AdMob smart monetization (max 8 ads per match cap)\n• Google Play Store compliant Privacy Policy screen',
              Icons.phone_android_outlined,
            ),
            const SizedBox(height: 12),
            Card(
              color: const Color(0xFF1E3E62),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: const [
                        Icon(Icons.privacy_tip_outlined, color: Colors.cyanAccent, size: 22),
                        SizedBox(width: 10),
                        Text(
                          'Google Play Privacy Policy',
                          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Phase 15 requires an explicit, accessible Privacy Policy for Google Play Store compliance, detailing AdMob data collection, offline Hive storage, and user privacy safeguards.',
                      style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.4),
                    ),
                    const SizedBox(height: 14),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => const PrivacyPolicyScreen()),
                          );
                        },
                        icon: const Icon(Icons.shield_outlined),
                        label: const Text('Open Full Privacy Policy Screen'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF41B06E),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      default:
        return _featureCard(
          'Phase Feature',
          'Full native cricket score engine active.',
          Icons.check_circle_outline,
        );
    }
  }

  Widget _featureCard(String header, String points, IconData iconData) {
    return Card(
      color: const Color(0xFF1E293B),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(18.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(iconData, color: Colors.cyanAccent, size: 22),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    header,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const Divider(color: Colors.white12, height: 24),
            Text(
              points,
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 13,
                height: 1.6,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
