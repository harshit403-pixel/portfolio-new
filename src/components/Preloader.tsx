import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import "./Preloader.css";

/**
 * Blueprint preloader that is built FROM your real page.
 *
 * While it plays, your actual hero is already mounted underneath. On mount we measure
 * the real elements (nav, banner, avatar, name, copy, buttons, cards…) and draw labelled
 * wireframes at exactly the same positions. Around 64% each wireframe turns into ghost
 * copy that uses the element's real font / size / position, so when the dark sheet wipes
 * away the real content is already sitting exactly where the ghost text was.
 *
 * Same default export + props as the old one, so App.tsx doesn't change:
 *   <PortfolioPreloader duration={3200} accentColor="#fff" backgroundColor="#0A0A0A"
 *                       onComplete={() => setLoading(false)} />
 */

type Kind = "media" | "text" | "btn" | "card";
type Item = {
  kind: Kind;
  x: number; y: number; w: number; h: number;
  label: string;
  text?: string;
  textStyle?: CSSProperties;
  pad?: { l: number; t: number; r: number };
  radius?: string;
};

const TEXT_AT = 62; // % where wireframes turn into ghost copy
const HOLD_MS = 350; // pause on 100% before the wipe
const WIPE_MS = 1100;
const MAX_ITEMS = 70;
const MAX_VW = 0.9; // widest wireframe box never exceeds 90vw

/* ------------------------------------------------------------------ measure the real page */

function measurePage(): Item[] {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const items: Item[] = [];
  const counts = { copy: 0, nav: 0, icon: 0, head: 0, btn: 0 };
  const pad2 = (n: number) => String(n).padStart(2, "0");

  const walk = (el: Element) => {
    if (items.length >= MAX_ITEMS) return;
    if (el.classList?.contains("pl-root")) return;
    if (!(el instanceof HTMLElement || el instanceof SVGElement)) return;
    if (["SCRIPT", "STYLE", "NOSCRIPT", "LINK", "META", "PATH", "DEFS"].includes(el.tagName.toUpperCase())) return;

    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) < 0.05) return;

    const r = el.getBoundingClientRect();
    const hasBox = r.width >= 2 && r.height >= 2;
    if (hasBox && (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw)) return;

    const tag = el.tagName.toLowerCase();

    /* images / canvas / video */
    if (hasBox && (tag === "canvas" || tag === "svg") && r.width > vw * MAX_VW) return; // full-screen decoration
    if (hasBox && (tag === "img" || tag === "video" || tag === "canvas")) {
      const wide = r.width > r.height * 2.2 && r.width > 300;
      const label = wide ? "BANNER" : r.width >= 60 ? "AVATAR" : `ICON`;
      if (label === "ICON") counts.icon++;
      items.push({ kind: "media", x: r.left, y: r.top, w: r.width, h: r.height, label, radius: cs.borderRadius });
      return;
    }

    /* standalone svg icons */
    if (hasBox && tag === "svg") {
      if (r.width >= 10) items.push({ kind: "media", x: r.left, y: r.top, w: r.width, h: r.height, label: "ICON", radius: "4px" });
      return;
    }

    /* buttons / compact links are leaves */
    const isBtn = tag === "button" || el.getAttribute("role") === "button";
    const isLink = tag === "a" && !el.querySelector("img") && r.height < 90;
    if (hasBox && (isBtn || isLink) && r.height < 100) {
      const text = (el as HTMLElement).innerText?.trim();
      const hasSvgOnly = !text;
      const bordered = parseFloat(cs.borderTopWidth) > 0 || cs.backgroundColor !== "rgba(0, 0, 0, 0)";
      const label = hasSvgOnly ? "ICON" : isLink && !bordered ? `NAV ${pad2(++counts.nav)}` : `BTN ${pad2(++counts.btn)}`;
      items.push({
        kind: isLink && !bordered ? "text" : "btn",
        x: r.left, y: r.top, w: r.width, h: r.height, label,
        text,
        textStyle: textStyleFrom(cs),
        radius: cs.borderRadius,
        pad: padFrom(cs),
      });
      return;
    }

    /* bordered, rounded containers (cards) */
    if (
      hasBox && r.height >= 50 && r.height <= 360 && !el.querySelector("img") &&
      parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== "none" && parseFloat(cs.borderTopLeftRadius) >= 8
    ) {
      items.push({ kind: "card", x: r.left, y: r.top, w: r.width, h: r.height, label: "CARD", radius: cs.borderRadius });
    }

    /* text leaf: element that owns text directly */
    let ownText = "";
    el.childNodes.forEach((n) => { if (n.nodeType === 3) ownText += n.textContent ?? ""; });
    if (hasBox && ownText.trim().length > 0 && el instanceof HTMLElement) {
      const isHeading = /^h[1-6]$/.test(tag);
      const label = tag === "h1" ? "TITLE" : isHeading ? `H${tag[1]}` : `COPY ${pad2(++counts.copy)}`;
      if (isHeading) counts.head++;
      items.push({
        kind: "text",
        x: r.left, y: r.top, w: r.width, h: r.height, label,
        text: el.innerText.trim(),
        textStyle: textStyleFrom(cs),
        pad: padFrom(cs),
      });
      return; // don't descend: children are part of the text
    }

    Array.from(el.children).forEach(walk);
  };

  walk(document.body);

  // nothing may be wider than MAX_VW of the viewport: clamp, keeping it centred on its original centre
  const maxW = vw * MAX_VW;
  items.forEach((it) => {
    if (it.w > maxW) {
      const cx = it.x + it.w / 2;
      it.w = maxW;
      it.x = Math.min(Math.max(cx - maxW / 2, (vw - maxW) / 2), vw - (vw - maxW) / 2 - maxW);
    }
  });

  items.sort((a, b) => a.y - b.y || a.x - b.x);
  return items;
}

function textStyleFrom(cs: CSSStyleDeclaration): CSSProperties {
  return {
    fontFamily: cs.fontFamily,
    fontSize: cs.fontSize,
    fontWeight: cs.fontWeight as CSSProperties["fontWeight"],
    fontStyle: cs.fontStyle,
    lineHeight: cs.lineHeight,
    letterSpacing: cs.letterSpacing,
    textAlign: cs.textAlign as CSSProperties["textAlign"],
  };
}
function padFrom(cs: CSSStyleDeclaration) {
  return {
    l: parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth),
    t: parseFloat(cs.paddingTop) + parseFloat(cs.borderTopWidth),
    r: parseFloat(cs.paddingRight) + parseFloat(cs.borderRightWidth),
  };
}

/* ------------------------------------------------------------------ component */

export interface PortfolioPreloaderProps {
  duration?: number; // minimum time on screen (ms)
  accentColor?: string; // wire / text colour
  backgroundColor?: string; // sheet colour
  onComplete?: () => void;
  onDone?: () => void; // alias of onComplete
  oncePerSession?: boolean;
}

export function PortfolioPreloader({
  duration = 3600,
  accentColor = "#ffffff",
  backgroundColor = "#0a0a0a",
  onComplete,
  onDone,
  oncePerSession = false,
}: PortfolioPreloaderProps) {
  const finish = useRef(() => { onComplete?.(); onDone?.(); });
  finish.current = () => { onComplete?.(); onDone?.(); };

  const skip = useMemo(() => {
    if (typeof window === "undefined") return true;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return true;
    if (oncePerSession) { try { return sessionStorage.getItem("pl-seen") === "1"; } catch { /* ignore */ } }
    return false;
  }, [oncePerSession]);

  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"load" | "wipe" | "done">(skip ? "done" : "load");
  const [items, setItems] = useState<Item[]>([]);
  const frozen = useRef(false);
  const unlock = useRef<() => void>(() => {});

  /* measure the real page a few times while it settles (fonts, framer-motion intro…) */
  useEffect(() => {
    if (skip) return;
    const run = () => { if (!frozen.current) setItems(measurePage()); };
    const ts = [250, 700, 1300, 2000].map((t) => window.setTimeout(run, t));
    window.addEventListener("resize", run);
    window.addEventListener("load", run);
    return () => { ts.forEach(clearTimeout); window.removeEventListener("resize", run); window.removeEventListener("load", run); };
  }, [skip]);

  useEffect(() => { frozen.current = progress >= TEXT_AT - 4; }, [progress]);

  /* hide the scrollbar BEFORE the first paint (layout effect) so it never flashes.
     We keep its width (no overflow:hidden) and only make it invisible => no sideways layout shift. */
  useLayoutEffect(() => {
    if (skip) return;
    const sb = document.createElement("style");
    sb.setAttribute("data-pl-scrollbar", "");
    sb.textContent =
      `html{scrollbar-color:${backgroundColor} ${backgroundColor} !important}` +
      "html::-webkit-scrollbar-thumb,html::-webkit-scrollbar-track,html::-webkit-scrollbar-corner," +
      "body::-webkit-scrollbar-thumb,body::-webkit-scrollbar-track,body::-webkit-scrollbar-corner" +
      `{background:${backgroundColor} !important;border-color:${backgroundColor} !important;box-shadow:none !important}`;
    document.head.appendChild(sb);
    const toTop = () => { if (window.scrollY !== 0) window.scrollTo(0, 0); };
    window.addEventListener("scroll", toTop);
    unlock.current = () => {
      sb.remove();
      window.removeEventListener("scroll", toTop);
      unlock.current = () => {};
    };
    return () => unlock.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);

  /* progress driver — never hits 100 before the page has really loaded */
  useEffect(() => {
    if (skip) { finish.current(); return; }

    // swallow wheel / touch / keys so nothing (Lenis included) can scroll underneath
    const stop = (e: Event) => { e.preventDefault(); e.stopPropagation(); };
    const keys = (e: KeyboardEvent) => {
      if ([" ", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(e.key)) e.preventDefault();
    };
    window.addEventListener("wheel", stop, { passive: false, capture: true });
    window.addEventListener("touchmove", stop, { passive: false, capture: true });
    window.addEventListener("keydown", keys, true);

    let raf = 0, last = -1, timer = 0;
    let loaded = document.readyState === "complete";
    const onLoad = () => { loaded = true; };
    window.addEventListener("load", onLoad);
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      let p = eased * 100;
      if (!loaded) p = Math.min(p, 92);
      const next = Math.min(Math.floor(p + (t >= 1 && loaded ? 1 : 0)), 100);
      if (next !== last) { last = next; setProgress(next); }
      if (next >= 100) { timer = window.setTimeout(() => setPhase("wipe"), HOLD_MS); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf); clearTimeout(timer);
      window.removeEventListener("load", onLoad);
      window.removeEventListener("wheel", stop, true);
      window.removeEventListener("touchmove", stop, true);
      window.removeEventListener("keydown", keys, true);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, duration]);

  /* after the wipe: unmount + notify */
  useEffect(() => {
    if (phase !== "wipe") return;
    const t = setTimeout(() => {
      if (oncePerSession) { try { sessionStorage.setItem("pl-seen", "1"); } catch { /* ignore */ } }
      unlock.current();
      setPhase("done");
      finish.current();
    }, WIPE_MS + 150);
    return () => clearTimeout(t);
  }, [phase, oncePerSession]);

  /* column guides = the widest thing we found (the banner) */
  const col = useMemo(() => {
    if (!items.length) return null;
    const widest = items.reduce((a, b) => (b.w > a.w ? b : a), items[0]);
    return { l: widest.x, r: widest.x + widest.w };
  }, [items]);

  if (phase === "done") return null;

  const textPhase = progress >= TEXT_AT;
  const wipe = phase === "wipe";
  const n = Math.max(items.length - 1, 1);

  return (
    <div
      className={`pl-root ${wipe ? "pl-wipe" : ""} ${textPhase ? "pl-text" : ""}`}
      style={{ ["--pl-bg" as string]: backgroundColor, ["--pl-ink" as string]: accentColor }}
      aria-hidden="true"
    >
      <div className="pl-sheet">
        {/* column guides */}
        {col && (
          <>
            <div className="pl-guide-v" style={{ left: col.l }} />
            <div className="pl-guide-v" style={{ left: col.r }} />
          </>
        )}
        <span className="pl-note" style={{ left: 18, bottom: 16 }}>sheet 01 · harshit · setting out</span>
        <span className="pl-note" style={{ right: 18, bottom: 16 }}>issue 01 · {Math.round(col ? col.r - col.l : 0)}px column</span>

        {items.map((it, i) => {
          const on = progress >= 4 + (i / n) * 54;
          const showLabel = it.w >= 56 && it.h >= 14;
          const showDim = it.kind === "text" && it.w >= 300 && it.h >= 20;
          const p = it.pad ?? { l: 0, t: 0, r: 0 };
          return (
            <div key={`${i}-${it.label}`}>
              <div
                className={`pl-box ${it.kind} ${on ? "on" : ""}`}
                style={{ left: it.x, top: it.y, width: it.w, height: it.h, ["--r" as string]: it.radius ?? "0px" }}
              >
                <div className="fill" />
                {it.kind === "media" && (
                  <svg className="cross" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M0 0 L100 100 M100 0 L0 100" vectorEffect="non-scaling-stroke" />
                  </svg>
                )}
                {showLabel && <span className="pl-chip lab">{it.label}</span>}
                {it.text && (
                  <div
                    className={`ghost ${it.kind === "btn" ? "center" : ""}`}
                    style={{ ...it.textStyle, left: p.l, top: p.t, width: it.w - p.l - p.r, height: it.kind === "btn" ? it.h - p.t * 2 : undefined }}
                  >
                    {it.text}
                  </div>
                )}
              </div>
              {showDim && (
                <div className={`pl-dim ${on ? "on" : ""}`} style={{ left: it.x, top: it.y + it.h + 7, width: it.w }}>
                  <span className="pl-chip">{Math.round(it.w)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="pl-edge" />
    </div>
  );
}

export default PortfolioPreloader;