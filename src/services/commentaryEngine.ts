import { DismissalType } from '../types/cricket';

const DOT_LINES = [
  'Defended solidly back to the bowler.',
  'Pushed towards cover, no run taken.',
  'Good length delivery outside off, left alone safely.',
  'Beaten on the outside edge! Terrific delivery from the bowler.',
  'Short of a length, tapped to mid-on, bowler collects swiftly.',
  'Fuller delivery, driven firmly straight to mid-off. Dot ball.',
  'Play and a miss! Whistles past the outside edge.'
];

const SINGLE_LINES = [
  'Nudged off the hips behind square for a comfortable single.',
  'Pushed into the gap at covers and they take a quick single.',
  'Tapped towards mid-wicket, good call and easy run.',
  'Steered down to third man for one.',
  'Driven towards long-on, batsman rotates the strike smoothly.'
];

const TWO_LINES = [
  'Clipped off the pads through mid-wicket, superb running for a couple.',
  'Punched into the deep cover pocket, excellent call and two runs.',
  'Driven down the ground, fielder cuts it off, batters sprint back for two.'
];

const THREE_LINES = [
  'Glorious timing into the deep extra cover gap, batters turn for three!',
  'Worked through backward square leg, chased down just inside the boundary, 3 runs.'
];

const FOUR_LINES = [
  'FOUR! Smacked through the covers! Pure elegance and exquisite timing.',
  'FOUR! Cracking shot! Short and punished through backward point to the rope!',
  'FOUR! Driven down the ground, beats mid-off all ends up! What a boundary!',
  'FOUR! Pulled with authority through mid-wicket! No fielder is stopping that.'
];

const SIX_LINES = [
  'SIX! Stand and deliver! Clean as a whistle high over long-on into the stands!',
  'SIX! Dispatched! Picked up off the pads and sailed way over deep square leg!',
  'SIX! Huge hit! Dances down the pitch and launches it into the night sky!',
  'SIX! Maximum! In the slot and demolished over the bowler’s head!'
];

export function generateBallCommentary(params: {
  runsOffBat: number;
  extrasType?: string;
  extrasRuns: number;
  isWicket: boolean;
  dismissalType?: DismissalType;
  batterName: string;
  bowlerName: string;
  fielderName?: string;
}): string {
  const { runsOffBat, extrasType, extrasRuns, isWicket, dismissalType, batterName, bowlerName, fielderName } = params;

  if (isWicket) {
    switch (dismissalType) {
      case 'Bowled':
        return `OUT! BOWLED HIM! ${bowlerName} breaks through! Perfect line and length, hits the top of off stump! ${batterName} has to walk.`;
      case 'Caught':
        return `OUT! CAUGHT! ${batterName} miscues in the air and ${fielderName || 'the fielder'} pouches it safely! Great catch for ${bowlerName}.`;
      case 'Caught & Bowled':
        return `OUT! CAUGHT & BOWLED! Incredible reflex catch by ${bowlerName} off his own bowling! ${batterName} is stunned!`;
      case 'LBW':
        return `OUT! LBW! Trapped right in front of the stumps! Umpire raises the finger without hesitation. Huge breakthrough for ${bowlerName}!`;
      case 'Run Out':
        return `OUT! RUN OUT! Chaos between the wickets! Direct hit or quick throw by ${fielderName || 'the fielder'}, and ${batterName} is well short!`;
      case 'Stumped':
        return `OUT! STUMPED! ${batterName} steps down the track, beaten in flight, and lightning quick work with the gloves by ${fielderName || 'the wicketkeeper'}!`;
      case 'Hit Wicket':
        return `OUT! HIT WICKET! ${batterName} moves back and dislodges the bails with the bat! Unfortunate dismissal!`;
      case 'Obstructing Field':
        return `OUT! OBSTRUCTING THE FIELD! Rare dismissal as ${batterName} is ruled out for obstructing the fielder's throw!`;
      case 'Retired Out':
        return `${batterName} has been retired out and heads back to the dugout.`;
      case 'Retired Hurt':
        return `${batterName} is retired hurt and leaves the field for medical attention.`;
      default:
        return `OUT! Wicket falls! ${batterName} departs after a key spell from ${bowlerName}.`;
    }
  }

  if (extrasType === 'wide') {
    return `Wide ball signaled! Slipped down the leg side, extra ${extrasRuns} added to the total.`;
  }
  if (extrasType === 'no-ball') {
    return `NO BALL called! Bowler overstepped the crease! ${extrasRuns} extra runs and a Free Hit coming up!`;
  }
  if (extrasType === 'bye') {
    return `Bye! Beats both the batsman and wicketkeeper, ${extrasRuns} runs taken as byes.`;
  }
  if (extrasType === 'leg-bye') {
    return `Leg bye! Deft deflection off the pad into the vacant space, ${extrasRuns} leg byes taken.`;
  }

  if (runsOffBat === 0) {
    return DOT_LINES[Math.floor(Math.random() * DOT_LINES.length)];
  }
  if (runsOffBat === 1) {
    return SINGLE_LINES[Math.floor(Math.random() * SINGLE_LINES.length)];
  }
  if (runsOffBat === 2) {
    return TWO_LINES[Math.floor(Math.random() * TWO_LINES.length)];
  }
  if (runsOffBat === 3) {
    return THREE_LINES[Math.floor(Math.random() * THREE_LINES.length)];
  }
  if (runsOffBat === 4) {
    return FOUR_LINES[Math.floor(Math.random() * FOUR_LINES.length)];
  }
  if (runsOffBat === 6) {
    return SIX_LINES[Math.floor(Math.random() * SIX_LINES.length)];
  }

  return `${runsOffBat} runs scored off ${bowlerName}'s delivery to ${batterName}.`;
}
