# Mutiny on the Mayflower

**Unit 1 · 8th Grade U.S. History · TEKS 8.3B, 8.1B, 8.15A, 8.19A (skills 8.29A)**

November 1620. A storm has blown the Mayflower north of Virginia, outside its
charter, and some passengers say that ashore **"none had power to command
them."** You play **William Bradford**. Through **eight dialogue
confrontations** you talk Separatists and Strangers into signing the Mayflower
Compact — and every right answer *is* one of the Compact's real ideas, in kid
words (covenant, civil body politick, consent of the governed). Persuade them
all and the page gets its 41 signatures, just like 1620.

**Winning vs. accuracy.** The signature tally is drama; **accuracy is the
grade.** History guarantees the signing — your score decides whether you talked
them into it or history dragged them there.

Built on the shared U.S. History Socket.IO engine (server-authoritative, solo
mode). Straight factory usage — 8 static graded steps, one class group, no
variants, no branch, no map. The novelty is all client-side: a letter-by-letter
reading of the Compact's real line at the brink, tap-for-plain-words vocabulary
bubbles, and a signature tally that climbs with your accuracy and rolls to 41 at
the signing.

## Run it

```bash
npm install        # installs server/ and client/ via postinstall
npm test           # server test suite (content + engine lifecycle)
npm run build      # builds the React client into client/dist
npm start          # serves game + Teacher Command Center on :4000
```

- Student game: `http://localhost:4000`
- Teacher Command Center: `http://localhost:4000/#teacher`

## What's specific to this game

- **Adapter:** `server/src/games/usMutinyMayflower.js` — eight static scenes,
  transcribed verbatim from the build spec. Meters: **Trust 🤝 · Order ⚖️**,
  start at 50. Default effects: right +10 to the scene's meter, partial 0, wrong
  −10, with two noted exceptions (Scene 7 force = Order −15; Scene 8 election =
  Order +10, Trust +5).
- **Accuracy is the grade.** Right = 1, partial = 0.5, wrong = 0, server-side.
  All-right = 100%; all-wrong = 0%. Endings tier by **accuracy**, not meters:
  **41 Names** (≥80%) / **Signed, Barely** (45–79%) / **History Outvotes You**
  (<45%).
- **The signing always happens** — because history did. The signature tally is a
  client flourish computed from your running points; every ending reconciles it
  to all 41 names.
- **The two verbatim Compact lines** appear exactly, in the reply text: *"We
  covenant and combine ourselves together into a civil body politick"* (Scene 7)
  and *"just and equal laws"* (Scene 4). Both are underlined with plain-words
  bubbles.
- **The "money moment" (Scene 7):** the screen dims and the Compact's real line
  types out letter-by-letter over lantern glow; the optional storm ambience
  drops to silence.
- **Vocabulary bubbles:** the six required terms (covenant, civil body politick,
  consent of the governed, charter, mutiny, Separatists/Strangers) are
  underlined on first use with a tap-for-plain-words bubble.
- **Every ending shows the same epilogue:** the brutal first winter (nearly half
  died), the Wampanoag's help, and the seed line from the promise to town
  meetings to the Constitution to "consent of the governed" in 1776.
- **Dashboard:** one class-wide group; PDF includes the roster (Name · Status ·
  Accuracy %) and the class average.

## Sensitivity (spec §11, Common Standards §10)

- Separatist faith is respected as motive; the game grades civics, never belief.
- **Scene 6 is the point, not a problem.** The Compact excluded women; the right
  answer models telling that hard truth plainly. The beat is never softened.
- Howland's scene shows the Compact crossing class lines — a servant's signature
  counted — and is never played for slapstick.
- The Wampanoag appear in the epilogue as rescuers with knowledge and agency;
  the first-winter deaths are stated factually, without spectacle.

Session data lives in server memory only; the teacher's PDF is the only record
that survives. Deploy shape: one Render web service (see `render.yaml`),
embedded in Wix — same workflow as the companion U.S. History games.

*Companion to Build-a-Colony, Jamestown 1607: Survive the Starving Time, Colony
Sort: Region Rush, and the Unit 1 apps — especially Seeds of Self-Government
Timeline.*
