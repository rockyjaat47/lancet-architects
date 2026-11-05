"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryItem } from "@/lib/content";
import { Reveal } from "./Reveal";

/** Masonry gallery with an accessible lightbox (Esc to close, ← → to browse). */
export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(null);
    lastFocus.current?.focus();
  }, []);

  useEffect(() => {
    if (open === null) return;
    closeRef.current?.focus();
    document.documentElement.classList.add("menu-open");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % items.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + items.length) % items.length));
      if (e.key === "Tab" && dialogRef.current) {
        // keep focus inside the lightbox
        const els = [...dialogRef.current.querySelectorAll<HTMLElement>("button, a")];
        const i = els.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        els[(i + (e.shiftKey ? -1 : 1) + els.length) % els.length]?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("menu-open");
    };
  }, [open, items.length, close]);

  const current = open === null ? null : items[open];

  return (
    <>
      <ul className="columns-3 gap-4 max-lg:columns-2 max-md:columns-1 [&>li]:mb-4">
        {items.map((g, i) => (
          <Reveal as="li" key={g.src} delay={(i % 3) * 0.08} y={30} className="break-inside-avoid">
            <button
              type="button"
              onClick={(e) => {
                lastFocus.current = e.currentTarget;
                setOpen(i);
              }}
              className="group relative block w-full overflow-hidden rounded-card bg-line text-left"
              data-cursor="view"
              aria-label={`Enlarge: ${g.alt}`}
            >
              <Image
                src={g.src}
                alt={g.alt}
                width={1920}
                height={1080}
                sizes="(max-width: 767px) 88vw, (max-width: 1023px) 44vw, 30vw"
                className="h-auto w-full transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
              />
            </button>
          </Reveal>
        ))}
      </ul>

      <AnimatePresence>
        {current && (
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={current.alt}
            className="fixed inset-0 z-[1500] flex flex-col bg-black-2/95 text-paper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && close()}
          >
            <div className="flex items-center justify-between px-[3.68rem] py-6 text-micro uppercase max-lg:px-[6vw]">
              <span>
                {open! + 1} / {items.length}
              </span>
              <button ref={closeRef} type="button" onClick={close} className="min-h-[24px] underline underline-offset-4">
                Close
              </button>
            </div>
            <div className="relative flex-1" onClick={(e) => e.target === e.currentTarget && close()}>
              <Image key={current.src} src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain p-6" />
            </div>
            <div className="flex items-center justify-between gap-4 px-[3.68rem] py-6 text-micro uppercase max-lg:px-[6vw]">
              <button type="button" className="min-h-[24px]" onClick={() => setOpen((open! - 1 + items.length) % items.length)}>
                ← Previous
              </button>
              <p className="text-center normal-case opacity-80">
                {current.alt}
                {current.project && (
                  <>
                    {" — "}
                    <Link href={`/projects/${current.project}`} className="underline underline-offset-2" onClick={() => setOpen(null)}>
                      view project
                    </Link>
                  </>
                )}
              </p>
              <button type="button" className="min-h-[24px]" onClick={() => setOpen((open! + 1) % items.length)}>
                Next →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
