let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let lastPlay = 0;

// Major pentatonic: any combination of notes sounds pleasant together
const SCALE = [0, 2, 4, 7, 9];
const BASE_FREQ = 261.63; // C4, lower = warmer

function buildChain(c: AudioContext) {
  // Master -> lowpass -> compressor -> output
  master = c.createGain();
  master.gain.value = 0.9;

  const lowpass = c.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 2200;
  lowpass.Q.value = 0.4;

  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -24;
  comp.ratio.value = 4;
  comp.attack.value = 0.01;
  comp.release.value = 0.25;

  master.connect(lowpass).connect(comp).connect(c.destination);

  // Soft echo for an airy, ambient tail
  const delay = c.createDelay(1);
  delay.delayTime.value = 0.24;

  const feedback = c.createGain();
  feedback.gain.value = 0.32;

  const echoTone = c.createBiquadFilter();
  echoTone.type = "lowpass";
  echoTone.frequency.value = 1500; // each repeat gets darker

  const wet = c.createGain();
  wet.gain.value = 0.35;

  master.connect(delay);
  delay.connect(echoTone).connect(feedback).connect(delay);
  echoTone.connect(wet).connect(lowpass);
}

/** Call from a click/tap so the browser allows audio. */
export function unlockAudio() {
  if (typeof window === "undefined") return;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    buildChain(ctx);
  }
  if (ctx.state === "suspended") ctx.resume();
}

/** Soft chime. Pitch is derived from the letter index. */
export function playPop(index: number) {
  if (!ctx || !master || ctx.state !== "running") return;

  const now = ctx.currentTime;
  if (now - lastPlay < 0.07) return; // keep fast sweeps from getting busy
  lastPlay = now;

  const semitones =
    SCALE[index % SCALE.length] + 12 * (Math.floor(index / SCALE.length) % 2);
  const freq = BASE_FREQ * Math.pow(2, semitones / 12);

  const peak = 0.045;
  const attack = 0.03;
  const decay = 1.2;

  const voice = ctx.createGain();
  voice.gain.setValueAtTime(0.0001, now);
  voice.gain.linearRampToValueAtTime(peak, now + attack); // soft fade-in, no click
  voice.gain.exponentialRampToValueAtTime(0.0001, now + decay);
  voice.connect(master);

  // Fundamental
  const osc1 = ctx.createOscillator();
  osc1.type = "sine";
  osc1.frequency.value = freq;

  // Quiet octave overtone with slight detune: glassy shimmer
  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = freq * 2;
  osc2.detune.value = 4;
  const overtone = ctx.createGain();
  overtone.gain.value = 0.18;

  osc1.connect(voice);
  osc2.connect(overtone).connect(voice);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + decay + 0.05);
  osc2.stop(now + decay + 0.05);
}