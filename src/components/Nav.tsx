import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { profile } from "../content/profile";
import { EASE } from "./ui";

const LINKS = [
  { id: "research", label: "Research" },
  { id: "thesis", label: "Thesis" },
  { id: "education", label: "Education" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

function useActiveSection() {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter((el): el is HTMLElement => Boolean(el));
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0));
        let best: string | null = null;
        let score = 0;
        visible.forEach((ratio, id) => {
          if (ratio > score) {
            score = ratio;
            best = id;
          }
        });
        setActive(best);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.01, 0.25, 0.5, 1] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);
  return active;
}

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const set = document.documentElement.dataset.theme;
    if (set === "light" || set === "dark") return set;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      return setTheme(next);
    }
    setTheme(next);
  };
  return { theme, toggle };
}

export function Nav() {
  const active = useActiveSection();
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled || open ? "border-b border-line bg-bg/85 backdrop-blur-md" : "border-b border-transparent"}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 sm:px-8">
        <a href="#top" className="font-serif text-[19px] font-medium tracking-tight text-ink" onClick={() => setOpen(false)}>
          {profile.name}
        </a>
        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Sections">
          {LINKS.map((link) => (
            <a key={link.id} href={`#${link.id}`} className={`relative rounded-full px-3 py-1.5 text-[14px] transition-colors duration-200 ${active === link.id ? "text-ink" : "text-muted hover:text-ink"}`} aria-current={active === link.id ? "true" : undefined}>
              {active === link.id && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-sunken ring-1 ring-line" transition={{ duration: 0.45, ease: EASE }} />}
              <span className="relative">{link.label}</span>
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <button type="button" onClick={toggle} className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-ink" aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}>
            {theme === "dark" ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" /></svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5 8.5 8.5 0 1 0 20.5 14.3Z" /></svg>
            )}
          </button>
          <a href={profile.links.cv} className="hidden rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-bg transition-opacity hover:opacity-85 sm:inline-flex">
            CV
          </a>
          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-sunken lg:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path d={open ? "M4 4l10 10M14 4 4 14" : "M3 6h12M3 12h12"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Sections"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden border-t border-line lg:hidden"
          >
            <div className="mx-auto grid max-w-6xl gap-1 px-5 py-3 sm:px-8">
              {LINKS.map((link) => (
                <a key={link.id} href={`#${link.id}`} onClick={() => setOpen(false)} className={`rounded-lg px-3 py-2.5 text-[15px] ${active === link.id ? "bg-sunken text-ink" : "text-ink-soft"}`}>
                  {link.label}
                </a>
              ))}
              <a href={profile.links.cv} className="mt-1 rounded-lg bg-ink px-3 py-2.5 text-center text-[15px] font-medium text-bg sm:hidden">
                Download CV
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
