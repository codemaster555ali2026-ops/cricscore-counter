import 'package:flutter/material.dart';
import '../services/admob_service.dart';
import '../widgets/ad_banner_widget.dart';
import 'match_setup_screen.dart';
import 'live_scoring_screen.dart';
import 'privacy_policy_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Cricket Scoreboard App',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.privacy_tip_outlined),
            tooltip: 'Privacy Policy',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const PrivacyPolicyScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.ads_click),
            tooltip: 'Show AdMob Interstitial Ad',
            onPressed: () {
              AdMobService.showInterstitialAd();
            },
          ),
          IconButton(
            icon: const Icon(Icons.card_giftcard),
            tooltip: 'Watch AdMob Rewarded Video Ad',
            onPressed: () {
              AdMobService.showRewardedAd(
                onUserEarnedReward: (reward) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Reward Received: +${reward.amount} ${reward.type}!'),
                      backgroundColor: Colors.green,
                    ),
                  );
                },
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Hero Cricket Banner
                  Container(
                    padding: const EdgeInsets.all(20),
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
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'Complete Data • Smart Features',
                          style: TextStyle(color: Colors.white70, fontSize: 13),
                        ),
                        SizedBox(height: 6),
                        Text(
                          'Professional Cricket Scoreboard',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 8),
                        Text(
                          '1 to 20 Overs, Lonely Player Entry, Live Commentary, Analytics & Google AdMob Integration',
                          style: TextStyle(color: Colors.white, fontSize: 12),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Quick Action Cards
                  ElevatedButton.icon(
                    onPressed: () {
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
                    },
                    icon: const Icon(Icons.play_circle_outline, size: 24),
                    label: const Text(
                      'Start New Match (1-20 Overs)',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF008DDA),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // AdMob Quick Test Card
                  Card(
                    color: const Color(0xFF1E293B),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: const [
                              Icon(Icons.monetization_on, color: Colors.amber, size: 20),
                              SizedBox(width: 8),
                              Text(
                                'Google AdMob Monetization',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Active Ad Formats: Banner (Bottom 320x50), Interstitial (Over Completion), and Rewarded Video.',
                            style: TextStyle(color: Colors.white70, fontSize: 12),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton.icon(
                                  onPressed: () => AdMobService.showInterstitialAd(),
                                  icon: const Icon(Icons.fullscreen, size: 16),
                                  label: const Text('Test Interstitial', style: TextStyle(fontSize: 12)),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: OutlinedButton.icon(
                                  onPressed: () {
                                    AdMobService.showRewardedAd(
                                      onUserEarnedReward: (r) {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(content: Text('Rewarded +50 Coins!')),
                                        );
                                      },
                                    );
                                  },
                                  icon: const Icon(Icons.videocam, size: 16),
                                  label: const Text('Test Rewarded', style: TextStyle(fontSize: 12)),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ==========================================
          // PERSISTENT GOOGLE ADMOB BANNER AT BOTTOM
          // ==========================================
          const AdBannerWidget(),
        ],
      ),
    );
  }
}
