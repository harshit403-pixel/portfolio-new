"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./folders.module.css";


type ModalType = "about" | "projects" | "playground" | "resume";

export default function HeroFolders() {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);


  return (
    <>
      <div className={styles.cardsWrap}>
        {/* ABOUT */}
        <div className={`${styles.cardFloat} ${styles.about}`}>
          <Folder
            type="about"
            onClick={() => setActiveModal("about")}
          >
            <div className={`${styles.peek} ${styles.two}`} />

            <div
              className={`${styles.peek} ${styles.one} ${styles.avatarPeek}`}
            >
              <svg
                viewBox="0 0 40 40"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="40" height="40" fill="#efece5" />
                <circle
                  cx="20"
                  cy="15"
                  r="7"
                  fill="#b7b09b"
                />
                <ellipse
                  cx="20"
                  cy="34"
                  rx="13"
                  ry="10"
                  fill="#b7b09b"
                />
              </svg>
            </div>

            <div className={styles.folderTab} />

            <div className={styles.folderBody}>
              <span className={styles.label}>About</span>
            </div>
          </Folder>
        </div>

        {/* PROJECTS */}
        <div className={`${styles.cardFloat} ${styles.projects}`}>
          <Folder
  type="projects"
  onClick={() => {
    document.getElementById("work")?.scrollIntoView({
      behavior: "smooth",
    });
  }}
>
            <div
              className={`${styles.peek} ${styles.one} ${styles.browser}`}
            />

            <div className={`${styles.peek} ${styles.phone}`} />

            <div className={styles.folderTab} />

            <div className={styles.folderBody}>
              <span className={styles.label}>Projects</span>
            </div>
          </Folder>
        </div>

        {/* PLAYGROUND */}
        <div
          className={`${styles.cardFloat} ${styles.playground}`}
        >
          <Folder
            type="playground"
            onClick={() => setActiveModal("playground")}
          >
            <div
              className={`${styles.peek} ${styles.one} ${styles.browser}`}
            />

            <div className={`${styles.peek} ${styles.phone}`} />

            <div className={styles.folderTab} />

            <div className={styles.folderBody}>
              <span className={styles.label}>Playground</span>
            </div>
          </Folder>
        </div>

        {/* CONTACT */}
        <div className={`${styles.cardFloat} ${styles.contact}`}>
         <Folder
  type="resume"
 onClick={() => {
  setActiveModal("resume");

  setTimeout(() => {
    const link = document.createElement("a");
    link.href = "/resume.pdf";
    link.download = "Harshit-Raghuwanshi-Resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, 100);
}}
>
            <div className={styles.folderBody}>
              <div className={styles.mockRow}>
                <div className={styles.mockPill} />
                <div className={styles.mockPill} />
              </div>

              <div className={styles.mockScreen} />

              <span className={styles.label}>Resume</span>
            </div>
          </Folder>
        </div>
      </div>

      <Modal
        activeModal={activeModal}
        setActiveModal={setActiveModal}
      />
    </>
  );
}

/* ==================================================
   FOLDER
================================================== */

function Folder({
  type,
  children,
  onClick,
}: {
  type: ModalType;
  children: React.ReactNode;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const canHover = window.matchMedia(
      "(hover:hover)"
    ).matches;

    if (!canHover) return;

    const handleMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();

      const px =
        (event.clientX - rect.left) / rect.width - 0.5;

      const py =
        (event.clientY - rect.top) / rect.height - 0.5;

      element.style.setProperty(
        "--rx",
        `${-py * 16}deg`
      );

      element.style.setProperty(
        "--ry",
        `${px * 20}deg`
      );

      element.style.setProperty("--sc", "1.08");
    };

    const handleLeave = () => {
      element.style.setProperty("--rx", "0deg");
      element.style.setProperty("--ry", "0deg");
      element.style.setProperty("--sc", "1");
    };

    element.addEventListener(
      "pointermove",
      handleMove
    );

    element.addEventListener(
      "pointerleave",
      handleLeave
    );

    return () => {
      element.removeEventListener(
        "pointermove",
        handleMove
      );

      element.removeEventListener(
        "pointerleave",
        handleLeave
      );
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.folder} ${styles.cardTilt}`}
      data-modal={type}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/* ==================================================
   MODAL
================================================== */

function Modal({
  activeModal,
  setActiveModal,
}: {
  activeModal: ModalType | null;
  setActiveModal: (modal: ModalType | null) => void;
}) {
  useEffect(() => {
    if (!activeModal) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveModal(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeModal, setActiveModal]);

  if (!activeModal) return null;

  return (
    <div
      className={`${styles.overlay} ${styles.open}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          setActiveModal(null);
        }
      }}
    >
      {/* ABOUT */}
      {activeModal === "about" && (
        <div
          className={`${styles.modal} ${styles.active}`}
        >
          <button
            className={styles.close}
            onClick={() => setActiveModal(null)}
          >
            ×
          </button>

          <h2>About</h2>

          <p className={styles.aboutSummary}>
            I'm Harshit, a Full-Stack Developer who enjoys
            turning ideas into functional products. I work
            primarily with modern web technologies and love
            building scalable applications, experimenting
            with creative interfaces, and continuously
            learning new technologies.
          </p>

          <div className={styles.socialRow}>
            <a
              className={styles.socialLink}
              href="https://x.com/hrstwt"
              target="_blank"
              rel="noopener noreferrer"
            >
              X / Twitter
            </a>

            <a
              className={styles.socialLink}
              href="https://github.com/harshit403-pixel"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>

            <a
              className={styles.socialLink}
              href="https://www.linkedin.com/in/harshit-raghuwanshi-278243281/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>
      )}

      {/* PROJECTS */}


      {/* PLAYGROUND */}
      {activeModal === "playground" && (
        <div
          className={`${styles.modal} ${styles.active}`}
        >
          <button
            className={styles.close}
            onClick={() => setActiveModal(null)}
          >
            ×
          </button>

          <h2>Playground</h2>

          <SnakeGame />
        </div>
      )}

      {/* RESUME */}
  {activeModal === "resume" && (
  <div
    className={`${styles.modal} ${styles.active} ${styles.resumeModal}`}
  >
    <button
      className={styles.close}
      onClick={() => setActiveModal(null)}
    >
      ×
    </button>

    <div className={styles.resumePreview}>
      <img
        src="/resume.png"
        alt="Harshit Raghuwanshi Resume"
        className={styles.resumeImage}
      />
    </div>
  </div>
)}
    </div>
  );
}

/* ==================================================
   PROJECT
================================================== */

function Project({
  emoji,
  title,
  description,
  tags,
  className,
}: {
  emoji: string;
  title: string;
  description: string;
  tags: string[];
  className: string;
}) {
  return (
    <div className={styles.projectItem}>
      <div
        className={`${styles.projectThumb} ${className}`}
      >
        {emoji}
      </div>

      <div>
        <h3>{title}</h3>

        <p>{description}</p>

        <div className={styles.tagRow}>
          {tags.map((tag) => (
            <span
              key={tag}
              className={styles.tag}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==================================================
   SNAKE
================================================== */

function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const runningRef = useRef(false);

  const gameRef = useRef({
    snake: [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
    ],
    dir: "right",
    nextDir: "right",
    food: { x: 10, y: 10 },
  });

  const intervalRef = useRef<ReturnType<
    typeof setInterval
  > | null>(null);

  const cell = 20;
  const size = 340;
  const cols = size / cell;
  const rows = size / cell;

  const draw = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const game = gameRef.current;

    ctx.clearRect(0, 0, size, size);

    ctx.fillStyle = "#141414";
    ctx.fillRect(0, 0, size, size);

    /* Food */

    ctx.fillStyle = "#7bacdc";

    ctx.beginPath();

    ctx.arc(
      game.food.x * cell + cell / 2,
      game.food.y * cell + cell / 2,
      cell * 0.32,
      0,
      Math.PI * 2
    );

    ctx.fill();

    /* Snake */

    game.snake.forEach((segment, index) => {
      ctx.fillStyle =
        index === 0
          ? "#eaf3fb"
          : `rgba(174,211,239,${
              0.95 - index * 0.03
            })`;

      roundRect(
        ctx,
        segment.x * cell + 2,
        segment.y * cell + 2,
        cell - 4,
        cell - 4,
        6
      );

      ctx.fill();
    });
  };

  const placeFood = () => {
    const game = gameRef.current;

    let food: { x: any; y: any; };

    do {
      food = {
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows),
      };
    } while (
      game.snake.some(
        (segment) =>
          segment.x === food.x &&
          segment.y === food.y
      )
    );

    game.food = food;
  };

  const stopGame = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    runningRef.current = false;
    setRunning(false);
  };

  const endGame = () => {
    stopGame();
    setGameOver(true);
  };

  const step = () => {
    const game = gameRef.current;

    game.dir = game.nextDir;

    const head = {
      ...game.snake[0],
    };

    if (game.dir === "right") head.x++;
    if (game.dir === "left") head.x--;
    if (game.dir === "up") head.y--;
    if (game.dir === "down") head.y++;

    const hitWall =
      head.x < 0 ||
      head.y < 0 ||
      head.x >= cols ||
      head.y >= rows;

    const hitSelf = game.snake.some(
      (segment) =>
        segment.x === head.x &&
        segment.y === head.y
    );

    if (hitWall || hitSelf) {
      endGame();
      return;
    }

    game.snake.unshift(head);

    if (
      head.x === game.food.x &&
      head.y === game.food.y
    ) {
      setScore((value) => {
        const newScore = value + 1;

        setBest((currentBest) =>
          Math.max(currentBest, newScore)
        );

        return newScore;
      });

      placeFood();
    } else {
      game.snake.pop();
    }

    draw();
  };

  const startGame = () => {
    stopGame();

    const game = gameRef.current;

    game.snake = [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
    ];

    game.dir = "right";
    game.nextDir = "right";

    setScore(0);
    setGameOver(false);

    placeFood();
    draw();

    runningRef.current = true;
    setRunning(true);

    intervalRef.current = setInterval(step, 120);
  };

  const setDirection = (
    direction: "up" | "down" | "left" | "right"
  ) => {
    if (!runningRef.current) return;

    const opposite = {
      up: "down",
      down: "up",
      left: "right",
      right: "left",
    };

    if (
      opposite[direction] !==
      gameRef.current.dir
    ) {
      gameRef.current.nextDir = direction;
    }
  };

  useEffect(() => {
    draw();

    const handleKeyDown = (event: KeyboardEvent) => {
      const map: Record<
        string,
        "up" | "down" | "left" | "right"
      > = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        W: "up",
        s: "down",
        S: "down",
        a: "left",
        A: "left",
        d: "right",
        D: "right",
      };

      const direction = map[event.key];

      if (!direction || !runningRef.current) return;

      event.preventDefault();
      event.stopPropagation();
      setDirection(direction);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      runningRef.current = false;
    };
  }, []);

  return (
    <div className={styles.gameWrap}>
      <div className={styles.gameHud}>
        <span>
          Score: <strong>{score}</strong>
        </span>

        <span>
          Best: <strong>{best}</strong>
        </span>
      </div>

      <div className={styles.gameCanvasBox}>
        <canvas
          ref={canvasRef}
          width={340}
          height={340}
          className={styles.snakeCanvas}
        />

        {!running && (
          <div className={styles.gameOverlay}>
            <p>
              {gameOver
                ? `Game over.\nScore: ${score}`
                : "A tiny snake game.\nReady?"}
            </p>

            <button
              className={styles.gameBtn}
              onClick={startGame}
            >
              {gameOver ? "Play again" : "Play"}
            </button>
          </div>
        )}
      </div>

      <div className={styles.dpad}>
        <button
          className={styles.up}
          onClick={() => setDirection("up")}
        >
          ▲
        </button>

        <button
          className={styles.left}
          onClick={() => setDirection("left")}
        >
          ◀
        </button>

        <button
          className={styles.down}
          onClick={() => setDirection("down")}
        >
          ▼
        </button>

        <button
          className={styles.right}
          onClick={() => setDirection("right")}
        >
          ▶
        </button>
      </div>

      <p className={styles.hint}>
        Arrow keys or WASD also work
      </p>
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();

  ctx.moveTo(x + radius, y);

  ctx.arcTo(
    x + width,
    y,
    x + width,
    y + height,
    radius
  );

  ctx.arcTo(
    x + width,
    y + height,
    x,
    y + height,
    radius
  );

  ctx.arcTo(
    x,
    y + height,
    x,
    y,
    radius
  );

  ctx.arcTo(
    x,
    y,
    x + width,
    y,
    radius
  );

  ctx.closePath();
}