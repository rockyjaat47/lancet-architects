/** Sub-path the site is served from (e.g. "/lancet-architects" on GitHub Pages; empty on a custom domain). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a /public asset path with the base path (needed for plain <img>, unoptimized images, manifest…). */
export const asset = (src: string) => (src.startsWith("/") && !src.startsWith(BASE_PATH + "/") ? `${BASE_PATH}${src}` : src);
