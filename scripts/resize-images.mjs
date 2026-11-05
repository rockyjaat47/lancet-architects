// Pre-generates responsive WebP variants for static hosting (GitHub Pages has no image optimizer).
// Run after adding/replacing photos in public/images:  npm run images
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const ROOT = "public/images";
const OUT = "public/images/_w";
const WIDTHS = [480, 828, 1280, 1920];
const manifest = {};

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return p === OUT ? [] : walk(p);
    return /\.(jpe?g|png|webp)$/i.test(d.name) && !/logo/i.test(d.name) ? [p] : [];
  });

for (const file of walk(ROOT)) {
  const src = "/" + path.relative("public", file).split(path.sep).join("/");
  const { width } = await sharp(file).metadata();
  const base = src.slice("/images/".length).replace(/\.[^.]+$/, "").replace(/\//g, "__");
  const widths = WIDTHS.filter((w) => w < width).concat(width > WIDTHS.at(-1) ? [] : [width]);
  manifest[src] = [];
  for (const w of [...new Set(widths)]) {
    await sharp(file).resize({ width: w }).webp({ quality: 72 }).toFile(path.join(OUT, `${base}-${w}.webp`));
    manifest[src].push(w);
  }
  console.log(src, manifest[src].join(","));
}
fs.writeFileSync("src/lib/image-manifest.json", JSON.stringify(manifest, null, 1));
