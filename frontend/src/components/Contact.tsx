import { AnimatePresence, motion } from "motion/react";
import { type FormEvent, useRef, useState } from "react";
import { profile } from "../content/profile";
import { ArrowLink, EASE, Reveal, Section, SectionHeader } from "./ui";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string; fields?: Record<string, string> };

const REASONS = [
  { value: "research", label: "Research or a PhD position" },
  { value: "role", label: "A job" },
  { value: "other", label: "Something else" },
];

export function Contact() {
  const started = useRef(Date.now());
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          reason: form.get("reason"),
          message: form.get("message"),
          company: form.get("company"),
          elapsed: Date.now() - started.current,
        }),
      });
      if (res.ok) {
        setStatus({ kind: "sent" });
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string; fields?: Record<string, string> };
      if (data.error === "validation") setStatus({ kind: "error", message: "A couple of fields need another look.", fields: data.fields });
      else if (data.error === "rate_limited") setStatus({ kind: "error", message: "That's a lot of messages from one place. Please email me directly instead." });
      else setStatus({ kind: "error", message: "Something went wrong sending that. Please email me directly instead." });
    } catch {
      setStatus({ kind: "error", message: "Couldn't reach the server. Please email me directly instead." });
    }
  };

  const fieldError = (name: string) => (status.kind === "error" ? status.fields?.[name] : undefined);
  const input = "w-full rounded-xl border border-line bg-surface px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-muted focus:border-accent";

  return (
    <Section id="contact">
      <SectionHeader
        index="06"
        eyebrow="Contact"
        title="Say hi"
        lede={
          <>
            I'm happy to talk about research, PhD programs, jobs, or anything on this page. Email is the fastest way to reach me: <a href={`mailto:${profile.email}`} className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-accent">{profile.email}</a>.
          </>
        }
      />
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Reveal className="space-y-4">
          <ArrowLink href={profile.links.cv}>Download CV (PDF)</ArrowLink>
          <div>
            <ArrowLink href={profile.links.report}>Research report (PDF)</ArrowLink>
          </div>
          <div>
            <ArrowLink href={profile.links.github} external>GitHub</ArrowLink>
          </div>
          <div>
            <ArrowLink href={profile.links.linkedin} external>LinkedIn</ArrowLink>
          </div>
        </Reveal>

        <Reveal>
          <AnimatePresence mode="wait">
            {status.kind === "sent" ? (
              <motion.div key="sent" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="rounded-2xl border border-line bg-surface p-8" role="status">
                <h3 className="font-serif text-[26px] text-ink">Thanks, it's on its way.</h3>
                <p className="mt-2 text-[15px] text-ink-soft">I read every message and usually reply within a couple of days.</p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={submit} className="grid gap-4" noValidate exit={{ opacity: 0, y: -8 }}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-[13px] font-medium text-ink-soft">
                    Name
                    <input name="name" autoComplete="name" required maxLength={120} className={input} aria-invalid={Boolean(fieldError("name"))} />
                    {fieldError("name") ? <span className="text-[12px] text-warn">{fieldError("name")}</span> : null}
                  </label>
                  <label className="grid gap-1.5 text-[13px] font-medium text-ink-soft">
                    Email
                    <input name="email" type="email" autoComplete="email" required maxLength={254} className={input} aria-invalid={Boolean(fieldError("email"))} />
                    {fieldError("email") ? <span className="text-[12px] text-warn">{fieldError("email")}</span> : null}
                  </label>
                </div>
                <fieldset className="grid gap-1.5">
                  <legend className="mb-1.5 text-[13px] font-medium text-ink-soft">About</legend>
                  <div className="flex flex-wrap gap-2">
                    {REASONS.map((reason, k) => (
                      <label key={reason.value} className="cursor-pointer">
                        <input type="radio" name="reason" value={reason.value} defaultChecked={k === 0} className="peer sr-only" />
                        <span className="inline-flex rounded-full border border-line px-3.5 py-1.5 text-[13px] text-muted transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-bg peer-focus-visible:outline-2 peer-focus-visible:outline-accent">{reason.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className="grid gap-1.5 text-[13px] font-medium text-ink-soft">
                  Message
                  <textarea name="message" required rows={6} maxLength={5000} className={`${input} resize-y`} aria-invalid={Boolean(fieldError("message"))} />
                  {fieldError("message") ? <span className="text-[12px] text-warn">{fieldError("message")}</span> : null}
                </label>
                <input name="company" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px] h-px w-px opacity-0" aria-hidden="true" />
                <div className="flex flex-wrap items-center gap-4">
                  <button type="submit" disabled={status.kind === "sending"} className="rounded-full bg-ink px-6 py-3 text-[14px] font-medium text-bg transition-all duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60">
                    {status.kind === "sending" ? "Sending…" : "Send message"}
                  </button>
                  {status.kind === "error" ? (
                    <span className="text-[14px] text-warn" role="alert">
                      {status.message}
                    </span>
                  ) : null}
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </Section>
  );
}
