import { useMemo } from "react";
import { Shell, SectionHeader } from "@/components/Layout";
import { useGithubHeatmap } from "@/hooks/useGithubHeatmap";
import { site } from "@/config/site";
import { ExternalLink } from "lucide-react";

const HEAT_OPACITY = [0.07, 0.25, 0.45, 0.7, 1];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function GithubActivity() {
  const username = site.github.username;
  const heatmap = useGithubHeatmap(username);

  const monthLabels = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => MONTH_NAMES[(now.getMonth() + 1 + i) % 12]);
  }, []);

  return (
    <div id="github">
      <SectionHeader
        title="GitHub Activity"
        aside={
          <a
            href={site.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
          >
            <span>@{username}</span>
            <ExternalLink size={12} />
          </a>
        }
      />
      <Shell className="px-6 py-6 sm:px-8">
        <div className="onyx-scroll overflow-x-auto pb-2">
          <div className="min-w-[640px]">
            {/* Month labels at the top */}
            <div className="mb-1.5 flex justify-between pr-8 font-mono text-[10px] text-[var(--soft)]">
              {monthLabels.map((m, i) => (
                <span key={m + i}>{m}</span>
              ))}
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
              {heatmap.cells.map((lvl, i) =>
                lvl === null ? (
                  <span key={i} className="size-[10px]" />
                ) : (
                  <span
                    key={i}
                    className="size-[10px] rounded-[2px] bg-[var(--fg)] transition-transform duration-150 hover:scale-125"
                    style={{ opacity: HEAT_OPACITY[lvl] }}
                  />
                ),
              )}
            </div>

            {/* Info and stats at the bottom */}
            <div className="mt-2.5 flex items-center justify-between font-mono text-[11px] text-[var(--muted)]">
              <span>
                {heatmap.live ? `${heatmap.total} contributions in the last year` : "500+ commits in the last year"}
              </span>
              <span className="flex items-center gap-1.5">
                Less
                {HEAT_OPACITY.map((o) => (
                  <span key={o} className="size-[10px] rounded-[2px] bg-[var(--fg)]" style={{ opacity: o }} />
                ))}
                More
              </span>
            </div>
          </div>
        </div>
      </Shell>
    </div>
  );
}

export default GithubActivity;
