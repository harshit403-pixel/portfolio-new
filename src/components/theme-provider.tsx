import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { flushSync } from "react-dom";

type Theme = "dark" | "light";

type ThemeOrigin = {
  x: number;
  y: number;
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (origin?: ThemeOrigin) => void;
  setTheme: (theme: Theme, origin?: ThemeOrigin) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const stored = localStorage.getItem("theme");

    if (stored === "light" || stored === "dark") {
      return stored;
    }

    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  });

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme === "dark");

    localStorage.setItem("theme", theme);
  }, [theme]);

  const changeTheme = (
    nextTheme: Theme,
    origin?: ThemeOrigin
  ) => {
    if (nextTheme === theme) return;

    const x = origin?.x ?? window.innerWidth / 2;
    const y = origin?.y ?? window.innerHeight / 2;

    document.documentElement.style.setProperty(
      "--theme-x",
      `${x}px`
    );

    document.documentElement.style.setProperty(
      "--theme-y",
      `${y}px`
    );

    const documentWithTransition = document as Document & {
      startViewTransition?: (
        callback: () => void
      ) => {
        ready: Promise<void>;
        finished: Promise<void>;
      };
    };

    /*
     * Browser supports View Transitions
     */
    if (documentWithTransition.startViewTransition) {
      documentWithTransition.startViewTransition(() => {
        flushSync(() => {
          setThemeState(nextTheme);
        });
      });

      return;
    }

    /*
     * Fallback for browsers that don't support
     * View Transition API.
     */
    setThemeState(nextTheme);
  };

  const toggleTheme = (origin?: ThemeOrigin) => {
    changeTheme(
      theme === "dark" ? "light" : "dark",
      origin
    );
  };

  const setTheme = (
    nextTheme: Theme,
    origin?: ThemeOrigin
  ) => {
    changeTheme(nextTheme, origin);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used within a ThemeProvider"
    );
  }

  return context;
}