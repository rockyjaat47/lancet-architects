"use client";

import { motion } from "motion/react";
import { expoOut } from "@/lib/motion";

type Tag = "div" | "p" | "h1" | "h2" | "h3" | "li" | "section" | "span";

/** Fade-up on scroll (reference: y 50→0, opacity 0→1, 1.8s expo.out, triggered at 80% viewport). */
export function Reveal({
  as = "div",
  delay = 0,
  y = 50,
  className,
  children,
}: {
  as?: Tag;
  delay?: number;
  y?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -20% 0px" }}
      transition={{ duration: 1.8, ease: expoOut, delay }}
    >
      {children}
    </M>
  );
}

/** Word-by-word rise (reference ".tricks" split text). Text remains a single string for SEO/screen readers. */
export function SplitWords({
  text,
  as = "h2",
  className,
  delay = 0,
  id,
}: {
  text: string;
  as?: Tag;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const M = motion[as];
  const words = text.split(" ");
  return (
    <M
      id={id}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ staggerChildren: 0.035, delayChildren: delay }}
    >
      <span className="sr-only">{text}</span>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.08em] align-top">
          <motion.span
            className="inline-block"
            variants={{ hidden: { y: "100%", opacity: 0 }, show: { y: 0, opacity: 1 } }}
            transition={{ duration: 1.2, ease: expoOut }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </M>
  );
}

/** Hairline that grows from 0 to 100% width. */
export function Divider({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <motion.hr
      className={`h-px origin-left border-0 ${dark ? "bg-paper/25" : "bg-line"} ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease: expoOut }}
    />
  );
}
