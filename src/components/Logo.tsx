import { asset } from "@/lib/base-path";
import Image from "next/image";
import { site } from "@/lib/content";

// Lancet logo (958×248 ratio, served as a pre-sized 640px PNG). Swap the file set in content/site.json › logo.
const RATIO = 958 / 248;

/** Brand wordmark. Size it with a height class, e.g. "h-7". */
export function Wordmark({ className = "h-7", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src={asset(site.logo)}
      alt={site.name}
      width={Math.round(248 * RATIO)}
      height={248}
      priority={priority}
      unoptimized
      className={`w-auto select-none ${className}`}
      draggable={false}
    />
  );
}
