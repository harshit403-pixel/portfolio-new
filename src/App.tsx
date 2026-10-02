import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { ThemeProvider } from "@/components/theme-provider";
import { VisitorProvider } from "@/context/VisitorContext";

import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { SideIndex } from "@/components/SideIndex";
import { CommandPalette } from "@/components/command-palette";
import { PixelCursor } from "./components/PixelCursor";
import { LenisProvider } from "./components/LenisProvider";

import { Hero } from "@/sections/Hero";
import { About } from "@/sections/About";
import { Contact } from "@/sections/Contact";
import { Projects } from "@/sections/Projects";
import { Experience } from "@/sections/Experience";
import { OpenSource } from "@/sections/OpenSource";
import { TechStack } from "@/sections/TechStack";
import { Writing } from "@/sections/Writing";
import { GithubActivity } from "@/sections/GithubActivity";

import { WritingPage } from "@/pages/WritingPage";
import { ContactPage } from "./pages/ContactPage";
import { NotFoundSign } from "@/components/NotFoundSign";

import { Analytics } from "@vercel/analytics/react";
import CursorGuide from "./components/CursorGuide";

/* ============================================================
   VALID PORTFOLIO ROUTES
============================================================ */

const VALID_ROUTES = [
  "/",
  "/projects",
  "/experience",
  "/contact",
  "/writing",
];

/* ============================================================
   SCROLL TO TOP
============================================================ */

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);

      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "auto",
          });
        }, 100);

        return;
      }
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

/* ============================================================
   MAIN HOME PAGE
============================================================ */

function MainLayout({
  onOpenPalette,
}: {
  onOpenPalette: () => void;
}) {
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

/* ============================================================
   404 PAGE
============================================================ */

function NotFoundPage() {
  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[var(--bg)]
        text-[var(--fg)]
      "
    >
      <NotFoundSign />
    </div>
  );
}

/* ============================================================
   APP CONTENT
============================================================ */

function AppContent() {
  const [paletteOpen, setPaletteOpen] =
    useState(false);

  const { pathname } = useLocation();

  /*
   * Anything that isn't one of our actual
   * portfolio routes is treated as a 404.
   */
  const is404 =
    !VALID_ROUTES.includes(pathname);

  /* ==========================================================
     COMMAND PALETTE
  ========================================================== */

  useEffect(() => {
    const handleKeyDown = (
      e: KeyboardEvent
    ) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "k"
      ) {
        e.preventDefault();

        setPaletteOpen(
          (prev) => !prev
        );
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, []);

  return (
    <div
      className="
        relative
        min-h-screen
        bg-[var(--bg)]
        font-sans
        text-[var(--fg)]
        antialiased
        transition-colors
        duration-300
      "
    >
      {/* ======================================================
          NORMAL PORTFOLIO NAVIGATION

          Completely hidden on 404.
      ====================================================== */}

      {!is404 && (
        <Nav
          onOpenPalette={() =>
            setPaletteOpen(true)
          }
        />
      )}

      {/* ======================================================
          SIDE INDEX

          Completely hidden on 404.
      ====================================================== */}

      {!is404 && <SideIndex />}

      {/* ======================================================
          PAGE CONTENT
      ====================================================== */}

      <main
        className={
          is404
            ? "relative"
            : "relative z-10"
        }
      >
        <Routes>

          {/* ====================================================
              HOME
          ==================================================== */}

          <Route
            path="/"
            element={
              <MainLayout
                onOpenPalette={() =>
                  setPaletteOpen(true)
                }
              />
            }
          />

          {/* ====================================================
              PROJECTS
          ==================================================== */}

          <Route
            path="/projects"
            element={
              <Projects
                isSearchable={true}
              />
            }
          />

          {/* ====================================================
              EXPERIENCE
          ==================================================== */}

          <Route
            path="/experience"
            element={
              <>
                <Experience
                  isDetailed={true}
                />

                <OpenSource />
              </>
            }
          />

          {/* ====================================================
              CONTACT
          ==================================================== */}

          <Route
            path="/contact"
            element={
              <ContactPage />
            }
          />

          {/* ====================================================
              WRITING
          ==================================================== */}

          <Route
            path="/writing"
            element={
              <WritingPage />
            }
          />

          {/* ====================================================
              REAL 404

              Any unknown URL comes here.
          ==================================================== */}

          <Route
            path="*"
            element={
              <NotFoundPage />
            }
          />

        </Routes>
      </main>

      {/* ======================================================
          FOOTER

          Completely hidden on 404.
      ====================================================== */}

      {!is404 && <Footer />}

      {/* ======================================================
          COMMAND PALETTE

          Also hidden on 404.
      ====================================================== */}

      {!is404 && (
        <CommandPalette
          open={paletteOpen}
          onClose={() =>
            setPaletteOpen(false)
          }
        />
      )}
    </div>
  );
}

/* ============================================================
   APP
============================================================ */

export function App() {
  return (
    <ThemeProvider>
      <LenisProvider>
        <VisitorProvider>
          <BrowserRouter>
            <CursorGuide/>

            <Analytics />

            <ScrollToTop />

            <AppContent />
          </BrowserRouter>
        </VisitorProvider>
      </LenisProvider>
    </ThemeProvider>
  );
}

export default App;