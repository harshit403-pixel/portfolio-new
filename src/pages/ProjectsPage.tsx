import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { site, type Project } from "@/config/site";
import { Reveal } from "@/components/reveal";
import { ProjectCard } from "@/components/projects";
import {
  Search,
  Filter,
  X,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { GitHubIcon } from "@/components/icons";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeModalProject, setActiveModalProject] =
    useState<Project | null>(null);

  const categories = ["All", "Frontend", "Backend", "Fullstack"];

  /*
   * Keep URL search parameter synced with the search box
   */
  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";

    if (searchQuery !== currentSearch) {
      if (searchQuery.trim()) {
        setSearchParams({ search: searchQuery });
      } else {
        setSearchParams({});
      }
    }
  }, [searchQuery, searchParams, setSearchParams]);

  /*
   * Escape key + prevent background scrolling
   * while project modal is open.
   */
  useEffect(() => {
    if (!activeModalProject) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveModalProject(null);
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeModalProject]);

  /*
   * Filter projects
   */
  const filteredProjects = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return site.projects.filter((project) => {
      const matchesSearch =
        !query ||
        project.title.toLowerCase().includes(query) ||
        project.blurb.toLowerCase().includes(query) ||
        project.stack.some((tech) =>
          tech.toLowerCase().includes(query)
        );

      const matchesCategory =
        selectedCategory === "All" ||
        project.categories?.includes(
          selectedCategory as "Frontend" | "Backend" | "Fullstack"
        );

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSearchParams({});
  };

  return (
    <>
      <main className="min-h-screen">
        {/* =========================================================
            HEADER
        ========================================================= */}

        <section className="border-b border-[var(--line)]">
          <div className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
            <Reveal>
              <div className="max-w-3xl">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-8 bg-[var(--fg)]" />

                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                    Selected Work
                  </span>
                </div>

                <h1 className="text-5xl font-medium tracking-[-0.04em] text-[var(--fg)] md:text-7xl">
                  Projects
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--muted)] md:text-lg">
                  A collection of things I have built across frontend,
                  backend, full-stack development, AI, and DevOps.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* =========================================================
            FILTER BAR
        ========================================================= */}

        <section className="border-b border-[var(--line)]">
          <div className="mx-auto max-w-7xl px-6 py-5 md:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Search */}
              <div className="relative w-full lg:max-w-sm">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search projects..."
                  className="h-10 w-full border border-[var(--line)] bg-[var(--card)] pl-10 pr-10 text-sm text-[var(--fg)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--fg)]"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="flex items-center gap-2 overflow-x-auto">
                <div className="mr-2 hidden items-center gap-2 text-xs text-[var(--muted)] sm:flex">
                  <Filter size={14} />
                  <span>Filter</span>
                </div>

                {categories.map((category) => {
                  const active = selectedCategory === category;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`relative whitespace-nowrap border px-4 py-2 text-xs transition-colors ${
                        active
                          ? "border-[var(--fg)] text-[var(--fg)]"
                          : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--fg)] hover:text-[var(--fg)]"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="active-project-filter"
                          className="absolute inset-0 -z-0 bg-[var(--hover)]"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 35,
                          }}
                        />
                      )}

                      <span className="relative z-10">
                        {category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            PROJECT GRID
        ========================================================= */}

        <section>
          <div className="mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-16">
            {filteredProjects.length > 0 ? (
              <div className="grid gap-px border border-[var(--line)] bg-[var(--line)] md:grid-cols-2">
                {filteredProjects.map((project, index) => (
                  <div
                    key={project.title}
                    onClick={() => setActiveModalProject(project)}
                    className="cursor-pointer bg-[var(--bg)]"
                  >
                    <ProjectCard p={project} i={index} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-[var(--line)] py-24 text-center">
                <p className="text-lg text-[var(--fg)]">
                  No projects found.
                </p>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  Try changing your search or filter.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 inline-flex items-center gap-2 border border-[var(--line)] px-4 py-2 text-sm text-[var(--fg)] transition-colors hover:bg-[var(--hover)]"
                >
                  Clear filters
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Results count */}
            {filteredProjects.length > 0 && (
              <div className="mt-5 flex items-center justify-between text-xs text-[var(--muted)]">
                <span>
                  {filteredProjects.length}{" "}
                  {filteredProjects.length === 1
                    ? "project"
                    : "projects"}
                </span>

                {(searchQuery || selectedCategory !== "All") && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="transition-colors hover:text-[var(--fg)]"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* =========================================================
          PROJECT DETAIL MODAL
      ========================================================= */}

      <AnimatePresence>
        {activeModalProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <motion.button
              type="button"
              aria-label="Close project details"
              className="fixed inset-0 cursor-default bg-[var(--bg)]/80 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setActiveModalProject(null)}
            />

            {/* Modal */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-modal-title"
              initial={{
                opacity: 0,
                y: 30,
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
                damping: 30,
              }}
              className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden border border-[var(--line)] bg-[var(--bg)] shadow-2xl"
            >
              {/* =====================================================
                  MODAL TOP BAR
              ===================================================== */}

              <div className="flex shrink-0 items-center justify-between border-b border-[var(--line)] px-5 py-4 md:px-7">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                    Project
                  </span>

                  <span className="h-1 w-1 bg-[var(--muted)]" />

                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                    {activeModalProject.year}
                  </span>

                  {activeModalProject.featured && (
                    <>
                      <span className="h-1 w-1 bg-[var(--muted)]" />

                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--fg)]">
                        Featured
                      </span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModalProject(null)}
                  className="flex h-9 w-9 items-center justify-center border border-[var(--line)] text-[var(--muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
                  aria-label="Close"
                >
                  <X size={17} />
                </button>
              </div>

              {/* =====================================================
                  MODAL CONTENT
              ===================================================== */}

              <div className="overflow-y-auto">
                {/* Hero */}
                <div className="grid border-b border-[var(--line)] lg:grid-cols-[1.15fr_0.85fr]">
                  {/* Image */}
                  {activeModalProject.image ? (
                    <div className="relative aspect-video overflow-hidden border-b border-[var(--line)] bg-[var(--card)] lg:border-b-0 lg:border-r lg:aspect-auto lg:min-h-[340px]">
                      <img
                        src={activeModalProject.image}
                        alt={activeModalProject.title}
                        className="h-full w-full object-cover"
                      />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    </div>
                  ) : (
                    <div className="hidden lg:block" />
                  )}

                  {/* Intro */}
                  <div className="flex flex-col justify-between p-6 md:p-8">
                    <div>
                      <div className="mb-6 flex flex-wrap gap-2">
                        {activeModalProject.categories?.map(
                          (category) => (
                            <span
                              key={category}
                              className="border border-[var(--line)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]"
                            >
                              {category}
                            </span>
                          )
                        )}

                        {activeModalProject.status && (
                          <span className="border border-[var(--line)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg)]">
                            {activeModalProject.status}
                          </span>
                        )}
                      </div>

                      <h2
                        id="project-modal-title"
                        className="text-4xl font-medium tracking-[-0.04em] text-[var(--fg)] md:text-5xl"
                      >
                        {activeModalProject.title}
                      </h2>

                      <p className="mt-5 text-sm leading-7 text-[var(--muted)] md:text-base">
                        {activeModalProject.blurb}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-8 flex flex-wrap gap-2">
                      {activeModalProject.links.live && (
                        <a
                          href={activeModalProject.links.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                          className="inline-flex items-center gap-2 border border-[var(--fg)] bg-[var(--fg)] px-4 py-2.5 text-sm text-[var(--bg)] transition-opacity hover:opacity-80"
                        >
                          Live Demo
                          <ArrowUpRight size={15} />
                        </a>
                      )}

                      {activeModalProject.links.source && (
                        <a
                          href={activeModalProject.links.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                          className="inline-flex items-center gap-2 border border-[var(--line)] px-4 py-2.5 text-sm text-[var(--fg)] transition-colors hover:bg-[var(--hover)]"
                        >
                          <GitHubIcon className="h-4 w-4" />
                          Source
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* =================================================
                    DETAILS
                ================================================= */}

                <div className="grid lg:grid-cols-[1fr_280px]">
                  {/* Story */}
                  <div className="border-b border-[var(--line)] lg:border-b-0 lg:border-r">
                    <div className="border-b border-[var(--line)] px-6 py-4 md:px-8">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                        About the project
                      </span>
                    </div>

                    <div className="p-6 md:p-8">
                      {activeModalProject.story ? (
                        <div className="space-y-5">
                          {activeModalProject.story
                            .split("\n\n")
                            .map((paragraph, index) => (
                              <p
                                key={index}
                                className="text-sm leading-7 text-[var(--muted)] md:text-base"
                              >
                                {paragraph}
                              </p>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm leading-7 text-[var(--muted)] md:text-base">
                          {activeModalProject.blurb}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stack */}
                  <div>
                    <div className="border-b border-[var(--line)] px-6 py-4 md:px-7">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                        Tech Stack
                      </span>
                    </div>

                    <div className="p-6 md:p-7">
                      <div className="flex flex-wrap gap-2">
                        {activeModalProject.stack.map((tech) => (
                          <span
                            key={tech}
                            className="border border-[var(--line)] px-3 py-2 text-xs text-[var(--fg)]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    MODAL FOOTER
                ================================================= */}

                <div className="flex flex-col gap-3 border-t border-[var(--line)] px-6 py-4 md:flex-row md:items-center md:justify-between md:px-8">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                    {activeModalProject.title} ·{" "}
                    {activeModalProject.year}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveModalProject(null)}
                    className="inline-flex items-center gap-2 self-start text-xs text-[var(--muted)] transition-colors hover:text-[var(--fg)] md:self-auto"
                  >
                    Close details
                    <X size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}