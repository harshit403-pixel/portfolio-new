import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { site, type Project } from "@/config/site";
import { Reveal, SectionHeader } from "./reveal";
import { ArrowUpRight, GitHubIcon } from "./icons";

const getTechIcon = (tech: string) => {
  const map: Record<string, string> = {
    "React.js": "https://img.icons8.com/color/48/react-native.png",
    "React": "https://img.icons8.com/color/48/react-native.png",
    "Tailwind CSS": "https://img.icons8.com/color/48/tailwindcss.png",
    "Tailwind CSS v4": "https://img.icons8.com/color/48/tailwindcss.png",
    "Zustand": "https://img.icons8.com/color/48/settings.png",
    "lucide-react": "https://img.icons8.com/color/48/sparkles.png",
    "Node.js": "https://img.icons8.com/color/48/nodejs.png",
    "Socket.IO": "https://img.icons8.com/color/48/socket.io.png",
    "TypeScript": "https://img.icons8.com/color/48/typescript.png",
    "Next.js": "https://img.icons8.com/color/48/nextjs.png",
    "Prisma": "https://img.icons8.com/color/48/prisma.png",
    "PostgreSQL": "https://img.icons8.com/color/48/postgresql.png",
    "React Query": "https://img.icons8.com/color/48/data-configuration.png",
    "@dnd-kit": "https://img.icons8.com/color/48/drag-and-drop.png",
    "Next-Auth": "https://img.icons8.com/color/48/shield.png",
    "Vite": "https://img.icons8.com/color/48/vite.png",
    "Monaco Editor": "https://img.icons8.com/color/48/code.png",
    "Pyodide": "https://img.icons8.com/color/48/python.png",
    "Dexie.js": "https://img.icons8.com/color/48/database.png",
    "Supabase": "https://img.icons8.com/color/48/supabase.png",
    "Zod": "https://img.icons8.com/color/48/verified-badge.png",
    "Vitest": "https://img.icons8.com/color/48/test-tube.png"
  };
  return map[tech] || `https://img.icons8.com/color/48/code.png`;
};

const getProjectGradient = (index: number) => {
  const gradients = [
    "from-emerald-950/60 via-neutral-900 to-neutral-950",
    "from-indigo-950/60 via-neutral-900 to-neutral-950",
    "from-purple-950/60 via-neutral-900 to-neutral-950",
    "from-rose-950/60 via-neutral-900 to-neutral-950",
    "from-cyan-950/60 via-neutral-900 to-neutral-950",
    "from-amber-950/60 via-neutral-900 to-neutral-950"
  ];
  return gradients[index % gradients.length];
};

export function ProjectCard({ p, i }: { p: Project; i: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <Reveal delay={i * 0.05}>
      <article
        id={`project-card-${p.title.toLowerCase()}`}
        className="group relative flex flex-col justify-between h-full rounded-2xl border border-neutral-800 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-600 hover:shadow-2xl hover:shadow-black/40 backdrop-blur-md bg-neutral-900/40"
      >
        <div>
          {/* Creative Banner Canvas Header */}
          <div className={`relative mb-5 h-60 sm:h-64 w-full overflow-hidden rounded-xl border border-neutral-800 bg-gradient-to-br ${getProjectGradient(i)} p-4 flex flex-col justify-between`}>
            {/* Background Grid Pattern */}
            <div className="bg-grid absolute inset-0 opacity-20 pointer-events-none" />

            {/* Viewfinder Reticles & Outer Frame */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 font-mono text-[9px] text-white">
              <div className="absolute inset-0 border border-white/20 rounded-xl pointer-events-none" />
              <div className="absolute top-2.5 left-2.5 w-2.5 h-2.5 border-t border-l border-white/70" />
              <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 border-t border-r border-white/70" />
              <div className="absolute bottom-2.5 left-2.5 w-2.5 h-2.5 border-b border-l border-white/70" />
              <div className="absolute bottom-2.5 right-2.5 w-2.5 h-2.5 border-b border-r border-white/70" />
            </div>

            {/* Top Badges Row */}
            <div className="relative z-20 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {p.status ? (
                  <span className="rounded-md bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-amber-300 backdrop-blur-md">
                    • {p.status}
                  </span>
                ) : (
                  <span className="rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-emerald-300 backdrop-blur-md">
                    • Live
                  </span>
                )}
              </div>

              {p.featured && (
                <span className="rounded-md bg-white/20 border border-white/30 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                  ★ Featured
                </span>
              )}
            </div>

            {/* Prominent & Fully Visible Project Screenshot */}
            {p.image && !imgError ? (
              <div className="relative mt-2 h-44 sm:h-48 w-full overflow-hidden rounded-lg border border-neutral-800/80 shadow-md bg-neutral-900 transition-all duration-300 group-hover:border-neutral-600 group-hover:shadow-xl">
                <img
                  src={p.image}
                  alt={`${p.title} preview`}
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={() => setImgError(true)}
                />
              </div>
            ) : (
              <div className="relative mt-2 h-44 sm:h-48 w-full overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/95 shadow-md p-4 flex flex-col justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500/80" />
                  <span className="h-2 w-2 rounded-full bg-amber-500/80" />
                  <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
                  <span className="font-mono text-[9px] text-neutral-400 ml-2">{p.title.toLowerCase()}</span>
                </div>
                <div className="font-serif text-xl text-neutral-100">{p.title}</div>
              </div>
            )}
          </div>

          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="font-serif text-2xl font-normal tracking-tight text-neutral-100 group-hover:text-white transition-colors">
                {p.title}
              </h3>
            </div>
            <span className="font-mono text-xs text-neutral-500">{p.year}</span>
          </div>

          <p className="mt-2 text-sm text-neutral-300 leading-relaxed">{p.blurb}</p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {p.stack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900/60 px-2.5 py-1 font-mono text-[10px] text-neutral-300 hover:border-neutral-600 hover:text-white transition-colors"
              >
                <img
                  src={getTechIcon(tech)}
                  alt={`${tech} icon`}
                  className="w-3.5 h-3.5 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "https://img.icons8.com/color/48/code.png";
                  }}
                />
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm">
              {p.links.live && (
                <a
                  href={p.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-white transition-colors hover:text-emerald-400"
                >
                  live <ArrowUpRight />
                </a>
              )}
              {p.links.source && (
                <a
                  href={p.links.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-neutral-400 transition-colors hover:text-white"
                >
                  <GitHubIcon className="h-4 w-4" /> source
                </a>
              )}
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 text-xs font-mono font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              {isExpanded ? "Hide details" : "Show details"}
              <svg
                className={`h-3 w-3 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                {p.story && (
                  <div className="mt-3 border-t border-neutral-800 pt-3">
                    <div className="text-xs leading-relaxed text-neutral-400 space-y-1.5">
                      {p.story.split("\n\n").map((para, idx) => {
                        const isItalic = para.startsWith("*") && para.endsWith("*");
                        const content = isItalic ? para.slice(1, -1) : para;
                        return (
                          <p key={idx} className={isItalic ? "italic text-neutral-300 font-serif" : ""}>
                            {content}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </article>
    </Reveal>
  );
}

export function Projects() {
  if (!site.projects.length) return null;

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-12">
      <SectionHeader id="projects" index="03" title="things I've built" />

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {site.projects.map((p, i) => (
          <ProjectCard key={p.title} p={p} i={i} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 px-6 py-3 text-sm font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white transition-all duration-300 hover:scale-[1.03]"
        >
          view full project gallery & archive →
        </Link>
      </div>
    </section>
  );
}
