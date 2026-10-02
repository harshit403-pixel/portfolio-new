import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingMessageProps {
  image?: string;
  message?: string;

  className?: string;

  avatarSize?: "sm" | "md" | "lg";
  avatarBorderColor?: string;

  messageClassName?: string;

  float?: boolean;
  hoverScale?: number;
}

const avatarSizes = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

export function FloatingMessage({
  image,
  message,
  className = "absolute left-[8%] bottom-[22%] z-30 hidden md:block",
  avatarSize = "md",
  avatarBorderColor = "border-cyan-300",
  messageClassName = "",
  float = true,
  hoverScale = 1,
}: FloatingMessageProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      data-cursor-label={message}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        animate={
          float
            ? {
                y: [0, -3, 0],
                rotate: [-2, 2, -2],
              }
            : undefined
        }
        whileHover={{
          scale: hoverScale,
        }}
        transition={
          float
            ? {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : {
                type: "spring",
                stiffness: 350,
                damping: 20,
              }
        }
        className="relative cursor-pointer"
      >
        <div
          className={`
            relative
            flex
            ${avatarSizes[avatarSize]}
            items-center
            justify-center
            overflow-hidden
            rounded-full
            border-[5px]
            ${avatarBorderColor}
            bg-white
            shadow-[0_4px_12px_rgba(0,0,0,0.15)]
          `}
        >
          {image ? (
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-neutral-200" />
          )}
        </div>
      </motion.div>
    </div>
  );
}