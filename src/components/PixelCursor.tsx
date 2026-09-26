import { useEffect, useRef } from "react";

type Point = {
  x: number;
  y: number;
  life: number;
};

export function PixelCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const points: Point[] = [];

    let animationFrame = 0;

    let targetX = -100;
    let targetY = -100;

    let currentX = -100;
    let currentY = -100;

    let lastX = -100;
    let lastY = -100;

    const PIXEL_SIZE = 4;

    // More points = longer trail
    const MAX_POINTS = 42;

    // Lower = smoother/longer trail
    const FOLLOW_SPEED = 0.12;

    // Distance between generated pixels
    const SPACING = 4;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;

      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handlePointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
    };

    const handlePointerLeave = () => {
      targetX = -100;
      targetY = -100;
    };

    const addPoint = (x: number, y: number) => {
      if (lastX < 0) {
        lastX = x;
        lastY = y;
        return;
      }

      const dx = x - lastX;
      const dy = y - lastY;

      const distance = Math.sqrt(
        dx * dx + dy * dy
      );

      if (distance < SPACING) return;

      const steps = Math.floor(
        distance / SPACING
      );

      for (let i = 1; i <= steps; i++) {
        const progress = i / steps;

        points.push({
          x: lastX + dx * progress,
          y: lastY + dy * progress,
          life: 1,
        });
      }

      lastX = x;
      lastY = y;

      if (points.length > MAX_POINTS) {
        points.splice(
          0,
          points.length - MAX_POINTS
        );
      }
    };

    const draw = () => {
      ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
      );

      /*
       * Smoothly follow the actual cursor.
       *
       * Lower FOLLOW_SPEED =
       * more lag / slower trail.
       */
      currentX +=
        (targetX - currentX) *
        FOLLOW_SPEED;

      currentY +=
        (targetY - currentY) *
        FOLLOW_SPEED;

      addPoint(currentX, currentY);

      /*
       * Draw trail
       */
      for (let i = 0; i < points.length; i++) {
        const point = points[i];

        /*
         * Slower fade.
         */
        point.life -= 0.018;

        if (point.life <= 0) continue;

        const progress =
          i / Math.max(points.length - 1, 1);

        /*
         * Newest pixels are larger.
         */
        const size =
          PIXEL_SIZE *
          (0.55 + progress * 0.55);

        /*
         * Fade older pixels.
         */
        const alpha =
          point.life *
          (0.15 + progress * 0.75);

        /*
         * Blue/cyan digital color.
         */
        const green = Math.round(
          90 + progress * 80
        );

        const blue = Math.round(
          190 + progress * 65
        );

        ctx.fillStyle = `rgba(
          70,
          ${green},
          ${blue},
          ${alpha}
        )`;

        /*
         * Pixel-grid snapping.
         */
        const x =
          Math.floor(point.x / 2) * 2;

        const y =
          Math.floor(point.y / 2) * 2;

        ctx.fillRect(
          x,
          y,
          Math.max(2, Math.round(size)),
          Math.max(2, Math.round(size))
        );

        /*
         * Occasional secondary pixel.
         */
        if (
          i % 4 === 0 &&
          progress > 0.25
        ) {
          ctx.fillStyle = `rgba(
            100,
            180,
            255,
            ${alpha * 0.4}
          )`;

          ctx.fillRect(
            x + 4,
            y - 2,
            2,
            2
          );
        }
      }

      /*
       * Remove dead pixels.
       */
      for (
        let i = points.length - 1;
        i >= 0;
        i--
      ) {
        if (points[i].life <= 0) {
          points.splice(i, 1);
        }
      }

      animationFrame =
        requestAnimationFrame(draw);
    };

    resize();

    window.addEventListener(
      "resize",
      resize
    );

    window.addEventListener(
      "pointermove",
      handlePointerMove,
      { passive: true }
    );

    window.addEventListener(
      "pointerleave",
      handlePointerLeave
    );

    animationFrame =
      requestAnimationFrame(draw);

    return () => {
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

      cancelAnimationFrame(
        animationFrame
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[99999]"
    />
  );
}