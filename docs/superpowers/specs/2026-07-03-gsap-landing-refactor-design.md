# GSAP Landing Page Refactor — Design

Date: 2026-07-03
Status: Approved (autonomous session — decisions documented in lieu of live dialogue)

## Goal

Upgrade the portfolio landing page (ikhsank6.github.io) with a premium GSAP animation
system and tasteful 3D depth, while keeping the existing Astro 5 + React 19 islands
architecture and preserving the current Lighthouse 100/100/100/100 production scores.
Harden accessibility to WCAG 2.1 AA.

## Approaches considered

1. **GSAP layer + CSS 3D on existing architecture (chosen).**
   GSAP core + ScrollTrigger (~40KB gzip total) drive entrance timelines, scroll
   reveals, parallax, and pointer-driven 3D tilt using CSS `perspective`/`rotateX/Y`.
   Zero-cost "3D" — no WebGL. Keeps the design language already in place.
2. **Three.js / WebGL hero scene.** Rejected: +150KB gzip minimum, GPU cost on
   low-end mobile, would sacrifice the perfect performance scores for decoration.
3. **Full visual redesign.** Rejected: the current premium-dark/lime design is
   strong and recently reworked; the gap is motion quality and a11y, not layout.

## Architecture

```
src/
  scripts/
    animations.ts      # single GSAP entry: initAnimations() — all motion lives here
    focus-trap.ts      # tiny focus-trap helper shared by all modals
  components/          # existing components get data-animate hooks + a11y fixes
```

- **One GSAP module** (`animations.ts`) imported from `index.astro`'s script.
  All animation concerns (hero timeline, scroll reveals, parallax, tilt, magnetic
  buttons) are registered inside `gsap.matchMedia()` contexts:
  - `(prefers-reduced-motion: reduce)` → no motion; elements set to final state.
  - `(hover: hover) and (pointer: fine)` → pointer effects (tilt, magnetic, mouse parallax).
- **FOUC guard:** inline `<script>` in `<head>` adds `js` class to `<html>`.
  Initial hidden states are CSS-scoped under `.js` so no-JS visitors (and bots)
  see full content.
- **Scroll reveals:** replace the hand-rolled IntersectionObserver with
  `ScrollTrigger.batch()` on `[data-animate]`, staggered `y/opacity/blur` reveals.
  The legacy `.animate-on-scroll` CSS transition system is removed.
- **Hero entrance timeline:** eyebrow fade, name letters flip in with
  `rotationX` + `transformPerspective` (server-rendered letter `<span>`s,
  `aria-hidden`, real name kept in `aria-label` on the `h1`), stats count-up,
  divider `scaleX`, description + CTAs rise.
- **3D depth:**
  - Project slides + stat block: pointer tilt (`rotateX/rotateY` via `gsap.quickTo`).
  - Background orbs: mouse parallax at different depths + scroll parallax.
  - Decorative CSS 3D floating cube in the hero (pure CSS transforms animated by
    GSAP, `aria-hidden`, hidden for reduced-motion).
- **Magnetic CTA buttons** in hero (pointer-fine only).

## Accessibility work

- Skip-to-content link; `<main id="main">`.
- Contact modal, certificate lightbox, project lightbox: `role="dialog"`,
  `aria-modal`, labelled title, focus trap, focus restore, Escape (already present).
- `rel="noopener noreferrer"` on all `target="_blank"` links.
- `aria-label` on icon-only buttons (zoom controls, nav circles).
- Swiper: enable `A11y` module; autoplay disabled under reduced motion.
- `viewport` meta gains `initial-scale=1`.

## Performance guardrails

- GSAP imported in the page module bundle (not CDN) so Vite tree-shakes and
  minifies; only `gsap` + `ScrollTrigger` are imported.
- Keep `content-visibility: auto` on below-fold sections; call
  `ScrollTrigger.refresh()` after load.
- Animate only `transform`/`opacity` (compositor-friendly); `will-change`
  applied by GSAP transiently.
- Images stay lazy; no new network dependencies.
- Verification: `astro build` + preview + Lighthouse (perf & a11y ≥ 95 target,
  aiming to keep 100s).

## Out of scope

- Content changes (projects, experience data).
- Multi-page routing, CMS, contact form backend.
- WebGL/Three.js.
