import Link from "next/link";

/** Outline pill with dot, e.g. "● DÉCOUVRIR LES PROJETS" */
export function PillLink({ href, children, dark = false }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 rounded-full border px-4 py-[0.45rem] text-micro uppercase tracking-[0.02em] transition-colors duration-300 ${
        dark ? "border-paper/60 hover:bg-paper hover:text-ink" : "border-ink hover:bg-ink hover:text-paper"
      }`}
    >
      <span aria-hidden="true" className="h-[0.45rem] w-[0.45rem] rounded-full bg-current" />
      {children}
    </Link>
  );
}

export function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-micro uppercase tracking-[0.02em] ${className}`}>{children}</p>;
}

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[105rem] px-[3.68rem] max-lg:px-[6vw] ${className}`}>{children}</div>;
}

export const ArrowUpRight = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M4 12 12 4M5.5 4H12v6.5" />
  </svg>
);

export const ArrowRight = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M2 8h11M9 4l4 4-4 4" />
  </svg>
);
