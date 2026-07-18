"use client";
import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import SplitType from "split-type";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const isAnimating = useRef(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const navToggleMenuRef = useRef<HTMLParagraphElement>(null);
  const navToggleCloseRef = useRef<HTMLParagraphElement>(null);
  const menuBgPathRef = useRef<SVGPathElement>(null);
  const menuColInfoRef = useRef<HTMLDivElement>(null);
  const menuColLinksRef = useRef<HTMLDivElement>(null);

  const splitsRef = useRef<SplitType[]>([]);

  const svgWidth = 1131;
  const svgHeight = 861;
  const svgCenterX = svgWidth / 2;

  const OPEN_HIDDEN = `M${svgWidth},0 Q${svgCenterX},0 0,0 L0,0 L${svgWidth},0 Z`;
  const OPEN_BULGE = `M${svgWidth},345 Q${svgCenterX},620 0,345 L0,0 L${svgWidth},0 Z`;
  const OPEN_FULL = `M${svgWidth},${svgHeight} Q${svgCenterX},${svgHeight} 0,${svgHeight} L0,0 L${svgWidth},0 Z`;
  const CLOSE_START = `M${svgWidth},0 Q${svgCenterX},0 0,0 L0,${svgHeight} L${svgWidth},${svgHeight} Z`;
  const CLOSE_BULGE = `M${svgWidth},350 Q${svgCenterX},130 0,350 L0,${svgHeight} L${svgWidth},${svgHeight} Z`;
  const CLOSE_HIDDEN = `M${svgWidth},${svgHeight} Q${svgCenterX},${svgHeight} 0,${svgHeight} L0,${svgHeight} L${svgWidth},${svgHeight} Z`;

  useEffect(() => {
    // Initial Setup
    gsap.set(menuBgPathRef.current, { attr: { d: OPEN_HIDDEN } });

    const menuLinks = menuColLinksRef.current?.querySelectorAll("a") || [];
    splitsRef.current = [];
    menuLinks.forEach((link) => {
      const split = new SplitType(link as HTMLElement, { types: "chars", charClass: "char" });
      splitsRef.current.push(split);
      gsap.set(split.chars, { opacity: 0, x: "150%" });
    });

    const menuInfoItems = menuColInfoRef.current?.querySelectorAll("p, h3, h6") || [];
    gsap.set(menuInfoItems, { opacity: 0, y: 100 });

    return () => {
      splitsRef.current.forEach((split) => split.revert());
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleMenu = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const willOpen = !isOpen;
    setIsOpen(willOpen);

    const menuInfoItems = menuColInfoRef.current?.querySelectorAll("p, h3, h6") || [];
    const menuLinks = menuColLinksRef.current?.querySelectorAll("a") || [];
    const menuLinksChars = splitsRef.current.flatMap((s) => s.chars || []);

    if (willOpen) {
      menuRef.current?.classList.add("is-open");

      gsap.to(navToggleMenuRef.current, { duration: 0.25, opacity: 0, ease: "none" });
      gsap.to(navToggleCloseRef.current, { duration: 0.25, opacity: 1, ease: "none", delay: 0.25 });

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating.current = false;
        },
      });

      tl.to(menuBgPathRef.current, { duration: 0.5, attr: { d: OPEN_BULGE }, ease: "power4.in" })
        .to(menuBgPathRef.current, { duration: 0.5, attr: { d: OPEN_FULL }, ease: "power4.out" });

      tl.to(
        menuInfoItems,
        {
          duration: 0.75,
          opacity: 1,
          y: 0,
          ease: "power3.out",
          stagger: 0.075,
        },
        "-=0.35"
      );

      tl.to(
        menuLinksChars,
        {
          duration: 1.5,
          x: "0%",
          ease: "elastic.out(1, 0.25)",
          stagger: 0.01,
        },
        0.45
      );

      tl.to(
        menuLinksChars,
        {
          duration: 0.75,
          opacity: 1,
          ease: "power2.out",
          stagger: 0.01,
        },
        0.45
      );
    } else {
      gsap.set(menuBgPathRef.current, { attr: { d: CLOSE_START } });

      gsap.to(navToggleCloseRef.current, { duration: 0.3, opacity: 0, ease: "none" });
      gsap.to(navToggleMenuRef.current, { duration: 0.3, opacity: 1, ease: "none", delay: 0.25 });

      const tl = gsap.timeline({
        onComplete: () => {
          menuRef.current?.classList.remove("is-open");
          gsap.set(menuBgPathRef.current, { attr: { d: OPEN_HIDDEN } });
          splitsRef.current.forEach((split) => {
            gsap.set(split.chars, { opacity: 0, x: "150%" });
          });
          gsap.set(menuLinks, { opacity: 1 });
          gsap.set(menuInfoItems, { opacity: 0, y: 100 });
          isAnimating.current = false;
        },
      });

      tl.to(menuLinks, { duration: 0.3, opacity: 0 })
        .to(menuInfoItems, { duration: 0.3, opacity: 0 }, "<");

      tl.to(menuBgPathRef.current, { duration: 0.5, attr: { d: CLOSE_BULGE }, ease: "power3.in" }, "<")
        .to(menuBgPathRef.current, { duration: 0.5, attr: { d: CLOSE_HIDDEN }, ease: "power3.out" });
    }
  };

  const handleLinkClick = () => {
    isAnimating.current = false;
    if (isOpen) {
      toggleMenu();
    }
  };

  return (
    <>
      <div className="nav">
        <div className="nav-logo">
          <Link href="/" className="no-underline">
            <div className="text-2xl md:text-3xl tracking-tighter" style={{ fontFamily: 'Boldonse, sans-serif' }}>harshit</div>
          </Link>
        </div>

        <div className="nav-toggle" onClick={toggleMenu}>
          <p ref={navToggleMenuRef} className="nav-toggle-menu">Menu</p>
          <p ref={navToggleCloseRef} className="nav-toggle-close">Close</p>
        </div>
      </div>

      <div ref={menuRef} data-lenis-prevent="true" className={`menu ${isOpen ? 'is-open' : ''}`}>
        <svg className="menu-bg-svg" viewBox="0 0 1131 861" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path ref={menuBgPathRef} id="menu-path" fill="#f0eeee" d="M1131,0 Q565.5,0 0,0 L0,0 L1131,0 Z" />
        </svg>

        <div ref={menuColInfoRef} className="menu-col menu-col-info">
  <p>Get in touch</p>


  <h3 className="text-sm md:text-base mt-2">
    +91 7999760184
  </h3>

  <br />

  <h6>Bhopal, India</h6>
  <h6>Available Worldwide</h6>
</div>

        <div ref={menuColLinksRef} className="menu-col menu-col-links">
          <Link href="#work" onClick={handleLinkClick}>work</Link>
          <Link href="#services" onClick={handleLinkClick}>services</Link>
          <Link href="#about" onClick={handleLinkClick}>about</Link>
          <Link href="#insights" onClick={handleLinkClick}>insights</Link>
          <a href="/resume" target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}>resume</a>
          <Link href="#contact" onClick={handleLinkClick}>contact</Link>
        </div>
      </div>
    </>
  );
}
