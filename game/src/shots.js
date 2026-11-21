// Staged screenshot states (?shot=start|play|play2|end&seed=1): deterministic
// game states so the screenshots always show the game at its best — a fresh
// level, a mid-hunt with rings on found differences and several still unfound,
// a second scene mid-hunt, and the victory screen. Plain play ignores these.

import { SCENES } from './scenes.js';

export function stagedState(shot) {
  if (!shot) return null;
  if (shot === 'start') {
    return { levelIndex: 0, foundIds: [], timeLeft: SCENES[0].timeLimit, score: 0, screen: 'play', message: 'Find 8 differences — click one on either picture!' };
  }
  if (shot === 'play') {
    // 4 of 8 found on level 1: rings visible, 4 still unfound, counter reads 4 left.
    return { levelIndex: 0, foundIds: ['star', 'lamp', 'roof', 'boat'], timeLeft: 96, score: 400, screen: 'play', message: 'Nice — 4 found! “A boat that moved” was the sneaky one.' };
  }
  if (shot === 'play2') {
    // A different scene mid-hunt: 3 of 8 found on the Clockwork Garden.
    return { levelIndex: 1, foundIds: ['hands', 'tulip', 'bee'], timeLeft: 74, score: 700, screen: 'play', message: 'The clock hands moved — sharp eyes! 5 differences left.' };
  }
  if (shot === 'end') {
    return { levelIndex: 2, foundIds: [], timeLeft: 0, score: 0, totalScore: 2840, bestStreak: 9, screen: 'victory', message: '' };
  }
  return null;
}
