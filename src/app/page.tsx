"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import RainbowReveal from "@/components/RainbowReveal";
import TechHover from "@/components/TechHover";
import CreativeMind from "@/components/CreativeMind";
import BestProjects from "@/components/BestProjects";
import ScrollProgress from "@/components/ScrollProgress";
import Preloader from "@/components/PreLoader";
import Footer from "@/components/Footer";
import { ReactLenis } from 'lenis/react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <ReactLenis root options={{ lerp: 0.08 }}>
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}

      <div className={isLoading ? "h-screen overflow-hidden" : ""}>
        <ScrollProgress />
        <Navbar />
        <Hero />
        <RainbowReveal />
        <TechHover />
        <div className="h-20 md:h-32"></div>
        <CreativeMind />
        <BestProjects />
        <Footer />
      </div>
    </ReactLenis>
  );
}
