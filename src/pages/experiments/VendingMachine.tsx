"use client";
import { useEffect, useRef } from "react";

export type VendKind = "can" | "chips";
export interface VendEvent {
  row: number;
  col: number;
  kind: VendKind;
}
export interface VendingMachineProps {
  /** Start with sound on. Audio only starts after a user gesture. Default true. */
  sound?: boolean;
  /** Called when an item lands in the tray. */
  onVend?: (e: VendEvent) => void;
  /** Show the one-line instructions under the machine. Default true. */
  hint?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

type Item = SVGGElement & {
  _r?: number;
  _c?: number;
  _tray?: number;
  _busy?: number;
};
type Attrs = Record<string, string | number>;
type Task = (dt: number) => boolean | void;

/**
 * <VendingMachine />  — isometric line-drawn vending machine, no dependencies.
 *
 * Props
 *   sound    boolean   start with sound on (default true). Audio only starts after a user gesture.
 *   onVend   function  called when an item lands: ({ row, col, kind: "can" | "chips" })
 *   hint     boolean   show the one-line instructions under the machine (default true)
 *   className, style   passed to the wrapper
 *
 * Theming (set on the component or any parent):
 *   --hlv-bg      your page background (used to hide lines behind solids)
 *   --hlv-ink     main line colour      --hlv-accent  highlight colour      --hlv-dim  secondary lines
 *
 * Keyboard (when the component has focus): C or Space = coin, 1-9 = select, T = take.
 */
export default function VendingMachine({
  sound = true,
  onVend,
  hint = true,
  className = "",
  style,
}: VendingMachineProps) {
  const root = useRef<HTMLDivElement>(null);
  const onVendRef = useRef(onVend);
  onVendRef.current = onVend;

  useEffect(() => {
    const rootEl = root.current;
    if (!rootEl) return;
    const svg = rootEl.querySelector("svg") as SVGSVGElement;
    const read = rootEl.querySelector(".hlv-read") as HTMLElement;
    const sndBtn = rootEl.querySelector(".hlv-snd") as HTMLButtonElement;
    const NS = "http://www.w3.org/2000/svg";
    const el = (n: string, a: Attrs, p?: Element | null) => {
      const e = document.createElementNS(NS, n) as SVGElement;
      for (const k in a) e.setAttribute(k, String(a[k]));
      p && p.appendChild(e);
      return e;
    };
    const P = (x: number, y: number) => [60 + 0.866 * x, 120 + 0.5 * x + y],
      S = P(209, 44),
      CR = [90, 625];
    const FL = [100, 196, 292],
      BASE = FL.map((f) => f - 4),
      CX = [37, 86, 135],
      TRAY = 380;
    svg.innerHTML = `<g class="M">
<g transform="matrix(.866 -.5 0 1 285 250)"><rect class="s" width="120" height="400" rx="8"/><path class="dim" d="M26 90h68M26 102h68M26 114h68M26 126h68M14 20v360"/></g>
<path class="s" d="M60 120L285 250L389 190L164 60Z"/><path class="dim" d="M79.7 124.2L277.7 238.6L369.3 185.8L171.3 71.4Z"/>
<g transform="matrix(.866 .5 0 1 60 120)">
<rect class="s" width="260" height="400" rx="10"/>
<rect class="s" x="12" y="12" width="148" height="290" rx="10"/>
<path d="M16 100H156M16 196H156M16 292H156"/>
<g class="coils"></g><g class="shelf"></g>
<path class="dim" d="M132 26l-26 40M144 26l-26 40M132 74l-14 22"/>
<rect class="s" x="170" y="12" width="78" height="290" rx="10"/>
<rect class="slot hi" x="206" y="26" width="6" height="36" rx="3"/>
<circle cx="209" cy="100" r="6"/><circle class="lamp dim" cx="209" cy="100" r="2.4"/>
<rect class="kp dim" x="172" y="126" width="74" height="104" rx="8"/>
<circle class="dim" cx="209" cy="262" r="11"/><path class="dim" d="M190 282h38M190 289h38M190 296h38"/>
<g class="btns"></g>
<rect class="s dim" x="12" y="316" width="148" height="72" rx="8"/><path class="dim" d="M22 323h128"/>
<g class="trayL"></g></g></g>
<g transform="translate(${CR[0]} ${CR[1]}) matrix(.866 .5 0 1 0 0)"><circle class="dim" r="21" stroke-dasharray="2 5"/></g>
<g class="coin"><g class="cs"><circle class="s" r="15"/><circle class="dim" r="10"/><circle r="2.2"/></g><circle class="hit" r="28"/></g>`;
    const $ = (c: string) => svg.querySelector("." + c) as SVGElement;
    const M = $("M"),
      coinG = $("coin"),
      cs = $("cs"),
      slot = $("slot"),
      lamp = $("lamp"),
      kp = $("kp");

    // ---------- sound ----------
    let AC: AudioContext | undefined,
      muted = !sound,
      disposed = false;
    const ac = (): AudioContext => {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      AC = AC || new Ctor();
      AC!.state === "suspended" && AC!.resume();
      return AC!;
    };
    function tone(
      f: number,
      d: number,
      ty: OscillatorType = "sine",
      g = 0.2,
      f2?: number,
      dl = 0,
    ) {
      if (muted) return;
      const a = ac(),
        t = a.currentTime + dl,
        o = a.createOscillator(),
        v = a.createGain();
      o.type = ty;
      o.frequency.setValueAtTime(f, t);
      f2 && o.frequency.exponentialRampToValueAtTime(f2, t + d);
      v.gain.setValueAtTime(g, t);
      v.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(v).connect(a.destination);
      o.start(t);
      o.stop(t + d + 0.03);
    }
    function noise(
      d: number,
      ft: BiquadFilterType,
      fq: number,
      g = 0.3,
      q = 1,
      dl = 0,
    ) {
      if (muted) return;
      const a = ac(),
        n = (a.sampleRate * d) | 0,
        b = a.createBuffer(1, n, a.sampleRate),
        c = b.getChannelData(0);
      for (let i = 0; i < n; i++) c[i] = Math.random() * 2 - 1;
      const s = a.createBufferSource(),
        f = a.createBiquadFilter(),
        v = a.createGain(),
        t = a.currentTime + dl;
      s.buffer = b;
      f.type = ft;
      f.frequency.value = fq;
      f.Q.value = q;
      v.gain.setValueAtTime(g, t);
      v.gain.exponentialRampToValueAtTime(0.0001, t + d);
      s.connect(f).connect(v).connect(a.destination);
      s.start(t);
    }
    const snd = {
      coin() {
        tone(2637, 0.3, "sine", 0.14);
        tone(3520, 0.4, "sine", 0.1, 0, 0.07);
        tone(5274, 0.2, "triangle", 0.04, 0, 0.07);
      },
      drop() {
        tone(1400, 0.12, "triangle", 0.08);
        tone(900, 0.14, "triangle", 0.07, 0, 0.09);
      },
      click() {
        tone(900, 0.05, "square", 0.05, 450);
        noise(0.03, "highpass", 3000, 0.1);
      },
      buzz() {
        tone(120, 0.28, "sawtooth", 0.12);
        tone(126, 0.28, "square", 0.05);
      },
      tick(f: number) {
        tone(f, 0.07, "triangle", 0.07);
      },
      thud(v: number) {
        tone(150, 0.2, "sine", 0.55 * v, 42);
        noise(0.12, "lowpass", 500, 0.45 * v);
      },
      take() {
        noise(0.07, "highpass", 1500, 0.14);
        tone(300, 0.1, "triangle", 0.1, 520);
      },
      rattle(r: number) {
        for (let i = 0; i < 7; i++)
          r < 2
            ? noise(
                0.05,
                "bandpass",
                1500 + Math.random() * 2500,
                0.16,
                3,
                i * 0.085,
              )
            : noise(0.06, "highpass", 4500, 0.13, 1, i * 0.07);
      },
      motor(d: number) {
        if (muted) return;
        const a = ac(),
          t = a.currentTime,
          o = a.createOscillator(),
          f = a.createBiquadFilter(),
          v = a.createGain(),
          l = a.createOscillator(),
          lg = a.createGain();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(55, t);
        o.frequency.linearRampToValueAtTime(82, t + d * 0.3);
        o.frequency.linearRampToValueAtTime(60, t + d);
        f.type = "lowpass";
        f.frequency.value = 420;
        v.gain.setValueAtTime(0, t);
        v.gain.linearRampToValueAtTime(0.2, t + 0.08);
        v.gain.setValueAtTime(0.2, t + d - 0.1);
        v.gain.linearRampToValueAtTime(0, t + d);
        l.frequency.value = 16;
        lg.gain.value = 0.09;
        l.connect(lg).connect(v.gain);
        o.connect(f).connect(v).connect(a.destination);
        o.start(t);
        l.start(t);
        o.stop(t + d);
        l.stop(t + d);
        for (let i = 0; i < d / 0.07; i++)
          noise(0.02, "bandpass", 1800, 0.07, 3, i * 0.07);
      },
    };
    const setSndLabel = () => {
      sndBtn.textContent = muted ? "sound off" : "sound on";
    };
    sndBtn.onclick = () => {
      muted = !muted;
      setSndLabel();
      if (!muted) snd.click();
    };
    setSndLabel();

    // ---------- tweens ----------
    const tasks = new Set<Task>(),
      ease = (p: number) =>
        p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    const tween = (
      ms: number,
      fn: (e: number, p: number) => void,
      ez: (x: number) => number = (x) => x,
    ) =>
      new Promise<void>((res) => {
        let t = 0;
        tasks.add((dt) => {
          t += dt * 1e3;
          const p = Math.min(1, t / ms);
          fn(ez(p), p);
          if (p >= 1) {
            res();
            return true;
          }
        });
      });
    const wait = (ms: number) => tween(ms, () => {});
    let last = 0,
      raf = 0,
      restockTimer: ReturnType<typeof setTimeout> | undefined;
    const loop = (ts: number) => {
      if (disposed) return;
      const dt = Math.min(0.05, (ts - last) / 1e3 || 0);
      last = ts;
      const t = ts / 1e3;
      for (const k of tasks) if (k(dt)) tasks.delete(k);
      if (!drag && !coinBusy && !credit && !busy && coin.on) {
        setCoin(CR[0], CR[1] + Math.sin(t * 2.2) * 2.5, 1);
        slot.style.opacity = String(0.55 + 0.45 * Math.sin(t * 3));
      } else slot.style.opacity = credit ? "0.35" : "1";
      raf = requestAnimationFrame(loop);
    };

    // ---------- state ----------
    let credit = false,
      busy = false,
      coinBusy = false;
    let drag: {
      ox: number;
      oy: number;
      x0: number;
      y0: number;
      moved: number;
    } | null = null;
    const coin = { x: CR[0], y: CR[1], sx: 1, on: true };
    const slots: (Item | null)[][] = [[], [], []],
      coils: SVGElement[][] = [[], [], []],
      btns: SVGElement[][] = [[], [], []],
      tray: (Item | null)[] = [null, null, null];
    function setCoin(x: number, y: number, sx: number) {
      coin.x = x;
      coin.y = y;
      coin.sx = sx;
      coinG.setAttribute("transform", `translate(${x} ${y})`);
      cs.setAttribute("transform", `matrix(.866 .5 0 1 0 0) scale(${sx} 1)`);
    }
    const say = (t: string) => (read.textContent = t);
    const status = () =>
      say(
        credit
          ? "Choose"
          : tray.some(Boolean)
            ? "Take it from the tray"
            : "Insert a coin",
      );
    const setLamp = (on: boolean) => {
      lamp.style.fill = on ? "var(--h)" : "none";
      lamp.style.stroke = on ? "var(--h)" : "";
      kp.style.stroke = on ? "var(--h)" : "";
    };
    const shake = () =>
      tween(240, (e, p) =>
        M.setAttribute(
          "transform",
          `translate(${Math.sin(p * 32) * (1 - p) * 2.6} 0)`,
        ),
      );

    // ---------- items ----------
    function makeItem(r: number, c: number): Item {
      const g = el("g", {}, $("shelf")) as Item;
      g._r = r;
      g._c = c;
      if (r < 2) {
        const w = r ? 30 : 24,
          h = r ? 38 : 52,
          hw = w / 2,
          q = w / 4;
        el(
          "rect",
          { x: -hw, y: -h, width: w, height: h, rx: 4, class: "s" },
          g,
        );
        el("path", { d: `M${-hw} ${-h + 7}H${hw}M${-hw} -6H${hw}` }, g);
        if (c == 0) el("path", { d: `M${-hw} ${-h * 0.5}H${hw}` }, g);
        if (c == 1)
          el(
            "path",
            { d: `M${-hw} ${-h / 2}l${q} -5 ${q} 5 ${q} -5 ${q} 5` },
            g,
          );
        if (c == 2) {
          el("circle", { cy: -h / 2, r: 5 }, g);
          el("circle", { cx: 3, cy: -h + 3.5, r: 2.2 }, g);
        }
      } else {
        let d = "M-17 -56";
        for (let i = 0; i < 16; i++) d += `l2.125 ${i % 2 ? -4 : 4}`;
        el(
          "path",
          { d: "M-17 -56Q-21 -28 -16 -4H16Q21 -28 17 -56", class: "s" },
          g,
        );
        el("path", { d }, g);
        el("path", { d: "M-16.5 -9H16.5" }, g);
        if (c == 0) el("circle", { cy: -30, r: 7 }, g);
        if (c == 1) el("path", { d: "M-9 -30q4.5 -8 9 0t9 0" }, g);
        if (c == 2) el("path", { d: "M0 -39L8 -30L0 -21L-8 -30Z" }, g);
      }
      const h = el(
        "rect",
        { x: -22, y: -62, width: 44, height: 62, class: "hit" },
        g,
      );
      g.setAttribute("transform", `translate(${CX[c]} ${BASE[r]})`);
      h.onpointerdown = (e: PointerEvent) => {
        e.stopPropagation();
        g._tray != null ? take(g) : press(r, c);
      };
      h.onpointerenter = () => hv(r, c, 1, g);
      h.onpointerleave = () => hv(r, c, 0, g);
      slots[r][c] = g;
      return g;
    }
    function hv(r: number, c: number, on: number, g: Item | null) {
      if (g && (g._tray != null || slots[r][c] === g))
        g.classList.toggle("hi", !!on);
      if (!g || g._tray == null) btns[r][c].classList.toggle("hi", !!on);
    }
    const coilD = (r: number, c: number, ph: number) => {
      let d = "";
      for (let i = 0; i <= 16; i++)
        d +=
          (i ? "L" : "M") +
          (CX[c] - 17 + (i * 34) / 16).toFixed(1) +
          " " +
          (FL[r] - 2 + 2.4 * Math.sin(ph + i * 0.9)).toFixed(1);
      return d;
    };
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) {
        coils[r][c] = el(
          "path",
          { class: "dim", d: coilD(r, c, 0) },
          $("coils"),
        );
        const bx = 185 + c * 24,
          by = 148 + r * 30,
          b = el("g", {}, $("btns")),
          bt = el("g", {}, b);
        btns[r][c] = bt;
        el(
          "rect",
          { x: bx - 11, y: by - 13, width: 22, height: 26, rx: 5, class: "s" },
          bt,
        );
        const gl =
          r < 2
            ? `M${-(r ? 3.5 : 2.5) + bx} ${by - 9 + (r ? 3 : 0)}h${r ? 7 : 5}v${r ? 8 : 12}h${-(r ? 7 : 5)}Z`
            : `M${bx - 4.5} ${by - 9}h9l-1.5 11h-6Z`;
        el("path", { d: gl }, bt);
        for (let i = 0; i <= c; i++)
          el("circle", { cx: bx + (i - c / 2) * 4, cy: by + 9, r: 0.9 }, bt);
        const hit = el(
          "rect",
          { x: bx - 12, y: by - 14, width: 24, height: 28, class: "hit" },
          b,
        );
        hit.onpointerdown = (e: PointerEvent) => {
          e.stopPropagation();
          press(r, c);
        };
        hit.onpointerenter = () => hv(r, c, 1, slots[r][c]);
        hit.onpointerleave = () => hv(r, c, 0, slots[r][c]);
        makeItem(r, c);
      }

    // ---------- coin ----------
    const pt = (e: PointerEvent): [number, number] => {
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(
        svg.getScreenCTM()!.inverse(),
      );
      return [p.x, p.y];
    };
    const freeTray = (c: number) =>
      tray[c] === null ? c : tray.findIndex((x) => x === null);
    coinG.addEventListener("pointerdown", (e: PointerEvent) => {
      if (credit || busy || coinBusy) return snd.buzz();
      ac();
      e.stopPropagation();
      const [x, y] = pt(e);
      drag = { ox: coin.x - x, oy: coin.y - y, x0: x, y0: y, moved: 0 };
      svg.setPointerCapture(e.pointerId);
      coinG.classList.add("hi");
    });
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const [x, y] = pt(e);
      drag.moved = Math.max(drag.moved, Math.hypot(x - drag.x0, y - drag.y0));
      const nx = x + drag.ox,
        ny = y + drag.oy,
        d = Math.hypot(nx - S[0], ny - S[1]);
      setCoin(nx, ny, 0.45 + 0.55 * Math.min(1, d / 140));
    };
    const onUp = () => {
      if (!drag) return;
      const d = drag;
      drag = null;
      coinG.classList.remove("hi");
      if (d.moved < 6 || Math.hypot(coin.x - S[0], coin.y - S[1]) < 50)
        insert();
      else back();
    };
    async function back() {
      coinBusy = true;
      const x = coin.x,
        y = coin.y,
        s = coin.sx;
      await tween(
        300,
        (e) =>
          setCoin(x + (CR[0] - x) * e, y + (CR[1] - y) * e, s + (1 - s) * e),
        ease,
      );
      coinBusy = false;
    }
    async function insert() {
      if (credit || busy || coinBusy) return;
      if (freeTray(0) < 0) {
        snd.buzz();
        shake();
        say("Tray is full, take something first");
        back();
        return;
      }
      coinBusy = true;
      const x0 = coin.x,
        y0 = coin.y,
        s0 = coin.sx;
      await tween(
        460,
        (e, p) =>
          setCoin(
            x0 + (S[0] - x0) * e,
            y0 + (S[1] - y0) * e - Math.sin(p * Math.PI) * 28,
            s0 + (0.12 - s0) * e,
          ),
        ease,
      );
      coinG.style.display = "none";
      coin.on = false;
      snd.coin();
      await wait(240);
      snd.drop();
      credit = true;
      setLamp(true);
      coinBusy = false;
      status();
    }

    // ---------- vend ----------
    const dip = (r: number, c: number) =>
      tween(150, (e, p) =>
        btns[r][c].setAttribute(
          "transform",
          `translate(0 ${1.8 * Math.sin(p * Math.PI)})`,
        ),
      );
    function press(r: number, c: number) {
      if (drag) return;
      ac();
      if (busy || coinBusy) {
        snd.buzz();
        return;
      }
      snd.click();
      dip(r, c);
      if (!credit) {
        shake();
        snd.buzz();
        say("Insert a coin first");
        return;
      }
      if (!slots[r][c]) {
        snd.buzz();
        shake();
        say("Empty, choose another");
        return;
      }
      vend(r, c);
    }
    function fall(
      g: Item,
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      av: number,
    ) {
      return new Promise<void>((res) => {
        let y = y0,
          v = 0,
          a = 0,
          n = 0;
        tasks.add((dt) => {
          v += 1000 * dt;
          y += v * dt;
          a += av * dt;
          const f = Math.min(1, (y - y0) / (y1 - y0));
          let x = x0 + (x1 - x0) * f;
          if (y >= y1) {
            y = y1;
            x = x1;
            n++;
            snd.thud(n == 1 ? 1 : 0.35);
            a *= 0.3;
            av *= -0.3;
            v = -v * 0.3;
            if (n >= 3 || v > -70) {
              g.setAttribute("transform", `translate(${x1} ${y1})`);
              res();
              return true;
            }
          }
          g.setAttribute("transform", `translate(${x} ${y}) rotate(${a})`);
          return false;
        });
      });
    }
    async function vend(r: number, c: number) {
      busy = true;
      credit = false;
      setLamp(false);
      say("Dispensing");
      const g = slots[r][c]!,
        ts = freeTray(c);
      slots[r][c] = null;
      tray[ts] = g;
      g._tray = ts;
      g.classList.remove("hi");
      snd.motor(0.95);
      await tween(950, (e, p) => {
        coils[r][c].setAttribute("d", coilD(r, c, p * 38));
        g.setAttribute(
          "transform",
          `translate(${CX[c] + Math.sin(p * 80) * 0.8} ${BASE[r]})`,
        );
      });
      coils[r][c].setAttribute("d", coilD(r, c, 0));
      $("trayL").appendChild(g);
      snd.rattle(r);
      await fall(
        g,
        CX[c],
        BASE[r],
        CX[ts],
        TRAY - 2,
        (Math.random() < 0.5 ? -1 : 1) * (r == 2 ? 22 : 30),
      );
      busy = false;
      status();
      onVendRef.current?.({ row: r, col: c, kind: r < 2 ? "can" : "chips" });
      coin.on = true;
      coinG.style.display = "";
      setCoin(CR[0], CR[1], 1);
      coinG.setAttribute("opacity", "0");
      tween(400, (e) => coinG.setAttribute("opacity", String(e)));
      if (slots.flat().every((x) => !x))
        restockTimer = setTimeout(restock, 1300);
    }
    async function take(g: Item) {
      if (g._busy || busy) return;
      g._busy = 1;
      snd.take();
      const ts = g._tray!,
        x = CX[ts],
        y = TRAY - 2;
      await tween(
        280,
        (e) => {
          g.setAttribute("transform", `translate(${x} ${y - 34 * e})`);
          g.setAttribute("opacity", String(1 - e));
        },
        ease,
      );
      g.remove();
      tray[ts] = null;
      status();
    }
    async function restock() {
      busy = true;
      say("Restocking");
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++) {
          const g = makeItem(r, c);
          g.setAttribute("opacity", "0");
          snd.tick(330 + (r * 3 + c) * 55);
          await tween(90, (e) => g.setAttribute("opacity", String(e)));
        }
      busy = false;
      status();
    }
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "c" || k === " ") {
        e.preventDefault();
        insert();
      } else if (k === "t") {
        const g = tray.find(Boolean);
        g && take(g);
      } else if (/^[1-9]$/.test(k)) press(((+k - 1) / 3) | 0, (+k - 1) % 3);
    };
    const onFocusPtr = () => rootEl.focus({ preventScroll: true });

    svg.addEventListener("pointermove", onMove);
    svg.addEventListener("pointerup", onUp);
    svg.addEventListener("pointercancel", onUp);
    rootEl.addEventListener("keydown", onKey);
    rootEl.addEventListener("pointerdown", onFocusPtr);
    setCoin(CR[0], CR[1], 1);
    status();
    raf = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(restockTimer);
      tasks.clear();
      svg.removeEventListener("pointermove", onMove);
      svg.removeEventListener("pointerup", onUp);
      svg.removeEventListener("pointercancel", onUp);
      rootEl.removeEventListener("keydown", onKey);
      rootEl.removeEventListener("pointerdown", onFocusPtr);
      svg.innerHTML = "";
      read.textContent = "";
      AC && AC.close().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={root}
      style={style}
      tabIndex={0}
      aria-label="Vending machine. Drag the coin into the slot, choose an item, take it from the tray."
      className={`
        hlv ${className}
      `}
    >
      <style>{CSS}</style>
      <svg
        viewBox="0 0 440 700"
        role="img"
        aria-label="Isometric vending machine with a coin, a keypad and a tray"
      />
      <p
        aria-live="polite"
        className="
          hlv-read
        "
      />
      {hint && (
        <p
          className="
          hlv-means
        "
        >
          Drag the coin into the slot, press a button, take what drops.
        </p>
      )}
      <button
        type="button"
        className="
          hlv-snd
        "
      />
    </div>
  );
}

const CSS = `
.hlv{--b:var(--hlv-bg,#f4f1ea);--s:var(--hlv-ink,#1d1d1f);--h:var(--hlv-accent,#d9480f);--d:var(--hlv-dim,#9a968b);
 display:flex;flex-direction:column;align-items:center;gap:6px;color:var(--s);font:13px/1.5 ui-monospace,Menlo,Consolas,monospace;
 user-select:none;-webkit-user-select:none;outline:none;max-width:100%}
@media (prefers-color-scheme:dark){.hlv{--b:var(--hlv-bg,#121214);--s:var(--hlv-ink,#e9e6df);--h:var(--hlv-accent,#ff8a4c);--d:var(--hlv-dim,#6d6b66)}}
.hlv:focus-visible{outline:2px solid var(--h);outline-offset:6px;border-radius:8px}
.hlv svg{width:min(100%,440px);height:auto;aspect-ratio:440/700;touch-action:none;fill:none;stroke:var(--s);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;overflow:visible}
.hlv svg *{vector-effect:non-scaling-stroke}
.hlv .s{fill:var(--b)}.hlv .hi{stroke:var(--h)}.hlv .dim{stroke:var(--d)}
.hlv .hit{fill:transparent;stroke:none;pointer-events:all;cursor:pointer}
.hlv-read{margin:0;min-height:1.5em;letter-spacing:.04em}
.hlv-means{margin:0;color:var(--d);font-size:12px;text-align:center}
.hlv-snd{background:none;border:1px solid var(--d);color:var(--d);font:inherit;font-size:11px;border-radius:99px;padding:2px 10px;cursor:pointer}
`;
