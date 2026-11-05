"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/*
 * Custom cursor, as on the reference (desktop only: fine pointer and ≥ 992px):
 * - always-visible brand-colour dot that follows the pointer
 * - links / buttons: dot shrinks into a soft ring
 * - data-cursor="view": large disc with "View project"; data-cursor="drag": "‹ drag ›"
 * - hidden over text fields (native caret cursor is kept there) and when the pointer leaves the window
 */
type Mode = "default" | "link" | "view" | "drag" | "text";

const QUERY = "(pointer: fine) and (min-width: 992px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getSnapshot = () => window.matchMedia(QUERY).matches;

const modeFor = (target: EventTarget | null): Mode => {
  const el = target as HTMLElement | null;
  if (!el?.closest) return "default";
  if (el.closest("input, textarea, select, [contenteditable=true]")) return "text";
  const tagged = el.closest<HTMLElement>("[data-cursor]");
  const link = el.closest<HTMLElement>("a, button, [role=button], label, summary");
  if (link && (!tagged || (tagged !== link && tagged.contains(link)))) return "link"; // plain link inside a tagged area
  return tagged ? (tagged.dataset.cursor as Mode) : "default";
};

export default function Cursor() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("default");
  const [visible, setVisible] = useState(false);
  const last = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("has-cursor", enabled);
    if (!enabled) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let { x, y } = last.current;
    let cx = x, cy = y, raf = 0;

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      last.current = { x, y };
      setVisible(true);
      setMode(modeFor(e.target));
    };
    const leave = () => setVisible(false);
    const loop = () => {
      const k = reduce ? 1 : 0.25;
      cx += (x - cx) * k;
      cy += (y - cy) * k;
      if (ref.current) ref.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", move, { passive: true });
    root.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", move);
      root.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
      root.classList.remove("has-cursor");
    };
  }, [enabled]);

  // After a page change the element under the pointer is new: re-evaluate the mode.
  useEffect(() => {
    if (!enabled) return;
    const t = setTimeout(() => {
      const { x, y } = last.current;
      setMode(modeFor(document.elementFromPoint(x, y)));
    }, 600);
    return () => clearTimeout(t);
  }, [pathname, enabled]);

  if (!enabled) return null;

  const big = mode === "view" || mode === "drag";
  const size = mode === "view" ? "6.5rem" : mode === "drag" ? "4.6rem" : "1.74rem";
  const scale = !visible || mode === "text" ? 0 : mode === "link" ? 0.9 : 1;
  const background =
    mode === "link"
      ? "radial-gradient(circle, var(--color-accent) 38%, color-mix(in srgb, var(--color-accent) 22%, transparent) 46%, transparent 70%)"
      : "var(--color-accent)";

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[2000]">
      <div
        className="flex items-center justify-center rounded-full text-center font-sans text-[0.7rem] uppercase leading-tight text-paper transition-[width,height,transform,background] duration-300 ease-in-out"
        style={{
          width: size,
          height: size,
          background,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        {big && mode === "view" && <span className="px-2">View project</span>}
        {big && mode === "drag" && (
          <span className="flex items-center gap-1">
            <span>‹</span>drag<span>›</span>
          </span>
        )}
      </div>
    </div>
  );
}
