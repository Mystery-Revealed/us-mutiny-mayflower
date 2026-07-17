// content.test.js — structure, scoring-reachability, verbatim-quote, and
// sensitivity checks on the Mutiny on the Mayflower content. The core promises:
// eight scenes with exactly one right answer each (so all-right = 100%), the two
// real Compact lines present exactly, endings tiered by ACCURACY, and the Scene 6
// women's-exclusion beat stated plainly, not softened (spec §10, §11).
import test from 'node:test';
import assert from 'node:assert/strict';
import game, {
  METERS, START_METERS, SCENES, SIDE,
  phasesFor, shipScore, endingFor, debriefFor, ENDINGS, NAMES_MIN, BARELY_MIN,
} from '../src/games/usMutinyMayflower.js';

const stepsOf = () => phasesFor().flatMap((p) => p.steps);
const pointsFor = (v) => (v === 'right' ? 1 : v === 'partial' ? 0.5 : 0);

test('one class group, solo, no rival, two meters at 50', () => {
  assert.deepEqual(game.sides, ['bradford']);
  assert.equal(SIDE, 'bradford');
  assert.equal(game.soloRival, false, 'you talk one deck alone — no AI rival');
  assert.deepEqual(Object.keys(METERS), ['trust', 'order']);
  assert.deepEqual(START_METERS, { trust: 50, order: 50 });
  assert.equal(game.meta.positions, undefined, 'no map layer');
  assert.equal(game.totalActions, 8);
});

test('eight scenes, each a decision with three choices and all fields present', () => {
  assert.equal(SCENES.length, 8, 'eight scenes');
  const steps = stepsOf();
  assert.equal(steps.length, 8, 'eight graded actions');
  for (const [c, s] of steps.entries()) {
    assert.equal(s.kind, 'decision', `scene ${c} is a decision`);
    assert.equal(s.choices.length, 3, `scene ${c}: three replies`);
    for (const ch of s.choices) {
      assert.ok(ch.label?.length > 5, `scene ${c} label`);
      assert.ok(['right', 'partial', 'wrong'].includes(ch.verdict), `scene ${c} verdict`);
      assert.ok(ch.feedback?.length > 10, `scene ${c} feedback`);
      assert.equal(typeof ch.effects, 'object', `scene ${c} effects object`);
    }
  }
});

test('exactly one right answer per scene (this is what makes 100% reachable)', () => {
  for (const [c, s] of stepsOf().entries()) {
    const rights = s.choices.filter((ch) => ch.verdict === 'right').length;
    assert.equal(rights, 1, `scene ${c}: exactly one right`);
  }
});

test('default effects follow spec §3.2 — right +10 to the scene meter, wrong −10, partial 0', () => {
  const steps = stepsOf();
  // Scene 1 (order): right → order +10, wrong → order −10, partial → {}
  const s1 = steps[0];
  assert.deepEqual(s1.choices.find((c) => c.verdict === 'right').effects, { order: 10 });
  assert.deepEqual(s1.choices.find((c) => c.verdict === 'wrong').effects, { order: -10 });
  assert.deepEqual(s1.choices.find((c) => c.verdict === 'partial').effects, {});
});

test('the two noted meter exceptions (spec §4): Scene 7 force = Order −15, Scene 8 election = Order +10 & Trust +5', () => {
  const steps = stepsOf();
  const seize = steps[6].choices.find((c) => /seize that man/i.test(c.label));
  assert.equal(seize.verdict, 'wrong');
  assert.deepEqual(seize.effects, { order: -15 }, 'force to save a consent compact costs extra order');

  const election = steps[7].choices.find((c) => /John Carver/.test(c.label));
  assert.equal(election.verdict, 'right');
  assert.deepEqual(election.effects, { order: 10, trust: 5 }, 'a first election by consent');
});

// --- Playthrough helpers: drive the adapter directly, honoring the shuffle ----
function playRun(pick = 'right') {
  const state = game.initMatch({ mode: 'solo', soloSide: SIDE });
  for (let c = 0; c < game.totalActions; c++) {
    game.chapterEvent(state, SIDE);
    const ss = state.sides[SIDE];
    const step = stepsOf()[c];
    let real = step.choices.findIndex((ch) => ch.verdict === pick);
    if (real < 0) real = step.choices.findIndex((ch) => ch.verdict === 'partial'); // fallback
    const choiceIndex = ss.shuffles[c].indexOf(real);
    const res = game.resolve(state, SIDE, { kind: 'decision', choiceIndex });
    assert.ok(!res.error, `scene ${c}: ${res.error}`);
  }
  return game.report(state).perSide[SIDE];
}

test('all-right = 100% accuracy and the "41 Names" ending', () => {
  const r = playRun('right');
  assert.equal(r.accuracy, 100);
  assert.equal(r.ending.key, 'names', 'you talked them into it');
});

test('all-wrong = 0% accuracy and "History Outvotes You" — but the Compact is still signed', () => {
  const r = playRun('wrong');
  assert.equal(r.accuracy, 0);
  assert.equal(r.ending.key, 'outvoted', 'signed anyway — history did not need you');
});

test('endings tier by ACCURACY, not meters (spec §3.3)', () => {
  assert.equal(endingFor(0, 100).key, 'names');
  assert.equal(endingFor(0, NAMES_MIN).key, 'names');
  assert.equal(endingFor(0, NAMES_MIN - 1).key, 'barely');
  assert.equal(endingFor(0, BARELY_MIN).key, 'barely');
  assert.equal(endingFor(0, BARELY_MIN - 1).key, 'outvoted');
  assert.equal(ENDINGS.names.title, '41 Names');
  assert.equal(ENDINGS.outvoted.title, 'History Outvotes You');
});

test('the two verbatim Compact lines appear exactly (spec §10 checklist)', () => {
  const allLabels = stepsOf().flatMap((s) => s.choices.map((c) => c.label)).join(' ');
  assert.match(allLabels, /We covenant and combine ourselves together into a civil body politick/,
    'Scene 7 reads the real "covenant and combine…" line');
  assert.match(allLabels, /Just and equal laws, made for the general good/,
    'Scene 4 carries the real "just and equal laws" language');
});

test('Scene 6 women\'s-exclusion beat is stated plainly, not softened or cut (spec §11)', () => {
  const s6 = stepsOf()[5];
  assert.match(s6.prompt, /we women — do we sign/i, 'the woman asks the question directly');
  const right = s6.choices.find((c) => c.verdict === 'right');
  assert.match(right.label, /Only the men will sign/i, 'the honest answer says only the men sign');
  assert.match(right.label, /promise of consent, once planted, grows/i, 'and points forward');
});

test('the six vocabulary terms all appear in student-visible text (spec §2.2 bubbles)', () => {
  const text = stepsOf().flatMap((s) => [s.prompt, ...s.choices.map((c) => `${c.label} ${c.feedback}`)]).join(' ');
  for (const re of [/covenant/i, /body politick/i, /consent of the governed/i, /charter/i, /mutiny/i, /Separatists/i, /Strangers/i]) {
    assert.match(text, re, `vocabulary term present: ${re}`);
  }
});

test('the epilogue names the Wampanoag, the half-died winter, and the 1776 seed line — every tier', () => {
  const epi = debriefFor();
  assert.match(epi, /Wampanoag/, 'names the Wampanoag as rescuers with knowledge');
  assert.match(epi, /half/i, 'names that nearly half died the first winter');
  assert.match(epi, /consent of the governed/i, 'carries the idea to 1776');
  assert.match(epi, /1776/, 'names the year the idea was written larger');
});

test('shipScore adds the two meters; it never decides the tier', () => {
  assert.equal(shipScore({ trust: 50, order: 50 }), 100);
  // Same meters, different accuracy → different ending. Proves accuracy owns the tier.
  assert.notEqual(endingFor(100, 100).key, endingFor(100, 0).key);
});

test('currentPrompt never leaks the answer key (labels only)', () => {
  const state = game.initMatch({ mode: 'solo', soloSide: SIDE });
  game.chapterEvent(state, SIDE);
  const prompt = game.currentPrompt(state, SIDE);
  assert.equal(prompt.kind, 'decision');
  assert.equal(prompt.choices.length, 3);
  for (const c of prompt.choices) assert.equal(typeof c, 'string');
  assert.ok(!('verdict' in prompt), 'no verdict leaks');
});
