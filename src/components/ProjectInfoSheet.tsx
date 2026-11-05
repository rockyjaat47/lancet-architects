"use client";

import Link from "next/link";
import { useEffect, useId, useState, useSyncExternalStore } from "react";

const QUERY = "(max-width: 1023px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * Project info panel.
 * Desktop: sticky right column (children rendered as-is).
 * Mobile (reference behaviour): hidden below the screen; a floating teardrop "Info" button
 * slides it up as a sheet (1.5s-like ease, see REFERENCE_NOTES.md › /projets/[slug]).
 */
export default function ProjectInfoSheet({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const mobile = useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
  const [open, setOpen] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const id = useId();

  // hide the floating controls once the footer scrolls into view
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const io = new IntersectionObserver(([e]) => setFooterVisible(e.isIntersecting));
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!mobile || !open) return;
    document.documentElement.classList.add("menu-open");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.classList.remove("menu-open");
      document.removeEventListener("keydown", onKey);
    };
  }, [mobile, open]);

  return (
    <>
      <aside
        id={id}
        aria-label="Project information"
        inert={mobile && !open}
        className={`${className} max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-[950] max-lg:max-h-[88svh] max-lg:overflow-y-auto max-lg:overscroll-contain max-lg:rounded-t-section max-lg:shadow-[0_-10px_40px_rgba(0,0,0,0.15)] max-lg:transition-transform max-lg:duration-[900ms] max-lg:ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "max-lg:translate-y-0" : "max-lg:translate-y-[105%]"
        }`}
      >
        {children}
      </aside>

      {/* mobile backdrop */}
      {mobile && open && (
        <button type="button" aria-label="Close project information" className="fixed inset-0 z-[940] bg-black/30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* mobile floating controls */}
      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-[960] flex items-end justify-between px-[6vw] pb-5 transition-opacity duration-300 lg:hidden ${
          footerVisible && !open ? "invisible opacity-0" : ""
        }`}
      >
        <Link
          href="/projects"
          className={`pointer-events-auto flex min-h-[44px] items-center gap-3 text-sm uppercase text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)] transition-opacity ${open ? "opacity-0" : ""}`}
          tabIndex={open ? -1 : 0}
        >
          <span aria-hidden="true">←</span> All projects
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
          className="pointer-events-auto flex h-[4.9rem] w-[4.9rem] items-center justify-center rounded-[50%_50%_0_50%] bg-shape font-display text-lg text-ink shadow-lg transition-colors active:bg-ink active:text-shape"
        >
          {open ? "Close" : "Info"}
        </button>
      </div>
    </>
  );
}
