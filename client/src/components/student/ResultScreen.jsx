// ResultScreen.jsx — the close, in the order spec §5.4–5.5 lays out:
//   1) the SIGNING SCENE — the page fills with the 41 real signers (Howland's name
//      highlighted), and the tally resolves to 41 no matter how you played, because
//      history signed it (spec §3.3: the tally is cosmetic).
//   2) the ENDING TIER — keyed by ACCURACY (41 Names / Signed, Barely / History
//      Outvotes You), then the SAME epilogue for every tier (the first winter, the
//      Wampanoag's help, the seed line to 1776), then your accuracy and a replay.

import { useEffect, useState } from 'react';
import { Art } from '../../services/assets.jsx';

const TIER_CLASS = { names: 'win', barely: 'mid', outvoted: 'low' };
const TOTAL_SIGNERS = 41;

// The 41 men who actually signed the Mayflower Compact, in the traditional order.
// Howland — the servant the sea took and gave back — is highlighted in the fill.
const SIGNERS = [
  'John Carver', 'William Bradford', 'Edward Winslow', 'William Brewster', 'Isaac Allerton',
  'Myles Standish', 'John Alden', 'Samuel Fuller', 'Christopher Martin', 'William Mullins',
  'William White', 'Richard Warren', 'John Howland', 'Stephen Hopkins', 'Edward Tilley',
  'John Tilley', 'Francis Cooke', 'Thomas Rogers', 'Thomas Tinker', 'John Rigdale',
  'Edward Fuller', 'John Turner', 'Francis Eaton', 'James Chilton', 'John Crackston',
  'John Billington', 'Moses Fletcher', 'John Goodman', 'Degory Priest', 'Thomas Williams',
  'Gilbert Winslow', 'Edmund Margesson', 'Peter Browne', 'Richard Britteridge', 'George Soule',
  'Richard Clarke', 'Richard Gardinar', 'John Allerton', 'Thomas English', 'Edward Doty',
  'Edward Leister',
];

export default function ResultScreen({ state, dispatch }) {
  const end = state.matchEnd;
  const you = end.you;
  const ending = you.ending;
  const accuracy = you.accuracy ?? 0;
  const tierCls = TIER_CLASS[ending.key] || 'mid';

  const [stage, setStage] = useState('signing'); // signing | ending

  if (stage === 'signing') {
    return <SigningScene accuracy={accuracy} onDone={() => setStage('ending')} />;
  }

  return (
    <div className="card result-screen">
      <div className="event-kicker">The Mayflower Compact · November 11, 1620</div>
      <h1 className={`result-headline ${tierCls}`}>{ending.title}</h1>

      <Art
        name="scene_signing.jpg"
        alt="Men crowded around a small cabin table by candlelight, a quill touching paper covered in names"
        className="result-art"
      />

      <p className="fall-note">
        This was never about “winning” the signing — history signed it either way.
        It was about <b>whether your answers carried the Compact’s real ideas</b>.
        Your accuracy shows exactly that.
      </p>

      <div className={`ending-block ${tierCls}`}>
        <p>{ending.text}</p>
      </div>

      <div className="accuracy-block">
        <div className="accuracy-number">{accuracy}%</div>
        <div>
          <b>Your accuracy — the score your teacher sees.</b>
          <p>How many of your eight replies carried one of the Compact’s real ideas — covenant, one civil body politick, just and equal laws, and consent of the governed. The tally was drama; this is the grade.</p>
        </div>
      </div>

      <div className="debrief">
        <h3>What happened next</h3>
        <p>{you.debrief}</p>
      </div>

      <div className="btn-col">
        <button className="btn big" onClick={() => dispatch({ type: 'play-again' })}>
          Play again — talk every one of them into it
        </button>
      </div>
    </div>
  );
}

/* -------- the signing scene: the page fills to 41, the tally resolves -------- */

function SigningScene({ accuracy, onDone }) {
  const start = Math.min(TOTAL_SIGNERS, Math.round((accuracy / 100) * TOTAL_SIGNERS));
  const [filled, setFilled] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setFilled((n) => {
        if (n >= TOTAL_SIGNERS) { clearInterval(t); return n; }
        return n + 1;
      });
    }, 55);
    return () => clearInterval(t);
  }, []);

  const done = filled >= TOTAL_SIGNERS;
  // The tally rolls from where your play left it up to all 41.
  const tally = Math.max(start, filled);

  return (
    <div className="card signing-scene">
      <div className="event-kicker">The signing</div>
      <h1 className="signing-title">The page fills</h1>
      <div className="tally-big" aria-live="polite">
        <b>{tally}</b> <span className="muted">of {TOTAL_SIGNERS} signed</span>
      </div>
      <div className="signer-grid" aria-hidden="true">
        {SIGNERS.map((name, i) => (
          <span
            key={name}
            className={`signer ${i < filled ? 'in' : ''} ${name === 'John Howland' ? 'howland' : ''}`}
          >
            {name}
          </span>
        ))}
      </div>
      <p className="signing-note">
        Every name a real signer — a governor and a servant, a Separatist and a
        Stranger, side by side on one page.
      </p>
      <div className="btn-col">
        <button className="btn big" onClick={onDone}>
          {done ? 'How did I do?' : 'Skip to the result'}
        </button>
      </div>
    </div>
  );
}
