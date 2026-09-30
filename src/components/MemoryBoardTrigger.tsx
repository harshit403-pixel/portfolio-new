import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import MemoryBoard from "./MemoryBoard";

interface MemoryBoardTriggerProps {
  message?: string;
  className?: string;
  thumbnail?: string;
}

export function MemoryBoardTrigger({
  message = "click to view memories",
  className = "absolute left-[3%] bottom-[22%] rotate-[-12deg] z-30 hidden md:block",
  thumbnail = "/assets/memories-preview.webp",
}: MemoryBoardTriggerProps) {
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);

  /* ============================================================
     LOCK BACKGROUND SCROLL
  ============================================================ */

  useEffect(() => {
    if (!open) return;

    const html = document.documentElement;
    const body = document.body;

    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    const preventBackgroundScroll = (event: WheelEvent) => {
      const target = event.target as HTMLElement | null;

      if (target?.closest("[data-memory-board-modal]")) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener("wheel", preventBackgroundScroll, {
      passive: false,
      capture: true,
    });

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;

      window.removeEventListener(
        "wheel",
        preventBackgroundScroll,
        true
      );
    };
  }, [open]);

  /* ============================================================
     ESC CLOSE
  ============================================================ */

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      {/* ============================================================
          MEMORY THUMBNAIL
      ============================================================ */}

      <div className={className}>
        <motion.button
          type="button"
          aria-label="View recent memories"
          onClick={() => setOpen(true)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="
            group
            relative
            block
            cursor-pointer
            overflow-hidden
            rounded-[18px]
            border
            border-black/10
            bg-white
            p-1.5
            shadow-[0_8px_30px_rgba(0,0,0,0.14)]
            focus:outline-none
          "
          animate={{
            y: [0, -3, 0],
          }}
          whileHover={{
            y: -5,
            scale: 1.025,
          }}
          whileTap={{
            scale: 0.98,
          }}
          transition={{
            y: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            },
            scale: {
              type: "spring",
              stiffness: 350,
              damping: 22,
            },
          }}
        >
          {/* ======================================================
              IMAGE CONTAINER
          ====================================================== */}

          <div
           className="
  relative
  aspect-[16/10]
  w-[200px]
  overflow-hidden
  rounded-[13px]
  bg-neutral-100
  sm:w-[220px]
  lg:w-[230px]
"
          >
            {/* ====================================================
                THUMBNAIL IMAGE
            ==================================================== */}

            <motion.img
              src={thumbnail}
              alt="Recent memories"
              draggable={false}
              className="
                absolute
                inset-0
                h-full
                w-full
                select-none
                object-cover
              "
              animate={{
                scale: hovered ? 1.08 : 1,
                filter: hovered
                  ? "blur(2px)"
                  : "blur(0px)",
              }}
              transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
            />

    
           

            {/* ====================================================
                BLUE BUTTON
            ==================================================== */}

            <AnimatePresence>
              {hovered && (
                <motion.div
                  key="memory-hover-button"
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    z-30
                    flex
                    items-center
                    justify-center
                  "
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.18,
                  }}
                >
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 14,
                      scale: 0.8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: 10,
                      scale: 0.85,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 25,
                      mass: 0.6,
                    }}
                    className="
                      flex
                      items-center
                      justify-center
                      rounded-full
                      bg-blue-600
                      px-5
                      py-3
                      shadow-[0_8px_30px_rgba(37,99,235,0.5)]
                    "
                  >
                    <span
                      className="
                        whitespace-nowrap
                        font-mono
                        text-[9px]
                      
                        uppercase
                        tracking-[0.08em]
                        text-white
                      "
                    >
                      {message}
                    </span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.button>
      </div>

      {/* ============================================================
          MEMORY BOARD MODAL
      ============================================================ */}

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence mode="wait">
            {open && (
              <>
                {/* ==================================================
                    BACKDROP
                ================================================== */}

                <motion.div
                  key="memory-backdrop"
                  className="
                    fixed
                    inset-0
                    z-[999998]
                    bg-black/45
                    backdrop-blur-[3px]
                  "
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onClick={() => setOpen(false)}
                />

                {/* ==================================================
                    SLIDE-UP CONTAINER
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
    y: "105%",
    opacity: 0.98,
  }}
  animate={{
    y: 0,
    opacity: 1,
  }}
  exit={{
    y: "105%",
    opacity: 0.98,
  }}
  transition={{
    type: "spring",
    stiffness: 120,
    damping: 22,
    mass: 1,
  }}
  onClick={(event) => {
    event.stopPropagation();
  }}
>
                  {/* ==================================================
                      BOARD
                  ================================================== */}

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
                    }}
                    animate={{
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      y: 30,
                      scale: 0.985,
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
                      onClick={() => setOpen(false)}
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
    </>
  );
}

export default MemoryBoardTrigger;