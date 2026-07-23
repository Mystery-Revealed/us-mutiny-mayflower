// MatchView.jsx — the dialogue loop, one confrontation at a time: a passenger's
// objection (portrait + speech panel) → three replies → verdict flash + feedback
// in Bradford's voice. Single role, always your turn, no map, no chapter cards.
//
// Three client flourishes the spec calls for live here:
//   • the SIGNATURE TALLY ("Pledged: X of 41") — computed from running points,
//     climbing with your accuracy (spec §3.1); the ending reconciles it to 41.
//   • the MONEY MOMENT (Scene 7, spec §5.3) — the screen dims and the Compact's
//     real line types out letter-by-letter; the storm ambience ducks to silence.
//   • VOCABULARY BUBBLES — the six required terms, tappable wherever they appear.

import { useEffect, useRef, useState } from 'react';
import { emitAck, errorText } from '../../services/socket.js';
import { Art } from '../../services/assets.jsx';
import MetersBar from '../shared/MetersBar.jsx';
import VocabText from './VocabText.jsx';

const TOTAL_SCENES = 8;
const TOTAL_SIGNERS = 41;

// Presentation, keyed by stepIndex (the server owns the words; this owns who is
// speaking and which portrait shows). Two portraits are reused (the merchant is a
// Stranger; the self-rule doubter is an elder) to hold the 8-asset budget (§7).
const SCENE_META = [
  { speaker: 'A Stranger leader',        portrait: 'portrait_stranger.jpg',
    setting: 'A Stranger leader blocks your way. The Strangers are already talking mutiny.' },
  { speaker: 'A Separatist elder',       portrait: 'portrait_elder.jpg',
    setting: 'A worried Separatist elder pulls you aside before you can speak.' },
  { speaker: 'John Howland, a young servant', portrait: 'portrait_howland.jpg',
    setting: 'John Howland — the servant the sea swept overboard and then gave back — steps forward.' },
  { speaker: 'A Stranger merchant',      portrait: 'portrait_stranger.jpg',
    setting: 'A Stranger merchant folds his arms. He trusts contracts, not sermons.' },
  { speaker: 'An older passenger',       portrait: 'portrait_elder.jpg',
    setting: 'An older passenger doubts that any government could rest on the consent of the governed — the people, not a king.' },
  { speaker: 'A Pilgrim woman',          portrait: 'portrait_woman.jpg',
    setting: 'A woman who buried her fear somewhere over the Atlantic looks you in the eye.' },
  { speaker: 'The crowd at the boats',   portrait: 'scene_brink.jpg', dramatic: true,
    setting: 'Cold, sick, and furious, a knot of passengers surges toward the boats.' },
  { speaker: 'The page of 41 names',     portrait: 'scene_signing.jpg',
    setting: 'The page holds 41 names at last. One question remains.' },
];

// The Compact's real line, read aloud at the brink (spec §5.3). Verbatim.
const COMPACT_LINE = 'We covenant and combine ourselves together into a civil body politick.';

const sceneIndex = (match) =>
  match.feedback ? match.feedback.stepIndex
    : (match.turn && typeof match.turn.stepIndex === 'number' ? match.turn.stepIndex : 0);

// The tally is a flourish: signatures pledged so far ride on the running points.
const tallyFor = (points) => Math.min(TOTAL_SIGNERS, Math.round((points / TOTAL_SCENES) * TOTAL_SIGNERS));

export default function MatchView({ state, dispatch }) {
  const { match } = state;
  const { begin, turn, feedback } = match;
  const meta = begin.meta;
  const idx = sceneIndex(match);
  const scene = SCENE_META[idx] || SCENE_META[0];
  const pledged = tallyFor(match.points);
  const isMoneyMoment = !!feedback && feedback.stepIndex === 6;

  // Optional storm ambience (muted by default, spec §7). Ducks during the reading.
  const audioRef = useRef(null);
  const [soundOn, setSoundOn] = useState(false);
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (soundOn && !isMoneyMoment) { a.play?.().catch(() => {}); }
    else { a.pause?.(); }
  }, [soundOn, isMoneyMoment]);

  return (
    <div className="match">
      <audio ref={audioRef} src="/assets/audio/storm_ambience.mp3" loop preload="none" />

      <header className="match-header">
        <div className="nation-chip bradford">⚓ William Bradford</div>
        <div className="tally-chip" title="Signatures pledged so far — the ending fills the page to 41">
          Pledged <b>{pledged}</b><span className="muted"> of {TOTAL_SIGNERS}</span>
        </div>
        <div className="chapter-chip">Passenger {Math.min(idx + 1, TOTAL_SCENES)} of {TOTAL_SCENES}</div>
        <button
          type="button"
          className={`sound-toggle ${soundOn ? 'on' : ''}`}
          aria-pressed={soundOn}
          title={soundOn ? 'Storm sound on — tap to mute' : 'Storm sound off — tap to play'}
          onClick={() => setSoundOn((s) => !s)}
        >
          {soundOn ? '🔊' : '🔈'}
        </button>
      </header>

      <div className="meters-row solo">
        <MetersBar meters={match.meters} meta={meta} title="The Deck" />
      </div>

      <div className="match-body single">
        <section className="action-panel" aria-live="polite">
          {isMoneyMoment ? (
            <MoneyMomentPanel
              key={`money-${feedback.stepIndex}`}
              feedback={feedback}
              matchEnded={!!state.matchEnd}
              onContinue={() => dispatch({ type: 'dismiss-feedback' })}
            />
          ) : feedback ? (
            <FeedbackPanel
              feedback={feedback}
              matchEnded={!!state.matchEnd}
              onContinue={() => dispatch({ type: 'dismiss-feedback' })}
            />
          ) : turn?.yourTurn && turn.kind === 'decision' ? (
            <DialoguePanel turn={turn} scene={scene} />
          ) : (
            <div className="waiting-panel"><div className="pulse-dot" aria-hidden="true" /><p>Steady…</p></div>
          )}
        </section>
      </div>
    </div>
  );
}

/* -------- the objection + replies -------- */

function DialoguePanel({ turn, scene }) {
  const [busy, setBusy] = useState(false);
  // Synchronous double-click lock. State alone can't stop two clicks landing
  // in the same render frame (both read the stale `busy === false`), and the
  // server acks before pushing turn:resolution — so the second submit would be
  // graded against the NEXT scene (server cursor already advanced). The ref
  // engages immediately; `busy` still drives the disabled styling.
  const busyRef = useRef(false);
  const [err, setErr] = useState('');

  // A new scene arriving always releases the lock — covers a post-reconnect
  // sync replacing the turn in place without remounting this panel.
  useEffect(() => {
    busyRef.current = false;
    setBusy(false);
  }, [turn.stepIndex]);

  async function choose(choiceIndex) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    const res = await emitAck('student:submit_move', { move: { kind: 'decision', choiceIndex } });
    // Deliberately NOT unlocked on success: the ack arrives BEFORE the
    // turn:resolution push. The panel unmounts when feedback arrives, or the
    // stepIndex effect above releases the lock.
    if (!res.ok) { setErr(errorText(res.error)); busyRef.current = false; setBusy(false); }
  }

  return (
    <div className="dialogue-panel">
      <div className="speaker-row">
        <Art name={scene.portrait} alt={scene.speaker} className="portrait" />
        <div className="speaker-side">
          <div className="speaker-name">{scene.speaker}</div>
          {scene.setting && <p className="scene-setting"><VocabText text={scene.setting} /></p>}
        </div>
      </div>

      <div className="speech-bubble">
        <VocabText text={turn.prompt} className="objection" />
      </div>

      <p className="reply-label">Your reply, Bradford —</p>
      {/* Choice labels are plain text: a reply button is the primary tap target,
          so we never nest a tappable vocabulary term inside it. The six terms are
          tappable in the objection, the scene setting, the feedback, and the
          Compact reading — never inside a button. */}
      <div className="choice-list">
        {(turn.choices || []).map((label, i) => (
          <button key={i} className="choice-btn" disabled={busy} onClick={() => choose(i)}>
            {label}
          </button>
        ))}
      </div>
      <p className="err" role="alert">{err}</p>
    </div>
  );
}

/* -------- verdict + feedback, in Bradford's voice -------- */

const VERDICT_UI = {
  right: { label: 'You carried the idea', className: 'right', icon: '✓' },
  partial: { label: 'A half-answer', className: 'partial', icon: '≈' },
  wrong: { label: 'That set you back', className: 'wrong', icon: '✗' },
};

function VerdictBody({ feedback }) {
  const v = VERDICT_UI[feedback.verdict] || VERDICT_UI.partial;
  return (
    <>
      <div className={`verdict-badge ${v.className} flash`}>
        <span aria-hidden="true">{v.icon}</span> {v.label}
      </div>
      <div className="bradford-row">
        <Art name="portrait_bradford.jpg" alt="William Bradford" className="portrait small" />
        <p className="feedback-text"><VocabText text={feedback.feedback} /></p>
      </div>
      <div className="effects-row">
        {Object.entries(feedback.effects || {}).map(([k, val]) => (
          <span key={k} className={`effect-chip ${val > 0 ? 'up' : 'down'}`}>
            {k === 'trust' ? 'Trust' : 'Order'} {val > 0 ? `+${val}` : val}
          </span>
        ))}
      </div>
    </>
  );
}

function FeedbackPanel({ feedback, matchEnded, onContinue }) {
  return (
    <div className="feedback-panel">
      <VerdictBody feedback={feedback} />
      <button className="btn big" onClick={onContinue}>
        {matchEnded ? 'See how it ends' : 'Next passenger'}
      </button>
    </div>
  );
}

/* -------- the money moment (spec §5.3): dim + letter-by-letter reading -------- */

function MoneyMomentPanel({ feedback, matchEnded, onContinue }) {
  const [shown, setShown] = useState(0);
  const done = shown >= COMPACT_LINE.length;

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setShown((n) => {
        if (n >= COMPACT_LINE.length) { clearInterval(t); return n; }
        return n + 1;
      });
    }, 55);
    return () => clearInterval(t);
  }, [done]);

  return (
    <div className="money-moment">
      <div className="money-kicker">The words, read aloud</div>
      <div className="lantern-glow">
        {done ? (
          // Once read, the line becomes tappable so "covenant" and "civil body
          // politick" carry their plain-words bubbles at the climax.
          <p className="compact-line">“<VocabText text={COMPACT_LINE} />”</p>
        ) : (
          <p className="compact-line">
            “{COMPACT_LINE.slice(0, shown)}<span className="caret">▍</span>”
          </p>
        )}
      </div>
      {!done && (
        <button type="button" className="btn ghost skip" onClick={() => setShown(COMPACT_LINE.length)}>
          Skip
        </button>
      )}
      {done && (
        <div className="money-verdict">
          <VerdictBody feedback={feedback} />
          <button className="btn big" onClick={onContinue}>
            {matchEnded ? 'See how it ends' : 'Next passenger'}
          </button>
        </div>
      )}
    </div>
  );
}
