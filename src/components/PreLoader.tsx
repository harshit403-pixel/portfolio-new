"use client";
import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Roll counters
    const animateCounter = (counterClass: string, duration: number, delay = 0) => {
      const counter = containerRef.current?.querySelector(counterClass) as HTMLElement;
      if (!counter) return;
      const nums = counter.querySelectorAll(".num");
      if (nums.length === 0) return;
      const numHeight = (nums[0] as HTMLElement).clientHeight || 100;
      const totalDistance = (nums.length - 1) * numHeight;

      gsap.to(counter, {
        y: -totalDistance,
        duration: duration,
        delay: delay,
        ease: "power2.inOut",
      });
    };

    animateCounter(".counter-3", 5, 0);
    animateCounter(".counter-2", 6, 0);
    animateCounter(".counter-1", 2, 4);

    // 2. Animate digits out
    gsap.to(".digit", {
      top: "-150px",
      stagger: {
        amount: 0.25,
      },
      delay: 6,
      duration: 1,
      ease: "power4.inOut",
    });

    // 3. Animate loaders
    gsap.from(".loader-1", {
      width: 0,
      duration: 6,
      ease: "power2.inOut",
    });

    gsap.from(".loader-2", {
      width: 0,
      delay: 1.9,
      duration: 2,
      ease: "power2.inOut",
    });

    gsap.to(".loader", {
      background: "none",
      delay: 6,
      duration: 0.1,
    });

    gsap.to(".loader-1", {
      rotate: 90,
      y: -50,
      duration: 0.5,
      delay: 6,
    });

    gsap.to(".loader-2", {
      x: -75,
      y: 75,
      duration: 0.5,
      delay: 6
    });

    gsap.to(".loader", {
      scale: 40,
      duration: 1,
      delay: 7,
      ease: "power2.inOut",
    });

    gsap.to(".loader", {
      rotate: 45,
      y: 500,
      x: 2000,
      duration: 1,
      delay: 7,
      ease: "power2.inOut",
    });

    // 4. Fade out loading screen and trigger completion
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 1,
      delay: 7.2,
      ease: "power2.inOut",
      onComplete: () => {
        onComplete();
      }
    });

  }, { scope: containerRef });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-lenis-prevent="true"
      className="fixed inset-0 z-[999] bg-[#111111] text-white pointer-events-auto font-sans flex flex-col justify-center items-center overflow-hidden"
    >
      {/* Loader Bars */}
      <div className="loader absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[50px] flex bg-[rgb(80,80,80)]">
        <div className="loader-1 bar relative bg-white w-[200px] h-[50px]"></div>
        <div className="loader-2 bar relative bg-white w-[100px] h-[50px]"></div>
      </div>

      {/* Counter */}
      <div
        className="counter fixed left-6 md:left-12 bottom-6 md:bottom-12 flex h-[100px] text-[100px] leading-[102px] font-normal"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 100px, 0 100px)" }}
      >
        <div className="counter-1 digit relative -top-[15px]">
          <div className="num h-[100px] flex items-center justify-center">0</div>
          <div className="num h-[100px] flex items-center justify-center relative -right-[10px]">1</div>
        </div>
        <div className="counter-2 digit relative -top-[15px]">
          <div className="num h-[100px] flex items-center justify-center">0</div>
          <div className="num h-[100px] flex items-center justify-center">1</div>
          <div className="num h-[100px] flex items-center justify-center">2</div>
          <div className="num h-[100px] flex items-center justify-center">3</div>
          <div className="num h-[100px] flex items-center justify-center">4</div>
          <div className="num h-[100px] flex items-center justify-center">5</div>
          <div className="num h-[100px] flex items-center justify-center">6</div>
          <div className="num h-[100px] flex items-center justify-center">7</div>
          <div className="num h-[100px] flex items-center justify-center">8</div>
          <div className="num h-[100px] flex items-center justify-center">9</div>
          <div className="num h-[100px] flex items-center justify-center">0</div>
        </div>
        <div className="counter-3 digit relative -top-[15px]">
          {Array.from({ length: 2 }).flatMap((_, i) =>
            Array.from({ length: 10 }).map((_, j) => (
              <div key={`${i}-${j}`} className="num h-[100px] flex items-center justify-center">{j}</div>
            ))
          )}
          <div className="num h-[100px] flex items-center justify-center">0</div>
        </div>
      </div>
    </div>
  );
}
