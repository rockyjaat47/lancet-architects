/*
 * Admin login without a server.
 *
 * public/admin-auth.json holds the GitHub access token ENCRYPTED with a key derived from the
 * admin email + password (PBKDF2-SHA256, 600k iterations → AES-256-GCM). The password itself is
 * stored nowhere: a wrong email or password simply fails to decrypt.
 * The same format is produced by scripts/admin-setup.mjs and by "Change password" in the admin.
 */

export type AuthFile = {
  v: 1;
  kdf: "PBKDF2-SHA256";
  iterations: number;
  salt: string; // base64
  iv: string; // base64
  data: string; // base64 AES-GCM ciphertext of JSON { token }
  repo: { owner: string; name: string; branch: string };
  updated: string;
};

export const ITERATIONS = 600_000;

export const b64 = {
  encode(bytes: Uint8Array) {
    let s = "";
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(s);
  },
  decode(str: string) {
    const bin = atob(str);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  },
};

const enc = new TextEncoder();

async function deriveKey(email: string, password: string, salt: Uint8Array, iterations: number) {
  const material = await crypto.subtle.importKey("raw", enc.encode(`${email.trim().toLowerCase()}\n${password}`), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptToken(email: string, password: string, token: string, repo: AuthFile["repo"]): Promise<AuthFile> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(email, password, salt, ITERATIONS);
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, enc.encode(JSON.stringify({ token }))));
  return { v: 1, kdf: "PBKDF2-SHA256", iterations: ITERATIONS, salt: b64.encode(salt), iv: b64.encode(iv), data: b64.encode(data), repo, updated: new Date().toISOString() };
}

/** Returns the token, or null when the email/password is wrong. */
export async function decryptToken(file: AuthFile, email: string, password: string): Promise<string | null> {
  try {
    const key = await deriveKey(email, password, b64.decode(file.salt), file.iterations);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64.decode(file.iv) as BufferSource }, key, b64.decode(file.data) as BufferSource);
    return (JSON.parse(new TextDecoder().decode(plain)) as { token: string }).token;
  } catch {
    return null;
  }
}
