/**
 * Pixel football engine — side-view 1v1, first to WIN_SCORE goals.
 *
 * Pure TypeScript, no React. The game runs on a tiny "logical" canvas
 * (a few hundred pixels wide) that CSS scales up with `image-rendering: pixelated`,
 * which is what gives it the chunky pixel look for free.
 *
 *   left  player = the visitor (or a bot in demo mode)
 *   right player = Harshit (always a bot)
 */

export type Controls = { left: boolean; right: boolean; jump: boolean; kick: boolean };
export type Phase = "ready" | "countdown" | "play" | "goal" | "over";
export type Side = "left" | "right";
export type SfxName = "kick" | "bounce" | "thud" | "post" | "jump" | "tick" | "go" | "goal" | "win" | "lose";
export type UiState = { phase: Phase; left: number; right: number; winner: Side | null };

export const WIN_SCORE = 3;
export const emptyControls = (): Controls => ({ left: false, right: false, jump: false, kick: false });

/* ------------------------------------------------------------------ */
/*  Tuning — change these to make the game easier / harder             */
/* ------------------------------------------------------------------ */

/** How good Harshit-bot is. Lower speed / higher react = easier. */
export const BOT = {
  speed: 0.9, // run-speed multiplier (1 = same as the visitor)
  react: 7, // frames between decisions (60 frames = 1s). Higher = slower reactions
  sloppy: 6, // random aiming error in pixels
  jumpSkill: 0.7, // 0..1 chance it bothers to go for headers
  kickChance: 0.45, // chance per frame to kick when the ball is in range
};

const PW = 10; // player hitbox width
const PH = 20; // player hitbox height
const BR = 4; // ball radius
const GRAV_P = 0.34;
const GRAV_B = 0.17;
const RUN = 1.5;
const JUMP_V = -5.1;
const KICK_VX = 5.2;
const BALL_MAX = 7.5;
const STEP_CD = 16; // frames between kicks
const CD_FRAMES = 34; // frames per countdown number
const GOAL_FRAMES = 110;

/* ------------------------------------------------------------------ */
/*  3x5 pixel font                                                     */
/* ------------------------------------------------------------------ */

const GLYPHS: Record<string, string> = {
  A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110",
  E: "111100110100111", F: "111100110100100", G: "011100101101011", H: "101101111101101",
  I: "111010010010111", J: "001001001101010", K: "101101110101101", L: "100100100100111",
  M: "101111111101101", N: "110101101101101", O: "010101101101010", P: "110101110100100",
  Q: "010101101110011", R: "110101110101101", S: "011100010001110", T: "111010010010010",
  U: "101101101101111", V: "101101101101010", W: "101101111111101", X: "101101010101101",
  Y: "101101010010010", Z: "111001010100111",
  "0": "111101101101111", "1": "010110010010111", "2": "110001010100111", "3": "110001010001110",
  "4": "101101111001001", "5": "111100110001110", "6": "011100111101111", "7": "111001010010010",
  "8": "111101111101111", "9": "111101111001110",
  "!": "010010010000010", ":": "000010000010000", "-": "000000111000000", ".": "000000000000010",
};

function textWidth(str: string, s: number) {
  return Math.max(0, str.length * 4 * s - s);
}

function drawText(
  ctx: CanvasRenderingContext2D,
  str: string,
  x: number,
  y: number,
  s: number,
  color: string,
  shadow?: string,
) {
  const pass = (ox: number, oy: number, col: string) => {
    ctx.fillStyle = col;
    let cx = x + ox;
    for (const ch of str.toUpperCase()) {
      const g = GLYPHS[ch];
      if (g) {
        for (let i = 0; i < 15; i++) {
          if (g[i] === "1") ctx.fillRect(cx + (i % 3) * s, y + oy + Math.floor(i / 3) * s, s, s);
        }
      }
      cx += 4 * s;
    }
  };
  if (shadow) pass(0, s, shadow);
  pass(0, 0, color);
}

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Palette = {
  skin: string; hair: string; shirt: string; shirtDark: string; accent: string;
  shorts: string; sock: string; boots: string; eye: string;
};

export const PAL_VISITOR: Palette = {
  skin: "#e8b48f", hair: "#3b2a20", shirt: "#ef4444", shirtDark: "#b91c1c", accent: "#ffffff",
  shorts: "#f8fafc", sock: "#ef4444", boots: "#111827", eye: "#111827",
};
export const PAL_HARSHIT: Palette = {
  skin: "#d9a07a", hair: "#15151a", shirt: "#2563eb", shirtDark: "#1d4ed8", accent: "#facc15",
  shorts: "#0f172a", sock: "#2563eb", boots: "#05070d", eye: "#facc15",
};

interface AiState { cd: number; tx: number; wantJump: boolean; }

interface Player {
  side: Side;
  x: number; y: number; vx: number; vy: number;
  facing: 1 | -1;
  onGround: boolean;
  anim: number;
  kickT: number; kickCd: number; kickHeld: boolean; kickReq: boolean;
  speedMul: number;
  pal: Palette;
  ai: AiState | null;
}

interface Ball { x: number; y: number; vx: number; vy: number; angle: number; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; }

/* ------------------------------------------------------------------ */
/*  Game                                                               */
/* ------------------------------------------------------------------ */

export class FootballGame {
  readonly W: number;
  readonly H: number;
  readonly demo: boolean;

  phase: Phase = "ready";
  score = { left: 0, right: 0 };
  winner: Side | null = null;

  private gy: number; // y of the players' feet
  private gd: number; // goal depth
  private gh: number; // goal height
  private grassTop: number;

  private ctl: Controls = emptyControls();
  private readonly none: Controls = emptyControls();
  private readonly botCtl: Controls = emptyControls();

  private left: Player;
  private right: Player;
  private ball: Ball = { x: 0, y: 0, vx: 0, vy: 0, angle: 0 };
  private particles: Particle[] = [];
  private flash = { text: "", t: 0, color: "#ffffff" };
  private t = 0; // phase timer
  private cdIndex = 0;
  private firstKickoff = true;
  private shake = 0;
  private idle = 0;
  private scorer: Side | null = null;
  private frame = 0;
  private bg: HTMLCanvasElement;
  /** Optional sound hook. Only the modal sets this, so the banner demo stays silent. */
  sfx: ((e: SfxName, vol: number) => void) | null = null;
  private sfxAt: Partial<Record<SfxName, number>> = {};

  private emit(e: SfxName, vol = 1, gap = 0) {
    if (!this.sfx) return;
    if (this.frame - (this.sfxAt[e] ?? -999) < gap) return;
    this.sfxAt[e] = this.frame;
    this.sfx(e, vol);
  }

  constructor(W: number, H: number, opts: { demo?: boolean } = {}) {
    this.W = W;
    this.H = H;
    this.demo = !!opts.demo;
    const band = clamp(Math.round(H * 0.28), 22, 46); // depth of the grass strip
    this.gy = H - Math.round(band * 0.4);
    this.gd = W < 300 ? 12 : 14;
    this.gh = Math.min(30, Math.round(H * 0.42));
    this.grassTop = H - band;

    this.left = this.makePlayer("left", PAL_VISITOR);
    this.right = this.makePlayer("right", PAL_HARSHIT);
    this.right.ai = { cd: 0, tx: W * 0.75, wantJump: false };
    if (this.demo) this.left.ai = { cd: 0, tx: W * 0.25, wantJump: false };
    this.bg = this.makeBackground();

    this.placeKickoff();
    if (this.demo) this.begin(true);
  }

  /* ---------------------------- public API ---------------------------- */

  /** Visitor input. Call once per step. */
  setControls(c: Controls) {
    this.ctl = c;
  }

  ui(): UiState {
    return { phase: this.phase, left: this.score.left, right: this.score.right, winner: this.winner };
  }

  /** Start (or restart) a match with the 3-2-1 countdown. */
  start() {
    if (this.phase === "ready" || this.phase === "over") {
      this.score.left = 0;
      this.score.right = 0;
      this.winner = null;
      this.scorer = null;
      this.flash.t = 0;
      this.firstKickoff = true;
      this.placeKickoff();
      this.begin(true);
    }
  }

  /** Back to the "press kick off" screen. */
  reset() {
    this.score.left = 0;
    this.score.right = 0;
    this.winner = null;
    this.scorer = null;
    this.phase = "ready";
    this.flash.t = 0;
    this.firstKickoff = true;
    this.placeKickoff();
  }

  /* ------------------------------ setup ------------------------------- */

  private makePlayer(side: Side, pal: Palette): Player {
    return {
      side, x: 0, y: 0, vx: 0, vy: 0, facing: side === "left" ? 1 : -1, onGround: true,
      anim: 0, kickT: 0, kickCd: 0, kickHeld: false, kickReq: false, speedMul: 1, pal, ai: null,
    };
  }

  private placeKickoff() {
    const { W, gy } = this;
    for (const p of [this.left, this.right]) {
      p.x = p.side === "left" ? W * 0.27 - PW / 2 : W * 0.73 - PW / 2;
      p.y = gy - PH;
      p.vx = 0; p.vy = 0; p.onGround = true; p.kickT = 0; p.kickCd = 0;
      p.facing = p.side === "left" ? 1 : -1;
      if (p.ai) { p.ai.cd = 0; p.ai.tx = p.x; }
    }
    this.dropBall();
  }

  private dropBall() {
    this.ball.x = this.W / 2;
    this.ball.y = Math.max(BR + 2, this.gy - 46);
    this.ball.vx = 0; this.ball.vy = 0; this.ball.angle = 0;
    this.idle = 0;
  }

  private begin(first: boolean) {
    this.phase = "countdown";
    this.t = 0;
    this.cdIndex = -1;
    this.firstKickoff = first;
  }

  /* ------------------------------ stepping ---------------------------- */

  step() {
    this.frame++;
    const { phase } = this;

    // countdown
    if (phase === "countdown") {
      const labels = this.firstKickoff ? ["3", "2", "1", "GO!"] : ["2", "1", "GO!"];
      const idx = Math.floor(this.t / CD_FRAMES);
      if (idx !== this.cdIndex && idx < labels.length) {
        this.cdIndex = idx;
        const go = labels[idx] === "GO!";
        this.emit(go ? "go" : "tick");
        this.flash = { text: labels[idx], t: go ? 36 : CD_FRAMES, color: go ? "#4ade80" : "#ffffff" };
        if (go) this.phase = "play";
      }
      this.t++;
    } else if (phase === "goal") {
      this.t++;
      if (this.t >= GOAL_FRAMES) {
        if (this.score.left >= WIN_SCORE || this.score.right >= WIN_SCORE) {
          this.phase = "over";
          this.t = 0;
          this.winner = this.score.left > this.score.right ? "left" : "right";
          if (!this.demo) this.emit(this.winner === "left" ? "win" : "lose");
          const text = this.demo ? (this.winner === "left" ? "RONALDO WINS" : "HARSHIT WINS")
            : this.winner === "left" ? "YOU WIN!" : "HARSHIT WINS";
          // in the modal the DOM overlay shows the result, so only the banner demo draws it on the canvas
          this.flash = { text, t: this.demo ? 9999 : 0, color: this.winner === "left" ? "#f87171" : "#60a5fa" };
        } else {
          this.placeKickoff();
          this.begin(false);
        }
      }
    } else if (phase === "over") {
      this.t++;
      if (this.demo && this.t > 200) {
        this.score.left = 0; this.score.right = 0; this.winner = null; this.scorer = null;
        this.flash.t = 0;
        this.placeKickoff();
        this.begin(true);
      }
    }

    const live = this.phase === "play";

    // ---- players
    this.updatePlayer(this.left, this.pickControls(this.left, this.right, live));
    this.updatePlayer(this.right, this.pickControls(this.right, this.left, live));
    this.resolveKicks();

    // ---- ball
    if (this.phase === "play" || this.phase === "goal") {
      this.stepBall();
      // alternate who collides first so neither side gets a systematic edge
      const [p1, p2] = this.frame & 1 ? [this.left, this.right] : [this.right, this.left];
      this.collidePlayer(p1);
      this.collidePlayer(p2);
      if (this.phase === "play") this.checkGoal();
    }

    // ---- idle ball safety net (resting on crossbar, wedged in a corner...)
    if (this.phase === "play") {
      const sp = Math.hypot(this.ball.vx, this.ball.vy);
      this.idle = sp < 0.12 ? this.idle + 1 : 0;
      if (this.idle > 240) this.dropBall();
    }

    // ---- cosmetics
    for (const q of this.particles) {
      q.x += q.vx; q.y += q.vy; q.vy += 0.08; q.life--;
    }
    this.particles = this.particles.filter((q) => q.life > 0 && q.y < this.H + 4);
    if (this.flash.t > 0 && this.flash.t < 9999) this.flash.t--;
    if (this.shake > 0) this.shake--;
  }

  private pickControls(me: Player, opp: Player, live: boolean): Controls {
    if (me.side === "right" || me.ai) {
      if (!live) {
        // celebrate!
        const c = this.botCtl;
        c.left = c.right = c.kick = false;
        c.jump = this.phase === "goal" && this.scorer === me.side && me.onGround && this.t % 38 === 6;
        return c;
      }
      me.speedMul = this.botSpeed(me);
      return this.think(me, opp);
    }
    if (!live) {
      const c = this.none;
      return this.phase === "goal" && this.scorer === me.side && me.onGround && this.t % 38 === 6
        ? { ...c, jump: true } : c;
    }
    return this.ctl;
  }

  private botSpeed(me: Player) {
    if (this.demo) return 0.95;
    // gentle rubber-banding: the bot eases off when it's well ahead
    const lead = this.score.right - this.score.left;
    return clamp(BOT.speed - 0.05 * Math.max(0, lead), 0.78, BOT.speed);
  }

  /* ---------------------------- player physics ------------------------ */

  private updatePlayer(p: Player, c: Controls) {
    const dir = (c.right ? 1 : 0) - (c.left ? 1 : 0);
    const target = dir * RUN * p.speedMul;
    p.vx += (target - p.vx) * (p.onGround ? 0.28 : 0.1);
    if (Math.abs(p.vx) < 0.02 && dir === 0) p.vx = 0;
    if (dir !== 0) p.facing = dir as 1 | -1;

    if (c.jump && p.onGround) {
      if (!p.ai) this.emit("jump");
      p.vy = JUMP_V;
      p.onGround = false;
    }
    p.vy += GRAV_P;
    p.x += p.vx;
    p.y += p.vy;

    const minX = this.gd + 1;
    const maxX = this.W - this.gd - 1 - PW;
    p.x = clamp(p.x, minX, maxX);
    if (p.x === minX || p.x === maxX) p.vx = 0;

    const floor = this.gy - PH;
    if (p.y >= floor) {
      p.y = floor; p.vy = 0; p.onGround = true;
    } else {
      p.onGround = false;
    }

    p.anim += Math.abs(p.vx);
    if (p.kickT > 0) p.kickT--;
    if (p.kickCd > 0) p.kickCd--;

    const isBot = !!p.ai;
    if (c.kick && (isBot || !p.kickHeld) && p.kickCd <= 0) {
      p.kickT = 12;
      p.kickCd = STEP_CD;
      p.kickReq = true; // resolved after both players have moved (see resolveKicks)
    }
    p.kickHeld = c.kick;
  }

  /** Is the ball inside this player's "foot zone"? */
  private inFoot(p: Player) {
    const b = this.ball;
    const cx = p.x + PW / 2;
    const x0 = p.facing > 0 ? cx - 3 : cx - PW / 2 - 11;
    const x1 = p.facing > 0 ? cx + PW / 2 + 11 : cx + 3;
    return b.x >= x0 && b.x <= x1 && b.y >= p.y + PH * 0.25 && b.y <= p.y + PH + 5;
  }

  /**
   * Both players may try to kick in the same frame. Applying them one after the
   * other would let whoever is processed second always win, so settle it here:
   * one kick per frame, coin-flip on contests (slightly in the human's favour).
   */
  private resolveKicks() {
    const a = this.left, b = this.right;
    const ka = a.kickReq && this.inFoot(a);
    const kb = b.kickReq && this.inFoot(b);
    a.kickReq = b.kickReq = false;
    if (ka && kb) {
      const humanOnLeft = !a.ai;
      const leftWins = Math.random() < (humanOnLeft ? 0.6 : 0.5);
      if (leftWins) this.doKick(a, !!a.ai); else this.doKick(b, !!b.ai);
    } else if (ka) this.doKick(a, !!a.ai);
    else if (kb) this.doKick(b, !!b.ai);
  }

  private doKick(p: Player, isBot: boolean) {
    if (!this.inFoot(p)) return;
    const b = this.ball;
    const aerial = b.y < this.gy - 11;
    const loft = isBot ? -(1.0 + Math.random() * 2.4) : -2.0;
    b.vx = p.facing * KICK_VX + p.vx * 0.4;
    b.vy = aerial ? loft * 0.3 : loft;
    this.idle = 0;
    this.emit("kick", Math.hypot(b.vx, b.vy) / 6);
  }

  /* ----------------------------- ball physics ------------------------- */

  private stepBall() {
    const b = this.ball;
    const { gy, W, gd, gh } = this;
    const by = gy - BR;
    const grounded = b.y >= by - 0.01 && Math.abs(b.vy) < 0.01;

    b.vy += GRAV_B;
    b.vx *= grounded ? 0.99 : 0.9985;
    const sp = Math.hypot(b.vx, b.vy);
    if (sp > BALL_MAX) { b.vx *= BALL_MAX / sp; b.vy *= BALL_MAX / sp; }
    b.x += b.vx;
    b.y += b.vy;
    b.angle += b.vx * 0.22;

    // ground
    if (b.y >= by) {
      b.y = by;
      if (b.vy > 0) {
        if (b.vy > 1.2) this.emit("bounce", b.vy / 5, 6);
        b.vy = -b.vy * 0.66;
        if (Math.abs(b.vy) < 0.8) b.vy = 0;
        b.vx *= 0.985;
      }
    }
    // ceiling
    if (b.y < BR) { b.y = BR; b.vy = Math.abs(b.vy) * 0.5; }

    // end walls (the net soaks up energy)
    const belowBar = b.y > gy - gh;
    if (b.x < BR) { b.x = BR; b.vx = Math.abs(b.vx) * (belowBar ? 0.2 : 0.7); }
    if (b.x > W - BR) { b.x = W - BR; b.vx = -Math.abs(b.vx) * (belowBar ? 0.2 : 0.7); }
    if (belowBar && (b.x < gd || b.x > W - gd)) b.vx *= 0.93;

    const bar1 = this.ballVsRect(0, gy - gh - 1, gd + 1, 2, 0.55);
    const bar2 = this.ballVsRect(W - gd - 1, gy - gh - 1, gd + 1, 2, 0.55);
    const barSp = Math.hypot(b.vx, b.vy);
    if ((bar1 || bar2) && barSp > 1.5) this.emit("post", barSp / 6, 12);
  }

  private ballVsRect(rx: number, ry: number, rw: number, rh: number, e: number, pvx = 0, pvy = 0) {
    const b = this.ball;
    const nx = clamp(b.x, rx, rx + rw);
    const ny = clamp(b.y, ry, ry + rh);
    let dx = b.x - nx;
    let dy = b.y - ny;
    const d2 = dx * dx + dy * dy;
    if (d2 >= BR * BR) return false;

    let pen: number;
    if (d2 > 1e-6) {
      const d = Math.sqrt(d2);
      dx /= d; dy /= d; pen = BR - d;
    } else {
      // centre is inside the rect: push out through the nearest face
      const l = b.x - rx, r = rx + rw - b.x, t = b.y - ry, bt = ry + rh - b.y;
      const m = Math.min(l, r, t, bt);
      dx = dy = 0;
      if (m === l) dx = -1; else if (m === r) dx = 1; else if (m === t) dy = -1; else dy = 1;
      pen = m + BR;
    }
    b.x += dx * pen;
    b.y += dy * pen;
    const vn = (b.vx - pvx) * dx + (b.vy - pvy) * dy;
    if (vn < 0) {
      const j = -(1 + e) * vn;
      b.vx += j * dx;
      b.vy += j * dy;
    }
    return true;
  }

  private collidePlayer(p: Player) {
    if (this.ballVsRect(p.x, p.y, PW, PH, 0.6, p.vx, p.vy)) {
      this.idle = 0;
      const sp = Math.hypot(this.ball.vx, this.ball.vy);
      if (sp > 1.6) this.emit("thud", sp / 7, 8);
    }
  }

  private checkGoal() {
    const b = this.ball;
    const { gy, gh, gd, W } = this;
    if (b.y <= gy - gh + 1) return;
    if (b.x < gd - 1) this.scoreGoal("right");
    else if (b.x > W - gd + 1) this.scoreGoal("left");
  }

  private scoreGoal(side: Side) {
    this.score[side]++;
    this.scorer = side;
    this.phase = "goal";
    this.t = 0;
    this.shake = 14;
    this.emit("goal");
    this.flash = { text: "GOAL!!!", t: GOAL_FRAMES, color: "#facc15" };
    const col = side === "left" ? ["#ef4444", "#ffffff", "#fca5a5"] : ["#2563eb", "#facc15", "#93c5fd"];
    const x = side === "left" ? this.W - this.gd : this.gd;
    for (let i = 0; i < 46; i++) {
      this.particles.push({
        x, y: this.gy - this.gh / 2,
        vx: (Math.random() - 0.5) * 4 + (side === "left" ? -1 : 1) * -0.5,
        vy: -Math.random() * 3.6 - 0.5,
        life: 50 + Math.random() * 40,
        color: col[i % col.length],
      });
    }
  }

  /* --------------------------------- bot AI --------------------------- */

  private predictX(me: Player): number {
    const b = this.ball;
    const cx = me.x + PW / 2;
    const by = this.gy - BR;
    if (b.y >= by - 0.5 && Math.abs(b.vy) < 0.6) {
      // rolling: lead it a little
      const t = Math.min(28, Math.abs(b.x - cx) / RUN);
      return clamp(b.x + b.vx * t * 0.8, BR, this.W - BR);
    }
    let x = b.x, y = b.y, vx = b.vx, vy = b.vy;
    for (let i = 0; i < 90; i++) {
      vy += GRAV_B; x += vx; y += vy;
      if (x < BR || x > this.W - BR) { x = clamp(x, BR, this.W - BR); vx = -vx * 0.7; }
      if (y >= by) { y = by; vy = -vy * 0.66; if (Math.abs(vy) < 0.8) vy = 0; vx *= 0.985; }
      if (vy > 0 && y > this.gy - 16) break;
    }
    return x;
  }

  private think(me: Player, opp: Player): Controls {
    const c = this.botCtl;
    const ai = me.ai!;
    const b = this.ball;
    const { gy, W } = this;
    const own = me.side === "right" ? 1 : -1; // direction of my own goal
    const atk = -own;
    const cx = me.x + PW / 2;

    if (--ai.cd <= 0) {
      ai.cd = BOT.react + ((Math.random() * 4) | 0);
      const bx = this.predictX(me);
      const behind = own > 0 ? b.x > cx + 2 : b.x < cx - 2; // ball is between me and my goal
      const half = (b.x - W / 2) * own; // > 0: ball on my half
      let tx = bx + own * (behind ? 11 : 7);
      if (half < -W * 0.1 && b.vx * own < 0.3) {
        const home = W / 2 + own * W * 0.2;
        tx = home * 0.55 + tx * 0.45;
      }
      ai.tx = tx + (Math.random() - 0.5) * BOT.sloppy * 2;
      ai.wantJump = Math.random() < BOT.jumpSkill;
    }

    const dx = ai.tx - cx;
    c.left = dx < -2.5;
    c.right = dx > 2.5;

    // jumping: headers, or hopping over a ball that's sitting between me and my goal
    const hdx = Math.abs(b.x - cx);
    const behindNow = own > 0 ? b.x > cx + 2 : b.x < cx - 2;
    const lowBall = b.y > gy - 14;
    c.jump =
      (hdx < 16 && b.y < gy - 14 && b.y > gy - PH - 34 && ai.wantJump) ||
      (behindNow && lowBall && hdx < 18 && (c.left || c.right) && me.onGround);

    c.kick = me.kickCd <= 0 && this.inFoot(me) && me.facing === atk && Math.random() < BOT.kickChance;
    me.kickHeld = false;
    void opp;
    return c;
  }

  /* -------------------------------- render ---------------------------- */

  render(ctx: CanvasRenderingContext2D) {
    const { W, H, gy } = this;
    ctx.save();
    if (this.shake > 0) ctx.translate(Math.round((Math.random() - 0.5) * 2), Math.round((Math.random() - 0.5) * 2));
    ctx.drawImage(this.bg, 0, 0);

    // shadows
    ctx.fillStyle = "rgba(0,0,0,0.32)";
    for (const p of [this.left, this.right]) {
      const air = Math.min(1, (gy - PH - p.y) / 40);
      const w = Math.round(10 - air * 4);
      ctx.fillRect(Math.round(p.x + PW / 2 - w / 2), gy, w, 2);
    }
    {
      const b = this.ball;
      const w = Math.max(3, Math.round(8 - (gy - b.y) / 9));
      ctx.fillRect(Math.round(b.x - w / 2), gy, w, 2);
    }

    this.drawPlayer(ctx, this.left);
    this.drawPlayer(ctx, this.right);
    this.drawBall(ctx);

    // "YOU" marker
    if (!this.demo) {
      const p = this.left;
      const bob = Math.round(Math.sin(this.frame / 8) * 1);
      const cx = Math.round(p.x + PW / 2);
      const y = Math.round(p.y) - 11 + bob;
      drawText(ctx, "YOU", cx - 5, y, 1, "#fca5a5", "#000000");
      ctx.fillStyle = "#fca5a5";
      ctx.fillRect(cx - 2, y + 7, 5, 1);
      ctx.fillRect(cx - 1, y + 8, 3, 1);
      ctx.fillRect(cx, y + 9, 1, 1);
    }

    // confetti
    for (const q of this.particles) {
      ctx.fillStyle = q.color;
      ctx.fillRect(Math.round(q.x), Math.round(q.y), 2, 2);
    }

    this.drawHud(ctx);
    ctx.restore();
    void H; void W;
  }

  private drawHud(ctx: CanvasRenderingContext2D) {
    const { W, H } = this;
    const big = W >= 320;
    const ds = big ? 2 : 1;
    const leftLabel = this.demo ? "RONALDO" : "YOU";
    const rightLabel = "HARSHIT";
    const digits = `${this.score.left}:${this.score.right}`;
    const lw = textWidth(leftLabel, 1);
    const rw = textWidth(rightLabel, 1);
    const dw = textWidth(digits, ds);
    const gap = 4;
    const total = lw + gap + dw + gap + rw;
    const ph = 5 * ds + 6;
    const px = Math.round((W - total) / 2) - 4;
    const py = 2;
    ctx.fillStyle = "rgba(6,10,24,0.82)";
    ctx.fillRect(px, py, total + 8, ph);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(px, py, total + 8, 1);
    ctx.fillRect(px, py + ph - 1, total + 8, 1);
    const ty = py + 3;
    drawText(ctx, leftLabel, px + 4, ty + (5 * ds - 5) / 2, 1, "#f87171");
    drawText(ctx, digits, px + 4 + lw + gap, ty, ds, "#ffffff");
    drawText(ctx, rightLabel, px + 4 + lw + gap + dw + gap, ty + (5 * ds - 5) / 2, 1, "#60a5fa");

    if (this.flash.t > 0) {
      const s = big ? 3 : 2;
      const text = this.flash.text;
      const w = textWidth(text, s);
      const wob = this.flash.text === "GOAL!!!" ? Math.round(Math.sin(this.frame / 3) * 1) : 0;
      drawText(ctx, text, Math.round((W - w) / 2), Math.round(H * 0.3) + wob, s, this.flash.color, "#0b1020");
    }
  }

  private drawBall(ctx: CanvasRenderingContext2D) {
    const b = this.ball;
    const x = Math.round(b.x), y = Math.round(b.y);
    const outer = [4, 6, 8, 8, 8, 8, 6, 4];
    ctx.fillStyle = "#1b1f2a";
    for (let i = 0; i < 8; i++) ctx.fillRect(x - outer[i] / 2, y - 4 + i, outer[i], 1);
    const inner = [4, 6, 6, 6, 6, 4];
    ctx.fillStyle = "#f8fafc";
    for (let i = 0; i < 6; i++) ctx.fillRect(x - inner[i] / 2, y - 3 + i, inner[i], 1);
    ctx.fillStyle = "#334155";
    const a = b.angle;
    ctx.fillRect(Math.round(x + Math.cos(a) * 2) - 1, Math.round(y + Math.sin(a) * 2) - 1, 2, 2);
    ctx.fillRect(Math.round(x + Math.cos(a + 2.4) * 2.2) - 1, Math.round(y + Math.sin(a + 2.4) * 2.2), 1, 1);
  }

  private drawPlayer(ctx: CanvasRenderingContext2D, p: Player) {
    const cx = Math.round(p.x + PW / 2);
    const top = Math.round(p.y);
    const f = p.facing;
    const c = p.pal;
    const R = (dx: number, dy: number, w: number, h: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(f > 0 ? cx + dx : cx - dx - w, top + dy, w, h);
    };
    const air = !p.onGround;
    const run = !air && Math.abs(p.vx) > 0.35;
    const ph = run ? Math.floor(p.anim / 4) % 2 : 0;
    const kicking = p.kickT > 0;

    // back arm
    R(-5, 8 + (air ? -2 : run ? (ph ? 1 : 0) : 0), 2, 3, c.shirtDark);
    R(-5, 11 + (air ? -2 : run ? (ph ? 1 : 0) : 0), 2, 2, c.skin);
    // head
    R(-4, 1, 2, 5, c.hair);
    R(-3, 0, 6, 2, c.hair);
    R(-3, 2, 6, 5, c.skin);
    R(1, 4, 1, 2, c.eye);
    // torso
    R(-4, 7, 8, 6, c.shirt);
    R(-4, 10, 8, 1, c.accent);
    // shorts
    R(-4, 13, 8, 3, c.shorts);
    // legs
    if (air) {
      R(-3, 16, 3, 1, c.sock); R(-3, 17, 4, 2, c.boots);
      if (kicking) { R(0, 15, 6, 2, c.sock); R(5, 14, 3, 3, c.boots); }
      else { R(1, 16, 3, 1, c.sock); R(1, 17, 4, 2, c.boots); }
    } else if (kicking) {
      R(-3, 16, 3, 2, c.sock); R(-3, 18, 4, 2, c.boots);
      R(0, 15, 6, 2, c.sock); R(5, 15, 3, 3, c.boots);
    } else if (run) {
      const a = ph ? 1 : -1;
      R(-3 + a, 16, 3, 2, c.sock); R(-3 + a, 18, 4, 2, c.boots);
      R(0 - a, 16, 3, 2, c.sock); R(0 - a + 1, ph ? 17 : 18, 4, 2, c.boots);
    } else {
      R(-3, 16, 3, 2, c.sock); R(-3, 18, 4, 2, c.boots);
      R(0, 16, 3, 2, c.sock); R(1, 18, 4, 2, c.boots);
    }
    // front arm
    const fa = air ? -3 : run ? (ph ? 0 : 1) : 0;
    R(3, 8 + fa, 2, 3, c.shirt);
    R(3, 11 + fa, 2, 2, c.skin);
  }

  /* ----------------------------- background --------------------------- */

  private makeBackground(): HTMLCanvasElement {
    const { W, H, gy, gd, gh, grassTop } = this;
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d")!;
    const rnd = mulberry32(1337 + W * 7 + H);

    // night sky
    const sky = ["#070b1a", "#0a1230", "#0d1a40"];
    const bandH = Math.ceil(grassTop / sky.length);
    sky.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, i * bandH, W, bandH); });

    // crowd
    const boardY = grassTop - 7;
    const crowdTop = Math.max(2, Math.floor(H * 0.06));
    const cols = ["#13204a", "#1a2c63", "#223a7c", "#2c4a96", "#10193a", "#1d3170"];
    const spec = ["#cbd5f5", "#ef4444", "#facc15", "#60a5fa", "#f8fafc", "#fb923c"];
    for (let y = crowdTop; y < boardY; y += 3) {
      const depth = (y - crowdTop) / Math.max(1, boardY - crowdTop);
      for (let x = 0; x < W; x += 3) {
        const r = rnd();
        g.fillStyle = r < 0.07 + depth * 0.05 ? spec[(rnd() * spec.length) | 0] : cols[(rnd() * cols.length) | 0];
        g.globalAlpha = 0.55 + depth * 0.45;
        g.fillRect(x, y, 3, 3);
      }
    }
    g.globalAlpha = 1;
    // floodlight glow
    for (const lx of [Math.round(W * 0.2), Math.round(W * 0.8)]) {
      for (let r = 14; r > 0; r -= 4) {
        g.fillStyle = `rgba(190,215,255,${0.05 + (14 - r) * 0.012})`;
        g.fillRect(lx - r, crowdTop - 2, r * 2, Math.round(r * 0.9));
      }
      g.fillStyle = "#e0ecff";
      g.fillRect(lx - 4, crowdTop - 2, 8, 2);
    }

    // ad boards
    g.fillStyle = "#0b1224";
    g.fillRect(0, boardY, W, 6);
    g.fillStyle = "#1e293b";
    g.fillRect(0, boardY, W, 1);
    const ad = "HARSHITR.ME";
    const adW = textWidth(ad, 1) + 14;
    for (let x = 6, i = 0; x < W - gd - 4; x += adW, i++) {
      drawText(g, ad, x, boardY + 1, 1, i % 2 ? "#60a5fa" : "#facc15");
    }

    // grass
    const stripeW = 22;
    for (let x = 0, i = 0; x < W; x += stripeW, i++) {
      g.fillStyle = i % 2 ? "#1c6a34" : "#217a3b";
      g.fillRect(x, grassTop, stripeW, H - grassTop);
    }
    g.fillStyle = "#14502a";
    g.fillRect(0, grassTop, W, 1);

    // pitch lines
    const L = "rgba(236,253,245,0.55)";
    g.fillStyle = L;
    g.fillRect(gd, grassTop + 3, W - gd * 2, 1); // top sideline
    g.fillRect(gd, H - 3, W - gd * 2, 1); // bottom sideline
    g.fillRect(Math.round(W / 2), grassTop + 3, 1, H - grassTop - 6); // halfway line
    // centre circle (flattened ellipse)
    const mid = (grassTop + 3 + H - 3) / 2;
    for (let a = 0; a < 360; a += 4) {
      const rad = (a * Math.PI) / 180;
      g.fillRect(Math.round(W / 2 + Math.cos(rad) * 15), Math.round(mid + Math.sin(rad) * 5), 1, 1);
    }
    // penalty boxes
    const bw = Math.min(34, Math.round(W * 0.12));
    for (const side of [0, 1]) {
      const x0 = side === 0 ? gd : W - gd - bw;
      g.fillStyle = L;
      g.fillRect(x0, grassTop + 6, bw, 1);
      g.fillRect(x0, H - 6, bw, 1);
      g.fillRect(side === 0 ? x0 + bw - 1 : x0, grassTop + 6, 1, H - grassTop - 11);
    }

    // goals
    const drawGoal = (side: 0 | 1) => {
      const x0 = side === 0 ? 0 : W - gd;
      const top = gy - gh;
      g.fillStyle = "rgba(4,10,8,0.55)";
      g.fillRect(x0, top, gd, gh + 2);
      g.fillStyle = "rgba(255,255,255,0.28)";
      for (let y = top; y < gy + 2; y++) {
        for (let x = 0; x < gd; x++) if ((x + y) % 4 === 0) g.fillRect(x0 + x, y, 1, 1);
      }
      g.fillStyle = "#f8fafc";
      g.fillRect(x0, top - 1, gd, 2); // crossbar
      g.fillRect(side === 0 ? gd - 1 : W - gd - 1, top - 1, 2, gh + 3); // front post
      g.fillStyle = "rgba(0,0,0,0.35)";
      g.fillRect(side === 0 ? gd + 1 : W - gd - 3, gy + 1, 2, 2);
    };
    drawGoal(0);
    drawGoal(1);

    return cv;
  }
}
