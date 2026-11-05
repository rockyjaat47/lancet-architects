"use client";

import { asset } from "@/lib/base-path";
import { animate, motion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useUI } from "./Providers";
import { site } from "@/lib/content";

const subscribe = () => () => {};
// Decided once per page load, so re-renders (or StrictMode) don't flip it after "visited" is written.
let decision: boolean | null = null;
const shouldPlay = () => {
  if (decision === null) {
    let visited = false;
    try {
      visited = !!sessionStorage.getItem("visited");
    } catch {}
    decision = !visited && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return decision;
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * First-visit loader (home only): logo fills bottom→top while a line and a
 * 0→100% counter progress, then the tagline fades in/out and the page is revealed.
 * Timeline mirrors the reference (see REFERENCE_NOTES.md › Loader).
 */
export default function Loader() {
  const { setIntro } = useUI();
  // Server snapshot = true so SSR markup always contains the loader (hidden by CSS for returning visitors).
  const play = useSyncExternalStore(subscribe, shouldPlay, () => true);
  const [phase, setPhase] = useState<"progress" | "tagline" | "out" | "gone">("progress");
  const countRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem("visited", "true");
    } catch {}
    if (!play) {
      setIntro("done");
      return;
    }
    setIntro("loading");
    document.documentElement.style.overflow = "hidden";
    let cancelled = false;
    (async () => {
      await wait(500);
      const ease = [0.45, 0.05, 0.55, 0.95] as const;
      await animate(0, 100, {
        duration: 2.3,
        ease,
        onUpdate: (v) => {
          if (countRef.current) countRef.current.textContent = String(Math.round(v));
          if (lineRef.current) lineRef.current.style.transform = `scaleX(${v / 100})`;
          if (fillRef.current) fillRef.current.style.clipPath = `inset(${100 - v}% 0 0 0)`;
        },
      });
      if (cancelled) return;
      await wait(400);
      setPhase("tagline");
      await wait(2000);
      if (cancelled) return;
      setPhase("out");
      setIntro("done");
      await wait(700);
      document.documentElement.style.overflow = "";
      decision = false; // client-side navigations back to "/" skip the loader
      setPhase("gone");
    })();
    return () => {
      cancelled = true;
      document.documentElement.style.overflow = "";
    };
  }, [play, setIntro]);

  if (!play || phase === "gone") return null;

  return (
    <motion.div
      data-loader
      className="fixed inset-0 z-[1200] bg-paper"
      animate={{ opacity: phase === "out" ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center gap-3"
        animate={{ opacity: phase === "progress" ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* grey logo, then the brand colour fills it from bottom to top */}
        <div className="relative w-[17rem] max-md:w-52" style={{ aspectRatio: "958 / 248" }}>
          <Image src={asset(site.logo)} alt="" fill priority unoptimized className="object-contain opacity-15 grayscale" />
          <div ref={fillRef} className="absolute inset-0" style={{ clipPath: "inset(100% 0 0 0)" }}>
            <Image src={asset(site.logo)} alt="" fill unoptimized className="object-contain" />
          </div>
        </div>
        <p className="mt-2 text-micro uppercase tracking-[0.2em] text-ink/80">Architects · Interior · Landscape</p>
      </motion.div>

      <motion.div
        className="absolute inset-x-[3.68rem] bottom-[3.4rem] flex items-center gap-8 max-md:inset-x-[6vw]"
        animate={{ opacity: phase === "progress" ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="h-px flex-1 bg-transparent">
          <div ref={lineRef} className="h-px w-[85%] origin-left bg-ink" style={{ transform: "scaleX(0.03)" }} />
        </div>
        <p className="w-12 text-right text-[0.97rem] tabular-nums">
          <span ref={countRef}>0</span>%
        </p>
      </motion.div>

      <motion.p
        className="absolute inset-0 m-auto flex h-fit max-w-[42rem] items-center justify-center px-6 text-center font-display text-xl font-light leading-[1.1] text-ink"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "tagline" ? 1 : 0 }}
        transition={{ duration: phase === "tagline" ? 0.4 : 0.6 }}
      >
        <span>
          {site.tagline.before}
          <strong className="font-medium">{site.tagline.bold}</strong>
          {site.tagline.after}
        </span>
      </motion.p>
    </motion.div>
  );
}
