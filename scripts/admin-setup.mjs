#!/usr/bin/env node
// Creates / replaces the admin login:  npm run admin:setup
//
// Asks for the admin email, a password and a GitHub fine-grained access token (repository
// "Contents: Read and write" + "Actions: Read"), then writes public/admin-auth.json with the token
// ENCRYPTED by the email + password (PBKDF2-SHA256 600k → AES-256-GCM, same format as src/admin/crypto.ts).
// Nothing secret is printed or stored in plain text.
import fs from "node:fs";
import readline from "node:readline";
import { execSync } from "node:child_process";

const ITERATIONS = 600_000;
const OUT = "public/admin-auth.json";
const DEFAULT_EMAIL = "admin@730stuidos.com";

function ask(question, { hidden = false, def = "" } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => {
        if (s.startsWith(question)) rl.output.write(s);
        else if (s.includes("\n") || s.includes("\r")) rl.output.write("\n");
        else rl.output.write("•".repeat(s.length));
      };
    }
    rl.question(question + (def ? `(${def}) ` : ""), (a) => {
      rl.close();
      resolve(a.trim() || def);
    });
  });
}

function repoFromGit() {
  const url = execSync("git remote get-url origin").toString().trim();
  const m = url.match(/github\.com[:/]([^/]+)\/(.+?)(\.git)?$/);
  if (!m) throw new Error(`Cannot read the GitHub repository from: ${url}`);
  return { owner: m[1], name: m[2], branch: "main" };
}

const enc = new TextEncoder();
const b64 = (u8) => Buffer.from(u8).toString("base64");

async function encrypt(email, password, token, repo) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const material = await crypto.subtle.importKey("raw", enc.encode(`${email.trim().toLowerCase()}\n${password}`), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify({ token }))));
  return { v: 1, kdf: "PBKDF2-SHA256", iterations: ITERATIONS, salt: b64(salt), iv: b64(iv), data: b64(data), repo, updated: new Date().toISOString() };
}

const repo = repoFromGit();
console.log(`\nLancet website — admin login setup  (repository ${repo.owner}/${repo.name})\n`);

const email = await ask("Admin email: ", { def: DEFAULT_EMAIL });
let password;
for (;;) {
  password = await ask("Admin password (hidden): ", { hidden: true });
  if (password.length < 8) {
    console.log("  Use at least 8 characters.");
    continue;
  }
  const again = await ask("Repeat password (hidden): ", { hidden: true });
  if (again === password) break;
  console.log("  The passwords don't match — try again.");
}
const token = await ask("GitHub access token (hidden, starts with github_pat_): ", { hidden: true });

process.stdout.write("Checking the token with GitHub… ");
const res = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}`, {
  headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
});
if (!res.ok) {
  console.log(`failed (${res.status}). Check that the token is correct and has access to ${repo.owner}/${repo.name}.`);
  process.exit(1);
}
const info = await res.json();
if (!info.permissions?.push) {
  console.log('failed: the token cannot write to the repository. Give it "Contents: Read and write".');
  process.exit(1);
}
const runs = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/actions/runs?per_page=1`, {
  headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
});
console.log("OK" + (runs.ok ? "" : '  (note: add "Actions: Read" to see publish progress in the admin)'));

const file = await encrypt(email, password, token, repo);
fs.writeFileSync(OUT, JSON.stringify(file, null, 2) + "\n");
console.log(`\nSaved ${OUT} (encrypted — safe to publish).`);

const publish = (await ask("Publish it now (git commit + push)? ", { def: "Y" })).toLowerCase();
if (publish.startsWith("y")) {
  execSync(`git add ${OUT} && git commit -m "Admin: set login for ${email.trim().toLowerCase()}" && git push`, { stdio: "inherit" });
  console.log("\nDone. The admin login works at /admin/ in about 2–3 minutes (after the site rebuilds).\n");
} else {
  console.log("\nNot published. Commit and push public/admin-auth.json when ready.\n");
}
