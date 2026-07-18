"use client";

import React, { useRef, useMemo } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const RAINBOW_COLORS = [
  "#FF0055", // Hot Pink
  "#FF9900", // Orange
  "#FFEE00", // Yellow
  "#00FF66", // Green
  "#00CCFF", // Cyan
  "#8800FF", // Purple
];

const Char = ({ children, progress, range, colorIndex }: any) => {
  const activeColor = RAINBOW_COLORS[colorIndex % RAINBOW_COLORS.length];

  const color = useTransform(
    progress,
    [
      range[0],
      range[0] + (range[1] - range[0]) * 0.05,
      range[0] + (range[1] - range[0]) * 0.55,
      range[0] + (range[1] - range[0]) * 0.95,
      range[1]
    ],
    ["#e5e7eb", activeColor, activeColor, activeColor, "#000000"]
  );

  const shadow = useTransform(
    progress,
    [range[0], (range[0] + range[1]) / 2, range[1]],
    ["0px 0px 0px rgba(0,0,0,0)", `0px 0px 15px ${activeColor}66`, "0px 0px 0px rgba(0,0,0,0)"]
  );

  return (
    <motion.span
      style={{ color, textShadow: shadow }}
      className="relative inline-block font-black"
    >
      {children}
    </motion.span>
  );
};

const Word = ({ children, progress, range, charOffset }: any) => {
  const chars = children.split("");
  const amount = range[1] - range[0];
  const step = amount / chars.length;

  return (
    <span className="relative inline-block mr-[0.3em] whitespace-nowrap">
      {chars.map((char: string, i: number) => {
        const charStart = range[0] + i * step;
        const charEnd = charStart + step;
        return (
          <Char
            key={i}
            progress={progress}
            range={[charStart, charEnd]}
            colorIndex={charOffset + i}
          >
            {char}
          </Char>
        );
      })}
    </span>
  );
};

const RainbowToBlackReveal = ({ text, className = "" }: any) => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.9", "start 0.1"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
  });

  const words = useMemo(() => text.split(" "), [text]);
  let totalCharCount = 0;

  return (
    <div ref={containerRef} className={`flex flex-wrap justify-center text-center leading-[0.85] ${className}`}>
      {words.map((word: string, i: number) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        const currentOffset = totalCharCount;
        totalCharCount += word.length;

        return (
          <Word key={i} progress={smoothProgress} range={[start, end]} charOffset={currentOffset}>
            {word}
          </Word>
        );
      })}
    </div>
  );
};

export default function RainbowReveal() {
  return (
    <section id="about" className="bg-white w-full min-h-[50vh] pt-32 pb-16 md:pt-48 md:pb-24 flex flex-col items-center justify-center px-6 md:px-12 lg:px-24">
      <RainbowToBlackReveal
  text="I BUILD SCALABLE WEB APPLICATIONS, MODERN USER INTERFACES, AND ROBUST BACKEND SYSTEMS. MY GOAL IS TO CREATE FAST, INTUITIVE, AND IMPACTFUL DIGITAL EXPERIENCES."
  className="text-[clamp(2rem,5vw,5.5rem)] max-w-6xl font-mono tracking-tight"
/>
    </section>
  );
}
