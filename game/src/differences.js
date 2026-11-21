// Difference hit-testing and scoring: the rules of the hunt.
// A click counts when it lands inside a difference's radius on either panel.
// Found differences stay marked on both panels; a wrong click costs points
// and time; a hint costs points and reveals one unfound difference briefly.

export function findDifferenceAt(scene, x, y, foundIds) {
  for (const d of scene.differences) {
    if (foundIds.has(d.id)) continue;
    const dx = x - d.x, dy = y - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) return d;
  }
  return null;
}

export function pickHintTarget(scene, foundIds) {
  const remaining = scene.differences.filter((d) => !foundIds.has(d.id));
  if (remaining.length === 0) return null;
  return remaining[Math.floor(Math.random() * remaining.length)];
}

export const SCORE_FIND = 100;
export const SCORE_WRONG = -25;
export const SCORE_HINT = -50;
export const WRONG_TIME_PENALTY = 3; // seconds lost on a wrong click
export const LEVEL_TIME_BONUS_PER_SECOND = 5;
