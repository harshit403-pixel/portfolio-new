import { useEffect, useMemo, useState } from "react";

interface HeatmapData {
  cells: (number | null)[];
  total: number;
  live: boolean;
}

/** Deterministic pseudo-random fallback so the section never looks broken. */
function buildFallbackHeatmap(seedText: string): HeatmapData {
  let seed = 5381;
  for (let i = 0; i < seedText.length; i++) {
    seed = (seed * 33) ^ seedText.charCodeAt(i);
  }
  const cells: (number | null)[] = [];
  let s = seed >>> 0;
  for (let i = 0; i < 53 * 7; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const v = s % 100;
    cells.push(v < 34 ? 0 : v < 60 ? 1 : v < 80 ? 2 : v < 93 ? 3 : 4);
  }
  return { cells, total: cells.reduce((a: number, b) => a + (b || 0) * 2, 0), live: false };
}

/** Live GitHub contributions for the last year (public API, no auth). */
export function useGithubHeatmap(user: string): HeatmapData {
  const fallback = useMemo(() => buildFallbackHeatmap(user), [user]);
  const [heatmap, setHeatmap] = useState<HeatmapData>(fallback);

  useEffect(() => {
    let cancelled = false;
    fetch(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad status"))))
      .then((d) => {
        const contribs = d?.contributions ?? [];
        if (cancelled || contribs.length === 0) return;
        // pad so the first column starts on the right weekday
        const firstDow = new Date(contribs[0].date).getDay();
        const cells: (number | null)[] = Array(firstDow)
          .fill(null)
          .concat(contribs.map((c: any) => c.level));
        const total =
          d?.total?.lastYear ?? contribs.reduce((a: number, c: any) => a + c.count, 0);
        setHeatmap({ cells, total, live: true });
      })
      .catch(() => {}); // keep the fallback
    return () => {
      cancelled = true;
    };
  }, [user]);

  return heatmap;
}
