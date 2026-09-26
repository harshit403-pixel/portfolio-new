import { motion } from "framer-motion";
import { Shell, SectionHeader } from "@/components/Layout";
import { site } from "@/config/site";

export function About() {
  return (
    <div id="about">
      <SectionHeader title="About" />
      <Shell className="px-6 py-7 sm:px-8 space-y-4">
        {site.about.map((para, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex gap-2 text-[14.5px] leading-relaxed text-[var(--muted)]"
          >
            <span className="text-[var(--soft)] font-mono">•</span>
            <p>{para}</p>
          </motion.div>
        ))}

        {/* Developer Snapshot Cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--card)] p-5"
        >
          <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--fg)] font-semibold mb-3">
            Developer Snapshot
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px] font-mono text-[var(--muted)]">
            {site.tldr.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-none" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </Shell>
    </div>
  );
}
