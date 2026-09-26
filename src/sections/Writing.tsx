import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shell, SectionHeader } from "@/components/Layout";
import { site } from "@/config/site";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { MediumIcon } from "@/components/icons";

export function Writing({ limit }: { limit?: number }) {
  if (!site.writing || site.writing.length === 0) return null;

  const displayedPosts = limit ? site.writing.slice(0, limit) : site.writing;
  const hasMore = limit ? site.writing.length > limit : false;

  return (
    <div id="writing">
      <SectionHeader
        title="Writing"
        aside={
          <a
            href={(site.socials as any).medium}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--soft)] hover:text-[var(--fg)] transition-colors group/header"
          >
            <MediumIcon className="size-3.5" />
            <span className="hidden sm:inline">https://medium.com/@harshuraghu7999</span>
            <ArrowUpRight className="size-3 text-[var(--soft)] group-hover/header:translate-x-0.5 group-hover/header:-translate-y-0.5 transition-transform" />
          </a>
        }
      />
      <Shell>
        <div className="divide-y divide-[var(--line)]">
          {displayedPosts.map((post, i) => (
            <motion.a
              key={post.title}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 px-6 py-5 sm:px-8 hover:bg-[var(--hover)] transition-colors duration-200 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-6 flex-1 min-w-0">
                <span className="font-mono text-[11px] text-[var(--soft)] w-20 shrink-0">
                  {post.date}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-[18px] text-[var(--fg)] group-hover:text-[var(--muted)] transition-colors font-medium leading-snug flex items-center gap-1.5">
                    {post.title}
                  </h3>
                  <p className="mt-1 text-[13px] text-[var(--muted)] leading-relaxed line-clamp-2">
                    {post.summary}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0 font-mono text-[11px] text-[var(--soft)] mt-2 sm:mt-0">
                {post.readingTime && <span>{post.readingTime}</span>}
                <ArrowUpRight className="size-3.5 text-[var(--soft)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--fg)]" />
              </div>
            </motion.a>
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center py-6 border-t border-[var(--line)] bg-stripes">
            <Link
              to="/writing"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--fg)] px-5 py-2.5 text-[13px] font-semibold text-[var(--bg)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              Read all articles
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        )}
      </Shell>
    </div>
  );
}

export default Writing;
