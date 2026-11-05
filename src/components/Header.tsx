"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { useUI } from "./Providers";
import MenuOverlay from "./MenuOverlay";
import { BrandLogo } from "./Logo";
import { ConsultButton } from "./ui";
import { site } from "@/lib/content";
import { power3InOut } from "@/lib/motion";

export default function Header() {
  const { menuOpen, setMenuOpen, intro } = useUI();
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  // Project pages: the header sits over a full-bleed photo on the left.
  const overPhoto = /^\/projects\/[^/]+\/?$/.test(pathname);

  // Close the menu on route change
  useEffect(() => setMenuOpen(false), [pathname, setMenuOpen]);

  return (
    <>
      <motion.header
        className={`fixed inset-x-0 top-0 z-[1000] text-ink transition-colors duration-500 ${
          overPhoto && !menuOpen ? "max-lg:bg-gradient-to-b max-lg:from-black/45 max-lg:to-transparent max-lg:text-white" : ""
        }`}
        initial={false}
        animate={{ y: intro === "loading" ? "-100%" : "0%" }}
        transition={intro === "loading" ? { duration: 0 } : { duration: 1, ease: power3InOut, delay: 0.2 }}
      >
        <div className="mx-auto flex max-w-[105rem] items-center justify-between px-[3.68rem] py-[2.4rem] max-lg:px-[6vw] max-lg:py-6">
          <Link href="/" className="relative z-10 block" aria-label={`${site.name} — home`}>
            <BrandLogo size="h-[3.1rem] max-lg:h-10" wordmark="h-[2.2rem] max-lg:h-7" />
          </Link>

          <p className={`pointer-events-none absolute inset-x-0 text-center font-sans text-xs uppercase max-lg:hidden ${overPhoto && !menuOpen ? "invisible" : ""}`}>
            {site.headerTagline[0]}{" "}
            <br />
            {site.headerTagline[1]}
          </p>

          <div className="relative z-10 flex items-center gap-8">
          <ConsultButton className={`max-lg:hidden ${menuOpen ? "pointer-events-none opacity-0" : ""}`} />
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            className="relative z-10 flex min-h-[44px] items-center gap-[0.9rem] font-display text-[1.25rem] font-bold leading-none max-lg:gap-3 max-lg:text-[0.9rem]"
          >
            <span>{menuOpen ? "close" : "menu"}</span>
            <span aria-hidden="true" className="relative flex h-[0.48em] w-[1.11em] flex-col justify-between">
              <span
                className="block h-[0.11em] w-full bg-current transition-transform duration-500"
                style={{ transform: menuOpen ? "translateY(0.185em) rotate(-45deg)" : "none" }}
              />
              <span
                className="block h-[0.11em] w-full bg-current transition-transform duration-500"
                style={{ transform: menuOpen ? "translateY(-0.185em) rotate(45deg)" : "none" }}
              />
            </span>
          </button>
          </div>
        </div>
      </motion.header>
      <MenuOverlay toggleRef={toggleRef} />
    </>
  );
}
