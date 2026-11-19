import type { Context } from "hono";
import type { AppEnv } from "../types";

export async function sha256(input: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Hash the caller's IP with a purpose string, so raw IPs are never stored. */
export function hashedIp(c: Context<AppEnv>, purpose: string) {
  return sha256(`${c.req.header("cf-connecting-ip") ?? "0.0.0.0"}:jacobjbeal:${purpose}`);
}

/** Reject cross origin writes. Browsers always send Origin on POST. */
export function isSameOrigin(c: Context<AppEnv>) {
  const origin = c.req.header("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(c.req.url).host;
  } catch {
    return false;
  }
}

/** Fixed window limiter in D1. Returns true while the caller is under `limit` per window. */
export async function underLimit(db: D1Database, bucket: string, limit: number, windowSeconds: number) {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % windowSeconds);
  const row = await db
    .prepare(
      `INSERT INTO rate_limits (bucket, count, window_start) VALUES (?1, 1, ?2)
       ON CONFLICT(bucket) DO UPDATE SET
         count = CASE WHEN rate_limits.window_start = ?2 THEN rate_limits.count + 1 ELSE 1 END,
         window_start = ?2
       RETURNING count`,
    )
    .bind(bucket, windowStart)
    .first<{ count: number }>();
  return (row?.count ?? 1) <= limit;
}
