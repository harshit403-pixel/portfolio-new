import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useEffect, useState } from "react";

const DEFAULT_LABEL = "YOU";

const CursorGuide = () => {
  const [label, setLabel] = useState(DEFAULT_LABEL);
  const [visible, setVisible] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const x = useSpring(mouseX, {
    stiffness: 500,
    damping: 35,
    mass: 0.4,
  });

  const y = useSpring(mouseY, {
    stiffness: 500,
    damping: 35,
    mass: 0.4,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX + 14);
      mouseY.set(e.clientY + 18);

      const element = document.elementFromPoint(
        e.clientX,
        e.clientY
      ) as HTMLElement | null;

      const target = element?.closest(
        "[data-cursor-label]"
      ) as HTMLElement | null;

      const nextLabel =
        target?.getAttribute("data-cursor-label") ||
        DEFAULT_LABEL;

      setLabel(nextLabel);
      setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);

    document.documentElement.addEventListener(
      "mouseleave",
      handleMouseLeave
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      document.documentElement.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );
    };
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="
        pointer-events-none
        fixed
        left-0
        top-0
        z-[999999]
      "
      style={{
        x,
        y,
      }}
      animate={{
        opacity: visible ? 1 : 0,
      }}
      transition={{
        opacity: {
          duration: 0.15,
        },
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={label}
          initial={{
            opacity: 0,
            y: 5,
            filter: "blur(4px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          exit={{
            opacity: 0,
            y: -5,
            filter: "blur(4px)",
          }}
          transition={{
            duration: 0.16,
            ease: "easeOut",
          }}
          className="
            whitespace-nowrap
             rounded-tl-[2px]
  rounded-tr-[10px]
  rounded-br-[10px]
  rounded-bl-[10px]
            bg-[var(--fg)]
            px-2.5
            py-1.5
            text-[13px]
            font-mono
            font-semibold
            leading-tight
            tracking-tighter
            text-[var(--bg)]
            shadow-[0_4px_15px_rgba(0,0,0,0.15)]
          "
        >
          {label}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default CursorGuide;