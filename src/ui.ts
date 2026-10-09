// Everything that is not the molecule: smooth scroll, the rail, reveals, the chapters' content, and the state the scene reads.
import Lenis from "lenis";
import { mountResume } from "./resume";
import { mountWork } from "./work";
import { mountContact } from "./contact";

export type UIState = { chapter: string; resumeTurn: number; scroll: () => number; reduced: boolean; touch: boolean; lenis: Lenis };

export function initUI(): UIState {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(pointer: coarse)").matches;
  const lenis = new Lenis({ smoothWheel: true, lerp: 0.09 });
  (window as any).__lenis = lenis;
  const state: UIState = { chapter: "hero", resumeTurn: 1, scroll: () => lenis.scroll, reduced, touch, lenis };

  for (const a of document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
    a.addEventListener("click", (e) => { const el = document.querySelector(a.getAttribute("href")!); if (el) { e.preventDefault(); lenis.scrollTo(el as HTMLElement, { duration: 1.4 }); } });
  }
  const railLinks = [...document.querySelectorAll<HTMLAnchorElement>(".rail a")];
  const seen = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) { state.chapter = en.target.id; for (const l of railLinks) l.classList.toggle("is-current", l.dataset.rail === en.target.id); }
  }, { rootMargin: "-45% 0px -45% 0px" });
  document.querySelectorAll<HTMLElement>("main section").forEach((s) => seen.observe(s));
  const reveal = new IntersectionObserver((entries) => { for (const en of entries) if (en.isIntersecting) en.target.classList.add("is-in"); }, { threshold: 0.2 });
  document.querySelectorAll(".reveal").forEach((el) => reveal.observe(el));

  mountResume(document.getElementById("resume")!, (f) => { state.resumeTurn = f; });
  mountWork(document.getElementById("work")!);
  mountContact(document.getElementById("close")!);

  // the hero's hint fades in the first third of a screen; this runs whether or not the scene has loaded yet
  const heroFoot = document.querySelector<HTMLElement>(".hero-foot")!;
  const tick = (t: number) => {
    lenis.raf(t);
    const gone = Math.min(1, Math.max(0, lenis.scroll / (innerHeight * 0.35)));
    heroFoot.style.opacity = String(1 - gone); heroFoot.style.transform = `translateY(${gone * 24}px)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return state;
}
