import { useMemo, useRef, useState } from "react";
import { easeInOut, easeOut, useDemoLoop, useReducedMotion } from "../../lib/useDemoLoop";
import { useJson } from "../../lib/useJson";

type Match = {
  duration: number;
  step: number;
  curve: number[];
  threshold: number;
  segments: [number, number][];
  labels: [number, number, string][];
  events: { start: number; end: number; label: string }[];
};

const W = 1000;
const CURVE_H = 120;
const H = 190;

function clock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function SegmenterDemo() {
  const data = useJson<Match>("/demo/match.json");
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [draw, setDraw] = useState(1);
  const [bars, setBars] = useState(1);
  const [score, setScore] = useState(1);
  const [hover, setHover] = useState<number | null>(null);

  useDemoLoop(ref, Boolean(data) && !reduced, async ({ wait, tween }) => {
    setDraw(0);
    setBars(0);
    setScore(0);
    await wait(400);
    await tween(3600, (p) => setDraw(easeInOut(p)));
    await tween(900, (p) => setBars(easeOut(p)));
    await tween(1200, (p) => setScore(easeOut(p)));
    await wait(5200);
    await tween(500, (p) => {
      setBars(1 - p);
      setScore(1 - p);
    });
  });

  const x = (t: number) => (data ? (t / data.duration) * W : 0);
  const path = useMemo(() => {
    if (!data) return "";
    return data.curve.map((p, k) => `${k ? "L" : "M"}${((k * data.step) / data.duration * W).toFixed(1)},${(CURVE_H - p * (CURVE_H - 8)).toFixed(1)}`).join(" ");
  }, [data]);

  const shown = reduced ? 1 : draw;
  const barsShown = reduced ? 1 : bars;
  const scoreShown = reduced ? 1 : score;
  const thresholdY = data ? CURVE_H - data.threshold * (CURVE_H - 8) : 0;
  const hoverValue = data && hover !== null ? data.curve[Math.min(data.curve.length - 1, Math.floor(hover / data.step))] ?? 0 : null;

  return (
    <div ref={ref} className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Full match, 20 minutes, no audio</span>
        <span className="tabular font-mono text-[11px] text-muted">{hover !== null && hoverValue !== null ? `${clock(hover)} · p = ${hoverValue.toFixed(2)}` : "hover to inspect"}</span>
      </div>
      <div className="relative mt-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-44 w-full sm:h-52"
          preserveAspectRatio="none"
          onMouseMove={(event) => {
            if (!data) return;
            const rect = event.currentTarget.getBoundingClientRect();
            setHover(Math.max(0, Math.min(data.duration, ((event.clientX - rect.left) / rect.width) * data.duration)));
          }}
          onMouseLeave={() => setHover(null)}
          role="img"
          aria-label="In-play probability over a 20 minute match, with the model's segments and the labeled points"
        >
          <defs>
            <clipPath id="curve-clip">
              <rect x="0" y="0" width={W * shown} height={H} />
            </clipPath>
          </defs>
          {data?.events.map((e) => (
            <rect key={e.label} x={x(e.start)} y="0" width={x(e.end) - x(e.start)} height={H} fill="var(--sunken)" />
          ))}
          <line x1="0" x2={W} y1={thresholdY} y2={thresholdY} stroke="var(--line-strong)" strokeDasharray="6 6" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
          <path d={path} fill="none" stroke="var(--accent)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" clipPath="url(#curve-clip)" />
          <g opacity={barsShown}>
            {data?.labels.map(([a, b], k) => <rect key={`l${k}`} x={x(a)} y={CURVE_H + 22} width={Math.max(1.6, x(b) - x(a))} height="16" rx="1.5" fill="var(--ink)" />)}
            {data?.segments.map(([a, b], k) => <rect key={`s${k}`} x={x(a)} y={CURVE_H + 46} width={Math.max(1.6, x(b) - x(a)) * barsShown} height="16" rx="1.5" fill="var(--court)" />)}
          </g>
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1="0" y2={H} stroke="var(--ink)" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.5" />}
        </svg>
        {data?.events.map((e, k) => (
          <span
            key={e.label}
            className={`pointer-events-none absolute top-1 whitespace-nowrap rounded bg-surface/90 px-1.5 text-[10px] text-muted sm:text-[11px] ${k === 0 ? "-translate-x-full" : ""}`}
            style={{ left: `${(x(e.start) / W) * 100 + (k === 0 ? -0.4 : 0.4)}%` }}
          >
            {e.label}
          </span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted">
        <span className="flex items-center gap-1.5"><span className="h-[2px] w-4 bg-accent" />in-play probability</span>
        <span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t border-dashed border-line-strong" />decision threshold</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-ink" />labeled play</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-court" />model segments</span>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4">
        <Stat label="serves kept whole" value={`${Math.round(42 * scoreShown)} / 42`} />
        <Stat label="dead time removed" value={`${(54.6 * scoreShown).toFixed(1)}%`} />
        <Stat label="false segments" value={`${Math.round(17 * scoreShown)}`} note="aborted serves, setup, tilted camera" />
      </dl>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col-reverse justify-end">
      <dt className="text-[12px] leading-snug text-muted">
        {label}
        {note ? <span className="block text-[11px] opacity-80">{note}</span> : null}
      </dt>
      <dd className="tabular font-serif text-2xl text-ink sm:text-[28px]">{value}</dd>
    </div>
  );
}
