import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { VisitorProvider } from "@/context/VisitorContext";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { SideIndex } from "@/components/SideIndex";
import { Hero } from "@/sections/Hero";
import { About } from "@/sections/About";  
import { Contact } from "@/sections/Contact";
import { Projects } from "@/sections/Projects";
import { Experience } from "@/sections/Experience";
import { OpenSource } from "@/sections/OpenSource";
import { TechStack } from "@/sections/TechStack";
import { Writing } from "@/sections/Writing";
import { GithubActivity } from "@/sections/GithubActivity";
import { CommandPalette } from "@/components/command-palette";
import { WritingPage } from "@/pages/WritingPage";
import { Analytics } from "@vercel/analytics/react";
import { ContactPage } from "./pages/ContactPage";
import { LenisProvider } from "./components/LenisProvider";
import { PixelCursor } from "./components/PixelCursor";

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "auto" });
        }, 100);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function MainLayout({ onOpenPalette }: { onOpenPalette: () => void }) {
  return (
    <>
      <Hero onOpenPalette={onOpenPalette} />
      <About />
      <Contact />
      <Projects isSearchable={false} />
      <Experience isDetailed={false} />
      <OpenSource />
      <TechStack />
      <Writing limit={4} />
      <GithubActivity />
    </>
  );
}

export function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);



  return (
    <ThemeProvider>
      <LenisProvider>
        <VisitorProvider>
        <BrowserRouter>
        <PixelCursor/>
          <Analytics />
          <ScrollToTop />
          <div className="min-h-screen bg-[var(--bg)] font-sans text-[var(--fg)] antialiased transition-colors duration-300 relative">
            <Nav onOpenPalette={() => setPaletteOpen(true)} />
            <SideIndex />

            <main className="relative z-10">
              <Routes>
                <Route path="/" element={<MainLayout onOpenPalette={() => setPaletteOpen(true)} />} />
                <Route path="/projects" element={<Projects isSearchable={true} />} />
                <Route
                  path="/experience"
                  element={
                    <>
                      <Experience isDetailed={true} />
                      <OpenSource />
                    </>
                  }
                />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/writing" element={<WritingPage />} />
              </Routes>
            </main>

            <Footer />
            <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
          </div>
        </BrowserRouter>
      </VisitorProvider>
      </LenisProvider>
    </ThemeProvider>
  );
}

export default App;
