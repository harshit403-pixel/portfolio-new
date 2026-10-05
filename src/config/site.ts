
export type Project = {
  title: string;
  blurb: string;
  story?: string;
  stack: string[];
  year: string;
  links: { live?: string; source?: string };
  featured?: boolean;
  status?: string;
  image?: string;
  categories?: ("Frontend" | "Backend" | "Fullstack")[];
};

export type Job = {
  company: string;
  role: string;
  period: string;
  blurb: string;
  url?: string;
};

export type FreelanceProject = {
  title: string;
  category: string;
  description: string;
  overview: string;
  responsibilities: string[];
  technologies: string[];
  fullStack: string[];
};

export type Post = {
  title: string;
  summary: string;
  date: string;
  url: string;
  readingTime?: string;
};

export type OpenSourceContribution = {
  title: string;
  repo: string;
  prNumber: number;
  url: string;
  status: "Merged";
  description: string;
  technologies: string[];
};

export const site = {
  // =========================================================
  // PERSONAL INFORMATION
  // =========================================================

  name: "Harshit Raghuwanshi",

  firstName: "Harshit",

  url: "https://harshits-portfolio.vercel.app",

  quote: {
    text: "The best way to predict the future is to build it.",
    author: "Peter Drucker",
  },

  profileImages: [
    "/profile.jpg",
    "/profile2.png",
  ],

  bannerImage: "/social-banner.gif",

  socialBannerImage: "/social-banner.gif",

  initials: "HR",

  role: "Full Stack Developer",

  location: "Bhopal, India",

  timezone: "Asia/Kolkata",

  email: "harshuraghu7999@gmail.com",

  greeting: "Hey, I'm Harshit", 

  tagline:
    "I build modern full-stack applications, scalable backend systems, and AI-powered products.",

  // =========================================================
  // ABOUT
  // =========================================================

  about: [
    "I'm Harshit Raghuwanshi, a Full Stack Developer who enjoys building products that combine clean interfaces, solid backend architecture, and real-world functionality.",

    "I work primarily with React, Next.js, Node.js, Express, MongoDB, TypeScript, Docker, and modern AI tooling. I enjoy taking an idea from the initial concept all the way to a deployed product.",

    "I've built applications involving authentication, REST APIs, real-time systems, AI integrations, databases, DevOps, and developer-focused tools. I'm particularly interested in backend engineering, system design, and building products that actually solve problems.",
  ],

  tldr: [
    "Building full-stack products.",
    "Exploring backend engineering.",
    "Building AI-powered applications.",
    "Learning system design.",
  ],

  // =========================================================
  // CURRENT STATUS
  // =========================================================

  status: {
    available: true,

    availableText: "open to software engineering opportunities",

    nowLearning:
      "DSA • System Design • Backend Engineering • DevOps",

    nowBuilding:
      "Developer-focused products",

    nowListening:
      "focus playlists",
  },

  // =========================================================
  // SOCIAL LINKS
  // =========================================================

  socials: {
    github:
      "https://github.com/harshit403-pixel",

    twitter:
      "https://twitter.com/hrstwt",

    linkedin:
      "https://www.linkedin.com/in/harshit-raghuwanshi-278243281/",

    email:
      "mailto:harshuraghu7999@gmail.com",

    resume:
      "https://drive.google.com/file/d/18u23i7ERgLpsvjb0ykOrbrsDEiKj-Lgx/view?usp=sharing",

    discord:
      "",

    medium:
      "",
  },

  // =========================================================
  // EXPERIENCE
  // =========================================================

experience: [
  {
    company: "Not Your College",
    role: "Web Developer Mentor",
    period: "1 September 2026 – Present",
    blurb:
      "Mentoring learners in web development by helping them build a strong understanding of modern frontend and backend technologies. Guiding them through practical projects, debugging, code structure, API integration, responsive UI development, and real-world software engineering workflows while helping them improve their problem-solving and development practices.",
    url: "https://notyourcollege.com/",
  },
  {
    company: "Ethara AI",
    role: "Post-LLM Training Intern",
    period: "15 April 2026 – 14 May 2026",
    blurb:
      "Worked on post-LLM training workflows focused on preparing, reviewing, and improving AI training data. Contributed to data evaluation and quality improvement processes while working with structured workflows designed to help improve the reliability and performance of AI models.",
    url: "https://www.ethara.ai/",
  },
] as Job[],

  // =========================================================
  // FREELANCE PROJECTS
  // =========================================================
  // Kept empty because the original projects were not yours.
  // Add real client work here later.
  // =========================================================

  freelanceProjects: [] as FreelanceProject[],

  // =========================================================
  // PROJECTS
  // =========================================================


projects: [
  {
    title: "LinksHub",

    blurb:
      "An AI-powered developer portfolio and link-in-bio platform with GitHub project import, click analytics, QR sharing, and a RAG-based assistant that answers questions about a developer's public projects.",

    story:
      "LinksHub goes beyond a Linktree alternative: it combines profile links, GitHub integration, project showcasing, analytics, and an AI assistant in one place. Developers get a public profile with custom themes, AI-generated bios (Gemini, with selectable tones), drag-and-drop link management, soft delete and restore, Linktree import, automatic link categorization, preview metadata, click tracking, and QR code sharing.\n\nThe AI side is built on Retrieval-Augmented Generation. Developers connect GitHub via OAuth and import repositories; Gemini generates structured project summaries, which are chunked, embedded with gemini-embedding-001, and stored in MongoDB Atlas Vector Search. Visitors can ask questions on a profile, and a LangGraph workflow retrieves only that developer's public project knowledge before Gemini generates a grounded answer along with related projects.\n\nThe stack is a React 19 and Vite frontend with TanStack Query, and a modular Express and Node.js backend with JWT authentication in HTTP-only cookies, Google OAuth, request validation, and rate limiting.",

    stack: [
      "React",
      "Tailwind CSS",
      "Node.js",
      "Express.js",
      "MongoDB",
      "MongoDB Atlas Vector Search",
      "LangChain",
      "LangGraph",
      "Gemini API",
      "GitHub OAuth",
      "Google OAuth",
      "Cloudinary",
      "JWT",
      "Docker",
    ],

    year: "2026",

    links: {
      live: "https://linkshub-np0r.onrender.com/",
      source: "https://github.com/harshit403-pixel/LinksHub",
    },

    featured: true,

    image: "/project-images/linkshub.png",

    categories: [
      "Fullstack",
      "Frontend",
    ],
  },

  {
    title: "Bidding Wars",

    blurb:
      "A real-time online auction platform where users create auctions, bid live over WebSockets, chat in auction rooms, and pay securely, built with the MERN stack and TypeScript.",

    story:
      "Bidding Wars is a full-stack auction marketplace where every bid is synchronized instantly across all connected users using Socket.IO instead of API polling. Each auction runs in its own Socket.IO room; bids are validated on the server (auction active, amount above the current highest bid, increment rules) before being saved and broadcast.\n\nUsers can create, edit, and delete auctions with image uploads, browse the marketplace as guests, join live auction rooms with real-time chat, and track bid history. The platform includes JWT authentication with refresh tokens, Google OAuth, email verification and OTP-based password reset (via Brevo), payment order creation and verification, and a dashboard showing active auctions, won auctions, and activity.\n\nThe frontend uses React 19, TypeScript, Redux Toolkit for global state, and TanStack Query for server state. The backend is a modular Express 5 and TypeScript API with Zod validation, Pino logging, Swagger documentation, and Docker support. Built together with Bhavya Dhanwani.",

    stack: [
      "React",
      "TypeScript",
      "Redux Toolkit",
      "TanStack Query",
      "Tailwind CSS",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Socket.IO",
      "Zod",
      "JWT",
      "Google OAuth",
      "ImageKit",
      "Docker",
    ],

    year: "2026",

    links: {
      live: "https://bidding-wars-skkn.onrender.com/",
      source: "https://github.com/harshit403-pixel/Bidding-Wars",
    },

    featured: true,

    image: "/project-images/bidding-wars.png",
    

    categories: [
      "Fullstack",
      "Backend",
    ],
  },

  {
    title: "Voice RAG",

    blurb:
      "A multilingual, voice-enabled RAG search engine that turns spoken questions into streamed answers using Sarvam AI speech-to-text, FAISS vector search, and Mistral AI.",

    story:
      "Voice RAG is a complete voice-to-answer pipeline built for the HHGoa RAG challenge. A user speaks in their own language; Sarvam AI transcribes the audio (saaras:v3) and translates the query to English (mayura:v1). The query passes through input guardrails, is embedded with Mistral (mistral-embed, 1024 dimensions), and is searched against a FAISS HNSW index. Matching chunks are looked up in a SQLite metadata database, checked by a grounding guardrail, and passed to Mistral Large through LangChain, which streams the answer back to the UI over Server-Sent Events in the user's language.\n\nOn the indexing side, passages are chunked (RecursiveCharacterTextSplitter, 700 characters with 100 overlap for long passages), aligned to English, embedded, and stored alongside translations in 12 languages. The server warms its FAISS and SQLite caches on boot, and a sweep benchmark over 97,941 Hindi queries measured P50 retrieval latency of about 0.83 ms (P100 about 69.6 ms) against a 200 ms budget.\n\nThe React frontend includes a voice orb, source cards, and a live execution console that shows each pipeline step with its latency. The project is containerized with a multi-stage Dockerfile and deployed on Render.",

    stack: [
      "React",
      "Node.js",
      "Express.js",
      "TypeScript",
      "LangChain",
      "Mistral AI",
      "Sarvam AI",
      "FAISS",
      "SQLite",
      "RAG",
      "Speech-to-Text",
      "Server-Sent Events",
      "Docker",
    ],

    year: "2026",

    links: {
      live: "https://hhgoa-rag-xlt3.onrender.com/",
      source: "https://github.com/harshit403-pixel/HHGoa-RAG",
    },

    featured: true,

    image: "/project-images/voice-rag.png",

    categories: [
      "Fullstack",
      "Backend",
    ],
  },

  {
    title: "RIP VS Code",

    blurb:
      "A team-built real-time collaborative coding platform with instant room creation, room-code invites, host and guest roles, and Monaco editor integration.",

    story:
      "RIPvscode is a collaborative coding platform where users create coding rooms instantly and invite teammates with a unique room code. It supports signup and login with JWT access tokens and refresh token rotation, session management, protected routes, host and guest roles, participant management (including kicking participants and closing rooms), and Socket.IO-based online participant tracking.\n\nThe frontend is built with Next.js and React, with GSAP animations, page transitions, and a Monaco Editor integration. The backend follows a Route, Controller, Service, and Repository (DAO) layering on Express and MongoDB, with Zod and Express Validator for validation and Pino for logging.\n\nBuilt as a three-person team project; my part was the backend, covering authentication and room management. Shared editing, cursor sync, and code execution are listed as planned next steps.",

    stack: [
      "Next.js",
      "React",
      "Tailwind CSS",
      "Redux Toolkit",
      "GSAP",
      "Monaco Editor",
      "Socket.IO",
      "Node.js",
      "Express.js",
      "MongoDB",
      "JWT",
    ],

    year: "2026",

    links: {
      source: "https://github.com/harshit403-pixel/RipVscode",
      live: "https://rip-vscode.vercel.app/",
    },

    featured: true,

    image: "/project-images/rip-vscode.png",

    categories: [
      "Fullstack",
      "Frontend",
    ],
  },

  {
    title: "DevHub",

    blurb:
      "A full-stack developer social platform for sharing portfolios, projects, and technical blogs, built during a mini hackathon sprint.",

    story:
      "DevHub is a MERN-stack social platform where developers create profiles, showcase projects, publish technical blogs, and discover each other. Profiles support profile and cover image uploads, bios, and skills. Developers can post projects with thumbnails, tech stack tags, and GitHub and live links, like projects, and open dynamic project detail pages.\n\nAn Explore section lets visitors search developers and projects and filter by tech stack. Authentication uses JWT with bcrypt password hashing and protected routes, and media is handled with Multer and Cloudinary. The interface uses glassmorphism styling, GSAP animations, and smooth transitions, and is fully responsive.\n\nThe frontend is deployed on Vercel and the backend on Render. Built during a Mini Hackathon Sprint.",

    stack: [
      "React",
      "Tailwind CSS",
      "GSAP",
      "React Router",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Cloudinary",
      "JWT",
    ],

    year: "2026",

    links: {
      source: "https://github.com/harshit403-pixel/DevHub",
      live: "https://devhub-lemon.vercel.app/",
    },

    featured: true,

    image: "/project-images/devhub.png",

    categories: [
      "Fullstack",
      "Frontend",
    ],
  },

  {
    title: "Slush",

    blurb:
      "A polished, responsive UI project focused on clean visual design and smooth animations.",

    story:
      "Slush is a frontend-focused UI project built with HTML, CSS, and JavaScript, with GSAP and Framer Motion powering its animations and transitions. It emphasizes a clean, modern look, responsive layouts, and smooth interactions.",

    stack: [
      "HTML",
      "CSS",
      "JavaScript",
      "GSAP",
      "Framer Motion",
    ],

    year: "2026",

    links: {
      live: "https://slush-xi.vercel.app/",
    },

    featured: false,

    image: "/project-images/slush.png",

    categories: [
      "Frontend",
    ],
  },

  {
    title: "DeployIt",

    blurb:
      "An in-progress DevOps project exploring a multi-service architecture deployed with Docker and Kubernetes.",

    story:
      "DeployIt is an ongoing project built around containerized, multi-service deployment. The repository is split into separate services (auth, project, sync, AI, and a file server) alongside a Next.js boilerplate and a dedicated Kubernetes configuration folder.\n\nThe project focuses on understanding how applications move from local development into containerized and orchestrated environments, including debugging image pulls, services, networking, Redis configuration, and ingress routing.",

    stack: [
      "Docker",
      "Kubernetes",
      "Ingress",
      "Redis",
      "Node.js",
      "Express.js",
      "Next.js",
    ],

    year: "2026",

    links: {
      source: "https://github.com/harshit403-pixel/DeployIt",
    },

    featured: false,

    image: "/project-images/deployit.png",

    categories: [
      "Backend",
      "Fullstack",
    ],
  },
] as Project[],



  // =========================================================
  // SKILLS
  // =========================================================

  skills: [
    // Languages
    "JavaScript",
    "TypeScript",
    "C++",

    // Frontend
    "React",
    "Next.js",
    "Tailwind CSS",
    "GSAP",
    "Framer Motion",

    // Backend
    "Node.js",
    "Express.js",
    "REST APIs",
    "Socket.IO",

    // Database
    "MongoDB",
    "Mongoose",

    // Authentication
    "JWT",
    "Passport",
    "Google OAuth",

    // DevOps / Cloud
    "Docker",
    "AWS",
    "Git",
    "GitHub",
    "Vercel",

    // AI
    "OpenAI API",
    "Gemini API",
    "LangChain",
    "LangGraph",
    "Mistral AI",
    "AI Agents",
    "RAG",
  ],

  // =========================================================
  // WRITING
  // =========================================================
  // Empty until you have your own articles.
  // =========================================================

  writing: [] as Post[],

  // =========================================================
  // OPEN SOURCE
  // =========================================================
  // Empty until genuine contributions are added.
  // =========================================================

  openSourceContributions: [] as OpenSourceContribution[],

  // =========================================================
  // GITHUB
  // =========================================================

  github: {
    username: "harshit403-pixel",

    contributionsLastYear: "500+",
  },

  // =========================================================
  // FOOTER
  // =========================================================

  footerNote: "Built by Harshit Raghuwanshi",
} as const;

export type Site = typeof site;

