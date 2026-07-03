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

```
src/
  components/
    Background.astro   # Fixed animated background (orb parallax layers + JS particles)
    Hero.astro          # Hero section + 3D cube + contact modal
    Navbar.astro        # Floating nav (side desktop, bottom mobile)
    Skills.tsx          # Tech skill pills (React, client:visible)
    Projects.tsx        # Project grid + lightbox (React, client:visible)
    Education.astro     # Experience, education, certificates
    Footer.astro
  layouts/
    Layout.astro        # Root HTML shell, font preload, meta tags, FOUC guard
  pages/
    index.astro         # Page entry — composes all sections, boots animations
  scripts/
    animations.ts       # ALL GSAP motion (hero timeline, ScrollTrigger, tilt, parallax)
    focus-trap.ts       # Shared modal focus trap
  styles/
    global.css          # All styles (~1400 lines, single file)
  utils/
    techIcons.ts        # SimpleIcons CDN slug mapping
```

## Key Conventions

- **Astro components** for static/server sections; **React** only for interactive sections (Skills, Projects)
- Skill icons fetched from `https://cdn.simpleicons.org/{slug}` — add new slugs to `src/utils/techIcons.ts`
- **Animations = GSAP only**, all in `src/scripts/animations.ts` (`initAnimations()`), registered
  inside `gsap.matchMedia()` contexts for reduced-motion and pointer capability
- Scroll reveals: add `data-animate` to any element → `ScrollTrigger.batch` staggers it in.
  Initial `opacity: 0` is scoped under `.js` in `global.css` (no-JS visitors see everything)
- `data-tilt` = pointer 3D tilt (event-delegated, works on Swiper loop clones);
  `data-magnetic` = magnetic hover on CTAs; `data-hero="..."` = hero entrance timeline slots
- Modals: use `trapFocus()` from `src/scripts/focus-trap.ts` + `role="dialog"` + `aria-modal`
- `content-visibility: auto` on `#skills`, `#projects`, `#about` for off-screen render deferral
- All project data is hardcoded in `Projects.tsx`

## Design Tokens (CSS variables)

| Variable | Value | Usage |
|---|---|---|
| `--accent-lime` | `#D4FF00` | Primary accent, CTAs |
| `--accent-blue` | `#0066FF` | Orb 1, particles |
| `--bg-primary` | `#080808` | Page background |
| `--bg-container` | `#101010` | Main card container |
| `--bg-card` | `#181818` | Section cards |
| `--text-primary` | `#ffffff` | Headings |
| `--text-secondary` | `#d2d2d2` | Body text |
| `--text-muted` | `#a8a8a8` | Labels, meta |

---

## Adding a New Skill to the Website

1. Add slug to `src/utils/techIcons.ts` under the relevant category
2. Add the skill name string to the `skills` array in `src/components/Skills.tsx`

## Adding a New Project

Edit the `projects` array in `src/components/Projects.tsx`. Each project supports:
- `title`, `description`, `year`, `status` (`'live' | 'dev' | 'not-live'`)
- `tech`: array of tech names (must exist in `techSlugs`)
- `images`: array of image paths under `public/images/`
- `links`: `{ demo?, github? }`

## Performance Notes

- Lighthouse production scores: **100 accessibility / 100 best-practices / 100 SEO**;
  LCP ≈ 0.76s, CLS 0.00 (run against `dist/`, not dev server)
- GSAP (core + ScrollTrigger) adds ~47KB gzip to the deferred page module — keep it to these two imports
- The hero description is the LCP element; keep the hero entrance timeline tight so it paints < 1s
- Background orbs use `will-change: transform` + `contain: layout style` for GPU isolation
- Particles capped at 15 DOM nodes; stopped when tab is hidden
- `@media (prefers-reduced-motion)` disables all animations (CSS override + `gsap.matchMedia`)
- Do **not** run Lighthouse against the dev server (`localhost:4321`) — Vite injects ~700KB unminified tooling JS that skews scores
