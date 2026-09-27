import {
  useEffect,
  useRef,
  useState,
} from "react";

import Matter from "matter-js";

type NeonState = {
  opacity: number;
  glow: number;
  clip: string;
};

type WirePoint = {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
};

const NEON_TEXT = "404";

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

export function NotFoundSign() {
  const [neonStates, setNeonStates] =
    useState<NeonState[]>(
      () =>
        Array.from(
          { length: NEON_TEXT.length },
          () => ({
            opacity: 1,
            glow: 1,
            clip: "inset(0 0 0 0)",
          })
        )
    );

  const signRef =
    useRef<HTMLDivElement | null>(null);

  const physicsAreaRef =
    useRef<HTMLDivElement | null>(null);

  const numberRefs =
    useRef<(HTMLDivElement | null)[]>([]);

  const wireCanvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const suspensionCanvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const signSwingRef = useRef({
    angle: 0,
    velocity: 0,
    target: 0,
    lastTime: performance.now(),
  });

  /*
   * ============================================================
   * NEON FLICKER
   * ============================================================
   */

  useEffect(() => {
    let timeout = 0;
    let restoreTimeout = 0;

    const flicker = () => {
      const indexes = [0, 1, 2];

      const index =
        indexes[
          Math.floor(
            Math.random() * indexes.length
          )
        ];

      const secondIndex =
        Math.random() < 0.18
          ? indexes[
              Math.floor(
                Math.random() *
                  indexes.length
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
           * COMPLETE BLACKOUT
           */
          if (mode < 0.24) {
            next[targetIndex] = {
              opacity: 0.025,
              glow: 0.01,
              clip: "inset(0 0 0 0)",
            };
          }

          /*
           * WEAK TUBE
           */
          else if (mode < 0.47) {
            next[targetIndex] = {
              opacity: 0.2,
              glow: 0.13,
              clip: "inset(0 0 0 0)",
            };
          }

          /*
           * PARTIAL TUBE
           */
          else if (mode < 0.82) {
            next[targetIndex] = {
              opacity: 0.95,
              glow: 0.82,
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
           * DIM / UNSTABLE
           */
          else {
            next[targetIndex] = {
              opacity: 0.55,
              glow: 0.48,
              clip: "inset(0 0 0 0)",
            };
          }
        };

        applyFlicker(index);
        applyFlicker(secondIndex);

        return next;
      });

      restoreTimeout =
        window.setTimeout(() => {
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
        }, 45 + Math.random() * 130);

      timeout = window.setTimeout(
        flicker,
        220 + Math.random() * 700
      );
    };

    timeout = window.setTimeout(
      flicker,
      1200
    );

    return () => {
      window.clearTimeout(timeout);
      window.clearTimeout(
        restoreTimeout
      );
    };
  }, []);

  /*
   * ============================================================
   * MATTER.JS 404 PHYSICS
   * ============================================================
   */

  useEffect(() => {
    const area =
      physicsAreaRef.current;

    if (!area) return;

    const {
      Engine,
      Bodies,
      Body,
      Composite,
      Mouse,
      MouseConstraint,
      Runner,
    } = Matter;

    const engine =
      Engine.create();

    /*
     * Slightly reduced gravity so the
     * numbers float naturally inside
     * the neon sign.
     */
    engine.gravity.y = 0.55;

    engine.gravity.x = 0;

    const width =
      area.clientWidth;

    const height =
      area.clientHeight;

    /*
     * ==========================================================
     * WALLS
     * ==========================================================
     */

    const wallThickness = 30;

    const floor = Bodies.rectangle(
      width / 2,
      height +
        wallThickness / 2 -
        2,
      width,
      wallThickness,
      {
        isStatic: true,
        restitution: 0.72,
        friction: 0.65,
      }
    );

    const ceiling = Bodies.rectangle(
      width / 2,
      -wallThickness / 2 +
        2,
      width,
      wallThickness,
      {
        isStatic: true,
        restitution: 0.72,
        friction: 0.65,
      }
    );

    const leftWall =
      Bodies.rectangle(
        -wallThickness / 2 +
          2,
        height / 2,
        wallThickness,
        height,
        {
          isStatic: true,
          restitution: 0.72,
          friction: 0.65,
        }
      );

    const rightWall =
      Bodies.rectangle(
        width +
          wallThickness / 2 -
          2,
        height / 2,
        wallThickness,
        height,
        {
          isStatic: true,
          restitution: 0.72,
          friction: 0.65,
        }
      );

    /*
     * ==========================================================
     * 404 BODIES
     * ==========================================================
     */

    const numberWidth =
      Math.min(
        170,
        width * 0.19
      );

    const numberHeight =
      Math.min(
        175,
        height * 0.58
      );

    const startY =
      height * 0.38;

    const firstX =
      width * 0.30;

    const secondX =
      width * 0.50;

    const thirdX =
      width * 0.70;

    const numberBodies = [
      Bodies.rectangle(
        firstX,
        startY,
        numberWidth,
        numberHeight,
        {
          restitution: 0.78,
          friction: 0.45,
          frictionAir: 0.018,
          density: 0.0012,
          chamfer: {
            radius: 18,
          },
        }
      ),

      Bodies.rectangle(
        secondX,
        startY - 15,
        numberWidth,
        numberHeight,
        {
          restitution: 0.78,
          friction: 0.45,
          frictionAir: 0.018,
          density: 0.0012,
          chamfer: {
            radius: 18,
          },
        }
      ),

      Bodies.rectangle(
        thirdX,
        startY + 8,
        numberWidth,
        numberHeight,
        {
          restitution: 0.78,
          friction: 0.45,
          frictionAir: 0.018,
          density: 0.0012,
          chamfer: {
            radius: 18,
          },
        }
      ),
    ];

    /*
     * Give them a little initial personality.
     */
    Body.setAngle(
      numberBodies[0],
      -0.035
    );

    Body.setAngle(
      numberBodies[1],
      0.025
    );

    Body.setAngle(
      numberBodies[2],
      0.045
    );

    /*
     * ==========================================================
     * WORLD
     * ==========================================================
     */

    Composite.add(engine.world, [
      floor,
      ceiling,
      leftWall,
      rightWall,
      ...numberBodies,
    ]);

    /*
     * ==========================================================
     * MOUSE / DRAGGING
     * ==========================================================
     */

    const mouse =
      Mouse.create(area);

    const mouseConstraint =
      MouseConstraint.create(
        engine,
        {
          mouse,
          constraint: {
            stiffness: 0.22,
            damping: 0.12,
            render: {
              visible: false,
            },
          },
        }
      );

    Composite.add(
      engine.world,
      mouseConstraint
    );

    /*
     * Keep the browser from trying
     * to scroll while grabbing a number.
     */
    area.style.touchAction =
      "none";

    /*
     * ==========================================================
     * RENDER PHYSICS TO DOM
     * ==========================================================
     */

    const updateDOM = () => {
      numberBodies.forEach(
        (body, index) => {
          const element =
            numberRefs.current[
              index
            ];

          if (!element) return;

          element.style.transform = `
            translate3d(
              ${body.position.x -
              numberWidth / 2}px,
              ${body.position.y -
              numberHeight / 2}px,
              0
            )
            rotate(${body.angle}rad)
          `;
        }
      );
    };

    /*
     * ==========================================================
     * RUNNER
     * ==========================================================
     */

    const runner =
      Runner.create();

    Runner.run(
      runner,
      engine
    );

    let animationFrame = 0;

    const animate = () => {
      updateDOM();

      animationFrame =
        requestAnimationFrame(
          animate
        );
    };

    animationFrame =
      requestAnimationFrame(
        animate
      );

    /*
     * ==========================================================
     * RESIZE
     * ==========================================================
     */

    const handleResize = () => {
      /*
       * Reloading the page dimensions isn't
       * necessary for normal portfolio usage,
       * but keeps the sign usable after resize.
       */
      const newWidth =
        area.clientWidth;

      const newHeight =
        area.clientHeight;

      Body.setPosition(
        floor,
        {
          x: newWidth / 2,
          y:
            newHeight +
            wallThickness / 2 -
            2,
        }
      );

      Body.setPosition(
        ceiling,
        {
          x: newWidth / 2,
          y:
            -wallThickness / 2 +
            2,
        }
      );

      Body.setPosition(
        leftWall,
        {
          x:
            -wallThickness / 2 +
            2,
          y: newHeight / 2,
        }
      );

      Body.setPosition(
        rightWall,
        {
          x:
            newWidth +
            wallThickness / 2 -
            2,
          y: newHeight / 2,
        }
      );
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    /*
     * ==========================================================
     * CLEANUP
     * ==========================================================
     */

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      Runner.stop(runner);

      Composite.clear(
        engine.world,
        false
      );

      Engine.clear(engine);
    };
  }, []);

  /*
   * ============================================================
   * WIRES
   * ============================================================
   */

  useEffect(() => {
    const canvas =
      wireCanvasRef.current;

    if (!canvas) return;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) return;

    let width = 0;
    let height = 0;

    let animationFrame = 0;

    let wires: WirePoint[][] = [];

    let pointerX = -9999;
    let pointerY = -9999;

    const WIRE_CONFIGS = [
      {
        anchorX: 0.06,
        length: 105,
        segments: 13,
        sag: 20,
      },
      {
        anchorX: 0.20,
        length: 68,
        segments: 9,
        sag: 15,
      },
      {
        anchorX: 0.80,
        length: 75,
        segments: 10,
        sag: 17,
      },
      {
        anchorX: 0.94,
        length: 112,
        segments: 14,
        sag: 25,
      },
    ];

    const getColor = () => {
      const styles =
        getComputedStyle(
          document.documentElement
        );

      return (
        styles
          .getPropertyValue(
            "--fg"
          )
          .trim() ||
        "#f5f5f4"
      );
    };

    const resize = () => {
      const parent =
        canvas.parentElement;

      if (!parent) return;

      const rect =
        parent.getBoundingClientRect();

      width = rect.width;
      height = rect.height;

      const dpr = Math.min(
        window.devicePixelRatio ||
          1,
        2
      );

      canvas.width =
        width * dpr;

      canvas.height =
        height * dpr;

      canvas.style.width =
        `${width}px`;

      canvas.style.height =
        `${height}px`;

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      wires =
        WIRE_CONFIGS.map(
          (config) => {
            const points: WirePoint[] =
              [];

            const startX =
              width *
              config.anchorX;

            for (
              let i = 0;
              i < config.segments;
              i++
            ) {
              const progress =
                i /
                (config.segments -
                  1);

              const y =
                config.length *
                progress;

              const sag =
                Math.sin(
                  progress *
                    Math.PI
                ) *
                config.sag;

              const x =
                startX + sag;

              points.push({
                x,
                y,
                oldX: x,
                oldY: y,
              });
            }

            return points;
          }
        );
    };

    const handlePointerMove = (
      event: PointerEvent
    ) => {
      const rect =
        canvas.getBoundingClientRect();

      pointerX =
        event.clientX -
        rect.left;

      pointerY =
        event.clientY -
        rect.top;
    };

    const handlePointerLeave = () => {
      pointerX = -9999;
      pointerY = -9999;
    };

    const updatePhysics = () => {
      wires.forEach(
        (wire, wireIndex) => {
          for (
            let i = 1;
            i < wire.length;
            i++
          ) {
            const point =
              wire[i];

            const velocityX =
              (point.x -
                point.oldX) *
              0.985;

            const velocityY =
              (point.y -
                point.oldY) *
              0.985;

            point.oldX =
              point.x;

            point.oldY =
              point.y;

            point.x +=
              velocityX;

            point.y +=
              velocityY +
              0.075;

            const dx =
              point.x -
              pointerX;

            const dy =
              point.y -
              pointerY;

            const distance =
              Math.sqrt(
                dx * dx +
                  dy * dy
              );

            if (
              distance > 0.001 &&
              distance < 60
            ) {
              const strength =
                1 -
                distance / 60;

              const force =
                strength *
                strength *
                0.5;

              point.x +=
                (dx /
                  distance) *
                force;

              point.y +=
                (dy /
                  distance) *
                force;
            }
          }

          const config =
            WIRE_CONFIGS[
              wireIndex
            ];

          const anchorX =
            width *
            config.anchorX;

          const segmentLength =
            config.length /
            (config.segments -
              1);

          for (
            let iteration = 0;
            iteration < 5;
            iteration++
          ) {
            wire[0].x =
              anchorX;

            wire[0].y = 0;

            for (
              let i = 0;
              i <
              wire.length - 1;
              i++
            ) {
              const a =
                wire[i];

              const b =
                wire[i + 1];

              const dx =
                b.x - a.x;

              const dy =
                b.y - a.y;

              const distance =
                Math.sqrt(
                  dx * dx +
                    dy * dy
                );

              if (
                distance < 0.001
              ) {
                continue;
              }

              const difference =
                (segmentLength -
                  distance) /
                distance;

              if (i === 0) {
                b.x +=
                  dx *
                  difference;

                b.y +=
                  dy *
                  difference;
              } else {
                const correctionX =
                  dx *
                  difference *
                  0.5;

                const correctionY =
                  dy *
                  difference *
                  0.5;

                a.x -=
                  correctionX;

                a.y -=
                  correctionY;

                b.x +=
                  correctionX;

                b.y +=
                  correctionY;
              }
            }
          }
        }
      );
    };

    const drawWires = () => {
      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      const color =
        getColor();

      wires.forEach(
        (wire, index) => {
          if (
            wire.length < 2
          ) {
            return;
          }

          ctx.beginPath();

          ctx.moveTo(
            wire[0].x,
            wire[0].y
          );

          for (
            let i = 1;
            i <
            wire.length - 1;
            i++
          ) {
            const current =
              wire[i];

            const next =
              wire[i + 1];

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
            wire[
              wire.length - 1
            ];

          ctx.lineTo(
            last.x,
            last.y
          );

          ctx.strokeStyle =
            color;

          ctx.globalAlpha =
            index % 2 === 0
              ? 0.22
              : 0.15;

          ctx.lineWidth =
            index % 2 === 0
              ? 1.1
              : 0.65;

          ctx.lineCap =
            "round";

          ctx.shadowColor =
            "rgba(255,255,255,0.16)";

          ctx.shadowBlur = 3;

          ctx.stroke();

          ctx.shadowBlur = 0;
        }
      );

      ctx.globalAlpha = 1;
    };

    const animate = () => {
      updatePhysics();
      drawWires();

      animationFrame =
        requestAnimationFrame(
          animate
        );
    };

    resize();

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

  /*
   * ============================================================
   * HANGING SIGN PHYSICS
   *
   * The entire neon banner behaves like a suspended sign.
   * Two wires connect the ceiling to the top corners.
   * The sign gently swings like a real hanging object.
   * ============================================================
   */

  useEffect(() => {
    const canvas = suspensionCanvasRef.current;
    const sign = signRef.current;

    if (!canvas || !sign) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let animationFrame = 0;
    let width = 0;
    let height = 0;

    let pointerX = -9999;
    let pointerY = -9999;

    const swing = signSwingRef.current;

    const resize = () => {
      const parent = canvas.parentElement;

      if (!parent) return;

      const rect = parent.getBoundingClientRect();

      width = rect.width;
      height = rect.height;

      const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );
    };

    const handlePointerMove = (
      event: PointerEvent
    ) => {
      const rect =
        canvas.getBoundingClientRect();

      pointerX =
        event.clientX - rect.left;

      pointerY =
        event.clientY - rect.top;
    };

    const handlePointerLeave = () => {
      pointerX = -9999;
      pointerY = -9999;
    };

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

    let nextImpulse =
      performance.now() +
      1800 +
      Math.random() * 3000;

    const animate = (time: number) => {
      const delta = Math.min(
        (time - swing.lastTime) /
          16.6667,
        2
      );

      swing.lastTime = time;

      /*
       * ==========================================================
       * PENDULUM PHYSICS
       * ==========================================================
       */

      const gravity =
  -Math.sin(swing.angle) *
  0.0012;

      const damping =
  Math.pow(0.975, delta);

      swing.velocity +=
        gravity * delta;

      swing.velocity *= damping;

      /*
       * ==========================================================
       * CURSOR DISTURBANCE
       * ==========================================================
       */

      const signRect =
        sign.getBoundingClientRect();

      const canvasRect =
        canvas.getBoundingClientRect();

      const signCenterX =
        signRect.left +
        signRect.width / 2 -
        canvasRect.left;

      const signCenterY =
        signRect.top +
        signRect.height / 2 -
        canvasRect.top;

      const pointerDistance =
        Math.sqrt(
          Math.pow(
            pointerX - signCenterX,
            2
          ) +
            Math.pow(
              pointerY - signCenterY,
              2
            )
        );

      if (pointerDistance < 280) {
        const influence =
          1 -
          pointerDistance / 280;

        const pointerSide =
          pointerX < signCenterX
            ? 1
            : -1;

        swing.velocity +=
  pointerSide *
  influence *
  0.00035 *
  delta;
      }

      /*
       * ==========================================================
       * RANDOM MICRO MOVEMENT
       * ==========================================================
       */

      if (time > nextImpulse) {
        const impulse =
  (Math.random() - 0.5) *
  0.0005;

        swing.velocity += impulse;

        nextImpulse =
          time +
          2500 +
          Math.random() * 4500;
      }

     swing.velocity = Math.max(
  -0.008,
  Math.min(
    0.008,
    swing.velocity
  )
);

      swing.angle +=
        swing.velocity * delta;

      /*
       * ==========================================================
       * APPLY SIGN TRANSFORM
       * ==========================================================
       */

      sign.style.transform =
        `rotate(${swing.angle}rad)`;

      /*
       * ==========================================================
       * DRAW SUSPENSION WIRES
       * ==========================================================
       */

      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      const updatedRect =
        sign.getBoundingClientRect();

      const updatedCanvasRect =
        canvas.getBoundingClientRect();

      /*
       * The sign rotates around its top-center point.
       * getBoundingClientRect() gives us the rotated bounding box,
       * so we reconstruct the ACTUAL top edge from the current
       * rotation. This keeps both suspension wires physically
       * attached to the banner on every frame.
       */
      const signWidth =
        sign.offsetWidth;

      const signHeight =
        sign.offsetHeight;

      const angle =
        swing.angle;

      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const rectCenterX =
        updatedRect.left -
        updatedCanvasRect.left +
        updatedRect.width / 2;

      const rectCenterY =
        updatedRect.top -
        updatedCanvasRect.top +
        updatedRect.height / 2;

      /*
       * Pivot = transformed bounding-box center minus the
       * rotated vector from the top-center to the center.
       */
      const pivotX =
        rectCenterX +
        (signHeight / 2) * sin;

      const pivotY =
        rectCenterY -
        (signHeight / 2) * cos;

      /*
       * Actual physical attachment points on the top edge.
       */
      const leftSignX =
        pivotX -
        (signWidth / 2) * cos;

      const leftSignY =
        pivotY -
        (signWidth / 2) * sin;

      const rightSignX =
        pivotX +
        (signWidth / 2) * cos;

      const rightSignY =
        pivotY +
        (signWidth / 2) * sin;

      const signTopY =
        Math.min(
          leftSignY,
          rightSignY
        );

      const leftAnchorX =
        width * 0.27;

      const rightAnchorX =
        width * 0.73;

      const anchorY =
        Math.max(
          18,
          signTopY - 125
        );

      const drawWire = (
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        side: number
      ) => {
        const distance =
          Math.sqrt(
            Math.pow(
              endX - startX,
              2
            ) +
              Math.pow(
                endY - startY,
                2
              )
          );

        const sag = Math.min(
          42,
          distance * 0.16
        );

        const color = getColor();

        /*
         * Main suspension wire.
         */

        ctx.beginPath();

        ctx.moveTo(
          startX,
          startY
        );

        ctx.quadraticCurveTo(
          startX +
            (endX - startX) * 0.5 +
            side * 8,
          startY +
            (endY - startY) * 0.5 +
            sag,
          endX,
          endY
        );

        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.32;
        ctx.lineWidth = 1.15;
        ctx.lineCap = "round";

        ctx.shadowColor =
          "rgba(255,255,255,0.18)";

        ctx.shadowBlur = 4;

        ctx.stroke();

        /*
         * Secondary thin wire.
         */

        ctx.beginPath();

        ctx.moveTo(
          startX + side * 2,
          startY
        );

        ctx.quadraticCurveTo(
          startX +
            (endX - startX) * 0.5 -
            side * 4,
          startY +
            (endY - startY) * 0.5 +
            sag +
            2,
          endX + side * 1.5,
          endY
        );

        ctx.globalAlpha = 0.12;
        ctx.lineWidth = 0.55;
        ctx.shadowBlur = 2;

        ctx.stroke();

        /*
         * Small attachment point.
         */

        ctx.beginPath();

        ctx.arc(
          endX,
          endY,
          2.2,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = color;
        ctx.globalAlpha = 0.35;

        ctx.fill();

        ctx.shadowBlur = 0;
      };

      drawWire(
        leftAnchorX,
        anchorY,
        leftSignX,
        leftSignY,
        -1
      );

      drawWire(
        rightAnchorX,
        anchorY,
        rightSignX,
        rightSignY,
        1
      );

      /*
       * ==========================================================
       * CEILING MOUNTING POINTS
       * ==========================================================
       */

      const color = getColor();

      [leftAnchorX, rightAnchorX].forEach(
        (x) => {
          ctx.beginPath();

          ctx.arc(
            x,
            anchorY,
            2.8,
            0,
            Math.PI * 2
          );

          ctx.fillStyle = color;
          ctx.globalAlpha = 0.35;

          ctx.fill();

          ctx.beginPath();

          ctx.arc(
            x,
            anchorY,
            5.5,
            0,
            Math.PI * 2
          );

          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.08;
          ctx.lineWidth = 1;

          ctx.stroke();
        }
      );

      ctx.globalAlpha = 1;

      animationFrame =
        requestAnimationFrame(
          animate
        );
    };

    resize();

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

    swing.lastTime =
      performance.now();

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

      sign.style.transform = "";
    };
  }, []);

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <section
      className="
        relative
        flex
        min-h-[calc(100vh-80px)]
        w-full
        items-center
        justify-center
        overflow-hidden
        px-5
        py-24
        sm:px-8
        lg:px-12
      "
    >
      {/* ========================================================
          WIRES
      ======================================================== */}

      {/* ========================================================
          MAIN SUSPENSION WIRES
      ======================================================== */}

      <canvas
        ref={suspensionCanvasRef}
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-[5]
          h-full
          w-full
        "
      />

      {/* ========================================================
          EXISTING DECORATIVE WIRES
      ======================================================== */}

      <canvas
        ref={wireCanvasRef}
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
          h-full
          w-full
        "
      />

      {/* ========================================================
          OUTER GLOW
      ======================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[520px]
          w-[980px]
          max-w-[90vw]
          -translate-x-1/2
          -translate-y-1/2
          rounded-[30px]
          bg-[var(--neon-color)]
          opacity-[0.018]
          blur-[70px]
        "
      />

      {/* ========================================================
          MAIN SIGN
      ======================================================== */}

      <div
        ref={signRef}
        className="
          relative
          z-10
          w-full
          max-w-[1080px]
        "
      >
        {/* ======================================================
            TOP MOUNTING WIRES
        ====================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            -top-[28px]
            left-[9%]
            h-[30px]
            w-px
            bg-[var(--fg)]/[0.18]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -top-[45px]
            right-[12%]
            h-[47px]
            w-px
            bg-[var(--fg)]/[0.14]
          "
        />

        {/* ======================================================
            PHYSICAL SIGN BODY
        ====================================================== */}

        <div
          className="
            relative
            rounded-[10px]
            border
            border-[var(--fg)]/[0.14]
            bg-[var(--bg)]
            p-[10px]
            shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_0_70px_rgba(255,255,255,0.025),inset_0_0_60px_rgba(255,255,255,0.025)]
          "
        >
          {/* ====================================================
              OUTER METAL FRAME
          ==================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-[5px]
              rounded-[6px]
              border
              border-[var(--fg)]/[0.06]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-[11px]
              rounded-[4px]
              border
              border-dashed
              border-[var(--fg)]/[0.055]
            "
          />

          {/* ====================================================
              CORNER SCREWS
          ==================================================== */}

          {[
            "left-[15px] top-[15px]",
            "right-[15px] top-[15px]",
            "left-[15px] bottom-[15px]",
            "right-[15px] bottom-[15px]",
          ].map(
            (position, index) => (
              <span
                key={index}
                className={`
                  absolute
                  ${position}
                  z-30
                  h-[5px]
                  w-[5px]
                  rounded-full
                  bg-[var(--fg)]/[0.20]
                  shadow-[0_0_5px_var(--neon-glow)]
                `}
              />
            )
          )}

          {/* ====================================================
              HEADER
          ==================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-[22px]
              z-30
              -translate-x-1/2
              whitespace-nowrap
              font-[var(--font-mono)]
              text-[8px]
              uppercase
              tracking-[0.48em]
              text-[var(--fg)]/[0.30]
            "
          >
            SYSTEM ERROR
          </div>

          {/* ====================================================
              PHYSICS AREA

              THIS IS WHERE THE 404 OBJECTS LIVE.
          ==================================================== */}

          <div
            ref={physicsAreaRef}
            className="
              relative
              h-[470px]
              w-full
              overflow-hidden
              rounded-[4px]
            "
            style={{
  userSelect: "none",
  WebkitUserSelect: "none",
  WebkitTouchCallout: "none",
}}
          >
            {/* ==================================================
                VERY SUBTLE INNER AMBIENT LIGHT
            ================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-1/2
                h-[300px]
                w-[700px]
                max-w-[80%]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-[var(--neon-color)]
                opacity-[0.012]
                blur-[80px]
              "
            />

            {/* ==================================================
                PHYSICS NUMBERS
            ================================================== */}

            {NEON_TEXT.split(
              ""
            ).map(
              (letter, index) => {
                const state =
                  neonStates[index];

                const glow =
                  state.glow;

                return (
                  <div
                    key={`${letter}-${index}`}
                    ref={(element) => {
                      numberRefs.current[
                        index
                      ] = element;
                    }}
                    className="
                      pointer-events-none
                      absolute
                      left-0
                      top-0
                      z-20
                      flex
                      h-[175px]
                      w-[170px]
                      items-center
                      justify-center
                      will-change-transform
                      select-none
                    "
                  >
                    {/* ========================================
                        MAIN NEON NUMBER
                    ======================================== */}

                    <span
                      className="
                        relative
                        font-[var(--font-amiamie-round)]
                        text-[400px]
                        font-normal
                        leading-none
                        tracking-[-0.12em]
                      "
                      style={{
                        opacity:
                          state.opacity,

                        color:
                          "var(--neon-color)",

                        textShadow: `
                          0 0 2px var(--neon-color),
                          0 0 5px color-mix(
                            in srgb,
                            var(--neon-color)
                            ${Math.round(
                              80 * glow
                            )}%,
                            transparent
                          ),
                          0 0 12px color-mix(
                            in srgb,
                            var(--neon-color)
                            ${Math.round(
                              70 * glow
                            )}%,
                            transparent
                          ),
                          0 0 25px color-mix(
                            in srgb,
                            var(--neon-color)
                            ${Math.round(
                              48 * glow
                            )}%,
                            transparent
                          ),
                          0 0 45px color-mix(
                            in srgb,
                            var(--neon-color)
                            ${Math.round(
                              25 * glow
                            )}%,
                            transparent
                          )
                        `,
                      }}
                    >
                      {letter}

                      {/* ====================================
                          PARTIAL ELECTRICAL TUBE
                      ==================================== */}

                      <span
                        aria-hidden="true"
                        className="
                          pointer-events-none
                          absolute
                          inset-0
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
                            0 0 6px var(--neon-color),
                            0 0 15px color-mix(
                              in srgb,
                              var(--neon-color)
                              ${Math.round(
                                90 * glow
                              )}%,
                              transparent
                            ),
                            0 0 30px color-mix(
                              in srgb,
                              var(--neon-color)
                              ${Math.round(
                                65 * glow
                              )}%,
                              transparent
                            )
                          `,
                        }}
                      >
                        {letter}
                      </span>

                      {/* ====================================
                          HOT CORE
                      ==================================== */}

                      <span
                        aria-hidden="true"
                        className="
                          pointer-events-none
                          absolute
                          inset-0
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
                  </div>
                );
              }
            )}

            {/* ==================================================
                LITTLE ELECTRICAL DETAILS
            ================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                right-[22px]
                top-[28px]
                flex
                gap-[3px]
                opacity-30
              "
            >
              {[1, 2, 3, 4, 5, 6].map(
                (item) => (
                  <span
                    key={item}
                    className="
                      h-[3px]
                      w-[7px]
                      bg-[var(--neon-color)]
                    "
                    style={{
                      opacity:
                        0.2 +
                        Math.random() *
                          0.5,
                    }}
                  />
                )
              )}
            </div>

            {/* ==================================================
                BOTTOM TEXT
            ================================================== */}

            
          </div>
        </div>

        {/* ======================================================
            LOOSE SIDE WIRES
        ====================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            -bottom-[42px]
            left-[15%]
            h-[48px]
            w-px
            rotate-[8deg]
            bg-[var(--fg)]/[0.13]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-[30px]
            right-[20%]
            h-[36px]
            w-px
            -rotate-[7deg]
            bg-[var(--fg)]/[0.12]
          "
        />
      </div>
    </section>
  );
}