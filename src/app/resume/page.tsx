import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Harshit | Resume",
  icons: {
    icon: "https://cdn.prod.website-files.com/683703490bc01e1b8c052e06/68381362603d6402ee03c00e_favicon.png",
  },
};

export default function ResumePage() {
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe 
        src="/resume/harshit-resume.pdf" 
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Harshit Raghuwanshi - Resume"
      />
    </div>
  );
}
