import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shell } from "@/components/Layout";
import { site } from "@/config/site";
import { useTheme } from "./theme-provider";
import { Sun, Moon, Search, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Nav({
  onOpenPalette,
}: {
  onOpenPalette?: () => void;
}) {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    {
      label: "Home",
      path: "/",
    },
    {
      label: "Projects",
      path: "/projects",
    },
    {
      label: "Experiments",
      path: "/experiments",
    },
    {
      label: "Experience",
      path: "/experience",
    },
    {
      label: "Contact",
      path: "/contact",
    },
  ];

  return (
    <>
      <header
        className={`
          fixed
          top-0
          left-0
          right-0
          z-50
          mx-auto

          transition-all
          duration-500
          ease-[cubic-bezier(0.22,1,0.36,1)]

          ${
            scrolled
              ? `
                w-[763px]
                max-w-[calc(100%-24px)]
                mt-2
            
                border
                border-[var(--line)]
                bg-[var(--bg)]/90
                backdrop-blur-md
                shadow-2xl
              `
              : `
                w-full
                mt-0
                rounded-none
                border-b
                border-[var(--line)]
                bg-[var(--bg)]/85
                backdrop-blur-md
                shadow-none
              `
          }
        `}
      >
        <Shell
          className="
            flex items-center justify-between
            px-6 py-4
            sm:px-8
          "
        >
          {/* Logo */}
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="
              font-serif
              text-xl
              tracking-wide
              text-[var(--fg)]
              transition-opacity
              hover:opacity-80
            "
          >
            {site.firstName}
          </Link>

          {/* Desktop */}
          <nav className="hidden sm:flex items-center gap-5 text-[13px] text-[var(--muted)]">
            {navLinks.map(({ label, path }) => {
              const isActive = location.pathname === path;

              return (
                <Link
                  key={path}
                  to={path}
                  className={`
                    group relative
                    transition-colors
                    hover:text-[var(--fg)]
                    ${
                      isActive
                        ? "font-semibold text-[var(--fg)]"
                        : ""
                    }
                  `}
                >
                  {label}

                  <span
                    className={`
                      absolute
                      -bottom-0.5
                      left-0
                      h-px
                      w-full
                      origin-right
                      scale-x-0
                      bg-current
                      transition-transform
                      duration-300
                      group-hover:origin-left
                      group-hover:scale-x-100
                      ${
                        isActive
                          ? "scale-x-100 origin-left"
                          : ""
                      }
                    `}
                  />
                </Link>
              );
            })}

            {/* Search */}
            {onOpenPalette && (
              <button
                type="button"
                onClick={onOpenPalette}
                aria-label="Search Command Palette"
                className="
                  grid size-7 place-items-center
                  rounded-full
                  border border-[var(--line)]
                  text-[var(--muted)]
                  transition-all duration-300
                  hover:text-[var(--fg)]
                  cursor-pointer
                "
              >
                <Search className="size-3.5" />
              </button>
            )}

            {/* Theme */}
            <button
              type="button"
              onClick={(event) => {
  const rect = event.currentTarget.getBoundingClientRect();

  toggleTheme({
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  });
}}
              aria-label="Toggle theme"
              className="
                grid size-7 place-items-center
                rounded-full
                border border-[var(--line)]
                text-[var(--muted)]
                transition-all duration-300
                hover:rotate-45
                hover:text-[var(--fg)]
                cursor-pointer
              "
            >
              {dark ? (
                <Sun className="size-3.5" />
              ) : (
                <Moon className="size-3.5" />
              )}
            </button>
          </nav>

          {/* Mobile */}
          <div className="flex sm:hidden items-center gap-3">
            {onOpenPalette && (
              <button
                type="button"
                onClick={onOpenPalette}
                aria-label="Search Command Palette"
                className="
                  grid size-8 place-items-center
                  rounded-full
                  border border-[var(--line)]
                  text-[var(--muted)]
                  hover:text-[var(--fg)]
                  cursor-pointer
                "
              >
                <Search className="size-4" />
              </button>
            )}

            {/* Theme */}
            <button
              type="button"
              onClick={(event) => {
  const rect = event.currentTarget.getBoundingClientRect();

  toggleTheme({
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  });
}}
              aria-label="Toggle theme"
              className="
                grid size-8 place-items-center
                rounded-full
                border border-[var(--line)]
                text-[var(--muted)]
                hover:text-[var(--fg)]
                cursor-pointer
              "
            >
              {dark ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </button>

            {/* Mobile Menu */}
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen((open) => !open)
              }
              aria-label="Toggle Mobile Menu"
              className="
                grid size-8 place-items-center
                rounded-full
                border border-[var(--line)]
                text-[var(--muted)]
                hover:text-[var(--fg)]
                cursor-pointer
              "
            >
              {mobileMenuOpen ? (
                <X className="size-4" />
              ) : (
                <Menu className="size-4" />
              )}
            </button>
          </div>
        </Shell>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              transition={{
                duration: 0.25,
                ease: "easeInOut",
              }}
              className="
                sm:hidden
                absolute
                top-full
                left-0
                w-full
                overflow-hidden
                border-b
                border-[var(--line)]
                bg-[var(--bg)]
                shadow-lg
                z-50
              "
            >
              <div
                className="
                  flex flex-col
                  space-y-4
                  px-6 py-6
                  font-serif
                  text-lg
                "
              >
                {navLinks.map(({ label, path }) => {
                  const isActive =
                    location.pathname === path;

                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={() =>
                        setMobileMenuOpen(false)
                      }
                      className={`
                        flex items-center gap-2
                        border-b
                        border-dashed
                        border-[var(--line)]/50
                        pb-2.5
                        transition-colors
                        ${
                          isActive
                            ? "font-semibold text-[var(--fg)]"
                            : "text-[var(--muted)]"
                        }
                      `}
                    >
                      <span
                        className={`
                          size-1.5
                          rounded-full
                          bg-[var(--fg)]
                          ${
                            isActive
                              ? "opacity-100"
                              : "opacity-0"
                          }
                        `}
                      />

                      {label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Space reserved for fixed navbar */}
      <div className="h-[64px]" />
    </>
  );
}