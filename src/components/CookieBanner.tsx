"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useUI } from "./Providers";

const KEY = "cookie-consent";

export function getConsent(): "accepted" | "refused" | null {
  try {
    return (localStorage.getItem(KEY) as "accepted" | "refused" | null) ?? null;
  } catch {
    return null;
  }
}

export default function CookieBanner() {
  const { intro } = useUI();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (intro === "loading") return;
    if (getConsent()) return;
    const t = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(t);
  }, [intro]);

  const choose = (v: "accepted" | "refused") => {
    try {
      localStorage.setItem(KEY, v);
    } catch {}
    window.dispatchEvent(new CustomEvent("cookie-consent", { detail: v }));
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.section
          role="region"
          aria-label="Cookie preferences"
          className="fixed bottom-6 left-6 z-[800] w-[24rem] max-w-[calc(100vw-3rem)] rounded-card bg-ink p-6 text-paper shadow-xl max-md:bottom-3 max-md:left-3 max-md:max-w-[calc(100vw-1.5rem)] max-md:p-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-sm leading-relaxed max-md:text-[0.8rem]">
            We use analytics cookies to improve this website. You can accept or decline them.{" "}
            <Link href="/privacy-policy" className="underline underline-offset-2">
              Read our privacy policy
            </Link>
          </p>
          <div className="mt-5 flex gap-3 max-md:mt-3">
            <button
              type="button"
              onClick={() => choose("accepted")}
              className="rounded-full bg-paper px-5 py-2 text-micro uppercase text-ink transition-opacity hover:opacity-80"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => choose("refused")}
              className="rounded-full border border-paper/40 px-5 py-2 text-micro uppercase transition-colors hover:border-paper"
            >
              Decline
            </button>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
