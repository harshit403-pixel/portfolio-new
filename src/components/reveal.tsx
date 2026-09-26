import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({
  index,
  title,
  id,
}: {
  index: string;
  title: string;
  id?: string;
}) {
  return (
    <div id={id} className="mb-8 flex items-baseline justify-between border-b border-dashed border-neutral-800 pb-3 scroll-mt-28 relative">
      <div className="flex items-baseline gap-3">
        <h2 className="font-serif text-3xl font-normal sm:text-4xl text-neutral-100">
          {title}
        </h2>
        <span className="font-mono text-xs text-neutral-400">({index})</span>
      </div>
      <span className="font-mono text-xs text-neutral-500 select-none">•</span>
    </div>
  );
}
