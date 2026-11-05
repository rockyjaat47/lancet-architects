"use client";

import { MotionConfig } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

type UIState = {
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  /**
   * pending: no loader on this page (inner pages) or not decided yet — treat as "not loading"
   * loading: first-visit loader is playing (home only)
   * done: loader finished or skipped — page intro animations may run
   */
  intro: "pending" | "loading" | "done";
  setIntro: (v: "loading" | "done") => void;
};

const UIContext = createContext<UIState | null>(null);

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside <Providers>");
  return ctx;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [intro, setIntroState] = useState<UIState["intro"]>("pending");
  const setIntro = useCallback((v: "loading" | "done") => setIntroState(v), []);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", menuOpen);
  }, [menuOpen]);

  return (
    <MotionConfig reducedMotion="user">
      <UIContext.Provider value={{ menuOpen, setMenuOpen, intro, setIntro }}>{children}</UIContext.Provider>
    </MotionConfig>
  );
}
