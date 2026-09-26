import { About } from "@/components/about";
import { Experience } from "@/components/experience";
import { Skills } from "@/components/skills";
import { Reveal } from "@/components/reveal";
import { site } from "@/config/site";
import { Code2, Terminal, Cpu, ShieldCheck } from "lucide-react";

export function AboutPage() {
  const principles = [
    {
      title: "Clean & Maintainable Code",
      description: "I don't ship junk code. Maintainability isn't optional—it's foundational to building software that scales.",
      icon: <Code2 className="text-emerald-400" size={24} />
    },
    {
      title: "Backend Precision",
      description: "I lean backend because I enjoy making polished frontend interfaces actually hold up under load with robust architecture.",
      icon: <Terminal className="text-indigo-400" size={24} />
    },
    {
      title: "Continuous Learning",
      description: "Currently diving deep into System Design, Distributed Systems, DSA, and DevOps to keep leveling up.",
      icon: <Cpu className="text-purple-400" size={24} />
    },
    {
      title: "User-Centered & Detail Obsessed",
      description: "From micro-interactions and keyboard shortcuts to smooth transitions, every detail counts towards great UX.",
      icon: <ShieldCheck className="text-cyan-400" size={24} />
    }
  ];

  return (
    <main className="min-h-screen pt-28 pb-16">
      <div className="mx-auto w-full max-w-5xl px-6 mb-8">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-semibold">
            01 / Background
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-neutral-100 font-normal mt-2">
            About & Experience
          </h1>
          <p className="mt-3 text-neutral-400 text-lg max-w-2xl leading-relaxed">
            A look into my background, engineering philosophy, tools I work with daily, and where I&apos;ve contributed.
          </p>
        </Reveal>
      </div>

      <About />

      {/* Engineering Principles Section */}
      <section className="mx-auto w-full max-w-5xl px-6 py-8">
        <Reveal>
          <h2 className="font-serif text-3xl text-neutral-100 mb-6">Engineering Philosophy</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {principles.map((p, idx) => (
              <div key={idx} className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-md">
                <div className="p-3 rounded-xl border border-neutral-800 bg-neutral-950 w-fit mb-4">
                  {p.icon}
                </div>
                <h3 className="font-semibold text-neutral-100 text-lg">{p.title}</h3>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <Experience />
      <Skills />
    </main>
  );
}
