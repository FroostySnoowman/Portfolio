import { useEffect, useState } from "react";
import { projects } from "../content/profile";
import { Reveal, Section, SectionHeader } from "./ui";

function useTicketsxStats() {
  const [stats, setStats] = useState<{ members: number; communities: number } | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/ticketsx")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { members?: number; communities?: number } | null) => {
        if (alive && data?.members && data.communities) setStats({ members: data.members, communities: data.communities });
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);
  return stats;
}

export function Projects() {
  const ticketsx = useTicketsxStats();
  return (
    <Section id="projects">
      <SectionHeader index="05" eyebrow="Projects" title="Things I've built" lede="Apps and services I built and still keep running, mostly by myself. Most of what I know about shipping software, and fixing it when it breaks, came from these." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, k) => (
          <Reveal key={project.name} delay={(k % 3) * 0.06}>
            <a
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-6 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_24px_50px_-30px_rgba(0,0,0,0.45)]"
            >
              <div className="flex items-center gap-3">
                {project.logo ? <img src={project.logo} alt="" width="36" height="36" className="h-9 w-9 rounded-lg object-contain ring-1 ring-line" loading="lazy" /> : null}
                <h3 className="text-[17px] font-semibold text-ink">{project.name}</h3>
              </div>
              <p className="mt-4 text-[15px] font-medium leading-snug text-ink-soft">{project.line}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{project.detail}</p>
              {project.live === "ticketsx" && ticketsx ? (
                <p className="mt-3 flex items-center gap-2 text-[13px] text-ink-soft">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="tabular">{ticketsx.members.toLocaleString("en-US")} members in {ticketsx.communities.toLocaleString("en-US")} communities, live</span>
                </p>
              ) : null}
              <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                {project.stack.map((item) => (
                  <span key={item} className="rounded-md bg-sunken px-2 py-0.5 text-[12px] text-muted">
                    {item}
                  </span>
                ))}
              </div>
              {project.linkLabel ? <span className="mt-4 text-[13px] font-medium text-accent transition-transform duration-300 group-hover:translate-x-0.5">{project.linkLabel} ↗</span> : null}
            </a>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
