/**
 * Football sound effects: everything is synthesized with the Web Audio API,
 * so there are no audio files to ship or load.
 *
 * Usage:
 *   sound.unlock()          // call from a click / tap / keypress (browsers require a gesture)
 *   sound.play("kick", 0.8) // name + optional volume 0..1
 *   sound.ambience(true)    // quiet crowd murmur
 *   sound.setMuted(true)
 */
import type { SfxName } from "./engine";

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

const MASTER_VOL = 0.8;
const MUTE_KEY = "football-muted";

class SoundBox {
  muted = false;

  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private amb: { src: AudioBufferSourceNode; gain: GainNode } | null = null;
  private wantAmb = false;

  constructor() {
    if (typeof window === "undefined") return;
    try {
      this.muted = localStorage.getItem(MUTE_KEY) === "1";
    } catch {
      /* storage blocked: ignore */
    }
    // stop audio when the tab is in the background
    document.addEventListener("visibilitychange", () => {
      if (!this.ctx) return;
      if (document.hidden) void this.ctx.suspend();
      else void this.ctx.resume();
    });
  }

  /** Create / resume the AudioContext. Must be called from a user gesture at least once. */
  unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : MASTER_VOL;
      this.master.connect(this.ctx.destination);

      // one second of white noise, reused by every "noisy" sound
      const len = this.ctx.sampleRate;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    if (this.wantAmb) this.startAmb();
  }

  setMuted(m: boolean) {
    this.muted = m;
    try {
      localStorage.setItem(MUTE_KEY, m ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(m ? 0 : MASTER_VOL, this.ctx.currentTime, 0.02);
    }
  }

  /* ----------------------------- building blocks ---------------------------- */

  private tone(freq: number, end: number, dur: number, type: OscillatorType, vol: number, delay = 0) {
    const c = this.ctx!;
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (end !== freq) o.frequency.exponentialRampToValueAtTime(Math.max(1, end), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(this.master!);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  private noise(
    dur: number,
    vol: number,
    type: BiquadFilterType,
    f0: number,
    f1: number,
    delay = 0,
    attack = 0.004,
  ) {
    const c = this.ctx!;
    const t = c.currentTime + delay;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    s.loop = true;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f);
    f.connect(g);
    g.connect(this.master!);
    s.start(t, Math.random() * 0.5);
    s.stop(t + dur + 0.02);
  }

  /** Referee pea-whistle: a high sine with a fast tremolo. */
  private whistle(dur: number, delay = 0) {
    const c = this.ctx!;
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    const lfo = c.createOscillator();
    const lg = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(2700, t);
    o.frequency.linearRampToValueAtTime(2900, t + dur);
    lfo.frequency.value = 38;
    lg.gain.value = 0.08;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
    g.gain.setValueAtTime(0.18, t + Math.max(0.03, dur - 0.04));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    lfo.connect(lg);
    lg.connect(g.gain);
    o.connect(g);
    g.connect(this.master!);
    o.start(t);
    lfo.start(t);
    o.stop(t + dur + 0.02);
    lfo.stop(t + dur + 0.02);
  }

  /* --------------------------------- effects -------------------------------- */

  play = (name: SfxName, v = 1) => {
    if (this.muted || !this.ctx || !this.master || this.ctx.state === "closed") return;
    const k = Math.max(0.15, Math.min(1, v));

    switch (name) {
      case "kick":
        this.noise(0.09, 0.5 * k, "lowpass", 1800, 300);
        this.tone(170, 55, 0.12, "sine", 0.55 * k);
        break;

      case "bounce":
        this.tone(140, 60, 0.1, "sine", 0.45 * k);
        this.noise(0.05, 0.12 * k, "lowpass", 600, 200);
        break;

      case "thud": // ball hits a player's head / body
        this.noise(0.07, 0.35 * k, "lowpass", 700, 200);
        this.tone(100, 50, 0.08, "sine", 0.3 * k);
        break;

      case "post": // crossbar ping
        this.tone(1250, 1180, 0.35, "triangle", 0.35 * k);
        this.tone(1880, 1800, 0.22, "sine", 0.18 * k);
        this.noise(0.03, 0.2 * k, "highpass", 3000, 3000);
        break;

      case "jump":
        this.tone(260, 520, 0.1, "square", 0.05);
        break;

      case "tick": // 3 - 2 - 1
        this.tone(660, 660, 0.1, "square", 0.07);
        break;

      case "go":
        this.whistle(0.4);
        this.tone(880, 880, 0.2, "square", 0.05);
        break;

      case "goal":
        this.noise(1.8, 0.5, "bandpass", 600, 1100, 0, 0.3); // crowd roar
        this.noise(1.3, 0.18, "highpass", 2500, 3500, 0, 0.2); // sparkle on top
        [523, 659, 784, 1047].forEach((f, i) => this.tone(f, f, 0.18, "square", 0.07, i * 0.09));
        this.tone(1047, 1047, 0.45, "triangle", 0.12, 0.36);
        break;

      case "win":
        this.whistle(0.18);
        this.whistle(0.18, 0.25);
        this.whistle(0.5, 0.5);
        this.noise(2.2, 0.45, "bandpass", 700, 1200, 0.4, 0.4);
        [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, f, 0.22, "triangle", 0.12, 0.6 + i * 0.12));
        this.tone(1047, 1047, 0.7, "triangle", 0.1, 1.25);
        this.tone(1319, 1319, 0.7, "triangle", 0.08, 1.25);
        break;

      case "lose":
        this.whistle(0.18);
        this.whistle(0.18, 0.25);
        this.whistle(0.5, 0.5);
        [392, 330, 262, 196].forEach((f, i) => this.tone(f, f * 0.97, 0.3, "triangle", 0.12, 1.1 + i * 0.24));
        break;
    }
  };

  /* -------------------------------- ambience -------------------------------- */

  /** Quiet crowd murmur under the match. Safe to call before unlock(). */
  ambience(on: boolean) {
    this.wantAmb = on;
    if (on) this.startAmb();
    else this.stopAmb();
  }

  private startAmb() {
    if (this.amb || !this.ctx || !this.master || !this.noiseBuf) return;
    const c = this.ctx;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    s.loop = true;
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 420;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.05, c.currentTime + 1);
    s.connect(f);
    f.connect(g);
    g.connect(this.master);
    s.start();
    this.amb = { src: s, gain: g };
  }

  private stopAmb() {
    if (!this.amb || !this.ctx) return;
    const { src, gain } = this.amb;
    const t = this.ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    src.stop(t + 0.45);
    this.amb = null;
  }
}

export const sound = new SoundBox();