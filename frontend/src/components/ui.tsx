import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";

export const EASE = [0.16, 1, 0.3, 1] as const;

export function Reveal({ children, delay = 0, className, y = 18 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({ index, eyebrow, title, lede }: { index: string; eyebrow: string; title: string; lede?: ReactNode }) {
  return (
    <Reveal className="mb-10 grid gap-4 md:mb-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:items-end md:gap-12">
      <div>
        <div className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          <span className="text-accent">{index}</span>
          <span className="h-px w-8 bg-line-strong" />
          {eyebrow}
        </div>
        <h2 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.02em] text-ink md:text-[48px]">{title}</h2>
      </div>
      {lede ? <p className="max-w-xl text-[16px] leading-relaxed text-ink-soft md:text-[17px]">{lede}</p> : null}
    </Reveal>
  );
}

export function Section({ id, children, className = "" }: { id: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`border-t border-line py-20 md:py-28 ${className}`}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">{children}</div>
    </section>
  );
}

export function CountUp({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(0, value, { duration: 1.4, ease: EASE, onUpdate: setShown });
    return () => controls.stop();
  }, [inView, reduced, value]);

  return (
    <span ref={ref} className="tabular">
      {(reduced ? value : shown).toFixed(decimals)}
      {suffix}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-line px-2.5 py-0.5 text-[12px] text-muted">{children}</span>;
}

export function ArrowLink({ href, children, external }: { href: string; children: ReactNode; external?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="group inline-flex items-center gap-1.5 text-[14px] font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-accent"
    >
      {children}
      <svg width="12" height="12" viewBox="0 0 12 12" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">
        <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}
