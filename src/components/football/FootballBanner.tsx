import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Volume2, VolumeX, X } from "lucide-react";
import { sound } from "./Sound";
import { ResultScreen } from "./ResultScreen";
import {
  FootballGame,
  WIN_SCORE,
  emptyControls,
  type Controls,
  type SfxName,
  type UiState,
} from "./engine";

/* ================================================================== */
/*  PixelPitch — the canvas + game loop. Used by the banner AND modal  */
/* ================================================================== */

const STEP_MS = 1000 / 60;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

type PitchProps = {
  /** demo = bot vs bot, auto-restarting, no input */
  demo?: boolean;
  getControls?: () => Controls;
  onUi?: (u: UiState) => void;
  onSfx?: (e: SfxName, v: number) => void;
  gameRef?: React.MutableRefObject<FootballGame | null>;
};

function PixelPitch({ demo = false, getControls, onUi, onSfx, gameRef }: PitchProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cb = useRef({ getControls, onUi, onSfx });
  cb.current = { getControls, onUi, onSfx };

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const staticMode = demo && reduce;

    let game: FootballGame | null = null;
    let raf = 0;
    let last = 0;
    let acc = 0;
    let visible = true;
    let lastUi = "";
    const none = emptyControls();

    const build = () => {
      const r = wrap.getBoundingClientRect();
      if (r.width < 60 || r.height < 30) return;
      // Pick a small logical resolution, then let CSS scale it up (pixelated).
      const W = clamp(Math.round(r.width / 2.25), 240, 380);
      const scale = r.width / W;
      const H = Math.max(64, Math.round(r.height / scale));
      if (game) {
        const aspectOld = game.W / game.H;
        const keep = demo
          ? Math.abs(W - game.W) < 12 && Math.abs(H - game.H) < 8
          : Math.abs(W / H - aspectOld) / aspectOld < 0.12; // never restart a live match on a tiny resize
        if (keep) return;
      }
      game = new FootballGame(W, H, { demo });
      game.sfx = (e, v) => cb.current.onSfx?.(e, v);
      canvas.width = W;
      canvas.height = H;
      ctx.imageSmoothingEnabled = false;
      if (gameRef) gameRef.current = game;
      lastUi = "";
      if (staticMode) {
        for (let i = 0; i < 260; i++) game.step();
        game.render(ctx);
      }
    };

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!game || staticMode) return;
      if (!visible || document.hidden) { last = 0; return; }
      if (!last) last = t;
      acc += Math.min(100, t - last);
      last = t;
      let n = 0;
      while (acc >= STEP_MS && n < 5) {
        game.setControls(cb.current.getControls ? cb.current.getControls() : none);
        game.step();
        acc -= STEP_MS;
        n++;
      }
      if (n === 5) acc = 0;
      game.render(ctx);
      const u = game.ui();
      const key = `${u.phase}|${u.left}|${u.right}`;
      if (key !== lastUi) { lastUi = key; cb.current.onUi?.(u); }
    };

    build();
    raf = requestAnimationFrame(frame);

    let rz = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rz);
      rz = requestAnimationFrame(build);
    });
    ro.observe(wrap);

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.05 });
    io.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(rz);
      ro.disconnect();
      io.disconnect();
      if (gameRef) gameRef.current = null;
    };
  }, [demo, gameRef]);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden bg-[#09101f]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full select-none"
        style={{ imageRendering: "pixelated" }}
        // NOTE: don't use aria-hidden here — index.css hides `canvas[aria-hidden="true"]`
        // on touch devices (that rule is for the PixelCursor trail).
        role="img"
        aria-label="Pixel football match"
      />
    </div>
  );
}

/* ================================================================== */
/*  Banner (drop-in replacement for the old <img> banner)              */
/* ================================================================== */

export function FootballBanner() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openGame = () => { sound.unlock(); setOpen(true); };

  return (
    <>
      <div
        className="group relative h-36 cursor-pointer overflow-hidden border border-[var(--line)] bg-neutral-950 sm:h-44"
        onClick={openGame}
        data-cursor-label="click to play football vs me"
      >
        {/* Unmount the demo while the modal is open so we only ever run one game loop */}
        {!open && <PixelPitch demo />}

        {/* same CRT-ish overlays as the old banner */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--bg)]/40 to-transparent" />
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.05)_0,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_5px)]" />

        <button
          ref={triggerRef}
          type="button"
          onClick={(e) => { e.stopPropagation(); openGame(); }}
          className="absolute bottom-2 right-2 flex items-center gap-2 border border-white/30 bg-black/70 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-white backdrop-blur transition-colors hover:bg-white hover:text-black"
          aria-label="Play football against Harshit"
        >
          Play me
        </button>
      </div>

      <AnimatePresence>
        {open && <GameModal onClose={() => { setOpen(false); triggerRef.current?.focus(); }} />}
      </AnimatePresence>
    </>
  );
}

/* ================================================================== */
/*  Modal                                                              */
/* ================================================================== */

function useViewport() {
  const read = () => ({
    w: window.innerWidth,
    h: window.visualViewport?.height ?? window.innerHeight,
  });
  const [v, setV] = useState(read);
  useEffect(() => {
    const f = () => setV(read());
    window.addEventListener("resize", f);
    window.addEventListener("orientationchange", f);
    window.visualViewport?.addEventListener("resize", f);
    return () => {
      window.removeEventListener("resize", f);
      window.removeEventListener("orientationchange", f);
      window.visualViewport?.removeEventListener("resize", f);
    };
  }, []);
  return v;
}

function GameModal({ onClose }: { onClose: () => void }) {
  const vp = useViewport();
  const [touch] = useState(() => window.matchMedia("(pointer: coarse)").matches);
  const [ui, setUi] = useState<UiState>({ phase: "ready", left: 0, right: 0, winner: null });
  const [muted, setMuted] = useState(sound.muted);
  const toggleMute = () => {
    sound.unlock();
    const m = !muted;
    sound.setMuted(m);
    setMuted(m);
  };

  useEffect(() => {
    const unlock = () => sound.unlock();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      sound.ambience(false);
    };
  }, []);

  useEffect(() => {
    sound.ambience(ui.phase === "countdown" || ui.phase === "play" || ui.phase === "goal");
  }, [ui.phase]);
  const uiRef = useRef(ui);
  uiRef.current = ui;

  const gameRef = useRef<FootballGame | null>(null);
  const kb = useRef<Controls>(emptyControls());
  const tc = useRef<Controls>(emptyControls());
  const merged = useRef<Controls>(emptyControls());
  const getControls = useCallback(() => {
    const m = merged.current;
    m.left = kb.current.left || tc.current.left;
    m.right = kb.current.right || tc.current.right;
    m.jump = kb.current.jump || tc.current.jump;
    m.kick = kb.current.kick || tc.current.kick;
    return m;
  }, []);

  const begin = useCallback(() => {
    sound.unlock();
    const g = gameRef.current;
    if (!g) return;
    g.start();
  }, []);

  /* ---- lock page scroll while open ---- */
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  /* ---- keyboard ---- */
  useEffect(() => {
    const set = (e: KeyboardEvent, down: boolean) => {
      const k = e.key.toLowerCase();
      let hit = true;
      switch (k) {
        case "arrowleft": case "a": kb.current.left = down; break;
        case "arrowright": case "d": kb.current.right = down; break;
        case "arrowup": case "w": kb.current.jump = down; break;
        case " ": case "x": case "k": kb.current.kick = down; break;
        case "arrowdown": case "s": break;
        default: hit = false;
      }
      return hit;
    };
    const onDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      const ph = uiRef.current.phase;
      if ((ph === "ready" || ph === "over") && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        begin();
        return;
      }
      if (set(e, true)) e.preventDefault();
    };
    const onUp = (e: KeyboardEvent) => { if (set(e, false)) e.preventDefault(); };
    const clear = () => { kb.current = emptyControls(); };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", clear);
    };
  }, [begin, onClose]);

  /* ---- sizing: fit the pitch to the screen ---- */
  const portraitPhone = vp.w < 640 && vp.h >= vp.w;
  const aspect = portraitPhone ? 1.7 : 2.7;
  const sides = touch && vp.w > vp.h && vp.h < 560; // phone in landscape: controls beside the pitch
  const HEADER = 40;
  const PAD = 12;
  const sideW = sides ? 124 : 0;
  const footerH = touch ? (sides ? 0 : 150) : 36;
  const availW = vp.w - PAD * 2 - sideW * 2 - 2;
  const availH = vp.h - PAD * 2 - HEADER - footerH - 2;
  const w = Math.floor(Math.max(220, Math.min(availW, availH * aspect, 1100)));
  const h = Math.floor(w / aspect);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      style={{ touchAction: "none", padding: PAD }}
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Football mini-game"
      data-cursor-label="first to 3 wins"
    >
      <motion.div
        className="flex flex-col border border-white/15 border-dashed bg-[#0a0a0a] text-white shadow-2xl"
        style={{ width: w + sideW * 2 + 2 }}
        initial={{ opacity: 0, scale: 0.9, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* header */}
        <div className="flex items-center justify-between border-dashed border-b border-white/10 px-3" style={{ height: HEADER }}>
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">
             Football · first to {WIN_SCORE} wins
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="grid size-8 place-items-center border border-dashed border-white/20 text-white/70 transition-colors hover:bg-white hover:text-black"
              aria-label={muted ? "Unmute sound" : "Mute sound"}
              aria-pressed={muted}
            >
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              autoFocus
              className="grid size-8 place-items-center border border-dashed border-white/20 text-white/70 transition-colors hover:bg-white hover:text-black"
              aria-label="Close game"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="flex items-center justify-center">
          {sides && (
            <div className="grid place-items-center" style={{ width: sideW, height: h }}>
              <Joystick ctl={tc} size={100} />
            </div>
          )}

          <div className="relative shrink-0" style={{ width: w, height: h }}>
            <PixelPitch getControls={getControls} onUi={setUi} onSfx={sound.play} gameRef={gameRef} />

            {ui.phase === "ready" && (
              <Overlay>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">
                  <span className="text-red-400">You</span> vs <span className="text-blue-400">Harshit</span>
                </p>
                <h2 className="mt-1 font-mono text-base font-bold uppercase tracking-widest text-white sm:text-xl">
                  First to {WIN_SCORE} goals wins
                </h2>
                <button
                  type="button"
                  onClick={begin}
                  className="mt-3 border-2 border-white bg-white px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-black transition-transform hover:scale-105 active:scale-95 sm:text-sm"
                >
                  Kick off
                </button>
                {!touch && (
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-white/50">press space / enter</p>
                )}
              </Overlay>
            )}

            {ui.phase === "over" && (
              <ResultScreen ui={ui} h={h} onAgain={begin} onClose={onClose} />
            )}
          </div>

          {sides && (
            <div className="grid place-items-center" style={{ width: sideW, height: h }}>
              <ActionButtons ctl={tc} compact />
            </div>
          )}
        </div>

        {/* footer */}
        {touch && !sides && (
          <div className="flex items-center justify-between px-5" style={{ height: footerH }}>
            <Joystick ctl={tc} size={112} />
            <ActionButtons ctl={tc} />
          </div>
        )}
        {!touch && (
          <div
            className="flex items-center justify-center gap-x-5 gap-y-1 border-t border-dashed border-white/10 px-3 font-mono text-[10px] uppercase tracking-widest text-white/50"
            style={{ height: footerH }}
          >
            <span><Key>← →</Key> / <Key>A D</Key> move</span>
            <span><Key>↑</Key> / <Key>W</Key> jump</span>
            <span><Key>Space</Key> / <Key>X</Key> kick</span>
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body,
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return <kbd className="border border-dashed border-white/20 bg-white/10 px-1.5 py-0.5 text-white">{children}</kbd>;
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 px-4 text-center backdrop-blur-[2px]">
      {children}
    </div>
  );
}

/* ================================================================== */
/*  Touch controls                                                     */
/* ================================================================== */

function Joystick({ ctl, size }: { ctl: React.MutableRefObject<Controls>; size: number }) {
  const base = useRef<HTMLDivElement>(null);
  const pid = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const knobSize = size * 0.42;
  const max = (size - knobSize) / 2;

  const apply = (e: React.PointerEvent) => {
    const r = base.current!.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > max) { dx = (dx / len) * max; dy = (dy / len) * max; }
    setKnob({ x: dx, y: dy });
    ctl.current.left = dx < -max * 0.3;
    ctl.current.right = dx > max * 0.3;
    ctl.current.jump = dy < -max * 0.55;
  };
  const release = () => {
    pid.current = null;
    setKnob({ x: 0, y: 0 });
    ctl.current.left = ctl.current.right = ctl.current.jump = false;
  };

  return (
    <div
      ref={base}
      className="relative shrink-0 select-none rounded-full border-2 border-white/25 bg-white/5"
      style={{ width: size, height: size, touchAction: "none" }}
      onPointerDown={(e) => {
        pid.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        apply(e);
      }}
      onPointerMove={(e) => { if (pid.current === e.pointerId) apply(e); }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onContextMenu={(e) => e.preventDefault()}
      aria-label="Move joystick: left and right to run, up to jump"
    >
      <ArrowUp size={14} className="absolute left-1/2 top-1.5 -translate-x-1/2 text-white/30" />
      <div
        className="absolute rounded-full border-2 border-white/60 bg-white/25"
        style={{
          width: knobSize,
          height: knobSize,
          left: size / 2 - knobSize / 2 + knob.x,
          top: size / 2 - knobSize / 2 + knob.y,
        }}
      />
    </div>
  );
}

function PadButton({
  label, size, onDown, onUp, children,
}: {
  label: string; size: number; onDown: () => void; onUp: () => void; children: React.ReactNode;
}) {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      className={`grid select-none place-items-center rounded-full border-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-transform ${
        on ? "scale-95 border-white bg-white/40 text-white" : "border-white/40 bg-white/10 text-white/80"
      }`}
      style={{ width: size, height: size, touchAction: "none", WebkitTouchCallout: "none" }}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setOn(true); onDown(); }}
      onPointerUp={() => { setOn(false); onUp(); }}
      onPointerCancel={() => { setOn(false); onUp(); }}
      onLostPointerCapture={() => { setOn(false); onUp(); }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
}

function ActionButtons({ ctl, compact = false }: { ctl: React.MutableRefObject<Controls>; compact?: boolean }) {
  const k = compact ? 64 : 76;
  const j = compact ? 52 : 60;
  return (
    <div className={`flex ${compact ? "flex-col-reverse items-center gap-3" : "items-end gap-4"}`}>
      <PadButton label="Jump" size={j} onDown={() => (ctl.current.jump = true)} onUp={() => (ctl.current.jump = false)}>
        Jump
      </PadButton>
      <PadButton label="Kick" size={k} onDown={() => (ctl.current.kick = true)} onUp={() => (ctl.current.kick = false)}>
        Kick
      </PadButton>
    </div>
  );
}
