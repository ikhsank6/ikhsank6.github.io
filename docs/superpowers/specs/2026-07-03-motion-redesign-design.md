# Motion-Driven Portfolio Redesign — Design & Rationale

Date: 2026-07-03 · Supersedes the animation layer of `2026-07-03-gsap-landing-refactor-design.md`
Visual reference: metamask.io (2025) — color-blocked sections, chunky display type, pill buttons, playful 3D accents.
Inferred context: Fullstack Developer portfolio; audience = recruiters + potential clients.

## Design principles

1. **Choreography over decoration.** One signature motion idea per section instead of
   "fade-up on everything". Scroll reveals (`data-animate`) are demoted to supporting cast.
2. **The page is the loading sequence.** The preloader uses the same wordmark, palette and
   letter-flip language as the hero, so intro → hero feels like one continuous shot.
3. **Static-first, hydrate only what has state.** Astro renders everything; GSAP animates
   server-rendered DOM from one central module; React exists only where there is real
   client state (the lightbox).
4. **Performance & a11y are constraints, not afterthoughts.** Transform/opacity only,
   `gsap.matchMedia` for reduced-motion and pointer gating, preloader skipped for
   returning visitors and reduced-motion users, pinning disabled on touch.

## What gets removed (called out as generic/templated)

| Current | Why it goes | Replacement |
|---|---|---|
| Swiper autoplay carousel | Autoplay card carousel = template pattern; also 36KB gzip | Pinned horizontal scroll gallery (GSAP) + archive list — Swiper dependency deleted |
| Orbs/grid/particles fixed background | Ambient blob background reads as 2021 template | Full-bleed color-blocked sections carry the visual weight |
| "Click here to navigate" pulsing notice | Tutorial chrome = noise | Nav is self-evident; removed |
| Uniform fade-up on ~30 elements | Everything animating the same = nothing memorable | Reserved for small support elements only; headline moments get bespoke treatments |
| Skill pills fading in a grid | Static grid of chips is filler | Velocity-reactive dual marquee rows |

## Section-by-section structure & treatment

### 0. Preloader (new, in Layout)
Solid-teal overlay; stacked wordmark `IKHSAN / KURNIAWAN` in display type + 0→100 counter.
**Sequence:** (1) counter + letters flip in with the same `rotationX` language as the hero
(≈0.9s); (2) overlay splits into two full-width panels that wipe up with `power4.inOut`
stagger (≈0.8s); (3) hero timeline fires as panels clear — total ≈1.8s.
**Guards:** skipped entirely (display:none before paint) when `prefers-reduced-motion` or
`sessionStorage.introSeen`; scroll locked during play; `aria-hidden`; the wordmark itself
becomes the LCP candidate so LCP is paint-fast, not delayed behind the wipe.

### 1. Hero (teal `#013330`)
Centered stacked name in Climate Crisis (ice `#CEE9FD`), eyebrow, description, pill CTAs,
stats chips. Letter flip-in entrance (kept), magnetic CTAs (kept), 3D cube accent (kept).
**New scroll treatment:** scrub-tied departure — name drifts up at 0.85× scroll speed with
slight letter-spacing expansion, cube rotates with scroll progress. Rationale: parallax on
exit makes the first scroll gesture feel hand-tuned without pinning the very first screen.

### 2. About (new thin block, white)
Two-line editorial statement, word-by-word reveal (server-side word spans, no SplitText
needed for known strings), scrubbed `opacity 0.2→1` per word. Rationale: a single
typographic moment reads "intentional", and white block widens the palette rhythm
(teal → white → lime → indigo → peach → black).

### 3. Skills (lime `#E5FFC3`)
Two full-bleed marquee rows of skill pills moving in opposite directions; scroll velocity
skews and accelerates the rows (classic `ScrollTrigger.getVelocity` skew). Static Astro —
React island removed. Reduced-motion/mobile-fallback: rows wrap into a static grid.
Rationale: marquee turns a dead list into kinetic texture and is pure-transform cheap.

### 4. Featured Projects (indigo `#190066`) — **hybrid of options 1 + 3**
- **Six featured projects** in a **pinned horizontal gallery**: section pins for
  `panels × 100vh`; track scrubs x; each panel ≈85vw with oversized index numeral
  (display type, ice at 8% opacity behind content), screenshot revealed by
  `clip-path: inset()` wipe driven by `containerAnimation` triggers, chunky title,
  meta pills (year/status/tech), white pill link.
  Rationale: 13 equal cards flatten hierarchy; six full-viewport panels give each flagship
  project a "slide" of its own, and horizontal motion inside vertical scroll is the wow
  moment the brief asks for. `containerAnimation` is the canonical way to trigger
  animations inside a horizontally-scrubbed container.
- **Archive list** (remaining seven): minimal numbered text rows; on pointer-fine devices,
  hovering floats a cursor-following thumbnail revealed via `clip-path` (option 3);
  rows themselves invert (black text → white on indigo hover bar).
- **Hover/tactile:** custom cursor swells into a "VIEW" pill over panel media
  (pointer-fine only); media scales 1.04 with grayscale→color on hover.
- **Click → lightbox:** FLIP shared-element expand — the clicked screenshot's rect is
  measured, a clone tweens `x/y/scale` into the lightbox position while the overlay fades,
  then the existing React lightbox (zoom/pan/gallery) takes over. GSAP `Flip` plugin.
- **Mobile/touch fallback:** no pinning (gated via `gsap.matchMedia('(pointer:fine)')` +
  min-width); track becomes native `overflow-x` scroll with `scroll-snap-type: x
  mandatory`, panels 88vw — momentum swiping, equally intentional, zero scroll-hijack.
  Archive preview degrades to plain rows (thumb inline).

### 5. Experience & Education (pale blue `#CCE7FF`)
Existing two-column timeline, restyled for the light block; timeline spine draws itself
(`scaleY` scrub 0→1) as the section scrolls; items keep batch reveals. Certificate button
opens existing lightbox. Rationale: content is tabular — it needs clarity, not spectacle;
the drawn line adds craft without noise.

### 6. Contact CTA (peach `#FFA680`, new)
Full-bleed block: `LET'S BUILD / SOMETHING REAL` in display type (black), char-stagger
reveal on enter, one magnetic mail pill + contact-modal trigger. Rationale: the reference
site ends every page on a loud color block with one action; recruiters need exactly one
obvious next step.

### 7. Footer (black)
Giant wordmark marquee (display type, single slow loop), small meta row. Existing modal +
focus traps unchanged.

## GSAP plugin & technique map

| Section | Technique | Why |
|---|---|---|
| Preloader | Timeline + counter tween, panel wipe | No plugin needed; sequencing is the craft |
| Hero exit | ScrollTrigger scrub on transform | GPU-only props |
| About | Word spans + scrub stagger | SplitText unnecessary for known copy (saves bytes) |
| Skills | Infinite `xPercent` loop + `getVelocity()` skew | Marquee texture, transform-only |
| Gallery | ScrollTrigger `pin` + scrub, `containerAnimation` child triggers, `invalidateOnRefresh` | Canonical horizontal-scroll pattern; recalcs on resize |
| Lightbox open | `Flip` plugin | Purpose-built shared-element transitions |
| Cursor/preview | `gsap.quickTo` followers | Cheapest possible pointer-follow |
| Everything | `gsap.matchMedia` + `context.revert()` cleanup | Reduced-motion + pointer gating, leak-free teardown |

Not used deliberately: **ScrollSmoother** (scroll-hijack feel, a11y risk, extra weight),
**SplitText** (copy is known at build time — server-rendered spans are free and SEO-safe).

## Islands & lifecycle

| Component | Type | Directive | Why |
|---|---|---|---|
| Preloader, Hero, About, Skills, Gallery, Archive, Experience, CTA, Footer, Navbar | Astro (static) | — | No client state; GSAP animates SSR DOM |
| `ProjectLightbox` | React island | `client:idle` | Real state machine (zoom/pan/index/focus trap); idle = not needed for first paint |

Gallery → lightbox communication: `window.dispatchEvent(new CustomEvent('project:open', {detail}))` —
keeps the static gallery decoupled from the island; the island subscribes on mount.
All GSAP work stays in `src/scripts/animations.ts` inside one `gsap.matchMedia()`;
conditions re-run → GSAP auto-reverts tweens/ScrollTriggers; manual listeners returned as
cleanup closures. React island contains **no GSAP** (Flip runs from the central module,
targeting the island's rendered DOM after the custom event).

## Performance budget & guards

- JS: GSAP core+ScrollTrigger+Flip ≈ 55KB gzip total; Swiper (−36KB) and Skills React
  island removed → net ≈ +12KB vs current.
- Only `transform`/`opacity`/`clip-path` animated; `will-change` left to GSAP.
- Pinning uses default `pinSpacing` (layout reserved, zero CLS); `anticipatePin: 1`.
- Preloader capped ≤2s, first visit per session only; LCP = preloader wordmark.
- Targets: Lighthouse a11y/BP/SEO = 100, CLS = 0, LCP < 1.0s desktop preview.
