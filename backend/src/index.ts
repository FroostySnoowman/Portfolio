import { Hono } from "hono";
import { contact } from "./routes/contact";
import { ticketsx } from "./routes/ticketsx";
import type { AppEnv } from "./types";

const app = new Hono<AppEnv>();

app.use("/api/*", async (c, next) => {
  await next();
  c.header("x-content-type-options", "nosniff");
  if (!c.res.headers.has("cache-control")) c.header("cache-control", "no-store");
});

app.get("/api/health", (c) => c.json({ ok: true }));
app.route("/api/contact", contact);
app.route("/api/ticketsx", ticketsx);
app.all("/api/*", (c) => c.json({ error: "not_found" }, 404));

app.onError((err, c) => {
  console.error("api error", c.req.path, err);
  return c.json({ error: "server_error" }, 500);
});

app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
