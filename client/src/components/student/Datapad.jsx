// Datapad.jsx — the student game. A small state machine over socket pushes:
// title → how to play → join → (approval) → briefing → match (8 dialogue scenes)
// → result. Single role, no pick, no branch: everyone plays William Bradford and
// faces the same eight objections. The server owns all truth; this component only
// renders what it's told. The signature tally is the one client-computed flourish
// (spec §3.1) — it rides on the running points and the ending reconciles it to 41.

import { useEffect, useReducer, useRef } from 'react';
import { getSocket, emitAck, errorText } from '../../services/socket.js';
import { Art } from '../../services/assets.jsx';
import VocabText from './VocabText.jsx';
import MatchView from './MatchView.jsx';
import ResultScreen from './ResultScreen.jsx';

const SIDE = 'bradford';
const pointsFor = (v) => (v === 'right' ? 1 : v === 'partial' ? 0.5 : 0);

const initialState = {
  screen: 'title', // title | how | join | waiting_approval | briefing | match | result | ended
  joinCode: '',
  name: '',
  studentId: null,
  error: '',
  endedMessage: '',
  match: null,
  matchEnd: null,
};

function freshMatch(begin) {
  return {
    begin,
    meters: begin.meters,
    turn: null,
    feedback: null,
    points: 0,     // running graded points, for the signature tally flourish
    answered: 0,   // scenes resolved so far
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'ui':
      return { ...state, ...action.patch };
    case 'joined':
      return {
        ...state,
        studentId: action.studentId,
        error: '',
        screen: action.approved ? 'briefing' : 'waiting_approval',
      };
    case 'approved':
      return { ...state, screen: state.screen === 'waiting_approval' ? 'briefing' : state.screen };
    case 'match:begin':
      return { ...state, screen: 'match', matchEnd: null, match: freshMatch(action.payload) };
    case 'chapter:event': {
      // A dialogue game has no chapter cards. We only fold in the meter snapshot;
      // there is nothing to display (spec §5: a continuous dialogue loop).
      if (!state.match) return state;
      const meters = action.payload.meters || state.match.meters;
      return { ...state, match: { ...state.match, meters } };
    }
    case 'turn:begin': {
      if (!state.match) return state;
      const meters = action.payload.meters || state.match.meters;
      return { ...state, match: { ...state.match, meters, turn: action.payload } };
    }
    case 'turn:resolution': {
      if (!state.match) return state;
      const meters = action.payload.meters || state.match.meters;
      return {
        ...state,
        match: {
          ...state.match,
          meters,
          feedback: action.payload,
          points: state.match.points + pointsFor(action.payload.verdict),
          answered: state.match.answered + 1,
        },
      };
    }
    case 'match:end': {
      // Hold the result until the pending feedback is dismissed (chronological).
      const showNow = !state.match?.feedback;
      return { ...state, matchEnd: action.payload, screen: showNow ? 'result' : state.screen };
    }
    case 'dismiss-feedback': {
      if (!state.match) return state;
      if (state.matchEnd) return { ...state, screen: 'result', match: { ...state.match, feedback: null } };
      return { ...state, match: { ...state.match, feedback: null } };
    }
    case 'sync': {
      const s = action.sync;
      if (s.screen === 'waiting_approval') return { ...state, screen: 'waiting_approval' };
      if (s.screen === 'lobby') return { ...state, screen: 'briefing' };
      if (s.screen === 'result') return { ...state, screen: 'result', matchEnd: s.matchEnd };
      if (s.screen === 'match') {
        const match = freshMatch(s.matchBegin);
        return { ...state, screen: 'match', matchEnd: null, match: { ...match, turn: s.turn } };
      }
      return state;
    }
    case 'removed':
      return { ...initialState, screen: 'join', joinCode: state.joinCode, name: '', error: 'Your teacher removed you from the session. You can join again.' };
    case 'ended':
      return { ...initialState, screen: 'ended', endedMessage: 'Your teacher ended this session. The Compact’s story is told.' };
    case 'play-again':
      return { ...initialState, screen: 'join', joinCode: state.joinCode, name: state.name };
    default:
      return state;
  }
}

export default function Datapad() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const socket = getSocket();
    const on = (event, type) => {
      const fn = (payload) => dispatch({ type, payload });
      socket.on(event, fn);
      return [event, fn];
    };
    const subs = [
      on('match:begin', 'match:begin'),
      on('chapter:event', 'chapter:event'),
      on('turn:begin', 'turn:begin'),
      on('turn:resolution', 'turn:resolution'),
      on('match:end', 'match:end'),
    ];
    const approved = () => dispatch({ type: 'approved' });
    const removed = () => dispatch({ type: 'removed' });
    const ended = () => dispatch({ type: 'ended' });
    socket.on('join:approved', approved);
    socket.on('student:removed', removed);
    socket.on('session:ended', ended);

    // School wifi blip: the socket reconnects → re-attach and re-sync the screen.
    const onReconnect = async () => {
      const s = stateRef.current;
      if (!s.studentId || !s.joinCode) return;
      const res = await emitAck('student:rejoin', { joinCode: s.joinCode, studentId: s.studentId });
      if (res.ok) dispatch({ type: 'sync', sync: res.sync });
    };
    socket.io.on('reconnect', onReconnect);

    return () => {
      for (const [event, fn] of subs) socket.off(event, fn);
      socket.off('join:approved', approved);
      socket.off('student:removed', removed);
      socket.off('session:ended', ended);
      socket.io.off('reconnect', onReconnect);
    };
  }, []);

  const { screen } = state;
  return (
    <div className="app student-app">
      {screen === 'title' && <TitleScreen onStart={() => dispatch({ type: 'ui', patch: { screen: 'join' } })} onHow={() => dispatch({ type: 'ui', patch: { screen: 'how' } })} />}
      {screen === 'how' && <HowToPlay onBack={() => dispatch({ type: 'ui', patch: { screen: 'title' } })} />}
      {screen === 'join' && <JoinForm state={state} dispatch={dispatch} />}
      {screen === 'waiting_approval' && (
        <WaitCard title="Hold fast!" text="Your teacher is checking names. You step onto the deck in a moment." />
      )}
      {screen === 'briefing' && (
        <WaitCard
          title="You are William Bradford."
          text="November 1620. The storm has passed, but the ship has not. The charter is void, the passengers are angry, and the deck is waiting for you. Stand ready."
        />
      )}
      {screen === 'match' && state.match && <MatchView state={state} dispatch={dispatch} />}
      {screen === 'result' && state.matchEnd && <ResultScreen state={state} dispatch={dispatch} />}
      {screen === 'ended' && (
        <WaitCard title="Session ended" text={state.endedMessage}>
          <button className="btn" onClick={() => dispatch({ type: 'ui', patch: { ...initialState, screen: 'title' } })}>
            Back to the title screen
          </button>
        </WaitCard>
      )}
      <footer className="app-footer">Made for 8th Grade U.S. History · TEKS 8.3B, 8.1B, 8.15A, 8.19A</footer>
    </div>
  );
}

/* ---------------- small screens ---------------- */

function TitleScreen({ onStart, onHow }) {
  return (
    <div className="card title-screen">
      <Art name="title_hero.jpg" alt="The Mayflower heeling through a grey Atlantic storm, one warm lantern glow at a cabin window" className="hero-art" />
      <h1 className="game-title">Mutiny on the Mayflower</h1>
      <p className="tagline">November 1620. Wrong coast. Void charter. Angry passengers. Go.</p>
      <p className="title-blurb">
        The storm blew your ship north of Virginia — outside the law that was
        supposed to rule you. Some passengers say that ashore, <b>no one has the
        power to command them.</b> You are <b>William Bradford</b>. Talk the
        Separatists and Strangers into signing one page — the <b>Mayflower
        Compact</b> — before the deck comes apart. Every right answer is one of
        the Compact’s real ideas, in plain words.
      </p>
      <div className="btn-col">
        <button className="btn big" onClick={onStart}>Join your class</button>
        <button className="btn secondary" onClick={onHow}>How to play</button>
      </div>
    </div>
  );
}

function HowToPlay({ onBack }) {
  return (
    <div className="card how-screen">
      <h2>How to play</h2>
      <ol className="how-list">
        <li><b>Join with your class code</b> and your first name.</li>
        <li><b>Face 8 passengers,</b> one at a time. Each throws a real objection at you.</li>
        <li><b>Pick one of three replies.</b> The best reply carries one of the Compact’s real ideas.</li>
        <li><b>Fill the page.</b> Persuade them all and the Compact gets its <b>41 signatures</b> — just like 1620.</li>
      </ol>
      <div className="note">
        <b>Winning versus accuracy.</b> The signature tally is drama. <b>Accuracy
        is your grade</b> — did your answers carry the Compact’s real ideas?
        History guarantees the signing; your score decides whether you talked
        them into it or history dragged them there.
      </div>
      <h3>Your two meters</h3>
      <ul className="how-list">
        <li>🤝 <b>Trust</b> — do the passengers believe you?</li>
        <li>⚖️ <b>Order</b> — is the ship holding together?</li>
      </ul>
      <h3>Words to know (tap them in the game)</h3>
      <ul className="how-list vocab-list">
        <li><VocabText text="Covenant — a serious promise." /></li>
        <li><VocabText text="A civil body politick — one community under shared laws." /></li>
        <li><VocabText text="Consent of the governed — power comes from the people." /></li>
        <li><VocabText text="A charter — the king’s written permission for a colony." /></li>
        <li><VocabText text="Mutiny — refusing lawful leaders." /></li>
        <li><VocabText text="Separatists and Strangers — the Pilgrims, and everyone else aboard." /></li>
      </ul>
      <button className="btn" onClick={onBack}>Back</button>
    </div>
  );
}

function JoinForm({ state, dispatch }) {
  const set = (patch) => dispatch({ type: 'ui', patch });
  const busyRef = useRef(false);

  async function join() {
    if (busyRef.current) return;
    busyRef.current = true;
    set({ error: '' });
    const res = await emitAck('student:join', {
      joinCode: state.joinCode.trim(),
      nickname: state.name.trim(),
      mode: 'solo',
      nation: SIDE,
    });
    busyRef.current = false;
    if (!res.ok) return set({ error: errorText(res.error) });
    dispatch({ type: 'joined', studentId: res.studentId, approved: res.approved });
  }

  const ready = state.joinCode.length === 6 && state.name.trim().length >= 2;

  return (
    <div className="card join-screen">
      <h2>Join your class</h2>
      <p className="muted">It’s November 1620. You will play William Bradford aboard the Mayflower.</p>
      <label htmlFor="join-code">Class code</label>
      <input
        id="join-code" inputMode="numeric" autoComplete="off" maxLength={6}
        placeholder="6-digit code" value={state.joinCode}
        onChange={(e) => set({ joinCode: e.target.value.replace(/\D/g, '') })}
      />
      <label htmlFor="join-name">Your first name</label>
      <input
        id="join-name" maxLength={20} placeholder="e.g. Ana R." value={state.name}
        onChange={(e) => set({ name: e.target.value })}
      />

      <p className="err" role="alert">{state.error}</p>
      <div className="btn-col">
        <button className="btn big" disabled={!ready} onClick={join}>Step onto the deck</button>
        <button className="btn ghost" onClick={() => set({ screen: 'title', error: '' })}>Back</button>
      </div>
    </div>
  );
}

function WaitCard({ title, text, children }) {
  return (
    <div className="card wait-card">
      <div className="pulse-dot" aria-hidden="true" />
      <h2>{title}</h2>
      <p>{text}</p>
      {children}
    </div>
  );
}
