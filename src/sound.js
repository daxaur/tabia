// tabia — synthesized board sounds. No audio files, no network: pure WebAudio,
// so it stays browser-local. Soft wood knocks for moves, a thud for captures.
let ctx = null;
function ac() {
  if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; ctx = C ? new C() : null; }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// short filtered-noise "knock"
function knock(gain, cutoff, dur) {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  const n = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, n, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6);
  const src = c.createBufferSource(); src.buffer = buf;
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cutoff;
  const g = c.createGain(); g.gain.value = gain;
  src.connect(f).connect(g).connect(c.destination); src.start(t);
}
// tonal blip
function blip(freq, dur, gain, type = 'sine', sweepTo = 0) {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (sweepTo) o.frequency.exponentialRampToValueAtTime(Math.max(40, sweepTo), t + dur);
  g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
}

export const Sound = {
  enabled: true,
  move()    { if (this.enabled) knock(0.32, 2100, 0.045); },
  capture() { if (this.enabled) { knock(0.45, 1300, 0.06); blip(180, 0.08, 0.12, 'triangle', 90); } },
  castle()  { if (this.enabled) { knock(0.3, 1900, 0.04); setTimeout(() => knock(0.3, 1900, 0.04), 90); } },
  check()   { if (this.enabled) { knock(0.3, 1800, 0.045); blip(740, 0.11, 0.13, 'square', 880); } },
  error()   { if (this.enabled) blip(150, 0.16, 0.16, 'sawtooth', 90); },
  success() { if (this.enabled) { blip(660, 0.1, 0.12, 'sine'); setTimeout(() => blip(990, 0.13, 0.12, 'sine'), 110); } },
  round()   { if (this.enabled) { blip(523, 0.1, 0.1); setTimeout(() => blip(659, 0.1, 0.1), 90); setTimeout(() => blip(784, 0.14, 0.1), 180); } },
};
