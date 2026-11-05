"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { RefObject, useEffect, useRef, useState } from "react";
import { useUI } from "./Providers";
import { site } from "@/lib/content";
import { bounceOut, power2In } from "@/lib/motion";

type Shape = "drop" | "house" | "text";
type Item = {
  label: string;
  href: string;
  shape: Shape;
  external?: boolean;
  /** desktop: offset from viewport centre in rem; mobile: in px (390px reference) */
  d: { x: number; y: number; r: number };
  m: { x: number; y: number; r: number };
  dim?: boolean;
};

// Layout measured on the reference at 1440×900 and 390×844 (see REFERENCE_NOTES.md › Menu overlay)
const ITEMS: Item[] = [
  { label: "Gallery", href: "/gallery", shape: "text", dim: true, d: { x: -3, y: -24, r: 0 }, m: { x: 70, y: -292, r: -4 } },
  { label: "Blog", href: "/blog", shape: "text", d: { x: 15, y: -17, r: 0 }, m: { x: -110, y: -205, r: 3 } },
  { label: "WhatsApp", href: site.socials.whatsapp, shape: "text", external: true, d: { x: 12.5, y: -0.5, r: -12 }, m: { x: 105, y: 48, r: -6 } },
  { label: "About", href: "/about", shape: "drop", d: { x: -14.8, y: -10, r: 0 }, m: { x: -92, y: -72, r: -12 } },
  { label: "Projects", href: "/projects", shape: "drop", d: { x: -20.2, y: 9.8, r: -42 }, m: { x: -28, y: 48, r: 8 } },
  { label: "Services", href: "/services", shape: "house", d: { x: 3, y: 10.2, r: 0 }, m: { x: 66, y: 155, r: 0 } },
  { label: "Contact", href: "/contact", shape: "drop", d: { x: 20.2, y: 7.8, r: 18 }, m: { x: -90, y: 120, r: -25 } },
];

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return m;
}

export default function MenuOverlay({ toggleRef }: { toggleRef: RefObject<HTMLButtonElement | null> }) {
  const { menuOpen, setMenuOpen } = useUI();
  const isMobile = useIsMobile();
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape to close + focus trap (overlay links + the header toggle)
  useEffect(() => {
    if (!menuOpen) return;
    const toggle = toggleRef.current;
    const t = setTimeout(() => panelRef.current?.querySelector<HTMLElement>("[data-first]")?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        toggle?.focus();
      }
      if (e.key === "Tab" && panelRef.current) {
        const els = [toggle, ...panelRef.current.querySelectorAll<HTMLElement>("a")].filter(Boolean) as HTMLElement[];
        const i = els.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        const next = e.shiftKey ? (i <= 0 ? els.length - 1 : i - 1) : (i + 1) % els.length;
        els[next].focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, setMenuOpen, toggleRef]);

  // Keyboard order: main links first
  const order = ["About", "Projects", "Services", "Contact", "Blog", "WhatsApp", "Gallery"];

  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          id="site-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
          className="fixed inset-0 z-[900] overflow-hidden bg-sage"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.5 } }}
          exit={{ opacity: 0, transition: { duration: 0.4, delay: 0.25 } }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setMenuOpen(false);
          }}
        >
          <nav aria-label="Main navigation" className="pointer-events-none absolute inset-0">
            {[...ITEMS].sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label)).map((it) => {
              const i = ITEMS.indexOf(it);
              const p = isMobile ? it.m : it.d;
              const unit = isMobile ? "px" : "rem";
              return <MenuItem key={it.label} item={it} index={i} p={p} unit={unit} first={it.label === order[0]} />;
            })}
          </nav>

          <motion.ul
            className="absolute inset-x-0 bottom-[3.6rem] flex justify-center gap-8 text-[0.83rem] uppercase tracking-[0.02em] max-md:bottom-24 max-md:gap-3 max-md:text-[0.6rem]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.3, duration: 0.5 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <li>
              <Link href="/privacy-policy" className="hover:underline">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:underline">
                Terms & conditions
              </Link>
            </li>
          </motion.ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MenuLink({ item, first }: { item: Item; first: boolean }) {
  const common = {
    "data-first": first ? "" : undefined,
    className: "pointer-events-auto group block",
    ...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
  };

  if (item.shape === "text") {
    return (
      <Link
        href={item.href}
        {...common}
        className={`${common.className} whitespace-nowrap font-display text-[4.4rem] leading-none transition-colors duration-300 hover:text-ink max-md:text-[2.2rem] ${
          item.dim ? "text-shape/50" : "text-shape"
        }`}
      >
        {item.label}
        {item.external && <span className="sr-only"> (opens in a new tab)</span>}
      </Link>
    );
  }

  const shapeClass =
    item.shape === "drop"
      ? "rounded-[50%_50%_0_50%]"
      : "[clip-path:polygon(0_33%,33%_0,100%_67%,67%_100%,0_100%)]";

  return (
    <Link
      href={item.href}
      {...common}
      className={`${common.className} relative flex h-[20rem] w-[20rem] items-center justify-center bg-shape transition-colors duration-300 hover:bg-ink focus-visible:bg-ink max-md:h-[9.5rem] max-md:w-[9.5rem] ${shapeClass}`}
    >
      <span
        className="font-display text-[3.13rem] leading-none text-ink transition-colors duration-300 group-hover:text-shape group-focus-visible:text-shape max-md:text-[1.6rem]"
        style={{ transform: item.shape === "house" ? "rotate(45deg) translate(6%, 0)" : undefined }}
      >
        {item.label}
      </span>
    </Link>
  );
}

/** Random "drop from the sky" start, regenerated each time the menu opens (items remount). */
function randomStart() {
  return {
    x: Math.floor(Math.random() * -700) + 250,
    y: -(Math.floor(Math.random() * window.innerHeight / 1.5) + 50),
    r: (Math.random() - 0.5) * 40,
  };
}

function MenuItem({ item, index: i, p, unit, first }: { item: Item; index: number; p: Item["d"]; unit: string; first: boolean }) {
  const [s] = useState(randomStart);
  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{ zIndex: item.shape === "text" ? 1 : 2 }}
      initial={{ x: s.x, y: s.y, rotate: s.r, opacity: 0 }}
      animate={{
        x: 0,
        y: 0,
        rotate: 0,
        opacity: 1,
        transition: {
          default: { duration: 1.5, ease: bounceOut, delay: 0.1 + i * 0.1 },
          opacity: { duration: 0.3, delay: 0.2 + i * 0.1 },
        },
      }}
      exit={{ x: s.x, y: s.y, opacity: 0, transition: { duration: 0.5, ease: power2In } }}
    >
      <div style={{ transform: `translate(calc(-50% + ${p.x}${unit}), calc(-50% + ${p.y}${unit})) rotate(${p.r}deg)` }}>
        <MenuLink item={item} first={first} />
      </div>
    </motion.div>
  );
}
