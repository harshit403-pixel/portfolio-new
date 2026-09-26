import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { site } from "@/config/site";
import { Socials } from "./socials";
import { RotateCw, ArrowRight } from "lucide-react";

export function Hero() {
  const [imgIndex, setImgIndex] = useState(0);

  const handleNextImage = () => {
    const nextIndex = (imgIndex + 1) % site.profileImages.length;
    setImgIndex(nextIndex);
    window.dispatchEvent(new CustomEvent("profileImageChanged", { detail: nextIndex }));
  };

  const roles = [
    "Full Stack Developer.",
    "Backend Engineer.",
    "Open Source Contributor.",
    "Problem Solver."
  ];
  const [roleIndex, setRoleIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fullText = roles[roleIndex];
    
    const typingSpeed = isDeleting ? 30 : 60;
    const delayBeforeDelete = 2000;
    const delayBeforeType = 400;

    const tick = () => {
      if (!isDeleting) {
        const nextText = fullText.slice(0, currentText.length + 1);
        setCurrentText(nextText);
        
        if (nextText === fullText) {
          timer = setTimeout(() => setIsDeleting(true), delayBeforeDelete);
          return;
        }
      } else {
        const nextText = fullText.slice(0, currentText.length - 1);
        setCurrentText(nextText);
        
        if (nextText === "") {
          setIsDeleting(false);
          setRoleIndex((prev) => (prev + 1) % roles.length);
          timer = setTimeout(() => {}, delayBeforeType);
          return;
        }
      }
      
      timer = setTimeout(tick, typingSpeed);
    };

    timer = setTimeout(tick, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, roleIndex]);

  return (
    <section
      id="top"
      className="relative flex min-h-[85vh] flex-col justify-center overflow-hidden px-6 pb-12 pt-28"
    >
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[45rem] w-[45rem] -translate-x-1/2 rounded-full bg-white/5 blur-[160px]" />

      <div className="mx-auto w-full max-w-5xl">
        {/* Cover Banner Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-36 w-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 sm:h-48"
        >
          <img
            src={site.bannerImage}
            alt="Banner"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent pointer-events-none" />
        </motion.div>

        {/* Profile Avatar & Title Section */}
        <div className="relative -mt-14 sm:-mt-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onClick={handleNextImage}
              className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32 group cursor-pointer select-none rounded-2xl border-4 border-neutral-950 shadow-2xl bg-neutral-900 overflow-hidden"
              title="Click to change profile image"
            >
              <img
                src={site.profileImages[imgIndex] || site.profileImages[0]}
                alt="Profile"
                className="h-full w-full rounded-xl object-cover pointer-events-none"
              />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-1 top-1 rounded-full border border-neutral-700 bg-neutral-900/90 p-1.5 text-neutral-300 transition-all hover:text-white hover:scale-110 sm:opacity-100 opacity-0 group-hover:opacity-100 z-20 cursor-pointer shadow-md"
                aria-label="Switch profile image"
              >
                <RotateCw size={12} strokeWidth={2} />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="pt-2"
            >
              <h1 className="font-serif text-4xl font-normal leading-none tracking-tight sm:text-6xl text-neutral-100">
                {site.name}
              </h1>
              <div className="mt-2 flex items-center gap-2">
                <span className="font-mono text-sm font-medium text-neutral-300">
                  {currentText}
                  <span className="inline-block w-[2px] h-4 bg-white ml-0.5 animate-pulse">&nbsp;</span>
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-400"
        >
          {site.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex flex-wrap items-center gap-4"
        >
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-white/10"
          >
            Explore Projects <ArrowRight size={16} />
          </Link>
          <Socials />
        </motion.div>

        {/* status / "now" pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 grid gap-4 sm:grid-cols-3"
        >
          {site.status.available && (
            <div className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/40 px-4 py-3 text-sm backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-neutral-300 font-medium">{site.status.availableText}</span>
            </div>
          )}
          <NowPill label="building" value={site.status.nowBuilding} />
          <NowPill label="learning" value={site.status.nowLearning} />
        </motion.div>
      </div>
    </section>
  );
}

function NowPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 px-4 py-3 text-sm backdrop-blur-md">
      <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
        {label}
      </span>
      <p className="mt-0.5 line-clamp-2 text-neutral-300" title={value}>
        {value}
      </p>
    </div>
  );
}
