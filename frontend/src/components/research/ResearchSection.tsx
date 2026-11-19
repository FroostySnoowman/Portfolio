import type { ReactNode } from "react";
import { profile, research } from "../../content/profile";
import { ArrowLink, CountUp, Reveal, Section, SectionHeader } from "../ui";
import { CourtDemo } from "./CourtDemo";
import { SegmenterDemo } from "./SegmenterDemo";
import { SplitDemo } from "./SplitDemo";
import { TrackingDemo } from "./TrackingDemo";

export function ResearchSection() {
  return (
    <Section id="research">
      <SectionHeader index="01" eyebrow="Research" title={research.title} lede={research.summary} />

      <Reveal className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <span className="font-mono text-[12px] text-muted">{research.venue}</span>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <ArrowLink href={profile.links.report}>Technical report (PDF)</ArrowLink>
          <ArrowLink href={profile.links.research} external>Code and evaluation</ArrowLink>
          <ArrowLink href={`${profile.links.research}/blob/main/docs/claims.md`} external>Where each number comes from</ArrowLink>
        </div>
      </Reveal>

      <Reveal>
        <TrackingDemo />
      </Reveal>

      <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
        {research.results.map((r, k) => (
          <Reveal key={r.label} delay={k * 0.08} className="bg-surface p-6 md:p-7">
            <div className="font-serif text-[52px] leading-none tracking-[-0.02em] text-ink md:text-[60px]">
              <CountUp value={r.value} decimals={r.decimals} suffix={r.suffix} />
            </div>
            <div className="mt-3 text-[15px] font-medium text-ink">{r.label}</div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{r.detail}</p>
          </Reveal>
        ))}
      </div>

      <div className="mt-20 grid gap-14 md:mt-28">
        <ModelBlock index="a" name={research.models[0]!.name} line={research.models[0]!.line}>
          <p className="text-[15px] leading-relaxed text-ink-soft">
            It isn't significantly better than WASB-SBDT (82.7% end to end), but it raises fewer false alarms and it runs live on the phone. Heavy compression is its one consistent weakness: on six test videos it falls from 88.5% to 67.7% at CRF 36. Resolution, frame rate and resize method made no clear difference.
          </p>
        </ModelBlock>

        <ModelBlock index="b" name={research.models[1]!.name} line={research.models[1]!.line}>
          <CourtDemo />
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            My first version was trained on broadcast footage. It got 97.5% of broadcast frames within 15 cm but only 25.1% of phone frames, and since the tracker waits for a court lock, live tracking struggled. Training on amateur frames brought it to 53.5% per frame and 61.9% with a 12-frame median. Four of the ten test videos still fail.
          </p>
        </ModelBlock>

        <ModelBlock index="c" name={research.models[2]!.name} line={research.models[2]!.line}>
          <SegmenterDemo />
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            Across 42 labeled videos and three seeds, it keeps 91.9% to 92.4% of points whole and cuts about half the dead time, with decoding settings chosen without the fold being scored. The match above is one I recorded, and none of the models saw it in training. Its audio track turned out to be silent, so the model also had to manage without the sound it was trained to use.
          </p>
        </ModelBlock>
      </div>

      <div className="mt-20 md:mt-28">
        <Reveal className="mb-8 max-w-2xl">
          <h3 className="font-serif text-[28px] font-medium leading-tight tracking-[-0.01em] text-ink md:text-[34px]">What I got wrong along the way</h3>
          <p className="mt-3 text-[16px] leading-relaxed text-ink-soft">A lot of this project was finding out where my own numbers were wrong. All of this is written up in the report.</p>
        </Reveal>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <Reveal>
            <SplitDemo />
          </Reveal>
          <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
            {research.rigor.map((r, k) => (
              <Reveal key={r.title} delay={k * 0.06} className="bg-surface p-5">
                <div className="font-mono text-[11px] text-accent">0{k + 1}</div>
                <h4 className="mt-2 text-[15px] font-semibold leading-snug text-ink">{r.title}</h4>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{r.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function ModelBlock({ index, name, line, children }: { index: string; name: string; line: string; children: ReactNode }) {
  return (
    <Reveal className="grid gap-6 md:grid-cols-[minmax(0,0.75fr)_minmax(0,2fr)] md:gap-10">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Model {index}</div>
        <h3 className="mt-2 font-serif text-[26px] font-medium leading-tight tracking-[-0.01em] text-ink md:text-[30px]">{name}</h3>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{line}</p>
      </div>
      <div>{children}</div>
    </Reveal>
  );
}
