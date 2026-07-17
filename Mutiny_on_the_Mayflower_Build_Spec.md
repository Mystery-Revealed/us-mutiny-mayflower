# "Mutiny on the Mayflower" — Build Specification
### Unit 1 Game · 8th Grade U.S. History · Colonization

**Purpose:** A build-ready spec to paste into Claude (Fable, Opus, Sonnet): build the game, deploy on Render via GitHub, embed in Wix. Shared Socket.IO engine, Teacher Command Center, standard workflow — this spec covers what's unique.

> **Reading-level rule (everything the student sees):** 8th grade content at a **5th grade reading level**. Short sentences, common words, define hard terms on first use. Does not apply to this spec itself.

> **Data method:** the **shared Socket.IO engine, solo mode** (server-authoritative, in-memory sessions, no database). One new adapter: `usMutinyMayflower.js`.

> **The design's engine:** the student plays **William Bradford** on the storm-blown Mayflower, November 1620 — landed north of Virginia, outside its charter, with passengers declaring **"none had power to command them."** Through eight dialogue confrontations, the student talks Separatists and Strangers into signing the Mayflower Compact — and every right answer *is* one of the Compact's real ideas, in kid words. Persuade them all and the Compact gets its 41 signatures, just like 1620.

---

## 1. Game at a Glance

| Field | Value |
|---|---|
| **Title** | Mutiny on the Mayflower |
| **Unit** | 1 — Colonization |
| **TEKS** | 8.3B (Mayflower Compact's significance), 8.1B (1620), 8.15A (colonial documents' influence), 8.19A (consent of the governed). Skills: 8.29A (the source's actual language) |
| **Pick** | None — one class group |
| **Type** | Short dialogue decision game — 8 scenes × 1 decision = **8 graded actions** |
| **Playtime** | 5–7 minutes |
| **Platform / tracking** | Shared engine solo mode; Command Center; session-only data |
| **Art style** | Semi-realistic / cinematic — lantern light, storm seas |

**One-sentence pitch:** The charter is void, the crowd is angry, and the only thing standing between the Plymouth colony and chaos is whether you — William Bradford — can explain "covenant," "civil body politick," and consent of the governed well enough to collect 41 signatures.

**Winning vs. accuracy.** The signature tally is drama; **accuracy is the grade** — did your answers carry the Compact's actual ideas? History guarantees the signing; your score decides whether you talked them into it or history dragged them there.

---

## 2. Historical Content Bank

### 2.1 The situation, November 1620
- Two groups aboard, neither trusting the other: **Separatists** (Pilgrims — wanted to separate fully from the Church of England) and **"Strangers"** — merchants, craftsmen, servants, soldiers recruited for the venture.
- Storms drove the ship **north of Virginia**, outside its charter. Some Strangers argued the contract was dead: ashore, *"none had power to command them."*
- The answer: a one-page agreement signed **before going ashore** by **41 male passengers**. Its heart: *"We covenant and combine ourselves together into a civil body politick"* — one community, making **"just and equal laws… for the general good of the colony,"** and promising to obey them. The signers confirmed **John Carver** as governor — chosen by consent, not birth.
- **Why it matters (8.3B, 8.15A):** America's first agreement for **self-government** — power from the **consent of the governed** — resurfacing in town meetings, the Fundamental Orders, the Declaration, the Constitution.
- **The cost:** half the colonists died the first winter; survivors made it with the help of the **Wampanoag**, who taught them to plant and survive here.
- **True hook:** John Howland, a young indentured servant, was swept overboard mid-storm, caught a trailing rope, and was hauled back. He signed. Servants' signatures counted.
- **Honest limit:** all 41 signers were men. Women — who worked, froze, and died in the same colony — were not asked. The game says so.

### 2.2 Vocabulary (tap-bubbles on first use — these ARE the learning targets)
**Covenant** — a serious promise binding everyone who makes it. **Civil body politick** — old words for "one community under shared laws." **Consent of the governed** — government's power comes from the people's agreement. **Charter** — the king's written permission for a colony. **Mutiny** — refusing lawful authority. **Separatists / Strangers** — the faith-driven Pilgrims / everyone else aboard.

---

## 3. Core Mechanics

### 3.1 Meters (0–100, start 50)
**Trust** 🤝 — do the passengers believe you? **Order** ⚖️ — is the ship holding together?
A **signature tally** ("Pledged: 24 of 41") rides beside the meters — a client flourish computed from points so far; the ending reconciles it (§3.3).

### 3.2 Structure — 8 dialogue scenes × 1 decision = 8 graded actions
Each scene: a character throws a real objection → three replies → verdict + feedback in Bradford's voice. Right = 1, partial = 0.5, wrong = 0, server-side; accuracy = points ÷ 8 × 100. Default effects: ✅ +10 to the named meter, ⚠️ 0, ❌ −10.

### 3.3 Endings
All endings reach the signing — because history did. Tiers by accuracy:
- **"41 Names" (high):** the tally rolls to 41. "You didn't force them. You convinced them. That's the whole idea."
- **"Signed, Barely" (middle):** grudging signatures; Bradford recaps the ideas the player missed.
- **"History Outvotes You" (low):** the leaders make the case past you; the Compact is signed anyway — "The Compact didn't need you. You need the Compact. Here's what it said…" with the plain-words recap.
Every ending closes with the same **epilogue** — the brutal first winter (half died), the Wampanoag's help, the seed line *promise → town meeting → constitution → "consent of the governed" in 1776* — and a replay nudge.

---

## 4. Reference Content — the Answer Key (all 8 scenes)

**Scene 1 — The Stranger's Challenge.** *A Stranger leader, arms crossed:* "The storm blew us past Virginia. The charter is void here — none hath power to command us!"
- **A) "Then we make our own power — we covenant together: our laws, our promise, binding us all."** ✅ (Order +10). *"That word — covenant — turned a dead charter into a living government."*
- **B) "The King's charter still rules you. Obey it."** ❌. *"He's right — the paper's power ended miles south. Waving it looks weak."*
- **C) "We'll sort it out once we're ashore."** ⚠️. *"Every hour unanswered, the mutiny talk grows."*

**Scene 2 — The Fearful Elder.** *A Separatist elder:* "Sign a paper *with Strangers*? They don't share our faith!"
- **A) "The compact is civil, not church — one body politick for laws, while every soul keeps its own faith."** ✅ (Trust +10). *"Civil, not religious — that line is why both groups could sign one page."*
- **B) "Once they sign, they'll come around to our church."** ❌. *"Not the deal — and the Strangers would smell it."*
- **C) "Then we Separatists sign alone."** ⚠️. *"Half a colony's promise governs half a colony."*

**Scene 3 — The Servant's Question.** *John Howland, a young indentured servant (yes — the one the sea took and gave back):* "I'm a servant, sir. Does my promise even count?"
- **A) "Aye. Free men and servants sign alike — consent means every man's word helps give the laws their power."** ✅ (Trust +10). *"Howland signed the real Compact. The boy the ocean couldn't keep became a signer of America's first self-government."*
- **B) "No. Signing is for gentlemen."** ❌. *"Cut out the servants and you've rebuilt the old world."*
- **C) "You may stand and watch."** ⚠️. *"Watching isn't consenting."*

**Scene 4 — The Merchant's Price.** *A Stranger merchant:* "Fine words. What do *I* get for my signature?"
- **A) "Just and equal laws, made for the general good — and a voice in choosing who governs."** ✅ (Trust +10). *"Straight from the Compact's text. 'Just and equal' closed the deal for men who trusted contracts more than sermons."*
- **B) "Protection — so long as you obey."** ⚠️. *"Half the bargain. He asked about the other half: a say."*
- **C) "Land. As much as you can fence."** ❌. *"Promise land you don't hold and the compact dies at the first survey."*

**Scene 5 — The Doubter of Self-Rule.** *An older passenger:* "Laws we write ourselves? A king's power comes from God — who are WE to govern?"
- **A) "Government can stand on the consent of the governed — our own promise binds us tighter than fear of any crown."** ✅ (Order +10). *"There it is — the idea that travels from this cabin to 1776."*
- **B) "You're right. We'll send to England and wait on the King's word."** ❌. *"Months of ocean each way. The colony would starve waiting for permission to exist."*
- **C) "Then let the ship's captain rule us."** ⚠️. *"A captain's word ends at the waterline."*

**Scene 6 — The Question with No Good Answer.** *A woman who buried her fear somewhere over the Atlantic:* "And we women — do we sign this compact?"
- **A) "No — and I'll not pretend otherwise. Only the men will sign today. But the promise of consent, once planted, grows — and these laws must protect your family all the same."** ✅ (Trust +10). *"The honest answer. History records 41 men; the answer took America centuries — the game won't lie about that."*
- **B) "Women have no place in such matters."** ❌. *"Wrong even in 1620's own terms — the colony ran on women's work and judgment — and wrong now."*
- **C) "Perhaps… ask again ashore."** ⚠️. *"She deserved a straight answer. Dodging costs trust."*

**Scene 7 — The Brink.** *Cold, sick, furious, a knot of passengers moves for the boats:* "ENOUGH TALK! Every family for itself!"
- **A) "Hold! Hear the words: 'We covenant and combine ourselves together into a civil body politick.' One people, under laws WE choose — sign, and we land together."** ✅ (Order +10). *"The real text, read aloud, did what shouting couldn't. The near-mutiny died on that sentence."*
- **B) "Master-at-arms — seize that man!"** ❌ (Order −15). *"Force, to save a compact about consent. Even working, it proves them right."*
- **C) "Let them cool below deck; we'll talk at dawn."** ⚠️. *"Dawn might be too late — but at least it isn't chains."*

**Scene 8 — The First Election.** *The page holds 41 names. Now: who governs?*
- **A) "The signers choose. I put forward John Carver — let every signer's voice confirm him."** ✅ (Order +10, Trust +5). *"Carver became governor by consent — chosen, not born to it. The Compact's first test, passed."*
- **B) "I'll take charge myself. Someone must."** ⚠️. *"Bradford, you WILL govern Plymouth — elected, later, roughly thirty times. Seizing it today breaks the page you just signed."*
- **C) "The wealthiest man aboard should rule."** ❌. *"Purses don't govern. Promises do."*

---

## 5. Screens & UI Flow
1. **Title** — navy gradient (`#1B2A4A → #10203C`), the storm-tilted Mayflower; setup card: "November 1620. Wrong coast. Void charter. Angry passengers. Go."
2. **Dialogue loop** — portrait left; objection in a white speech panel; three navy reply buttons; verdict flash (green `#2F7D4F` / gold `#C9A227` / crimson `#B23A48`) + Bradford-voice feedback; meters and tally on top (icons + numbers). Vocabulary words underlined with tap-for-plain-words bubbles.
3. **Money moment** — Scene 7's reading: the screen dims, the Compact's real line appears letter-by-letter over lantern glow, storm audio drops out.
4. **Signing scene** — the page fills with names (Howland's briefly highlighted); the tally resolves to 41.
5. **Ending** — tier card → epilogue → accuracy + replay nudge.

## 6. Engine Integration
- **Adapter:** `server/src/games/usMutinyMayflower.js` via `createStepGame`; **`gameId: 'us-mutiny-mayflower'`**; mode **solo**; no variants; **`totalActions: 8`**; meters `{ trust, order }` start 50.
- Straight factory usage — 8 static steps, no extensions. Register in `games/index.js`; all Command Center behavior standard. Tally = client function of running points; endings keyed off the standard `match:end` payload. **Repo:** `us-mutiny-mayflower` → Render.

## 7. Visual & Audio Assets (Higgsfield MCP)
**Art direction (top of every prompt):** *Semi-realistic cinematic historical illustration, aboard the Mayflower, November 1620. Lantern light and cold storm blues, painterly, dignified, era-accurate dress. No text, no logos. 16:9.*

| # | Asset | Prompt sketch |
|---|---|---|
| 1 | Title / hero | "The Mayflower heeling through a grey Atlantic storm, one warm lantern glow at a cabin window." |
| 2 | Portrait — Bradford | "A steady, plain-dressed Separatist leader, lantern light, resolve without harshness." |
| 3 | Portrait — Stranger leader | "A weathered merchant-adventurer, arms crossed, skeptical." |
| 4 | Portrait — Separatist elder | "An anxious older Pilgrim, plain collar, worry and conviction together." |
| 5 | Portrait — John Howland | "A young servant, damp hair, blanket over shoulders — recently pulled from the sea." |
| 6 | Portrait — the woman who asks | "A composed Pilgrim woman in travel clothes, direct gaze — dignity, not deference." |
| 7 | Scene — the brink | "Crowded deck in wind and spray, passengers surging toward the boats — tension, no violence." |
| 8 | Scene — the signing | "Men crowded around a small cabin table, a quill touching paper, candlelight on 41 names." |
| 9 | *(Optional)* ambience | Storm creak-and-wind loop, dropping to silence for Scene 7's reading; muted by default. |

## 8. Model Workflow
Standard order. **Fable-heavy and tone-critical:** eight objections and 24 replies making 1620 speech readable at a 5th grade level (§4 is the register — plain words, period rhythm). Opus: standard adapter. Sonnet: dialogue UI, letter-by-letter effect, portraits. Higgsfield per §7.

## 9. Teacher Command Center
Standard, one class-wide group ("Mayflower — 24 students — 84% average"). PDF: Students (Name · Status · Accuracy %) + class accuracy. Footer: **"Made for 8th Grade U.S. History · TEKS 8.3B, 8.1B, 8.15A, 8.19A."**

## 10. Build Checklist & Test Plan (delta)
- [ ] All 8 scenes match §4; the two verbatim Compact lines ("covenant and combine…", "just and equal laws") appear exactly, with plain-words bubbles
- [ ] All-right = 100%, all-wrong = 0%; tally cosmetic (a low run still ends at 41 signed)
- [ ] Scene 6 worded per spec — the women's-exclusion beat not softened or cut
- [ ] Vocabulary bubbles fire on first use of all six §2.2 terms
- [ ] Scene 7 reading: dim + letter-by-letter + audio drop verified
- [ ] Epilogue names the Wampanoag's help and the half-died winter in every tier
- [ ] Palette check: zero tan/parchment UI; parchment only inside the document illustration

## 11. Teacher / Sensitivity Notes
- **Religion as history, not devotion:** Separatist faith is portrayed respectfully as motive; the game grades civics, never belief. No reply mocks or endorses any faith.
- **Scene 6 is the point, not a problem.** The Compact excluded women; the right answer models telling a hard truth plainly. Classroom framing: "Who consents, and who gets asked?" — connect forward to suffrage.
- **The Wampanoag appear in the epilogue as rescuers with knowledge and agency**; the first-winter deaths are stated factually, without spectacle.
- **Servant dignity:** Howland's scene shows the Compact crossing class lines — accurate and useful; don't play his overboard story for slapstick.

---
*Companion to Build-a-Colony, Jamestown 1607: Survive the Starving Time, Colony Sort: Region Rush, and the Unit 1 apps — especially Seeds of Self-Government Timeline. Shared engine (solo mode), Union Blue palette, same GitHub → Render → Wix workflow.*
