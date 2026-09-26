import { site } from "@/config/site";
import { Writing } from "@/sections/Writing";
import { Reveal } from "@/components/reveal";
import { Shell } from "@/components/Layout";
import { BookOpen, ExternalLink } from "lucide-react";
import { MediumIcon } from "@/components/icons";

export function WritingPage() {
  return (
    <div className="min-h-screen">
      {/* Page Header Header Section inside grid limits */}
      <Shell className="px-6 pt-14 pb-12 sm:px-8 border-b border-[var(--line)]">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-semibold">
            03 / Articles & Insights
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-[var(--fg)] font-normal mt-2">
            Writing & Thoughts
          </h1>
          <p className="mt-3 text-[var(--muted)] text-lg max-w-2xl leading-relaxed">
            Technical write-ups, architecture breakdowns, system design insights, and lessons learned while engineering software.
          </p>
        </Reveal>
      </Shell>

      {site.writing.length > 0 ? (
        <Writing />
      ) : (
        <Shell className="px-6 py-12 sm:px-8 border-b border-[var(--line)]">
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-8 text-center">
              <BookOpen size={32} className="text-[var(--soft)] mx-auto mb-3" />
              <h3 className="font-serif text-2xl text-[var(--fg)]">Articles Coming Soon</h3>
              <p className="mt-2 text-[var(--muted)] text-sm max-w-md mx-auto">
                Currently drafting deep-dive articles on WebSocket state engines, local-first browser IDE architectures, and PostgreSQL performance tuning.
              </p>
            </div>
          </Reveal>
        </Shell>
      )}

      {/* Medium / External Publication Card */}
      <Shell className="px-6 py-12 sm:px-8 border-t border-[var(--line)]">
        <Reveal delay={0.2}>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl border border-[var(--line)] bg-[var(--chip)] text-[var(--fg)]">
                <MediumIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--fg)] text-lg">Follow on Medium</h3>
                <p className="text-sm text-[var(--muted)]">Read longer-form engineering essays and technical guides.</p>
              </div>
            </div>

            <a
              href={site.socials.medium}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--fg)] text-[var(--bg)] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--muted)] shrink-0"
            >
              Medium Profile <ExternalLink size={14} />
            </a>
          </div>
        </Reveal>
      </Shell>
    </div>
  );
}
