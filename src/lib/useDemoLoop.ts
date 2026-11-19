import { type RefObject, useEffect, useRef, useState } from "react";

export type DemoWait = (ms: number) => Promise<void>;
export type DemoTween = (ms: number, onFrame: (progress: number) => void) => Promise<void>;
export type DemoScript = (tools: { wait: DemoWait; tween: DemoTween }) => Promise<void>;

type Sleeper = { remaining: number; startedAt: number; timer: number | undefined; resolve: () => void; reject: (reason: unknown) => void };
type Tween = { duration: number; elapsed: number; lastAt: number | undefined; frame: number | undefined; onFrame: (p: number) => void; resolve: () => void; reject: (reason: unknown) => void };

const CANCELLED = Symbol("cancelled");

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function useDemoLoop(target: RefObject<HTMLElement | null>, enabled: boolean, script: DemoScript) {
  const scriptRef = useRef(script);

  useEffect(() => {
    scriptRef.current = script;
  });

  useEffect(() => {
    const node = target.current;
    if (!enabled || !node) return;

    let inView = typeof IntersectionObserver === "undefined";
    let cancelled = false;
    const sleepers = new Set<Sleeper>();
    const tweens = new Set<Tween>();
    const isActive = () => inView && !document.hidden;

    const startSleeper = (sleeper: Sleeper) => {
      sleeper.startedAt = performance.now();
      sleeper.timer = window.setTimeout(() => {
        sleepers.delete(sleeper);
        sleeper.resolve();
      }, sleeper.remaining);
    };

    const stepTween = (tween: Tween) => {
      tween.frame = requestAnimationFrame((now) => {
        tween.elapsed += tween.lastAt === undefined ? 0 : now - tween.lastAt;
        tween.lastAt = now;
        const progress = Math.min(1, tween.elapsed / tween.duration);
        tween.onFrame(progress);
        if (progress < 1) {
          stepTween(tween);
          return;
        }
        tweens.delete(tween);
        tween.resolve();
      });
    };

    const sync = () => {
      const active = isActive();
      sleepers.forEach((sleeper) => {
        if (active && sleeper.timer === undefined) startSleeper(sleeper);
        else if (!active && sleeper.timer !== undefined) {
          window.clearTimeout(sleeper.timer);
          sleeper.timer = undefined;
          sleeper.remaining -= performance.now() - sleeper.startedAt;
        }
      });
      tweens.forEach((tween) => {
        if (active && tween.frame === undefined) {
          tween.lastAt = undefined;
          stepTween(tween);
        } else if (!active && tween.frame !== undefined) {
          cancelAnimationFrame(tween.frame);
          tween.frame = undefined;
        }
      });
    };

    const wait: DemoWait = (ms) =>
      new Promise<void>((resolve, reject) => {
        if (cancelled) return reject(CANCELLED);
        const sleeper: Sleeper = { remaining: ms, startedAt: 0, timer: undefined, resolve, reject };
        sleepers.add(sleeper);
        if (isActive()) startSleeper(sleeper);
      });

    const tween: DemoTween = (ms, onFrame) =>
      new Promise<void>((resolve, reject) => {
        if (cancelled) return reject(CANCELLED);
        const entry: Tween = { duration: ms, elapsed: 0, lastAt: undefined, frame: undefined, onFrame, resolve, reject };
        tweens.add(entry);
        if (isActive()) stepTween(entry);
      });

    const observer =
      typeof IntersectionObserver === "undefined"
        ? undefined
        : new IntersectionObserver(
            ([entry]) => {
              inView = Boolean(entry?.isIntersecting);
              sync();
            },
            { threshold: 0.2 },
          );
    observer?.observe(node);
    document.addEventListener("visibilitychange", sync);

    const run = async () => {
      try {
        while (!cancelled) await scriptRef.current({ wait, tween });
      } catch (reason) {
        if (reason !== CANCELLED) throw reason;
      }
    };
    void run();

    return () => {
      cancelled = true;
      observer?.disconnect();
      document.removeEventListener("visibilitychange", sync);
      sleepers.forEach((sleeper) => {
        window.clearTimeout(sleeper.timer);
        sleeper.reject(CANCELLED);
      });
      sleepers.clear();
      tweens.forEach((entry) => {
        if (entry.frame !== undefined) cancelAnimationFrame(entry.frame);
        entry.reject(CANCELLED);
      });
      tweens.clear();
    };
  }, [enabled, target]);
}
