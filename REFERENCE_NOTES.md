# REFERENCE_NOTES — structural study of avaa-architectes.fr

Inspected 2026-11-05 with Playwright (Chromium) at 1440×900 and 390×844.
Screenshots are in `inspect/shots/` (`desk-*` and `mob-*`, `*-full.png` = full page).
**Used for layout/UX reference only. No logo, photo or copy is reused.**

## Tech of the reference (for behaviour, not to reuse)
Webflow + jQuery, GSAP 3 (ScrollTrigger, CustomEase, Flip), Lenis smooth scroll
(`lerp .06, wheelMultiplier .7`, disabled on home), Barba.js page transitions,
Three.js (WebGL) home slider, Finsweet cookie consent + CMS filter, Lottie.

## Typography
| Role | Family | Weight | Size @1440 | Notes |
|---|---|---|---|---|
| Body / UI | **Karla** | 400 (300–700 loaded) | `1vw` = 14.4px, lh 1.6 | `body{font-size:1vw}`; every size is in `em` so the whole site scales with the viewport. ≤991px: `body{font-size:10px}`, plus per-breakpoint em overrides. |
| Headings / display | **Outfit** | 300/400/700 | 18 · 24 · 31.5 · 50.7 · 68.7px (≈1.25/1.67/2.19/3.52/4.77em) | Tight lh (1–1.2), no letter-spacing |
| Navbar tagline (H1 on home) | Karla 400 uppercase | — | .83em (≈12px), lh 1.2 | Centered, 2 lines, hidden on mobile |
| Micro labels | Karla 400 uppercase | — | 0.56–0.75em (8–10.8px) | Meta tables, categories, "[01]" index |
| Menu shape labels | Outfit 400 | — | 3.13em (≈45px) desktop | Rotated inside shapes |
| Marquee (pre-footer) | Outfit 300/400 | — | ≈8–9vw | Infinite horizontal scroll of the tagline |

Letter-spacing: `0` everywhere. Text-transform uppercase on labels only.

## Palette (CSS vars on :root)
| Token | Value | Usage |
|---|---|---|
| `--white-smoke` | `#f7f6f2` | Page background |
| `--dark-slate-grey` | `#363e3a` | Text, dark sections (rounded top corners ≈1em) |
| `--burntsienna` | `#e17a58` | Custom cursor dot, `[01]` index |
| sage | `#99a795` | Menu overlay background |
| shape fill | `#f1f0ec` | Menu shapes |
| `--silver` | `#d4d3cf` | Dividers / borders |
| `--black-2` | `#1f1f1f` | Rare |
| white | `#ffffff` | Projets category bar, footer area |

## Spacing / grid
- `.container`: max-width 1512px, padding `2.78em 3.68em` (≈40px / 53px at 1440); ≤991px 4vw sides, ≤479px 6vw.
- Layout is mostly 2 columns: a small left label column (≈ 1/4) and the content in the right ¾ (expertises, équipe, contact).
- Dividers: 1px `#d4d3cf`; they animate in from width 0 to 100%.
- Vertical rhythm: sections ≈ 8–12em apart; big negative space.

## Global UI
- **Header** (`.navbar`): fixed, full width, `mix-blend-mode: difference`, transition color .5s. Logo left (≈150px wide), tagline centered (desktop), "menu" (Outfit 700, 1.25em) + 2-line burger (1.39em × .14em lines) right. Burger → X: lines translate ±.195em and rotate ∓45°, 0.5s.
- **Custom cursor**: 1.74em coral dot, `scale(0)` by default, grows on link hover (`.hover-link`), .3s ease-in-out. Desktop only.
- **Loader** (first visit only, `sessionStorage.visited`):
  1. Logo grey (opacity .1 overlay) → dark "fill" grows bottom to top (`height:120%`) over 2.3s.
  2. At the same time: progress line bottom-left grows 0→100% width, counter bottom-right counts 0→100 "%" (Karla ≈14px).
  3. +0.5s: logo + percent fade out (0.4s), then the tagline (Outfit 300, 24px, centered, part in bold) fades in (0.4s), holds 1s, fades out 0.6s.
  4. Loader fades out 0.5s; slider canvas rises from `y:20vh, opacity 0` (0.7s); navbar slides down from `-100%` (1s, power2.inOut).
  Total ≈ 7s. Repeat visits skip it.
- **Menu overlay**: sage backdrop fades in (0.5s). Each nav element is a *shape* (teardrop = 3 rounded corners + 1 sharp corner, rounded pentagon/"house" shape) with a rotated Outfit label. Shapes **fall in** from a random x (−450…+250px) and y (−50…−⅔ viewport) with a custom *bounce* ease (gravity-like, 1.5s, staggered 0.1s), opacity 0→1 in 0.3s. Primary: Équipe, Projets, Expertises, Contact (light shapes, dark text, hover = text turns light). Secondary: Actualités, Instagram, Facebook as large light-coloured free text (no shape). Legal links (uppercase micro) bottom centre. Close: shapes lose `is-open`, then the timeline reverses at 3× speed after 200ms. Clicking the backdrop closes. Burger label switches to "fermer" + X.
- **Page transitions** (Barba): cross-fade 0.5s; projets → project uses a GSAP Flip of the clicked image into the hero.
- **Scroll reveal** (`[fadeupholder]` trigger at `top 80%`): children `y:50→0, opacity 0→1, 1.8s expo.out`, staggered 0.09s; words in `.tricks` split per word `y:30→0`, 1.2s expo.out, 5ms stagger; dividers width 0→100%.
- **Cookie consent**: Finsweet banner (Accepter/Refuser).
- **Footer**: hairline divider, then 4 columns: big nav links with ↗ arrows (Projets, Équipe, Expertises, Journal, → Contact), Adresse, Contact (phone/email/"Formulaire"), Nous suivre (Instagram/LinkedIn/Facebook underlined). Above it a giant infinite marquee of the tagline. Home has only a tiny centered credit line.

## Home slider (Three.js; rebuilt here with DOM transforms)
- 8 planes in an **infinite loop**, spaced `margin = 3.5` units (mobile 1.6), plane 2.4×2.4 units (mobile 1.2×1.7) → roughly a 570px square centred at 1440.
- For each plane at offset x: `rotateZ = x × −0.1 rad`, `y = −|x| × 0.2` (they sit on an **arc**), so neighbours are tilted ≈20° and lower, clipped at the screen edges.
- Input: wheel (`wheelDeltaY × 0.2`), touch drag (`Δx × 0.4`), with inertia (`target *= 0.9`, speed lerp .5) and **snapping** to the nearest slot.
- Hover (desktop): the plane morphs into a **teardrop** (all corners rounded except bottom-right), 0.4s; cursor dot appears.
- Click on a side plane → it scrolls to centre; click centre → opens the project.
- Caption under the slider (centred): `[01]` coral micro index, H2 project name (Outfit 700, 1em), H3 location (uppercase ≈.75em). It fades out (stagger .1) while moving and fades back with the new project when it settles.
- Intro: the centre plane starts full-screen and shrinks to card size (1s, power3.inOut); a slight wave distortion appears in the shader.
- Leaving to a project: the centre plane expands back to full screen (0.8s), then the project page hero takes over.
- Mobile: same arc, smaller cards, captions below, no hover morph.

## /projets
- Header + full-width hairline divider under it.
- **Staggered two-column grid**: left column items top-aligned, right column offset ≈ +200px; images ≈ 42% width, 4:3, radius ≈ 6px. Under each image: micro uppercase meta `CATÉGORIE / VILLE / RÉGION` (grey) then title (Outfit 400, 1.39em).
- **Sticky bottom filter bar** (white): "Catégories" bold + uppercase micro buttons: VOIR TOUT · MAISONS · TERTIAIRE & ÉQUIPEMENT · HÔTELS.
- Hover: image scales slightly / Flip on click.

## /projets/[slug]
- Split layout: **left ≈ 75%**: hero image full height then gallery images stacked (small gaps), scrolls; **right ≈ 25%** sticky panel on `#f7f6f2`: "← TOUS LES PROJETS" micro link, H1 (Outfit 400, ≈2.4em, lh 1.1), body paragraphs (Karla ≈.9em, truncated) with underlined "Voir plus" toggle, then a **spec table** with hairline rows: LOCALISATION, PROGRAMME, MAÎTRISE D'OUVRAGE, LIVRAISON (label left, value right, uppercase micro).
- Mobile: images first, a button reveals the info panel sliding up from the bottom (1.5s power2.out).

## /expertises-process-architecture
1. Label "NOTRE EXPERTISE" left micro; right: big Outfit statement (2 lines), then a list of 5 expertises as rows with a dot bullet and hairline under each (uppercase).
2. Full-width image (rounded, ≈16:9).
3. Divider, label "PROCESS", statement H2 + two paragraphs, pill outline button "● DÉCOUVRIR LES PROJETS".
4. "Votre projet en 5 étapes": a sticky **circle** (thin stroke) with 5 numbered nodes on the left; the right column lists 5 numbered steps (title + paragraph); the active step is dark, the others faded, as you scroll.
5. **Dark rounded section** (`#363e3a`, light text): label, a centred large statement, then image + two text columns.
6. Marquee + footer.

## /architecte-arcachon (Équipe)
1. Large rounded team photo (≈ 2.3:1).
2. H1 "Architectes à …" (Outfit, ≈2.2em) + larger statement (≈3.5em).
3. "À PROPOS" label left; right: intro paragraph (larger), text, bullet list of activities, pill button.
4. **Dark rounded section** "NOTRE ÉQUIPE": 2 columns separated by a vertical hairline; each member: ↘ arrow + name (Outfit, light), role micro, bio paragraphs, "● NOUS REJOINDRE" pill. Inactive member faded (accordion-like).
5. Partners: full-bleed dark image with a centred paragraph overlay.
6. Marquee + footer.

## /contact
1. Left: statement H1 (≈2.2em) + small paragraph; right: stylised **map** illustration (pale shape) with a pin + logo.
2. **Dark rounded section**: left column "Formulaire de contact", address, contact details; vertical hairline; right: conversational form starting "Je suis [UN PARTICULIER ▾]" (custom select, underline fields). The form reveals the next fields progressively.
3. Marquee + footer.

## /journal
- Centred H1 "Journal de l'agence" (Outfit ≈3.5em).
- First article **featured**: 3 portrait images side by side (left half), text right: `CATÉGORIE : VIE DE CHANTIER` micro + date right, title UPPERCASE Outfit ≈1.9em, excerpt.
- Then a 3-column grid of cards with varying image heights (masonry-like): image, meta row, uppercase title, excerpt.

## SEO of the reference
- `<html lang="fr">`, title + description, og:title/description/image, twitter:card `summary_large_image`, favicon + apple-touch-icon. **No JSON-LD** (we add it). H1 on home = navbar tagline; project names are H2, locations H3.

## Mobile (390px)
- Header: logo left (≈105px), "menu"/"fermer" right; tagline hidden.
- Loader the same, centred.
- Menu shapes are smaller and pile up in the centre; secondary links overlap the shapes.
- Grids collapse to 1 column; split layouts stack; container padding 6vw.

## Decisions for the rebuild
- Slider = DOM + `requestAnimationFrame` physics (wheel/drag/touch/keyboard, inertia, snap, infinite loop) instead of WebGL, for Lighthouse and a11y. Teardrop hover = `border-radius` morph. Intro = scale from full-screen.
- Animations: Framer Motion (menu drop-in with spring/bounce, loader, reveals, page transitions). Lenis for smooth scroll on inner pages.
- `prefers-reduced-motion`: no loader animation, no falling shapes, reveals become simple fades, slider snaps without inertia.
