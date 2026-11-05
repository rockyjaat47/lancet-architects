"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { animate, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUI } from "./Providers";
import { power3InOut } from "@/lib/motion";

export type SlideProject = { key: string; href: string; title: string; location: string; cover: string; alt: string };

/*
 * Infinite "arc" carousel — DOM port of the reference's Three.js slider
 * (see REFERENCE_NOTES.md › Home slider). Units mirror the WebGL scene:
 * 1 unit = viewportHeight / 3.78 (perspective camera, fov 35°, z = 6).
 */
const NDC_H = 3.78;
const DESKTOP = { w: 2.4, h: 2.4, margin: 3.5, posY: 0.5 };
const MOBILE = { w: 1.2, h: 1.7, margin: 1.42, posY: 0.25 };

const wrap = (v: number, n: number) => {
  let r = ((v % n) + n) % n;
  if (r > n / 2) r -= n;
  return r;
};

export default function ProjectSlider({ projects }: { projects: SlideProject[] }) {
  const n = projects.length;
  const router = useRouter();
  const { intro } = useUI();

  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const st = useRef({
    target: 0,
    current: 0,
    progress: 1, // 1 = active card full-screen (intro / exit), 0 = resting
    dragging: false,
    dragStartX: 0,
    dragStartTarget: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0,
    moved: 0,
    wheelTimer: 0 as unknown as ReturnType<typeof setTimeout>,
    W: 0,
    H: 0,
    reduce: false,
    mobile: false,
  });

  const [active, setActive] = useState(0);
  const [moving, setMoving] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const activeRef = useRef(0);
  const movingRef = useRef(false);

  const goTo = useCallback((slot: number) => {
    st.current.target = slot;
    setInteracted(true);
  }, []);

  // ---------- render loop ----------
  useEffect(() => {
    const s = st.current;
    s.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const measure = () => {
      const r = rootRef.current!.getBoundingClientRect();
      s.W = r.width;
      s.H = r.height;
      s.mobile = window.innerWidth < 768;
    };
    measure();
    window.addEventListener("resize", measure);

    let raf = 0;
    const loop = () => {
      const cfg = s.mobile ? MOBILE : DESKTOP;
      const unit = s.H / NDC_H;
      const k = s.reduce ? 1 : s.dragging ? 0.25 : 0.075;
      s.current += (s.target - s.current) * k;
      if (Math.abs(s.target - s.current) < 0.0005) s.current = s.target;

      const cw = cfg.w * unit;
      const ch = cfg.h * unit;
      const cx = s.W / 2;
      const cy = s.H / 2;
      const p = s.progress;
      const activeIdx = ((Math.round(s.current) % n) + n) % n;

      for (let i = 0; i < n; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const rel = wrap(i - s.current, n);
        if (Math.abs(rel) > 2.6) {
          el.style.visibility = "hidden";
          continue;
        }
        el.style.visibility = "visible";
        const xu = rel * cfg.margin;
        const yu = (0.1 - Math.abs(xu) * 0.2) * cfg.posY;
        const rot = xu * 0.1; // rad, CSS clockwise
        let w = cw, h = ch, x = cx + xu * unit, y = cy - yu * unit, r = rot;
        if (i === activeIdx) {
          // intro / exit: morph to full screen
          w = cw + (s.W - cw) * p;
          h = ch + (s.H - ch) * p;
          x = x + (cx - x) * p;
          y = y + (cy - y) * p;
          r = rot * (1 - p);
        } else {
          y += p * 10 * unit;
        }
        el.style.width = `${w}px`;
        el.style.height = `${h}px`;
        el.style.transform = `translate3d(${x - w / 2}px, ${y - h / 2}px, 0) rotate(${r}rad)`;
        el.dataset.active = String(i === activeIdx);
        el.tabIndex = i === activeIdx ? 0 : -1;
        el.setAttribute("aria-hidden", String(i !== activeIdx));
      }

      const isMoving = s.dragging || Math.abs(s.target - s.current) > 0.02;
      if (isMoving !== movingRef.current) {
        movingRef.current = isMoving;
        setMoving(isMoving);
      }
      if (!isMoving && activeIdx !== activeRef.current) {
        activeRef.current = activeIdx;
        setActive(activeIdx);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [n]);

  // ---------- intro (after the loader) ----------
  useEffect(() => {
    if (intro !== "done") return;
    const s = st.current;
    if (s.reduce) {
      s.progress = 0;
      return;
    }
    const ctl = animate(1, 0, { duration: 1, delay: 0.4, ease: power3InOut, onUpdate: (v) => (s.progress = v) });
    return () => ctl.stop();
  }, [intro]);

  // ---------- wheel ----------
  useEffect(() => {
    const el = rootRef.current!;
    const s = st.current;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const norm = Math.max(-60, Math.min(60, e.deltaMode === 1 ? d * 16 : d));
      s.target += norm / 220;
      setInteracted(true);
      clearTimeout(s.wheelTimer);
      s.wheelTimer = setTimeout(() => (s.target = Math.round(s.target)), 140);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ---------- pointer drag (mouse + touch) ----------
  const spacingPx = () => {
    const s = st.current;
    return (s.mobile ? MOBILE : DESKTOP).margin * (s.H / NDC_H);
  };
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const s = st.current;
    s.dragging = true;
    s.dragStartX = s.lastX = e.clientX;
    s.dragStartTarget = s.target;
    s.lastT = performance.now();
    s.velocity = 0;
    s.moved = 0;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = st.current;
    if (!s.dragging) return;
    const now = performance.now();
    const dx = e.clientX - s.dragStartX;
    s.moved = Math.max(s.moved, Math.abs(dx));
    if (s.moved > 6) (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    s.velocity = (e.clientX - s.lastX) / Math.max(1, now - s.lastT);
    s.lastX = e.clientX;
    s.lastT = now;
    s.target = s.dragStartTarget - (dx * (s.mobile ? 1.4 : 1)) / spacingPx();
  };
  const onPointerUp = () => {
    const s = st.current;
    if (!s.dragging) return;
    s.dragging = false;
    if (s.moved > 6) {
      setInteracted(true);
      const fling = (-s.velocity * 220) / spacingPx();
      s.target = Math.round(s.target + Math.max(-3, Math.min(3, fling)));
    }
  };

  // ---------- click ----------
  const onCardClick = (e: React.MouseEvent, i: number, href: string) => {
    const s = st.current;
    if (e.metaKey || e.ctrlKey || e.shiftKey) return; // let the browser open a new tab
    e.preventDefault();
    if (s.moved > 6) return; // it was a drag
    const rel = Math.round(wrap(i - s.current, n));
    if (rel !== 0) {
      goTo(Math.round(s.current) + rel);
      return;
    }
    if (s.reduce) return router.push(href);
    animate(s.progress, 1, {
      duration: 0.8,
      ease: power3InOut,
      onUpdate: (v) => (s.progress = v),
      onComplete: () => router.push(href),
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const s = st.current;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(Math.round(s.target) + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(Math.round(s.target) - 1);
    }
  };

  // keep keyboard focus on the active slide after arrow navigation
  useEffect(() => {
    if (rootRef.current?.contains(document.activeElement) && document.activeElement?.tagName === "A") {
      cardRefs.current[active]?.focus({ preventScroll: true });
    }
  }, [active]);

  const p = projects[active];
  const showCaption = !moving;

  return (
    <motion.section
      aria-roledescription="carousel"
      aria-label="Featured projects"
      className="relative h-svh w-full overflow-hidden"
      initial={false}
      animate={{ y: intro === "loading" ? "20vh" : "0vh" }}
      transition={intro === "loading" ? { duration: 0 } : { duration: 0.7, ease: "easeOut" }}
    >
      <div
        ref={rootRef}
        className="absolute inset-0 touch-pan-y select-none"
        data-cursor="drag"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        {projects.map((proj, i) => (
          <Link
            key={proj.key}
            href={proj.href}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            draggable={false}
            onClick={(e) => onCardClick(e, i, proj.href)}
            aria-label={`${i + 1} of ${n} — ${proj.title}, ${proj.location}. View project`}
            data-cursor={i === active ? "view" : "drag"}
            className="absolute left-0 top-0 block overflow-hidden bg-line will-change-transform transition-[border-radius] duration-500 md:data-[active=true]:hover:rounded-[50%_50%_0_50%] md:data-[active=true]:focus-visible:rounded-[50%_50%_0_50%]"
            style={
              i === 0
                ? { width: "100vw", height: "100svh" }
                : { visibility: "hidden", width: 0, height: 0 }
            }
          >
            <Image
              src={proj.cover}
              alt={proj.alt}
              fill
              draggable={false}
              fetchPriority={i === 0 ? "high" : "auto"}
              loading={i === 0 ? "eager" : Math.min(i, n - i) <= 2 ? "eager" : "lazy"}
              sizes="(max-width: 767px) 80vw, 45vw"
              quality={75}
              className="pointer-events-none object-cover"
            />
          </Link>
        ))}
      </div>

      {/* caption */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[4.6rem] text-center max-lg:bottom-[7.2rem]"
        aria-live="polite"
      >
        <p
          className="text-[0.56rem] text-accent transition-opacity duration-500"
          style={{ opacity: showCaption ? 1 : 0, transitionDelay: showCaption ? "0ms" : "0ms" }}
        >
          [{String(active + 1).padStart(2, "0")}]
        </p>
        <Link
          href={p.href}
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-auto block"
        >
          <h2
            className="font-display text-base font-bold leading-[1.4] transition-opacity duration-500"
            style={{ opacity: showCaption ? 1 : 0, transitionDelay: showCaption ? "100ms" : "0ms" }}
          >
            {p.title}
          </h2>
          <h3
            className="font-display text-[0.75rem] uppercase leading-[1.4] transition-opacity duration-500"
            style={{ opacity: showCaption ? 1 : 0, transitionDelay: showCaption ? "200ms" : "0ms" }}
          >
            {p.location}
          </h3>
        </Link>
      </div>

      {/* drag hint */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[4.8rem] right-[3.68rem] flex items-center gap-2 text-micro uppercase text-ink/80 transition-opacity duration-700 max-lg:hidden"
        style={{ opacity: interacted ? 0 : 1 }}
      >
        <svg viewBox="0 0 40 16" className="h-3 w-8" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M6 3 1 8l5 5M34 3l5 5-5 5M1 8h38" />
        </svg>
        Drag
      </div>

      {/* keyboard / screen-reader controls */}
      <div className="absolute left-1/2 top-24 flex -translate-x-1/2 gap-2">
        <button
          type="button"
          className="sr-only rounded-full bg-ink px-4 py-2 text-micro uppercase text-paper focus:not-sr-only"
          onClick={() => goTo(Math.round(st.current.target) - 1)}
        >
          Previous project
        </button>
        <button
          type="button"
          className="sr-only rounded-full bg-ink px-4 py-2 text-micro uppercase text-paper focus:not-sr-only"
          onClick={() => goTo(Math.round(st.current.target) + 1)}
        >
          Next project
        </button>
      </div>
    </motion.section>
  );
}
