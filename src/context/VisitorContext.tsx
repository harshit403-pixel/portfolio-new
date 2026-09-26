
import React, { createContext, useContext, useState, useEffect } from "react";

interface VisitorContextType {
  count: number | null;
  isLoading: boolean;
}

const VisitorContext = createContext<VisitorContextType | undefined>(undefined);

export function VisitorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      // Your own visitor counter key
      const KEY = "harshit_portfolio_views";

      // Count only once per browser session
      const hasVisited = sessionStorage.getItem(
        "harshit_portfolio_visited"
      );

      const endpoint = hasVisited ? "get" : "hit";

      const url = `https://countapi.mileshilliard.com/api/v1/${endpoint}/${KEY}`;

      try {
        if (!hasVisited) {
          sessionStorage.setItem("harshit_portfolio_visited", "true");
        }

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(
            `Failed to fetch visitor count: ${res.statusText}`
          );
        }

        const data = await res.json();

        if (typeof data.value === "number") {
          setCount(data.value);
        } else {
          setCount(0);
        }
      } catch (error) {
        console.error("Error fetching visitor count:", error);

        // Graceful fallback
        setCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCount();
  }, []);

  return (
    <VisitorContext.Provider value={{ count, isLoading }}>
      {children}
    </VisitorContext.Provider>
  );
}

export function useVisitor() {
  const context = useContext(VisitorContext);

  if (context === undefined) {
    throw new Error(
      "useVisitor must be used within a VisitorProvider"
    );
  }

  return context;
}

