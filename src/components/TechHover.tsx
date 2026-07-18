"use client";
import React, { useRef } from "react";
import { useAnimate, motion, useScroll, useTransform } from "framer-motion";
import {
  SiReact,
  SiNextdotjs,
  SiJavascript,
  SiTypescript,
  SiTailwindcss,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiRedis,
  SiDocker,
  SiGit,
  SiGreensock
} from "react-icons/si";
const TECH_ITEMS = [
  { id: 1, label: "React", Icon: SiReact },
  { id: 2, label: "Next.js", Icon: SiNextdotjs },
  { id: 3, label: "JavaScript", Icon: SiJavascript },
  { id: 4, label: "TypeScript", Icon: SiTypescript },
  { id: 5, label: "Tailwind CSS", Icon: SiTailwindcss },
  { id: 6, label: "Node.js", Icon: SiNodedotjs },
  { id: 7, label: "Express.js", Icon: SiExpress },
  { id: 8, label: "GSAP", Icon: SiGreensock },
  { id: 9, label: "MongoDB", Icon: SiMongodb },
  { id: 10, label: "Redis", Icon: SiRedis },
  { id: 11, label: "Docker", Icon: SiDocker },
  { id: 12, label: "Git", Icon: SiGit },
];
const NO_CLIP = "polygon(0 0, 100% 0, 100% 100%, 0% 100%)";
const BOTTOM_RIGHT_CLIP = "polygon(0 0, 100% 0, 0 0, 0% 100%)";
const TOP_RIGHT_CLIP = "polygon(0 0, 0 100%, 100% 100%, 0% 100%)";
const BOTTOM_LEFT_CLIP = "polygon(100% 100%, 100% 0, 100% 100%, 0 100%)";
const TOP_LEFT_CLIP = "polygon(0 0, 100% 0, 100% 100%, 100% 0)";

const ENTRANCE = {
  left: [BOTTOM_RIGHT_CLIP, NO_CLIP],
  bottom: [BOTTOM_RIGHT_CLIP, NO_CLIP],
  top: [BOTTOM_RIGHT_CLIP, NO_CLIP],
  right: [TOP_LEFT_CLIP, NO_CLIP],
};

const EXIT = {
  left: [NO_CLIP, TOP_RIGHT_CLIP],
  bottom: [NO_CLIP, TOP_RIGHT_CLIP],
  top: [NO_CLIP, TOP_RIGHT_CLIP],
  right: [NO_CLIP, BOTTOM_LEFT_CLIP],
};

const TechHover = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  });

  const clipPathValue = useTransform(
    scrollYProgress,
    [0.5, 1], // Start animating only halfway through the scroll progress
    ["polygon(0 0, 0 0, 0 100%, 0 100%)", "polygon(0 0, 100% 0, 100% 100%, 0 100%)"]
  );

  return (
    <section ref={containerRef} className="py-12 md:py-16 bg-white flex flex-col items-center justify-center p-6">
      <div className="max-w-7xl w-full flex flex-col gap-12 md:gap-16">

        {/* Header Row */}
        <div className="relative flex flex-col xl:flex-row justify-start items-center gap-8 py-8 md:pl-12">
          {/* Blob Background */}
          <div className="absolute top-1/2 left-[-5%] md:left-[2%] -translate-y-1/2 w-[250px] md:w-[350px] z-0 pointer-events-none flex justify-center items-center">
            <img
              src="/VimeoHero SVG/mute-bubble-blob.svg"
              alt="blob background"
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="relative z-10 flex items-center gap-6 md:gap-8 w-full">
            <h2 className="font-mono font-bold text-[2.5rem] md:text-[4.5rem] lg:text-[6.5rem] leading-[0.75] tracking-tighter text-black m-0 p-0 whitespace-nowrap shrink-0" style={{ wordSpacing: '-0.1em' }}>
              SKILLED IN
            </h2>
            <motion.img 
              src="/HorizontalWords SVG/horizontal-words-arrow-end.svg" 
              alt="arrow"
              className="w-full max-w-[100px] md:max-w-[150px] lg:max-w-[200px] h-auto object-contain"
              style={{ clipPath: clipPathValue }}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-200 border border-zinc-200">
          {TECH_ITEMS.map((tech) => (
            <TechTile key={tech.id} {...tech} />
          ))}
        </div>
      </div>
    </section>
  );
};

const TechTile = ({ Icon, label }: { Icon: any; label: string }) => {
  const [scope, animate] = useAnimate();

  const getNearestEdge = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const proximity = [
      { edge: "left", dist: Math.abs(box.left - e.clientX) },
      { edge: "right", dist: Math.abs(box.right - e.clientX) },
      { edge: "top", dist: Math.abs(box.top - e.clientY) },
      { edge: "bottom", dist: Math.abs(box.bottom - e.clientY) },
    ];
    return proximity.sort((a, b) => a.dist - b.dist)[0].edge;
  };

  const handleEnter = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const edge = getNearestEdge(e) as keyof typeof ENTRANCE;
    animate(scope.current, { clipPath: ENTRANCE[edge] }, { duration: 0.3 });
  };

  const handleLeave = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const edge = getNearestEdge(e) as keyof typeof EXIT;
    animate(scope.current, { clipPath: EXIT[edge] }, { duration: 0.3 });
  };

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="relative h-32 md:h-40 bg-white flex flex-col items-center justify-center cursor-pointer group"
    >
      <Icon className="text-3xl md:text-4xl text-black" />
      <span className="mt-3 text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500">
        {label}
      </span>

      <div
        ref={scope}
        style={{ clipPath: BOTTOM_RIGHT_CLIP }}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black text-white"
      >
        <Icon className="text-3xl md:text-4xl" />
        <span className="mt-3 text-[10px] uppercase tracking-[0.2em] font-medium opacity-80">
          {label}
        </span>
      </div>
    </div>
  );
};

export default TechHover;
