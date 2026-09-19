"use client";

let audioCtx: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}

function tone(
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.12,
) {
  const ac = ctx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + start);
  g.gain.setValueAtTime(0, ac.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, ac.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + duration + 0.05);
}

export function playBlip() {
  tone(660, 0, 0.07, "triangle", 0.08);
}

export function playSelect() {
  tone(520, 0, 0.06, "sine", 0.1);
  tone(780, 0.06, 0.08, "sine", 0.1);
}

export function playError() {
  tone(220, 0, 0.12, "square", 0.08);
  tone(174, 0.13, 0.18, "square", 0.08);
}

export function playBallClick() {
  tone(880, 0, 0.03, "square", 0.14);
}

export function playShake() {
  tone(170, 0, 0.16, "square", 0.16);
  playBallClick();
}

export function playCaptureSuccess() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((f, i) => tone(f, i * 0.12, 0.16, "triangle", 0.16));
  tone(1318.5, 0.52, 0.3, "triangle", 0.14);
}

export function playPowered() {
  tone(392, 0, 0.08, "sine", 0.1);
  tone(523.25, 0.08, 0.08, "sine", 0.1);
  tone(659.25, 0.16, 0.16, "sine", 0.12);
}

export function playShiny() {
  tone(1567.98, 0, 0.15, "sine", 0.1);
  tone(2093, 0.12, 0.28, "sine", 0.12);
}

export function playCry(url: string | null | undefined, fallback?: string | null): void {
  if (!url) return;
  try {
    const audio = new Audio(url);
    audio.volume = 0.6;
    if (fallback) {
      audio.addEventListener("error", () => {
        try {
          const fb = new Audio(fallback);
          fb.volume = 0.6;
          fb.play().catch(() => {});
        } catch {
          /* ignore */
        }
      });
    }
    const p = audio.play();
    if (p) p.catch(() => {});
  } catch {
    /* ignore autoplay restrictions */
  }
}