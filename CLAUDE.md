# CLAUDE.md — ikhsank6 Portfolio

## Project Overview

Personal portfolio site for Ikhsan Kurniawan, deployed at https://ikhsank6.github.io via GitHub Pages.

**Framework**: Astro 5 + React 19 (islands architecture)
**Styling**: Single global CSS file (`src/styles/global.css`)
**Deploy**: `astro build` → `dist/` → GitHub Pages

## Commands

```bash
npm run dev       # Dev server at localhost:4321
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

## Project Structure

**Design reference:** [cookie3.com](https://www.cookie3.com/) — clean light UI, mint-green
accent, flat rounded cards, Helvetica-style mixed-case type.

```
src/
  components/
    Preloader.astro     # Brand intro (once/session; skipped for reduced-motion & returning visitors)
    Hero.astro          # Hero (light) — cutout portrait composition + ledger + contact modal
    Navbar.astro        # Floating nav (side desktop, bottom mobile)
    Skills.astro        # Velocity-reactive dual marquee of tech pills (static)
    ProjectsGallery.astro   # Coverflow carousel (featured) + archive card grid (static)
    ProjectLightbox.tsx     # React island (client:idle) — zoom/pan/gallery + FLIP entrance
    Education.astro     # Experience/education/certs timeline (drawn spine)
    Footer.astro        # Wordmark marquee (black)
  data/
    projects.ts         # Single source of project data (featured + archive split)
  layouts/
    Layout.astro        # Root shell, font preload, FOUC + skip-intro guards
  pages/
    index.astro         # Composes sections, boots animations, cert lightbox
  scripts/
    animations.ts       # ALL GSAP scroll/entrance motion (preloader, marquees, tilt…)
    focus-trap.ts       # Shared modal focus trap
  public/images/
    ikhsan-cutout.webp  # Hero portrait, background knocked out (see "Hero portrait")
    ikhsan-cutout.png   # …lossless master for the same
  styles/
    global.css          # All styles (single file, ~680 lines)
  utils/
    techIcons.ts        # SimpleIcons CDN slug mapping
```

## Key Conventions

- **Astro components** for everything static; **React** only for the project lightbox
  (`ProjectLightbox.tsx`, `client:idle`) — it has real state (zoom/pan/index/focus trap).
- Gallery → lightbox is decoupled via a `project:open` CustomEvent (detail carries images,
  title, and the clicked thumbnail rect for the FLIP shared-element expand).
- Skill/project icons from `https://cdn.simpleicons.org/{slug}` — add slugs to `utils/techIcons.ts`.
- **Scroll/entrance motion = GSAP only**, all in `src/scripts/animations.ts`
  (`initAnimations()`), inside one `gsap.matchMedia()` — reduced-motion and `(pointer:fine)`
  gated. Component-local *state* transitions (contact modal, coverflow) live in that
  component's own `<script>` and use CSS transitions; they are not scroll choreography.
  - `revealHero()` must paint the **finished** state when `heroStarted` is already true: a
    breakpoint change reverts and re-runs the matchMedia callback, and re-arming the hidden
    state there strands the name invisible because the intro timeline is one-shot.
- Hooks: `data-animate` (batch scroll reveal), `data-hero="…"` (hero entrance slots),
  `data-hero-exit` (subtle scroll parallax — **transform-only, no opacity fade**),
  `data-tilt` (pointer 3D tilt, event-delegated), `data-magnetic` (magnetic buttons),
  `data-marquee="left|right"` (skills rows).
- The **coverflow** (`#coverflow`, featured projects) mirrors SIPPDT's own carousel:
  `perspective: 1000px` on the container, cards absolutely centred, each transformed by its
  signed distance from the focused index — clamped at `rotateY 24deg` / `scale 0.9` at one
  full step off centre, with `translateZ` for depth and an edge mask so the row reads as
  continuing. Offsets wrap (shortest path around the ring) so the focused card always has
  neighbours on both sides. Geometry is derived from container width — **one code path for
  phone and desktop**, no separate mobile carousel. Driven by arrows, dots, click-to-focus,
  drag and arrow keys; only the focused card holds tab stops.
- **Project card** (`.project-card`, archive grid) follows the SIPPDT product-card anatomy:
  fixed `3/4` aspect, one rounded `16px` clip, media on top (`flex: 1`, grayscale until hover),
  info panel below with title → 3-line description → hairline-separated mono footer
  (`client` left, `View ↗` right). The description is clamped **and** `min-height: 4.8em` so
  every panel is the same height and titles align across a row.
- Initial hidden states are scoped under `.js` in `global.css` (no-JS visitors see everything).
- Modals: `trapFocus()` from `scripts/focus-trap.ts` + `role="dialog"` + `aria-modal`.
- Section gutter is the `--gutter` var (floor 96px desktop to clear the left nav rail, 24px mobile).
- `content-visibility: auto` on `#skills`/`#about` only.

## Design Tokens (CSS variables — cookie3 palette)

| Variable | Value | Usage |
|---|---|---|
| `--c3-bg` | `#FFFFFF` | Page / hero / skills background |
| `--c3-surface` | `#F7F7F7` | Flat cards, About section |
| `--c3-ink` | `#141414` | Headings / primary text |
| `--c3-ink-soft` | `#5B5B5B` | Body text |
| `--c3-green` | `#0FF378` | Signature accent — fills, on-dark text, contact block |
| `--c3-green-deep` | `#08C25F` | Mid green — dots/shapes on light (non-text) |
| `--c3-green-text` | `#047A40` | Deep green — **AA-contrast text** on white/green tint |
| `--c3-purple` | `#7C3AED` | Secondary tag accent |
| `--c3-dark` | `#0A0A0A` | Dark sections (projects gallery, footer) |

> Legacy `--mm-*` / `--accent-*` names are kept as aliases mapped to the cookie3 palette so
> component rules resolve without churn. Prefer `--c3-*` in new code.

**Section scheme:** `#home` white · `#skills` white · `#projects` dark `#0A0A0A` · `#about`
surface · footer black. Green as **text on light must use `--c3-green-text`**
(mint `#0FF378`/`#08C25F` fail WCAG contrast as text on white).

## Fonts

Inter (Google) with `'Helvetica Neue', Helvetica, Arial` fallback — a faithful, free stand-in
for cookie3's Helvetica Now; Apple devices render real Helvetica Neue. No display webfont
(headings are Inter 600, mixed-case, tight tracking — not uppercase).

**JetBrains Mono** (`--font-mono`) is the utility face, loaded in the same Google Fonts
request. Use it via the `.meta-type` class (mono, uppercase, `0.16em` tracking, tabular
figures) for **metadata only** — hero eyebrow, ledger labels, card footers, column counts.
Never for prose or headings. This is the same Inter + JetBrains Mono pairing used in SIPPDT,
so the portfolio and the work it presents speak one language.

## Hero portrait

`Hero.astro` composes the display name and a background-removed portrait in **one grid cell**
(`.hero-composition`, `grid-template-columns: max-content`). Because the column is sized to
the name, `.hero-portrait { justify-self: start; margin-left: calc(100% - 10px) }` pins the
figure's shoulder to the surname's right edge at every viewport — the cutout's alpha does the
occluding. `heroExitParallax()` then drifts the portrait away faster than the name on scroll.

- **That `10px` is the one value to retune if the portrait crop changes.** Keep it small:
  at ~34px the jacket swallowed the final "n" and the name read "Kurniawar".
- Below 968px the two un-stack into separate rows (no overlap — the surname needs the width).
- The pas foto crops the subject on three sides, so two intersecting `mask-image` gradients
  dissolve the bottom **and** both shoulder edges.
Regenerate the cutout from any flat-backdrop source photo with `tools/cutout.py` (key colour taken as the
**mode** of the border ring — not a median, because the shoulders fill the lower border and a
median lands between jacket and backdrop; soft distance ramp so hair doesn't alias, spill suppression so no colour fringe
survives onto the white page). Needs Pillow + numpy:

```bash
python3 -m venv .venv && .venv/bin/pip install Pillow numpy
.venv/bin/python tools/cutout.py path/to/photo.jpg public/images --name ikhsan-cutout
```

Tune `--lo` / `--hi` if the edge is too hard or too soft; the script prints the key colour and
the resulting opaque coverage so you can sanity-check the matte.

## Adding a New Project

Edit the `projects` array in `src/data/projects.ts`. First 6 → featured gallery, rest → archive.
Fields: `title`, `client`, `description`, `year`, `status` (`'live'|'dev'|'not-live'`), `tech[]`
(must exist in `techIcons`), `link`, `images[]` (under `public/images/`).

## Performance Notes

- Lighthouse production scores: **100 accessibility / 100 best-practices / 100 SEO**
  (run against `dist/` via `preview`, not the dev server).
- GSAP (core + ScrollTrigger) ≈ 48KB gzip in the deferred page module; Swiper and Three.js
  both removed (the hero's particle canvas is gone — the portrait carries the hero now).
- Animate transform/opacity/clip-path only; pinning uses default `pinSpacing` (zero CLS).
- Preloader capped ≤ ~2s, first visit per session only; skipped under reduced motion.
- `@media (prefers-reduced-motion)` + `gsap.matchMedia` disable all motion.
- **Mobile LCP:** touch/coarse-pointer devices get `html.no-hero-anim` (set inline pre-paint in
  `Layout.astro`) and `skip-intro`, so the hero paints from HTML with **no GSAP on the critical
  path** — the letter-by-letter entrance is desktop-only. Without this the preloader + JS-gated
  hero reveal were the entire LCP render delay (~4.2s → ~30ms on throttled mobile; LCP 5.3s → 1.2s).
  If you add anything to the hero's opacity-0 reveal set, mirror it in the `.no-hero-anim` and
  reduced-motion CSS overrides or it will strand invisible on touch.
- The **WebGL portrait** (`hero-portrait-gl.ts`) runs on `(hover: hover) and (pointer: fine)`
  only — the effect is cursor-driven, so touch would pay for a GL context + full-res texture +
  rAF loop with nothing to show.
- CSS is inlined (`build.inlineStylesheets: 'always'` in `astro.config.mjs`): single page, ~7KB
  gzip, so first paint needs no stylesheet round-trip (Astro's `auto` externalised it → render-blocking).
- Project screenshots are capped at **1600px long edge** (`tools/cutout.py` is portrait-only; the
  screenshots were resized with a one-off Pillow pass). Source photos were 3024px shown in ≤400px
  cards — that was Lighthouse's "improve image delivery". The `.png` masters are unused by the
  site (data references `.webp`) but still copied into `dist`; regenerate `.webp` from them if needed.
- **`efficient cache lifetimes`** in Lighthouse is a GitHub Pages header limitation (10-min default,
  no config) — not fixable in this repo.
- Do **not** run Lighthouse against the dev server (`localhost:4321`) — Vite injects unminified
  tooling JS that skews scores. Preview the real build: `astro preview` (port 4322 here).
