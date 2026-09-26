import { motion } from "framer-motion";
import { site } from "@/config/site";
import { Reveal, SectionHeader } from "./reveal";
import { GitHubIcon, ArrowUpRight } from "./icons";
import { useEffect, useState } from "react";

const WEEKS = 53;
const DAYS = 7;

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface ApiResponse {
  total: Record<string, number | string>;
  contributions: ContributionDay[];
}

function level(week: number, day: number) {
  const seed = (week * 31 + day * 17 + 7) % 97;
  const wave = Math.sin(week / 6) * 1.5 + 2;
  const v = (seed % 5) * 0.4 + wave;
  return Math.max(0, Math.min(4, Math.round(v % 5)));
}

const SHADES = [
  "bg-neutral-800/40",
  "bg-emerald-900/60",
  "bg-emerald-700/80",
  "bg-emerald-500",
  "bg-emerald-400",
];

export function GitHubGraph() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!site.github.username) return;

    fetch(`https://github-contributions-api.jogruber.de/v4/${site.github.username}?y=last`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch contribution data");
        return res.json() as Promise<ApiResponse>;
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching GitHub graph data:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (!site.github.username) return null;
  const profile = `https://github.com/${site.github.username}`;

  const formatDate = (dateStr: string) => {
    if (dateStr.startsWith("fallback")) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const weeks: ContributionDay[][] = [];
  if (data?.contributions && data.contributions.length > 0) {
    for (let i = 0; i < data.contributions.length; i += 7) {
      weeks.push(data.contributions.slice(i, i + 7));
    }
  } else {
    for (let w = 0; w < WEEKS; w++) {
      const week: ContributionDay[] = [];
      for (let d = 0; d < DAYS; d++) {
        week.push({
          date: `fallback-${w}-${d}`,
          count: 0,
          level: level(w, d),
        });
      }
      weeks.push(week);
    }
  }

  const contributionsCount = data?.contributions
    ? data.contributions.reduce((sum, d) => sum + d.count, 0).toLocaleString()
    : site.github.contributionsLastYear;

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-12">
      <SectionHeader id="github" index="05" title="in code" />

      <Reveal>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between">
            <a
              href={profile}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-200 transition-colors hover:text-white"
            >
              <GitHubIcon className="h-4 w-4" />
              @{site.github.username}
              <ArrowUpRight className="opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
            <span className="font-mono text-xs text-neutral-400 flex items-center gap-2">
              {loading && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
              )}
              {error && (
                <span 
                  className="h-2 w-2 rounded-full bg-amber-500/80 cursor-help" 
                  title="Failed to load live data, showing demo data"
                />
              )}
              {contributionsCount} contributions in the last year
            </span>
          </div>

          <div className={`overflow-x-auto pb-1 transition-opacity duration-300 ${loading ? "opacity-60" : "opacity-100"}`}>
            <div className="flex gap-[3px]">
              {weeks.map((week, w) => (
                <div key={w} className="flex flex-col gap-[3px]">
                  {week.map((day, d) => (
                    <motion.span
                      key={day.date}
                      initial={{ opacity: 0, scale: 0.4 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: (w * DAYS + d) * 0.001, duration: 0.15 }}
                      className={`h-[11px] w-[11px] flex-none rounded-[2px] transition-colors duration-300 ${SHADES[day.level]}`}
                      title={
                        day.date.startsWith("fallback")
                          ? `${loading ? "Loading..." : "Demo data"}`
                          : `${day.count === 0 ? "No" : day.count} contribution${
                              day.count === 1 ? "" : "s"
                            } on ${formatDate(day.date)}`
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-1.5 font-mono text-[10px] text-neutral-500">
            Less
            {SHADES.map((s, i) => (
              <span key={i} className={`h-[10px] w-[10px] rounded-[2px] ${s}`} />
            ))}
            More
          </div>
        </div>
      </Reveal>
    </section>
  );
}
