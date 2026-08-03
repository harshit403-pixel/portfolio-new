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
  // HELLO stagger in
  gsap.from(".loader-letter", {
    y: 120,
    opacity: 0,
    stagger: 0.2,
    duration: 0.6,
    ease: "power4.out",
  });

  // Small bounce
  gsap.to(".loader-logo", {
    scale: 1.5,
    duration: 0.35,
    delay: 1.2,
    ease: "power2.out",
  });

  // Big zoom
  gsap.to(".loader", {
    scale: 40,
    duration: 0.8,
    delay: 1.6,
    ease: "power4.inOut",
  });

  // Fly away
  gsap.to(".loader", {
    rotate: 45,
    x: 1800,
    y: 400,
    duration: 0.8,
    delay: 1.6,
    ease: "power4.inOut",
  });

  // Fade out
  gsap.to(containerRef.current, {
    opacity: 0,
    duration: 0.5,
    delay: 2.2,
    ease: "power2.out",
    onComplete: onComplete,
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
      {/* HR Logo */}
<div className="loader absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
  <h1
    className="loader-logo flex text-[70px] md:text-[120px] font-bold tracking-tight text-white"
    style={{ fontFamily: "Boldonse, sans-serif" }}
  >
    {"HELLO".split("").map((char, i) => (
      <span key={i} className="loader-letter">
        {char}
      </span>
    ))}
  </h1>
</div>

    </div>
  );
}
