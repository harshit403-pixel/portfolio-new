import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { site } from "@/config/site";
import {
  GitHubIcon,
  LinkedInIcon,
  MailIcon,
  FileIcon,
} from "./icons";

const items = [
  {
    key: "github",
    href: site.socials.github,
    label: "GitHub",
    Icon: GitHubIcon,
  },
  {
    key: "linkedin",
    href: site.socials.linkedin,
    label: "LinkedIn",
    Icon: LinkedInIcon,
  },
  {
    key: "email",
    href: site.socials.email,
    label: "Mail",
    Icon: MailIcon,
  },
  {
    key: "resume",
    href: site.socials.resume,
    label: "Resume",
    Icon: FileIcon,
  },
];

const hoverCardsData: Record<
  string,
  {
    pronouns?: string;
    handle: string;
    bio: string;
    stats?: string[];
    bannerText: string;
  }
> = {
  github: {
    handle: "@harshit403-pixel",
    bio: "Full Stack Developer building modern web applications, backend systems, and AI-powered products.",
    stats: ["Full Stack Developer", "Open Source"],
    bannerText: "build • learn • ship",
  },

  linkedin: {
    pronouns: "He/Him",
    handle: "in/harshit-raghuwanshi-278243281",
    bio: "Full Stack Developer interested in backend engineering, system design, AI, and building real-world software products.",
    stats: ["Software Engineering", "Open to Opportunities"],
    bannerText: "connect • build • grow",
  },

  email: {
    handle: "YOUR_EMAIL@gmail.com",
    bio: "Feel free to reach out for software engineering opportunities, collaborations, projects, or technical discussions.",
    stats: ["Direct Contact", "Open to Opportunities"],
    bannerText: "connect • collaborate • build",
  },

  resume: {
    handle: "Curriculum Vitae",
    bio: "My resume covering my software engineering skills, projects, experience, education, and achievements.",
    stats: ["Skills", "Projects", "Experience"],
    bannerText: "skills • projects • experience",
  },
};

export function Socials({ className = "" }: { className?: string }) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  return (
    <div className={`flex flex-wrap items-center gap-3.5 ${className}`}>
      {items
        .filter((item) => item.href)
        .map(({ key, href, label, Icon }) => {
          const card = hoverCardsData[key];

          return (
            <div
              key={key}
              className="relative"
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
            >
              {/* Social Button */}
              <a
                href={href}
                target={
                  href.startsWith("mailto") ? undefined : "_blank"
                }
                rel="noopener noreferrer"
                className="group flex cursor-pointer items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 px-4 py-2 font-mono text-xs text-neutral-300 shadow-sm transition-all duration-300 hover:border-neutral-600 hover:bg-neutral-800/80 hover:text-white active:scale-95"
              >
                <Icon className="h-4 w-4 shrink-0 text-neutral-400 transition-transform group-hover:scale-110 group-hover:text-white" />

                <span>{label}</span>

                <span className="text-[10px] text-neutral-500 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white">
                  ↗
                </span>
              </a>

              {/* Hover Card */}
              <AnimatePresence>
                {hoveredKey === key && card && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.95,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.95,
                      y: 12,
                    }}
                    transition={{
                      duration: 0.15,
                      ease: "easeOut",
                    }}
                    className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-3.5 w-72 -translate-x-1/2 select-none overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/95 shadow-2xl backdrop-blur-xl"
                  >
                    {/* Banner */}
                    <div className="relative flex h-20 w-full items-center justify-center overflow-hidden bg-neutral-950">
                      <img
                        src={
                          site.socialBannerImage ||
                          "/banner.png"
                        }
                        alt="Profile banner"
                        className="absolute inset-0 h-full w-full object-cover object-center"
                      />

                      <div className="absolute inset-0 bg-black/40" />

                      <span className="relative z-10 rounded-md border border-white/20 bg-black/60 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-white shadow-sm backdrop-blur-md">
                        {card.bannerText}
                      </span>
                    </div>

                    {/* Profile */}
                    <div className="relative px-4 pb-4 pt-1">
                      {/* Avatar */}
                      <div className="absolute -top-6 left-4 h-12 w-12 overflow-hidden rounded-full border-2 border-neutral-900 bg-neutral-950 shadow-md">
                        <img
                          src={site.profileImages[0]}
                          alt={site.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="mt-7">
                        {/* Name */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">
                            {site.name}
                          </span>

                          {/* Verified-style icon */}
                          <svg
                            className="h-3.5 w-3.5 shrink-0 text-blue-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>

                          {card.pronouns && (
                            <span className="rounded-md border border-neutral-700 bg-neutral-800 px-1.5 py-0.2 font-mono text-[9px] text-neutral-400">
                              {card.pronouns}
                            </span>
                          )}
                        </div>

                        {/* Handle */}
                        <p className="mt-0.5 font-mono text-[10px] text-neutral-400">
                          {card.handle}
                        </p>

                        {/* Bio */}
                        <p className="mt-2.5 text-[10px] leading-relaxed text-neutral-300">
                          {card.bio}
                        </p>

                        {/* Stats */}
                        {card.stats && (
                          <div className="mt-3 flex gap-3 border-t border-neutral-800 pt-2 font-mono text-[9px] text-neutral-400">
                            {card.stats.map((stat, index) => (
                              <span
                                key={index}
                                className="flex items-center gap-1"
                              >
                                <span className="h-1 w-1 rounded-full bg-blue-400" />

                                {stat}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
    </div>
  );
}

