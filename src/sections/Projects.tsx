import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shell, SectionHeader } from "@/components/Layout";
import { site, type Project } from "@/config/site";
import { ProjectCard } from "./ProjectCard";
import {
  Search,
  X,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { GitHubIcon } from "@/components/icons";
import { useNavigate } from "react-router-dom";

export function Projects({
  isSearchable = false,
  limit,
}: {
  isSearchable?: boolean;
  limit?: number;
}) {
  const navigate = useNavigate();
  const [projectTab, setProjectTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProject, setActiveProject] = useState<Project | null>(
    null
  );

const displayedProjects = useMemo(() => {
  const filtered = site.projects.filter((p) => {
    if (
      projectTab === "Frontend" &&
      !p.categories?.includes("Frontend")
    ) {
      return false;
    }

    if (
      projectTab === "Backend" &&
      !p.categories?.includes("Backend")
    ) {
      return false;
    }

    if (
      projectTab === "Fullstack" &&
      !p.categories?.includes("Fullstack")
    ) {
      return false;
    }

    if (isSearchable && searchQuery) {
      const q = searchQuery.toLowerCase();

      return (
        p.title.toLowerCase().includes(q) ||
        p.blurb.toLowerCase().includes(q) ||
        p.stack.some((t) =>
          t.toLowerCase().includes(q)
        )
      );
    }

    return true;
  });

  return limit ? filtered.slice(0, limit) : filtered;
}, [projectTab, searchQuery, isSearchable, limit]);

  /*
   * Close modal with Escape
   * and prevent background scrolling.
   */
  useEffect(() => {
    if (!activeProject) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveProject(null);
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeProject]);

  return (
    <>
    
      <div id="projects">
        <SectionHeader
          title="Projects"
          aside={
            !isSearchable ? (
              <div className="flex gap-1 rounded-lg border border-[var(--line)] bg-[var(--chip)] p-0.5">
                {["All", "Frontend", "Backend", "Fullstack"].map(
                  (tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setProjectTab(tab)}
                      className={`flex cursor-pointer items-center justify-center rounded-md px-2.5 py-1 text-center text-[11px] font-medium transition-all duration-200 ${
                        projectTab === tab
                          ? "bg-[var(--fg)] font-semibold text-[var(--bg)] shadow-sm"
                          : "text-[var(--muted)] hover:text-[var(--fg)]"
                      }`}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>
            ) : undefined
          }
        />

        <Shell className="px-6 py-6 sm:px-8">
          {/* Search Bar */}
          {isSearchable && (
            <div className="mb-6 flex flex-col gap-4 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--soft)]" />

                <input
                  type="text"
                  placeholder="Search projects, technologies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--chip)] py-2 pl-9 pr-10 text-[12.5px] text-[var(--fg)] outline-none transition-all placeholder:text-[var(--soft)] focus:border-[var(--soft)]"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[var(--soft)] hover:text-[var(--fg)]"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              <div className="flex gap-1 rounded-lg border border-[var(--line)] bg-[var(--chip)] p-0.5">
                {["All", "Frontend", "Backend", "Fullstack"].map(
                  (tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setProjectTab(tab)}
                      className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md px-2.5 py-1 text-center text-[11px] font-medium transition-all duration-200 ${
                        projectTab === tab
                          ? "bg-[var(--fg)] font-semibold text-[var(--bg)] shadow-sm"
                          : "text-[var(--muted)] hover:text-[var(--fg)]"
                      }`}
                    >
                      <span>{tab}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Projects */}
          <div
          data-cursor-label="click to view project details"
          className="grid gap-4 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {displayedProjects.map((p, idx) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{
                    duration: 0.25,
                    ease: "easeOut",
                  }}
                  className="cursor-pointer"
                  onClick={() => setActiveProject(p)}
                >
                  <ProjectCard project={p} index={idx} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {limit && (
  <div className="mt-8 flex justify-center">
    <button
      type="button"
      onClick={() => navigate("/projects")}
      className="group inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--chip)] px-5 py-2.5 text-[12px] font-medium text-[var(--fg)] transition-all duration-200 hover:bg-[var(--hover)]"
    >
      View All Projects

      <ArrowUpRight
        className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </button>
  </div>
)}

          {displayedProjects.length === 0 && (
            <div className="py-12 text-center font-mono text-[13.5px] text-[var(--muted)]">
              No projects match your current filter.
            </div>
          )}
        </Shell>
      </div>
      

      {/* ============================================================
          PROJECT DETAIL MODAL
      ============================================================ */}

            {/* ============================================================
          PROJECT DETAIL MODAL
      ============================================================ */}

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {activeProject && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop */}
                <motion.button
                  type="button"
                  aria-label="Close project details"
                  onClick={() => setActiveProject(null)}
                  className="fixed inset-0 cursor-default bg-black/50 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />

                {/* Modal */}
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="project-modal-title"
                  initial={{
                    opacity: 0,
                    y: 25,
                    scale: 0.97,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: 20,
                    scale: 0.98,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 28,
                  }}
                  className="relative z-[10000] flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg)] shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* ======================================================
                      MODAL HEADER
                  ====================================================== */}

                  <div className="flex shrink-0 items-center justify-between border-b border-[var(--line)] px-5 py-4 sm:px-7">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                        Project
                      </span>

                      <span className="text-[var(--soft)]">/</span>

                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                        {activeProject.year}
                      </span>

                      {activeProject.featured && (
                        <>
                          <span className="text-[var(--soft)]">/</span>

                          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--fg)]">
                            Featured
                          </span>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveProject(null)}
                      className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-[var(--line)] text-[var(--muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
                      aria-label="Close project details"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  {/* ======================================================
                      MODAL BODY
                  ====================================================== */}

                  <div
  data-lenis-prevent
  className="min-h-0 overflow-y-auto overscroll-contain"
>
                    {/* Project image */}
                    {activeProject.image && (
                      <div className="border-b border-[var(--line)] bg-[var(--chip)]">
                        <div className="relative aspect-[16/7] w-full overflow-hidden">
                          <img
                            src={activeProject.image}
                            alt={activeProject.title}
                            className="h-full w-full object-cover"
                          />

                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                        </div>
                      </div>
                    )}

                    {/* Project intro */}
                    <div className="border-b border-[var(--line)] p-6 sm:p-8">
                      <div className="mb-5 flex flex-wrap gap-2">
                        {activeProject.categories?.map((category) => (
                          <span
                            key={category}
                            className="rounded-md border border-[var(--line)] bg-[var(--chip)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]"
                          >
                            {category}
                          </span>
                        ))}

                        {activeProject.status && (
                          <span className="rounded-md border border-[var(--line)] bg-[var(--chip)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg)]">
                            {activeProject.status}
                          </span>
                        )}
                      </div>

                      <h2
                        id="project-modal-title"
                        className="text-3xl font-medium tracking-[-0.035em] text-[var(--fg)] sm:text-4xl"
                      >
                        {activeProject.title}
                      </h2>

                      <p className="mt-4 max-w-3xl text-[13.5px] leading-7 text-[var(--muted)] sm:text-[14px]">
                        {activeProject.blurb}
                      </p>

                      {(activeProject.links.live ||
                        activeProject.links.source) && (
                        <div className="mt-6 flex flex-wrap gap-2">
                          {activeProject.links.live && (
                            <a
                              href={activeProject.links.live}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-2 rounded-md bg-[var(--fg)] px-4 py-2.5 text-[12px] font-medium text-[var(--bg)] transition-opacity hover:opacity-80"
                            >
                              Live Demo
                              <ArrowUpRight className="size-3.5" />
                            </a>
                          )}

                          {activeProject.links.source && (
                            <a
                              href={activeProject.links.source}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--chip)] px-4 py-2.5 text-[12px] font-medium text-[var(--fg)] transition-colors hover:bg-[var(--hover)]"
                            >
                              <GitHubIcon className="size-4" />
                              Source
                              <ExternalLink className="size-3.5" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Project information */}
                    <div className="grid sm:grid-cols-[1fr_260px]">
                      {/* About */}
                      <div className="border-b border-[var(--line)] sm:border-b-0 sm:border-r">
                        <div className="border-b border-[var(--line)] px-6 py-4 sm:px-8">
                          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                            About
                          </span>
                        </div>

                        <div className="p-6 sm:p-8">
                          {activeProject.story ? (
                            <div className="space-y-5">
                              {activeProject.story
                                .split("\n\n")
                                .map((paragraph, index) => (
                                  <p
                                    key={index}
                                    className="text-[13.5px] leading-7 text-[var(--muted)] sm:text-[14px]"
                                  >
                                    {paragraph}
                                  </p>
                                ))}
                            </div>
                          ) : (
                            <p className="text-[13.5px] leading-7 text-[var(--muted)]">
                              {activeProject.blurb}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Tech Stack */}
                      <div>
                        <div className="border-b border-[var(--line)] px-6 py-4 sm:px-7">
                          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                            Tech Stack
                          </span>
                        </div>

                        <div className="p-6 sm:p-7">
                          <div className="flex flex-wrap gap-2">
                            {activeProject.stack.map((tech) => (
                              <span
                                key={tech}
                                className="rounded-md border border-[var(--line)] bg-[var(--chip)] px-2.5 py-2 text-[11px] text-[var(--fg)]"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-[var(--line)] px-6 py-4 sm:px-8">
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--soft)]">
                        {activeProject.title} · {activeProject.year}
                      </span>

                      <button
                        type="button"
                        onClick={() => setActiveProject(null)}
                        className="cursor-pointer text-[11px] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}