import 'package:flutter/material.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Privacy Policy'),
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildCard(
              title: 'Privacy Policy for Cricket Scoreboard',
              subtitle: 'Last updated: 2026',
              content:
                  'We take your privacy seriously. This Privacy Policy explains what information we collect, how it is used, and how your data is protected when using the Cricket Scoreboard application.',
              icon: Icons.shield_outlined,
            ),
            const SizedBox(height: 16),
            _buildSection(
              title: '1. Information We Collect & Local Storage',
              body:
                  'Cricket Scoreboard stores your match scores, teams, player statistics, and match history strictly on your local device (using Hive / Local Storage). We do not collect, upload, or sell your personal match data to any remote private servers.',
              icon: Icons.storage_outlined,
            ),
            const SizedBox(height: 16),
            _buildSection(
              title: '2. Google AdMob Advertising & Monetization',
              body:
                  'Our app integrates Google AdMob to display banner and interstitial ads. Google AdMob may collect and process device identifiers, advertising IDs, and non-personal diagnostic data to serve ads in compliance with Google Play Store policies and user consent guidelines.',
              icon: Icons.campaign_outlined,
            ),
            const SizedBox(height: 16),
            _buildSection(
              title: '3. Device Permissions',
              body:
                  '• INTERNET & ACCESS_NETWORK_STATE: Required solely to load AdMob advertisements and verify network connectivity.\n• Storage permissions (if applicable) are only utilized to export PDF match summaries to your downloads folder.',
              icon: Icons.security_outlined,
            ),
            const SizedBox(height: 16),
            _buildSection(
              title: '4. Children’s Privacy (COPPA & GDPR)',
              body:
                  'Cricket Scoreboard does not knowingly collect personally identifiable information from children under 13. All scoring is done offline locally on the user device.',
              icon: Icons.child_care_outlined,
            ),
            const SizedBox(height: 16),
            _buildSection(
              title: '5. Contact Us',
              body:
                  'If you have any questions or feedback regarding this Privacy Policy, please contact the developer via Google Play developer support.',
              icon: Icons.email_outlined,
            ),
            const SizedBox(height: 32),
            Center(
              child: Text(
                '© 2026 Cricket Scoreboard 15 Phases • All Rights Reserved',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.5),
                  fontSize: 12,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCard({
    required String title,
    required String subtitle,
    required String content,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.blueAccent.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: Colors.cyanAccent, size: 28),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.6),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            content,
            style: TextStyle(
              color: Colors.white.withOpacity(0.85),
              fontSize: 14,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required String body,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: Colors.blueAccent, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            body,
            style: TextStyle(
              color: Colors.white.withOpacity(0.8),
              fontSize: 13,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
