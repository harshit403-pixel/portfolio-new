import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  User,
  Mail,
  FolderKanban,
  BriefcaseBusiness,
  Wrench,
  Github,
} from "lucide-react";

const INDEX_ITEMS = [
  { id: "about", label: "About", icon: User },
  { id: "contact", label: "Contact", icon: Mail },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "experience", label: "Experience", icon: BriefcaseBusiness },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "github", label: "GitHub", icon: Github },
];

export function SideIndex() {
  const [activeSection, setActiveSection] = useState<string>("");
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/") return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      let currentSection = "";

      for (const item of INDEX_ITEMS) {
        const el = document.getElementById(item.id);

        if (!el) continue;

        const top = el.offsetTop;
        const bottom = top + el.offsetHeight;

        if (scrollPosition >= top && scrollPosition < bottom) {
          currentSection = item.id;
          break;
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  if (location.pathname !== "/") return null;

  return (
    <aside
      className="
        group
        fixed
        top-[24vh]
        left-[calc(50%+400px)]
        z-30
        hidden
        xl:block
        w-10
        hover:w-[170px]
        transition-[width]
        duration-300
        ease-out
      "
    >
      {/* Header */}
      <div
        className="
          mb-2
          h-6
          overflow-hidden
          px-2
          whitespace-nowrap
        "
      >
        <span
          className="
            font-mono
            text-[10px]
            font-medium
            uppercase
            tracking-[0.12em]
            text-[var(--soft)]
            opacity-0
            transition-opacity
            duration-200
            group-hover:opacity-100
          "
        >
          On this page
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-[2px]">
        {INDEX_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <a
              key={item.id}
              href={`/#${item.id}`}
              title={item.label}
              className={`
                group/item
                flex
                h-8
                w-full
                items-center
                gap-2.5
                overflow-hidden
                rounded-md
                px-2
                font-sans
                text-[12px]
                whitespace-nowrap
                transition-all
                duration-200
                ${
                  isActive
                    ? "bg-[var(--hover)] text-[var(--fg)]"
                    : "text-[var(--soft)] hover:bg-[var(--hover)] hover:text-[var(--fg)]"
                }
              `}
            >
              <Icon
                size={15}
                strokeWidth={1.7}
                className={`
                  shrink-0
                  transition-colors
                  duration-200
                  ${
                    isActive
                      ? "text-[var(--fg)]"
                      : "text-[var(--soft)] group-hover/item:text-[var(--fg)]"
                  }
                `}
              />

              <span
                className="
                  overflow-hidden
                  opacity-0
                  max-w-0
                  transition-all
                  duration-300
                  ease-out
                  group-hover:max-w-[120px]
                  group-hover:opacity-100
                "
              >
                {item.label}
              </span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}