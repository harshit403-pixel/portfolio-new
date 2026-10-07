import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { PAL_HARSHIT, PAL_VISITOR, type Palette, type UiState } from "./engine";

/**
 * Full-time screen: winner name, big scoreline, and both pixel characters.
 * The winner wears a crown and hops on the spot; the loser sobs.
 */

/* ------------------------------------------------------------------ */
/*  Character drawing (same sprite parts as the in-game players)       */
/* ------------------------------------------------------------------ */

const CW = 48; // logical canvas size of one character
const CH = 64;
const FLOOR = 58; // y of the feet
const S = 2; // sprite scale (the in-game sprite is 10 x 20)

const TEAR = "#7dd3fc";
const MOUTH = "#4a1410";
const CROWN = "#facc15";

type Pose = "jump" | "cry";

function drawChar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  f: 1 | -1,
  c: Palette,
  pose: Pose,
  t: number,
  crown: boolean,
) {
  let top = FLOOR - 20 * S;
  let hop = 0;
  let x = cx;
  if (pose === "jump") {
    hop = Math.round(Math.sin(Math.PI * ((t % 42) / 42)) * 11);
    top -= hop;
  } else {
    top += Math.floor(t / 7) % 2; // sob bob
    x += Math.floor(t / 4) % 2; // tremble
  }

  const R = (dx: number, dy: number, w: number, h: number, col: string) => {
    ctx.fillStyle = col;
    ctx.fillRect(f > 0 ? x + dx * S : x - (dx + w) * S, top + dy * S, w * S, h * S);
  };

  // shadow (shrinks while the winner is in the air)
  const sw = Math.max(10, 22 - hop);
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(Math.round(cx - sw / 2), FLOOR, sw, 3);

  if (pose === "jump") {
    // back arm, raised
    R(-5, 5, 2, 3, c.shirtDark);
    R(-5, 3, 2, 2, c.skin);
    // head + big grin
    R(-4, 1, 2, 5, c.hair);
    R(-3, 0, 6, 2, c.hair);
    R(-3, 2, 6, 5, c.skin);
    R(1, 4, 1, 2, c.eye);
    R(0, 6, 3, 1, MOUTH);
    // body
    R(-4, 7, 8, 6, c.shirt);
    R(-4, 10, 8, 1, c.accent);
    R(-4, 13, 8, 3, c.shorts);
    // legs: tucked while airborne
    if (hop > 2) {
      R(-3, 16, 3, 1, c.sock); R(-3, 17, 4, 2, c.boots);
      R(1, 16, 3, 1, c.sock); R(1, 17, 4, 2, c.boots);
    } else {
      R(-3, 16, 3, 2, c.sock); R(-3, 18, 4, 2, c.boots);
      R(0, 16, 3, 2, c.sock); R(1, 18, 4, 2, c.boots);
    }
    // front arm, raised
    R(3, 5, 2, 3, c.shirt);
    R(3, 3, 2, 2, c.skin);
  } else {
    const hy = 1; // head hung low
    // legs
    R(-3, 16, 3, 2, c.sock); R(-3, 18, 4, 2, c.boots);
    R(0, 16, 3, 2, c.sock); R(1, 18, 4, 2, c.boots);
    // body
    R(-4, 7, 8, 6, c.shirt);
    R(-4, 10, 8, 1, c.accent);
    R(-4, 13, 8, 3, c.shorts);
    // back arm, hanging limp
    R(-5, 9, 2, 3, c.shirtDark);
    R(-5, 12, 2, 2, c.skin);
    // head
    R(-4, 1 + hy, 2, 5, c.hair);
    R(-3, 0 + hy, 6, 2, c.hair);
    R(-3, 2 + hy, 6, 5, c.skin);
    R(0, 4 + hy, 2, 1, c.eye); // eyes squeezed shut
    R(0, 6 + hy, Math.floor(t / 8) % 2 ? 3 : 2, 1, MOUTH); // wailing mouth
    // tear streams
    for (let k = 0; k < 2; k++) {
      const y = 5 + hy + ((Math.floor(t / 2) + k * 4) % 8);
      R(k, y, 1, 1, TEAR);
    }
    // tear spray arcing off the face
    const i = Math.floor(t / 3) % 6;
    const up = i < 3 ? i : 5 - i;
    R(3 + i, 5 + hy - up, 1, 1, TEAR);
    // front arm, fist rubbing the eye
    R(3, 6, 2, 3, c.shirt);
    R(2, 4 + hy, 3, 2, c.skin);
    R(2, 4 + hy, 3, 2, "rgba(0,0,0,0.2)");
  }

  if (crown) {
    R(-3, -1, 6, 2, CROWN);
    R(-3, -3, 1, 2, CROWN);
    R(-1, -3, 2, 2, CROWN);
    R(2, -3, 1, 2, CROWN);
  }
}

function CharCanvas({ pal, face, pose, crown }: { pal: Palette; face: 1 | -1; pose: Pose; crown: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let t = reduce ? 10 : 0;
    let last = 0;

    const draw = () => {
      ctx.clearRect(0, 0, CW, CH);
      drawChar(ctx, CW / 2, face, pal, pose, t, crown);
    };
    draw();
    if (reduce) return;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 15) return; // ~60 updates a second, even on 120Hz screens
      last = now;
      t++;
      draw();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [pal, face, pose, crown]);

  return (
    <canvas
      ref={ref}
      width={CW}
      height={CH}
      className="absolute inset-0 h-full w-full select-none object-contain"
      style={{ imageRendering: "pixelated" }}
      role="img"
      aria-label={pose === "jump" ? "Winner celebrating" : "Loser crying"}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  The screen                                                         */
/* ------------------------------------------------------------------ */

export function ResultScreen({
  ui,
  h,
  onAgain,
  onClose,
}: {
  ui: UiState;
  /** height of the pitch area in px, used to scale the text */
  h: number;
  onAgain: () => void;
  onClose: () => void;
}) {
  const youWon = ui.winner === "left";
  const u = Math.max(0.72, Math.min(1.4, h / 220));
  const accent = youWon ? "#f87171" : "#60a5fa";
  const RED = "#f87171";
  const BLUE = "#60a5fa";

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center border-2 border-dashed bg-[#0a0a0a]/95 text-center"
      style={{ borderColor: accent, padding: `${6 * u}px ${10 * u}px` }}
    >
      {/* the two characters */}
      <div className="grid min-h-0 w-full flex-1 grid-cols-[1fr_auto_1fr] gap-2">
        <div className="flex min-h-0 flex-col items-center">
          <div className="relative min-h-0 w-full flex-1">
            <CharCanvas pal={PAL_VISITOR} face={1} pose={youWon ? "jump" : "cry"} crown={youWon} />
          </div>
          <p
            className="font-mono font-bold uppercase tracking-widest"
            style={{ color: RED, opacity: youWon ? 1 : 0.65, fontSize: 11 * u }}
          >
            You
          </p>
        </div>

        {/* winner name + scoreline, centred between the characters */}
        <div
          className="flex flex-col items-center justify-center self-stretch"
          style={{  gap: 7 * u }}
        >
          <h2
            className="font-mono font-bold uppercase tracking-wider"
            style={{ color: accent, fontSize: 20 * u, lineHeight: 1.15 }}
          >
            {youWon ? (
              "You win!"
            ) : (
              <>
                <span className="block sm:inline">Harshit</span> <span className="block sm:inline">wins</span>
              </>
            )}
          </h2>
          <p className="font-mono font-bold leading-none text-white" style={{ fontSize: 80 * u }}>
            <span style={{ color: RED }}>{ui.left}</span>
            <span className="text-white/50" style={{ padding: `0 ${2 * u}px` }}>:</span>
            <span style={{ color: BLUE }}>{ui.right}</span>
          </p>
        </div>

        <div className="flex min-h-0 flex-col items-center">
          <div className="relative min-h-0 w-full flex-1">
            <CharCanvas pal={PAL_HARSHIT} face={-1} pose={youWon ? "cry" : "jump"} crown={!youWon} />
          </div>
          <p
            className="font-mono font-bold uppercase tracking-widest"
            style={{ color: BLUE, opacity: youWon ? 0.65 : 1, fontSize: 11 * u }}
          >
            Harshit
          </p>
        </div>
        
      </div>

      {/* actions */}
      <div className="flex flex-wrap items-center pb-4 justify-center gap-2" >
        
        
        <button
          type="button"
          onClick={onAgain}
          className="border-2 border-dashed border-white bg-white font-mono font-bold uppercase tracking-widest text-black transition-transform hover:scale-105 active:scale-95"
          style={{ fontSize: 11 * u, padding: `${5 * u}px ${14 * u}px` }}
        >
          Play again
        </button>
        <Link
          to="/contact"
          onClick={onClose}
          className="border-2 border-dashed border-white/40 font-mono font-bold uppercase tracking-widest text-white transition-colors hover:border-white"
          style={{ fontSize: 11 * u, padding: `${5 * u}px ${14 * u}px` }}
        >
          Say hi →
        </Link>
      </div>

      
    </div>
  );
}