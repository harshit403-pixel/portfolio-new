
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Shell, SectionHeader } from "@/components/Layout";

type Experiment = {
  title: string;
  description: string;
  category: string;
  image: string;
  href: string;
  external?: boolean;
};

const experiments: Experiment[] = [
  {
    title: "Memory Box",
    description: "Memories, photos and sounds on a string",
    category: "interactive",
    image: "/assets/experiments/memory-box.webp",
    href: "/experiments/memory-box",
  },
  {
    title: "Vending Machine",
    description: "A vending machine that dispenses items",
    category: "interactive",
    image: "/assets/experiments/vending-machine.webp",
    href: "/experiments/vending-machine",
  },
  {
    title: "404",
    description: "A page that is not found",
    category: "physics",
    image: "/assets/experiments/404.webp",
    href: "/experiments/404",
  },
  {
    title: "Harshit Type Motion",
    description: "Type that comes alive",
    category: "typography",
    image: "/profile2.webp",
    href: "/experiments/harshit-type-motion",
  },
  {
    title: "Year Complete",
    description: "A contribution year visualizer",
    category: "utility",
    image: "/assets/experiments/commit-ramp-rider.svg",
    href: "https://commit-ramp-rider.netlify.app/",
    external: true,
  },
];

function ExperimentItem({ experiment }: { experiment: Experiment }) {
  const content = (
    <>
      <div className="size-[52px] shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--chip)] sm:size-[56px]">
        <img
          src={experiment.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-[14px] font-medium text-[var(--fg)] transition-all duration-300 group-hover:drop-shadow-[0_0_8px_var(--fg)] sm:text-[15px]">
          {experiment.title}
        </span>

        <span className="truncate text-[12px] text-[var(--muted)] transition-all duration-300 group-hover:text-[var(--fg)] group-hover:drop-shadow-[0_0_6px_var(--fg)] sm:text-[13px]">
          {experiment.description}
        </span>
      </div>

      <span className="hidden shrink-0 font-mono text-[10px] text-[var(--muted)] transition-all duration-300 group-hover:text-[var(--fg)] group-hover:drop-shadow-[0_0_6px_var(--fg)] sm:block">
        {experiment.category}
      </span>

      <ArrowUpRight className="size-3.5 shrink-0 text-[var(--soft)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--fg)] group-hover:drop-shadow-[0_0_5px_var(--fg)]" />
    </>
  );

  const className =
    "group flex min-h-[64px] items-center gap-3 py-3 sm:gap-4";

  if (experiment.external) {
    return (
      <a
        href={experiment.href}
        target="_blank"
        rel="noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link to={experiment.href} className={className}>
      {content}
    </Link>
  );
}

export function ExperimentsPage() {
  return (
    <div className="min-h-fit bg-[var(--bg)] text-[var(--fg)]">
      <SectionHeader
        title="Experiments"
        aside={
          <span className="font-mono text-[10px] text-[var(--muted)]">
            SIDE PROJECTS / PLAYGROUND
          </span>
        }
      />

      <Shell className="px-6 py-5 sm:px-8 sm:py-7">
        <p className="mb-8 text-sm text-[var(--muted)]">
          Things I make when I should be doing something else.
        </p>

        <div className="divide-y divide-[var(--line)]">
          {experiments.map((experiment) => (
            <ExperimentItem key={experiment.title} experiment={experiment} />
          ))}
        </div>
      </Shell>
    </div>
  );
}

export default ExperimentsPage;
