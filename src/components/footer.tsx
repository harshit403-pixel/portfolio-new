import { useEffect, useRef, useState } from "react";
import { Shell, GapBand, SectionHeader } from "@/components/Layout";
import { site } from "@/config/site";
import { ArrowRight, Fingerprint } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const QUOTES = [
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
  },
  {
    text: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson",
  },
  {
    text: "The best way to predict the future is to invent it.",
    author: "Alan Kay",
  },
  {
    text: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
  },
  {
    text: "Simplicity is the soul of efficiency.",
    author: "Austin Freeman",
  },
];

type Thumbprint = {
  id: number;
  x: number;
  y: number;
  rotation: number;
};

const THUMBPRINT_URL = "https://leave-your-thumbprint.vercel.app/";

export function Footer() {
  const [localTime, setLocalTime] = useState<string>("");
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [thumbprints, setThumbprints] = useState<Thumbprint[]>([]);
  const thumbprintArea = useRef<HTMLDivElement>(null);
  const lastThumbprint = useRef<{ x: number; y: number } | null>(null);
  const thumbprintTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setLocalTime(new Intl.DateTimeFormat("en-US", options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => thumbprintTimers.current.forEach(clearTimeout);
  }, []);

  const leaveThumbprint = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !thumbprintArea.current) return;

    const bounds = thumbprintArea.current.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const last = lastThumbprint.current;

    if (last && Math.hypot(x - last.x, y - last.y) < 44) return;

    lastThumbprint.current = { x, y };
    const print = { id: Date.now() + Math.random(), x, y, rotation: Math.random() * 28 - 14 };
    setThumbprints((prints) => [
      ...prints.slice(-14),
      print,
    ]);
    thumbprintTimers.current.push(
      setTimeout(() => {
        setThumbprints((prints) => prints.filter(({ id }) => id !== print.id));
      }, 1500),
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="w-full">
      <GapBand h="h-12" />
      {/* Scrolled Too Far Section */}
      <SectionHeader title="Scrolled Too Far" />
      <Shell className="px-6 py-10 text-center sm:px-8">
        <p className="text-[14px] text-[var(--muted)]">
          If you&apos;ve read this far, you might be interested in collaborating or building something great.
        </p>
        <a
          href={`mailto:${site.email}`}
          className="group mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--fg)] px-5 py-2.5 text-[13px] font-semibold text-[var(--bg)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          Let&apos;s Talk
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </a>
      </Shell>

      {/* Thumbprint invitation */}
      <div className="w-full border-t border-[var(--line)]">
        <Shell className="px-6 sm:px-8">
          <div
            ref={thumbprintArea}
            onPointerMove={leaveThumbprint}
            onPointerLeave={() => {
              lastThumbprint.current = null;
            }}
            className="relative isolate overflow-hidden py-14 text-center"
          >
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
              <AnimatePresence>
                {thumbprints.map((print) => (
                  <motion.div
                    key={print.id}
                    className="absolute size-8 text-sky-400"
                    style={{ left: print.x, top: print.y, marginLeft: -16, marginTop: -16 }}
                    initial={{ opacity: 0, scale: 0.72, rotate: print.rotation - 6 }}
                    animate={{ opacity: 0.34, scale: 1, rotate: print.rotation }}
                    exit={{ opacity: 0, scale: 1.08, y: -7 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                  >
                    <Fingerprint className="size-full" strokeWidth={0.85} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-4 flex justify-center">
              <a
                href={THUMBPRINT_URL}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-4 py-2 text-[13px] font-semibold text-[var(--fg)] transition-colors duration-200 hover:border-sky-400/60 hover:text-sky-300"
              >
                <Fingerprint className="size-3.5" />
                Leave your thumbprint
                <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </Shell>
      </div>

      {/* Quote Band */}
      <GapBand className="border-t border-[var(--line)]" />
      <div className="w-full border-y border-[var(--line)]">
        <Shell className="px-8 py-12 text-center min-h-[160px] flex flex-col items-center justify-center bg-[var(--bg)] select-none">
          <div className="w-full max-w-[580px] min-h-[140px] flex flex-col items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="flex flex-col items-center"
              >
                <span className="font-serif text-4xl text-[var(--soft)] leading-none">&ldquo;</span>
                <p className="font-serif mx-auto -mt-2 max-w-md text-[20px] sm:text-[22px] italic leading-snug text-[var(--fg)]">
                  {QUOTES[quoteIndex].text}
                </p>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--soft)] font-bold">
                  — {QUOTES[quoteIndex].author}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </Shell>
      </div>

      {/* Footer Bottom */}
      <GapBand h="h-5" />
      <div className="w-full border-t border-[var(--line)]">
        <Shell className="border-b-0 px-6 py-8 text-center sm:px-8">
          <p className="text-[14.5px] text-[var(--muted)]">
            Designed &amp; Developed by <span className="font-semibold text-[var(--fg)]">{site.name}</span>
          </p>
          <p className="mt-1.5 font-mono text-[12px] text-[var(--soft)]">
            © {new Date().getFullYear()} All rights reserved.
          </p>
          <p className="mt-2.5 flex items-center justify-center gap-2 font-mono text-[12px] text-[var(--soft)]">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            {site.location} · {localTime || "IST"}
          </p>
        </Shell>
      </div>
    </footer>
  );
}
