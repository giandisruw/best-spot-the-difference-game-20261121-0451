// HUD: the top bar (title, level, score, countdown, found counter), the two
// panel labels, the bottom bar (hint button, messages, level dots), the
// clickable buttons, and the full-screen overlays (title, level clear,
// victory, time up). All drawn on the same canvas as the scenes.

import { SCENES } from './scenes.js';

export const PANEL_LEFT = { x: 20, y: 88, w: 600, h: 480 };
export const PANEL_RIGHT = { x: 660, y: 88, w: 600, h: 480 };
export const TOP_BAR_H = 64;

export function buttonRects(state) {
  const rects = {
    hint: { x: 20, y: 592, w: 220, h: 48 },
    sound: { x: 256, y: 592, w: 150, h: 48 },
    primary: { x: 1020, y: 592, w: 240, h: 48 },
  };
  return rects;
}

export function hitButton(x, y, state) {
  const r = buttonRects(state);
  const inside = (b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  if (inside(r.hint)) return 'hint';
  if (inside(r.sound)) return 'sound';
  if (inside(r.primary)) return 'primary';
  return null;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawTopBar(ctx, state) {
  const scene = SCENES[state.levelIndex];
  ctx.fillStyle = '#1d1533';
  ctx.fillRect(0, 0, 1280, TOP_BAR_H);
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('🔍 Spot the Difference', 20, 24);
  ctx.fillStyle = '#cfc4f5';
  ctx.font = '16px sans-serif';
  ctx.fillText(`Level ${state.levelIndex + 1}/3 — ${scene.name}`, 20, 50);
  // found counter, big and unmistakable
  const found = state.found.size, total = scene.differences.length;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`Found ${found}/${total}  •  ${total - found} left`, 640, 24);
  ctx.fillStyle = '#9be7ff';
  ctx.font = '15px sans-serif';
  ctx.fillText(scene.subtitle, 640, 50);
  // score
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`Score ${state.score}`, 1260, 24);
  ctx.fillStyle = '#cfc4f5';
  ctx.font = '15px sans-serif';
  ctx.fillText(`Total ${state.totalScore}  •  ${Math.ceil(state.timeLeft)}s left`, 1260, 50);
  // countdown bar
  const frac = Math.max(0, state.timeLeft / scene.timeLimit);
  ctx.fillStyle = '#33254d';
  ctx.fillRect(0, TOP_BAR_H - 8, 1280, 8);
  ctx.fillStyle = frac > 0.33 ? '#2ecc71' : frac > 0.15 ? '#f39c12' : '#e74c3c';
  ctx.fillRect(0, TOP_BAR_H - 8, 1280 * frac, 8);
}

export function drawPanelLabels(ctx) {
  ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#9be7ff';
  ctx.fillText('◀  ORIGINAL', PANEL_LEFT.x + PANEL_LEFT.w / 2, 76);
  ctx.fillStyle = '#ffb3c8';
  ctx.fillText('SPOT THE DIFFERENCES  ▶', PANEL_RIGHT.x + PANEL_RIGHT.w / 2, 76);
}

export function drawBottomBar(ctx, state) {
  const r = buttonRects(state);
  ctx.fillStyle = '#1d1533';
  ctx.fillRect(0, 580, 1280, 140);
  // hint button
  const hintReady = state.hintsLeft > 0 && state.hintCooldownUntil <= performance.now() && state.screen === 'play';
  ctx.fillStyle = hintReady ? '#ff4081' : '#4a3a5e';
  roundRect(ctx, r.hint.x, r.hint.y, r.hint.w, r.hint.h, 10); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 17px sans-serif'; ctx.textAlign = 'center';
  const cd = Math.max(0, Math.ceil((state.hintCooldownUntil - performance.now()) / 1000));
  ctx.fillText(state.hintsLeft > 0 ? (cd > 0 ? `Hint… ${cd}s` : `💡 Hint (${state.hintsLeft} left)`) : '💡 No hints left', r.hint.x + r.hint.w / 2, r.hint.y + 25);
  // sound button
  ctx.fillStyle = '#33254d';
  roundRect(ctx, r.sound.x, r.sound.y, r.sound.w, r.sound.h, 10); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 16px sans-serif';
  ctx.fillText(state.soundOn ? '🔊 Sound on' : '🔇 Muted', r.sound.x + r.sound.w / 2, r.sound.y + 25);
  // primary button (context action)
  const label = state.screen === 'title' ? '▶  Start playing'
    : state.screen === 'levelDone' ? '▶  Next level'
    : state.screen === 'victory' ? '↻  Play again'
    : state.screen === 'timeout' ? '↻  Retry level' : '⏸  Playing…';
  ctx.fillStyle = state.screen === 'play' ? '#33254d' : '#2ecc71';
  roundRect(ctx, r.primary.x, r.primary.y, r.primary.w, r.primary.h, 10); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 17px sans-serif';
  ctx.fillText(label, r.primary.x + r.primary.w / 2, r.primary.y + 25);
  // message line (kept narrow so it never runs over the side buttons)
  ctx.fillStyle = '#ffe9a8'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(state.message || 'Click a difference on either picture — or press H for a hint.', 640, 612);
  ctx.fillStyle = '#cfc4f5'; ctx.font = '14px sans-serif';
  ctx.fillText('Click a difference • H = hint • R = restart level • 1/2/3 = jump to a level', 640, 640);
  // level dots
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.arc(600 + i * 40, 678, 9, 0, Math.PI * 2);
    ctx.fillStyle = i < state.levelIndex ? '#2ecc71' : i === state.levelIndex ? '#ffd94d' : '#4a3a5e';
    ctx.fill();
  }
  ctx.fillStyle = '#cfc4f5'; ctx.font = '13px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('Levels:', 520, 678);
}

export function drawOverlay(ctx, state) {
  if (state.screen === 'play') return;
  ctx.fillStyle = 'rgba(10,6,24,0.82)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.textAlign = 'center';
  const scene = SCENES[state.levelIndex];
  if (state.screen === 'title') {
    ctx.fillStyle = '#ffd94d'; ctx.font = 'bold 52px sans-serif';
    ctx.fillText('🔍 Spot the Difference', 640, 190);
    ctx.fillStyle = '#fff'; ctx.font = '24px sans-serif';
    ctx.fillText('Two pictures. Eight differences. Can you find them all?', 640, 250);
    ctx.fillStyle = '#cfc4f5'; ctx.font = '18px sans-serif';
    ctx.fillText('3 original scenes — Moonlit Harbor • Clockwork Garden • Lantern Festival', 640, 300);
    ctx.fillText('Click a difference on either picture. Wrong clicks cost 25 points and 3 seconds.', 640, 330);
    ctx.fillText('Hints are limited — use them wisely. Beat the clock for a time bonus!', 640, 360);
    ctx.fillStyle = '#9be7ff'; ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Click ▶ Start playing (or press Enter) to begin', 640, 430);
  } else if (state.screen === 'levelDone') {
    ctx.fillStyle = '#2ecc71'; ctx.font = 'bold 48px sans-serif';
    ctx.fillText('🎉 Level complete!', 640, 220);
    ctx.fillStyle = '#fff'; ctx.font = '24px sans-serif';
    ctx.fillText(`${scene.name} — all ${scene.differences.length} differences found`, 640, 280);
    ctx.fillStyle = '#ffd94d'; ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`Level score ${state.score}  •  Time bonus +${state.lastBonus}`, 640, 330);
    ctx.fillStyle = '#9be7ff'; ctx.font = '20px sans-serif';
    ctx.fillText(state.levelIndex + 1 < 3 ? 'Click ▶ Next level to keep hunting' : 'Click ▶ Play again', 640, 400);
  } else if (state.screen === 'victory') {
    ctx.fillStyle = '#ffd94d'; ctx.font = 'bold 52px sans-serif';
    ctx.fillText('🏆 You found them all!', 640, 200);
    ctx.fillStyle = '#fff'; ctx.font = '24px sans-serif';
    ctx.fillText('All 3 scenes cleared — 24 differences spotted', 640, 260);
    ctx.fillStyle = '#ffd94d'; ctx.font = 'bold 30px sans-serif';
    ctx.fillText(`Final score: ${state.totalScore}`, 640, 320);
    ctx.fillStyle = '#cfc4f5'; ctx.font = '18px sans-serif';
    ctx.fillText(`Best streak: ${state.bestStreak} finds in a row without a miss`, 640, 365);
    ctx.fillStyle = '#9be7ff'; ctx.font = '20px sans-serif';
    ctx.fillText('Click ↻ Play again to hunt once more', 640, 430);
  } else if (state.screen === 'timeout') {
    ctx.fillStyle = '#ff5252'; ctx.font = 'bold 48px sans-serif';
    ctx.fillText('⏰ Time up!', 640, 220);
    ctx.fillStyle = '#fff'; ctx.font = '24px sans-serif';
    ctx.fillText(`You found ${state.found.size} of ${scene.differences.length} differences in ${scene.name}`, 640, 280);
    ctx.fillStyle = '#9be7ff'; ctx.font = '20px sans-serif';
    ctx.fillText('Click ↻ Retry level to try again', 640, 400);
  }
}
