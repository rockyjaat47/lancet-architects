import { b64 } from "./crypto";

export type Repo = { owner: string; name: string; branch: string };
export type FileChange = { path: string; content?: string; base64?: string; delete?: boolean };
export type RunStatus = { status: string; conclusion: string | null; url: string; created: string; title: string } | null;

const API = "https://api.github.com";

export const utf8ToB64 = (s: string) => b64.encode(new TextEncoder().encode(s));
export const b64ToUtf8 = (s: string) => new TextDecoder().decode(b64.decode(s.replace(/\n/g, "")));

/** Minimal GitHub REST client used by the admin (contents + git data + actions APIs). */
export class GitHub {
  constructor(
    private token: string,
    public repo: Repo
  ) {}

  private async req<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${this.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
    if (!res.ok) {
      let msg = `${res.status} ${res.statusText}`;
      try {
        msg = `${res.status}: ${((await res.json()) as { message?: string }).message ?? msg}`;
      } catch {}
      throw new Error(msg);
    }
    return (res.status === 204 ? null : await res.json()) as T;
  }

  private get r() {
    return `/repos/${this.repo.owner}/${this.repo.name}`;
  }

  /** Checks the token can write to the repository. */
  async check() {
    const info = await this.req<{ permissions?: { push?: boolean }; full_name: string }>(this.r);
    if (!info.permissions?.push) throw new Error("This access token cannot write to the repository.");
    return info.full_name;
  }

  async readText(path: string): Promise<string | null> {
    try {
      const f = await this.req<{ content: string; encoding: string }>(`${this.r}/contents/${encodeURI(path)}?ref=${this.repo.branch}&t=${Date.now()}`);
      return b64ToUtf8(f.content);
    } catch (e) {
      if (String(e).startsWith("Error: 404")) return null;
      throw e;
    }
  }

  async readJson<T>(path: string): Promise<T> {
    const t = await this.readText(path);
    if (t == null) throw new Error(`Missing file ${path}`);
    return JSON.parse(t) as T;
  }

  /** One atomic commit with many files (text, binary or deletions). */
  async commit(changes: FileChange[], message: string) {
    const ref = await this.req<{ object: { sha: string } }>(`${this.r}/git/ref/heads/${this.repo.branch}`);
    const parent = await this.req<{ tree: { sha: string } }>(`${this.r}/git/commits/${ref.object.sha}`);
    const tree = [];
    for (const c of changes) {
      if (c.delete) {
        tree.push({ path: c.path, mode: "100644", type: "blob", sha: null });
        continue;
      }
      const blob = await this.req<{ sha: string }>(`${this.r}/git/blobs`, {
        method: "POST",
        body: JSON.stringify(c.base64 != null ? { content: c.base64, encoding: "base64" } : { content: c.content ?? "", encoding: "utf-8" }),
      });
      tree.push({ path: c.path, mode: "100644", type: "blob", sha: blob.sha });
    }
    const newTree = await this.req<{ sha: string }>(`${this.r}/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: parent.tree.sha, tree }) });
    const commit = await this.req<{ sha: string }>(`${this.r}/git/commits`, {
      method: "POST",
      body: JSON.stringify({ message, tree: newTree.sha, parents: [ref.object.sha] }),
    });
    await this.req(`${this.r}/git/refs/heads/${this.repo.branch}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha }) });
    return commit.sha;
  }

  /** Latest site build (GitHub Actions). Needs "Actions: read" on the token; returns null otherwise. */
  async latestRun(): Promise<RunStatus> {
    try {
      const r = await this.req<{ workflow_runs: { status: string; conclusion: string | null; html_url: string; created_at: string; display_title: string }[] }>(
        `${this.r}/actions/runs?branch=${this.repo.branch}&per_page=1`
      );
      const w = r.workflow_runs[0];
      return w ? { status: w.status, conclusion: w.conclusion, url: w.html_url, created: w.created_at, title: w.display_title } : null;
    } catch {
      return null;
    }
  }

  /** Public URL of a file in the repo (works right after a commit, before the site is rebuilt). */
  rawUrl(path: string) {
    return `https://raw.githubusercontent.com/${this.repo.owner}/${this.repo.name}/${this.repo.branch}/${path.split("/").map(encodeURIComponent).join("/")}`;
  }
}
