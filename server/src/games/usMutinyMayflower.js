// usMutinyMayflower.js — Unit 1 U.S. History adapter: "Mutiny on the Mayflower"
// (SOLO, single role, NO variant, NO branch). The student plays William Bradford
// on the storm-blown Mayflower, November 1620 — landed north of Virginia, outside
// its charter, with passengers declaring "none had power to command them." Through
// EIGHT dialogue confrontations the student talks Separatists and Strangers into
// signing the Mayflower Compact. Every right answer IS one of the Compact's real
// ideas, in kid words. Persuade them all and the page gets its 41 signatures.
//
// THE ENGINE OF THE DESIGN (spec §1): the signature tally is drama; ACCURACY is
// the grade. History guarantees the signing — your score decides whether you
// talked them into it or history dragged them there.
//
// Straight factory usage (spec §6): 8 static graded steps, one class group, no
// variants, no branch, no map, no AI rival. Two meters — Trust 🤝 and Order ⚖️ —
// start at 50. Right = 1, partial = 0.5, wrong = 0 (server-side, verdict-only);
// accuracy = points ÷ 8 × 100. Endings tier by ACCURACY (spec §3.3), not meters.
//
// Reading level (Common Standards §3): everything the student sees is 8th-grade
// content at a 5th-grade reading level. The 1620 register (short sentences, plain
// words, period rhythm) is authored here; the client underlines the six vocabulary
// terms with tap-for-plain-words bubbles (spec §2.2) and reads Scene 7's real
// Compact line letter-by-letter (spec §5.3).
//
// SENSITIVITY (spec §11, Common Standards §10): Separatist faith is respected as
// motive; the game grades civics, never belief. Scene 6 tells the hard truth that
// only the 41 men signed — the women who worked, froze, and died were not asked —
// and does not soften it. The epilogue names the Wampanoag as rescuers with
// knowledge and agency, and the first-winter deaths factually, without spectacle.

import { createStepGame } from './_stepGame.js';

// ---------------------------------------------------------------------------
// Meters (shipped to clients at match:begin — display info only)
// ---------------------------------------------------------------------------

export const METERS = {
  trust: { name: 'Trust', icon: 'trust', blurb: 'Do the passengers believe you? Trust is earned with honest, plain answers.' },
  order: { name: 'Order', icon: 'order', blurb: 'Is the ship holding together? Order falls when talk turns to mutiny.' },
};

export const START_METERS = { trust: 50, order: 50 };

// One class group (spec §1: "Pick: None — one class group"). The roster and the
// Command Center group every student under this single side.
export const SIDE = 'bradford';

// ---------------------------------------------------------------------------
// The eight scenes — verbatim from spec §4. Each scene: a character throws a real
// objection (the `prompt`), three replies (`choices`), and a verdict + feedback in
// Bradford's voice. Default effects (spec §3.2): ✅ +10 to the named meter, ⚠️ 0,
// ❌ −10. Two noted exceptions ride explicit effects: Scene 7 force (Order −15)
// and Scene 8 election (Order +10, Trust +5).
//
// v: 'right' | 'partial' | 'wrong'   fx: explicit effect object (overrides default)
// ---------------------------------------------------------------------------

const V = { R: 'right', P: 'partial', W: 'wrong' };

// Compile a raw choice against the scene's `lead` meter into an engine choice.
const DEFAULT_FX = { right: (m) => ({ [m]: 10 }), partial: () => ({}), wrong: (m) => ({ [m]: -10 }) };

function choice(label, verdict, feedback, lead, fx) {
  return { label, verdict, feedback, effects: fx || DEFAULT_FX[verdict](lead) };
}

// A scene is a prompt (the character's objection) + three choices, one graded step.
function scene(prompt, lead, a, b, c) {
  return {
    kind: 'decision',
    prompt,
    choices: [
      choice(a.label, a.v, a.fb, lead, a.fx),
      choice(b.label, b.v, b.fb, lead, b.fx),
      choice(c.label, c.v, c.fb, lead, c.fx),
    ],
  };
}

export const SCENES = [
  // ---- Scene 1 — The Stranger's Challenge -------------------------------
  scene(
    'The storm blew us past Virginia. The charter is void here — none hath power to command us!',
    'order',
    { label: 'Then we make our own power — we covenant together: our laws, our promise, binding us all.',
      v: V.R, fb: 'That word — covenant — turned a dead charter into a living government.' },
    { label: "The King's charter still rules you. Obey it.",
      v: V.W, fb: "He's right — the paper's power ended miles south. Waving it looks weak." },
    { label: "We'll sort it out once we're ashore.",
      v: V.P, fb: 'Every hour unanswered, the mutiny talk grows.' },
  ),

  // ---- Scene 2 — The Fearful Elder --------------------------------------
  scene(
    "Sign a paper with Strangers? They don't share our faith!",
    'trust',
    { label: 'The compact is civil, not church — one body politick for laws, while every soul keeps its own faith.',
      v: V.R, fb: 'Civil, not religious — that line is why both groups could sign one page.' },
    { label: "Once they sign, they'll come around to our church.",
      v: V.W, fb: 'Not the deal — and the Strangers would smell it.' },
    { label: 'Then we Separatists sign alone.',
      v: V.P, fb: "Half a colony's promise governs half a colony." },
  ),

  // ---- Scene 3 — The Servant's Question ---------------------------------
  scene(
    "I'm a servant, sir. Does my promise even count?",
    'trust',
    { label: 'Aye. Free men and servants sign alike — consent means every man’s word helps give the laws their power.',
      v: V.R, fb: "Howland signed the real Compact. The boy the ocean couldn't keep became a signer of America's first self-government." },
    { label: 'No. Signing is for gentlemen.',
      v: V.W, fb: "Cut out the servants and you've rebuilt the old world." },
    { label: 'You may stand and watch.',
      v: V.P, fb: "Watching isn't consenting." },
  ),

  // ---- Scene 4 — The Merchant's Price -----------------------------------
  scene(
    'Fine words. What do I get for my signature?',
    'trust',
    { label: 'Just and equal laws, made for the general good — and a voice in choosing who governs.',
      v: V.R, fb: "Straight from the Compact's text. 'Just and equal' closed the deal for men who trusted contracts more than sermons." },
    { label: 'Protection — so long as you obey.',
      v: V.P, fb: 'Half the bargain. He asked about the other half: a say.' },
    { label: 'Land. As much as you can fence.',
      v: V.W, fb: 'Promise land you don’t hold and the compact dies at the first survey.' },
  ),

  // ---- Scene 5 — The Doubter of Self-Rule -------------------------------
  scene(
    'Laws we write ourselves? A king’s power comes from God — who are WE to govern?',
    'order',
    { label: 'Government can stand on the consent of the governed — our own promise binds us tighter than fear of any crown.',
      v: V.R, fb: 'There it is — the idea that travels from this cabin to 1776.' },
    { label: "You're right. We'll send to England and wait on the King's word.",
      v: V.W, fb: 'Months of ocean each way. The colony would starve waiting for permission to exist.' },
    { label: "Then let the ship's captain rule us.",
      v: V.P, fb: "A captain's word ends at the waterline." },
  ),

  // ---- Scene 6 — The Question with No Good Answer -----------------------
  scene(
    'And we women — do we sign this compact?',
    'trust',
    { label: "No — and I'll not pretend otherwise. Only the men will sign today. But the promise of consent, once planted, grows — and these laws must protect your family all the same.",
      v: V.R, fb: "The honest answer. History records 41 men; the answer took America centuries — the game won't lie about that." },
    { label: 'Women have no place in such matters.',
      v: V.W, fb: "Wrong even in 1620's own terms — the colony ran on women's work and judgment — and wrong now." },
    { label: 'Perhaps… ask again ashore.',
      v: V.P, fb: 'She deserved a straight answer. Dodging costs trust.' },
  ),

  // ---- Scene 7 — The Brink (the "money moment," spec §5.3) --------------
  scene(
    'ENOUGH TALK! Every family for itself!',
    'order',
    { label: "Hold! Hear the words: 'We covenant and combine ourselves together into a civil body politick.' One people, under laws WE choose — sign, and we land together.",
      v: V.R, fb: 'The real text, read aloud, did what shouting couldn’t. The near-mutiny died on that sentence.' },
    { label: 'Master-at-arms — seize that man!',
      v: V.W, fb: 'Force, to save a compact about consent. Even working, it proves them right.',
      fx: { order: -15 } },
    { label: "Let them cool below deck; we'll talk at dawn.",
      v: V.P, fb: "Dawn might be too late — but at least it isn't chains." },
  ),

  // ---- Scene 8 — The First Election -------------------------------------
  scene(
    'The page holds 41 names. Now: who governs?',
    'order',
    { label: 'The signers choose. I put forward John Carver — let every signer’s voice confirm him.',
      v: V.R, fb: "Carver became governor by consent — chosen, not born to it. The Compact's first test, passed.",
      fx: { order: 10, trust: 5 } },
    { label: "I'll take charge myself. Someone must.",
      v: V.P, fb: 'Bradford, you WILL govern Plymouth — elected, later, roughly thirty times. Seizing it today breaks the page you just signed.' },
    { label: 'The wealthiest man aboard should rule.',
      v: V.W, fb: "Purses don't govern. Promises do." },
  ),
];

// ---------------------------------------------------------------------------
// Assembly. The engine groups steps into "chapters" of two; a dialogue game has
// no chapter cards, so the client renders each scene from its own step (portrait,
// speaker, and the letter-by-letter reading are keyed on stepIndex client-side)
// and ignores the chapter grouping. Four phases × two scenes keeps the engine's
// chapter math exact; the phase title/image below are never shown to the student.
// ---------------------------------------------------------------------------

const PHASE_TITLES = ['Aboard the Mayflower', 'The Hard Questions', 'The Brink', 'The Signing'];

export function phasesFor() {
  const phases = [];
  for (let i = 0; i < SCENES.length; i += 2) {
    phases.push({
      title: PHASE_TITLES[i / 2],
      date: 'November 1620',
      image: 'scene_signing.jpg',
      event: 'The lantern swings. The next voice rises out of the dark.',
      steps: [SCENES[i], SCENES[i + 1]],
    });
  }
  return phases;
}

// ---------------------------------------------------------------------------
// Endings tier by ACCURACY (spec §3.3). Every ending reaches the signing —
// because history did. The tier only decides HOW: talked into it, or dragged.
// The signature tally is a client flourish; the ending reconciles it to 41.
// ---------------------------------------------------------------------------

export const NAMES_MIN = 80;   // high — "41 Names"
export const BARELY_MIN = 45;  // middle — "Signed, Barely"; below this is "History Outvotes You"

export const ENDINGS = {
  names: { key: 'names', title: '41 Names',
    text: 'The quill moves down the page and does not stop. Forty-one names — Separatists and Strangers, a gentleman and a servant, side by side. You didn’t force them. You convinced them. That’s the whole idea.' },
  barely: { key: 'barely', title: 'Signed, Barely',
    text: 'The page fills — grudgingly, some hands slower than others — but it fills. Forty-one names. A few signed because the argument finally landed; a few because everyone else was signing. It held. Next time, make every word carry an idea, and they’ll follow you, not the crowd.' },
  outvoted: { key: 'outvoted', title: 'History Outvotes You',
    text: 'The leaders make the case past you, and the crowd quiets on its own. The page is signed anyway — all 41 names — because the Compact was always going to happen. The Compact didn’t need you. You need the Compact. So here is what it actually said, in plain words, before you play again.' },
};

export function endingFor(_score, accuracy) {
  if (accuracy >= NAMES_MIN) return ENDINGS.names;
  if (accuracy >= BARELY_MIN) return ENDINGS.barely;
  return ENDINGS.outvoted;
}

// The "score" the report carries is just the two meters added (max 200) — a
// how-did-the-ship-hold flourish. It never decides the tier; accuracy does.
export function shipScore(meters) {
  return (meters.trust || 0) + (meters.order || 0);
}

// ---------------------------------------------------------------------------
// The epilogue (spec §3.3) — SAME for every tier. The brutal first winter (half
// died), the Wampanoag's help, and the seed line from the promise to 1776. Shown
// under every ending as the game's debrief.
// ---------------------------------------------------------------------------

export const EPILOGUE =
  'What happened next was not gentle. That first winter killed nearly half the colonists — cold, hunger, and sickness took them one by one, and the survivors buried their dead at night so no one ashore would count how few were left. They lived because the Wampanoag, whose homeland this was, chose to share their knowledge — how to plant corn, where to fish, how to last a New England winter. ' +
  'But the promise signed on that ship did not die with the people who signed it. It grew. A compact became a town meeting, where neighbors made their own rules face to face. Town meetings became colony governments like the Fundamental Orders. And the idea at the center of it all — that a government’s power comes from the consent of the governed, not from a king or a crown — was written again, larger, in 1776: “governments are instituted among Men, deriving their just powers from the consent of the governed.” ' +
  'That line started here, in a cold cabin, with 41 signatures you helped collect. Play again — try to talk every one of them into it.';

export function debriefFor() {
  return EPILOGUE;
}

// ---------------------------------------------------------------------------

export default createStepGame({
  id: 'us-mutiny-mayflower',
  title: 'Mutiny on the Mayflower',
  sides: [SIDE],                 // one class group — no pick
  modes: ['solo'],
  soloRival: false,             // you talk one deck alone — no AI rival
  startMeters: () => ({ ...START_METERS }),
  phasesFor,
  meta: { meters: METERS },     // no map layer
  scoreMeters: shipScore,
  endingFor,
  debriefFor,
});
