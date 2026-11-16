import { useEffect, useRef, useState } from "react";
import { Sticker } from "stick-it-up";
import { useTextMorph } from "torph/react";
import { Body, Bodies, Engine, Events, World } from "matter-js";

type Thing = { name: string; cap: string };

// Order = order they are dealt around the loader ring (first one sits at the top).
const THINGS: Thing[] = [
  { name: "mark-socialnetwork", cap: "Hi, I'm Harshit" },
  { name: "luffy-hat", cap: "Building cool things" },
  { name: "peace-hand", cap: "Video editor at heart" },
  { name: "cone", cap: "MERN stack developer" },
  { name: "coffee", cap: "Fueled by late nights" },
  { name: "goo", cap: "Turning ideas into products" },
  { name: "heart", cap: "Open source enthusiast" },
  { name: "nori-headphones", cap: "Building AI agents" },
  { name: "blob-burst", cap: "Hackathons & experiments" },
  { name: "flame", cap: "Breaking things, fixing things" },
  { name: "nori-laptop", cap: "Full-stack in progress" },
  { name: "elon-visionary", cap: "Dreaming, designing, shipping" },
  { name: "sparkles", cap: "Always building something" },
  { name: "app-badge", cap: "Indie hacker mindset" },
  { name: "curious-globe", cap: "Exploring the world of tech" },
  { name: "sparkles", cap: "Made with curiosity" },
];
const WORD = "Harshit Codes";
const OWN: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MODES = ["Lens", "Pop", "Wave", "Sticker", "Burst"] as const;
const BURST = 4;
const MAX_PARTICLES = 40;
const EDGE =
  "drop-shadow(1px 0 0 #fff) drop-shadow(-1px 0 0 #fff) drop-shadow(0 1px 0 #fff) drop-shadow(0 -1px 0 #fff)";
const MIN_LOAD = 2.0,
  HOLD = 0.35,
  FLY = 0.7,
  STAG = 0.045;

type Phase = "hold" | "wait" | "fly" | "live";

// Per-letter animation state, owned by the rAF loop.
interface LetterState {
  i: number;
  ch: string;
  slot: HTMLElement;
  g: HTMLElement; // the glyph
  o: HTMLElement; // the "thing" that replaces the glyph
  a: number;
  v: number;
  th: number;
  rot: number;
  popT: number;
  stuck: number;
  tilt: number;
  ox: number;
  oy: number;
  bT: number;
  flick: number;
  scr: string;
  filt: string;
  st: Phase;
  fT: number;
  fx: number;
  fy: number;
  s0: number;
  hot: boolean; // pointer/wave is currently "on" this letter (for hover sounds)
}

interface Particle {
  body: Body;
  item: HTMLSpanElement;
}

const clamp = (x: number, a: number, b: number): number => Math.max(a, Math.min(b, x));
const sm = (x: number): number => {
  x = clamp(x, 0, 1);
  return x * x * (3 - 2 * x);
};
const rnd = (n: number): number => Math.floor(Math.random() * n);
const back = (u: number): number =>
  1 + 2.70158 * Math.pow(u - 1, 3) + 1.70158 * Math.pow(u - 1, 2);
const inOut = (u: number): number =>
  u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;

// ---- Sound effects: everything is synthesized with the Web Audio API (no asset files).
// Browsers keep audio suspended until a user gesture, so `unlock()` is called from
// pointer/key events. Sounds fired before the first gesture are silently skipped.
const PENT = [0, 2, 4, 7, 9]; // major pentatonic: any run of hover/land sounds stays pleasant
const pent = (k: number, base = 262): number =>
  base * Math.pow(2, (PENT[k % PENT.length] + 12 * Math.floor(k / PENT.length)) / 12);

type ToneOpts = {
  to?: number;
  dur: number;
  vol: number;
  type?: OscillatorType;
  delay?: number;
};
type NoiseOpts = {
  dur: number;
  vol: number;
  f0: number;
  f1: number;
  q?: number;
  type?: BiquadFilterType;
  delay?: number;
};

const createSfx = () => {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let noiseBuf: AudioBuffer | null = null;
  const stamps: Record<string, number> = {};
  const api = { muted: false };

  const gate = (key: string, ms: number) => {
    const n = performance.now();
    if (n - (stamps[key] ?? 0) < ms) return false;
    stamps[key] = n;
    return true;
  };

  const unlock = () => {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.6;
      const comp = ctx.createDynamicsCompressor(); // keeps stacked sounds from clipping
      master.connect(comp);
      comp.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") void ctx.resume();
  };

  const ready = () => !!ctx && !!master && ctx.state === "running" && !api.muted;

  const tone = (f0: number, o: ToneOpts) => {
    if (!ready()) return;
    const c = ctx!;
    const t = c.currentTime + (o.delay ?? 0);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = o.type ?? "sine";
    osc.frequency.setValueAtTime(f0, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + o.dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.vol), t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    osc.connect(g);
    g.connect(master!);
    osc.start(t);
    osc.stop(t + o.dur + 0.03);
  };

  const noise = (o: NoiseOpts) => {
    if (!ready()) return;
    const c = ctx!;
    const t = c.currentTime + (o.delay ?? 0);
    const src = c.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const f = c.createBiquadFilter();
    f.type = o.type ?? "bandpass";
    f.Q.value = o.q ?? 1;
    f.frequency.setValueAtTime(o.f0, t);
    f.frequency.exponentialRampToValueAtTime(o.f1, t + o.dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.vol), t + Math.min(0.02, o.dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    src.connect(f);
    f.connect(g);
    g.connect(master!);
    src.start(t);
    src.stop(t + o.dur + 0.05);
  };

  return Object.assign(api, {
    unlock,
    dispose() {
      void ctx?.close();
      ctx = null;
      master = null;
      noiseBuf = null;
    },
    /** loader: one rising pentatonic blip per thing dealt onto the ring */
    tick(k: number) {
      tone(pent(k, 262), { type: "triangle", dur: 0.14, vol: 0.13 });
    },
    /** hand-off: the ring things sweep into the letters */
    whoosh() {
      noise({ dur: 0.55, vol: 0.1, f0: 300, f1: 3200, q: 0.8 });
    },
    /** a letter's copy lands in its slot */
    land(i: number) {
      const f = pent(i, 330);
      tone(f * 1.4, { to: f, dur: 0.13, vol: 0.12 });
      noise({ dur: 0.03, vol: 0.03, f0: 2000, f1: 4000, type: "highpass" });
    },
    /** soft bloop when the pointer (or wave) reaches a letter */
    hover(i: number, vol = 1) {
      if (!gate("hover", 28)) return;
      const f = pent(i, 392);
      tone(f, { to: f * 1.25, dur: 0.1, vol: 0.07 * vol });
    },
    /** bubbly pop: Pop mode and keypresses */
    pop(i: number) {
      if (!gate("pop", 40)) return;
      const f = pent(i, 330);
      tone(f * 0.6, { to: f * 1.5, dur: 0.1, vol: 0.14 });
    },
    /** Sticker mode: thunk when stuck on, peel when removed */
    stick(on: boolean) {
      if (on) {
        tone(200, { to: 80, dur: 0.14, vol: 0.28 });
        noise({ dur: 0.05, vol: 0.08, f0: 3000, f1: 1500, type: "highpass" });
      } else {
        noise({ dur: 0.16, vol: 0.07, f0: 800, f1: 4000, q: 2 });
        tone(500, { to: 900, dur: 0.08, vol: 0.05 });
      }
    },
    /** Burst: a thing gets thrown out of its letter */
    throw(delay = 0) {
      noise({ dur: 0.25, vol: 0.12, f0: 1200, f1: 200, type: "lowpass", delay });
      tone(240, { to: 60, dur: 0.22, vol: 0.22, delay });
    },
    /** Burst: thrown things hitting the floor or walls (louder when faster) */
    hit(v: number) {
      if (!gate("hit", 45)) return;
      const vol = clamp(v * 0.02, 0.02, 0.18);
      tone(150 + Math.random() * 60, { to: 60, dur: 0.09, vol });
      noise({ dur: 0.04, vol: vol * 0.4, f0: 2500, f1: 1200 });
    },
    /** mode switch button / number key */
    click(i: number) {
      tone(500 + i * 110, { type: "square", dur: 0.05, vol: 0.04 });
    },
  });
};
type Sfx = ReturnType<typeof createSfx>;

const CSS = `
.hm{--bg:#fff;--fg:#000;--mut:#666;--ac:#2f4cf0;position:fixed;inset:0;background:var(--bg);color:var(--fg);overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
.hm-top{position:absolute;top:0;left:0;right:0;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:10px 14px;font:500 10px/1 "Geist Mono Local",monospace;letter-spacing:.02em;text-transform:uppercase;border-bottom:1px solid color-mix(in srgb,var(--mut) 25%,transparent)}
.hm-top b{font:500 15px "Goeist",sans-serif;letter-spacing:0;text-transform:none}
.hm-top i{font-style:normal;color:var(--ac);margin-left:14px}
.hm-top button{all:unset;cursor:pointer;background:var(--ac);color:#fff;padding:5px 9px;border-radius:3px}
.hm-top-r{display:flex;gap:6px;align-items:center}
.hm-top button.off{background:var(--mut)}
.hm-name{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:400 20vw/1 "Goeist Serif",Georgia,serif;letter-spacing:-.08em}
.hm-slot{position:relative;display:inline-block}
.hm-space{width:.28em}
.hm-glyph{display:block;will-change:transform;transform:scale(0)}
.hm-obj{position:absolute;left:50%;top:50%;font-size:.8em;line-height:1;font-family:"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif;transform:translate3d(-50%,-50%,0) scale(0);will-change:transform;pointer-events:none;letter-spacing:0}
.hm-obj svg,.hm-ri svg{width:1em;height:1em;display:block}
.hm-ring{position:absolute;inset:0;pointer-events:none}
.hm-burst-layer{position:fixed;inset:0;z-index:2;pointer-events:none;overflow:hidden}
.hm-burst-item{position:absolute;left:0;top:0;display:block;width:var(--burst-size);height:var(--burst-size);transform-origin:center;will-change:transform;pointer-events:none}
.hm-burst-item>*{width:100%;height:100%;display:block}
.hm-ri{position:absolute;left:50%;top:50%;line-height:1;font-family:"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif;transform:translate3d(-50%,-50%,0) scale(0);will-change:transform}
.hm-count{position:absolute;left:50%;top:50%;text-align:center;transform:translate(-50%,-50%);font:300 64px/1 "Goeist Serif",Georgia,serif;will-change:transform,opacity}
.hm-cap{position:absolute;font:500 11px/1 "Geist Mono Local",monospace;letter-spacing:.02em;text-transform:uppercase;background:#090909;color:#fff;padding:7px 11px;border:1px solid #090909;border-radius:6px;transform:translateX(-50%) translateY(4px) scale(.96);filter:blur(6px);opacity:0;transition:opacity .2s ease,filter .2s ease,transform .2s ease;white-space:nowrap;pointer-events:none}
.hm-cap.show{transform:translateX(-50%) translateY(0) scale(1);filter:blur(0);opacity:1}
.hm-modes{position:absolute;left:0;right:0;bottom:14px;z-index:10;display:flex;gap:6px;justify-content:center;flex-wrap:wrap;font:500 12px "Geist Mono Local",monospace}
.hm-modes button{all:unset;cursor:pointer;padding:7px 11px;border-radius:6px;background:#090909;color:#fff;border:1px solid #090909;font:500 11px/1 "Geist Mono Local",monospace;letter-spacing:.02em;text-transform:uppercase;opacity:.45}
.hm-modes button.on{opacity:1}
`;

export default function HarshitTypeMotion() {
  const nameRef = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLDivElement>(null);
  const { ref: countMorphRef, update: updateCount } = useTextMorph({
    duration: 120,
    ease: { stiffness: 220, damping: 26 },
    numbers: true,
  });
  const modeRef = useRef<number>(0);
  const stateRef = useRef<LetterState[]>([]);
  const [run, setRun] = useState<number>(0); // bumping this re-runs the whole intro from scratch
  const [muted, setMuted] = useState<boolean>(false);
  const sfxRef = useRef<Sfx | null>(null);
  if (!sfxRef.current) sfxRef.current = createSfx();

  const toggleSound = () => {
    const sfx = sfxRef.current!;
    sfx.muted = !sfx.muted;
    setMuted(sfx.muted);
  };

  const setMode = (i: number, quiet = false) => {
    modeRef.current = i;
    Array.from(barRef.current!.children).forEach((b, j) => b.classList.toggle("on", j === i));
    stateRef.current.forEach((s) => {
      s.stuck = 0;
      s.hot = false;
    });
    if (!quiet) sfxRef.current!.click(i);
  };

  // close the AudioContext only when the component goes away (not on Replay)
  useEffect(() => {
    const sfx = sfxRef.current!;
    return () => sfx.dispose();
  }, []);

  useEffect(() => {
    const sfx = sfxRef.current!;
    const nameEl = nameRef.current!,
      cap = capRef.current!,
      countEl = countRef.current!;
    const slots = Array.from(nameEl.querySelectorAll<HTMLElement>(".hm-slot"));
    const rings = Array.from(ringRef.current!.children) as HTMLElement[];
    const burstLayer = burstRef.current!;
    const particles: Particle[] = [];
    const N = rings.length;

    const paint = (s: LetterState) => {
      s.o.replaceChildren(rings[s.th].firstElementChild!.cloneNode(true));
    };
    const setThing = (s: LetterState, i: number) => {
      s.th = i;
      paint(s);
    };

    const S: LetterState[] = slots.map((slot, i) => {
      const s: LetterState = {
        i,
        ch: WORD[i],
        slot,
        g: slot.children[0] as HTMLElement,
        o: slot.children[1] as HTMLElement,
        a: 0,
        v: 0,
        th: OWN[i],
        rot: 0,
        popT: 0,
        stuck: 0,
        tilt: 0,
        ox: 0,
        oy: 0,
        bT: 0,
        flick: -1,
        scr: WORD[i],
        filt: "",
        st: "hold",
        fT: 0,
        fx: 0,
        fy: 0,
        s0: 1,
        hot: false,
      };
      paint(s);
      return s;
    });
    stateRef.current = S;

    let fs = 100,
      px = -9999,
      py = -9999,
      last = 0,
      prev = 0,
      raf = 0,
      lastCount = -1;
    const t0 = performance.now();
    const dealt: (number | undefined)[] = [];
    let tDone: number | null = null,
      handed = false;

    // fresh start (also what Replay does): clear anything the last run left behind
    rings.forEach((r) => (r.style.visibility = "visible"));
    S.forEach((s) => {
      s.g.textContent = s.ch;
      s.g.style.transform = "scale(0)";
      s.o.style.filter = "";
      s.o.style.transform = "translate3d(-50%,-50%,0) scale(0)";
    });
    cap.classList.remove("show");
    cap.style.opacity = "";
    cap.style.filter = "";
    cap.style.transform = "";
    updateCount(0);

    const fit = () => {
      fs = Math.min(innerWidth / (WORD.length * 0.62), innerHeight * 0.42);
      nameEl.style.fontSize = fs + "px";
    };
    fit();

    // ---- physics for Burst. Matter velocities are px PER STEP (not per second).
    const physics = Engine.create();
    physics.gravity.y = 1.1;
    const floor = Bodies.rectangle(0, 0, 1, 1, { isStatic: true });
    const leftWall = Bodies.rectangle(0, 0, 1, 1, { isStatic: true });
    const rightWall = Bodies.rectangle(0, 0, 1, 1, { isStatic: true });
    World.add(physics.world, [floor, leftWall, rightWall]);
    const placeWalls = () => {
      const W = innerWidth,
        H = innerHeight,
        T = 400; // thick walls: fast things can't tunnel through
      const set = (b: Body, x: number, y: number, w: number, h: number) => {
        Body.setVertices(b, Bodies.rectangle(x, y, w, h).vertices);
        Body.setPosition(b, { x, y });
      };
      set(floor, W / 2, H + T / 2, W * 3, T);
      set(leftWall, -T / 2, H / 2, T, H * 3);
      set(rightWall, W + T / 2, H / 2, T, H * 3);
    };
    placeWalls();
    const onResize = () => {
      fit();
      placeWalls();
    };

    const removeParticle = (o: Particle) => {
      World.remove(physics.world, o.body);
      o.item.remove();
    };

    const burst = () => {
      const live = S.filter((s) => s.st === "live" && s.ch !== " ").map((s) => {
        const r = s.slot.getBoundingClientRect();
        const cx = r.left + r.width / 2,
          cy = r.top + r.height / 2;
        return { s, cx, cy, dx: cx - px, dy: cy - py, d: Math.hypot(cx - px, cy - py) };
      });
      if (!live.length) return;
      // every letter near the click throws out its thing (always at least the nearest one)
      const reach = Math.max(fs * 1.8, Math.min(...live.map((o) => o.d)) + 1);
      live
        .filter((o) => o.d <= reach)
        .forEach(({ s, cx, cy, dx, dy, d }, n) => {
          const k = Math.max(0.3, 1 - d / reach);
          let ux = dx / (d || 1),
            uy = dy / (d || 1);
          if (d < 4) {
            const a = Math.random() * Math.PI * 2;
            ux = Math.cos(a);
            uy = Math.sin(a);
          }

          const item = document.createElement("span");
          item.className = "hm-burst-item";
          item.style.setProperty("--burst-size", `${fs * 0.8}px`);
          item.append(rings[s.th].firstElementChild!.cloneNode(true));
          burstLayer.append(item);

          const body = Bodies.circle(cx, cy, fs * 0.36, {
            restitution: 0.45,
            friction: 0.5,
            frictionAir: 0.01,
          });
          const u = fs / 60; // "fs px per second", converted to px per step
          Body.setVelocity(body, {
            x: ux * u * (1.5 + 2.5 * k) + (Math.random() - 0.5) * u,
            y: -u * (1.8 + 2 * Math.random()),
          });
          Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3);
          World.add(physics.world, body);
          particles.push({ body, item });
          if (particles.length > MAX_PARTICLES) removeParticle(particles.shift()!);

          sfx.throw(n * 0.03);
          s.a = 1;
          s.v = 0; // the letter is "empty" for a moment, then springs back and lands a little too big
        });
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      last = performance.now();
    };
    const onDown = (e: PointerEvent) => {
      sfx.unlock();
      onMove(e);
      if ((e.target as Element | null)?.closest(".hm-modes,.hm-top")) return;
      const mode = modeRef.current;
      if (mode === BURST) return burst();
      S.forEach((s) => {
        if (s.st !== "live" || s.ch === " ") return;
        const r = s.slot.getBoundingClientRect();
        const dx = r.left + r.width / 2 - px,
          dy = r.top + r.height / 2 - py,
          d = Math.hypot(dx, dy);
        if (mode === 3 && d < fs * 0.5) {
          s.stuck ^= 1;
          s.tilt = (Math.random() - 0.5) * 30;
          setThing(s, s.stuck ? rnd(THINGS.length) : OWN[s.i]);
          sfx.stick(!!s.stuck);
        }
      });
    };
    const onKey = (e: KeyboardEvent) => {
      sfx.unlock();
      if (e.key >= "1" && e.key <= "5") return setMode(+e.key - 1);
      const c = e.key.toUpperCase();
      if (c.length === 1)
        S.forEach((s) => {
          if (s.ch.toUpperCase() === c && s.st === "live") {
            setThing(s, (s.th + 1 + rnd(THINGS.length - 1)) % THINGS.length);
            s.popT = performance.now() + 900;
            sfx.pop(s.i);
          }
        });
    };
    const onUp = () => sfx.unlock(); // touch only counts as a gesture on release
    // thrown things hitting the floor/walls (collisions only fire while Burst is stepping the engine)
    const onHit = (e: { pairs: { bodyA: Body; bodyB: Body }[] }) => {
      let v = 0;
      e.pairs.forEach((pr) => {
        v = Math.max(v, pr.bodyA.speed, pr.bodyB.speed);
      });
      if (v > 1.2) sfx.hit(v);
    };
    Events.on(physics, "collisionStart", onHit);
    addEventListener("resize", onResize);
    addEventListener("pointermove", onMove);
    addEventListener("pointerdown", onDown);
    addEventListener("pointerup", onUp);
    addEventListener("keydown", onKey);

    const frame = (now: number) => {
      const dt = Math.min(0.033, (now - (prev || now)) / 1000);
      prev = now;
      const t = (now - t0) / 1000,
        mode = modeRef.current;

      if (mode === BURST) Engine.update(physics, dt * 1000);
      else while (particles.length) removeParticle(particles.pop()!); // leaving Burst clears the pile
      particles.forEach(({ body, item }) => {
        item.style.transform = `translate3d(${body.position.x - fs * 0.4}px,${body.position.y - fs * 0.4}px,0) rotate(${body.angle}rad)`;
      });

      // ---- loader ring: things are dealt one by one, in step with the counter
      const p = clamp(t / MIN_LOAD, 0, 1);
      if (p >= 1 && tDone === null) tDone = t;
      const base = Math.min(innerWidth, innerHeight) * 0.3,
        size = base * 0.34;
      const spin = (t * 12 * Math.PI) / 180,
        R = base * (0.62 + 0.38 * p);
      rings.forEach((el, k) => {
        if (dealt[k] == null && p * N > k) {
          dealt[k] = t;
          sfx.tick(k);
        }
        const dk = dealt[k];
        let sc = dk == null ? 0 : back(clamp((t - dk) / 0.3, 0, 1));
        if (handed && tDone !== null)
          sc *= 1 - clamp((t - (tDone + HOLD) - 0.1) / 0.4, 0, 1); // untaken things shrink away
        const ang = -Math.PI / 2 + (k / N) * Math.PI * 2 + spin;
        el.style.fontSize = size + "px";
        el.style.transform = `translate3d(calc(-50% + ${Math.cos(ang) * R}px),calc(-50% + ${Math.sin(ang) * R}px),0) scale(${Math.max(0, sc)})`;
      });
      const cu = tDone === null ? 0 : clamp((t - tDone - 0.1) / 0.3, 0, 1);
      countEl.style.opacity = String(1 - cu);
      countEl.style.transform = `translate(-50%,calc(-50% - ${cu * 24}px))`;
      const count = Math.round(p * 100);
      if (count !== lastCount) {
        lastCount = count;
        updateCount(count);
      }

      // ---- hand-off: each letter starts its copy exactly on its ring item
      if (!handed && tDone !== null && t >= tDone + HOLD) {
        handed = true;
        sfx.whoosh();
        S.forEach((s, i) => {
          const rr = rings[OWN[i]].getBoundingClientRect(),
            r = s.slot.getBoundingClientRect();
          s.fx = rr.left + rr.width / 2 - (r.left + r.width / 2);
          s.fy = rr.top + rr.height / 2 - (r.top + r.height / 2);
          s.s0 = rr.width / (fs * 0.8);
          s.fT = t + i * STAG;
          s.st = "wait";
        });
      }

      if (now - last > 3500 && S.every((s) => s.st === "live")) {
        // ghost pointer when idle
        const r = nameEl.getBoundingClientRect();
        px = r.left + r.width / 2 + Math.sin(t * 0.7) * r.width * 0.4;
        py = r.top + r.height / 2 + Math.cos(t * 1.1) * fs * 0.35;
      }

      const active = now - last <= 3500; // real pointer activity (not the idle ghost pointer)
      let best = -1,
        ba = 0.45;
      S.forEach((s, i) => {
        if (s.st !== "live") {
          let sc = 0;
          if (s.st === "wait" && t >= s.fT) {
            s.st = "fly";
            rings[OWN[i]].style.visibility = "hidden";
          }
          if (s.st === "fly") {
            const u = clamp((t - s.fT) / FLY, 0, 1),
              e = inOut(u);
            s.ox = s.fx * (1 - e);
            s.oy = s.fy * (1 - e) - Math.sin(Math.PI * u) * fs * 0.25;
            sc = s.s0 + (1 - s.s0) * e;
            if (u >= 1) {
              s.st = "live";
              s.a = 1;
              s.v = 0;
              s.ox = s.oy = 0;
              sfx.land(i);
              last = now;
            } // then the spring turns it into the letter
          }
          s.g.style.transform = "scale(0)";
          s.o.style.transform = `translate3d(calc(-50% + ${s.ox}px),calc(-50% + ${s.oy}px),0) scale(${sc})`;
          if ((s.st as Phase) !== "live") return;
        }
        const r = s.slot.getBoundingClientRect();
        const cx = r.left + r.width / 2,
          cy = r.top + r.height / 2;
        const dx = cx - px,
          dy = cy - py,
          d = Math.hypot(dx, dy);
        let tg = 0,
          lean = 0;
        const gl = s.ch;

        if (mode === 0) {
          tg = sm(1.15 - d / (fs * 1.1));
          lean = clamp(-dx / fs, -1, 1) * 22;
        } else if (mode === 1) {
          if (d < fs * 0.45 && now > s.popT) {
            s.popT = now + 900;
            setThing(s, (s.th + 1) % THINGS.length);
            if (active) sfx.pop(i);
          }
          tg = now < s.popT ? 1 : 0;
        } else if (mode === 2) {
          const dir = px > innerWidth / 2 ? 1 : -1;
          tg = Math.pow(Math.max(0, Math.sin(i * 0.9 - dir * t * 3.2)), 3);
        } else if (mode === 3) {
          tg = s.stuck ? 1 : 0;
          lean = s.tilt;
        }
        // Burst: target stays 0 — letters only "empty" when a click throws their thing out

        // hover sound on the rising edge only, so a letter doesn't retrigger while it stays hot
        const isHot = (mode === 0 || mode === 2) && tg > 0.6;
        if (isHot && !s.hot && active) sfx.hover(i, mode === 2 ? 0.5 : 1);
        s.hot = isHot;

        s.ox = 0;
        s.oy = 0;
        s.rot = lean;

        if (s.scr !== gl) {
          s.scr = gl;
          s.g.textContent = gl;
        }
        s.v += ((tg - s.a) * 240 - s.v * 19) * dt; // a little underdamped: ~8% overshoot
        s.a += s.v * dt;

        const g = clamp(1 - s.a, 0, 1.3);
        const o = mode === BURST ? 0 : Math.max(0, s.a); // in Burst the flying copy is the thing, not the slot's
        s.g.style.transform = `translate3d(0,${-s.a * fs * 0.04}px,0) scale(${g})`;
        s.o.style.transform = `translate3d(calc(-50% + ${s.ox}px),calc(-50% + ${s.oy}px),0) rotate(${s.rot}deg) scale(${o})`;
        const f = mode === 3 || s.stuck ? EDGE : "";
        if (s.filt !== f) {
          s.filt = f;
          s.o.style.filter = f;
        }
        if (o > ba && (mode < 2 || mode === 3)) {
          ba = o;
          best = i;
        }
      });

      if (best >= 0) {
        const s = S[best],
          r = s.slot.getBoundingClientRect();
        cap.textContent = THINGS[s.th].cap;
        cap.style.left = r.left + r.width / 2 + "px";
        cap.style.top = r.bottom + fs * 0.06 + "px";
        cap.classList.add("show");
        cap.style.opacity = "1";
        cap.style.filter = "blur(0)";
        cap.style.transform = "translateX(-50%) translateY(0) scale(1)";
      } else {
        cap.classList.remove("show");
        cap.style.opacity = "0";
        cap.style.filter = "blur(6px)";
        cap.style.transform = "translateX(-50%) translateY(4px) scale(.96)";
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    setMode(modeRef.current, true);
    return () => {
      cancelAnimationFrame(raf);
      while (particles.length) removeParticle(particles.pop()!);
      World.clear(physics.world, false);
      Engine.clear(physics);
      removeEventListener("resize", onResize);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      removeEventListener("keydown", onKey);
      Events.off(physics, "collisionStart", onHit);
    };
  }, [run, updateCount]);

  return (
    <div className="hm">
      <style>{CSS}</style>
      <div className="hm-top">
        <b>HS</b>
        <span>
          Type motion <i>Move over the letters</i>
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setRun((r) => r + 1);
          }}
        >
          Replay
        </button>
      </div>
      {/* React renders the text once; the rAF loop owns every transform */}
      <div className="hm-name" ref={nameRef}>
        {[...WORD].map((ch, i) => (
          <span className={`hm-slot${ch === " " ? " hm-space" : ""}`} key={i}>
            <span className="hm-glyph">{ch}</span>
            <span className="hm-obj" />
          </span>
        ))}
      </div>
      <div className="hm-ring" ref={ringRef}>
        {THINGS.map((t, i) => (
          <span className="hm-ri" key={i}>
            <Sticker name={t.name} size={100} />
          </span>
        ))}
      </div>
      <div className="hm-burst-layer" ref={burstRef} />
      <div className="hm-count" ref={countRef}>
        <span ref={countMorphRef}>0</span>
      </div>
      <div className="hm-cap" ref={capRef} />
      <div className="hm-modes" ref={barRef}>
        {MODES.map((m, i) => (
          <button
            key={m}
            className={i === 0 ? "on" : ""}
            onClick={(e) => {
              e.stopPropagation();
              setMode(i);
            }}
          >
            {i + 1} {m}
          </button>
        ))}
      </div>
    </div>
  );
}