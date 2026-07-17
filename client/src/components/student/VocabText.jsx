// VocabText.jsx — the tap-for-plain-words vocabulary layer (spec §2.2). Any of
// the six required terms, wherever it appears in dialogue, is underlined and made
// tappable; tapping reveals a 5th-grade-level definition. These six terms ARE the
// learning targets, so the bubble is the teaching, not decoration.
//
// It underlines the FIRST occurrence of each distinct term within a given block of
// text (a plain, render-stable rule — no cross-render state to glitch). A term
// that returns in a later scene is underlined again, which only reinforces it.

import { useState } from 'react';

// Plain-words definitions (spec §2.2), at a 5th grade reading level.
export const VOCAB = {
  covenant:   { term: 'covenant',   def: 'A serious promise that ties together everyone who makes it.' },
  politick:   { term: 'civil body politick', def: 'Old words for “one community living together under shared laws.”' },
  consent:    { term: 'consent of the governed', def: 'A government gets its power from the people agreeing to it.' },
  charter:    { term: 'charter',    def: 'The king’s written permission to start a colony.' },
  mutiny:     { term: 'mutiny',     def: 'Refusing to obey the people who are lawfully in charge.' },
  separatists:{ term: 'Separatists', def: 'The Pilgrims — they wanted to break away from the Church of England completely.' },
  strangers:  { term: 'Strangers',  def: 'Everyone aboard who was not a Pilgrim — merchants, workers, servants, and soldiers.' },
};

// Ordered longest-phrase-first so the alternation matches the whole phrase before
// any shorter piece of it (e.g. "civil body politick" before "covenant").
const PATTERNS = [
  { key: 'consent',     re: /consent of the governed/i },
  { key: 'politick',    re: /(?:civil )?body politick/i },
  { key: 'covenant',    re: /covenant/i },
  { key: 'charter',     re: /charter/i },
  { key: 'mutiny',      re: /mutiny/i },
  { key: 'separatists', re: /separatists?/i },
  { key: 'strangers',   re: /strangers?/i },
];

const COMBINED = new RegExp(PATTERNS.map((p) => `(?:${p.re.source})`).join('|'), 'gi');

function keyForMatch(matched) {
  const lower = matched.toLowerCase();
  if (/consent of the governed/.test(lower)) return 'consent';
  if (/body politick/.test(lower)) return 'politick';
  if (lower.startsWith('covenant')) return 'covenant';
  if (lower.startsWith('charter')) return 'charter';
  if (lower.startsWith('mutiny')) return 'mutiny';
  if (lower.startsWith('separatist')) return 'separatists';
  if (lower.startsWith('stranger')) return 'strangers';
  return null;
}

export default function VocabText({ text, className }) {
  if (!text) return null;
  const nodes = [];
  const usedKeys = new Set();
  let last = 0;
  let m;
  COMBINED.lastIndex = 0;
  while ((m = COMBINED.exec(text)) !== null) {
    const matched = m[0];
    const key = keyForMatch(matched);
    // Only the first occurrence of each distinct term in this block is a bubble.
    if (key && !usedKeys.has(key)) {
      usedKeys.add(key);
      if (m.index > last) nodes.push(text.slice(last, m.index));
      nodes.push(<VocabBubble key={`${key}-${m.index}`} matched={matched} entry={VOCAB[key]} />);
      last = m.index + matched.length;
    }
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <span className={className}>{nodes}</span>;
}

function VocabBubble({ matched, entry }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="vocab-wrap">
      <button
        type="button"
        className="vocab-term"
        aria-expanded={open}
        title={entry.def}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
      >
        {matched}
      </button>
      {open && (
        <span className="vocab-bubble" role="tooltip">
          <b>{entry.term}</b> — {entry.def}
          <button type="button" className="vocab-close" aria-label="Close" onClick={(e) => { e.stopPropagation(); setOpen(false); }}>×</button>
        </span>
      )}
    </span>
  );
}
