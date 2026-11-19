import { motion } from "motion/react";
import { education, experience, leadership, profile, skills, thesis } from "../content/profile";
import { EASE, Reveal, Section, SectionHeader, Tag } from "./ui";

export function Thesis() {
  return (
    <Section id="thesis">
      <SectionHeader index="02" eyebrow={thesis.status} title={thesis.title} lede={`${thesis.body} Advised by ${thesis.advisor}.`} />
      <Reveal className="flex flex-wrap gap-2">
        {profile.interests.map((interest) => (
          <Tag key={interest}>{interest}</Tag>
        ))}
      </Reveal>
    </Section>
  );
}

export function Education() {
  return (
    <Section id="education">
      <SectionHeader index="03" eyebrow="Education" title="Utah State University" />
      <div className="grid gap-6 md:grid-cols-2">
        {education.map((school, k) => (
          <Reveal key={school.degree} delay={k * 0.08} className="rounded-2xl border border-line bg-surface p-6 md:p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-serif text-[24px] font-medium leading-tight text-ink">{school.degree}</h3>
              <span className="font-mono text-[12px] text-muted">{school.when}</span>
            </div>
            <p className="mt-2 text-[15px] font-medium text-accent">{school.detail}</p>
            <p className="mt-4 text-[14px] leading-relaxed text-muted">
              <span className="text-ink-soft">Coursework: </span>
              {school.coursework}
            </p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function Experience() {
  return (
    <Section id="experience">
      <SectionHeader index="04" eyebrow="Experience" title="Work" />
      <ol className="relative border-l border-line">
        {experience.map((role, k) => (
          <motion.li
            key={role.org}
            className="relative list-none pb-12 pl-8 last:pb-0 md:pl-12"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -12% 0px" }}
            transition={{ duration: 0.8, ease: EASE, delay: k * 0.05 }}
          >
            <div>
              <span className="absolute -left-[5px] top-2 h-[9px] w-[9px] rounded-full border-2 border-bg bg-accent" aria-hidden="true" />
              <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:gap-8">
                <div>
                  <h3 className="text-[18px] font-semibold text-ink">{role.org}</h3>
                  <p className="text-[15px] text-ink-soft">{role.title}</p>
                </div>
                <div className="font-mono text-[12px] text-muted md:text-right">
                  {role.when}
                  {role.where ? <div>{role.where}</div> : null}
                </div>
              </div>
              <ul className="mt-4 grid max-w-3xl gap-2">
                {role.points.map((point) => (
                  <li key={point} className="flex gap-3 text-[15px] leading-relaxed text-ink-soft">
                    <span className="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-line-strong" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </motion.li>
        ))}
      </ol>
      <Reveal className="mt-14 rounded-2xl border border-line bg-surface p-6 md:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Leadership</div>
            <h3 className="mt-2 text-[18px] font-semibold text-ink">{leadership.org}</h3>
            <p className="text-[15px] text-ink-soft">{leadership.title}</p>
          </div>
          <span className="font-mono text-[12px] text-muted">{leadership.when}</span>
        </div>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-ink-soft">{leadership.body}</p>
      </Reveal>
      <Reveal className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
        {skills.map((group) => (
          <div key={group.group} className="bg-surface p-6">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{group.group}</div>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <li key={item} className="rounded-md bg-sunken px-2 py-1 text-[13px] text-ink-soft">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Reveal>
    </Section>
  );
}
