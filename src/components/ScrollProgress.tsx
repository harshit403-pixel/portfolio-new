"use client";
import { useRef, useEffect, useState, useCallback } from "react";

export default function ScrollProgress() {
  const [isScrolling, setIsScrolling] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const TRACK_H = 128;
  const THUMB_H = 32;
  const MAX_TRAVEL = TRACK_H - THUMB_H;

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      setProgress(scrollTop / docHeight);
    }

    setIsScrolling(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 800);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleScroll]);

  return (
    <div
      className="hidden md:block fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 w-[3px] rounded-full transition-opacity duration-300"
      style={{
        height: TRACK_H,
        backgroundColor: "rgba(160,160,160,0.35)",
        opacity: isScrolling ? 1 : 0,
      }}
    >
      <div
        ref={thumbRef}
        className="w-full rounded-full absolute left-0 top-0"
        style={{
          height: THUMB_H,
          backgroundColor: "#000",
          transform: `translateY(${progress * MAX_TRAVEL}px)`,
          transition: "transform 0.15s ease-out",
        }}
      />
    </div>
  );
}
