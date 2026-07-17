// games/index.js — registry of playable games. GameManager looks games up here.
// This repo ships one U.S. History Unit 1 game: Mutiny on the Mayflower.

import usMutinyMayflower from './usMutinyMayflower.js';

export const GAMES = {
  [usMutinyMayflower.id]: usMutinyMayflower,
};

export function getGame(id) {
  return GAMES[id] || null;
}
