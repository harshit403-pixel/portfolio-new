import { site } from "@/config/site";
import { Reveal, SectionHeader } from "./reveal";

export function About() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-12">
      <SectionHeader id="about" index="01" title="about" />

      <div className="space-y-4 text-lg leading-relaxed text-neutral-300">
        {site.about.map((para, i) => (
          <Reveal key={i} delay={i * 0.05}>
            <p>{para}</p>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md">
          <p className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-semibold">
            Developer Snapshot
          </p>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {site.tldr.map((item) => (
              <li key={item} className="flex items-center gap-3 text-neutral-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 flex-none" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
