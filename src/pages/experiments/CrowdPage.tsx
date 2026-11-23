import { useEffect } from "react";
import Crowd from "@/pages/experiments/Crowd";

export function CrowdPage() {
  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] h-[100dvh] w-full overflow-hidden bg-white">
      <Crowd />
    </div>
  );
}

export default CrowdPage;
