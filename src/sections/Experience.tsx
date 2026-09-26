
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Shell, SectionHeader } from "@/components/Layout";
import { site } from "@/config/site";
import { ExternalLink } from "lucide-react";

export function Experience({ isDetailed }: { isDetailed?: boolean }) {
  const location = useLocation();

  const isExperiencePage =
    isDetailed ??
    location.pathname.startsWith("/experience");

  if (!site.experience.length) return null;

  return (
    <div id="experience">
      <SectionHeader title="Experience" />

      <Shell>
        {site.experience.map((job, i) => (
          <motion.div
            key={`${job.company}-${i}`}
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              margin: "-50px",
            }}
            transition={{
              duration: 0.4,
              delay: i * 0.05,
            }}
            className={`px-6 py-6 transition-colors duration-200 hover:bg-[var(--hover)] sm:px-8 ${
              i > 0
                ? "border-t border-[var(--line)]"
                : ""
            }`}
          >
            {/* Experience Header */}

            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="flex items-center gap-2 text-[15.5px] font-semibold text-[var(--fg)]">
                {job.role}

                <span className="text-[var(--soft)]">
                  ·
                </span>

                <span className="text-[var(--muted)]">
                  {job.company}
                </span>

                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${job.company}`}
                  >
                    <ExternalLink
                      size={14}
                      className="text-[var(--soft)]"
                    />
                  </a>
                )}
              </h3>

              <span className="font-mono text-[11px] text-[var(--soft)]">
                {job.period}
              </span>
            </div>

            {/* Experience Description */}

            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-[var(--muted)]">
              {job.blurb}
            </p>
          </motion.div>
        ))}

        {/* =====================================================
            FREELANCE PROJECTS
            Only appears if you add actual freelance projects
            to site.ts.
        ====================================================== */}

        {site.freelanceProjects &&
          site.freelanceProjects.length > 0 && (
            <motion.div
              id="freelance"
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                margin: "-50px",
              }}
              transition={{
                duration: 0.4,
              }}
              className="border-t border-[var(--line)] px-6 py-7 sm:px-8"
            >
              <div className="mb-5">
                <h3 className="font-serif text-[20px] font-normal tracking-wide text-[var(--fg)] sm:text-[22px]">
                  Selected Freelance Work
                </h3>

                <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">
                  Real-world products and systems built for
                  clients and external engagements.
                </p>
              </div>

              <div
                className={
                  isExperiencePage
                    ? "flex flex-col gap-5 sm:gap-6"
                    : "grid grid-cols-1 items-start gap-4 sm:gap-5 md:grid-cols-2"
                }
              >
                {site.freelanceProjects.map(
                  (project) => (
                    <div
                      key={project.title}
                      className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-5 transition-all duration-300 hover:border-[var(--soft)] hover:shadow-md sm:p-6"
                    >
                      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                        <h3 className="text-[16.5px] font-semibold tracking-wide text-[var(--fg)] sm:text-[17.5px]">
                          {project.title}
                        </h3>

                        <span className="shrink-0 font-mono text-xs text-[var(--soft)]">
                          {project.category}
                        </span>
                      </div>

                      <p className="mt-2.5 text-[13px] leading-relaxed text-[var(--muted)]">
                        {project.description}
                      </p>

                      <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
                        {project.overview}
                      </p>

                      <div className="mt-3.5">
                        <span className="mb-2 block font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[var(--soft)]">
                          Key Responsibilities &
                          Deliverables
                        </span>

                        <ul className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-[12.5px] text-[var(--muted)] sm:grid-cols-2">
                          {project.responsibilities.map(
                            (responsibility, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="mt-1 leading-none text-[var(--soft)]">
                                  •
                                </span>

                                <span>
                                  {responsibility}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-1.5 border-t border-[var(--line)]/50 pt-3.5">
                        {project.technologies.map(
                          (technology) => (
                            <span
                              key={technology}
                              className="rounded border border-[var(--line)]/30 bg-[var(--chip)] px-2 py-0.5 font-mono text-[10.5px] text-[var(--muted)]"
                            >
                              {technology}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          )}
      </Shell>
    </div>
  );
}

