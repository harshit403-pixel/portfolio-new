import { useEffect, useRef, useState } from "react";

type RopePoint = {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
};

type NeonState = {
  opacity: number;
  glow: number;
  clip: string;
};

const NEON_TEXT = "HIRE ME";

const CLIPS = [
  "inset(0 0 50% 0)",
  "inset(50% 0 0 0)",
  "inset(0 50% 0 0)",
  "inset(0 0 0 50%)",
  "inset(0 0 35% 0)",
  "inset(35% 0 0 0)",
  "inset(0 35% 0 0)",
  "inset(0 0 0 35%)",
];

export function HireMeWeb() {
  // ============================================================
  // NEON STATE
  // ============================================================

  const [neonStates, setNeonStates] =
    useState<NeonState[]>(() =>
      Array.from(
        { length: NEON_TEXT.length },
        () => ({
          opacity: 1,
          glow: 1,
          clip: "inset(0 0 0 0)",
        })
      )
    );

  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const cardRef =
    useRef<HTMLDivElement | null>(null);

  // ============================================================
  // BROKEN NEON FLICKER
  // ============================================================

  useEffect(() => {
    let timeout: number;
    let restoreTimeout: number;

    const flicker = () => {
      const availableIndexes = NEON_TEXT
        .split("")
        .map((char, index) =>
          char === " " ? -1 : index
        )
        .filter((index) => index !== -1);

      const index =
        availableIndexes[
          Math.floor(
            Math.random() *
              availableIndexes.length
          )
        ];

      /*
       * Occasionally make a second letter
       * fail at the same time.
       */
      const secondIndex =
        Math.random() < 0.18
          ? availableIndexes[
              Math.floor(
                Math.random() *
                  availableIndexes.length
              )
            ]
          : -1;

      const mode = Math.random();

      setNeonStates((previous) => {
        const next = [...previous];

        const applyFlicker = (
          targetIndex: number
        ) => {
          if (targetIndex < 0) return;

          /*
           * Full electrical blackout.
           */
          if (mode < 0.25) {
            next[targetIndex] = {
              opacity: 0.035,
              glow: 0.015,
              clip: "inset(0 0 0 0)",
            };
          }

          /*
           * Weak tube.
           */
          else if (mode < 0.48) {
            next[targetIndex] = {
              opacity: 0.22,
              glow: 0.15,
              clip: "inset(0 0 0 0)",
            };
          }

          /*
           * Half of the tube works.
           */
          else if (mode < 0.82) {
            next[targetIndex] = {
              opacity: 0.95,
              glow: 0.85,
              clip:
                CLIPS[
                  Math.floor(
                    Math.random() *
                      CLIPS.length
                  )
                ],
            };
          }

          /*
           * Dim / unstable.
           */
          else {
            next[targetIndex] = {
              opacity: 0.58,
              glow: 0.5,
              clip: "inset(0 0 0 0)",
            };
          }
        };

        applyFlicker(index);
        applyFlicker(secondIndex);

        return next;
      });

      /*
       * Restore the affected letters quickly.
       */
      restoreTimeout = window.setTimeout(
        () => {
          setNeonStates((previous) => {
            const next = [...previous];

            if (index >= 0) {
              next[index] = {
                opacity: 1,
                glow: 1,
                clip: "inset(0 0 0 0)",
              };
            }

            if (secondIndex >= 0) {
              next[secondIndex] = {
                opacity: 1,
                glow: 1,
                clip: "inset(0 0 0 0)",
              };
            }

            return next;
          });
        },
        45 + Math.random() * 130
      );

      /*
       * Random interval until next electrical failure.
       */
      timeout = window.setTimeout(
        flicker,
        180 + Math.random() * 650
      );
    };

    /*
     * Initial delay.
     */
    timeout = window.setTimeout(
      flicker,
      1000
    );

    return () => {
      window.clearTimeout(timeout);
      window.clearTimeout(restoreTimeout);
    };
  }, []);

  // ============================================================
  // ROPE + PHYSICS
  // ============================================================

  useEffect(() => {
    const canvas = canvasRef.current;
    const card = cardRef.current;

    if (!canvas || !card) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // ============================================================
    // CONFIG
    // ============================================================

    const CARD_WIDTH = 205;
    const CARD_HEIGHT = 70;

    /*
     * Long hanging rope.
     */
    const ROPE_LENGTH = 190;

    /*
     * Number of physics points.
     */
    const POINT_COUNT = 22;

    const SEGMENT_LENGTH =
      ROPE_LENGTH /
      (POINT_COUNT - 1);

    /*
     * Gravity.
     */
    const GRAVITY = 0.22;

    /*
     * Air resistance.
     */
    const DAMPING = 0.985;

    /*
     * Rope stiffness.
     */
    const CONSTRAINT_ITERATIONS = 5;

    /*
     * Cursor only interacts when it
     * gets reasonably close.
     */
    const CURSOR_RADIUS = 170;

    /*
     * Cursor force.
     */
    const CURSOR_FORCE = 1;

    // ============================================================
    // STATE
    // ============================================================

    let width = 0;

    let heroHeight = 0;

    let animationFrame = 0;

    let anchorX = 0;

    let anchorY = 0;

    let pointerX = -9999;

    let pointerY = -9999;

    let rope: RopePoint[] = [];

    // ============================================================
    // COLOR
    // ============================================================

    const getColor = () => {
      const styles =
        getComputedStyle(
          document.documentElement
        );

      return (
        styles
          .getPropertyValue("--fg")
          .trim() ||
        "#f5f5f4"
      );
    };

    // ============================================================
    // ANCHOR
    // ============================================================

    const calculateAnchor = () => {
      /*
       * Keep the sign outside the main 760px
       * portfolio column.
       */
      anchorX = Math.max(
        105,
        window.innerWidth / 2 - 770
      );

      /*
       * Rope starts exactly from the
       * horizontal separator.
       */
      anchorY = heroHeight;
    };

    // ============================================================
    // CREATE ROPE
    // ============================================================

    const createRope = () => {
      rope = [];

      for (
        let i = 0;
        i < POINT_COUNT;
        i++
      ) {
        const y =
          anchorY +
          i * SEGMENT_LENGTH;

        rope.push({
          x: anchorX,
          y,
          oldX: anchorX,
          oldY: y,
        });
      }
    };

    // ============================================================
    // RESIZE
    // ============================================================

    const resize = () => {
      const parent =
        canvas.parentElement;

      if (!parent) return;

      width =
        parent.clientWidth ||
        window.innerWidth;

      heroHeight =
        parent.clientHeight ||
        window.innerHeight;

      const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      /*
       * Canvas extends below the horizontal
       * separator so the entire rope remains visible.
       */
      const canvasHeight =
        heroHeight +
        ROPE_LENGTH +
        CARD_HEIGHT +
        100;

      canvas.width =
        width * dpr;

      canvas.height =
        canvasHeight * dpr;

      canvas.style.width =
        `${width}px`;

      canvas.style.height =
        `${canvasHeight}px`;

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      calculateAnchor();

      /*
       * Keep anchor locked.
       */
      if (rope.length > 0) {
        rope[0].x = anchorX;
        rope[0].y = anchorY;
      }
    };

    // ============================================================
    // POINTER
    // ============================================================

    const handlePointerMove = (
      event: PointerEvent
    ) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
    };

    const handlePointerLeave = () => {
      pointerX = -9999;
      pointerY = -9999;
    };

    // ============================================================
    // PHYSICS
    // ============================================================

    const updatePhysics = () => {
      if (!rope.length) return;

      // ----------------------------------------------------------
      // VERLET INTEGRATION
      // ----------------------------------------------------------

      for (
        let i = 1;
        i < rope.length;
        i++
      ) {
        const point = rope[i];

        const velocityX =
          (point.x - point.oldX) *
          DAMPING;

        const velocityY =
          (point.y - point.oldY) *
          DAMPING;

        point.oldX = point.x;
        point.oldY = point.y;

        point.x += velocityX;

        point.y +=
          velocityY + GRAVITY;
      }

      // ----------------------------------------------------------
      // CURSOR FORCE
      // ----------------------------------------------------------

      for (
        let i = 1;
        i < rope.length;
        i++
      ) {
        const point = rope[i];

        const dx =
          point.x - pointerX;

        const dy =
          point.y - pointerY;

        const dist = Math.sqrt(
          dx * dx +
            dy * dy
        );

        if (
          dist > 0.001 &&
          dist < CURSOR_RADIUS
        ) {
          const normalized =
            1 -
            dist /
              CURSOR_RADIUS;

          const force =
            normalized *
            normalized *
            CURSOR_FORCE;

          const nx =
            dx / dist;

          const ny =
            dy / dist;

          /*
           * Push the rope away from cursor.
           */
          point.x +=
            nx * force;

          point.y +=
            ny * force;
        }
      }

      // ----------------------------------------------------------
      // DISTANCE CONSTRAINTS
      // ----------------------------------------------------------

      for (
        let iteration = 0;
        iteration <
        CONSTRAINT_ITERATIONS;
        iteration++
      ) {
        /*
         * Anchor never moves.
         */
        rope[0].x = anchorX;
        rope[0].y = anchorY;

        for (
          let i = 0;
          i < rope.length - 1;
          i++
        ) {
          const a = rope[i];
          const b = rope[i + 1];

          const dx =
            b.x - a.x;

          const dy =
            b.y - a.y;

          const dist =
            Math.sqrt(
              dx * dx +
                dy * dy
            );

          if (dist === 0) continue;

          const difference =
            (SEGMENT_LENGTH -
              dist) /
            dist;

          /*
           * First segment is attached
           * to the fixed anchor.
           */
          if (i === 0) {
            b.x +=
              dx *
              difference;

            b.y +=
              dy *
              difference;
          } else {
            /*
             * Split correction.
             */
            const correctionX =
              dx *
              difference *
              0.5;

            const correctionY =
              dy *
              difference *
              0.5;

            a.x -= correctionX;
            a.y -= correctionY;

            b.x += correctionX;
            b.y += correctionY;
          }
        }

        /*
         * Lock anchor again.
         */
        rope[0].x = anchorX;
        rope[0].y = anchorY;
      }
    };

    // ============================================================
    // DRAW ROPE
    // ============================================================

    const drawRope = () => {
      if (!rope.length) return;

      const color = getColor();

      const canvasHeight =
        heroHeight +
        ROPE_LENGTH +
        CARD_HEIGHT +
        100;

      ctx.clearRect(
        0,
        0,
        width,
        canvasHeight
      );

      // ----------------------------------------------------------
      // MAIN ROPE
      // ----------------------------------------------------------

      ctx.beginPath();

      /*
       * Starts EXACTLY at horizontal line.
       */
      ctx.moveTo(
        rope[0].x,
        rope[0].y
      );

      for (
        let i = 1;
        i < rope.length - 1;
        i++
      ) {
        const current =
          rope[i];

        const next =
          rope[i + 1];

        const midpointX =
          (current.x +
            next.x) /
          2;

        const midpointY =
          (current.y +
            next.y) /
          2;

        ctx.quadraticCurveTo(
          current.x,
          current.y,
          midpointX,
          midpointY
        );
      }

      const last =
        rope[
          rope.length - 1
        ];

      ctx.lineTo(
        last.x,
        last.y
      );

      ctx.strokeStyle = color;

      ctx.globalAlpha = 0.23;

      ctx.lineWidth = 1.35;

      ctx.lineCap = "round";

      ctx.lineJoin = "round";

      ctx.shadowColor =
        "rgba(255,255,255,0.22)";

      ctx.shadowBlur = 2;

      ctx.stroke();

      ctx.shadowBlur = 0;

      // ----------------------------------------------------------
      // SECOND FIBER
      // ----------------------------------------------------------

      ctx.beginPath();

      ctx.moveTo(
        rope[0].x + 1.5,
        rope[0].y
      );

      for (
        let i = 1;
        i < rope.length - 1;
        i++
      ) {
        const current =
          rope[i];

        const next =
          rope[i + 1];

        const midpointX =
          (current.x +
            next.x) /
          2;

        const midpointY =
          (current.y +
            next.y) /
          2;

        ctx.quadraticCurveTo(
          current.x + 1.5,
          current.y,
          midpointX + 1.5,
          midpointY
        );
      }

      ctx.lineTo(
        last.x + 1.5,
        last.y
      );

      ctx.strokeStyle = color;

      ctx.globalAlpha = 0.14;

      ctx.lineWidth = 0.55;

      ctx.stroke();

      ctx.globalAlpha = 1;
    };

    // ============================================================
    // POSITION NEON SIGN
    // ============================================================

    const updateCard = () => {
      if (!rope.length) return;

      const bottom =
        rope[
          rope.length - 1
        ];

      const previous =
        rope[
          rope.length - 3
        ];

      const dx =
        bottom.x -
        previous.x;

      const dy =
        bottom.y -
        previous.y;

      const ropeAngle =
        Math.atan2(
          dy,
          dx
        ) -
        Math.PI / 2;

      /*
       * Almost completely rigid.
       */
      const rotation =
        Math.max(
          -0.045,
          Math.min(
            0.045,
            ropeAngle * 0.04
          )
        );

      /*
       * -10px pulls the neon closer
       * to the rope.
       */
      card.style.transform = `
        translate3d(
          ${bottom.x -
          CARD_WIDTH / 2}px,
          ${bottom.y - 14}px,
          0
        )
        rotate(${rotation}rad)
      `;
    };

    // ============================================================
    // LOOP
    // ============================================================

    const animate = () => {
      updatePhysics();

      drawRope();

      updateCard();

      animationFrame =
        requestAnimationFrame(
          animate
        );
    };

    // ============================================================
    // INIT
    // ============================================================

    resize();

    createRope();

    window.addEventListener(
      "resize",
      resize
    );

    window.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "pointerleave",
      handlePointerLeave
    );

    animationFrame =
      requestAnimationFrame(
        animate
      );

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "resize",
        resize
      );

      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      window.removeEventListener(
        "pointerleave",
        handlePointerLeave
      );
    };
  }, []);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      aria-hidden="true"
      className="
        pointer-events-none
        absolute
        inset-0
        left-20
        z-20
        hidden
        overflow-visible
        xl:block
      "
    >
      {/* ========================================================
          PHYSICS ROPE
      ======================================================== */}

      <canvas
        ref={canvasRef}
        className="
          pointer-events-none
          absolute
          left-0
          top-0
          w-full
          overflow-visible
        "
      />

      {/* ========================================================
          NEON HIRE ME
      ======================================================== */}

      <div
        ref={cardRef}
        className="
          absolute
          left-0
          top-0
          h-[70px]
          w-[205px]
          will-change-transform
        "
      >
        <div
          className="
            relative
            flex
            h-full
            w-full
            items-center
            justify-center
          "
        >
          {/* ==================================================
              VERY SMALL AMBIENT BLOOM

              Reduced significantly so there is no
              big square glow behind the sign.
          ================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              h-[35px]
              w-[145px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-white/[0.018]
              blur-[18px]
            "
          />

          {/* ==================================================
              NEON LETTERS
          ================================================== */}

          <div
            className="
              relative
              z-10
              flex
              items-center
              justify-center
              whitespace-nowrap
            "
          >
            {NEON_TEXT.split("").map(
              (letter, index) => {
                /*
                 * Preserve space.
                 */
                if (letter === " ") {
                  return (
                    <span
                      key={`space-${index}`}
                      className="
                        inline-block
                        w-[12px]
                      "
                    />
                  );
                }

                const state =
                  neonStates[index];

                const glow =
                  state.glow;

                return (
                  <span
                    key={`${letter}-${index}`}
                    className="
                      relative
                      inline-block
                      select-none
                      font-[var(--font-amiamie-round)]
                      text-[39px]
                      font-normal
                      leading-none
                      tracking-[-0.06em]
                    "
                    style={{
                      opacity:
                        state.opacity,

                      transition:
                        "opacity 35ms linear",
                    }}
                  >
                    {/* ========================================
                        MAIN NEON TUBE
                    ======================================== */}

                    <span
                      className="
                        relative
                        z-10
                      "
                      style={{
                        color:
                          "var(--neon-color)",

                        textShadow: `
                          0 0 2px var(--neon-color),
                          0 0 5px color-mix(in srgb, var(--neon-color) ${Math.round(
                            75 * glow
                          )}%, transparent),
                          0 0 10px color-mix(in srgb, var(--neon-color) ${Math.round(
                            65 * glow
                          )}%, transparent),
                          0 0 18px color-mix(in srgb, var(--neon-color) ${Math.round(
                            45 * glow
                          )}%, transparent),
                          0 0 30px color-mix(in srgb, var(--neon-color) ${Math.round(
                            22 * glow
                          )}%, transparent)
                        `,
                      }}
                    >
                      {letter}
                    </span>

                    {/* ========================================
                        BRIGHT NEON CORE
                    ======================================== */}

                    <span
                      aria-hidden="true"
                      className="
                        pointer-events-none
                        absolute
                        inset-0
                        z-20
                      "
                      style={{
                        color:
                          "var(--neon-color)",

                        clipPath:
                          state.clip,

                        WebkitClipPath:
                          state.clip,

                        textShadow: `
                          0 0 2px var(--neon-color),
                          0 0 5px var(--neon-color),
                          0 0 12px color-mix(in srgb, var(--neon-color) ${Math.round(
                            85 * glow
                          )}%, transparent),
                          0 0 22px color-mix(in srgb, var(--neon-color) ${Math.round(
                            65 * glow
                          )}%, transparent),
                          0 0 38px color-mix(in srgb, var(--neon-color) ${Math.round(
                            35 * glow
                          )}%, transparent)
                        `,
                      }}
                    >
                      {letter}
                    </span>

                    {/* ========================================
                        HOT TUBE CORE
                    ======================================== */}

                    <span
                      aria-hidden="true"
                      className="
                        pointer-events-none
                        absolute
                        inset-0
                        z-30
                        text-transparent
                      "
                      style={{
                        clipPath:
                          state.clip,

                        WebkitClipPath:
                          state.clip,

                        textShadow:
                          "0 0 2px var(--neon-color)",
                      }}
                    >
                      {letter}
                    </span>
                  </span>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}