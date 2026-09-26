import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Project } from "@/config/site";
import { Globe, ChevronDown, ChevronUp } from "lucide-react";
import { GitHubIcon } from "@/components/icons";

const getProjectGradient = (index: number) => {
  return "from-[var(--chip)] via-[var(--card)] to-[var(--bg)]/40";
};

export function ProjectCard({ project: p, index = 0 }: { project: Project; index?: number }) {
  const [showDetails, setShowDetails] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group flex flex-col justify-between rounded-xl border border-[var(--line)] bg-[var(--card)] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--soft)] hover:shadow-md h-full">
      <div>
        {/* Angled Screenshot Preview Canvas Box */}
        <div className={`relative mb-4 h-48 w-full overflow-hidden rounded-lg border border-[var(--line)] bg-gradient-to-br ${getProjectGradient(index)} p-3 flex flex-col justify-between`}>
          <div className="bg-stripes absolute inset-0 opacity-20 pointer-events-none" />

          {/* Viewfinder Reticles (Camera REC / ISO) */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 font-mono text-[9px] text-white">
            <div className="absolute top-2.5 left-2.5 w-2.5 h-2.5 border-t border-l border-white/70" />
            <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 border-t border-r border-white/70" />
            <div className="absolute bottom-2.5 left-2.5 w-2.5 h-2.5 border-b border-l border-white/70" />
            <div className="absolute bottom-2.5 right-2.5 w-2.5 h-2.5 border-b border-r border-white/70" />
            <div className="absolute top-2.5 left-7 flex items-center gap-1 text-[8px] font-semibold text-white/80">
              <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" /> REC
            </div>
            <div className="absolute top-2.5 right-7 text-[8px] text-white/80 font-semibold">
              ISO 400
            </div>
          </div>

          {/* Top Badges Row */}
          <div className="relative z-20 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {p.status ? (
                <span className="rounded bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-amber-300 backdrop-blur-md">
                  • {p.status}
                </span>
              ) : (
                <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-emerald-300 backdrop-blur-md flex items-center gap-1">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </span>
              )}
            </div>

            {p.featured && (
              <span className="rounded bg-amber-400/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-500 border border-amber-500/30">
                Featured
              </span>
            )}
          </div>

          {/* Angled Screenshot Image */}
          {p.image && !imgError ? (
            <div className="absolute -right-6 -bottom-3 w-56 h-32 sm:-right-12 sm:-bottom-5 sm:w-72 sm:h-40 rounded-lg border-4 border-[var(--bg)]/40 shadow-xl overflow-hidden group-hover:-right-4 group-hover:-bottom-1 sm:group-hover:-right-9 sm:group-hover:-bottom-2 transition-all duration-300 pointer-events-none">
              <img
                src={p.image}
                alt={`${p.title} preview`}
                className="w-full h-full object-cover object-top"
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className="font-serif text-2xl text-[var(--fg)] self-end opacity-90">{p.title}</div>
          )}
        </div>

        {/* Project Header Info */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[16px] font-semibold tracking-wide text-[var(--fg)] group-hover:text-[var(--fg)]">
            {p.title}
          </h3>
          <span className="font-mono text-xs text-[var(--soft)]">{p.year}</span>
        </div>

        <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)] line-clamp-4">
          {p.blurb}
        </p>

        {/* Collapsible Details Drawer */}
        
      </div>

      {/* Tech Pills & Direct Links */}
      <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-[var(--line)]/50">
        <div className="flex flex-wrap gap-1.5">
          {p.stack.map((t) => (
            <span
              key={t}
              className="rounded bg-[var(--chip)] px-2 py-0.5 font-mono text-[10.5px] text-[var(--muted)] border border-[var(--line)]/30"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2.5 text-[var(--soft)]">
          {p.links.live && (
            <a
              href={p.links.live}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${p.title} live site`}
              className="transition-all duration-200 hover:-translate-y-0.5 hover:text-[var(--fg)]"
            >
              <Globe className="size-4" />
            </a>
          )}
          {p.links.source && (
            <a
              href={p.links.source}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${p.title} repository`}
              className="transition-all duration-200 hover:-translate-y-0.5 hover:text-[var(--fg)]"
            >
              <GitHubIcon className="size-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
