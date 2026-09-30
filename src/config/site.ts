
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
      "A full-stack developer profile platform where users can create and share personalized profiles with links, analytics, QR sharing, AI-generated bios, and customizable content.",

    story:
      "LinksHub is a MERN-based platform designed to give developers a centralized place to showcase their online presence. It includes JWT authentication with HTTP-only cookies, public profiles, drag-and-drop links, link analytics, QR code sharing, AI bio generation, link preview metadata, soft delete and restore, and Linktree import.\n\nThe application combines a React frontend with an Express and Node.js backend, MongoDB for persistence, Cloudinary for media, and Gemini for AI-powered profile generation.",

    stack: [
      "React",
      "Vite",
      "TanStack Query",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Cloudinary",
      "Gemini API",
      "JWT",
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
    title: "RIP VS Code",

    blurb:
      "A frontend project built around a creative developer-focused interface and interactive user experience.",

    story:
      "RIP VS Code is a frontend-focused project exploring creative interface design, interactions, animations, and modern web development techniques.\n\nThe project focuses primarily on building an engaging user experience with a strong emphasis on frontend implementation and visual interaction.",

    stack: [
      "React",
      "JavaScript",
      "Tailwind CSS",
      "GSAP",
      "Framer Motion",
    ],

    year: "2026",

    links: {
      source: "https://github.com/harshit403-pixel/RipVscode",
      live: "https://rip-vscode.vercel.app/",
    },

    featured: true,

    image: "/project-images/rip-vscode.png",

    categories: [
      "Frontend",
    ],
  },

  {
    title: "DevHub",

    blurb:
      "A frontend-focused developer platform built to explore modern UI design, reusable components, and interactive web experiences.",

    story:
      "DevHub is a frontend project focused on creating a modern developer-oriented interface. The project explores component-based architecture, responsive layouts, interactive UI elements, and modern frontend development practices.",

    stack: [
      "React",
      "JavaScript",
      "Tailwind CSS",
      "GSAP",
      "Framer Motion",
    ],

    year: "2026",

    links: {
      source: "https://github.com/harshit403-pixel/DevHub",
      live: "https://devhub-lemon.vercel.app/",
    },

    featured: true,

    image: "/project-images/devhub.png",

    categories: [
      "Frontend",
    ],
  },

  {
    title: "Slush",

    blurb:
      "A frontend project focused on modern interface design, smooth interactions, and a polished responsive user experience.",

    story:
      "Slush is a frontend-focused project built around modern UI development and interactive experiences. The project emphasizes responsive design, reusable components, animations, and creating a polished user interface.",

    stack: [
      "React",
      "JavaScript",
      "Tailwind CSS",
      "GSAP",
      "Framer Motion",
    ],

    year: "2026",

    links: {
      live: "https://slush-xi.vercel.app/",
    },

    featured: true,

    image: "/project-images/slush.png",

    categories: [
      "Frontend",
    ],
  },

  {
    title: "DeployIt",

    blurb:
      "An in-progress DevOps project exploring containerization, Kubernetes infrastructure, services, ingress, Redis, and modern deployment workflows.",

    story:
      "DeployIt is an ongoing DevOps-focused project built around containerized application deployment and Kubernetes infrastructure. It explores Docker, Docker Compose, Kubernetes workloads, services, ingress, Redis, and multi-service application architecture.\n\nThe project focuses on understanding how applications move from local development into containerized and orchestrated environments, including debugging image pulls, services, networking, Redis configuration, and ingress routing.",

    stack: [
      "Docker",
      "Docker Compose",
      "Kubernetes",
      "Ingress",
      "Redis",
      "Node.js",
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

  {
    title: "Voice RAG",

    blurb:
      "A voice-enabled retrieval augmented generation system combining speech recognition, semantic retrieval, vector search, and AI-generated answers.",

    story:
      "The Voice RAG project explores a complete voice-to-answer pipeline: speech input is converted to text, relevant information is retrieved from a vector database, and an AI model generates the final response.\n\nThe project was developed as part of a voice-enabled RAG challenge and involved working with speech-to-text systems, document chunking, embeddings, vector databases, LangChain, and modern React animation techniques.",

    stack: [
      "React",
      "LangChain",
      "Mistral AI",
      "Vector DB",
      "RAG",
      "Speech-to-Text",
      "GSAP",
      "Framer Motion",
    ],

    year: "2026",

    links: {
      live: "https://hhgoa-rag-xlt3.onrender.com/",
    },

    featured: false,

    image: "/project-images/voice-rag.png",

    categories: [
      "Fullstack",
      "Backend",
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

