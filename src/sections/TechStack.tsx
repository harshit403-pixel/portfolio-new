import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shell, SectionHeader } from "@/components/Layout";
import { site } from "@/config/site";
import { Icon } from "@iconify/react";

const CATEGORY_ICONS: Record<string, string> = {
  All: "lucide:layers",
  Languages: "lucide:code-2",
  Frontend: "lucide:layout",
  Backend: "lucide:server",
  Databases: "lucide:database",
  "DevOps & Cloud": "lucide:cloud",
  AI: "lucide:sparkles",
};

const SKILL_ICONS: Record<string, string> = {
  JavaScript: "logos:javascript",
  TypeScript: "logos:typescript-icon",
  "C++": "logos:c-plusplus",

  React: "logos:react",
  "Next.js": "logos:nextjs-icon",
  "Tailwind CSS": "logos:tailwindcss-icon",
  GSAP: "simple-icons:greensock",
  "Framer Motion": "simple-icons:framer",
  "Redux Toolkit": "logos:redux",
  "TanStack Query": "simple-icons:reactquery",

  "Node.js": "logos:nodejs-icon",
  "Express.js": "logos:express",
  "REST APIs": "lucide:braces",
  "Socket.IO": "simple-icons:socketdotio",
  JWT: "logos:jwt-icon",
  "Google OAuth": "logos:google-icon",

  MongoDB: "logos:mongodb-icon",
  Mongoose: "simple-icons:mongoose",

  Docker: "logos:docker-icon",
  AWS: "logos:aws",
  Vercel: "logos:vercel-icon",

  Git: "logos:git-icon",
  GitHub: "logos:github-icon",
  Postman: "logos:postman-icon",

  "OpenAI API": "simple-icons:openai",
  "Gemini API": "simple-icons:googlegemini",
  LangChain: "simple-icons:langchain",
  LangGraph: "lucide:workflow",
  Mistral: "lucide:brain",
  RAG: "lucide:database-zap",
};

const skillCategories: Record<string, string[]> = {
  Languages: [
    "JavaScript",
    "TypeScript",
    "C++",
  ],

  Frontend: [
    "React",
    "Next.js",
    "Tailwind CSS",
    "GSAP",
    "Framer Motion",
    "Redux Toolkit",
    "TanStack Query",
  ],

  Backend: [
    "Node.js",
    "Express.js",
    "REST APIs",
    "Socket.IO",
    "JWT",
    "Google OAuth",
  ],

  Databases: [
    "MongoDB",
    "Mongoose",
  ],

  "DevOps & Cloud": [
    "Docker",
    "AWS",
    "Vercel",
    "Git",
    "GitHub",
    "Postman",
  ],

  AI: [
    "OpenAI API",
    "Gemini API",
    "LangChain",
    "LangGraph",
    "Mistral",
    "RAG",
  ],
};

export function TechStack() {
  const [activeCategory, setActiveCategory] =
    useState<string>("All");

  if (!site.skills.length) return null;

  const categories = [
    "All",
    "Languages",
    "Frontend",
    "Backend",
    "Databases",
    "DevOps & Cloud",
    "AI",
  ];

  const filteredSkills =
    activeCategory === "All"
      ? site.skills
      : site.skills.filter((skill) =>
          skillCategories[activeCategory]?.includes(skill)
        );

  return (
    <div id="skills">
      <SectionHeader
        title="Tech Stack"
        aside={
          <span className="hidden font-mono text-[10px] tracking-wider text-[var(--soft)] sm:inline">
            ( select tab to filter )
          </span>
        }
      />

      <Shell className="px-6 py-6 sm:px-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--chip)] p-1">
          {categories.map((cat) => {
            const iconName =
              CATEGORY_ICONS[cat] || "lucide:layers";

            const isActive = activeCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className="relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium cursor-pointer"
              >
                {/* Sliding Active Pill */}
                {isActive && (
                  <motion.div
                    layoutId="active-category-pill"
                    className="absolute inset-0 rounded-md bg-[var(--fg)] shadow-sm"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                      mass: 0.8,
                    }}
                  />
                )}

                {/* Content */}
                <span
                  className={`relative z-10 flex items-center gap-1.5 transition-colors duration-200 ${
                    isActive
                      ? "font-semibold text-[var(--bg)]"
                      : "text-[var(--muted)]"
                  }`}
                >
                  <Icon
                    icon={iconName}
                    width={14}
                    height={14}
                    className="size-3.5"
                  />

                  {cat}
                </span>
              </button>
            );
          })}
        </div>

        {/* Skill Items Grid */}
        <motion.div
          layout
          className="mt-6 flex flex-wrap gap-2.5"
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill) => {
              const iconName =
                SKILL_ICONS[skill] || "lucide:code-2";

              return (
                <motion.span
                  key={skill}
                  layout
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                  }}
                  transition={{
                    duration: 0.2,
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                  className="
                    flex
                    cursor-default
                    items-center
                    gap-2
                    rounded-md
                    border
                    border-[var(--line)]
                    bg-[var(--card)]
                    px-3
                    py-1.5
                    font-mono
                    text-[12px]
                    text-[var(--muted)]
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:border-[var(--fg)]
                    hover:bg-[var(--fg)]
                    hover:text-[var(--bg)]
                    shadow-xs
                    group
                  "
                >
                  <Icon
                    icon={iconName}
                    width={16}
                    height={16}
                    className="
                      size-4
                      shrink-0
                      transition-colors
                      group-hover:filter
                      group-hover:brightness-110
                    "
                  />

                  {skill}
                </motion.span>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </Shell>
    </div>
  );
}

export default TechStack;