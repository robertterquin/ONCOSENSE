// Synthesizes the showreel's music and sound effects into public/audio/ (no samples,
// so nothing to license). Run with: node scripts/make-audio.mjs
//
// The music is a waltz at 100 BPM, so a beat is 18 frames at 30fps and every day of
// the reel starts on a bar (see the Music section).

import { mkdirSync, writeFileSync } from "node:fs";

const SR = 44100;
const BEAT = 0.6;
const LENGTH = 30;
const OUT = new URL("../public/audio/", import.meta.url);
mkdirSync(OUT, { recursive: true });

// Deterministic noise, so every run writes the same files.
let seed = 7;
const rand = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const noise = () => rand() * 2 - 1;
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
const buffer = (seconds) => new Float32Array(Math.ceil(seconds * SR));

function writeWav(name, left, right = left, peakTarget = 0.89) {
  let peak = 0;
  for (let i = 0; i < left.length; i++)
    peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
  const gain = peak ? peakTarget / peak : 1;
  const data = Buffer.alloc(44 + left.length * 4);
  data.write("RIFF", 0);
  data.writeUInt32LE(36 + left.length * 4, 4);
  data.write("WAVEfmt ", 8);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(2, 22);
  data.writeUInt32LE(SR, 24);
  data.writeUInt32LE(SR * 4, 28);
  data.writeUInt16LE(4, 32);
  data.writeUInt16LE(16, 34);
  data.write("data", 36);
  data.writeUInt32LE(left.length * 4, 40);
  const pcm = (v) => Math.round(Math.max(-1, Math.min(1, v * gain)) * 32767);
  for (let i = 0; i < left.length; i++) {
    data.writeInt16LE(pcm(left[i]), 44 + i * 4);
    data.writeInt16LE(pcm(right[i]), 46 + i * 4);
  }
  writeFileSync(new URL(name, OUT), data);
  console.log(`${name}  ${(left.length / SR).toFixed(2)}s`);
}

// RBJ biquad; `freq` may be a function of the sample index for sweeps.
function biquad(input, type, freq, q = 0.707) {
  const out = new Float32Array(input.length);
  let x1 = 0,
    x2 = 0,
    y1 = 0,
    y2 = 0;
  for (let i = 0; i < input.length; i++) {
    const f = typeof freq === "function" ? freq(i) : freq;
    const w = (2 * Math.PI * Math.min(f, SR * 0.45)) / SR;
    const alpha = Math.sin(w) / (2 * q);
    const cos = Math.cos(w);
    let b0, b1, b2;
    if (type === "lowpass")
      [b0, b1, b2] = [(1 - cos) / 2, 1 - cos, (1 - cos) / 2];
    else if (type === "highpass")
      [b0, b1, b2] = [(1 + cos) / 2, -(1 + cos), (1 + cos) / 2];
    else [b0, b1, b2] = [alpha, 0, -alpha];
    const a0 = 1 + alpha,
      a1 = -2 * cos,
      a2 = 1 - alpha;
    const y = (b0 * input[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1;
    x1 = input[i];
    y2 = y1;
    y1 = y;
    out[i] = y;
  }
  return out;
}

// A small Freeverb: eight damped combs and four allpasses per side.
function reverb(input, { room = 0.86, damp = 0.35 } = {}) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
  const passes = [556, 441, 341, 225];
  const side = (spread) => {
    const out = new Float32Array(input.length);
    const cs = combs.map((n) => ({
      buf: new Float32Array(n + spread),
      i: 0,
      store: 0,
    }));
    const as = passes.map((n) => ({ buf: new Float32Array(n + spread), i: 0 }));
    for (let n = 0; n < input.length; n++) {
      const x = input[n] * 0.015;
      let sum = 0;
      for (const c of cs) {
        const y = c.buf[c.i];
        c.store = y * (1 - damp) + c.store * damp;
        c.buf[c.i] = x + c.store * room;
        c.i = (c.i + 1) % c.buf.length;
        sum += y;
      }
      for (const a of as) {
        const b = a.buf[a.i];
        a.buf[a.i] = sum + b * 0.5;
        a.i = (a.i + 1) % a.buf.length;
        sum = b - sum;
      }
      out[n] = sum;
    }
    return out;
  };
  return [side(0), side(23)];
}

const addAt = (target, source, at, gain = 1) => {
  const start = Math.round(at * SR);
  for (let i = 0; i < source.length && start + i < target.length; i++)
    target[start + i] += source[i] * gain;
};

// ---- Voices ----

function pluck(freq, seconds, brightness = 0.6, decay = 0.996) {
  const out = buffer(seconds);
  const n = Math.max(2, Math.round(SR / freq));
  const line = new Float32Array(n);
  let last = 0;
  for (let i = 0; i < n; i++) {
    last = last * (1 - brightness) + noise() * brightness;
    line[i] = last;
  }
  for (let i = 0; i < out.length; i++) {
    const j = i % n;
    out[i] = line[j];
    line[j] = 0.5 * (line[j] + line[(j + 1) % n]) * decay;
  }
  return out;
}

// FM bell: a bright attack that mellows as the modulator fades.
function bell(freq, seconds, ratio = 3.5) {
  const out = buffer(seconds);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const index = 2.4 * Math.exp(-t * 3);
    const mod = Math.sin(2 * Math.PI * freq * ratio * t) * index;
    out[i] =
      Math.sin(2 * Math.PI * freq * t + mod) *
      Math.exp(-t * 2.2) *
      Math.min(1, t * 400);
  }
  return out;
}

function kick() {
  const out = buffer(0.45);
  let phase = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    phase += (2 * Math.PI * (44 + 120 * Math.exp(-t * 30))) / SR;
    out[i] =
      Math.sin(phase) * Math.exp(-t * 6.5) +
      noise() * Math.exp(-t * 500) * 0.25;
  }
  return out;
}

function hat() {
  const raw = buffer(0.08);
  for (let i = 0; i < raw.length; i++)
    raw[i] = noise() * Math.exp((-i / SR) * 70);
  return biquad(raw, "highpass", 7000);
}

// ---- Music ----
//
// A week with OncoSense (src/Showreel.tsx, src/week.tsx): 100 BPM in 3/4, so a beat is
// 18 frames and each day is two bars. Bar 0 is the intro, bars 1-12 are Sunday to
// Friday, 13-14 Saturday, and the logo lands on bar 15 with the home chord. A felt
// piano waltz (low root, then two soft chord stabs), a bell on each bar, a warm pad
// and a light shaker.

const BAR = 3 * BEAT;
const CHORDS = {
  F: { notes: [65, 69, 72, 76], root: 41 },
  Am: { notes: [64, 67, 69, 72], root: 45 },
  Bb: { notes: [62, 65, 69, 72], root: 46 },
  C: { notes: [64, 67, 70, 72], root: 48 },
  Dm: { notes: [62, 65, 69, 72], root: 50 },
};
const BARS = [
  "F",
  "F",
  "Am",
  "Bb",
  "C",
  "F",
  "Am",
  "Bb",
  "C",
  "Dm",
  "Bb",
  "F",
  "C",
  "Bb",
  "C",
];
const FINAL = 15 * BAR;
const chordAt = (t) =>
  CHORDS[
    t >= FINAL ? "F" : BARS[Math.min(BARS.length - 1, Math.floor(t / BAR))]
  ];

function music() {
  const L = buffer(LENGTH),
    R = buffer(LENGTH);
  const send = buffer(LENGTH);

  // Pad: three detuned saws a note, softly filtered, low under everything.
  const harmonics = 7;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const swell =
      Math.min(1, t / 1.5) * (t > LENGTH - 1 ? (LENGTH - t) / 1 : 1);
    let l = 0,
      r = 0;
    for (const note of chordAt(t).notes) {
      const f = midi(note - 12);
      for (const [cents, pan] of [
        [-7, 0.8],
        [0, 0.5],
        [7, 0.2],
      ]) {
        const ff = f * 2 ** (cents / 1200);
        let v = 0;
        for (let k = 1; k <= harmonics; k++)
          v += Math.sin(2 * Math.PI * ff * k * t + k) / k ** 2;
        l += v * pan;
        r += v * (1 - pan);
      }
    }
    L[i] += l * swell * 0.03;
    R[i] += r * swell * 0.03;
    send[i] += (l + r) * swell * 0.01;
  }

  const k = kick(),
    h = hat();
  for (let bar = 0; bar * BAR < FINAL; bar++) {
    const t0 = bar * BAR;
    const chord = chordAt(t0);
    // Oom: the root low on the piano, with a soft felt thump from Sunday on.
    const low = pluck(midi(chord.root), 2, 0.35, 0.998);
    addAt(L, low, t0, 0.22);
    addAt(R, low, t0, 0.22);
    if (bar >= 1) {
      addAt(L, k, t0, 0.18);
      addAt(R, k, t0, 0.18);
    }
    // Pah, pah: two chord notes on beats two and three, a little apart in the stereo field.
    if (bar >= 1) {
      for (const beat of [1, 2]) {
        const [a, b] =
          beat === 1
            ? [chord.notes[0], chord.notes[2]]
            : [chord.notes[1], chord.notes[3]];
        const pa = pluck(midi(a), 1.2, 0.4),
          pb = pluck(midi(b), 1.2, 0.4);
        addAt(L, pa, t0 + beat * BEAT, 0.1);
        addAt(R, pb, t0 + beat * BEAT, 0.1);
        addAt(send, pa, t0 + beat * BEAT, 0.06);
      }
    }
    // A bell on the downbeat: the chord's top note, up an octave, every bar.
    const top = bell(midi(chord.notes[3] + 12), 2.4, 2.5);
    addAt(L, top, t0, 0.07);
    addAt(R, top, t0, 0.07);
    addAt(send, top, t0, 0.18);
    // A light shaker in eighths once the week is under way, out for Saturday.
    if (bar >= 2 && bar < 13) {
      for (let e = 0; e < 6; e++) {
        const g = e % 2 ? 0.05 : 0.03;
        addAt(L, h, t0 + (e * BEAT) / 2, g * 0.8);
        addAt(R, h, t0 + (e * BEAT) / 2, g);
      }
    }
  }

  // The intro: the strip's days arrive with a bell each, up the F chord.
  [72, 76, 77, 81, 84, 88, 89].forEach((note, d) => {
    const b = bell(midi(note), 1.8, 3);
    addAt(L, b, (4 + d * 3) / 30, 0.05);
    addAt(R, b, (4 + d * 3) / 30, 0.05);
    addAt(send, b, (4 + d * 3) / 30, 0.12);
  });

  // Home on the logo: the low F, a bell chord and a long tail.
  const home = pluck(midi(41), 3, 0.35, 0.9985);
  addAt(L, home, FINAL, 0.3);
  addAt(R, home, FINAL, 0.3);
  [77, 81, 84, 88].forEach((note, n) => {
    const b = bell(midi(note), 3, 2.5);
    addAt(L, b, FINAL + n * 0.08, 0.08);
    addAt(R, b, FINAL + n * 0.08, 0.08);
    addAt(send, b, FINAL + n * 0.08, 0.25);
  });

  const [wetL, wetR] = reverb(send, { room: 0.88, damp: 0.3 });
  for (let i = 0; i < L.length; i++) {
    L[i] += wetL[i] * 1.3;
    R[i] += wetR[i] * 1.3;
  }
  writeWav("music.wav", L, R, 0.8);
}

// ---- Sound effects ----

function whoosh() {
  const seconds = 0.7;
  const raw = buffer(seconds);
  for (let i = 0; i < raw.length; i++) {
    const t = i / SR;
    raw[i] = noise() * Math.sin(Math.PI * Math.min(1, t / 0.62)) ** 2;
  }
  const swept = biquad(
    raw,
    "bandpass",
    (i) => 250 * 18 ** Math.sin((Math.PI / 2) * Math.min(1, i / SR / 0.45)),
    1.4,
  );
  // It travels right to left, like the band.
  const L = swept.map((v, i) => v * Math.min(1, (i / SR / seconds) * 1.6));
  const R = swept.map((v, i) => v * Math.max(0, 1 - (i / SR / seconds) * 1.2));
  writeWav("whoosh.wav", L, R, 0.7);
}

function tap() {
  const out = buffer(0.09);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    out[i] =
      Math.sin(2 * Math.PI * (1500 - 500 * Math.min(1, t * 40)) * t) *
        Math.exp(-t * 70) +
      noise() * Math.exp(-t * 900) * 0.4;
  }
  writeWav("tap.wav", biquad(out, "highpass", 300), undefined, 0.8);
}

function pop() {
  const out = buffer(0.14);
  let phase = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    phase += (2 * Math.PI * (380 + 900 * Math.min(1, t / 0.05))) / SR;
    out[i] = Math.sin(phase) * Math.exp(-t * 38) * Math.min(1, t * 2000);
  }
  writeWav("pop.wav", out, undefined, 0.75);
}

function tick() {
  const out = buffer(0.04);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    out[i] = Math.sin(2 * Math.PI * 2600 * t) * Math.exp(-t * 160);
  }
  writeWav("tick.wav", out, undefined, 0.6);
}

function ding() {
  const a = bell(midi(86), 1.6, 2),
    b = bell(midi(93), 1.6, 2);
  const out = a.map((v, i) => v + b[i] * 0.6);
  const [wl, wr] = reverb(out, { room: 0.8 });
  writeWav(
    "ding.wav",
    out.map((v, i) => v + wl[i] * 2),
    out.map((v, i) => v + wr[i] * 2),
    0.8,
  );
}

function ring() {
  // Two soft rings, each a warble between two tones.
  const out = buffer(1.6);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const on =
      (t < 0.5 ? Math.sin((Math.PI * t) / 0.5) : 0) +
      (t > 0.7 && t < 1.2 ? Math.sin((Math.PI * (t - 0.7)) / 0.5) : 0);
    const f = Math.sin(2 * Math.PI * 18 * t) > 0 ? midi(81) : midi(85);
    out[i] = Math.sin(2 * Math.PI * f * t) * on * 0.6;
  }
  const [wl, wr] = reverb(out, { room: 0.7 });
  writeWav(
    "ring.wav",
    out.map((v, i) => v + wl[i]),
    out.map((v, i) => v + wr[i]),
    0.7,
  );
}

function bloom() {
  // The logo landing: a low swell, a soft hit and a shimmer.
  const out = buffer(2.4);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    out[i] =
      Math.sin(2 * Math.PI * midi(38) * t) * Math.exp(-t * 2.4) * 0.8 +
      Math.sin(2 * Math.PI * midi(50) * t) * Math.exp(-t * 3) * 0.3;
  }
  const shimmer = bell(midi(93), 2.4, 1.5);
  const mix = out.map((v, i) => v + shimmer[i] * 0.25);
  const [wl, wr] = reverb(mix, { room: 0.9, damp: 0.2 });
  writeWav(
    "bloom.wav",
    mix.map((v, i) => v + wl[i] * 1.5),
    mix.map((v, i) => v + wr[i] * 1.5),
    0.85,
  );
}

function toggle() {
  // A theme switch: two close clicks, the second higher.
  const out = buffer(0.12);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    out[i] =
      Math.sin(2 * Math.PI * 1100 * t) * Math.exp(-t * 120) +
      (t > 0.045
        ? Math.sin(2 * Math.PI * 1700 * (t - 0.045)) *
          Math.exp(-(t - 0.045) * 120)
        : 0);
  }
  writeWav("toggle.wav", out, undefined, 0.7);
}

music();
whoosh();
tap();
pop();
tick();
ding();
ring();
bloom();
toggle();
