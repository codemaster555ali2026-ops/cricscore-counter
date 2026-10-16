import { CricketMatch } from '../types/cricket';
import { GoogleGenAI } from '@google/genai';

export interface AIMatchReport {
  headline: string;
  narrative: string;
  keyTurningPoints: {
    number: number;
    title: string;
    description: string;
  }[];
  battingMvp: {
    playerName: string;
    teamName: string;
    stats: string;
    analysis: string;
  };
  bowlingMvp: {
    playerName: string;
    teamName: string;
    figures: string;
    analysis: string;
  };
  tacticalVerdict: string;
  generatedAt: string;
}

export function synthesizeLocalCricketReport(match: CricketMatch): AIMatchReport {
  const inn1 = match.innings1;
  const inn2 = match.innings2;

  const winnerTeam = match.result?.winnerTeamId === match.teamA.id
    ? match.teamA
    : match.result?.winnerTeamId === match.teamB.id
    ? match.teamB
    : null;

  const loserTeam = winnerTeam?.id === match.teamA.id ? match.teamB : match.teamA;

  // Gather all batters
  const allBatters = [
    ...inn1.batterStats.map((b) => ({ ...b, team: inn1.battingTeamName })),
    ...(inn2?.batterStats.map((b) => ({ ...b, team: inn2.battingTeamName })) || [])
  ];
  const sortedBatters = [...allBatters].sort((a, b) => b.runs - a.runs || b.strikeRate - a.strikeRate);
  const bestBatter = sortedBatters[0] || {
    name: 'Top Batsman',
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    strikeRate: 0,
    team: winnerTeam?.name || 'Winner',
    isOut: false
  };

  // Gather all bowlers
  const allBowlers = [
    ...inn1.bowlerStats.map((b) => ({ ...b, team: inn1.bowlingTeamName })),
    ...(inn2?.bowlerStats.map((b) => ({ ...b, team: inn2.bowlingTeamName })) || [])
  ];
  const sortedBowlers = [...allBowlers].sort((a, b) => b.wickets - a.wickets || a.economy - b.economy);
  const bestBowler = sortedBowlers[0] || {
    name: 'Top Bowler',
    overs: 0,
    maidens: 0,
    runsConceded: 0,
    wickets: 0,
    economy: 0,
    team: winnerTeam?.name || 'Winner'
  };

  // Determine margin and match type
  const isChase = match.currentInningsIndex === 1 && !!inn2;
  const winnerName = winnerTeam ? winnerTeam.name : (match.result?.resultText || 'Match Winner');
  const loserName = loserTeam ? loserTeam.name : 'Opponents';
  const margin = match.result?.marginText || 'Victory';

  // Construct journalistic headline
  let headline = `${winnerName.toUpperCase()} SEAL DRAMATIC VICTORY AT ${match.settings.venue.toUpperCase()}`;
  if (bestBatter.runs >= 10 && bestBatter.strikeRate > 150) {
    headline = `${winnerName.toUpperCase()} RUN RIOT: ${bestBatter.name.toUpperCase()}'S POWER BLOWS ${loserName.toUpperCase()} AWAY`;
  } else if (bestBowler.wickets >= 2) {
    headline = `${bestBowler.name.toUpperCase()} DISMANTLES ${loserName.toUpperCase()} TO SECURE CLINICAL VICTORY FOR ${winnerName.toUpperCase()}`;
  } else if (margin.toLowerCase().includes('wicket')) {
    headline = `${winnerName.toUpperCase()} CRUISE TO EMPHATIC VICTORY BY ${margin.toUpperCase()}`;
  } else if (margin.toLowerCase().includes('run')) {
    headline = `${winnerName.toUpperCase()} DEFEND TOTAL WITH GRIT TO CLINCH MATCH BY ${margin.toUpperCase()}`;
  }

  // Construct narrative paragraphs
  const p1 = `In an electrifying encounter at ${match.settings.venue}, ${winnerName} delivered a masterclass in modern cricket, overcoming ${loserName} by ${margin}. Having contested this ${match.settings.format} fixture across ${match.settings.totalOvers} overs per side, both squads put on a commanding display of tactical intent, pristine boundary striking, and pressure-cooker bowling.`;

  const p2 = `${inn1.battingTeamName} commenced the 1st innings establishing a tally of ${inn1.totalRuns}/${inn1.totalWickets} in ${inn1.oversDisplay} overs (Current Run Rate: ${inn1.currentRunRate.toFixed(2)}). Their batting lineup relied on structured partnerships, but the opposition bowling unit kept discipline tight with sharp variations in pace and stump-to-stump accuracy.`;

  const p3 = inn2
    ? `The second innings run-chase developed with intense momentum. Faced with a target of ${match.target || (inn1.totalRuns + 1)} runs, ${inn2.battingTeamName} responded with fearless aggression, registering ${inn2.totalRuns}/${inn2.totalWickets} in ${inn2.oversDisplay} overs at an explosive scoring rate of ${inn2.currentRunRate.toFixed(2)} RPO. Star batter ${bestBatter.name} provided the vital impetus, punishing loose deliveries and turning the required rate into an inevitable victory.`
    : `The contest concluded with authoritative authority, setting a standard for competitive excellence and high-voltage match execution.`;

  const p4 = `Tactically, the difference between the two sides came down to execution during the decisive power overs. ${winnerName}'s ability to seize key moments while stifling boundary opportunities in critical phases proved to be the winning formula.`;

  const narrative = `${p1}\n\n${p2}\n\n${p3}\n\n${p4}`;

  // Key turning points
  const keyTurningPoints = [
    {
      number: 1,
      title: `${bestBowler.name}'s Controlled Spell`,
      description: `Bowled with supreme discipline (${bestBowler.overs} ov, ${bestBowler.wickets} wkts, ${bestBowler.runsConceded} runs, Eco: ${bestBowler.economy}), maintaining unrelenting pressure on the batting order.`
    },
    {
      number: 2,
      title: `${bestBatter.name}'s Decisive Knock`,
      description: `Delivered a match-defining display scoring ${bestBatter.runs} runs off ${bestBatter.balls} balls (${bestBatter.fours}x4, ${bestBatter.sixes}x6) with a breathtaking strike rate of ${bestBatter.strikeRate}.`
    },
    {
      number: 3,
      title: `Momentum Shift in Decisive Overs`,
      description: `${winnerName} capitalized on boundary opportunities and sharp running between wickets, keeping the run rate under complete control and denying the fielding side any counterattack.`
    }
  ];

  const battingMvp = {
    playerName: bestBatter.name,
    teamName: bestBatter.team || winnerName,
    stats: `${bestBatter.runs}${bestBatter.isOut ? '' : '*'} runs (${bestBatter.balls} balls, ${bestBatter.fours}x4, ${bestBatter.sixes}x6, SR ${bestBatter.strikeRate})`,
    analysis: `${bestBatter.name}'s fearless intent and immaculate shot selection completely unhinged the opposition attack, anchoring the innings with clinical authority.`
  };

  const bowlingMvp = {
    playerName: bestBowler.name,
    teamName: bestBowler.team || winnerName,
    figures: `${bestBowler.overs}.0-${bestBowler.maidens}-${bestBowler.runsConceded}-${bestBowler.wickets} (Economy: ${bestBowler.economy.toFixed(2)})`,
    analysis: `Tasked with crucial overs, ${bestBowler.name} denied room, attacked the stumps consistently, and broke key partnerships to stifle the scoring rate.`
  };

  const tacticalVerdict = `${winnerName} executed their game plan with flawless composure, outmaneuvering ${loserName} in run-rate management, boundary conversion, and fielding precision to seal a well-deserved victory.`;

  return {
    headline,
    narrative,
    keyTurningPoints,
    battingMvp,
    bowlingMvp,
    tacticalVerdict,
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

export async function generateAIMatchReport(match: CricketMatch): Promise<AIMatchReport> {
  const localReport = synthesizeLocalCricketReport(match);

  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                 (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return localReport;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a world-class cricket journalist and tactical analyst for ESPNcricinfo and BBC Test Match Special.
Generate an official journalistic match summary for this completed cricket match:
Match: ${match.teamA.name} vs ${match.teamB.name}
Format: ${match.settings.format} (${match.settings.totalOvers} overs per side)
Venue: ${match.settings.venue}
Result: ${match.result?.resultText || 'Match Completed'}
Margin: ${match.result?.marginText || 'Victory'}
1st Innings: ${match.innings1.battingTeamName} ${match.innings1.totalRuns}/${match.innings1.totalWickets} in ${match.innings1.oversDisplay} ov (CRR: ${match.innings1.currentRunRate})
2nd Innings: ${match.innings2 ? `${match.innings2.battingTeamName} ${match.innings2.totalRuns}/${match.innings2.totalWickets} in ${match.innings2.oversDisplay} ov` : 'None'}

Return ONLY a valid JSON object matching this TypeScript structure:
{
  "headline": "PUNCHY ALL-CAPS CRICKET HEADLINE",
  "narrative": "Three to four paragraphs of vivid, high-voltage cricket journalism analyzing the match story, pitch dynamics, powerplay, middle overs, and finishing moments.",
  "keyTurningPoints": [
    { "number": 1, "title": "Short title", "description": "Concise analytical explanation of what happened" },
    { "number": 2, "title": "Short title", "description": "Concise analytical explanation of what happened" },
    { "number": 3, "title": "Short title", "description": "Concise analytical explanation of what happened" }
  ],
  "battingMvp": {
    "playerName": "${localReport.battingMvp.playerName}",
    "teamName": "${localReport.battingMvp.teamName}",
    "stats": "${localReport.battingMvp.stats}",
    "analysis": "Short 2-sentence journalistic analysis of this batsman's technique and impact"
  },
  "bowlingMvp": {
    "playerName": "${localReport.bowlingMvp.playerName}",
    "teamName": "${localReport.bowlingMvp.teamName}",
    "figures": "${localReport.bowlingMvp.figures}",
    "analysis": "Short 2-sentence journalistic analysis of this bowler's line, length, and wicket threat"
  },
  "tacticalVerdict": "One punchy, authoritative quote summarizing the decisive tactical difference between the two teams."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text) as Partial<AIMatchReport>;
      if (parsed.headline && parsed.narrative && Array.isArray(parsed.keyTurningPoints)) {
        return {
          headline: parsed.headline,
          narrative: parsed.narrative,
          keyTurningPoints: parsed.keyTurningPoints,
          battingMvp: parsed.battingMvp || localReport.battingMvp,
          bowlingMvp: parsed.bowlingMvp || localReport.bowlingMvp,
          tacticalVerdict: parsed.tacticalVerdict || localReport.tacticalVerdict,
          generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
    }
  } catch (err) {
    console.warn('[AIMatchReportService] Gemini generation error, using fallback:', err);
  }

  return localReport;
}
