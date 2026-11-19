import { useEffect, useState } from "react";
import { profile } from "../content/profile";
import { ArrowLink, Reveal, Section, SectionHeader } from "./ui";

type Topic = "research" | "job" | "other";

const TOPICS: { value: Topic; label: string; subject: string; body: string }[] = [
  {
    value: "research",
    label: "Research or a PhD position",
    subject: "Research or a PhD position",
    body: "Hi Jacob,\n\nI'm [your name], [your role] at [university or lab]. I'm reaching out about [what you'd like to talk about].\n\n[A little more detail]\n\nThanks,\n[your name]",
  },
  {
    value: "job",
    label: "A job",
    subject: "A job opportunity",
    body: "Hi Jacob,\n\nI'm [your name], [your role] at [company]. We're hiring for [role], and I'd like to talk with you about it.\n\n[A little more about the role]\n\nThanks,\n[your name]",
  },
  {
    value: "other",
    label: "Something else",
    subject: "Hello from your website",
    body: "Hi Jacob,\n\n\n\nThanks,\n[your name]",
  },
];

function topicOf(value: Topic) {
  return TOPICS.find((t) => t.value === value) ?? TOPICS[0]!;
}

export function Contact() {
  const [topic, setTopic] = useState<Topic>("research");
  const [subject, setSubject] = useState(topicOf("research").subject);
  const [body, setBody] = useState(topicOf("research").body);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const pickTopic = (next: Topic) => {
    const current = topicOf(topic);
    const upcoming = topicOf(next);
    if (subject === current.subject || !subject.trim()) setSubject(upcoming.subject);
    if (body === current.body || !body.trim()) setBody(upcoming.body);
    setTopic(next);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const mailto = `mailto:${profile.email}?${query}`;
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(profile.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const input = "w-full rounded-xl border border-line bg-surface px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-muted focus:border-accent";

  return (
    <Section id="contact">
      <SectionHeader title="Say hi" lede="I'm happy to talk about research, PhD programs, jobs, or anything on this page. Email is the best way to reach me." />
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Reveal>
          <a href={`mailto:${profile.email}`} className="break-all font-serif text-[24px] leading-tight text-ink underline decoration-line-strong decoration-1 underline-offset-[6px] hover:decoration-accent sm:text-[28px]">
            {profile.email}
          </a>
          <div className="mt-4 flex items-center gap-3">
            <button type="button" onClick={copyEmail} className="rounded-full border border-line-strong px-4 py-2 text-[14px] font-medium text-ink transition-colors hover:border-ink">
              {copied ? "Copied" : "Copy address"}
            </button>
            <span className="sr-only" aria-live="polite">{copied ? "Email address copied" : ""}</span>
          </div>
          <div className="mt-8 space-y-1">
            <div>
              <ArrowLink href={profile.links.cv}>Download CV (PDF)</ArrowLink>
            </div>
            <div>
              <ArrowLink href={profile.links.report}>Research report (PDF)</ArrowLink>
            </div>
            <div>
              <ArrowLink href={profile.links.github} external>GitHub</ArrowLink>
            </div>
            <div>
              <ArrowLink href={profile.links.linkedin} external>LinkedIn</ArrowLink>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="grid gap-4 rounded-2xl border border-line bg-surface/60 p-5 sm:p-6">
            <p className="text-[15px] leading-relaxed text-ink-soft">Not sure what to write? Pick a topic and fill in the brackets. Both buttons open a draft you can still edit, and nothing is sent from this page.</p>
            <fieldset>
              <legend className="mb-2 text-[13px] font-medium text-ink-soft">About</legend>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <label key={t.value} className="cursor-pointer">
                    <input type="radio" name="topic" value={t.value} checked={topic === t.value} onChange={() => pickTopic(t.value)} className="peer sr-only" />
                    <span className="inline-flex rounded-full border border-line px-3.5 py-1.5 text-[13px] text-muted transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-bg peer-focus-visible:outline-2 peer-focus-visible:outline-accent">{t.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="grid gap-1.5 text-[13px] font-medium text-ink-soft">
              Subject
              <input value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={200} className={input} />
            </label>
            <label className="grid gap-1.5 text-[13px] font-medium text-ink-soft">
              Message
              <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={9} maxLength={4000} className={`${input} resize-y leading-relaxed`} />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <a href={mailto} className="rounded-full bg-ink px-6 py-3 text-[14px] font-medium text-bg transition-transform duration-300 hover:-translate-y-0.5">
                Open in my email app
              </a>
              <a href={gmail} target="_blank" rel="noreferrer" className="rounded-full border border-line-strong px-5 py-3 text-[14px] font-medium text-ink transition-colors hover:border-ink">
                Open in Gmail
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
