// Builds the transparent site emblem from brand-src/emblem-original.png (white background removed).
// Red strokes → Lancet red; grey strokes/shadows → ink. Output: public/images/lancet/emblem.png (512px) + favicons.
import sharp from "sharp";
const src = "brand-src/emblem-original.png";
const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const out = Buffer.alloc(info.width * info.height * 4);
const RED = [208, 24, 31], INK = [54, 62, 58];
for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
  const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
  const redness = r - (g + b) / 2;
  let c, a;
  if (redness > 40) { c = RED; a = Math.min(1, redness / 140); }
  else { c = INK; a = Math.max(0, Math.min(1, (232 - (r + g + b) / 3) / 80)); }
  out.set([...c, Math.round(a * 255)], j);
}
const img = sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).trim({ threshold: 1 });
const buf = await img.png().toBuffer();
const sq = (s) => sharp(buf).resize(s, s, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } });
await sq(512).png().toFile("public/images/lancet/emblem.png");
await sq(160).png().toFile("public/images/lancet/emblem-160.png");
// favicons on white so they read on dark browser tabs too
const tile = async (s, pad) => sharp({ create: { width: s, height: s, channels: 4, background: "#ffffff" } })
  .composite([{ input: await sq(Math.round(s * (1 - pad * 2))).png().toBuffer(), gravity: "center" }]);
await (await tile(512, 0.1)).png().toFile("src/app/icon.png");
await (await tile(180, 0.12)).png().toFile("src/app/apple-icon.png");
await (await tile(512, 0.1)).png().toFile("public/icon-512.png");
console.log("emblem done");
