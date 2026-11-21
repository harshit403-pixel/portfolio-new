import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { Shell, SectionHeader } from "@/components/Layout";
import { site } from "@/config/site";
import { unlockAudio, playPop } from "@/lib/sound";

const MAX_LIFT = 10; // px the hovered letter rises
const SPREAD = 3;    // wave width in letters

function WaveText({ text, soundOn }: { text: string; soundOn: boolean }) {
  const [active, setActive] = useState<number | null>(null);
  const words = text.split(" ");
  let offset = 0; // running letter index across the paragraph

  return (
    <p onMouseLeave={() => setActive(null)}>
      {words.map((word, w) => {
        const start = offset;
        offset += word.length + 1; // +1 for the space

        return (
          <span key={w}>
            {/* nowrap keeps words together so lines only break between words */}
            <span className="inline-block whitespace-nowrap">
              {word.split("").map((char, c) => {
                const index = start + c;
                let lift = 0;

                if (active !== null) {
                  const d = Math.abs(index - active);
                  lift = MAX_LIFT * Math.exp(-(d * d) / (2 * SPREAD * SPREAD));
                  if (lift < 0.4) lift = 0;
                }

                return (
                  // Static outer span = stable hover target
                  <span
                    key={c}
                    className="inline-block"
                    onMouseEnter={() => {
                      setActive(index);
                      if (soundOn) playPop(index);
                    }}
                  >
                    <motion.span
                      className="inline-block"
                      animate={{ y: -lift }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 15,
                        mass: 0.5,
                      }}
                    >
                      {char}
                    </motion.span>
                  </span>
                );
              })}
            </span>{" "}
          </span>
        );
      })}
    </p>
  );
}

export function About() {
  const [soundOn, setSoundOn] = useState(false);

  const toggleSound = () => {
    unlockAudio(); // the click satisfies the browser's autoplay policy
    setSoundOn((s) => !s);
  };

  return (
    <div id="about">
      <SectionHeader title="About" />
      <Shell className="relative px-6 py-7 sm:px-8 space-y-4">
        <button
          onClick={toggleSound}
          aria-label={soundOn ? "Mute hover sounds" : "Enable hover sounds"}
          aria-pressed={soundOn}
          title={soundOn ? "Mute" : "Unmute"}
          className="absolute right-4 top-3 rounded-md p-1.5 text-[var(--soft)] transition-colors hover:bg-white/5 hover:text-[var(--muted)]"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={soundOn ? "on" : "off"}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.12 }}
              className="block"
            >
              {soundOn ? (
                <Volume2 size={16} strokeWidth={1.75} />
              ) : (
                <VolumeX size={16} strokeWidth={1.75} />
              )}
            </motion.span>
          </AnimatePresence>
        </button>

        {site.about.map((para, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex gap-2 text-[14.5px] leading-relaxed text-[var(--muted)]"
          >
            <span className="text-[var(--soft)] font-mono">•</span>
            <WaveText text={para} soundOn={soundOn} />
          </motion.div>
        ))}
      </Shell>
    </div>
  );
}