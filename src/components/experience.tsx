import { site } from "@/config/site";
import { Reveal, SectionHeader } from "./reveal";
import { ArrowUpRight } from "./icons";

export function Experience() {
  if (!site.experience.length) return null;

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-12">
      <SectionHeader id="work" index="02" title="where I've worked" />

      <div className="space-y-4">
        {site.experience.map((job, i) => {
          const Card = job.url ? "a" : "div";
          return (
            <Reveal key={`${job.company}-${i}`} delay={i * 0.06}>
              <Card
                {...(job.url
                  ? { href: job.url, target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="group flex flex-col gap-2 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-900/70 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-neutral-100 text-lg">{job.company}</h3>
                    {job.url && (
                      <ArrowUpRight className="text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-emerald-400 mt-0.5">{job.role}</p>
                  <p className="mt-2 text-sm text-neutral-300 leading-relaxed">{job.blurb}</p>
                </div>
                <span className="flex-none font-mono text-xs text-neutral-400 border border-neutral-800 rounded-full px-3 py-1 bg-neutral-950/40">
                  {job.period}
                </span>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
