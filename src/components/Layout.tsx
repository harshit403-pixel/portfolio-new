import React from "react";

export function Shell({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative mx-auto w-full max-w-[760px] border-x border-dashed border-[var(--line)] ${className}`}>
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  aside,
  id,
}: {
  title: string;
  aside?: React.ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="relative w-full border-y border-[var(--line)] bg-stripes">
      <Shell className="bg-[var(--bg)]">
        {/* 2px Crosshair Dot Anchors at Grid Intersections (corners of Shell) */}
        <span className="absolute top-0 left-0 h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 bg-[var(--fg)] opacity-40 z-20" />
        <span className="absolute top-0 right-0 h-[3px] w-[3px] translate-x-1/2 -translate-y-1/2 bg-[var(--fg)] opacity-40 z-20" />
        <span className="absolute bottom-0 left-0 h-[3px] w-[3px] -translate-x-1/2 translate-y-1/2 bg-[var(--fg)] opacity-40 z-20" />
        <span className="absolute bottom-0 right-0 h-[3px] w-[3px] translate-x-1/2 translate-y-1/2 bg-[var(--fg)] opacity-40 z-20" />

        <div className="flex items-center justify-between gap-4 px-6 py-3 sm:px-8 w-full">
          <h2 className="font-serif text-2xl tracking-wide text-[var(--fg)]">
            {title}
          </h2>
          {aside}
        </div>
      </Shell>
    </div>
  );
}

export function GapBand({ h = "h-7", className = "" }: { h?: string; className?: string }) {
  return (
    <div className={`relative w-full bg-stripes ${h} ${className}`}>
      <Shell className="h-full bg-[var(--bg)]" />
    </div>
  );
}
