import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { site } from "@/config/site";
import { useTheme } from "./theme-provider";
import { 
  Search, 
  Compass, 
  Globe, 
  Terminal, 
  Copy, 
  Check, 
  Moon, 
  Sun, 
  ExternalLink,
  BookOpen,
  Mail,
  Briefcase,
  GitMerge
} from "lucide-react";
import { GitHubIcon } from "./icons";

interface PaletteItem {
  id: string;
  category: "navigation" | "projects" | "actions";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
}

export function CommandPalette({
  open,
  isOpen,
  onClose,
  setIsOpen,
}: {
  open?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  setIsOpen?: (open: boolean) => void;
}) {
  const activeOpen = open ?? isOpen ?? false;
  const handleClose = () => {
    if (onClose) onClose();
    if (setIsOpen) setIsOpen(false);
  };
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [activeOpen]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(site.email);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      handleClose();
    }, 1000);
  };

  const items: PaletteItem[] = [
    {
      id: "nav-home",
      category: "navigation",
      title: "Go to Home",
      subtitle: "Overview, highlights, and recent code",
      icon: <Compass size={16} />,
      action: () => {
        navigate("/");
        handleClose();
      },
    },
    {
      id: "nav-about",
      category: "navigation",
      title: "Go to About",
      subtitle: "Bio, experience, and full skills matrix",
      icon: <Terminal size={16} />,
      action: () => {
        navigate("/#about");
        handleClose();
      },
    },
    {
      id: "nav-projects",
      category: "navigation",
      title: "Go to Projects",
      subtitle: "Browse all projects & live demos",
      icon: <Globe size={16} />,
      action: () => {
        navigate("/projects");
        handleClose();
      },
    },
    {
      id: "nav-experience",
      category: "navigation",
      title: "Go to Experience",
      subtitle: "Engineering experience & freelance work",
      icon: <Briefcase size={16} />,
      action: () => {
        navigate("/experience");
        handleClose();
      },
    },
    {
      id: "nav-opensource",
      category: "navigation",
      title: "Go to Open Source",
      subtitle: "5+ merged pull requests & contributions",
      icon: <GitMerge size={16} />,
      action: () => {
        navigate("/#opensource");
        handleClose();
      },
    },
    {
      id: "nav-writing",
      category: "navigation",
      title: "Go to Writing",
      subtitle: "Technical articles & blog posts",
      icon: <BookOpen size={16} />,
      action: () => {
        navigate("/writing");
        handleClose();
      },
    },
    {
      id: "nav-contact",
      category: "navigation",
      title: "Go to Contact",
      subtitle: "Social links, email, and contact form",
      icon: <Mail size={16} />,
      action: () => {
        navigate("/contact");
        handleClose();
      },
    },
    ...site.projects.map((p) => ({
      id: `project-${p.title.toLowerCase()}`,
      category: "projects" as const,
      title: `View ${p.title}`,
      subtitle: p.blurb,
      icon: <Globe size={16} />,
      action: () => {
        navigate(`/projects?search=${encodeURIComponent(p.title)}`);
        handleClose();
      },
    })),
    {
      id: "action-theme",
      category: "actions",
      title: theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme",
      subtitle: theme === "dark" ? "Go light mode" : "Go dark mode",
      icon: theme === "dark" ? <Sun size={16} /> : <Moon size={16} />,
      action: () => {
        toggleTheme();
        handleClose();
      },
    },
    {
      id: "action-medium",
      category: "actions",
      title: "Open Medium Profile",
      subtitle: "https://medium.com/@harshuraghu7999",
      icon: <BookOpen size={16} />,
      action: () => {
        window.open((site.socials as any).medium, "_blank");
        handleClose();
      },
    },
    {
      id: "action-copy-email",
      category: "actions",
      title: copied ? "Copied!" : "Copy Email Address",
      subtitle: site.email,
      icon: copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />,
      action: handleCopyEmail,
    },
  ];

  const filteredItems = items.filter((item) => {
    const term = query.toLowerCase().trim();
    if (!term) return true;
    return (
      item.title.toLowerCase().includes(term) ||
      item.subtitle?.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeOpen, filteredItems, selectedIndex]);

  useEffect(() => {
    const activeEl = listRef.current?.querySelector("[data-active='true']");
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {activeOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/95 shadow-2xl backdrop-blur-xl max-h-[60vh] z-10"
          >
            <div className="flex items-center border-b border-neutral-800 px-4 py-3.5 gap-2.5">
              <Search className="text-neutral-400 shrink-0" size={18} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search pages, projects, or actions..."
                className="w-full bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 outline-none border-none"
              />
              <kbd className="hidden sm:inline-block rounded-md border border-neutral-700 bg-neutral-800 px-1.5 py-0.5 font-mono text-[10px] text-neutral-400">
                ESC
              </kbd>
            </div>

            <div 
             data-lenis-prevent
              ref={listRef} 
              className="flex-1 overscroll-contain overflow-y-auto py-2 divide-y divide-neutral-800/40"
            >
              {filteredItems.length === 0 ? (
                <div className="px-4 py-8 text-center font-mono text-xs text-neutral-500">
                  No commands matched "{query}"
                </div>
              ) : (
                Object.entries(
                  filteredItems.reduce((acc, item) => {
                    if (!acc[item.category]) acc[item.category] = [];
                    acc[item.category].push(item);
                    return acc;
                  }, {} as Record<string, PaletteItem[]>)
                ).map(([category, catItems]) => {
                  return (
                    <div key={category} className="py-2 first:pt-0 last:pb-0">
                      <h4 className="px-4 py-1.5 font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">
                        {category}
                      </h4>
                      <div className="mt-1 flex flex-col px-2 gap-0.5">
                        {catItems.map((item) => {
                          const itemIndex = filteredItems.indexOf(item);
                          const isActive = itemIndex === selectedIndex;

                          return (
                            <button
                              key={item.id}
                              data-active={isActive}
                              onClick={item.action}
                              onMouseEnter={() => setSelectedIndex(itemIndex)}
                              className={`flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-left w-full transition-all duration-150 border ${
                                isActive
                                  ? "bg-neutral-800 border-neutral-700 text-white shadow-sm"
                                  : "border-transparent text-neutral-300 hover:bg-neutral-800/50"
                              }`}
                            >
                              <span className={`shrink-0 ${isActive ? "text-white" : "text-neutral-400"}`}>
                                {item.icon}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold leading-tight truncate">
                                  {item.title}
                                </p>
                                {item.subtitle && (
                                  <p className={`text-[10px] leading-tight truncate mt-0.5 ${
                                    isActive ? "text-neutral-300" : "text-neutral-400"
                                  }`}>
                                    {item.subtitle}
                                  </p>
                                )}
                              </div>
                              {isActive && (
                                <ExternalLink size={12} className="opacity-60 text-white" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-950/60 px-4 py-2.5 font-mono text-[9px] text-neutral-500">
              <div className="flex gap-2">
                <span>↑↓ navigate</span>
                <span>•</span>
                <span>Enter select</span>
              </div>
              <span>ESC close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
