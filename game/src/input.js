// Input: mouse/touch clicks on the two panels and the HUD buttons, plus the
// keyboard shortcuts (H hint, R restart, 1/2/3 jump to a level, Enter start).
// Converts a pointer event into canvas coordinates (the canvas is fixed at
// 1280x720 and scaled by CSS) and, for panel clicks, into scene coordinates.

import { PANEL_LEFT, PANEL_RIGHT, hitButton } from './hud.js';

export function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
}

export function panelAt(x, y) {
  for (const [name, p] of [['left', PANEL_LEFT], ['right', PANEL_RIGHT]]) {
    if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) {
      return { name, panel: p, sceneX: x - p.x, sceneY: y - p.y };
    }
  }
  return null;
}

export function attachInput(canvas, handlers) {
  canvas.addEventListener('pointerdown', (event) => {
    const { x, y } = canvasPoint(canvas, event);
    const button = hitButton(x, y, handlers.getState());
    if (button) { handlers.onButton(button); return; }
    const hit = panelAt(x, y);
    if (hit) handlers.onPanelClick(hit.sceneX, hit.sceneY, hit.name);
  });
  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'h') handlers.onButton('hint');
    else if (key === 'r') handlers.onButton('restart');
    else if (key === 'enter' || key === ' ') handlers.onButton('primary');
    else if (key === '1' || key === '2' || key === '3') handlers.onLevel(Number(key) - 1);
    else if (key === 'm') handlers.onButton('sound');
  });
}
