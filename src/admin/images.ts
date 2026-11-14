import { b64 } from "./crypto";

export type ProcessedImage = { base64: string; previewUrl: string; width: number; height: number; kb: number };

/** Resize a photo in the browser (longest side ≤ maxSide) and encode it as WebP. */
export async function processImage(file: File, maxSide = 2400, quality = 0.84): Promise<ProcessedImage> {
  if (!file.type.startsWith("image/")) throw new Error(`"${file.name}" is not an image.`);
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(`"${file.name}" could not be read. Use JPG, PNG or WebP (iPhone HEIC photos: export as JPG first).`);
  }
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("Could not encode the image."))), "image/webp", quality));
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return { base64: b64.encode(bytes), previewUrl: URL.createObjectURL(blob), width, height, kb: Math.round(bytes.length / 1024) };
}

export const slugify = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

/** Unique repo path for an upload: public/images/uploads/<folder>/<name>-<time>.webp → site path /images/uploads/... */
export function uploadPath(folder: string, name: string) {
  const stamp = Date.now().toString(36);
  return `/images/uploads/${folder}/${slugify(name.replace(/\.[^.]+$/, "")) || "image"}-${stamp}.webp`;
}
