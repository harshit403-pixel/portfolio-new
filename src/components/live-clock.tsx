import { useEffect, useState } from "react";
import { site } from "@/config/site";

export function LiveClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const fmt = () => {
      try {
        return new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: site.timezone,
        }).format(new Date());
      } catch {
        return new Date().toLocaleTimeString();
      }
    };
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-neutral-400">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </span>
      {site.location} · {time || "--:--:--"}
    </span>
  );
}
