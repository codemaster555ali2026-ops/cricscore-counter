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
  final List<CommentaryItem> _commentary = [];

  bool _isMatchCompleted = false;
  bool _isInningsCompleted = false;
  int? _secondInningsTarget;
  String _resultText = '';

  // Max 8 ads cap per match & counter
  int _matchAdsShown = 0;
  static const int maxMatchAds = 8;

  // Batsmen & Bowler Tracking
  late List<BatterScore> _batterScores;
  late List<BowlerScore> _bowlerScores;
  int _strikerIndex = 0;
  int _nonStrikerIndex = 1;
  int _currentBowlerIndex = 0;

  // Partnership tracking
  int _partnershipRuns = 0;
  int _partnershipBalls = 0;

  // Undo history stack
  final List<Map<String, dynamic>> _historyStack = [];

  @override
  void initState() {
    super.initState();
    _initBattersAndBowlers();

    // AUTOMATIC AD AT MATCH START (if under cap of 8 ads)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _triggerAdIfUnderCap();
    });
  }

  void _initBattersAndBowlers() {
    // Initialize Batters from Team A
    _batterScores = widget.teamA.players.map((p) {
      return BatterScore(
        playerId: p.id,
        name: p.name + (p.isCaptain ? ' (C)' : (p.isViceCaptain ? ' (VC)' : (p.isWicketKeeper ? ' (WK)' : ''))),
      );
    }).toList();

    // Ensure we have at least 2 batters
    if (_batterScores.length < 2) {
      _batterScores = [
        BatterScore(playerId: 'p1', name: 'Opening Batsman 1'),
        BatterScore(playerId: 'p2', name: 'Opening Batsman 2'),
      ];
    }
    _strikerIndex = 0;
    _nonStrikerIndex = 1;

    // Initialize Bowlers from Team B
    _bowlerScores = widget.teamB.players.map((p) {
      return BowlerScore(
        playerId: p.id,
        name: p.name + (p.isCaptain ? ' (C)' : ''),
      );
    }).toList();

    if (_bowlerScores.isEmpty) {
      _bowlerScores = [
        BowlerScore(playerId: 'b1', name: 'Opening Bowler'),
      ];
    }
    // Set opening bowler to first bowler from Team B (or 8th player if standard bowling unit)
    _currentBowlerIndex = _bowlerScores.length > 8 ? 8 : 0;
  }

  void _triggerAdIfUnderCap({VoidCallback? onComplete}) {
    if (_matchAdsShown < maxMatchAds) {
      _matchAdsShown++;
      AdMobService.showInterstitialAd(onComplete: onComplete);
    } else {
      if (onComplete != null) onComplete();
    }
  }

  void _recordBall(
    int runs, {
    bool isWicket = false,
    String dismissalType = 'Bowled',
    String? fielderName,
    int? dismissedBatterIndex,
    int? incomingBatterIndex,
    bool isWide = false,
    bool isNoBall = false,
    bool isLegBye = false,
    bool isBye = false,
  }) {
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

    final maxWickets = _batterScores.length > 1 ? _batterScores.length - 1 : 10;
    if (_wickets >= maxWickets) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('All out! Innings has ended.')),
      );
      return;
    }

    // Save state for Undo
    _saveStateForUndo();

    setState(() {
      final isLegalBall = !isWide && !isNoBall;
      final striker = _batterScores[_strikerIndex];
      final bowler = _bowlerScores[_currentBowlerIndex];

      _totalRuns += runs;
      bowler.runsConceded += runs;

      if (isWicket) {
        _wickets++;
        final outIndex = dismissedBatterIndex ?? _strikerIndex;
        final dismissedBatter = _batterScores[outIndex];

        // Bowler credited if not run out, retired, or obstructing
        if (dismissalType != 'Run Out' && dismissalType != 'Obstructing Field' && dismissalType != 'Retired Hurt') {
          bowler.wickets++;
        }

        if (outIndex == _strikerIndex) {
          striker.balls++;
          _partnershipBalls++;
        }
        dismissedBatter.isOut = true;

        if (dismissalType == 'Caught') {
          dismissedBatter.dismissalText = 'c ${fielderName ?? "sub"} b ${bowler.name}';
        } else if (dismissalType == 'Caught & Bowled') {
          dismissedBatter.dismissalText = 'c & b ${bowler.name}';
        } else if (dismissalType == 'Bowled') {
          dismissedBatter.dismissalText = 'b ${bowler.name}';
        } else if (dismissalType == 'LBW') {
          dismissedBatter.dismissalText = 'lbw b ${bowler.name}';
        } else if (dismissalType == 'Run Out') {
          dismissedBatter.dismissalText = 'run out (${fielderName ?? "fielder"})';
        } else if (dismissalType == 'Stumped') {
          dismissedBatter.dismissalText = 'st ${fielderName ?? "keeper"} b ${bowler.name}';
        } else if (dismissalType == 'Hit Wicket') {
          dismissedBatter.dismissalText = 'hit wicket b ${bowler.name}';
        } else {
          dismissedBatter.dismissalText = '$dismissalType b ${bowler.name}';
        }

        _currentOverDeliveries.add('W');

        // Add Commentary
        _commentary.insert(
          0,
          CommentaryItem(
            overBall: '$_completedOvers.${_ballsInCurrentOver + 1}',
            text: 'WICKET! ${dismissedBatter.name} dismissed ($dismissalType)! Bowling: ${bowler.name}${fielderName != null && fielderName.isNotEmpty ? ", fielder: $fielderName" : ""}.',
            runs: 0,
            isWicket: true,
          ),
        );

        // Assign incoming batter if specified
        if (incomingBatterIndex != null && incomingBatterIndex >= 0 && incomingBatterIndex < _batterScores.length) {
          if (outIndex == _nonStrikerIndex) {
            _nonStrikerIndex = incomingBatterIndex;
          } else {
            _strikerIndex = incomingBatterIndex;
          }
          _partnershipRuns = 0;
          _partnershipBalls = 0;
        }
      } else if (isWide) {
        _currentOverDeliveries.add('Wd');
        _commentary.insert(
          0,
          CommentaryItem(
            overBall: '$_completedOvers.$_ballsInCurrentOver',
            text: 'Wide ball bowled by ${bowler.name}. Extra 1 run added.',
            runs: runs,
          ),
        );
      } else if (isNoBall) {
        _currentOverDeliveries.add('Nb');
        _commentary.insert(
          0,
          CommentaryItem(
            overBall: '$_completedOvers.$_ballsInCurrentOver',
            text: 'NO BALL! Overstepping by ${bowler.name}. Free hit next!',
            runs: runs,
          ),
        );
      } else {
        // Legal delivery
        striker.runs += (isLegBye || isBye) ? 0 : runs;
        striker.balls++;
        if (runs == 4) striker.fours++;
        if (runs == 6) striker.sixes++;

        _partnershipRuns += runs;
        _partnershipBalls++;

        _currentOverDeliveries.add('$runs');

        String commText = '$runs run${runs == 1 ? '' : 's'} taken by ${striker.name}.';
        if (runs == 4) commText = 'FOUR! Glorious shot through the covers by ${striker.name}!';
        if (runs == 6) commText = 'SIX! Colossal strike over deep mid-wicket by ${striker.name}!';
        if (runs == 0) commText = 'Dot ball. Good defensive push back to ${bowler.name}.';

        _commentary.insert(
          0,
          CommentaryItem(
            overBall: '$_completedOvers.${_ballsInCurrentOver + 1}',
            text: commText,
            runs: runs,
            isBoundary: runs == 4 || runs == 6,
          ),
        );
      }

      // Check Target Reached (2nd innings)
      if (widget.target != null && _totalRuns >= widget.target!) {
        _isMatchCompleted = true;
        final wicketsLeft = maxWickets - _wickets;
        _resultText = '${widget.teamA.name} won by $wicketsLeft wicket${wicketsLeft == 1 ? '' : 's'}!';
        _triggerAdIfUnderCap();
        _showMatchCompletedDialog(_resultText);
        return;
      }

      // Legal ball increment
      if (isLegalBall) {
        _ballsInCurrentOver++;
        bowler.ballsInOver++;

        // Rotate Strike on 1, 3, 5 runs
        if (runs % 2 != 0) {
          _rotateStrike();
        }

        // Check if Over Finished (6 legal balls)
        if (_ballsInCurrentOver >= 6) {
          _completedOvers++;
          _ballsInCurrentOver = 0;
          bowler.overs++;
          bowler.ballsInOver = 0;
          _currentOverDeliveries.clear();

          // End of over strike rotation
          _rotateStrike();

          // Interstitial Ad on Over Finish (under cap of 8)
          _triggerAdIfUnderCap();

          // Check if total match overs completed
          if (_completedOvers >= widget.totalOvers || _wickets >= maxWickets) {
            _handleInningsOrMatchEnd();
          } else {
            // Prompt to change bowler
            _promptChangeBowler();
          }
        }
      }

      // If wicket fell, prompt next batsman
      if (isWicket && _wickets < maxWickets) {
        _promptNextBatsman();
      }
    });
  }

  void _rotateStrike() {
    final temp = _strikerIndex;
    _strikerIndex = _nonStrikerIndex;
    _nonStrikerIndex = temp;
  }

  void _saveStateForUndo() {
    _historyStack.add({
      'totalRuns': _totalRuns,
      'wickets': _wickets,
      'completedOvers': _completedOvers,
      'ballsInCurrentOver': _ballsInCurrentOver,
      'strikerIndex': _strikerIndex,
      'nonStrikerIndex': _nonStrikerIndex,
      'currentBowlerIndex': _currentBowlerIndex,
      'deliveries': List<String>.from(_currentOverDeliveries),
    });
    if (_historyStack.length > 10) _historyStack.removeAt(0);
  }

  void _undoLastBall() {
    if (_historyStack.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No previous ball to undo.')),
      );
      return;
    }
    setState(() {
      final last = _historyStack.removeLast();
      _totalRuns = last['totalRuns'];
      _wickets = last['wickets'];
      _completedOvers = last['completedOvers'];
      _ballsInCurrentOver = last['ballsInCurrentOver'];
      _strikerIndex = last['strikerIndex'];
      _nonStrikerIndex = last['nonStrikerIndex'];
      _currentBowlerIndex = last['currentBowlerIndex'];
      _currentOverDeliveries.clear();
      _currentOverDeliveries.addAll(List<String>.from(last['deliveries']));
      if (_commentary.isNotEmpty) _commentary.removeAt(0);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Last ball undone successfully.')),
    );
  }

  void _promptNextBatsman() {
    // Find next available batsman
    int nextIdx = -1;
    for (int i = 0; i < _batterScores.length; i++) {
      if (i != _strikerIndex && i != _nonStrikerIndex && !_batterScores[i].isOut) {
        nextIdx = i;
        break;
      }
    }
    if (nextIdx != -1) {
      setState(() {
        _strikerIndex = nextIdx;
        _partnershipRuns = 0;
        _partnershipBalls = 0;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('New Batsman In: ${_batterScores[nextIdx].name}'),
          backgroundColor: Colors.blueAccent,
        ),
      );
    }
  }

  void _showWicketDialog() {
    String selectedDismissal = 'Bowled';
    int outBatterIdx = _strikerIndex;
    String selectedFielder = '';
    int? selectedIncomingIndex;
    final customBatsmanController = TextEditingController();
    final customFielderController = TextEditingController();

    // Available batters who are not out and not on crease
    final availableBatters = <Map<String, dynamic>>[];
    for (int i = 0; i < _batterScores.length; i++) {
      if (!_batterScores[i].isOut && i != _strikerIndex && i != _nonStrikerIndex) {
        availableBatters.add({'index': i, 'batter': _batterScores[i]});
      }
    }
    if (availableBatters.isNotEmpty) {
      selectedIncomingIndex = availableBatters.first['index'];
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final needsFielder = selectedDismissal == 'Caught' ||
                selectedDismissal == 'Run Out' ||
                selectedDismissal == 'Stumped' ||
                selectedDismissal == 'Obstructing Field';

            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
                left: 16,
                right: 16,
                top: 16,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: const [
                            Icon(Icons.flash_on, color: Colors.redAccent),
                            SizedBox(width: 8),
                            Text(
                              'Fall of Wicket & Dismissal',
                              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.white54),
                          onPressed: () => Navigator.pop(ctx),
                        ),
                      ],
                    ),
                    const Divider(color: Colors.white24),
                    const SizedBox(height: 8),

                    // 1. Who is out?
                    const Text('1. Which Batsman is Out?', style: TextStyle(color: Colors.cyanAccent, fontWeight: FontWeight.bold, fontSize: 12)),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Expanded(
                          child: InkWell(
                            onTap: () => setModalState(() => outBatterIdx = _strikerIndex),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                              decoration: BoxDecoration(
                                color: outBatterIdx == _strikerIndex ? Colors.red.withOpacity(0.3) : const Color(0xFF1E293B),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: outBatterIdx == _strikerIndex ? Colors.redAccent : Colors.white12),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(_batterScores[_strikerIndex].name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                                  const Text('Striker *', style: TextStyle(color: Colors.cyanAccent, fontSize: 10)),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: InkWell(
                            onTap: () => setModalState(() => outBatterIdx = _nonStrikerIndex),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                              decoration: BoxDecoration(
                                color: outBatterIdx == _nonStrikerIndex ? Colors.red.withOpacity(0.3) : const Color(0xFF1E293B),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: outBatterIdx == _nonStrikerIndex ? Colors.redAccent : Colors.white12),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(_batterScores[_nonStrikerIndex].name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                                  const Text('Non-Striker', style: TextStyle(color: Colors.white60, fontSize: 10)),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // 2. Dismissal Type
                    const Text('2. Dismissal Type', style: TextStyle(color: Colors.cyanAccent, fontWeight: FontWeight.bold, fontSize: 12)),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        'Bowled',
                        'Caught',
                        'Caught & Bowled',
                        'Run Out',
                        'LBW',
                        'Stumped',
                        'Hit Wicket',
                        'Obstructing Field',
                        'Retired Hurt',
                      ].map((type) {
                        final isSel = selectedDismissal == type;
                        return ChoiceChip(
                          label: Text(type, style: TextStyle(fontSize: 11, color: isSel ? Colors.white : Colors.white70)),
                          selected: isSel,
                          selectedColor: Colors.redAccent,
                          backgroundColor: const Color(0xFF1E293B),
                          onSelected: (val) {
                            if (val) {
                              setModalState(() {
                                selectedDismissal = type;
                                if (type == 'Caught & Bowled') {
                                  selectedFielder = _bowlerScores[_currentBowlerIndex].name;
                                }
                              });
                            }
                          },
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 12),

                    // 3. Fielder Section
                    if (needsFielder) ...[
                      Text('3. Fielder who assisted bowler (${widget.teamB.name})', style: const TextStyle(color: Colors.cyanAccent, fontWeight: FontWeight.bold, fontSize: 12)),
                      const SizedBox(height: 6),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: widget.teamB.players.map((p) {
                          final isSel = selectedFielder == p.name;
                          return ChoiceChip(
                            label: Text(p.name, style: TextStyle(fontSize: 10, color: isSel ? Colors.black : Colors.white70)),
                            selected: isSel,
                            selectedColor: Colors.cyanAccent,
                            backgroundColor: const Color(0xFF1E293B),
                            onSelected: (val) {
                              setModalState(() {
                                selectedFielder = val ? p.name : '';
                                customFielderController.text = selectedFielder;
                              });
                            },
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 6),
                      TextField(
                        controller: customFielderController,
                        style: const TextStyle(color: Colors.white, fontSize: 12),
                        decoration: InputDecoration(
                          hintText: 'Or enter custom/substitute fielder name...',
                          hintStyle: const TextStyle(color: Colors.white38, fontSize: 11),
                          isDense: true,
                          filled: true,
                          fillColor: const Color(0xFF1E293B),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                        ),
                        onChanged: (val) => selectedFielder = val,
                      ),
                      const SizedBox(height: 12),
                    ],

                    // 4. Incoming Batsman Section
                    const Text('4. Incoming Next Batsman', style: TextStyle(color: Colors.cyanAccent, fontWeight: FontWeight.bold, fontSize: 12)),
                    const SizedBox(height: 6),
                    if (availableBatters.isNotEmpty) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: DropdownButton<int>(
                          value: selectedIncomingIndex,
                          isExpanded: true,
                          dropdownColor: const Color(0xFF1E293B),
                          underline: const SizedBox(),
                          style: const TextStyle(color: Colors.white, fontSize: 12),
                          items: availableBatters.map((item) {
                            final idx = item['index'] as int;
                            final b = item['batter'] as BatterScore;
                            return DropdownMenuItem<int>(
                              value: idx,
                              child: Text('${b.name} (In Squad)'),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) {
                              setModalState(() => selectedIncomingIndex = val);
                            }
                          },
                        ),
                      ),
                      const SizedBox(height: 8),
                    ],
                    TextField(
                      controller: customBatsmanController,
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                      decoration: InputDecoration(
                        hintText: '+ Or type custom batsman name to add & enter pitch...',
                        hintStyle: const TextStyle(color: Colors.white38, fontSize: 11),
                        isDense: true,
                        filled: true,
                        fillColor: const Color(0xFF1E293B),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                      ),
                    ),
                    const SizedBox(height: 16),

                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.redAccent,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        int? finalIncomingIndex = selectedIncomingIndex;
                        final customName = customBatsmanController.text.trim();
                        if (customName.isNotEmpty) {
                          final newBatter = BatterScore(
                            playerId: 'custom_${DateTime.now().millisecondsSinceEpoch}',
                            name: customName,
                          );
                          _batterScores.add(newBatter);
                          finalIncomingIndex = _batterScores.length - 1;
                        }

                        Navigator.pop(ctx);
                        _recordBall(
                          0,
                          isWicket: true,
                          dismissalType: selectedDismissal,
                          fielderName: selectedFielder.isNotEmpty ? selectedFielder : (customFielderController.text.trim().isNotEmpty ? customFielderController.text.trim() : null),
                          dismissedBatterIndex: outBatterIdx,
                          incomingBatterIndex: finalIncomingIndex,
                        );
                      },
                      child: const Text('Confirm Wicket & Continue', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    ),
                    const SizedBox(height: 12),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _showAddCustomBatsmanDialog() {
    final nameCtrl = TextEditingController();
    String target = 'striker';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
                left: 16,
                right: 16,
                top: 16,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Add Custom Batsman / Crease Setup',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      IconButton(icon: const Icon(Icons.close, color: Colors.white54), onPressed: () => Navigator.pop(ctx)),
                    ],
                  ),
                  const Divider(color: Colors.white24),
                  const SizedBox(height: 8),

                  const Text('Enter Custom Batsman Name:', style: TextStyle(color: Colors.cyanAccent, fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: nameCtrl,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'e.g. Ali Raza / Steve Smith / David Warner',
                      hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
                      filled: true,
                      fillColor: const Color(0xFF1E293B),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 12),

                  const Text('Assign To Position:', style: TextStyle(color: Colors.cyanAccent, fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Expanded(
                        child: ChoiceChip(
                          label: const Text('Striker ★', style: TextStyle(fontSize: 11)),
                          selected: target == 'striker',
                          selectedColor: Colors.cyanAccent,
                          onSelected: (val) => setModalState(() => target = 'striker'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ChoiceChip(
                          label: const Text('Non-Striker', style: TextStyle(fontSize: 11)),
                          selected: target == 'nonStriker',
                          selectedColor: Colors.cyanAccent,
                          onSelected: (val) => setModalState(() => target = 'nonStriker'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ChoiceChip(
                          label: const Text('Squad Only', style: TextStyle(fontSize: 11)),
                          selected: target == 'squad',
                          selectedColor: Colors.cyanAccent,
                          onSelected: (val) => setModalState(() => target = 'squad'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.cyanAccent,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () {
                      final name = nameCtrl.text.trim();
                      if (name.isEmpty) return;
                      setState(() {
                        final newBatter = BatterScore(
                          playerId: 'custom_${DateTime.now().millisecondsSinceEpoch}',
                          name: name,
                        );
                        _batterScores.add(newBatter);
                        final newIdx = _batterScores.length - 1;
                        if (target == 'striker') {
                          _strikerIndex = newIdx;
                        } else if (target == 'nonStriker') {
                          _nonStrikerIndex = newIdx;
                        }
                      });
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Added batsman $name successfully!')),
                      );
                    },
                    child: const Text('Add Batsman', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _promptChangeBowler() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1E293B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: const [
                  Icon(Icons.sports_cricket, color: Colors.cyanAccent),
                  SizedBox(width: 8),
                  Text(
                    'Select Bowler for Next Over',
                    style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Expanded(
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: _bowlerScores.length,
                  itemBuilder: (c, idx) {
                    final b = _bowlerScores[idx];
                    final isCurrent = idx == _currentBowlerIndex;
                    return ListTile(
                      tileColor: isCurrent ? Colors.blue.withOpacity(0.2) : null,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      title: Text(b.name, style: const TextStyle(color: Colors.white)),
                      subtitle: Text(
                        'Overs: ${b.overs}.${b.ballsInOver} | Runs: ${b.runsConceded} | Wkts: ${b.wickets}',
                        style: const TextStyle(color: Colors.white60, fontSize: 12),
                      ),
                      trailing: isCurrent ? const Chip(label: Text('Bowled Last Over', style: TextStyle(fontSize: 10))) : null,
                      onTap: () {
                        setState(() {
                          _currentBowlerIndex = idx;
                        });
                        Navigator.pop(ctx);
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _handleInningsOrMatchEnd() {
    if (widget.target != null) {
      // 2nd Innings finished
      _isMatchCompleted = true;
      if (_totalRuns >= widget.target!) {
        final wicketsLeft = _batterScores.length - 1 - _wickets;
        _resultText = '${widget.teamA.name} won by $wicketsLeft wicket${wicketsLeft == 1 ? '' : 's'}!';
      } else if (_totalRuns == widget.target! - 1) {
        _resultText = 'Match Tied! Thrilling finish!';
      } else {
        final runsDefended = widget.target! - 1 - _totalRuns;
        _resultText = '${widget.teamB.name} won by $runsDefended run${runsDefended == 1 ? '' : 's'}!';
      }
      _triggerAdIfUnderCap();
      _showMatchCompletedDialog(_resultText);
    } else {
      // 1st Innings finished
      _isInningsCompleted = true;
      _secondInningsTarget = _totalRuns + 1;
      _triggerAdIfUnderCap();
      _showInningsBreakDialog();
    }
  }

  void _showMatchCompletedDialog(String result) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0F172A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('🏆 Match Concluded!', style: TextStyle(color: Colors.amber)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(result, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.greenAccent)),
            const SizedBox(height: 12),
            Text('Final Score: $_totalRuns/$_wickets in $_completedOvers.$_ballsInCurrentOver overs', style: const TextStyle(color: Colors.white)),
            if (widget.target != null) Text('Target Was: ${widget.target} runs', style: const TextStyle(color: Colors.white70)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              _showScorecardModal();
            },
            child: const Text('View Scorecard', style: TextStyle(color: Colors.cyanAccent)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pop(context);
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
        backgroundColor: const Color(0xFF0F172A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('⏱️ 1st Innings Concluded!', style: TextStyle(color: Colors.orangeAccent)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${widget.teamA.name} scored $_totalRuns/$_wickets in $_completedOvers.$_ballsInCurrentOver overs',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
            ),
            const SizedBox(height: 10),
            Text(
              'Target for ${widget.teamB.name}: ${_totalRuns + 1} runs in ${widget.totalOvers} overs',
              style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 15),
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
    _triggerAdIfUnderCap();
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => LiveScoringScreen(
          teamA: widget.teamB,
          teamB: widget.teamA,
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

    final striker = _batterScores[_strikerIndex];
    final nonStriker = _batterScores[_nonStrikerIndex];
    final bowler = _bowlerScores[_currentBowlerIndex];

    return Scaffold(
      backgroundColor: const Color(0xFF0B192C),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E3E62),
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${widget.teamA.name} vs ${widget.teamB.name}',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            Text(
              'Phase 3: Live Scoring Engine • ${widget.target != null ? "2nd Innings" : "1st Innings"}',
              style: const TextStyle(fontSize: 11, color: Colors.cyanAccent),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.table_chart_outlined),
            tooltip: 'Phase 5: Scorecard',
            onPressed: _showScorecardModal,
          ),
          IconButton(
            icon: const Icon(Icons.mic_none_outlined),
            tooltip: 'Phase 4: Commentary',
            onPressed: _showCommentaryModal,
          ),
          IconButton(
            icon: const Icon(Icons.undo),
            tooltip: 'Undo Ball',
            onPressed: _undoLastBall,
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 10.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Main Score Banner
                  _buildMainScoreBanner(runRate, runsNeeded, ballsLeft),

                  const SizedBox(height: 12),

                  // Batsmen Section (Striker & Non-Striker with Players Names!)
                  _buildBatsmenSection(striker, nonStriker),

                  const SizedBox(height: 10),

                  // Current Bowler Card
                  _buildBowlerSection(bowler),

                  const SizedBox(height: 10),

                  // Current Over Timeline
                  _buildOverTimeline(),

                  const SizedBox(height: 12),

                  // 15 Phases Quick Access Ribbon
                  _buildPhasesRibbon(),

                  const SizedBox(height: 14),

                  // Scoring Keypad
                  _buildScoringKeypad(),
                ],
              ),
            ),
          ),

          // Google AdMob Persistent Banner at Bottom
          const AdBannerWidget(),
        ],
      ),
    );
  }

  Widget _buildMainScoreBanner(String runRate, int? runsNeeded, int ballsLeft) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1E3E62), Color(0xFF0F172A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.blueAccent.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${widget.teamA.name} BATTING',
                style: const TextStyle(color: Colors.cyanAccent, fontWeight: FontWeight.bold, fontSize: 13),
              ),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: _matchAdsShown >= maxMatchAds ? Colors.red.withOpacity(0.3) : Colors.green.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: _matchAdsShown >= maxMatchAds ? Colors.redAccent : Colors.greenAccent),
                    ),
                    child: Text(
                      'Ads: $_matchAdsShown/$maxMatchAds Max',
                      style: TextStyle(
                        color: _matchAdsShown >= maxMatchAds ? Colors.redAccent : Colors.greenAccent,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.blueAccent.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      'Overs: $_completedOvers.$_ballsInCurrentOver / ${widget.totalOvers}',
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                '$_totalRuns/$_wickets',
                style: const TextStyle(fontSize: 48, fontWeight: FontWeight.w900, color: Colors.white),
              ),
              const SizedBox(width: 12),
              Text(
                '($_completedOvers.$_ballsInCurrentOver ov)',
                style: const TextStyle(fontSize: 18, color: Colors.cyanAccent, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 6),
          if (runsNeeded != null) ...[
            Text(
              runsNeeded <= 0 ? 'Target Achieved!' : 'Need $runsNeeded runs from $ballsLeft balls',
              style: TextStyle(
                color: runsNeeded <= 0 ? Colors.greenAccent : Colors.amberAccent,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ] else ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('CRR: $runRate', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                const SizedBox(width: 16),
                Text('Partnership: $_partnershipRuns ($_partnershipBalls)', style: const TextStyle(color: Colors.white70, fontSize: 12)),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildBatsmenSection(BatterScore striker, BatterScore nonStriker) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.sports_cricket, color: Colors.amber, size: 16),
                  SizedBox(width: 6),
                  Text('BATSMEN AT CREASE', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
                ],
              ),
              TextButton.icon(
                onPressed: () {
                  setState(() => _rotateStrike());
                },
                icon: const Icon(Icons.swap_horiz, size: 16, color: Colors.cyanAccent),
                label: const Text('Swap Strike', style: TextStyle(color: Colors.cyanAccent, fontSize: 11)),
                style: TextButton.styleFrom(padding: EdgeInsets.zero, visualDensity: VisualDensity.compact),
              ),
            ],
          ),
          const SizedBox(height: 6),

          // Striker Card
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.cyanAccent.withOpacity(0.5)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.amber,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text('★ STRIKE', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 9)),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    striker.name,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Text(
                  '${striker.runs}* (${striker.balls})',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(width: 8),
                Text(
                  '${striker.fours}x4 ${striker.sixes}x6',
                  style: const TextStyle(color: Colors.white60, fontSize: 11),
                ),
                const SizedBox(width: 8),
                Text(
                  'SR: ${striker.strikeRate.toStringAsFixed(1)}',
                  style: const TextStyle(color: Colors.cyanAccent, fontSize: 11),
                ),
              ],
            ),
          ),

          const SizedBox(height: 6),

          // Non-Striker Card
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white12),
            ),
            child: Row(
              children: [
                const SizedBox(width: 6),
                const Icon(Icons.person_outline, size: 14, color: Colors.white38),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    nonStriker.name,
                    style: const TextStyle(color: Colors.white70, fontWeight: FontWeight.w600, fontSize: 13),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Text(
                  '${nonStriker.runs} (${nonStriker.balls})',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                ),
                const SizedBox(width: 8),
                Text(
                  '${nonStriker.fours}x4 ${nonStriker.sixes}x6',
                  style: const TextStyle(color: Colors.white60, fontSize: 11),
                ),
                const SizedBox(width: 8),
                Text(
                  'SR: ${nonStriker.strikeRate.toStringAsFixed(1)}',
                  style: const TextStyle(color: Colors.cyanAccent, fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBowlerSection(BowlerScore bowler) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white12),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.redAccent.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.sports_baseball, color: Colors.redAccent, size: 20),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        bowler.name,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    InkWell(
                      onTap: _promptChangeBowler,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.blueAccent.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text('Change 🔄', style: TextStyle(color: Colors.cyanAccent, fontSize: 10)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Overs: ${bowler.overs}.${bowler.ballsInOver} | Maidens: ${bowler.maidens} | Runs: ${bowler.runsConceded} | Wkts: ${bowler.wickets} | Econ: ${bowler.economy.toStringAsFixed(1)}',
                  style: const TextStyle(color: Colors.white70, fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOverTimeline() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const Text('This Over: ', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(width: 8),
          Expanded(
            child: _currentOverDeliveries.isEmpty
                ? const Text('New over beginning...', style: TextStyle(color: Colors.white38, fontSize: 11))
                : Row(
                    children: _currentOverDeliveries.map((b) {
                      final isW = b == 'W';
                      final isBoundary = b == '4' || b == '6';
                      Color c = Colors.blueGrey;
                      if (isW) c = Colors.redAccent;
                      else if (b == '4') c = Colors.blueAccent;
                      else if (b == '6') c = Colors.purpleAccent;
                      else if (b == 'Wd' || b == 'Nb') c = Colors.amber;

                      return Container(
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        width: 26,
                        height: 26,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: c,
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          b,
                          style: TextStyle(
                            color: isW || isBoundary ? Colors.white : Colors.black,
                            fontWeight: FontWeight.bold,
                            fontSize: 10,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildPhasesRibbon() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _phasePill('Phase 5: Scorecard', Icons.table_chart, _showScorecardModal, Colors.blueAccent),
          _phasePill('Phase 4: Commentary', Icons.mic, _showCommentaryModal, Colors.tealAccent),
          _phasePill('Phase 6: Analytics', Icons.insights, _showAnalyticsModal, Colors.purpleAccent),
          _phasePill('Phase 7: Predictor', Icons.auto_graph, _showPredictorModal, Colors.orangeAccent),
          _phasePill('Phase 8: Win Prob', Icons.query_stats, _showWinProbModal, Colors.cyanAccent),
        ],
      ),
    );
  }

  Widget _phasePill(String label, IconData icon, VoidCallback onTap, Color color) {
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white12),
          ),
          child: Row(
            children: [
              Icon(icon, size: 14, color: Colors.cyanAccent),
              const SizedBox(width: 6),
              Text(label, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildScoringKeypad() {
    return GridView.count(
      crossAxisCount: 4,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 8,
      crossAxisSpacing: 8,
      childAspectRatio: 1.5,
      children: [
        _padButton('0', () => _recordBall(0)),
        _padButton('1', () => _recordBall(1)),
        _padButton('2', () => _recordBall(2)),
        _padButton('3', () => _recordBall(3)),
        _padButton('4', () => _recordBall(4), color: const Color(0xFF008DDA)),
        _padButton('6', () => _recordBall(6), color: const Color(0xFF8B5CF6)),
        _padButton('Wicket', () => _recordBall(0, isWicket: true), color: const Color(0xFFEF4444)),
        _padButton('Wide +1', () => _recordBall(1, isWide: true), color: const Color(0xFFF59E0B)),
        _padButton('No Ball +1', () => _recordBall(1, isNoBall: true), color: const Color(0xFFF97316)),
        _padButton('Leg Bye +1', () => _recordBall(1, isLegBye: true), color: const Color(0xFF64748B)),
        _padButton('Over End', () {
          AdMobService.showInterstitialAd();
        }, color: const Color(0xFF0D9488)),
        _padButton('Reward Ad', () {
          AdMobService.showRewardedAd(
            onUserEarnedReward: (r) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Claimed +100 Cricket Pro Coins!')),
              );
            },
          );
        }, color: const Color(0xFF10B981)),
      ],
    );
  }

  Widget _padButton(String label, VoidCallback onTap, {Color? color}) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: color ?? const Color(0xFF1E293B),
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
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

  // Phase 5: Scorecard Sheet
  void _showScorecardModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.85,
          maxChildSize: 0.95,
          minChildSize: 0.5,
          builder: (_, controller) {
            return ListView(
              controller: controller,
              padding: const EdgeInsets.all(16),
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('PHASE 5: FULL MATCH SCORECARD', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                    IconButton(icon: const Icon(Icons.close, color: Colors.white54), onPressed: () => Navigator.pop(ctx)),
                  ],
                ),
                const Divider(color: Colors.white24),
                Text('${widget.teamA.name} Batting Card', style: const TextStyle(color: Colors.cyanAccent, fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 8),
                Table(
                  columnWidths: const {
                    0: FlexColumnWidth(4),
                    1: FlexColumnWidth(1.2),
                    2: FlexColumnWidth(1.2),
                    3: FlexColumnWidth(1.2),
                    4: FlexColumnWidth(1.5),
                  },
                  children: [
                    const TableRow(
                      children: [
                        Text('Batter', style: TextStyle(color: Colors.white60, fontWeight: FontWeight.bold, fontSize: 12)),
                        Text('R', style: TextStyle(color: Colors.white60, fontWeight: FontWeight.bold, fontSize: 12)),
                        Text('B', style: TextStyle(color: Colors.white60, fontWeight: FontWeight.bold, fontSize: 12)),
                        Text('4s', style: TextStyle(color: Colors.white60, fontWeight: FontWeight.bold, fontSize: 12)),
                        Text('SR', style: TextStyle(color: Colors.white60, fontWeight: FontWeight.bold, fontSize: 12)),
                      ],
                    ),
                    ..._batterScores.map((b) => TableRow(
                          children: [
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Text(b.name, style: TextStyle(color: b.isOut ? Colors.white38 : Colors.white, fontSize: 12)),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Text('${b.runs}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Text('${b.balls}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Text('${b.fours}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Text(b.strikeRate.toStringAsFixed(1), style: const TextStyle(color: Colors.cyanAccent, fontSize: 12)),
                            ),
                          ],
                        )),
                  ],
                ),
                const SizedBox(height: 20),
                Text('${widget.teamB.name} Bowling Figures', style: const TextStyle(color: Colors.cyanAccent, fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 8),
                Table(
                  columnWidths: const {
                    0: FlexColumnWidth(4),
                    1: FlexColumnWidth(1.2),
                    2: FlexColumnWidth(1.2),
                    3: FlexColumnWidth(1.2),
                    4: FlexColumnWidth(1.5),
                  },
                  children: [
                    const TableRow(
                      children: [
                        Text('Bowler', style: TextStyle(color: Colors.white60, fontWeight: FontWeight.bold, fontSize: 12)),
                        Text('O', style: TextStyle(color: Colors.white60, fontWeight: FontWeight.bold, fontSize: 12)),
                        Text('M', style: TextStyle(color: Colors.white60, fontWeight: FontWeight.bold, fontSize: 12)),
                        Text('R', style: TextStyle(color: Colors.white60, fontWeight: FontWeight.bold, fontSize: 12)),
                        Text('W', style: TextStyle(color: Colors.white60, fontWeight: FontWeight.bold, fontSize: 12)),
                      ],
                    ),
                    ..._bowlerScores.where((bw) => bw.overs > 0 || bw.ballsInOver > 0).map((b) => TableRow(
                          children: [
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Text(b.name, style: const TextStyle(color: Colors.white, fontSize: 12)),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Text('${b.overs}.${b.ballsInOver}', style: const TextStyle(color: Colors.white, fontSize: 12)),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Text('${b.maidens}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Text('${b.runsConceded}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Text('${b.wickets}', style: const TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold, fontSize: 12)),
                            ),
                          ],
                        )),
                  ],
                ),
              ],
            );
          },
        );
      },
    );
  }

  // Phase 4: Commentary Modal
  void _showCommentaryModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(16),
          height: 450,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text('PHASE 4: LIVE COMMENTARY FEED', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                ],
              ),
              const Divider(color: Colors.white24),
              Expanded(
                child: _commentary.isEmpty
                    ? const Center(child: Text('Commentary begins on first ball.', style: TextStyle(color: Colors.white38)))
                    : ListView.builder(
                        itemCount: _commentary.length,
                        itemBuilder: (_, idx) {
                          final c = _commentary[idx];
                          return Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: c.isWicket ? Colors.redAccent : (c.isBoundary ? Colors.purpleAccent : Colors.blueAccent),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(c.overBall, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(c.text, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showAnalyticsModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('PHASE 6: MATCH ANALYTICS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
              const Divider(color: Colors.white24),
              Text('Total Runs: $_totalRuns in $_completedOvers.$_ballsInCurrentOver overs', style: const TextStyle(color: Colors.white)),
              const SizedBox(height: 6),
              Text('Current Run Rate: ${(_totalRuns / ((_completedOvers * 6 + _ballsInCurrentOver) / 6.0)).toStringAsFixed(2)}', style: const TextStyle(color: Colors.cyanAccent)),
              const SizedBox(height: 6),
              Text('Current Partnership: $_partnershipRuns runs from $_partnershipBalls balls', style: const TextStyle(color: Colors.white70)),
              const SizedBox(height: 6),
              Text('Wickets Fallen: $_wickets', style: const TextStyle(color: Colors.redAccent)),
            ],
          ),
        );
      },
    );
  }

  void _showPredictorModal() {
    final double crr = (_completedOvers * 6 + _ballsInCurrentOver) > 0 ? (_totalRuns / ((_completedOvers * 6 + _ballsInCurrentOver) / 6.0)) : 6.0;
    final int ballsRemaining = (widget.totalOvers * 6) - (_completedOvers * 6 + _ballsInCurrentOver);
    final double oversRemaining = ballsRemaining / 6.0;

    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('PHASE 7: PROJECTED SCORE PREDICTOR', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
              const Divider(color: Colors.white24),
              Text('Projected at Current RR (${crr.toStringAsFixed(2)}): ${(_totalRuns + (crr * oversRemaining)).round()} runs', style: const TextStyle(color: Colors.cyanAccent)),
              const SizedBox(height: 6),
              Text('Projected at 6.0 RPO: ${(_totalRuns + (6.0 * oversRemaining)).round()} runs', style: const TextStyle(color: Colors.white70)),
              const SizedBox(height: 6),
              Text('Projected at 8.0 RPO: ${(_totalRuns + (8.0 * oversRemaining)).round()} runs', style: const TextStyle(color: Colors.white70)),
              const SizedBox(height: 6),
              Text('Projected at 10.0 RPO: ${(_totalRuns + (10.0 * oversRemaining)).round()} runs', style: const TextStyle(color: Colors.white70)),
            ],
          ),
        );
      },
    );
  }

  void _showWinProbModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('PHASE 8: LIVE WIN PROBABILITY', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('${widget.teamA.name}: 64%', style: const TextStyle(color: Colors.cyanAccent, fontWeight: FontWeight.bold)),
                  Text('${widget.teamB.name}: 36%', style: const TextStyle(color: Colors.orangeAccent, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 10),
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: const LinearProgressIndicator(
                  value: 0.64,
                  minHeight: 12,
                  backgroundColor: Colors.orange,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.cyan),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
