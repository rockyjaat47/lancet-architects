import { asset } from "@/lib/base-path";
import Image from "next/image";
import { site } from "@/lib/content";

// Lancet wordmark (958×248 ratio, served as a pre-sized 640px PNG) and the triangle emblem (square, transparent).
// Swap the files set in content/site.json › logo / emblem / emblemSmall (emblem: regenerate with `node scripts/make-emblem.mjs`).
const RATIO = 958 / 248;

/** Brand wordmark. Size it with a height class, e.g. "h-7". */
export function Wordmark({ className = "h-7", priority = false, decorative = false }: { className?: string; priority?: boolean; decorative?: boolean }) {
  return (
    <Image
      src={asset(site.logo)}
      alt={decorative ? "" : site.name}
      width={Math.round(248 * RATIO)}
      height={248}
      priority={priority}
      unoptimized
      className={`w-auto select-none ${className}`}
      draggable={false}
    />
  );
}

/** Triangle emblem. Size it with a height class; `large` serves the 512px file. */
export function Emblem({ className = "h-8", priority = false, large = false }: { className?: string; priority?: boolean; large?: boolean }) {
  const s = large ? 512 : 160;
  return (
    <Image
      src={asset(large ? site.emblem : site.emblemSmall)}
      alt=""
      width={s}
      height={s}
      priority={priority}
      unoptimized
      className={`aspect-square w-auto select-none ${className}`}
      draggable={false}
    />
  );
}

/** Emblem + wordmark lockup (the brand logo used across the site). `size` is the emblem height class. */
export function BrandLogo({ size = "h-10", wordmark = "h-6", priority = false, className = "" }: { size?: string; wordmark?: string; priority?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[0.55em] ${className}`}>
      <Emblem className={size} priority={priority} />
      <Wordmark className={wordmark} priority={priority} />
    </span>
  );
}
