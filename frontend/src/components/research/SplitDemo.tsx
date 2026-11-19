import { useRef, useState } from "react";
import { useDemoLoop, useReducedMotion } from "../../lib/useDemoLoop";

type Mode = "random" | "group";

const CLIPS = 4;
const PER_CLIP = 12;
const RANDOM_VAL = new Set([2, 7, 9, 15, 20, 26, 31, 33, 38, 44]);
const GROUP_VAL_CLIP = 2;

function isVal(mode: Mode, clip: number, k: number) {
  return mode === "random" ? RANDOM_VAL.has(clip * PER_CLIP + k) : clip === GROUP_VAL_CLIP;
}

function leaked(mode: Mode, clip: number, k: number) {
  if (!isVal(mode, clip, k)) return false;
  const left = k > 0 && !isVal(mode, clip, k - 1);
  const right = k < PER_CLIP - 1 && !isVal(mode, clip, k + 1);
  return left || right;
}

export function SplitDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<Mode>("group");
  const [revealed, setRevealed] = useState(PER_CLIP * CLIPS);
  const [pinned, setPinned] = useState<Mode | null>(null);

  useDemoLoop(ref, !reduced && pinned === null, async ({ wait, tween }) => {
    for (const next of ["random", "group"] as Mode[]) {
      setMode(next);
      setRevealed(0);
      await tween(900, (p) => setRevealed(Math.round(p * PER_CLIP * CLIPS)));
      await wait(next === "random" ? 3600 : 3200);
    }
  });

  const active = pinned ?? mode;
  const shown = reduced || pinned !== null ? PER_CLIP * CLIPS : revealed;
  const leaks = Array.from({ length: CLIPS }, (_, c) => Array.from({ length: PER_CLIP }, (_, k) => leaked(active, c, k))).flat().filter(Boolean).length;
  const vals = Array.from({ length: CLIPS }, (_, c) => Array.from({ length: PER_CLIP }, (_, k) => isVal(active, c, k))).flat().filter(Boolean).length;

  return (
    <div ref={ref} className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-line p-0.5" role="tablist" aria-label="Split strategy">
          {(["random", "group"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={active === m}
              onClick={() => setPinned(pinned === m ? null : m)}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors duration-200 ${active === m ? "bg-ink text-bg" : "text-muted hover:text-ink"}`}
            >
              {m === "random" ? "Random split" : "Split by clip"}
            </button>
          ))}
        </div>
        <span className="font-mono text-[11px] text-muted">{pinned ? "pinned, click again to resume" : "illustration of the documented problem"}</span>
      </div>

      <div className="mt-4 space-y-2.5">
        {Array.from({ length: CLIPS }, (_, clip) => (
          <div key={clip} className="flex items-center gap-3">
            <span className="w-12 shrink-0 font-mono text-[11px] text-muted">clip {clip + 1}</span>
            <div className="grid flex-1 grid-cols-12 gap-[3px]">
              {Array.from({ length: PER_CLIP }, (_, k) => {
                const index = clip * PER_CLIP + k;
                const val = isVal(active, clip, k);
                const leak = leaked(active, clip, k);
                const visible = index < shown;
                return (
                  <div
                    key={k}
                    className={`relative h-7 rounded-[4px] transition-all duration-300 ${visible ? "opacity-100" : "opacity-0"} ${val ? (leak ? "bg-warn" : "bg-accent") : "bg-sunken ring-1 ring-inset ring-line-strong"}`}
                    style={{ transitionDelay: visible ? `${(index % PER_CLIP) * 12}ms` : "0ms" }}
                    title={val ? (leak ? "validation window with a training window one frame away" : "validation window") : "training window"}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-[3px] bg-sunken ring-1 ring-inset ring-line-strong" />training window</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-[3px] bg-accent" />validation, clean</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-[3px] bg-warn" />validation with a near duplicate in training</span>
      </div>

      <p className="mt-4 border-t border-line pt-4 text-[14px] leading-relaxed text-ink-soft" aria-live="polite">
        {active === "random" ? (
          <>
            Each window shares 4 of its 5 frames with its neighbors, so a random split leaks: here <strong className="text-ink">{leaks} of {vals}</strong> validation windows sit next to a training window. On the real data it was <strong className="text-ink">99.1%</strong>, and the reported accuracy was mostly memorization.
          </>
        ) : (
          <>
            Holding out whole clips, by a seeded hash so adding data never reshuffles them, leaves <strong className="text-ink">{leaks}</strong> validation windows next to training data. The same idea holds out whole source videos for the court model and whole videos for the point segmenter.
          </>
        )}
      </p>
    </div>
  );
}
