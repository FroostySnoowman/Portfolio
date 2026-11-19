import { MotionConfig } from "motion/react";
import { Contact } from "./components/Contact";
import { Education, Experience, Thesis } from "./components/Background";
import { Hero } from "./components/Hero";
import { Nav } from "./components/Nav";
import { Projects } from "./components/Projects";
import { ResearchSection } from "./components/research/ResearchSection";
import { profile } from "./content/profile";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a href="#research" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bg">
        Skip to research
      </a>
      <Nav />
      <main>
        <Hero />
        <ResearchSection />
        <Thesis />
        <Education />
        <Experience />
        <Projects />
        <Contact />
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-10 text-[13px] text-muted sm:px-8">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <div className="flex flex-wrap gap-5">
            <a href={profile.links.cv} className="hover:text-ink">CV</a>
            <a href={profile.links.report} className="hover:text-ink">Research report</a>
            <a href={profile.links.github} target="_blank" rel="noreferrer" className="hover:text-ink">GitHub</a>
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="hover:text-ink">LinkedIn</a>
            <a href={`mailto:${profile.email}`} className="hover:text-ink">Email</a>
          </div>
        </div>
      </footer>
    </MotionConfig>
  );
}
