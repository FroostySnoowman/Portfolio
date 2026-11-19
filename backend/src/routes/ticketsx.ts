import { Hono } from "hono";
import type { AppEnv } from "../types";

const CACHE_KEY = "https://jacobjbeal.com/__cache/ticketsx-stats";

/** Live TicketsX reach, cached at the edge for ten minutes. */
export const ticketsx = new Hono<AppEnv>();

ticketsx.get("/", async (c) => {
  const cache = caches.default;
  const cached = await cache.match(CACHE_KEY);
  if (cached) return cached;

  try {
    const res = await fetch("https://api.ticketsx.xyz/stats", { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const data = await res.json<{ total_guilds?: number; total_member_count?: number }>();
    if (!data.total_member_count || !data.total_guilds) throw new Error("empty stats");
    const response = Response.json(
      { members: data.total_member_count, communities: data.total_guilds },
      { headers: { "cache-control": "public, max-age=600" } },
    );
    c.executionCtx.waitUntil(cache.put(CACHE_KEY, response.clone()));
    return response;
  } catch (err) {
    console.error("ticketsx stats unavailable", err);
    c.header("cache-control", "no-store");
    return c.json({ error: "unavailable" }, 503);
  }
});
