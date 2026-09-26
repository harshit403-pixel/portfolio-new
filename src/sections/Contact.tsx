import { Shell, SectionHeader } from "@/components/Layout";
import { site } from "@/config/site";
import { GitHubIcon, LinkedInIcon, MailIcon, FileIcon } from "@/components/icons";
import { ArrowUpRight } from "lucide-react";

export function Contact() {
  const contactLinks = [
    { label: "GitHub", href: site.socials.github, Icon: GitHubIcon },
    { label: "LinkedIn", href: site.socials.linkedin, Icon: LinkedInIcon },
    { label: "Mail", href: site.socials.email || `mailto:${site.email}`, Icon: MailIcon },
    { label: "Resume", href: site.socials.resume || "#", Icon: FileIcon },
  ];

  return (
    <div id="contact">
      <SectionHeader title="Contact" />
      <Shell>
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[var(--line)] sm:border-b-0">
          {contactLinks.map((l, idx) => {
            const IconComponent = l.Icon;
            return (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className={`group flex items-center justify-center gap-2.5 border-[var(--line)] px-4 py-4 text-[13px] font-medium transition-colors duration-200 hover:bg-[var(--hover)] ${
                  idx % 2 === 0 ? "border-r" : "border-r-0"
                } ${idx < 2 ? "border-b" : "border-b-0"} sm:border-b-0 ${
                  idx === contactLinks.length - 1 ? "sm:border-r-0" : "sm:border-r"
                }`}
              >
                <span className="grid size-8 place-items-center rounded-lg border border-[var(--line)] bg-[var(--chip)] text-[var(--muted)] transition-colors group-hover:text-[var(--fg)]">
                  <IconComponent className="size-4" />
                </span>
                <span className="text-[var(--muted)] transition-colors group-hover:text-[var(--fg)]">
                  {l.label}
                </span>
                <ArrowUpRight className="size-3.5 text-[var(--soft)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--fg)]" />
              </a>
            );
          })}
        </div>
      </Shell>
    </div>
  );
}
