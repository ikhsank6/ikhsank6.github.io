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
    Hero.astro          # Hero (light) + 3D cube + contact modal
    Navbar.astro        # Floating nav (side desktop, bottom mobile)
    Skills.astro        # Velocity-reactive dual marquee of tech pills (static)
    ProjectsGallery.astro   # Pinned horizontal gallery (featured) + archive list (static)
    ProjectLightbox.tsx     # React island (client:idle) — zoom/pan/gallery + FLIP entrance
    Education.astro     # Experience/education/certs timeline (drawn spine)
    ContactCta.astro    # Full-bleed green CTA block
    Footer.astro        # Wordmark marquee (black)
  data/
    projects.ts         # Single source of project data (featured + archive split)
  layouts/
    Layout.astro        # Root shell, font preload, FOUC + skip-intro guards
  pages/
    index.astro         # Composes sections, boots animations, cert lightbox
  scripts/
    animations.ts       # ALL GSAP motion (preloader, gallery pin, marquees, tilt…)
    focus-trap.ts       # Shared modal focus trap
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
- **Animations = GSAP only**, all in `src/scripts/animations.ts` (`initAnimations()`), inside
  one `gsap.matchMedia()` — reduced-motion, `(pointer:fine)`, and `(min-width:969px)` gated.
- Hooks: `data-animate` (batch scroll reveal), `data-hero="…"` (hero entrance slots),
  `data-hero-exit` (subtle scroll parallax — **transform-only, no opacity fade**),
  `data-tilt` (pointer 3D tilt, event-delegated), `data-magnetic` (magnetic buttons),
  `data-marquee="left|right"` (skills rows).
- The **pinned horizontal gallery** (`buildHorizontalGallery`) pins `#galleryPin` and scrubs
  the track x; per-panel media/info reveal via `containerAnimation` child triggers. Desktop +
  pointer-fine only; touch falls back to native `scroll-snap` (CSS media query in the component).
- Initial hidden states are scoped under `.js` in `global.css` (no-JS visitors see everything).
- Modals: `trapFocus()` from `scripts/focus-trap.ts` + `role="dialog"` + `aria-modal`.
- Section gutter is the `--gutter` var (floor 96px desktop to clear the left nav rail, 24px mobile).
- `content-visibility: auto` on `#skills`/`#about` only (NOT `#projects` — it pins).

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
surface · `#contact` green · footer black. Green as **text on light must use `--c3-green-text`**
(mint `#0FF378`/`#08C25F` fail WCAG contrast as text on white).

## Fonts

Inter (Google) with `'Helvetica Neue', Helvetica, Arial` fallback — a faithful, free stand-in
for cookie3's Helvetica Now; Apple devices render real Helvetica Neue. No display webfont
(headings are Inter 600, mixed-case, tight tracking — not uppercase).

## Adding a New Project

Edit the `projects` array in `src/data/projects.ts`. First 6 → featured gallery, rest → archive.
Fields: `title`, `client`, `description`, `year`, `status` (`'live'|'dev'|'not-live'`), `tech[]`
(must exist in `techIcons`), `link`, `images[]` (under `public/images/`).

## Performance Notes

- Lighthouse production scores: **100 accessibility / 100 best-practices / 100 SEO**
  (run against `dist/` via `preview`, not the dev server).
- GSAP (core + ScrollTrigger) ≈ 48KB gzip in the deferred page module; Swiper removed.
- Animate transform/opacity/clip-path only; pinning uses default `pinSpacing` (zero CLS).
- Preloader capped ≤ ~2s, first visit per session only; skipped under reduced motion.
- `@media (prefers-reduced-motion)` + `gsap.matchMedia` disable all motion.
- Do **not** run Lighthouse against the dev server (`localhost:4321`) — Vite injects unminified
  tooling JS that skews scores.
