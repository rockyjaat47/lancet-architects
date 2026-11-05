"use client";

// Custom next/image loader for static hosting: serves the pre-generated WebP variant
// (scripts/resize-images.mjs) closest to the requested width, prefixed with the base path.
import manifest from "./image-manifest.json";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const variants = manifest as Record<string, number[]>;

export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  const widths = variants[src];
  if (!widths?.length) return src.startsWith("/") ? `${BASE}${src}` : src;
  const w = widths.find((x) => x >= width) ?? widths[widths.length - 1];
  const name = src.slice("/images/".length).replace(/\.[^.]+$/, "").replace(/\//g, "__");
  return `${BASE}/images/_w/${name}-${w}.webp`;
}
