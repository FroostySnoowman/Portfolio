import { Hono } from "hono";
import type { AppEnv, Bindings } from "../types";
import { hashedIp, isSameOrigin, underLimit } from "../lib/security";

const REASONS = { research: "Research or a PhD position", role: "A role", other: "Something else" } as const;
type Reason = keyof typeof REASONS;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Message = { id: number; name: string; email: string; reason: Reason; body: string; country: string | null };

export const contact = new Hono<AppEnv>();

contact.post("/", async (c) => {
  if (!isSameOrigin(c)) return c.json({ error: "forbidden" }, 403);
  if (Number(c.req.header("content-length") ?? 0) > 16_000) return c.json({ error: "too_large" }, 413);

  let input: Record<string, unknown>;
  try {
    input = await c.req.json();
  } catch {
    return c.json({ error: "invalid_json" }, 400);
  }

  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const name = str(input.name, 120);
  const email = str(input.email, 254);
  const body = str(input.message, 5000);
  const reason: Reason = typeof input.reason === "string" && input.reason in REASONS ? (input.reason as Reason) : "other";

  const fields: Record<string, string> = {};
  if (!name) fields.name = "Add your name.";
  if (!EMAIL_RE.test(email)) fields.email = "That email doesn't look right.";
  if (body.length < 10) fields.message = "Say a little more, at least a sentence.";
  if (Object.keys(fields).length) return c.json({ error: "validation", fields }, 422);

  // Bots fill the hidden field or submit instantly. Answer like it worked so they learn nothing.
  const elapsed = typeof input.elapsed === "number" ? input.elapsed : 0;
  if (str(input.company, 200) || elapsed < 2500) return c.json({ ok: true });

  const ipHash = await hashedIp(c, "contact");
  if (!(await underLimit(c.env.DB, `contact:${ipHash}`, 5, 3600))) {
    c.header("retry-after", "3600");
    return c.json({ error: "rate_limited" }, 429);
  }

  const country = (c.req.raw.cf?.country as string | undefined) ?? null;
  const row = await c.env.DB.prepare(
    "INSERT INTO messages (name, email, reason, body, ip_hash, country) VALUES (?1, ?2, ?3, ?4, ?5, ?6) RETURNING id",
  )
    .bind(name, email, reason, body, ipHash, country)
    .first<{ id: number }>();

  c.executionCtx.waitUntil(deliver(c.env, { id: row?.id ?? 0, name, email, reason, body, country }));
  return c.json({ ok: true });
});

async function deliver(env: Bindings, m: Message) {
  let delivered = false;

  if (env.DISCORD_WEBHOOK_URL) {
    try {
      const res = await fetch(env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: "jacobjbeal.com",
          allowed_mentions: { parse: [] },
          embeds: [
            {
              title: `New message from ${m.name}`.slice(0, 256),
              description: m.body.slice(0, 4000),
              color: 0x0f6b5c,
              fields: [
                { name: "Email", value: m.email, inline: true },
                { name: "About", value: REASONS[m.reason], inline: true },
                { name: "Country", value: m.country ?? "Unknown", inline: true },
              ],
            },
          ],
        }),
      });
      delivered ||= res.ok;
    } catch (err) {
      console.error("discord delivery failed", err);
    }
  }

  if (env.EMAIL && env.CONTACT_FROM && env.CONTACT_TO) {
    try {
      const { EmailMessage } = await import("cloudflare:email");
      const clean = (s: string) => s.replace(/[\r\n<>]/g, " ");
      const raw = [
        `From: jacobjbeal.com <${env.CONTACT_FROM}>`,
        `To: ${env.CONTACT_TO}`,
        `Reply-To: ${clean(m.email)}`,
        `Subject: Portfolio message from ${clean(m.name)}`,
        `Message-ID: <contact-${m.id}-${Date.now()}@jacobjbeal.com>`,
        `Date: ${new Date().toUTCString()}`,
        "MIME-Version: 1.0",
        "Content-Type: text/plain; charset=utf-8",
        "Content-Transfer-Encoding: 8bit",
        "",
        REASONS[m.reason],
        `From ${clean(m.name)} (${clean(m.email)})${m.country ? ` in ${m.country}` : ""}`,
        "",
        m.body,
      ].join("\r\n");
      await env.EMAIL.send(new EmailMessage(env.CONTACT_FROM, env.CONTACT_TO, raw));
      delivered = true;
    } catch (err) {
      console.error("email delivery failed", err);
    }
  }

  if (delivered) await env.DB.prepare("UPDATE messages SET delivered = 1 WHERE id = ?1").bind(m.id).run();
}
