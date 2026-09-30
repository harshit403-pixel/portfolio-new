import React, { useEffect } from 'react';

/* ------------------------------------------------------------------
   Styles (verbatim from memoryBoard.css + the Google font import
   that used to be a <link> in the HTML <head>)
------------------------------------------------------------------- */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&display=swap');

  :root{
    --bg-1:#f3f4f6;
    --bg-2:#eceef1;
    --ink:#1f2226;
    --ink-soft:#8a8f98;
    --thread:#e0559c;
    --thread-soft:#e88ebc;
    --card:#ffffff;
    --accent:#1f2226;
  }
  *{box-sizing:border-box;}
html,
body{
  margin:0;
  padding:0;
  font-family:'Space Grotesk', sans-serif;
  -webkit-tap-highlight-color:transparent;
}
  #board{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  overflow:hidden;

  background:
    radial-gradient(
      circle at 20% 15%,
      #ffffff 0%,
      transparent 55%
    ),
    radial-gradient(
      circle at 85% 80%,
      #ffffff 0%,
      transparent 50%
    ),
    linear-gradient(
      160deg,
      var(--bg-1),
      var(--bg-2)
    );
}
  canvas#strings{
    position:absolute; inset:0; width:100%; height:100%; z-index:1; pointer-events:none;
  }

  /* ---------- top bar ---------- */
  #topbar{
    position:absolute; top:22px; left:24px; right:24px;
    z-index:50; display:flex; justify-content:space-between; align-items:flex-start;
    pointer-events:none;
  }
  #topbar > *{ pointer-events:auto; }
  .brand{
    font-size:15px; font-weight:600; color:var(--ink); letter-spacing:-0.01em;
  }
  .brand small{
    display:block; font-size:11px; font-weight:400; color:var(--ink-soft); margin-top:1px;
  }

  /* ---------- center frame ---------- */
  #frame-wrap{
    position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
    width:min(17vw, 245px); height:min(17vw,245px);
    z-index:10;
  }
  #frame{
    position:relative; width:100%; height:100%;
    border-radius:18px;
    background:linear-gradient(155deg, #ffffff, #f2f3f5);
    box-shadow: 0 18px 40px rgba(30,30,40,0.14), 0 2px 6px rgba(30,30,40,0.06), inset 0 1px 0 rgba(255,255,255,0.9);
    display:flex; align-items:center; justify-content:center;
    overflow:hidden;
    transition: box-shadow .25s ease;
  }
  #frame.drag-over{
    box-shadow: 0 0 0 2.5px var(--thread), 0 18px 40px rgba(224,85,156,0.25);
  }
  #frame-placeholder{
    color:#a7abb3; text-align:center; font-size:13.5px; line-height:1.6;
    padding:14px; pointer-events:none;
  }
  #frame-img{
    position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
    opacity:0; transform:scale(1.04);
    transition: opacity .35s ease, transform .35s ease;
  }
  #frame-img.show{ opacity:1; transform:scale(1); }

  #frame-caption{
    position:absolute; left:0; right:0; bottom:0;
    padding:10px 14px 10px;
    background:linear-gradient(0deg, rgba(0,0,0,0.55), rgba(0,0,0,0));
    color:#fff; font-size:13px; font-weight:500;
    opacity:0; transform:translateY(6px);
    transition:opacity .3s ease, transform .3s ease;
    display:flex; align-items:center; justify-content:space-between; gap:8px;
  }
  #frame-caption.show{ opacity:1; transform:translateY(0); }
  #frame-eject{
    pointer-events:auto; cursor:pointer; width:20px; height:20px; border-radius:50%;
    background:rgba(255,255,255,0.25); display:flex; align-items:center; justify-content:center;
    font-size:11px; flex:none;
  }
  #frame-eject:hover{ background:rgba(255,255,255,0.4); }
  .eq{ display:flex; align-items:flex-end; gap:2px; height:12px; pointer-events:none; }
  .eq span{ width:2.5px; background:#fff; border-radius:1px; height:3px; opacity:.4; }
  .playing .eq span{ opacity:1; animation: bounce 0.9s ease-in-out infinite; }
  .playing .eq span:nth-child(1){ animation-delay:0s; }
  .playing .eq span:nth-child(2){ animation-delay:0.15s; }
  .playing .eq span:nth-child(3){ animation-delay:0.3s; }
  @keyframes bounce{ 0%,100%{height:3px;} 50%{height:11px;} }

  #no-audio-toast{
    position:absolute; left:50%; bottom:-42px; transform:translate(-50%,0);
    background:var(--ink); color:#fff; font-size:12px;
    padding:7px 12px; border-radius:8px; white-space:nowrap;
    opacity:0; pointer-events:none; transition:opacity .25s ease, transform .25s ease;
    z-index:20;
  }
  #no-audio-toast.show{ opacity:1; transform:translate(-50%,6px); }

  /* ---------- photo nodes ---------- */
  .node{
    position:absolute; top:0; left:0;
    border-radius:14px;
    background:var(--card);
    box-shadow:0 10px 22px rgba(20,20,30,0.14), 0 2px 5px rgba(20,20,30,0.08);
    z-index:5;
    cursor:grab;
    touch-action:none;
    user-select:none;
    transition: box-shadow .18s ease, opacity .35s ease, transform .35s ease;
    will-change: transform;
    padding:4px;
  }
  .node:hover{ box-shadow:0 16px 30px rgba(20,20,30,0.2), 0 2px 6px rgba(20,20,30,0.1); }
  .node.dragging{ cursor:grabbing; z-index:200; box-shadow:0 24px 44px rgba(20,20,30,0.28); transition:none; }
  .node img{
    display:block; width:100%; height:100%; object-fit:cover; border-radius:10px;
    pointer-events:none; -webkit-user-drag:none;
    background:#e3e5e9;
  }
  .node .cap{
    position:absolute; left:6px; bottom:-20px;
    font-size:12px; color:var(--ink-soft); font-weight:500;
    padding:0 2px; line-height:1.1; max-width:90%;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    outline:none; background:transparent;
  }
  .node .cap:focus{ color:var(--ink); }
  .node .tools{
    position:absolute; top:-10px; right:-10px;
    display:flex; gap:4px;
    opacity:0; transform:translateY(-4px);
    transition:opacity .15s ease, transform .15s ease;
    pointer-events:none;
  }
  .node:hover .tools{ opacity:1; transform:translateY(0); pointer-events:auto; }
  .node .tool{
    width:22px; height:22px; border-radius:50%;
    background:var(--ink); color:#fff;
    display:flex; align-items:center; justify-content:center;
    font-size:11px; cursor:pointer; border:1.5px solid #fff;
    box-shadow:0 3px 6px rgba(0,0,0,0.25);
  }
  .node .tool:hover{ background:var(--thread); }

  .node.has-audio .has-audio-dot{ display:block; }
  .node.in-frame{
    opacity:0; pointer-events:none; filter:saturate(0.5);
  }
  .node.in-frame .tools{ display:none; }

  @media (max-width: 640px){
    #topbar{ top:14px; left:14px; right:14px; }
    .btn span.label{ display:none; }
    #frame-wrap{ width:150px; height:150px; }
  }
`;

/* ------------------------------------------------------------------
   Types
------------------------------------------------------------------- */
interface RopePoint {
  x: number;
  y: number;
  ox: number;
  oy: number;
  init: boolean;
}

interface Size {
  w: number;
  h: number;
}

interface DemoItem {
  caption: string;
  img: string;
  audio: string;
}

interface MakeNodeOpts {
  imgSrc: string;
  audioSrc?: string | null;
  caption?: string;
  px: number;
  py: number;
  size?: Size;
}

interface MemoryNode {
  id: number;
  el: HTMLDivElement;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  imgSrc: string;
  audioSrc: string | null;
  caption: string;
  px: number;
  py: number;
  homePx: number;
  homePy: number;
  ropeNext: any;
  dragging: boolean;
  inFrame: boolean;
  returning: boolean;
}

/* ------------------------------------------------------------------
   Component
------------------------------------------------------------------- */
export default function MemoryBoard(): JSX.Element {
  useEffect(() => {
    // Tracks everything that must be undone on unmount
    // (also keeps React StrictMode's double-mount safe).
    const cleanups: Array<() => void> = [];
    let disposed = false;
    let rafId = 0;

    const on = (
      target: EventTarget,
      type: string,
      handler: (e: any) => void,
      opts?: boolean | AddEventListenerOptions
    ) => {
      target.addEventListener(type, handler, opts);
      cleanups.push(() => target.removeEventListener(type, handler, opts));
    };

    const $ = <T extends HTMLElement>(id: string) =>
      document.getElementById(id) as T;

    const board = $<HTMLDivElement>('board');
    const canvas = $<HTMLCanvasElement>('strings');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const frameWrap = $<HTMLDivElement>('frame-wrap');
    const frameEl = $<HTMLDivElement>('frame');
    const frameImg = $<HTMLImageElement>('frame-img');
    const framePlaceholder = $<HTMLDivElement>('frame-placeholder');
    const frameCaption = $<HTMLDivElement>('frame-caption');
    const frameCaptionText = $<HTMLSpanElement>('frame-caption-text');
    const frameEject = $<HTMLDivElement>('frame-eject');
    const noAudioToast = $<HTMLDivElement>('no-audio-toast');
    const player = $<HTMLAudioElement>('player');
    const emptyHint = $<HTMLDivElement>('empty-hint');

    let W = 0,
      H = 0;

    const mouse = {
      x: 0,
      y: 0,
      active: false,
    };

    on(board, 'pointermove', (e: PointerEvent) => {
      const rect = board.getBoundingClientRect();

      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });

    on(board, 'pointerleave', () => {
      mouse.active = false;
    });

    function resizeCanvas() {
      W = board.clientWidth;
      H = board.clientHeight;
      canvas.width = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }

    const frameAnchor = { x: 0, y: 0 };
    function updateFrameAnchor() {
      const r = frameWrap.getBoundingClientRect();
      const b = board.getBoundingClientRect();
      frameAnchor.x = r.left - b.left + r.width / 2;
      frameAnchor.y = r.top - b.top + r.height / 2;
    }

    on(window, 'resize', () => {
      resizeCanvas();
      updateFrameAnchor();
      layoutAll();
    });

    // ---------------- Rope (verlet) ----------------
    class Rope {
      n: number;
      pts: RopePoint[];
      windPhase: number;
      windAmp: number;

      constructor(segments: number, windPhase?: number) {
        this.n = segments;
        this.pts = [];

        this.windPhase = windPhase || Math.random() * 100;
        // this.windAmp = 0.015 + Math.random() * 0.035;
        this.windAmp = 0.005 + Math.random() * 0.01;

        for (let i = 0; i < segments; i++) {
          this.pts.push({
            x: 0,
            y: 0,
            ox: 0,
            oy: 0,
            init: false,
          });
        }
      }

      update(
        ax: number,
        ay: number,
        bx: number,
        by: number,
        t: number,
        damping: number,
        iterations: number
      ) {
        const pts = this.pts;

        // -------------------------
        // INITIALIZE ROPE
        // -------------------------
        if (!pts[0].init) {
          for (let i = 0; i < this.n; i++) {
            const tt = i / (this.n - 1);

            const x = ax + (bx - ax) * tt;
            const y = ay + (by - ay) * tt;

            pts[i].x = x;
            pts[i].y = y;

            pts[i].ox = x;
            pts[i].oy = y;

            pts[i].init = true;
          }
        }

        // -------------------------
        // LOCK BOTH ENDS
        // -------------------------
        pts[0].x = ax;
        pts[0].y = ay;

        pts[this.n - 1].x = bx;
        pts[this.n - 1].y = by;

        // -------------------------
        // NATURAL WIND / GRAVITY
        // -------------------------
        const gx = Math.sin(t / 150 + this.windPhase) * this.windAmp;

        // const gy =
        //   0.18 +
        //   Math.cos(t / 230 + this.windPhase) * 0.015;

        const gy = 0.08 + Math.cos(t / 230 + this.windPhase) * 0.008;

        // -------------------------
        // MOVE ROPE POINTS
        // -------------------------
        for (let i = 1; i < this.n - 1; i++) {
          const p = pts[i];

          // Verlet velocity
          const vx = (p.x - p.ox) * damping;
          const vy = (p.y - p.oy) * damping;

          p.ox = p.x;
          p.oy = p.y;

          // normal movement
          p.x += vx + gx;
          p.y += vy + gy;

          // =================================================
          // MOUSE INTERACTION
          // =================================================

          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;

            const distance = Math.hypot(dx, dy);

            // How close mouse needs to be
            const radius = 70;

            if (distance < radius) {
              const d = Math.max(distance, 0.001);

              // 1 when extremely close
              // 0 when at edge of radius
              const strength = Math.pow(1 - distance / radius, 2);

              // direction away from cursor
              const pushX = dx / d;
              const pushY = dy / d;

              // push the rope
              const force = 20;

              p.x += pushX * strength * force;
              p.y += pushY * strength * force;
            }
          }
        }

        // -------------------------
        // ROPE CONSTRAINT
        // -------------------------

        const dist = Math.hypot(bx - ax, by - ay);

        // const segLen = Math.max(
        //   (dist / (this.n - 1)) * 1.22,
        //   3
        // );

        const segLen = Math.max((dist / (this.n - 1)) * 1.05, 3);

        for (let it = 0; it < iterations; it++) {
          for (let i = 0; i < this.n - 1; i++) {
            const p1 = pts[i];
            const p2 = pts[i + 1];

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;

            const d = Math.hypot(dx, dy) || 0.0001;

            const diff = ((segLen - d) / d) * 0.5;

            const ox = dx * diff;
            const oy = dy * diff;

            // don't move first endpoint
            if (i !== 0) {
              p1.x -= ox;
              p1.y -= oy;
            }

            // don't move last endpoint
            if (i + 1 !== this.n - 1) {
              p2.x += ox;
              p2.y += oy;
            }
          }

          // endpoints MUST stay locked
          pts[0].x = ax;
          pts[0].y = ay;

          pts[this.n - 1].x = bx;
          pts[this.n - 1].y = by;
        }
      }

      draw(c: CanvasRenderingContext2D, color: string, w: number) {
        const pts = this.pts;

        c.beginPath();

        c.moveTo(pts[0].x, pts[0].y);

        for (let i = 1; i < this.n - 2; i++) {
          const p = pts[i];
          const p2 = pts[i + 1];

          const mx = (p.x + p2.x) / 2;
          const my = (p.y + p2.y) / 2;

          c.quadraticCurveTo(p.x, p.y, mx, my);
        }

        c.lineTo(pts[this.n - 1].x, pts[this.n - 1].y);

        c.strokeStyle = color;
        c.lineWidth = w;
        c.lineCap = 'round';

        c.stroke();
      }
    }

    // ---------------- nodes ----------------
    const nodes: MemoryNode[] = [];
    let idCounter = 1;
    let activeNode: MemoryNode | null = null;
    let currentAudioURL: string | null = null;
    let anchorNodeIndex = -1;
    const SIZES: Size[] = [
      { w: 125, h: 160 }, // small
      { w: 165, h: 125 }, // small
      { w: 145, h: 145 }, // small
      { w: 200, h: 245 }, // big
      { w: 180, h: 220 }, // medium-big
      { w: 225, h: 225 }, // biggest
      { w: 120, h: 155 }, // smallest
      { w: 195, h: 195 }, // medium
      { w: 160, h: 205 }, // medium
      { w: 215, h: 175 }, // big
    ];
    const DEMO: DemoItem[] = [
      { caption: 'tired', img: 'assets/photos/photo1.jpg', audio: 'assets/music/sunflower.mp3' },
      { caption: 'heaven', img: 'assets/photos/photo2.jpg', audio: 'assets/music/mcsher.mp3' },
      { caption: 'mountains', img: 'assets/photos/photo3.jpg', audio: 'assets/music/mountains.mp3' },
      { caption: 'alter ego', img: 'assets/photos/photo4.jpg', audio: 'assets/music/billieJean.mp3' },
      { caption: 'divine', img: 'assets/photos/photo5.jpg', audio: 'assets/music/raghunath.mp3' },
      { caption: 'still there', img: 'assets/photos/photo6.jpg', audio: 'assets/music/blindingLights.mp3' },
      { caption: 'raftaar paaji', img: 'assets/photos/photo7.jpg', audio: 'assets/music/raftaar.mp3' },
      { caption: 'sunset', img: 'assets/photos/photo8.jpg', audio: 'assets/music/nightchanges.mp3' },
      { caption: 'I was there', img: 'assets/photos/photo9.jpg', audio: 'assets/music/masakali.mp3' },
      { caption: 'notes & harmony', img: 'assets/photos/photo10.jpg', audio: 'assets/music/loveme.mp3' },
      { caption: 'remember', img: 'assets/photos/photo11.jpg', audio: 'assets/music/TLITB.mp3' },
      { caption: 'In love', img: 'assets/photos/photo12.jpg', audio: 'assets/music/dtmf.mp3' },
      { caption: 'Yes sir', img: 'assets/photos/photo13.jpg', audio: 'assets/music/football.mp3' },
      { caption: 'UNO', img: 'assets/photos/photo14.jpg', audio: 'assets/music/getLucky.mp3' },
      { caption: 'SPIDERMAN', img: 'assets/photos/photo15.jpg', audio: 'assets/music/spiderMan.mp3' },
    ];

    function escapeHtml(s: string) {
      const d = document.createElement('div');
      d.innerText = s;
      return d.innerHTML;
    }

    let frameSpur: any = new Rope(16, 12);
    let frameSpurTarget = -1;

    function rebuildChain() {
      anchorNodeIndex = nodes.length
        ? Math.min(nodes.length - 1, Math.floor(nodes.length / 2))
        : -1;
      // (re)create ropes for the sequential chain + one spur to the frame
      for (let i = 0; i < nodes.length - 1; i++) {
        if (!nodes[i].ropeNext) nodes[i].ropeNext = new Rope(16);
      }
      if (nodes.length && !nodes[nodes.length - 1].ropeNext)
        nodes[nodes.length - 1].ropeNext = null;
      if (anchorNodeIndex >= 0 && !frameSpur) frameSpurTarget = anchorNodeIndex;
    }
    void frameSpurTarget;

    function makeNode(opts: MakeNodeOpts) {
      const id = idCounter++;
      const el = document.createElement('div');
      el.className = 'node';
      const size = opts.size || SIZES[Math.floor(Math.random() * SIZES.length)];
      el.style.width = size.w + 'px';
      el.style.height = size.h + 'px';
      el.innerHTML = `
      <div class="tools">
        <div class="tool" data-act="audio" title="attach a song">🎵</div>
        <div class="tool" data-act="rename" title="rename">✎</div>
        <div class="tool" data-act="delete" title="remove">✕</div>
      </div>
      <img src="${opts.imgSrc}" draggable="false">
      <div class="cap" contenteditable="false" spellcheck="false">${escapeHtml(
        opts.caption || 'untitled'
      )}</div>
   
      <input type="file" accept="audio/*" class="hidden-audio-input" style="display:none">
    `;
      board.appendChild(el);

      const node: MemoryNode = {
        id,
        el,
        x: 0,
        y: 0,
        w: size.w,
        h: size.h,
        rot: Math.random() * 14 - 7,
        imgSrc: opts.imgSrc,
        audioSrc: opts.audioSrc || null,
        caption: opts.caption || 'untitled',
        px: opts.px,
        py: opts.py,
        homePx: opts.px,
        homePy: opts.py,
        ropeNext: null,
        dragging: false,
        inFrame: false,
        returning: false,
      };
      if (node.audioSrc) el.classList.add('has-audio');
      nodes.push(node);
      rebuildChain();

      attachNodeEvents(node);

      return node;
    }

    function layoutAll() {
      nodes.forEach((n) => {
        if (n.dragging || n.returning) return;
        n.px = n.homePx;
        n.py = n.homePy;
        n.x = (n.px / 100) * W - n.w / 2;
        n.y = (n.py / 100) * H - n.h / 2;
        applyTransform(n);
      });
    }

    function applyTransform(n: MemoryNode) {
      n.el.style.transform = `translate(${n.x}px, ${n.y}px) rotate(${
        n.dragging ? 0 : n.rot
      }deg)`;
    }

    function scatterSpot(_index: number) {
      // Random angle around the center
      const angle = Math.random() * Math.PI * 2;

      // Keep most photos closer to the center.
      // sqrt(random) gives more spread, while the
      // smaller maximum radius keeps them away from corners.
      const radius = 8 + Math.sqrt(Math.random()) * 50;

      let px = 50 + Math.cos(angle) * radius * 1.35;
      let py = 50 + Math.sin(angle) * radius * 1.15;

      // Keep photos safely inside the board
      px = Math.min(88, Math.max(12, px));
      py = Math.min(86, Math.max(14, py));

      // Keep the center frame area clear
      const dx = px - 50;
      const dy = py - 50;
      const d = Math.hypot(dx, dy);

      if (d < 13) {
        const k = 13 / (d || 0.001);

        px = 50 + dx * k;
        py = 50 + dy * k;
      }

      return { px, py };
    }

    function attachNodeEvents(node: MemoryNode) {
      const el = node.el;
      let sx = 0,
        sy = 0,
        moved = false,
        startX = 0,
        startY = 0;

      el.addEventListener('pointerdown', (e: PointerEvent) => {
        if (node.inFrame) return;
        const target = e.target as HTMLElement;
        if (target.closest('.tool') || target.classList.contains('cap')) return;
        e.preventDefault();
        el.setPointerCapture(e.pointerId);
        node.dragging = true;
        node.returning = false;
        el.classList.add('dragging');
        moved = false;
        sx = e.clientX - node.x;
        sy = e.clientY - node.y;
        startX = e.clientX;
        startY = e.clientY;
      });

      el.addEventListener('pointermove', (e: PointerEvent) => {
        if (!node.dragging) return;
        const dx = e.clientX - startX,
          dy = e.clientY - startY;
        if (Math.hypot(dx, dy) > 5) moved = true;
        node.x = e.clientX - sx;
        node.y = e.clientY - sy;
        applyTransform(node);
        checkFrameHover(node);
      });

      el.addEventListener('pointerup', () => {
        if (!node.dragging) return;
        node.dragging = false;
        el.classList.remove('dragging');
        frameEl.classList.remove('drag-over');

        const overFrame = isOverFrame(node);
        if (overFrame || !moved) {
          playInFrame(node);
          tweenHome(node);
        } else {
          applyTransform(node);
          node.homePx = ((node.x + node.w / 2) / W) * 100;
          node.homePy = ((node.y + node.h / 2) / H) * 100;
          node.px = node.homePx;
          node.py = node.homePy;
        }
      });

      (el.querySelector('[data-act="delete"]') as HTMLElement).addEventListener(
        'click',
        (e) => {
          e.stopPropagation();
          removeNode(node);
        }
      );
      (el.querySelector('[data-act="rename"]') as HTMLElement).addEventListener(
        'click',
        (e) => {
          e.stopPropagation();
          const cap = el.querySelector('.cap') as HTMLElement;
          cap.contentEditable = 'true';
          cap.focus();
          placeCaretAtEnd(cap);
        }
      );
      (el.querySelector('.cap') as HTMLElement).addEventListener('blur', () => {
        const cap = el.querySelector('.cap') as HTMLElement;
        cap.contentEditable = 'false';
        node.caption = cap.innerText.trim() || 'untitled';
        cap.innerText = node.caption;
        if (activeNode === node) frameCaptionText.textContent = node.caption;
      });
      (el.querySelector('.cap') as HTMLElement).addEventListener(
        'keydown',
        (e: KeyboardEvent) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            (el.querySelector('.cap') as HTMLElement).blur();
          }
        }
      );

      const audioInput = el.querySelector('.hidden-audio-input') as HTMLInputElement;
      (el.querySelector('[data-act="audio"]') as HTMLElement).addEventListener(
        'click',
        (e) => {
          e.stopPropagation();
          audioInput.click();
        }
      );
      audioInput.addEventListener('change', () => {
        const f = audioInput.files && audioInput.files[0];
        if (!f) return;
        if (node.audioSrc) URL.revokeObjectURL(node.audioSrc);
        node.audioSrc = URL.createObjectURL(f);
        el.classList.add('has-audio');
        noAudioToast.classList.remove('show');
        if (activeNode === node) playInFrame(node);
      });
    }

    function placeCaretAtEnd(el: HTMLElement) {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      if (!sel) return;
      sel.removeAllRanges();
      sel.addRange(range);
    }

    function isOverFrame(node: MemoryNode) {
      const nb = node.el.getBoundingClientRect();
      const fb = frameEl.getBoundingClientRect();
      const ncx = nb.left + nb.width / 2,
        ncy = nb.top + nb.height / 2;
      return ncx > fb.left && ncx < fb.right && ncy > fb.top && ncy < fb.bottom;
    }
    function checkFrameHover(node: MemoryNode) {
      frameEl.classList.toggle('drag-over', isOverFrame(node));
    }

    // smoothly animate a node's x/y back to its home position
    function tweenHome(node: MemoryNode) {
      node.returning = true;
      const fromX = node.x,
        fromY = node.y;
      const toX = (node.homePx / 100) * W - node.w / 2;
      const toY = (node.homePy / 100) * H - node.h / 2;
      const dur = 480;
      const t0 = performance.now();
      function step(now: number) {
        const p = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3); // ease-out cubic
        node.x = fromX + (toX - fromX) * e;
        node.y = fromY + (toY - fromY) * e;
        applyTransform(node);
        if (p < 1 && node.returning) {
          requestAnimationFrame(step);
        } else {
          node.returning = false;
          node.px = node.homePx;
          node.py = node.homePy;
          applyTransform(node);
        }
      }
      requestAnimationFrame(step);
    }

    function playInFrame(node: MemoryNode) {
      // send whatever is currently in the frame back home first
      if (activeNode && activeNode !== node) {
        const prev = activeNode;
        prev.inFrame = false;
        prev.el.classList.remove('in-frame');
        tweenHome(prev);
      }

      node.inFrame = true;
      node.el.classList.add('in-frame');
      activeNode = node;

      frameImg.src = node.imgSrc;
      frameImg.classList.add('show');
      framePlaceholder.style.display = 'none';
      frameCaptionText.textContent = node.caption;
      frameCaption.classList.add('show');

      if (node.audioSrc) {
        if (currentAudioURL !== node.audioSrc) {
          player.src = node.audioSrc;
          currentAudioURL = node.audioSrc;
        }
        player.play().catch(() => {});
        frameEl.classList.add('playing');
        noAudioToast.classList.remove('show');
      } else {
        player.pause();
        frameEl.classList.remove('playing');
        noAudioToast.classList.add('show');
        setTimeout(() => noAudioToast.classList.remove('show'), 2600);
      }
    }

    function ejectFrame() {
      if (!activeNode) return;
      activeNode.inFrame = false;
      activeNode.el.classList.remove('in-frame');
      tweenHome(activeNode);
      activeNode = null;
      currentAudioURL = null;
      player.pause();
      player.src = '';
      frameImg.classList.remove('show');
      frameImg.src = '';
      frameCaption.classList.remove('show');
      framePlaceholder.style.display = '';
      frameEl.classList.remove('playing');
    }
    on(frameEject, 'click', (e: MouseEvent) => {
      e.stopPropagation();
      ejectFrame();
    });

    on(frameEl, 'click', (e: MouseEvent) => {
      if (e.target === frameEject) return;
      if (!currentAudioURL) return;
      if (player.paused) {
        player.play().catch(() => {});
        frameEl.classList.add('playing');
      } else {
        player.pause();
        frameEl.classList.remove('playing');
      }
    });
    on(player, 'ended', () => frameEl.classList.remove('playing'));

    function removeNode(node: MemoryNode) {
      if (node.imgSrc && node.imgSrc.startsWith('blob:'))
        URL.revokeObjectURL(node.imgSrc);
      if (node.audioSrc) URL.revokeObjectURL(node.audioSrc);
      if (activeNode === node) ejectFrame();
      node.el.remove();
      const idx = nodes.indexOf(node);
      if (idx > -1) nodes.splice(idx, 1);
      rebuildChain();

    }

    // ---------------- init demo ----------------
    DEMO.forEach((d, i) => {
      const spot = scatterSpot(i);

      makeNode({
        imgSrc: d.img,
        audioSrc: d.audio,
        caption: d.caption,
        px: spot.px,
        py: spot.py,
      });
    });

    resizeCanvas();
    updateFrameAnchor();
    layoutAll();

    // ---------------- animation loop ----------------
    let t = 0;
    function anchorPoint(n: MemoryNode) {
      if (n.inFrame) return { x: frameAnchor.x, y: frameAnchor.y };
      return { x: n.x + n.w / 2, y: n.y + 8 };
    }
    function tick(now: number) {
      if (disposed) return;
      t = now || t + 16;
      ctx.clearRect(0, 0, W, H);
      updateFrameAnchor();

      // sequential chain through all nodes
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i],
          b = nodes[i + 1];
        if (!a.ropeNext) a.ropeNext = new Rope(16);
        const pa = anchorPoint(a),
          pb = anchorPoint(b);
        a.ropeNext.update(pa.x, pa.y, pb.x, pb.y, t, 0.986, 4);
        const lit = a.inFrame || b.inFrame;
        a.ropeNext.draw(
          ctx,
          lit ? 'rgba(224,85,156,0.85)' : 'rgba(224,85,156,0.55)',
          lit ? 2.2 : 1.5
        );
      }
      // one spur thread from the frame to a nearby anchor node
      if (
        anchorNodeIndex >= 0 &&
        nodes[anchorNodeIndex] &&
        !nodes[anchorNodeIndex].inFrame
      ) {
        const p = anchorPoint(nodes[anchorNodeIndex]);
        frameSpur.update(frameAnchor.x, frameAnchor.y, p.x, p.y, t, 0.986, 4);
        frameSpur.draw(ctx, 'rgba(224,85,156,0.55)', 1.5);
      }

      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    // ---------------- cleanup on unmount ----------------
    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      cleanups.forEach((fn) => fn());
      [...nodes].forEach((n) => {
        if (n.imgSrc && n.imgSrc.startsWith('blob:')) URL.revokeObjectURL(n.imgSrc);
        if (n.audioSrc && n.audioSrc.startsWith('blob:')) URL.revokeObjectURL(n.audioSrc);
        n.el.remove();
      });
      nodes.length = 0;
      player.pause();
    };
  }, []);

  return (
    <>
      <style>{CSS}</style>

      <div className="relative h-full w-full overflow-hidden">
        <div id="board">
        <canvas id="strings"></canvas>

        <div id="topbar">
          <div className="brand">
            the board<small>memories, on a string</small>
          </div>
          </div>

        <div id="frame-wrap">
          <div id="frame">
            <div id="frame-placeholder">
              drop a memory here
              <br />
              see what it sounds like
            </div>
            <img id="frame-img" alt="" />
            <div id="frame-caption">
              <span id="frame-caption-text"></span>
              <div className="eq">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div id="frame-eject" title="put it back">
                ✕
              </div>
            </div>
            <div id="no-audio-toast">
              no song linked yet — tap 🎵 on the photo to add one
            </div>
          </div>
        </div>
      </div>
      </div>

      <audio id="player"></audio>
    </>
  );
}