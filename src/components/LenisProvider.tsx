import { useEffect } from "react";
import Lenis from "lenis";

export function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: false,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}