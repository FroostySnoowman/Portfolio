import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../lib/useDemoLoop";
import { useJson } from "../../lib/useJson";

type Rally = {
  clip: [number, number];
  width: number;
  height: number;
  frames: [number, number | null, number | null, number][];
  courts: [number, number][][][];
  inPlay: [number, number][];
  segments: [number, number][];
  labels: [number, number, string][];
  threshold: number;
};

type Layer = "ball" | "court" | "points";

const LAYERS: { key: Layer; label: string; hint: string }[] = [
  { key: "ball", label: "Ball track", hint: "tracker output with a 0.4 s trail" },
  { key: "court", label: "Court model", hint: "projected through the fitted homography" },
  { key: "points", label: "Point segmenter", hint: "in-play decision" },
];

const TRAIL = 0.4;

function frameAt(frames: Rally["frames"], t: number) {
  let lo = 0;
  let hi = frames.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if ((frames[mid]?.[0] ?? 0) <= t) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

export function TrackingDemo() {
  const data = useJson<Rally>("/demo/rally.json");
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layers, setLayers] = useState<Record<Layer, boolean>>({ ball: true, court: true, points: true });
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const reduced = useReducedMotion();
  const layersRef = useRef(layers);
  layersRef.current = layers;

  const draw = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !data) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(rect.width * dpr)) {
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = (rect.width / data.width) * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(s, 0, 0, s, 0, 0);
    const t = video.currentTime;
    const i = frameAt(data.frames, t);
    const frame = data.frames[i];
    const on = layersRef.current;

    if (on.court && frame && frame[3] >= 0) {
      const lines = data.courts[frame[3]] ?? [];
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = "rgba(52, 211, 177, 0.92)";
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 4;
      for (const line of lines) {
        ctx.beginPath();
        line.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }

    if (on.ball) {
      const trail: [number, number, number][] = [];
      for (let j = i; j >= 0; j--) {
        const f = data.frames[j];
        if (!f || t - f[0] > TRAIL) break;
        if (f[1] !== null && f[2] !== null) trail.push([f[1], f[2], t - f[0]]);
      }
      for (let k = 0; k < trail.length - 1; k++) {
        const a = trail[k]!;
        const b = trail[k + 1]!;
        if (Math.hypot(a[0] - b[0], a[1] - b[1]) > 140) continue;
        const alpha = 1 - a[2] / TRAIL;
        ctx.strokeStyle = `rgba(250, 214, 50, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1 + 4 * alpha;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
      }
      if (frame && frame[1] !== null && frame[2] !== null) {
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.beginPath();
        ctx.arc(frame[1], frame[2], 13, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "#fad632";
        ctx.beginPath();
        ctx.arc(frame[1], frame[2], 13, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    setTime((previous) => (Math.abs(previous - t) > 0.02 ? t : previous));
  }, [data]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !data) return;
    let handle = 0;
    const loop = () => {
      draw();
      handle = requestAnimationFrame(loop);
    };
    handle = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(handle);
  }, [data, draw]);

  useEffect(() => {
    const node = wrapRef.current;
    const video = videoRef.current;
    if (!node || !video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !userPaused && !reduced) void video.play().catch(() => undefined);
        else if (!entry?.isIntersecting) video.pause();
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [userPaused, reduced]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      setUserPaused(false);
      void video.play();
    } else {
      setUserPaused(true);
      video.pause();
    }
  };

  const seek = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value;
    draw();
  };

  const duration = data ? data.clip[1] - data.clip[0] : 20;
  const inPlay = data ? data.segments.some(([a, b]) => time >= a && time < b) : false;
  const labeled = data ? data.labels.find(([a, b]) => time >= a && time < b) : undefined;

  return (
    <div ref={wrapRef} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_0_rgba(0,0,0,0.02),0_20px_60px_-30px_rgba(0,0,0,0.35)]">
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full"
          src="/demo/rally.mp4"
          poster="/demo/court-frame.jpg"
          muted
          loop
          playsInline
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          aria-label="A rally from a college doubles match with model outputs drawn on top"
        />
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
        {layers.points && (
          <div className="pointer-events-none absolute left-3 top-3 flex gap-2 text-[12px] font-medium sm:left-4 sm:top-4 sm:text-[13px]">
            <span className="flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-white backdrop-blur">
              <span className="text-white/60">model</span>
              <span className={`h-2 w-2 rounded-full transition-colors duration-200 ${inPlay ? "bg-emerald-400" : "bg-white/40"}`} />
              {inPlay ? "in play" : "dead time"}
            </span>
            <span className="flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-white backdrop-blur">
              <span className="text-white/60">label</span>
              {labeled ? labeled[2] : "no play"}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={togglePlay}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur transition hover:bg-black/85 sm:bottom-4 sm:right-4"
          aria-label={playing ? "Pause the demo" : "Play the demo"}
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="1.5" width="3.5" height="11" rx="1" fill="currentColor" /><rect x="8.5" y="1.5" width="3.5" height="11" rx="1" fill="currentColor" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.8v10.4a.8.8 0 0 0 1.2.7l8.6-5.2a.8.8 0 0 0 0-1.4L4.2 1.1A.8.8 0 0 0 3 1.8Z" fill="currentColor" /></svg>
          )}
        </button>
      </div>

      <div className="border-t border-line px-4 py-4 sm:px-5">
        <ClipTimeline data={data} time={time} duration={duration} onSeek={seek} />
        <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Model output layers">
          {LAYERS.map((layer) => {
            const active = layers[layer.key];
            return (
              <button
                key={layer.key}
                type="button"
                aria-pressed={active}
                title={layer.hint}
                onClick={() => setLayers((value) => ({ ...value, [layer.key]: !value[layer.key] }))}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors duration-200 ${active ? "border-ink bg-ink text-bg" : "border-line-strong text-muted hover:border-ink hover:text-ink"}`}
              >
                <span className={`h-2 w-2 rounded-full ${layer.key === "ball" ? "bg-[#fad632]" : layer.key === "court" ? "bg-[#34d3b1]" : "bg-emerald-500"}`} />
                {layer.label}
              </button>
            );
          })}
          <span className="ml-auto hidden text-[12px] text-muted sm:block">Model output on a match none of the models trained on</span>
        </div>
      </div>
    </div>
  );
}

function ClipTimeline({ data, time, duration, onSeek }: { data: Rally | null; time: number; duration: number; onSeek: (t: number) => void }) {
  const width = 1000;
  const height = 64;
  const x = (t: number) => (Math.max(0, Math.min(duration, t)) / duration) * width;
  const curve = data
    ? data.inPlay
        .filter(([t]) => t >= 0 && t <= duration)
        .map(([t, p], k) => `${k ? "L" : "M"}${x(t).toFixed(1)},${(height - 26 - p * (height - 30)).toFixed(1)}`)
        .join(" ")
    : "";
  const thresholdY = data ? height - 26 - data.threshold * (height - 30) : 0;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-16 w-full" preserveAspectRatio="none" aria-hidden="true">
        {data && <line x1="0" x2={width} y1={thresholdY} y2={thresholdY} stroke="var(--line-strong)" strokeDasharray="6 6" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />}
        <path d={curve} fill="none" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {data?.labels.map(([a, b], k) => <rect key={`l${k}`} x={x(a)} width={Math.max(2, x(b) - x(a))} y={height - 20} height="7" rx="2" fill="var(--ink)" />)}
        {data?.segments.map(([a, b], k) => <rect key={`s${k}`} x={x(a)} width={Math.max(2, x(b) - x(a))} y={height - 10} height="7" rx="2" fill="var(--court)" />)}
        <line x1={x(time)} x2={x(time)} y1="0" y2={height} stroke="var(--ink)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <input
        type="range"
        min={0}
        max={duration}
        step={0.01}
        value={Math.min(time, duration)}
        onChange={(event) => onSeek(Number(event.target.value))}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label="Scrub through the rally"
      />
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted">
        <span className="flex items-center gap-1.5"><span className="h-[2px] w-4 bg-accent" />in-play probability</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-ink" />labeled point</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-court" />model segment</span>
        <span className="tabular ml-auto">{time.toFixed(1)} s / {duration.toFixed(0)} s</span>
      </div>
    </div>
  );
}
