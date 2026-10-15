import { jsPDF } from 'jspdf';
import { CricketMatch } from '../types/cricket';

export function generateCricketMatchPDF(match: CricketMatch): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  // Header Banner
  doc.setFillColor(11, 25, 44); // Deep Navy Blue #0B192C
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL CRICKET MATCH SCORECARD', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 225, 255);
  doc.text(`${match.settings.format} Format • ${match.settings.venue} • ${match.settings.matchDate}`, 14, 19);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 24);

  y = 35;

  // Match Result Box
  doc.setFillColor(240, 246, 255);
  doc.setDrawColor(0, 141, 218);
  doc.roundedRect(12, y, pageWidth - 24, 22, 2, 2, 'FD');

  doc.setTextColor(11, 25, 44);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(match.result ? match.result.resultText.toUpperCase() : 'MATCH IN PROGRESS', 16, y + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 80, 95);
  const tossText = match.toss
    ? `Toss: ${match.toss.winnerTeamId === match.teamA.id ? match.teamA.name : match.teamB.name} elected to ${match.toss.decision} first.`
    : 'Toss not recorded';
  const pomText = match.result?.playerOfTheMatch
    ? ` • Player of the Match: ${match.result.playerOfTheMatch.playerName} (${match.result.playerOfTheMatch.performance})`
    : '';
  doc.text(tossText + pomText, 16, y + 15);

  y += 28;

  const renderInnings = (inn: typeof match.innings1, title: string) => {
    if (!inn) return;

    // Check page space
    if (y > 220) {
      doc.addPage();
      y = 15;
    }

    doc.setFillColor(30, 62, 98); // Slate Navy
    doc.rect(12, y, pageWidth - 24, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${title}: ${inn.battingTeamName} - ${inn.totalRuns}/${inn.totalWickets} (${inn.oversDisplay} ov)`, 16, y + 5.5);
    doc.text(`Run Rate: ${inn.currentRunRate.toFixed(2)}`, pageWidth - 45, y + 5.5);
    y += 11;

    // Batting Table Header
    doc.setFillColor(235, 240, 248);
    doc.rect(12, y, pageWidth - 24, 6, 'F');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('BATTER', 16, y + 4.2);
    doc.text('DISMISSAL', 68, y + 4.2);
    doc.text('R', 132, y + 4.2);
    doc.text('B', 145, y + 4.2);
    doc.text('4s', 158, y + 4.2);
    doc.text('6s', 170, y + 4.2);
    doc.text('SR', 182, y + 4.2);
    y += 7;

    // Batting Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    inn.batterStats.forEach((bat) => {
      if (y > 270) {
        doc.addPage();
        y = 15;
      }
      doc.setTextColor(15, 23, 42);
      const nameText = bat.name.length > 25 ? bat.name.substring(0, 23) + '..' : bat.name;
      doc.text(nameText, 16, y + 4);

      doc.setTextColor(100, 116, 139);
      const dismText = (bat.dismissalText || (bat.isOut ? 'out' : 'not out')).substring(0, 36);
      doc.text(dismText, 68, y + 4);

      doc.setTextColor(15, 23, 42);
      doc.text(bat.runs.toString(), 132, y + 4);
      doc.text(bat.balls.toString(), 145, y + 4);
      doc.text(bat.fours.toString(), 158, y + 4);
      doc.text(bat.sixes.toString(), 170, y + 4);
      doc.text(bat.strikeRate.toFixed(1), 182, y + 4);
      y += 5.5;
    });

    // Extras
    doc.setFillColor(248, 250, 252);
    doc.rect(12, y, pageWidth - 24, 5.5, 'F');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Extras: ${inn.extras.total} (b ${inn.extras.byes}, lb ${inn.extras.legByes}, w ${inn.extras.wides}, nb ${inn.extras.noBalls}) • Total: ${inn.totalRuns}/${inn.totalWickets} (${inn.oversDisplay} Overs)`,
      16,
      y + 3.8
    );
    y += 8;

    // Bowling Table Header
    doc.setFillColor(235, 240, 248);
    doc.rect(12, y, pageWidth - 24, 6, 'F');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('BOWLER', 16, y + 4.2);
    doc.text('O', 95, y + 4.2);
    doc.text('M', 115, y + 4.2);
    doc.text('R', 135, y + 4.2);
    doc.text('W', 155, y + 4.2);
    doc.text('ECO', 178, y + 4.2);
    y += 7;

    // Bowling Rows
    doc.setFont('helvetica', 'normal');
    inn.bowlerStats.forEach((bowl) => {
      if (y > 270) {
        doc.addPage();
        y = 15;
      }
      doc.setTextColor(15, 23, 42);
      doc.text(bowl.name, 16, y + 4);
      doc.text(`${bowl.overs}.${bowl.ballsInOver}`, 95, y + 4);
      doc.text(bowl.maidens.toString(), 115, y + 4);
      doc.text(bowl.runsConceded.toString(), 135, y + 4);
      doc.text(bowl.wickets.toString(), 155, y + 4);
      doc.text(bowl.economy.toFixed(2), 178, y + 4);
      y += 5.5;
    });

    // Fall of Wickets
    if (inn.fallOfWickets.length > 0) {
      y += 2;
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      const fowStr = inn.fallOfWickets.map((f) => `${f.wicketNumber}-${f.score} (${f.playerOutName}, ${f.overs} ov)`).join('; ');
      doc.text(`Fall of Wickets: ${fowStr.substring(0, 110)}`, 16, y + 3);
      y += 7;
    }

    y += 6;
  };

  renderInnings(match.innings1, '1ST INNINGS');
  if (match.innings2) {
    renderInnings(match.innings2, '2ND INNINGS');
  }

  // Footer stamp
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Cricket Scoreboard App • Complete Data & Analytics Engine • Material 3 Design', 14, 290);

  const cleanTitle = (match.title || 'Cricket_Scorecard').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${cleanTitle}.pdf`);
}
