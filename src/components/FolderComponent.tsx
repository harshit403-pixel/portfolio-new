"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import MemoryBoard from "./MemoryBoard";

const themes = {
  black: {
    backFill: "black",
    backInsetColor:
      "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.37 0",
    backInsetShadow: "inset 0 0 6px 2px rgba(255,255,255,0.37)",
    flapFill: "#292929",
    flapFillOpacity: 0.25,
    flapStroke: "#979797",
    flapInsetColor:
      "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0",
    cardFill: "#F1F1F1",
    cardStroke: "#E0E0E0",
    cardLineFill: "#D4D4D4",
    cardInsetColor:
      "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0",
  },

  white: {
    backFill: "#ffffff",
    backInsetColor:
      "0 0 0 0 0.7 0 0 0 0 0.7 0 0 0 0 0.7 0 0 0 0.25 0",
    backInsetShadow: "inset 0 0 6px 2px rgba(178,178,178,0.25)",
    flapFill: "#f5f5f5",
    flapFillOpacity: 0.85,
    flapStroke: "#d4d4d4",
    flapInsetColor:
      "0 0 0 0 0.6 0 0 0 0 0.6 0 0 0 0 0.6 0 0 0 0.15 0",
    cardFill: "#262626",
    cardStroke: "#404040",
    cardLineFill: "#737373",
    cardInsetColor:
      "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.15 0",
  },

  blue: {
    backFill: "#50B1FD",
    backInsetColor:
      "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0",
    backInsetShadow: "inset 0 0 6px 2px rgba(255,255,255,0.35)",
    flapFill: "#3a9ae8",
    flapFillOpacity: 0.45,
    flapStroke: "#7ec8ff",
    flapInsetColor:
      "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.12 0",
    cardFill: "#F1F1F1",
    cardStroke: "#E0E0E0",
    cardLineFill: "#D4D4D4",
    cardInsetColor:
      "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0",
  },
} as const;

const sizeScales = {
  sm: 0.65,
  md: 1,
  lg: 1.35,
} as const;

type FolderComponentProps = Omit<
  React.ComponentProps<"div">,
  "color"
> & {
  color?: "black" | "white" | "blue";
  size?: "sm" | "md" | "lg";
};

const BASE_WIDTH = 321;
const BASE_HEIGHT = 270;

const FLAP_PATH =
  "M0 25C0 11.1929 11.1929 0 25 0H136.084C143.044 0 149.689 2.90139 154.42 8.00608L178.08 33.5343C182.811 38.639 189.456 41.5404 196.416 41.5404H296C309.807 41.5404 321 52.7333 321 66.5404V216C321 229.807 309.807 241 296 241H25C11.1929 241 0 229.807 0 216V25Z";

const FolderComponent = ({
  color = "black",
  size = "md",
  className,
  ...props
}: FolderComponentProps) => {
  const theme = themes[color] ?? themes.black;
  const scale = sizeScales[size];

  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  /*
   * ============================================================
   * LOCK BACKGROUND SCROLL
   * ============================================================
   */

  useEffect(() => {
    if (!isOpen) return;

    const html = document.documentElement;
    const body = document.body;

    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousOverscroll = body.style.overscrollBehavior;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousOverscroll;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      data-slot="folder"
      className={`absolute ${className ?? ""}`}
      style={{
        width: BASE_WIDTH * scale,
        height: BASE_HEIGHT * scale,
      }}
      {...props}
    >
      <div
        className="relative cursor-pointer select-none"
        style={{
          width: BASE_WIDTH * scale,
          height: BASE_HEIGHT * scale,
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
        onClick={() => setIsOpen(true)}
      >
        <div
          className="absolute top-1/2 left-1/2"
          style={{
            width: BASE_WIDTH,
            height: BASE_HEIGHT,
            transform: `translate(-50%, -50%) scale(${scale})`,
            perspective: 800 * scale,
          }}
        >
          {/* =====================================================
              BACK OF FOLDER
          ====================================================== */}

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              style={{
                width: BASE_WIDTH,
                height: BASE_HEIGHT,
                borderRadius: 25,
                backgroundColor: theme.backFill,
                boxShadow: theme.backInsetShadow,
              }}
            />
          </div>

          {/* =====================================================
              CARDS
          ====================================================== */}

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <motion.div
              className="absolute"
              animate={{
                y: isOpen ? -160 : isHovered ? -30 : -10,
                x: isOpen ? 70 : 40,
                rotate: isOpen ? 18 : isHovered ? 14 : 10,
              }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 13,
                delay: isOpen ? 0.1 : isHovered ? 0.12 : 0,
              }}
            >
              <Card id={1} theme={theme} />
            </motion.div>

            <motion.div
              className="absolute"
              animate={{
                y: isOpen ? -180 : isHovered ? -35 : -20,
                x: isOpen ? 0 : 3,
                rotate: isOpen ? -3 : isHovered ? -1 : 2,
              }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 13,
                delay: isOpen ? 0.05 : isHovered ? 0.06 : 0,
              }}
            >
              <Card id={2} theme={theme} />
            </motion.div>

            <motion.div
              className="absolute"
              animate={{
                y: isOpen ? -170 : isHovered ? -44 : -22,
                x: isOpen ? -65 : -40,
                rotate: isOpen ? -14 : isHovered ? -9 : -5,
              }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 13,
                delay: isOpen ? 0 : 0,
              }}
            >
              <Card id={3} theme={theme} />
            </motion.div>
          </div>

          {/* =====================================================
              FOLDER FLAP
          ====================================================== */}

          <motion.div
            className="absolute top-4 left-1  mt-4"
            style={{
              transformOrigin: "bottom center",
              transformStyle: "preserve-3d",
              width: 321,
              height: 241,
            }}
            animate={{
              rotateX: isOpen ? -55 : isHovered ? -45 : -15,
            }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 14,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                clipPath: `path('${FLAP_PATH}')`,
                WebkitClipPath: `path('${FLAP_PATH}')`,
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                willChange: "transform",
              }}
            />

            <svg
              className="absolute inset-0"
              width="321"
              height="241"
              viewBox="0 0 321 241"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g filter="url(#filter0_i_171_13)">
                <path
                  d={FLAP_PATH}
                  fill={theme.flapFill}
                  fillOpacity={theme.flapFillOpacity}
                />

                <path
                  d="M25 0.5H136.084C142.905 0.5 149.417 3.3431 154.054 8.3457L177.713 33.874C182.539 39.0808 189.317 42.04 196.416 42.04H296C309.531 42.04 320.5 53.0092 320.5 66.54V216C320.5 229.531 309.531 240.5 296 240.5H25C11.469 240.5 0.5 229.531 0.5 216V25C0.5 11.469 11.469 0.5 25 0.5Z"
                  stroke={theme.flapStroke}
                />
              </g>

              <defs>
                <filter
                  id="filter0_i_171_13"
                  x="-25.4"
                  y="-25.4"
                  width="371.8"
                  height="291.8"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood
                    floodOpacity="0"
                    result="BackgroundImageFix"
                  />

                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  />

                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />

                  <feOffset />

                  <feGaussianBlur stdDeviation="2.65" />

                  <feComposite
                    in2="hardAlpha"
                    operator="arithmetic"
                    k2="-1"
                    k3="1"
                  />

                  <feColorMatrix
                    type="matrix"
                    values={theme.flapInsetColor}
                  />

                  <feBlend
                    mode="normal"
                    in2="shape"
                    result="effect1_innerShadow_171_13"
                  />
                </filter>
              </defs>
            </svg>
          </motion.div>
        </div>
      </div>

      {/* ============================================================
          MEMORY BOARD MODAL
      ============================================================ */}

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence mode="wait">
            {isOpen && (
              <>
                {/* BACKDROP */}

                <motion.div
                  key="memory-backdrop"
                  className="
                    fixed
                    inset-0
                    z-[999998]
                    bg-black/45
                    backdrop-blur-[6px]
                  "
                  initial={{
                    opacity: 0,
                    backdropFilter: "blur(0px)",
                  }}
                  animate={{
                    opacity: 1,
                    backdropFilter: "blur(6px)",
                  }}
                  exit={{
                    opacity: 0,
                    backdropFilter: "blur(0px)",
                  }}
                  transition={{
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onClick={() => setIsOpen(false)}
                />

                {/* ==================================================
                    MEMORY BOARD CONTAINER
                ================================================== */}

               <motion.div
  key="memory-modal"
  className="
    fixed
    inset-x-0
    bottom-0
    z-[999999]
    flex
    h-[94vh]
    items-end
    justify-center
    px-3
    pb-3
    sm:px-5
    sm:pb-5
  "
  initial={{
    opacity: 0,
    scale: 0.96,
    filter: "blur(14px)",
  }}
  animate={{
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
  }}
  exit={{
    opacity: 0,
    scale: 0.96,
    filter: "blur(14px)",
  }}
  transition={{
    duration: 0.45,
    ease: [0.22, 1, 0.36, 1],
  }}
>
                  {/* BOARD */}

                  <motion.div
                    data-memory-board-modal
                    className="
                      relative
                      h-full
                      w-full
                      max-w-[1600px]
                      overflow-hidden
                      rounded-[24px]
                      border
                      border-black/10
                      bg-white
                      shadow-[0_25px_100px_rgba(0,0,0,0.35)]
                    "
                    initial={{
                      y: 30,
                      scale: 0.985,
                      filter: "blur(8px)",
                    }}
                    animate={{
                      y: 0,
                      scale: 1,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      y: 30,
                      scale: 0.985,
                      filter: "blur(8px)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 220,
                      damping: 27,
                      mass: 0.8,
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    {/* ==================================================
                        CLOSE BUTTON
                    ================================================== */}

                    <motion.button
                      type="button"
                      aria-label="Close memory board"
                      onClick={() => setIsOpen(false)}
                      className="
                        absolute
                        right-4
                        top-4
                        z-[1000000]
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-black/10
                        bg-white/90
                        text-black/60
                        shadow-md
                        backdrop-blur
                        transition
                        hover:bg-white
                        hover:text-black
                      "
                      initial={{
                        opacity: 0,
                        y: -8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: 0.25,
                        duration: 0.25,
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M6 6l12 12" />
                        <path d="M18 6L6 18" />
                      </svg>
                    </motion.button>

                    {/* ==================================================
                        MEMORY BOARD
                    ================================================== */}

                    <div
                      className="h-full w-full"
                      data-lenis-prevent
                      data-lenis-prevent-wheel
                    >
                      <MemoryBoard />
                    </div>
                  </motion.div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};

export default FolderComponent;

export { FolderComponent as Folder };
export type { FolderComponentProps };

type Theme = (typeof themes)[keyof typeof themes];

const Card = ({
  id,
  theme,
}: {
  id: number;
  theme: Theme;
}) => {
const memories = [
  {
    image: "/assets/photos/photo4.jpg",
    title: "summer",
    date: "JUN 24",
  },
  {
    image: "/assets/photos/photo2.jpg",
    title: "good days",
    date: "AUG 24",
  },
  {
    image: "/assets/photos/photo5.jpg",
    title: "memories",
    date: "DEC 24",
  },
];

  const memory = memories[id - 1];

  return (
    <motion.div
      className="relative"
      style={{
        width: 164,
        height: 214,
      }}
      whileHover={{
        y: -4,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      {/* POLAROID CARD */}

      <div
        className="
          relative
          h-full
          w-full
          overflow-hidden
          rounded-[20px]
          bg-[#f7f5ef]
          p-[9px]
          shadow-[0_8px_20px_rgba(0,0,0,0.18)]
        "
      >
        {/* PHOTO */}

        <div
  className="
    relative
    h-[150px]
    w-full
    overflow-hidden
    rounded-[13px]
  "
>
  <img
    src={memory.image}
    alt={memory.title}
    draggable={false}
    className="
      h-full
      w-full
      object-cover
      select-none
    "
  />

  {/* subtle film overlay */}
  <div className="absolute inset-0 bg-black/[0.08]" />

  {/* memory icon */}
  <div className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/75 shadow-sm backdrop-blur">
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-black/60"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  </div>
</div>
          {/* fake photo texture */}

          <div className="absolute inset-0 opacity-20">
            <div className="absolute -left-8 top-10 h-24 w-32 rotate-[-20deg] rounded-full bg-white/40 blur-xl" />

            <div className="absolute right-[-20px] top-[-10px] h-32 w-32 rounded-full bg-white/30 blur-2xl" />

            <div className="absolute bottom-[-20px] left-[-10px] h-24 w-40 rounded-full bg-black/20 blur-xl" />
          </div>

          {/* LITTLE MEMORY ICON */}

          <div className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/75 shadow-sm backdrop-blur">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-black/60"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
              />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>

          {/* FAKE PHOTO SUBJECT */}

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
            <div className="relative h-16 w-16 rounded-full bg-white/30 blur-[1px]" />

            <div className="absolute bottom-[-12px] left-1/2 h-12 w-24 -translate-x-1/2 rounded-t-full bg-black/20 blur-[2px]" />
          </div>

          {/* FILM GRAIN */}

          <div
            className="
              absolute
              inset-0
              opacity-[0.12]
              mix-blend-overlay
            "
            style={{
              backgroundImage:
                "radial-gradient(circle, #000 0.6px, transparent 0.7px)",
              backgroundSize: "4px 4px",
            }}
          />

        {/* POLAROID CAPTION */}

        <div className="px-1.5 pt-2">
          <div className="flex items-center justify-between">
            <span
              className="
                font-mono
                text-[8px]
                font-medium
                uppercase
                tracking-[0.12em]
                text-black/55
              "
            >
              {memory.title}
            </span>

            <span
              className="
                font-mono
                text-[7px]
                uppercase
                tracking-[0.08em]
                text-black/35
              "
            >
              {memory.date}
            </span>
          </div>

          <div className="mt-1.5 h-[3px] w-12 rounded-full bg-black/10" />

          <div className="mt-1 h-[3px] w-20 rounded-full bg-black/[0.06]" />
        </div>
      </div>
    </motion.div>
  );
};