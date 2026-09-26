import { motion } from "framer-motion";
import { Shell, SectionHeader } from "@/components/Layout";
import { site } from "@/config/site";
import { ArrowUpRight, GitPullRequest, GitMerge, Check } from "lucide-react";
import { GitHubIcon } from "@/components/icons";

export function OpenSource() {
  if (!site.openSourceContributions || site.openSourceContributions.length === 0) {
    return null;
  }

  return (
    <div id="opensource">
      <SectionHeader
        title="Open Source"
        aside={
          <a
            href={site.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--soft)] hover:text-[var(--fg)] transition-colors group/header"
          >
            <GitHubIcon className="size-3.5" />
            <span className="hidden sm:inline">5 Merged PRs</span>
            <ArrowUpRight className="size-3 text-[var(--soft)] group-hover/header:translate-x-0.5 group-hover/header:-translate-y-0.5 transition-transform" />
          </a>
        }
      />
      <Shell>
        <div className="divide-y divide-[var(--line)]">
          {site.openSourceContributions.map((pr, i) => (
            <motion.a
              key={pr.url}
              href={pr.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="group block px-6 py-5 sm:px-8 hover:bg-[var(--hover)] transition-colors duration-200 outline-none"
            >
              {/* Header row: Repo name, PR Number, Merged pill, and Link Arrow */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 font-mono text-[11.5px]">
                  <span className="flex items-center gap-1.5 font-semibold text-[var(--fg)]">
                    <GitMerge className="size-3.5 text-purple-400 shrink-0" />
                    {pr.repo}
                  </span>
                  <span className="text-[var(--soft)]">#{pr.prNumber}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-400 border border-purple-500/20">
                    <Check className="size-2.5" />
                    {pr.status}
                  </span>
                </div>

                <div className="flex items-center gap-1 font-mono text-[11px] text-[var(--soft)] group-hover:text-[var(--fg)] transition-colors shrink-0">
                  <span className="hidden sm:inline">View PR</span>
                  <ArrowUpRight className="size-3.5 text-[var(--soft)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--fg)]" />
                </div>
              </div>

              {/* PR Title */}
              <h3 className="mt-2 text-[15.5px] sm:text-[16.5px] font-semibold text-[var(--fg)] tracking-tight group-hover:text-[var(--soft)] transition-colors leading-snug">
                {pr.title}
              </h3>

              {/* Description */}
              <p className="mt-1.5 text-[13px] text-[var(--muted)] leading-relaxed max-w-2xl">
                {pr.description}
              </p>

              {/* Tech stack chips */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {pr.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded bg-[var(--chip)] px-2 py-0.5 font-mono text-[10.5px] text-[var(--muted)] border border-[var(--line)]/40"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.a>
          ))}
        </div>
      </Shell>
    </div>
  );
}
export default OpenSource;
