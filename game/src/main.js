// Spot the Difference — main game loop and state machine.
// Screens: title -> play -> levelDone -> (next level) -> victory, or timeout.
// The two panels render the same scene twice: the left panel plain, the
// right panel with every difference applied. Clicking a difference on either
// panel marks it on both. A ?selftest=1 run exercises the real click path
// (find, wrong click, hint, timer, level completion) and reports PASS/FAIL
// into the DOM so headless play-testing can read it.

import { SCENES } from './scenes.js';
import { drawScene, drawFoundRing, drawHintRing, drawWrongMark } from './render.js';
import { findDifferenceAt, pickHintTarget, SCORE_FIND, SCORE_WRONG, SCORE_HINT, WRONG_TIME_PENALTY, LEVEL_TIME_BONUS_PER_SECOND } from './differences.js';
import { playFindChime, playWrongBuzz, playHintPluck, playLevelFanfare, playClick, ensureAudio } from './audio.js';
import { PANEL_LEFT, PANEL_RIGHT, drawTopBar, drawPanelLabels, drawBottomBar, drawOverlay } from './hud.js';
import { attachInput } from './input.js';
import { stagedState } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const params = new URLSearchParams(location.search);
const staged = stagedState(params.get('shot'));

const state = {
  screen: 'title',
  levelIndex: 0,
  found: new Set(),
  score: 0,
  totalScore: 0,
  timeLeft: SCENES[0].timeLimit,
  hintsLeft: 3,
  hintCooldownUntil: 0,
  hintTarget: null,
  hintUntil: 0,
  wrongMarks: [],
  message: '',
  lastBonus: 0,
  bestStreak: 0,
  streak: 0,
  soundOn: true,
};

function currentScene() { return SCENES[state.levelIndex]; }

function startLevel(index) {
  state.levelIndex = index;
  state.found = new Set();
  state.score = 0;
  state.timeLeft = currentScene().timeLimit;
  state.hintsLeft = 3;
  state.hintCooldownUntil = 0;
  state.hintTarget = null;
  state.wrongMarks = [];
  state.screen = 'play';
  state.message = `Find ${currentScene().differences.length} differences in ${currentScene().name}!`;
  announce(state.message);
}

function announce(text) {
  statusEl.textContent = text;
}

function onPanelClick(sceneX, sceneY) {
  if (state.screen !== 'play') return;
  ensureAudio();
  const scene = currentScene();
  const diff = findDifferenceAt(scene, sceneX, sceneY, state.found);
  if (diff) {
    state.found.add(diff.id);
    state.score += SCORE_FIND;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.message = `✓ ${diff.label}! ${scene.differences.length - state.found.size} left.`;
    announce(state.message);
    if (state.soundOn) playFindChime();
    if (state.found.size === scene.differences.length) completeLevel();
  } else {
    state.score = Math.max(0, state.score + SCORE_WRONG);
    state.timeLeft = Math.max(0, state.timeLeft - WRONG_TIME_PENALTY);
    state.streak = 0;
    state.wrongMarks.push({ x: sceneX, y: sceneY, panel: lastPanel, until: performance.now() + 700 });
    state.message = `✗ Not a difference — −25 points, −3 seconds. Look closer!`;
    announce(state.message);
    if (state.soundOn) playWrongBuzz();
  }
}

let lastPanel = 'left';

function onButton(action) {
  ensureAudio();
  if (action === 'sound') { state.soundOn = !state.soundOn; return; }
  if (action === 'hint') { useHint(); return; }
  if (action === 'restart') { startLevel(state.levelIndex); return; }
  if (action !== 'primary') return;
  if (state.screen === 'title') startLevel(0);
  else if (state.screen === 'levelDone') startLevel((state.levelIndex + 1) % 3);
  else if (state.screen === 'victory' || state.screen === 'timeout') { state.totalScore = 0; startLevel(0); }
  else if (state.soundOn) playClick();
}

function useHint() {
  if (state.screen !== 'play') return;
  if (state.hintsLeft <= 0) { state.message = 'No hints left on this level!'; return; }
  if (performance.now() < state.hintCooldownUntil) return;
  const target = pickHintTarget(currentScene(), state.found);
  if (!target) return;
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score + SCORE_HINT);
  state.hintTarget = target;
  state.hintUntil = performance.now() + 4000;
  state.hintCooldownUntil = performance.now() + 12000;
  state.message = '💡 Hint: look near the pulsing ring… (−50 points)';
  if (state.soundOn) playHintPluck();
}

function completeLevel() {
  const bonus = Math.ceil(state.timeLeft) * LEVEL_TIME_BONUS_PER_SECOND;
  state.lastBonus = bonus;
  state.totalScore += state.score + bonus;
  state.screen = state.levelIndex + 1 >= 3 ? 'victory' : 'levelDone';
  if (state.soundOn) playLevelFanfare();
  announce(state.screen === 'victory' ? `You found them all! Final score ${state.totalScore}` : `Level complete! Score ${state.score}, time bonus ${bonus}`);
}

let lastTickNow = performance.now();
function advanceTimer(now) {
  // Driven by rAF and by a 200 ms interval, so the countdown keeps running
  // even when the tab is backgrounded and rAF is throttled.
  const dt = Math.min(1, Math.max(0, (now - lastTickNow) / 1000));
  lastTickNow = now;
  if (state.screen !== 'play') return;
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.screen = 'timeout';
    announce(`Time up! You found ${state.found.size} of ${currentScene().differences.length}.`);
  }
}
setInterval(() => advanceTimer(performance.now()), 200);

function draw(now) {
  ctx.clearRect(0, 0, 1280, 720);
  ctx.fillStyle = '#141021';
  ctx.fillRect(0, 0, 1280, 720);
  const scene = currentScene();
  // Left panel: the original. Right panel: every difference applied.
  const allIds = new Set(scene.differences.map((d) => d.id));
  ctx.save(); ctx.translate(PANEL_LEFT.x, PANEL_LEFT.y); drawScene(ctx, scene, new Set()); ctx.restore();
  ctx.save(); ctx.translate(PANEL_RIGHT.x, PANEL_RIGHT.y); drawScene(ctx, scene, allIds); ctx.restore();
  // Panel frames
  ctx.strokeStyle = '#3d2b5c'; ctx.lineWidth = 3;
  ctx.strokeRect(PANEL_LEFT.x - 2, PANEL_LEFT.y - 2, PANEL_LEFT.w + 4, PANEL_LEFT.h + 4);
  ctx.strokeRect(PANEL_RIGHT.x - 2, PANEL_RIGHT.y - 2, PANEL_RIGHT.w + 4, PANEL_RIGHT.h + 4);
  // Found rings on both panels, plus hint and wrong-click marks.
  for (const panel of [PANEL_LEFT, PANEL_RIGHT]) {
    ctx.save(); ctx.translate(panel.x, panel.y);
    for (const d of scene.differences) {
      if (state.found.has(d.id)) drawFoundRing(ctx, d.x, d.y, d.r, now / 300);
    }
    if (state.hintTarget && now < state.hintUntil) {
      drawHintRing(ctx, state.hintTarget.x, state.hintTarget.y, state.hintTarget.r, now / 1000);
    }
    for (const m of state.wrongMarks) {
      if (now < m.until && m.panel === (panel === PANEL_LEFT ? 'left' : 'right')) {
        drawWrongMark(ctx, m.x, m.y, (m.until - now) / 700);
      }
    }
    ctx.restore();
  }
  drawTopBar(ctx, state);
  drawPanelLabels(ctx);
  drawBottomBar(ctx, state);
  drawOverlay(ctx, state);
}

// Apply a staged screenshot state (or plain title screen on normal load).
if (staged) {
  Object.assign(state, {
    levelIndex: staged.levelIndex,
    found: new Set(staged.foundIds),
    timeLeft: staged.timeLeft,
    score: staged.score,
    screen: staged.screen,
    message: staged.message,
  });
  if (staged.totalScore !== undefined) state.totalScore = staged.totalScore;
  if (staged.bestStreak !== undefined) state.bestStreak = staged.bestStreak;
  state.hintsLeft = 2;
  // Staged frames are frozen: never tick the timer down in a screenshot.
  state.screen = staged.screen;
} else {
  state.screen = 'title';
}

attachInput(canvas, {
  getState: () => state,
  onPanelClick: (x, y, panel) => { lastPanel = panel; onPanelClick(x, y); },
  onButton,
  onLevel: (i) => { if (state.screen === 'title' || state.screen === 'victory') startLevel(i); },
});

let lastNow = performance.now();
function frame(now) {
  lastNow = now;
  if (!staged) advanceTimer(now);
  draw(now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---- Self-test (?selftest=1) ---------------------------------------------
// Drives the real click path in a headless browser and reports PASS/FAIL in
// the DOM (#selftest) and document.title, so a screenshot run can read it.
async function runSelfTest() {
  const results = [];
  const check = (name, ok) => results.push(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  await sleep(400);
  startLevel(0);
  const scene = currentScene();
  const d0 = scene.differences[0];
  const before = state.found.size;
  // Click the first difference on the LEFT panel via a real pointer event.
  const rect = canvas.getBoundingClientRect();
  const scaleX = rect.width / canvas.width, scaleY = rect.height / canvas.height;
  const clickAt = (sceneX, sceneY, panel) => {
    const px = (panel === 'left' ? PANEL_LEFT.x : PANEL_RIGHT.x) + sceneX;
    const py = PANEL_LEFT.y + sceneY;
    canvas.dispatchEvent(new PointerEvent('pointerdown', {
      clientX: rect.left + px * scaleX, clientY: rect.top + py * scaleY, bubbles: true,
    }));
  };
  clickAt(d0.x, d0.y, 'left');
  await sleep(50);
  check('click registers a find', state.found.size === before + 1 && state.found.has(d0.id));
  check('score increases by 100', state.score === 100);
  const t0 = state.timeLeft;
  clickAt(10, 10, 'left'); // empty sky corner: a wrong click
  await sleep(50);
  check('wrong click penalizes score', state.score === 75);
  check('wrong click costs time', state.timeLeft < t0);
  check('wrong mark recorded', state.wrongMarks.length === 1);
  const hintsBefore = state.hintsLeft;
  useHint();
  check('hint consumes a use', state.hintsLeft === hintsBefore - 1);
  check('hint targets an unfound difference', !!state.hintTarget && !state.found.has(state.hintTarget.id));
  const tl = state.timeLeft;
  await sleep(1200);
  check('timer runs down', state.timeLeft < tl);
  // Finish the level by clicking every remaining difference on the right panel.
  for (const d of scene.differences) {
    if (!state.found.has(d.id)) clickAt(d.x, d.y, 'right');
    await sleep(20);
  }
  await sleep(100);
  check('level completes when all found', state.screen === 'levelDone');
  check('time bonus added to total', state.totalScore > 0);
  const passed = results.filter((r) => r.startsWith('PASS')).length;
  const text = `SELFTEST ${passed}/${results.length} ${results.join(' | ')}`;
  const el = document.getElementById('selftest');
  el.style.display = 'block';
  el.textContent = text;
  document.title = text;
}

if (params.get('selftest') === '1') runSelfTest();
