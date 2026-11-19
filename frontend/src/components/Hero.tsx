import { motion, useReducedMotion } from "motion/react";
import { profile, research, thesis } from "../content/profile";
import { EASE } from "./ui";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } } };

export function Hero() {
  const reduced = useReducedMotion();
  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-28 md:pb-24 md:pt-40">
      <div className="grain pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" aria-hidden="true" />
      <svg className="pointer-events-none absolute -right-24 top-24 hidden h-[420px] w-[720px] md:block" viewBox="0 0 720 420" fill="none" aria-hidden="true">
        <motion.path
          d="M300 300 C 380 60, 520 40, 600 170 S 680 250, 700 230"
          stroke="var(--line-strong)"
          strokeWidth="1.5"
          strokeDasharray="2 8"
          strokeLinecap="round"
          initial={{ pathLength: reduced ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.2, ease: EASE, delay: 0.4 }}
        />
        <motion.circle
          cx="700"
          cy="230"
          r="9"
          fill="var(--ball)"
          initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE, delay: reduced ? 0 : 2.3 }}
        />
      </svg>

      <motion.div className="relative mx-auto max-w-6xl px-5 sm:px-8" variants={container} initial={reduced ? "show" : "hidden"} animate="show">
        <motion.div variants={item} className="mb-8 flex items-center gap-4">
          <img src="/img/jacob-headshot.jpg" alt="Jacob Beal" width="56" height="56" className="h-14 w-14 rounded-full object-cover ring-1 ring-line" />
          <div className="text-[14px] leading-tight">
            <div className="font-medium text-ink">{profile.role}</div>
            <div className="text-muted">Utah State University · {profile.location}</div>
          </div>
        </motion.div>

        <motion.h1 variants={item} className="max-w-4xl font-serif text-[46px] font-medium leading-[0.98] tracking-[-0.025em] text-ink sm:text-[64px] md:text-[84px]">
          I build software and study <em className="text-accent">computer vision.</em>
        </motion.h1>

        <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-16">
          <motion.div variants={item}>
            <p className="max-w-xl text-[17px] leading-relaxed text-ink-soft md:text-[19px]">{profile.summary}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={profile.links.cv} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-bg transition-transform duration-300 hover:-translate-y-0.5">
                Download CV
              </a>
              <a href="#research" className="inline-flex items-center gap-2 rounded-full border border-line-strong px-5 py-2.5 text-[14px] font-medium text-ink transition-colors duration-300 hover:border-ink">
                See the research
              </a>
              <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 rounded-full px-3 py-2.5 text-[14px] font-medium text-muted transition-colors hover:text-ink">
                {profile.email}
              </a>
            </div>
          </motion.div>

          <motion.dl variants={item} className="grid content-start gap-0 border-t border-line text-[14px]">
            {[
              { k: "Research", v: research.title, href: "#research" },
              { k: "Thesis", v: `${thesis.status}, with ${thesis.advisor}`, href: "#thesis" },
              { k: "Building", v: "MyBreakPoint, a scoring app for tennis and other racket sports", href: "#projects" },
              { k: "Interests", v: profile.interests.join(", ") },
            ].map((row) => (
              <div key={row.k} className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 border-b border-line py-3.5">
                <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{row.k}</dt>
                <dd className="text-ink-soft">{row.href ? <a href={row.href} className="underline decoration-line-strong underline-offset-4 hover:decoration-accent">{row.v}</a> : row.v}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </motion.div>
    </section>
  );
}
