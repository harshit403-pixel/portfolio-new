
import { useEffect } from "react";
import MemoryBoard from "@/components/MemoryBoard";

export function MemoryBoxPage() {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow =
      document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow =
        previousHtmlOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] h-[100dvh] w-full overflow-hidden bg-[var(--bg)]">
      <div className="h-full w-full overflow-hidden">
        <MemoryBoard />
      </div>
    </div>
  );
}

export default MemoryBoxPage;
