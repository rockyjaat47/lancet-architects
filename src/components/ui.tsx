import Link from "next/link";
import { consultationHref } from "@/lib/contact";

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

/** Solid brand-red call to action → contact form, pre-selected service. */
export function ConsultButton({
  service,
  children = "Get a free consultation",
  className = "",
  dark = false,
}: {
  service?: string;
  children?: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <Link
      href={consultationHref(service)}
      prefetch={false}
      className={`group inline-flex min-h-[44px] items-center gap-3 rounded-full px-6 text-micro font-bold uppercase tracking-[0.04em] transition-colors duration-300 ${
        dark ? "bg-paper text-ink hover:bg-accent hover:text-paper" : "bg-accent text-paper hover:bg-ink"
      } ${className}`}
    >
      {children}
      <ArrowRight className="h-[1.1em] w-[1.1em] transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

export const WhatsAppIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
  </svg>
);
