"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { asset } from "@/lib/base-path";
import { decryptToken, encryptToken, type AuthFile } from "./crypto";
import { GitHub, type FileChange, type RunStatus } from "./github";
import { Fields, ToolsContext, btn, inputCls, useTools, type AdminTools, type Obj } from "./Form";
import { processImage, slugify, uploadPath } from "./images";
import {
  FILES,
  aboutDef,
  blogDef,
  galleryDef,
  normalize,
  projectsDef,
  servicesDef,
  siteDef,
  teamDef,
  testimonialsDef,
  type CollectionDef,
  type Data,
  type DocDef,
  type FileKey,
} from "./schemas";

const SESSION_KEY = "lancet-admin-session";
const IDLE_MS = 60 * 60 * 1000; // auto sign-out after 1 hour without activity
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const json = (v: unknown) => JSON.stringify(v, null, 2) + "\n";
const s = (o: Obj, k: string) => String(o?.[k] ?? "");

// Blog bodies are MDX: escape the characters MDX would treat as code.
const escapeMdx = (t: string) => t.replace(/</g, "&lt;").replace(/\{/g, "&#123;").replace(/\}/g, "&#125;");
const unescapeMdx = (t: string) => t.replace(/&lt;/g, "<").replace(/&#123;/g, "{").replace(/&#125;/g, "}");

type Section = "dashboard" | "projects" | "gallery" | "blog" | "about" | "team" | "services" | "testimonials" | "site" | "account";
const NAV: { id: Section; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "◧" },
  { id: "projects", label: "Projects", icon: "▦" },
  { id: "gallery", label: "Gallery", icon: "▣" },
  { id: "blog", label: "Blog", icon: "✎" },
  { id: "about", label: "About page", icon: "◉" },
  { id: "team", label: "Team", icon: "☺" },
  { id: "services", label: "Services page", icon: "◆" },
  { id: "testimonials", label: "Client reviews", icon: "★" },
  { id: "site", label: "Site settings", icon: "⚙" },
  { id: "account", label: "Account", icon: "⚿" },
];
const COLLECTIONS: Partial<Record<Section, CollectionDef>> = { projects: projectsDef, gallery: galleryDef, blog: blogDef, team: teamDef, testimonials: testimonialsDef };
const DOCS: Partial<Record<Section, DocDef>> = { about: aboutDef, services: servicesDef, site: siteDef };

type Session = { token: string; email: string; repo: AuthFile["repo"] };

// =====================================================================================

export default function AdminApp() {
  const [auth, setAuth] = useState<AuthFile | null | "missing">(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    fetch(asset("/admin-auth.json"), { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : "missing"))
      .then((a) => setAuth(a))
      .catch(() => setAuth("missing"));
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring a tab session once on mount
      if (saved) setSession(JSON.parse(saved));
    } catch {}
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  return (
    <div className="min-h-svh bg-[#f4f3ef] font-sans text-[#1f2421] [&_*]:cursor-auto [&_a]:cursor-pointer [&_button]:cursor-pointer">
      {session ? (
        <Shell session={session} onSignOut={signOut} onSession={setSession} />
      ) : auth === null ? (
        <Center>Loading…</Center>
      ) : auth === "missing" ? (
        <Center>
          <h1 className="text-xl font-semibold">Admin not set up yet</h1>
          <p className="mt-3 max-w-md text-sm text-black/65">
            Run <code className="rounded bg-black/5 px-1">npm run admin:setup</code> in the project folder to create the admin login, then publish.
          </p>
        </Center>
      ) : (
        <Login
          auth={auth}
          onLogin={(sess) => {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(sess));
            setSession(sess);
          }}
        />
      )}
    </div>
  );
}

const Center = ({ children }: { children: React.ReactNode }) => <div className="flex min-h-svh flex-col items-center justify-center p-6 text-center">{children}</div>;

// =====================================================================================

function Login({ auth, onLogin }: { auth: AuthFile; onLogin: (s: Session) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const token = await decryptToken(auth, email, password);
    if (!token) {
      setBusy(false);
      setError("Incorrect email or password.");
      return;
    }
    try {
      await new GitHub(token, auth.repo).check();
      onLogin({ token, email: email.trim().toLowerCase(), repo: auth.repo });
    } catch (err) {
      setError(`Signed in, but GitHub refused the access key (${err instanceof Error ? err.message : err}). It may have expired — see README › Admin.`);
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/images/lancet/emblem-160.png")} alt="" className="h-11 w-11" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/images/lancet/logo-640.png")} alt="Lancet Architects" className="h-6 w-auto" />
        </div>
        <h1 className="mt-6 text-xl font-semibold">Website admin</h1>
        <p className="mt-1 text-sm text-black/60">Sign in to edit the website.</p>
        <label htmlFor="email" className="mt-6 block text-[13px] font-semibold">
          Email
        </label>
        <input id="email" type="email" autoComplete="username" required className={`${inputCls} mt-1.5`} value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="password" className="mt-4 block text-[13px] font-semibold">
          Password
        </label>
        <div className="relative mt-1.5">
          <input id="password" type={show ? "text" : "password"} autoComplete="current-password" required className={`${inputCls} pr-16`} value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-black/60 hover:bg-black/5">
            {show ? "Hide" : "Show"}
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-[#d0181f]/10 px-3 py-2 text-sm text-[#a8131a]">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className={`${btn.base} ${btn.primary} mt-6 w-full !min-h-[44px]`}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="mt-6 text-center text-xs text-black/45">
          <a href={asset("/")} className="hover:underline">
            ← Back to website
          </a>
        </p>
      </form>
    </div>
  );
}

// =====================================================================================

type Pending = { uploads: Map<string, { base64: string; preview: string }>; mdx: Map<string, string>; deletes: Set<string> };

function Shell({ session, onSignOut, onSession }: { session: Session; onSignOut: () => void; onSession: (s: Session) => void }) {
  const gh = useMemo(() => new GitHub(session.token, session.repo), [session]);
  const [section, setSection] = useState<Section>("dashboard");
  const [data, setData] = useState<Data | null>(null);
  const [orig, setOrig] = useState<Record<string, string>>({});
  const [loadErr, setLoadErr] = useState("");
  const pending = useRef<Pending>({ uploads: new Map(), mdx: new Map(), deletes: new Set() });
  // number of pending blog-text edits / deletions (kept in state so the UI re-renders)
  const [extraCount, setExtraCount] = useState(0);
  const bump = () => setExtraCount(pending.current.mdx.size + pending.current.deletes.size);
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [run, setRun] = useState<RunStatus>(null);
  const [watching, setWatching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // ---- load all content from GitHub ----
  const load = useCallback(async () => {
    setLoadErr("");
    try {
      const entries = await Promise.all((Object.keys(FILES) as FileKey[]).map(async (k) => [k, await gh.readJson(FILES[k])] as const));
      const d = Object.fromEntries(entries) as Data;
      setData(d);
      setOrig(Object.fromEntries(entries.map(([k, v]) => [k, json(v)])));
      pending.current = { uploads: new Map(), mdx: new Map(), deletes: new Set() };
      bump();
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : String(e));
    }
  }, [gh]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch
    load();
  }, [load]);

  // ---- publish status polling ----
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      const r = await gh.latestRun();
      if (!alive) return;
      setRun(r);
      const busy = r && r.status !== "completed";
      timer = setTimeout(tick, busy || watching ? 8000 : 60000);
      if (watching && r && r.status === "completed" && Date.now() - new Date(r.created).getTime() < 15 * 60000) setWatching(false);
    };
    tick();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [gh, watching]);

  // ---- idle sign-out ----
  useEffect(() => {
    let t = setTimeout(onSignOut, IDLE_MS);
    const reset = () => {
      clearTimeout(t);
      t = setTimeout(onSignOut, IDLE_MS);
    };
    const evs = ["pointerdown", "keydown", "scroll"];
    evs.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(t);
      evs.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [onSignOut]);

  // ---- what changed ----
  const changedFiles = useMemo(
    () => (data ? (Object.keys(FILES) as FileKey[]).filter((k) => json(normalize(k, data[k])) !== orig[k] && json(data[k]) !== orig[k]) : []),
    [data, orig]
  );
  const dirty = changedFiles.length > 0 || extraCount > 0;

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const tools: AdminTools = useMemo(
    () => ({
      preview: (path) => pending.current.uploads.get(path)?.preview ?? (path.startsWith("/") ? gh.rawUrl(`public${path}`) : path),
      upload: async (file, folder) => {
        const img = await processImage(file);
        const path = uploadPath(folder, file.name);
        pending.current.uploads.set(path, { base64: img.base64, preview: img.previewUrl });
        bump();
        return path;
      },
    }),
    [gh]
  );

  const update = (k: FileKey, v: unknown) => {
    setData((d) => (d ? { ...d, [k]: v } : d));
    setPublishMsg((m) => (m && !m.ok ? null : m)); // an old "please fix" message is outdated after an edit
  };

  // ---- validation ----
  function validate(d: Data): string[] {
    const errs: string[] = [];
    const checkCollection = (def: CollectionDef) => {
      const items = (d[def.file] as Obj[]) ?? [];
      const slugs = new Set<string>();
      items.forEach((o, i) => {
        const name = def.titleOf(o) || `${def.noun} #${i + 1}`;
        const req = def.fields(d).flatMap((f) => (f.required && (o[f.k] == null || o[f.k] === "" || (Array.isArray(o[f.k]) && !(o[f.k] as unknown[]).length)) ? [f.label] : []));
        if (req.length) errs.push(`${def.title} › ${name}: missing ${req.join(", ")}`);
        if (def.slug) {
          const sl = s(o, "slug");
          if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(sl)) errs.push(`${def.title} › ${name}: web address is invalid`);
          if (slugs.has(sl)) errs.push(`${def.title} › ${name}: another ${def.noun} has the same web address`);
          slugs.add(sl);
        }
        def.validate?.(o, items).forEach((m) => errs.push(`${def.title} › ${name}: ${m}`));
      });
    };
    [projectsDef, blogDef, galleryDef, teamDef, testimonialsDef].forEach(checkCollection);
    const publishedPosts = new Set((JSON.parse(orig.journal) as Obj[]).map((p) => s(p, "slug")));
    ((d.journal as Obj[]) ?? []).forEach((p) => {
      const slug = s(p, "slug");
      const body = pending.current.mdx.get(slug);
      if ((body !== undefined || !publishedPosts.has(slug)) && !body?.trim()) errs.push(`Blog › ${s(p, "title") || "new post"}: article text is empty`);
    });
    const site = d.site as Obj;
    if (!((site.phones as string[]) ?? []).filter(Boolean).length) errs.push("Site settings: at least one phone number is needed");
    if (!((site.emails as string[]) ?? []).filter(Boolean).length) errs.push("Site settings: at least one email is needed");
    return errs;
  }

  // ---- publish ----
  async function publish() {
    if (!data) return;
    const errs = validate(data);
    if (errs.length) {
      setPublishMsg({ ok: false, text: "Please fix before publishing:\n• " + errs.join("\n• ") });
      return;
    }
    setPublishing(true);
    setPublishMsg(null);
    try {
      const changes: FileChange[] = [];
      const finalData = { ...data };
      for (const k of changedFiles) {
        finalData[k] = normalize(k, data[k]);
        changes.push({ path: FILES[k], content: json(finalData[k]) });
      }
      // only upload images that are still used somewhere
      const allJson = (Object.keys(FILES) as FileKey[]).map((k) => JSON.stringify(finalData[k])).join("");
      for (const [path, img] of pending.current.uploads) if (allJson.includes(path)) changes.push({ path: `public${path}`, base64: img.base64 });
      for (const [slug, body] of pending.current.mdx) changes.push({ path: `content/journal/${slug}.mdx`, content: escapeMdx(body.trim()) + "\n" });
      for (const p of pending.current.deletes) changes.push({ path: p, delete: true });
      if (!changes.length) return;
      const what = [...changedFiles.map((k) => k), pending.current.mdx.size ? "blog text" : ""].filter(Boolean).join(", ");
      await gh.commit(changes, `Admin (${session.email}): update ${what}`);
      setOrig((o) => ({ ...o, ...Object.fromEntries(changedFiles.map((k) => [k, json(finalData[k])])) }));
      setData(finalData);
      pending.current.mdx.clear();
      pending.current.deletes.clear();
      bump();
      setPublishMsg({ ok: true, text: "Saved! The website is being rebuilt — changes are live in about 2–3 minutes." });
      setWatching(true);
    } catch (e) {
      setPublishMsg({ ok: false, text: `Publishing failed: ${e instanceof Error ? e.message : e}. Nothing was lost — try again.` });
    } finally {
      setPublishing(false);
    }
  }

  function discard() {
    if (!confirm("Discard all unpublished changes?")) return;
    load();
    setPublishMsg(null);
  }

  if (loadErr)
    return (
      <Center>
        <p className="font-semibold">Could not load the website content.</p>
        <p className="mt-2 max-w-md text-sm text-black/60">{loadErr}</p>
        <div className="mt-4 flex gap-2">
          <button className={`${btn.base} ${btn.dark}`} onClick={load}>
            Try again
          </button>
          <button className={`${btn.base} ${btn.ghost}`} onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </Center>
    );
  if (!data) return <Center>Loading website content…</Center>;

  const coll = COLLECTIONS[section];
  const doc = DOCS[section];

  return (
    <ToolsContext.Provider value={tools}>
      <div className="lg:grid lg:min-h-svh lg:grid-cols-[250px_1fr]">
        {/* sidebar */}
        {menuOpen && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setMenuOpen(false)} />}
        <aside
          className={`border-r border-black/10 bg-white max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-40 max-lg:w-72 max-lg:overflow-y-auto max-lg:shadow-2xl lg:sticky lg:top-0 lg:block lg:h-svh lg:overflow-y-auto ${
            menuOpen ? "block" : "hidden"
          }`}
        >
          <div className="flex items-center gap-2 px-5 pb-4 pt-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/images/lancet/emblem-160.png")} alt="" className="h-9 w-9" />
            <div>
              <p className="text-sm font-semibold leading-tight">Lancet Architects</p>
              <p className="text-xs text-black/50">Website admin</p>
            </div>
            <button className={`${btn.icon} ml-auto lg:hidden`} onClick={() => setMenuOpen(false)} aria-label="Close menu">
              ✕
            </button>
          </div>
          <nav aria-label="Admin sections" className="grid gap-0.5 px-3 pb-6 max-lg:pt-2">
            {NAV.map((n) => {
              const file = (COLLECTIONS[n.id] ?? DOCS[n.id])?.file;
              const changed = file && changedFiles.includes(file);
              return (
                <button
                  key={n.id}
                  onClick={() => {
                    setSection(n.id);
                    setMenuOpen(false);
                    window.scrollTo(0, 0);
                  }}
                  aria-current={section === n.id ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${section === n.id ? "bg-[#1f2421] text-white" : "hover:bg-black/5"}`}
                >
                  <span aria-hidden="true" className="w-4 text-center opacity-70">
                    {n.icon}
                  </span>
                  <span className="flex-1">{n.label}</span>
                  {changed && <span className="h-2 w-2 rounded-full bg-[#d0181f]" title="Unpublished changes" />}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          {/* top bar */}
          <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-black/10 bg-[#f4f3ef]/95 px-4 py-3 backdrop-blur lg:px-8">
            <button className={`${btn.icon} lg:hidden`} onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Sections menu">
              ☰
            </button>
            <BuildBadge run={run} watching={watching} />
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <a href={asset("/")} target="_blank" rel="noopener noreferrer" className={`${btn.base} ${btn.ghost} max-sm:hidden`}>
                View website ↗
              </a>
              {dirty && (
                <button className={`${btn.base} ${btn.ghost}`} onClick={discard} disabled={publishing}>
                  Discard
                </button>
              )}
              <button className={`${btn.base} ${btn.primary}`} onClick={publish} disabled={!dirty || publishing}>
                {publishing ? "Publishing…" : dirty ? `Publish changes` : "No changes"}
              </button>
              <button className={`${btn.base} ${btn.ghost}`} onClick={() => (!dirty || confirm("You have unpublished changes. Sign out anyway?")) && onSignOut()}>
                Sign out
              </button>
            </div>
          </header>

          {publishMsg && (
            <div role="status" className={`mx-4 mt-4 whitespace-pre-line rounded-xl px-4 py-3 text-sm lg:mx-8 ${publishMsg.ok ? "bg-[#1a7f42]/10 text-[#145c31]" : "bg-[#d0181f]/10 text-[#8a1016]"}`}>
              {publishMsg.text}
              <button className="float-right ml-3 text-xs underline" onClick={() => setPublishMsg(null)}>
                close
              </button>
            </div>
          )}

          <main className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
            {section === "dashboard" && <Dashboard data={data} run={run} changed={changedFiles.length + extraCount} go={setSection} />}
            {coll && (
              <Collection
                key={section}
                def={coll}
                data={data}
                items={(data[coll.file] as Obj[]) ?? []}
                origJson={orig[coll.file]}
                onChange={(items) => update(coll.file, items)}
                onDelete={(item) => {
                  if (coll === projectsDef) {
                    // unlink gallery photos of a deleted project
                    update("gallery", ((data.gallery as Obj[]) ?? []).map((g) => (g.project === item.slug ? { ...g, project: "", label: g.label || "Project" } : g)));
                  }
                  if (coll === blogDef && item.slug) {
                    const existed = (JSON.parse(orig.journal) as Obj[]).some((p) => p.slug === item.slug);
                    pending.current.mdx.delete(s(item, "slug"));
                    if (existed) pending.current.deletes.add(`content/journal/${item.slug}.mdx`);
                    bump();
                  }
                }}
                onSlugChange={(from, to) => {
                  const m = pending.current.mdx;
                  if (m.has(from)) {
                    m.set(to, m.get(from) as string);
                    m.delete(from);
                    bump();
                  }
                }}
                extra={
                  coll === blogDef
                    ? (item, index) => (
                        <BlogBody
                          key={`body-${index}`}
                          gh={gh}
                          slug={s(item, "slug")}
                          isNew={!(JSON.parse(orig.journal) as Obj[]).some((p) => p.slug === item.slug)}
                          pending={pending.current.mdx}
                          onChange={bump}
                        />
                      )
                    : undefined
                }
              />
            )}
            {doc && <DocEditor key={section} def={doc} value={data[doc.file] as Obj} onChange={(v) => update(doc.file, v)} />}
            {section === "account" && <Account gh={gh} session={session} onSession={onSession} onSignOut={onSignOut} />}
          </main>
        </div>
      </div>
    </ToolsContext.Provider>
  );
}

// =====================================================================================

function BuildBadge({ run, watching }: { run: RunStatus; watching: boolean }) {
  if (!run) return <span className="text-xs text-black/50">{watching ? "Waiting for the website build…" : ""}</span>;
  const building = run.status !== "completed";
  const ok = run.conclusion === "success";
  const when = new Date(run.created).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  return (
    <a
      href={run.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
        building ? "bg-amber-100 text-amber-900" : ok ? "bg-[#1a7f42]/10 text-[#145c31]" : "bg-[#d0181f]/10 text-[#8a1016]"
      }`}
      title={run.title}
    >
      <span className={`h-2 w-2 rounded-full ${building ? "animate-pulse bg-amber-500" : ok ? "bg-[#1a7f42]" : "bg-[#d0181f]"}`} />
      {building ? "Publishing… (2–3 min)" : ok ? `Live · last published ${when}` : `Last publish failed (${when}) — site unchanged`}
    </a>
  );
}

function Dashboard({ data, run, changed, go }: { data: Data; run: RunStatus; changed: number; go: (s: Section) => void }) {
  const n = (k: FileKey) => ((data[k] as unknown[]) ?? []).length;
  const cards: { s: Section; label: string; count: string }[] = [
    { s: "projects", label: "Projects", count: `${n("projects")}` },
    { s: "gallery", label: "Gallery photos", count: `${n("gallery")}` },
    { s: "blog", label: "Blog posts", count: `${n("journal")}` },
    { s: "testimonials", label: "Client reviews", count: `${n("testimonials")}` },
    { s: "team", label: "Team members", count: `${n("team")}` },
  ];
  return (
    <div>
      <h1 className="text-2xl font-semibold">Welcome 👋</h1>
      <p className="mt-1 text-black/60">Edit the website here. Nothing changes on the live site until you press “Publish changes”.</p>
      {changed > 0 && (
        <p className="mt-4 rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-900">
          You have unpublished changes in {changed} place{changed > 1 ? "s" : ""}. Press <b>Publish changes</b> at the top when you’re done.
        </p>
      )}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {cards.map((c) => (
          <button key={c.s} onClick={() => go(c.s)} className="rounded-xl bg-white p-4 text-left shadow-sm transition hover:shadow-md">
            <p className="text-2xl font-semibold">{c.count}</p>
            <p className="text-sm text-black/60">{c.label}</p>
          </button>
        ))}
      </div>
      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-black/50">Quick actions</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className={`${btn.base} ${btn.primary}`} onClick={() => go("projects")}>
          + Add a project
        </button>
        <button className={`${btn.base} ${btn.ghost}`} onClick={() => go("gallery")}>
          + Add gallery photos
        </button>
        <button className={`${btn.base} ${btn.ghost}`} onClick={() => go("blog")}>
          + Write a blog post
        </button>
        <button className={`${btn.base} ${btn.ghost}`} onClick={() => go("site")}>
          Edit phone, email & address
        </button>
      </div>
      <div className="mt-10 rounded-xl bg-white p-5 text-sm leading-relaxed text-black/70 shadow-sm">
        <h2 className="font-semibold text-black">How it works</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Make your changes in any section (a red dot marks sections with unsaved changes).</li>
          <li>
            Press <b>Publish changes</b>. Photos are resized automatically.
          </li>
          <li>The website rebuilds itself — changes are live in about 2–3 minutes. The badge at the top shows the progress.</li>
          <li>If a build fails, the previous version of the site stays online and nothing is lost.</li>
        </ol>
        {run && run.status === "completed" && run.conclusion !== "success" && (
          <p className="mt-3 text-[#8a1016]">
            The last publish failed.{" "}
            <a className="underline" href={run.url} target="_blank" rel="noopener noreferrer">
              See details
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

function DocEditor({ def, value, onChange }: { def: DocDef; value: Obj; onChange: (v: Obj) => void }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">{def.title}</h1>
      <p className="mt-1 max-w-2xl text-black/60">{def.intro}</p>
      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm md:p-7">
        <Fields fields={def.fields} value={value} onChange={onChange} />
      </div>
    </div>
  );
}

// ---------------- collections ----------------

function Collection({
  def,
  data,
  items,
  origJson,
  onChange,
  onDelete,
  extra,
  onSlugChange,
}: {
  def: CollectionDef;
  data: Data;
  items: Obj[];
  origJson: string;
  onChange: (items: Obj[]) => void;
  onDelete: (item: Obj) => void;
  extra?: (item: Obj, index: number) => React.ReactNode;
  onSlugChange?: (from: string, to: string) => void;
}) {
  const { preview } = useTools();
  const [editing, setEditing] = useState<number | null>(null);
  const published = useMemo(() => new Set((JSON.parse(origJson) as Obj[]).map((o) => s(o, "slug")).filter(Boolean)), [origJson]);

  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const a = items.slice();
    [a[i], a[j]] = [a[j], a[i]];
    onChange(a);
  };

  if (editing != null && items[editing]) {
    const item = items[editing];
    const isPublished = def.slug && published.has(s(item, "slug"));
    const setItem = (v: Obj) => {
      const next = { ...v };
      // new items: web address follows the title
      if (def.slug && !isPublished) {
        next.slug = slugify(s(next, "title"));
        if (next.slug !== item.slug) onSlugChange?.(s(item, "slug"), s(next, "slug"));
      }
      onChange(items.map((x, j) => (j === editing ? next : x)));
    };
    return (
      <div>
        <button className={`${btn.base} ${btn.ghost}`} onClick={() => setEditing(null)}>
          ← All {def.title.toLowerCase()}
        </button>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">{def.titleOf(item) || `New ${def.noun}`}</h1>
          <div className="flex gap-2">
            {def.viewUrl && isPublished && (
              <a className={`${btn.base} ${btn.ghost}`} href={asset(def.viewUrl(item))} target="_blank" rel="noopener noreferrer">
                View on website ↗
              </a>
            )}
            <button
              className={`${btn.base} ${btn.danger}`}
              onClick={() => {
                if (!confirm(`Delete "${def.titleOf(item) || def.noun}"? It disappears from the website when you publish.`)) return;
                onDelete(item);
                onChange(items.filter((_, j) => j !== editing));
                setEditing(null);
              }}
            >
              Delete {def.noun}
            </button>
          </div>
        </div>
        {def.slug && (
          <p className="mt-2 text-sm text-black/55">
            Web address: <code className="rounded bg-black/5 px-1">{def.viewUrl?.(item)}</code>
            {isPublished ? " (fixed once published)" : " (made from the title)"}
          </p>
        )}
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm md:p-7">
          <Fields key={editing} fields={def.fields(data)} value={item} onChange={setItem} />
          {extra?.(item, editing)}
        </div>
        <p className="mt-4 text-sm text-black/55">Changes are kept while you move around the admin. Press “Publish changes” at the top to put them online.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{def.title}</h1>
          <p className="mt-1 max-w-2xl text-black/60">{def.intro}</p>
        </div>
        <button
          className={`${btn.base} ${btn.primary}`}
          onClick={() => {
            onChange([def.make(), ...items]);
            setEditing(0);
          }}
        >
          + Add {def.noun}
        </button>
      </div>
      {items.length === 0 && <p className="mt-8 rounded-xl bg-white p-6 text-center text-black/55">Nothing here yet.</p>}
      <ul className="mt-6 grid gap-3">
        {items.map((it, i) => {
          const thumb = def.thumbOf?.(it);
          return (
            <li key={i} className="flex items-center gap-4 rounded-xl bg-white p-3 shadow-sm">
              {def.thumbOf && (
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {thumb && <img src={preview(thumb)} alt="" className="h-full w-full object-cover" loading="lazy" />}
                </div>
              )}
              <button className="min-w-0 flex-1 text-left" onClick={() => setEditing(i)}>
                <p className="truncate font-medium">{def.titleOf(it) || <span className="text-black/40">Untitled {def.noun}</span>}</p>
                {def.subtitleOf && <p className="truncate text-sm text-black/55">{def.subtitleOf(it)}</p>}
              </button>
              <div className="flex shrink-0 items-center gap-1">
                <button className={btn.icon} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                  ↑
                </button>
                <button className={btn.icon} onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">
                  ↓
                </button>
                <button className={`${btn.base} ${btn.ghost} !min-h-[32px] !px-3`} onClick={() => setEditing(i)}>
                  Edit
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function BlogBody({ gh, slug, isNew, pending, onChange }: { gh: GitHub; slug: string; isNew: boolean; pending: Map<string, string>; onChange: () => void }) {
  const [text, setText] = useState<string | null>(pending.get(slug) ?? (isNew ? "" : null));
  const [err, setErr] = useState("");
  useEffect(() => {
    if (text !== null || !slug) return;
    gh.readText(`content/journal/${slug}.mdx`)
      .then((t) => setText(unescapeMdx(t ?? "")))
      .catch((e) => setErr(String(e)));
  }, [gh, slug, text]);
  return (
    <div className="mt-6">
      <label htmlFor="blog-body" className="mb-1.5 block text-[13px] font-semibold">
        Article text <span className="text-[#d0181f]">*</span>
      </label>
      {err && <p className="text-sm text-[#a8131a]">{err}</p>}
      <textarea
        id="blog-body"
        rows={18}
        className={`${inputCls} font-mono text-[14px] leading-relaxed`}
        value={text ?? "Loading…"}
        disabled={text === null}
        onChange={(e) => {
          setText(e.target.value);
          pending.set(slug, e.target.value);
          onChange();
        }}
        placeholder={"Write the article here.\n\n## A sub-heading\n\nA paragraph… Leave an empty line between paragraphs.\n\n- a list item\n- another item\n\n**bold text**, *italic text*, [a link](https://example.com)"}
      />
      <p className="mt-1 text-xs text-black/55">
        Formatting: <code>## Heading</code>, <code>**bold**</code>, <code>*italic*</code>, <code>- list item</code>, <code>[link text](https://…)</code>. Empty line = new paragraph.
      </p>
    </div>
  );
}

// ---------------- account ----------------

function Account({ gh, session, onSession, onSignOut }: { gh: GitHub; session: Session; onSession: (s: Session) => void; onSignOut: () => void }) {
  const [email, setEmail] = useState(session.email);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const strong = pw.length >= 12 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setMsg({ ok: false, text: "Enter a valid email." });
    if (pw.length < 10) return setMsg({ ok: false, text: "Use at least 10 characters." });
    if (pw !== pw2) return setMsg({ ok: false, text: "The two passwords don’t match." });
    setBusy(true);
    try {
      const file = await encryptToken(email, pw, session.token, session.repo);
      await gh.commit([{ path: "public/admin-auth.json", content: JSON.stringify(file, null, 2) + "\n" }], `Admin: change login for ${email.trim().toLowerCase()}`);
      const next = { ...session, email: email.trim().toLowerCase() };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
      onSession(next);
      setPw("");
      setPw2("");
      setMsg({ ok: true, text: "Login changed. The new email/password works in about 2–3 minutes (after the website rebuilds)." });
    } catch (err) {
      setMsg({ ok: false, text: `Could not save: ${err instanceof Error ? err.message : err}` });
    }
    setBusy(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Account</h1>
      <p className="mt-1 text-black/60">
        Signed in as <b>{session.email}</b>. You are signed out automatically after 1 hour without activity, or when you close the browser tab.
      </p>
      <form onSubmit={save} className="mt-6 grid max-w-md gap-4 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Change login email or password</h2>
        <div>
          <label htmlFor="acc-email" className="mb-1.5 block text-[13px] font-semibold">
            Email
          </label>
          <input id="acc-email" type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        </div>
        <div>
          <label htmlFor="acc-pw" className="mb-1.5 block text-[13px] font-semibold">
            New password
          </label>
          <input id="acc-pw" type="password" className={inputCls} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
          {pw && <p className={`mt-1 text-xs ${strong ? "text-[#145c31]" : "text-amber-700"}`}>{strong ? "Strong password ✓" : "Tip: 12+ characters with upper & lower case, numbers and a symbol."}</p>}
        </div>
        <div>
          <label htmlFor="acc-pw2" className="mb-1.5 block text-[13px] font-semibold">
            Repeat new password
          </label>
          <input id="acc-pw2" type="password" className={inputCls} value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" />
        </div>
        {msg && <p className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-[#1a7f42]/10 text-[#145c31]" : "bg-[#d0181f]/10 text-[#8a1016]"}`}>{msg.text}</p>}
        <button className={`${btn.base} ${btn.dark}`} disabled={busy}>
          {busy ? "Saving…" : "Save new login"}
        </button>
      </form>
      <button className={`${btn.base} ${btn.ghost} mt-6`} onClick={onSignOut}>
        Sign out
      </button>
      {SITE && <p className="mt-8 text-xs text-black/45">Website: {SITE}</p>}
    </div>
  );
}
