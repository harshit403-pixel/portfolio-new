import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Projects } from "@/components/projects";
import { GitHubGraph } from "@/components/github-graph";
import { Reveal } from "@/components/reveal";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <About />
      <Projects />
      <GitHubGraph />

      {/* Dynamic CTA Banner */}
      <section className="mx-auto w-full max-w-5xl px-6 py-12">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/40 p-8 sm:p-12 text-center backdrop-blur-xl">
            <div className="bg-grid absolute inset-0 opacity-15 pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3.5 py-1 text-xs font-mono text-emerald-400 mb-4">
                <Sparkles size={14} /> Open to Collaborations & Roles
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-neutral-100 font-normal">
                Want to see all projects or get in touch?
              </h2>
              <p className="mt-3 max-w-lg text-neutral-400 text-sm sm:text-base leading-relaxed">
                Check out the dedicated project gallery with search and category filters, or drop a message directly.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition-all hover:scale-105"
                >
                  View All Projects <ArrowRight size={16} />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800"
                >
                  Contact Me
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
