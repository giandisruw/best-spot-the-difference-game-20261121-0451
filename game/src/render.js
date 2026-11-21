// Scene painters: every scene is drawn procedurally with Canvas 2D vector art.
// drawScene(ctx, scene, altered) paints one panel; `altered` is the set of
// difference ids applied to that panel. The left panel always gets an empty
// set, the right panel gets every difference id, so the two pictures are the
// same scene rendered twice with N deliberate differences.

import { SCENE_W, SCENE_H } from './scenes.js';

function circle(ctx, x, y, r, fill) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
}
function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
}
function poly(ctx, points, fill) {
  ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
}
function star(ctx, x, y, r, fill) {
  ctx.fillStyle = fill; ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    ctx[i === 0 ? 'moveTo' : 'lineTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill();
}
function sparkleBurst(ctx, x, y, r, color) {
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r * 0.35, y + Math.sin(a) * r * 0.35);
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.stroke();
  }
  circle(ctx, x, y, r * 0.18, color);
}
function gull(ctx, x, y, color) {
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x - 7, y, 7, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  ctx.beginPath(); ctx.arc(x + 7, y, 7, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
}
function lantern(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(x, y, r, r * 1.15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - r * 0.35, r * 0.35, r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
  rect(ctx, x - 6, y - r * 1.15 - 5, 12, 5, '#c9a227');
  rect(ctx, x - 6, y + r * 1.15, 12, 5, '#c9a227');
}
function tulip(ctx, x, y, color) {
  ctx.strokeStyle = '#2e7d32'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 26); ctx.stroke();
  poly(ctx, [[x - 9, y], [x - 9, y - 12], [x - 4, y - 17], [x, y - 11], [x + 4, y - 17], [x + 9, y - 12], [x + 9, y]], color);
}

// ---- Moonlit Harbor -------------------------------------------------------
function drawHarbor(ctx, a) {
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#0b1035'); sky.addColorStop(1, '#274b73');
  rect(ctx, 0, 0, SCENE_W, 300, sky);
  // stars (one vanishes on the right panel)
  const stars = [[60, 40], [118, 52], [180, 30], [250, 64], [330, 38], [410, 55], [70, 110], [200, 100], [280, 44], [450, 30]];
  for (const [x, y] of stars) {
    if (x === 118 && a.has('star')) continue;
    star(ctx, x, y, 4, '#ffeeb0');
  }
  // moon + craters
  circle(ctx, 480, 78, 34, '#f7f3d8');
  circle(ctx, 470, 70, 6, '#ddd6ae'); circle(ctx, 492, 88, 8, '#ddd6ae'); circle(ctx, 488, 64, 4, '#ddd6ae');
  // distant hills
  poly(ctx, [[0, 300], [120, 220], [260, 300]], '#16283f');
  poly(ctx, [[180, 300], [330, 205], [520, 300]], '#12203a');
  // lighthouse (lamp changes color on the right)
  rect(ctx, 500, 110, 26, 190, '#e8e2d0');
  poly(ctx, [[496, 110], [530, 110], [522, 88], [504, 88]], '#c0392b');
  circle(ctx, 513, 96, 12, a.has('lamp') ? '#ff5252' : '#ffd94d');
  ctx.fillStyle = a.has('lamp') ? 'rgba(255,82,82,0.25)' : 'rgba(255,217,77,0.35)';
  ctx.beginPath(); ctx.moveTo(513, 96); ctx.lineTo(430, 70); ctx.lineTo(430, 122); ctx.closePath(); ctx.fill();
  // houses along the quay
  drawHouse(ctx, 150, 240, 120, 60, a.has('roof') ? '#1abc9c' : '#c0392b', a.has('window') ? '#2c3e50' : '#ffd94d');
  drawHouse(ctx, 280, 255, 90, 45, '#8e44ad', '#ffd94d');
  drawHouse(ctx, 372, 248, 80, 52, '#2e86c1', '#ffd94d');
  // chimney smoke (missing on the right)
  if (!a.has('smoke')) {
    circle(ctx, 388, 232, 8, 'rgba(220,220,220,0.75)');
    circle(ctx, 396, 220, 10, 'rgba(220,220,220,0.6)');
    circle(ctx, 406, 206, 12, 'rgba(220,220,220,0.45)');
  }
  // quay
  rect(ctx, 0, 300, SCENE_W, 14, '#5d4037');
  // sea
  const sea = ctx.createLinearGradient(0, 314, 0, SCENE_H);
  sea.addColorStop(0, '#1b4f72'); sea.addColorStop(1, '#0e2a3f');
  rect(ctx, 0, 314, SCENE_W, SCENE_H - 314, sea);
  ctx.fillStyle = 'rgba(255,217,77,0.25)';
  for (let i = 0; i < 5; i++) rect(ctx, 470 + i * 4 - 20, 330 + i * 16, 44 - i * 6, 3, 'rgba(255,217,77,0.25)');
  // buoy (missing on the right)
  if (!a.has('buoy')) {
    poly(ctx, [[150, 408], [138, 428], [162, 428]], '#e74c3c');
    rect(ctx, 146, 400, 8, 10, '#e74c3c');
  }
  // fishing boat (sails to a new spot on the right)
  const bx = a.has('boat') ? 478 : 430;
  drawBoat(ctx, bx, 392);
  // gulls (one extra on the right)
  gull(ctx, 250, 110, '#eaf2f8'); gull(ctx, 290, 90, '#eaf2f8');
  if (a.has('gull')) gull(ctx, 330, 120, '#eaf2f8');
  // fish jumping
  ctx.strokeStyle = '#7fb3d5'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(90, 380, 12, Math.PI, 0); ctx.stroke();
  circle(ctx, 96, 366, 3, '#7fb3d5');
}

function drawHouse(ctx, x, y, w, h, roofColor, windowColor) {
  rect(ctx, x, y + 22, w, h - 22, '#f5e6c8');
  poly(ctx, [[x - 8, y + 24], [x + w / 2, y], [x + w + 8, y + 24]], roofColor);
  rect(ctx, x + w * 0.2, y + 34, 18, 18, windowColor);
  rect(ctx, x + w * 0.6, y + 34, 18, 18, '#ffd94d');
  rect(ctx, x + w * 0.45, y + 40, 14, h - 40, '#6e4a2f');
  rect(ctx, x + w - 18, y - 8, 10, 18, '#7b4b3a');
}
function drawBoat(ctx, x, y) {
  poly(ctx, [[x - 34, y], [x + 34, y], [x + 24, y + 14], [x - 24, y + 14]], '#8b4513');
  ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 34); ctx.stroke();
  poly(ctx, [[x + 2, y - 32], [x + 2, y - 4], [x + 26, y - 4]], '#f4f6f7');
}

// ---- Clockwork Garden -----------------------------------------------------
function drawGarden(ctx, a) {
  const sky = ctx.createLinearGradient(0, 0, 0, 260);
  sky.addColorStop(0, '#aee2ff'); sky.addColorStop(1, '#e8f8e0');
  rect(ctx, 0, 0, SCENE_W, 260, sky);
  circle(ctx, 60, 60, 26, '#ffdf4d');
  // clouds (one extra on the right)
  drawCloud(ctx, 180, 60); drawCloud(ctx, 430, 50);
  if (a.has('cloud')) drawCloud(ctx, 90, 88);
  // clock tower
  rect(ctx, 268, 60, 64, 170, '#e8c39e');
  poly(ctx, [[260, 62], [300, 28], [340, 62]], '#c0392b');
  circle(ctx, 300, 92, 30, '#fffdf5');
  ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(300, 92, 30, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#222'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  const [ha, ma] = a.has('hands') ? [2.4, 5.2] : [5.0, 0.2];
  ctx.beginPath(); ctx.moveTo(300, 92); ctx.lineTo(300 + Math.cos(ha - Math.PI / 2) * 15, 92 + Math.sin(ha - Math.PI / 2) * 15); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(300, 92); ctx.lineTo(300 + Math.cos(ma - Math.PI / 2) * 24, 92 + Math.sin(ma - Math.PI / 2) * 24); ctx.stroke();
  circle(ctx, 300, 92, 3, '#222');
  rect(ctx, 292, 150, 16, 80, '#6e4a2f');
  // hedge + lawn
  rect(ctx, 0, 230, SCENE_W, 34, '#2e7d32');
  rect(ctx, 0, 264, SCENE_W, SCENE_H - 264, '#7fbf5a');
  // flower beds
  tulip(ctx, 120, 372, a.has('tulip') ? '#9b59b6' : '#e74c3c');
  tulip(ctx, 160, 380, '#f39c12'); tulip(ctx, 80, 380, '#e74c3c'); tulip(ctx, 200, 368, '#f39c12');
  tulip(ctx, 470, 380, '#e74c3c'); tulip(ctx, 510, 372, '#f39c12');
  // fountain (water changes color on the right)
  ctx.fillStyle = '#b0bec5';
  ctx.beginPath(); ctx.ellipse(300, 350, 62, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(300, 346, 52, 14, 0, 0, Math.PI * 2);
  ctx.fillStyle = a.has('fountain') ? '#66bb6a' : '#4fc3f7'; ctx.fill();
  rect(ctx, 294, 306, 12, 42, '#b0bec5');
  circle(ctx, 300, 302, 10, '#eceff1');
  ctx.strokeStyle = a.has('fountain') ? '#66bb6a' : '#4fc3f7'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(300, 296); ctx.quadraticCurveTo(280, 320, 268, 344); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(300, 296); ctx.quadraticCurveTo(320, 320, 332, 344); ctx.stroke();
  // butterfly (missing on the right) and extra bee
  if (!a.has('butterfly')) drawButterfly(ctx, 470, 180);
  if (a.has('bee')) drawBee(ctx, 205, 205);
  drawBee(ctx, 250, 240);
  // bird on the branch (missing on the right)
  ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(500, 250); ctx.lineTo(560, 238); ctx.stroke();
  if (!a.has('bird')) {
    circle(ctx, 520, 244, 9, '#3498db');
    poly(ctx, [[528, 240], [536, 243], [528, 246]], '#f39c12');
  }
  // bench (cushion recolored on the right)
  rect(ctx, 420, 400, 72, 8, '#6e4a2f');
  rect(ctx, 426, 408, 6, 22, '#6e4a2f'); rect(ctx, 480, 408, 6, 22, '#6e4a2f');
  rect(ctx, 424, 392, 64, 10, a.has('cushion') ? '#9b59b6' : '#e74c3c');
}
function drawCloud(ctx, x, y) {
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  circle(ctx, x, y, 16, 'rgba(255,255,255,0.95)');
  circle(ctx, x + 16, y + 4, 13, 'rgba(255,255,255,0.95)');
  circle(ctx, x - 16, y + 5, 12, 'rgba(255,255,255,0.95)');
}
function drawButterfly(ctx, x, y) {
  ctx.fillStyle = '#e91e63';
  ctx.beginPath(); ctx.ellipse(x - 7, y - 5, 8, 10, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 7, y - 5, 8, 10, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x - 5, y + 7, 5, 7, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 5, y + 7, 5, 7, -0.4, 0, Math.PI * 2); ctx.fill();
}
function drawBee(ctx, x, y) {
  ctx.fillStyle = '#ffcf3f';
  ctx.beginPath(); ctx.ellipse(x, y, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#222'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x - 2, y - 5); ctx.lineTo(x - 2, y + 5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 3, y - 5); ctx.lineTo(x + 3, y + 5); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath(); ctx.ellipse(x - 2, y - 8, 5, 3, -0.4, 0, Math.PI * 2); ctx.fill();
}

// ---- Lantern Festival -----------------------------------------------------
function drawFestival(ctx, a) {
  const sky = ctx.createLinearGradient(0, 0, 0, 260);
  sky.addColorStop(0, '#1a1033'); sky.addColorStop(1, '#4a235a');
  rect(ctx, 0, 0, SCENE_W, 260, sky);
  circle(ctx, 90, 60, 22, '#f7f3d8');
  // fireworks (one missing on the right) and kite (missing on the right)
  if (!a.has('firework')) sparkleBurst(ctx, 480, 70, 26, '#ff8fb1');
  sparkleBurst(ctx, 200, 55, 20, '#8fd3ff');
  if (!a.has('kite')) drawKite(ctx, 395, 60);
  // rooftops
  poly(ctx, [[0, 260], [90, 200], [180, 260]], '#2c1a4d');
  poly(ctx, [[420, 260], [520, 195], [600, 260]], '#2c1a4d');
  // cat on the right-hand roof (extra on the right)
  if (a.has('cat')) {
    ctx.fillStyle = '#1b1b2e';
    ctx.beginPath(); ctx.ellipse(545, 262, 16, 8, 0, 0, Math.PI * 2); ctx.fill();
    circle(ctx, 558, 252, 6, '#1b1b2e');
    poly(ctx, [[554, 247], [556, 240], [559, 247]], '#1b1b2e');
    poly(ctx, [[560, 247], [563, 240], [565, 247]], '#1b1b2e');
  }
  // lantern strings
  ctx.strokeStyle = '#3a2b1f'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 120); ctx.quadraticCurveTo(300, 175, 600, 120); ctx.stroke();
  lantern(ctx, 120, 148, 14, '#ff5252');
  lantern(ctx, 210, 156, 12, '#ffb300');
  lantern(ctx, 300, 130, 20, a.has('lantern') ? '#ffd54f' : '#ff5252');
  lantern(ctx, 390, 156, 12, '#ff5252');
  lantern(ctx, 480, 148, 14, '#ffb300');
  // one bulb dark on the right
  circle(ctx, 210, 150, 4, a.has('bulb') ? '#3a3a3a' : '#fff176');
  // banner (stripes vanish on the right)
  rect(ctx, 120, 178, 60, 26, '#ff7043');
  if (!a.has('banner')) {
    rect(ctx, 128, 178, 8, 26, '#fff');
    rect(ctx, 146, 178, 8, 26, '#fff');
    rect(ctx, 164, 178, 8, 26, '#fff');
  }
  ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('FEST', 150, 210);
  // market stalls
  drawStall(ctx, 60, 300, '#ff7043');
  drawStall(ctx, 390, 290, a.has('awning') ? '#26a69a' : '#ff7043');
  // balloon (extra on the right)
  if (a.has('balloon')) {
    ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(70, 268); ctx.lineTo(70, 300); ctx.stroke();
    ctx.fillStyle = '#42a5f5';
    ctx.beginPath(); ctx.ellipse(70, 250, 14, 18, 0, 0, Math.PI * 2); ctx.fill();
  }
  // street + crowd silhouettes
  rect(ctx, 0, 360, SCENE_W, SCENE_H - 360, '#3d2b4f');
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let i = 0; i < 8; i++) rect(ctx, 20 + i * 72, 400, 40, 4, 'rgba(255,255,255,0.08)');
  drawPerson(ctx, 180, 420, '#ff8a65'); drawPerson(ctx, 250, 430, '#4db6ac'); drawPerson(ctx, 330, 418, '#ba68c8');
  // paper lanterns on the ground
  lantern(ctx, 540, 430, 16, '#ff5252');
  lantern(ctx, 80, 440, 13, '#ffb300');
}
function drawKite(ctx, x, y) {
  poly(ctx, [[x, y - 14], [x + 12, y], [x, y + 14], [x - 12, y]], '#ff8fb1');
  ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x, y + 14); ctx.quadraticCurveTo(x + 10, y + 34, x - 4, y + 50); ctx.stroke();
}
function drawStall(ctx, x, y, awning) {
  rect(ctx, x, y + 30, 110, 60, '#8d6e63');
  poly(ctx, [[x - 6, y + 32], [x + 55, y], [x + 116, y + 32]], awning);
  circle(ctx, x + 25, y + 55, 8, '#ff5252'); circle(ctx, x + 55, y + 55, 8, '#ffb300'); circle(ctx, x + 85, y + 55, 8, '#66bb6a');
  rect(ctx, x + 10, y + 70, 90, 8, '#5d4037');
}
function drawPerson(ctx, x, y, color) {
  circle(ctx, x, y - 26, 9, '#f2c9a0');
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(x - 11, y); ctx.lineTo(x - 8, y - 20); ctx.lineTo(x + 8, y - 20); ctx.lineTo(x + 11, y); ctx.closePath(); ctx.fill();
}

const PAINTERS = { harbor: drawHarbor, garden: drawGarden, festival: drawFestival };

export function drawScene(ctx, scene, altered) {
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, SCENE_W, SCENE_H); ctx.clip();
  PAINTERS[scene.id](ctx, altered);
  ctx.restore();
}

// A satisfying found marker: a pulsing gold ring with a small check.
export function drawFoundRing(ctx, x, y, r, pulse) {
  const pr = r + Math.sin(pulse) * 2;
  ctx.strokeStyle = '#ffd94d'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y, pr, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, pr - 6, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#2ecc71'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x - 2, y + 7); ctx.lineTo(x + 10, y - 7); ctx.stroke();
}

// A hint pulse: a soft magenta ring that breathes around an unfound difference.
export function drawHintRing(ctx, x, y, r, t) {
  const pr = r + 6 + Math.sin(t * 5) * 4;
  ctx.strokeStyle = 'rgba(255,64,129,0.95)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(x, y, pr, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x, y, pr + 5, 0, Math.PI * 2); ctx.stroke();
}

// A red X flash where a wrong click landed.
export function drawWrongMark(ctx, x, y, alpha) {
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#ff5252'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 12, y - 12); ctx.lineTo(x + 12, y + 12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 12, y - 12); ctx.lineTo(x - 12, y + 12); ctx.stroke();
  ctx.restore();
}
