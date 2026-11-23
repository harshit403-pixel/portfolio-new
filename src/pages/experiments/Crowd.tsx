import { useEffect, useRef, useState } from "react";

/* ───────────────────────── types ───────────────────────── */

type FaceKey = "smile" | "angry" | "sad";
type ShapeKey = "scatter" | "custom" | FaceKey;
type Pt = [number, number];

interface Person {
  x: number; y: number; vx: number; vy: number;
  tx: number | null; ty: number | null;
  c: string; s: number; ph: number;
  sp: number; sp2: number;
  delay: number; gait: number; dir: 1 | -1; walk: number; a: number;
}

interface Track { x1: number; y1: number; x2: number; y2: number; l: number }

interface Car {
  x: number; y: number; r: number; a: number; vis: boolean;
  last: Pt[] | null; tr: Track[];
}

interface Engine {
  form: (key: ShapeKey, word: string) => void;
  destroy: () => void;
}

/* ───────────────────────── constants ───────────────────────── */

const COLORS = [
  "#e8a21c", "#e8a21c", "#e2581e", "#d9362b", "#2f8f5b",
  "#1f7a52", "#6a3d9a", "#2a6fb8", "#f0c419", "#e0608e",
];
const HEAD = "#3a2a22";
const BUTTONS: { key: ShapeKey; label: string }[] = [
  { key: "scatter", label: "Scatter" },
  { key: "smile", label: "Smile" },
  { key: "angry", label: "Angry" },
  { key: "sad", label: "Sad" },
];

/* ───────────────────────── shape drawing (used to sample target points) ───────────────────────── */

type Ctx = CanvasRenderingContext2D;

function drawFace(g: Ctx, w: number, h: number, mood: FaceKey) {
  g.fillStyle = "#000";
  g.strokeStyle = "#000";
  g.lineCap = "round";
  const R = Math.min(w, h) * 0.42, cx = w / 2, cy = h / 2;
  g.lineWidth = R * 0.1;
  g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();

  if (mood === "smile") {
    g.beginPath();
    g.arc(cx - R * 0.35, cy - R * 0.2, R * 0.1, 0, 7);
    g.arc(cx + R * 0.35, cy - R * 0.2, R * 0.1, 0, 7);
    g.fill();
    g.lineWidth = R * 0.12;
    g.beginPath(); g.arc(cx, cy + R * 0.02, R * 0.55, 0.2, Math.PI - 0.2); g.stroke();
    return;
  }

  g.beginPath();
  g.arc(cx - R * 0.35, cy - R * 0.05, R * 0.1, 0, 7);
  g.arc(cx + R * 0.35, cy - R * 0.05, R * 0.1, 0, 7);
  g.fill();

  g.lineWidth = R * 0.1;
  g.beginPath();
  if (mood === "angry") {
    g.moveTo(cx - R * 0.62, cy - R * 0.5); g.lineTo(cx - R * 0.12, cy - R * 0.25);
    g.moveTo(cx + R * 0.62, cy - R * 0.5); g.lineTo(cx + R * 0.12, cy - R * 0.25);
  } else {
    g.moveTo(cx - R * 0.62, cy - R * 0.22); g.lineTo(cx - R * 0.12, cy - R * 0.45);
    g.moveTo(cx + R * 0.62, cy - R * 0.22); g.lineTo(cx + R * 0.12, cy - R * 0.45);
  }
  g.stroke();

  g.lineWidth = R * 0.12;
  g.beginPath(); g.arc(cx, cy + R * 0.6, R * 0.38, Math.PI + 0.3, 2 * Math.PI - 0.3); g.stroke();

  if (mood === "sad") {
    g.beginPath(); g.ellipse(cx - R * 0.42, cy + R * 0.3, R * 0.07, R * 0.12, 0, 0, 7); g.fill();
  }
}

function drawWord(g: Ctx, w: number, h: number, text: string) {
  const t = text.toUpperCase().slice(0, 14);
  g.fillStyle = "#000";
  g.textAlign = "center";
  g.textBaseline = "middle";
  let s = h * 0.5;
  g.font = `900 ${s}px Arial Black,Arial,sans-serif`;
  const m = g.measureText(t).width;
  if (m > w * 0.9) s *= (w * 0.9) / m;
  g.font = `900 ${s}px Arial Black,Arial,sans-serif`;
  g.fillText(t, w / 2, h / 2);
}

/* ───────────────────────── engine (canvas animation, no React state) ───────────────────────── */

function createEngine(cv: HTMLCanvasElement): Engine {
  const ctx = cv.getContext("2d")!;
  const people: Person[] = [];
  const mouse = { x: -999, y: -999 };
  const car: Car = { x: -999, y: -999, r: 14, a: 0, vis: false, last: null, tr: [] };
  let W = 0, H = 0, T = 0, raf = 0;
  let mode: ShapeKey = "scatter";
  let word = "";

  const makePerson = (): Person => ({
    x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, tx: null, ty: null,
    c: COLORS[(Math.random() * COLORS.length) | 0],
    s: 0.85 + Math.random() * 0.3, ph: Math.random() * 9,
    sp: 0.25 + Math.random() * 0.3, sp2: 0.8 + Math.random() * 0.5,
    delay: 0, gait: Math.random() * 6, dir: 1, walk: 0, a: Math.random() * 6.3,
  });

  /* ---- layout: turn the chosen shape into target points and assign walkers ---- */
  function layout() {
    if (mode === "scatter") { people.forEach((p) => { p.tx = p.ty = null; }); return; }
    const w = Math.round(W), h = Math.round(H);
    if (!w || !h) return;

    const off = document.createElement("canvas");
    off.width = w; off.height = h;
    const g = off.getContext("2d", { willReadFrequently: true })!;
    if (mode === "custom") drawWord(g, w, h, word.trim() || "HI");
    else drawFace(g, w, h, mode);

    const d = g.getImageData(0, 0, w, h).data;
    let n = 0;
    for (let i = 3; i < d.length; i += 16) if (d[i] > 128) n++;
    const area = n * 4;
    const use = Math.floor(people.length * 0.86);
    const step = Math.max(4, Math.sqrt(area / use));

    const pts: Pt[] = [];
    for (let y = step / 2; y < h; y += step)
      for (let x = step / 2 + (((y / step) | 0) % 2) * (step / 2); x < w; x += step)
        if (d[(((y | 0) * w) + (x | 0)) * 4 + 3] > 128) pts.push([x, y]);

    for (let i = pts.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [pts[i], pts[j]] = [pts[j], pts[i]];
    }

    const k = Math.min(use, pts.length);
    const shuffled = people.map((_, i) => i).sort(() => Math.random() - 0.5);
    // sort both sides by x so walkers cross each other less
    const chosen = shuffled.slice(0, k).map((i) => people[i]).sort((a, b) => a.x - b.x);
    const targets = pts.slice(0, k).sort((a, b) => a[0] - b[0]);
    chosen.forEach((p, i) => {
      p.tx = targets[i][0]; p.ty = targets[i][1];
      p.delay = (Math.random() * 30) | 0;
    });
    const set = new Set(chosen);
    people.forEach((p) => { if (!set.has(p)) p.tx = p.ty = null; });
  }

  function resize() {
    const r = cv.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(430, Math.max(200, (W * H) / 1300)));
    while (people.length < n) people.push(makePerson());
    people.length = n;
    layout();
  }

  /* ---- drawing ---- */
  function drawPerson(p: Person) {
    const s = p.s * Math.max(0.8, Math.min(1.25, W / 760)) * 1.1;
    const mv = p.walk > 0.12, f = p.dir;
    const sw = mv ? Math.sin(p.gait) : 0;
    const b = mv ? -Math.abs(Math.cos(p.gait)) * 1.1 * s : 0;
    const x = p.x + (mv ? Math.cos(p.gait) * 0.5 * s : 0), y = p.y;

    ctx.fillStyle = "rgba(60,45,30,.16)";
    ctx.beginPath(); ctx.ellipse(p.x - 2 * s, y + 7.4 * s, 6 * s, 1.8 * s, 0, 0, 7); ctx.fill();

    ctx.strokeStyle = p.c; ctx.lineWidth = 1.7 * s; ctx.lineCap = "round";
    for (const k of [-1, 1]) {
      const ph = sw * k, lift = Math.max(0, ph) * 1.8 * s;
      ctx.beginPath();
      ctx.moveTo(x + k * 1.1 * s, y + 3.5 * s + b);
      ctx.lineTo(x + k * 1.1 * s + f * ph * 2.2 * s, y + 7 * s - lift);
      ctx.stroke();
    }
    ctx.fillStyle = p.c;
    ctx.beginPath(); ctx.roundRect(x - 2.6 * s, y - 2.5 * s + b, 5.2 * s, 7 * s, 2 * s); ctx.fill();
    ctx.fillStyle = HEAD;
    ctx.beginPath(); ctx.arc(x, y - 4.6 * s + b, 2.2 * s, 0, 7); ctx.fill();
  }

  function wheels(): Pt[] {
    const c = Math.cos(car.a), s = Math.sin(car.a);
    const h = car.r * 1.3 * 0.62, w = car.r * 0.7 * 0.95;
    return ([[h, w], [h, -w], [-h, w], [-h, -w]] as Pt[]).map(([lx, ly]) => [
      car.x + lx * c - ly * s,
      car.y + lx * s + ly * c,
    ] as Pt);
  }

  function carStep(dx: number, dy: number) {
    const sp = Math.hypot(dx, dy);
    if (sp > 0.5) {
      const d = ((Math.atan2(dy, dx) - car.a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      car.a += d * 0.18;
      const ws = wheels();
      if (car.last) {
        // only the two rear wheels leave marks
        ws.forEach((q, i) => {
          if (i > 1) car.tr.push({ x1: car.last![i][0], y1: car.last![i][1], x2: q[0], y2: q[1], l: 1 });
        });
      }
      car.last = ws;
    } else car.last = null;
  }

  function drawTracks() {
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(1.2, car.r * 0.15);
    for (let i = car.tr.length - 1; i >= 0; i--) {
      const t = car.tr[i];
      t.l -= 0.009;
      if (t.l <= 0) { car.tr.splice(i, 1); continue; }
      ctx.strokeStyle = `rgba(50,44,38,${0.2 * Math.min(1, t.l * 1.6)})`;
      ctx.beginPath(); ctx.moveTo(t.x1, t.y1); ctx.lineTo(t.x2, t.y2); ctx.stroke();
    }
  }

  function drawCar() {
    if (!car.vis) return;
    const r = car.r, L = r * 1.3, Wd = r * 0.7;
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.a);
    ctx.fillStyle = "rgba(50,40,30,.2)";
    ctx.beginPath(); ctx.roundRect(-L + r * 0.15, -Wd + r * 0.25, L * 2, Wd * 2, r * 0.5); ctx.fill();
    ctx.fillStyle = "#1b1917";
    for (const [x, y] of [[0.62, 1], [0.62, -1], [-0.62, 1], [-0.62, -1]])
      ctx.fillRect(x * L - r * 0.3, y * Wd * 0.95 - r * 0.13, r * 0.6, r * 0.26);
    ctx.fillStyle = "#d9362b";
    ctx.beginPath(); ctx.roundRect(-L, -Wd, L * 2, Wd * 2, r * 0.5); ctx.fill();
    ctx.fillStyle = "#b32a21";
    ctx.beginPath(); ctx.roundRect(-L * 0.35, -Wd * 0.72, L * 0.8, Wd * 1.44, r * 0.3); ctx.fill();
    ctx.fillStyle = "#2d3a4a";
    ctx.beginPath(); ctx.roundRect(L * 0.22, -Wd * 0.62, L * 0.28, Wd * 1.24, r * 0.12); ctx.fill();
    ctx.beginPath(); ctx.roundRect(-L * 0.56, -Wd * 0.58, L * 0.16, Wd * 1.16, r * 0.1); ctx.fill();
    ctx.fillStyle = "#ffe27a";
    ctx.fillRect(L - r * 0.16, -Wd * 0.82, r * 0.16, r * 0.3);
    ctx.fillRect(L - r * 0.16, Wd * 0.82 - r * 0.3, r * 0.16, r * 0.3);
    ctx.fillStyle = "#7a1710";
    ctx.fillRect(-L, -Wd * 0.82, r * 0.12, r * 0.3);
    ctx.fillRect(-L, Wd * 0.82 - r * 0.3, r * 0.12, r * 0.3);
    ctx.restore();
  }

  /* ---- main loop ---- */
  function frame() {
    T++;
    ctx.clearRect(0, 0, W, H);

    // car follows the pointer with a slight lag
    car.r = Math.max(11, Math.min(20, W / 40));
    if (mouse.x > -900) {
      if (!car.vis) { car.x = mouse.x; car.y = mouse.y; car.vis = true; }
      const ox = car.x, oy = car.y;
      car.x += (mouse.x - car.x) * 0.14;
      car.y += (mouse.y - car.y) * 0.14;
      carStep(car.x - ox, car.y - oy);
    } else { car.vis = false; car.last = null; }

    for (const p of people) {
      if (p.tx !== null && p.ty !== null) {
        if (p.delay > 0) { p.delay--; p.vx *= 0.8; p.vy *= 0.8; }
        else {
          const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
          if (d > 2.5) {
            const sp = Math.min(p.sp2 * 1.7, d * 0.08 + 0.25);
            p.vx += ((dx / d) * sp - p.vx) * 0.1;
            p.vy += ((dy / d) * sp - p.vy) * 0.1;
          } else { p.x += dx * 0.25; p.y += dy * 0.25; p.vx *= 0.6; p.vy *= 0.6; }
        }
      } else {
        // idle wandering with pauses
        p.a += (Math.random() - 0.5) * 0.12;
        const wk = Math.sin(T * 0.006 + p.ph) > 0.2 ? p.sp * 1.5 : 0;
        p.vx += (Math.cos(p.a) * wk - p.vx) * 0.08;
        p.vy += (Math.sin(p.a) * wk - p.vy) * 0.08;
        if (p.x < 10) p.a = 0;
        if (p.x > W - 10) p.a = Math.PI;
        if (p.y < 14) p.a = Math.PI / 2;
        if (p.y > H - 12) p.a = -Math.PI / 2;
      }

      // the car pushes people out of its way
      const mx = p.x - car.x, my = p.y - car.y, md = Math.hypot(mx, my), R = car.r + 30;
      if (car.vis && md < R) {
        const f = ((R - md) / R) * 3;
        p.vx += (mx / (md || 1)) * f; p.vy += (my / (md || 1)) * f;
      }

      p.x += p.vx; p.y += p.vy;
      const sv = Math.hypot(p.vx, p.vy);
      p.walk = sv;
      if (sv > 0.12) {
        p.gait += sv * 0.2;
        if (Math.abs(p.vx) > 0.08) p.dir = p.vx > 0 ? 1 : -1;
      }
    }

    drawTracks();
    [...people].sort((a, b) => a.y - b.y).forEach(drawPerson);
    drawCar();
    raf = requestAnimationFrame(frame);
  }

  /* ---- pointer input ---- */
  const pos = (e: PointerEvent) => {
    const r = cv.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  };
  const leave = () => { mouse.x = mouse.y = -999; };
  const up = (e: PointerEvent) => { if (e.pointerType !== "mouse") leave(); };
  cv.addEventListener("pointermove", pos);
  cv.addEventListener("pointerdown", pos);
  cv.addEventListener("pointerleave", leave);
  cv.addEventListener("pointerup", up);

  const ro = new ResizeObserver(resize);
  ro.observe(cv.parentElement ?? cv);
  resize();
  frame();

  return {
    form(key, text) { mode = key; word = text; layout(); },
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cv.removeEventListener("pointermove", pos);
      cv.removeEventListener("pointerdown", pos);
      cv.removeEventListener("pointerleave", leave);
      cv.removeEventListener("pointerup", up);
    },
  };
}

/* ───────────────────────── component ───────────────────────── */

export default function Crowd() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useRef<Engine | null>(null);
  const [shape, setShape] = useState<ShapeKey>("scatter");
  const [text, setText] = useState("");

  // create / destroy the animation engine
  useEffect(() => {
    const e = createEngine(canvasRef.current!);
    engine.current = e;
    const t = setTimeout(() => setShape("smile"), 700); // start with a smile
    return () => { clearTimeout(t); e.destroy(); engine.current = null; };
  }, []);

  // tell the engine which shape to form
  useEffect(() => { engine.current?.form(shape, text); }, [shape, text]);

  return (
    <div className="crowd-root">
      <style>{CSS}</style>
      <header className="crowd-head">
        <h1>The crowd</h1>
        <p>Pick a shape and watch everyone find their place. Drive the car through them to scatter.</p>
      </header>

      <div className="crowd-stage">
        <canvas ref={canvasRef} className="crowd-canvas" />
      </div>

      <nav className="crowd-nav">
        {BUTTONS.map((b) => (
          <button
            key={b.key}
            type="button"
            className={shape === b.key ? "on" : ""}
            onClick={() => setShape(b.key)}
          >
            {b.label}
          </button>
        ))}
        <input
          value={text}
          maxLength={14}
          placeholder="Type a word"
          aria-label="Type a word"
          onChange={(e) => {
            setText(e.target.value);
            if (e.target.value.trim()) setShape("custom");
          }}
        />
      </nav>
    </div>
  );
}

const CSS = `
.crowd-root{--ink:#2b2a28;--mute:#8a867f;--line:#e6e3de;
  height:100%;min-height:480px;display:flex;flex-direction:column;overflow:hidden;
  background:#fff;color:var(--ink);font-family:"Nunito","Trebuchet MS",system-ui,sans-serif;box-sizing:border-box}
.crowd-root *{box-sizing:border-box}
.crowd-head{padding:14px 18px 6px;text-align:center}
.crowd-head h1{font-size:15px;font-weight:700;margin:0;letter-spacing:.2px}
.crowd-head p{margin:2px 0 0;font-size:12.5px;color:var(--mute)}
.crowd-stage{flex:1;min-height:0;position:relative}
.crowd-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:none}
.crowd-nav{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;padding:10px 12px 16px}
.crowd-nav button,.crowd-nav input{font:inherit;font-size:13px;color:var(--ink);background:#fff;border:1px solid var(--line);
  border-radius:999px;padding:8px 15px;cursor:pointer;transition:background .15s,border-color .15s}
.crowd-nav button:hover{background:#f6f4f1}
.crowd-nav button.on{background:var(--ink);color:#fff;border-color:var(--ink)}
.crowd-nav button:focus-visible,.crowd-nav input:focus-visible{outline:2px solid #3b7dd8;outline-offset:2px}
.crowd-nav input{cursor:text;width:150px}
`;
