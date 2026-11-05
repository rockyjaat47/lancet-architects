# Lancet Architects — website

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Motion (Framer Motion) · Lenis · MDX · static export (GitHub Pages).
Layout, rhythm, typography and interactions follow the structural study in [`REFERENCE_NOTES.md`](REFERENCE_NOTES.md)
(no logo, photo or text from that reference is used). Brand, images and copy are Lancet Architects’ own, imported from
lancetarchitect.netlify.app. Site language: English (`en-IN`).

## Démarrage

```bash
npm install
cp .env.example .env.local   # optional
npm run dev                  # http://localhost:3000
```

| Commande | Rôle |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` | static production build into `out/` |
| `npm run images` | regenerate responsive image variants after changing photos |
| `npm start` | sert le build |
| `npm run lint` | ESLint |

## Deployment — GitHub Pages (live)

Live site: **https://rockyjaat47.github.io/lancet-architects/** — repository: https://github.com/rockyjaat47/lancet-architects

The site is a fully static export (`output: "export"`) published to the `gh-pages` branch:

```bash
npm run deploy
```

This builds with the right sub-path (`/lancet-architects`) and force-pushes `out/` to `gh-pages`
(Settings › Pages › Source: “Deploy from a branch”, branch `gh-pages`, folder `/`).

- **Custom domain** (e.g. lancetarchitect.com): `BASE_PATH= SITE_URL=https://lancetarchitect.com CNAME=lancetarchitect.com npm run deploy`,
  then add the domain in Settings › Pages and point the DNS to GitHub Pages.
- **Contact form:** static hosting has no server. Set `NEXT_PUBLIC_FORM_ENDPOINT` (Formspree: `https://formspree.io/f/<id>`, or
  Web3Forms `https://api.web3forms.com/submit` + `NEXT_PUBLIC_FORM_ACCESS_KEY`) in `.env.local` before `npm run deploy`.
  Without it, the form opens the visitor’s email app pre-filled to the studio address.
- **Automatic deploys on every push (optional):** copy `scripts/github-pages-workflow.yml` to `.github/workflows/deploy.yml`,
  switch Settings › Pages › Source to “GitHub Actions”. Pushing workflow files needs the `workflow` scope:
  `gh auth refresh -s workflow`.
- Also works on Vercel / Netlify / any static host (`npm run build` → `out/`).

**Images:** the static host has no image optimizer, so responsive WebP variants are pre-generated in `public/images/_w/`
(manifest: `src/lib/image-manifest.json`). After adding or replacing photos run `npm run images`, then commit.

## Content (Lancet Architects)

All text, images and contact details were imported from the previous site (lancetarchitect.netlify.app) and live in `content/` — no code to touch:

| File | Content |
|---|---|
| `site.json` | name, logo, taglines, SEO description, address, phones, emails, Google Maps link, WhatsApp, credit line |
| `projects.json` | projects (slug, title, category `residential` / `commercial` / `institutional` / `landscape` / `public` / `interior`, texts, images). Optional fields `location`, `year`, `surface`, `client` appear in the spec table when filled |
| `gallery.json` | gallery images (`project` links an image to its project page) |
| `about.json` | About page: hero, intro, fields of work, stats (14+ / 500+ / 25+ / 100%), team text |
| `team.json` | director photo, title and message |
| `services.json` | Services page: "why choose us" list, 4-step process, sustainability section |
| `testimonials.json` | client reviews imported from Google (via the old site's review widget) |
| `journal.json` + `journal/<slug>.mdx` | blog posts: metadata in JSON, body in MDX |

Images are in `public/images/lancet/`. The home slider is built automatically from every project image plus the interior shots from the gallery.
To add a project: add an entry to `projects.json` and its images to `public/images/lancet/` — it appears in the slider, the grid, the sitemap and the menu filter (categories only show when used).

## Architecture

```
content/                    contenu éditable (JSON + MDX)
src/app/                    routes (App Router)
  page.tsx                  home: loader + slider
  projects/, projects/[slug]/  filterable grid, project page
  services/, about/, gallery/, contact/, blog/, blog/[slug]/
  privacy-policy/, terms/   legal pages
  sitemap.ts, robots.ts, manifest.ts, opengraph-image.tsx
src/components/
  Loader.tsx                loader 1re visite (logo qui se remplit, ligne + compteur 0→100 %, slogan)
  Header.tsx, MenuOverlay.tsx  en-tête fixe + menu plein écran (formes qui « tombent » avec rebond)
  ProjectSlider.tsx         carrousel infini en arc (molette, drag souris/tactile, clavier, inertie, snap)
  Cursor.tsx                curseur pastille (« Voir le projet », « glisser »)
  CookieBanner.tsx          Accepter / Refuser, mémorisé dans localStorage (`cookie-consent`)
  Reveal.tsx                apparitions au scroll (fade-up, mots, filets)
src/lib/                    accès au contenu, SEO (metadata, JSON-LD), easings
```

Notes techniques :
- Le loader ne joue qu’à la 1re visite de la session (`sessionStorage.visited`) et jamais avec `prefers-reduced-motion`.
- `prefers-reduced-motion` : animations de transformation désactivées (Motion `reducedMotion="user"`), pas de Lenis, slider sans inertie.
- Le cookie de consentement émet un événement `window` `cookie-consent` : branchez-y vos scripts d’analytics (aucun n’est chargé par défaut).
- `cacheComponents` (activé par défaut dans Next 16) est volontairement désactivé : le site est 100 % statique (SSG).
- Pour revoir le loader : DevTools › Application › Session Storage › supprimer `visited`.

## Qualité vérifiée

Lighthouse (production build): desktop 100 in all four categories on every page; mobile 90–100 performance and
100 accessibility / best practices / SEO. Accessibilité : menu (focus piégé, Échap), slider
(flèches ← →, focus visible), lien d’évitement, formulaire avec erreurs annoncées.

## Still to check / complete

- [ ] **Director’s name** — the old site only says “Director” (`content/team.json` › `name`)
- [ ] **Project details** — location, year, area, client are unknown, so they are hidden; add them in `content/projects.json` (location falls back to “Lucknow, Uttar Pradesh”)
- [ ] **More projects** — the old site had only 2 published projects; the kitchen/kids-room/living images are shown as “Interior Design” in the gallery and slider
- [ ] **Social links** — only WhatsApp and Google reviews were found; add Instagram/Facebook/LinkedIn in `content/site.json › socials` and `src/components/Footer.tsx`
- [ ] **GPS coordinates** in `content/site.json › geo` are approximate (Telibagh, Lucknow) — used only in JSON-LD
- [ ] **Domain** — on a custom domain set the repository variable `SITE_URL`
- [ ] **Contact form service** — set `FORM_ENDPOINT` (and `FORM_ACCESS_KEY` for Web3Forms) as GitHub repository variables; until then the form opens the visitor’s email app
- [ ] **Legal pages** — privacy policy and terms reuse the old site’s text; have them reviewed
- [ ] **Logo** — `public/images/lancet/logo-640.png` (wordmark) and `src/app/icon.jpg` / `apple-icon.jpg` (emblem favicon)

## Outils d’inspection

`inspect/` contient les captures et le script Playwright utilisés pour étudier la référence (`inspect.mjs`) et
comparer le rendu local (`shoot-local.mjs`). Ce dossier n’est pas nécessaire au site et peut être supprimé.
