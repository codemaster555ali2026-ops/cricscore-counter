import 'dart:typed_data';
import 'package:flutter/services.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../models/match_model.dart';

class PdfGeneratorService {
  /// Generates a complete professional PDF document of the cricket match
  static Future<Uint8List> generateMatchPdf(CricketMatch match) async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(32),
        build: (pw.Context context) {
          return [
            // Header
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Text(
                      'CRICKET MATCH REPORT',
                      style: pw.TextStyle(
                        fontSize: 22,
                        fontWeight: pw.FontWeight.bold,
                        color: PdfColors.blue900,
                      ),
                    ),
                    pw.Text(
                      'Official Tournament Match Scorecard & Statistics',
                      style: pw.TextStyle(
                        fontSize: 10,
                        fontWeight: pw.FontWeight.bold,
                        color: PdfColors.orange800,
                      ),
                    ),
                    pw.SizedBox(height: 6),
                    pw.Text(
                      'Fixture: ${match.teamA.name} vs ${match.teamB.name}',
                      style: const pw.TextStyle(fontSize: 11),
                    ),
                    pw.Text(
                      'Format: ${match.format.name.toUpperCase()} (${match.totalOvers} Overs) | Venue: ${match.venue}',
                      style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey700),
                    ),
                    pw.Text(
                      'Date: ${match.date} | ID: ${match.id}',
                      style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey600),
                    ),
                  ],
                ),
                pw.Container(
                  padding: const pw.EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: pw.BoxDecoration(
                    color: PdfColors.blue50,
                    borderRadius: pw.BorderRadius.circular(6),
                    border: pw.Border.all(color: PdfColors.blue300),
                  ),
                  child: pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Text(
                        'OFFICIAL RECORD',
                        style: pw.TextStyle(
                          fontSize: 9,
                          fontWeight: pw.FontWeight.bold,
                          color: PdfColors.blue800,
                        ),
                      ),
                      pw.SizedBox(height: 2),
                      pw.Text(
                        'Toss: ${match.tossWinnerTeamId == match.teamA.id ? match.teamA.name : match.teamB.name} (${match.tossDecision.toUpperCase()})',
                        style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey800),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            pw.SizedBox(height: 12),
            pw.Divider(thickness: 1, color: PdfColors.grey300),
            pw.SizedBox(height: 8),

            // Result Banner
            if (match.isCompleted) ...[
              pw.Container(
                width: double.infinity,
                padding: const pw.EdgeInsets.all(12),
                decoration: pw.BoxDecoration(
                  color: PdfColors.blue50,
                  borderRadius: pw.BorderRadius.circular(8),
                  border: pw.Border.all(color: PdfColors.blue400),
                ),
                child: pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Text(
                      'MATCH RESULT',
                      style: pw.TextStyle(
                        fontSize: 9,
                        fontWeight: pw.FontWeight.bold,
                        color: PdfColors.blue700,
                      ),
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text(
                      match.resultText.isNotEmpty ? match.resultText : 'Match Concluded',
                      style: pw.TextStyle(
                        fontSize: 14,
                        fontWeight: pw.FontWeight.bold,
                        color: PdfColors.blue900,
                      ),
                    ),
                    if (match.playerOfTheMatch != null && match.playerOfTheMatch!.isNotEmpty) ...[
                      pw.SizedBox(height: 4),
                      pw.Text(
                        'Player of the Match: ${match.playerOfTheMatch}',
                        style: pw.TextStyle(
                          fontSize: 10,
                          fontWeight: pw.FontWeight.bold,
                          color: PdfColors.green800,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              pw.SizedBox(height: 16),
            ],

            // 1st Innings Section
            _buildInningsScorecardPdf(match.innings1, '1ST INNINGS'),
            pw.SizedBox(height: 16),

            // 2nd Innings Section (if exists)
            if (match.innings2 != null) ...[
              _buildInningsScorecardPdf(match.innings2!, '2ND INNINGS'),
              pw.SizedBox(height: 16),
            ],

            // Commentary Highlights
            if (match.commentary.isNotEmpty) ...[
              pw.Text(
                'BALL-BY-BALL COMMENTARY HIGHLIGHTS',
                style: pw.TextStyle(
                  fontSize: 12,
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColors.blue900,
                ),
              ),
              pw.SizedBox(height: 6),
              pw.Table(
                border: pw.TableBorder.all(color: PdfColors.grey300, width: 0.5),
                columnWidths: {
                  0: const pw.FixedColumnWidth(45),
                  1: const pw.FixedColumnWidth(40),
                  2: const pw.FlexColumnWidth(),
                },
                children: [
                  pw.TableRow(
                    decoration: const pw.BoxDecoration(color: PdfColors.grey200),
                    children: [
                      _th('Over'),
                      _th('Runs'),
                      _th('Description'),
                    ],
                  ),
                  ...match.commentary.take(15).map((c) {
                    return pw.TableRow(
                      children: [
                        _td(c.overBall, isBold: true),
                        _td(c.isWicket ? 'W' : '${c.runs}', color: c.isWicket ? PdfColors.red800 : null),
                        _td(c.text),
                      ],
                    );
                  }).toList(),
                ],
              ),
            ],

            pw.SizedBox(height: 24),
            pw.Divider(thickness: 0.5, color: PdfColors.grey400),
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text('Generated by Cricket Scoreboard Pro Engine (15 Phases)', style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey600)),
                pw.Text('Official Scorer & Umpire Verified', style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey600)),
              ],
            ),
          ];
        },
      ),
    );

    return pdf.save();
  }

  static pw.Widget _buildInningsScorecardPdf(InningsData innings, String title) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        pw.Row(
          mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
          children: [
            pw.Text(
              '$title - ${innings.teamName.toUpperCase()}',
              style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold, color: PdfColors.blue900),
            ),
            pw.Text(
              '${innings.totalRuns}/${innings.wickets} (${innings.completedOvers}.${innings.ballsInOver} ov)',
              style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold, color: PdfColors.blue900),
            ),
          ],
        ),
        pw.SizedBox(height: 6),

        // Batting Table
        pw.Table(
          border: pw.TableBorder.all(color: PdfColors.grey300, width: 0.5),
          columnWidths: {
            0: const pw.FlexColumnWidth(3),
            1: const pw.FlexColumnWidth(3),
            2: const pw.FixedColumnWidth(30),
            3: const pw.FixedColumnWidth(30),
            4: const pw.FixedColumnWidth(25),
            5: const pw.FixedColumnWidth(25),
            6: const pw.FixedColumnWidth(40),
          },
          children: [
            pw.TableRow(
              decoration: const pw.BoxDecoration(color: PdfColors.grey200),
              children: [
                _th('Batter'),
                _th('Dismissal'),
                _th('R'),
                _th('B'),
                _th('4s'),
                _th('6s'),
                _th('SR'),
              ],
            ),
            ...innings.batters.map((b) {
              return pw.TableRow(
                children: [
                  _td(b.name, isBold: true),
                  _td(b.isOut ? (b.dismissalText ?? 'out') : 'not out'),
                  _td('${b.runs}', isBold: true),
                  _td('${b.balls}'),
                  _td('${b.fours}'),
                  _td('${b.sixes}'),
                  _td(b.strikeRate.toStringAsFixed(1)),
                ],
              );
            }).toList(),
          ],
        ),
        pw.SizedBox(height: 4),

        // Extras & Fall of Wickets
        pw.Text(
          'Extras: ${innings.extras.total} (b ${innings.extras.byes}, lb ${innings.extras.legByes}, w ${innings.extras.wides}, nb ${innings.extras.noBalls})',
          style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey700),
        ),
        if (innings.fallOfWickets.isNotEmpty) ...[
          pw.Text(
            'Fall of Wickets: ${innings.fallOfWickets.map((f) => "${f.wicketNumber}-${f.teamRuns} (${f.batsmanName}, ${f.over} ov)").join(", ")}',
            style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey700),
          ),
        ],

        pw.SizedBox(height: 8),

        // Bowling Table
        pw.Table(
          border: pw.TableBorder.all(color: PdfColors.grey300, width: 0.5),
          columnWidths: {
            0: const pw.FlexColumnWidth(4),
            1: const pw.FixedColumnWidth(30),
            2: const pw.FixedColumnWidth(30),
            3: const pw.FixedColumnWidth(30),
            4: const pw.FixedColumnWidth(30),
            5: const pw.FixedColumnWidth(40),
          },
          children: [
            pw.TableRow(
              decoration: const pw.BoxDecoration(color: PdfColors.grey200),
              children: [
                _th('Bowler'),
                _th('O'),
                _th('M'),
                _th('R'),
                _th('W'),
                _th('ECO'),
              ],
            ),
            ...innings.bowlers.map((bw) {
              return pw.TableRow(
                children: [
                  _td(bw.name, isBold: true),
                  _td('${bw.overs}.${bw.ballsInOver}'),
                  _td('${bw.maidens}'),
                  _td('${bw.runsConceded}'),
                  _td('${bw.wickets}', isBold: true, color: PdfColors.red800),
                  _td(bw.economy.toStringAsFixed(2)),
                ],
              );
            }).toList(),
          ],
        ),
      ],
    );
  }

  static pw.Widget _th(String text) {
    return pw.Padding(
      padding: const pw.EdgeInsets.all(4),
      child: pw.Text(
        text,
        style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold, color: PdfColors.black),
        textAlign: pw.TextAlign.center,
      ),
    );
  }

  static pw.Widget _td(String text, {bool isBold = false, PdfColor? color}) {
    return pw.Padding(
      padding: const pw.EdgeInsets.all(4),
      child: pw.Text(
        text,
        style: pw.TextStyle(
          fontSize: 8,
          fontWeight: isBold ? pw.FontWeight.bold : pw.FontWeight.normal,
          color: color ?? PdfColors.black,
        ),
      ),
    );
  }

  /// Print or Preview the PDF
  static Future<void> printOrPreview(CricketMatch match) async {
    final pdfBytes = await generateMatchPdf(match);
    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdfBytes,
      name: 'Match_Report_${match.id}.pdf',
    );
  }

  /// Share the PDF directly via system share dialog
  static Future<void> sharePdf(CricketMatch match) async {
    final pdfBytes = await generateMatchPdf(match);
    await Printing.sharePdf(
      bytes: pdfBytes,
      filename: 'Cricket_Scorecard_${match.id}.pdf',
    );
  }
}
