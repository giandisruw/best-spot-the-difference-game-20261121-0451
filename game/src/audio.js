// Sound effects, synthesized live with WebAudio oscillators — no audio files,
// no network. A bright chime on each find, a low buzz on a wrong click, a
// soft pluck for a hint, and a little fanfare when a level is cleared.

let audioCtx = null;

export function ensureAudio() {
  if (audioCtx) {
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    return audioCtx;
  }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  } catch {
    audioCtx = null;
  }
  return audioCtx;
}

function tone(freq, startAt, duration, type, volume) {
  const ctx = ensureAudio();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime + startAt);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startAt + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(ctx.currentTime + startAt);
    osc.stop(ctx.currentTime + startAt + duration + 0.05);
  } catch { /* audio is decoration; never break the game */ }
}

export function playFindChime() {
  tone(880, 0, 0.18, 'sine', 0.25);
  tone(1318, 0.08, 0.28, 'sine', 0.22);
}

export function playWrongBuzz() {
  tone(160, 0, 0.22, 'sawtooth', 0.12);
}

export function playHintPluck() {
  tone(660, 0, 0.15, 'triangle', 0.2);
  tone(990, 0.07, 0.2, 'triangle', 0.15);
}

export function playLevelFanfare() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.3, 'triangle', 0.22));
}

export function playClick() {
  tone(440, 0, 0.06, 'sine', 0.1);
}
