"use client";

import { motion } from "motion/react";
import { useEffect } from "react";

// Skip the fade on the very first (server-rendered) page so LCP isn't delayed by hydration.
let firstRender = true;

/** Page enter transition (reference: Barba cross-fade 0.5s). */
export default function Template({ children }: { children: React.ReactNode }) {
  const initial = firstRender ? false : { opacity: 0 };
  useEffect(() => {
    firstRender = false;
  }, []);
  return (
    <motion.div initial={initial} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
