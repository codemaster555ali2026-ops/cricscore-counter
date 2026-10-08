import 'package:flutter/material.dart';
import '../models/match_model.dart';
import '../models/player_model.dart';
import '../services/admob_service.dart';
import '../widgets/ad_banner_widget.dart';

class LiveScoringScreen extends StatefulWidget {
  final Team teamA;
  final Team teamB;
  final int totalOvers;
  final int? target; // If 2nd innings run chase
  final int inningsNumber;

  const LiveScoringScreen({
    super.key,
    required this.teamA,
    required this.teamB,
    required this.totalOvers,
    this.target,
    this.inningsNumber = 1,
  });

  @override
  State<LiveScoringScreen> createState() => _LiveScoringScreenState();
}

class _LiveScoringScreenState extends State<LiveScoringScreen> {
  int _totalRuns = 0;
  int _wickets = 0;
  int _completedOvers = 0;
  int _ballsInCurrentOver = 0;
  final List<String> _currentOverDeliveries = [];
  bool _isMatchCompleted = false;
  bool _isInningsCompleted = false;
  int? _secondInningsTarget;
  String _resultText = '';

  // Max 8 ads cap per match & counter
  int _matchAdsShown = 0;
  static const int maxMatchAds = 8;

  // Striker & Non-striker index
  int _strikerIndex = 0;
  int _nonStrikerIndex = 1;

  @override
  void initState() {
    super.initState();
    // AUTOMATIC AD AT MATCH START (if under cap of 8 ads)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _triggerAdIfUnderCap();
    });
  }

  bool _isMilestoneOver(int completedOvers, int totalOvers) {
    if (totalOvers <= 5) return false;
    if (totalOvers <= 10) return completedOvers == 5;
    final o1 = (totalOvers * 0.25).round();
    final o2 = (totalOvers * 0.55).round();
    final o3 = (totalOvers * 0.80).round();
    return completedOvers == o1 || completedOvers == o2 || completedOvers == o3;
  }

  void _triggerAdIfUnderCap({VoidCallback? onComplete}) {
    if (_matchAdsShown < maxMatchAds) {
      _matchAdsShown++;
      AdMobService.showInterstitialAd(onComplete: onComplete);
    } else {
      if (onComplete != null) onComplete();
    }
  }

  void _recordBall(int runs, {bool isWicket = false, bool isWide = false, bool isNoBall = false}) {
    // STRICT CHECK: If match or innings is finished, or overs reached, do NOT allow any further ball!
    if (_isMatchCompleted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Match is already completed! Target was reached.')),
      );
      return;
    }

    if (_isInningsCompleted || _completedOvers >= widget.totalOvers) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Innings already completed! All ${widget.totalOvers} overs bowled.')),
      );
      return;
    }

    final maxWickets = widget.teamA.players.length > 1 ? widget.teamA.players.length - 1 : 10;
    if (_wickets >= maxWickets) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('All out! Innings has ended.')),
      );
      return;
    }

    setState(() {
      _totalRuns += runs;

      if (isWicket) {
        _wickets++;
        _currentOverDeliveries.add('W');
      } else if (isWide) {
        _currentOverDeliveries.add('Wd');
      } else if (isNoBall) {
        _currentOverDeliveries.add('Nb');
      } else {
        _currentOverDeliveries.add('$runs');
      }

      // Check immediate target chase on wide or no-ball extras
      if ((isWide || isNoBall) && widget.target != null && _totalRuns >= widget.target!) {
        _isMatchCompleted = true;
        final wicketsLeft = maxWickets - _wickets;
        _resultText = '${widget.teamA.name} won by $wicketsLeft wicket${wicketsLeft == 1 ? '' : 's'}!';
        _triggerAdIfUnderCap();
        _showMatchCompletedDialog(_resultText);
        return;
      }

      // Valid legal delivery (not a wide/no ball)
      if (!isWide && !isNoBall) {
        _ballsInCurrentOver++;

        // Rotate strike on odd runs
        if (runs % 2 == 1) {
          final temp = _strikerIndex;
          _strikerIndex = _nonStrikerIndex;
          _nonStrikerIndex = temp;
        }

        // 1. Check if TARGET is chased in 2nd innings
        if (widget.target != null && _totalRuns >= widget.target!) {
          _isMatchCompleted = true;
          final wicketsLeft = maxWickets - _wickets;
          final ballsLeft = (widget.totalOvers * 6) - (_completedOvers * 6 + _ballsInCurrentOver);
          _resultText = '${widget.teamA.name} won by $wicketsLeft wicket${wicketsLeft == 1 ? '' : 's'}${ballsLeft > 0 ? " ($ballsLeft balls rem)" : ""}!';
          _triggerAdIfUnderCap();
          _showMatchCompletedDialog(_resultText);
          return;
        }

        // 2. Over completed (6 legal balls)
        if (_ballsInCurrentOver == 6) {
          _completedOvers++;
          _ballsInCurrentOver = 0;
          _currentOverDeliveries.clear();

          // Strike rotates at the end of the over
          final temp = _strikerIndex;
          _strikerIndex = _nonStrikerIndex;
          _nonStrikerIndex = temp;

          // Check if innings or match is complete after this over
          if (_completedOvers >= widget.totalOvers || _wickets >= maxWickets) {
            if (widget.target != null) {
              // 2nd Innings completed without chasing target
              _isMatchCompleted = true;
              if (_totalRuns == widget.target! - 1) {
                _resultText = 'Match Tied! Both teams scored $_totalRuns runs.';
              } else {
                final runsDefended = widget.target! - 1 - _totalRuns;
                _resultText = '${widget.teamB.name} won by $runsDefended run${runsDefended == 1 ? '' : 's'}!';
              }
              _triggerAdIfUnderCap();
              _showMatchCompletedDialog(_resultText);
              return;
            } else {
              // 1st Innings completed!
              _isInningsCompleted = true;
              _secondInningsTarget = _totalRuns + 1;
              _triggerAdIfUnderCap();
              _showInningsBreakDialog();
              return;
            }
          }

          // SMART OVER AD: Only on milestone overs, NOT on every single over! (Max 8 ads per match)
          if (_isMilestoneOver(_completedOvers, widget.totalOvers)) {
            _triggerAdIfUnderCap(
              onComplete: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Over $_completedOvers Completed! (${widget.totalOvers - _completedOvers} overs remaining)'),
                    duration: const Duration(seconds: 2),
                  ),
                );
              },
            );
          }
        }
      }

      // Check Wicket Fall / All Out during the over
      if (isWicket && _wickets >= maxWickets) {
        if (widget.target != null) {
          _isMatchCompleted = true;
          if (_totalRuns == widget.target! - 1) {
            _resultText = 'Match Tied! Both teams scored $_totalRuns runs.';
          } else {
            final runsDefended = widget.target! - 1 - _totalRuns;
            _resultText = '${widget.teamB.name} won by $runsDefended run${runsDefended == 1 ? '' : 's'}!';
          }
          _triggerAdIfUnderCap();
          _showMatchCompletedDialog(_resultText);
        } else {
          _isInningsCompleted = true;
          _secondInningsTarget = _totalRuns + 1;
          _triggerAdIfUnderCap();
          _showInningsBreakDialog();
        }
      }
    });
  }

  void _showMatchCompletedDialog(String result) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Text('🏆 Match Concluded!'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(result, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.greenAccent)),
            const SizedBox(height: 10),
            Text('Final Score: $_totalRuns/$_wickets ($_completedOvers.$_ballsInCurrentOver ov)'),
            if (widget.target != null) Text('Target Was: ${widget.target} runs in ${widget.totalOvers} ov'),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
            },
            child: const Text('View Summary'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pop(context); // Return to home
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
            child: const Text('Back to Home'),
          ),
        ],
      ),
    );
  }

  void _showInningsBreakDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Text('⏱️ 1st Innings Concluded!'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${widget.teamA.name} scored $_totalRuns/$_wickets ($_completedOvers.$_ballsInCurrentOver ov)',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 8),
            Text(
              'Target for ${widget.teamB.name}: ${_totalRuns + 1} runs in ${widget.totalOvers} overs',
              style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 14),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              _startSecondInnings();
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.orange, foregroundColor: Colors.white),
            child: const Text('Start 2nd Innings (Chase) &rarr;'),
          ),
        ],
      ),
    );
  }

  void _startSecondInnings() {
    _triggerAdIfUnderCap(); // AUTOMATIC AD: 2ND INNINGS START (if under 8 ads cap)
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => LiveScoringScreen(
          teamA: widget.teamB, // Chasing team is now Team A
          teamB: widget.teamA, // Defending team is now Team B
          totalOvers: widget.totalOvers,
          target: _secondInningsTarget ?? (_totalRuns + 1),
          inningsNumber: 2,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final runRate = _completedOvers + (_ballsInCurrentOver / 6.0) > 0
        ? (_totalRuns / (_completedOvers + (_ballsInCurrentOver / 6.0))).toStringAsFixed(2)
        : '0.00';

    final ballsLeft = (widget.totalOvers * 6) - (_completedOvers * 6 + _ballsInCurrentOver);
    final runsNeeded = widget.target != null ? widget.target! - _totalRuns : null;

    return Scaffold(
      appBar: AppBar(
        title: Text('${widget.teamA.name} vs ${widget.teamB.name}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.ads_click),
            tooltip: 'Test Over AdMob Interstitial',
            onPressed: () => AdMobService.showInterstitialAd(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Match Summary Score Header
          Container(
            padding: const EdgeInsets.all(20),
            color: const Color(0xFF0F172A),
            child: Column(
              children: [
                Text(
                  '${widget.teamA.name} • ${widget.target != null ? "2nd Innings (Target: ${widget.target})" : "1st Innings"}',
                  style: const TextStyle(color: Colors.white70, fontSize: 13),
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      '$_totalRuns/$_wickets',
                      style: const TextStyle(
                        fontSize: 44,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      '($_completedOvers.$_ballsInCurrentOver / ${widget.totalOvers} ov)',
                      style: const TextStyle(fontSize: 18, color: Colors.cyanAccent),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                if (runsNeeded != null) ...[
                  Text(
                    runsNeeded <= 0
                        ? 'Target Achieved! Match Finished!'
                        : 'Need $runsNeeded runs in $ballsLeft balls',
                    style: TextStyle(
                      color: runsNeeded <= 0 ? Colors.greenAccent : Colors.amberAccent,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                ] else ...[
                  Text(
                    'Current Run Rate: $runRate',
                    style: const TextStyle(color: Colors.white60, fontSize: 12),
                  ),
                ],
              ],
            ),
          ),

          // Current Over Ball-by-Ball Circles
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 16.0),
            child: Row(
              children: [
                const Text('This Over: ', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(width: 8),
                Expanded(
                  child: Row(
                    children: _currentOverDeliveries.map((b) {
                      final isW = b == 'W';
                      final isBoundary = b == '4' || b == '6';
                      return Container(
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isW
                              ? Colors.redAccent
                              : (isBoundary ? Colors.amber : Colors.blueGrey),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          b,
                          style: const TextStyle(
                            color: Colors.black,
                            fontWeight: FontWeight.bold,
                            fontSize: 11,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),

          const Divider(height: 1),

          // Match Concluded Banner or Innings Break or Scoring Keypad
          Expanded(
            child: _isMatchCompleted
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.emoji_events, size: 64, color: Colors.amber),
                          const SizedBox(height: 12),
                          const Text(
                            'MATCH CONCLUDED!',
                            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.greenAccent),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _resultText,
                            style: const TextStyle(fontSize: 16, color: Colors.white, fontWeight: FontWeight.w600),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Final Score: $_totalRuns/$_wickets in $_completedOvers.$_ballsInCurrentOver overs',
                            style: const TextStyle(fontSize: 14, color: Colors.white70),
                          ),
                          const SizedBox(height: 24),
                          ElevatedButton.icon(
                            onPressed: () => Navigator.pop(context),
                            icon: const Icon(Icons.home),
                            label: const Text('Back to Home Dashboard'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                : _isInningsCompleted
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.sports_cricket, size: 64, color: Colors.orangeAccent),
                              const SizedBox(height: 12),
                              const Text(
                                '1ST INNINGS CONCLUDED!',
                                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.orangeAccent),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                '${widget.teamA.name} scored $_totalRuns/$_wickets in $_completedOvers.$_ballsInCurrentOver overs',
                                style: const TextStyle(fontSize: 16, color: Colors.white),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Target for ${widget.teamB.name}: ${_secondInningsTarget ?? (_totalRuns + 1)} Runs (${widget.totalOvers} ov)',
                                style: const TextStyle(fontSize: 16, color: Colors.amber, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 24),
                              ElevatedButton.icon(
                                onPressed: _startSecondInnings,
                                icon: const Icon(Icons.play_arrow),
                                label: const Text('Start 2nd Innings (Chase)'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.orange,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                                ),
                              ),
                            ],
                          ),
                        ),
                      )
                    : Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: GridView.count(
                          crossAxisCount: 4,
                          mainAxisSpacing: 10,
                          crossAxisSpacing: 10,
                          children: [
                            _scoringButton('0', () => _recordBall(0)),
                            _scoringButton('1', () => _recordBall(1)),
                            _scoringButton('2', () => _recordBall(2)),
                            _scoringButton('3', () => _recordBall(3)),
                            _scoringButton('4', () => _recordBall(4), color: Colors.blueAccent),
                            _scoringButton('6', () => _recordBall(6), color: Colors.purpleAccent),
                            _scoringButton('Wicket', () => _recordBall(0, isWicket: true), color: Colors.redAccent),
                            _scoringButton('Wide +1', () => _recordBall(1, isWide: true), color: Colors.amber),
                            _scoringButton('No Ball +1', () => _recordBall(1, isNoBall: true), color: Colors.orange),
                            _scoringButton('5', () => _recordBall(5)),
                            _scoringButton('Over End', () {
                              AdMobService.showInterstitialAd();
                            }, color: Colors.teal),
                            _scoringButton('Reward', () {
                              AdMobService.showRewardedAd(
                                onUserEarnedReward: (r) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Claimed +100 Cricket Pro Coins!')),
                                  );
                                },
                              );
                            }, color: Colors.green),
                          ],
                        ),
                      ),
          ),

          // Google AdMob Banner at Bottom
          const AdBannerWidget(),
        ],
      ),
    );
  }

  Widget _scoringButton(String label, VoidCallback onTap, {Color? color}) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: color ?? const Color(0xFF1E293B),
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        padding: EdgeInsets.zero,
      ),
      onPressed: onTap,
      child: Text(
        label,
        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
        textAlign: TextAlign.center,
      ),
    );
  }
}
