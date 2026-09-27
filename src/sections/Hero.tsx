import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shell } from "@/components/Layout";
import { site } from "@/config/site";
import { MapPin, Search, RotateCw, Eye } from "lucide-react";
import { useVisitor } from "@/context/VisitorContext";
import { HireMeWeb } from "@/components/HireMeWeb";

const HEADLINE_TITLES = [
  "Full Stack Developer",
  "Software Engineer",
  "Creative Developer",
  "AI & Backend Builder",
];

export function Hero({ onOpenPalette }: { onOpenPalette?: () => void }) {
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [imgIndex, setImgIndex] = useState(0);
  const { count, isLoading } = useVisitor();

  const handleNextImage = () => {
    const nextIndex = (imgIndex + 1) % site.profileImages.length;
    setImgIndex(nextIndex);
    window.dispatchEvent(new CustomEvent("profileImageChanged", { detail: nextIndex }));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % HEADLINE_TITLES.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative ">
      <HireMeWeb/>
      {/* Cover Banner */}
      <Shell className="">
        <div className="relative h-36 overflow-hidden  bg-neutral-950 sm:h-44 border border-[var(--line)]">
          <img
            src={site.bannerImage}
            alt="Starry Night banner"
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover object-center opacity-90 transition-opacity duration-300 hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/40 to-transparent" />
          <div className="absolute inset-0 opacity-20 [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.05)_0,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_5px)]" />
          <div className="absolute inset-0 [background-image:repeating-linear-gradient(90deg,rgba(0,0,0,0.12)_0,rgba(0,0,0,0.12)_1px,transparent_1px,transparent_28px)] opacity-30" />
        </div>
      </Shell>

      {/* Profile Avatar & Identity */}
      <Shell className="px-6 py-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-6 justify-between"
        >
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-5">
            <div 
              onClick={handleNextImage}
              className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--chip)] shadow-md group cursor-pointer select-none animate-fade-up"
              title="Click to change profile image"
            >
              {/* Main Avatar Image */}
              <img
                src={site.profileImages[imgIndex]}
                alt={site.name}
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover pointer-events-none"
              />

              {/* CRT scanline overlay */}
              <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden opacity-[0.18] group-hover:opacity-30 transition-opacity bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]">
                <div className="absolute inset-0 h-1 bg-white/20 blur-[1px] animate-scanline" />
              </div>

              {/* Switch image icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-1 top-1 rounded-full border border-[var(--line)] bg-[var(--chip)] p-1 text-[var(--muted)] transition-all hover:text-[var(--fg)] hover:scale-110 sm:opacity-100 opacity-0 group-hover:opacity-100 z-20 cursor-pointer shadow-sm"
                aria-label="Switch profile image"
              >
                <RotateCw size={10} strokeWidth={2} />
              </button>
            </div>
            <div>
              <h1 className="font-serif text-3xl sm:text-[38px] leading-none tracking-tight text-[var(--fg)] text-glitch">
                {site.name}
              </h1>
              <div className="h-[20px] overflow-hidden mt-1">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={headlineIndex}
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -12, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="font-mono text-[13px] text-[var(--muted)]"
                  >
                    {HEADLINE_TITLES[headlineIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
              <p className="mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1 font-mono text-[11px] text-[var(--soft)]">
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="shrink-0" /> {site.location}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Eye size={12} className="shrink-0" />
                  <span>{isLoading ? "..." : count?.toLocaleString()} views</span>
                </span>
              </p>
            </div>
          </div>

          {/* Quick Command Palette Keyboard Badge */}
          {onOpenPalette && (
            <button
              onClick={onOpenPalette}
              className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--chip)] px-3 py-1.5 font-mono text-[11px] text-[var(--muted)] hover:text-[var(--fg)] hover:border-[var(--soft)] transition-colors shadow-sm cursor-pointer"
              title="Open Command Palette (Ctrl+K)"
            >
              <Search size={14} />
              <span>⌘K</span>
            </button>
          )}
        </motion.div>
      </Shell>
    </div>
  );
}
