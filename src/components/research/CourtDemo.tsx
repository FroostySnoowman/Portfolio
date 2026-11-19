import { useRef, useState } from "react";
import { easeInOut, useDemoLoop, useReducedMotion } from "../../lib/useDemoLoop";
import { useJson } from "../../lib/useJson";

type Court = {
  width: number;
  height: number;
  keypoints: ([number, number, boolean] | null)[];
  world: [number, number][];
  lines: [number, number][][];
  inliers: number;
  errorCm: number;
};

type Phase = "detect" | "fit" | "map" | "hold";

const STEPS: { key: Phase; label: string }[] = [
  { key: "detect", label: "Detect keypoints" },
  { key: "fit", label: "Fit a homography" },
  { key: "map", label: "Court in meters" },
];

const HALF_L = 23.77 / 2;
const HALF_D = 10.97 / 2;
const HALF_S = 8.23 / 2;
const SERVICE = 6.4;
const TOP_LINES: [number, number, number, number][] = [
  [-HALF_D, -HALF_L, HALF_D, -HALF_L], [-HALF_D, HALF_L, HALF_D, HALF_L], [-HALF_D, -HALF_L, -HALF_D, HALF_L], [HALF_D, -HALF_L, HALF_D, HALF_L],
  [-HALF_S, -HALF_L, -HALF_S, HALF_L], [HALF_S, -HALF_L, HALF_S, HALF_L], [-HALF_S, -SERVICE, HALF_S, -SERVICE], [-HALF_S, SERVICE, HALF_S, SERVICE], [0, -SERVICE, 0, SERVICE],
];

export function CourtDemo() {
  const data = useJson<Court>("/demo/court.json");
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(99);
  const [fit, setFit] = useState(1);
  const [mapped, setMapped] = useState(1);
  const [phase, setPhase] = useState<Phase>("hold");
  const [inliers, setInliers] = useState<number | null>(null);

  useDemoLoop(ref, Boolean(data) && !reduced, async ({ wait, tween }) => {
    if (!data) return;
    setPhase("detect");
    setShown(0);
    setFit(0);
    setMapped(0);
    setInliers(0);
    await wait(500);
    const detected = data.keypoints.filter(Boolean).length;
    for (let k = 1; k <= data.keypoints.length; k++) {
      setShown(k);
      if (data.keypoints[k - 1]) await wait(Math.round(2600 / detected));
    }
    await wait(700);
    setPhase("fit");
    await tween(1000, (p) => setInliers(Math.round(easeInOut(p) * data.inliers)));
    await tween(1300, (p) => setFit(easeInOut(p)));
    await wait(500);
    setPhase("map");
    await tween(1200, (p) => setMapped(easeInOut(p)));
    setPhase("hold");
    await wait(3800);
    await tween(500, (p) => {
      setFit(1 - p);
      setMapped(1 - p);
    });
  });

  const done = reduced || phase === "hold";
  const count = reduced || inliers === null ? data?.inliers ?? 0 : inliers;

  return (
    <div ref={ref} className="grid gap-4 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] lg:items-start">
      <div className="relative aspect-video overflow-hidden rounded-xl border border-line bg-black">
        <img src="/demo/court-frame.jpg" alt="A frame from the author's doubles match used for court calibration" className="absolute inset-0 h-full w-full object-cover opacity-90" loading="lazy" />
        {data && (
          <svg viewBox={`0 0 ${data.width} ${data.height}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
            {data.lines.map((line, k) => (
              <polyline
                key={k}
                points={line.map(([x, y]) => `${x},${y}`).join(" ")}
                fill="none"
                stroke="#34d3b1"
                strokeWidth="3"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - fit}
                strokeLinecap="round"
                opacity={fit > 0 ? 0.95 : 0}
              />
            ))}
            {data.keypoints.map((kp, k) => {
              if (!kp || k >= (reduced ? 99 : shown)) return null;
              const [x, y, inlier] = kp;
              const rejected = !inlier && (phase !== "detect" || reduced);
              return (
                <g key={k} style={{ transformOrigin: `${x}px ${y}px`, animation: reduced ? undefined : "kp-pop 380ms var(--ease-out-expo) both" }}>
                  <circle cx={x} cy={y} r="11" fill={rejected ? "none" : "#eb6834"} stroke={rejected ? "#ef4444" : "white"} strokeWidth={rejected ? 3.5 : 2.5} />
                </g>
              );
            })}
          </svg>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {STEPS.map((step) => {
            const order = STEPS.findIndex((s) => s.key === step.key);
            const current = STEPS.findIndex((s) => s.key === phase);
            const active = done || order <= current;
            return (
              <span key={step.key} className={`rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur transition-colors duration-300 sm:text-[12px] ${active ? "bg-white/90 text-black" : "bg-black/55 text-white/70"}`}>
                {step.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col rounded-xl border border-line bg-surface p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[12px] font-medium text-muted">Court coordinates</span>
          <span className="text-[12px] text-muted">meters</span>
        </div>
        <svg viewBox="-8 -14 16 28" className="mx-auto my-3 h-56 w-auto sm:h-64 lg:h-52 xl:h-60" aria-hidden="true">
          <rect x={-HALF_D} y={-HALF_L} width={HALF_D * 2} height={HALF_L * 2} fill="var(--accent-soft)" />
          {TOP_LINES.map(([x1, y1, x2, y2], k) => (
            <line key={k} x1={x1} y1={-y1} x2={x2} y2={-y2} stroke="var(--ink-soft)" strokeWidth="0.12" />
          ))}
          <line x1={-6.6} x2={6.6} y1={0} y2={0} stroke="var(--muted)" strokeWidth="0.12" strokeDasharray="0.4 0.3" />
          {data?.world.map(([x, y], k) => {
            const kp = data.keypoints[k];
            const inlier = Boolean(kp?.[2]);
            const visible = reduced ? 1 : mapped;
            return (
              <circle
                key={k}
                cx={x}
                cy={-y}
                r={0.42}
                fill={inlier ? "#eb6834" : "var(--surface)"}
                stroke={inlier ? "white" : kp ? "#ef4444" : "var(--muted)"}
                strokeWidth={0.14}
                opacity={inlier ? visible : 0.25 + 0.75 * visible}
                style={{ transform: `scale(${inlier ? 0.6 + 0.4 * visible : 1})`, transformOrigin: `${x}px ${-y}px`, transformBox: "fill-box" }}
              />
            );
          })}
        </svg>
        <dl className="grid grid-cols-2 gap-3 border-t border-line pt-3">
          <div>
            <dt className="text-[12px] text-muted">Inlier keypoints</dt>
            <dd className="tabular font-serif text-2xl text-ink">{count}<span className="text-base text-muted"> / 14</span></dd>
          </div>
          <div>
            <dt className="text-[12px] text-muted">Mean court error</dt>
            <dd className="tabular font-serif text-2xl text-ink">{data ? Math.round(data.errorCm) : "-"}<span className="text-base text-muted"> cm</span></dd>
          </div>
        </dl>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2 border-white bg-[#eb6834]" />inlier</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2 border-red-500" />rejected</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border border-muted" />out of frame</span>
        </div>
      </div>
    </div>
  );
}
